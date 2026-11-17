#!/usr/bin/env node
// Compare freshly-captured screenshots against the committed ones and write a report.
//
// GENERIC: shipped by the autodocu skill template and copied on `init`; identical for
// every app. run_test.sh calls it after a Playwright run. Plain Node ESM — no build
// step and no dependencies beyond Node's stdlib (fs + zlib), so it stays in the same
// toolchain as the .ts specs (no Python / second runtime to install).
//
// What it does:
//   * New screenshots were written to a TEMP root (AUTODOCU_SHOT_ROOT) instead of
//     Documentation/, so the committed images are untouched until we decide.
//   * For every screenshot it computes the % of changed pixels vs the committed one.
//       - diff  > THRESHOLD %  -> a real, visible CHANGE, FAIL. By default the committed
//         image is KEPT (not overwritten) and the before/after pair is saved for review;
//         with ACCEPT=1 the committed image is REPLACED with the new one (marked PASS).
//       - diff <= THRESHOLD %  -> committed image KEPT, PASS (sub-threshold render noise).
//       - no committed baseline -> new image adopted as baseline, PASS (new).
//       - baseline exists but no new image (test crashed before capturing) -> FAIL.
//   * Writes test_report.md (in the Tests folder): one bold row per section (its
//     Playwright pass/fail) followed by one row per screenshot (its diff pass/fail),
//     and a final **Total** row counting PASS/total. When screenshots changed and were
//     NOT accepted, it appends a "Visual changes to review" section: per section, per
//     screenshot, the BEFORE and AFTER images shown side by side. The images backing that
//     section are copied next to the report into a test_report/ folder (stable snapshots,
//     since the fresh captures live in a temp dir that is deleted after the run).
//
// PNG decoding is manual (zlib.inflate + filter reversal): handles 8-bit, non-interlaced
// PNGs (colour types 0/2/4/6) — what Chromium/Playwright emit.
//
// Usage:
//   node compare_report.mjs TEMP_ROOT DOC_ROOT TESTS_DIR JSON_FILE THRESHOLD_PCT REPORT_FILE [ACCEPT]
// ACCEPT: "1" to adopt changed screenshots as the new baseline; omitted/"0" to review only.
// Exit code: 0 if every row PASSed, 1 otherwise.

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, copyFileSync, readdirSync, statSync } from 'fs';
import zlib from 'zlib';
import path from 'path';

// --------------------------------------------------------------------------- PNG

function loadPng(file) {
  const data = readFileSync(file);
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (!data.subarray(0, 8).equals(sig)) throw new Error('not a PNG');
  let pos = 8;
  let width, height, bitDepth, colorType, interlace;
  const idat = [];
  while (pos + 8 <= data.length) {
    const length = data.readUInt32BE(pos);
    const ctype = data.toString('latin1', pos + 4, pos + 8);
    const chunk = data.subarray(pos + 8, pos + 8 + length);
    pos += 12 + length; // 4 len + 4 type + data + 4 crc
    if (ctype === 'IHDR') {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      bitDepth = chunk[8];
      colorType = chunk[9];
      interlace = chunk[12];
    } else if (ctype === 'IDAT') {
      idat.push(chunk);
    } else if (ctype === 'IEND') {
      break;
    }
  }
  if (bitDepth !== 8 || interlace !== 0) {
    throw new Error(`unsupported PNG (bitDepth=${bitDepth} interlace=${interlace})`);
  }
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colorType];
  if (!channels) throw new Error('unsupported colour type ' + colorType);
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = channels;
  const stride = width * bpp;
  const out = Buffer.alloc(height * stride);
  let prev = Buffer.alloc(stride);
  let i = 0;
  for (let y = 0; y < height; y++) {
    const ft = raw[i++];
    const line = Buffer.from(raw.subarray(i, i + stride));
    i += stride;
    if (ft === 0) {
      // None
    } else if (ft === 1) { // Sub
      for (let x = bpp; x < stride; x++) line[x] = (line[x] + line[x - bpp]) & 0xff;
    } else if (ft === 2) { // Up
      for (let x = 0; x < stride; x++) line[x] = (line[x] + prev[x]) & 0xff;
    } else if (ft === 3) { // Average
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? line[x - bpp] : 0;
        line[x] = (line[x] + ((a + prev[x]) >> 1)) & 0xff;
      }
    } else if (ft === 4) { // Paeth
      for (let x = 0; x < stride; x++) {
        const a = x >= bpp ? line[x - bpp] : 0;
        const b = prev[x];
        const c = x >= bpp ? prev[x - bpp] : 0;
        const p = a + b - c;
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
        const pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        line[x] = (line[x] + pr) & 0xff;
      }
    } else {
      throw new Error('bad filter type ' + ft);
    }
    line.copy(out, y * stride);
    prev = line;
  }
  return { width, height, bpp, data: out };
}

// A pixel only counts as "changed" if some channel differs by MORE than this.
// Renders of the same page wobble by +/-1..a few over large anti-aliased regions
// (gradients, filled charts) between runs; that is invisible and must NOT count,
// or a big chart would flag ~9% "changed" while looking identical. A genuine change
// (text, a moved element, a highlight box) differs by up to 255 and sails past this.
const PIXEL_DELTA_TOLERANCE = 16; // out of 255

function changedPixelPct(pathA, pathB) {
  const a = loadPng(pathA);
  const b = loadPng(pathB);
  if (a.width !== b.width || a.height !== b.height) return 100;
  const total = a.width * a.height;
  if (total === 0) return 0;
  let changed = 0;
  const n = Math.min(a.bpp, b.bpp);
  for (let i = 0; i < total; i++) {
    const oa = i * a.bpp, ob = i * b.bpp;
    let maxDelta = 0;
    for (let k = 0; k < n; k++) {
      const d = Math.abs(a.data[oa + k] - b.data[ob + k]);
      if (d > maxDelta) maxDelta = d;
    }
    if (maxDelta > PIXEL_DELTA_TOLERANCE) changed++;
  }
  return (100 * changed) / total;
}

// ----------------------------------------------------------------------- helpers

function naturalKey(name) {
  const m = name.match(/^(\d+)/);
  return m ? parseInt(m[1], 10) : 1e9;
}
function cmpNatural(x, y) {
  const kx = naturalKey(x), ky = naturalKey(y);
  return kx !== ky ? kx - ky : (x < y ? -1 : x > y ? 1 : 0);
}

function listSections(...roots) {
  const secs = new Set();
  for (const root of roots) {
    if (root && existsSync(root) && statSync(root).isDirectory()) {
      for (const d of readdirSync(root)) {
        const full = path.join(root, d);
        if (d !== 'playwright' && existsSync(full) && statSync(full).isDirectory()) secs.add(d);
      }
    }
  }
  return [...secs].sort(cmpNatural);
}

function shotsIn(sectionDir) {
  const sd = path.join(sectionDir, 'screenshots');
  if (!existsSync(sd) || !statSync(sd).isDirectory()) return [];
  return readdirSync(sd).filter((f) => f.toLowerCase().endsWith('.png')).sort(cmpNatural);
}

function collectPlaywright(jsonFile, sections) {
  const passed = new Map();
  let report;
  try {
    report = JSON.parse(readFileSync(jsonFile, 'utf8'));
  } catch {
    return passed;
  }
  const specs = []; // { file, ok }
  const walk = (suite) => {
    const sfile = suite.file;
    for (const spec of suite.specs || []) specs.push({ file: spec.file || sfile, ok: !!spec.ok });
    for (const sub of suite.suites || []) walk(sub);
  };
  for (const top of report.suites || []) walk(top);

  for (const { file, ok } of specs) {
    const f = (file || '').replace(/\\/g, '/');
    for (const sec of sections) {
      if (f === sec || f.startsWith(sec + '/') || ('/' + f).includes('/' + sec + '/')) {
        passed.set(sec, (passed.has(sec) ? passed.get(sec) : true) && ok);
        break;
      }
    }
  }
  return passed;
}

// ---------------------------------------------------------------------------- main

function main() {
  const argv = process.argv.slice(2);
  if (argv.length !== 6 && argv.length !== 7) {
    process.stderr.write('usage: node compare_report.mjs TEMP_ROOT DOC_ROOT TESTS_DIR JSON_FILE THRESHOLD_PCT REPORT_FILE [ACCEPT]\n');
    return 2;
  }
  const [tempRoot, docRoot, , jsonFile, thresholdS, reportFile, acceptS] = argv; // TESTS_DIR unused
  const threshold = parseFloat(thresholdS);
  const accept = acceptS === '1' || acceptS === 'true';

  // Where the before/after images for the "Visual changes" section are copied so the
  // report can embed them (the fresh captures live in a temp dir that is deleted after
  // the run). Cleared each run so stale pairs from a previous run never linger.
  const reportDir = path.join(path.dirname(reportFile), 'test_report');
  const reportRel = path.basename(reportDir); // relative link prefix used in the md
  rmSync(reportDir, { recursive: true, force: true });

  const sections = listSections(docRoot, tempRoot);
  const pwPass = collectPlaywright(jsonFile, sections);

  const rows = [];    // { name, isSection, result }
  const detail = [];  // human lines for stdout
  const changes = []; // { sec, label, pct, before, after } — populated only in review mode

  for (const sec of sections) {
    const pwOk = pwPass.get(sec);
    rows.push({ name: sec, isSection: true, result: pwOk ? 'PASS' : 'FAIL' });
    detail.push(`  ${(pwOk ? 'PASS' : 'FAIL').padEnd(4)} ${sec} (playwright)`);

    const baseDir = path.join(docRoot, sec);
    const newDir = path.join(tempRoot, sec);
    const names = [...new Set([...shotsIn(baseDir), ...shotsIn(newDir)])].sort(cmpNatural);
    for (const name of names) {
      const basePng = path.join(baseDir, 'screenshots', name);
      const newPng = path.join(newDir, 'screenshots', name);
      const hasBase = existsSync(basePng);
      const hasNew = existsSync(newPng);
      const label = name.toLowerCase().endsWith('.png') ? name.slice(0, -4) : name;

      if (hasNew && !hasBase) { // brand-new baseline
        mkdirSync(path.dirname(basePng), { recursive: true });
        copyFileSync(newPng, basePng);
        rows.push({ name: label, isSection: false, result: 'PASS' });
        detail.push(`       PASS ${sec}/${label} (new baseline)`);
      } else if (hasBase && !hasNew) { // not regenerated -> regression
        rows.push({ name: label, isSection: false, result: 'FAIL' });
        detail.push(`       FAIL ${sec}/${label} (no screenshot produced)`);
      } else { // compare
        let pct, note = '';
        try {
          pct = changedPixelPct(basePng, newPng);
        } catch (e) {
          pct = 100; note = ` (${e.message})`;
        }
        if (pct > threshold) {
          if (accept) { // adopt the fresh capture as the new baseline
            copyFileSync(newPng, basePng);
            rows.push({ name: label, isSection: false, result: 'PASS' });
            detail.push(`       PASS ${sec}/${label}  ${pct.toFixed(2)}% > ${threshold}% -> accepted (baseline replaced)${note}`);
          } else { // keep the baseline; stash before/after for a visual review
            mkdirSync(reportDir, { recursive: true });
            const stem = `${sec}__${label}`.replace(/[\\/]+/g, '_');
            const before = `${stem}__before.png`;
            const after = `${stem}__after.png`;
            copyFileSync(basePng, path.join(reportDir, before));
            copyFileSync(newPng, path.join(reportDir, after));
            changes.push({ sec, label, pct, before, after });
            rows.push({ name: label, isSection: false, result: 'FAIL' });
            detail.push(`       FAIL ${sec}/${label}  ${pct.toFixed(2)}% > ${threshold}% -> changed (review; run --accept-changes to adopt)${note}`);
          }
        } else {
          rows.push({ name: label, isSection: false, result: 'PASS' });
          detail.push(`       PASS ${sec}/${label}  ${pct.toFixed(2)}% <= ${threshold}% -> kept`);
        }
      }
    }
  }

  const total = rows.length;
  const passed = rows.filter((r) => r.result === 'PASS').length;

  const lines = [
    '# AUTODOCU test report',
    '',
    'Sections show the Playwright test result; the screenshot rows below each',
    `show whether the newly captured image stayed within ${threshold}% of the committed one`,
    '(over threshold = the image changed = FAIL). By default a changed image is **kept**',
    'and its before/after is saved below for review; `./run_test.sh --accept-changes`',
    'adopts the new captures as the baseline for future runs.',
    '',
    '| Test name | Result |',
    '|-----------|--------|',
  ];
  for (const r of rows) {
    lines.push(`| ${r.isSection ? `**${r.name}**` : r.name} | ${r.result} |`);
  }
  lines.push(`| **Total** | ${passed}/${total} |`);
  lines.push('');

  if (changes.length) {
    lines.push('## Visual changes to review');
    lines.push('');
    lines.push(`These screenshots changed by more than ${threshold}%. Compare BEFORE (the`);
    lines.push('committed baseline) with AFTER (the fresh capture). To adopt the new images');
    lines.push('as the baseline for future runs, re-run `./run_test.sh --accept-changes`.');
    lines.push('');
    let currentSec = null;
    for (const c of changes) {
      if (c.sec !== currentSec) {
        lines.push(`### ${c.sec}`);
        lines.push('');
        currentSec = c.sec;
      }
      lines.push(`#### ${c.label} — ${c.pct.toFixed(2)}% changed`);
      lines.push('');
      lines.push('| BEFORE (committed) | AFTER (new) |');
      lines.push('|:---:|:---:|');
      lines.push(`| ![${c.label} before](${reportRel}/${c.before}) | ![${c.label} after](${reportRel}/${c.after}) |`);
      lines.push('');
    }
  }

  writeFileSync(reportFile, lines.join('\n'));

  process.stdout.write(detail.join('\n') + '\n');
  process.stdout.write(`Total: ${passed}/${total} passed  ->  ${reportFile}\n`);
  return passed === total ? 0 : 1;
}

process.exit(main());

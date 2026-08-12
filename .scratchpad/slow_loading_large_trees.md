# Slow loading of large trees — AUTODOCU test failures (sections 3 & 4)

Status: **deferred for later investigation.** This file records what we know so far.
Date: 2026-08-12.

## Symptom

Running the full AUTODOCU screenshot suite (`AUTODOCU/Tests/run_test.sh`), the two
heaviest sections fail at their **very first navigation**, before any screenshot is
taken:

- **3. Exploring a large tree (ATC tree example)** — concept `C10AA`
  (`exploring_a_large_tree_atc_tree_example.spec.ts:30`). Hits the 360 s test
  timeout waiting for `#view-toggle` to become visible.
- **4. Working with Concept Sets** — concept `317009` (Asthma)
  (`working_with_concept_sets.spec.ts:45`). `page.goto('/317009', { waitUntil:
  'networkidle', timeout: 120000 })` times out at 120 s.

Sections **1 and 2 pass** (1: 17/17 screenshots, 2: 4/4, all 0.00% diff).

## What is NOT the cause (ruled out)

- **Not the API port / nginx.** The image exposes only 8563; nginx proxies
  `/api/ -> http://localhost:8564/` (`nginx.conf`), and the frontend is built with
  `REACT_APP_API_BASE_URL=/api/` (`Dockerfile:81`). Verified: with only 8563
  published, `curl http://127.0.0.1:8563/api/getListOfConcepts` returns the full
  349 KB JSON. Single-port design is correct.
- **Not worker contention (this WAS a real bug, now fixed).** `playwright.config.ts`
  had `fullyParallel: false` but no `workers` cap, so Playwright ran **4 workers** —
  four browsers hammering the single-threaded R API (plumber) at once. That made
  ALL four sections fail. Fixed by adding `workers: 1` (+ template copy). After the
  fix, sections 1 & 2 pass; 3 & 4 still fail, so their failure is a separate issue.
- **Not continuous network activity.** The frontend has no polling / websockets /
  EventSource / SSE (all `setInterval` in `src/po.js`, `src/po_old.js` are commented
  out; only a `requestAnimationFrame` D3 layout loop in
  `src/components/visualization/graphSection.jsx:375`, which is not network). So
  `networkidle` WILL eventually settle once data finishes loading — the sections are
  simply slower than their timeouts.
- **Not a data/warmup race.** `scripts/startup.sh` gates nginx start on the R API
  `/__docs__/` responding, and the concept cache ("Populating cache with concepts
  with code counts") is populated before plumber serves. Data is ready when 8563
  answers.

## Leading hypothesis

Cold **direct** navigation to a data-heavy concept is too slow under **QEMU
emulation** (the image is `--platform=linux/amd64`, `Dockerfile:1`; host is Apple
Silicon arm64 — the `docker run` prints the platform-mismatch warning).

- Section 1 (passes) loads the light `/` root first, THEN routes to the concept via
  search — heavy fetches happen on an already-booted SPA.
- Sections 3 & 4 (fail) do `page.goto('/<conceptId>', { waitUntil: 'networkidle' })`
  cold — React bundle download+parse + `getListOfConcepts` (349 KB) + concept
  descendants/counts + (section 3) a hundreds-of-node tree render, all at once.
  Under emulation this exceeds the goto/test timeouts.

Timing measurements (goto domcontentloaded vs. #element visible vs. networkidle,
for `/317009` and `/C10AA`) were NOT yet taken — that's the first step when we pick
this up.

## Why baselines exist if the specs time out here

The committed baseline screenshots for these sections were generated in some
environment where the load finished in time (likely native x86, or a less-loaded
machine). The specs are capable of passing; the wall-clock budget on THIS emulated
Mac is the problem.

## Options considered (for when we resume)

1. **Robust nav + higher timeouts (leading candidate):** change specs 3 & 4 to
   `goto(url, { waitUntil: 'domcontentloaded' })` then `waitFor` the concrete
   elements (as section 1 effectively does), and raise element/test timeouts. Also
   update the `build` template so future generated specs emit this pattern.
2. **Just raise timeouts:** keep `networkidle`, bump goto/test timeouts. Smallest
   change; `networkidle` stays fragile.
3. **Accept as env limit:** run these sections where the amd64 image is native
   (no emulation) rather than on this Mac.

## Relevant files

- `AUTODOCU/Tests/run_test.sh` — generic runner.
- `AUTODOCU/Tests/Scripts/app_control.sh` — `start_app`/`stop_app` (generated from
  Outline `# Run`).
- `AUTODOCU/Tests/Scripts/playwright/playwright.config.ts` — has `workers: 1` now.
- `AUTODOCU/Tests/3.Exploring_a_large_tree_ATC_tree_exaple/...spec.ts:30`
- `AUTODOCU/Tests/4.Working_with_Concept_Sets/...spec.ts:45`
- `nginx.conf`, `Dockerfile`, `scripts/startup.sh` — app/serving config.
- Template copies under `.claude/skills/autodocu/references/template/Tests/...`.

## Note on emulation speed (optional quick win to try first)

Consider building/pulling a native arm64 image, or giving Docker Desktop more
CPU/RAM, before changing specs — emulation may be the whole story.

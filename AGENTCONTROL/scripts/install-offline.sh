#!/usr/bin/env bash
# Offline install of playwright-cli, for environments without internet (e.g. the FinnGen TRE).
# Standalone: copy this one file anywhere; it needs nothing else from the repo.
#
# Outside, on a machine with internet and npm:
#   bash install-offline.sh pack [out_dir]
#     -> writes <out_dir>/playwright-cli-<version>.tgz (default out_dir: ./out next to this script; ~4 MB, works on any OS)
#   Send that file into the TRE with the send-copy system.
#
# Inside the TRE (needs Node.js >= 20 and Chrome):
#   bash install-offline.sh install <playwright-cli-<version>.tgz>
#     -> unpacks playwright-cli into $INSTALL_DIR, links the command into $BIN_DIR and checks for Chrome.
#
# Environment: INSTALL_DIR (default ~/.local/share/playwright-cli), BIN_DIR (default ~/.local/bin),
#              PLAYWRIGHT_CLI_VERSION (pack only, default below).
# No browser is downloaded: playwright-cli uses the installed Chrome (`--browser=chrome`).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# keep in sync with install.sh
PLAYWRIGHT_CLI_VERSION="${PLAYWRIGHT_CLI_VERSION:-0.1.24}"

usage() {
    sed -n '2,16p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
    exit 1
}

pack() {
    local out_dir="${1:-$SCRIPT_DIR/out}"
    command -v npm > /dev/null || { echo "ERROR: npm not found." >&2; exit 1; }
    mkdir -p "$out_dir"
    out_dir="$(cd "$out_dir" && pwd)"
    local work name="playwright-cli-$PLAYWRIGHT_CLI_VERSION"
    work="$(mktemp -d)"
    trap "rm -rf '$work'" EXIT
    echo "Downloading @playwright/cli@$PLAYWRIGHT_CLI_VERSION and its dependencies..."
    npm install --prefix "$work/$name" "@playwright/cli@$PLAYWRIGHT_CLI_VERSION" --no-audit --no-fund > /dev/null
    if find "$work/$name" -name '*.node' | grep -q .; then
        echo "WARNING: native modules found; the bundle may only work on this OS/architecture." >&2
    fi
    # on macOS, don't add ._* metadata files or extended attributes to the archive (GNU tar warns about them)
    local tar_opts=()
    tar --version 2>/dev/null | grep -q bsdtar && tar_opts=(--no-xattrs --no-mac-metadata)
    COPYFILE_DISABLE=1 tar "${tar_opts[@]}" -czf "$out_dir/$name.tgz" -C "$work" "$name"
    echo "Created $out_dir/$name.tgz ($(du -h "$out_dir/$name.tgz" | cut -f1))."
    echo "Send it into the TRE and run there: bash install-offline.sh install $name.tgz"
}

find_chrome() {
    local candidate
    for candidate in google-chrome google-chrome-stable chrome chromium chromium-browser \
        /opt/google/chrome/chrome "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; do
        if command -v "$candidate" > /dev/null 2>&1; then command -v "$candidate"; return 0; fi
        if [ -x "$candidate" ]; then echo "$candidate"; return 0; fi
    done
    return 1
}

install_bundle() {
    local tgz="${1:-}"
    [ -f "$tgz" ] || { echo "ERROR: bundle not found: ${tgz:-<missing argument>}" >&2; usage; }
    local install_dir="${INSTALL_DIR:-$HOME/.local/share/playwright-cli}"
    local bin_dir="${BIN_DIR:-$HOME/.local/bin}"

    # 1. Node.js
    command -v node > /dev/null || { echo "ERROR: node not found; Node.js >= 20 is required." >&2; exit 1; }
    local node_major
    node_major="$(node -p 'process.versions.node.split(".")[0]')"
    if [ "$node_major" -lt 20 ]; then
        echo "ERROR: Node.js $(node --version) found; >= 20 is required." >&2
        exit 1
    fi

    # 2. unpack and link the command
    local name
    # top-level folder; skip ._* macOS metadata entries (bundles packed on a Mac before this fix)
    name="$(tar tzf "$tgz" | awk -F/ '$1 !~ /^\._/ && !found++ { print $1 }')"
    mkdir -p "$install_dir" "$bin_dir"
    rm -rf "${install_dir:?}/$name" "${install_dir:?}/._$name"
    tar xzf "$tgz" -C "$install_dir"
    find "$install_dir/$name" -name '._*' -delete
    rm -f "$install_dir/._$name"
    ln -sfn "$install_dir/$name/node_modules/@playwright/cli/playwright-cli.js" "$bin_dir/playwright-cli"
    echo "Installed playwright-cli $("$bin_dir/playwright-cli" --version 2>/dev/null | tail -1) -> $bin_dir/playwright-cli"

    # 3. browser: use the installed Chrome
    local chrome
    if chrome="$(find_chrome)"; then
        echo "Found Chrome: $chrome"
        case "$chrome" in
            /opt/google/chrome/chrome|"/Applications/Google Chrome.app/"*) ;;  # standard location: --browser=chrome finds it
            *) echo "Chrome is not in the standard location; add to ~/.bashrc:"
               echo "  export PLAYWRIGHT_MCP_EXECUTABLE_PATH=\"$chrome\"" ;;
        esac
    else
        echo "WARNING: Chrome not found. Install it, or set PLAYWRIGHT_MCP_EXECUTABLE_PATH to a Chrome/Chromium binary." >&2
    fi

    case ":$PATH:" in
        *":$bin_dir:"*) ;;
        *) echo "Add $bin_dir to your PATH, e.g. in ~/.bashrc:"
           echo "  export PATH=\"$bin_dir:\$PATH\"" ;;
    esac
    echo "Done. Test with: playwright-cli -s=test open about:blank --headed --browser=chrome && playwright-cli -s=test close"
}

case "${1:-}" in
    pack) shift; pack "$@" ;;
    install) shift; install_bundle "$@" ;;
    *) usage ;;
esac

#!/usr/bin/env bash
# Install the agent-control tooling for EHR Browser:
#   1. playwright-cli (pinned version), the browser CLI the agent uses
#   2. refresh the committed snapshot of its official skill from the installed CLI
#   3. link both skills (playwright-cli, ehr-browser) into the harness skills folder
#
# Usage: AGENTCONTROL/scripts/install.sh [skills_dir]
#   skills_dir defaults to <repo>/.claude/skills (Claude Code). Use e.g. <repo>/.agents/skills for other harnesses.
set -euo pipefail

PLAYWRIGHT_CLI_VERSION="0.1.24"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENTCONTROL_DIR="$(dirname "$SCRIPT_DIR")"
REPO_DIR="$(dirname "$AGENTCONTROL_DIR")"
SKILLS_SRC="$AGENTCONTROL_DIR/skills"
SKILLS_DIR="${1:-$REPO_DIR/.claude/skills}"

# 1. playwright-cli
if ! command -v npm > /dev/null; then
    echo "ERROR: npm not found. Install Node.js (>= 18) first." >&2
    exit 1
fi
installed_version="$(npm ls -g --depth=0 @playwright/cli 2> /dev/null | sed -n 's/.*@playwright\/cli@\([0-9.]*\).*/\1/p')"
if [ "$installed_version" != "$PLAYWRIGHT_CLI_VERSION" ]; then
    echo "Installing @playwright/cli@$PLAYWRIGHT_CLI_VERSION (found: ${installed_version:-none})..."
    npm install -g "@playwright/cli@$PLAYWRIGHT_CLI_VERSION"
else
    echo "@playwright/cli@$PLAYWRIGHT_CLI_VERSION already installed."
fi

# 2. snapshot of the official playwright-cli skill, matching the installed CLI version
bundled_skill="$(npm root -g)/@playwright/cli/skills/playwright-cli"
if [ -f "$bundled_skill/SKILL.md" ]; then
    rm -rf "$SKILLS_SRC/playwright-cli"
    cp -R "$bundled_skill" "$SKILLS_SRC/playwright-cli"
    echo "$PLAYWRIGHT_CLI_VERSION" > "$SKILLS_SRC/playwright-cli/VERSION"
    echo "Refreshed skill snapshot: skills/playwright-cli (v$PLAYWRIGHT_CLI_VERSION)."
else
    echo "WARNING: bundled skill not found at $bundled_skill; keeping the committed snapshot." >&2
fi

# 3. link skills into the harness skills folder
mkdir -p "$SKILLS_DIR"
for skill in playwright-cli ehr-browser; do
    target="$SKILLS_DIR/$skill"
    if [ -e "$target" ] && [ ! -L "$target" ]; then
        echo "WARNING: $target exists and is not a symlink; leaving it untouched." >&2
        continue
    fi
    ln -sfn "$SKILLS_SRC/$skill" "$target"
    echo "Linked $target -> $SKILLS_SRC/$skill"
done

echo "Done. Start a new harness session so it picks up the skills."

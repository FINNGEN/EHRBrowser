# Install

- `install.sh`: installs `playwright-cli` with npm and links the skills into `.claude/skills/`.
- `install-offline.sh`: installs **only** `playwright-cli`, without internet. It's a standalone file; copy it anywhere.

## With internet

```bash
AGENTCONTROL/scripts/install.sh
```

## Without internet (TRE)

You need Node.js 20 or newer, and Chrome, in the TRE.

1. Outside, with internet, build the bundle:
   ```bash
   bash AGENTCONTROL/scripts/install-offline.sh pack
   ```
   This writes `AGENTCONTROL/scripts/out/playwright-cli-<version>.tgz` (~4 MB). The `out/` folder is ignored by git.
2. Send `install-offline.sh` and the `.tgz` into the TRE with send-copy.
3. Inside the TRE, install it:
   ```bash
   bash install-offline.sh install playwright-cli-<version>.tgz
   ```
   If it prints a `PATH` or `PLAYWRIGHT_MCP_EXECUTABLE_PATH` line, add that line to `~/.bashrc`.
4. Test it:
   ```bash
   playwright-cli -s=test open about:blank --headed --browser=chrome && playwright-cli -s=test close
   ```

Skills are not installed by this script. Copy `AGENTCONTROL/skills/ehr-browser` and `AGENTCONTROL/skills/playwright-cli` into
your agent's skills folder (e.g. `.claude/skills/`), then start a new agent session.

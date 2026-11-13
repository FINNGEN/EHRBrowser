# Agent control for EHR Browser

Lets an AI agent tool (Claude Code or the TRE's agent tool) operate EHR Browser in a visible Chrome window and explain its data.
The agent clicks the real controls, so you watch every step, and reads the data behind each view to interpret it.

```
agent tool + skills  →  playwright-cli  →  Chrome  →  EHR Browser (window.ehrAgent)
```

## Contents

| Path | What |
|---|---|
| `skills/ehr-browser/` | App skill: how to open concepts, switch views, read and interpret the data |
| `skills/playwright-cli/` | Official browser-control skill (copy matching the pinned CLI version) |
| `scripts/install.sh` | Install with internet |
| `scripts/install-offline.sh` | Install `playwright-cli` without internet (TRE); standalone |
| `plan/` | Design notes and plan |

The app exposes `window.ehrAgent` (`src/agentHooks.js`). It is read-only and covers state, waiting for loads, search, and the data behind each view.

## Install

**With internet**, from the repo root:
```bash
AGENTCONTROL/scripts/install.sh
```

**In the TRE (no internet).** Needs Node.js 20 or newer, and Chrome.
```bash
# outside, with internet
bash AGENTCONTROL/scripts/install-offline.sh pack      # -> AGENTCONTROL/scripts/out/playwright-cli-<version>.tgz
# send install-offline.sh and the .tgz in with send-copy, then inside the TRE
bash install-offline.sh install playwright-cli-<version>.tgz
```
Then copy `skills/ehr-browser` and `skills/playwright-cli` into the agent's skills folder (e.g. `.claude/skills/`).

`install.sh` links the skills into `.claude/skills/` for you. To use another folder, pass it as the argument. Details: `scripts/README.md`.

## Use

1. Start EHR Browser (e.g. `docker run -p 8563:8563 ehr_browser`). The default URL is `http://localhost:8563`; in the preview environment it is `:18564`.
2. Start a new agent session in this repo and ask, for example:
   *"Open asthma in EHR Browser, explain its tree, then show the prevalence and interpret it."*

The agent never sends feedback or pastes concept sets without asking you, and never copies data outside the environment.

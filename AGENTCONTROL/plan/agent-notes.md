# Agent notes (Step 0 — repo inspection)

Findings for the in-app AI assistant handoff. Written before any agent code.

## 1. Frontend framework and router
- Create React App (`react-scripts` 5), React 18, plain JS/JSX (TypeScript is installed but unused).
- `react-router-dom` v7, `BrowserRouter` in `src/index.js`.
- Effectively one route: `/:urlCode` (`src/App.js`), where `urlCode` is a concept id or set of ids
  (e.g. `/317009`). Changing concept means changing the URL, so `navigate` maps onto the router's `navigate()`.
- Heavy D3: the main graph and sidebar charts are SVG drawn imperatively with `d3.select(...)`,
  not React elements (`src/components/visualization/graphSection.jsx`, `sideBar.jsx`, about 9.5k lines together).

## 2. Backend
- No Node or other JS backend. The API is **ROMOPAPI**, an R/plumber package that lives in a separate repo
  (`FINNGEN/ROMOPAPI`). It is installed into the Docker image and started by `scripts/startup.sh` on port 8564.
- nginx (`nginx.conf`) serves the CRA build on 8563 and proxies `/api/` to the R service.
- The frontend calls `${REACT_APP_API_BASE_URL}/getXxx?...` with plain `fetch`.
- Hosting the LLM proxy therefore needs a decision (see "Open questions").

## 3. State and how controls trigger actions
- All state is `useState` in `App.js`, passed down as props to `Visualization` (more than 100 props). No Redux or context.
- Controls are mostly `<div className="btn toggle-itm" onClick=...>` with ids (`descendants-toggle`,
  `mappings-toggle`, `record-toggle`, `person-toggle`, `prevalence-toggle`, `incidence-toggle`, `measurement-toggle`),
  plus a few `<button>`s (`upload-btn`, `send-json`, `send-feedback`, `zoom-to-fit`).
- Many of these divs have **no ARIA role**, so a role-based snapshot would miss them. They need `data-agent-id` (or `role="button"`).
- Graph nodes are SVG elements with D3 click handlers. They are not reachable as semantic elements, so they need
  named high-level tools (e.g. `open_concept(id)`, `select_node(conceptId)`) that call the same handlers.
- Overlays are toggled by `d3.select('#json-overlay').style('display', ...)`, outside React state.

## 4. UI component library
- None. Custom CSS in `src/App.css` and `src/index.css`, Font Awesome icons.
- Palette lives in `color` in `App.js` (purples: `#170540`, `#765ab6`, `#a790e2`, `#4A0EE0`).
  The `agent-highlight` style should use these.

## 5. Auth / CSRF
- The app itself has **no auth**: no login, cookies or tokens, and fetches send no credentials.
- In FinnGen it runs inside the sandbox (access is controlled by the environment and `SESSION_MANAGER`).
  The public demo is on render.com with no auth.
- So "authenticate the user" at the proxy has nothing to hook into yet. Rate limiting and caps still apply.

## 6. Tests
- Jest via `react-scripts test` and `@testing-library/react`. The only test (`src/App.test.js`) is the
  outdated CRA boilerplate ("learn react link") and would fail.
- No Playwright or Cypress. Acceptance item 7 (e2e) needs Playwright added as a devDependency.

## Implications for the plan
- The agent module should be plain JS (not TS) to match the codebase. JSDoc types are fine.
- The generic DOM tools will cover the header and sidebar controls. Graph interaction needs named tools.
- Main candidate flows: open a concept by id or name (search), switch Descendants/Mappings,
  switch count type, apply gender/age/source filters, prune by level or class, select a year range.

## Decisions (from the user)
- **Approach B**: the harness drives the app with `playwright-cli` plus skills. No bridge or MCP server, and no LLM calls from the app.
  See `agent-plan.md`.
- Everything lives under `AGENTCONTROL/` (`plan/`, `skills/`, `scripts/`).
- Two skills: `playwright-cli` (generic, the official skill) and `ehr-browser` (app knowledge, uses the former).
- Use existing hooks (route `/:urlCode`, `#searchConcept`, `#suggestion-<id>`, `#*-toggle`) first. Add `window.ehrAgent` and ARIA markup in v2.
- First flows: open/search concept and the view toggles (relationship, count type).
- `playwright-cli` 0.1.18 is installed locally (0.1.24 is the latest). It ships its skill (`playwright-cli install --skills`)
  and has `video-show-actions`, `highlight`, and `attach --extension`.
- `window.ehrAgent` is always on (read-only).
- Data: the agent can read what the page loaded or re-call the API (it is memoised, so cheap). The harness uses its own working dir and tools.
- Deployment target is the FinnGen sandbox, with a private LLM and harness allowed to process confidential, low-count data.
- ROMOPAPI (v2.4.0) was reviewed. Its definitions and endpoints are summarised in `agent-plan.md` §6.2 and §6.5.
- Sandbox has node/npm and a browser; its harness supports skills and images. Preview environment uses port 18564.

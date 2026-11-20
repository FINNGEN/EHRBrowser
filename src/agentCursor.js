// Visible "agent cursor" for AI agents driving the app with Playwright (see AGENTCONTROL/).
// Playwright's clicks don't move the real mouse pointer, so the user can't see where the agent acts.
// This draws a dot that follows the agent's mouse events and can show a caption explaining each step,
// like a tutorial. It only changes what is drawn on top of the page, never the app's state.
//
// The dot is plain DOM (not React state) so following the mouse never re-renders App.
// It has pointer-events: none, so it can't block Playwright's clicks.

const MOVE_MS = 450

let root = null      // { cursor, caption }
let enabled = false
let listening = false

const isBrowser = () => typeof window !== 'undefined' && typeof document !== 'undefined'

function ensureElements() {
  if (root) return root
  const cursor = document.createElement('div')
  cursor.id = 'agent-cursor'
  cursor.setAttribute('aria-hidden', 'true')
  cursor.hidden = true
  const caption = document.createElement('div')
  caption.id = 'agent-caption'
  caption.setAttribute('role', 'status')       // screen readers announce the narration
  caption.setAttribute('aria-live', 'polite')
  caption.hidden = true
  const text = document.createElement('div')
  text.className = 'agent-caption-text'
  const hint = document.createElement('div')
  hint.className = 'agent-caption-hint'
  hint.textContent = 'Esc to hide'
  caption.append(text, hint)
  document.body.append(cursor, caption)
  root = { cursor, caption, text, x: window.innerWidth / 2, y: window.innerHeight / 2 }
  return root
}

function moveTo(x, y) {
  const r = ensureElements()
  r.x = x
  r.y = y
  r.cursor.style.transform = `translate(${x}px, ${y}px)`
  placeCaption()
}

// put the caption below-right of the dot, flipped to stay on screen
function placeCaption() {
  const r = root
  if (!r || r.caption.hidden) return
  const pad = 12, gap = 22
  const w = r.caption.offsetWidth, h = r.caption.offsetHeight
  let left = r.x + gap, top = r.y + gap
  if (left + w > window.innerWidth - pad) left = Math.max(pad, r.x - gap - w)
  if (top + h > window.innerHeight - pad) top = Math.max(pad, r.y - gap - h)
  r.caption.style.transform = `translate(${left}px, ${top}px)`
}

function ripple() {
  const c = ensureElements().cursor
  c.classList.remove('agent-click')
  void c.offsetWidth // restart the animation
  c.classList.add('agent-click')
}

// passive tracking of the agent's input; capture phase so D3 handlers that stop propagation don't hide it
const onMove = e => { if (enabled) moveTo(e.clientX, e.clientY) }
const onDown = e => { if (enabled) { moveTo(e.clientX, e.clientY); ripple() } }
const onFocus = e => {
  // fill/type sends no mouse events: jump to the focused field instead
  if (!enabled || !e.target?.getBoundingClientRect) return
  const b = e.target.getBoundingClientRect()
  if (b.width || b.height) moveTo(b.left + Math.min(16, b.width / 2), b.top + b.height / 2)
}
// Esc hides the cursor so the user can take over; it stays hidden until the agent calls point() or showCursor().
// Doesn't stop the event, so the app's own Esc handlers still run.
const onKey = e => { if (enabled && e.key === 'Escape') setAgentCursor(false) }

function listen() {
  if (listening) return
  const opts = { capture: true, passive: true }
  document.addEventListener('mousemove', onMove, opts)
  document.addEventListener('mousedown', onDown, opts)
  document.addEventListener('focusin', onFocus, opts)
  document.addEventListener('keydown', onKey, opts)
  listening = true
}

export function setAgentCursor(on = true) {
  if (!isBrowser()) return false
  enabled = !!on
  const r = ensureElements()
  r.cursor.hidden = !enabled
  if (!enabled) r.caption.hidden = true
  if (enabled) listen()
  return enabled
}

// Show (or clear, with empty text) the caption next to the dot.
export function say(text) {
  if (!isBrowser()) return { ok: false, error: 'no browser' }
  if (!enabled) setAgentCursor(true)
  const r = ensureElements()
  const t = String(text ?? '').trim()
  r.text.textContent = t
  r.caption.hidden = !t
  placeCaption()
  return { ok: true }
}

// Move the dot to an element and explain the next step. Resolves once the dot has arrived,
// so `await ehrAgent.point(...)` followed by a click looks natural.
export function point(selector, text, { duration = MOVE_MS } = {}) {
  if (!isBrowser()) return Promise.resolve({ ok: false, error: 'no browser' })
  let el
  try { el = typeof selector === 'string' ? document.querySelector(selector) : selector } catch (e) {
    return Promise.resolve({ ok: false, error: `invalid selector: ${selector}` })
  }
  if (!el) return Promise.resolve({ ok: false, error: `no element matches ${selector}` })
  if (!enabled) setAgentCursor(true)
  const r = ensureElements()
  el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  const b = el.getBoundingClientRect()
  r.cursor.style.transitionDuration = `${duration}ms`
  moveTo(b.left + b.width / 2, b.top + b.height / 2)
  if (text !== undefined) say(text)
  return new Promise(resolve => setTimeout(() => resolve({ ok: true, x: Math.round(r.x), y: Math.round(r.y) }), duration))
}

export function hideAgentCursor() { return setAgentCursor(false) }

// Functions merged into window.ehrAgent.
export const agentCursorApi = {
  point,
  say,
  showCursor: () => setAgentCursor(true),
  hideCursor: hideAgentCursor
}

// Turn on automatically in a Playwright-launched browser (navigator.webdriver) or with ?agent in the URL.
// When the agent attaches to the user's own Chrome, it calls showCursor() or point() instead.
export function initAgentCursor() {
  if (!isBrowser()) return
  const auto = navigator.webdriver || new URLSearchParams(window.location.search).has('agent')
  if (auto) setAgentCursor(true)
}

// for tests
export function _resetAgentCursor() {
  if (root) { root.cursor.remove(); root.caption.remove() }
  if (listening) {
    const opts = { capture: true }
    document.removeEventListener('mousemove', onMove, opts)
    document.removeEventListener('mousedown', onDown, opts)
    document.removeEventListener('focusin', onFocus, opts)
    document.removeEventListener('keydown', onKey, opts)
  }
  root = null; enabled = false; listening = false
}

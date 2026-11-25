import { point, say, setAgentCursor, hideAgentCursor, initAgentCursor, _resetAgentCursor } from './agentCursor.js'

const cursor = () => document.getElementById('agent-cursor')
const caption = () => document.getElementById('agent-caption')

beforeEach(() => {
  _resetAgentCursor()
  document.body.innerHTML = '<div id="target"></div>'
  document.getElementById('target').getBoundingClientRect = () => ({ left: 100, top: 50, width: 40, height: 20 })
})

test('stays off until enabled in a normal browser', () => {
  initAgentCursor()
  expect(cursor()).toBeNull()
})

test('point moves the dot to the element centre, shows the caption and resolves after the move', async () => {
  const res = await point('#target', 'Switching to prevalence', { duration: 0 })
  expect(res).toEqual({ ok: true, x: 120, y: 60 })
  expect(cursor().hidden).toBe(false)
  expect(cursor().style.transform).toBe('translate(120px, 60px)')
  expect(caption().hidden).toBe(false)
  expect(caption().querySelector('.agent-caption-text').textContent).toBe('Switching to prevalence')
  expect(caption().textContent).toContain('Esc to hide')
})

test('Esc hides the cursor until the agent points again, without stopping the event', async () => {
  await point('#target', 'hi', { duration: 0 })
  const appHandler = jest.fn()
  window.addEventListener('keydown', appHandler)
  document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
  window.removeEventListener('keydown', appHandler)
  expect(appHandler).toHaveBeenCalled()
  expect(cursor().hidden).toBe(true)
  expect(caption().hidden).toBe(true)
  // the user's own mouse no longer moves it
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 5, clientY: 5 }))
  expect(cursor().style.transform).not.toBe('translate(5px, 5px)')
  // the agent's next point brings it back
  await point('#target', 'back', { duration: 0 })
  expect(cursor().hidden).toBe(false)
})

test('point reports a missing or invalid selector without throwing', async () => {
  expect((await point('#nope', 'x')).ok).toBe(false)
  expect((await point('##bad', 'x')).ok).toBe(false)
})

test('the overlay can never block clicks', async () => {
  await point('#target', 'hi', { duration: 0 })
  // jsdom has no stylesheet, so check the rule exists in index.css
  const css = require('fs').readFileSync(require('path').join(__dirname, 'index.css'), 'utf8')
  const rule = id => css.slice(css.indexOf(`#${id} {`), css.indexOf('}', css.indexOf(`#${id} {`)))
  expect(rule('agent-cursor')).toContain('pointer-events: none')
  expect(rule('agent-caption')).toContain('pointer-events: none')
})

test('follows mouse events once enabled, and ripples on mousedown', () => {
  setAgentCursor(true)
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 20 }))
  expect(cursor().style.transform).toBe('translate(10px, 20px)')
  document.getElementById('target').dispatchEvent(new MouseEvent('mousedown', { clientX: 30, clientY: 40, bubbles: true }))
  expect(cursor().style.transform).toBe('translate(30px, 40px)')
  expect(cursor().classList.contains('agent-click')).toBe(true)
})

test('jumps to a focused field (fill sends no mouse events)', () => {
  setAgentCursor(true)
  document.getElementById('target').dispatchEvent(new FocusEvent('focusin', { bubbles: true }))
  expect(cursor().style.transform).toBe('translate(116px, 60px)')
})

test('say with empty text clears the caption; hide removes both', () => {
  say('hello')
  expect(caption().hidden).toBe(false)
  say('')
  expect(caption().hidden).toBe(true)
  say('again')
  hideAgentCursor()
  expect(cursor().hidden).toBe(true)
  expect(caption().hidden).toBe(true)
  document.dispatchEvent(new MouseEvent('mousemove', { clientX: 5, clientY: 5 }))
  expect(cursor().style.transform).not.toBe('translate(5px, 5px)')
})

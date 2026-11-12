// Read-only hooks for AI agents driving the app with Playwright (see AGENTCONTROL/).
// window.ehrAgent exposes the app state and the data behind each view as plain JSON.
// It never changes the UI: agents still click the real controls so the user sees every step.

export const EHR_AGENT_VERSION = 1

const MAPPING_LEVELS = ['Mapped from', 'Maps to']
const DATA_KINDS = ['tree', 'counts', 'prevalence', 'incidence', 'person', 'filters', 'measurement']

// concept_id -> compact concept info
function conceptIndex(treeData) {
  const index = new Map()
  for (const c of treeData?.concepts ?? []) {
    if (index.has(c.concept_id)) continue
    index.set(c.concept_id, {
      concept_id: c.concept_id,
      name: c.concept_name,
      vocabulary: c.vocabulary_id,
      concept_class: c.concept_class_id,
      domain: c.domain_id,
      standard: !!c.standard_concept,
      code: c.concept_code,
      record_counts: c.record_counts ?? 0,
      descendant_record_counts: c.descendant_record_counts ?? 0,
      person_counts: c.person_counts ?? 0,
      descendant_person_counts: c.descendant_person_counts ?? 0
    })
  }
  return index
}

// Hierarchy from getConceptRelationships data: one entry per concept with its level, direct parents/children and mappings.
// `shownIds` marks the nodes currently drawn (the tree can be pruned by level or class).
export function buildTree(treeData, rootIds = [], shownIds = []) {
  const concepts = conceptIndex(treeData)
  const nodes = new Map()
  const shown = new Set(shownIds.map(Number))
  const node = (id, level) => {
    if (!nodes.has(id)) {
      nodes.set(id, { ...(concepts.get(id) ?? { concept_id: id }), level, parents: [], children: [], mappings: [], shown: shown.has(id) })
    }
    const n = nodes.get(id)
    if (level !== undefined && (n.level === undefined || level < n.level)) n.level = level
    return n
  }
  const link = (parentId, childId) => {
    const parent = node(parentId), child = node(childId)
    if (!parent.children.includes(childId)) parent.children.push(childId)
    if (!child.parents.includes(parentId)) child.parents.push(parentId)
  }
  for (const r of treeData?.concept_relationships ?? []) {
    if (r.levels === '0') node(r.child_concept_id, 0)
    else if (r.levels === '-1') {
      // reversed columns: child_concept_id is the parent of the root
      node(r.child_concept_id, -1)
      node(r.parent_concept_id, 0)
      link(r.child_concept_id, r.parent_concept_id)
    } else if (MAPPING_LEVELS.includes(r.levels)) {
      const source = concepts.get(r.child_concept_id) ?? { concept_id: r.child_concept_id }
      const m = node(r.parent_concept_id).mappings
      if (!m.some(e => e.concept_id === source.concept_id)) {
        m.push({ concept_id: source.concept_id, name: source.name, vocabulary: source.vocabulary, code: source.code, relationship: r.levels, record_counts: source.record_counts ?? 0, person_counts: source.person_counts ?? 0 })
      }
    } else {
      const level = parseInt(r.levels, 10)
      node(r.child_concept_id, Number.isNaN(level) ? undefined : level)
      link(r.parent_concept_id, r.child_concept_id)
    }
  }
  for (const n of nodes.values()) n.mappings.sort((a, b) => b.record_counts - a.record_counts)
  return {
    roots: rootIds.map(Number),
    nodes: [...nodes.values()].sort((a, b) => (a.level ?? 99) - (b.level ?? 99) || b.descendant_record_counts - a.descendant_record_counts)
  }
}

const tokenConceptId = token => Number(String(token).replace(/[SMD]+$/, ''))

// Long-format record counts per concept and year, as stacked in the record-counts plot (current filters applied).
export function buildCounts(stackData, names) {
  const rows = []
  for (const row of stackData ?? []) {
    for (const [key, value] of Object.entries(row)) {
      if (key === 'year') continue
      const id = Number(key)
      rows.push({ concept_id: id, name: names.get(id)?.name ?? null, calendar_year: row.year, record_counts: value })
    }
  }
  return rows
}

// Prevalence / incidence rows with the concept name and the rate the page plots (person_counts / observed_persons_counts).
export function buildRates(data, names) {
  return (data ?? []).map(r => {
    const id = tokenConceptId(r.tagged_concept_id)
    return {
      tagged_concept_id: r.tagged_concept_id,
      concept_id: id,
      name: names.get(id)?.name ?? null,
      calendar_year: r.calendar_year,
      person_counts: r.person_counts,
      observed_persons_counts: r.observed_persons_counts,
      rate: r.observed_persons_counts > 0 ? r.person_counts / r.observed_persons_counts : null
    }
  })
}

// Same matching and ranking as the header search box: name, id or code contains the query;
// names starting with the query first, then codes starting with it, then alphabetical (ids first for numeric queries).
export function searchConcepts(conceptList, query, { limit = 20, vocabularies } = {}) {
  const q = String(query ?? '').trim().toLowerCase()
  if (!q) return []
  const numeric = !isNaN(q)
  const matches = []
  for (const d of conceptList ?? []) {
    if (vocabularies?.length && !vocabularies.includes(d.vocabulary_id)) continue
    const m = { d, name: d._name ?? String(d.concept_name).toLowerCase(), id: d._id ?? String(d.concept_id), code: d._code ?? String(d.concept_code).toUpperCase() }
    if (m.name.includes(q) || m.id.includes(q) || m.code.includes(q.toUpperCase())) matches.push(m)
  }
  const first = (a, b) => (a === b ? 0 : a ? -1 : 1)
  matches.sort((a, b) => numeric
    ? first(a.id.startsWith(q), b.id.startsWith(q)) || a.id.localeCompare(b.id)
    : first(a.name.startsWith(q), b.name.startsWith(q)) || first(a.code.startsWith(q), b.code.startsWith(q)) || a.name.localeCompare(b.name))
  return matches.slice(0, limit).map(({ d }) => ({ concept_id: d.concept_id, name: d.concept_name, vocabulary: d.vocabulary_id, code: d.concept_code }))
}

// Counts in-flight requests to the API so waitUntilIdle can tell when a view's data has arrived.
// Wraps window.fetch once; the wrapper only counts and passes everything through unchanged.
export const apiActivity = { inFlight: 0, lastActivity: 0 }
export function trackApiRequests(apiBaseUrl) {
  if (typeof window === 'undefined' || !window.fetch || window.fetch.__ehrAgentTracked) return
  const originalFetch = window.fetch.bind(window)
  const tracked = (input, init) => {
    const url = typeof input === 'string' ? input : input?.url ?? ''
    if (!url.startsWith(apiBaseUrl)) return originalFetch(input, init)
    apiActivity.inFlight++
    apiActivity.lastActivity = Date.now()
    const done = () => { apiActivity.inFlight--; apiActivity.lastActivity = Date.now() }
    return originalFetch(input, init).then(res => { done(); return res }, err => { done(); throw err })
  }
  tracked.__ehrAgentTracked = true
  window.fetch = tracked
}

const filterValues = values => (!values || values.includes(-1) ? 'all' : values)

// endpoint behind each count type's plot (record counts come from getCodeCountsStratified, one call per concept)
const QUERY_ENDPOINTS = {
  person: 'getPersonCountsUpset', prevalence: 'getPersonCountsPrevalence',
  incidence: 'getPersonCountsIncidence', measurement: 'getMeasurementValueHistogram'
}

// absolute API base URL without trailing slash, e.g. "http://localhost:8563/api"
function absoluteApiBase(apiBaseUrl) {
  const base = String(apiBaseUrl ?? '').replace(/\/+$/, '')
  try { return new URL(base, window.location.origin).href.replace(/\/+$/, '') } catch (e) { return base }
}

// getSnapshot() returns the latest App state (kept in a ref by App.js).
export function createEhrAgent(getSnapshot, apiBaseUrl = '') {
  const names = s => conceptIndex(s.treeData)
  const apiBase = absoluteApiBase(apiBaseUrl)

  const getState = () => {
    const s = getSnapshot()
    const index = names(s)
    const errorEl = typeof document !== 'undefined' ? document.getElementById('error-message') : null
    const conceptIds = (s.rootConcepts ?? []).map(Number)
    const dataLoading = conceptIds.length > 0 && !s.treeData
    return {
      version: EHR_AGENT_VERSION,
      apiBaseUrl: apiBase,
      conceptIds,
      concepts: conceptIds.map(id => ({ concept_id: id, name: index.get(id)?.name ?? null, vocabulary: index.get(id)?.vocabulary ?? null })),
      view: s.view ?? null,
      relationship: s.relationship ?? null,
      countType: s.countType ?? null,
      loading: !!(s.loading || s.graphLoading || s.initialPrune || dataLoading),
      error: !!errorEl && errorEl.style.display !== 'none',
      isMeasurement: !!s.isMeasurement,
      yearRange: s.yearSelection ?? s.extent ?? null,
      filters: { sex: filterValues(s.graphFilter?.gender), age: filterValues(s.graphFilter?.age), visit: filterValues(s.graphFilter?.source) },
      shownConceptIds: (s.selectedConcepts ?? []).map(d => Number(d.name))
    }
  }

  const getData = kind => {
    const s = getSnapshot()
    const index = names(s)
    switch (kind) {
      case 'tree': return buildTree(s.treeData, s.rootConcepts, (s.nodes ?? []).map(n => n.name))
      case 'counts': return buildCounts(s.stackData, index)
      case 'prevalence': return buildRates(s.prevalenceData, index)
      case 'incidence': return buildRates(s.incidenceData, index)
      case 'person': return s.personData ?? []
      case 'filters': return s.personFilterData ?? []
      case 'measurement': return s.measurementData ?? []
      default: throw new Error(`unknown kind "${kind}"; use one of: ${DATA_KINDS.join(', ')}`)
    }
  }

  return {
    version: EHR_AGENT_VERSION,
    getState,
    getData,
    // rows = length of getData(kind) (tree: number of nodes)
    listData: () => DATA_KINDS.map(kind => {
      const data = getData(kind)
      return { kind, rows: kind === 'tree' ? data.nodes.length : data.length }
    }),
    // the API request behind the current person-count view; url is null for record counts
    getQuery: () => {
      const s = getSnapshot()
      let query = null
      try { query = s.getQueryString?.() ?? null } catch (e) { query = null }
      const endpoint = QUERY_ENDPOINTS[s.countType] ?? null
      return { endpoint, query, url: endpoint && query ? `${apiBase}/${endpoint}?${query}` : null }
    },
    search: (query, options) => searchConcepts(getSnapshot().conceptList, query, options),
    // Resolves when nothing is loading and no API request has been active for quietMs.
    // The page debounces its requests by ~300 ms after a click, so the first check is delayed past that.
    waitUntilIdle: (timeoutMs = 30000, quietMs = 700) => new Promise(resolve => {
      const start = Date.now()
      const check = () => {
        const state = getState()
        const quiet = apiActivity.inFlight === 0 && Date.now() - apiActivity.lastActivity >= quietMs
        if (!state.loading && quiet) resolve({ idle: true, waitedMs: Date.now() - start, state })
        else if (Date.now() - start >= timeoutMs) resolve({ idle: false, waitedMs: Date.now() - start, state })
        else setTimeout(check, 200)
      }
      setTimeout(check, 500)
    })
  }
}

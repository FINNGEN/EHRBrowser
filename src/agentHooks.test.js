import { buildTree, buildCounts, buildRates, searchConcepts, createEhrAgent, apiActivity } from './agentHooks.js'

// trimmed getConceptRelationships?conceptId=317009 response
const concept = (id, name, vocabulary, standard, records, descendantRecords = records) => ({
  concept_id: id, concept_name: name, domain_id: 'Condition', vocabulary_id: vocabulary, concept_class_id: 'Disorder',
  standard_concept: standard, concept_code: String(id), record_counts: records, descendant_record_counts: descendantRecords,
  person_counts: Math.round(records / 2), descendant_person_counts: Math.round(descendantRecords / 2)
})
const treeData = {
  concept_relationships: [
    { parent_concept_id: 317009, child_concept_id: 320136, levels: '-1' },
    { parent_concept_id: 317009, child_concept_id: 317009, levels: '0' },
    { parent_concept_id: 317009, child_concept_id: 4191479, levels: '1-1' },
    { parent_concept_id: 4191479, child_concept_id: 312950, levels: '2-2' },
    { parent_concept_id: 317009, child_concept_id: 45596282, levels: 'Mapped from' },
    { parent_concept_id: 317009, child_concept_id: 45562456, levels: 'Mapped from' }
  ],
  concepts: [
    concept(320136, 'Disorder of respiratory system', 'SNOMED', true, 6496, 2871299),
    concept(317009, 'Asthma', 'SNOMED', true, 329397, 481732),
    concept(4191479, 'Allergic asthma', 'SNOMED', true, 77856, 79448),
    concept(312950, 'IgE-mediated allergic asthma', 'SNOMED', true, 1592),
    concept(45596282, 'Asthma', 'ICD10', false, 1000),
    concept(45562456, 'Asthma, unspecified', 'ICD10', false, 5000),
    concept(317009, 'Asthma', 'SNOMED', true, 329397, 481732) // duplicates appear when concept sets are merged
  ]
}
const index = new Map(treeData.concepts.map(c => [c.concept_id, { name: c.concept_name }]))

describe('buildTree', () => {
  const tree = buildTree(treeData, [317009], [317009, 4191479])
  const byId = id => tree.nodes.find(n => n.concept_id === id)

  test('levels relative to the root, with the reversed -1 row handled', () => {
    expect(byId(317009).level).toBe(0)
    expect(byId(320136).level).toBe(-1)
    expect(byId(320136).children).toEqual([317009])
    expect(byId(317009).parents).toEqual([320136])
    expect(byId(4191479).level).toBe(1)
    expect(byId(312950).level).toBe(2)
  })

  test('direct parents and children', () => {
    expect(byId(317009).children).toEqual([4191479])
    expect(byId(312950).parents).toEqual([4191479])
  })

  test('mappings attached to their node, largest first, and not counted as nodes', () => {
    expect(byId(317009).mappings.map(m => m.concept_id)).toEqual([45562456, 45596282])
    expect(byId(317009).mappings[0]).toMatchObject({ vocabulary: 'ICD10', record_counts: 5000, relationship: 'Mapped from' })
    expect(byId(45596282)).toBeUndefined()
  })

  test('one entry per concept, with shown flags and counts', () => {
    expect(tree.nodes.filter(n => n.concept_id === 317009)).toHaveLength(1)
    expect(byId(317009)).toMatchObject({ shown: true, record_counts: 329397, descendant_record_counts: 481732, standard: true })
    expect(byId(312950).shown).toBe(false)
    expect(tree.roots).toEqual([317009])
  })

  test('output is plain JSON', () => {
    expect(JSON.parse(JSON.stringify(tree))).toEqual(tree)
  })

  test('empty input', () => {
    expect(buildTree(undefined)).toEqual({ roots: [], nodes: [] })
  })
})

test('buildCounts turns stacked rows into long format', () => {
  const rows = buildCounts([{ year: 2020, 317009: 10, 4191479: 3 }, { year: 2021, 317009: 12, 4191479: 0 }], index)
  expect(rows).toHaveLength(4)
  expect(rows[0]).toEqual({ concept_id: 317009, name: 'Asthma', calendar_year: 2020, record_counts: 10 })
})

test('buildRates adds names and the plotted rate', () => {
  const rows = buildRates([
    { tagged_concept_id: '317009SD', calendar_year: 1995, person_counts: 589, observed_persons_counts: 478446 },
    { tagged_concept_id: '45596282M', calendar_year: 1995, person_counts: 0, observed_persons_counts: 0 }
  ], index)
  expect(rows[0]).toMatchObject({ concept_id: 317009, name: 'Asthma', rate: 589 / 478446 })
  expect(rows[1]).toMatchObject({ concept_id: 45596282, rate: null })
})

describe('searchConcepts', () => {
  const list = [
    { concept_id: 45596282, concept_name: 'Asthma', vocabulary_id: 'ICD10', concept_code: 'J45' },
    { concept_id: 317009, concept_name: 'Asthma', vocabulary_id: 'SNOMED', concept_code: '195967001' },
    { concept_id: 4191479, concept_name: 'Allergic asthma', vocabulary_id: 'SNOMED', concept_code: '389145006' }
  ]
  test('matches name, id and code', () => {
    expect(searchConcepts(list, 'asthma').map(d => d.concept_id)).toEqual([45596282, 317009, 4191479]) // names starting with the query first
    expect(searchConcepts(list, '317009').map(d => d.concept_id)).toEqual([317009])
    expect(searchConcepts(list, 'j45').map(d => d.concept_id)).toEqual([45596282])
  })
  test('ranking: name prefix, then code prefix, then alphabetical', () => {
    const more = [...list, { concept_id: 1, concept_name: 'Exercise-induced asthma', vocabulary_id: 'SNOMED', concept_code: 'J45X' }]
    expect(searchConcepts(more, 'asthma').map(d => d.concept_id)).toEqual([45596282, 317009, 4191479, 1])
    expect(searchConcepts(more, 'j45').map(d => d.concept_id)).toEqual([45596282, 1])
  })
  test('vocabulary filter, limit, empty query', () => {
    expect(searchConcepts(list, 'asthma', { vocabularies: ['SNOMED'], limit: 1 }).map(d => d.concept_id)).toEqual([317009])
    expect(searchConcepts(list, '  ')).toEqual([])
  })
})

describe('createEhrAgent', () => {
  let snapshot
  const agent = createEhrAgent(() => snapshot, 'http://localhost:8563/api/')
  beforeEach(() => {
    snapshot = {
      rootConcepts: [317009], treeData, nodes: [{ name: 317009 }], selectedConcepts: [{ name: 317009 }],
      view: 'tree', relationship: 'descendants', countType: 'prevalence', loading: false, graphLoading: false,
      extent: [1987, 2024], yearSelection: null, graphFilter: { gender: [-1], age: [-1], source: [2002330249] },
      stackData: [], prevalenceData: [{ tagged_concept_id: '317009S', calendar_year: 2020, person_counts: 349, observed_persons_counts: 380612 }],
      getQueryString: () => 'conceptIds=317009S&yearsRange=1987,2024'
    }
  })

  test('getState summarises the view', () => {
    expect(agent.getState()).toMatchObject({
      conceptIds: [317009], concepts: [{ concept_id: 317009, name: 'Asthma', vocabulary: 'SNOMED' }], view: 'tree',
      countType: 'prevalence', loading: false, yearRange: [1987, 2024],
      filters: { sex: 'all', age: 'all', visit: [2002330249] }, shownConceptIds: [317009]
    })
  })

  test('loading while a concept is open but its tree has not arrived', () => {
    snapshot.treeData = undefined
    expect(agent.getState().loading).toBe(true)
  })

  test('getData, listData and getQuery', () => {
    expect(agent.getData('prevalence')[0]).toMatchObject({ name: 'Asthma', rate: 349 / 380612 })
    expect(agent.getData('tree').nodes.length).toBe(4)
    expect(() => agent.getData('nope')).toThrow(/unknown kind/)
    expect(agent.listData().find(d => d.kind === 'prevalence').rows).toBe(1)
    expect(agent.listData().find(d => d.kind === 'tree').rows).toBe(4)
    expect(agent.getQuery()).toEqual({
      endpoint: 'getPersonCountsPrevalence', query: 'conceptIds=317009S&yearsRange=1987,2024',
      url: 'http://localhost:8563/api/getPersonCountsPrevalence?conceptIds=317009S&yearsRange=1987,2024'
    })
    expect(agent.getState().apiBaseUrl).toBe('http://localhost:8563/api')
    snapshot.getQueryString = () => { throw new Error('no extent yet') }
    expect(agent.getQuery().url).toBeNull()
    snapshot.countType = 'record'
    expect(agent.getQuery().endpoint).toBeNull()
  })

  test('waitUntilIdle waits for loading and API requests to finish', async () => {
    jest.useFakeTimers()
    snapshot.loading = true
    apiActivity.inFlight = 1
    const result = agent.waitUntilIdle(10000, 700)
    jest.advanceTimersByTime(1000)
    snapshot.loading = false
    apiActivity.inFlight = 0
    apiActivity.lastActivity = Date.now()
    jest.advanceTimersByTime(1000)
    await expect(result).resolves.toMatchObject({ idle: true })
    jest.useRealTimers()
  })
})

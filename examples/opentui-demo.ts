/**
 * OpenTUI Integration Demo
 *
 * This example demonstrates the API design for ggterm OpenTUI integration.
 * In a real OpenTUI app, you would use the React components from @ggterm/opentui.
 *
 * Run with: npx tsx examples/opentui-demo.ts
 */

import { gg } from '../packages/core/src/grammar'
import { geom_point, geom_line, geom_bar } from '../packages/core/src/geoms'
import { scale_color_viridis, scale_color_discrete } from '../packages/core/src/scales'
import { facet_wrap } from '../packages/core/src/facets'

console.log('='.repeat(70))
console.log('         OpenTUI Integration Demo - API Design Examples')
console.log('='.repeat(70))
console.log('')

// ============================================================
// Example 1: Basic Plot (equivalent to <GGTerm> component)
// ============================================================

console.log('=== Example 1: Basic GGTerm Component Equivalent ===\n')

const basicData = [
  { x: 1, y: 2, group: 'A' },
  { x: 2, y: 4, group: 'A' },
  { x: 3, y: 3, group: 'A' },
  { x: 4, y: 5, group: 'A' },
  { x: 1, y: 3, group: 'B' },
  { x: 2, y: 5, group: 'B' },
  { x: 3, y: 4, group: 'B' },
  { x: 4, y: 6, group: 'B' },
]

// This is what GGTerm component does internally
const basicPlot = gg(basicData)
  .aes({ x: 'x', y: 'y', color: 'group' })
  .geom(geom_point())
  .labs({ title: 'GGTerm Component Output', x: 'X Axis', y: 'Y Axis' })

console.log(basicPlot.render({ width: 60, height: 18 }))
console.log('')

console.log('/* In React/OpenTUI, you would write:')
console.log(`
<GGTerm
  data={data}
  aes={{ x: 'x', y: 'y', color: 'group' }}
  geoms={[geom_point()]}
  labs={{ title: 'GGTerm Component Output', x: 'X Axis', y: 'Y Axis' }}
  width={60}
  height={18}
  interactive
  onHover={(point) => console.log('Hovering:', point)}
  onClick={(point) => console.log('Clicked:', point)}
/>
*/`)
console.log('')

// ============================================================
// Example 2: useGGTerm Hook Simulation
// ============================================================

console.log('=== Example 2: useGGTerm Hook Pattern ===\n')

// Simulating what useGGTerm does - manages plot state
interface UseGGTermState {
  data: Record<string, unknown>[]
  renderCount: number
}

const hookState: UseGGTermState = {
  data: [
    { time: 0, value: 10 },
    { time: 1, value: 15 },
    { time: 2, value: 12 },
    { time: 3, value: 18 },
    { time: 4, value: 16 },
    { time: 5, value: 20 },
  ],
  renderCount: 0,
}

// Simulated hook functions
const setData = (newData: Record<string, unknown>[]) => {
  hookState.data = newData
  hookState.renderCount++
}

const pushData = (newPoint: Record<string, unknown>) => {
  hookState.data = [...hookState.data, newPoint]
  hookState.renderCount++
}

// Push some data points
pushData({ time: 6, value: 22 })
pushData({ time: 7, value: 19 })

console.log(`Render count: ${hookState.renderCount}`)
console.log(`Data points: ${hookState.data.length}`)

const timeSeriesPlot = gg(hookState.data)
  .aes({ x: 'time', y: 'value' })
  .geom(geom_line())
  .geom(geom_point())
  .labs({ title: 'useGGTerm Hook Output', x: 'Time', y: 'Value' })

console.log(timeSeriesPlot.render({ width: 60, height: 15 }))
console.log('')

console.log('/* In React/OpenTUI, you would write:')
console.log(`
function StreamingPlot() {
  const { rendered, pushData, setData, renderCount } = useGGTerm({
    aes: { x: 'time', y: 'value' },
    geoms: [geom_line(), geom_point()],
    width: 60,
    height: 15,
    debounceMs: 100, // Batch updates for performance
  })

  useEffect(() => {
    const ws = new WebSocket('ws://...')
    ws.onmessage = (e) => pushData(JSON.parse(e.data))
    return () => ws.close()
  }, [pushData])

  return <text>{rendered}</text>
}
*/`)
console.log('')

// ============================================================
// Example 3: usePlotData Hook Simulation
// ============================================================

console.log('=== Example 3: usePlotData Hook Pattern ===\n')

// Simulating windowed data management
interface WindowedData {
  data: { x: number; y: number }[]
  maxPoints: number
}

const windowedState: WindowedData = {
  data: [],
  maxPoints: 15,
}

const pushWindowedData = (point: { x: number; y: number }) => {
  windowedState.data.push(point)
  if (windowedState.data.length > windowedState.maxPoints) {
    windowedState.data = windowedState.data.slice(-windowedState.maxPoints)
  }
}

// Simulate streaming 30 points (only keeps last 15)
for (let i = 0; i < 30; i++) {
  pushWindowedData({
    x: i,
    y: 50 + Math.sin(i * 0.5) * 30 + (Math.random() - 0.5) * 10,
  })
}

console.log(`Pushed 30 points, kept ${windowedState.data.length} (maxPoints: ${windowedState.maxPoints})`)

// Calculate stats
const yValues = windowedState.data.map(d => d.y)
const stats = {
  min: Math.min(...yValues),
  max: Math.max(...yValues),
  mean: yValues.reduce((a, b) => a + b, 0) / yValues.length,
}
console.log(`Y stats: min=${stats.min.toFixed(1)}, max=${stats.max.toFixed(1)}, mean=${stats.mean.toFixed(1)}`)

const windowedPlot = gg(windowedState.data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_line())
  .labs({ title: 'Windowed Streaming Data', x: 'Time', y: 'Value' })

console.log(windowedPlot.render({ width: 60, height: 12 }))
console.log('')

console.log('/* In React/OpenTUI, you would write:')
console.log(`
function StreamingChart() {
  const { data, pushData, count, getStats } = usePlotData<{ x: number; y: number }>([], {
    maxPoints: 100,  // Keep last 100 points
    maxAge: 60000,   // Or keep last 60 seconds
    timeField: 'x',
  })

  const yStats = getStats('y')
  console.log(\`Points: \${count}, Mean: \${yStats?.mean}\`)

  return <GGTerm data={data} aes={{ x: 'x', y: 'y' }} geoms={[geom_line()]} />
}
*/`)
console.log('')

// ============================================================
// Example 4: usePlotInteraction Hook Simulation
// ============================================================

console.log('=== Example 4: usePlotInteraction Pattern ===\n')

// Simulating interaction state
interface InteractionState {
  selectedIndices: Set<number>
  hoveredIndex: number | null
  viewport: { zoomLevel: number }
}

const interactionState: InteractionState = {
  selectedIndices: new Set(),
  hoveredIndex: null,
  viewport: { zoomLevel: 1 },
}

const handleSelect = (index: number, mode: 'single' | 'multiple') => {
  if (mode === 'single') {
    interactionState.selectedIndices = new Set([index])
  } else {
    if (interactionState.selectedIndices.has(index)) {
      interactionState.selectedIndices.delete(index)
    } else {
      interactionState.selectedIndices.add(index)
    }
  }
}

// Simulate multi-selection
handleSelect(0, 'multiple')
handleSelect(2, 'multiple')
handleSelect(4, 'multiple')
console.log(`Selected indices: ${Array.from(interactionState.selectedIndices).join(', ')}`)

const getSelectedData = <T,>(data: T[]): T[] => {
  return data.filter((_, i) => interactionState.selectedIndices.has(i))
}

const selectedPoints = getSelectedData(basicData)
console.log(`Selected ${selectedPoints.length} points`)

const interactivePlot = gg(basicData)
  .aes({ x: 'x', y: 'y', color: 'group' })
  .geom(geom_point())
  .labs({ title: 'Interactive Selection Demo', x: 'X', y: 'Y' })

console.log(interactivePlot.render({ width: 50, height: 12 }))
console.log('')

console.log('/* In React/OpenTUI, you would write:')
console.log(`
function SelectablePlot({ data }) {
  const {
    state,
    handleSelect,
    clearSelection,
    handleKeyDown,
    zoomIn, zoomOut, resetZoom,
    getSelectedData,
  } = usePlotInteraction({
    selectionMode: 'multiple',
    enableZoom: true,
    onSelectionChange: (indices) => console.log('Selected:', indices),
  })

  const selected = getSelectedData(data)

  return (
    <GGTerm
      data={data}
      aes={{ x: 'x', y: 'y' }}
      geoms={[geom_point()]}
      interactive
      onClick={(point) => point && handleSelect(point.index)}
      onKeyDown={(key) => handleKeyDown(key)}
    />
  )
}
*/`)
console.log('')

// ============================================================
// Example 5: Faceted Plot with Interaction
// ============================================================

console.log('=== Example 5: Faceted Interactive Plot ===\n')

const facetData = [
  // Category A
  { x: 1, y: 2, cat: 'A' }, { x: 2, y: 3, cat: 'A' },
  { x: 3, y: 2.5, cat: 'A' }, { x: 4, y: 4, cat: 'A' },
  // Category B
  { x: 1, y: 4, cat: 'B' }, { x: 2, y: 5, cat: 'B' },
  { x: 3, y: 4.5, cat: 'B' }, { x: 4, y: 6, cat: 'B' },
  // Category C
  { x: 1, y: 1, cat: 'C' }, { x: 2, y: 1.5, cat: 'C' },
  { x: 3, y: 2, cat: 'C' }, { x: 4, y: 2.5, cat: 'C' },
]

const facetedPlot = gg(facetData)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .geom(geom_line())
  .facet(facet_wrap('cat', { ncol: 3 }))
  .labs({ title: 'Faceted by Category' })

console.log(facetedPlot.render({ width: 70, height: 18 }))
console.log('')

console.log('/* In React/OpenTUI:')
console.log(`
<GGTerm
  data={facetData}
  aes={{ x: 'x', y: 'y' }}
  geoms={[geom_point(), geom_line()]}
  facet={facet_wrap('cat', { ncol: 3, scales: 'free_y' })}
  labs={{ title: 'Faceted by Category' }}
  width={70}
  height={18}
/>
*/`)
console.log('')

// ============================================================
// Summary
// ============================================================

console.log('='.repeat(70))
console.log('                      OpenTUI Integration Summary')
console.log('='.repeat(70))
console.log('')
console.log('Components & Hooks exported from @ggterm/opentui:')
console.log('')
console.log('  <GGTerm>             - Main plot component')
console.log('    Props: data, aes, geoms, scales, facet, labs, theme')
console.log('           width, height, interactive')
console.log('           onHover, onClick, onKeyDown, onRender')
console.log('')
console.log('  useGGTerm()          - Plot state management hook')
console.log('    Returns: rendered, setData, pushData, clearData')
console.log('             isRendering, renderCount, refresh, setOptions')
console.log('')
console.log('  usePlotData()        - Data management with windowing')
console.log('    Returns: data, count, setData, pushData, clearData')
console.log('             getStats, filter, map, isDirty, markClean')
console.log('')
console.log('  usePlotInteraction() - Selection, zoom, pan, brush')
console.log('    Returns: state (hover, selection, viewport, brush)')
console.log('             handleHover, handleSelect, toggleSelection')
console.log('             zoomIn, zoomOut, pan, resetZoom')
console.log('             startBrush, updateBrush, endBrush')
console.log('')
console.log('='.repeat(70))

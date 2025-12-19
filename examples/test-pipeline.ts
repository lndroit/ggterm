/**
 * Pipeline test - Verify rendering works
 *
 * This test creates a simple plot and outputs it to verify
 * the rendering pipeline is working correctly.
 *
 * Run with: bun examples/test-pipeline.ts
 */

// Direct imports for testing (bypassing package system)
import { gg } from '../packages/core/src/grammar'
import { geom_point, geom_line, geom_hline } from '../packages/core/src/geoms'

// Test 1: Simple scatter plot
console.log('=== Test 1: Simple Scatter Plot ===\n')

const scatterData = [
  { x: 1, y: 1 },
  { x: 2, y: 4 },
  { x: 3, y: 2 },
  { x: 4, y: 5 },
  { x: 5, y: 3 },
  { x: 6, y: 6 },
  { x: 7, y: 4 },
  { x: 8, y: 7 },
]

const scatter = gg(scatterData)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .labs({ title: 'Simple Scatter', x: 'X', y: 'Y' })

console.log(scatter.render({ width: 50, height: 15 }))
console.log('\n')

// Test 2: Scatter with color grouping
console.log('=== Test 2: Grouped Scatter Plot ===\n')

const groupedData = [
  { x: 1, y: 2, cat: 'A' },
  { x: 2, y: 3, cat: 'A' },
  { x: 3, y: 2.5, cat: 'A' },
  { x: 1.5, y: 5, cat: 'B' },
  { x: 2.5, y: 6, cat: 'B' },
  { x: 3.5, y: 5.5, cat: 'B' },
  { x: 2, y: 8, cat: 'C' },
  { x: 3, y: 9, cat: 'C' },
  { x: 4, y: 8.5, cat: 'C' },
]

const grouped = gg(groupedData)
  .aes({ x: 'x', y: 'y', color: 'cat' })
  .geom(geom_point())
  .labs({ title: 'Grouped by Category', x: 'X Axis', y: 'Y Axis', color: 'Category' })

console.log(grouped.render({ width: 60, height: 18 }))
console.log('\n')

// Test 3: Line plot
console.log('=== Test 3: Line Plot ===\n')

const lineData = [
  { time: 0, value: 10 },
  { time: 1, value: 15 },
  { time: 2, value: 12 },
  { time: 3, value: 18 },
  { time: 4, value: 20 },
  { time: 5, value: 17 },
  { time: 6, value: 22 },
  { time: 7, value: 25 },
]

const linePlot = gg(lineData)
  .aes({ x: 'time', y: 'value' })
  .geom(geom_line())
  .geom(geom_point())
  .labs({ title: 'Time Series', x: 'Time', y: 'Value' })

console.log(linePlot.render({ width: 50, height: 15 }))
console.log('\n')

// Test 4: With reference line
console.log('=== Test 4: Plot with Reference Line ===\n')

const refData = [
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 4 },
  { x: 4, y: 6 },
  { x: 5, y: 8 },
]

const refPlot = gg(refData)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_hline({ yintercept: 5 }))
  .geom(geom_point())
  .labs({ title: 'With Reference Line', x: 'X', y: 'Y' })

console.log(refPlot.render({ width: 50, height: 15 }))
console.log('\n')

console.log('=== All tests completed ===')

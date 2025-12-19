/**
 * Basic ggterm example - Scatter plot
 *
 * Run with: bun examples/basic.ts
 */

import { gg, geom_point } from '@ggterm/core'

// Sample data
const data = [
  { x: 1, y: 2, group: 'A' },
  { x: 2, y: 4, group: 'A' },
  { x: 3, y: 3, group: 'A' },
  { x: 4, y: 7, group: 'B' },
  { x: 5, y: 5, group: 'B' },
  { x: 6, y: 8, group: 'B' },
  { x: 7, y: 6, group: 'C' },
  { x: 8, y: 9, group: 'C' },
  { x: 9, y: 7, group: 'C' },
]

// Create and render plot
const plot = gg(data)
  .aes({ x: 'x', y: 'y', color: 'group' })
  .geom(geom_point())
  .labs({
    title: 'Sample Scatter Plot',
    x: 'X Value',
    y: 'Y Value',
    color: 'Group',
  })

// Render to terminal
const output = plot.render({ width: 60, height: 20 })
console.log(output)

#!/usr/bin/env npx tsx
/**
 * Extended Grammar Demo (Phase 7)
 *
 * Showcases advanced ggterm features:
 * - Heatmaps with geom_tile
 * - Error bars with geom_errorbar
 * - Annotations for adding context
 * - Advanced scales (size, shape, alpha, datetime)
 *
 * Run with: npx tsx examples/extended-grammar-demo.ts
 */

import { gg } from '../packages/core/src/grammar'
import {
  geom_tile,
  geom_point,
  geom_errorbar,
  geom_line,
  geom_rect,
  geom_text,
} from '../packages/core/src/geoms'
import {
  annotate,
  annotate_text,
  annotate_rect,
  annotate_hline,
} from '../packages/core/src/annotations'
import {
  scale_color_viridis,
  scale_size_continuous,
  scale_alpha_continuous,
} from '../packages/core/src/scales'

const WIDTH = 70
const HEIGHT = 20

function clearScreen() {
  process.stdout.write('\x1b[H\x1b[J')
}

// Demo 1: Heatmap with geom_tile
function demo_heatmap() {
  console.log('\n=== Demo 1: Heatmap with geom_tile ===\n')

  // Generate correlation-like heatmap data
  const variables = ['A', 'B', 'C', 'D', 'E']
  const data: Array<{ x: number; y: number; value: number }> = []

  for (let i = 0; i < variables.length; i++) {
    for (let j = 0; j < variables.length; j++) {
      // Simulate correlation matrix
      let value: number
      if (i === j) {
        value = 1.0 // Diagonal = perfect correlation
      } else {
        value = Math.cos((i - j) * 0.5) * 0.8 + (Math.random() - 0.5) * 0.2
      }
      data.push({ x: i, y: j, value })
    }
  }

  const plot = gg(data)
    .aes({ x: 'x', y: 'y', fill: 'value' })
    .geom(geom_tile({ width: 1, height: 1, alpha: 0.9 }))
    .scale(scale_color_viridis())
    .labs({
      title: 'Correlation Heatmap',
      x: 'Variable',
      y: 'Variable',
    })

  console.log(plot.render({ width: WIDTH, height: HEIGHT }))
}

// Demo 2: Error bars
function demo_errorbars() {
  console.log('\n=== Demo 2: Error Bars ===\n')

  // Experimental data with error margins
  const data = [
    { group: 'Control', mean: 10, ymin: 8, ymax: 12 },
    { group: 'Low', mean: 15, ymin: 12, ymax: 18 },
    { group: 'Medium', mean: 25, ymin: 20, ymax: 30 },
    { group: 'High', mean: 35, ymin: 28, ymax: 42 },
  ].map((d, i) => ({ ...d, x: i }))

  const plot = gg(data)
    .aes({ x: 'x', y: 'mean', ymin: 'ymin', ymax: 'ymax' })
    .geom(geom_point({ size: 2 }))
    .geom(geom_errorbar({ width: 0.3 }))
    .labs({
      title: 'Treatment Effects with Error Bars',
      x: 'Treatment Group',
      y: 'Response',
    })

  console.log(plot.render({ width: WIDTH, height: HEIGHT }))
}

// Demo 3: Annotations
function demo_annotations() {
  console.log('\n=== Demo 3: Annotations ===\n')

  // Time series with annotated regions
  const data: Array<{ time: number; value: number }> = []
  for (let i = 0; i < 50; i++) {
    const value = 50 + Math.sin(i * 0.2) * 20 + (Math.random() - 0.5) * 10
    data.push({ time: i, value })
  }

  const plot = gg(data)
    .aes({ x: 'time', y: 'value' })
    .geom(geom_line())
    // Add annotations
    .geom(annotate('hline', { y: 60, color: 'red', linetype: 'dashed' }))
    .geom(annotate('hline', { y: 40, color: 'green', linetype: 'dashed' }))
    .geom(annotate_text(45, 65, 'Upper limit'))
    .geom(annotate_text(45, 35, 'Lower limit'))
    // Highlight a region
    .geom(annotate_rect(15, 25, 30, 70, { fill: 'yellow', alpha: 0.2 }))
    .labs({
      title: 'Time Series with Annotations',
      x: 'Time',
      y: 'Value',
    })

  console.log(plot.render({ width: WIDTH, height: HEIGHT }))
}

// Demo 4: Multi-aesthetic scales
function demo_scales() {
  console.log('\n=== Demo 4: Size and Alpha Scales ===\n')

  // Scatter plot with size and alpha mapped to data
  const data: Array<{ x: number; y: number; size: number; importance: number }> = []
  for (let i = 0; i < 30; i++) {
    data.push({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 50 + 10,
      importance: Math.random(),
    })
  }

  const plot = gg(data)
    .aes({ x: 'x', y: 'y', size: 'size', alpha: 'importance' })
    .geom(geom_point())
    .scale(scale_size_continuous({ range: [1, 4] }))
    .scale(scale_alpha_continuous({ range: [0.3, 1.0] }))
    .labs({
      title: 'Bubble Chart with Size and Alpha',
      x: 'X Position',
      y: 'Y Position',
    })

  console.log(plot.render({ width: WIDTH, height: HEIGHT }))
}

// Demo 5: Violin-style visualization (using area/density)
function demo_violin_like() {
  console.log('\n=== Demo 5: Distribution Comparison ===\n')

  // Generate grouped distribution data
  const data: Array<{ group: string; x: number; value: number }> = []

  // Group A - normal distribution centered at 50
  for (let i = 0; i < 100; i++) {
    const x = 30 + Math.random() * 40
    const density = Math.exp(-Math.pow(x - 50, 2) / 200)
    data.push({ group: 'A', x: 0.5, value: x })
  }

  // Group B - normal distribution centered at 60
  for (let i = 0; i < 100; i++) {
    const x = 35 + Math.random() * 50
    const density = Math.exp(-Math.pow(x - 60, 2) / 200)
    data.push({ group: 'B', x: 1.5, value: x })
  }

  // Show as points with jitter
  const jitteredData = data.map(d => ({
    ...d,
    x: d.x + (Math.random() - 0.5) * 0.3,
  }))

  const plot = gg(jitteredData)
    .aes({ x: 'x', y: 'value', color: 'group' })
    .geom(geom_point({ size: 1, alpha: 0.5 }))
    .labs({
      title: 'Distribution Comparison (Jittered Points)',
      x: 'Group',
      y: 'Value',
    })

  console.log(plot.render({ width: WIDTH, height: HEIGHT }))
}

// Run all demos
async function main() {
  clearScreen()
  console.log('╔═══════════════════════════════════════════════════════════════════╗')
  console.log('║       GGTERM Extended Grammar Demo (Phase 7)                      ║')
  console.log('╚═══════════════════════════════════════════════════════════════════╝')

  demo_heatmap()
  await sleep(500)

  demo_errorbars()
  await sleep(500)

  demo_annotations()
  await sleep(500)

  demo_scales()
  await sleep(500)

  demo_violin_like()

  console.log('\n=== Phase 7 Extended Grammar Demo Complete ===\n')
  console.log('Features demonstrated:')
  console.log('  - geom_tile() for heatmaps')
  console.log('  - geom_errorbar() for uncertainty visualization')
  console.log('  - annotate() for adding context')
  console.log('  - scale_size_continuous() for size mapping')
  console.log('  - scale_alpha_continuous() for transparency mapping')
  console.log('  - scale_color_viridis() for color gradients')
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

main().catch(console.error)

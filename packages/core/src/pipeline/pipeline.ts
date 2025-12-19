/**
 * Main rendering pipeline
 *
 * Orchestrates the full flow from PlotSpec to rendered output.
 */

import type { PlotSpec, RenderOptions } from '../types'
import { TerminalCanvas, createCanvas } from '../canvas/canvas'
import { buildScaleContext } from './scales'
import { renderGeom } from './render-geoms'
import { renderAxes, renderTitle, renderLegend, renderGridLines } from './render-axes'

/**
 * Layout configuration for plot elements
 */
export interface PlotLayout {
  width: number
  height: number
  margins: {
    top: number
    right: number
    bottom: number
    left: number
  }
  plotArea: {
    x: number
    y: number
    width: number
    height: number
  }
  legendArea?: {
    x: number
    y: number
    width: number
    height: number
  }
}

/**
 * Calculate layout based on render options and content
 */
export function calculateLayout(
  spec: PlotSpec,
  options: RenderOptions
): PlotLayout {
  const { width, height } = options

  // Determine margins based on content
  const hasTitle = !!spec.labels.title
  const hasXLabel = !!spec.labels.x
  const hasYLabel = !!spec.labels.y
  const hasLegend =
    spec.theme.legend.position !== 'none' && !!spec.aes.color

  // Calculate margins
  const margins = {
    top: hasTitle ? 2 : 1,
    right: hasLegend && spec.theme.legend.position === 'right' ? 15 : 1,
    bottom: 2 + (hasXLabel ? 1 : 0),
    left: 8 + (hasYLabel ? 2 : 0),
  }

  // Calculate plot area
  const plotArea = {
    x: margins.left,
    y: margins.top,
    width: width - margins.left - margins.right,
    height: height - margins.top - margins.bottom,
  }

  // Ensure minimum plot area
  plotArea.width = Math.max(10, plotArea.width)
  plotArea.height = Math.max(5, plotArea.height)

  const layout: PlotLayout = { width, height, margins, plotArea }

  // Legend area
  if (hasLegend && spec.theme.legend.position === 'right') {
    layout.legendArea = {
      x: width - margins.right + 1,
      y: margins.top,
      width: margins.right - 1,
      height: plotArea.height,
    }
  }

  return layout
}

/**
 * Render a plot specification to a canvas
 */
export function renderToCanvas(
  spec: PlotSpec,
  options: RenderOptions
): TerminalCanvas {
  // Calculate layout
  const layout = calculateLayout(spec, options)

  // Create canvas
  const canvas = createCanvas(layout.width, layout.height)

  // Build scale context
  const scales = buildScaleContext(
    spec.data,
    spec.aes,
    layout.plotArea,
    spec.scales
  )

  // Render title if present
  if (spec.labels.title) {
    renderTitle(canvas, spec.labels.title, layout.width, spec.theme)
  }

  // Render grid lines (behind data)
  renderGridLines(canvas, scales, layout.plotArea, spec.theme)

  // Render axes
  renderAxes(canvas, scales, layout.plotArea, spec.labels, spec.theme)

  // Render each geometry layer
  for (const geom of spec.geoms) {
    renderGeom(spec.data, geom, spec.aes, scales, canvas)
  }

  // Render legend if needed
  if (layout.legendArea && scales.color) {
    const colorDomain = scales.color.domain as string[]
    renderLegend(
      canvas,
      colorDomain,
      (v) => scales.color!.map(v),
      layout.legendArea.x,
      layout.legendArea.y,
      spec.labels.color,
      spec.theme
    )
  }

  return canvas
}

/**
 * Render a plot specification to a string
 */
export function renderToString(
  spec: PlotSpec,
  options: RenderOptions
): string {
  const canvas = renderToCanvas(spec, options)

  // Use ANSI colors if not explicitly disabled
  if (options.colorMode === 'none') {
    return canvas.toString()
  }

  return canvas.toAnsiString()
}

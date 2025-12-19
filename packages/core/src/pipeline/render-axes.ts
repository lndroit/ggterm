/**
 * Axis rendering for plots
 */

import type { TerminalCanvas } from '../canvas/canvas'
import type { Labels, RGBA, Theme } from '../types'
import type { ResolvedScale } from './scales'

/**
 * Axis configuration
 */
export interface AxisConfig {
  scale: ResolvedScale
  position: 'bottom' | 'left' | 'top' | 'right'
  label?: string
  theme: Theme
}

/**
 * Calculate nice tick values for a continuous scale
 */
export function calculateTicks(
  domain: [number, number],
  maxTicks: number = 5
): number[] {
  const [min, max] = domain
  const range = max - min

  // Calculate a nice step size
  const rawStep = range / maxTicks
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))
  const normalized = rawStep / magnitude

  let niceStep: number
  if (normalized <= 1) niceStep = 1
  else if (normalized <= 2) niceStep = 2
  else if (normalized <= 5) niceStep = 5
  else niceStep = 10

  niceStep *= magnitude

  // Generate ticks
  const ticks: number[] = []
  const start = Math.ceil(min / niceStep) * niceStep
  for (let tick = start; tick <= max; tick += niceStep) {
    ticks.push(tick)
  }

  return ticks
}

/**
 * Format a tick value for display
 */
export function formatTick(value: number): string {
  // Handle very small or very large numbers with scientific notation
  if (Math.abs(value) >= 1e6 || (Math.abs(value) < 1e-3 && value !== 0)) {
    return value.toExponential(1)
  }

  // Round to avoid floating point artifacts
  const rounded = Math.round(value * 1e10) / 1e10

  // Remove unnecessary decimal places
  if (Number.isInteger(rounded)) {
    return String(rounded)
  }

  // Limit decimal places
  const str = rounded.toFixed(2)
  return str.replace(/\.?0+$/, '')
}

/**
 * Render bottom (x) axis
 */
export function renderBottomAxis(
  canvas: TerminalCanvas,
  scale: ResolvedScale,
  y: number,
  xStart: number,
  xEnd: number,
  label: string | undefined,
  _theme: Theme
): void {
  const axisColor: RGBA = { r: 180, g: 180, b: 180, a: 1 }

  // Draw axis line
  canvas.drawHLine(xStart, y, xEnd - xStart + 1, '─', axisColor)

  // Calculate and draw ticks
  if (scale.type === 'continuous') {
    const domain = scale.domain as [number, number]
    const ticks = calculateTicks(domain, Math.min(8, Math.floor((xEnd - xStart) / 10)))

    for (const tickValue of ticks) {
      const x = Math.round(scale.toCanvas(scale.normalize(tickValue)))
      if (x >= xStart && x <= xEnd) {
        // Tick mark
        canvas.drawChar(x, y, '┬', axisColor)

        // Tick label
        const tickLabel = formatTick(tickValue)
        const labelX = x - Math.floor(tickLabel.length / 2)
        canvas.drawString(Math.max(xStart, labelX), y + 1, tickLabel, axisColor)
      }
    }
  }

  // Draw axis label
  if (label) {
    const labelX = xStart + Math.floor((xEnd - xStart - label.length) / 2)
    canvas.drawString(labelX, y + 2, label, axisColor)
  }
}

/**
 * Render left (y) axis
 */
export function renderLeftAxis(
  canvas: TerminalCanvas,
  scale: ResolvedScale,
  x: number,
  yStart: number,
  yEnd: number,
  label: string | undefined,
  _theme: Theme
): void {
  const axisColor: RGBA = { r: 180, g: 180, b: 180, a: 1 }

  // Draw axis line (vertical)
  const top = Math.min(yStart, yEnd)
  const bottom = Math.max(yStart, yEnd)
  canvas.drawVLine(x, top, bottom - top + 1, '│', axisColor)

  // Calculate and draw ticks
  if (scale.type === 'continuous') {
    const domain = scale.domain as [number, number]
    const ticks = calculateTicks(domain, Math.min(6, Math.floor((bottom - top) / 3)))

    for (const tickValue of ticks) {
      const y = Math.round(scale.toCanvas(scale.normalize(tickValue)))
      if (y >= top && y <= bottom) {
        // Tick mark
        canvas.drawChar(x, y, '┤', axisColor)

        // Tick label (right-aligned to the left of the axis)
        const tickLabel = formatTick(tickValue)
        const labelX = x - tickLabel.length - 1
        canvas.drawString(Math.max(0, labelX), y, tickLabel, axisColor)
      }
    }
  }

  // Draw axis label (rotated/vertical would be ideal, but we'll put it at the top)
  if (label) {
    // Draw label vertically by writing each character
    const startY = top + Math.floor((bottom - top - label.length) / 2)
    for (let i = 0; i < label.length; i++) {
      canvas.drawChar(0, startY + i, label[i], axisColor)
    }
  }
}

/**
 * Render all axes for a plot
 */
export function renderAxes(
  canvas: TerminalCanvas,
  scales: { x: ResolvedScale; y: ResolvedScale },
  plotArea: { x: number; y: number; width: number; height: number },
  labels: Labels,
  theme: Theme
): void {
  // Bottom axis (x)
  renderBottomAxis(
    canvas,
    scales.x,
    plotArea.y + plotArea.height,
    plotArea.x,
    plotArea.x + plotArea.width - 1,
    labels.x,
    theme
  )

  // Left axis (y)
  renderLeftAxis(
    canvas,
    scales.y,
    plotArea.x - 1,
    plotArea.y,
    plotArea.y + plotArea.height - 1,
    labels.y,
    theme
  )

  // Draw corner
  canvas.drawChar(plotArea.x - 1, plotArea.y + plotArea.height, '└', {
    r: 180,
    g: 180,
    b: 180,
    a: 1,
  })
}

/**
 * Render plot title
 */
export function renderTitle(
  canvas: TerminalCanvas,
  title: string,
  width: number,
  theme: Theme
): void {
  const titleColor: RGBA = { r: 255, g: 255, b: 255, a: 1 }

  let x: number
  switch (theme.title.align) {
    case 'left':
      x = 1
      break
    case 'right':
      x = width - title.length - 1
      break
    case 'center':
    default:
      x = Math.floor((width - title.length) / 2)
  }

  canvas.drawString(x, 0, title, titleColor)
}

/**
 * Render legend for color aesthetic
 */
export function renderLegend(
  canvas: TerminalCanvas,
  colorDomain: string[],
  colorMap: (value: string) => RGBA,
  x: number,
  y: number,
  title: string | undefined,
  theme: Theme
): void {
  if (theme.legend.position === 'none') return

  const legendColor: RGBA = { r: 180, g: 180, b: 180, a: 1 }

  let currentY = y

  // Legend title
  if (title) {
    canvas.drawString(x, currentY, title, legendColor)
    currentY++
  }

  // Legend items
  for (const value of colorDomain) {
    const color = colorMap(value)
    canvas.drawChar(x, currentY, '●', color)
    canvas.drawString(x + 2, currentY, value.substring(0, 12), legendColor)
    currentY++
  }
}

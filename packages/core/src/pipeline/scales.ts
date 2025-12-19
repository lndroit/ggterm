/**
 * Scale utilities for the rendering pipeline
 *
 * Handles domain inference, normalization, and mapping to canvas coordinates.
 */

import type {
  AestheticMapping,
  DataSource,
  RGBA,
  Scale,
} from '../types'

/**
 * Infer the domain (min/max) for a continuous aesthetic from data
 */
export function inferContinuousDomain(
  data: DataSource,
  field: string
): [number, number] {
  let min = Infinity
  let max = -Infinity

  for (const row of data) {
    const value = row[field]
    if (typeof value === 'number' && !isNaN(value)) {
      if (value < min) min = value
      if (value > max) max = value
    }
  }

  // Handle edge cases
  if (min === Infinity) min = 0
  if (max === -Infinity) max = 1
  if (min === max) {
    // Add some padding if all values are the same
    min = min - 1
    max = max + 1
  }

  return [min, max]
}

/**
 * Infer discrete domain (unique values) for a categorical aesthetic
 */
export function inferDiscreteDomain(data: DataSource, field: string): string[] {
  const seen = new Set<string>()

  for (const row of data) {
    const value = row[field]
    if (value !== null && value !== undefined) {
      seen.add(String(value))
    }
  }

  return Array.from(seen).sort()
}

/**
 * Expand domain by a percentage (adds padding)
 */
export function expandDomain(
  domain: [number, number],
  expand: number = 0.05
): [number, number] {
  const range = domain[1] - domain[0]
  const padding = range * expand
  return [domain[0] - padding, domain[1] + padding]
}

/**
 * Resolved scale with concrete domain and mapping functions
 */
export interface ResolvedScale {
  aesthetic: string
  type: 'continuous' | 'discrete'
  domain: [number, number] | string[]
  range: [number, number]

  /** Map data value to normalized 0-1 position */
  normalize(value: unknown): number

  /** Map normalized position to canvas coordinate */
  toCanvas(normalized: number): number

  /** Convenience: map data value directly to canvas coordinate */
  map(value: unknown): number
}

/**
 * Create a resolved continuous scale
 */
export function createResolvedContinuousScale(
  aesthetic: string,
  domain: [number, number],
  range: [number, number],
  transform: (v: number) => number = (v) => v
): ResolvedScale {
  const [domainMin, domainMax] = domain
  const [rangeMin, rangeMax] = range
  const rangeSpan = rangeMax - rangeMin

  return {
    aesthetic,
    type: 'continuous',
    domain,
    range,

    normalize(value: unknown): number {
      const num = Number(value)
      if (isNaN(num)) return 0
      const transformed = transform(num)
      const transformedMin = transform(domainMin)
      const transformedMax = transform(domainMax)
      return (transformed - transformedMin) / (transformedMax - transformedMin)
    },

    toCanvas(normalized: number): number {
      return rangeMin + normalized * rangeSpan
    },

    map(value: unknown): number {
      return this.toCanvas(this.normalize(value))
    },
  }
}

/**
 * Create a resolved discrete scale
 */
export function createResolvedDiscreteScale(
  aesthetic: string,
  domain: string[],
  range: [number, number]
): ResolvedScale {
  const [rangeMin, rangeMax] = range
  const rangeSpan = rangeMax - rangeMin

  return {
    aesthetic,
    type: 'discrete',
    domain,
    range,

    normalize(value: unknown): number {
      const str = String(value)
      const index = domain.indexOf(str)
      if (index < 0) return 0
      return domain.length > 1 ? index / (domain.length - 1) : 0.5
    },

    toCanvas(normalized: number): number {
      return rangeMin + normalized * rangeSpan
    },

    map(value: unknown): number {
      return this.toCanvas(this.normalize(value))
    },
  }
}

/**
 * Scale context holding all resolved scales for a plot
 */
export interface ScaleContext {
  x: ResolvedScale
  y: ResolvedScale
  color?: ResolvedColorScale
  size?: ResolvedSizeScale
}

/**
 * Resolved color scale
 */
export interface ResolvedColorScale {
  aesthetic: string
  type: 'continuous' | 'discrete'
  domain: [number, number] | string[]
  map(value: unknown): RGBA
}

/**
 * Default color palette for discrete values
 */
const CATEGORY_COLORS: RGBA[] = [
  { r: 31, g: 119, b: 180, a: 1 },   // blue
  { r: 255, g: 127, b: 14, a: 1 },   // orange
  { r: 44, g: 160, b: 44, a: 1 },    // green
  { r: 214, g: 39, b: 40, a: 1 },    // red
  { r: 148, g: 103, b: 189, a: 1 },  // purple
  { r: 140, g: 86, b: 75, a: 1 },    // brown
  { r: 227, g: 119, b: 194, a: 1 },  // pink
  { r: 127, g: 127, b: 127, a: 1 },  // gray
  { r: 188, g: 189, b: 34, a: 1 },   // olive
  { r: 23, g: 190, b: 207, a: 1 },   // cyan
]

/**
 * Default color for points (when no color aesthetic)
 */
export const DEFAULT_POINT_COLOR: RGBA = { r: 79, g: 169, b: 238, a: 1 }

/**
 * Interpolate between two colors
 */
function interpolateColor(color1: RGBA, color2: RGBA, t: number): RGBA {
  return {
    r: Math.round(color1.r + (color2.r - color1.r) * t),
    g: Math.round(color1.g + (color2.g - color1.g) * t),
    b: Math.round(color1.b + (color2.b - color1.b) * t),
    a: color1.a + (color2.a - color1.a) * t,
  }
}

/**
 * Create a resolved discrete color scale
 */
export function createResolvedDiscreteColorScale(
  domain: string[],
  palette: RGBA[] = CATEGORY_COLORS
): ResolvedColorScale {
  return {
    aesthetic: 'color',
    type: 'discrete',
    domain,
    map(value: unknown): RGBA {
      const str = String(value)
      const index = domain.indexOf(str)
      if (index < 0) return palette[0]
      return palette[index % palette.length]
    },
  }
}

/**
 * Create a resolved continuous color scale (blue to red gradient)
 */
export function createResolvedContinuousColorScale(
  domain: [number, number],
  lowColor: RGBA = { r: 68, g: 1, b: 84, a: 1 },   // viridis low
  highColor: RGBA = { r: 253, g: 231, b: 37, a: 1 } // viridis high
): ResolvedColorScale {
  const [min, max] = domain
  const span = max - min

  return {
    aesthetic: 'color',
    type: 'continuous',
    domain,
    map(value: unknown): RGBA {
      const num = Number(value)
      if (isNaN(num)) return lowColor
      const t = Math.max(0, Math.min(1, (num - min) / span))
      return interpolateColor(lowColor, highColor, t)
    },
  }
}

/**
 * Check if data field contains categorical (non-numeric) values
 */
function isCategoricalField(data: DataSource, field: string): boolean {
  for (const row of data) {
    const value = row[field]
    if (value !== null && value !== undefined) {
      if (typeof value === 'string' && isNaN(Number(value))) {
        return true
      }
    }
  }
  return false
}

/**
 * Resolved size scale - maps values to size indices (0-3)
 */
export interface ResolvedSizeScale {
  aesthetic: string
  type: 'continuous'
  domain: [number, number]
  map(value: unknown): number  // Returns 0-3 size index
}

/**
 * Create a resolved continuous size scale
 */
export function createResolvedSizeScale(
  domain: [number, number]
): ResolvedSizeScale {
  const [min, max] = domain
  const span = max - min

  return {
    aesthetic: 'size',
    type: 'continuous',
    domain,
    map(value: unknown): number {
      const num = Number(value)
      if (isNaN(num)) return 1  // Default to medium size
      // Map to 0-3 size index
      const t = Math.max(0, Math.min(1, (num - min) / span))
      return Math.floor(t * 3.99)  // 0, 1, 2, or 3
    },
  }
}

/**
 * Build scale context from data and aesthetic mapping
 */
export function buildScaleContext(
  data: DataSource,
  aes: AestheticMapping,
  plotArea: { x: number; y: number; width: number; height: number },
  userScales: Scale[] = []
): ScaleContext {
  // Find user-provided scales
  const userXScale = userScales.find((s) => s.aesthetic === 'x')
  const userYScale = userScales.find((s) => s.aesthetic === 'y')
  // TODO: Support user-provided color scales
  // const userColorScale = userScales.find(
  //   (s) => s.aesthetic === 'color' || s.aesthetic === 'fill'
  // )

  // Determine if x is categorical or continuous
  const xIsCategorical = isCategoricalField(data, aes.x)

  // Create x scale
  let x: ResolvedScale
  if (xIsCategorical) {
    const xDomain = inferDiscreteDomain(data, aes.x)
    x = createResolvedDiscreteScale(
      'x',
      xDomain,
      [plotArea.x, plotArea.x + plotArea.width - 1]
    )
  } else {
    const xDomain = userXScale?.domain as [number, number] | undefined ??
      expandDomain(inferContinuousDomain(data, aes.x))
    x = createResolvedContinuousScale(
      'x',
      xDomain,
      [plotArea.x, plotArea.x + plotArea.width - 1]
    )
  }

  // Infer y domain (always continuous for now)
  const yDomain = userYScale?.domain as [number, number] | undefined ??
    expandDomain(inferContinuousDomain(data, aes.y))

  // Create y scale (maps to vertical canvas range, inverted because y=0 is top)
  const y = createResolvedContinuousScale(
    'y',
    yDomain,
    [plotArea.y + plotArea.height - 1, plotArea.y] // Inverted!
  )

  const context: ScaleContext = { x, y }

  // Handle color aesthetic if present
  if (aes.color) {
    const colorDomain = inferDiscreteDomain(data, aes.color)
    context.color = createResolvedDiscreteColorScale(colorDomain)
  }

  // Handle size aesthetic if present
  if (aes.size) {
    const sizeDomain = inferContinuousDomain(data, aes.size)
    context.size = createResolvedSizeScale(sizeDomain)
  }

  return context
}

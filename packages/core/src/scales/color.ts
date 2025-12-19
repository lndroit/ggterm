/**
 * Color scales
 */

import type { Scale, RGBA } from '../types'

// Color palette definitions
const PALETTES = {
  // Viridis family
  viridis: ['#440154', '#414487', '#2a788e', '#22a884', '#7ad151', '#fde725'],
  plasma: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636', '#f0f921'],
  inferno: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a', '#fcffa4'],
  magma: ['#000004', '#3b0f70', '#8c2981', '#de4968', '#fe9f6d', '#fcfdbf'],

  // Categorical
  category10: [
    '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
    '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf',
  ],
  Set1: ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf'],
  Set2: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
  Dark2: ['#1b9e77', '#d95f02', '#7570b3', '#e7298a', '#66a61e', '#e6ab02', '#a6761d', '#666666'],

  // Diverging
  RdBu: ['#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7', '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061'],
  BrBG: ['#543005', '#8c510a', '#bf812d', '#dfc27d', '#f6e8c3', '#c7eae5', '#80cdc1', '#35978f', '#01665e', '#003c30'],
}

/**
 * Parse hex color to RGBA
 */
function hexToRgba(hex: string): RGBA {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 0, g: 0, b: 0, a: 1 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    a: 1,
  }
}

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

export interface ColorContinuousOptions {
  palette?: keyof typeof PALETTES | string[]
  limits?: [number, number]
  na_value?: string
}

/**
 * Continuous color scale
 */
export function scale_color_continuous(
  options: ColorContinuousOptions = {}
): Scale {
  const paletteColors = Array.isArray(options.palette)
    ? options.palette
    : PALETTES[options.palette ?? 'viridis']

  const colors = paletteColors.map(hexToRgba)

  return {
    type: 'continuous',
    aesthetic: 'color',
    domain: options.limits,
    map(value: unknown): RGBA {
      const num = Number(value)
      if (isNaN(num)) return hexToRgba(options.na_value ?? '#808080')

      // Normalize to 0-1 range (actual normalization happens during rendering)
      const t = Math.max(0, Math.min(1, num))

      // Find the two colors to interpolate between
      const segmentLength = 1 / (colors.length - 1)
      const segmentIndex = Math.min(
        Math.floor(t / segmentLength),
        colors.length - 2
      )
      const segmentT = (t - segmentIndex * segmentLength) / segmentLength

      return interpolateColor(colors[segmentIndex], colors[segmentIndex + 1], segmentT)
    },
  }
}

/**
 * Viridis color scale
 */
export function scale_color_viridis(
  options: Omit<ColorContinuousOptions, 'palette'> = {}
): Scale {
  return scale_color_continuous({ ...options, palette: 'viridis' })
}

export interface ColorDiscreteOptions {
  palette?: keyof typeof PALETTES | string[]
  na_value?: string
}

/**
 * Discrete color scale
 */
export function scale_color_discrete(
  options: ColorDiscreteOptions = {}
): Scale {
  const paletteColors = Array.isArray(options.palette)
    ? options.palette
    : PALETTES[options.palette ?? 'category10']

  const valueToIndex = new Map<string, number>()

  return {
    type: 'discrete',
    aesthetic: 'color',
    map(value: unknown): RGBA {
      const key = String(value)

      if (!valueToIndex.has(key)) {
        valueToIndex.set(key, valueToIndex.size)
      }

      const index = valueToIndex.get(key)!
      const colorHex = paletteColors[index % paletteColors.length]
      return hexToRgba(colorHex)
    },
  }
}

export interface ColorManualOptions {
  values: Record<string, string>
  na_value?: string
}

/**
 * Manual color scale with explicit mappings
 */
export function scale_color_manual(options: ColorManualOptions): Scale {
  return {
    type: 'discrete',
    aesthetic: 'color',
    map(value: unknown): RGBA {
      const key = String(value)
      const colorHex = options.values[key] ?? options.na_value ?? '#808080'
      return hexToRgba(colorHex)
    },
  }
}

// Fill scale variants (same as color but for fill aesthetic)
export function scale_fill_continuous(options: ColorContinuousOptions = {}): Scale {
  const scale = scale_color_continuous(options)
  return { ...scale, aesthetic: 'fill' }
}

export function scale_fill_viridis(options: Omit<ColorContinuousOptions, 'palette'> = {}): Scale {
  const scale = scale_color_viridis(options)
  return { ...scale, aesthetic: 'fill' }
}

export function scale_fill_discrete(options: ColorDiscreteOptions = {}): Scale {
  const scale = scale_color_discrete(options)
  return { ...scale, aesthetic: 'fill' }
}

export function scale_fill_manual(options: ColorManualOptions): Scale {
  const scale = scale_color_manual(options)
  return { ...scale, aesthetic: 'fill' }
}

/**
 * stat_density - Kernel density estimation for smooth density plots
 */

import type { AestheticMapping, DataSource, Stat } from '../types'

export interface StatDensityParams {
  /** Bandwidth for kernel density estimation (default: auto via Silverman's rule) */
  bw?: number
  /** Kernel function: 'gaussian' | 'epanechnikov' | 'rectangular' (default: 'gaussian') */
  kernel?: 'gaussian' | 'epanechnikov' | 'rectangular'
  /** Number of points to evaluate density at (default: 512) */
  n?: number
  /** Adjustment factor for bandwidth (default: 1) */
  adjust?: number
}

/**
 * Gaussian kernel function
 */
function gaussianKernel(u: number): number {
  return Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI)
}

/**
 * Epanechnikov kernel function (parabolic)
 */
function epanechnikovKernel(u: number): number {
  return Math.abs(u) <= 1 ? 0.75 * (1 - u * u) : 0
}

/**
 * Rectangular (uniform) kernel function
 */
function rectangularKernel(u: number): number {
  return Math.abs(u) <= 1 ? 0.5 : 0
}

/**
 * Silverman's rule of thumb for bandwidth selection
 */
function silvermanBandwidth(values: number[]): number {
  const n = values.length
  if (n === 0) return 1

  // Calculate standard deviation
  const mean = values.reduce((a, b) => a + b, 0) / n
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n
  const std = Math.sqrt(variance)

  // Calculate IQR
  const sorted = [...values].sort((a, b) => a - b)
  const q1 = sorted[Math.floor(n * 0.25)]
  const q3 = sorted[Math.floor(n * 0.75)]
  const iqr = q3 - q1

  // Silverman's rule: h = 0.9 * min(std, IQR/1.34) * n^(-1/5)
  const spread = Math.min(std, iqr / 1.34)
  return 0.9 * spread * Math.pow(n, -0.2)
}

export interface DensityResult {
  x: number
  y: number  // density value
  density: number
  scaled: number  // scaled to max = 1
  count: number   // estimated count at this point
  [key: string]: unknown  // Index signature for DataRecord compatibility
}

/**
 * Compute kernel density estimation
 */
export function computeDensity(
  data: DataSource,
  field: string,
  params: StatDensityParams = {}
): DataSource {
  // Extract numeric values
  const values: number[] = []
  for (const row of data) {
    const val = row[field]
    if (typeof val === 'number' && !isNaN(val)) {
      values.push(val)
    }
  }

  if (values.length === 0) {
    return []
  }

  const n = values.length
  const nPoints = params.n ?? 512
  const adjust = params.adjust ?? 1

  // Calculate bandwidth
  let bw = params.bw
  if (!bw) {
    bw = silvermanBandwidth(values) * adjust
  }
  if (bw <= 0) bw = 1

  // Select kernel function
  let kernel: (u: number) => number
  switch (params.kernel) {
    case 'epanechnikov':
      kernel = epanechnikovKernel
      break
    case 'rectangular':
      kernel = rectangularKernel
      break
    case 'gaussian':
    default:
      kernel = gaussianKernel
  }

  // Determine evaluation range (extend beyond data range)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min
  const padding = range * 0.1 + 3 * bw  // Extend by 3 bandwidths
  const xMin = min - padding
  const xMax = max + padding
  const step = (xMax - xMin) / (nPoints - 1)

  // Compute density at each point
  const results: DensityResult[] = []
  let maxDensity = 0

  for (let i = 0; i < nPoints; i++) {
    const x = xMin + i * step

    // Kernel density estimate: f(x) = (1/nh) * sum(K((x - xi)/h))
    let density = 0
    for (const xi of values) {
      const u = (x - xi) / bw
      density += kernel(u)
    }
    density /= (n * bw)

    if (density > maxDensity) {
      maxDensity = density
    }

    results.push({
      x,
      y: density,
      density,
      scaled: 0,  // Will be filled in below
      count: density * n * step,  // Approximate count
    })
  }

  // Fill in scaled values
  for (const result of results) {
    result.scaled = maxDensity > 0 ? result.density / maxDensity : 0
  }

  return results as DataSource
}

/**
 * Create stat_density transformation
 */
export function stat_density(params: StatDensityParams = {}): Stat {
  return {
    type: 'density',
    compute(data: DataSource, aes: AestheticMapping): DataSource {
      // If there's a color/group aesthetic, compute density per group
      if (aes.color) {
        const groups = new Map<string, DataSource>()

        for (const row of data) {
          const group = String(row[aes.color] ?? 'default')
          if (!groups.has(group)) {
            groups.set(group, [])
          }
          groups.get(group)!.push(row)
        }

        const result: DataSource = []
        for (const [group, groupData] of groups) {
          const density = computeDensity(groupData, aes.x, params)
          for (const d of density) {
            result.push({
              ...d,
              [aes.color]: group,
            })
          }
        }
        return result
      }

      return computeDensity(data, aes.x, params)
    },
  }
}

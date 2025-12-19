/**
 * Discrete (categorical) scales
 */

import type { Scale } from '../types'

export interface DiscreteScaleOptions {
  limits?: string[]
  labels?: string[]
  drop?: boolean
}

/**
 * Create a discrete position scale
 */
function createDiscreteScale(
  aesthetic: string,
  options: DiscreteScaleOptions = {}
): Scale {
  const valueToPosition = new Map<string, number>()

  return {
    type: 'discrete',
    aesthetic,
    domain: options.limits,
    map(value: unknown): number {
      const key = String(value)

      if (options.limits) {
        const idx = options.limits.indexOf(key)
        return idx >= 0 ? idx : -1
      }

      if (!valueToPosition.has(key)) {
        valueToPosition.set(key, valueToPosition.size)
      }

      return valueToPosition.get(key)!
    },
    invert(position: number): string {
      if (options.limits) {
        return options.limits[Math.round(position)] ?? ''
      }

      for (const [key, pos] of valueToPosition) {
        if (pos === Math.round(position)) return key
      }
      return ''
    },
  }
}

/**
 * Discrete x-axis scale
 */
export function scale_x_discrete(options: DiscreteScaleOptions = {}): Scale {
  return createDiscreteScale('x', options)
}

/**
 * Discrete y-axis scale
 */
export function scale_y_discrete(options: DiscreteScaleOptions = {}): Scale {
  return createDiscreteScale('y', options)
}

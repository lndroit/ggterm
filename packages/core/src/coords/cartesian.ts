/**
 * Cartesian coordinate system
 */

import type { Coord } from '../types'

export interface CartesianOptions {
  xlim?: [number, number]
  ylim?: [number, number]
  clip?: boolean
}

/**
 * Standard Cartesian coordinates (x horizontal, y vertical)
 */
export function coordCartesian(_options: CartesianOptions = {}): Coord {
  // TODO: Implement xlim, ylim, clip options
  return {
    type: 'cartesian',
    transform(x: number, y: number) {
      // Cartesian is identity transform
      return { x, y }
    },
  }
}

/**
 * Flipped coordinates (x vertical, y horizontal)
 */
export function coordFlip(): Coord {
  return {
    type: 'flip',
    transform(x: number, y: number) {
      return { x: y, y: x }
    },
  }
}

/**
 * Polar coordinates
 */
export function coordPolar(options: { theta?: 'x' | 'y' } = {}): Coord {
  const theta = options.theta ?? 'x'

  return {
    type: 'polar',
    transform(x: number, y: number) {
      // Convert to polar coordinates
      const angle = theta === 'x' ? x : y
      const radius = theta === 'x' ? y : x

      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      }
    },
  }
}

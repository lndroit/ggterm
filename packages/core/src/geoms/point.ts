/**
 * geom_point - Scatter plot geometry
 */

import type { Geom } from '../types'

export interface PointOptions {
  size?: number
  shape?: 'circle' | 'square' | 'triangle' | 'cross' | 'diamond'
  alpha?: number
  color?: string
}

/**
 * Render data points as scatter plot markers
 */
export function geom_point(options: PointOptions = {}): Geom {
  return {
    type: 'point',
    stat: 'identity',
    position: 'identity',
    params: {
      size: options.size ?? 1,
      shape: options.shape ?? 'circle',
      alpha: options.alpha ?? 1,
      color: options.color,
    },
  }
}

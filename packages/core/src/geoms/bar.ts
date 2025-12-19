/**
 * geom_bar - Bar geometry
 */

import type { Geom } from '../types'

export interface BarOptions {
  stat?: 'count' | 'identity'
  width?: number
  position?: 'stack' | 'dodge' | 'fill'
  alpha?: number
  color?: string
  fill?: string
}

/**
 * Render vertical bars
 */
export function geom_bar(options: BarOptions = {}): Geom {
  return {
    type: 'bar',
    stat: options.stat ?? 'count',
    position: options.position ?? 'stack',
    params: {
      width: options.width ?? 0.9,
      alpha: options.alpha ?? 1,
      color: options.color,
      fill: options.fill,
    },
  }
}

/**
 * Render columns (alias for geom_bar with stat='identity')
 */
export function geom_col(options: Omit<BarOptions, 'stat'> = {}): Geom {
  return geom_bar({ ...options, stat: 'identity' })
}

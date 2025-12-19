/**
 * @ggterm/opentui - OpenTUI/React integration components
 *
 * Provides React components for embedding ggterm plots in OpenTUI applications.
 */

import type { ReactNode } from 'react'
import type {
  AestheticMapping,
  Coord,
  DataSource,
  Facet,
  Geom,
  Labels,
  Scale,
  Stat,
  Theme,
} from '@ggterm/core'

/**
 * GGTerm component props
 */
export interface GGTermProps {
  /** Data array */
  data: DataSource
  /** Aesthetic mappings */
  aes: AestheticMapping
  /** Geometry layers */
  geoms?: Geom[]
  /** Statistical transforms */
  stats?: Stat[]
  /** Scale definitions */
  scales?: Scale[]
  /** Coordinate system */
  coord?: Coord
  /** Faceting specification */
  facet?: Facet
  /** Theme object */
  theme?: Theme
  /** Labels (title, axes, etc.) */
  labs?: Labels
  /** Width in characters or percentage */
  width?: number | string
  /** Height in characters */
  height?: number
  /** Hover callback */
  onHover?: (point: Record<string, unknown> | null, position: { x: number; y: number }) => void
  /** Click callback */
  onClick?: (point: Record<string, unknown>) => void
  /** Key press callback */
  onKeyDown?: (key: string) => void
}

/**
 * GGTerm React component
 *
 * Renders a ggterm plot as an OpenTUI component.
 *
 * @example
 * ```tsx
 * <GGTerm
 *   data={data}
 *   aes={{ x: 'pc1', y: 'pc2', color: 'group' }}
 *   geoms={[geom_point()]}
 *   scales={[scale_color_viridis()]}
 *   theme={theme_dark()}
 *   width={80}
 *   height={24}
 * />
 * ```
 */
export function GGTerm(props: GGTermProps): ReactNode {
  // TODO: Implement actual React component
  // This is a placeholder that will integrate with OpenTUI

  const {
    data,
    aes,
    geoms = [],
    width = 80,
    height = 24,
    labs,
  } = props

  // Placeholder rendering
  const title = labs?.title ? `${labs.title}\n` : ''
  const content = `[ggterm plot: ${width}x${height}]\n` +
    `Data: ${data.length} rows\n` +
    `Mapping: x=${aes.x}, y=${aes.y}\n` +
    `Geoms: ${geoms.map(g => g.type).join(', ') || 'none'}`

  return `${title}${content}`
}

/**
 * useGGTerm hook for more control over plot lifecycle
 */
export interface UseGGTermOptions {
  aes: AestheticMapping
  geoms?: Geom[]
  stats?: Stat[]
  scales?: Scale[]
  coord?: Coord
  facet?: Facet
  theme?: Theme
  labs?: Labels
  width?: number
  height?: number
}

export interface UseGGTermResult {
  /** Rendered plot string */
  rendered: string
  /** Update data */
  setData: (data: DataSource) => void
  /** Push new data points */
  pushData: (data: DataSource | Record<string, unknown>) => void
  /** Update options */
  setOptions: (options: Partial<UseGGTermOptions>) => void
}

/**
 * Hook for managing ggterm plot state
 *
 * @example
 * ```tsx
 * function MyPlot({ data }) {
 *   const { rendered, setData } = useGGTerm({
 *     aes: { x: 'x', y: 'y' },
 *     geoms: [geom_point()]
 *   })
 *
 *   useEffect(() => {
 *     setData(data)
 *   }, [data])
 *
 *   return <text>{rendered}</text>
 * }
 * ```
 */
export function useGGTerm(_options: UseGGTermOptions): UseGGTermResult {
  // TODO: Implement actual hook with state management
  // This is a placeholder

  return {
    rendered: '[ggterm placeholder]',
    setData: () => {},
    pushData: () => {},
    setOptions: () => {},
  }
}

/**
 * usePlotData hook for reactive data binding
 */
export function usePlotData<T extends Record<string, unknown>>(
  initialData: T[]
): {
  data: T[]
  setData: (data: T[]) => void
  pushData: (data: T | T[]) => void
  clearData: () => void
} {
  // TODO: Implement with React state
  // This is a placeholder

  return {
    data: initialData,
    setData: () => {},
    pushData: () => {},
    clearData: () => {},
  }
}

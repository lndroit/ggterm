/**
 * GGTerm React component
 *
 * Main component for rendering ggterm plots in OpenTUI/React applications.
 */

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  gg,
  type AestheticMapping,
  type Coord,
  type DataSource,
  type DataRecord,
  type Facet,
  type Geom,
  type Labels,
  type Scale,
  type Theme,
} from '@ggterm/core'

/**
 * Point data returned in interaction callbacks
 */
export interface PlotPoint {
  /** Original data record */
  data: Record<string, unknown>
  /** X position in plot coordinates */
  x: number
  /** Y position in plot coordinates */
  y: number
  /** Index in the data array */
  index: number
}

/**
 * Mouse/cursor position in the plot
 */
export interface PlotPosition {
  /** X position in characters */
  col: number
  /** Y position in characters */
  row: number
  /** X value in data coordinates (if determinable) */
  dataX?: number
  /** Y value in data coordinates (if determinable) */
  dataY?: number
}

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
  /** Scale definitions */
  scales?: Scale[]
  /** Coordinate system */
  coord?: Coord
  /** Faceting specification */
  facet?: Facet
  /** Theme object */
  theme?: Partial<Theme>
  /** Labels (title, axes, etc.) */
  labs?: Labels
  /** Width in characters */
  width?: number
  /** Height in characters */
  height?: number
  /** Enable hover detection */
  interactive?: boolean
  /** Hover callback - called when cursor moves over plot */
  onHover?: (point: PlotPoint | null, position: PlotPosition) => void
  /** Click callback - called when a point is clicked */
  onClick?: (point: PlotPoint | null, position: PlotPosition) => void
  /** Key press callback */
  onKeyDown?: (key: string, position: PlotPosition) => void
  /** Called when plot is rendered */
  onRender?: (rendered: string) => void
  /** Custom className for styling */
  className?: string
  /** Whether to focus on mount */
  autoFocus?: boolean
}

/**
 * Ref handle for GGTerm component
 */
export interface GGTermRef {
  /** Force a re-render of the plot */
  refresh: () => void
  /** Get the current rendered string */
  getRendered: () => string
  /** Get data point at character position */
  getPointAt: (col: number, row: number) => PlotPoint | null
  /** Get all currently visible data points */
  getVisiblePoints: () => PlotPoint[]
  /** Handle hover at character position (for OpenTUI integration) */
  handleHover: (col: number, row: number) => void
  /** Handle click at character position (for OpenTUI integration) */
  handleClick: (col: number, row: number) => void
  /** Handle key press at character position (for OpenTUI integration) */
  handleKeyDown: (key: string, col: number, row: number) => void
}

/**
 * Internal state for tracking rendered plot
 */
interface PlotState {
  rendered: string
  pointMap: Map<string, PlotPoint>  // "col,row" -> point
  layout: {
    plotArea: { x: number; y: number; width: number; height: number }
    xDomain: [number, number]
    yDomain: [number, number]
  } | null
}

/**
 * GGTerm React component
 *
 * Renders a ggterm plot as a React component for use in OpenTUI applications.
 *
 * @example
 * ```tsx
 * import { GGTerm, geom_point, scale_color_viridis } from '@ggterm/opentui'
 *
 * function MyPlot({ data }) {
 *   return (
 *     <GGTerm
 *       data={data}
 *       aes={{ x: 'pc1', y: 'pc2', color: 'group' }}
 *       geoms={[geom_point()]}
 *       scales={[scale_color_viridis()]}
 *       width={80}
 *       height={24}
 *       interactive
 *       onHover={(point) => console.log('Hovering:', point)}
 *       onClick={(point) => console.log('Clicked:', point)}
 *     />
 *   )
 * }
 * ```
 */
export const GGTerm = forwardRef<GGTermRef, GGTermProps>(function GGTerm(
  props,
  ref
): ReactNode {
  const {
    data,
    aes,
    geoms = [],
    scales = [],
    coord,
    facet,
    theme,
    labs,
    width = 80,
    height = 24,
    interactive = false,
    onHover,
    onClick,
    onKeyDown,
    onRender,
    className: _className,
    autoFocus: _autoFocus = false,
  } = props

  // Track plot state
  const [plotState, setPlotState] = useState<PlotState>({
    rendered: '',
    pointMap: new Map(),
    layout: null,
  })

  // Ref for tracking render count (for optimization)
  const renderCountRef = useRef(0)

  // Build and render the plot
  const renderPlot = useCallback(() => {
    try {
      // Build the plot using gg() fluent API
      let plot = gg(data).aes(aes)

      // Add geoms
      for (const geom of geoms) {
        plot = plot.geom(geom)
      }

      // Add scales
      for (const scale of scales) {
        plot = plot.scale(scale)
      }

      // Add coord if specified
      if (coord) {
        plot = plot.coord(coord)
      }

      // Add facet if specified
      if (facet) {
        plot = plot.facet(facet)
      }

      // Add theme if specified
      if (theme) {
        plot = plot.theme(theme)
      }

      // Add labels if specified
      if (labs) {
        plot = plot.labs(labs)
      }

      // Render to string
      const rendered = plot.render({ width, height })

      // Build point map for interactivity
      const pointMap = new Map<string, PlotPoint>()

      if (interactive && data.length > 0) {
        // Calculate approximate plot area (simplified)
        const margins = { top: labs?.title ? 2 : 1, right: 2, bottom: 3, left: 8 }
        const plotArea = {
          x: margins.left,
          y: margins.top,
          width: width - margins.left - margins.right,
          height: height - margins.top - margins.bottom,
        }

        // Get data bounds
        const xValues = data.map((d: DataRecord) => Number(d[aes.x])).filter((v: number) => !isNaN(v))
        const yValues = data.map((d: DataRecord) => Number(d[aes.y])).filter((v: number) => !isNaN(v))

        if (xValues.length > 0 && yValues.length > 0) {
          const xDomain: [number, number] = [Math.min(...xValues), Math.max(...xValues)]
          const yDomain: [number, number] = [Math.min(...yValues), Math.max(...yValues)]

          // Map data points to character positions
          data.forEach((record: DataRecord, index: number) => {
            const xVal = Number(record[aes.x])
            const yVal = Number(record[aes.y])

            if (!isNaN(xVal) && !isNaN(yVal)) {
              // Scale to plot area
              const xRange = xDomain[1] - xDomain[0] || 1
              const yRange = yDomain[1] - yDomain[0] || 1

              const col = Math.round(
                plotArea.x + ((xVal - xDomain[0]) / xRange) * (plotArea.width - 1)
              )
              const row = Math.round(
                plotArea.y + plotArea.height - 1 - ((yVal - yDomain[0]) / yRange) * (plotArea.height - 1)
              )

              // Store in point map (may overwrite if points overlap)
              const key = `${col},${row}`
              pointMap.set(key, {
                data: record,
                x: xVal,
                y: yVal,
                index,
              })
            }
          })

          setPlotState({
            rendered,
            pointMap,
            layout: { plotArea, xDomain, yDomain },
          })
        } else {
          setPlotState({ rendered, pointMap: new Map(), layout: null })
        }
      } else {
        setPlotState({ rendered, pointMap: new Map(), layout: null })
      }

      renderCountRef.current++
      onRender?.(rendered)
    } catch (error) {
      console.error('GGTerm render error:', error)
      setPlotState({
        rendered: `Error rendering plot: ${error instanceof Error ? error.message : 'Unknown error'}`,
        pointMap: new Map(),
        layout: null,
      })
    }
  }, [data, aes, geoms, scales, coord, facet, theme, labs, width, height, interactive, onRender])

  // Re-render when dependencies change
  useEffect(() => {
    renderPlot()
  }, [renderPlot])

  // Get point at position
  const getPointAt = useCallback(
    (col: number, row: number): PlotPoint | null => {
      // Check exact position first
      const exactKey = `${col},${row}`
      if (plotState.pointMap.has(exactKey)) {
        return plotState.pointMap.get(exactKey)!
      }

      // Check nearby positions (within 1 character radius)
      for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
          const nearbyKey = `${col + dc},${row + dr}`
          if (plotState.pointMap.has(nearbyKey)) {
            return plotState.pointMap.get(nearbyKey)!
          }
        }
      }

      return null
    },
    [plotState.pointMap]
  )

  // Get position info including data coordinates
  const getPositionInfo = useCallback(
    (col: number, row: number): PlotPosition => {
      const position: PlotPosition = { col, row }

      if (plotState.layout) {
        const { plotArea, xDomain, yDomain } = plotState.layout

        // Check if within plot area
        if (
          col >= plotArea.x &&
          col < plotArea.x + plotArea.width &&
          row >= plotArea.y &&
          row < plotArea.y + plotArea.height
        ) {
          const xRange = xDomain[1] - xDomain[0] || 1
          const yRange = yDomain[1] - yDomain[0] || 1

          position.dataX =
            xDomain[0] + ((col - plotArea.x) / (plotArea.width - 1)) * xRange
          position.dataY =
            yDomain[1] - ((row - plotArea.y) / (plotArea.height - 1)) * yRange
        }
      }

      return position
    },
    [plotState.layout]
  )

  // Handle hover (exported for OpenTUI integration)
  const handleHover = useCallback(
    (col: number, row: number) => {
      if (!onHover) return
      const point = getPointAt(col, row)
      const position = getPositionInfo(col, row)
      onHover(point, position)
    },
    [onHover, getPointAt, getPositionInfo]
  )

  // Handle click (exported for OpenTUI integration)
  const handleClick = useCallback(
    (col: number, row: number) => {
      if (!onClick) return
      const point = getPointAt(col, row)
      const position = getPositionInfo(col, row)
      onClick(point, position)
    },
    [onClick, getPointAt, getPositionInfo]
  )

  // Handle key down (exported for OpenTUI integration)
  const handleKeyDown = useCallback(
    (key: string, col: number, row: number) => {
      if (!onKeyDown) return
      const position = getPositionInfo(col, row)
      onKeyDown(key, position)
    },
    [onKeyDown, getPositionInfo]
  )

  // Expose ref methods
  useImperativeHandle(
    ref,
    () => ({
      refresh: renderPlot,
      getRendered: () => plotState.rendered,
      getPointAt,
      getVisiblePoints: () => Array.from(plotState.pointMap.values()),
      handleHover,
      handleClick,
      handleKeyDown,
    }),
    [renderPlot, plotState.rendered, getPointAt, plotState.pointMap, handleHover, handleClick, handleKeyDown]
  )

  // Memoize the content to avoid unnecessary re-renders
  const content = useMemo(() => plotState.rendered, [plotState.rendered])

  // For OpenTUI integration, we return a structure that can be rendered
  // In a real OpenTUI app, this would be a <text> element or similar
  // For now, we return a simple representation
  return content
})

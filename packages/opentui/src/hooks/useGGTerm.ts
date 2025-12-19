/**
 * useGGTerm hook
 *
 * Provides programmatic control over ggterm plot rendering and state.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  gg,
  type AestheticMapping,
  type Coord,
  type DataSource,
  type Facet,
  type Geom,
  type Labels,
  type Scale,
  type Theme,
} from '@ggterm/core'

/**
 * Options for useGGTerm hook
 */
export interface UseGGTermOptions {
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
  /** Initial data */
  initialData?: DataSource
  /** Auto-render on data change */
  autoRender?: boolean
  /** Debounce render in ms (useful for streaming data) */
  debounceMs?: number
}

/**
 * Result of useGGTerm hook
 */
export interface UseGGTermResult {
  /** Current rendered plot string */
  rendered: string
  /** Current data */
  data: DataSource
  /** Whether the plot is currently rendering */
  isRendering: boolean
  /** Last render timestamp */
  lastRenderTime: number | null
  /** Render count */
  renderCount: number
  /** Set new data (replaces existing) */
  setData: (data: DataSource) => void
  /** Push new data points (appends to existing) */
  pushData: (data: DataSource | Record<string, unknown>) => void
  /** Clear all data */
  clearData: () => void
  /** Update plot options */
  setOptions: (options: Partial<UseGGTermOptions>) => void
  /** Force a re-render */
  refresh: () => void
  /** Get current options */
  getOptions: () => UseGGTermOptions
}

/**
 * Hook for managing ggterm plot state and rendering
 *
 * Provides full control over plot lifecycle, data management, and rendering.
 *
 * @example
 * ```tsx
 * function MyPlot() {
 *   const {
 *     rendered,
 *     setData,
 *     pushData,
 *     isRendering
 *   } = useGGTerm({
 *     aes: { x: 'time', y: 'value' },
 *     geoms: [geom_line(), geom_point()],
 *     width: 60,
 *     height: 20,
 *   })
 *
 *   // Update data from external source
 *   useEffect(() => {
 *     const ws = new WebSocket('ws://...')
 *     ws.onmessage = (e) => pushData(JSON.parse(e.data))
 *     return () => ws.close()
 *   }, [pushData])
 *
 *   return <text>{rendered}</text>
 * }
 * ```
 */
export function useGGTerm(initialOptions: UseGGTermOptions): UseGGTermResult {
  // State
  const [data, setDataState] = useState<DataSource>(initialOptions.initialData ?? [])
  const [options, setOptionsState] = useState<UseGGTermOptions>(initialOptions)
  const [rendered, setRendered] = useState<string>('')
  const [isRendering, setIsRendering] = useState(false)
  const [lastRenderTime, setLastRenderTime] = useState<number | null>(null)
  const [renderCount, setRenderCount] = useState(0)

  // Refs for debouncing
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingDataRef = useRef<DataSource | null>(null)

  // Render function
  const doRender = useCallback((dataToRender: DataSource, opts: UseGGTermOptions) => {
    setIsRendering(true)

    try {
      const {
        aes,
        geoms = [],
        scales = [],
        coord,
        facet,
        theme,
        labs,
        width = 80,
        height = 24,
      } = opts

      // Build the plot
      let plot = gg(dataToRender).aes(aes)

      for (const geom of geoms) {
        plot = plot.geom(geom)
      }

      for (const scale of scales) {
        plot = plot.scale(scale)
      }

      if (coord) {
        plot = plot.coord(coord)
      }

      if (facet) {
        plot = plot.facet(facet)
      }

      if (theme) {
        plot = plot.theme(theme)
      }

      if (labs) {
        plot = plot.labs(labs)
      }

      const result = plot.render({ width, height })

      setRendered(result)
      setLastRenderTime(Date.now())
      setRenderCount(c => c + 1)
    } catch (error) {
      console.error('useGGTerm render error:', error)
      setRendered(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsRendering(false)
    }
  }, [])

  // Debounced render
  const scheduleRender = useCallback((dataToRender: DataSource, opts: UseGGTermOptions) => {
    const debounceMs = opts.debounceMs ?? 0

    if (debounceMs > 0) {
      pendingDataRef.current = dataToRender

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          doRender(pendingDataRef.current, opts)
          pendingDataRef.current = null
        }
      }, debounceMs)
    } else {
      doRender(dataToRender, opts)
    }
  }, [doRender])

  // Set data (replaces existing)
  const setData = useCallback((newData: DataSource) => {
    setDataState(newData)

    if (options.autoRender !== false) {
      scheduleRender(newData, options)
    }
  }, [options, scheduleRender])

  // Push data (appends to existing)
  const pushData = useCallback((newData: DataSource | Record<string, unknown>) => {
    const dataArray = Array.isArray(newData) ? newData : [newData]

    setDataState((current: DataSource) => {
      const updated = [...current, ...dataArray]

      if (options.autoRender !== false) {
        scheduleRender(updated, options)
      }

      return updated
    })
  }, [options, scheduleRender])

  // Clear data
  const clearData = useCallback(() => {
    setDataState([])

    if (options.autoRender !== false) {
      scheduleRender([], options)
    }
  }, [options, scheduleRender])

  // Update options
  const setOptions = useCallback((newOptions: Partial<UseGGTermOptions>) => {
    setOptionsState(current => {
      const updated = { ...current, ...newOptions }

      if (updated.autoRender !== false) {
        scheduleRender(data, updated)
      }

      return updated
    })
  }, [data, scheduleRender])

  // Force refresh
  const refresh = useCallback(() => {
    doRender(data, options)
  }, [data, options, doRender])

  // Get current options
  const getOptions = useCallback(() => options, [options])

  // Initial render
  useEffect(() => {
    if (data.length > 0 || options.autoRender !== false) {
      doRender(data, options)
    }
  }, []) // Only on mount

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return useMemo(() => ({
    rendered,
    data,
    isRendering,
    lastRenderTime,
    renderCount,
    setData,
    pushData,
    clearData,
    setOptions,
    refresh,
    getOptions,
  }), [
    rendered,
    data,
    isRendering,
    lastRenderTime,
    renderCount,
    setData,
    pushData,
    clearData,
    setOptions,
    refresh,
    getOptions,
  ])
}

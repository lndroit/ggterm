/**
 * usePlotInteraction hook
 *
 * Provides advanced interactivity features for ggterm plots.
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'

/**
 * Selection modes for plot interaction
 */
export type SelectionMode = 'single' | 'multiple' | 'brush' | 'none'

/**
 * Zoom/pan state
 */
export interface ViewportState {
  /** X-axis domain [min, max] */
  xDomain: [number, number] | null
  /** Y-axis domain [min, max] */
  yDomain: [number, number] | null
  /** Zoom level (1 = normal, >1 = zoomed in) */
  zoomLevel: number
}

/**
 * Brush selection state
 */
export interface BrushState {
  /** Start position */
  start: { x: number; y: number } | null
  /** End position */
  end: { x: number; y: number } | null
  /** Whether actively brushing */
  isActive: boolean
}

/**
 * Plot interaction state
 */
export interface PlotInteractionState {
  /** Currently hovered point index (or null) */
  hoveredIndex: number | null
  /** Currently hovered point data */
  hoveredData: Record<string, unknown> | null
  /** Currently selected point indices */
  selectedIndices: Set<number>
  /** Cursor position in plot coordinates */
  cursorPosition: { x: number; y: number } | null
  /** Current viewport (zoom/pan) state */
  viewport: ViewportState
  /** Brush selection state */
  brush: BrushState
  /** Whether the plot is focused */
  isFocused: boolean
}

/**
 * Options for usePlotInteraction hook
 */
export interface UsePlotInteractionOptions {
  /** Selection mode */
  selectionMode?: SelectionMode
  /** Enable zoom/pan */
  enableZoom?: boolean
  /** Enable brush selection */
  enableBrush?: boolean
  /** Zoom sensitivity (default: 0.1) */
  zoomSensitivity?: number
  /** Pan sensitivity (default: 10) */
  panSensitivity?: number
  /** Maximum zoom level (default: 10) */
  maxZoom?: number
  /** Minimum zoom level (default: 0.1) */
  minZoom?: number
  /** Initial viewport */
  initialViewport?: Partial<ViewportState>
  /** Callback when selection changes */
  onSelectionChange?: (indices: number[]) => void
  /** Callback when viewport changes */
  onViewportChange?: (viewport: ViewportState) => void
  /** Callback when brush completes */
  onBrushEnd?: (bounds: { x: [number, number]; y: [number, number] }) => void
}

/**
 * Result of usePlotInteraction hook
 */
export interface UsePlotInteractionResult {
  /** Current interaction state */
  state: PlotInteractionState
  /** Handle hover event */
  handleHover: (index: number | null, data: Record<string, unknown> | null) => void
  /** Handle click/select event */
  handleSelect: (index: number) => void
  /** Toggle selection for an index */
  toggleSelection: (index: number) => void
  /** Clear all selections */
  clearSelection: () => void
  /** Set cursor position */
  setCursorPosition: (x: number, y: number) => void
  /** Handle key press for navigation */
  handleKeyDown: (key: string) => void
  /** Zoom in */
  zoomIn: () => void
  /** Zoom out */
  zoomOut: () => void
  /** Reset zoom to default */
  resetZoom: () => void
  /** Pan by offset */
  pan: (dx: number, dy: number) => void
  /** Start brush selection */
  startBrush: (x: number, y: number) => void
  /** Update brush selection */
  updateBrush: (x: number, y: number) => void
  /** End brush selection */
  endBrush: () => void
  /** Set focus state */
  setFocused: (focused: boolean) => void
  /** Get selected data points */
  getSelectedData: <T extends Record<string, unknown>>(data: T[]) => T[]
}

/**
 * Hook for managing plot interactivity
 *
 * Provides comprehensive support for selection, zoom/pan, and brush interactions.
 *
 * @example
 * ```tsx
 * function InteractivePlot({ data }) {
 *   const {
 *     state,
 *     handleHover,
 *     handleSelect,
 *     handleKeyDown,
 *     zoomIn,
 *     zoomOut,
 *     resetZoom,
 *   } = usePlotInteraction({
 *     selectionMode: 'multiple',
 *     enableZoom: true,
 *     onSelectionChange: (indices) => console.log('Selected:', indices),
 *   })
 *
 *   return (
 *     <GGTerm
 *       data={data}
 *       aes={{ x: 'x', y: 'y' }}
 *       geoms={[geom_point()]}
 *       interactive
 *       onHover={(point, pos) => handleHover(point?.index ?? null, point?.data ?? null)}
 *       onClick={(point) => point && handleSelect(point.index)}
 *       onKeyDown={(key) => handleKeyDown(key)}
 *     />
 *   )
 * }
 * ```
 */
export function usePlotInteraction(
  options: UsePlotInteractionOptions = {}
): UsePlotInteractionResult {
  const {
    selectionMode = 'single',
    enableZoom = false,
    enableBrush = false,
    zoomSensitivity = 0.1,
    panSensitivity = 10,
    maxZoom = 10,
    minZoom = 0.1,
    initialViewport,
    onSelectionChange,
    onViewportChange,
    onBrushEnd,
  } = options

  // State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [hoveredData, setHoveredData] = useState<Record<string, unknown> | null>(null)
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [cursorPosition, setCursorPositionState] = useState<{ x: number; y: number } | null>(null)
  const [isFocused, setIsFocused] = useState(false)

  const [viewport, setViewport] = useState<ViewportState>({
    xDomain: initialViewport?.xDomain ?? null,
    yDomain: initialViewport?.yDomain ?? null,
    zoomLevel: initialViewport?.zoomLevel ?? 1,
  })

  const [brush, setBrush] = useState<BrushState>({
    start: null,
    end: null,
    isActive: false,
  })

  // Refs for callbacks to avoid stale closures
  const onSelectionChangeRef = useRef(onSelectionChange)
  const onViewportChangeRef = useRef(onViewportChange)
  const onBrushEndRef = useRef(onBrushEnd)

  useEffect(() => {
    onSelectionChangeRef.current = onSelectionChange
    onViewportChangeRef.current = onViewportChange
    onBrushEndRef.current = onBrushEnd
  }, [onSelectionChange, onViewportChange, onBrushEnd])

  // Handle hover
  const handleHover = useCallback((index: number | null, data: Record<string, unknown> | null) => {
    setHoveredIndex(index)
    setHoveredData(data)
  }, [])

  // Handle select
  const handleSelect = useCallback((index: number) => {
    if (selectionMode === 'none') return

    setSelectedIndices(current => {
      let newSelection: Set<number>

      if (selectionMode === 'single') {
        newSelection = current.has(index) ? new Set() : new Set([index])
      } else {
        newSelection = new Set(current)
        if (newSelection.has(index)) {
          newSelection.delete(index)
        } else {
          newSelection.add(index)
        }
      }

      // Notify callback
      setTimeout(() => {
        onSelectionChangeRef.current?.(Array.from(newSelection))
      }, 0)

      return newSelection
    })
  }, [selectionMode])

  // Toggle selection
  const toggleSelection = useCallback((index: number) => {
    if (selectionMode === 'none') return

    setSelectedIndices(current => {
      const newSelection = new Set(current)
      if (newSelection.has(index)) {
        newSelection.delete(index)
      } else {
        if (selectionMode === 'single') {
          newSelection.clear()
        }
        newSelection.add(index)
      }

      setTimeout(() => {
        onSelectionChangeRef.current?.(Array.from(newSelection))
      }, 0)

      return newSelection
    })
  }, [selectionMode])

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedIndices(new Set())
    onSelectionChangeRef.current?.([])
  }, [])

  // Set cursor position
  const setCursorPosition = useCallback((x: number, y: number) => {
    setCursorPositionState({ x, y })
  }, [])

  // Update viewport with callback
  const updateViewport = useCallback((update: Partial<ViewportState>) => {
    setViewport(current => {
      const newViewport = { ...current, ...update }

      // Clamp zoom level
      newViewport.zoomLevel = Math.max(minZoom, Math.min(maxZoom, newViewport.zoomLevel))

      setTimeout(() => {
        onViewportChangeRef.current?.(newViewport)
      }, 0)

      return newViewport
    })
  }, [minZoom, maxZoom])

  // Zoom in
  const zoomIn = useCallback(() => {
    if (!enableZoom) return
    updateViewport({ zoomLevel: viewport.zoomLevel * (1 + zoomSensitivity) })
  }, [enableZoom, viewport.zoomLevel, zoomSensitivity, updateViewport])

  // Zoom out
  const zoomOut = useCallback(() => {
    if (!enableZoom) return
    updateViewport({ zoomLevel: viewport.zoomLevel * (1 - zoomSensitivity) })
  }, [enableZoom, viewport.zoomLevel, zoomSensitivity, updateViewport])

  // Reset zoom
  const resetZoom = useCallback(() => {
    updateViewport({ zoomLevel: 1, xDomain: null, yDomain: null })
  }, [updateViewport])

  // Pan
  const pan = useCallback((dx: number, dy: number) => {
    if (!enableZoom) return

    setViewport(current => {
      if (!current.xDomain || !current.yDomain) return current

      const xRange = current.xDomain[1] - current.xDomain[0]
      const yRange = current.yDomain[1] - current.yDomain[0]

      const panX = (dx / panSensitivity) * xRange
      const panY = (dy / panSensitivity) * yRange

      const newViewport: ViewportState = {
        ...current,
        xDomain: [current.xDomain[0] + panX, current.xDomain[1] + panX],
        yDomain: [current.yDomain[0] - panY, current.yDomain[1] - panY],
      }

      setTimeout(() => {
        onViewportChangeRef.current?.(newViewport)
      }, 0)

      return newViewport
    })
  }, [enableZoom, panSensitivity])

  // Start brush
  const startBrush = useCallback((x: number, y: number) => {
    if (!enableBrush) return
    setBrush({ start: { x, y }, end: { x, y }, isActive: true })
  }, [enableBrush])

  // Update brush
  const updateBrush = useCallback((x: number, y: number) => {
    setBrush(current => {
      if (!current.isActive) return current
      return { ...current, end: { x, y } }
    })
  }, [])

  // End brush
  const endBrush = useCallback(() => {
    setBrush(current => {
      if (current.start && current.end) {
        const bounds = {
          x: [
            Math.min(current.start.x, current.end.x),
            Math.max(current.start.x, current.end.x),
          ] as [number, number],
          y: [
            Math.min(current.start.y, current.end.y),
            Math.max(current.start.y, current.end.y),
          ] as [number, number],
        }

        setTimeout(() => {
          onBrushEndRef.current?.(bounds)
        }, 0)
      }

      return { start: null, end: null, isActive: false }
    })
  }, [])

  // Set focused
  const setFocused = useCallback((focused: boolean) => {
    setIsFocused(focused)
  }, [])

  // Handle key down
  const handleKeyDown = useCallback((key: string) => {
    switch (key) {
      case 'Escape':
        clearSelection()
        endBrush()
        break
      case '+':
      case '=':
        zoomIn()
        break
      case '-':
        zoomOut()
        break
      case '0':
        resetZoom()
        break
      case 'ArrowLeft':
        pan(-1, 0)
        break
      case 'ArrowRight':
        pan(1, 0)
        break
      case 'ArrowUp':
        pan(0, 1)
        break
      case 'ArrowDown':
        pan(0, -1)
        break
    }
  }, [clearSelection, endBrush, zoomIn, zoomOut, resetZoom, pan])

  // Get selected data
  const getSelectedData = useCallback(<T extends Record<string, unknown>>(data: T[]): T[] => {
    return data.filter((_, index) => selectedIndices.has(index))
  }, [selectedIndices])

  // Memoize state
  const state = useMemo<PlotInteractionState>(() => ({
    hoveredIndex,
    hoveredData,
    selectedIndices,
    cursorPosition,
    viewport,
    brush,
    isFocused,
  }), [hoveredIndex, hoveredData, selectedIndices, cursorPosition, viewport, brush, isFocused])

  return useMemo(() => ({
    state,
    handleHover,
    handleSelect,
    toggleSelection,
    clearSelection,
    setCursorPosition,
    handleKeyDown,
    zoomIn,
    zoomOut,
    resetZoom,
    pan,
    startBrush,
    updateBrush,
    endBrush,
    setFocused,
    getSelectedData,
  }), [
    state,
    handleHover,
    handleSelect,
    toggleSelection,
    clearSelection,
    setCursorPosition,
    handleKeyDown,
    zoomIn,
    zoomOut,
    resetZoom,
    pan,
    startBrush,
    updateBrush,
    endBrush,
    setFocused,
    getSelectedData,
  ])
}

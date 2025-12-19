/**
 * Svelte store for plot interactivity
 */

import { writable, get } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import type { DataSource } from '@ggterm/core'

export type SelectionMode = 'none' | 'single' | 'multiple' | 'brush'

export interface Viewport {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface BrushRect {
  x1: number
  y1: number
  x2: number
  y2: number
}

export interface InteractionStoreOptions {
  /** Selection mode */
  selectionMode?: SelectionMode
  /** Enable zoom */
  enableZoom?: boolean
  /** Enable keyboard */
  enableKeyboard?: boolean
  /** Initial viewport */
  initialViewport?: Viewport
  /** Selection change callback */
  onSelectionChange?: (indices: number[]) => void
  /** Viewport change callback */
  onViewportChange?: (viewport: Viewport) => void
  /** Brush end callback */
  onBrushEnd?: (rect: BrushRect, indices: number[]) => void
}

export interface InteractionStore {
  /** Hovered point index */
  hoveredIndex: Writable<number>
  /** Selected indices */
  selectedIndices: Writable<number[]>
  /** Current viewport */
  viewport: Writable<Viewport | null>
  /** Current brush rect */
  brush: Writable<BrushRect | null>
  /** Is focused */
  isFocused: Writable<boolean>
  /** Selection mode */
  selectionMode: Writable<SelectionMode>

  /** Set hovered index */
  setHovered: (index: number) => void
  /** Clear hover */
  clearHover: () => void
  /** Select point */
  select: (index: number) => void
  /** Toggle selection */
  toggleSelect: (index: number) => void
  /** Set selection */
  setSelected: (indices: number[]) => void
  /** Clear selection */
  clearSelection: () => void
  /** Set viewport */
  setViewport: (viewport: Viewport) => void
  /** Reset viewport */
  resetViewport: () => void
  /** Zoom */
  zoom: (factor: number, centerX?: number, centerY?: number) => void
  /** Pan */
  pan: (dx: number, dy: number) => void
  /** Start brush */
  startBrush: (x: number, y: number) => void
  /** Update brush */
  updateBrush: (x: number, y: number) => void
  /** End brush */
  endBrush: (data: DataSource, xField: string, yField: string) => number[]
  /** Cancel brush */
  cancelBrush: () => void
  /** Handle key down */
  handleKeyDown: (event: KeyboardEvent) => void
}

/**
 * Creates a reactive interaction store
 *
 * @example
 * ```svelte
 * <script>
 *   import { createInteractionStore } from '@ggterm/svelte'
 *
 *   const interaction = createInteractionStore({
 *     selectionMode: 'multiple',
 *     enableZoom: true
 *   })
 * </script>
 *
 * <p>Selected: {$interaction.selectedIndices.length} points</p>
 * ```
 */
export function createInteractionStore(
  options: InteractionStoreOptions = {}
): InteractionStore {
  const {
    selectionMode: initialMode = 'single',
    enableZoom = true,
    enableKeyboard = true,
    initialViewport,
    onSelectionChange,
    onViewportChange,
    onBrushEnd,
  } = options

  // Stores
  const hoveredIndex = writable(-1)
  const selectedIndices = writable<number[]>([])
  const viewport = writable<Viewport | null>(initialViewport ?? null)
  const brush = writable<BrushRect | null>(null)
  const isFocused = writable(false)
  const selectionMode = writable<SelectionMode>(initialMode)

  // Brush state
  let brushStart: { x: number; y: number } | null = null

  // Actions
  const setHovered = (index: number) => {
    hoveredIndex.set(index)
  }

  const clearHover = () => {
    hoveredIndex.set(-1)
  }

  const select = (index: number) => {
    const mode = get(selectionMode)
    if (mode === 'none') return

    if (mode === 'single') {
      selectedIndices.set([index])
    } else if (mode === 'multiple') {
      selectedIndices.update((prev) => {
        if (prev.includes(index)) return prev
        return [...prev, index]
      })
    }

    onSelectionChange?.(get(selectedIndices))
  }

  const toggleSelect = (index: number) => {
    const mode = get(selectionMode)
    if (mode === 'none') return

    selectedIndices.update((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      }
      if (mode === 'single') {
        return [index]
      }
      return [...prev, index]
    })

    onSelectionChange?.(get(selectedIndices))
  }

  const setSelected = (indices: number[]) => {
    selectedIndices.set(indices)
    onSelectionChange?.(indices)
  }

  const clearSelection = () => {
    selectedIndices.set([])
    onSelectionChange?.([])
  }

  const setViewport = (newViewport: Viewport) => {
    viewport.set(newViewport)
    onViewportChange?.(newViewport)
  }

  const resetViewport = () => {
    viewport.set(initialViewport ?? null)
    if (initialViewport) {
      onViewportChange?.(initialViewport)
    }
  }

  const zoom = (factor: number, centerX?: number, centerY?: number) => {
    if (!enableZoom) return

    viewport.update((prev) => {
      if (!prev) return prev

      const cx = centerX ?? (prev.xMin + prev.xMax) / 2
      const cy = centerY ?? (prev.yMin + prev.yMax) / 2

      const xRange = prev.xMax - prev.xMin
      const yRange = prev.yMax - prev.yMin

      const newXRange = xRange / factor
      const newYRange = yRange / factor

      const newViewport: Viewport = {
        xMin: cx - newXRange / 2,
        xMax: cx + newXRange / 2,
        yMin: cy - newYRange / 2,
        yMax: cy + newYRange / 2,
      }

      onViewportChange?.(newViewport)
      return newViewport
    })
  }

  const pan = (dx: number, dy: number) => {
    if (!enableZoom) return

    viewport.update((prev) => {
      if (!prev) return prev

      const newViewport: Viewport = {
        xMin: prev.xMin + dx,
        xMax: prev.xMax + dx,
        yMin: prev.yMin + dy,
        yMax: prev.yMax + dy,
      }

      onViewportChange?.(newViewport)
      return newViewport
    })
  }

  const startBrush = (x: number, y: number) => {
    if (get(selectionMode) !== 'brush') return
    brushStart = { x, y }
    brush.set({ x1: x, y1: y, x2: x, y2: y })
  }

  const updateBrush = (x: number, y: number) => {
    if (!brushStart) return
    brush.set({
      x1: brushStart.x,
      y1: brushStart.y,
      x2: x,
      y2: y,
    })
  }

  const endBrush = (data: DataSource, xField: string, yField: string): number[] => {
    const currentBrush = get(brush)
    if (!currentBrush || !brushStart) {
      cancelBrush()
      return []
    }

    const rect: BrushRect = {
      x1: Math.min(currentBrush.x1, currentBrush.x2),
      y1: Math.min(currentBrush.y1, currentBrush.y2),
      x2: Math.max(currentBrush.x1, currentBrush.x2),
      y2: Math.max(currentBrush.y1, currentBrush.y2),
    }

    const indices: number[] = []
    data.forEach((record, index) => {
      const x = Number(record[xField])
      const y = Number(record[yField])
      if (!isNaN(x) && !isNaN(y)) {
        if (x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2) {
          indices.push(index)
        }
      }
    })

    selectedIndices.set(indices)
    onSelectionChange?.(indices)
    onBrushEnd?.(rect, indices)

    brushStart = null
    brush.set(null)

    return indices
  }

  const cancelBrush = () => {
    brushStart = null
    brush.set(null)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!enableKeyboard || !get(isFocused)) return

    const vp = get(viewport)
    if (!vp) return

    const xStep = (vp.xMax - vp.xMin) * 0.1
    const yStep = (vp.yMax - vp.yMin) * 0.1

    switch (event.key) {
      case 'ArrowLeft':
        pan(-xStep, 0)
        event.preventDefault()
        break
      case 'ArrowRight':
        pan(xStep, 0)
        event.preventDefault()
        break
      case 'ArrowUp':
        pan(0, yStep)
        event.preventDefault()
        break
      case 'ArrowDown':
        pan(0, -yStep)
        event.preventDefault()
        break
      case '+':
      case '=':
        zoom(1.2)
        event.preventDefault()
        break
      case '-':
        zoom(0.8)
        event.preventDefault()
        break
      case '0':
        resetViewport()
        event.preventDefault()
        break
      case 'Escape':
        clearSelection()
        cancelBrush()
        event.preventDefault()
        break
    }
  }

  return {
    hoveredIndex,
    selectedIndices,
    viewport,
    brush,
    isFocused,
    selectionMode,

    setHovered,
    clearHover,
    select,
    toggleSelect,
    setSelected,
    clearSelection,
    setViewport,
    resetViewport,
    zoom,
    pan,
    startBrush,
    updateBrush,
    endBrush,
    cancelBrush,
    handleKeyDown,
  }
}

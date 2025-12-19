/**
 * Tests for usePlotInteraction composable
 */

import { describe, expect, it } from 'bun:test'
import { usePlotInteraction } from '../composables/usePlotInteraction'

describe('usePlotInteraction', () => {
  describe('initialization', () => {
    it('should create with default state', () => {
      const interaction = usePlotInteraction()
      expect(interaction.hoveredIndex.value).toBe(-1)
      expect(interaction.selectedIndices.value).toEqual([])
      expect(interaction.viewport.value).toBeNull()
      expect(interaction.brush.value).toBeNull()
      expect(interaction.isFocused.value).toBe(false)
      expect(interaction.selectionMode.value).toBe('single')
    })

    it('should accept custom selection mode', () => {
      const interaction = usePlotInteraction({ selectionMode: 'multiple' })
      expect(interaction.selectionMode.value).toBe('multiple')
    })

    it('should accept initial viewport', () => {
      const viewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
      const interaction = usePlotInteraction({ initialViewport: viewport })
      expect(interaction.viewport.value).toEqual(viewport)
    })
  })

  describe('hover', () => {
    it('should set hovered index', () => {
      const interaction = usePlotInteraction()
      interaction.setHovered(5)
      expect(interaction.hoveredIndex.value).toBe(5)
    })

    it('should clear hover', () => {
      const interaction = usePlotInteraction()
      interaction.setHovered(5)
      interaction.clearHover()
      expect(interaction.hoveredIndex.value).toBe(-1)
    })
  })

  describe('selection - single mode', () => {
    it('should select a point', () => {
      const interaction = usePlotInteraction({ selectionMode: 'single' })
      interaction.select(3)
      expect(interaction.selectedIndices.value).toEqual([3])
    })

    it('should replace selection on new select', () => {
      const interaction = usePlotInteraction({ selectionMode: 'single' })
      interaction.select(1)
      interaction.select(2)
      expect(interaction.selectedIndices.value).toEqual([2])
    })

    it('should toggle selection', () => {
      const interaction = usePlotInteraction({ selectionMode: 'single' })
      interaction.toggleSelect(1)
      expect(interaction.selectedIndices.value).toEqual([1])
      interaction.toggleSelect(1)
      expect(interaction.selectedIndices.value).toEqual([])
    })
  })

  describe('selection - multiple mode', () => {
    it('should add to selection', () => {
      const interaction = usePlotInteraction({ selectionMode: 'multiple' })
      interaction.select(1)
      interaction.select(2)
      expect(interaction.selectedIndices.value).toEqual([1, 2])
    })

    it('should not duplicate selections', () => {
      const interaction = usePlotInteraction({ selectionMode: 'multiple' })
      interaction.select(1)
      interaction.select(1)
      expect(interaction.selectedIndices.value).toEqual([1])
    })

    it('should toggle selection', () => {
      const interaction = usePlotInteraction({ selectionMode: 'multiple' })
      interaction.select(1)
      interaction.select(2)
      interaction.toggleSelect(1)
      expect(interaction.selectedIndices.value).toEqual([2])
    })
  })

  describe('selection - none mode', () => {
    it('should not select anything', () => {
      const interaction = usePlotInteraction({ selectionMode: 'none' })
      interaction.select(1)
      expect(interaction.selectedIndices.value).toEqual([])
    })

    it('should not toggle selection', () => {
      const interaction = usePlotInteraction({ selectionMode: 'none' })
      interaction.toggleSelect(1)
      expect(interaction.selectedIndices.value).toEqual([])
    })
  })

  describe('setSelected', () => {
    it('should set selected indices directly', () => {
      const interaction = usePlotInteraction()
      interaction.setSelected([1, 3, 5])
      expect(interaction.selectedIndices.value).toEqual([1, 3, 5])
    })
  })

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const interaction = usePlotInteraction({ selectionMode: 'multiple' })
      interaction.select(1)
      interaction.select(2)
      interaction.clearSelection()
      expect(interaction.selectedIndices.value).toEqual([])
    })
  })

  describe('viewport', () => {
    it('should set viewport', () => {
      const interaction = usePlotInteraction()
      const viewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
      interaction.setViewport(viewport)
      expect(interaction.viewport.value).toEqual(viewport)
    })

    it('should reset viewport to initial', () => {
      const initialViewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
      const interaction = usePlotInteraction({ initialViewport })
      interaction.setViewport({ xMin: 10, xMax: 90, yMin: 10, yMax: 40 })
      interaction.resetViewport()
      expect(interaction.viewport.value).toEqual(initialViewport)
    })

    it('should reset to null if no initial viewport', () => {
      const interaction = usePlotInteraction()
      interaction.setViewport({ xMin: 0, xMax: 100, yMin: 0, yMax: 100 })
      interaction.resetViewport()
      expect(interaction.viewport.value).toBeNull()
    })
  })

  describe('zoom', () => {
    it('should zoom in (increase factor)', () => {
      const interaction = usePlotInteraction({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      interaction.zoom(2) // Zoom in 2x
      const vp = interaction.viewport.value!
      // Range should be halved (100/2 = 50)
      expect(vp.xMax - vp.xMin).toBeCloseTo(50)
      expect(vp.yMax - vp.yMin).toBeCloseTo(50)
    })

    it('should zoom out (decrease factor)', () => {
      const interaction = usePlotInteraction({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      interaction.zoom(0.5) // Zoom out 0.5x
      const vp = interaction.viewport.value!
      // Range should be doubled (100/0.5 = 200)
      expect(vp.xMax - vp.xMin).toBeCloseTo(200)
    })

    it('should zoom around center by default', () => {
      const interaction = usePlotInteraction({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      interaction.zoom(2)
      const vp = interaction.viewport.value!
      // Center should still be at (50, 50)
      expect((vp.xMin + vp.xMax) / 2).toBeCloseTo(50)
      expect((vp.yMin + vp.yMax) / 2).toBeCloseTo(50)
    })

    it('should not zoom when enableZoom is false', () => {
      const initial = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }
      const interaction = usePlotInteraction({
        initialViewport: initial,
        enableZoom: false,
      })
      interaction.zoom(2)
      expect(interaction.viewport.value).toEqual(initial)
    })

    it('should not zoom when viewport is null', () => {
      const interaction = usePlotInteraction()
      interaction.zoom(2)
      expect(interaction.viewport.value).toBeNull()
    })
  })

  describe('pan', () => {
    it('should pan viewport', () => {
      const interaction = usePlotInteraction({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      interaction.pan(10, 20)
      const vp = interaction.viewport.value!
      expect(vp.xMin).toBe(10)
      expect(vp.xMax).toBe(110)
      expect(vp.yMin).toBe(20)
      expect(vp.yMax).toBe(120)
    })

    it('should not pan when enableZoom is false', () => {
      const initial = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }
      const interaction = usePlotInteraction({
        initialViewport: initial,
        enableZoom: false,
      })
      interaction.pan(10, 10)
      expect(interaction.viewport.value).toEqual(initial)
    })
  })

  describe('brush selection', () => {
    it('should start brush in brush mode', () => {
      const interaction = usePlotInteraction({ selectionMode: 'brush' })
      interaction.startBrush(10, 20)
      expect(interaction.brush.value).toEqual({ x1: 10, y1: 20, x2: 10, y2: 20 })
    })

    it('should not start brush in other modes', () => {
      const interaction = usePlotInteraction({ selectionMode: 'single' })
      interaction.startBrush(10, 20)
      expect(interaction.brush.value).toBeNull()
    })

    it('should update brush', () => {
      const interaction = usePlotInteraction({ selectionMode: 'brush' })
      interaction.startBrush(10, 20)
      interaction.updateBrush(50, 60)
      expect(interaction.brush.value).toEqual({ x1: 10, y1: 20, x2: 50, y2: 60 })
    })

    it('should end brush and select points', () => {
      const interaction = usePlotInteraction({ selectionMode: 'brush' })
      const data = [
        { x: 5, y: 5 },   // Outside
        { x: 15, y: 15 }, // Inside
        { x: 25, y: 25 }, // Inside
        { x: 50, y: 50 }, // Outside
      ]
      interaction.startBrush(10, 10)
      interaction.updateBrush(30, 30)
      const indices = interaction.endBrush(data, 'x', 'y')
      expect(indices).toEqual([1, 2])
      expect(interaction.selectedIndices.value).toEqual([1, 2])
      expect(interaction.brush.value).toBeNull()
    })

    it('should normalize brush rect on end', () => {
      const interaction = usePlotInteraction({ selectionMode: 'brush' })
      const data = [{ x: 15, y: 15 }]
      // Start at higher coordinates
      interaction.startBrush(30, 30)
      interaction.updateBrush(10, 10)
      const indices = interaction.endBrush(data, 'x', 'y')
      expect(indices).toEqual([0])
    })

    it('should cancel brush', () => {
      const interaction = usePlotInteraction({ selectionMode: 'brush' })
      interaction.startBrush(10, 20)
      interaction.cancelBrush()
      expect(interaction.brush.value).toBeNull()
    })

    it('should return empty array when ending without brush', () => {
      const interaction = usePlotInteraction({ selectionMode: 'brush' })
      const indices = interaction.endBrush([], 'x', 'y')
      expect(indices).toEqual([])
    })
  })

  describe('focus', () => {
    it('should set focused state via ref', () => {
      const interaction = usePlotInteraction()
      interaction.isFocused.value = true
      expect(interaction.isFocused.value).toBe(true)
      interaction.isFocused.value = false
      expect(interaction.isFocused.value).toBe(false)
    })
  })

  describe('selectionMode ref', () => {
    it('should change selection mode via ref', () => {
      const interaction = usePlotInteraction()
      interaction.selectionMode.value = 'multiple'
      expect(interaction.selectionMode.value).toBe('multiple')
    })
  })

  describe('callbacks', () => {
    it('should call onSelectionChange', () => {
      let callbackValue: number[] = []
      const interaction = usePlotInteraction({
        onSelectionChange: (indices) => {
          callbackValue = indices
        },
      })
      interaction.select(5)
      expect(callbackValue).toEqual([5])
    })

    it('should call onViewportChange', () => {
      let callbackValue: any = null
      const interaction = usePlotInteraction({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
        onViewportChange: (vp) => {
          callbackValue = vp
        },
      })
      const newVp = { xMin: 10, xMax: 90, yMin: 10, yMax: 90 }
      interaction.setViewport(newVp)
      expect(callbackValue).toEqual(newVp)
    })

    it('should call onBrushEnd', () => {
      let brushRect: any = null
      let brushIndices: number[] = []
      const interaction = usePlotInteraction({
        selectionMode: 'brush',
        onBrushEnd: (rect, indices) => {
          brushRect = rect
          brushIndices = indices
        },
      })
      const data = [{ x: 15, y: 15 }]
      interaction.startBrush(10, 10)
      interaction.updateBrush(20, 20)
      interaction.endBrush(data, 'x', 'y')
      expect(brushRect).toEqual({ x1: 10, y1: 10, x2: 20, y2: 20 })
      expect(brushIndices).toEqual([0])
    })
  })

  describe('handleKeyDown', () => {
    it('should have handleKeyDown method', () => {
      const interaction = usePlotInteraction()
      expect(typeof interaction.handleKeyDown).toBe('function')
    })

    it('should not handle keys when not focused', () => {
      const interaction = usePlotInteraction({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      interaction.isFocused.value = false
      const initialVp = { ...interaction.viewport.value }
      interaction.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as KeyboardEvent)
      expect(interaction.viewport.value).toEqual(initialVp)
    })

    it('should handle arrow keys when focused', () => {
      const interaction = usePlotInteraction({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      interaction.isFocused.value = true
      interaction.handleKeyDown({ key: 'ArrowRight', preventDefault: () => {} } as KeyboardEvent)
      expect(interaction.viewport.value!.xMin).toBeGreaterThan(0)
    })
  })
})

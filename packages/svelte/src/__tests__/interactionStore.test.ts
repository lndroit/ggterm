/**
 * Tests for createInteractionStore
 */

import { describe, expect, it } from 'bun:test'
import { get } from 'svelte/store'
import { createInteractionStore } from '../stores/interactionStore'

describe('createInteractionStore', () => {
  describe('initialization', () => {
    it('should create with default state', () => {
      const store = createInteractionStore()
      expect(get(store.hoveredIndex)).toBe(-1)
      expect(get(store.selectedIndices)).toEqual([])
      expect(get(store.viewport)).toBeNull()
      expect(get(store.brush)).toBeNull()
      expect(get(store.isFocused)).toBe(false)
      expect(get(store.selectionMode)).toBe('single')
    })

    it('should accept custom selection mode', () => {
      const store = createInteractionStore({ selectionMode: 'multiple' })
      expect(get(store.selectionMode)).toBe('multiple')
    })

    it('should accept initial viewport', () => {
      const viewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
      const store = createInteractionStore({ initialViewport: viewport })
      expect(get(store.viewport)).toEqual(viewport)
    })
  })

  describe('hover', () => {
    it('should set hovered index', () => {
      const store = createInteractionStore()
      store.setHovered(5)
      expect(get(store.hoveredIndex)).toBe(5)
    })

    it('should clear hover', () => {
      const store = createInteractionStore()
      store.setHovered(5)
      store.clearHover()
      expect(get(store.hoveredIndex)).toBe(-1)
    })
  })

  describe('selection - single mode', () => {
    it('should select a point', () => {
      const store = createInteractionStore({ selectionMode: 'single' })
      store.select(3)
      expect(get(store.selectedIndices)).toEqual([3])
    })

    it('should replace selection on new select', () => {
      const store = createInteractionStore({ selectionMode: 'single' })
      store.select(1)
      store.select(2)
      expect(get(store.selectedIndices)).toEqual([2])
    })

    it('should toggle selection', () => {
      const store = createInteractionStore({ selectionMode: 'single' })
      store.toggleSelect(1)
      expect(get(store.selectedIndices)).toEqual([1])
      store.toggleSelect(1)
      expect(get(store.selectedIndices)).toEqual([])
    })
  })

  describe('selection - multiple mode', () => {
    it('should add to selection', () => {
      const store = createInteractionStore({ selectionMode: 'multiple' })
      store.select(1)
      store.select(2)
      expect(get(store.selectedIndices)).toEqual([1, 2])
    })

    it('should not duplicate selections', () => {
      const store = createInteractionStore({ selectionMode: 'multiple' })
      store.select(1)
      store.select(1)
      expect(get(store.selectedIndices)).toEqual([1])
    })

    it('should toggle selection', () => {
      const store = createInteractionStore({ selectionMode: 'multiple' })
      store.select(1)
      store.select(2)
      store.toggleSelect(1)
      expect(get(store.selectedIndices)).toEqual([2])
    })
  })

  describe('selection - none mode', () => {
    it('should not select anything', () => {
      const store = createInteractionStore({ selectionMode: 'none' })
      store.select(1)
      expect(get(store.selectedIndices)).toEqual([])
    })

    it('should not toggle selection', () => {
      const store = createInteractionStore({ selectionMode: 'none' })
      store.toggleSelect(1)
      expect(get(store.selectedIndices)).toEqual([])
    })
  })

  describe('setSelected', () => {
    it('should set selected indices directly', () => {
      const store = createInteractionStore()
      store.setSelected([1, 3, 5])
      expect(get(store.selectedIndices)).toEqual([1, 3, 5])
    })
  })

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      const store = createInteractionStore({ selectionMode: 'multiple' })
      store.select(1)
      store.select(2)
      store.clearSelection()
      expect(get(store.selectedIndices)).toEqual([])
    })
  })

  describe('viewport', () => {
    it('should set viewport', () => {
      const store = createInteractionStore()
      const viewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
      store.setViewport(viewport)
      expect(get(store.viewport)).toEqual(viewport)
    })

    it('should reset viewport to initial', () => {
      const initialViewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
      const store = createInteractionStore({ initialViewport })
      store.setViewport({ xMin: 10, xMax: 90, yMin: 10, yMax: 40 })
      store.resetViewport()
      expect(get(store.viewport)).toEqual(initialViewport)
    })

    it('should reset to null if no initial viewport', () => {
      const store = createInteractionStore()
      store.setViewport({ xMin: 0, xMax: 100, yMin: 0, yMax: 100 })
      store.resetViewport()
      expect(get(store.viewport)).toBeNull()
    })
  })

  describe('zoom', () => {
    it('should zoom in (increase factor)', () => {
      const store = createInteractionStore({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      store.zoom(2) // Zoom in 2x
      const vp = get(store.viewport)!
      // Range should be halved (100/2 = 50)
      expect(vp.xMax - vp.xMin).toBeCloseTo(50)
      expect(vp.yMax - vp.yMin).toBeCloseTo(50)
    })

    it('should zoom out (decrease factor)', () => {
      const store = createInteractionStore({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      store.zoom(0.5) // Zoom out 0.5x
      const vp = get(store.viewport)!
      // Range should be doubled (100/0.5 = 200)
      expect(vp.xMax - vp.xMin).toBeCloseTo(200)
    })

    it('should zoom around center by default', () => {
      const store = createInteractionStore({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      store.zoom(2)
      const vp = get(store.viewport)!
      // Center should still be at (50, 50)
      expect((vp.xMin + vp.xMax) / 2).toBeCloseTo(50)
      expect((vp.yMin + vp.yMax) / 2).toBeCloseTo(50)
    })

    it('should not zoom when enableZoom is false', () => {
      const initial = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }
      const store = createInteractionStore({
        initialViewport: initial,
        enableZoom: false,
      })
      store.zoom(2)
      expect(get(store.viewport)).toEqual(initial)
    })

    it('should not zoom when viewport is null', () => {
      const store = createInteractionStore()
      store.zoom(2)
      expect(get(store.viewport)).toBeNull()
    })
  })

  describe('pan', () => {
    it('should pan viewport', () => {
      const store = createInteractionStore({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      store.pan(10, 20)
      const vp = get(store.viewport)!
      expect(vp.xMin).toBe(10)
      expect(vp.xMax).toBe(110)
      expect(vp.yMin).toBe(20)
      expect(vp.yMax).toBe(120)
    })

    it('should not pan when enableZoom is false', () => {
      const initial = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }
      const store = createInteractionStore({
        initialViewport: initial,
        enableZoom: false,
      })
      store.pan(10, 10)
      expect(get(store.viewport)).toEqual(initial)
    })
  })

  describe('brush selection', () => {
    it('should start brush in brush mode', () => {
      const store = createInteractionStore({ selectionMode: 'brush' })
      store.startBrush(10, 20)
      expect(get(store.brush)).toEqual({ x1: 10, y1: 20, x2: 10, y2: 20 })
    })

    it('should not start brush in other modes', () => {
      const store = createInteractionStore({ selectionMode: 'single' })
      store.startBrush(10, 20)
      expect(get(store.brush)).toBeNull()
    })

    it('should update brush', () => {
      const store = createInteractionStore({ selectionMode: 'brush' })
      store.startBrush(10, 20)
      store.updateBrush(50, 60)
      expect(get(store.brush)).toEqual({ x1: 10, y1: 20, x2: 50, y2: 60 })
    })

    it('should end brush and select points', () => {
      const store = createInteractionStore({ selectionMode: 'brush' })
      const data = [
        { x: 5, y: 5 },   // Outside
        { x: 15, y: 15 }, // Inside
        { x: 25, y: 25 }, // Inside
        { x: 50, y: 50 }, // Outside
      ]
      store.startBrush(10, 10)
      store.updateBrush(30, 30)
      const indices = store.endBrush(data, 'x', 'y')
      expect(indices).toEqual([1, 2])
      expect(get(store.selectedIndices)).toEqual([1, 2])
      expect(get(store.brush)).toBeNull()
    })

    it('should normalize brush rect on end', () => {
      const store = createInteractionStore({ selectionMode: 'brush' })
      const data = [{ x: 15, y: 15 }]
      // Start at higher coordinates
      store.startBrush(30, 30)
      store.updateBrush(10, 10)
      const indices = store.endBrush(data, 'x', 'y')
      expect(indices).toEqual([0])
    })

    it('should cancel brush', () => {
      const store = createInteractionStore({ selectionMode: 'brush' })
      store.startBrush(10, 20)
      store.cancelBrush()
      expect(get(store.brush)).toBeNull()
    })

    it('should return empty array when ending without brush', () => {
      const store = createInteractionStore({ selectionMode: 'brush' })
      const indices = store.endBrush([], 'x', 'y')
      expect(indices).toEqual([])
    })
  })

  describe('focus', () => {
    it('should set focused state via store', () => {
      const store = createInteractionStore()
      store.isFocused.set(true)
      expect(get(store.isFocused)).toBe(true)
      store.isFocused.set(false)
      expect(get(store.isFocused)).toBe(false)
    })
  })

  describe('selectionMode store', () => {
    it('should change selection mode via store', () => {
      const store = createInteractionStore()
      store.selectionMode.set('multiple')
      expect(get(store.selectionMode)).toBe('multiple')
    })
  })

  describe('callbacks', () => {
    it('should call onSelectionChange', () => {
      let callbackValue: number[] = []
      const store = createInteractionStore({
        onSelectionChange: (indices) => {
          callbackValue = indices
        },
      })
      store.select(5)
      expect(callbackValue).toEqual([5])
    })

    it('should call onViewportChange', () => {
      let callbackValue: any = null
      const store = createInteractionStore({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
        onViewportChange: (vp) => {
          callbackValue = vp
        },
      })
      const newVp = { xMin: 10, xMax: 90, yMin: 10, yMax: 90 }
      store.setViewport(newVp)
      expect(callbackValue).toEqual(newVp)
    })

    it('should call onBrushEnd', () => {
      let brushRect: any = null
      let brushIndices: number[] = []
      const store = createInteractionStore({
        selectionMode: 'brush',
        onBrushEnd: (rect, indices) => {
          brushRect = rect
          brushIndices = indices
        },
      })
      const data = [{ x: 15, y: 15 }]
      store.startBrush(10, 10)
      store.updateBrush(20, 20)
      store.endBrush(data, 'x', 'y')
      expect(brushRect).toEqual({ x1: 10, y1: 10, x2: 20, y2: 20 })
      expect(brushIndices).toEqual([0])
    })
  })

  describe('subscriptions', () => {
    it('should notify subscribers on selection change', () => {
      const store = createInteractionStore()
      let notified = false
      const unsubscribe = store.selectedIndices.subscribe(() => {
        notified = true
      })
      store.select(1)
      expect(notified).toBe(true)
      unsubscribe()
    })

    it('should notify subscribers on viewport change', () => {
      const store = createInteractionStore({
        initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
      })
      let notified = false
      const unsubscribe = store.viewport.subscribe(() => {
        notified = true
      })
      store.pan(10, 10)
      expect(notified).toBe(true)
      unsubscribe()
    })
  })
})

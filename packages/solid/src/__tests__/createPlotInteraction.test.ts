/**
 * Tests for createPlotInteraction primitive
 */

import { describe, expect, it } from 'bun:test'
import { createRoot } from 'solid-js'
import { createPlotInteraction } from '../primitives/createPlotInteraction'

describe('createPlotInteraction', () => {
  describe('initialization', () => {
    it('should create with default state', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction()
        expect(interaction.hoveredIndex()).toBe(-1)
        expect(interaction.selectedIndices()).toEqual([])
        expect(interaction.viewport()).toBeNull()
        expect(interaction.brush()).toBeNull()
        expect(interaction.isFocused()).toBe(false)
        expect(interaction.selectionMode()).toBe('single')
        dispose()
      })
    })

    it('should accept custom selection mode', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'multiple' })
        expect(interaction.selectionMode()).toBe('multiple')
        dispose()
      })
    })

    it('should accept initial viewport', () => {
      createRoot((dispose) => {
        const viewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
        const interaction = createPlotInteraction({ initialViewport: viewport })
        expect(interaction.viewport()).toEqual(viewport)
        dispose()
      })
    })
  })

  describe('hover', () => {
    it('should set hovered index', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction()
        interaction.setHovered(5)
        expect(interaction.hoveredIndex()).toBe(5)
        dispose()
      })
    })

    it('should clear hover', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction()
        interaction.setHovered(5)
        interaction.clearHover()
        expect(interaction.hoveredIndex()).toBe(-1)
        dispose()
      })
    })
  })

  describe('selection - single mode', () => {
    it('should select a point', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'single' })
        interaction.select(3)
        expect(interaction.selectedIndices()).toEqual([3])
        dispose()
      })
    })

    it('should replace selection on new select', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'single' })
        interaction.select(1)
        interaction.select(2)
        expect(interaction.selectedIndices()).toEqual([2])
        dispose()
      })
    })

    it('should toggle selection', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'single' })
        interaction.toggleSelect(1)
        expect(interaction.selectedIndices()).toEqual([1])
        interaction.toggleSelect(1)
        expect(interaction.selectedIndices()).toEqual([])
        dispose()
      })
    })
  })

  describe('selection - multiple mode', () => {
    it('should add to selection', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'multiple' })
        interaction.select(1)
        interaction.select(2)
        expect(interaction.selectedIndices()).toEqual([1, 2])
        dispose()
      })
    })

    it('should not duplicate selections', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'multiple' })
        interaction.select(1)
        interaction.select(1)
        expect(interaction.selectedIndices()).toEqual([1])
        dispose()
      })
    })

    it('should toggle selection', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'multiple' })
        interaction.select(1)
        interaction.select(2)
        interaction.toggleSelect(1)
        expect(interaction.selectedIndices()).toEqual([2])
        dispose()
      })
    })
  })

  describe('selection - none mode', () => {
    it('should not select anything', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'none' })
        interaction.select(1)
        expect(interaction.selectedIndices()).toEqual([])
        dispose()
      })
    })

    it('should not toggle selection', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'none' })
        interaction.toggleSelect(1)
        expect(interaction.selectedIndices()).toEqual([])
        dispose()
      })
    })
  })

  describe('setSelected', () => {
    it('should set selected indices directly', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction()
        interaction.setSelected([1, 3, 5])
        expect(interaction.selectedIndices()).toEqual([1, 3, 5])
        dispose()
      })
    })
  })

  describe('clearSelection', () => {
    it('should clear all selections', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'multiple' })
        interaction.select(1)
        interaction.select(2)
        interaction.clearSelection()
        expect(interaction.selectedIndices()).toEqual([])
        dispose()
      })
    })
  })

  describe('viewport', () => {
    it('should set viewport', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction()
        const viewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
        interaction.setViewport(viewport)
        expect(interaction.viewport()).toEqual(viewport)
        dispose()
      })
    })

    it('should reset viewport to initial', () => {
      createRoot((dispose) => {
        const initialViewport = { xMin: 0, xMax: 100, yMin: 0, yMax: 50 }
        const interaction = createPlotInteraction({ initialViewport })
        interaction.setViewport({ xMin: 10, xMax: 90, yMin: 10, yMax: 40 })
        interaction.resetViewport()
        expect(interaction.viewport()).toEqual(initialViewport)
        dispose()
      })
    })
  })

  describe('zoom', () => {
    it('should zoom in (increase factor)', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({
          initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
        })
        interaction.zoom(2) // Zoom in 2x
        const vp = interaction.viewport()!
        // Range should be halved (100/2 = 50)
        expect(vp.xMax - vp.xMin).toBeCloseTo(50)
        expect(vp.yMax - vp.yMin).toBeCloseTo(50)
        dispose()
      })
    })

    it('should zoom out (decrease factor)', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({
          initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
        })
        interaction.zoom(0.5) // Zoom out 0.5x
        const vp = interaction.viewport()!
        // Range should be doubled (100/0.5 = 200)
        expect(vp.xMax - vp.xMin).toBeCloseTo(200)
        dispose()
      })
    })

    it('should not zoom when enableZoom is false', () => {
      createRoot((dispose) => {
        const initial = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }
        const interaction = createPlotInteraction({
          initialViewport: initial,
          enableZoom: false,
        })
        interaction.zoom(2)
        expect(interaction.viewport()).toEqual(initial)
        dispose()
      })
    })
  })

  describe('pan', () => {
    it('should pan viewport', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({
          initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
        })
        interaction.pan(10, 20)
        const vp = interaction.viewport()!
        expect(vp.xMin).toBe(10)
        expect(vp.xMax).toBe(110)
        expect(vp.yMin).toBe(20)
        expect(vp.yMax).toBe(120)
        dispose()
      })
    })

    it('should not pan when enableZoom is false', () => {
      createRoot((dispose) => {
        const initial = { xMin: 0, xMax: 100, yMin: 0, yMax: 100 }
        const interaction = createPlotInteraction({
          initialViewport: initial,
          enableZoom: false,
        })
        interaction.pan(10, 10)
        expect(interaction.viewport()).toEqual(initial)
        dispose()
      })
    })
  })

  describe('brush selection', () => {
    it('should start brush in brush mode', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'brush' })
        interaction.startBrush(10, 20)
        expect(interaction.brush()).toEqual({ x1: 10, y1: 20, x2: 10, y2: 20 })
        dispose()
      })
    })

    it('should not start brush in other modes', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'single' })
        interaction.startBrush(10, 20)
        expect(interaction.brush()).toBeNull()
        dispose()
      })
    })

    it('should update brush', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'brush' })
        interaction.startBrush(10, 20)
        interaction.updateBrush(50, 60)
        expect(interaction.brush()).toEqual({ x1: 10, y1: 20, x2: 50, y2: 60 })
        dispose()
      })
    })

    it('should end brush and select points', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'brush' })
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
        expect(interaction.selectedIndices()).toEqual([1, 2])
        expect(interaction.brush()).toBeNull()
        dispose()
      })
    })

    it('should cancel brush', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'brush' })
        interaction.startBrush(10, 20)
        interaction.cancelBrush()
        expect(interaction.brush()).toBeNull()
        dispose()
      })
    })
  })

  describe('focus', () => {
    it('should set focused state', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction()
        interaction.setFocused(true)
        expect(interaction.isFocused()).toBe(true)
        interaction.setFocused(false)
        expect(interaction.isFocused()).toBe(false)
        dispose()
      })
    })
  })

  describe('setSelectionMode', () => {
    it('should change selection mode', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction()
        interaction.setSelectionMode('multiple')
        expect(interaction.selectionMode()).toBe('multiple')
        dispose()
      })
    })

    it('should clear selection when set to none', () => {
      createRoot((dispose) => {
        const interaction = createPlotInteraction({ selectionMode: 'multiple' })
        interaction.select(1)
        interaction.select(2)
        interaction.setSelectionMode('none')
        expect(interaction.selectedIndices()).toEqual([])
        dispose()
      })
    })
  })

  describe('callbacks', () => {
    it('should call onSelectionChange', () => {
      createRoot((dispose) => {
        let callbackValue: number[] = []
        const interaction = createPlotInteraction({
          onSelectionChange: (indices) => {
            callbackValue = indices
          },
        })
        interaction.select(5)
        expect(callbackValue).toEqual([5])
        dispose()
      })
    })

    it('should call onViewportChange', () => {
      createRoot((dispose) => {
        let callbackValue: any = null
        const interaction = createPlotInteraction({
          initialViewport: { xMin: 0, xMax: 100, yMin: 0, yMax: 100 },
          onViewportChange: (vp) => {
            callbackValue = vp
          },
        })
        const newVp = { xMin: 10, xMax: 90, yMin: 10, yMax: 90 }
        interaction.setViewport(newVp)
        expect(callbackValue).toEqual(newVp)
        dispose()
      })
    })
  })
})

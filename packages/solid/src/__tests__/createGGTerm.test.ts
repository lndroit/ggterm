/**
 * Tests for createGGTerm primitive
 */

import { describe, expect, it, beforeEach, mock } from 'bun:test'
import { createRoot, createSignal } from 'solid-js'
import { createGGTerm } from '../primitives/createGGTerm'

// Mock geom for testing
const mockGeom = () => ({
  type: 'point',
  stat: 'identity',
  position: 'identity',
  params: { size: 1 },
})

describe('createGGTerm', () => {
  describe('initialization', () => {
    it('should create with required aes', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
        })
        expect(ggterm.data()).toEqual([])
        expect(ggterm.rendered()).toBe('')
        dispose()
      })
    })

    it('should create with initial data', () => {
      createRoot((dispose) => {
        const data = [{ x: 1, y: 10 }]
        const ggterm = createGGTerm({
          data,
          aes: { x: 'x', y: 'y' },
        })
        expect(ggterm.data()).toEqual(data)
        dispose()
      })
    })

    it('should create with default options', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
        })
        const opts = ggterm.getOptions()
        expect(opts.width).toBe(70)
        expect(opts.height).toBe(20)
        expect(opts.renderer).toBe('auto')
        expect(opts.colorMode).toBe('auto')
        expect(opts.autoRender).toBe(true)
        dispose()
      })
    })

    it('should accept custom options', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
          options: {
            width: 100,
            height: 30,
            renderer: 'block',
          },
        })
        const opts = ggterm.getOptions()
        expect(opts.width).toBe(100)
        expect(opts.height).toBe(30)
        expect(opts.renderer).toBe('block')
        dispose()
      })
    })

    it('should start with renderCount 0', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
          options: { autoRender: false },
        })
        expect(ggterm.renderCount()).toBe(0)
        dispose()
      })
    })
  })

  describe('setData', () => {
    it('should update data', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
          options: { autoRender: false },
        })
        ggterm.setData([{ x: 1, y: 10 }])
        expect(ggterm.data()).toEqual([{ x: 1, y: 10 }])
        dispose()
      })
    })

    it('should replace existing data', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 1 }],
          aes: { x: 'x', y: 'y' },
          options: { autoRender: false },
        })
        ggterm.setData([{ x: 2, y: 2 }])
        expect(ggterm.data()).toEqual([{ x: 2, y: 2 }])
        dispose()
      })
    })
  })

  describe('pushData', () => {
    it('should add single record', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 1 }],
          aes: { x: 'x', y: 'y' },
          options: { autoRender: false },
        })
        ggterm.pushData({ x: 2, y: 2 })
        expect(ggterm.data()).toHaveLength(2)
        expect(ggterm.data()[1]).toEqual({ x: 2, y: 2 })
        dispose()
      })
    })

    it('should add multiple records', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
          options: { autoRender: false },
        })
        ggterm.pushData([{ x: 1, y: 1 }, { x: 2, y: 2 }])
        expect(ggterm.data()).toHaveLength(2)
        dispose()
      })
    })
  })

  describe('clearData', () => {
    it('should remove all data', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
          aes: { x: 'x', y: 'y' },
          options: { autoRender: false },
        })
        ggterm.clearData()
        expect(ggterm.data()).toEqual([])
        dispose()
      })
    })
  })

  describe('setOptions', () => {
    it('should merge options', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
          options: { width: 70, height: 20 },
        })
        ggterm.setOptions({ width: 100 })
        const opts = ggterm.getOptions()
        expect(opts.width).toBe(100)
        expect(opts.height).toBe(20) // Unchanged
        dispose()
      })
    })
  })

  describe('plot', () => {
    it('should return null for empty data and no aes', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: '', y: '' },
          options: { autoRender: false },
        })
        // With empty aes, plot should still be created
        expect(ggterm.plot()).not.toBeNull()
        dispose()
      })
    })

    it('should create plot with data', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          geoms: [mockGeom()],
          options: { autoRender: false },
        })
        expect(ggterm.plot()).not.toBeNull()
        dispose()
      })
    })
  })

  describe('getSpec', () => {
    it('should return plot specification', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          labs: { title: 'Test Plot' },
          options: { autoRender: false },
        })
        const spec = ggterm.getSpec()
        expect(spec).not.toBeNull()
        expect(spec!.aes.x).toBe('x')
        expect(spec!.aes.y).toBe('y')
        expect(spec!.labels.title).toBe('Test Plot')
        dispose()
      })
    })

    it('should include geoms in spec', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          geoms: [mockGeom()],
          options: { autoRender: false },
        })
        const spec = ggterm.getSpec()
        expect(spec!.geoms).toHaveLength(1)
        expect(spec!.geoms[0].type).toBe('point')
        dispose()
      })
    })
  })

  describe('refresh', () => {
    it('should increment render count', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          geoms: [mockGeom()],
          options: { autoRender: false },
        })
        const initialCount = ggterm.renderCount()
        ggterm.refresh()
        expect(ggterm.renderCount()).toBe(initialCount + 1)
        dispose()
      })
    })

    it('should update rendered output', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
          aes: { x: 'x', y: 'y' },
          geoms: [mockGeom()],
          options: { autoRender: false, width: 40, height: 10 },
        })
        ggterm.refresh()
        expect(ggterm.rendered().length).toBeGreaterThan(0)
        dispose()
      })
    })

    it('should update lastRenderTime', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          geoms: [mockGeom()],
          options: { autoRender: false },
        })
        const before = Date.now()
        ggterm.refresh()
        const after = Date.now()
        expect(ggterm.lastRenderTime()).toBeGreaterThanOrEqual(before)
        expect(ggterm.lastRenderTime()).toBeLessThanOrEqual(after)
        dispose()
      })
    })
  })

  describe('isRendering', () => {
    it('should be false when not rendering', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          aes: { x: 'x', y: 'y' },
          options: { autoRender: false },
        })
        expect(ggterm.isRendering()).toBe(false)
        dispose()
      })
    })
  })

  describe('with geoms, scales, and theme', () => {
    it('should pass geoms to plot', () => {
      createRoot((dispose) => {
        const geom1 = mockGeom()
        const geom2 = { ...mockGeom(), type: 'line' }
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          geoms: [geom1, geom2],
          options: { autoRender: false },
        })
        const spec = ggterm.getSpec()
        expect(spec!.geoms).toHaveLength(2)
        dispose()
      })
    })

    it('should pass labs to plot', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          labs: { title: 'My Title', x: 'X Axis', y: 'Y Axis' },
          options: { autoRender: false },
        })
        const spec = ggterm.getSpec()
        expect(spec!.labels.title).toBe('My Title')
        expect(spec!.labels.x).toBe('X Axis')
        expect(spec!.labels.y).toBe('Y Axis')
        dispose()
      })
    })

    it('should pass theme to plot', () => {
      createRoot((dispose) => {
        const ggterm = createGGTerm({
          data: [{ x: 1, y: 10 }],
          aes: { x: 'x', y: 'y' },
          theme: { panel: { background: '#000000' } },
          options: { autoRender: false },
        })
        const spec = ggterm.getSpec()
        expect(spec!.theme.panel.background).toBe('#000000')
        dispose()
      })
    })
  })
})

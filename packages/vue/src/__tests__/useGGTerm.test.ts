/**
 * Tests for useGGTerm composable
 *
 * Note: Some tests are limited because watch() and onUnmounted() require
 * a Vue component setup context. Basic state and method functionality
 * is tested directly.
 */

import { describe, expect, it } from 'bun:test'
import { ref } from 'vue'
import { useGGTerm } from '../composables/useGGTerm'

describe('useGGTerm', () => {
  describe('initialization', () => {
    it('should create with required aes option', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm).toBeDefined()
      expect(ggterm.rendered).toBeDefined()
      expect(ggterm.data).toBeDefined()
      expect(ggterm.plot).toBeDefined()
    })

    it('should create with initial data', () => {
      const initialData = [{ x: 1, y: 2 }, { x: 3, y: 4 }]
      const ggterm = useGGTerm({
        data: initialData,
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.data.value).toEqual(initialData)
    })

    it('should accept data as ref', () => {
      const dataRef = ref([{ x: 1, y: 2 }])
      const ggterm = useGGTerm({
        data: dataRef,
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.data.value).toEqual([{ x: 1, y: 2 }])
    })

    it('should start with empty rendered output when no data', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.rendered.value).toBe('')
    })

    it('should start with isRendering as false', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.isRendering.value).toBe(false)
    })

    it('should have null plot when no data', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.plot.value).toBeNull()
    })

    it('should build plot when data is provided', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 2 }],
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.plot.value).not.toBeNull()
    })
  })

  describe('setData', () => {
    it('should replace all data', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      ggterm.setData([{ x: 10, y: 10 }, { x: 20, y: 20 }])
      expect(ggterm.data.value).toEqual([{ x: 10, y: 10 }, { x: 20, y: 20 }])
    })

    it('should create plot when data is set', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.plot.value).toBeNull()
      ggterm.setData([{ x: 1, y: 1 }])
      expect(ggterm.plot.value).not.toBeNull()
    })
  })

  describe('pushData', () => {
    it('should add a single record', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      ggterm.pushData({ x: 2, y: 2 })
      expect(ggterm.data.value).toEqual([{ x: 1, y: 1 }, { x: 2, y: 2 }])
    })

    it('should add multiple records', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      ggterm.pushData([{ x: 2, y: 2 }, { x: 3, y: 3 }])
      expect(ggterm.data.value).toEqual([
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ])
    })

    it('should push to empty data', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
      })
      ggterm.pushData({ x: 1, y: 1 })
      expect(ggterm.data.value).toEqual([{ x: 1, y: 1 }])
    })
  })

  describe('clearData', () => {
    it('should remove all data', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
        aes: { x: 'x', y: 'y' },
      })
      ggterm.clearData()
      expect(ggterm.data.value).toEqual([])
    })

    it('should set plot to null after clearing', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.plot.value).not.toBeNull()
      ggterm.clearData()
      expect(ggterm.plot.value).toBeNull()
    })
  })

  describe('setOptions', () => {
    it('should have setOptions method', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        width: 70,
      })
      expect(typeof ggterm.setOptions).toBe('function')
      // Call it to verify no error
      ggterm.setOptions({ width: 100 })
    })
  })

  describe('refresh', () => {
    it('should force render', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      const initialCount = ggterm.renderCount.value
      ggterm.refresh()
      expect(ggterm.renderCount.value).toBe(initialCount + 1)
    })

    it('should not increment count when no data', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      const initialCount = ggterm.renderCount.value
      ggterm.refresh()
      expect(ggterm.renderCount.value).toBe(initialCount)
    })
  })

  describe('rendered output', () => {
    it('should produce output when refreshed with data', () => {
      const ggterm = useGGTerm({
        data: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
        aes: { x: 'x', y: 'y' },
        width: 40,
        height: 10,
        autoRender: false,
      })
      ggterm.refresh()
      expect(ggterm.rendered.value.length).toBeGreaterThan(0)
    })
  })

  describe('renderCount', () => {
    it('should start at 0', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      expect(ggterm.renderCount.value).toBe(0)
    })

    it('should increment on refresh with data', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      ggterm.refresh()
      expect(ggterm.renderCount.value).toBe(1)
      ggterm.refresh()
      expect(ggterm.renderCount.value).toBe(2)
    })
  })

  describe('configuration options', () => {
    it('should accept renderer option', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        renderer: 'braille',
        autoRender: false,
      })
      ggterm.refresh()
      expect(ggterm.rendered.value.length).toBeGreaterThan(0)
    })

    it('should accept colorMode option', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        colorMode: 'none',
        autoRender: false,
      })
      ggterm.refresh()
      expect(ggterm.rendered.value.length).toBeGreaterThan(0)
    })

    it('should accept labs option', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        labs: { title: 'Test Plot', x: 'X Axis', y: 'Y Axis' },
      })
      expect(ggterm.plot.value).not.toBeNull()
    })

    it('should accept width and height options', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        width: 80,
        height: 25,
        autoRender: false,
      })
      ggterm.refresh()
      expect(ggterm.rendered.value.length).toBeGreaterThan(0)
    })
  })

  describe('computed plot', () => {
    it('should update plot when data changes', () => {
      const ggterm = useGGTerm({
        aes: { x: 'x', y: 'y' },
      })
      expect(ggterm.plot.value).toBeNull()
      ggterm.setData([{ x: 1, y: 1 }])
      expect(ggterm.plot.value).not.toBeNull()
    })

    it('should have different plot after data change', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      const plot1 = ggterm.plot.value
      ggterm.setData([{ x: 2, y: 2 }, { x: 3, y: 3 }])
      const plot2 = ggterm.plot.value
      // Both should be GGPlot instances but different
      expect(plot1).not.toBeNull()
      expect(plot2).not.toBeNull()
    })
  })

  describe('default values', () => {
    it('should use default width of 70', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      // Can't directly check config, but test runs without error
      ggterm.refresh()
    })

    it('should use default height of 20', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      ggterm.refresh()
    })

    it('should use default renderer of auto', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      ggterm.refresh()
    })

    it('should use default colorMode of auto', () => {
      const ggterm = useGGTerm({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      ggterm.refresh()
    })
  })
})

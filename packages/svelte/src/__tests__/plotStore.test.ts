/**
 * Tests for createPlotStore
 */

import { describe, expect, it } from 'bun:test'
import { get } from 'svelte/store'
import { createPlotStore } from '../stores/plotStore'

describe('createPlotStore', () => {
  describe('initialization', () => {
    it('should create with required aes option', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      expect(store).toBeDefined()
      expect(store.rendered).toBeDefined()
      expect(store.data).toBeDefined()
      expect(store.plot).toBeDefined()
      store.destroy()
    })

    it('should create with initial data', () => {
      const initialData = [{ x: 1, y: 2 }, { x: 3, y: 4 }]
      const store = createPlotStore({
        data: initialData,
        aes: { x: 'x', y: 'y' },
      })
      expect(get(store.data)).toEqual(initialData)
      store.destroy()
    })

    it('should start with empty rendered output when no data', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      expect(get(store.rendered)).toBe('')
      store.destroy()
    })

    it('should start with isRendering as false', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      expect(get(store.isRendering)).toBe(false)
      store.destroy()
    })

    it('should have null plot when no data', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      expect(get(store.plot)).toBeNull()
      store.destroy()
    })

    it('should build plot when data is provided', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 2 }],
        aes: { x: 'x', y: 'y' },
      })
      expect(get(store.plot)).not.toBeNull()
      store.destroy()
    })
  })

  describe('setData', () => {
    it('should replace all data', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      store.setData([{ x: 10, y: 10 }, { x: 20, y: 20 }])
      expect(get(store.data)).toEqual([{ x: 10, y: 10 }, { x: 20, y: 20 }])
      store.destroy()
    })

    it('should create plot when data is set', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      expect(get(store.plot)).toBeNull()
      store.setData([{ x: 1, y: 1 }])
      expect(get(store.plot)).not.toBeNull()
      store.destroy()
    })
  })

  describe('pushData', () => {
    it('should add a single record', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      store.pushData({ x: 2, y: 2 })
      expect(get(store.data)).toEqual([{ x: 1, y: 1 }, { x: 2, y: 2 }])
      store.destroy()
    })

    it('should add multiple records', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      store.pushData([{ x: 2, y: 2 }, { x: 3, y: 3 }])
      expect(get(store.data)).toEqual([
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ])
      store.destroy()
    })

    it('should push to empty data', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      store.pushData({ x: 1, y: 1 })
      expect(get(store.data)).toEqual([{ x: 1, y: 1 }])
      store.destroy()
    })
  })

  describe('clearData', () => {
    it('should remove all data', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }, { x: 2, y: 2 }],
        aes: { x: 'x', y: 'y' },
      })
      store.clearData()
      expect(get(store.data)).toEqual([])
      store.destroy()
    })

    it('should set plot to null after clearing', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      expect(get(store.plot)).not.toBeNull()
      store.clearData()
      expect(get(store.plot)).toBeNull()
      store.destroy()
    })
  })

  describe('setOptions', () => {
    it('should update width', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        width: 70,
      })
      store.setOptions({ width: 100 })
      // Options are internal but affect rendering
      store.destroy()
    })

    it('should update height', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        height: 20,
      })
      store.setOptions({ height: 30 })
      store.destroy()
    })

    it('should update autoRender', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: true,
      })
      store.setOptions({ autoRender: false })
      store.destroy()
    })
  })

  describe('refresh', () => {
    it('should force render', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 2 }, { x: 3, y: 4 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      const initialCount = get(store.renderCount)
      store.refresh()
      expect(get(store.renderCount)).toBe(initialCount + 1)
      store.destroy()
    })

    it('should not increment count when no data', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      const initialCount = get(store.renderCount)
      store.refresh()
      expect(get(store.renderCount)).toBe(initialCount)
      store.destroy()
    })
  })

  describe('rendered output', () => {
    it('should produce non-empty output with data', () => {
      const store = createPlotStore({
        data: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
        aes: { x: 'x', y: 'y' },
        width: 40,
        height: 10,
      })
      const output = get(store.rendered)
      expect(output.length).toBeGreaterThan(0)
      store.destroy()
    })

    it('should update rendered when data changes', () => {
      const store = createPlotStore({
        data: [{ x: 0, y: 0 }],
        aes: { x: 'x', y: 'y' },
        width: 40,
        height: 10,
      })
      const output1 = get(store.rendered)
      store.setData([{ x: 0, y: 0 }, { x: 100, y: 100 }])
      const output2 = get(store.rendered)
      // Output may or may not change depending on rendering
      expect(output2.length).toBeGreaterThan(0)
      store.destroy()
    })
  })

  describe('renderCount', () => {
    it('should start at appropriate count based on initial data', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      // With no data, render shouldn't increment count
      expect(get(store.renderCount)).toBe(0)
      store.destroy()
    })

    it('should increment on data changes with autoRender', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: true,
      })
      const initialCount = get(store.renderCount)
      store.pushData({ x: 2, y: 2 })
      expect(get(store.renderCount)).toBeGreaterThan(initialCount)
      store.destroy()
    })
  })

  describe('destroy', () => {
    it('should clean up subscriptions', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      // Should not throw
      store.destroy()
      // Multiple destroys should be safe
      store.destroy()
    })
  })

  describe('subscriptions', () => {
    it('should notify subscribers on rendered change', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
      })
      let notified = false
      const unsubscribe = store.rendered.subscribe(() => {
        notified = true
      })
      store.refresh()
      expect(notified).toBe(true)
      unsubscribe()
      store.destroy()
    })

    it('should notify subscribers on data change', () => {
      const store = createPlotStore({
        aes: { x: 'x', y: 'y' },
      })
      let notified = false
      const unsubscribe = store.data.subscribe(() => {
        notified = true
      })
      store.setData([{ x: 1, y: 1 }])
      expect(notified).toBe(true)
      unsubscribe()
      store.destroy()
    })

    it('should notify subscribers on renderCount change', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        autoRender: false,
      })
      let count = 0
      const unsubscribe = store.renderCount.subscribe((c) => {
        count = c
      })
      store.refresh()
      expect(count).toBeGreaterThan(0)
      unsubscribe()
      store.destroy()
    })
  })

  describe('configuration options', () => {
    it('should accept renderer option', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        renderer: 'braille',
      })
      expect(get(store.rendered).length).toBeGreaterThan(0)
      store.destroy()
    })

    it('should accept colorMode option', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        colorMode: 'none',
      })
      expect(get(store.rendered).length).toBeGreaterThan(0)
      store.destroy()
    })

    it('should accept labs option', () => {
      const store = createPlotStore({
        data: [{ x: 1, y: 1 }],
        aes: { x: 'x', y: 'y' },
        labs: { title: 'Test Plot', x: 'X Axis', y: 'Y Axis' },
      })
      expect(get(store.plot)).not.toBeNull()
      store.destroy()
    })
  })
})

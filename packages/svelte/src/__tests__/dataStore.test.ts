/**
 * Tests for createDataStore
 */

import { describe, expect, it } from 'bun:test'
import { get } from 'svelte/store'
import { createDataStore } from '../stores/dataStore'

describe('createDataStore', () => {
  describe('initialization', () => {
    it('should create with default empty data', () => {
      const store = createDataStore()
      expect(get(store.data)).toEqual([])
      expect(get(store.count)).toBe(0)
    })

    it('should create with initial data', () => {
      const initialData = [{ x: 1 }, { x: 2 }]
      const store = createDataStore({ initialData })
      expect(get(store.data)).toEqual(initialData)
      expect(get(store.count)).toBe(2)
    })

    it('should start with isDirty as false', () => {
      const store = createDataStore()
      expect(get(store.isDirty)).toBe(false)
    })
  })

  describe('set', () => {
    it('should replace all data', () => {
      const store = createDataStore({ initialData: [{ x: 1 }] })
      store.set([{ x: 10 }, { x: 20 }])
      expect(get(store.data)).toEqual([{ x: 10 }, { x: 20 }])
      expect(get(store.count)).toBe(2)
    })

    it('should mark data as dirty', () => {
      const store = createDataStore()
      store.set([{ x: 1 }])
      expect(get(store.isDirty)).toBe(true)
    })
  })

  describe('push', () => {
    it('should add a single record', () => {
      const store = createDataStore()
      store.push({ x: 1 })
      expect(get(store.data)).toEqual([{ x: 1 }])
      expect(get(store.count)).toBe(1)
    })

    it('should add multiple records', () => {
      const store = createDataStore()
      store.push([{ x: 1 }, { x: 2 }])
      expect(get(store.data)).toEqual([{ x: 1 }, { x: 2 }])
    })

    it('should append to existing data', () => {
      const store = createDataStore({ initialData: [{ x: 1 }] })
      store.push({ x: 2 })
      expect(get(store.data)).toEqual([{ x: 1 }, { x: 2 }])
    })

    it('should mark data as dirty', () => {
      const store = createDataStore()
      store.push({ x: 1 })
      expect(get(store.isDirty)).toBe(true)
    })
  })

  describe('updateAt', () => {
    it('should update record at index', () => {
      const store = createDataStore({
        initialData: [{ x: 1, y: 10 }, { x: 2, y: 20 }],
      })
      store.updateAt(0, { y: 100 })
      expect(get(store.data)[0]).toEqual({ x: 1, y: 100 })
    })

    it('should not modify other records', () => {
      const store = createDataStore({
        initialData: [{ x: 1 }, { x: 2 }],
      })
      store.updateAt(0, { x: 10 })
      expect(get(store.data)[1]).toEqual({ x: 2 })
    })

    it('should ignore invalid index', () => {
      const store = createDataStore({ initialData: [{ x: 1 }] })
      store.updateAt(-1, { x: 10 })
      store.updateAt(10, { x: 10 })
      expect(get(store.data)).toEqual([{ x: 1 }])
    })

    it('should mark data as dirty', () => {
      const store = createDataStore({ initialData: [{ x: 1 }] })
      store.markClean()
      store.updateAt(0, { x: 10 })
      expect(get(store.isDirty)).toBe(true)
    })
  })

  describe('removeWhere', () => {
    it('should remove matching records', () => {
      const store = createDataStore({
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }],
      })
      store.removeWhere((r) => (r as { x: number }).x > 1)
      expect(get(store.data)).toEqual([{ x: 1 }])
    })

    it('should keep non-matching records', () => {
      const store = createDataStore({
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }],
      })
      store.removeWhere((r) => (r as { x: number }).x === 2)
      expect(get(store.data)).toEqual([{ x: 1 }, { x: 3 }])
    })
  })

  describe('clear', () => {
    it('should remove all data', () => {
      const store = createDataStore({
        initialData: [{ x: 1 }, { x: 2 }],
      })
      store.clear()
      expect(get(store.data)).toEqual([])
      expect(get(store.count)).toBe(0)
    })

    it('should mark data as dirty', () => {
      const store = createDataStore({ initialData: [{ x: 1 }] })
      store.markClean()
      store.clear()
      expect(get(store.isDirty)).toBe(true)
    })
  })

  describe('markClean', () => {
    it('should reset dirty flag', () => {
      const store = createDataStore()
      store.push({ x: 1 })
      expect(get(store.isDirty)).toBe(true)
      store.markClean()
      expect(get(store.isDirty)).toBe(false)
    })
  })

  describe('windowed with maxPoints', () => {
    it('should limit to maxPoints', () => {
      const store = createDataStore({
        maxPoints: 3,
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }],
      })
      expect(get(store.windowed)).toEqual([{ x: 3 }, { x: 4 }, { x: 5 }])
    })

    it('should return all if under maxPoints', () => {
      const store = createDataStore({
        maxPoints: 10,
        initialData: [{ x: 1 }, { x: 2 }],
      })
      expect(get(store.windowed)).toEqual([{ x: 1 }, { x: 2 }])
    })
  })

  describe('windowed with timeWindowMs', () => {
    it('should filter old records', () => {
      const now = Date.now()
      const store = createDataStore({
        timeWindowMs: 1000,
        timeField: 'time',
        initialData: [
          { time: now - 2000, value: 1 }, // Too old
          { time: now - 500, value: 2 },  // Within window
          { time: now, value: 3 },         // Within window
        ],
      })
      const windowed = get(store.windowed)
      expect(windowed).toHaveLength(2)
      expect(windowed[0]).toEqual({ time: now - 500, value: 2 })
    })

    it('should use custom timeField', () => {
      const now = Date.now()
      const store = createDataStore({
        timeWindowMs: 1000,
        timeField: 'timestamp',
        initialData: [
          { timestamp: now - 2000 },
          { timestamp: now },
        ],
      })
      expect(get(store.windowed)).toHaveLength(1)
    })
  })

  describe('applyMaxPoints', () => {
    it('should truncate data to maxPoints', () => {
      const store = createDataStore({
        maxPoints: 2,
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }],
      })
      store.applyMaxPoints()
      expect(get(store.data)).toEqual([{ x: 3 }, { x: 4 }])
    })

    it('should keep most recent points', () => {
      const store = createDataStore({
        maxPoints: 2,
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }],
      })
      store.applyMaxPoints()
      expect(get(store.data)[0]).toEqual({ x: 2 })
      expect(get(store.data)[1]).toEqual({ x: 3 })
    })

    it('should not modify data if under maxPoints', () => {
      const store = createDataStore({
        maxPoints: 10,
        initialData: [{ x: 1 }, { x: 2 }],
      })
      store.applyMaxPoints()
      expect(get(store.data)).toEqual([{ x: 1 }, { x: 2 }])
    })
  })

  describe('applyTimeWindow', () => {
    it('should remove old records from data', () => {
      const now = Date.now()
      const store = createDataStore({
        timeWindowMs: 1000,
        initialData: [
          { time: now - 2000 },
          { time: now },
        ],
      })
      store.applyTimeWindow()
      expect(get(store.data)).toHaveLength(1)
      expect(get(store.data)[0]).toEqual({ time: now })
    })

    it('should do nothing without timeWindowMs', () => {
      const now = Date.now()
      const store = createDataStore({
        initialData: [
          { time: now - 2000 },
          { time: now },
        ],
      })
      store.applyTimeWindow()
      expect(get(store.data)).toHaveLength(2)
    })
  })

  describe('subscriptions', () => {
    it('should notify subscribers on data change', () => {
      const store = createDataStore()
      let notified = false
      const unsubscribe = store.data.subscribe(() => {
        notified = true
      })
      store.push({ x: 1 })
      expect(notified).toBe(true)
      unsubscribe()
    })

    it('should notify count subscribers', () => {
      const store = createDataStore()
      let count = 0
      const unsubscribe = store.count.subscribe((c) => {
        count = c
      })
      store.push({ x: 1 })
      expect(count).toBe(1)
      unsubscribe()
    })
  })
})

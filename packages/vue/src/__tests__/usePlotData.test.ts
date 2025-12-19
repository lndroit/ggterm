/**
 * Tests for usePlotData composable
 */

import { describe, expect, it } from 'bun:test'
import { usePlotData } from '../composables/usePlotData'

describe('usePlotData', () => {
  describe('initialization', () => {
    it('should create with default empty data', () => {
      const plotData = usePlotData()
      expect(plotData.data.value).toEqual([])
      expect(plotData.count.value).toBe(0)
    })

    it('should create with initial data', () => {
      const initialData = [{ x: 1 }, { x: 2 }]
      const plotData = usePlotData({ initialData })
      expect(plotData.data.value).toEqual(initialData)
      expect(plotData.count.value).toBe(2)
    })

    it('should start with isDirty as false', () => {
      const plotData = usePlotData()
      expect(plotData.isDirty.value).toBe(false)
    })
  })

  describe('set', () => {
    it('should replace all data', () => {
      const plotData = usePlotData({ initialData: [{ x: 1 }] })
      plotData.set([{ x: 10 }, { x: 20 }])
      expect(plotData.data.value).toEqual([{ x: 10 }, { x: 20 }])
      expect(plotData.count.value).toBe(2)
    })

    it('should mark data as dirty', () => {
      const plotData = usePlotData()
      plotData.set([{ x: 1 }])
      expect(plotData.isDirty.value).toBe(true)
    })
  })

  describe('push', () => {
    it('should add a single record', () => {
      const plotData = usePlotData()
      plotData.push({ x: 1 })
      expect(plotData.data.value).toEqual([{ x: 1 }])
      expect(plotData.count.value).toBe(1)
    })

    it('should add multiple records', () => {
      const plotData = usePlotData()
      plotData.push([{ x: 1 }, { x: 2 }])
      expect(plotData.data.value).toEqual([{ x: 1 }, { x: 2 }])
    })

    it('should append to existing data', () => {
      const plotData = usePlotData({ initialData: [{ x: 1 }] })
      plotData.push({ x: 2 })
      expect(plotData.data.value).toEqual([{ x: 1 }, { x: 2 }])
    })

    it('should mark data as dirty', () => {
      const plotData = usePlotData()
      plotData.push({ x: 1 })
      expect(plotData.isDirty.value).toBe(true)
    })

    it('should auto-truncate when exceeding 1.5x maxPoints', () => {
      const plotData = usePlotData({ maxPoints: 2 })
      // Push enough to exceed 1.5x (3 points)
      plotData.push([{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }])
      expect(plotData.data.value.length).toBe(2)
    })
  })

  describe('updateAt', () => {
    it('should update record at index', () => {
      const plotData = usePlotData({
        initialData: [{ x: 1, y: 10 }, { x: 2, y: 20 }],
      })
      plotData.updateAt(0, { y: 100 })
      expect(plotData.data.value[0]).toEqual({ x: 1, y: 100 })
    })

    it('should not modify other records', () => {
      const plotData = usePlotData({
        initialData: [{ x: 1 }, { x: 2 }],
      })
      plotData.updateAt(0, { x: 10 })
      expect(plotData.data.value[1]).toEqual({ x: 2 })
    })

    it('should ignore invalid index', () => {
      const plotData = usePlotData({ initialData: [{ x: 1 }] })
      plotData.updateAt(-1, { x: 10 })
      plotData.updateAt(10, { x: 10 })
      expect(plotData.data.value).toEqual([{ x: 1 }])
    })

    it('should mark data as dirty', () => {
      const plotData = usePlotData({ initialData: [{ x: 1 }] })
      plotData.markClean()
      plotData.updateAt(0, { x: 10 })
      expect(plotData.isDirty.value).toBe(true)
    })
  })

  describe('removeWhere', () => {
    it('should remove matching records', () => {
      const plotData = usePlotData({
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }],
      })
      plotData.removeWhere((r) => (r as { x: number }).x > 1)
      expect(plotData.data.value).toEqual([{ x: 1 }])
    })

    it('should keep non-matching records', () => {
      const plotData = usePlotData({
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }],
      })
      plotData.removeWhere((r) => (r as { x: number }).x === 2)
      expect(plotData.data.value).toEqual([{ x: 1 }, { x: 3 }])
    })
  })

  describe('clear', () => {
    it('should remove all data', () => {
      const plotData = usePlotData({
        initialData: [{ x: 1 }, { x: 2 }],
      })
      plotData.clear()
      expect(plotData.data.value).toEqual([])
      expect(plotData.count.value).toBe(0)
    })

    it('should mark data as dirty', () => {
      const plotData = usePlotData({ initialData: [{ x: 1 }] })
      plotData.markClean()
      plotData.clear()
      expect(plotData.isDirty.value).toBe(true)
    })
  })

  describe('markClean', () => {
    it('should reset dirty flag', () => {
      const plotData = usePlotData()
      plotData.push({ x: 1 })
      expect(plotData.isDirty.value).toBe(true)
      plotData.markClean()
      expect(plotData.isDirty.value).toBe(false)
    })
  })

  describe('windowed with maxPoints', () => {
    it('should limit to maxPoints', () => {
      const plotData = usePlotData({
        maxPoints: 3,
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }, { x: 5 }],
      })
      expect(plotData.windowed.value).toEqual([{ x: 3 }, { x: 4 }, { x: 5 }])
    })

    it('should return all if under maxPoints', () => {
      const plotData = usePlotData({
        maxPoints: 10,
        initialData: [{ x: 1 }, { x: 2 }],
      })
      expect(plotData.windowed.value).toEqual([{ x: 1 }, { x: 2 }])
    })
  })

  describe('windowed with timeWindowMs', () => {
    it('should filter old records', () => {
      const now = Date.now()
      const plotData = usePlotData({
        timeWindowMs: 1000,
        timeField: 'time',
        initialData: [
          { time: now - 2000, value: 1 }, // Too old
          { time: now - 500, value: 2 },  // Within window
          { time: now, value: 3 },         // Within window
        ],
      })
      const windowed = plotData.windowed.value
      expect(windowed).toHaveLength(2)
      expect(windowed[0]).toEqual({ time: now - 500, value: 2 })
    })

    it('should use custom timeField', () => {
      const now = Date.now()
      const plotData = usePlotData({
        timeWindowMs: 1000,
        timeField: 'timestamp',
        initialData: [
          { timestamp: now - 2000 },
          { timestamp: now },
        ],
      })
      expect(plotData.windowed.value).toHaveLength(1)
    })
  })

  describe('applyMaxPoints', () => {
    it('should truncate data to maxPoints', () => {
      const plotData = usePlotData({
        maxPoints: 2,
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }, { x: 4 }],
      })
      plotData.applyMaxPoints()
      expect(plotData.data.value).toEqual([{ x: 3 }, { x: 4 }])
    })

    it('should keep most recent points', () => {
      const plotData = usePlotData({
        maxPoints: 2,
        initialData: [{ x: 1 }, { x: 2 }, { x: 3 }],
      })
      plotData.applyMaxPoints()
      expect(plotData.data.value[0]).toEqual({ x: 2 })
      expect(plotData.data.value[1]).toEqual({ x: 3 })
    })

    it('should not modify data if under maxPoints', () => {
      const plotData = usePlotData({
        maxPoints: 10,
        initialData: [{ x: 1 }, { x: 2 }],
      })
      plotData.applyMaxPoints()
      expect(plotData.data.value).toEqual([{ x: 1 }, { x: 2 }])
    })
  })

  describe('applyTimeWindow', () => {
    it('should remove old records from data', () => {
      const now = Date.now()
      const plotData = usePlotData({
        timeWindowMs: 1000,
        initialData: [
          { time: now - 2000 },
          { time: now },
        ],
      })
      plotData.applyTimeWindow()
      expect(plotData.data.value).toHaveLength(1)
      expect(plotData.data.value[0]).toEqual({ time: now })
    })

    it('should do nothing without timeWindowMs', () => {
      const now = Date.now()
      const plotData = usePlotData({
        initialData: [
          { time: now - 2000 },
          { time: now },
        ],
      })
      plotData.applyTimeWindow()
      expect(plotData.data.value).toHaveLength(2)
    })
  })
})

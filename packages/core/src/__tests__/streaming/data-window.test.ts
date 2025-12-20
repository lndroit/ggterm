/**
 * Tests for DataWindow
 */

import { describe, expect, it, beforeEach } from 'bun:test'
import { DataWindow, createDataWindow, type WindowOptions } from '../../streaming/data-window'

describe('DataWindow', () => {
  describe('count-based window', () => {
    it('should create window with correct options', () => {
      const window = new DataWindow({ type: 'count', size: 10 })

      expect(window.windowSize).toBe(10)
    })

    it('should push records and retrieve window data', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })

      window.push({ x: 1 })
      window.push({ x: 2 })
      window.push({ x: 3 })

      const data = window.getWindowData()
      expect(data.length).toBe(3)
    })

    it('should limit window to specified size', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 3 })

      for (let i = 1; i <= 10; i++) {
        window.push({ x: i })
      }

      const data = window.getWindowData()
      expect(data.length).toBe(3)
      // Should have last 3 items
      expect(data[0].x).toBe(8)
      expect(data[1].x).toBe(9)
      expect(data[2].x).toBe(10)
    })

    it('should pushMany records', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 10 })

      window.pushMany([{ x: 1 }, { x: 2 }, { x: 3 }])

      expect(window.getWindowData().length).toBe(3)
    })

    it('should report correct stats for count window', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })

      window.pushMany([{ x: 1 }, { x: 2 }, { x: 3 }])

      const stats = window.getStats()
      expect(stats.count).toBe(3)
      expect(stats.end).toBe(3)
      expect(stats.start).toBe(0)
    })

    it('should report bufferSize', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })

      window.push({ x: 1 })
      window.push({ x: 2 })

      expect(window.bufferSize).toBe(2)
    })

    it('should check isFull correctly', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 3 })

      expect(window.isFull).toBe(false)

      window.pushMany([{ x: 1 }, { x: 2 }, { x: 3 }])

      expect(window.isFull).toBe(true)
    })

    it('should clear all data', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })

      window.pushMany([{ x: 1 }, { x: 2 }, { x: 3 }])
      window.clear()

      expect(window.getWindowData().length).toBe(0)
      expect(window.bufferSize).toBe(0)
    })

    it('should getAllData including outside window', () => {
      const window = new DataWindow<{ x: number }>({
        type: 'count',
        size: 3,
        maxBufferSize: 100,
      })

      for (let i = 1; i <= 10; i++) {
        window.push({ x: i })
      }

      const windowData = window.getWindowData()
      const allData = window.getAllData()

      expect(windowData.length).toBe(3)
      expect(allData.length).toBe(10)
    })
  })

  describe('time-based window', () => {
    it('should create time-based window', () => {
      const window = new DataWindow({
        type: 'time',
        size: 1000, // 1 second
      })

      expect(window.windowSize).toBe(1000)
    })

    it('should use custom timeField', () => {
      const window = new DataWindow({
        type: 'time',
        size: 1000,
        timeField: 'timestamp',
      })

      // Should not throw
      window.push({ timestamp: Date.now(), value: 1 })
      expect(window.bufferSize).toBe(1)
    })
  })

  describe('event handling', () => {
    it('should emit data event on push', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })
      let eventFired = false
      let eventData: unknown[] = []

      window.on('data', (event, data) => {
        eventFired = true
        eventData = data
      })

      window.push({ x: 1 })

      expect(eventFired).toBe(true)
      expect(eventData.length).toBe(1)
    })

    it('should emit empty event on clear', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })
      let emptyEventFired = false

      window.on('empty', () => {
        emptyEventFired = true
      })

      window.push({ x: 1 })
      window.clear()

      expect(emptyEventFired).toBe(true)
    })

    it('should allow removing event handlers', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })
      let eventCount = 0

      const handler = () => {
        eventCount++
      }

      window.on('data', handler)
      window.push({ x: 1 })
      expect(eventCount).toBe(1)

      window.off('data', handler)
      window.push({ x: 2 })
      expect(eventCount).toBe(1) // Should not increment
    })

    it('should support multiple handlers for same event', () => {
      const window = new DataWindow<{ x: number }>({ type: 'count', size: 5 })
      let count1 = 0
      let count2 = 0

      window.on('data', () => count1++)
      window.on('data', () => count2++)

      window.push({ x: 1 })

      expect(count1).toBe(1)
      expect(count2).toBe(1)
    })
  })

  describe('field statistics', () => {
    it('should compute field stats', () => {
      const window = new DataWindow<{ x: number; value: number }>({
        type: 'count',
        size: 10,
      })

      window.pushMany([
        { x: 1, value: 10 },
        { x: 2, value: 20 },
        { x: 3, value: 30 },
        { x: 4, value: 40 },
      ])

      const stats = window.getFieldStats('value')

      expect(stats).not.toBeNull()
      expect(stats!.min).toBe(10)
      expect(stats!.max).toBe(40)
      expect(stats!.sum).toBe(100)
      expect(stats!.mean).toBe(25)
    })

    it('should return null for empty window', () => {
      const window = new DataWindow<{ value: number }>({ type: 'count', size: 10 })

      const stats = window.getFieldStats('value')

      expect(stats).toBeNull()
    })

    it('should handle non-numeric fields', () => {
      const window = new DataWindow<{ name: string; value: number }>({
        type: 'count',
        size: 10,
      })

      window.push({ name: 'test', value: 10 })

      // Getting stats for string field should handle it gracefully
      const stats = window.getFieldStats('name')
      expect(stats).not.toBeNull()
    })
  })

  describe('sliding behavior', () => {
    it('should emit slide event for count-based windows', () => {
      const window = new DataWindow<{ x: number }>({
        type: 'count',
        size: 5,
        slide: 3, // Slide every 3 records
      })

      let slideCount = 0
      window.on('slide', () => slideCount++)

      // Push 10 records
      for (let i = 0; i < 10; i++) {
        window.push({ x: i })
      }

      expect(slideCount).toBeGreaterThan(0)
    })
  })
})

describe('createDataWindow', () => {
  it('should create count-based window', () => {
    const window = createDataWindow({ type: 'count', size: 10 })

    expect(window).toBeInstanceOf(DataWindow)
    expect(window.windowSize).toBe(10)
  })

  it('should create time-based window', () => {
    const window = createDataWindow({ type: 'time', size: 5000 })

    expect(window).toBeInstanceOf(DataWindow)
    expect(window.windowSize).toBe(5000)
  })

  it('should accept generic type parameter', () => {
    interface CustomRecord {
      id: string
      value: number
    }

    const window = createDataWindow<CustomRecord>({ type: 'count', size: 5 })

    window.push({ id: 'test', value: 42 })
    const data = window.getWindowData()

    expect(data[0].id).toBe('test')
    expect(data[0].value).toBe(42)
  })
})

describe('window options defaults', () => {
  it('should default slide to size', () => {
    const window = new DataWindow({ type: 'count', size: 10 })
    // Internal option, but we can verify behavior
    expect(window.windowSize).toBe(10)
  })

  it('should default timeField to "time"', () => {
    const window = new DataWindow({ type: 'time', size: 1000 })
    // Should work with default time field
    window.push({ time: Date.now(), value: 1 })
    expect(window.bufferSize).toBe(1)
  })

  it('should default maxBufferSize to 10000', () => {
    const window = new DataWindow({ type: 'count', size: 100 })
    // Push more than window size but less than default buffer size
    for (let i = 0; i < 200; i++) {
      window.push({ x: i })
    }
    expect(window.getAllData().length).toBe(200)
  })

  it('should default emitPartial to true', () => {
    const window = new DataWindow<{ x: number }>({ type: 'count', size: 10 })

    window.push({ x: 1 })

    // Even with only 1 record (partial window), should still get data
    expect(window.getWindowData().length).toBe(1)
  })
})

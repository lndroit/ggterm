/**
 * Tests for Level of Detail (LOD)
 */

import { describe, expect, it } from 'bun:test'
import {
  LevelOfDetail,
  createLOD,
  DEFAULT_LOD_LEVELS,
  type LODLevel,
} from '../../performance/level-of-detail'

describe('DEFAULT_LOD_LEVELS', () => {
  it('should have 5 levels', () => {
    expect(DEFAULT_LOD_LEVELS).toHaveLength(5)
  })

  it('should have levels sorted by threshold ascending', () => {
    for (let i = 1; i < DEFAULT_LOD_LEVELS.length; i++) {
      expect(DEFAULT_LOD_LEVELS[i].threshold).toBeGreaterThanOrEqual(
        DEFAULT_LOD_LEVELS[i - 1].threshold
      )
    }
  })

  it('should have named levels', () => {
    const names = DEFAULT_LOD_LEVELS.map((l) => l.name)
    expect(names).toContain('full')
    expect(names).toContain('medium')
    expect(names).toContain('low')
    expect(names).toContain('veryLow')
    expect(names).toContain('minimal')
  })

  it('should specify sampling methods', () => {
    const methodLevels = DEFAULT_LOD_LEVELS.filter((l) => l.samplingMethod)
    expect(methodLevels.length).toBeGreaterThan(0)
  })
})

describe('LevelOfDetail', () => {
  describe('constructor', () => {
    it('should create with default levels', () => {
      const lod = new LevelOfDetail({ levels: [] })

      expect(lod.getLevels()).toHaveLength(5) // Default levels
    })

    it('should create with custom levels', () => {
      const customLevels: LODLevel[] = [
        { name: 'high', maxPoints: 1000, threshold: 0 },
        { name: 'low', maxPoints: 100, threshold: 1000 },
      ]
      const lod = new LevelOfDetail({ levels: customLevels })

      expect(lod.getLevels()).toHaveLength(2)
    })

    it('should sort levels by threshold', () => {
      const customLevels: LODLevel[] = [
        { name: 'low', maxPoints: 100, threshold: 1000 },
        { name: 'high', maxPoints: 1000, threshold: 0 },
      ]
      const lod = new LevelOfDetail({ levels: customLevels })

      const levels = lod.getLevels()
      expect(levels[0].name).toBe('high') // Lowest threshold first
      expect(levels[1].name).toBe('low')
    })

    it('should use default field names', () => {
      const lod = new LevelOfDetail({ levels: [] })

      // Process should work with default x/y fields
      const data = [{ x: 1, y: 1 }]
      const result = lod.process(data)
      expect(result).toHaveLength(1)
    })
  })

  describe('selectLevel', () => {
    it('should select first level for small data', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const level = lod.selectLevel(100)

      expect(level.name).toBe('full')
    })

    it('should select appropriate level for medium data', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const level = lod.selectLevel(3000)

      expect(level.name).toBe('medium')
    })

    it('should select highest threshold level for large data', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const level = lod.selectLevel(1000000)

      expect(level.name).toBe('minimal')
    })

    it('should update current level', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      lod.selectLevel(1000000)

      expect(lod.getCurrentLevel().name).toBe('minimal')
    })
  })

  describe('process', () => {
    it('should return data unchanged if within maxPoints', () => {
      const lod = new LevelOfDetail({
        levels: [{ name: 'full', maxPoints: 100, threshold: 0 }],
      })

      const data = Array.from({ length: 50 }, (_, i) => ({ x: i, y: i }))
      const result = lod.process(data)

      expect(result).toHaveLength(50)
      expect(result).toEqual(data)
    })

    it('should sample data when exceeds maxPoints', () => {
      const lod = new LevelOfDetail({
        levels: [{ name: 'full', maxPoints: 50, threshold: 0 }],
      })

      const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i }))
      const result = lod.process(data)

      expect(result.length).toBeLessThanOrEqual(50)
    })

    it('should auto-select level when autoSelect is true', () => {
      const lod = new LevelOfDetail({
        levels: [
          { name: 'high', maxPoints: 1000, threshold: 0 },
          { name: 'low', maxPoints: 100, threshold: 500 },
        ],
        autoSelect: true,
      })

      const data = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i }))
      const result = lod.process(data)

      expect(result.length).toBeLessThanOrEqual(100)
    })

    it('should respect current level when autoSelect is false', () => {
      const lod = new LevelOfDetail({
        levels: [
          { name: 'high', maxPoints: 1000, threshold: 0 },
          { name: 'low', maxPoints: 100, threshold: 500 },
        ],
        autoSelect: false,
      })

      const data = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i }))
      const result = lod.process(data)

      // Should use first level (high) since autoSelect is false
      expect(result.length).toBeLessThanOrEqual(1000)
    })
  })

  describe('applyLevel', () => {
    it('should apply systematic sampling', () => {
      const lod = new LevelOfDetail({ levels: [] })
      const level: LODLevel = {
        name: 'test',
        maxPoints: 10,
        threshold: 0,
        samplingMethod: 'systematic',
      }

      const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i }))
      const result = lod.applyLevel(data, level)

      expect(result.length).toBe(10)
    })

    it('should apply LTTB sampling', () => {
      const lod = new LevelOfDetail({
        levels: [],
        xField: 'x',
        yField: 'y',
      })
      const level: LODLevel = {
        name: 'test',
        maxPoints: 10,
        threshold: 0,
        samplingMethod: 'lttb',
      }

      const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: Math.sin(i) }))
      const result = lod.applyLevel(data, level)

      expect(result.length).toBe(10)
      // LTTB preserves first and last
      expect(result[0]).toEqual(data[0])
      expect(result[result.length - 1]).toEqual(data[data.length - 1])
    })

    it('should apply binned sampling', () => {
      const lod = new LevelOfDetail({
        levels: [],
        xField: 'x',
        yField: 'y',
      })
      const level: LODLevel = {
        name: 'test',
        maxPoints: 10,
        threshold: 0,
        samplingMethod: 'binned',
        binResolution: 5,
      }

      const data = Array.from({ length: 100 }, (_, i) => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
      }))
      const result = lod.applyLevel(data, level)

      // Binned data should have fewer points
      expect(result.length).toBeLessThan(data.length)
    })
  })

  describe('updateRenderTime', () => {
    it('should reduce points when render is slow', () => {
      const lod = new LevelOfDetail({
        levels: [{ name: 'test', maxPoints: 1000, threshold: 0 }],
        targetRenderMs: 16,
      })

      const initialStats = lod.getStats()
      const initialPoints = initialStats.adaptiveMaxPoints

      // Simulate slow render (much slower than 16ms target)
      lod.updateRenderTime(100)

      const newStats = lod.getStats()
      expect(newStats.adaptiveMaxPoints).toBeLessThan(initialPoints)
    })

    it('should increase points when render is fast', () => {
      const lod = new LevelOfDetail({
        levels: [{ name: 'test', maxPoints: 1000, threshold: 0 }],
        targetRenderMs: 16,
      })

      // First, make it slow to reduce points
      lod.updateRenderTime(100)
      const reducedPoints = lod.getStats().adaptiveMaxPoints

      // Then make it fast to increase points
      lod.updateRenderTime(5)

      expect(lod.getStats().adaptiveMaxPoints).toBeGreaterThan(reducedPoints)
    })

    it('should update lastRenderMs', () => {
      const lod = new LevelOfDetail({ levels: [] })

      lod.updateRenderTime(25)

      expect(lod.getStats().lastRenderMs).toBe(25)
    })
  })

  describe('getCurrentLevel', () => {
    it('should return current level', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const level = lod.getCurrentLevel()

      expect(level.name).toBe('full') // Initial level
    })
  })

  describe('getLevels', () => {
    it('should return copy of levels', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const levels = lod.getLevels()
      levels.push({ name: 'new', maxPoints: 1, threshold: 0 })

      expect(lod.getLevels()).toHaveLength(5) // Original unchanged
    })
  })

  describe('setLevel', () => {
    it('should set level by name', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const success = lod.setLevel('low')

      expect(success).toBe(true)
      expect(lod.getCurrentLevel().name).toBe('low')
    })

    it('should return false for unknown level', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const success = lod.setLevel('unknown')

      expect(success).toBe(false)
    })

    it('should update adaptive max points', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      lod.setLevel('minimal')

      expect(lod.getStats().adaptiveMaxPoints).toBe(100) // minimal maxPoints
    })
  })

  describe('getStats', () => {
    it('should return all stats', () => {
      const lod = new LevelOfDetail({
        levels: DEFAULT_LOD_LEVELS,
        targetRenderMs: 20,
      })

      const stats = lod.getStats()

      expect(stats).toHaveProperty('currentLevel')
      expect(stats).toHaveProperty('maxPoints')
      expect(stats).toHaveProperty('adaptiveMaxPoints')
      expect(stats).toHaveProperty('lastRenderMs')
      expect(stats).toHaveProperty('targetRenderMs')
      expect(stats.targetRenderMs).toBe(20)
    })
  })

  describe('processAdaptive', () => {
    it('should return data unchanged if within adaptive limit', () => {
      const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

      const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i }))
      const result = lod.processAdaptive(data)

      expect(result).toHaveLength(100)
    })

    it('should sample data when exceeds adaptive limit', () => {
      const lod = new LevelOfDetail({
        levels: [{ name: 'test', maxPoints: 50, threshold: 0 }],
      })

      // Reduce adaptive limit
      for (let i = 0; i < 10; i++) {
        lod.updateRenderTime(100)
      }

      const data = Array.from({ length: 1000 }, (_, i) => ({ x: i, y: i }))
      const result = lod.processAdaptive(data)

      expect(result.length).toBeLessThan(data.length)
    })
  })
})

describe('createLOD', () => {
  it('should create LevelOfDetail instance', () => {
    const lod = createLOD()

    expect(lod).toBeInstanceOf(LevelOfDetail)
  })

  it('should use default levels when none provided', () => {
    const lod = createLOD()

    expect(lod.getLevels()).toHaveLength(5)
  })

  it('should accept custom options', () => {
    const lod = createLOD({
      levels: [{ name: 'custom', maxPoints: 50, threshold: 0 }],
      xField: 'time',
      yField: 'value',
      targetRenderMs: 32,
    })

    expect(lod.getLevels()).toHaveLength(1)
    expect(lod.getStats().targetRenderMs).toBe(32)
  })

  it('should accept type parameter', () => {
    interface TimePoint {
      time: number
      value: number
    }

    const lod = createLOD<TimePoint>({
      xField: 'time',
      yField: 'value',
    })

    const data: TimePoint[] = Array.from({ length: 100 }, (_, i) => ({
      time: i,
      value: Math.random(),
    }))

    const result = lod.process(data)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('edge cases', () => {
  it('should handle empty data', () => {
    const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

    const result = lod.process([])

    expect(result).toEqual([])
  })

  it('should handle single point', () => {
    const lod = new LevelOfDetail({ levels: DEFAULT_LOD_LEVELS })

    const result = lod.process([{ x: 1, y: 1 }])

    expect(result).toHaveLength(1)
  })

  it('should handle very low adaptive limit', () => {
    const lod = new LevelOfDetail({
      levels: [{ name: 'test', maxPoints: 100, threshold: 0 }],
    })

    // Force adaptive limit very low
    for (let i = 0; i < 50; i++) {
      lod.updateRenderTime(1000)
    }

    expect(lod.getStats().adaptiveMaxPoints).toBeGreaterThanOrEqual(50) // Min limit
  })

  it('should handle binned with empty bins', () => {
    const lod = new LevelOfDetail({
      levels: [],
      xField: 'x',
      yField: 'y',
    })
    const level: LODLevel = {
      name: 'test',
      maxPoints: 10,
      threshold: 0,
      samplingMethod: 'binned',
      binResolution: 100,
    }

    // Sparse data that might leave some bins empty
    const data = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]
    const result = lod.applyLevel(data, level)

    expect(result.length).toBe(2) // Each point in its own bin
  })
})

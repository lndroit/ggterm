/**
 * Tests for Data Sampling
 */

import { describe, expect, it } from 'bun:test'
import {
  systematicSample,
  randomSample,
  reservoirSample,
  stratifiedSample,
  lttbSample,
  DataSampler,
  createSampler,
  autoSample,
} from '../../performance/sampling'

describe('systematicSample', () => {
  it('should return all data if size is less than target', () => {
    const data = [1, 2, 3, 4, 5]
    const result = systematicSample(data, 10)

    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should return copy of data, not reference', () => {
    const data = [1, 2, 3]
    const result = systematicSample(data, 10)

    expect(result).not.toBe(data)
  })

  it('should sample every nth item', () => {
    const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
    const result = systematicSample(data, 5)

    expect(result.length).toBe(5)
    // Should be evenly spaced
    expect(result).toEqual([0, 2, 4, 6, 8])
  })

  it('should handle exact target size', () => {
    const data = [1, 2, 3, 4, 5]
    const result = systematicSample(data, 5)

    expect(result.length).toBe(5)
  })

  it('should handle large datasets', () => {
    const data = Array.from({ length: 1000 }, (_, i) => i)
    const result = systematicSample(data, 100)

    expect(result.length).toBe(100)
    // First and last should be included
    expect(result[0]).toBe(0)
  })
})

describe('randomSample', () => {
  it('should return all data if size is less than target', () => {
    const data = [1, 2, 3, 4, 5]
    const result = randomSample(data, 10)

    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should return correct number of samples', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const result = randomSample(data, 10, 42)

    expect(result.length).toBe(10)
  })

  it('should produce same results with same seed', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const result1 = randomSample(data, 10, 42)
    const result2 = randomSample(data, 10, 42)

    expect(result1).toEqual(result2)
  })

  it('should produce different results with different seeds', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const result1 = randomSample(data, 10, 42)
    const result2 = randomSample(data, 10, 43)

    expect(result1).not.toEqual(result2)
  })

  it('should return sorted indices', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const result = randomSample(data, 20, 42)

    // Each element should be greater than the previous (sorted order)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]).toBeGreaterThan(result[i - 1])
    }
  })
})

describe('reservoirSample', () => {
  it('should return all data if size is less than target', () => {
    const data = [1, 2, 3, 4, 5]
    const result = reservoirSample(data, 10)

    expect(result).toEqual([1, 2, 3, 4, 5])
  })

  it('should return correct number of samples', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const result = reservoirSample(data, 10, 42)

    expect(result.length).toBe(10)
  })

  it('should produce same results with same seed', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const result1 = reservoirSample(data, 10, 42)
    const result2 = reservoirSample(data, 10, 42)

    expect(result1).toEqual(result2)
  })

  it('should contain unique elements', () => {
    const data = Array.from({ length: 100 }, (_, i) => i)
    const result = reservoirSample(data, 20, 42)
    const unique = new Set(result)

    expect(unique.size).toBe(result.length)
  })
})

describe('stratifiedSample', () => {
  it('should return all data if size is less than target', () => {
    const data = [
      { group: 'A', value: 1 },
      { group: 'B', value: 2 },
    ]
    const result = stratifiedSample(data, 10, 'group')

    expect(result.length).toBe(2)
  })

  it('should proportionally sample from each stratum', () => {
    const data = [
      // 80 items in group A
      ...Array.from({ length: 80 }, (_, i) => ({ group: 'A', value: i })),
      // 20 items in group B
      ...Array.from({ length: 20 }, (_, i) => ({ group: 'B', value: i + 80 })),
    ]

    const result = stratifiedSample(data, 20, 'group', 42)

    // Count by group
    const groupACounts = result.filter((r) => r.group === 'A').length
    const groupBCounts = result.filter((r) => r.group === 'B').length

    // Should be roughly proportional (80% A, 20% B)
    expect(groupACounts).toBeGreaterThan(groupBCounts)
  })

  it('should include at least one from each stratum', () => {
    const data = [
      ...Array.from({ length: 90 }, (_, i) => ({ group: 'A', value: i })),
      ...Array.from({ length: 10 }, (_, i) => ({ group: 'B', value: i + 90 })),
    ]

    const result = stratifiedSample(data, 5, 'group', 42)

    const hasA = result.some((r) => r.group === 'A')
    const hasB = result.some((r) => r.group === 'B')

    expect(hasA).toBe(true)
    expect(hasB).toBe(true)
  })
})

describe('lttbSample', () => {
  it('should return all data if size is less than target', () => {
    const data = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
    ]
    const result = lttbSample(data, 10, 'x', 'y')

    expect(result.length).toBe(2)
  })

  it('should return first and last with targetSize < 3', () => {
    const data = [
      { x: 0, y: 0 },
      { x: 1, y: 10 },
      { x: 2, y: 5 },
      { x: 3, y: 20 },
    ]
    const result = lttbSample(data, 2, 'x', 'y')

    expect(result.length).toBe(2)
    expect(result[0]).toEqual(data[0])
    expect(result[1]).toEqual(data[data.length - 1])
  })

  it('should always include first and last points', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      x: i,
      y: Math.sin(i * 0.1) * 50,
    }))
    const result = lttbSample(data, 20, 'x', 'y')

    expect(result[0]).toEqual(data[0])
    expect(result[result.length - 1]).toEqual(data[data.length - 1])
  })

  it('should return correct number of samples', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      x: i,
      y: Math.random() * 100,
    }))
    const result = lttbSample(data, 20, 'x', 'y')

    expect(result.length).toBe(20)
  })

  it('should preserve peak points in time series', () => {
    // Create data with a clear peak
    const data = Array.from({ length: 100 }, (_, i) => ({
      x: i,
      y: i === 50 ? 1000 : i, // Big spike at index 50
    }))
    const result = lttbSample(data, 10, 'x', 'y')

    // The peak should be preserved
    const hasPeak = result.some((r) => r.y === 1000)
    expect(hasPeak).toBe(true)
  })
})

describe('DataSampler', () => {
  describe('constructor', () => {
    it('should create with options', () => {
      const sampler = new DataSampler({
        method: 'systematic',
        targetSize: 100,
      })

      expect(sampler).toBeInstanceOf(DataSampler)
    })
  })

  describe('sample', () => {
    it('should use systematic method', () => {
      const sampler = new DataSampler({
        method: 'systematic',
        targetSize: 5,
      })

      const data = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
      const result = sampler.sample(data)

      expect(result.length).toBe(5)
    })

    it('should use random method', () => {
      const sampler = new DataSampler({
        method: 'random',
        targetSize: 5,
        seed: 42,
      })

      const data = Array.from({ length: 100 }, (_, i) => i)
      const result = sampler.sample(data)

      expect(result.length).toBe(5)
    })

    it('should use reservoir method', () => {
      const sampler = new DataSampler({
        method: 'reservoir',
        targetSize: 10,
        seed: 42,
      })

      const data = Array.from({ length: 100 }, (_, i) => i)
      const result = sampler.sample(data)

      expect(result.length).toBe(10)
    })

    it('should use stratified method', () => {
      const sampler = new DataSampler({
        method: 'stratified',
        targetSize: 10,
        stratifyField: 'group',
        seed: 42,
      })

      const data = [
        ...Array.from({ length: 50 }, (_, i) => ({ group: 'A', val: i })),
        ...Array.from({ length: 50 }, (_, i) => ({ group: 'B', val: i })),
      ]
      const result = sampler.sample(data)

      expect(result.length).toBeGreaterThan(0)
    })

    it('should throw for stratified without stratifyField', () => {
      const sampler = new DataSampler({
        method: 'stratified',
        targetSize: 10,
      })

      expect(() => sampler.sample([{ x: 1 }])).toThrow('stratifyField required')
    })

    it('should use lttb method', () => {
      const sampler = new DataSampler({
        method: 'lttb',
        targetSize: 10,
        xField: 'x',
        yField: 'y',
      })

      const data = Array.from({ length: 100 }, (_, i) => ({ x: i, y: i * 2 }))
      const result = sampler.sample(data)

      expect(result.length).toBe(10)
    })

    it('should throw for lttb without xField/yField', () => {
      const sampler = new DataSampler({
        method: 'lttb',
        targetSize: 10,
      })

      expect(() => sampler.sample([{ x: 1, y: 1 }])).toThrow('xField and yField required')
    })
  })

  describe('needsSampling', () => {
    it('should return true when data exceeds target', () => {
      const sampler = new DataSampler({
        method: 'systematic',
        targetSize: 100,
      })

      expect(sampler.needsSampling(200)).toBe(true)
    })

    it('should return false when data is within target', () => {
      const sampler = new DataSampler({
        method: 'systematic',
        targetSize: 100,
      })

      expect(sampler.needsSampling(50)).toBe(false)
    })
  })

  describe('getSamplingRatio', () => {
    it('should return 1 when data is within target', () => {
      const sampler = new DataSampler({
        method: 'systematic',
        targetSize: 100,
      })

      expect(sampler.getSamplingRatio(50)).toBe(1)
    })

    it('should return correct ratio', () => {
      const sampler = new DataSampler({
        method: 'systematic',
        targetSize: 100,
      })

      expect(sampler.getSamplingRatio(200)).toBe(0.5)
    })
  })
})

describe('createSampler', () => {
  it('should create DataSampler instance', () => {
    const sampler = createSampler({
      method: 'systematic',
      targetSize: 100,
    })

    expect(sampler).toBeInstanceOf(DataSampler)
  })

  it('should accept type parameter', () => {
    interface CustomData {
      time: number
      value: number
    }

    const sampler = createSampler<CustomData>({
      method: 'lttb',
      targetSize: 50,
      xField: 'time',
      yField: 'value',
    })

    const data: CustomData[] = Array.from({ length: 100 }, (_, i) => ({
      time: i,
      value: Math.random(),
    }))

    const result = sampler.sample(data)
    expect(result.length).toBe(50)
  })
})

describe('autoSample', () => {
  it('should return all data if within target', () => {
    const data = [{ x: 1, y: 1 }]
    const result = autoSample(data, 10)

    expect(result.length).toBe(1)
  })

  it('should use LTTB when x/y fields provided', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({
      x: i,
      y: Math.random() * 100,
    }))
    const result = autoSample(data, 20, { xField: 'x', yField: 'y' })

    expect(result.length).toBe(20)
    // First and last preserved (LTTB behavior)
    expect(result[0]).toEqual(data[0])
    expect(result[result.length - 1]).toEqual(data[data.length - 1])
  })

  it('should use stratified when stratifyField provided', () => {
    const data = [
      ...Array.from({ length: 50 }, (_, i) => ({ group: 'A', val: i })),
      ...Array.from({ length: 50 }, (_, i) => ({ group: 'B', val: i })),
    ]
    const result = autoSample(data, 20, { stratifyField: 'group' })

    // Both groups should be represented
    const hasA = result.some((r) => r.group === 'A')
    const hasB = result.some((r) => r.group === 'B')
    expect(hasA).toBe(true)
    expect(hasB).toBe(true)
  })

  it('should default to systematic sampling', () => {
    const data = Array.from({ length: 100 }, (_, i) => ({ value: i }))
    const result = autoSample(data, 10)

    expect(result.length).toBe(10)
  })
})

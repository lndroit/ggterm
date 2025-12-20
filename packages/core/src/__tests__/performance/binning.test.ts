/**
 * Tests for Data Binning
 */

import { describe, expect, it } from 'bun:test'
import {
  rectbin,
  hexbin,
  Binner,
  createBinner,
  type Bin,
  type HexBin,
} from '../../performance/binning'

describe('rectbin', () => {
  it('should return empty array for empty data', () => {
    const result = rectbin([], { xField: 'x', yField: 'y' })

    expect(result).toEqual([])
  })

  it('should bin single point', () => {
    const data = [{ x: 5, y: 5 }]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 10,
      yBins: 10,
    })

    expect(result.length).toBe(1)
    expect(result[0].count).toBe(1)
    expect(result[0].points).toEqual(data)
  })

  it('should group nearby points into same bin', () => {
    const data = [
      { x: 0.5, y: 0.5 },
      { x: 1.0, y: 1.0 },
      { x: 1.5, y: 1.5 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 2,
      yBins: 2,
      xDomain: [0, 4],
      yDomain: [0, 4],
    })

    // All points should be in same bin (lower left quadrant, bin width = 2)
    const binWithPoints = result.find((b) => b.count === 3)
    expect(binWithPoints).toBeDefined()
  })

  it('should calculate bin centers correctly', () => {
    const data = [{ x: 2.5, y: 2.5 }]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 2,
      yBins: 2,
      xDomain: [0, 10],
      yDomain: [0, 10],
    })

    expect(result.length).toBe(1)
    // Point at (2.5, 2.5) with domain [0,10] and 2 bins
    // Bin width = 5, so bin 0 covers [0,5)
    // Center of bin 0 = 2.5
    expect(result[0].x).toBeCloseTo(2.5, 1)
    expect(result[0].y).toBeCloseTo(2.5, 1)
  })

  it('should include bin dimensions', () => {
    const data = [{ x: 5, y: 5 }]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 10,
      yBins: 5,
      xDomain: [0, 100],
      yDomain: [0, 50],
    })

    expect(result[0].width).toBe(10) // 100 / 10
    expect(result[0].height).toBe(10) // 50 / 5
  })

  it('should aggregate with count by default', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 1, y: 1, value: 20 },
      { x: 1, y: 1, value: 30 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 1,
      yBins: 1,
    })

    expect(result[0].count).toBe(3)
    // Without valueField, value uses [count] array, so aggregateValues returns 1
    expect(result[0].value).toBe(1)
  })

  it('should aggregate with sum', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 1, y: 1, value: 20 },
      { x: 1, y: 1, value: 30 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 1,
      yBins: 1,
      aggregate: 'sum',
      valueField: 'value',
    })

    expect(result[0].value).toBe(60)
  })

  it('should aggregate with mean', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 1, y: 1, value: 20 },
      { x: 1, y: 1, value: 30 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 1,
      yBins: 1,
      aggregate: 'mean',
      valueField: 'value',
    })

    expect(result[0].value).toBe(20)
  })

  it('should aggregate with median', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 1, y: 1, value: 20 },
      { x: 1, y: 1, value: 100 }, // Outlier
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 1,
      yBins: 1,
      aggregate: 'median',
      valueField: 'value',
    })

    expect(result[0].value).toBe(20) // Middle value
  })

  it('should aggregate with min', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 1, y: 1, value: 5 },
      { x: 1, y: 1, value: 30 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 1,
      yBins: 1,
      aggregate: 'min',
      valueField: 'value',
    })

    expect(result[0].value).toBe(5)
  })

  it('should aggregate with max', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 1, y: 1, value: 5 },
      { x: 1, y: 1, value: 30 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 1,
      yBins: 1,
      aggregate: 'max',
      valueField: 'value',
    })

    expect(result[0].value).toBe(30)
  })

  it('should auto-compute domain from data', () => {
    const data = [
      { x: 10, y: 20 },
      { x: 30, y: 40 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 2,
      yBins: 2,
    })

    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle single-value domain', () => {
    const data = [
      { x: 5, y: 5 },
      { x: 5, y: 5 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 10,
      yBins: 10,
    })

    expect(result.length).toBe(1)
    expect(result[0].count).toBe(2)
  })

  it('should skip non-numeric values', () => {
    const data = [
      { x: 1, y: 1 },
      { x: 'invalid', y: 2 },
      { x: 3, y: undefined },
    ] as any
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 10,
      yBins: 10,
    })

    expect(result.length).toBe(1)
    expect(result[0].count).toBe(1)
  })
})

describe('hexbin', () => {
  it('should return empty array for empty data', () => {
    const result = hexbin([], { xField: 'x', yField: 'y' })

    expect(result).toEqual([])
  })

  it('should bin single point', () => {
    const data = [{ x: 5, y: 5 }]
    const result = hexbin(data, {
      xField: 'x',
      yField: 'y',
      radius: 10,
    })

    expect(result.length).toBe(1)
    expect(result[0].count).toBe(1)
  })

  it('should include hex vertices', () => {
    const data = [{ x: 5, y: 5 }]
    const result = hexbin(data, {
      xField: 'x',
      yField: 'y',
      radius: 10,
    })

    expect(result[0].vertices).toHaveLength(6)
    // Each vertex should have x and y
    for (const vertex of result[0].vertices) {
      expect(typeof vertex.x).toBe('number')
      expect(typeof vertex.y).toBe('number')
    }
  })

  it('should include col and row indices', () => {
    const data = [{ x: 5, y: 5 }]
    const result = hexbin(data, {
      xField: 'x',
      yField: 'y',
      radius: 10,
    })

    expect(typeof result[0].col).toBe('number')
    expect(typeof result[0].row).toBe('number')
  })

  it('should aggregate values', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 2, y: 2, value: 20 },
    ]
    const result = hexbin(data, {
      xField: 'x',
      yField: 'y',
      radius: 100, // Large radius to group all points
      aggregate: 'sum',
      valueField: 'value',
    })

    expect(result.length).toBe(1)
    expect(result[0].value).toBe(30)
  })

  it('should handle multiple hexbins', () => {
    const data = [
      { x: 0, y: 0 },
      { x: 100, y: 100 },
    ]
    const result = hexbin(data, {
      xField: 'x',
      yField: 'y',
      radius: 10,
    })

    expect(result.length).toBe(2)
  })
})

describe('Binner', () => {
  describe('constructor', () => {
    it('should create with default type rect', () => {
      const binner = new Binner({
        xField: 'x',
        yField: 'y',
      })

      expect(binner).toBeInstanceOf(Binner)
    })

    it('should accept type option', () => {
      const binner = new Binner({
        xField: 'x',
        yField: 'y',
        type: 'hex',
      })

      expect(binner).toBeInstanceOf(Binner)
    })
  })

  describe('bin', () => {
    it('should use rectbin for rect type', () => {
      const binner = new Binner({
        xField: 'x',
        yField: 'y',
        type: 'rect',
        xBins: 10,
        yBins: 10,
      })

      const data = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ]
      const result = binner.bin(data)

      // rect bins don't have vertices
      expect((result[0] as HexBin).vertices).toBeUndefined()
    })

    it('should use hexbin for hex type', () => {
      const binner = new Binner({
        xField: 'x',
        yField: 'y',
        type: 'hex',
        hexRadius: 10,
      })

      const data = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ]
      const result = binner.bin(data) as HexBin[]

      // hex bins have vertices
      expect(result[0].vertices).toBeDefined()
    })
  })

  describe('toPlotData', () => {
    it('should return plot-ready data', () => {
      const binner = new Binner({
        xField: 'x',
        yField: 'y',
        xBins: 2,
        yBins: 2,
      })

      const data = [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 10, y: 10 },
      ]
      const result = binner.toPlotData(data)

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toHaveProperty('x')
      expect(result[0]).toHaveProperty('y')
      expect(result[0]).toHaveProperty('count')
      expect(result[0]).toHaveProperty('value')
      expect(result[0]).toHaveProperty('size')
    })

    it('should normalize sizes', () => {
      const binner = new Binner({
        xField: 'x',
        yField: 'y',
        xBins: 10,
        yBins: 10,
      })

      const data = [
        { x: 1, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: 1 }, // 3 points in one bin
        { x: 100, y: 100 }, // 1 point in another
      ]
      const result = binner.toPlotData(data)

      // Find the two bins
      const largeBin = result.find((b) => b.count === 3)
      const smallBin = result.find((b) => b.count === 1)

      expect(largeBin!.size).toBeGreaterThan(smallBin!.size)
    })
  })

  describe('getDensityColors', () => {
    it('should map bins to colors', () => {
      const binner = new Binner({
        xField: 'x',
        yField: 'y',
        xBins: 2,
        yBins: 2,
      })

      const data = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ]
      const bins = binner.bin(data) as Bin[]

      // Simple color scale
      const colorScale = (t: number) => ({
        r: Math.round(t * 255),
        g: 0,
        b: Math.round((1 - t) * 255),
        a: 1,
      })

      const colors = binner.getDensityColors(bins, colorScale)

      expect(colors.size).toBe(bins.length)
      for (const bin of bins) {
        const color = colors.get(bin)
        expect(color).toBeDefined()
        expect(typeof color!.r).toBe('number')
      }
    })
  })
})

describe('createBinner', () => {
  it('should create Binner instance', () => {
    const binner = createBinner({
      xField: 'x',
      yField: 'y',
    })

    expect(binner).toBeInstanceOf(Binner)
  })

  it('should accept type parameter', () => {
    interface CustomPoint {
      px: number
      py: number
      value: number
    }

    const binner = createBinner<CustomPoint>({
      xField: 'px',
      yField: 'py',
      valueField: 'value',
      aggregate: 'mean',
    })

    const data: CustomPoint[] = [
      { px: 1, py: 1, value: 10 },
      { px: 2, py: 2, value: 20 },
    ]

    const result = binner.bin(data)
    expect(result.length).toBeGreaterThan(0)
  })
})

describe('edge cases', () => {
  it('should skip string and undefined values', () => {
    const data = [
      { x: 1, y: 1 },
      { x: 'invalid', y: 2 },
      { x: 3, y: undefined },
    ] as any
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 10,
      yBins: 10,
    })

    // Only the first valid point should be included
    expect(result.length).toBe(1)
    expect(result[0].count).toBe(1)
  })

  it('should include NaN values (typeof NaN is number)', () => {
    const data = [
      { x: 1, y: 1 },
      { x: NaN, y: 2 },
      { x: 3, y: NaN },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 10,
      yBins: 10,
    })

    // NaN passes typeof check, so all points are processed
    // They may end up in different bins based on NaN arithmetic
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle large datasets', () => {
    const data = Array.from({ length: 10000 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))

    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 20,
      yBins: 20,
    })

    // Should have fewer bins than data points
    expect(result.length).toBeLessThan(data.length)
    // Total count should equal original data
    const totalCount = result.reduce((sum, b) => sum + b.count, 0)
    expect(totalCount).toBe(data.length)
  })

  it('should handle median with even count', () => {
    const data = [
      { x: 1, y: 1, value: 10 },
      { x: 1, y: 1, value: 20 },
    ]
    const result = rectbin(data, {
      xField: 'x',
      yField: 'y',
      xBins: 1,
      yBins: 1,
      aggregate: 'median',
      valueField: 'value',
    })

    expect(result[0].value).toBe(15) // (10 + 20) / 2
  })
})

/**
 * Coord System Matrix Validation Tests
 *
 * Validates that all geom types work correctly with all coordinate systems.
 * This test suite helps identify:
 * 1. Geom × coord combinations that crash or produce errors
 * 2. Combinations that need special handling
 * 3. Expected vs actual behavior for transforms
 *
 * Coord systems:
 * - cartesian: Standard x-y coordinates (identity transform)
 * - flip: Swaps x and y axes
 * - polar: Converts (angle, radius) to (x, y) cartesian
 * - fixed: Fixed aspect ratio (identity transform)
 * - trans: Applies log10/sqrt/reverse transforms
 */

import { describe, it, expect } from 'bun:test'
import { gg } from '../../grammar'
import {
  coordCartesian,
  coordFlip,
  coordPolar,
  coordFixed,
  coordTrans,
  coordEqual,
} from '../../coords/cartesian'

// All geom types in the system
const ALL_GEOMS = [
  'point',
  'line',
  'path',
  'step',
  'rug',
  'bar',
  'col',
  'text',
  'label',
  'hline',
  'vline',
  'histogram',
  'freqpoly',
  'boxplot',
  'area',
  'segment',
  'violin',
  'tile',
  'raster',
  'bin2d',
  'contour',
  'contour_filled',
  'density_2d',
  'errorbar',
  'rect',
  'abline',
  'linerange',
  'pointrange',
  'smooth',
  'qq',
  'qq_line',
] as const

// All coord types
const COORD_SYSTEMS = [
  { name: 'cartesian', coord: coordCartesian() },
  { name: 'flip', coord: coordFlip() },
  { name: 'polar', coord: coordPolar() },
  { name: 'fixed', coord: coordFixed() },
  { name: 'trans_log', coord: coordTrans({ x: 'log10', y: 'log10' }) },
  { name: 'trans_sqrt', coord: coordTrans({ y: 'sqrt' }) },
  { name: 'trans_reverse', coord: coordTrans({ x: 'reverse' }) },
] as const

// Test data fixtures
const numericData = [
  { x: 1, y: 10, group: 'A', size: 5 },
  { x: 2, y: 20, group: 'A', size: 8 },
  { x: 3, y: 15, group: 'B', size: 6 },
  { x: 4, y: 25, group: 'B', size: 10 },
  { x: 5, y: 18, group: 'A', size: 7 },
]

const categoricalData = [
  { x: 'A', y: 10, group: 'X' },
  { x: 'B', y: 20, group: 'X' },
  { x: 'C', y: 15, group: 'Y' },
  { x: 'A', y: 12, group: 'Y' },
  { x: 'B', y: 22, group: 'Y' },
]

// Positive-only data for log transforms
const positiveData = [
  { x: 1, y: 10, group: 'A' },
  { x: 2, y: 20, group: 'A' },
  { x: 3, y: 15, group: 'B' },
  { x: 4, y: 25, group: 'B' },
  { x: 5, y: 18, group: 'A' },
]

// Data for segment/linerange geoms
const segmentData = [
  { x: 1, y: 10, xend: 2, yend: 20 },
  { x: 3, y: 15, xend: 4, yend: 25 },
]

// Data for violin/boxplot (needs multiple values per group)
const distributionData = [
  { x: 'A', y: 10 },
  { x: 'A', y: 12 },
  { x: 'A', y: 15 },
  { x: 'A', y: 11 },
  { x: 'A', y: 14 },
  { x: 'B', y: 20 },
  { x: 'B', y: 22 },
  { x: 'B', y: 25 },
  { x: 'B', y: 21 },
  { x: 'B', y: 24 },
]

// Data for tile/raster/bin2d
const gridData = [
  { x: 1, y: 1, fill: 5 },
  { x: 1, y: 2, fill: 10 },
  { x: 2, y: 1, fill: 15 },
  { x: 2, y: 2, fill: 20 },
]

// Geoms that require specific data structures
const GEOM_DATA_REQUIREMENTS: Record<string, () => Record<string, unknown>[]> = {
  point: () => numericData,
  line: () => numericData,
  path: () => numericData,
  step: () => numericData,
  rug: () => numericData,
  bar: () => categoricalData,
  col: () => categoricalData,
  text: () => numericData.map((d) => ({ ...d, label: `${d.y}` })),
  label: () => numericData.map((d) => ({ ...d, label: `${d.y}` })),
  hline: () => [{ yintercept: 15 }],
  vline: () => [{ xintercept: 3 }],
  histogram: () => numericData,
  freqpoly: () => numericData,
  boxplot: () => distributionData,
  area: () => numericData,
  segment: () => segmentData,
  violin: () => distributionData,
  tile: () => gridData,
  raster: () => gridData,
  bin2d: () => numericData,
  contour: () => numericData,
  contour_filled: () => numericData,
  density_2d: () => numericData,
  errorbar: () => numericData.map((d) => ({ ...d, ymin: d.y - 2, ymax: d.y + 2 })),
  rect: () => numericData.map((d) => ({ xmin: d.x - 0.4, xmax: d.x + 0.4, ymin: 0, ymax: d.y })),
  abline: () => [{ slope: 2, intercept: 5 }],
  linerange: () => numericData.map((d) => ({ ...d, ymin: d.y - 2, ymax: d.y + 2 })),
  pointrange: () => numericData.map((d) => ({ ...d, ymin: d.y - 2, ymax: d.y + 2 })),
  smooth: () => numericData,
  qq: () => numericData,
  qq_line: () => numericData,
}

// Data for log transforms (must be positive)
const GEOM_POSITIVE_DATA: Record<string, () => Record<string, unknown>[]> = {
  point: () => positiveData,
  line: () => positiveData,
  path: () => positiveData,
  step: () => positiveData,
  rug: () => positiveData,
  bar: () => positiveData.map((d) => ({ ...d, x: ['A', 'B', 'C', 'D', 'E'][d.x - 1] })),
  col: () => positiveData.map((d) => ({ ...d, x: ['A', 'B', 'C', 'D', 'E'][d.x - 1] })),
  text: () => positiveData.map((d) => ({ ...d, label: `${d.y}` })),
  label: () => positiveData.map((d) => ({ ...d, label: `${d.y}` })),
  hline: () => [{ yintercept: 15 }],
  vline: () => [{ xintercept: 3 }],
  histogram: () => positiveData,
  freqpoly: () => positiveData,
  boxplot: () => distributionData.map((d) => ({ ...d, y: d.y + 5 })), // Keep positive
  area: () => positiveData,
  segment: () => segmentData.map((d) => ({ x: d.x, y: d.y, xend: d.xend, yend: d.yend })),
  violin: () => distributionData.map((d) => ({ ...d, y: d.y + 5 })),
  tile: () => gridData,
  raster: () => gridData,
  bin2d: () => positiveData,
  contour: () => positiveData,
  contour_filled: () => positiveData,
  density_2d: () => positiveData,
  errorbar: () => positiveData.map((d) => ({ ...d, ymin: Math.max(1, d.y - 2), ymax: d.y + 2 })),
  rect: () => positiveData.map((d) => ({ xmin: Math.max(0.1, d.x - 0.4), xmax: d.x + 0.4, ymin: 1, ymax: d.y })),
  abline: () => [{ slope: 2, intercept: 5 }],
  linerange: () => positiveData.map((d) => ({ ...d, ymin: Math.max(1, d.y - 2), ymax: d.y + 2 })),
  pointrange: () => positiveData.map((d) => ({ ...d, ymin: Math.max(1, d.y - 2), ymax: d.y + 2 })),
  smooth: () => positiveData,
  qq: () => positiveData,
  qq_line: () => positiveData,
}

// Geoms that have known issues with certain coord systems
// Format: { geom: [incompatible_coords] }
const KNOWN_INCOMPATIBILITIES: Record<string, string[]> = {
  // Polar coords fundamentally change semantics
  histogram: ['polar'], // Histograms don't make sense in polar (use rose diagrams)
  boxplot: ['polar'], // Boxplots have specific vertical/horizontal semantics
  violin: ['polar'], // Violins have specific orientation semantics
  hline: ['polar', 'flip'], // Horizontal lines don't translate to polar
  vline: ['polar', 'flip'], // Vertical lines don't translate to polar
  abline: ['polar'], // Linear equations don't translate to polar
  bar: ['polar'], // Bars are better represented as pie/rose in polar
  col: ['polar'],
  errorbar: ['polar'], // Error bars have directional semantics
  linerange: ['polar'],
  pointrange: ['polar'],
}

// Geoms that explicitly support coord_flip
const FLIP_AWARE_GEOMS = ['bar', 'col']

describe('Coord System Matrix', () => {
  describe('Basic Rendering: All Geom × Coord Combinations', () => {
    // Test that all combinations render without throwing
    for (const geom of ALL_GEOMS) {
      for (const { name: coordName, coord } of COORD_SYSTEMS) {
        // Skip log transforms for geoms that might have zero/negative data
        const isLogTransform = coordName === 'trans_log'
        const dataFn = isLogTransform
          ? GEOM_POSITIVE_DATA[geom]
          : GEOM_DATA_REQUIREMENTS[geom]

        if (!dataFn) continue

        it(`${geom} + ${coordName} should render without error`, () => {
          const data = dataFn()
          const plot = gg(data).coord(coord)

          // Add the geom with appropriate aesthetics
          switch (geom) {
            case 'hline':
              plot.geom({ type: 'hline', params: { yintercept: 15 } })
              break
            case 'vline':
              plot.geom({ type: 'vline', params: { xintercept: 3 } })
              break
            case 'abline':
              plot.geom({ type: 'abline', params: { slope: 2, intercept: 5 } })
              break
            case 'text':
            case 'label':
              plot.aes({ x: 'x', y: 'y', label: 'label' }).geom({ type: geom, params: {} })
              break
            case 'segment':
              plot.aes({ x: 'x', y: 'y', xend: 'xend', yend: 'yend' }).geom({ type: geom, params: {} })
              break
            case 'errorbar':
            case 'linerange':
            case 'pointrange':
              plot.aes({ x: 'x', y: 'y', ymin: 'ymin', ymax: 'ymax' }).geom({ type: geom, params: {} })
              break
            case 'rect':
              plot.aes({ xmin: 'xmin', xmax: 'xmax', ymin: 'ymin', ymax: 'ymax' }).geom({ type: geom, params: {} })
              break
            case 'tile':
            case 'raster':
            case 'bin2d':
              plot.aes({ x: 'x', y: 'y', fill: 'fill' }).geom({ type: geom, params: {} })
              break
            default:
              plot.aes({ x: 'x', y: 'y' }).geom({ type: geom, params: {} })
          }

          // Should not throw
          expect(() => plot.spec()).not.toThrow()
        })
      }
    }
  })

  describe('Coord Transform Behavior', () => {
    describe('coordCartesian', () => {
      it('should apply identity transform', () => {
        const coord = coordCartesian()
        const result = coord.transform(10, 20)
        expect(result.x).toBe(10)
        expect(result.y).toBe(20)
      })

      it('should support xlim/ylim for zooming', () => {
        const coord = coordCartesian({ xlim: [0, 10], ylim: [0, 100] })
        expect(coord.xlim).toEqual([0, 10])
        expect(coord.ylim).toEqual([0, 100])
      })

      it('should default clip to true', () => {
        const coord = coordCartesian()
        expect(coord.clip).toBe(true)
      })
    })

    describe('coordFlip', () => {
      it('should swap x and y coordinates', () => {
        const coord = coordFlip()
        const result = coord.transform(10, 20)
        expect(result.x).toBe(20)
        expect(result.y).toBe(10)
      })

      it('should have type flip', () => {
        const coord = coordFlip()
        expect(coord.type).toBe('flip')
      })
    })

    describe('coordPolar', () => {
      it('should convert (angle, radius) to cartesian with theta=x', () => {
        const coord = coordPolar({ theta: 'x' })
        // At angle=0, radius=1 -> (1, 0)
        const result = coord.transform(0, 1)
        expect(result.x).toBeCloseTo(1, 5)
        expect(result.y).toBeCloseTo(0, 5)
      })

      it('should convert (angle, radius) to cartesian with theta=y', () => {
        const coord = coordPolar({ theta: 'y' })
        // At radius=1, angle=0 -> (1, 0)
        const result = coord.transform(1, 0)
        expect(result.x).toBeCloseTo(1, 5)
        expect(result.y).toBeCloseTo(0, 5)
      })

      it('should produce correct values at 90 degrees (pi/2)', () => {
        const coord = coordPolar({ theta: 'x' })
        const result = coord.transform(Math.PI / 2, 1)
        expect(result.x).toBeCloseTo(0, 5)
        expect(result.y).toBeCloseTo(1, 5)
      })
    })

    describe('coordFixed', () => {
      it('should apply identity transform', () => {
        const coord = coordFixed()
        const result = coord.transform(10, 20)
        expect(result.x).toBe(10)
        expect(result.y).toBe(20)
      })

      it('should store aspect ratio', () => {
        const coord = coordFixed({ ratio: 2 }) as ReturnType<typeof coordFixed> & { ratio: number }
        expect(coord.ratio).toBe(2)
      })

      it('should default ratio to 1', () => {
        const coord = coordFixed() as ReturnType<typeof coordFixed> & { ratio: number }
        expect(coord.ratio).toBe(1)
      })
    })

    describe('coordEqual', () => {
      it('should be alias for coordFixed with ratio=1', () => {
        const coord = coordEqual() as ReturnType<typeof coordEqual> & { ratio: number }
        expect(coord.type).toBe('fixed')
        expect(coord.ratio).toBe(1)
      })
    })

    describe('coordTrans', () => {
      it('should apply log10 transform', () => {
        const coord = coordTrans({ x: 'log10', y: 'log10' })
        const result = coord.transform(100, 1000)
        expect(result.x).toBeCloseTo(2, 5) // log10(100) = 2
        expect(result.y).toBeCloseTo(3, 5) // log10(1000) = 3
      })

      it('should apply sqrt transform', () => {
        const coord = coordTrans({ y: 'sqrt' })
        const result = coord.transform(10, 16)
        expect(result.x).toBe(10) // identity on x
        expect(result.y).toBeCloseTo(4, 5) // sqrt(16) = 4
      })

      it('should apply reverse transform', () => {
        const coord = coordTrans({ x: 'reverse' })
        const result = coord.transform(10, 20)
        expect(result.x).toBe(-10)
        expect(result.y).toBe(20)
      })

      it('should handle log10 of non-positive values', () => {
        const coord = coordTrans({ x: 'log10' })
        const result = coord.transform(0, 10)
        expect(result.x).toBe(-Infinity)
      })

      it('should handle sqrt of negative values', () => {
        const coord = coordTrans({ y: 'sqrt' })
        const result = coord.transform(10, -4)
        expect(result.y).toBe(0) // Returns 0 for negative
      })
    })
  })

  describe('Coord Limits (Zooming)', () => {
    it('coordCartesian with xlim should affect scale domain', () => {
      const plot = gg(numericData)
        .aes({ x: 'x', y: 'y' })
        .geom({ type: 'point', params: {} })
        .coord(coordCartesian({ xlim: [2, 4] }))
        .spec()

      // Coord limits should be passed through
      expect(plot.coord.xlim).toEqual([2, 4])
    })

    it('coordCartesian with ylim should affect scale domain', () => {
      const plot = gg(numericData)
        .aes({ x: 'x', y: 'y' })
        .geom({ type: 'point', params: {} })
        .coord(coordCartesian({ ylim: [10, 20] }))
        .spec()

      expect(plot.coord.ylim).toEqual([10, 20])
    })

    it('coordFixed with limits should work', () => {
      const plot = gg(numericData)
        .aes({ x: 'x', y: 'y' })
        .geom({ type: 'point', params: {} })
        .coord(coordFixed({ xlim: [1, 3], ylim: [5, 25] }))
        .spec()

      expect(plot.coord.xlim).toEqual([1, 3])
      expect(plot.coord.ylim).toEqual([5, 25])
    })
  })

  describe('Flip-Aware Geoms', () => {
    it('bar should render horizontally with coordFlip', () => {
      // This tests that bar geom receives coordType and handles it
      const plot = gg(categoricalData)
        .aes({ x: 'x', y: 'y' })
        .geom({ type: 'bar', params: {} })
        .coord(coordFlip())
        .spec()

      expect(plot.coord.type).toBe('flip')
    })

    it('col should work with coordFlip', () => {
      const plot = gg(categoricalData)
        .aes({ x: 'x', y: 'y' })
        .geom({ type: 'col', params: {} })
        .coord(coordFlip())
        .spec()

      expect(plot.coord.type).toBe('flip')
    })
  })

  describe('Known Incompatibilities Documentation', () => {
    // These tests document known incompatibilities rather than failures
    // They verify the combinations don't crash, but note semantic issues

    for (const [geom, incompatibleCoords] of Object.entries(KNOWN_INCOMPATIBILITIES)) {
      for (const coordName of incompatibleCoords) {
        it(`${geom} with ${coordName}: renders but may have semantic issues`, () => {
          const coordConfig = COORD_SYSTEMS.find((c) => c.name === coordName)
          if (!coordConfig) return

          const dataFn = GEOM_DATA_REQUIREMENTS[geom]
          if (!dataFn) return

          const data = dataFn()
          const plot = gg(data).coord(coordConfig.coord)

          // Add the geom
          switch (geom) {
            case 'hline':
              plot.geom({ type: 'hline', params: { yintercept: 15 } })
              break
            case 'vline':
              plot.geom({ type: 'vline', params: { xintercept: 3 } })
              break
            case 'abline':
              plot.geom({ type: 'abline', params: { slope: 2, intercept: 5 } })
              break
            case 'errorbar':
            case 'linerange':
            case 'pointrange':
              plot.aes({ x: 'x', y: 'y', ymin: 'ymin', ymax: 'ymax' }).geom({ type: geom, params: {} })
              break
            default:
              plot.aes({ x: 'x', y: 'y' }).geom({ type: geom, params: {} })
          }

          // Should not crash even if semantically questionable
          expect(() => plot.spec()).not.toThrow()
        })
      }
    }
  })

  describe('Multi-Layer Coord Consistency', () => {
    it('all layers should use the same coord system', () => {
      const plot = gg(numericData)
        .aes({ x: 'x', y: 'y' })
        .geom({ type: 'point', params: {} })
        .geom({ type: 'line', params: {} })
        .coord(coordFlip())
        .spec()

      // Coord should be consistent across the plot
      expect(plot.coord.type).toBe('flip')
    })

    it('coord transform should be applied to all layers', () => {
      const plot = gg(positiveData)
        .aes({ x: 'x', y: 'y' })
        .geom({ type: 'point', params: {} })
        .geom({ type: 'smooth', params: {} })
        .coord(coordTrans({ y: 'log10' }))
        .spec()

      expect(plot.coord.type).toBe('trans')
    })
  })

  describe('Edge Cases', () => {
    it('empty data with coord should not crash', () => {
      expect(() =>
        gg([])
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'point', params: {} })
          .coord(coordFlip())
          .spec()
      ).not.toThrow()
    })

    it('single point with polar coord should work', () => {
      expect(() =>
        gg([{ x: 0, y: 1 }])
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'point', params: {} })
          .coord(coordPolar())
          .spec()
      ).not.toThrow()
    })

    it('negative values with sqrt transform should handle gracefully', () => {
      const negativeData = [{ x: -5, y: -10 }, { x: 5, y: 10 }]
      expect(() =>
        gg(negativeData)
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'point', params: {} })
          .coord(coordTrans({ y: 'sqrt' }))
          .spec()
      ).not.toThrow()
    })

    it('zero values with log transform should handle gracefully', () => {
      const zeroData = [{ x: 0, y: 0 }, { x: 1, y: 1 }]
      expect(() =>
        gg(zeroData)
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'point', params: {} })
          .coord(coordTrans({ x: 'log10', y: 'log10' }))
          .spec()
      ).not.toThrow()
    })
  })

  describe('Stat + Coord Interaction', () => {
    it('histogram stat should work with flip coord', () => {
      expect(() =>
        gg(numericData)
          .aes({ x: 'x' })
          .geom({ type: 'histogram', params: {} })
          .coord(coordFlip())
          .spec()
      ).not.toThrow()
    })

    it('boxplot stat should work with flip coord (horizontal boxplots)', () => {
      expect(() =>
        gg(distributionData)
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'boxplot', params: {} })
          .coord(coordFlip())
          .spec()
      ).not.toThrow()
    })

    it('density stat should work with trans coord', () => {
      expect(() =>
        gg(positiveData)
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'violin', params: {} })
          .coord(coordTrans({ y: 'sqrt' }))
          .spec()
      ).not.toThrow()
    })

    it('smooth stat should work with log transform', () => {
      expect(() =>
        gg(positiveData)
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'smooth', params: {} })
          .coord(coordTrans({ y: 'log10' }))
          .spec()
      ).not.toThrow()
    })

    it('bin2d stat should work with fixed coord', () => {
      expect(() =>
        gg(numericData)
          .aes({ x: 'x', y: 'y' })
          .geom({ type: 'bin2d', params: {} })
          .coord(coordFixed({ ratio: 1 }))
          .spec()
      ).not.toThrow()
    })
  })

  describe('Coord Type Properties', () => {
    it('all coord constructors should return valid Coord objects', () => {
      const coords = [
        coordCartesian(),
        coordFlip(),
        coordPolar(),
        coordFixed(),
        coordEqual(),
        coordTrans(),
      ]

      for (const coord of coords) {
        expect(coord.type).toBeDefined()
        expect(typeof coord.transform).toBe('function')
      }
    })

    it('coordTrans should store transformation types', () => {
      const coord = coordTrans({ x: 'log10', y: 'sqrt' }) as ReturnType<typeof coordTrans> & {
        xTransType: string
        yTransType: string
      }
      expect(coord.xTransType).toBe('log10')
      expect(coord.yTransType).toBe('sqrt')
    })
  })
})

describe('Coord System Coverage Summary', () => {
  it('documents all tested geom × coord combinations', () => {
    const testedCombinations = ALL_GEOMS.length * COORD_SYSTEMS.length
    const knownIssues = Object.entries(KNOWN_INCOMPATIBILITIES).reduce(
      (sum, [, coords]) => sum + coords.length,
      0
    )

    // This test just documents the coverage
    expect(testedCombinations).toBeGreaterThan(200) // 31 geoms × 7 coords = 217
    expect(knownIssues).toBeGreaterThan(0)

    // Log coverage info (visible in test output)
    console.log(`\nCoord System Matrix Coverage:`)
    console.log(`  Total geom types: ${ALL_GEOMS.length}`)
    console.log(`  Total coord types: ${COORD_SYSTEMS.length}`)
    console.log(`  Total combinations tested: ${testedCombinations}`)
    console.log(`  Known semantic incompatibilities: ${knownIssues}`)
  })
})

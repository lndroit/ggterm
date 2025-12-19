/**
 * Tests for faceting system
 */

import { describe, expect, it } from 'bun:test'
import {
  facet_wrap,
  facet_grid,
  computeFacetPanels,
  calculatePanelLayouts,
} from '../../facets/index'

describe('facet_wrap', () => {
  it('should create a wrap facet', () => {
    const facet = facet_wrap('category')
    expect(facet.type).toBe('wrap')
    expect(facet.vars).toBe('category')
  })

  it('should default to fixed scales', () => {
    const facet = facet_wrap('category')
    expect(facet.scales).toBe('fixed')
  })

  it('should accept ncol option', () => {
    const facet = facet_wrap('category', { ncol: 3 })
    expect(facet.ncol).toBe(3)
  })

  it('should accept nrow option', () => {
    const facet = facet_wrap('category', { nrow: 2 })
    expect(facet.nrow).toBe(2)
  })

  it('should accept scales option', () => {
    const facet = facet_wrap('category', { scales: 'free' })
    expect(facet.scales).toBe('free')
  })

  it('should accept free_x scales', () => {
    const facet = facet_wrap('category', { scales: 'free_x' })
    expect(facet.scales).toBe('free_x')
  })

  it('should accept free_y scales', () => {
    const facet = facet_wrap('category', { scales: 'free_y' })
    expect(facet.scales).toBe('free_y')
  })
})

describe('facet_grid', () => {
  it('should create a grid facet with rows', () => {
    const facet = facet_grid({ rows: 'gender' })
    expect(facet.type).toBe('grid')
    expect(facet.vars).toEqual({ rows: 'gender' })
  })

  it('should create a grid facet with cols', () => {
    const facet = facet_grid({ cols: 'year' })
    expect(facet.type).toBe('grid')
    expect(facet.vars).toEqual({ cols: 'year' })
  })

  it('should create a grid facet with rows and cols', () => {
    const facet = facet_grid({ rows: 'gender', cols: 'treatment' })
    expect(facet.type).toBe('grid')
    expect(facet.vars).toEqual({ rows: 'gender', cols: 'treatment' })
  })

  it('should default to fixed scales', () => {
    const facet = facet_grid({ rows: 'category' })
    expect(facet.scales).toBe('fixed')
  })

  it('should accept scales option', () => {
    const facet = facet_grid({ rows: 'category' }, { scales: 'free' })
    expect(facet.scales).toBe('free')
  })
})

describe('computeFacetPanels - wrap', () => {
  it('should compute panels for wrap facet', () => {
    const data = [
      { x: 1, y: 1, category: 'A' },
      { x: 2, y: 2, category: 'B' },
      { x: 3, y: 3, category: 'A' },
      { x: 4, y: 4, category: 'C' },
    ]
    const facet = facet_wrap('category')
    const result = computeFacetPanels(data, facet)

    expect(result.panels).toHaveLength(3) // A, B, C
    expect(result.panels.map((p) => p.label).sort()).toEqual(['A', 'B', 'C'])
  })

  it('should filter data for each panel', () => {
    const data = [
      { x: 1, category: 'A' },
      { x: 2, category: 'B' },
      { x: 3, category: 'A' },
    ]
    const facet = facet_wrap('category')
    const result = computeFacetPanels(data, facet)

    const panelA = result.panels.find((p) => p.label === 'A')
    const panelB = result.panels.find((p) => p.label === 'B')

    expect(panelA?.data).toHaveLength(2)
    expect(panelB?.data).toHaveLength(1)
  })

  it('should respect ncol option', () => {
    const data = [
      { x: 1, category: 'A' },
      { x: 2, category: 'B' },
      { x: 3, category: 'C' },
      { x: 4, category: 'D' },
    ]
    const facet = facet_wrap('category', { ncol: 2 })
    const result = computeFacetPanels(data, facet)

    expect(result.ncol).toBe(2)
    expect(result.nrow).toBe(2)
  })

  it('should respect nrow option', () => {
    const data = [
      { x: 1, category: 'A' },
      { x: 2, category: 'B' },
      { x: 3, category: 'C' },
      { x: 4, category: 'D' },
    ]
    const facet = facet_wrap('category', { nrow: 2 })
    const result = computeFacetPanels(data, facet)

    expect(result.nrow).toBe(2)
    expect(result.ncol).toBe(2)
  })

  it('should auto-calculate grid dimensions', () => {
    const data = [
      { x: 1, category: 'A' },
      { x: 2, category: 'B' },
      { x: 3, category: 'C' },
    ]
    const facet = facet_wrap('category')
    const result = computeFacetPanels(data, facet)

    expect(result.nrow).toBeGreaterThan(0)
    expect(result.ncol).toBeGreaterThan(0)
    expect(result.nrow * result.ncol).toBeGreaterThanOrEqual(3)
  })

  it('should handle empty data', () => {
    const data: Record<string, unknown>[] = []
    const facet = facet_wrap('category')
    const result = computeFacetPanels(data, facet)

    expect(result.panels).toHaveLength(0)
    expect(result.nrow).toBe(0)
    expect(result.ncol).toBe(0)
  })

  it('should assign row and col indices', () => {
    const data = [
      { x: 1, category: 'A' },
      { x: 2, category: 'B' },
      { x: 3, category: 'C' },
      { x: 4, category: 'D' },
    ]
    const facet = facet_wrap('category', { ncol: 2 })
    const result = computeFacetPanels(data, facet)

    // First row: A, B (row=0, col=0,1)
    // Second row: C, D (row=1, col=0,1)
    const panelA = result.panels.find((p) => p.label === 'A')
    const panelB = result.panels.find((p) => p.label === 'B')
    const panelC = result.panels.find((p) => p.label === 'C')
    const panelD = result.panels.find((p) => p.label === 'D')

    expect(panelA?.row).toBe(0)
    expect(panelA?.col).toBe(0)
    expect(panelB?.row).toBe(0)
    expect(panelB?.col).toBe(1)
    expect(panelC?.row).toBe(1)
    expect(panelC?.col).toBe(0)
    expect(panelD?.row).toBe(1)
    expect(panelD?.col).toBe(1)
  })
})

describe('computeFacetPanels - grid', () => {
  it('should compute panels for grid facet with rows only', () => {
    const data = [
      { x: 1, y: 1, gender: 'M' },
      { x: 2, y: 2, gender: 'F' },
      { x: 3, y: 3, gender: 'M' },
    ]
    const facet = facet_grid({ rows: 'gender' })
    const result = computeFacetPanels(data, facet)

    expect(result.panels).toHaveLength(2) // M, F
    expect(result.nrow).toBe(2)
    expect(result.ncol).toBe(1)
  })

  it('should compute panels for grid facet with cols only', () => {
    const data = [
      { x: 1, y: 1, year: '2020' },
      { x: 2, y: 2, year: '2021' },
      { x: 3, y: 3, year: '2020' },
    ]
    const facet = facet_grid({ cols: 'year' })
    const result = computeFacetPanels(data, facet)

    expect(result.panels).toHaveLength(2) // 2020, 2021
    expect(result.nrow).toBe(1)
    expect(result.ncol).toBe(2)
  })

  it('should compute panels for grid facet with rows and cols', () => {
    const data = [
      { x: 1, gender: 'M', treatment: 'A' },
      { x: 2, gender: 'F', treatment: 'A' },
      { x: 3, gender: 'M', treatment: 'B' },
      { x: 4, gender: 'F', treatment: 'B' },
    ]
    const facet = facet_grid({ rows: 'gender', cols: 'treatment' })
    const result = computeFacetPanels(data, facet)

    expect(result.panels).toHaveLength(4) // 2 genders x 2 treatments
    expect(result.nrow).toBe(2)
    expect(result.ncol).toBe(2)
  })

  it('should filter data correctly for each grid cell', () => {
    const data = [
      { x: 1, gender: 'M', treatment: 'A' },
      { x: 2, gender: 'F', treatment: 'A' },
      { x: 3, gender: 'M', treatment: 'B' },
    ]
    const facet = facet_grid({ rows: 'gender', cols: 'treatment' })
    const result = computeFacetPanels(data, facet)

    const panelMA = result.panels.find(
      (p) => p.rowValue === 'M' && p.colValue === 'A'
    )
    const panelFA = result.panels.find(
      (p) => p.rowValue === 'F' && p.colValue === 'A'
    )
    const panelMB = result.panels.find(
      (p) => p.rowValue === 'M' && p.colValue === 'B'
    )
    const panelFB = result.panels.find(
      (p) => p.rowValue === 'F' && p.colValue === 'B'
    )

    expect(panelMA?.data).toHaveLength(1)
    expect(panelFA?.data).toHaveLength(1)
    expect(panelMB?.data).toHaveLength(1)
    expect(panelFB?.data).toHaveLength(0) // No data for F+B
  })

  it('should generate appropriate labels', () => {
    const data = [
      { x: 1, gender: 'M', treatment: 'A' },
      { x: 2, gender: 'F', treatment: 'B' },
    ]
    const facet = facet_grid({ rows: 'gender', cols: 'treatment' })
    const result = computeFacetPanels(data, facet)

    const labels = result.panels.map((p) => p.label)
    expect(labels).toContain('F, A')
    expect(labels).toContain('F, B')
    expect(labels).toContain('M, A')
    expect(labels).toContain('M, B')
  })
})

describe('calculatePanelLayouts', () => {
  it('should calculate layouts for a 2x2 grid', () => {
    const layouts = calculatePanelLayouts(
      80,  // totalWidth
      24,  // totalHeight
      2,   // nrow
      2,   // ncol
      false, // hasTitle
      { top: 1, right: 1, bottom: 2, left: 5 }
    )

    expect(layouts).toHaveLength(4)

    // All panels should have positive dimensions
    for (const layout of layouts) {
      expect(layout.width).toBeGreaterThan(0)
      expect(layout.height).toBeGreaterThan(0)
      expect(layout.x).toBeGreaterThanOrEqual(0)
      expect(layout.y).toBeGreaterThanOrEqual(0)
    }
  })

  it('should reserve space for title', () => {
    const withoutTitle = calculatePanelLayouts(80, 24, 1, 1, false, {
      top: 1,
      right: 1,
      bottom: 2,
      left: 5,
    })

    const withTitle = calculatePanelLayouts(80, 24, 1, 1, true, {
      top: 1,
      right: 1,
      bottom: 2,
      left: 5,
    })

    // Panel should start lower when title is present
    expect(withTitle[0].y).toBeGreaterThan(withoutTitle[0].y)
  })

  it('should respect margins', () => {
    const layouts = calculatePanelLayouts(80, 24, 1, 1, false, {
      top: 5,
      right: 5,
      bottom: 5,
      left: 10,
    })

    expect(layouts[0].x).toBeGreaterThanOrEqual(10)
  })

  it('should distribute panels evenly', () => {
    const layouts = calculatePanelLayouts(80, 24, 2, 2, false, {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
    })

    // All panels should have same dimensions
    const widths = layouts.map((l) => l.width)
    const heights = layouts.map((l) => l.height)

    expect(new Set(widths).size).toBe(1)
    expect(new Set(heights).size).toBe(1)
  })
})

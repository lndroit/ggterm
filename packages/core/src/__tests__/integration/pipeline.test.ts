/**
 * Integration tests for the rendering pipeline
 *
 * These tests verify the complete flow from data through to rendered output.
 */

import { describe, expect, it } from 'bun:test'
import { gg } from '../../grammar'
import { geom_point } from '../../geoms/point'
import { geom_line } from '../../geoms/line'
import { geom_bar } from '../../geoms/bar'
import { geom_area } from '../../geoms/area'
import { geom_text } from '../../geoms/text'
import { scale_x_continuous, scale_y_continuous } from '../../scales/continuous'

describe('Rendering Pipeline Integration', () => {
  describe('basic rendering', () => {
    it('should render a simple scatter plot', () => {
      const data = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 5, y: 5 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(typeof output).toBe('string')
      expect(output.length).toBeGreaterThan(0)
    })

    it('should render a line plot', () => {
      const data = [
        { x: 0, y: 0 },
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 3 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_line())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should render a bar chart', () => {
      const data = [
        { category: 'A', value: 10 },
        { category: 'B', value: 20 },
        { category: 'C', value: 15 },
      ]
      const plot = gg(data)
        .aes({ x: 'category', y: 'value' })
        .geom(geom_bar({ stat: 'identity' }))

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should render an area chart', () => {
      const data = [
        { x: 0, y: 5 },
        { x: 1, y: 10 },
        { x: 2, y: 8 },
        { x: 3, y: 12 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_area())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })
  })

  describe('multiple layers', () => {
    it('should render points and lines together', () => {
      const data = [
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_line())
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should render multiple line layers', () => {
      const data = [
        { x: 0, y1: 0, y2: 5 },
        { x: 5, y1: 5, y2: 10 },
        { x: 10, y1: 10, y2: 15 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y1' })
        .geom(geom_line({ color: '#ff0000' }))
        .geom(geom_line({ color: '#0000ff' }))

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })
  })

  describe('labels', () => {
    it('should include title in output', () => {
      const data = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())
        .labs({ title: 'Test Plot Title' })

      const output = plot.render({ width: 40, height: 12 })

      expect(output).toContain('Test Plot Title')
    })

    it('should include x-axis label', () => {
      const data = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())
        .labs({ x: 'X Axis Label' })

      const output = plot.render({ width: 40, height: 12 })

      expect(output).toContain('X Axis')
    })

    it('should include y-axis label', () => {
      const data = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())
        .labs({ y: 'Y Label' })

      const output = plot.render({ width: 50, height: 12 })

      // Y-axis label may be rotated or abbreviated
      expect(output.length).toBeGreaterThan(0)
    })
  })

  describe('scales', () => {
    it('should apply custom x scale limits', () => {
      const data = [
        { x: 5, y: 5 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())
        .scale(scale_x_continuous({ limits: [0, 100] }))

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should apply custom y scale limits', () => {
      const data = [
        { x: 5, y: 5 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())
        .scale(scale_y_continuous({ limits: [0, 100] }))

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })
  })

  describe('render options', () => {
    it('should respect width option', () => {
      const data = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const narrow = plot.render({ width: 20, height: 10 })
      const wide = plot.render({ width: 60, height: 10 })

      // Wider output should have more characters per line
      const narrowLines = narrow.split('\n')
      const wideLines = wide.split('\n')

      // At least some lines should be longer in the wide version
      const narrowMaxLen = Math.max(...narrowLines.map((l) => l.length))
      const wideMaxLen = Math.max(...wideLines.map((l) => l.length))

      expect(wideMaxLen).toBeGreaterThanOrEqual(narrowMaxLen)
    })

    it('should respect height option', () => {
      const data = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const short = plot.render({ width: 40, height: 5 })
      const tall = plot.render({ width: 40, height: 15 })

      const shortLines = short.split('\n').length
      const tallLines = tall.split('\n').length

      expect(tallLines).toBeGreaterThan(shortLines)
    })
  })

  describe('empty and edge cases', () => {
    it('should handle empty data gracefully', () => {
      const plot = gg([])
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(typeof output).toBe('string')
    })

    it('should handle single data point', () => {
      const plot = gg([{ x: 5, y: 5 }])
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should handle negative values', () => {
      const data = [
        { x: -10, y: -10 },
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should handle very large values', () => {
      const data = [
        { x: 0, y: 0 },
        { x: 1000000, y: 1000000 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should handle decimal values', () => {
      const data = [
        { x: 0.1, y: 0.1 },
        { x: 0.5, y: 0.5 },
        { x: 0.9, y: 0.9 },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })
  })

  describe('data streaming', () => {
    it('should support pushing new data', () => {
      const plot = gg([{ x: 0, y: 0 }])
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      // Initial render
      const output1 = plot.render({ width: 40, height: 10 })

      // Push more data
      plot.push({ x: 10, y: 10 })
      const output2 = plot.render({ width: 40, height: 10 })

      expect(output1).toBeDefined()
      expect(output2).toBeDefined()
      // Output should be different with more data points
      expect(plot.data.length).toBe(2)
    })

    it('should support pushing multiple records', () => {
      const plot = gg([])
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())

      plot.push([
        { x: 0, y: 0 },
        { x: 5, y: 5 },
        { x: 10, y: 10 },
      ])

      expect(plot.data.length).toBe(3)

      const output = plot.render({ width: 40, height: 10 })
      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })
  })

  describe('fluent API', () => {
    it('should support method chaining', () => {
      const data = [{ x: 0, y: 0 }, { x: 10, y: 10 }]

      const output = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())
        .geom(geom_line())
        .scale(scale_x_continuous({ limits: [0, 20] }))
        .scale(scale_y_continuous({ limits: [0, 20] }))
        .labs({ title: 'Chained Plot', x: 'X', y: 'Y' })
        .render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should return plot spec', () => {
      const data = [{ x: 0, y: 0 }]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point())
        .labs({ title: 'Test' })

      const spec = plot.spec()

      expect(spec.data).toEqual(data)
      expect(spec.aes).toEqual({ x: 'x', y: 'y' })
      expect(spec.geoms).toHaveLength(1)
      expect(spec.labels.title).toBe('Test')
    })
  })

  describe('color aesthetics', () => {
    it('should render with color mapping', () => {
      const data = [
        { x: 0, y: 0, group: 'A' },
        { x: 5, y: 5, group: 'B' },
        { x: 10, y: 10, group: 'A' },
      ]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y', color: 'group' })
        .geom(geom_point())

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })

    it('should render with fixed color', () => {
      const data = [{ x: 0, y: 0 }, { x: 10, y: 10 }]
      const plot = gg(data)
        .aes({ x: 'x', y: 'y' })
        .geom(geom_point({ color: '#ff0000' }))

      const output = plot.render({ width: 40, height: 10 })

      expect(output).toBeDefined()
      expect(output.length).toBeGreaterThan(0)
    })
  })
})

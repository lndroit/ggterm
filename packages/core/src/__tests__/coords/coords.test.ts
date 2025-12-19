/**
 * Tests for coordinate systems
 */

import { describe, expect, it } from 'bun:test'
import { coordCartesian, coordFlip, coordPolar } from '../../coords/cartesian'

describe('coordCartesian', () => {
  it('should create a cartesian coordinate system', () => {
    const coord = coordCartesian()
    expect(coord.type).toBe('cartesian')
  })

  it('should have an identity transform', () => {
    const coord = coordCartesian()
    const result = coord.transform(5, 10)
    expect(result.x).toBe(5)
    expect(result.y).toBe(10)
  })

  it('should preserve negative values', () => {
    const coord = coordCartesian()
    const result = coord.transform(-5, -10)
    expect(result.x).toBe(-5)
    expect(result.y).toBe(-10)
  })

  it('should preserve zero', () => {
    const coord = coordCartesian()
    const result = coord.transform(0, 0)
    expect(result.x).toBe(0)
    expect(result.y).toBe(0)
  })

  it('should preserve decimal values', () => {
    const coord = coordCartesian()
    const result = coord.transform(3.14159, 2.71828)
    expect(result.x).toBeCloseTo(3.14159)
    expect(result.y).toBeCloseTo(2.71828)
  })

  it('should accept options object', () => {
    const coord = coordCartesian({ xlim: [0, 100], ylim: [0, 50] })
    expect(coord.type).toBe('cartesian')
  })
})

describe('coordFlip', () => {
  it('should create a flip coordinate system', () => {
    const coord = coordFlip()
    expect(coord.type).toBe('flip')
  })

  it('should swap x and y coordinates', () => {
    const coord = coordFlip()
    const result = coord.transform(5, 10)
    expect(result.x).toBe(10)
    expect(result.y).toBe(5)
  })

  it('should handle negative values', () => {
    const coord = coordFlip()
    const result = coord.transform(-5, 10)
    expect(result.x).toBe(10)
    expect(result.y).toBe(-5)
  })

  it('should handle zero', () => {
    const coord = coordFlip()
    const result = coord.transform(0, 5)
    expect(result.x).toBe(5)
    expect(result.y).toBe(0)
  })

  it('should be its own inverse', () => {
    const coord = coordFlip()
    const first = coord.transform(3, 7)
    const second = coord.transform(first.x, first.y)
    expect(second.x).toBe(3)
    expect(second.y).toBe(7)
  })
})

describe('coordPolar', () => {
  it('should create a polar coordinate system', () => {
    const coord = coordPolar()
    expect(coord.type).toBe('polar')
  })

  it('should default to theta = x', () => {
    const coord = coordPolar()
    // At angle 0, radius r: (r*cos(0), r*sin(0)) = (r, 0)
    const result = coord.transform(0, 5) // angle=0, radius=5
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(0)
  })

  it('should convert angle and radius to cartesian', () => {
    const coord = coordPolar()
    // At angle π/2, radius r: (r*cos(π/2), r*sin(π/2)) = (0, r)
    const result = coord.transform(Math.PI / 2, 5)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(5)
  })

  it('should handle angle π', () => {
    const coord = coordPolar()
    // At angle π, radius r: (r*cos(π), r*sin(π)) = (-r, 0)
    const result = coord.transform(Math.PI, 5)
    expect(result.x).toBeCloseTo(-5)
    expect(result.y).toBeCloseTo(0)
  })

  it('should handle theta = y option', () => {
    const coord = coordPolar({ theta: 'y' })
    // When theta='y', x is radius and y is angle
    // angle=0, radius=5: (5*cos(0), 5*sin(0)) = (5, 0)
    const result = coord.transform(5, 0)
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(0)
  })

  it('should handle zero radius', () => {
    const coord = coordPolar()
    const result = coord.transform(Math.PI / 4, 0)
    expect(result.x).toBeCloseTo(0)
    expect(result.y).toBeCloseTo(0)
  })

  it('should handle negative radius', () => {
    const coord = coordPolar()
    // At angle 0, radius -5: (-5*cos(0), -5*sin(0)) = (-5, 0)
    const result = coord.transform(0, -5)
    expect(result.x).toBeCloseTo(-5)
    expect(result.y).toBeCloseTo(0)
  })

  it('should handle full rotation', () => {
    const coord = coordPolar()
    // At angle 2π, should be same as angle 0
    const result = coord.transform(2 * Math.PI, 5)
    expect(result.x).toBeCloseTo(5)
    expect(result.y).toBeCloseTo(0)
  })

  it('should handle 45 degree angle', () => {
    const coord = coordPolar()
    // At angle π/4, radius r: (r*cos(π/4), r*sin(π/4)) = (r/√2, r/√2)
    const radius = 10
    const result = coord.transform(Math.PI / 4, radius)
    const expected = radius / Math.sqrt(2)
    expect(result.x).toBeCloseTo(expected)
    expect(result.y).toBeCloseTo(expected)
  })
})

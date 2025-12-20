/**
 * Tests for @ggterm/render-block
 */

import { describe, expect, it } from 'bun:test'
import {
  BLOCKS,
  BOX,
  createSubpixelBuffer,
  setPixel,
  getPixel,
  drawLine,
  drawFilledCircle,
  drawRect,
  drawFilledRect,
  renderSubpixelBuffer,
  createBlockBuffer,
  setChar,
  renderBlockBuffer,
  blockRenderer,
  createBlockRenderer,
  type SubpixelBuffer,
  type BlockBuffer,
} from '../index'

// Test color constants
const WHITE: { r: number; g: number; b: number; a: number } = { r: 255, g: 255, b: 255, a: 1 }
const RED: { r: number; g: number; b: number; a: number } = { r: 255, g: 0, b: 0, a: 1 }
const GREEN: { r: number; g: number; b: number; a: number } = { r: 0, g: 255, b: 0, a: 1 }
const BLUE: { r: number; g: number; b: number; a: number } = { r: 0, g: 0, b: 255, a: 1 }
const TRANSPARENT: { r: number; g: number; b: number; a: number } = { r: 0, g: 0, b: 0, a: 0 }

describe('BLOCKS constants', () => {
  it('should have correct Unicode block characters', () => {
    expect(BLOCKS.full).toBe('█')
    expect(BLOCKS.upper).toBe('▀')
    expect(BLOCKS.lower).toBe('▄')
    expect(BLOCKS.left).toBe('▌')
    expect(BLOCKS.right).toBe('▐')
    expect(BLOCKS.light).toBe('░')
    expect(BLOCKS.medium).toBe('▒')
    expect(BLOCKS.heavy).toBe('▓')
    expect(BLOCKS.empty).toBe(' ')
  })
})

describe('BOX constants', () => {
  it('should have correct box drawing characters', () => {
    expect(BOX.horizontal).toBe('─')
    expect(BOX.vertical).toBe('│')
    expect(BOX.topLeft).toBe('┌')
    expect(BOX.topRight).toBe('┐')
    expect(BOX.bottomLeft).toBe('└')
    expect(BOX.bottomRight).toBe('┘')
    expect(BOX.topT).toBe('┬')
    expect(BOX.bottomT).toBe('┴')
    expect(BOX.leftT).toBe('├')
    expect(BOX.rightT).toBe('┤')
    expect(BOX.cross).toBe('┼')
  })

  it('should have rounded corner characters', () => {
    expect(BOX.roundTopLeft).toBe('╭')
    expect(BOX.roundTopRight).toBe('╮')
    expect(BOX.roundBottomLeft).toBe('╰')
    expect(BOX.roundBottomRight).toBe('╯')
  })
})

describe('createSubpixelBuffer', () => {
  it('should create buffer with correct character dimensions', () => {
    const buffer = createSubpixelBuffer(10, 5)

    expect(buffer.charWidth).toBe(10)
    expect(buffer.charHeight).toBe(5)
  })

  it('should create buffer with 2x vertical pixel resolution', () => {
    const buffer = createSubpixelBuffer(10, 5)

    expect(buffer.pixelWidth).toBe(10)
    expect(buffer.pixelHeight).toBe(10) // 5 * 2
  })

  it('should create pixel array of correct size', () => {
    const buffer = createSubpixelBuffer(10, 5)

    expect(buffer.pixels.length).toBe(10) // pixelHeight
    expect(buffer.pixels[0].length).toBe(10) // pixelWidth
  })

  it('should initialize all pixels to null', () => {
    const buffer = createSubpixelBuffer(5, 5)

    for (let y = 0; y < buffer.pixelHeight; y++) {
      for (let x = 0; x < buffer.pixelWidth; x++) {
        expect(buffer.pixels[y][x]).toBeNull()
      }
    }
  })

  it('should handle 1x1 buffer', () => {
    const buffer = createSubpixelBuffer(1, 1)

    expect(buffer.charWidth).toBe(1)
    expect(buffer.charHeight).toBe(1)
    expect(buffer.pixelWidth).toBe(1)
    expect(buffer.pixelHeight).toBe(2)
  })
})

describe('setPixel', () => {
  it('should set pixel at valid position', () => {
    const buffer = createSubpixelBuffer(5, 5)
    setPixel(buffer, 2, 3, RED)

    expect(buffer.pixels[3][2]).toEqual(RED)
  })

  it('should ignore negative x', () => {
    const buffer = createSubpixelBuffer(5, 5)
    setPixel(buffer, -1, 0, RED)

    // All pixels should be null
    for (let y = 0; y < buffer.pixelHeight; y++) {
      for (let x = 0; x < buffer.pixelWidth; x++) {
        expect(buffer.pixels[y][x]).toBeNull()
      }
    }
  })

  it('should ignore negative y', () => {
    const buffer = createSubpixelBuffer(5, 5)
    setPixel(buffer, 0, -1, RED)

    for (let y = 0; y < buffer.pixelHeight; y++) {
      for (let x = 0; x < buffer.pixelWidth; x++) {
        expect(buffer.pixels[y][x]).toBeNull()
      }
    }
  })

  it('should ignore x beyond width', () => {
    const buffer = createSubpixelBuffer(5, 5)
    setPixel(buffer, 100, 0, RED)

    for (let y = 0; y < buffer.pixelHeight; y++) {
      for (let x = 0; x < buffer.pixelWidth; x++) {
        expect(buffer.pixels[y][x]).toBeNull()
      }
    }
  })

  it('should ignore y beyond height', () => {
    const buffer = createSubpixelBuffer(5, 5)
    setPixel(buffer, 0, 100, RED)

    for (let y = 0; y < buffer.pixelHeight; y++) {
      for (let x = 0; x < buffer.pixelWidth; x++) {
        expect(buffer.pixels[y][x]).toBeNull()
      }
    }
  })

  it('should overwrite existing pixel', () => {
    const buffer = createSubpixelBuffer(5, 5)
    setPixel(buffer, 2, 2, RED)
    setPixel(buffer, 2, 2, BLUE)

    expect(buffer.pixels[2][2]).toEqual(BLUE)
  })
})

describe('getPixel', () => {
  it('should return pixel at valid position', () => {
    const buffer = createSubpixelBuffer(5, 5)
    buffer.pixels[3][2] = GREEN

    expect(getPixel(buffer, 2, 3)).toEqual(GREEN)
  })

  it('should return null for empty pixel', () => {
    const buffer = createSubpixelBuffer(5, 5)

    expect(getPixel(buffer, 2, 3)).toBeNull()
  })

  it('should return null for negative x', () => {
    const buffer = createSubpixelBuffer(5, 5)

    expect(getPixel(buffer, -1, 0)).toBeNull()
  })

  it('should return null for negative y', () => {
    const buffer = createSubpixelBuffer(5, 5)

    expect(getPixel(buffer, 0, -1)).toBeNull()
  })

  it('should return null for x beyond width', () => {
    const buffer = createSubpixelBuffer(5, 5)

    expect(getPixel(buffer, 100, 0)).toBeNull()
  })

  it('should return null for y beyond height', () => {
    const buffer = createSubpixelBuffer(5, 5)

    expect(getPixel(buffer, 0, 100)).toBeNull()
  })
})

describe('drawLine', () => {
  it('should draw horizontal line', () => {
    const buffer = createSubpixelBuffer(10, 5)
    drawLine(buffer, 0, 2, 9, 2, WHITE)

    // Check all pixels on the line
    for (let x = 0; x < 10; x++) {
      expect(buffer.pixels[2][x]).toEqual(WHITE)
    }
  })

  it('should draw vertical line', () => {
    const buffer = createSubpixelBuffer(5, 10)
    drawLine(buffer, 2, 0, 2, 19, WHITE)

    // Check all pixels on the line
    for (let y = 0; y < 20; y++) {
      expect(buffer.pixels[y][2]).toEqual(WHITE)
    }
  })

  it('should draw diagonal line', () => {
    const buffer = createSubpixelBuffer(10, 10)
    drawLine(buffer, 0, 0, 9, 19, RED)

    // Start and end should be set
    expect(buffer.pixels[0][0]).toEqual(RED)
    expect(buffer.pixels[19][9]).toEqual(RED)
  })

  it('should draw single point when start equals end', () => {
    const buffer = createSubpixelBuffer(5, 5)
    drawLine(buffer, 2, 4, 2, 4, GREEN)

    expect(buffer.pixels[4][2]).toEqual(GREEN)

    // Count set pixels
    let count = 0
    for (let y = 0; y < buffer.pixelHeight; y++) {
      for (let x = 0; x < buffer.pixelWidth; x++) {
        if (buffer.pixels[y][x] !== null) count++
      }
    }
    expect(count).toBe(1)
  })

  it('should handle reverse direction line', () => {
    const buffer = createSubpixelBuffer(10, 5)
    drawLine(buffer, 9, 2, 0, 2, BLUE)

    // Should still draw the full line
    for (let x = 0; x < 10; x++) {
      expect(buffer.pixels[2][x]).toEqual(BLUE)
    }
  })

  it('should handle floating point coordinates', () => {
    const buffer = createSubpixelBuffer(5, 5)
    drawLine(buffer, 0.7, 1.3, 3.2, 4.8, RED)

    // Should round to 1,1 -> 3,5 (but 5 is clamped to 4)
    expect(buffer.pixels[1][1]).toEqual(RED)
  })
})

describe('drawFilledCircle', () => {
  it('should draw single pixel for radius 0', () => {
    const buffer = createSubpixelBuffer(10, 10)
    drawFilledCircle(buffer, 5, 10, 0, RED)

    // Should draw at least one pixel (radius min is 1)
    expect(buffer.pixels[10][5]).toEqual(RED)
  })

  it('should draw filled circle', () => {
    const buffer = createSubpixelBuffer(20, 10)
    drawFilledCircle(buffer, 10, 10, 3, GREEN)

    // Center should be filled
    expect(buffer.pixels[10][10]).toEqual(GREEN)

    // Points at distance 3 should be filled
    expect(buffer.pixels[10][7]).toEqual(GREEN) // left
    expect(buffer.pixels[10][13]).toEqual(GREEN) // right
    expect(buffer.pixels[7][10]).toEqual(GREEN) // top
    expect(buffer.pixels[13][10]).toEqual(GREEN) // bottom
  })

  it('should not fill outside circle', () => {
    const buffer = createSubpixelBuffer(20, 10)
    drawFilledCircle(buffer, 10, 10, 2, BLUE)

    // Corner pixels should be empty (distance > radius)
    expect(buffer.pixels[8][8]).toBeNull()
    expect(buffer.pixels[8][12]).toBeNull()
    expect(buffer.pixels[12][8]).toBeNull()
    expect(buffer.pixels[12][12]).toBeNull()
  })

  it('should handle circle partially outside buffer', () => {
    const buffer = createSubpixelBuffer(10, 5)

    // Should not throw
    expect(() => drawFilledCircle(buffer, 0, 0, 5, RED)).not.toThrow()
  })
})

describe('drawRect', () => {
  it('should draw rectangle outline', () => {
    const buffer = createSubpixelBuffer(10, 10)
    drawRect(buffer, 2, 2, 5, 4, WHITE)

    // Top edge
    for (let x = 2; x < 7; x++) {
      expect(buffer.pixels[2][x]).toEqual(WHITE)
    }

    // Bottom edge
    for (let x = 2; x < 7; x++) {
      expect(buffer.pixels[5][x]).toEqual(WHITE)
    }

    // Left edge
    for (let y = 2; y < 6; y++) {
      expect(buffer.pixels[y][2]).toEqual(WHITE)
    }

    // Right edge
    for (let y = 2; y < 6; y++) {
      expect(buffer.pixels[y][6]).toEqual(WHITE)
    }
  })

  it('should leave interior empty', () => {
    const buffer = createSubpixelBuffer(10, 10)
    drawRect(buffer, 2, 2, 5, 5, RED)

    // Interior should be empty
    expect(buffer.pixels[4][4]).toBeNull()
  })

  it('should handle 1x1 rectangle', () => {
    const buffer = createSubpixelBuffer(5, 5)
    drawRect(buffer, 2, 2, 1, 1, GREEN)

    expect(buffer.pixels[2][2]).toEqual(GREEN)
  })
})

describe('drawFilledRect', () => {
  it('should draw filled rectangle', () => {
    const buffer = createSubpixelBuffer(10, 10)
    drawFilledRect(buffer, 2, 2, 3, 4, BLUE)

    // Check all pixels in rectangle
    for (let y = 2; y < 6; y++) {
      for (let x = 2; x < 5; x++) {
        expect(buffer.pixels[y][x]).toEqual(BLUE)
      }
    }
  })

  it('should not fill outside rectangle', () => {
    const buffer = createSubpixelBuffer(10, 10)
    drawFilledRect(buffer, 2, 2, 3, 3, RED)

    // Outside pixels should be null
    expect(buffer.pixels[0][0]).toBeNull()
    expect(buffer.pixels[1][1]).toBeNull()
    expect(buffer.pixels[5][5]).toBeNull()
  })
})

describe('renderSubpixelBuffer', () => {
  it('should render empty buffer as spaces', () => {
    const buffer = createSubpixelBuffer(3, 2)
    const output = renderSubpixelBuffer(buffer)

    // Should have 2 lines (charHeight)
    const lines = output.split('\n')
    expect(lines.length).toBe(2)
  })

  it('should render full cell as full block', () => {
    const buffer = createSubpixelBuffer(1, 1)
    setPixel(buffer, 0, 0, WHITE) // upper
    setPixel(buffer, 0, 1, WHITE) // lower
    const output = renderSubpixelBuffer(buffer)

    expect(output).toContain(BLOCKS.full)
  })

  it('should render upper half only', () => {
    const buffer = createSubpixelBuffer(1, 1)
    setPixel(buffer, 0, 0, RED) // upper only
    const output = renderSubpixelBuffer(buffer)

    expect(output).toContain(BLOCKS.upper)
  })

  it('should render lower half only', () => {
    const buffer = createSubpixelBuffer(1, 1)
    setPixel(buffer, 0, 1, BLUE) // lower only
    const output = renderSubpixelBuffer(buffer)

    expect(output).toContain(BLOCKS.lower)
  })

  it('should use upper half with fg/bg for different colors', () => {
    const buffer = createSubpixelBuffer(1, 1)
    setPixel(buffer, 0, 0, RED) // upper = red
    setPixel(buffer, 0, 1, BLUE) // lower = blue
    const output = renderSubpixelBuffer(buffer)

    // Should use upper half block with red fg and blue bg
    expect(output).toContain(BLOCKS.upper)
    expect(output).toContain('\x1b[38;2;255;0;0m') // red fg
    expect(output).toContain('\x1b[48;2;0;0;255m') // blue bg
  })

  it('should include reset at end of line', () => {
    const buffer = createSubpixelBuffer(3, 1)
    setPixel(buffer, 0, 0, WHITE)
    const output = renderSubpixelBuffer(buffer)

    expect(output).toContain('\x1b[0m')
  })

  it('should output correct number of lines', () => {
    const buffer = createSubpixelBuffer(10, 5)
    const output = renderSubpixelBuffer(buffer)

    const lines = output.split('\n')
    expect(lines.length).toBe(5)
  })
})

describe('createBlockBuffer (legacy)', () => {
  it('should create buffer with correct dimensions', () => {
    const buffer = createBlockBuffer(10, 5)

    expect(buffer.width).toBe(10)
    expect(buffer.height).toBe(5)
  })

  it('should create chars array of correct size', () => {
    const buffer = createBlockBuffer(10, 5)

    expect(buffer.chars.length).toBe(5)
    expect(buffer.chars[0].length).toBe(10)
  })

  it('should initialize chars to spaces', () => {
    const buffer = createBlockBuffer(5, 5)

    for (let y = 0; y < buffer.height; y++) {
      for (let x = 0; x < buffer.width; x++) {
        expect(buffer.chars[y][x]).toBe(' ')
      }
    }
  })

  it('should create colors array of correct size', () => {
    const buffer = createBlockBuffer(10, 5)

    expect(buffer.colors.length).toBe(5)
    expect(buffer.colors[0].length).toBe(10)
  })

  it('should initialize colors to null', () => {
    const buffer = createBlockBuffer(5, 5)

    for (let y = 0; y < buffer.height; y++) {
      for (let x = 0; x < buffer.width; x++) {
        expect(buffer.colors[y][x]).toBeNull()
      }
    }
  })
})

describe('setChar (legacy)', () => {
  it('should set character at valid position', () => {
    const buffer = createBlockBuffer(5, 5)
    setChar(buffer, 2, 3, 'X')

    expect(buffer.chars[3][2]).toBe('X')
  })

  it('should set color when provided', () => {
    const buffer = createBlockBuffer(5, 5)
    setChar(buffer, 2, 3, 'X', RED)

    expect(buffer.colors[3][2]).toEqual(RED)
  })

  it('should not change color when not provided', () => {
    const buffer = createBlockBuffer(5, 5)
    setChar(buffer, 2, 3, 'X')

    expect(buffer.colors[3][2]).toBeNull()
  })

  it('should ignore negative x', () => {
    const buffer = createBlockBuffer(5, 5)
    setChar(buffer, -1, 0, 'X')

    for (let y = 0; y < buffer.height; y++) {
      for (let x = 0; x < buffer.width; x++) {
        expect(buffer.chars[y][x]).toBe(' ')
      }
    }
  })

  it('should ignore x beyond width', () => {
    const buffer = createBlockBuffer(5, 5)
    setChar(buffer, 100, 0, 'X')

    for (let y = 0; y < buffer.height; y++) {
      for (let x = 0; x < buffer.width; x++) {
        expect(buffer.chars[y][x]).toBe(' ')
      }
    }
  })
})

describe('renderBlockBuffer (legacy)', () => {
  it('should render buffer contents', () => {
    const buffer = createBlockBuffer(5, 2)
    setChar(buffer, 0, 0, 'H')
    setChar(buffer, 1, 0, 'i')
    const output = renderBlockBuffer(buffer)

    expect(output).toContain('Hi')
  })

  it('should include color escapes', () => {
    const buffer = createBlockBuffer(5, 1)
    setChar(buffer, 0, 0, 'X', RED)
    const output = renderBlockBuffer(buffer)

    expect(output).toContain('\x1b[38;2;255;0;0m')
    expect(output).toContain('X')
  })

  it('should reset color at end of line', () => {
    const buffer = createBlockBuffer(5, 1)
    setChar(buffer, 0, 0, 'X', RED)
    const output = renderBlockBuffer(buffer)

    expect(output).toContain('\x1b[0m')
  })

  it('should reset color when transitioning from colored to uncolored', () => {
    const buffer = createBlockBuffer(5, 1)
    setChar(buffer, 0, 0, 'R', RED)
    setChar(buffer, 1, 0, 'W') // No color
    const output = renderBlockBuffer(buffer)

    // Should have reset between R and W
    expect(output).toContain('\x1b[0m')
  })

  it('should output correct number of lines', () => {
    const buffer = createBlockBuffer(5, 3)
    const output = renderBlockBuffer(buffer)

    const lines = output.split('\n')
    expect(lines.length).toBe(3)
  })
})

describe('blockRenderer', () => {
  // Mock canvas for testing
  const createMockCanvas = (width: number, height: number, cells?: Record<string, { char: string; fg: typeof WHITE; bg: typeof WHITE }>) => ({
    width,
    height,
    getCell: (x: number, y: number) => {
      const key = `${x},${y}`
      if (cells && cells[key]) {
        return cells[key]
      }
      return { char: ' ', fg: { r: 255, g: 255, b: 255, a: 1 }, bg: { r: 0, g: 0, b: 0, a: 1 } }
    },
    get: (x: number, y: number) => ({
      char: ' ',
      fg: { r: 255, g: 255, b: 255, a: 1 },
      bg: { r: 0, g: 0, b: 0, a: 1 },
    }),
    set: () => {},
    clear: () => {},
    fill: () => {},
    toString: () => '',
  })

  it('should have render method', () => {
    expect(typeof blockRenderer.render).toBe('function')
  })

  it('should return string from render', () => {
    const canvas = createMockCanvas(10, 5)
    const result = blockRenderer.render(canvas as any, { width: 10, height: 5 })

    expect(typeof result).toBe('string')
  })

  it('should use subpixel rendering by default', () => {
    const cells = {
      '0,0': { char: '●', fg: RED, bg: WHITE },
    }
    const canvas = createMockCanvas(5, 3, cells)
    const result = blockRenderer.render(canvas as any, { width: 5, height: 3 })

    // Subpixel rendering produces half-block characters
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('should use legacy mode when subpixel is false', () => {
    const canvas = createMockCanvas(5, 3)
    const result = blockRenderer.render(canvas as any, { width: 5, height: 3, subpixel: false } as any)

    expect(typeof result).toBe('string')
  })
})

describe('createBlockRenderer', () => {
  it('should create renderer with correct dimensions', () => {
    const renderer = createBlockRenderer(10, 5)

    expect(renderer.charWidth).toBe(10)
    expect(renderer.charHeight).toBe(5)
    expect(renderer.pixelWidth).toBe(10)
    expect(renderer.pixelHeight).toBe(10) // 2x vertical
  })

  it('should expose setPixel method', () => {
    const renderer = createBlockRenderer(5, 5)
    renderer.setPixel(2, 2, RED)

    expect(renderer.getPixel(2, 2)).toEqual(RED)
  })

  it('should expose getPixel method', () => {
    const renderer = createBlockRenderer(5, 5)

    expect(renderer.getPixel(0, 0)).toBeNull()
  })

  it('should expose drawLine method', () => {
    const renderer = createBlockRenderer(10, 5)
    renderer.drawLine(0, 0, 9, 9, WHITE)

    expect(renderer.getPixel(0, 0)).toEqual(WHITE)
    expect(renderer.getPixel(9, 9)).toEqual(WHITE)
  })

  it('should expose drawFilledCircle method', () => {
    const renderer = createBlockRenderer(10, 10)
    renderer.drawFilledCircle(5, 10, 2, GREEN)

    expect(renderer.getPixel(5, 10)).toEqual(GREEN)
  })

  it('should expose drawRect method', () => {
    const renderer = createBlockRenderer(10, 10)
    renderer.drawRect(2, 2, 4, 4, BLUE)

    // Corners should be set
    expect(renderer.getPixel(2, 2)).toEqual(BLUE)
    expect(renderer.getPixel(5, 2)).toEqual(BLUE)
    expect(renderer.getPixel(2, 5)).toEqual(BLUE)
    expect(renderer.getPixel(5, 5)).toEqual(BLUE)
  })

  it('should expose drawFilledRect method', () => {
    const renderer = createBlockRenderer(10, 10)
    renderer.drawFilledRect(2, 2, 3, 3, RED)

    // Interior should be filled
    expect(renderer.getPixel(3, 3)).toEqual(RED)
  })

  it('should expose clear method', () => {
    const renderer = createBlockRenderer(5, 5)
    renderer.setPixel(2, 2, RED)
    renderer.clear()

    expect(renderer.getPixel(2, 2)).toBeNull()
  })

  it('should expose render method', () => {
    const renderer = createBlockRenderer(3, 2)
    renderer.setPixel(1, 1, WHITE)
    const output = renderer.render()

    expect(typeof output).toBe('string')
    expect(output.split('\n').length).toBe(2)
  })

  it('should provide buffer access', () => {
    const renderer = createBlockRenderer(5, 5)

    expect(renderer.buffer).toBeDefined()
    expect(renderer.buffer.charWidth).toBe(5)
    expect(renderer.buffer.charHeight).toBe(5)
  })
})

describe('half-block subpixel rendering', () => {
  it('should render two rows of pixels per character row', () => {
    const buffer = createSubpixelBuffer(1, 1)

    // Set both upper and lower pixels
    setPixel(buffer, 0, 0, RED)
    setPixel(buffer, 0, 1, BLUE)

    const output = renderSubpixelBuffer(buffer)

    // Should have only 1 line of output for 1 char height
    expect(output.split('\n').length).toBe(1)
  })

  it('should double effective vertical resolution', () => {
    const renderer = createBlockRenderer(40, 12)

    // With 12 char rows, we get 24 pixel rows
    expect(renderer.pixelHeight).toBe(24)
    expect(renderer.charHeight).toBe(12)
  })
})

describe('Bresenham line algorithm', () => {
  it('should draw continuous line without gaps', () => {
    const buffer = createSubpixelBuffer(20, 10)
    drawLine(buffer, 0, 0, 19, 19, WHITE)

    // Count set pixels - should be continuous
    let lastY = -1
    let gaps = 0
    for (let x = 0; x < buffer.pixelWidth; x++) {
      let foundY = -1
      for (let y = 0; y < buffer.pixelHeight; y++) {
        if (buffer.pixels[y][x] !== null) {
          foundY = y
          break
        }
      }
      if (foundY !== -1 && lastY !== -1 && Math.abs(foundY - lastY) > 1) {
        gaps++
      }
      if (foundY !== -1) lastY = foundY
    }

    expect(gaps).toBe(0)
  })

  it('should handle steep lines correctly', () => {
    const buffer = createSubpixelBuffer(5, 10)
    drawLine(buffer, 2, 0, 2, 19, RED)

    // Vertical line - all 20 pixels in column 2 should be set
    for (let y = 0; y < 20; y++) {
      expect(buffer.pixels[y][2]).toEqual(RED)
    }
  })
})

describe('color escape optimization', () => {
  it('should not repeat color escapes for same color', () => {
    const buffer = createSubpixelBuffer(3, 1)
    setPixel(buffer, 0, 0, RED)
    setPixel(buffer, 0, 1, RED)
    setPixel(buffer, 1, 0, RED)
    setPixel(buffer, 1, 1, RED)
    setPixel(buffer, 2, 0, RED)
    setPixel(buffer, 2, 1, RED)

    const output = renderSubpixelBuffer(buffer)

    // Should only have one color escape for red
    const colorEscapes = output.match(/\x1b\[38;2;255;0;0m/g)
    expect(colorEscapes?.length).toBe(1)
  })
})

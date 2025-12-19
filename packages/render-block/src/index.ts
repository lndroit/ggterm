/**
 * @ggterm/render-block - Block character renderer
 *
 * Uses Unicode block characters for universal terminal compatibility.
 * Lower resolution than braille but works everywhere.
 */

import type { Canvas, RenderOptions, Renderer, RGBA } from '@ggterm/core'

/**
 * Block characters for rendering
 */
export const BLOCKS = {
  full: '█', // Full block (U+2588)
  upper: '▀', // Upper half (U+2580)
  lower: '▄', // Lower half (U+2584)
  left: '▌', // Left half (U+258C)
  right: '▐', // Right half (U+2590)
  light: '░', // Light shade (U+2591)
  medium: '▒', // Medium shade (U+2592)
  heavy: '▓', // Dark shade (U+2593)
  empty: ' ', // Empty
}

/**
 * Box drawing characters
 */
export const BOX = {
  horizontal: '─',
  vertical: '│',
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  topT: '┬',
  bottomT: '┴',
  leftT: '├',
  rightT: '┤',
  cross: '┼',
  // Rounded corners
  roundTopLeft: '╭',
  roundTopRight: '╮',
  roundBottomLeft: '╰',
  roundBottomRight: '╯',
}

/**
 * Buffer for block rendering
 */
export interface BlockBuffer {
  width: number
  height: number
  chars: string[][]
  colors: (RGBA | null)[][]
}

/**
 * Create a block buffer
 */
export function createBlockBuffer(width: number, height: number): BlockBuffer {
  const chars: string[][] = []
  const colors: (RGBA | null)[][] = []

  for (let y = 0; y < height; y++) {
    chars.push(Array(width).fill(' '))
    colors.push(Array(width).fill(null))
  }

  return { width, height, chars, colors }
}

/**
 * Set a character in the block buffer
 */
export function setChar(
  buffer: BlockBuffer,
  x: number,
  y: number,
  char: string,
  color?: RGBA
): void {
  if (x < 0 || x >= buffer.width || y < 0 || y >= buffer.height) {
    return
  }

  buffer.chars[y][x] = char
  if (color) {
    buffer.colors[y][x] = color
  }
}

/**
 * Render block buffer to string with ANSI colors
 */
export function renderBlockBuffer(buffer: BlockBuffer): string {
  const lines: string[] = []

  for (let y = 0; y < buffer.height; y++) {
    let line = ''
    let currentColor: RGBA | null = null

    for (let x = 0; x < buffer.width; x++) {
      const char = buffer.chars[y][x]
      const color = buffer.colors[y][x]

      // Add color escape if changed
      if (color && (!currentColor ||
        currentColor.r !== color.r ||
        currentColor.g !== color.g ||
        currentColor.b !== color.b)) {
        line += `\x1b[38;2;${color.r};${color.g};${color.b}m`
        currentColor = color
      } else if (!color && currentColor) {
        line += '\x1b[0m'
        currentColor = null
      }

      line += char
    }

    // Reset color at end of line
    if (currentColor) {
      line += '\x1b[0m'
    }
    lines.push(line)
  }

  return lines.join('\n')
}

/**
 * Block renderer implementation
 */
export const blockRenderer: Renderer = {
  render(_canvas: Canvas, options: RenderOptions): string {
    const buffer = createBlockBuffer(options.width, options.height)

    // TODO: Convert canvas cells to block characters
    // This is a placeholder implementation

    return renderBlockBuffer(buffer)
  },
}

export default blockRenderer

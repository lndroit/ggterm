/**
 * @ggterm/render-braille - Braille dot matrix renderer
 *
 * Uses Unicode braille patterns (U+2800–U+28FF) for high-resolution
 * terminal graphics. Each character cell is a 2x4 dot matrix, giving
 * an effective resolution of 160x96 dots on an 80x24 terminal.
 */

import type { Canvas, RenderOptions, Renderer, RGBA } from '@ggterm/core'

/**
 * Braille dot positions within a character cell
 *
 * Layout:       Bit values:
 * ┌─┬─┐        1 = 0x01    4 = 0x08
 * │1│4│        2 = 0x02    5 = 0x10
 * │2│5│        3 = 0x04    6 = 0x20
 * │3│6│        7 = 0x40    8 = 0x80
 * │7│8│
 * └─┴─┘
 */
const BRAILLE_DOTS = [
  [0x01, 0x08], // Row 0
  [0x02, 0x10], // Row 1
  [0x04, 0x20], // Row 2
  [0x40, 0x80], // Row 3
]

// Braille base character (empty pattern)
const BRAILLE_BASE = 0x2800

/**
 * Buffer for braille rendering
 */
export interface BrailleBuffer {
  width: number // In character cells
  height: number // In character cells
  dotWidth: number // In dots (width * 2)
  dotHeight: number // In dots (height * 4)
  dots: Uint8Array // Dot pattern for each cell
  colors: RGBA[] // Foreground color for each cell
}

/**
 * Create a braille buffer
 */
export function createBrailleBuffer(
  charWidth: number,
  charHeight: number
): BrailleBuffer {
  const cellCount = charWidth * charHeight
  return {
    width: charWidth,
    height: charHeight,
    dotWidth: charWidth * 2,
    dotHeight: charHeight * 4,
    dots: new Uint8Array(cellCount),
    colors: Array(cellCount).fill({ r: 255, g: 255, b: 255, a: 1 }),
  }
}

/**
 * Set a dot in the braille buffer
 */
export function setDot(
  buffer: BrailleBuffer,
  dotX: number,
  dotY: number,
  color?: RGBA
): void {
  // Convert dot coordinates to cell coordinates
  const cellX = Math.floor(dotX / 2)
  const cellY = Math.floor(dotY / 4)

  // Check bounds
  if (cellX < 0 || cellX >= buffer.width || cellY < 0 || cellY >= buffer.height) {
    return
  }

  // Get position within cell
  const subX = dotX % 2
  const subY = dotY % 4

  // Get cell index
  const cellIndex = cellY * buffer.width + cellX

  // Set the dot
  buffer.dots[cellIndex] |= BRAILLE_DOTS[subY][subX]

  // Set color if provided
  if (color) {
    buffer.colors[cellIndex] = color
  }
}

/**
 * Render braille buffer to string with ANSI colors
 */
export function renderBrailleBuffer(buffer: BrailleBuffer): string {
  const lines: string[] = []

  for (let y = 0; y < buffer.height; y++) {
    let line = ''
    let currentColor: RGBA | null = null

    for (let x = 0; x < buffer.width; x++) {
      const cellIndex = y * buffer.width + x
      const pattern = buffer.dots[cellIndex]
      const color = buffer.colors[cellIndex]

      // Add color escape if changed
      if (
        !currentColor ||
        currentColor.r !== color.r ||
        currentColor.g !== color.g ||
        currentColor.b !== color.b
      ) {
        line += `\x1b[38;2;${color.r};${color.g};${color.b}m`
        currentColor = color
      }

      // Add braille character
      line += String.fromCharCode(BRAILLE_BASE + pattern)
    }

    // Reset color at end of line
    line += '\x1b[0m'
    lines.push(line)
  }

  return lines.join('\n')
}

/**
 * Braille renderer implementation
 */
export const brailleRenderer: Renderer = {
  render(_canvas: Canvas, options: RenderOptions): string {
    const buffer = createBrailleBuffer(options.width, options.height)

    // TODO: Convert canvas cells to braille dots
    // This is a placeholder implementation

    return renderBrailleBuffer(buffer)
  },
}

export default brailleRenderer

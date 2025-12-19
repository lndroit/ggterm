/**
 * @ggterm/render-sixel - Sixel/Kitty graphics protocol renderer
 *
 * True pixel rendering for terminals with graphics support:
 * - Sixel: XTerm, mlterm, foot
 * - Kitty: Kitty terminal protocol
 * - iTerm2: Inline images protocol
 *
 * Falls back to braille when unsupported.
 */

import type { Canvas, RenderOptions, Renderer, RGBA } from '@ggterm/core'

/**
 * Graphics protocol detection
 */
export type GraphicsProtocol = 'sixel' | 'kitty' | 'iterm2' | 'none'

/**
 * Detect available graphics protocol
 */
export function detectGraphicsProtocol(): GraphicsProtocol {
  const term = process.env.TERM ?? ''
  const termProgram = process.env.TERM_PROGRAM ?? ''
  const kittyWindowId = process.env.KITTY_WINDOW_ID

  // Kitty terminal
  if (kittyWindowId) {
    return 'kitty'
  }

  // iTerm2
  if (termProgram === 'iTerm.app') {
    return 'iterm2'
  }

  // Sixel support (various terminals)
  if (
    term.includes('xterm') ||
    term === 'mlterm' ||
    term === 'foot' ||
    term === 'yaft'
  ) {
    // Could do actual capability detection here
    return 'sixel'
  }

  return 'none'
}

/**
 * Sixel encoder
 */
export function encodeToSixel(
  _pixels: RGBA[],
  _width: number,
  _height: number
): string {
  // Sixel format encodes 6 vertical pixels per row
  // Each pixel becomes a character in the range '?' (0x3F) to '~' (0x7E)

  const lines: string[] = []

  // Start sixel sequence
  lines.push('\x1bPq')

  // TODO: Implement actual sixel encoding
  // This is a placeholder

  // End sixel sequence
  lines.push('\x1b\\')

  return lines.join('')
}

/**
 * Kitty graphics encoder
 */
export function encodeToKitty(
  _pixels: RGBA[],
  _width: number,
  _height: number
): string {
  // Kitty protocol sends PNG/raw data as base64

  // TODO: Implement actual kitty encoding
  // This is a placeholder

  return ''
}

/**
 * iTerm2 inline image encoder
 */
export function encodeToIterm2(
  _pixels: RGBA[],
  _width: number,
  _height: number
): string {
  // iTerm2 uses OSC 1337 with base64 encoded image

  // TODO: Implement actual iTerm2 encoding
  // This is a placeholder

  return ''
}

/**
 * Sixel/Graphics renderer implementation
 */
export const sixelRenderer: Renderer = {
  render(canvas: Canvas, _options: RenderOptions): string {
    const protocol = detectGraphicsProtocol()

    if (protocol === 'none') {
      // Fall back to text rendering
      return '[Graphics not supported - falling back to text]\n'
    }

    // Convert canvas to pixel buffer
    const pixels: RGBA[] = []
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const cell = canvas.getCell(x, y)
        pixels.push(cell.fg)
      }
    }

    switch (protocol) {
      case 'sixel':
        return encodeToSixel(pixels, canvas.width, canvas.height)
      case 'kitty':
        return encodeToKitty(pixels, canvas.width, canvas.height)
      case 'iterm2':
        return encodeToIterm2(pixels, canvas.width, canvas.height)
      default:
        return ''
    }
  },
}

export default sixelRenderer

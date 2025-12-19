/**
 * Tests for theme system
 */

import { describe, expect, it } from 'bun:test'
import {
  defaultTheme,
  themeMinimal,
  themeDark,
  themeClassic,
  themeVoid,
} from '../../themes/default'

describe('defaultTheme', () => {
  it('should return a complete theme object', () => {
    const theme = defaultTheme()
    expect(theme).toBeDefined()
    expect(theme.panel).toBeDefined()
    expect(theme.axis).toBeDefined()
    expect(theme.legend).toBeDefined()
    expect(theme.title).toBeDefined()
  })

  it('should have single border panel', () => {
    const theme = defaultTheme()
    expect(theme.panel.border).toBe('single')
  })

  it('should have major grid', () => {
    const theme = defaultTheme()
    expect(theme.panel.grid.major).toBe('·')
    expect(theme.panel.grid.minor).toBeNull()
  })

  it('should have legend on right', () => {
    const theme = defaultTheme()
    expect(theme.legend.position).toBe('right')
  })

  it('should have centered bold title', () => {
    const theme = defaultTheme()
    expect(theme.title.align).toBe('center')
    expect(theme.title.bold).toBe(true)
  })

  it('should have tick character', () => {
    const theme = defaultTheme()
    expect(theme.axis.ticks.char).toBe('┼')
    expect(theme.axis.ticks.length).toBe(1)
  })
})

describe('themeMinimal', () => {
  it('should return a complete theme object', () => {
    const theme = themeMinimal()
    expect(theme).toBeDefined()
    expect(theme.panel).toBeDefined()
    expect(theme.axis).toBeDefined()
    expect(theme.legend).toBeDefined()
    expect(theme.title).toBeDefined()
  })

  it('should have no border', () => {
    const theme = themeMinimal()
    expect(theme.panel.border).toBe('none')
  })

  it('should have no grid', () => {
    const theme = themeMinimal()
    expect(theme.panel.grid.major).toBeNull()
    expect(theme.panel.grid.minor).toBeNull()
  })

  it('should have left-aligned non-bold title', () => {
    const theme = themeMinimal()
    expect(theme.title.align).toBe('left')
    expect(theme.title.bold).toBe(false)
  })

  it('should have non-bold legend title', () => {
    const theme = themeMinimal()
    expect(theme.legend.title.bold).toBe(false)
  })
})

describe('themeDark', () => {
  it('should return a complete theme object', () => {
    const theme = themeDark()
    expect(theme).toBeDefined()
    expect(theme.panel).toBeDefined()
    expect(theme.axis).toBeDefined()
    expect(theme.legend).toBeDefined()
    expect(theme.title).toBeDefined()
  })

  it('should have dark background', () => {
    const theme = themeDark()
    expect(theme.panel.background).toBe('#1e1e1e')
  })

  it('should have rounded border', () => {
    const theme = themeDark()
    expect(theme.panel.border).toBe('rounded')
  })

  it('should have dark grid color', () => {
    const theme = themeDark()
    expect(theme.panel.grid.major).toBe('#333')
  })

  it('should have light axis text', () => {
    const theme = themeDark()
    expect(theme.axis.text.color).toBe('#ccc')
  })

  it('should have white bold axis titles', () => {
    const theme = themeDark()
    expect(theme.axis.title.color).toBe('#fff')
    expect(theme.axis.title.bold).toBe(true)
  })
})

describe('themeClassic', () => {
  it('should return a complete theme object', () => {
    const theme = themeClassic()
    expect(theme).toBeDefined()
    expect(theme.panel).toBeDefined()
    expect(theme.axis).toBeDefined()
    expect(theme.legend).toBeDefined()
    expect(theme.title).toBeDefined()
  })

  it('should have single border', () => {
    const theme = themeClassic()
    expect(theme.panel.border).toBe('single')
  })

  it('should have no grid (classic style)', () => {
    const theme = themeClassic()
    expect(theme.panel.grid.major).toBeNull()
    expect(theme.panel.grid.minor).toBeNull()
  })

  it('should have bold axis titles', () => {
    const theme = themeClassic()
    expect(theme.axis.title.bold).toBe(true)
  })

  it('should have horizontal tick character', () => {
    const theme = themeClassic()
    expect(theme.axis.ticks.char).toBe('─')
  })
})

describe('themeVoid', () => {
  it('should return a complete theme object', () => {
    const theme = themeVoid()
    expect(theme).toBeDefined()
    expect(theme.panel).toBeDefined()
    expect(theme.axis).toBeDefined()
    expect(theme.legend).toBeDefined()
    expect(theme.title).toBeDefined()
  })

  it('should have no border', () => {
    const theme = themeVoid()
    expect(theme.panel.border).toBe('none')
  })

  it('should have no grid', () => {
    const theme = themeVoid()
    expect(theme.panel.grid.major).toBeNull()
    expect(theme.panel.grid.minor).toBeNull()
  })

  it('should have no legend', () => {
    const theme = themeVoid()
    expect(theme.legend.position).toBe('none')
  })

  it('should have empty tick character', () => {
    const theme = themeVoid()
    expect(theme.axis.ticks.char).toBe('')
    expect(theme.axis.ticks.length).toBe(0)
  })

  it('should have non-bold elements', () => {
    const theme = themeVoid()
    expect(theme.title.bold).toBe(false)
    expect(theme.legend.title.bold).toBe(false)
    expect(theme.axis.title.bold).toBe(false)
  })
})

describe('theme structure consistency', () => {
  const themes = [
    { name: 'default', fn: defaultTheme },
    { name: 'minimal', fn: themeMinimal },
    { name: 'dark', fn: themeDark },
    { name: 'classic', fn: themeClassic },
    { name: 'void', fn: themeVoid },
  ]

  for (const { name, fn } of themes) {
    it(`${name} theme should have panel.background`, () => {
      const theme = fn()
      expect(typeof theme.panel.background).toBe('string')
    })

    it(`${name} theme should have panel.border`, () => {
      const theme = fn()
      expect(typeof theme.panel.border).toBe('string')
    })

    it(`${name} theme should have panel.grid`, () => {
      const theme = fn()
      expect(theme.panel.grid).toBeDefined()
      expect('major' in theme.panel.grid).toBe(true)
      expect('minor' in theme.panel.grid).toBe(true)
    })

    it(`${name} theme should have axis.text`, () => {
      const theme = fn()
      expect(theme.axis.text).toBeDefined()
      expect('color' in theme.axis.text).toBe(true)
    })

    it(`${name} theme should have axis.ticks`, () => {
      const theme = fn()
      expect(theme.axis.ticks).toBeDefined()
      expect('char' in theme.axis.ticks).toBe(true)
      expect('length' in theme.axis.ticks).toBe(true)
    })

    it(`${name} theme should have axis.title`, () => {
      const theme = fn()
      expect(theme.axis.title).toBeDefined()
      expect('color' in theme.axis.title).toBe(true)
      expect('bold' in theme.axis.title).toBe(true)
    })

    it(`${name} theme should have legend.position`, () => {
      const theme = fn()
      expect(typeof theme.legend.position).toBe('string')
    })

    it(`${name} theme should have legend.title`, () => {
      const theme = fn()
      expect(theme.legend.title).toBeDefined()
      expect('bold' in theme.legend.title).toBe(true)
    })

    it(`${name} theme should have title.align`, () => {
      const theme = fn()
      expect(typeof theme.title.align).toBe('string')
    })

    it(`${name} theme should have title.bold`, () => {
      const theme = fn()
      expect(typeof theme.title.bold).toBe('boolean')
    })
  }
})

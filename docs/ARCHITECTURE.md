# ggterm Architecture

## Overview

ggterm implements Leland Wilkinson's Grammar of Graphics as a layered system that transforms data into terminal-rendered visualizations. The architecture separates concerns into distinct layers, each with a single responsibility.

## The Seven Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                           Theme                                  │
│                    (non-data styling)                           │
├─────────────────────────────────────────────────────────────────┤
│                          Facets                                  │
│                    (small multiples)                            │
├─────────────────────────────────────────────────────────────────┤
│                        Coordinates                               │
│                   (coordinate system)                           │
├─────────────────────────────────────────────────────────────────┤
│                          Scales                                  │
│               (data domain → visual range)                      │
├─────────────────────────────────────────────────────────────────┤
│                        Statistics                                │
│                  (data transformations)                         │
├─────────────────────────────────────────────────────────────────┤
│                        Geometries                                │
│                     (visual marks)                              │
├─────────────────────────────────────────────────────────────────┤
│                        Aesthetics                                │
│              (variable → visual mapping)                        │
├─────────────────────────────────────────────────────────────────┤
│                           Data                                   │
│                     (input dataset)                             │
└─────────────────────────────────────────────────────────────────┘
```

### Layer Details

#### 1. Data Layer
The foundation. Accepts arrays of records, typed arrays, or streaming iterators.

```typescript
interface DataSource {
  records: Record<string, unknown>[]
  // Future: Arrow tables, streaming iterators
}
```

#### 2. Aesthetics Layer
Maps data variables to visual properties.

```typescript
interface AestheticMapping {
  x: string          // Required: x-axis variable
  y: string          // Required: y-axis variable
  color?: string     // Point/line color
  fill?: string      // Fill color (bars, areas)
  size?: string      // Point size
  shape?: string     // Point shape
  alpha?: string     // Transparency
  group?: string     // Grouping variable
}
```

#### 3. Geometries Layer
Determines the visual representation of data points.

| Geom | Output | Terminal Chars |
|------|--------|----------------|
| `geom_point` | Scatter dots | `⠁⠂⠄⡀⢀` (braille) or `·•●` |
| `geom_line` | Connected line | `─│╭╮╯╰` or braille path |
| `geom_bar` | Vertical bars | `█▇▆▅▄▃▂▁` |
| `geom_area` | Filled region | Block fills `░▒▓█` |
| `geom_text` | Labels | Actual characters |
| `geom_hline` | Horizontal line | `───────` |
| `geom_vline` | Vertical line | `│` |

#### 4. Statistics Layer
Transforms data before rendering.

```typescript
// Binning for histograms
stat_bin({ bins: 30 })

// Smoothing (loess, linear)
stat_smooth({ method: 'loess', span: 0.75 })

// Density estimation
stat_density({ kernel: 'gaussian' })

// Summary statistics
stat_summary({ fun: 'mean' })
```

#### 5. Scales Layer
Maps data domain to visual range.

**Position Scales:**
```typescript
scale_x_continuous({ limits: [0, 100], breaks: [0, 25, 50, 75, 100] })
scale_x_log10()
scale_x_discrete()
```

**Color Scales:**
```typescript
scale_color_continuous({ palette: 'viridis' })
scale_color_discrete({ palette: 'category10' })
scale_color_manual({ values: ['#e41a1c', '#377eb8', '#4daf4a'] })
```

#### 6. Coordinates Layer
Defines the coordinate system.

```typescript
coord_cartesian()     // Default: x horizontal, y vertical
coord_flip()          // Swap x and y
coord_polar()         // Polar coordinates (limited terminal support)
```

#### 7. Facets Layer
Creates small multiples by splitting data.

```typescript
facet_wrap('variable', { ncol: 3 })
facet_grid({ rows: 'var1', cols: 'var2' })
```

#### 8. Theme Layer
Controls non-data visual elements.

```typescript
interface Theme {
  panel: {
    background: string
    border: 'none' | 'single' | 'double' | 'rounded'
    grid: { major: string | null, minor: string | null }
  }
  axis: {
    text: { color: string, size: number }
    ticks: { char: string, length: number }
    title: { color: string, bold: boolean }
  }
  legend: {
    position: 'right' | 'bottom' | 'none'
    title: { bold: boolean }
  }
  title: {
    align: 'left' | 'center' | 'right'
    bold: boolean
  }
}
```

## Rendering Pipeline

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   Data   │───▶│  Stats   │───▶│  Scales  │───▶│  Geoms   │
│  Layer   │    │Transform │    │  Map     │    │ Render   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                      │
                                                      ▼
┌──────────────────────────────────────────────────────────────┐
│                      Canvas Buffer                            │
│            (abstract grid of cells/pixels)                    │
└──────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│    Braille    │       │     Block     │       │  Sixel/Kitty  │
│   Renderer    │       │   Renderer    │       │   Renderer    │
│  160×96 dots  │       │  80×24 chars  │       │  true pixels  │
└───────────────┘       └───────────────┘       └───────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
                    ┌───────────────────┐
                    │  Terminal Output  │
                    │   (ANSI string)   │
                    └───────────────────┘
```

### 1. Data Collection
Gather records from data source, apply any filtering.

### 2. Statistical Transformation
Apply stat functions (binning, smoothing, density estimation).

### 3. Scale Calculation
Compute scale domains from data, calculate breaks and labels.

### 4. Geometry Rendering
Each geom renders to abstract canvas coordinates.

### 5. Canvas to Terminal
Renderer converts canvas buffer to terminal escape sequences.

## Renderer Architecture

### Abstract Canvas

The canvas is a 2D buffer of cells, where each cell contains:

```typescript
interface CanvasCell {
  char: string           // Character to display
  fg: RGBA              // Foreground color
  bg: RGBA              // Background color
  attrs: CellAttributes  // Bold, italic, etc.
}

interface RGBA {
  r: number  // 0-255
  g: number  // 0-255
  b: number  // 0-255
  a: number  // 0-1
}
```

### Braille Renderer

Uses Unicode braille patterns (U+2800–U+28FF) where each character cell is a 2×4 dot matrix:

```
Cell layout:
┌─┬─┐
│1│4│
│2│5│
│3│6│
│7│8│
└─┴─┘

Dot values:
1 = 0x01    4 = 0x08
2 = 0x02    5 = 0x10
3 = 0x04    6 = 0x20
7 = 0x40    8 = 0x80
```

Resolution: 80×24 terminal → 160×96 effective dots

### Block Renderer

Uses Unicode block characters for wider compatibility:

```
Full:    █ (U+2588)
Halves:  ▀▄▌▐ (U+2580, U+2584, U+258C, U+2590)
Shades:  ░▒▓ (U+2591, U+2592, U+2593)
Lines:   ─│┌┐└┘├┤┬┴┼ (box drawing)
```

Resolution equals character grid (80×24 typical).

### Sixel/Kitty Renderer

True pixel rendering for terminals with graphics support:

- **Sixel**: XTerm, mlterm, foot
- **Kitty**: Kitty terminal protocol
- **iTerm2**: Inline images protocol

Falls back to Braille when unsupported.

## Color System

### Terminal Capabilities

```typescript
enum ColorCapability {
  None = 0,        // Monochrome
  Basic = 4,       // 16 colors (ANSI)
  Extended = 8,    // 256 colors
  TrueColor = 24   // 16.7M colors
}
```

### Capability Detection

```typescript
function detectColorCapability(): ColorCapability {
  if (process.env.COLORTERM === 'truecolor') return ColorCapability.TrueColor
  if (process.env.TERM?.includes('256color')) return ColorCapability.Extended
  if (process.env.TERM) return ColorCapability.Basic
  return ColorCapability.None
}
```

### Color Palettes

Built-in palettes optimized for terminal rendering:

**Sequential**: viridis, plasma, inferno, magma
**Diverging**: RdBu, BrBG, PiYG
**Categorical**: category10, Set1, Set2, Dark2

Each palette provides mappings for all color capability levels.

## OpenTUI Integration

### Component Architecture

```tsx
// GGTerm wraps the grammar engine in a React component
<GGTerm
  data={data}
  aes={{ x: 'var1', y: 'var2' }}
  geoms={[geom_point()]}
  scales={[scale_color_viridis()]}
  theme={theme_dark()}
  width={80}
  height={24}
/>
```

### Rendering Flow

1. GGTerm component receives props
2. Creates ggterm plot specification
3. Renders to OpenTUI FrameBuffer
4. FrameBuffer integrates with OpenTUI render tree
5. Changes trigger re-render (reactive)

### Event Handling

```typescript
// Mouse hover shows tooltip
onHover?: (point: DataPoint, position: { x: number, y: number }) => void

// Click selects point
onClick?: (point: DataPoint) => void

// Keyboard navigation
onKeyDown?: (key: string) => void  // Arrow keys for zoom/pan
```

## Performance Considerations

### Large Datasets

For datasets > 10,000 points:
1. **Binning**: Automatic hexbin or rect binning
2. **Sampling**: Random or systematic sampling
3. **LOD**: Level-of-detail based on terminal size

### Streaming Data

```typescript
const plot = gg().aes({ x: 'time', y: 'value' }).geom(geom_line())

// Push new data points
stream.on('data', (point) => {
  plot.push(point)
  // Only re-renders affected region
})
```

### Diff-Based Rendering

Track previous frame, only emit escape sequences for changed cells.

## File Structure

```
packages/
├── core/
│   ├── src/
│   │   ├── index.ts           # Public exports
│   │   ├── grammar.ts         # gg() builder
│   │   ├── aesthetics.ts      # Aesthetic mappings
│   │   ├── geoms/             # Geometry implementations
│   │   │   ├── point.ts
│   │   │   ├── line.ts
│   │   │   ├── bar.ts
│   │   │   └── ...
│   │   ├── scales/            # Scale implementations
│   │   │   ├── continuous.ts
│   │   │   ├── discrete.ts
│   │   │   ├── color.ts
│   │   │   └── ...
│   │   ├── stats/             # Statistical transforms
│   │   ├── coords/            # Coordinate systems
│   │   ├── facets/            # Faceting
│   │   ├── themes/            # Theme definitions
│   │   └── canvas/            # Abstract canvas
│   └── package.json
├── render-braille/
│   ├── src/
│   │   ├── index.ts
│   │   └── braille.ts         # Braille renderer
│   └── package.json
├── render-block/
│   └── ...
├── render-sixel/
│   └── ...
└── opentui/
    ├── src/
    │   ├── index.ts
    │   ├── GGTerm.tsx         # React component
    │   └── hooks.ts           # useGGTerm, etc.
    └── package.json
```

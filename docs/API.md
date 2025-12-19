# ggterm API Reference

## Core Package (`@ggterm/core`)

### gg() - Plot Builder

The main entry point for creating plots.

```typescript
import { gg } from '@ggterm/core'

// Create a plot from data
const plot = gg(data)
  .aes({ x: 'var1', y: 'var2' })
  .geom(geom_point())
```

#### Methods

| Method | Description |
|--------|-------------|
| `gg(data)` | Create a new plot with the given data |
| `.aes(mapping)` | Set aesthetic mappings |
| `.geom(geom)` | Add a geometry layer |
| `.stat(stat)` | Add a statistical transformation |
| `.scale(scale)` | Add or modify a scale |
| `.coord(coord)` | Set the coordinate system |
| `.facet(facet)` | Add faceting |
| `.theme(theme)` | Apply a theme |
| `.labs(labels)` | Set labels (title, x, y, etc.) |
| `.render(options)` | Render to string |
| `.push(data)` | Add streaming data points |

### Aesthetic Mappings

```typescript
interface AestheticMapping {
  x: string           // Required: x-axis variable
  y: string           // Required: y-axis variable
  color?: string      // Point/line color
  fill?: string       // Fill color (bars, areas)
  size?: string       // Point size
  shape?: string      // Point shape
  alpha?: string      // Transparency
  group?: string      // Grouping variable
  label?: string      // Text labels
}
```

---

## Geometries

### geom_point()

Renders data points as scatter plot markers.

```typescript
import { geom_point } from '@ggterm/core'

// Basic scatter plot
gg(data).aes({ x: 'pc1', y: 'pc2' }).geom(geom_point())

// With options
gg(data).aes({ x: 'pc1', y: 'pc2' }).geom(geom_point({
  size: 2,
  shape: 'circle',   // 'circle' | 'square' | 'triangle' | 'cross'
  alpha: 0.8
}))
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `size` | number | 1 | Point size multiplier |
| `shape` | string | 'circle' | Point shape |
| `alpha` | number | 1 | Opacity (0-1) |
| `color` | string | null | Fixed color (overrides aes) |

### geom_line()

Connects data points with lines.

```typescript
import { geom_line } from '@ggterm/core'

gg(data).aes({ x: 'time', y: 'value', group: 'series' }).geom(geom_line())

// With options
gg(data).aes({ x: 'time', y: 'value' }).geom(geom_line({
  linewidth: 1,
  linetype: 'solid'   // 'solid' | 'dashed' | 'dotted'
}))
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `linewidth` | number | 1 | Line thickness |
| `linetype` | string | 'solid' | Line style |
| `alpha` | number | 1 | Opacity |

### geom_bar()

Renders vertical bars.

```typescript
import { geom_bar } from '@ggterm/core'

// Count occurrences (stat = 'count')
gg(data).aes({ x: 'category' }).geom(geom_bar())

// Pre-computed heights (stat = 'identity')
gg(data).aes({ x: 'category', y: 'value' }).geom(geom_bar({ stat: 'identity' }))
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `stat` | string | 'count' | Statistical transformation |
| `width` | number | 0.9 | Bar width (0-1) |
| `position` | string | 'stack' | Position adjustment |

### geom_area()

Renders filled areas under lines.

```typescript
import { geom_area } from '@ggterm/core'

gg(data).aes({ x: 'time', y: 'value' }).geom(geom_area({
  alpha: 0.5
}))
```

### geom_text()

Adds text labels to the plot.

```typescript
import { geom_text } from '@ggterm/core'

gg(data).aes({ x: 'pc1', y: 'pc2', label: 'name' }).geom(geom_text({
  nudge_x: 0.5,
  nudge_y: 0.5
}))
```

### geom_hline() / geom_vline()

Adds reference lines.

```typescript
import { geom_hline, geom_vline } from '@ggterm/core'

gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .geom(geom_hline({ yintercept: 0, linetype: 'dashed' }))
  .geom(geom_vline({ xintercept: 0, linetype: 'dashed' }))
```

---

## Statistics

### stat_bin()

Bins continuous data for histograms.

```typescript
import { stat_bin } from '@ggterm/core'

gg(data)
  .aes({ x: 'value' })
  .stat(stat_bin({ bins: 30 }))
  .geom(geom_bar({ stat: 'identity' }))
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `bins` | number | 30 | Number of bins |
| `binwidth` | number | null | Bin width (overrides bins) |
| `center` | number | null | Center of a bin |

### stat_smooth()

Adds smoothed conditional means.

```typescript
import { stat_smooth } from '@ggterm/core'

gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .stat(stat_smooth({ method: 'loess', span: 0.75 }))
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `method` | string | 'loess' | Smoothing method ('loess', 'lm') |
| `span` | number | 0.75 | LOESS span |
| `se` | boolean | true | Show standard error band |

### stat_density()

Computes kernel density estimates.

```typescript
import { stat_density } from '@ggterm/core'

gg(data)
  .aes({ x: 'value' })
  .stat(stat_density({ kernel: 'gaussian' }))
  .geom(geom_area())
```

### stat_summary()

Summarizes data by groups.

```typescript
import { stat_summary } from '@ggterm/core'

gg(data)
  .aes({ x: 'group', y: 'value' })
  .stat(stat_summary({ fun: 'mean', fun.min: 'min', fun.max: 'max' }))
```

---

## Scales

### Position Scales

```typescript
import {
  scale_x_continuous,
  scale_y_continuous,
  scale_x_log10,
  scale_y_log10,
  scale_x_discrete,
  scale_y_discrete
} from '@ggterm/core'

// Set limits and breaks
gg(data).scale(scale_x_continuous({
  limits: [0, 100],
  breaks: [0, 25, 50, 75, 100],
  labels: ['0%', '25%', '50%', '75%', '100%']
}))

// Log scale
gg(data).scale(scale_x_log10())
```

#### Options (Continuous)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `limits` | [number, number] | auto | Scale limits |
| `breaks` | number[] | auto | Tick positions |
| `labels` | string[] | auto | Tick labels |
| `trans` | string | 'identity' | Transformation |
| `expand` | [number, number] | [0.05, 0] | Expansion factor |

### Color Scales

```typescript
import {
  scale_color_continuous,
  scale_color_discrete,
  scale_color_viridis,
  scale_color_manual
} from '@ggterm/core'

// Viridis palette (great for colorblind accessibility)
gg(data).scale(scale_color_viridis())

// Manual colors
gg(data).scale(scale_color_manual({
  values: { 'group_a': '#e41a1c', 'group_b': '#377eb8' }
}))

// Built-in palettes
gg(data).scale(scale_color_discrete({ palette: 'Set1' }))
```

#### Available Palettes

**Sequential**: viridis, plasma, inferno, magma, cividis
**Diverging**: RdBu, BrBG, PiYG, PRGn
**Categorical**: category10, Set1, Set2, Set3, Dark2, Paired

---

## Coordinates

```typescript
import { coord_cartesian, coord_flip, coord_polar } from '@ggterm/core'

// Default Cartesian
gg(data).coord(coord_cartesian())

// Flip x and y
gg(data).coord(coord_flip())

// Polar (limited terminal support)
gg(data).coord(coord_polar({ theta: 'x' }))
```

### coord_cartesian()

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `xlim` | [number, number] | null | X-axis limits (zoom only) |
| `ylim` | [number, number] | null | Y-axis limits (zoom only) |
| `clip` | boolean | true | Clip to plot area |

---

## Facets

### facet_wrap()

Creates small multiples wrapped into rows.

```typescript
import { facet_wrap } from '@ggterm/core'

gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .facet(facet_wrap('category', { ncol: 3 }))
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `ncol` | number | auto | Number of columns |
| `nrow` | number | auto | Number of rows |
| `scales` | string | 'fixed' | Scale sharing: 'fixed', 'free', 'free_x', 'free_y' |

### facet_grid()

Creates a grid of facets.

```typescript
import { facet_grid } from '@ggterm/core'

gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .facet(facet_grid({ rows: 'var1', cols: 'var2' }))
```

---

## Themes

### Built-in Themes

```typescript
import { theme_minimal, theme_dark, theme_classic, theme_void } from '@ggterm/core'

gg(data).theme(theme_minimal())
gg(data).theme(theme_dark())
```

### Custom Theme

```typescript
import { theme } from '@ggterm/core'

gg(data).theme(theme({
  panel: {
    background: '#1e1e1e',
    border: 'rounded',
    grid: { major: '#333', minor: null }
  },
  axis: {
    text: { color: '#ccc' },
    ticks: { char: '┼' },
    title: { bold: true }
  },
  legend: {
    position: 'right'
  }
}))
```

### Theme Structure

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

---

## Labels

```typescript
gg(data).labs({
  title: 'Main Title',
  subtitle: 'Subtitle',
  caption: 'Data source',
  x: 'X Axis Label',
  y: 'Y Axis Label',
  color: 'Color Legend',
  fill: 'Fill Legend'
})
```

---

## Rendering

### render()

Renders the plot to a string.

```typescript
const output = plot.render({
  width: 80,        // Characters wide
  height: 24,       // Characters tall
  renderer: 'braille'  // 'braille' | 'block' | 'sixel' | 'auto'
})

console.log(output)
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `width` | number | 80 | Output width in characters |
| `height` | number | 24 | Output height in characters |
| `renderer` | string | 'auto' | Renderer type |
| `colorMode` | string | 'auto' | Color mode ('none', '16', '256', 'truecolor') |

---

## OpenTUI Integration (`@ggterm/opentui`)

### GGTerm Component

React component for embedding plots in OpenTUI applications.

```tsx
import { GGTerm } from '@ggterm/opentui'

function MyApp() {
  return (
    <GGTerm
      data={data}
      aes={{ x: 'pc1', y: 'pc2', color: 'group' }}
      geoms={[geom_point()]}
      scales={[scale_color_viridis()]}
      theme={theme_dark()}
      width={80}
      height={24}
      onHover={(point) => console.log(point)}
      onClick={(point) => console.log(point)}
    />
  )
}
```

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | Record[] | Data array |
| `aes` | AestheticMapping | Aesthetic mappings |
| `geoms` | Geom[] | Geometry layers |
| `stats` | Stat[] | Statistical transforms |
| `scales` | Scale[] | Scale definitions |
| `coord` | Coord | Coordinate system |
| `facet` | Facet | Faceting specification |
| `theme` | Theme | Theme object |
| `width` | number \| string | Width (chars or percentage) |
| `height` | number | Height in characters |
| `onHover` | function | Hover callback |
| `onClick` | function | Click callback |

### useGGTerm Hook

For more control over the plot lifecycle.

```tsx
import { useGGTerm } from '@ggterm/opentui'

function MyPlot({ data }) {
  const { plot, rendered, setData } = useGGTerm({
    aes: { x: 'x', y: 'y' },
    geoms: [geom_point()]
  })

  useEffect(() => {
    setData(data)
  }, [data])

  return <text>{rendered}</text>
}
```

---

## Streaming Data

```typescript
const plot = gg([]).aes({ x: 'time', y: 'value' }).geom(geom_line())

// Push new data points
stream.on('data', (point) => {
  plot.push(point)
  console.clear()
  console.log(plot.render())
})
```

---

## TypeScript Types

```typescript
import type {
  Plot,
  Geom,
  Stat,
  Scale,
  Coord,
  Facet,
  Theme,
  AestheticMapping,
  DataSource,
  RenderOptions
} from '@ggterm/core'
```

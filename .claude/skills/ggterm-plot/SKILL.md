---
name: ggterm-plot
description: Create terminal data visualizations using Grammar of Graphics. Use when plotting data, creating charts, graphing, visualizing distributions, or when the user mentions plot, chart, graph, histogram, scatter, boxplot, or visualize.
allowed-tools: Bash(bun:*), Bash(npx:*), Read, Write
---

# Terminal Plotting with ggterm

Create publication-quality terminal visualizations using the Grammar of Graphics.

## Installation

```bash
bun add @ggterm/core
# or
npm install @ggterm/core
```

## Basic Pattern

```typescript
import { gg, geom_point, geom_line } from '@ggterm/core'

const plot = gg(data)
  .aes({ x: 'time', y: 'value' })       // Map data to aesthetics
  .geom(geom_point())                    // Add geometry layer
  .labs({ title: 'My Plot', x: 'Time', y: 'Value' })

console.log(plot.render({ width: 80, height: 24 }))
```

## Geom Selection Guide

| Data Question | Geom | Example |
|---------------|------|---------|
| Relationship between 2 variables | `geom_point()` | Scatter plot |
| Trend over time | `geom_line()` | Time series |
| Distribution of 1 variable | `geom_histogram()` | Frequency distribution |
| Distribution by group | `geom_boxplot()` | Compare medians |
| Density shape | `geom_violin()` | Distribution shape |
| Category comparison | `geom_bar()` | Counts per category |
| Known values per category | `geom_col()` | Bar heights from data |
| Trend with uncertainty | `geom_smooth()` | Fitted line |
| 2D density | `geom_density_2d()` | Contour density |
| Filled region | `geom_area()` | Cumulative or stacked |
| Error ranges | `geom_errorbar()` | Confidence intervals |

## Common Plot Types

### Scatter Plot
```typescript
gg(data)
  .aes({ x: 'weight', y: 'height', color: 'species' })
  .geom(geom_point({ size: 2 }))
```

### Line Chart
```typescript
gg(data)
  .aes({ x: 'date', y: 'value', color: 'category' })
  .geom(geom_line())
```

### Histogram
```typescript
import { geom_histogram } from '@ggterm/core'

gg(data)
  .aes({ x: 'value' })
  .geom(geom_histogram({ bins: 20 }))
```

### Box Plot
```typescript
import { geom_boxplot } from '@ggterm/core'

gg(data)
  .aes({ x: 'group', y: 'value' })
  .geom(geom_boxplot())
```

### Bar Chart
```typescript
import { geom_bar } from '@ggterm/core'

gg(data)
  .aes({ x: 'category', fill: 'category' })
  .geom(geom_bar())  // Counts occurrences
```

## Color and Styling

### Color Scales

```typescript
import { scale_color_viridis, scale_color_brewer } from '@ggterm/core'

// Viridis (perceptually uniform)
gg(data)
  .aes({ x: 'x', y: 'y', color: 'value' })
  .geom(geom_point())
  .scale(scale_color_viridis())

// ColorBrewer palettes
.scale(scale_color_brewer({ palette: 'Set1' }))  // Categorical
.scale(scale_color_brewer({ palette: 'Blues' })) // Sequential
```

### Themes

```typescript
import { themeDark, themeMinimal, themeClassic } from '@ggterm/core'

gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .theme(themeDark())      // Dark background
  // or .theme(themeMinimal())  // Clean, minimal
  // or .theme(themeClassic())  // Traditional
```

## Faceting (Small Multiples)

```typescript
import { facet_wrap, facet_grid } from '@ggterm/core'

// Wrap into grid
gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .facet(facet_wrap({ vars: 'category', ncol: 3 }))

// Grid by two variables
.facet(facet_grid({ rows: 'year', cols: 'region' }))
```

## Scale Transformations

```typescript
import { scale_x_log10, scale_y_sqrt } from '@ggterm/core'

gg(data)
  .aes({ x: 'population', y: 'gdp' })
  .geom(geom_point())
  .scale(scale_x_log10())
  .scale(scale_y_sqrt())
```

## Layering Multiple Geoms

```typescript
gg(data)
  .aes({ x: 'time', y: 'value' })
  .geom(geom_point({ alpha: 0.5 }))  // Points first
  .geom(geom_line())                  // Line on top
  .geom(geom_smooth({ method: 'loess' }))  // Trend line
```

## Annotations

```typescript
import { annotate_text, annotate_hline, annotate_rect } from '@ggterm/core'

gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .annotate(annotate_hline({ yintercept: 0, linetype: 'dashed' }))
  .annotate(annotate_text({ x: 10, y: 5, label: 'Important point' }))
```

## Saving Plot Specifications

For reproducibility, save the PlotSpec alongside output:

```typescript
import { writeFileSync } from 'fs'

const plot = gg(data).aes({ x: 'x', y: 'y' }).geom(geom_point())

// Get JSON-serializable specification
const spec = plot.spec()
writeFileSync('plot-spec.json', JSON.stringify(spec, null, 2))

// Render to terminal
console.log(plot.render({ width: 80, height: 24 }))
```

## Render Options

```typescript
plot.render({
  width: 80,           // Characters wide
  height: 24,          // Lines tall
  renderer: 'auto',    // 'braille' | 'block' | 'sixel' | 'auto'
  colorMode: 'auto'    // 'none' | '16' | '256' | 'truecolor' | 'auto'
})
```

## Quick Reference

For detailed examples, see [examples/basic-plots.md](examples/basic-plots.md).

### All Available Geoms

Point/line: `geom_point`, `geom_line`, `geom_path`, `geom_step`
Bar: `geom_bar`, `geom_col`, `geom_histogram`
Distribution: `geom_boxplot`, `geom_violin`, `geom_density_2d`
Area: `geom_area`, `geom_ribbon`
Reference: `geom_hline`, `geom_vline`, `geom_abline`, `geom_segment`
Text: `geom_text`, `geom_label`
Other: `geom_tile`, `geom_contour`, `geom_errorbar`, `geom_rug`, `geom_smooth`

### All Available Scales

Position: `scale_x_continuous`, `scale_y_continuous`, `scale_x_log10`, `scale_y_log10`, `scale_x_sqrt`, `scale_y_sqrt`, `scale_x_reverse`, `scale_y_reverse`, `scale_x_discrete`, `scale_y_discrete`

Color: `scale_color_continuous`, `scale_color_discrete`, `scale_color_viridis`, `scale_color_brewer`, `scale_color_gradient`, `scale_color_gradient2`, `scale_fill_*` (same variants)

Size: `scale_size_continuous`, `scale_size_area`, `scale_size_radius`

DateTime: `scale_x_datetime`, `scale_y_datetime`, `scale_x_date`, `scale_y_date`

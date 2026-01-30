# ggterm Quick Reference

## CLI Usage

```bash
# Basic syntax
bun packages/core/src/cli-plot.ts <data> <x> <y> [color] [title] [geom]

# Arguments:
#   data  - File path (csv/json/jsonl) or "iris"/"mtcars"
#   x     - X-axis column name
#   y     - Y-axis column name (use "-" for single-variable plots)
#   color - Color grouping column (use "-" for none)
#   title - Plot title (use "-" for none)
#   geom  - Geometry type (default: point)
```

## Built-in Datasets

```bash
# iris (150 rows)
bun packages/core/src/cli-plot.ts iris sepal_length sepal_width species "Iris Scatter" point

# mtcars (16 rows)
bun packages/core/src/cli-plot.ts mtcars wt mpg cyl "Weight vs MPG" point
```

## Example Commands by Geom Type

### Scatter Plots
```bash
# Basic scatter
bun packages/core/src/cli-plot.ts iris sepal_length sepal_width - - point

# With color grouping
bun packages/core/src/cli-plot.ts iris sepal_length sepal_width species - point

# With title
bun packages/core/src/cli-plot.ts iris sepal_length sepal_width species "Iris by Species" point
```

### Histograms
```bash
# Single variable histogram
bun packages/core/src/cli-plot.ts iris sepal_length - - - histogram

# Frequency polygon
bun packages/core/src/cli-plot.ts iris sepal_length - species - freqpoly
```

### Box Plots
```bash
# Boxplot by group
bun packages/core/src/cli-plot.ts iris species sepal_length - - boxplot
```

### Violin Plots
```bash
bun packages/core/src/cli-plot.ts iris species sepal_length - - violin
```

### Line Plots
```bash
bun packages/core/src/cli-plot.ts mtcars wt mpg - - line
```

### Bar Charts
```bash
# Count bars
bun packages/core/src/cli-plot.ts iris species - - - bar
```

### Smooth/Regression
```bash
bun packages/core/src/cli-plot.ts iris sepal_length sepal_width - - smooth
```

### Reference Lines
```bash
# Add horizontal line at y=50
bun packages/core/src/cli-plot.ts mtcars wt mpg - - point+hline@25

# Add vertical line at x=3
bun packages/core/src/cli-plot.ts mtcars wt mpg - - point+vline@3

# Combined
bun packages/core/src/cli-plot.ts mtcars wt mpg - - point+hline@25+vline@3
```

## History & Export

```bash
# View plot history
bun packages/core/src/cli-plot.ts history

# Show specific plot
bun packages/core/src/cli-plot.ts show 2026-01-30-001

# Export to different formats
bun packages/core/src/cli-plot.ts export 2026-01-30-001 output.html
bun packages/core/src/cli-plot.ts export 2026-01-30-001 output.png
bun packages/core/src/cli-plot.ts export 2026-01-30-001 output.svg
bun packages/core/src/cli-plot.ts export 2026-01-30-001 output.pdf
```

## Programmatic API

```typescript
import { ggplot, aes, geom_point, geom_smooth } from '@ggterm/core'

const data = [
  { x: 1, y: 2, group: 'A' },
  { x: 2, y: 4, group: 'A' },
  { x: 3, y: 3, group: 'B' },
]

const plot = ggplot(data, aes({ x: 'x', y: 'y', color: 'group' }))
  .add(geom_point())
  .add(geom_smooth())
  .labs({ title: 'My Plot', x: 'X Axis', y: 'Y Axis' })

plot.show() // Terminal output
plot.toVegaLite() // Export to Vega-Lite spec
```

## Style Presets

Available via `ggterm-style` skill:
- `wilke` - Clean academic style (Claus Wilke)
- `tufte` - Minimalist (Edward Tufte)
- `nature` - Nature journal style
- `economist` - The Economist style
- `minimal` - Ultra-minimal
- `publication` - Generic publication-ready

## Tips

1. Use `-` as placeholder for optional arguments you want to skip
2. Combine geoms with `+`: `point+smooth`, `histogram+rug`
3. Reference lines use `@` for value: `hline@50`, `vline@3`
4. Check `history` to find plot IDs for export
5. Export to HTML for interactive Vega-Lite version

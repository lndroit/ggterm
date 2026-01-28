# ggterm

TypeScript implementation of the Grammar of Graphics for terminal interfaces.

## Quick Start

```bash
bun install          # Install dependencies
bun run build        # Build
bun test             # Run all tests
bun run packages/core/src/demo.ts  # Run demo
```

## Architecture

Single package: `@ggterm/core` in `packages/core/`

Contains:
- Grammar engine with fluent API
- 30+ geometry types
- 50+ scales (continuous, discrete, color)
- CLI for plotting CSV/JSON/JSONL files
- Vega-Lite export for publication-quality output
- Plot history with provenance tracking

## Core Concepts

```typescript
import { gg, geom_point, geom_line } from '@ggterm/core'

const plot = gg(data)
  .aes({ x: 'time', y: 'value', color: 'category' })
  .geom(geom_point())
  .geom(geom_line())
  .labs({ title: 'My Plot' })

console.log(plot.render({ width: 80, height: 24 }))
```

## Key Files

- `packages/core/src/grammar.ts` - GGPlot fluent API
- `packages/core/src/pipeline/pipeline.ts` - Rendering pipeline
- `packages/core/src/geoms/` - All geometry implementations
- `packages/core/src/scales/` - Scale system
- `packages/core/src/cli-plot.ts` - CLI tool

## CLI Usage

```bash
# Supports CSV, JSON, JSONL (auto-detected by extension)
bun packages/core/src/cli-plot.ts data.csv x y
bun packages/core/src/cli-plot.ts data.json x y color "Title" point
bun packages/core/src/cli-plot.ts data.jsonl x y - - histogram

# Reference lines
bun packages/core/src/cli-plot.ts data.csv x y - - point+hline@50+vline@2

# History and export
bun packages/core/src/cli-plot.ts history
bun packages/core/src/cli-plot.ts show 2024-01-26-001
bun packages/core/src/cli-plot.ts export 2024-01-26-001 output.html
```

**CLI geoms**: point, line, path, step, bar, col, histogram, freqpoly, boxplot, violin, area, ribbon, rug, errorbar, errorbarh, crossbar, linerange, pointrange, smooth, segment, rect, raster, tile, text, label, contour, contour_filled, density_2d, qq

**Reference lines**: `+hline@<y>`, `+vline@<x>`, `+abline@<slope>,<intercept>`

## Testing

```bash
bun test             # Run all tests (~1220 tests)
```

## Current Status

Version: 0.2.x (beta)
Published: https://www.npmjs.com/package/@ggterm/core

## Claude Code Skills

Six skills in `.claude/skills/` for AI-assisted data analysis:

| Skill | Purpose | Invoke |
|-------|---------|--------|
| `data-load` | Load CSV, JSON, JSONL data | Auto or `/data-load` |
| `ggterm-plot` | Create terminal visualizations | Auto or `/ggterm-plot` |
| `ggterm-history` | Search and retrieve historical plots | Auto or `/ggterm-history` |
| `ggterm-markdown` | Generate reports with plots | Auto or `/ggterm-markdown` |
| `ggterm-publish` | Export plots to PNG/SVG/PDF/HTML | Auto or `/ggterm-publish` |
| `ggterm-customize` | Natural language plot customization | Auto or `/ggterm-customize` |

**History**: All plots are saved to `.ggterm/plots/` with provenance metadata.

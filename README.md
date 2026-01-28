# ggterm

[![npm version](https://img.shields.io/npm/v/@ggterm/core.svg)](https://www.npmjs.com/package/@ggterm/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Data visualization through conversation.**

ggterm lets you create terminal visualizations by describing what you want in natural language. No commands to memorize, no syntax to learn.

```
You: Show me the relationship between price and square footage, colored by neighborhood.

AI: [Creates scatter plot with automatic scales, legends, and color mapping]
```

## How It Works

ggterm is designed for AI assistants. You describe what you want to see, and your AI creates the visualization:

| You say... | AI does... |
|------------|-----------|
| "What's in this CSV file?" | Inspects columns, types, and distributions |
| "Show me a histogram of income" | Creates histogram with automatic binning |
| "Add a reference line at the median" | Overlays horizontal line annotation |
| "Color by region and add a title" | Updates aesthetics and labels |
| "Export for my presentation" | Generates HTML with PNG/SVG download |

## Examples

See our [example vignettes](./examples/) for complete workflows:

| Example | What you'll learn |
|---------|-------------------|
| [Exploratory Analysis](./examples/01-exploratory-analysis.md) | Explore unfamiliar datasets through conversation |
| [Publication Figures](./examples/02-publication-figures.md) | Iteratively refine figures for papers |
| [Streaming Dashboard](./examples/03-streaming-dashboard.md) | Build real-time monitoring displays |
| [Comparative Analysis](./examples/04-comparative-analysis.md) | Compare A/B tests and distributions |

## Getting Started

### With an AI Assistant (Recommended)

If you're using Claude Code, Cursor, or another AI coding assistant:

1. Make sure ggterm is available in your project:
   ```bash
   npm install @ggterm/core
   ```

2. Ask your AI to visualize your data:
   ```
   "I have sales_data.csv - show me revenue over time"
   ```

That's it. The AI handles the rest.

### Interactive REPL

For hands-on exploration:

```bash
npx @ggterm/core
```

```
ggterm> .data iris
Loaded Iris dataset (150 rows)

ggterm> gg(data).aes({x: "sepal_length", y: "sepal_width", color: "species"}).geom(geom_point())

                    Iris Dataset
  4.5 ┤                    ●
      │                ●  ●●●
  4.0 ┤    ▲▲▲      ●●●●●●●●
      │  ▲▲▲▲▲▲▲   ●●●●●●●    ■■
  3.5 ┤▲▲▲▲▲▲▲▲▲▲  ●●●●●    ■■■■■
      │  ▲▲▲▲▲▲▲    ●●●   ■■■■■■■■
  3.0 ┤    ▲▲▲▲      ●●  ■■■■■■■■■■
      │      ▲           ■■■■■■■
  2.5 ┤                   ■■■■
      │                    ■■
  2.0 ┤
      └──────────────────────────────────
       4.5   5.0   5.5   6.0   6.5   7.0

      ▲ setosa  ● versicolor  ■ virginica
```

## What You Can Create

- **Scatter plots** - Relationships between variables
- **Line charts** - Trends over time
- **Histograms** - Distributions of single variables
- **Box plots** - Compare distributions across groups
- **Bar charts** - Categorical comparisons
- **Faceted plots** - Small multiples for comparison
- **And more** - 30+ geometry types available

## Export Options

Export any plot to HTML for sharing or publication:

- Interactive pan/zoom in browser
- Download as PNG or SVG
- Full Vega-Lite spec for further editing

## For Developers

If you want to use ggterm programmatically:

```typescript
import { gg, geom_point, scale_color_viridis } from '@ggterm/core'

const plot = gg(data)
  .aes({ x: 'pc1', y: 'pc2', color: 'cluster' })
  .geom(geom_point())
  .scale(scale_color_viridis())
  .labs({ title: 'PCA Results' })

console.log(plot.render({ width: 80, height: 24 }))
```

See the [API Reference](./docs/API.md) for full documentation.

## Why ggterm?

ggterm implements the [Grammar of Graphics](https://www.amazon.com/Grammar-Graphics-Statistics-Computing/dp/0387245448) - the same foundation as R's ggplot2 and Python's plotnine. This means:

- **Declarative** - Describe what you want, not how to draw it
- **Composable** - Build complex plots by layering simple elements
- **Consistent** - Same patterns work across all plot types

## Resources

- [Quick Start Guide](./docs/QUICKSTART.md)
- [Visual Gallery](./docs/GALLERY.md)
- [Migration from ggplot2](./docs/MIGRATION-GGPLOT2.md)

## License

MIT

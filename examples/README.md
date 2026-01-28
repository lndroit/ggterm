# ggterm Examples

AI-forward examples demonstrating prompt-driven data visualization.

These examples show how to use natural language prompts with AI assistants (Claude, GPT, etc.) to create terminal visualizations using ggterm.

## Vignettes

| Example | Description |
|---------|-------------|
| [01-exploratory-analysis](./01-exploratory-analysis.md) | Explore an unfamiliar dataset through conversation |
| [02-publication-figures](./02-publication-figures.md) | Create publication-ready figures iteratively |
| [03-streaming-dashboard](./03-streaming-dashboard.md) | Build a real-time monitoring dashboard |
| [04-comparative-analysis](./04-comparative-analysis.md) | Compare distributions across groups |

## Quick Start

Give your AI assistant access to ggterm, then use natural language:

```
"Load the sales data and show me the trend over time"

"What's the distribution of customer ages? Are there any outliers?"

"Create a scatter plot of price vs quality, colored by category"

"Add a reference line at the mean value"
```

## Requirements

- Node.js 18+
- An AI assistant with code execution (Claude Code, Cursor, etc.)
- Data files (CSV, JSON, or JSONL)

# ggterm Examples

AI-forward examples demonstrating prompt-driven data visualization with real datasets.

## Bundled Datasets

These examples use datasets built into ggterm:

| Dataset | Rows | Columns | Load Command |
|---------|------|---------|--------------|
| **iris** | 150 | sepal_length, sepal_width, petal_length, petal_width, species | `.data iris` |
| **mtcars** | 16 | mpg, cyl, hp, wt, name | `.data mtcars` |
| **sample** | n | x, y, group, size | `.data sample <n>` |

## Vignettes

| Example | Dataset | Description |
|---------|---------|-------------|
| [01-exploratory-analysis](./01-exploratory-analysis.md) | mtcars | Explore car performance through conversation |
| [02-publication-figures](./02-publication-figures.md) | iris | Create publication-ready species comparison |
| [03-streaming-dashboard](./03-streaming-dashboard.md) | sample | Build real-time monitoring dashboard |
| [04-comparative-analysis](./04-comparative-analysis.md) | iris | Compare distributions across species |

## Quick Start

Give your AI assistant access to ggterm, then use natural language:

```
"Load the iris dataset and show me sepal length vs petal length"

"Color by species"

"Add reference lines at the classification boundaries"

"Export for my paper"
```

Or try with mtcars:

```
"Load mtcars and show me the relationship between weight and fuel efficiency"

"Color by number of cylinders"

"Which cars have the best efficiency for their weight?"
```

## Requirements

- Node.js 18+
- An AI assistant with code execution (Claude Code, Cursor, etc.)

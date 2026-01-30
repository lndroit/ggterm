# ggterm Validation Suite

This folder contains validation tests and documentation for verifying ggterm functionality.

## Folder Structure

```
validation/
├── README.md           # This file
├── SESSION_LOG.md      # Work log and session tracking
├── QUICK_REFERENCE.md  # Command reference for testing
├── mtcars/
│   ├── CHECKLIST.md    # mtcars test cases
│   └── *.png/html      # Exported test outputs
├── iris/
│   ├── CHECKLIST.md    # iris test cases
│   └── *.png/html      # Exported test outputs
├── output/             # General test outputs
└── logs/               # Error logs and debug info
```

## Quick Start

### 1. Load a built-in dataset
```bash
# In ggterm CLI or via skill
.data iris     # 150 rows: sepal_length, sepal_width, petal_length, petal_width, species
.data mtcars   # 16 rows: mpg, cyl, hp, wt, name
.data sample 100  # 100 random rows: x, y, group, size
```

### 2. Create a plot
Use the `ggterm-plot` skill or CLI:
```bash
bun packages/core/src/cli-plot.ts <data-file> <x> <y> [color] [title] [geom]
```

### 3. Export for validation
```bash
bun packages/core/src/cli-plot.ts export <plot-id> output.html
bun packages/core/src/cli-plot.ts export <plot-id> output.png
```

## Available Geoms (30 types)

### Basic
- `point` - Scatter plots
- `line` - Line plots
- `bar` / `col` - Bar charts
- `area` - Area plots
- `histogram` - Histograms
- `boxplot` - Box plots

### Extended
- `violin` - Violin plots
- `smooth` - Regression/smoothing
- `text` / `label` - Text annotations
- `rug` - Rug plots
- `step` - Step functions

### Reference Lines
- `hline` - Horizontal line
- `vline` - Vertical line
- `abline` - Diagonal line

### 2D Distributions
- `bin2d` - 2D histogram
- `contour` / `contour_filled` - Contour plots
- `density_2d` - 2D density
- `tile` / `raster` - Heatmaps

### Error Bars
- `errorbar` / `errorbarh` - Error bars
- `crossbar` - Crossbars
- `linerange` / `pointrange` - Range indicators

### Other
- `segment` / `curve` - Line segments
- `path` - Connected paths
- `rect` - Rectangles
- `ribbon` - Ribbon/band plots
- `freqpoly` - Frequency polygon
- `qq` / `qq_line` - Q-Q plots

## Test Workflow

1. Open `SESSION_LOG.md` and note the date/time
2. Work through checklists in `mtcars/CHECKLIST.md` and `iris/CHECKLIST.md`
3. Mark each test as passing [x] or note issues
4. Export problem cases to the respective folders
5. Log any issues in `SESSION_LOG.md`

## Validation Criteria

A test **passes** if:
- Plot renders without errors
- Axes are correctly labeled
- Data points appear in expected positions
- Colors/groupings display correctly
- Export produces valid output file

A test **fails** if:
- Error is thrown
- Plot is blank or garbled
- Data is misrepresented
- Export is corrupted or empty

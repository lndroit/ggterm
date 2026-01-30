# mtcars Dataset Validation Checklist

## Dataset Info
- **Rows**: 16
- **Columns**: mpg, cyl, hp, wt, name
- **Good for**: Continuous data, correlations, grouping by cyl

## Test Cases

### Basic Geoms

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| Scatter plot | `.data mtcars` then plot wt vs mpg | [ ] | |
| Scatter + color | wt vs mpg, color by cyl | [ ] | |
| Line plot | wt vs mpg as line | [ ] | |
| Bar chart | cyl counts | [ ] | |
| Histogram | mpg distribution | [ ] | |
| Boxplot | mpg by cyl | [ ] | |

### Extended Geoms

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| Smooth/regression | wt vs mpg with smooth | [ ] | |
| Text labels | scatter with name labels | [ ] | |
| Point + smooth | combined layers | [ ] | |
| Violin plot | mpg by cyl | [ ] | |
| Rug plot | mpg with rug marks | [ ] | |

### Reference Lines

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| hline | Add horizontal reference | [ ] | |
| vline | Add vertical reference | [ ] | |
| abline | Add diagonal reference | [ ] | |

### Faceting

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| facet_wrap by cyl | scatter faceted | [ ] | |

### Export Tests

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| Terminal render | Basic display | [ ] | |
| Vega-Lite HTML | Export to HTML | [ ] | |
| PNG export | Export to PNG | [ ] | |
| SVG export | Export to SVG | [ ] | |

---

## Test Results

### Session: 2026-01-30

*Results to be recorded during testing*

---

## Sample Commands

```bash
# Load mtcars
.data mtcars

# Basic scatter
# Use ggterm-plot skill with x=wt, y=mpg

# Scatter with color grouping
# x=wt, y=mpg, color=cyl

# Histogram
# x=mpg, geom=histogram

# Boxplot
# x=cyl, y=mpg, geom=boxplot
```

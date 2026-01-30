# iris Dataset Validation Checklist

## Dataset Info
- **Rows**: 150
- **Columns**: sepal_length, sepal_width, petal_length, petal_width, species
- **Good for**: Classification visualization, species comparison, multivariate analysis

## Test Cases

### Basic Geoms

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| Scatter plot | sepal_length vs sepal_width | [ ] | |
| Scatter + color | sepal dims, color by species | [ ] | |
| Scatter + size | petal dims, size by sepal_length | [ ] | |
| Line plot | sepal_length vs petal_length | [ ] | |
| Bar chart | species counts | [ ] | |
| Histogram | sepal_length distribution | [ ] | |
| Boxplot | sepal_length by species | [ ] | |

### Extended Geoms

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| Smooth/regression | sepal dims with smooth | [ ] | |
| Violin plot | sepal_length by species | [ ] | |
| Rug plot | sepal_length with rug marks | [ ] | |
| Density | sepal_length density | [ ] | |
| Point + smooth | combined layers | [ ] | |

### 2D Visualizations

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| bin2d | sepal vs petal 2D histogram | [ ] | |
| contour | density contours | [ ] | |
| heatmap/tile | correlation matrix style | [ ] | |

### Reference Lines

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| hline | Add horizontal reference | [ ] | |
| vline | Add vertical reference | [ ] | |
| abline | Add diagonal reference | [ ] | |

### Faceting

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| facet_wrap by species | scatter faceted | [ ] | |

### Multi-variable Exploration

| Test | Command | Status | Notes |
|------|---------|--------|-------|
| sepal_length vs sepal_width | Classic iris plot | [ ] | |
| petal_length vs petal_width | Petal comparison | [ ] | |
| sepal_length vs petal_length | Cross-organ | [ ] | |

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
# Load iris
.data iris

# Classic iris scatter (sepal dimensions by species)
# x=sepal_length, y=sepal_width, color=species

# Petal dimensions
# x=petal_length, y=petal_width, color=species

# Histogram of sepal length
# x=sepal_length, geom=histogram

# Boxplot comparison
# x=species, y=sepal_length, geom=boxplot

# Violin plot
# x=species, y=sepal_length, geom=violin
```

---

## Expected Patterns

The iris dataset should show:
1. **Clear species separation** in petal dimensions
2. **Some overlap** in sepal dimensions (especially setosa vs versicolor)
3. **Setosa** typically most distinct (smaller petals)
4. **Virginica** typically largest overall measurements

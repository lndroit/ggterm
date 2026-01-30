# ggterm Validation Testing Report

**Date:** January 30, 2026
**Tester:** Lindsay Droit
**Tool Version:** 0.2.5
**Repository:** https://github.com/shandley/ggterm

---

## 1. Environment Setup

### 1.1 Initial State
- Previous session ended unexpectedly
- Found uncommitted changes in git:
  - `bun.lock` (staged)
  - `packages/core/src/export/vega-lite.ts` (unstaged)

### 1.2 Dependency Installation
- **Bun** was installed but not in PATH
- Located at: `~/.bun/bin/bun`
- Ran `bun install` - completed successfully (135 packages, no changes needed)

### 1.3 Build Verification
- Ran `bun run build` - **SUCCESS**
- Bundled 70 modules in 38ms
- Output: index.js (0.29 MB), cli.js (213.85 KB)

### 1.4 TypeScript Check
- Ran `npx tsc --noEmit` - **SUCCESS** (no type errors)

### 1.5 Test Suite
- Ran `bun test` - **SUCCESS**
- **1843 tests passing** across 41 files
- 4345 expect() calls
- Runtime: 512ms

### 1.6 Pre-existing Code Changes
The uncommitted changes in `vega-lite.ts` were TypeScript cleanup:
- Commented out unused `SPECIAL_GEOMS` constant
- Fixed unused parameter warnings (`data` → `_data` prefix)

---

## 2. Datasets Tested

### 2.1 mtcars Dataset
- **Rows:** 16
- **Columns:** name, mpg, cyl, hp, wt
- **Source:** Created CSV file for CLI testing at `validation/mtcars/mtcars.csv`

### 2.2 iris Dataset
- **Rows:** 150
- **Columns:** sepal_length, sepal_width, petal_length, petal_width, species
- **Source:** `examples/data/iris.csv` (pre-existing)

---

## 3. Plots Tested

### 3.1 mtcars Plots (11 total + 1 failed)

| Plot # | ID | Type | Description | Status |
|--------|-----|------|-------------|--------|
| 1 | 2026-01-30-001 | Scatter | Weight vs MPG | PASS |
| 2 | 2026-01-30-002 | Scatter + Color | Weight vs MPG by Cylinders | PASS |
| 3 | 2026-01-30-003 | Histogram | MPG Distribution | PASS |
| 4 | 2026-01-30-004 | Boxplot | MPG by Cylinder Count | **FAIL** |
| 5 | 2026-01-30-005 | Line | Weight vs MPG | PASS |
| 6 | 2026-01-30-006 | Bar | Cars by Cylinder Count | PASS |
| 7 | 2026-01-30-007 | Smooth | Weight vs MPG with Regression | PASS |
| 8 | 2026-01-30-008 | Scatter + Reference Lines | With hline and vline | PASS (minor bug) |
| 9 | 2026-01-30-009 | Violin | MPG by Cylinders | PASS |
| 17 | 2026-01-30-017 | Step | Weight vs MPG step plot | PASS |
| 18 | 2026-01-30-018 | Area | Weight vs MPG filled area | PASS |
| - | (not saved) | Rug | Marginal tick marks | **BUG** (hung) |

### 3.2 iris Plots (8 total)

| Plot # | ID | Type | Description | Status |
|--------|-----|------|-------------|--------|
| 10 | 2026-01-30-010 | Scatter + Color | Sepal Dimensions by Species | PASS |
| 11 | 2026-01-30-011 | Scatter + Color | Petal Dimensions by Species | PASS |
| 12 | 2026-01-30-012 | Histogram | Sepal Length Distribution | PASS |
| 13 | 2026-01-30-013 | Violin | Sepal Length by Species | PASS |
| 14 | 2026-01-30-014 | Smooth | Sepal vs Petal Length | PASS |
| 15 | 2026-01-30-015 | Bar | Species Count | PASS |
| 16 | 2026-01-30-016 | Freqpoly | Sepal Length by Species | PASS |
| 19 | 2026-01-30-019 | Density_2d | 2D Density Contours | **BUG** (empty)

---

## 4. Bugs Found

### Bug #1: Boxplot X-Axis Handling (CRITICAL)
- **Plot:** #4 (2026-01-30-004)
- **Description:** Boxplot treats discrete x-axis values as continuous
- **Expected:** X-axis should show category labels (4, 6, 8 cylinders)
- **Actual:** X-axis shows continuous scale from 0 to 1
- **Impact:** Boxplot is unusable for categorical comparisons
- **Severity:** HIGH

### Bug #2: Reference Line Color Undefined (MINOR)
- **Plot:** #8 (2026-01-30-008)
- **Description:** Reference lines (hline, vline) have undefined color in ANSI escape codes
- **Expected:** Color should be defined (e.g., `[38;2;255;0;0m`)
- **Actual:** Shows `[38;2;undefined;undefined;undefinedm`
- **Impact:** Lines still render but with potential display issues
- **Severity:** LOW

### Bug #3: Rug Geom Hangs Indefinitely (MEDIUM)
- **Plot:** (not saved - command killed)
- **Description:** The `rug` geom causes the CLI to hang indefinitely
- **Expected:** Should render marginal tick marks along axes
- **Actual:** Command never completes, requires force kill (exit code 137)
- **Impact:** Rug geom is completely unusable in CLI
- **Severity:** MEDIUM
- **Note:** `geom_rug` is designed to pair with `geom_point()` in programmatic API, but CLI only supports single geoms

### Bug #4: Density_2d Renders Empty Plot (HIGH)
- **Plot:** #19 (2026-01-30-019)
- **Description:** The `density_2d` geom renders an empty plot with no contours
- **Expected:** Should show 2D density contour lines indicating data concentration
- **Actual:** Empty plot area with only grid lines, axes, and legend
- **Impact:** Density_2d geom produces no useful visualization
- **Severity:** HIGH

---

## 5. Features Verified Working

| Feature | Status | Notes |
|---------|--------|-------|
| Scatter plots (geom_point) | PASS | Basic and with color grouping |
| Histograms (geom_histogram) | PASS | Correct binning and counts |
| Bar charts (geom_bar) | PASS | Handles discrete x-axis correctly |
| Line plots (geom_line) | PASS | Connects in data order |
| Smooth/Regression (geom_smooth) | PASS | Includes confidence bands |
| Violin plots (geom_violin) | PASS | Shows distribution shape |
| Freqpoly (geom_freqpoly) | PASS | Frequency polygon alternative to histogram |
| Step plots (geom_step) | PASS | Stair-step line connections |
| Area plots (geom_area) | PASS | Filled area under curve |
| Reference lines (hline, vline) | PASS | Minor color bug but renders |
| Boxplots (geom_boxplot) | **FAIL** | X-axis categorical handling broken |
| Rug plots (geom_rug) | **FAIL** | Causes CLI to hang |
| Density 2D (geom_density_2d) | **FAIL** | Renders empty plot |
| Color grouping by variable | PASS | Legend displays correctly |
| Axis labels | PASS | Correct variable names |
| Plot titles | PASS | Displays centered |
| Plot history | PASS | Lists all saved plots |
| Export to HTML | PASS | Creates Vega-Lite file |
| Show command | PASS | Re-renders saved plots |

---

## 6. Files Created During Testing

```
validation/
├── README.md                    # Overview and workflow
├── SESSION_LOG.md               # Work session tracking
├── QUICK_REFERENCE.md           # CLI command reference
├── TESTING_REPORT.md            # This report
├── mtcars/
│   ├── CHECKLIST.md             # mtcars test checklist
│   ├── mtcars.csv               # Test data file
│   └── scatter_by_cyl.html      # Exported plot
├── iris/
│   └── CHECKLIST.md             # iris test checklist
├── output/                      # General test outputs
└── logs/                        # Error logs
```

---

## 7. Summary

### Overall Assessment
**ggterm is functional and produces quality terminal visualizations.** The core plotting functionality works well across the most common geom types (scatter, histogram, bar, line, smooth, violin, freqpoly, step, area). However, several geom types have significant issues that impact usability.

### Test Coverage
- **mtcars dataset:** 11 plots rendered + 1 hung (rug)
- **iris dataset:** 8 plots rendered
- **Total plots:** 19 rendered, 1 hung

### Pass Rate
- **19 plots tested**
- **16 passed, 3 failures** (boxplot, rug, density_2d)
- **1 minor bug** (reference line color undefined)
- **Final pass rate: 84%** (16/19)

### Bugs by Severity
| Severity | Count | Issues |
|----------|-------|--------|
| HIGH | 2 | Boxplot x-axis, Density_2d empty |
| MEDIUM | 1 | Rug hangs indefinitely |
| LOW | 1 | Reference line color undefined |

### Recommendations
1. **Fix boxplot categorical x-axis handling** - High priority
2. **Fix density_2d contour rendering** - High priority
3. **Fix rug geom hanging issue** - Medium priority
4. **Fix reference line color definition** - Low priority
5. **Consider adding built-in dataset support to CLI** - Enhancement (currently requires file path)

---

## 8. Test Commands Reference

```bash
# Install dependencies
~/.bun/bin/bun install

# Build
~/.bun/bin/bun run build

# Run tests
~/.bun/bin/bun test

# Create a plot
bun packages/core/src/cli-plot.ts <data.csv> <x> <y> [color] [title] [geom]

# View plot history
bun packages/core/src/cli-plot.ts history

# Show a saved plot
bun packages/core/src/cli-plot.ts show <plot-id>

# Export a plot
bun packages/core/src/cli-plot.ts export <plot-id> output.html
```

---

*Report generated during ggterm validation session*

# ggterm Development Roadmap

## Vision

ggterm brings the declarative power of the Grammar of Graphics to terminal user interfaces. It enables data scientists and developers to create rich, interactive visualizations directly in the terminal, integrated with modern TUI frameworks like OpenTUI.

## Development Phases

### Phase 1: Foundation (MVP)

**Goal**: Minimal viable grammar with scatter plot support

#### Core Grammar
- [ ] `gg()` plot builder with fluent API
- [ ] `aes()` aesthetic mapping (x, y, color, size)
- [ ] Data layer accepting record arrays
- [ ] Basic scale inference (continuous x/y)

#### Geometries
- [ ] `geom_point()` - scatter plots
- [ ] `geom_line()` - line plots
- [ ] `geom_hline()` / `geom_vline()` - reference lines

#### Scales
- [ ] `scale_x_continuous()` / `scale_y_continuous()`
- [ ] `scale_color_discrete()` - categorical colors
- [ ] Automatic domain calculation from data
- [ ] Basic break/tick calculation

#### Rendering
- [ ] Abstract canvas buffer
- [ ] Braille renderer (2x4 dots per cell)
- [ ] ANSI color output (16/256/truecolor detection)
- [ ] Basic axis rendering

#### Output
- [ ] `.render({ width, height })` → string
- [ ] Minimal theme (axes, title, legend)

**Deliverable**: Create a PCA scatter plot from BioStack PlotSpec data

---

### Phase 2: Statistical Layers

**Goal**: Data transformations and richer geoms

#### Statistics
- [ ] `stat_bin()` - histogram binning
- [ ] `stat_density()` - 1D kernel density
- [ ] `stat_smooth()` - loess/linear smoothing
- [ ] `stat_summary()` - group summaries

#### Geometries
- [ ] `geom_bar()` - bar charts
- [ ] `geom_area()` - filled areas
- [ ] `geom_text()` - text labels
- [ ] `geom_segment()` - line segments

#### Scales
- [ ] `scale_x_log10()` / `scale_y_log10()`
- [ ] `scale_x_discrete()` - categorical axis
- [ ] `scale_color_continuous()` - color gradients
- [ ] `scale_color_viridis()` and other palettes

**Deliverable**: Histogram, density plot, volcano plot with labels

---

### Phase 3: Coordinates & Facets

**Goal**: Flexible layouts and small multiples

#### Coordinates
- [ ] `coord_cartesian()` - with zoom/clip
- [ ] `coord_flip()` - swap x/y
- [ ] `coord_polar()` - polar coordinates (basic)

#### Facets
- [ ] `facet_wrap()` - wrap panels into rows
- [ ] `facet_grid()` - 2D grid of panels
- [ ] Shared/free scales per facet
- [ ] Panel labels

#### Layout
- [ ] Multi-panel rendering
- [ ] Automatic aspect ratio handling
- [ ] Legend positioning

**Deliverable**: Faceted scatter plot by category

---

### Phase 4: OpenTUI Integration

**Goal**: React component for TUI applications

#### Component
- [ ] `<GGTerm>` React component
- [ ] Props for data, aes, geoms, scales, theme
- [ ] Width/height (fixed and percentage)

#### Reactivity
- [ ] Efficient diff-based re-rendering
- [ ] Data binding with React state
- [ ] Animation support (transitions)

#### Interactivity
- [ ] Mouse hover events
- [ ] Click selection
- [ ] Keyboard navigation (arrow keys for pan/zoom)
- [ ] Tooltip display

#### Hooks
- [ ] `useGGTerm()` - plot instance management
- [ ] `usePlotData()` - reactive data binding

**Deliverable**: Interactive dashboard with multiple plots

---

### Phase 5: Advanced Rendering

**Goal**: High-fidelity terminal graphics

#### Block Renderer
- [ ] Unicode block characters
- [ ] Half-block subpixel rendering
- [ ] Box-drawing for frames/grids

#### Sixel/Kitty Renderer
- [ ] Terminal capability detection
- [ ] Sixel protocol support (XTerm, mlterm, foot)
- [ ] Kitty graphics protocol
- [ ] iTerm2 inline images
- [ ] Automatic fallback chain

#### Color System
- [ ] Palette optimization for 256/16 colors
- [ ] Dithering for limited palettes
- [ ] Dark/light theme adaptation

**Deliverable**: Pixel-perfect plots in supported terminals

---

### Phase 6: Streaming & Performance

**Goal**: Real-time data and large datasets

#### Streaming
- [ ] `.push()` for incremental data
- [ ] Time-windowed rendering
- [ ] Rolling aggregations

#### Performance
- [ ] Level-of-detail for large datasets
- [ ] Automatic binning (hexbin, rect)
- [ ] Systematic/random sampling
- [ ] Incremental rendering

#### Optimization
- [ ] Canvas diffing (only update changed cells)
- [ ] Lazy scale computation
- [ ] Worker thread rendering

**Deliverable**: Live-updating time series with 100k+ points

---

### Phase 7: Extended Grammar

**Goal**: Complete grammar of graphics

#### Geometries
- [ ] `geom_boxplot()` - box and whisker
- [ ] `geom_violin()` - violin plots
- [ ] `geom_tile()` - heatmaps
- [ ] `geom_contour()` - contour lines
- [ ] `geom_ribbon()` - ribbons/bands
- [ ] `geom_errorbar()` - error bars

#### Annotations
- [ ] `annotate()` - arbitrary annotations
- [ ] `geom_rect()` - rectangular regions
- [ ] `geom_abline()` - arbitrary lines

#### Advanced Scales
- [ ] `scale_size_continuous()` - point sizing
- [ ] `scale_shape_manual()` - custom shapes
- [ ] `scale_alpha_continuous()` - transparency
- [ ] Date/time scales

**Deliverable**: Full ggplot2-like capability

---

### Phase 8: Ecosystem

**Goal**: Framework integrations and tooling

#### Framework Support
- [ ] Solid.js reconciler (via OpenTUI)
- [ ] Svelte adapter
- [ ] Vue adapter

#### Developer Tools
- [ ] Plot preview in VS Code terminal
- [ ] Jupyter notebook integration
- [ ] REPL mode for iterative design

#### Documentation
- [ ] Interactive examples
- [ ] Gallery of plot types
- [ ] Migration guide from ggplot2/Vega-Lite

**Deliverable**: Production-ready ecosystem

---

## Success Metrics

| Phase | Metric |
|-------|--------|
| 1 | Can render BioStack PCA plot |
| 2 | Supports histogram, volcano plots |
| 3 | Faceted plots work correctly |
| 4 | Interactive plots in OpenTUI app |
| 5 | Sixel rendering in supported terminals |
| 6 | Handles 100k points at 30fps |
| 7 | Feature parity with ggplot2 basics |
| 8 | Used in production applications |

## Design Principles

1. **Familiar API**: ggplot2 users should feel at home
2. **Terminal-first**: Optimized for character cells, not pixels
3. **Graceful degradation**: Works everywhere, looks best on capable terminals
4. **Composable**: Small pieces that combine cleanly
5. **Type-safe**: Full TypeScript support with inference
6. **Performant**: Efficient for real-time and large data

## Non-Goals

- Full ggplot2 compatibility (terminal has limits)
- PDF/PNG export (use dedicated tools)
- 3D plots (complexity vs value tradeoff)
- Maps/geo (specialized domain)

## Dependencies

**Required**:
- TypeScript 5.x
- OpenTUI (for TUI integration)

**Optional**:
- React 18+ (for `<GGTerm>` component)
- Solid.js (for Solid reconciler)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines on contributing to ggterm development.

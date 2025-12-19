# @ggterm/svelte

Svelte integration for ggterm - Grammar of Graphics for terminals.

## Installation

```bash
npm install @ggterm/svelte @ggterm/core svelte
```

## Quick Start

### Using the GGTerm Component

```svelte
<script>
  import { GGTerm } from '@ggterm/svelte'
  import { geom_point, geom_line } from '@ggterm/core'

  let data = [
    { x: 1, y: 10 },
    { x: 2, y: 25 },
    { x: 3, y: 18 },
    { x: 4, y: 35 },
    { x: 5, y: 28 }
  ]
</script>

<GGTerm
  {data}
  aes={{ x: 'x', y: 'y' }}
  geoms={[geom_line(), geom_point()]}
  width={60}
  height={20}
/>
```

### Using Stores for More Control

```svelte
<script>
  import { onDestroy } from 'svelte'
  import { createPlotStore, createDataStore } from '@ggterm/svelte'
  import { geom_line, geom_point } from '@ggterm/core'

  // Create data store with windowing
  const dataStore = createDataStore({
    maxPoints: 100,
    timeWindowMs: 60000
  })

  // Create plot store
  const plot = createPlotStore({
    aes: { x: 'time', y: 'value' },
    geoms: [geom_line(), geom_point()],
    width: 80,
    height: 24
  })

  // Stream data
  const interval = setInterval(() => {
    dataStore.push({
      time: Date.now(),
      value: Math.random() * 100
    })
    plot.setData($dataStore.windowed)
  }, 100)

  onDestroy(() => {
    clearInterval(interval)
    plot.destroy()
  })
</script>

<pre>{$plot.rendered}</pre>
<p>Points: {$dataStore.count}</p>
```

## API Reference

### Components

#### `<GGTerm>`

The main component for rendering ggterm plots.

```svelte
<GGTerm
  data={DataSource}
  aes={AestheticMapping}
  geoms={Geom[]}
  scales={Scale[]}
  coord={Coord}
  facet={Facet}
  theme={Theme}
  labs={Labels}
  width={number}
  height={number}
  renderer={'braille' | 'block' | 'sixel' | 'auto'}
  colorMode={'none' | '16' | '256' | 'truecolor' | 'auto'}
  on:render={(e) => handleRender(e.detail)}
  on:hover={(e) => handleHover(e.detail)}
  on:click={(e) => handleClick(e.detail)}
/>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `DataSource` | `[]` | Data array |
| `aes` | `AestheticMapping` | required | Aesthetic mapping |
| `geoms` | `Geom[]` | `[]` | Geometry layers |
| `scales` | `Scale[]` | `[]` | Scale definitions |
| `coord` | `Coord` | - | Coordinate system |
| `facet` | `Facet` | - | Faceting spec |
| `theme` | `Theme` | - | Theme config |
| `labs` | `Labels` | - | Plot labels |
| `width` | `number` | `70` | Width in chars |
| `height` | `number` | `20` | Height in chars |
| `renderer` | `string` | `'auto'` | Renderer type |
| `colorMode` | `string` | `'auto'` | Color mode |

**Events:**

| Event | Detail | Description |
|-------|--------|-------------|
| `render` | `string` | Rendered output |
| `hover` | `{ index, record }` | Point hovered |
| `click` | `{ index, record }` | Point clicked |

**Methods:**

```svelte
<script>
  let ggterm

  function handleRefresh() {
    ggterm.refresh()
  }

  function handleGetOutput() {
    const output = ggterm.getRendered()
    console.log(output)
  }
</script>

<GGTerm bind:this={ggterm} ... />
```

### Stores

#### `createPlotStore(options)`

Creates a reactive plot store.

```typescript
const plot = createPlotStore({
  data: DataSource,           // Initial data
  aes: AestheticMapping,      // Required
  geoms: Geom[],
  scales: Scale[],
  coord: Coord,
  facet: Facet,
  theme: Theme,
  labs: Labels,
  width: number,              // Default: 70
  height: number,             // Default: 20
  renderer: string,           // Default: 'auto'
  colorMode: string,          // Default: 'auto'
  autoRender: boolean         // Default: true
})

// Readable stores
$plot.rendered      // Current output string
$plot.isRendering   // Boolean
$plot.renderCount   // Number
$plot.plot          // GGPlot instance

// Writable store
$plot.data          // Current data

// Methods
plot.setData(data)
plot.pushData(record)
plot.clearData()
plot.refresh()
plot.setOptions({ width: 100 })
plot.destroy()
```

#### `createDataStore(options)`

Creates a reactive data store with windowing.

```typescript
const dataStore = createDataStore({
  maxPoints: 100,           // Max points to keep
  timeWindowMs: 60000,      // Time window in ms
  timeField: 'time',        // Field for time filtering
  initialData: []           // Initial data
})

// Readable stores
$dataStore.windowed   // Filtered data
$dataStore.count      // Point count
$dataStore.isDirty    // Changed flag

// Writable store
$dataStore.data       // All data

// Methods
dataStore.set(data)
dataStore.push(record)
dataStore.updateAt(index, updates)
dataStore.removeWhere(predicate)
dataStore.clear()
dataStore.markClean()
dataStore.applyTimeWindow()
dataStore.applyMaxPoints()
```

#### `createInteractionStore(options)`

Creates a reactive interaction store.

```typescript
const interaction = createInteractionStore({
  selectionMode: 'multiple',  // 'none' | 'single' | 'multiple' | 'brush'
  enableZoom: true,
  enableKeyboard: true,
  initialViewport: { xMin, xMax, yMin, yMax },
  onSelectionChange: (indices) => {},
  onViewportChange: (viewport) => {},
  onBrushEnd: (rect, indices) => {}
})

// Writable stores
$interaction.hoveredIndex
$interaction.selectedIndices
$interaction.viewport
$interaction.brush
$interaction.isFocused
$interaction.selectionMode

// Methods
interaction.setHovered(index)
interaction.clearHover()
interaction.select(index)
interaction.toggleSelect(index)
interaction.setSelected(indices)
interaction.clearSelection()
interaction.setViewport(viewport)
interaction.resetViewport()
interaction.zoom(factor)
interaction.pan(dx, dy)
interaction.startBrush(x, y)
interaction.updateBrush(x, y)
interaction.endBrush(data, xField, yField)
interaction.cancelBrush()
interaction.handleKeyDown(event)
```

## Examples

### Colored Scatter Plot

```svelte
<script>
  import { GGTerm } from '@ggterm/svelte'
  import { geom_point, scale_color_viridis } from '@ggterm/core'

  const data = [
    { x: 1, y: 10, group: 'A' },
    { x: 2, y: 25, group: 'B' },
    { x: 3, y: 18, group: 'A' },
    { x: 4, y: 35, group: 'B' }
  ]
</script>

<GGTerm
  {data}
  aes={{ x: 'x', y: 'y', color: 'group' }}
  geoms={[geom_point()]}
  scales={[scale_color_viridis()]}
  labs={{ title: 'Scatter Plot', x: 'X Value', y: 'Y Value' }}
/>
```

### Real-Time Dashboard

```svelte
<script>
  import { onDestroy } from 'svelte'
  import { createDataStore, createPlotStore } from '@ggterm/svelte'
  import { geom_line, geom_point, themeDark } from '@ggterm/core'

  const metrics = createDataStore({ maxPoints: 50 })

  const cpuPlot = createPlotStore({
    aes: { x: 'time', y: 'cpu' },
    geoms: [geom_line(), geom_point()],
    theme: themeDark(),
    labs: { title: 'CPU Usage' },
    width: 60,
    height: 15
  })

  const interval = setInterval(() => {
    metrics.push({
      time: Date.now(),
      cpu: 30 + Math.random() * 40
    })
    cpuPlot.setData($metrics.windowed)
  }, 500)

  onDestroy(() => {
    clearInterval(interval)
    cpuPlot.destroy()
  })
</script>

<div>
  <pre>{$cpuPlot.rendered}</pre>
  <p>Points: {$metrics.count}</p>
</div>
```

### Faceted Plot

```svelte
<script>
  import { GGTerm } from '@ggterm/svelte'
  import { geom_point, facet_wrap } from '@ggterm/core'

  const data = [
    { x: 1, y: 10, category: 'A' },
    { x: 2, y: 20, category: 'A' },
    { x: 1, y: 15, category: 'B' },
    { x: 2, y: 25, category: 'B' }
  ]
</script>

<GGTerm
  {data}
  aes={{ x: 'x', y: 'y' }}
  geoms={[geom_point()]}
  facet={facet_wrap('category', { ncol: 2 })}
  width={80}
  height={20}
/>
```

### Interactive Selection

```svelte
<script>
  import { GGTerm, createInteractionStore } from '@ggterm/svelte'
  import { geom_point } from '@ggterm/core'

  const data = [/* ... */]

  const interaction = createInteractionStore({
    selectionMode: 'multiple',
    onSelectionChange: (indices) => {
      console.log('Selected:', indices)
    }
  })
</script>

<GGTerm
  {data}
  aes={{ x: 'x', y: 'y' }}
  geoms={[geom_point()]}
  on:click={(e) => interaction.toggleSelect(e.detail.index)}
/>

<p>Selected: {$interaction.selectedIndices.length} points</p>
<button on:click={() => interaction.clearSelection()}>Clear</button>
```

## TypeScript Support

Full TypeScript support:

```svelte
<script lang="ts">
  import type { DataSource, AestheticMapping } from '@ggterm/svelte'
  import { GGTerm } from '@ggterm/svelte'
  import { geom_line } from '@ggterm/core'

  const data: DataSource = [
    { time: 1, value: 10 },
    { time: 2, value: 20 }
  ]

  const aes: AestheticMapping = { x: 'time', y: 'value' }
</script>

<GGTerm {data} {aes} geoms={[geom_line()]} />
```

## SvelteKit Integration

Works with SvelteKit out of the box:

```svelte
<!-- +page.svelte -->
<script>
  import { GGTerm } from '@ggterm/svelte'
  import { geom_point } from '@ggterm/core'

  export let data
</script>

<GGTerm
  data={data.chartData}
  aes={{ x: 'x', y: 'y' }}
  geoms={[geom_point()]}
/>
```

## See Also

- [@ggterm/core](../core/README.md) - Core grammar engine
- [API Reference](../../docs/API.md) - Full API documentation
- [Gallery](../../docs/GALLERY.md) - Visual examples

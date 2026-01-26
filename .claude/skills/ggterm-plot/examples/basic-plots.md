# ggterm Basic Plot Examples

## Scatter Plot with Color

```typescript
import { gg, geom_point, scale_color_viridis } from '@ggterm/core'

const data = [
  { x: 1, y: 2, category: 'A' },
  { x: 2, y: 4, category: 'B' },
  { x: 3, y: 3, category: 'A' },
  // ... more data
]

const plot = gg(data)
  .aes({ x: 'x', y: 'y', color: 'category' })
  .geom(geom_point({ size: 2 }))
  .scale(scale_color_viridis())
  .labs({
    title: 'Scatter Plot by Category',
    x: 'X Axis',
    y: 'Y Axis'
  })

console.log(plot.render({ width: 80, height: 24 }))
```

## Time Series

```typescript
import { gg, geom_line, geom_point, scale_x_datetime } from '@ggterm/core'

const data = [
  { date: new Date('2024-01-01').getTime(), value: 100 },
  { date: new Date('2024-01-02').getTime(), value: 120 },
  { date: new Date('2024-01-03').getTime(), value: 115 },
  // ... more data
]

const plot = gg(data)
  .aes({ x: 'date', y: 'value' })
  .geom(geom_line())
  .geom(geom_point({ size: 1 }))
  .scale(scale_x_datetime())
  .labs({ title: 'Daily Values', x: 'Date', y: 'Value' })

console.log(plot.render({ width: 80, height: 20 }))
```

## Histogram

```typescript
import { gg, geom_histogram, scale_fill_brewer } from '@ggterm/core'

const data = Array.from({ length: 1000 }, () => ({
  value: Math.random() * 100
}))

const plot = gg(data)
  .aes({ x: 'value' })
  .geom(geom_histogram({ bins: 30 }))
  .labs({ title: 'Distribution', x: 'Value', y: 'Count' })

console.log(plot.render({ width: 80, height: 20 }))
```

## Box Plot Comparison

```typescript
import { gg, geom_boxplot, scale_fill_brewer } from '@ggterm/core'

const data = [
  { group: 'Control', value: 23 },
  { group: 'Control', value: 25 },
  { group: 'Treatment', value: 31 },
  { group: 'Treatment', value: 29 },
  // ... more data per group
]

const plot = gg(data)
  .aes({ x: 'group', y: 'value', fill: 'group' })
  .geom(geom_boxplot())
  .scale(scale_fill_brewer({ palette: 'Set2' }))
  .labs({ title: 'Treatment Effect', y: 'Response' })

console.log(plot.render({ width: 60, height: 20 }))
```

## Faceted Plot

```typescript
import { gg, geom_point, geom_smooth, facet_wrap } from '@ggterm/core'

const data = [
  { x: 1, y: 2, species: 'setosa' },
  { x: 2, y: 3, species: 'versicolor' },
  { x: 3, y: 5, species: 'virginica' },
  // ... iris-like data
]

const plot = gg(data)
  .aes({ x: 'x', y: 'y' })
  .geom(geom_point())
  .geom(geom_smooth({ method: 'linear' }))
  .facet(facet_wrap({ vars: 'species', ncol: 3 }))
  .labs({ title: 'By Species' })

console.log(plot.render({ width: 90, height: 30 }))
```

## Layered Plot with Trend

```typescript
import { gg, geom_point, geom_smooth, themeDark } from '@ggterm/core'

const plot = gg(data)
  .aes({ x: 'x', y: 'y', color: 'group' })
  .geom(geom_point({ alpha: 0.6, size: 1 }))
  .geom(geom_smooth({ method: 'loess', se: true }))
  .theme(themeDark())
  .labs({
    title: 'Trend Analysis',
    subtitle: 'With LOESS smoothing',
    x: 'Predictor',
    y: 'Response'
  })

console.log(plot.render({ width: 80, height: 24 }))
```

## Bar Chart with Counts

```typescript
import { gg, geom_bar, scale_fill_viridis, coordFlip } from '@ggterm/core'

const data = [
  { category: 'Electronics' },
  { category: 'Clothing' },
  { category: 'Electronics' },
  { category: 'Food' },
  // ... more records
]

const plot = gg(data)
  .aes({ x: 'category', fill: 'category' })
  .geom(geom_bar())
  .coord(coordFlip())  // Horizontal bars
  .scale(scale_fill_viridis())
  .labs({ title: 'Sales by Category', x: '', y: 'Count' })

console.log(plot.render({ width: 60, height: 15 }))
```

## Heatmap with geom_tile

```typescript
import { gg, geom_tile, scale_fill_viridis } from '@ggterm/core'

const data = []
for (let x = 0; x < 10; x++) {
  for (let y = 0; y < 10; y++) {
    data.push({ x, y, value: Math.sin(x) * Math.cos(y) })
  }
}

const plot = gg(data)
  .aes({ x: 'x', y: 'y', fill: 'value' })
  .geom(geom_tile())
  .scale(scale_fill_viridis())
  .labs({ title: 'Heatmap' })

console.log(plot.render({ width: 50, height: 25 }))
```

## Error Bars

```typescript
import { gg, geom_point, geom_errorbar } from '@ggterm/core'

const data = [
  { x: 'A', y: 10, ymin: 8, ymax: 12 },
  { x: 'B', y: 15, ymin: 12, ymax: 18 },
  { x: 'C', y: 8, ymin: 6, ymax: 10 },
]

const plot = gg(data)
  .aes({ x: 'x', y: 'y', ymin: 'ymin', ymax: 'ymax' })
  .geom(geom_errorbar({ width: 0.2 }))
  .geom(geom_point({ size: 3 }))
  .labs({ title: 'Means with 95% CI' })

console.log(plot.render({ width: 60, height: 20 }))
```

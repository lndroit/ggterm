<!--
  GGTerm - Svelte component for ggterm plots

  A declarative component for rendering grammar of graphics plots.

  @example
  ```svelte
  <script>
    import { GGTerm } from '@ggterm/svelte'
    import { geom_point, geom_line } from '@ggterm/core'

    let data = [
      { x: 1, y: 10 },
      { x: 2, y: 25 },
      { x: 3, y: 18 }
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
-->
<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import {
    gg,
    type DataSource,
    type AestheticMapping,
    type Geom,
    type Scale,
    type Coord,
    type Facet,
    type Theme,
    type Labels,
    type RenderOptions,
  } from '@ggterm/core'

  // Props
  export let data: DataSource = []
  export let aes: AestheticMapping
  export let geoms: Geom[] = []
  export let scales: Scale[] = []
  export let coord: Coord | undefined = undefined
  export let facet: Facet | undefined = undefined
  export let theme: Theme | Partial<Theme> | undefined = undefined
  export let labs: Labels | undefined = undefined

  // Render options
  export let width: number = 70
  export let height: number = 20
  export let renderer: 'braille' | 'block' | 'sixel' | 'auto' = 'auto'
  export let colorMode: 'none' | '16' | '256' | 'truecolor' | 'auto' = 'auto'

  // Event dispatcher
  const dispatch = createEventDispatcher<{
    render: string
    hover: { index: number; record: DataSource[number] | null }
    click: { index: number; record: DataSource[number] }
  }>()

  // Rendered output
  let rendered = ''

  // Build and render plot
  $: {
    if (data.length > 0) {
      let plot = gg(data).aes(aes)

      for (const g of geoms) {
        plot = plot.geom(g)
      }

      for (const s of scales) {
        plot = plot.scale(s)
      }

      if (coord) {
        plot = plot.coord(coord)
      }

      if (facet) {
        plot = plot.facet(facet)
      }

      if (theme) {
        plot = plot.theme(theme)
      }

      if (labs) {
        plot = plot.labs(labs)
      }

      const opts: RenderOptions = {
        width,
        height,
        renderer,
        colorMode,
      }

      rendered = plot.render(opts)
      dispatch('render', rendered)
    } else {
      rendered = ''
    }
  }

  // Expose methods via binding
  export function refresh() {
    // Trigger reactivity
    data = [...data]
  }

  export function getRendered(): string {
    return rendered
  }
</script>

<pre
  class="ggterm"
  tabindex="0"
  on:keydown
  style="font-family: monospace; white-space: pre; margin: 0; padding: 0;"
>
{rendered}
</pre>

<style>
  .ggterm {
    display: block;
    line-height: 1;
  }
</style>

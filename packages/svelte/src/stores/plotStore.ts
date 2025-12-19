/**
 * Svelte stores for ggterm plot management
 */

import { writable, derived, get } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import {
  gg,
  GGPlot,
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

export interface PlotStoreOptions {
  /** Initial data */
  data?: DataSource
  /** Aesthetic mapping */
  aes: AestheticMapping
  /** Geometry layers */
  geoms?: Geom[]
  /** Scale definitions */
  scales?: Scale[]
  /** Coordinate system */
  coord?: Coord
  /** Faceting specification */
  facet?: Facet
  /** Theme configuration */
  theme?: Theme | Partial<Theme>
  /** Labels */
  labs?: Labels
  /** Plot width */
  width?: number
  /** Plot height */
  height?: number
  /** Renderer type */
  renderer?: 'braille' | 'block' | 'sixel' | 'auto'
  /** Color mode */
  colorMode?: 'none' | '16' | '256' | 'truecolor' | 'auto'
  /** Auto-render on changes */
  autoRender?: boolean
}

export interface PlotStore {
  /** Rendered output store */
  rendered: Readable<string>
  /** Data store */
  data: Writable<DataSource>
  /** Is rendering */
  isRendering: Readable<boolean>
  /** Render count */
  renderCount: Readable<number>
  /** Plot instance */
  plot: Readable<GGPlot | null>

  /** Set data */
  setData: (data: DataSource) => void
  /** Push data */
  pushData: (record: DataSource[number] | DataSource) => void
  /** Clear data */
  clearData: () => void
  /** Force render */
  refresh: () => void
  /** Update options */
  setOptions: (options: Partial<PlotStoreOptions>) => void
  /** Destroy store */
  destroy: () => void
}

/**
 * Creates a reactive plot store
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPlotStore } from '@ggterm/svelte'
 *   import { geom_point } from '@ggterm/core'
 *
 *   const plot = createPlotStore({
 *     data: myData,
 *     aes: { x: 'x', y: 'y' },
 *     geoms: [geom_point()]
 *   })
 * </script>
 *
 * <pre>{$plot.rendered}</pre>
 * ```
 */
export function createPlotStore(options: PlotStoreOptions): PlotStore {
  // Configuration store
  const config = writable({
    aes: options.aes,
    geoms: options.geoms ?? [],
    scales: options.scales ?? [],
    coord: options.coord,
    facet: options.facet,
    theme: options.theme,
    labs: options.labs,
    width: options.width ?? 70,
    height: options.height ?? 20,
    renderer: options.renderer ?? 'auto',
    colorMode: options.colorMode ?? 'auto',
    autoRender: options.autoRender ?? true,
  })

  // Data store
  const data = writable<DataSource>(options.data ?? [])

  // Rendering state
  const isRendering = writable(false)
  const renderCount = writable(0)
  const renderedOutput = writable('')

  // Build plot from current state
  const plot = derived([data, config], ([$data, $config]) => {
    if ($data.length === 0) {
      return null
    }

    let p = gg($data).aes($config.aes)

    for (const geom of $config.geoms) {
      p = p.geom(geom)
    }

    for (const scale of $config.scales) {
      p = p.scale(scale)
    }

    if ($config.coord) {
      p = p.coord($config.coord)
    }

    if ($config.facet) {
      p = p.facet($config.facet)
    }

    if ($config.theme) {
      p = p.theme($config.theme)
    }

    if ($config.labs) {
      p = p.labs($config.labs)
    }

    return p
  })

  // Render function
  const doRender = () => {
    const currentPlot = get(plot)
    const currentConfig = get(config)

    if (!currentPlot) {
      renderedOutput.set('')
      return
    }

    isRendering.set(true)

    try {
      const renderOpts: RenderOptions = {
        width: currentConfig.width,
        height: currentConfig.height,
        renderer: currentConfig.renderer,
        colorMode: currentConfig.colorMode,
      }

      const result = currentPlot.render(renderOpts)
      renderedOutput.set(result)
      renderCount.update((n) => n + 1)
    } finally {
      isRendering.set(false)
    }
  }

  // Auto-render subscription
  let unsubscribe: (() => void) | null = null

  const setupAutoRender = () => {
    if (unsubscribe) {
      unsubscribe()
    }

    unsubscribe = plot.subscribe(() => {
      const currentConfig = get(config)
      if (currentConfig.autoRender) {
        doRender()
      }
    })
  }

  setupAutoRender()

  // Actions
  const setData = (newData: DataSource) => {
    data.set(newData)
  }

  const pushData = (record: DataSource[number] | DataSource) => {
    data.update((prev) => {
      if (Array.isArray(record)) {
        return [...prev, ...record]
      }
      return [...prev, record]
    })
  }

  const clearData = () => {
    data.set([])
  }

  const refresh = () => {
    doRender()
  }

  const setOptions = (newOptions: Partial<PlotStoreOptions>) => {
    config.update((prev) => ({
      ...prev,
      ...newOptions,
    }))
  }

  const destroy = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return {
    rendered: { subscribe: renderedOutput.subscribe },
    data,
    isRendering: { subscribe: isRendering.subscribe },
    renderCount: { subscribe: renderCount.subscribe },
    plot,

    setData,
    pushData,
    clearData,
    refresh,
    setOptions,
    destroy,
  }
}

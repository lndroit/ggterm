/**
 * @ggterm/svelte - Svelte integration for ggterm
 *
 * Provides Svelte components and stores for building
 * grammar of graphics visualizations in terminal UIs.
 *
 * @example
 * ```svelte
 * <script>
 *   import { GGTerm, createPlotStore, createDataStore } from '@ggterm/svelte'
 *   import { geom_point, geom_line } from '@ggterm/core'
 *
 *   // Simple usage with component
 *   let data = [{ x: 1, y: 10 }, { x: 2, y: 20 }]
 * </script>
 *
 * <GGTerm
 *   {data}
 *   aes={{ x: 'x', y: 'y' }}
 *   geoms={[geom_line(), geom_point()]}
 * />
 * ```
 *
 * @example
 * ```svelte
 * <script>
 *   import { createPlotStore, createDataStore } from '@ggterm/svelte'
 *   import { geom_line } from '@ggterm/core'
 *
 *   // Advanced usage with stores
 *   const dataStore = createDataStore({ maxPoints: 100 })
 *   const plot = createPlotStore({
 *     aes: { x: 'time', y: 'value' },
 *     geoms: [geom_line()]
 *   })
 *
 *   // Stream data
 *   setInterval(() => {
 *     dataStore.push({ time: Date.now(), value: Math.random() })
 *     plot.setData($dataStore.windowed)
 *   }, 100)
 * </script>
 *
 * <pre>{$plot.rendered}</pre>
 * ```
 */

// Components
export { GGTerm } from './components'

// Stores
export {
  createPlotStore,
  createDataStore,
  createInteractionStore,
} from './stores'

export type {
  // Plot store types
  PlotStoreOptions,
  PlotStore,
  // Data store types
  DataStoreOptions,
  DataStore,
  // Interaction store types
  SelectionMode,
  Viewport,
  BrushRect,
  InteractionStoreOptions,
  InteractionStore,
} from './stores'

// Re-export commonly used types from core
export type {
  DataSource,
  DataRecord,
  AestheticMapping,
  RenderOptions,
  PlotSpec,
  Theme,
  Labels,
  Geom,
  Scale,
  Coord,
  Facet,
} from '@ggterm/core'

/**
 * Pipeline exports
 */

export { renderToCanvas, renderToString, calculateLayout } from './pipeline'
export type { PlotLayout } from './pipeline'

export {
  buildScaleContext,
  createResolvedContinuousScale,
  createResolvedDiscreteScale,
  createResolvedDiscreteColorScale,
  createResolvedContinuousColorScale,
  inferContinuousDomain,
  inferDiscreteDomain,
  expandDomain,
  niceDomain,
  DEFAULT_POINT_COLOR,
} from './scales'
export type { ResolvedScale, ResolvedColorScale, ScaleContext } from './scales'

export { renderGeom } from './render-geoms'

export {
  renderAxes,
  renderTitle,
  renderLegend,
  renderMultiLegend,
  calculateLegendHeight,
  calculateMultiLegendHeight,
  calculateTicks,
  formatTick,
} from './render-axes'
export type { LegendEntry } from './render-axes'

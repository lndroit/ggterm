/**
 * Scale exports
 */

export {
  scale_x_continuous,
  scale_y_continuous,
  scale_x_log10,
  scale_y_log10,
  scale_x_sqrt,
  scale_y_sqrt,
  scale_x_reverse,
  scale_y_reverse,
  type ContinuousScaleOptions,
} from './continuous'

export {
  scale_x_discrete,
  scale_y_discrete,
  type DiscreteScaleOptions,
} from './discrete'

export {
  scale_color_continuous,
  scale_color_viridis,
  scale_color_discrete,
  scale_color_manual,
  scale_fill_continuous,
  scale_fill_viridis,
  scale_fill_discrete,
  scale_fill_manual,
  type ColorContinuousOptions,
  type ColorDiscreteOptions,
  type ColorManualOptions,
} from './color'

// Phase 7: Advanced Scales
export {
  scale_size_continuous,
  scale_size_area,
  scale_size_radius,
  scale_size_identity,
  scale_size_binned,
  type SizeScaleOptions,
  type BinnedSizeOptions,
} from './size'

export {
  scale_shape_discrete,
  scale_shape_manual,
  scale_shape_identity,
  scale_shape_ordinal,
  DEFAULT_SHAPES,
  SHAPE_CHARS,
  type ShapeScaleOptions,
  type ManualShapeOptions,
} from './shape'

export {
  scale_alpha_continuous,
  scale_alpha,
  scale_alpha_identity,
  scale_alpha_discrete,
  scale_alpha_manual,
  scale_alpha_binned,
  type AlphaScaleOptions,
  type DiscreteAlphaOptions,
  type ManualAlphaOptions,
  type BinnedAlphaOptions,
} from './alpha'

export {
  scale_x_datetime,
  scale_y_datetime,
  scale_x_date,
  scale_y_date,
  scale_x_time,
  scale_y_time,
  scale_x_duration,
  scale_y_duration,
  formatDateTime,
  calculateDateTimeTicks,
  type DateTimeScaleOptions,
  type TimeScaleOptions,
  type DurationScaleOptions,
} from './datetime'

/**
 * @ggterm/opentui - OpenTUI/React integration components
 *
 * Provides React components for embedding ggterm plots in OpenTUI applications.
 */

export { GGTerm } from './components/GGTerm'
export type { GGTermProps, GGTermRef } from './components/GGTerm'

export { useGGTerm } from './hooks/useGGTerm'
export type { UseGGTermOptions, UseGGTermResult } from './hooks/useGGTerm'

export { usePlotData } from './hooks/usePlotData'
export type { UsePlotDataResult } from './hooks/usePlotData'

export { usePlotInteraction } from './hooks/usePlotInteraction'
export type { PlotInteractionState, UsePlotInteractionOptions } from './hooks/usePlotInteraction'

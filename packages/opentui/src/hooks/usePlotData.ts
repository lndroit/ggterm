/**
 * usePlotData hook
 *
 * Provides reactive data management for ggterm plots.
 */

import { useState, useCallback, useMemo, useRef } from 'react'

/**
 * Options for data windowing (useful for streaming/time-series)
 */
export interface DataWindowOptions {
  /** Maximum number of points to keep */
  maxPoints?: number
  /** Maximum time window in ms (removes older points) */
  maxAge?: number
  /** Field name containing timestamp (for maxAge filtering) */
  timeField?: string
}

/**
 * Result of usePlotData hook
 */
export interface UsePlotDataResult<T extends Record<string, unknown>> {
  /** Current data array */
  data: T[]
  /** Number of data points */
  count: number
  /** Whether data has changed since last render */
  isDirty: boolean
  /** Set data (replaces all) */
  setData: (data: T[]) => void
  /** Push new data points */
  pushData: (data: T | T[]) => void
  /** Update a specific data point by index */
  updateAt: (index: number, updates: Partial<T>) => void
  /** Remove data points by predicate */
  removeWhere: (predicate: (item: T, index: number) => boolean) => void
  /** Clear all data */
  clearData: () => void
  /** Mark data as clean (called after rendering) */
  markClean: () => void
  /** Filter data (returns new array, doesn't mutate) */
  filter: (predicate: (item: T, index: number) => boolean) => T[]
  /** Transform data (returns new array, doesn't mutate) */
  map: <U extends Record<string, unknown>>(transform: (item: T, index: number) => U) => U[]
  /** Get data statistics for a numeric field */
  getStats: (field: keyof T) => { min: number; max: number; mean: number; count: number } | null
}

/**
 * Hook for managing plot data with reactive updates
 *
 * Provides a convenient API for managing data that will be visualized,
 * with support for streaming data, windowing, and transformations.
 *
 * @example
 * ```tsx
 * function StreamingPlot() {
 *   const {
 *     data,
 *     pushData,
 *     clearData,
 *     count
 *   } = usePlotData<{ time: number; value: number }>([], {
 *     maxPoints: 100  // Keep last 100 points
 *   })
 *
 *   useEffect(() => {
 *     const interval = setInterval(() => {
 *       pushData({
 *         time: Date.now(),
 *         value: Math.random() * 100
 *       })
 *     }, 100)
 *     return () => clearInterval(interval)
 *   }, [pushData])
 *
 *   return (
 *     <GGTerm
 *       data={data}
 *       aes={{ x: 'time', y: 'value' }}
 *       geoms={[geom_line()]}
 *     />
 *   )
 * }
 * ```
 */
export function usePlotData<T extends Record<string, unknown>>(
  initialData: T[] = [],
  windowOptions?: DataWindowOptions
): UsePlotDataResult<T> {
  const [data, setDataState] = useState<T[]>(initialData)
  const [isDirty, setIsDirty] = useState(false)
  const dirtyRef = useRef(false)

  // Apply windowing to data
  const applyWindowing = useCallback((inputData: T[]): T[] => {
    if (!windowOptions) return inputData

    let result = inputData

    // Apply time-based windowing
    if (windowOptions.maxAge && windowOptions.timeField) {
      const now = Date.now()
      const cutoff = now - windowOptions.maxAge
      const timeField = windowOptions.timeField

      result = result.filter(item => {
        const timestamp = item[timeField]
        if (typeof timestamp === 'number') {
          return timestamp >= cutoff
        }
        return true
      })
    }

    // Apply point-count windowing
    if (windowOptions.maxPoints && result.length > windowOptions.maxPoints) {
      result = result.slice(-windowOptions.maxPoints)
    }

    return result
  }, [windowOptions])

  // Set data (replaces all)
  const setData = useCallback((newData: T[]) => {
    const windowed = applyWindowing(newData)
    setDataState(windowed)
    setIsDirty(true)
    dirtyRef.current = true
  }, [applyWindowing])

  // Push new data points
  const pushData = useCallback((newData: T | T[]) => {
    const dataArray = Array.isArray(newData) ? newData : [newData]

    setDataState(current => {
      const combined = [...current, ...dataArray]
      return applyWindowing(combined)
    })
    setIsDirty(true)
    dirtyRef.current = true
  }, [applyWindowing])

  // Update at index
  const updateAt = useCallback((index: number, updates: Partial<T>) => {
    setDataState(current => {
      if (index < 0 || index >= current.length) return current

      const newData = [...current]
      newData[index] = { ...newData[index], ...updates }
      return newData
    })
    setIsDirty(true)
    dirtyRef.current = true
  }, [])

  // Remove by predicate
  const removeWhere = useCallback((predicate: (item: T, index: number) => boolean) => {
    setDataState(current => current.filter((item, index) => !predicate(item, index)))
    setIsDirty(true)
    dirtyRef.current = true
  }, [])

  // Clear all
  const clearData = useCallback(() => {
    setDataState([])
    setIsDirty(true)
    dirtyRef.current = true
  }, [])

  // Mark as clean
  const markClean = useCallback(() => {
    setIsDirty(false)
    dirtyRef.current = false
  }, [])

  // Filter (non-mutating)
  const filter = useCallback((predicate: (item: T, index: number) => boolean): T[] => {
    return data.filter(predicate)
  }, [data])

  // Map (non-mutating)
  const map = useCallback(<U extends Record<string, unknown>>(
    transform: (item: T, index: number) => U
  ): U[] => {
    return data.map(transform)
  }, [data])

  // Get statistics for a field
  const getStats = useCallback((field: keyof T): { min: number; max: number; mean: number; count: number } | null => {
    const values: number[] = []

    for (const item of data) {
      const v = item[field]
      if (typeof v === 'number' && !isNaN(v)) {
        values.push(v)
      }
    }

    if (values.length === 0) return null

    const min = Math.min(...values)
    const max = Math.max(...values)
    const mean = values.reduce((a, b) => a + b, 0) / values.length

    return { min, max, mean, count: values.length }
  }, [data])

  return useMemo(() => ({
    data,
    count: data.length,
    isDirty,
    setData,
    pushData,
    updateAt,
    removeWhere,
    clearData,
    markClean,
    filter,
    map,
    getStats,
  }), [
    data,
    isDirty,
    setData,
    pushData,
    updateAt,
    removeWhere,
    clearData,
    markClean,
    filter,
    map,
    getStats,
  ])
}

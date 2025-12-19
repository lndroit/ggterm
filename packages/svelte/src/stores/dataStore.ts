/**
 * Svelte store for reactive plot data management
 */

import { writable, derived, get } from 'svelte/store'
import type { Writable, Readable } from 'svelte/store'
import type { DataSource } from '@ggterm/core'

export interface DataStoreOptions {
  /** Maximum number of points */
  maxPoints?: number
  /** Time window in milliseconds */
  timeWindowMs?: number
  /** Time field name */
  timeField?: string
  /** Initial data */
  initialData?: DataSource
}

export interface DataStore {
  /** All data */
  data: Writable<DataSource>
  /** Windowed/filtered data */
  windowed: Readable<DataSource>
  /** Point count */
  count: Readable<number>
  /** Is dirty flag */
  isDirty: Readable<boolean>

  /** Set all data */
  set: (data: DataSource) => void
  /** Push record(s) */
  push: (record: DataSource[number] | DataSource) => void
  /** Update record at index */
  updateAt: (index: number, updates: Partial<DataSource[number]>) => void
  /** Remove matching records */
  removeWhere: (predicate: (record: DataSource[number]) => boolean) => void
  /** Clear all data */
  clear: () => void
  /** Mark as clean */
  markClean: () => void
  /** Apply time window filter */
  applyTimeWindow: () => void
  /** Apply max points limit */
  applyMaxPoints: () => void
}

/**
 * Creates a reactive data store with windowing support
 *
 * @example
 * ```svelte
 * <script>
 *   import { createDataStore } from '@ggterm/svelte'
 *
 *   const dataStore = createDataStore({
 *     maxPoints: 100,
 *     timeWindowMs: 60000
 *   })
 *
 *   // Push streaming data
 *   setInterval(() => {
 *     dataStore.push({ time: Date.now(), value: Math.random() })
 *   }, 100)
 * </script>
 *
 * <p>Points: {$dataStore.count}</p>
 * ```
 */
export function createDataStore(options: DataStoreOptions = {}): DataStore {
  const {
    maxPoints,
    timeWindowMs,
    timeField = 'time',
    initialData = [],
  } = options

  // Core data store
  const data = writable<DataSource>(initialData)
  const isDirtyStore = writable(false)

  // Derived count
  const count = derived(data, ($data) => $data.length)

  // Windowed data
  const windowed = derived(data, ($data) => {
    let result = $data

    // Apply time window
    if (timeWindowMs && timeWindowMs > 0) {
      const cutoff = Date.now() - timeWindowMs
      result = result.filter((record) => {
        const timestamp = record[timeField]
        if (typeof timestamp === 'number') {
          return timestamp >= cutoff
        }
        if (timestamp instanceof Date) {
          return timestamp.getTime() >= cutoff
        }
        return true
      })
    }

    // Apply max points
    if (maxPoints && maxPoints > 0 && result.length > maxPoints) {
      result = result.slice(-maxPoints)
    }

    return result
  })

  // Actions
  const set = (newData: DataSource) => {
    data.set(newData)
    isDirtyStore.set(true)
  }

  const push = (record: DataSource[number] | DataSource) => {
    data.update((prev) => {
      const newRecords = Array.isArray(record) ? record : [record]
      let result = [...prev, ...newRecords]

      // Apply limits on push for performance
      if (maxPoints && result.length > maxPoints * 1.5) {
        result = result.slice(-maxPoints)
      }

      return result
    })
    isDirtyStore.set(true)
  }

  const updateAt = (index: number, updates: Partial<DataSource[number]>) => {
    data.update((prev) => {
      if (index < 0 || index >= prev.length) return prev
      const newData = [...prev]
      newData[index] = { ...newData[index], ...updates }
      return newData
    })
    isDirtyStore.set(true)
  }

  const removeWhere = (predicate: (record: DataSource[number]) => boolean) => {
    data.update((prev) => prev.filter((record) => !predicate(record)))
    isDirtyStore.set(true)
  }

  const clear = () => {
    data.set([])
    isDirtyStore.set(true)
  }

  const markClean = () => {
    isDirtyStore.set(false)
  }

  const applyTimeWindow = () => {
    if (!timeWindowMs) return

    const cutoff = Date.now() - timeWindowMs
    data.update((prev) =>
      prev.filter((record) => {
        const timestamp = record[timeField]
        if (typeof timestamp === 'number') {
          return timestamp >= cutoff
        }
        if (timestamp instanceof Date) {
          return timestamp.getTime() >= cutoff
        }
        return true
      })
    )
  }

  const applyMaxPoints = () => {
    if (!maxPoints) return

    data.update((prev) => {
      if (prev.length <= maxPoints) return prev
      return prev.slice(-maxPoints)
    })
  }

  return {
    data,
    windowed,
    count,
    isDirty: { subscribe: isDirtyStore.subscribe },

    set,
    push,
    updateAt,
    removeWhere,
    clear,
    markClean,
    applyTimeWindow,
    applyMaxPoints,
  }
}

/**
 * System Management Selectors
 * 
 * Purpose: Handle system label to display name mapping for GraphViewer compounds
 * and other system-related data transformations.
 * 
 * Data Contract:
 * - systemLabel: Neo4j label used for system membership (e.g., "ProdWebSystem")  
 * - systemName: Display name for UI (e.g., "Production Web System")
 * - Systems in nodes.systems[] contain systemLabel values
 * 
 * ⚠️ IMPORTANT: READ ALL SELECTORS BEFORE CREATING NEW ONES
 * Check if existing selectors already provide the data you need.
 */

import { createSelector } from '@reduxjs/toolkit'
import { useMemo } from 'react'

/**
 * Get system label to display name mapping
 * 
 * Returns: { [systemLabel]: systemName }
 * Example: { "ProdWebSystem": "Production Web System", "TestDB": "Test Database" }
 * 
 * Usage: For GraphViewerMapper to create proper system compound labels
 */
export const getSystemLabelToNameMapping = createSelector(
  [(state) => state.system?.systems || []],
  (systems) => {
    const mapping = {}
    systems.forEach(system => {
      if (system.systemLabel && system.systemName) {
        mapping[system.systemLabel] = system.systemName
      }
    })
    return mapping
  }
)

/**
 * Get display name for a specific system label
 * 
 * Returns: string - display name or fallback to label if not found
 * Example: getSystemDisplayName(state, "ProdWebSystem") -> "Production Web System"
 * 
 * Usage: When you have a systemLabel and need the display name
 */
export const getSystemDisplayName = createSelector(
  [getSystemLabelToNameMapping, (state, systemLabel) => systemLabel],
  (mapping, systemLabel) => mapping[systemLabel] || systemLabel
)

/**
 * Get all system labels that have display names
 * 
 * Returns: string[] - array of system labels
 * Example: ["ProdWebSystem", "TestDB", "DevEnv"]
 * 
 * Usage: When you need to know which systems are properly configured
 */
export const getConfiguredSystemLabels = createSelector(
  [getSystemLabelToNameMapping],
  (mapping) => Object.keys(mapping)
)

/**
 * Hook-based selectors using useMemo for direct component usage
 * Use these in components when you need memoized system data
 */

/**
 * Use system label to name mapping with memoization
 * 
 * Usage in component:
 * const systemMapping = useSystemLabelToNameMapping(systems)
 */
export const useSystemLabelToNameMapping = (systems) => {
  return useMemo(() => {
    const mapping = {}
    if (Array.isArray(systems)) {
      systems.forEach(system => {
        if (system.systemLabel && system.systemName) {
          mapping[system.systemLabel] = system.systemName
        }
      })
    }
    return mapping
  }, [systems])
}

/**
 * Use system display name lookup with memoization
 * 
 * Usage in component:
 * const getDisplayName = useSystemDisplayNameLookup(systems)
 * const name = getDisplayName("ProdWebSystem") // -> "Production Web System"
 */
export const useSystemDisplayNameLookup = (systems) => {
  const mapping = useSystemLabelToNameMapping(systems)
  
  return useMemo(() => {
    return (systemLabel) => mapping[systemLabel] || systemLabel
  }, [mapping])
}
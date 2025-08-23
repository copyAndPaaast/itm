/**
 * System View Mode Constants
 * Defines how the GraphViewer displays systems
 */
export const SYSTEM_VIEW_MODES = {
  SINGLE: 'single',     // Display one system at a time
  COMPOUND: 'compound'  // Display multiple systems with visual grouping and collapsing
}

// For validation and iteration
export const VALID_SYSTEM_VIEW_MODES = Object.values(SYSTEM_VIEW_MODES)

// Default mode
export const DEFAULT_SYSTEM_VIEW_MODE = SYSTEM_VIEW_MODES.SINGLE
/**
 * System Slice - Redux state management for system workflow
 * 
 * Manages system selection, creation, and viewing modes for the ITM application
 */

import { createSlice } from '@reduxjs/toolkit'
import { SYSTEM_VIEW_MODES, DEFAULT_SYSTEM_VIEW_MODE, VALID_SYSTEM_VIEW_MODES } from './systemViewModes.js'

/**
 * Initial system state
 */
const initialState = {
  // Current system for editing/creating focus
  currentSystemId: null,
  
  // Systems currently visible in the GraphViewer (for compound mode)
  visibleSystemIds: [],
  
  // How systems are displayed in the viewer
  systemViewMode: DEFAULT_SYSTEM_VIEW_MODE,
  
  // System creation/editing workflow
  isCreatingSystem: false,
  isEditingSystem: false,
  systemFormData: {
    systemName: '',
    systemLabel: '',
    description: '',
    properties: {}
  },
  
  // Available systems (loaded from backend)
  systems: [],
  
  // Loading/error states
  isLoading: false,
  error: null
}

/**
 * System slice with actions for system management
 */
const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    /**
     * Set the currently focused system (for editing)
     */
    setCurrentSystemId: (state, action) => {
      state.currentSystemId = action.payload
    },

    /**
     * Set which systems are visible in the GraphViewer
     */
    setVisibleSystems: (state, action) => {
      state.visibleSystemIds = Array.isArray(action.payload) ? action.payload : [action.payload]
    },

    /**
     * Add a system to the visible systems (for compound view)
     */
    addVisibleSystem: (state, action) => {
      const systemId = action.payload
      if (systemId && !state.visibleSystemIds.includes(systemId)) {
        state.visibleSystemIds.push(systemId)
      }
    },

    /**
     * Remove a system from visible systems
     */
    removeVisibleSystem: (state, action) => {
      const systemId = action.payload
      state.visibleSystemIds = state.visibleSystemIds.filter(id => id !== systemId)
    },

    /**
     * Set the system view mode with validation
     */
    setSystemViewMode: (state, action) => {
      const mode = action.payload
      if (VALID_SYSTEM_VIEW_MODES.includes(mode)) {
        state.systemViewMode = mode
        
        // Auto-adjust visible systems based on mode
        if (mode === SYSTEM_VIEW_MODES.SINGLE && state.currentSystemId) {
          state.visibleSystemIds = [state.currentSystemId]
        }
      } else {
        console.warn(`Invalid system view mode: ${mode}`)
      }
    },

    /**
     * Start creating a new system
     */
    startCreateSystem: (state) => {
      state.isCreatingSystem = true
      state.isEditingSystem = false
      state.currentSystemId = null
      state.systemFormData = {
        systemName: '',
        systemLabel: '',
        description: '',
        properties: {}
      }
    },

    /**
     * Start editing an existing system
     */
    startEditSystem: (state, action) => {
      const systemId = action.payload
      const system = state.systems.find(s => s.systemId === systemId)
      
      if (system) {
        state.isCreatingSystem = false
        state.isEditingSystem = true
        state.currentSystemId = systemId
        state.systemFormData = {
          systemName: system.systemName,
          systemLabel: system.systemLabel,
          description: system.description,
          properties: system.properties || {}
        }
      }
    },

    /**
     * Update system form data as user types
     */
    updateSystemFormData: (state, action) => {
      state.systemFormData = {
        ...state.systemFormData,
        ...action.payload
      }
    },

    /**
     * Clear system form data (cancel/reset)
     */
    clearSystemFormData: (state) => {
      state.isCreatingSystem = false
      state.isEditingSystem = false
      state.systemFormData = {
        systemName: '',
        systemLabel: '',
        description: '',
        properties: {}
      }
    },

    /**
     * Add a system to the available systems list
     */
    addSystem: (state, action) => {
      const system = action.payload
      state.systems.push(system)
      
      // Set as current and visible after creation
      state.currentSystemId = system.systemId
      if (state.systemViewMode === SYSTEM_VIEW_MODES.SINGLE) {
        state.visibleSystemIds = [system.systemId]
      } else {
        state.visibleSystemIds.push(system.systemId)
      }
      
      // Transition from creation to viewing mode (keeps Properties Panel open)
      state.isCreatingSystem = false
      state.isEditingSystem = false
      
      // Clear form data - useEffect in SystemPropertiesForm will populate it from currentSystem
      state.systemFormData = {
        systemName: '',
        systemLabel: '',
        description: '',
        properties: {}
      }
    },

    /**
     * Remove a system from the available systems list
     */
    removeSystem: (state, action) => {
      const systemId = action.payload
      
      // Remove from systems array
      state.systems = state.systems.filter(system => system.systemId !== systemId)
      
      // Clear if it was the current system
      if (state.currentSystemId === systemId) {
        state.currentSystemId = null
      }
      
      // Remove from visible systems
      state.visibleSystemIds = state.visibleSystemIds.filter(id => id !== systemId)
      
      // If no visible systems remain and we have systems available, show the first one
      if (state.visibleSystemIds.length === 0 && state.systems.length > 0) {
        const firstSystem = state.systems[0]
        state.visibleSystemIds = [firstSystem.systemId]
        if (!state.currentSystemId) {
          state.currentSystemId = firstSystem.systemId
        }
      }
    },

    /**
     * Set all available systems
     */
    setSystems: (state, action) => {
      state.systems = action.payload
    },

    /**
     * Set loading state
     */
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },

    /**
     * Set error state
     */
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },

    /**
     * Clear error state
     */
    clearError: (state) => {
      state.error = null
    }
  }
})

/**
 * Export actions
 */
export const {
  setCurrentSystemId,
  setVisibleSystems,
  addVisibleSystem,
  removeVisibleSystem,
  setSystemViewMode,
  startCreateSystem,
  startEditSystem,
  updateSystemFormData,
  clearSystemFormData,
  addSystem,
  removeSystem,
  setSystems,
  setLoading,
  setError,
  clearError
} = systemSlice.actions

/**
 * Selectors for system state
 */
export const selectCurrentSystemId = (state) => state.system.currentSystemId
export const selectVisibleSystemIds = (state) => state.system.visibleSystemIds
export const selectSystemViewMode = (state) => state.system.systemViewMode
export const selectIsCreatingSystem = (state) => state.system.isCreatingSystem
export const selectIsEditingSystem = (state) => state.system.isEditingSystem
export const selectSystemFormData = (state) => state.system.systemFormData
export const selectSystems = (state) => state.system.systems
export const selectCurrentSystem = (state) => {
  const currentId = state.system.currentSystemId
  return state.system.systems.find(system => system.systemId === currentId) || null
}
export const selectVisibleSystems = (state) => {
  const visibleIds = state.system.visibleSystemIds
  return state.system.systems.filter(system => visibleIds.includes(system.systemId))
}
export const selectIsLoading = (state) => state.system.isLoading
export const selectError = (state) => state.system.error

export default systemSlice.reducer
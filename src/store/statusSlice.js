/**
 * Status Slice - Redux state management for system status feedback
 * 
 * Manages unobtrusive user feedback with animated status indicators
 */

import { createSlice } from '@reduxjs/toolkit'

/**
 * Status types and their corresponding colors and animations
 */
export const StatusTypes = {
  IDLE: 'idle',
  LOADING: 'loading', 
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}

// Status colors are now handled by theme-aware styles
// See: /src/ui/styles/StatusIndicatorStyles.js -> getStatusColors(theme)

/**
 * Initial status state
 */
const initialState = {
  status: StatusTypes.IDLE,
  message: 'Ready',
  timestamp: null,
  isAnimating: false,
  details: null // Additional details for debugging
}

/**
 * Status slice with actions for different status updates
 */
const statusSlice = createSlice({
  name: 'status',
  initialState,
  reducers: {
    /**
     * Set loading status with message
     */
    setLoading: (state, action) => {
      state.status = StatusTypes.LOADING
      state.message = action.payload || 'Loading...'
      state.timestamp = Date.now()
      state.isAnimating = true
      state.details = null
    },

    /**
     * Set success status with message
     */
    setSuccess: (state, action) => {
      state.status = StatusTypes.SUCCESS
      state.message = action.payload || 'Success'
      state.timestamp = Date.now()
      state.isAnimating = false
      state.details = null
    },

    /**
     * Set warning status with message
     */
    setWarning: (state, action) => {
      state.status = StatusTypes.WARNING
      state.message = action.payload.message || 'Warning'
      state.timestamp = Date.now()
      state.isAnimating = false
      state.details = action.payload.details || null
    },

    /**
     * Set error status with message and optional details
     */
    setError: (state, action) => {
      state.status = StatusTypes.ERROR
      state.message = action.payload.message || 'Error occurred'
      state.timestamp = Date.now()
      state.isAnimating = false
      state.details = action.payload.details || null
    },

    /**
     * Reset to idle status
     */
    setIdle: (state, action) => {
      state.status = StatusTypes.IDLE
      state.message = action.payload || 'Ready'
      state.timestamp = Date.now()
      state.isAnimating = false
      state.details = null
    },

    /**
     * Clear status after timeout (typically used with middleware)
     */
    clearStatus: (state) => {
      state.status = StatusTypes.IDLE
      state.message = 'Ready'
      state.timestamp = Date.now()
      state.isAnimating = false
      state.details = null
    }
  }
})

/**
 * Export actions
 */
export const {
  setLoading,
  setSuccess,
  setWarning,
  setError,
  setIdle,
  clearStatus
} = statusSlice.actions

/**
 * Selectors for status state
 */
export const selectStatus = (state) => state.status.status
export const selectStatusMessage = (state) => state.status.message
export const selectStatusTimestamp = (state) => state.status.timestamp
export const selectIsAnimating = (state) => state.status.isAnimating
export const selectStatusDetails = (state) => state.status.details
export const selectFullStatus = (state) => state.status

/**
 * Thunk actions for common status patterns
 */

/**
 * Show temporary success message that auto-clears after delay
 */
export const showTemporarySuccess = (message, delay = 3000) => (dispatch) => {
  dispatch(setSuccess(message))
  setTimeout(() => {
    dispatch(setIdle())
  }, delay)
}

/**
 * Show temporary error message that auto-clears after delay
 */
export const showTemporaryError = (message, details = null, delay = 5000) => (dispatch) => {
  dispatch(setError({ message, details }))
  setTimeout(() => {
    dispatch(setIdle())
  }, delay)
}

/**
 * Show loading, execute async operation, then show result
 */
export const executeWithStatus = (loadingMessage, asyncOperation, successMessage = 'Operation completed') => async (dispatch) => {
  try {
    dispatch(setLoading(loadingMessage))
    const result = await asyncOperation(dispatch) // Pass dispatch to asyncOperation
    dispatch(showTemporarySuccess(successMessage))
    return result
  } catch (error) {
    dispatch(showTemporaryError('Operation failed', error.message))
    throw error
  }
}

export default statusSlice.reducer
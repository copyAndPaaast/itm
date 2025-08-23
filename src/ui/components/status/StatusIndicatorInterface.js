/**
 * StatusIndicator Component Interface & Documentation
 * 
 * The StatusIndicator provides unobtrusive user feedback for system operations
 * through an animated status dot and text message in the application footer.
 */

/**
 * StatusIndicator Component API
 * 
 * This component automatically connects to Redux status state and requires no props.
 * It displays status information from the Redux store and updates automatically
 * when status actions are dispatched.
 * 
 * @component StatusIndicator
 * @returns {JSX.Element} Rendered status indicator
 * 
 * @example
 * // Basic usage - component manages its own state via Redux
 * <StatusIndicator />
 * 
 * @example  
 * // Triggering status updates via Redux actions
 * import { useDispatch } from 'react-redux'
 * import { setLoading, showTemporarySuccess } from '../store/statusSlice'
 * 
 * const MyComponent = () => {
 *   const dispatch = useDispatch()
 *   
 *   const handleSaveGraph = async () => {
 *     dispatch(setLoading('Saving graph...'))
 *     try {
 *       await saveGraphToDatabase()
 *       dispatch(showTemporarySuccess('Graph saved successfully'))
 *     } catch (error) {
 *       dispatch(setError({ message: 'Save failed', details: error.message }))
 *     }
 *   }
 * }
 */

/**
 * Status Types and Visual States
 */
export const StatusStates = {
  /**
   * IDLE - System ready for operation
   * - Color: Green (#4CAF50)
   * - Animation: Subtle glow pulse
   * - Usage: Default ready state
   * - Message: "Ready" or custom idle message
   */
  IDLE: {
    type: 'idle',
    color: '#4CAF50',
    animation: 'glow',
    description: 'System ready for operation',
    defaultMessage: 'Ready'
  },

  /**
   * LOADING - Operation in progress
   * - Color: Blue (#2196F3) 
   * - Animation: Circular progress spinner
   * - Usage: During async operations
   * - Message: Operation-specific loading text
   */
  LOADING: {
    type: 'loading',
    color: '#2196F3',
    animation: 'spinner',
    description: 'Operation in progress',
    defaultMessage: 'Loading...'
  },

  /**
   * SUCCESS - Operation completed successfully
   * - Color: Green (#4CAF50)
   * - Animation: Success pulse (3 pulses then glow)
   * - Usage: Temporary success feedback
   * - Message: Success confirmation text
   * - Auto-clear: After 3 seconds (configurable)
   */
  SUCCESS: {
    type: 'success', 
    color: '#4CAF50',
    animation: 'successPulse',
    description: 'Operation completed successfully',
    defaultMessage: 'Success',
    autoClear: true,
    autoClearDelay: 3000
  },

  /**
   * WARNING - Non-critical issue or advisory
   * - Color: Orange (#FF9800)
   * - Animation: Warning pulse (slower, persistent)
   * - Usage: Performance warnings, large data sets, etc.
   * - Message: Warning description with optional details
   * - Auto-clear: After 5 seconds (configurable)
   */
  WARNING: {
    type: 'warning',
    color: '#FF9800', 
    animation: 'warningPulse',
    description: 'Non-critical issue or advisory',
    defaultMessage: 'Warning',
    autoClear: true,
    autoClearDelay: 5000
  },

  /**
   * ERROR - Operation failed or critical issue
   * - Color: Red (#F44336)
   * - Animation: Error pulse (urgent, persistent)
   * - Usage: Connection failures, save errors, etc.
   * - Message: Error description with optional technical details
   * - Auto-clear: After 8 seconds (configurable)
   */
  ERROR: {
    type: 'error',
    color: '#F44336',
    animation: 'errorPulse', 
    description: 'Operation failed or critical issue',
    defaultMessage: 'Error',
    autoClear: true,
    autoClearDelay: 8000
  }
}

/**
 * Redux Actions Available for Status Control
 */
export const StatusActions = {
  /**
   * Set loading state with custom message
   * @param {string} message - Loading message to display
   */
  setLoading: 'status/setLoading',

  /**
   * Set success state with custom message  
   * @param {string} message - Success message to display
   */
  setSuccess: 'status/setSuccess',

  /**
   * Set error state with message and optional details
   * @param {Object} payload - Error payload
   * @param {string} payload.message - Error message to display
   * @param {string} [payload.details] - Technical details for tooltip
   */
  setError: 'status/setError',

  /**
   * Set warning state with message and optional details
   * @param {Object} payload - Warning payload  
   * @param {string} payload.message - Warning message to display
   * @param {string} [payload.details] - Additional details for tooltip
   */
  setWarning: 'status/setWarning',

  /**
   * Set idle/ready state
   * @param {string} [message] - Custom ready message (default: "Ready")
   */
  setIdle: 'status/setIdle',

  /**
   * Clear status (same as setIdle with default message)
   */
  clearStatus: 'status/clearStatus'
}

/**
 * Thunk Actions for Common Patterns
 */
export const StatusThunks = {
  /**
   * Show temporary success message that auto-clears
   * @param {string} message - Success message
   * @param {number} [delay=3000] - Auto-clear delay in ms
   */
  showTemporarySuccess: 'Thunk for temporary success feedback',

  /**
   * Show temporary error message that auto-clears
   * @param {string} message - Error message
   * @param {string} [details] - Error details
   * @param {number} [delay=5000] - Auto-clear delay in ms  
   */
  showTemporaryError: 'Thunk for temporary error feedback',

  /**
   * Execute async operation with automatic status management
   * @param {string} loadingMessage - Message during operation
   * @param {Function} asyncOperation - Promise-returning function
   * @param {string} [successMessage] - Message on success
   */
  executeWithStatus: 'Thunk for async operations with status'
}

/**
 * Component Features
 */
export const Features = {
  /**
   * Visual Design
   */
  visual: {
    size: '20px diameter status dot',
    placement: 'Footer left side',
    animations: [
      'Circular progress spinner for loading',
      'Glowing pulse for idle/ready state', 
      'Success pulse animation (3 pulses)',
      'Warning pulse (slow, persistent)',
      'Error pulse (urgent, attention-grabbing)'
    ],
    colors: 'Material Design color palette',
    typography: 'Material UI caption with status-based color coding'
  },

  /**
   * User Experience
   */
  userExperience: {
    unobtrusive: 'Footer placement avoids workflow interruption',
    informative: 'Clear status messaging with contextual colors',
    detailed: 'Hover tooltip shows timestamp and error details',
    responsive: 'Immediate visual feedback for user actions',
    accessible: 'ARIA-compliant with keyboard navigation'
  },

  /**
   * Technical Implementation
   */
  technical: {
    reduxIntegrated: 'Automatic state management via Redux store',
    performant: 'Efficient React re-renders with useSelector',
    themed: 'Material UI theme integration',
    configurable: 'Customizable auto-clear delays and messages',
    debuggable: 'Development mode shows timestamps and debug info'
  }
}

/**
 * Usage Examples by Scenario
 */
export const UsageExamples = {
  /**
   * Database Operations
   */
  databaseOperations: {
    connecting: "dispatch(setLoading('Connecting to Neo4j...'))",
    connected: "dispatch(showTemporarySuccess('Connected to database'))",
    connectionFailed: "dispatch(setError({ message: 'Connection failed', details: 'Timeout after 5s' }))",
    querying: "dispatch(setLoading('Executing graph query...'))",
    queryComplete: "dispatch(showTemporarySuccess('Query executed successfully'))"
  },

  /**
   * Graph Operations  
   */
  graphOperations: {
    loading: "dispatch(setLoading('Loading graph data...'))",
    saving: "dispatch(setLoading('Saving graph to database...'))",
    saved: "dispatch(showTemporarySuccess('Graph saved successfully'))", 
    largeDataset: "dispatch(setWarning({ message: 'Large dataset detected', details: '10,000+ nodes' }))",
    renderingIssue: "dispatch(setError({ message: 'Rendering failed', details: 'WebGL context lost' }))"
  },

  /**
   * Layout Operations
   */
  layoutOperations: {
    resetting: "dispatch(setLoading('Resetting layout...'))",
    resetComplete: "dispatch(showTemporarySuccess('Layout reset to defaults'))",
    calculating: "dispatch(setLoading('Calculating optimal layout...'))",
    optimized: "dispatch(showTemporarySuccess('Layout optimized'))"
  }
}

export default {
  StatusStates,
  StatusActions,
  StatusThunks,
  Features,
  UsageExamples
}
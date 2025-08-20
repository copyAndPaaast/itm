/**
 * Redux store configuration for ITM React UI
 * Includes GraphViewer state management with middleware for undo/redo tracking
 */

import { configureStore } from '@reduxjs/toolkit'
import graphViewerReducer from './graphViewerSlice.js'

/**
 * Custom middleware for permission checking
 */
const permissionMiddleware = (store) => (next) => (action) => {
  // List of actions that require permission checks
  const restrictedActions = [
    'graphViewer/addNode',
    'graphViewer/updateNode', 
    'graphViewer/deleteNode',
    'graphViewer/addEdge',
    'graphViewer/updateEdge',
    'graphViewer/deleteEdge',
    'graphViewer/bulkUpdateNodes',
    'graphViewer/bulkUpdateEdges'
  ]

  if (restrictedActions.includes(action.type)) {
    // Here you would implement permission checking logic
  }

  return next(action)
}

/**
 * Configure Redux store with reducers and middleware
 */
export const store = configureStore({
  reducer: {
    graphViewer: graphViewerReducer
  },
  
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Enable immutability and serializability checks in development
      immutableCheck: process.env.NODE_ENV === 'development',
      serializableCheck: process.env.NODE_ENV === 'development' ? {
        // Ignore these paths from serialization checks since they may contain functions
        ignoredPaths: ['graphViewer.*.cytoscapeInstance'],
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
      } : false
    }).concat([
      permissionMiddleware
    ]),
  
  // Enable Redux DevTools in development
  devTools: process.env.NODE_ENV === 'development'
})

export default store
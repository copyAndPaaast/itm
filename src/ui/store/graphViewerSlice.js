/**
 * Redux slice for GraphViewer state management
 * Supports multiple graph instances with undo/redo functionality
 */

import { createSlice } from '@reduxjs/toolkit'

/**
 * Initial state for a graph viewer instance
 */
const createInitialGraphState = () => ({
  nodes: [],
  edges: [],
  selection: {
    selectedNodes: [],
    selectedEdges: [],
    lastSelected: null
  },
  layout: 'dagre',
  zoom: 1,
  pan: { x: 0, y: 0 },
  filters: {
    assetTypes: [],
    systems: [],
    groups: [],
    searchQuery: ''
  },
  loading: false,
  error: null,
  history: {
    past: [],
    present: null,
    future: []
  }
})

/**
 * GraphViewer Redux slice
 */
const graphViewerSlice = createSlice({
  name: 'graphViewer',
  initialState: {},
  reducers: {
    
    /**
     * Initialize a new graph instance
     */
    initializeGraph: (state, action) => {
      const { graphId, initialNodes = [], initialEdges = [] } = action.payload
      state[graphId] = {
        ...createInitialGraphState(),
        nodes: initialNodes,
        edges: initialEdges
      }
    },

    /**
     * Destroy a graph instance
     */
    destroyGraph: (state, action) => {
      const { graphId } = action.payload
      delete state[graphId]
    },

    /**
     * Selection management
     */
    setSelection: (state, action) => {
      const { graphId, selection } = action.payload
      if (state[graphId]) {
        state[graphId].selection = selection
        
        // Store selection change in history
        const currentState = {
          type: 'selection',
          data: state[graphId].selection,
          timestamp: Date.now()
        }
        addToHistory(state[graphId], currentState)
      }
    },

    clearSelection: (state, action) => {
      const { graphId } = action.payload
      if (state[graphId]) {
        state[graphId].selection = {
          selectedNodes: [],
          selectedEdges: [],
          lastSelected: null
        }
      }
    },

    /**
     * Layout and view management
     */
    setLayout: (state, action) => {
      const { graphId, layout } = action.payload
      if (state[graphId]) {
        const previousLayout = state[graphId].layout
        state[graphId].layout = layout
        
        // Store layout change in history
        const currentState = {
          type: 'layout',
          data: { previous: previousLayout, current: layout },
          timestamp: Date.now()
        }
        addToHistory(state[graphId], currentState)
      }
    },

    setZoom: (state, action) => {
      const { graphId, zoom } = action.payload
      if (state[graphId]) {
        state[graphId].zoom = zoom
      }
    },

    setPan: (state, action) => {
      const { graphId, pan } = action.payload
      if (state[graphId]) {
        state[graphId].pan = pan
      }
    },

    /**
     * Node operations
     */
    addNode: (state, action) => {
      const { graphId, node } = action.payload
      if (state[graphId]) {
        state[graphId].nodes.push(node)
        
        // Store node addition in history
        const currentState = {
          type: 'nodeAdded',
          data: { nodeId: node.nodeId, nodeData: node },
          timestamp: Date.now()
        }
        addToHistory(state[graphId], currentState)
      }
    },

    updateNode: (state, action) => {
      const { graphId, nodeId, updates } = action.payload
      if (state[graphId]) {
        const nodeIndex = state[graphId].nodes.findIndex(n => (n.nodeId || n.id) === nodeId)
        if (nodeIndex !== -1) {
          const previousData = { ...state[graphId].nodes[nodeIndex] }
          state[graphId].nodes[nodeIndex] = { ...state[graphId].nodes[nodeIndex], ...updates }
          
          // Store node update in history
          const currentState = {
            type: 'nodeUpdated',
            data: { nodeId, previousData, updates },
            timestamp: Date.now()
          }
          addToHistory(state[graphId], currentState)
        }
      }
    },

    deleteNode: (state, action) => {
      const { graphId, nodeId } = action.payload
      if (state[graphId]) {
        const nodeIndex = state[graphId].nodes.findIndex(n => (n.nodeId || n.id) === nodeId)
        if (nodeIndex !== -1) {
          const deletedNode = state[graphId].nodes[nodeIndex]
          state[graphId].nodes.splice(nodeIndex, 1)
          
          // Remove edges connected to this node
          state[graphId].edges = state[graphId].edges.filter(edge => 
            edge.fromId !== nodeId && edge.toId !== nodeId &&
            edge.source !== nodeId && edge.target !== nodeId
          )
          
          // Remove from selection if selected
          state[graphId].selection.selectedNodes = state[graphId].selection.selectedNodes.filter(id => id !== nodeId)
          if (state[graphId].selection.lastSelected === nodeId) {
            state[graphId].selection.lastSelected = null
          }
          
          // Store node deletion in history
          const currentState = {
            type: 'nodeDeleted',
            data: { nodeId, nodeData: deletedNode },
            timestamp: Date.now()
          }
          addToHistory(state[graphId], currentState)
        }
      }
    },

    /**
     * Edge operations
     */
    addEdge: (state, action) => {
      const { graphId, edge } = action.payload
      if (state[graphId]) {
        state[graphId].edges.push(edge)
        
        // Store edge addition in history
        const currentState = {
          type: 'edgeAdded',
          data: { edgeId: edge.relationshipId || edge.id, edgeData: edge },
          timestamp: Date.now()
        }
        addToHistory(state[graphId], currentState)
      }
    },

    updateEdge: (state, action) => {
      const { graphId, edgeId, updates } = action.payload
      if (state[graphId]) {
        const edgeIndex = state[graphId].edges.findIndex(e => (e.relationshipId || e.id) === edgeId)
        if (edgeIndex !== -1) {
          const previousData = { ...state[graphId].edges[edgeIndex] }
          state[graphId].edges[edgeIndex] = { ...state[graphId].edges[edgeIndex], ...updates }
          
          // Store edge update in history
          const currentState = {
            type: 'edgeUpdated',
            data: { edgeId, previousData, updates },
            timestamp: Date.now()
          }
          addToHistory(state[graphId], currentState)
        }
      }
    },

    deleteEdge: (state, action) => {
      const { graphId, edgeId } = action.payload
      if (state[graphId]) {
        const edgeIndex = state[graphId].edges.findIndex(e => (e.relationshipId || e.id) === edgeId)
        if (edgeIndex !== -1) {
          const deletedEdge = state[graphId].edges[edgeIndex]
          state[graphId].edges.splice(edgeIndex, 1)
          
          // Remove from selection if selected
          state[graphId].selection.selectedEdges = state[graphId].selection.selectedEdges.filter(id => id !== edgeId)
          if (state[graphId].selection.lastSelected === edgeId) {
            state[graphId].selection.lastSelected = null
          }
          
          // Store edge deletion in history
          const currentState = {
            type: 'edgeDeleted',
            data: { edgeId, edgeData: deletedEdge },
            timestamp: Date.now()
          }
          addToHistory(state[graphId], currentState)
        }
      }
    },

    /**
     * Filter management
     */
    setFilters: (state, action) => {
      const { graphId, filters } = action.payload
      if (state[graphId]) {
        state[graphId].filters = { ...state[graphId].filters, ...filters }
      }
    },

    clearFilters: (state, action) => {
      const { graphId } = action.payload
      if (state[graphId]) {
        state[graphId].filters = {
          assetTypes: [],
          systems: [],
          groups: [],
          searchQuery: ''
        }
      }
    },

    /**
     * Loading and error states
     */
    setLoading: (state, action) => {
      const { graphId, loading } = action.payload
      if (state[graphId]) {
        state[graphId].loading = loading
      }
    },

    setError: (state, action) => {
      const { graphId, error } = action.payload
      if (state[graphId]) {
        state[graphId].error = error
        state[graphId].loading = false
      }
    },

    clearError: (state, action) => {
      const { graphId } = action.payload
      if (state[graphId]) {
        state[graphId].error = null
      }
    },

    /**
     * Undo/Redo functionality
     */
    undo: (state, action) => {
      const { graphId } = action.payload
      if (state[graphId] && state[graphId].history.past.length > 0) {
        const previous = state[graphId].history.past[state[graphId].history.past.length - 1]
        const current = state[graphId].history.present
        
        // Move current to future
        state[graphId].history.future.unshift(current)
        
        // Move previous to present
        state[graphId].history.present = previous
        
        // Remove from past
        state[graphId].history.past.pop()
        
        // Apply the previous state
        applyHistoryState(state[graphId], previous)
      }
    },

    redo: (state, action) => {
      const { graphId } = action.payload
      if (state[graphId] && state[graphId].history.future.length > 0) {
        const next = state[graphId].history.future[0]
        const current = state[graphId].history.present
        
        // Move current to past
        state[graphId].history.past.push(current)
        
        // Move next to present
        state[graphId].history.present = next
        
        // Remove from future
        state[graphId].history.future.shift()
        
        // Apply the next state
        applyHistoryState(state[graphId], next)
      }
    },

    /**
     * Bulk operations for performance
     */
    bulkUpdateNodes: (state, action) => {
      const { graphId, nodeUpdates } = action.payload
      if (state[graphId]) {
        const previousState = state[graphId].nodes.map(node => ({ ...node }))
        
        nodeUpdates.forEach(({ nodeId, updates }) => {
          const nodeIndex = state[graphId].nodes.findIndex(n => (n.nodeId || n.id) === nodeId)
          if (nodeIndex !== -1) {
            state[graphId].nodes[nodeIndex] = { ...state[graphId].nodes[nodeIndex], ...updates }
          }
        })
        
        // Store bulk update in history
        const currentState = {
          type: 'bulkNodeUpdate',
          data: { previousState, updates: nodeUpdates },
          timestamp: Date.now()
        }
        addToHistory(state[graphId], currentState)
      }
    },

    bulkUpdateEdges: (state, action) => {
      const { graphId, edgeUpdates } = action.payload
      if (state[graphId]) {
        const previousState = state[graphId].edges.map(edge => ({ ...edge }))
        
        edgeUpdates.forEach(({ edgeId, updates }) => {
          const edgeIndex = state[graphId].edges.findIndex(e => (e.relationshipId || e.id) === edgeId)
          if (edgeIndex !== -1) {
            state[graphId].edges[edgeIndex] = { ...state[graphId].edges[edgeIndex], ...updates }
          }
        })
        
        // Store bulk update in history
        const currentState = {
          type: 'bulkEdgeUpdate',
          data: { previousState, updates: edgeUpdates },
          timestamp: Date.now()
        }
        addToHistory(state[graphId], currentState)
      }
    }
  }
})

/**
 * Helper functions for history management
 */
function addToHistory(graphState, historyEntry) {
  // Limit history size to prevent memory issues
  const MAX_HISTORY_SIZE = 50
  
  // Clear future when new action is performed
  graphState.history.future = []
  
  // Add current state to past
  if (graphState.history.present) {
    graphState.history.past.push(graphState.history.present)
  }
  
  // Set new present
  graphState.history.present = historyEntry
  
  // Limit past history
  if (graphState.history.past.length > MAX_HISTORY_SIZE) {
    graphState.history.past = graphState.history.past.slice(-MAX_HISTORY_SIZE)
  }
}

function applyHistoryState(graphState, historyEntry) {
  switch (historyEntry.type) {
    case 'selection':
      graphState.selection = historyEntry.data
      break
      
    case 'layout':
      graphState.layout = historyEntry.data.current
      break
      
    case 'nodeAdded':
      // Remove the added node
      graphState.nodes = graphState.nodes.filter(n => (n.nodeId || n.id) !== historyEntry.data.nodeId)
      break
      
    case 'nodeDeleted':
      // Re-add the deleted node
      graphState.nodes.push(historyEntry.data.nodeData)
      break
      
    case 'nodeUpdated':
      // Restore previous node data
      const nodeIndex = graphState.nodes.findIndex(n => (n.nodeId || n.id) === historyEntry.data.nodeId)
      if (nodeIndex !== -1) {
        graphState.nodes[nodeIndex] = historyEntry.data.previousData
      }
      break
      
    // Similar implementations for edge operations and bulk operations...
    default:
      console.warn('Unknown history entry type:', historyEntry.type)
  }
}

// Export actions and reducer
export const {
  initializeGraph,
  destroyGraph,
  setSelection,
  clearSelection,
  setLayout,
  setZoom,
  setPan,
  addNode,
  updateNode,
  deleteNode,
  addEdge,
  updateEdge,
  deleteEdge,
  setFilters,
  clearFilters,
  setLoading,
  setError,
  clearError,
  undo,
  redo,
  bulkUpdateNodes,
  bulkUpdateEdges
} = graphViewerSlice.actions

export default graphViewerSlice.reducer
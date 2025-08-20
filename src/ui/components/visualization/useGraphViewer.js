/**
 * useGraphViewer - Custom React hook for managing graph state and business logic
 * This hook integrates with Redux, handles events, and manages the Cytoscape lifecycle.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GraphViewerService } from './GraphViewerService.js'
import { GRAPH_VIEWER_EVENTS } from './GraphViewerInterface.js'

/**
 * Redux action types for graph viewer state
 * (These would be defined in your Redux slice)
 */
const GRAPH_ACTIONS = {
  SET_SELECTION: 'graphViewer/setSelection',
  SET_LAYOUT: 'graphViewer/setLayout',
  SET_ZOOM: 'graphViewer/setZoom',
  SET_PAN: 'graphViewer/setPan',
  ADD_NODE: 'graphViewer/addNode',
  UPDATE_NODE: 'graphViewer/updateNode',
  DELETE_NODE: 'graphViewer/deleteNode',
  ADD_EDGE: 'graphViewer/addEdge',
  UPDATE_EDGE: 'graphViewer/updateEdge',
  DELETE_EDGE: 'graphViewer/deleteEdge',
  SET_FILTERS: 'graphViewer/setFilters',
  SET_ERROR: 'graphViewer/setError',
  SET_LOADING: 'graphViewer/setLoading'
}

/**
 * Custom hook for managing GraphViewer state and interactions
 */
export const useGraphViewer = (options = {}) => {
  const {
    graphId = 'default',
    initialNodes = [],
    initialEdges = [],
    config = {},
    userPermissions = 'viewer',
    onDataChange = null,
    onSelectionChange = null,
    onError = null
  } = options

  // Redux integration
  const dispatch = useDispatch()
  const graphState = useSelector(state => state.graphViewer?.[graphId])
  
  // Initialize Redux state if it doesn't exist
  useEffect(() => {
    if (!graphState) {
      dispatch({
        type: 'graphViewer/initializeGraph',
        payload: {
          graphId,
          initialNodes,
          initialEdges
        }
      })
    }
  }, [graphState, graphId, initialNodes, initialEdges, dispatch])
  
  // Use Redux state or fallback to initial values
  const currentState = graphState || {
    nodes: initialNodes,
    edges: initialEdges,
    selection: { selectedNodes: [], selectedEdges: [], lastSelected: null },
    layout: config.layout || 'dagre',
    zoom: 1,
    pan: { x: 0, y: 0 },
    filters: {},
    loading: false,
    error: null
  }

  // Local state
  const [cytoscapeInstance, setCytoscapeInstance] = useState(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    nodeCount: 0,
    edgeCount: 0
  })
  const [lastEvent, setLastEvent] = useState(null)

  // Refs
  const containerRef = useRef(null)
  const eventHandlersRef = useRef({})

  // Memoized filtered data
  const filteredData = useMemo(() => {
    if (!currentState.nodes || !currentState.edges) {
      return { nodes: [], edges: [] }
    }
    return GraphViewerService.applyFilters(
      currentState.nodes,
      currentState.edges,
      currentState.filters
    )
  }, [currentState.nodes, currentState.edges, currentState.filters])

  // Default configuration
  const defaultConfig = {
    layout: 'dagre',
    enableZoom: true,
    enablePan: true,
    enableSelection: true,
    selectionMode: 'multiple',
    showLabels: true,
    styling: {},
    ...config
  }

  /**
   * Initialize Cytoscape instance
   */
  const initializeCytoscape = useCallback((container) => {
    if (!container || isInitialized) return

    const startTime = performance.now()

    try {
      // Create mutable copies to avoid read-only property errors
      const mutableNodes = filteredData.nodes.map(node => ({ ...node }))
      const mutableEdges = filteredData.edges.map(edge => ({ ...edge }))
      
      const instance = GraphViewerService.initializeCytoscape(
        container,
        mutableNodes,
        mutableEdges,
        defaultConfig
      )

      // Setup event listeners AFTER instance is fully initialized
      setupCytoscapeEvents(instance)

      setCytoscapeInstance(instance)
      setIsInitialized(true)

      const renderTime = performance.now() - startTime
      setPerformanceMetrics({
        renderTime,
        nodeCount: filteredData.nodes.length,
        edgeCount: filteredData.edges.length
      })

    } catch (error) {
      console.error('Failed to initialize Cytoscape:', error)
      dispatch({ type: GRAPH_ACTIONS.SET_ERROR, payload: { graphId, error: error.message } })
      if (onError) onError(error)
    }
  }, [filteredData, defaultConfig, isInitialized, graphId, dispatch, onError])

  /**
   * Setup Cytoscape event listeners
   */
  const setupCytoscapeEvents = useCallback((instance) => {
    // Node selection events
    instance.on('select', 'node', (event) => {
      const node = event.target
      const nodeId = node.id()
      const nodeData = node.data('nodeData')
      
      handleEvent(GRAPH_VIEWER_EVENTS.NODE_SELECT, {
        nodeId,
        nodeData,
        selectedNodes: instance.nodes(':selected').map(n => n.id()),
        isMultiSelect: instance.nodes(':selected').length > 1
      })
    })

    instance.on('unselect', 'node', (event) => {
      const node = event.target
      const nodeId = node.id()
      
      handleEvent(GRAPH_VIEWER_EVENTS.NODE_DESELECT, {
        nodeId,
        selectedNodes: instance.nodes(':selected').map(n => n.id())
      })
    })

    // Edge selection events
    instance.on('select', 'edge', (event) => {
      const edge = event.target
      const edgeId = edge.id()
      const edgeData = edge.data('edgeData')
      
      handleEvent(GRAPH_VIEWER_EVENTS.EDGE_SELECT, {
        edgeId,
        edgeData,
        sourceNodeId: edge.source().id(),
        targetNodeId: edge.target().id(),
        selectedEdges: instance.edges(':selected').map(e => e.id())
      })
    })

    instance.on('unselect', 'edge', (event) => {
      const edge = event.target
      const edgeId = edge.id()
      
      handleEvent(GRAPH_VIEWER_EVENTS.EDGE_DESELECT, {
        edgeId,
        selectedEdges: instance.edges(':selected').map(e => e.id())
      })
    })

    // Hover events
    instance.on('mouseover', 'node', (event) => {
      const node = event.target
      handleEvent(GRAPH_VIEWER_EVENTS.NODE_HOVER, {
        nodeId: node.id(),
        nodeData: node.data('nodeData')
      })
    })

    instance.on('mouseover', 'edge', (event) => {
      const edge = event.target
      handleEvent(GRAPH_VIEWER_EVENTS.EDGE_HOVER, {
        edgeId: edge.id(),
        edgeData: edge.data('edgeData')
      })
    })

    // Double-click events
    instance.on('dbltap', 'node', (event) => {
      const node = event.target
      handleEvent(GRAPH_VIEWER_EVENTS.NODE_DOUBLE_CLICK, {
        nodeId: node.id(),
        nodeData: node.data('nodeData')
      })
    })

    // Background click - handle Ctrl+click for creating nodes
    instance.on('tap', (event) => {
      if (event.target === instance) {
        const position = event.position || event.cyPosition
        
        // Check for Ctrl+click to create new node
        if (event.originalEvent && event.originalEvent.ctrlKey) {
          if (GraphViewerService.checkPermission('create', userPermissions)) {
            handleEvent('createNode', { position })
          }
        } else {
          handleEvent(GRAPH_VIEWER_EVENTS.BACKGROUND_CLICK, { position })
        }
      }
    })

    // Layout events
    instance.on('layoutstop', (event) => {
      handleEvent(GRAPH_VIEWER_EVENTS.LAYOUT_COMPLETE, {
        layoutType: defaultConfig.layout,
        duration: Date.now() - (event.layout.startTime || Date.now())
      })
    })

    // Zoom and pan events - only track user-initiated changes after initialization
    let lastZoom = instance.zoom()
    let lastPan = instance.pan()
    let isInitializing = true
    
    // Set a timeout to mark initialization as complete
    setTimeout(() => {
      isInitializing = false
      // Update baseline values after layout completes
      lastZoom = instance.zoom()
      lastPan = instance.pan()
    }, 1000) // Give enough time for initial layout and fit operations
    
    instance.on('zoom', () => {
      if (isInitializing) return // Skip events during initialization
      
      const zoomLevel = instance.zoom()
      const zoomDifference = Math.abs(zoomLevel - lastZoom)
      
      // Only dispatch if zoom changed significantly (more than 5%)
      if (zoomDifference > lastZoom * 0.05) {
        dispatch({ type: GRAPH_ACTIONS.SET_ZOOM, payload: { graphId, zoom: zoomLevel } })
        
        handleEvent(GRAPH_VIEWER_EVENTS.ZOOM_CHANGE, {
          zoomLevel,
          previousZoom: lastZoom
        })
        
        lastZoom = zoomLevel
      }
    })

    instance.on('pan', () => {
      if (isInitializing) return // Skip events during initialization
      
      const panPosition = instance.pan()
      const panDistance = Math.sqrt(
        Math.pow(panPosition.x - lastPan.x, 2) + Math.pow(panPosition.y - lastPan.y, 2)
      )
      
      // Only dispatch if pan changed significantly (more than 10 pixels)
      if (panDistance > 10) {
        dispatch({ type: GRAPH_ACTIONS.SET_PAN, payload: { graphId, pan: panPosition } })
        
        handleEvent(GRAPH_VIEWER_EVENTS.PAN_CHANGE, {
          panPosition,
          previousPan: lastPan
        })
        
        lastPan = panPosition
      }
    })
  }, [defaultConfig, userPermissions, graphId, currentState.zoom, currentState.pan, dispatch])

  /**
   * Generic event handler that processes all graph events
   */
  const handleEvent = useCallback((eventType, eventData) => {
    // Store event in ref for external access
    eventHandlersRef.current[eventType] = eventData
    
    // Track the latest event for debugging display
    setLastEvent({
      type: eventType,
      data: eventData,
      timestamp: Date.now()
    })

    // Process events based on type
    switch (eventType) {
      case GRAPH_VIEWER_EVENTS.NODE_SELECT:
        const newSelection = {
          selectedNodes: eventData.selectedNodes,
          selectedEdges: currentState.selection.selectedEdges,
          lastSelected: eventData.nodeId
        }
        dispatch({ type: GRAPH_ACTIONS.SET_SELECTION, payload: { graphId, selection: newSelection } })
        if (onSelectionChange) onSelectionChange(newSelection)
        break

      case GRAPH_VIEWER_EVENTS.EDGE_SELECT:
        const edgeSelection = {
          selectedNodes: currentState.selection.selectedNodes,
          selectedEdges: eventData.selectedEdges,
          lastSelected: eventData.edgeId
        }
        dispatch({ type: GRAPH_ACTIONS.SET_SELECTION, payload: { graphId, selection: edgeSelection } })
        if (onSelectionChange) onSelectionChange(edgeSelection)
        break

      case GRAPH_VIEWER_EVENTS.BACKGROUND_CLICK:
        // Clear selection on background click
        clearSelection()
        break

      case 'createNode':
        // Handle Ctrl+click node creation
        createNodeAtPosition(eventData.position)
        break

      case 'zoom':
        // Handle toolbar zoom actions
        if (eventData.action === 'zoomIn') {
          const newZoom = Math.min((currentState.zoom || 1) * eventData.factor, 5)
          zoomTo(newZoom)
        } else if (eventData.action === 'zoomOut') {
          const newZoom = Math.max((currentState.zoom || 1) * eventData.factor, 0.1)
          zoomTo(newZoom)
        }
        break

      case 'layout':
        // Handle layout actions
        if (eventData.action === 'fit') {
          fitGraph()
        } else if (eventData.action === 'change') {
          setLayout(eventData.layoutType, true) // Force layout when user explicitly selects it
        }
        break

      case 'refresh':
        // Refresh the graph layout - force reapplication
        setLayout(currentState.layout, true)
        break

      default:
        // Forward other events to external handlers if provided
        break
    }
  }, [currentState.selection, currentState.zoom, currentState.layout, graphId, dispatch, onSelectionChange, cytoscapeInstance, filteredData])

  /**
   * Control methods for external use
   */
  const selectNode = useCallback((nodeId) => {
    if (cytoscapeInstance) {
      cytoscapeInstance.getElementById(nodeId).select()
    }
  }, [cytoscapeInstance])

  const selectEdge = useCallback((edgeId) => {
    if (cytoscapeInstance) {
      cytoscapeInstance.getElementById(edgeId).select()
    }
  }, [cytoscapeInstance])

  const clearSelection = useCallback(() => {
    if (cytoscapeInstance) {
      cytoscapeInstance.elements().unselect()
      const emptySelection = { selectedNodes: [], selectedEdges: [], lastSelected: null }
      dispatch({ type: GRAPH_ACTIONS.SET_SELECTION, payload: { graphId, selection: emptySelection } })
      if (onSelectionChange) onSelectionChange(emptySelection)
    }
  }, [cytoscapeInstance, graphId, dispatch, onSelectionChange])

  const fitGraph = useCallback(() => {
    if (cytoscapeInstance) {
      cytoscapeInstance.fit()
    }
  }, [cytoscapeInstance])

  const setLayout = useCallback((layoutType, forceLayout = false) => {
    if (cytoscapeInstance) {
      const layoutConfig = GraphViewerService.calculateLayout(
        filteredData.nodes,
        filteredData.edges,
        layoutType
      )
      
      // Only apply layout if forced or if nodes don't have user positions
      if (forceLayout || cytoscapeInstance.nodes().length <= 4) {
        cytoscapeInstance.layout(layoutConfig).run()
      }
      
      dispatch({ type: GRAPH_ACTIONS.SET_LAYOUT, payload: { graphId, layout: layoutType } })
    }
  }, [cytoscapeInstance, filteredData, graphId, dispatch])

  const zoomTo = useCallback((zoomLevel) => {
    if (cytoscapeInstance) {
      cytoscapeInstance.zoom(zoomLevel)
      cytoscapeInstance.center()
    }
  }, [cytoscapeInstance])

  /**
   * Data operations (permission-gated)
   */
  const addNode = useCallback(async (nodeData) => {
    if (!GraphViewerService.checkPermission('create', userPermissions)) {
      throw new Error('Insufficient permissions to create nodes')
    }

    try {
      dispatch({ type: GRAPH_ACTIONS.SET_LOADING, payload: { graphId, loading: true } })
      
      // Here you would typically call your backend service
      // const newNode = await NodeService.createNode(nodeData)
      
      // For now, just add to local state
      const newNode = { ...nodeData, nodeId: nodeData.nodeId || `temp_${Date.now()}` }
      dispatch({ type: GRAPH_ACTIONS.ADD_NODE, payload: { graphId, node: newNode } })
      
      // Add to Cytoscape if initialized
      if (cytoscapeInstance) {
        const cytoscapeNode = GraphViewerService.transformNodeData(newNode)
        cytoscapeInstance.add(cytoscapeNode)
        
        // Don't auto-layout - let user position nodes manually
        // Users can use Refresh button if they want to reapply layout
      }

      if (onDataChange) onDataChange({ type: 'nodeAdded', data: newNode })
      return newNode
      
    } catch (error) {
      dispatch({ type: GRAPH_ACTIONS.SET_ERROR, payload: { graphId, error: error.message } })
      if (onError) onError(error)
      throw error
    } finally {
      dispatch({ type: GRAPH_ACTIONS.SET_LOADING, payload: { graphId, loading: false } })
    }
  }, [userPermissions, cytoscapeInstance, graphId, currentState.layout, filteredData, dispatch, onDataChange, onError])

  const updateNode = useCallback(async (nodeId, updates) => {
    if (!GraphViewerService.checkPermission('edit', userPermissions)) {
      throw new Error('Insufficient permissions to edit nodes')
    }

    try {
      dispatch({ type: GRAPH_ACTIONS.SET_LOADING, payload: { graphId, loading: true } })
      
      // Backend service call would go here
      // const updatedNode = await NodeService.updateNode(nodeId, updates)
      
      // Update local state
      dispatch({ type: GRAPH_ACTIONS.UPDATE_NODE, payload: { graphId, nodeId, updates } })
      
      // Update Cytoscape if initialized
      if (cytoscapeInstance) {
        const cytoscapeNode = cytoscapeInstance.getElementById(nodeId)
        if (cytoscapeNode.length > 0) {
          cytoscapeNode.data(updates)
        }
      }

      if (onDataChange) onDataChange({ type: 'nodeUpdated', data: { nodeId, updates } })
      
    } catch (error) {
      dispatch({ type: GRAPH_ACTIONS.SET_ERROR, payload: { graphId, error: error.message } })
      if (onError) onError(error)
    } finally {
      dispatch({ type: GRAPH_ACTIONS.SET_LOADING, payload: { graphId, loading: false } })
    }
  }, [userPermissions, cytoscapeInstance, graphId, dispatch, onDataChange, onError])

  const deleteNode = useCallback(async (nodeId) => {
    if (!GraphViewerService.checkPermission('delete', userPermissions)) {
      throw new Error('Insufficient permissions to delete nodes')
    }

    try {
      dispatch({ type: GRAPH_ACTIONS.SET_LOADING, payload: { graphId, loading: true } })
      
      // Backend service call would go here
      // await NodeService.deleteNode(nodeId)
      
      // Remove from local state
      dispatch({ type: GRAPH_ACTIONS.DELETE_NODE, payload: { graphId, nodeId } })
      
      // Remove from Cytoscape if initialized
      if (cytoscapeInstance) {
        cytoscapeInstance.getElementById(nodeId).remove()
      }

      if (onDataChange) onDataChange({ type: 'nodeDeleted', data: { nodeId } })
      
    } catch (error) {
      dispatch({ type: GRAPH_ACTIONS.SET_ERROR, payload: { graphId, error: error.message } })
      if (onError) onError(error)
    } finally {
      dispatch({ type: GRAPH_ACTIONS.SET_LOADING, payload: { graphId, loading: false } })
    }
  }, [userPermissions, cytoscapeInstance, graphId, dispatch, onDataChange, onError])

  // Similar methods for edges...
  const addEdge = useCallback(async (edgeData) => {
    if (!GraphViewerService.checkPermission('create', userPermissions)) {
      throw new Error('Insufficient permissions to create relationships')
    }
    // Implementation similar to addNode...
  }, [userPermissions, cytoscapeInstance, graphId, dispatch, onDataChange, onError])

  const updateEdge = useCallback(async (edgeId, updates) => {
    if (!GraphViewerService.checkPermission('edit', userPermissions)) {
      throw new Error('Insufficient permissions to edit relationships')
    }
    // Implementation similar to updateNode...
  }, [userPermissions, cytoscapeInstance, graphId, dispatch, onDataChange, onError])

  const deleteEdge = useCallback(async (edgeId) => {
    if (!GraphViewerService.checkPermission('delete', userPermissions)) {
      throw new Error('Insufficient permissions to delete relationships')
    }
    // Implementation similar to deleteNode...
  }, [userPermissions, cytoscapeInstance, graphId, dispatch, onDataChange, onError])

  /**
   * Create a new node at the specified position
   */
  const createNodeAtPosition = useCallback(async (position) => {
    if (!GraphViewerService.checkPermission('create', userPermissions)) {
      return
    }

    const nodeId = `temp_${Date.now()}`
    const newNodeData = {
      nodeId,
      title: `New Node ${Date.now()}`,
      assetClass: 'GenericAsset',
      systems: ['Demo'],
      groups: [],
      properties: {
        created: new Date().toISOString(),
        x: position.x,
        y: position.y
      }
    }

    try {
      const createdNode = await addNode(newNodeData)
      
      // Position the new node at click location after a short delay
      setTimeout(() => {
        if (cytoscapeInstance) {
          const node = cytoscapeInstance.getElementById(createdNode.nodeId)
          if (node.length > 0) {
            // Create a mutable position object to avoid read-only errors
            node.position({ x: position.x, y: position.y })
          }
        }
      }, 100)
    } catch (error) {
      console.error('Failed to create node:', error)
    }
  }, [userPermissions, addNode, cytoscapeInstance])

  /**
   * Update Cytoscape when data changes
   */
  useEffect(() => {
    if (cytoscapeInstance && isInitialized) {
      // Store current positions before updating
      const nodePositions = {}
      cytoscapeInstance.nodes().forEach(node => {
        nodePositions[node.id()] = node.position()
      })

      // Remove all elements
      cytoscapeInstance.elements().remove()
      
      // Add updated elements
      const elements = [
        ...filteredData.nodes.map(node => GraphViewerService.transformNodeData(node)),
        ...filteredData.edges.map(edge => GraphViewerService.transformEdgeData(edge))
      ]
      
      if (elements.length > 0) {
        cytoscapeInstance.add(elements)
        
        // Restore positions for existing nodes
        cytoscapeInstance.nodes().forEach(node => {
          if (nodePositions[node.id()]) {
            node.position(nodePositions[node.id()])
          }
        })
        
        // Only apply layout for new nodes (significant changes)
        const isSignificantChange = elements.length !== performanceMetrics.nodeCount + performanceMetrics.edgeCount
        if (isSignificantChange && cytoscapeInstance.nodes().length <= 4) {
          // Only auto-layout for small graphs, let users manage larger ones manually
          setLayout(currentState.layout)
        }
      }
    }
  }, [filteredData, cytoscapeInstance, isInitialized, currentState.layout, performanceMetrics])

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (cytoscapeInstance) {
        cytoscapeInstance.destroy()
        setCytoscapeInstance(null)
        setIsInitialized(false)
      }
    }
  }, [cytoscapeInstance])

  // Return hook interface
  return {
    // Data for GraphViewer component
    nodes: filteredData.nodes,
    edges: filteredData.edges,
    config: defaultConfig,
    selection: currentState.selection,
    loading: currentState.loading,
    error: currentState.error,
    
    // Event handler
    handleEvent,
    
    // Control methods
    selectNode,
    selectEdge,
    clearSelection,
    fitGraph,
    setLayout,
    zoomTo,
    
    // Data operations
    addNode,
    updateNode,
    deleteNode,
    addEdge,
    updateEdge,
    deleteEdge,
    
    // Initialization
    initializeCytoscape,
    cytoscapeInstance,
    
    // Metrics and debugging
    performanceMetrics: {
      ...performanceMetrics,
      ...GraphViewerService.calculateMetrics(filteredData.nodes, filteredData.edges)
    },
    lastEvent,
    
    // Utilities
    exportGraph: (format) => {
      if (cytoscapeInstance) {
        return GraphViewerService.exportGraph(cytoscapeInstance, format)
      }
      return null
    }
  }
}
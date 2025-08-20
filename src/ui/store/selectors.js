/**
 * Redux selectors for GraphViewer state
 * Provides optimized access to graph data with memoization
 */

import { createSelector } from '@reduxjs/toolkit'
import { GraphViewerService } from '../components/visualization/GraphViewerService.js'

/**
 * Base selectors for accessing graph state
 */
export const getGraphViewerState = (state) => state.graphViewer || {}

export const getGraphState = (state, graphId) => 
  state.graphViewer?.[graphId] || null

/**
 * Node selectors
 */
export const getNodes = createSelector(
  [getGraphState],
  (graphState) => graphState?.nodes || []
)

export const getFilteredNodes = createSelector(
  [getNodes, (state, graphId) => getGraphState(state, graphId)?.filters],
  (nodes, filters) => {
    if (!filters) return nodes
    const filteredData = GraphViewerService.applyFilters(nodes, [], filters)
    return filteredData.nodes
  }
)

export const getNodeById = createSelector(
  [getNodes, (state, graphId, nodeId) => nodeId],
  (nodes, nodeId) => nodes.find(node => (node.nodeId || node.id) === nodeId)
)

export const getSelectedNodes = createSelector(
  [getGraphState],
  (graphState) => graphState?.selection?.selectedNodes || []
)

export const getSelectedNodeData = createSelector(
  [getNodes, getSelectedNodes],
  (nodes, selectedNodeIds) => 
    nodes.filter(node => selectedNodeIds.includes(node.nodeId || node.id))
)

/**
 * Edge selectors
 */
export const getEdges = createSelector(
  [getGraphState],
  (graphState) => graphState?.edges || []
)

export const getFilteredEdges = createSelector(
  [getEdges, getFilteredNodes],
  (edges, filteredNodes) => {
    const nodeIds = new Set(filteredNodes.map(node => node.nodeId || node.id))
    return edges.filter(edge =>
      nodeIds.has(edge.fromId || edge.source) && nodeIds.has(edge.toId || edge.target)
    )
  }
)

export const getEdgeById = createSelector(
  [getEdges, (state, graphId, edgeId) => edgeId],
  (edges, edgeId) => edges.find(edge => (edge.relationshipId || edge.id) === edgeId)
)

export const getSelectedEdges = createSelector(
  [getGraphState],
  (graphState) => graphState?.selection?.selectedEdges || []
)

export const getSelectedEdgeData = createSelector(
  [getEdges, getSelectedEdges],
  (edges, selectedEdgeIds) => 
    edges.filter(edge => selectedEdgeIds.includes(edge.relationshipId || edge.id))
)

/**
 * Selection selectors
 */
export const getSelection = createSelector(
  [getGraphState],
  (graphState) => graphState?.selection || { selectedNodes: [], selectedEdges: [], lastSelected: null }
)

export const getLastSelected = createSelector(
  [getSelection],
  (selection) => selection.lastSelected
)

export const getSelectionCount = createSelector(
  [getSelection],
  (selection) => selection.selectedNodes.length + selection.selectedEdges.length
)

export const hasSelection = createSelector(
  [getSelectionCount],
  (count) => count > 0
)

/**
 * Layout and view selectors
 */
export const getLayout = createSelector(
  [getGraphState],
  (graphState) => graphState?.layout || 'dagre'
)

export const getZoom = createSelector(
  [getGraphState],
  (graphState) => graphState?.zoom || 1
)

export const getPan = createSelector(
  [getGraphState],
  (graphState) => graphState?.pan || { x: 0, y: 0 }
)

/**
 * Filter selectors
 */
export const getFilters = createSelector(
  [getGraphState],
  (graphState) => graphState?.filters || {
    assetTypes: [],
    systems: [],
    groups: [],
    searchQuery: ''
  }
)

export const getActiveFilters = createSelector(
  [getFilters],
  (filters) => {
    const activeFilters = {}
    
    if (filters.assetTypes && filters.assetTypes.length > 0) {
      activeFilters.assetTypes = filters.assetTypes
    }
    
    if (filters.systems && filters.systems.length > 0) {
      activeFilters.systems = filters.systems
    }
    
    if (filters.groups && filters.groups.length > 0) {
      activeFilters.groups = filters.groups
    }
    
    if (filters.searchQuery && filters.searchQuery.trim()) {
      activeFilters.searchQuery = filters.searchQuery.trim()
    }
    
    return activeFilters
  }
)

export const hasActiveFilters = createSelector(
  [getActiveFilters],
  (activeFilters) => Object.keys(activeFilters).length > 0
)

/**
 * Loading and error selectors
 */
export const isLoading = createSelector(
  [getGraphState],
  (graphState) => graphState?.loading || false
)

export const getError = createSelector(
  [getGraphState],
  (graphState) => graphState?.error || null
)

export const hasError = createSelector(
  [getError],
  (error) => error !== null
)

/**
 * History selectors for undo/redo functionality
 */
export const getHistory = createSelector(
  [getGraphState],
  (graphState) => graphState?.history || { past: [], present: null, future: [] }
)

export const canUndo = createSelector(
  [getHistory],
  (history) => history.past.length > 0
)

export const canRedo = createSelector(
  [getHistory],
  (history) => history.future.length > 0
)

export const getLastAction = createSelector(
  [getHistory],
  (history) => history.present
)

/**
 * Metrics and statistics selectors
 */
export const getGraphMetrics = createSelector(
  [getFilteredNodes, getFilteredEdges],
  (nodes, edges) => GraphViewerService.calculateMetrics(nodes, edges)
)

export const getNodeCount = createSelector(
  [getFilteredNodes],
  (nodes) => nodes.length
)

export const getEdgeCount = createSelector(
  [getFilteredEdges],
  (edges) => edges.length
)

export const getGraphDensity = createSelector(
  [getGraphMetrics],
  (metrics) => metrics.density
)

export const isGraphConnected = createSelector(
  [getGraphMetrics],
  (metrics) => metrics.isConnected
)

/**
 * Asset type distribution selectors
 */
export const getAssetTypeDistribution = createSelector(
  [getFilteredNodes],
  (nodes) => {
    const distribution = {}
    nodes.forEach(node => {
      const assetType = GraphViewerService.getNodeType(node)
      distribution[assetType] = (distribution[assetType] || 0) + 1
    })
    return distribution
  }
)

export const getUniqueAssetTypes = createSelector(
  [getAssetTypeDistribution],
  (distribution) => Object.keys(distribution).sort()
)

/**
 * System and group selectors
 */
export const getUniqueSystems = createSelector(
  [getNodes],
  (nodes) => {
    const systems = new Set()
    nodes.forEach(node => {
      if (node.systems) {
        node.systems.forEach(system => systems.add(system))
      }
    })
    return Array.from(systems).sort()
  }
)

export const getUniqueGroups = createSelector(
  [getNodes],
  (nodes) => {
    const groups = new Set()
    nodes.forEach(node => {
      if (node.groups) {
        node.groups.forEach(group => groups.add(group))
      }
    })
    return Array.from(groups).sort()
  }
)

export const getNodesBySystem = createSelector(
  [getNodes, (state, graphId, systemName) => systemName],
  (nodes, systemName) => 
    nodes.filter(node => node.systems && node.systems.includes(systemName))
)

export const getNodesByGroup = createSelector(
  [getNodes, (state, graphId, groupName) => groupName],
  (nodes, groupName) => 
    nodes.filter(node => node.groups && node.groups.includes(groupName))
)

/**
 * Relationship type selectors
 */
export const getRelationshipTypeDistribution = createSelector(
  [getFilteredEdges],
  (edges) => {
    const distribution = {}
    edges.forEach(edge => {
      const relType = edge.relationshipType || edge.type || 'unknown'
      distribution[relType] = (distribution[relType] || 0) + 1
    })
    return distribution
  }
)

export const getUniqueRelationshipTypes = createSelector(
  [getRelationshipTypeDistribution],
  (distribution) => Object.keys(distribution).sort()
)

/**
 * Performance selectors
 */
export const getPerformanceMetrics = createSelector(
  [getGraphMetrics, getNodeCount, getEdgeCount],
  (metrics, nodeCount, edgeCount) => ({
    ...metrics,
    renderTime: 0, // This would be updated from the component
    performance: nodeCount > 1000 ? 'poor' : nodeCount > 500 ? 'fair' : 'good'
  })
)

/**
 * Validation selectors
 */
export const hasOrphanedNodes = createSelector(
  [getFilteredNodes, getFilteredEdges],
  (nodes, edges) => {
    const connectedNodeIds = new Set()
    edges.forEach(edge => {
      connectedNodeIds.add(edge.fromId || edge.source)
      connectedNodeIds.add(edge.toId || edge.target)
    })
    
    return nodes.some(node => !connectedNodeIds.has(node.nodeId || node.id))
  }
)

export const getOrphanedNodes = createSelector(
  [getFilteredNodes, getFilteredEdges],
  (nodes, edges) => {
    const connectedNodeIds = new Set()
    edges.forEach(edge => {
      connectedNodeIds.add(edge.fromId || edge.source)
      connectedNodeIds.add(edge.toId || edge.target)
    })
    
    return nodes.filter(node => !connectedNodeIds.has(node.nodeId || node.id))
  }
)

/**
 * Combined selectors for component consumption
 */
export const getGraphViewerData = createSelector(
  [
    getFilteredNodes,
    getFilteredEdges,
    getSelection,
    getLayout,
    isLoading,
    getError,
    getGraphMetrics
  ],
  (nodes, edges, selection, layout, loading, error, metrics) => ({
    nodes,
    edges,
    selection,
    layout,
    loading,
    error,
    metrics
  })
)
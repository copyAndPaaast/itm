/**
 * GraphController - Business Logic Container for Graph Operations
 * 
 * Separates business logic from layout (MainLayout) and presentation (GraphViewer).
 * Coordinates between Redux state, Neo4j services, and GraphViewerMapper.
 * 
 * Responsibilities:
 * - Handle graph events (create_node, create_edge, etc.)
 * - Coordinate Neo4j persistence via NodeActions/EdgeActions  
 * - Leverage GraphViewerMapper for data transformation
 * - Use dedicated selectors from /src/selectors/
 */

import React, { useMemo, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { GraphViewerMapper } from './GraphViewerMapper.js'
import { createNodeAction, updateNodePositionAction } from '../../../NodeModule/node/NodeActions.js'
import { setError } from '../../../store/statusSlice.js'
import { 
  selectCurrentSystemId, 
  selectCurrentSystem,
  selectGroupVisibility,
  selectSystemCollapsed 
} from '../../../store/systemSlice.js'
import { getNodes, getEdges } from '../../../store/selectors.js'
import GraphViewer from './GraphViewer.jsx'

/**
 * GraphController component - handles all graph business logic
 */
const GraphController = ({ 
  // Layout props passed down from MainLayout
  currentSystemId: propSystemId,
  currentSystem: propSystem,
  isEditingSystem,
  userPermissions = 'viewer',
  // GraphViewer presentation props
  title,
  nodeCount,
  edgeCount,
  availableGroups,
  availableSystems,
  systemViewMode,
  onGroupToggle,
  onSystemToggle,
  onCytoscapeReady,
  onNodesMove,
  ...otherProps
}) => {
  const dispatch = useDispatch()
  
  // Get data from Redux (prefer props but fallback to selectors)
  const currentSystemId = propSystemId || useSelector(selectCurrentSystemId)
  const currentSystem = propSystem || useSelector(selectCurrentSystem)
  const groupVisibility = useSelector(selectGroupVisibility)
  const systemCollapsed = useSelector(selectSystemCollapsed)
  
  // Get graph data using dedicated selectors
  const nodes = useSelector(state => currentSystemId ? getNodes(state, currentSystemId) : [])
  const edges = useSelector(state => currentSystemId ? getEdges(state, currentSystemId) : [])

  // Transform data using existing GraphViewerMapper (no duplication!)
  const elements = useMemo(() => {
    if (!currentSystemId || (!nodes.length && !edges.length)) {
      console.log('🎛️ GraphController: No elements to map - returning empty array')
      return []
    }
    
    // Reuse existing GraphViewerMapper - no duplication
    const mapper = new GraphViewerMapper()
    const mappedElements = mapper.mapToElements(nodes, edges, {
      groupVisibility,
      systemCollapsed
    })
    
    console.log('🎛️ GraphController: Mapped', nodes.length, 'nodes and', edges.length, 'edges to', mappedElements.length, 'elements')
    return mappedElements
  }, [nodes, edges, currentSystemId, groupVisibility, systemCollapsed])

  /**
   * Handle node creation with Neo4j persistence
   */
  const handleCreateNode = useCallback((eventData) => {
    console.log('🎛️ GraphController: Handling node creation')
    console.log('📝 Node data:', eventData.nodeData)
    
    if (!currentSystemId || !currentSystem) {
      dispatch(setError('Cannot create node: No system selected'))
      return
    }
    
    // Use existing NodeActions - no duplication
    dispatch(createNodeAction({
      assetClassId: eventData.nodeData.assetClass || 'Default',
      properties: eventData.nodeData.properties || {},
      title: eventData.nodeData.label || 'New Node',
      systems: [currentSystem.systemLabel], // Use systemLabel for Neo4j consistency
      position: eventData.position,
      systemId: currentSystemId
    }))
  }, [currentSystemId, currentSystem, dispatch])

  /**
   * Handle node position updates with Neo4j persistence
   */
  const handleNodeMove = useCallback((nodeId, position) => {
    if (!currentSystemId) return
    
    // Use existing NodeActions - no duplication
    dispatch(updateNodePositionAction({
      nodeId,
      systemId: currentSystemId,
      position
    }))
  }, [currentSystemId, dispatch])

  /**
   * Handle edge creation (placeholder for future EdgeActions)
   */
  const handleCreateEdge = useCallback((eventData) => {
    console.log('🎛️ GraphController: Edge creation not yet implemented with Neo4j persistence')
    console.log('📝 Edge data:', eventData)
    
    // TODO: Implement with EdgeActions when available - no duplication
  }, [currentSystemId, dispatch])

  /**
   * Central event handler - routes events to appropriate handlers
   */
  const handleGraphEvent = useCallback((eventType, eventData) => {
    console.log('🎛️ GraphController: Handling event', eventType, eventData)
    
    switch (eventType) {
      case 'create_node':
        handleCreateNode(eventData)
        break
        
      case 'create_edge':
        handleCreateEdge(eventData)
        break
        
      case 'node_move':
        if (eventData.nodeId && eventData.position) {
          handleNodeMove(eventData.nodeId, eventData.position)
        }
        break
        
      default:
        // Forward other events to parent (MainLayout for UI concerns)
        console.log('🎛️ GraphController: Forwarding event to parent:', eventType)
        break
    }
  }, [handleCreateNode, handleCreateEdge, handleNodeMove])

  /**
   * Wrapper for onNodesMove - leverages existing hull update logic
   */
  const handleNodesMove = useCallback(() => {
    // Call existing onNodesMove handler - no duplication
    if (onNodesMove) {
      onNodesMove()
    }
  }, [onNodesMove])

  return (
    <GraphViewer
      elements={elements}
      onEvent={handleGraphEvent}
      onCytoscapeReady={onCytoscapeReady}
      onNodesMove={handleNodesMove}
      userPermissions={userPermissions}
      
      // System context props
      currentSystemId={currentSystemId}
      currentSystem={currentSystem}
      isEditingSystem={isEditingSystem}
      title={title}
      nodeCount={nodeCount}
      edgeCount={edgeCount}
      
      // Group and system collapse props  
      availableGroups={availableGroups}
      availableSystems={availableSystems}
      groupVisibility={groupVisibility}
      systemCollapsed={systemCollapsed}
      onGroupToggle={onGroupToggle}
      onSystemToggle={onSystemToggle}
      systemViewMode={systemViewMode}
      
      {...otherProps}
    />
  )
}

export default GraphController
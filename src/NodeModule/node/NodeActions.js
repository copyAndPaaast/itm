/**
 * NodeActions - Redux actions for Node operations
 * 
 * Integrates NodeService with Redux state management for consistent
 * data flow between Neo4j database and UI state.
 */

import { NodeService } from './NodeService.js'
import { addNode, updateNode, removeNode } from '../../store/graphViewerSlice.js'
import { executeWithStatus } from '../../store/statusSlice.js'

/**
 * Create a new node and persist to Neo4j + Redux
 * 
 * @param {Object} nodeData - Node creation data
 * @param {string} nodeData.assetClassId - AssetClass ID or name
 * @param {Object} nodeData.properties - Node properties
 * @param {string} nodeData.title - Node title/label
 * @param {string[]} nodeData.systems - System labels for this node
 * @param {Object} nodeData.position - Position data {x, y}
 * @param {string} nodeData.systemId - Current system ID for Redux state
 * @returns {Function} Redux thunk
 */
export const createNodeAction = (nodeData) => {
  return executeWithStatus(
    'Creating node...',
    async (dispatch) => {
      const nodeService = new NodeService()
      
      // Create node in Neo4j
      const createdNode = await nodeService.createNode(
        nodeData.assetClassId,
        nodeData.properties,
        nodeData.title,
        nodeData.systems
      )
      
      // Convert NodeModel to plain object for Redux with position data
      const nodeForRedux = {
        nodeId: createdNode.nodeId,
        id: createdNode.nodeId,
        label: createdNode.title,
        title: createdNode.title,
        assetClass: createdNode.assetClass,
        type: mapAssetClassToType(createdNode.assetClass),
        properties: createdNode.properties,
        systems: nodeData.systems || [],
        groups: [], // Default empty groups
        position: nodeData.position || { x: 0, y: 0 },
        // Additional metadata from Neo4j
        labels: createdNode.labels,
        createdDate: createdNode.createdDate,
        isActive: createdNode.isActive
      }
      
      // Add to Redux graphViewer state
      if (nodeData.systemId) {
        dispatch(addNode({ 
          graphId: nodeData.systemId, 
          node: nodeForRedux 
        }))
      }
      
      return {
        success: true,
        node: nodeForRedux,
        neo4jNode: createdNode
      }
    },
    'Node created successfully'
  )
}

/**
 * Update an existing node in Neo4j + Redux
 * 
 * @param {Object} updateData - Node update data
 * @param {string} updateData.nodeId - Node ID to update
 * @param {string} updateData.systemId - System ID for Redux state
 * @param {Object} updateData.updates - Properties to update
 * @param {Object} updateData.position - New position if changed
 * @returns {Function} Redux thunk
 */
export const updateNodeAction = (updateData) => {
  return executeWithStatus(
    'Updating node...',
    async (dispatch) => {
      const nodeService = new NodeService()
      
      // Update node in Neo4j
      const updatedNode = await nodeService.updateNode(
        updateData.nodeId,
        updateData.updates
      )
      
      // Prepare updates for Redux
      const reduxUpdates = {
        ...updateData.updates,
        title: updatedNode.title,
        properties: updatedNode.properties,
        labels: updatedNode.labels
      }
      
      // Include position if provided
      if (updateData.position) {
        reduxUpdates.position = updateData.position
      }
      
      // Update Redux state
      if (updateData.systemId) {
        dispatch(updateNode({
          graphId: updateData.systemId,
          nodeId: updateData.nodeId,
          updates: reduxUpdates
        }))
      }
      
      return {
        success: true,
        node: updatedNode
      }
    },
    'Node updated successfully'
  )
}

/**
 * Delete a node from Neo4j + Redux
 * 
 * @param {Object} deleteData - Node deletion data
 * @param {string} deleteData.nodeId - Node ID to delete
 * @param {string} deleteData.systemId - System ID for Redux state
 * @returns {Function} Redux thunk
 */
export const deleteNodeAction = (deleteData) => {
  return executeWithStatus(
    'Deleting node...',
    async (dispatch) => {
      const nodeService = new NodeService()
      
      // Delete from Neo4j
      await nodeService.deleteNode(deleteData.nodeId)
      
      // Remove from Redux state
      if (deleteData.systemId) {
        dispatch(removeNode({
          graphId: deleteData.systemId,
          nodeId: deleteData.nodeId
        }))
      }
      
      return {
        success: true,
        deletedNodeId: deleteData.nodeId
      }
    },
    'Node deleted successfully'
  )
}

/**
 * Persist node position changes to Neo4j
 * Called when nodes are moved in the GraphViewer
 * 
 * @param {Object} positionData - Position update data
 * @param {string} positionData.nodeId - Node ID
 * @param {string} positionData.systemId - System ID for Redux state
 * @param {Object} positionData.position - New position {x, y}
 * @returns {Function} Redux thunk
 */
export const updateNodePositionAction = (positionData) => {
  return executeWithStatus(
    'Saving position...',
    async (dispatch) => {
      // Update position in Redux immediately for responsiveness
      if (positionData.systemId) {
        dispatch(updateNode({
          graphId: positionData.systemId,
          nodeId: positionData.nodeId,
          updates: { position: positionData.position }
        }))
      }
      
      // Persist to Neo4j (could be throttled/debounced in the future)
      const nodeService = new NodeService()
      await nodeService.updateNodePosition(
        positionData.nodeId,
        positionData.position
      )
      
      return {
        success: true,
        nodeId: positionData.nodeId,
        position: positionData.position
      }
    },
    'Position saved'
  )
}

/**
 * Map asset class to visual type for consistency with GraphViewerMapper
 */
function mapAssetClassToType(assetClass) {
  if (!assetClass) return 'default'
  
  const lowerClass = assetClass.toLowerCase()
  
  if (lowerClass.includes('server') || lowerClass.includes('web')) return 'server'
  if (lowerClass.includes('database') || lowerClass.includes('db')) return 'database' 
  if (lowerClass.includes('application') || lowerClass.includes('app')) return 'application'
  if (lowerClass.includes('network') || lowerClass.includes('device')) return 'network'
  
  return 'default'
}

/**
 * Helper action to sync Redux state with Neo4j data
 * Useful for ensuring consistency after external changes
 * 
 * @param {Object} syncData - Sync parameters
 * @param {string} syncData.systemId - System ID to sync
 * @param {string[]} syncData.nodeIds - Specific nodes to sync (optional)
 * @returns {Function} Redux thunk
 */
export const syncNodesWithNeo4jAction = (syncData) => {
  return executeWithStatus(
    'Syncing with database...',
    async (dispatch) => {
      const nodeService = new NodeService()
      
      // Load nodes from Neo4j
      const neo4jNodes = await nodeService.getAllNodesInSystem(syncData.systemId)
      
      // Convert to Redux format and update state
      const reduxNodes = neo4jNodes.map(node => ({
        nodeId: node.nodeId,
        id: node.nodeId,
        label: node.title,
        title: node.title,
        assetClass: node.assetClass,
        type: mapAssetClassToType(node.assetClass),
        properties: node.properties,
        systems: node.extractSystemLabels(),
        groups: [],
        position: node.position || { x: 0, y: 0 },
        labels: node.labels,
        createdDate: node.createdDate,
        isActive: node.isActive
      }))
      
      // Replace nodes in Redux state
      // This would require a new action in graphViewerSlice
      // dispatch(replaceNodes({ graphId: syncData.systemId, nodes: reduxNodes }))
      
      return {
        success: true,
        syncedCount: reduxNodes.length
      }
    },
    'Database sync complete'
  )
}
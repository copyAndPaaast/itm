/**
 * SystemActions - Redux action dispatchers for system operations
 * 
 * Provides high-level system operations that combine database persistence
 * with Redux state management. These actions should be used by UI components
 * rather than calling SystemService directly.
 */

import { SystemService } from './SystemService.js'
import { 
  addSystem, 
  setSystems, 
  setCurrentSystemId,
  setVisibleSystems,
  removeSystem,
  setLoading,
  setError,
  clearError,
  clearSystemFormData
} from '../store/systemSlice.js'

/**
 * Create a new system and update Redux store
 * @param {Object} systemData - System creation parameters
 * @param {string} systemData.systemName - Human-readable name
 * @param {string} systemData.systemLabel - Neo4j label
 * @param {string} systemData.description - System description
 * @param {Object} systemData.properties - Additional properties
 */
export const createSystemAction = (systemData) => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())

  try {
    const systemService = new SystemService()
    
    // Create system in database
    const createdSystem = await systemService.createSystem(systemData)
    
    // Convert SystemModel to plain object for Redux
    const systemPlainObject = {
      systemId: createdSystem.systemId,
      systemName: createdSystem.systemName,
      systemLabel: createdSystem.systemLabel,
      description: createdSystem.description,
      nodeCount: createdSystem.nodeCount,
      properties: createdSystem.properties,
      createdBy: createdSystem.createdBy,
      createdDate: createdSystem.createdDate,
      isActive: createdSystem.isActive
    }
    
    // Update Redux store
    dispatch(addSystem(systemPlainObject))
    dispatch(setCurrentSystemId(createdSystem.systemId))
    dispatch(setVisibleSystems([createdSystem.systemId]))
    dispatch(clearSystemFormData())
    
    return createdSystem
  } catch (error) {
    dispatch(setError({
      message: 'Failed to create system',
      details: error.message
    }))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Load all systems from database and populate Redux store
 */
export const loadAllSystemsAction = () => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())

  try {
    const systemService = new SystemService()
    const systems = await systemService.getAllSystems()
    
    dispatch(setSystems(systems))
    
    return systems
  } catch (error) {
    dispatch(setError({
      message: 'Failed to load systems',
      details: error.message
    }))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Update an existing system and refresh Redux store
 * @param {Object} updateData - System update parameters
 * @param {string|number} updateData.systemId - System ID to update
 * @param {string} updateData.systemName - Updated name
 * @param {string} updateData.description - Updated description
 * @param {Object} updateData.properties - Updated properties
 */
export const updateSystemAction = (updateData) => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())

  try {
    const systemService = new SystemService()
    
    // Update system in database
    const updatedSystem = await systemService.updateSystem(updateData)
    
    // Reload all systems to ensure consistency
    const allSystems = await systemService.getAllSystems()
    dispatch(setSystems(allSystems))
    
    return updatedSystem
  } catch (error) {
    dispatch(setError({
      message: 'Failed to update system',
      details: error.message
    }))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Delete a system and update Redux store
 * @param {string|number} systemId - System ID to delete
 */
export const deleteSystemAction = (systemId) => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())

  try {
    const systemService = new SystemService()
    
    // Delete system from database
    await systemService.deleteSystem({ systemId })
    
    // Update Redux store
    dispatch(removeSystem(systemId))
    
    return { success: true, systemId }
  } catch (error) {
    dispatch(setError({
      message: 'Failed to delete system',
      details: error.message
    }))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Load a specific system and set it as current
 * @param {Object} params - System lookup parameters
 * @param {string|number} params.systemId - System ID (optional)
 * @param {string} params.systemLabel - System label (optional)
 */
export const loadAndSelectSystemAction = (params) => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())

  try {
    const systemService = new SystemService()
    
    // Load specific system
    const system = await systemService.getSystem(params)
    
    if (system) {
      // Ensure system is in store
      const allSystems = await systemService.getAllSystems()
      dispatch(setSystems(allSystems))
      
      // Set as current system
      dispatch(setCurrentSystemId(system.systemId))
      dispatch(setVisibleSystems([system.systemId]))
    }
    
    return system
  } catch (error) {
    dispatch(setError({
      message: 'Failed to load system',
      details: error.message
    }))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Add nodes to a system (affects system node count)
 * @param {string} systemLabel - System label to add nodes to
 * @param {Array<number>} nodeIds - Node IDs to add
 */
export const addNodesToSystemAction = (systemLabel, nodeIds) => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())

  try {
    const systemService = new SystemService()
    
    // Add nodes to system in database
    const results = []
    for (const nodeId of nodeIds) {
      const result = await systemService.addNodeToSystem(nodeId, systemLabel)
      results.push(result)
    }
    
    // Reload systems to update node counts
    const allSystems = await systemService.getAllSystems()
    dispatch(setSystems(allSystems))
    
    return results
  } catch (error) {
    dispatch(setError({
      message: 'Failed to add nodes to system',
      details: error.message
    }))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}

/**
 * Remove nodes from a system (affects system node count)
 * @param {string} systemLabel - System label to remove nodes from
 * @param {Array<number>} nodeIds - Node IDs to remove
 */
export const removeNodesFromSystemAction = (systemLabel, nodeIds) => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())

  try {
    const systemService = new SystemService()
    
    // Remove nodes from system in database
    const results = []
    for (const nodeId of nodeIds) {
      const result = await systemService.removeNodeFromSystem(nodeId, systemLabel)
      results.push(result)
    }
    
    // Reload systems to update node counts
    const allSystems = await systemService.getAllSystems()
    dispatch(setSystems(allSystems))
    
    return results
  } catch (error) {
    dispatch(setError({
      message: 'Failed to remove nodes from system',
      details: error.message
    }))
    throw error
  } finally {
    dispatch(setLoading(false))
  }
}
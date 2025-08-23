import { SystemInterface } from './SystemInterface.js'
import { SystemModel } from './SystemModel.js'
import { NodeService } from '../NodeModule/node/NodeService.js'
import { Neo4jService } from '../database/Neo4jService.js'

export class SystemService extends SystemInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
    this.nodeService = new NodeService()
  }

  /**
   * Creates a new system with both entity storage and label definition
   * @param {Object} params - System creation parameters
   * @param {string} params.systemName - Human-readable name for the system
   * @param {string} params.systemLabel - Neo4j label to be applied to nodes
   * @param {string} params.description - Description of the system's purpose
   * @param {Object} params.properties - Additional system properties
   * @returns {Promise<SystemModel>} The created system entity
   */
  async createSystem({systemName, systemLabel, description = '', properties = {}}) {
    const session = this.neo4jService.getSession()

    try {
      // Validate system label format
      this.validateSystemLabel(systemLabel)

      // Check if system label already exists
      const labelExists = await this.systemExists(systemLabel)
      if (labelExists) {
        throw new Error(`System with label '${systemLabel}' already exists`)
      }

      // Create system entity (ITM app internal node)
      const result = await session.run(
        `
        CREATE (s:_System {
          systemName: $systemName,
          systemLabel: $systemLabel,
          description: $description,
          properties: $properties,
          nodeCount: 0,
          createdBy: 'user',
          createdDate: datetime(),
          isActive: true
        })
        RETURN s, toString(id(s)) as systemId
        `,
        { systemName, systemLabel, description, properties }
      )

      if (result.records.length === 0) {
        throw new Error('Failed to create system')
      }

      const record = result.records[0]
      const systemNode = record.get('s')
      const systemId = record.get('systemId')

      // Create SystemModel instance
      return new SystemModel({
        systemId: systemId,
        systemName: systemNode.properties.systemName,
        systemLabel: systemNode.properties.systemLabel,
        description: systemNode.properties.description,
        properties: systemNode.properties.properties,
        nodeCount: systemNode.properties.nodeCount.toNumber(),
        createdBy: systemNode.properties.createdBy,
        createdDate: systemNode.properties.createdDate.toString(),
        isActive: systemNode.properties.isActive
      })
    } finally {
      await session.close()
    }
  }

  /**
   * Retrieves a system entity by ID or label
   * @param {Object} params - Query parameters
   * @param {string|number} params.systemId - The unique system entity ID (optional)
   * @param {string} params.systemLabel - The system label (optional)
   * @returns {Promise<SystemModel|null>} The system entity if found, null otherwise
   */
  async getSystem({systemId = null, systemLabel = null}) {
    if (!systemId && !systemLabel) {
      throw new Error('Either systemId or systemLabel must be provided')
    }

    const session = this.neo4jService.getSession()

    try {
      let query, params

      if (systemId) {
        query = `
          MATCH (s:_System)
          WHERE id(s) = $systemId AND s.isActive = true
          RETURN s, toString(id(s)) as systemId
        `
        params = { systemId: this.neo4jService.int(systemId) }
      } else {
        query = `
          MATCH (s:_System)
          WHERE s.systemLabel = $systemLabel AND s.isActive = true
          RETURN s, toString(id(s)) as systemId
        `
        params = { systemLabel }
      }

      const result = await session.run(query, params)

      if (result.records.length === 0) {
        return null
      }

      const record = result.records[0]
      const systemNode = record.get('s')
      const foundSystemId = record.get('systemId')

      return new SystemModel({
        systemId: foundSystemId,
        systemName: systemNode.properties.systemName,
        systemLabel: systemNode.properties.systemLabel,
        description: systemNode.properties.description,
        properties: systemNode.properties.properties,
        nodeCount: systemNode.properties.nodeCount.toNumber(),
        createdBy: systemNode.properties.createdBy,
        createdDate: systemNode.properties.createdDate.toString(),
        isActive: systemNode.properties.isActive
      })
    } finally {
      await session.close()
    }
  }

  /**
   * Updates system properties and metadata
   * @param {Object} params - Update parameters
   * @param {string|number} params.systemId - The unique system entity ID
   * @param {string} params.systemName - Updated system name (optional)
   * @param {string} params.description - Updated description (optional)
   * @param {Object} params.properties - Updated properties (optional)
   * @returns {Promise<SystemModel>} The updated system entity
   */
  async updateSystem({systemId, systemName = null, description = null, properties = null}) {
    const session = this.neo4jService.getSession()

    try {
      // Build dynamic SET clause based on provided parameters
      const setParts = []
      const params = { systemId: this.neo4jService.int(systemId) }

      if (systemName !== null) {
        setParts.push('s.systemName = $systemName')
        params.systemName = systemName
      }

      if (description !== null) {
        setParts.push('s.description = $description')
        params.description = description
      }

      if (properties !== null) {
        setParts.push('s.properties = $properties')
        params.properties = properties
      }

      if (setParts.length === 0) {
        throw new Error('No update parameters provided')
      }

      const query = `
        MATCH (s:_System)
        WHERE id(s) = $systemId AND s.isActive = true
        SET ${setParts.join(', ')}
        RETURN s, toString(id(s)) as systemId
      `

      const result = await session.run(query, params)

      if (result.records.length === 0) {
        throw new Error(`System with ID '${systemId}' not found`)
      }

      const record = result.records[0]
      const systemNode = record.get('s')
      const updatedSystemId = record.get('systemId')

      return new SystemModel({
        systemId: updatedSystemId,
        systemName: systemNode.properties.systemName,
        systemLabel: systemNode.properties.systemLabel,
        description: systemNode.properties.description,
        properties: systemNode.properties.properties,
        nodeCount: systemNode.properties.nodeCount.toNumber(),
        createdBy: systemNode.properties.createdBy,
        createdDate: systemNode.properties.createdDate.toString(),
        isActive: systemNode.properties.isActive
      })
    } finally {
      await session.close()
    }
  }

  /**
   * Deletes a system and removes its label from all nodes
   * @param {Object} params - Delete parameters
   * @param {string|number} params.systemId - The unique system entity ID
   * @returns {Promise<Object>} Deletion result with statistics
   */
  async deleteSystem({systemId}) {
    const session = this.neo4jService.getSession()

    try {
      // First get the system to find its label
      const system = await this.getSystem({systemId})
      if (!system) {
        throw new Error(`System with ID '${systemId}' not found`)
      }

      // Remove system label from all nodes
      const removeLabelResult = await session.run(
        `
        MATCH (n:Asset:${system.systemLabel})
        REMOVE n:${system.systemLabel}
        RETURN count(n) as nodesUpdated
        `
      )

      const nodesUpdated = removeLabelResult.records[0]?.get('nodesUpdated').toNumber() || 0

      // Delete the system entity
      const deleteResult = await session.run(
        `
        MATCH (s:_System)
        WHERE id(s) = $systemId
        DELETE s
        RETURN count(s) as systemsDeleted
        `,
        { systemId: this.neo4jService.int(systemId) }
      )

      const systemsDeleted = deleteResult.records[0]?.get('systemsDeleted').toNumber() || 0

      return {
        success: systemsDeleted > 0,
        systemId: systemId,
        systemLabel: system.systemLabel,
        nodesUpdated: nodesUpdated,
        systemsDeleted: systemsDeleted
      }
    } finally {
      await session.close()
    }
  }

  /**
   * Retrieves all active systems
   * @returns {Promise<Array<SystemModel>>} Array of all system entities
   */
  async getAllSystems() {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (s:_System)
        WHERE s.isActive = true
        RETURN s, toString(id(s)) as systemId
        ORDER BY s.systemName
        `
      )

      return result.records.map(record => {
        const systemNode = record.get('s')
        const systemId = record.get('systemId')

        return new SystemModel({
          systemId: systemId,
          systemName: systemNode.properties.systemName,
          systemLabel: systemNode.properties.systemLabel,
          description: systemNode.properties.description,
          properties: systemNode.properties.properties,
          nodeCount: systemNode.properties.nodeCount.toNumber(),
          createdBy: systemNode.properties.createdBy,
          createdDate: systemNode.properties.createdDate.toString(),
          isActive: systemNode.properties.isActive
        })
      })
    } finally {
      await session.close()
    }
  }

  async addNodeToSystem(nodeId, systemLabel) {
    const session = this.neo4jService.getSession()

    try {
      // Verify node exists
      const nodeExists = await this.nodeService.nodeExists(nodeId)
      if (!nodeExists) {
        throw new Error(`Node with ID '${nodeId}' not found`)
      }

      // Validate system label format
      this.validateSystemLabel(systemLabel)

      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        SET n:${systemLabel}
        RETURN n, labels(n) as updatedLabels
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      if (result.records.length === 0) {
        throw new Error(`Failed to add node ${nodeId} to system ${systemLabel}`)
      }

      return {
        nodeId: nodeId,
        systemLabel: systemLabel,
        labels: result.records[0].get('updatedLabels'),
        success: true
      }
    } finally {
      await session.close()
    }
  }

  async removeNodeFromSystem(nodeId, systemLabel) {
    const session = this.neo4jService.getSession()

    try {
      // Verify node exists
      const nodeExists = await this.nodeService.nodeExists(nodeId)
      if (!nodeExists) {
        throw new Error(`Node with ID '${nodeId}' not found`)
      }

      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        REMOVE n:${systemLabel}
        RETURN n, labels(n) as updatedLabels
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      if (result.records.length === 0) {
        throw new Error(`Failed to remove node ${nodeId} from system ${systemLabel}`)
      }

      return {
        nodeId: nodeId,
        systemLabel: systemLabel,
        labels: result.records[0].get('updatedLabels'),
        success: true
      }
    } finally {
      await session.close()
    }
  }

  async getSystemNodes(systemLabel) {
    const session = this.neo4jService.getSession()

    try {
      this.validateSystemLabel(systemLabel)

      const result = await session.run(
        `
        MATCH (n:Asset:${systemLabel})
        WHERE n.isActive = true
        RETURN n, labels(n) as nodeLabels
        ORDER BY n.title
        `
      )

      return result.records.map(record => {
        const node = record.get('n')
        const labels = record.get('nodeLabels')
        
        return {
          nodeId: node.identity.toString(),
          properties: node.properties,
          labels: labels,
          systemLabels: this.extractSystemLabels(labels)
        }
      })
    } finally {
      await session.close()
    }
  }

  async getNodeSystems(nodeId) {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        RETURN labels(n) as nodeLabels
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      if (result.records.length === 0) {
        return []
      }

      const labels = result.records[0].get('nodeLabels')
      return this.extractSystemLabels(labels)
    } finally {
      await session.close()
    }
  }

  async listSystems() {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WITH DISTINCT labels(n) as nodeLabels
        UNWIND nodeLabels as label
        WITH label
        WHERE label <> 'Asset' AND NOT label IN $assetClassLabels
        WITH label, count(*) as nodeCount
        RETURN label as systemLabel, nodeCount
        ORDER BY systemLabel
        `,
        { 
          assetClassLabels: await this.getAssetClassLabels()
        }
      )

      return result.records.map(record => {
        const systemLabel = record.get('systemLabel')
        const nodeCount = record.get('nodeCount').toNumber()
        
        return SystemModel.fromSystemData(systemLabel, { nodeCount })
      })
    } finally {
      await session.close()
    }
  }

  async systemExists(systemLabel) {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset:${systemLabel})
        RETURN count(n) > 0 as exists
        `
      )

      return result.records[0]?.get('exists') || false
    } finally {
      await session.close()
    }
  }

  async getSystemStats(systemLabel) {
    const session = this.neo4jService.getSession()

    try {
      this.validateSystemLabel(systemLabel)

      const result = await session.run(
        `
        MATCH (n:Asset:${systemLabel})
        WITH n.assetClassId as assetClass, count(*) as nodeCount, labels(n) as nodeLabels
        RETURN 
          assetClass,
          nodeCount,
          collect(DISTINCT nodeLabels) as allLabels
        ORDER BY assetClass
        `
      )

      const assetClassBreakdown = []
      let totalNodes = 0

      result.records.forEach(record => {
        const assetClass = record.get('assetClass')
        const nodeCount = record.get('nodeCount').toNumber()
        totalNodes += nodeCount

        assetClassBreakdown.push({
          assetClass,
          nodeCount
        })
      })

      return SystemModel.fromSystemData(systemLabel, {
        nodeCount: totalNodes,
        assetClassBreakdown,
        lastUpdated: new Date().toISOString()
      })
    } finally {
      await session.close()
    }
  }

  async moveNodesBetweenSystems(fromSystemLabel, toSystemLabel, nodeIds = null) {
    const session = this.neo4jService.getSession()

    try {
      this.validateSystemLabel(fromSystemLabel)
      this.validateSystemLabel(toSystemLabel)

      let query = `
        MATCH (n:Asset:${fromSystemLabel})
        WHERE n.isActive = true
      `

      const params = {}

      // If specific nodeIds provided, filter by them
      if (nodeIds && nodeIds.length > 0) {
        query += ` AND id(n) IN $nodeIds`
        params.nodeIds = nodeIds.map(id => this.neo4jService.int(id))
      }

      query += `
        REMOVE n:${fromSystemLabel}
        SET n:${toSystemLabel}
        RETURN count(n) as movedCount
      `

      const result = await session.run(query, params)
      const movedCount = result.records[0]?.get('movedCount').toNumber() || 0

      return {
        fromSystem: fromSystemLabel,
        toSystem: toSystemLabel,
        movedCount,
        success: movedCount > 0
      }
    } finally {
      await session.close()
    }
  }

  // Helper methods
  extractSystemLabels(labels) {
    // Filter out 'Asset' and known AssetClass labels to get system labels
    const systemReservedLabels = ['Asset']
    return labels.filter(label => 
      !systemReservedLabels.includes(label) && 
      !this.isAssetClassLabel(label)
    )
  }

  async getAssetClassLabels() {
    // Get all AssetClass names to filter them out from system labels
    const assetClasses = await this.nodeService.assetClassService.getAllAssetClasses()
    return assetClasses.map(ac => ac.className)
  }

  isAssetClassLabel(label) {
    // This would ideally check against known AssetClass labels
    // For now, we'll implement a simple heuristic or cache known labels
    return false // Placeholder - should check against AssetClass labels
  }

  validateSystemLabel(systemLabel) {
    if (!systemLabel || typeof systemLabel !== 'string') {
      throw new Error('System label must be a non-empty string')
    }
    
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(systemLabel)) {
      throw new Error('System label must start with a letter and contain only letters, numbers, and underscores')
    }
  }

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // Only close NodeService resources
    await this.nodeService.close()
  }
}
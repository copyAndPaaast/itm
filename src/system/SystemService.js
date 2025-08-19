import { SystemInterface } from './SystemInterface.js'
import { SystemModel } from './SystemModel.js'
import { NodeService } from '../node/NodeService.js'
import { Neo4jService } from '../database/Neo4jService.js'

export class SystemService extends SystemInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
    this.nodeService = new NodeService()
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
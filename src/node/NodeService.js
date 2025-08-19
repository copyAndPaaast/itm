import { NodeInterface } from './NodeInterface.js'
import { NodeModel } from './NodeModel.js'
import { AssetClassService } from '../assetclass/AssetClassService.js'
import { Neo4jService } from '../database/Neo4jService.js'

export class NodeService extends NodeInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
    this.assetClassService = new AssetClassService()
  }

  async createNode(assetClassId, properties, title, systems = []) {
    const session = this.neo4jService.getSession()

    try {
      // Get AssetClass to validate properties and get className for labels
      let assetClass
      if (typeof assetClassId === 'number' || /^\d+$/.test(assetClassId)) {
        assetClass = await this.assetClassService.getAssetClass({classId: assetClassId})
      } else {
        assetClass = await this.assetClassService.getAssetClass({className: assetClassId})
      }
      
      if (!assetClass) {
        throw new Error(`AssetClass with ID '${assetClassId}' not found`)
      }

      // Validate properties against AssetClass schema
      const validation = assetClass.validateAllProperties(properties)
      if (!validation.valid) {
        throw new Error(`Property validation failed: ${validation.errors.join(', ')}`)
      }

      // Validate system labels
      const validatedSystems = this.validateSystemLabels(systems)
      
      const node = new NodeModel({
        assetClassId,
        title,
        properties,
        labels: ['Asset', assetClass.className, ...validatedSystems]
      })

      // Create node with both Asset and AssetClass name labels
      const labelString = node.labels.map(l => `:${l}`).join('')

      const result = await session.run(
        `
        CREATE (n${labelString} $properties)
        RETURN n
        `,
        { properties: node.toNeo4jProperties() }
      )

      if (result.records.length === 0) {
        throw new Error('Failed to create Node')
      }

      return NodeModel.fromNeo4jNode(result.records[0].get('n'))
    } finally {
      await session.close()
    }
  }

  async getNode(nodeId) {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        RETURN n
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      if (result.records.length === 0) {
        return null
      }

      return NodeModel.fromNeo4jNode(result.records[0].get('n'))
    } finally {
      await session.close()
    }
  }

  async getAllNodes() {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE n.isActive = true
        RETURN n
        ORDER BY n.title
        `
      )

      return result.records.map(record =>
        NodeModel.fromNeo4jNode(record.get('n'))
      )
    } finally {
      await session.close()
    }
  }

  async getNodesByAssetClass(assetClassId) {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE n.assetClassId = $assetClassId AND n.isActive = true
        RETURN n
        ORDER BY n.title
        `,
        { assetClassId }
      )

      return result.records.map(record =>
        NodeModel.fromNeo4jNode(record.get('n'))
      )
    } finally {
      await session.close()
    }
  }

  async updateNode(nodeId, properties) {
    const session = this.neo4jService.getSession()

    try {
      // Get existing node to validate against its AssetClass
      const existingNode = await this.getNode(nodeId)
      if (!existingNode) {
        throw new Error(`Node with ID '${nodeId}' not found`)
      }

      // Get AssetClass for validation
      const assetClass = await this.assetClassService.getAssetClass({classId: existingNode.assetClassId})
      if (!assetClass) {
        throw new Error(`AssetClass with ID '${existingNode.assetClassId}' not found`)
      }

      // Merge existing and new properties for validation
      const mergedProperties = { ...existingNode.properties, ...properties }
      const validation = assetClass.validateAllProperties(mergedProperties)
      if (!validation.valid) {
        throw new Error(`Property validation failed: ${validation.errors.join(', ')}`)
      }

      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        SET n += $properties
        RETURN n
        `,
        {
          nodeId: this.neo4jService.int(nodeId),
          properties
        }
      )

      if (result.records.length === 0) {
        return null
      }

      return NodeModel.fromNeo4jNode(result.records[0].get('n'))
    } finally {
      await session.close()
    }
  }

  async deleteNode(nodeId) {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        DELETE n
        RETURN count(n) as deletedCount
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      return result.records[0]?.get('deletedCount')?.toNumber() > 0
    } finally {
      await session.close()
    }
  }

  async nodeExists(nodeId) {
    const session = this.neo4jService.getSession()

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        RETURN count(n) > 0 as exists
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      return result.records[0]?.get('exists') || false
    } finally {
      await session.close()
    }
  }

  validateSystemLabels(systems) {
    if (!Array.isArray(systems)) {
      throw new Error('Systems parameter must be an array')
    }

    return systems.map(system => {
      if (!system || typeof system !== 'string') {
        throw new Error('System label must be a non-empty string')
      }
      
      if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(system)) {
        throw new Error('System label must start with a letter and contain only letters, numbers, and underscores')
      }
      
      return system
    })
  }

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // Only close AssetClassService resources
    await this.assetClassService.close()
  }
}

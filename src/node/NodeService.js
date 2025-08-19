import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
import { NodeInterface } from './NodeInterface.js'
import { NodeModel } from './NodeModel.js'
import { AssetClassService } from '../assetclass/AssetClassService.js'

dotenv.config()

export class NodeService extends NodeInterface {
  constructor() {
    super()
    this.driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    )
    this.database = process.env.NEO4J_DATABASE || 'neo4j'
    this.assetClassService = new AssetClassService()
  }

  async createNode(assetClassId, properties, title) {
    const session = this.driver.session({ database: this.database })

    try {
      // Get AssetClass to validate properties and get className for labels
      const assetClass = await this.assetClassService.getAssetClass(assetClassId)
      if (!assetClass) {
        throw new Error(`AssetClass with ID '${assetClassId}' not found`)
      }

      // Validate properties against AssetClass schema
      const validation = assetClass.validateAllProperties(properties)
      if (!validation.valid) {
        throw new Error(`Property validation failed: ${validation.errors.join(', ')}`)
      }

      const node = new NodeModel({
        assetClassId,
        title,
        properties,
        labels: ['Asset', assetClass.className]
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
    const session = this.driver.session({ database: this.database })

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        RETURN n
        `,
        { nodeId: neo4j.int(nodeId) }
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
    const session = this.driver.session({ database: this.database })

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
    const session = this.driver.session({ database: this.database })

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
    const session = this.driver.session({ database: this.database })

    try {
      // Get existing node to validate against its AssetClass
      const existingNode = await this.getNode(nodeId)
      if (!existingNode) {
        throw new Error(`Node with ID '${nodeId}' not found`)
      }

      // Get AssetClass for validation
      const assetClass = await this.assetClassService.getAssetClass(existingNode.assetClassId)
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
          nodeId: neo4j.int(nodeId),
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
    const session = this.driver.session({ database: this.database })

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        DELETE n
        RETURN count(n) as deletedCount
        `,
        { nodeId: neo4j.int(nodeId) }
      )

      return result.records[0]?.get('deletedCount')?.toNumber() > 0
    } finally {
      await session.close()
    }
  }

  async validateNodeProperties(assetClassId, properties) {
    const assetClass = await this.assetClassService.getAssetClass(assetClassId)
    if (!assetClass) {
      return {
        valid: false,
        errors: [`AssetClass with ID '${assetClassId}' not found`]
      }
    }

    return assetClass.validateAllProperties(properties)
  }

  async nodeExists(nodeId) {
    const session = this.driver.session({ database: this.database })

    try {
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        RETURN count(n) > 0 as exists
        `,
        { nodeId: neo4j.int(nodeId) }
      )

      return result.records[0]?.get('exists') || false
    } finally {
      await session.close()
    }
  }

  async close() {
    await this.driver.close()
    await this.assetClassService.close()
  }
}

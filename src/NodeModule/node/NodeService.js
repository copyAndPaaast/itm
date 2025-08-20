import { NodeInterface } from './NodeInterface.js'
import { NodeModel } from './NodeModel.js'
import { AssetClassService } from '../assetclass/AssetClassService.js'
import { Neo4jService } from '../../database/Neo4jService.js'

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

  async analyzeAssetClassCompatibility({nodeId, newAssetClassId}) {
    // Get current node
    const currentNode = await this.getNode(nodeId)
    if (!currentNode) {
      throw new Error(`Node with ID '${nodeId}' not found`)
    }

    // Get current AssetClass
    const currentAssetClass = await this.assetClassService.getAssetClass({classId: currentNode.assetClassId})
    if (!currentAssetClass) {
      throw new Error(`Current AssetClass '${currentNode.assetClassId}' not found`)
    }

    // Get target AssetClass
    const newAssetClass = await this.assetClassService.getAssetClass({classId: newAssetClassId})
    if (!newAssetClass) {
      throw new Error(`Target AssetClass '${newAssetClassId}' not found`)
    }

    // Import compatibility analyzer
    const { PropertyCompatibilityAnalyzer } = await import('../assetclass/PropertyCompatibilityAnalyzer.js')
    
    // Analyze compatibility
    const analysis = PropertyCompatibilityAnalyzer.analyzeCompatibility(
      currentNode.properties,
      currentAssetClass.propertySchema,
      newAssetClass.propertySchema,
      newAssetClass.requiredProperties
    )

    // Add node-specific information
    return {
      ...analysis,
      nodeId: nodeId,
      currentAssetClass: {
        classId: currentAssetClass.classId,
        className: currentAssetClass.className
      },
      newAssetClass: {
        classId: newAssetClass.classId,
        className: newAssetClass.className
      },
      compatibilityScore: PropertyCompatibilityAnalyzer.calculateCompatibilityScore(analysis)
    }
  }

  async switchAssetClass({nodeId, newAssetClassId, propertyMappings = {}, preserveLostProperties = true}) {
    const session = this.neo4jService.getSession()
    
    try {
      // First analyze compatibility
      const compatibility = await this.analyzeAssetClassCompatibility({nodeId, newAssetClassId})
      
      // Get the target AssetClass for validation
      const newAssetClass = await this.assetClassService.getAssetClass({classId: newAssetClassId})
      
      // Build new properties based on compatibility analysis
      const newProperties = { ...compatibility.preservedProperties }
      
      // Apply user-provided property mappings
      for (const [prop, value] of Object.entries(propertyMappings)) {
        newProperties[prop] = value
      }
      
      // Add default values for missing required properties
      for (const missing of compatibility.missingRequiredProperties) {
        if (!(missing.property in newProperties)) {
          if (missing.property in propertyMappings) {
            newProperties[missing.property] = propertyMappings[missing.property]
          } else {
            newProperties[missing.property] = missing.defaultValue
          }
        }
      }
      
      // Preserve lost properties in metadata if requested
      const metadata = {}
      if (preserveLostProperties && Object.keys(compatibility.lostProperties).length > 0) {
        metadata._preservedProperties = compatibility.lostProperties
        metadata._preservedFromClass = compatibility.currentAssetClass.className
        metadata._preservedDate = new Date().toISOString()
      }
      
      // Validate final properties against new AssetClass
      const finalValidation = newAssetClass.validateAllProperties(newProperties)
      if (!finalValidation.valid) {
        throw new Error(`Property validation failed after mapping: ${finalValidation.errors.join(', ')}`)
      }
      
      // Update the node in Neo4j
      const result = await session.run(
        `
        MATCH (n:Asset)
        WHERE id(n) = $nodeId
        SET n.assetClassId = $newAssetClassId
        SET n += $newProperties
        ${Object.keys(metadata).length > 0 ? 'SET n += $metadata' : ''}
        RETURN n
        `,
        {
          nodeId: this.neo4jService.int(nodeId),
          newAssetClassId: newAssetClassId,
          newProperties: newProperties,
          ...(Object.keys(metadata).length > 0 ? { metadata } : {})
        }
      )
      
      if (result.records.length === 0) {
        throw new Error(`Failed to update node ${nodeId}`)
      }
      
      const updatedNode = NodeModel.fromNeo4jNode(result.records[0].get('n'))
      
      return {
        success: true,
        node: updatedNode,
        compatibilityAnalysis: compatibility,
        appliedMappings: propertyMappings,
        preservedProperties: preserveLostProperties ? compatibility.lostProperties : {}
      }
      
    } finally {
      await session.close()
    }
  }

  async getNodeSystems({nodeId}) {
    // Get the node to access its labels
    const node = await this.getNode(nodeId)
    if (!node) {
      throw new Error(`Node with ID '${nodeId}' not found`)
    }

    // Extract system labels (exclude 'Asset' and AssetClass name)
    const systemLabels = node.labels.filter(label => 
      label !== 'Asset' && 
      label !== node.getAssetClassName()
    )

    return systemLabels
  }

  async getNodeSystemSummary({nodeId}) {
    const node = await this.getNode(nodeId)
    if (!node) {
      throw new Error(`Node with ID '${nodeId}' not found`)
    }

    const systemLabels = await this.getNodeSystems({nodeId})
    
    return {
      nodeId: nodeId,
      systemCount: systemLabels.length,
      systems: systemLabels,
      hasSystems: systemLabels.length > 0,
      allLabels: node.labels,
      assetClass: node.getAssetClassName(),
      displayInfo: {
        title: node.title,
        assetType: node.getAssetClassName(),
        systems: systemLabels.length > 0 ? systemLabels.join(', ') : 'No systems',
        systemCount: systemLabels.length
      }
    }
  }

  async isNodeInSystem({nodeId, systemLabel}) {
    const systemLabels = await this.getNodeSystems({nodeId})
    return systemLabels.includes(systemLabel)
  }

  async getNodeMembershipSummary({nodeId}) {
    // Get both system and group membership information
    const [systemSummary, groupSummary] = await Promise.all([
      this.getNodeSystemSummary({nodeId}),
      this.getNodeGroupSummary({nodeId})
    ])

    return {
      nodeId: nodeId,
      systems: systemSummary,
      groups: groupSummary,
      displaySummary: {
        title: systemSummary.displayInfo.title,
        assetType: systemSummary.displayInfo.assetType,
        systemMembership: systemSummary.displayInfo.systems,
        groupMembership: groupSummary.hasGroups ? 
          `${groupSummary.groupCount} groups: ${groupSummary.groupNames.join(', ')}` : 
          'No groups',
        totalMemberships: systemSummary.systemCount + groupSummary.groupCount
      }
    }
  }

  async getNodeGroupSummary({nodeId}) {
    // Import GroupService to get group information
    const { GroupService } = await import('../../group/GroupService.js')
    const groupService = new GroupService()
    
    try {
      return await groupService.getNodeGroupSummary({nodeId})
    } finally {
      await groupService.close()
    }
  }

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // Only close AssetClassService resources
    await this.assetClassService.close()
  }
}

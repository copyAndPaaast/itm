import { RelationshipInterface } from './RelationshipInterface.js'
import { RelationshipModel } from './RelationshipModel.js'
import { Neo4jService } from '../../database/Neo4jService.js'
import { RelationshipClassService } from '../relationshipclass/RelationshipClassService.js'

export class RelationshipService extends RelationshipInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
    this.relationshipClassService = new RelationshipClassService()
  }

  async createRelationship({fromId, toId, relationshipClassId, properties = {}}) {
    const session = this.neo4jService.getSession()
    
    try {
      // Get and validate RelationshipClass
      const relationshipClass = await this.relationshipClassService.getRelationshipClass({classId: relationshipClassId})
      if (!relationshipClass) {
        const availableClasses = await this.relationshipClassService.getAllRelationshipClasses()
        const availableIds = availableClasses.map(rc => `${rc.relationshipClassName} (${rc.classId})`).join(', ')
        throw new Error(`No RelationshipClass found for ID '${relationshipClassId}'. Available classes: ${availableIds}`)
      }

      // RelationshipService only handles Asset-to-Asset relationships
      const nodeTypeValidation = relationshipClass.validateNodeTypes('Asset', 'Asset')
      if (!nodeTypeValidation.valid) {
        throw new Error(`RelationshipService only handles Asset-to-Asset relationships. Use GroupService for group-related relationships.`)
      }

      // Validate properties against RelationshipClass schema
      const propertyValidation = relationshipClass.validateAllProperties(properties)
      if (!propertyValidation.valid) {
        throw new Error(`Property validation failed: ${propertyValidation.errors.join(', ')}`)
      }

      const relationship = new RelationshipModel({
        fromId,
        toId,
        fromType: 'Asset',
        toType: 'Asset',
        relationshipType: relationshipClass.relationshipType,
        relationshipClassId: relationshipClass.classId,
        properties
      })

      // RelationshipService only handles Asset-to-Asset relationships
      const fromLabel = 'Asset'
      const toLabel = 'Asset'

      const result = await session.run(
        `
        MATCH (from:${fromLabel}), (to:${toLabel})
        WHERE id(from) = $fromId AND id(to) = $toId
        CREATE (from)-[r:${relationship.relationshipType} $properties]->(to)
        RETURN r, from, to
        `,
        { 
          fromId: this.neo4jService.int(fromId),
          toId: this.neo4jService.int(toId),
          properties: relationship.toNeo4jProperties()
        }
      )

      if (result.records.length === 0) {
        throw new Error(`Failed to create relationship. Source Asset:${fromId} or target Asset:${toId} not found.`)
      }

      const record = result.records[0]
      return RelationshipModel.fromNeo4jRelationship(
        record.get('r'),
        record.get('from'),
        record.get('to')
      )
    } finally {
      await session.close()
    }
  }

  async getRelationship({relationshipId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (from)-[r]->(to)
        WHERE id(r) = $relationshipId
        RETURN r, from, to
        `,
        { relationshipId: this.neo4jService.int(relationshipId) }
      )

      if (result.records.length === 0) {
        throw new Error(`Relationship with ID '${relationshipId}' not found`)
      }

      const record = result.records[0]
      return RelationshipModel.fromNeo4jRelationship(
        record.get('r'),
        record.get('from'),
        record.get('to')
      )
    } finally {
      await session.close()
    }
  }

  async getRelationshipsFrom({nodeId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const fromLabel = 'Asset'
      
      const result = await session.run(
        `
        MATCH (from:${fromLabel})-[r]->(to)
        WHERE id(from) = $nodeId AND r.isActive = true
        RETURN r, from, to
        ORDER BY r.createdDate DESC
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      return result.records.map(record => 
        RelationshipModel.fromNeo4jRelationship(
          record.get('r'),
          record.get('from'),
          record.get('to')
        )
      )
    } finally {
      await session.close()
    }
  }

  async getRelationshipsTo({nodeId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const toLabel = 'Asset'
      
      const result = await session.run(
        `
        MATCH (from)-[r]->(to:${toLabel})
        WHERE id(to) = $nodeId AND r.isActive = true
        RETURN r, from, to
        ORDER BY r.createdDate DESC
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      return result.records.map(record => 
        RelationshipModel.fromNeo4jRelationship(
          record.get('r'),
          record.get('from'),
          record.get('to')
        )
      )
    } finally {
      await session.close()
    }
  }

  async getAllRelationships({nodeId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const nodeLabel = 'Asset'
      
      const result = await session.run(
        `
        MATCH (node:${nodeLabel})
        WHERE id(node) = $nodeId
        MATCH (node)-[r]-(connected)
        WHERE r.isActive = true
        RETURN r, 
               CASE WHEN startNode(r) = node THEN node ELSE connected END as from,
               CASE WHEN endNode(r) = node THEN node ELSE connected END as to
        ORDER BY r.createdDate DESC
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      return result.records.map(record => 
        RelationshipModel.fromNeo4jRelationship(
          record.get('r'),
          record.get('from'),
          record.get('to')
        )
      )
    } finally {
      await session.close()
    }
  }

  async updateRelationship({relationshipId, properties}) {
    const session = this.neo4jService.getSession()
    
    try {
      // Filter out system properties
      const systemProps = ['tempUID', 'createdBy', 'createdDate', 'isActive']
      const updateProperties = {}
      
      for (const [key, value] of Object.entries(properties)) {
        if (!systemProps.includes(key)) {
          updateProperties[key] = value
        }
      }

      if (Object.keys(updateProperties).length === 0) {
        throw new Error('No valid properties to update')
      }

      const result = await session.run(
        `
        MATCH (from)-[r]->(to)
        WHERE id(r) = $relationshipId
        SET r += $updates
        RETURN r, from, to
        `,
        { 
          relationshipId: this.neo4jService.int(relationshipId),
          updates: updateProperties
        }
      )

      if (result.records.length === 0) {
        throw new Error(`Relationship with ID '${relationshipId}' not found`)
      }

      const record = result.records[0]
      return RelationshipModel.fromNeo4jRelationship(
        record.get('r'),
        record.get('from'),
        record.get('to')
      )
    } finally {
      await session.close()
    }
  }

  async deleteRelationship({relationshipId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH ()-[r]->()
        WHERE id(r) = $relationshipId
        DELETE r
        RETURN count(r) as deletedCount
        `,
        { relationshipId: this.neo4jService.int(relationshipId) }
      )

      return result.records[0]?.get('deletedCount')?.toNumber() > 0
    } finally {
      await session.close()
    }
  }

  async getRelationshipsByType({relationshipType}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (from)-[r:${relationshipType}]->(to)
        WHERE r.isActive = true
        RETURN r, from, to
        ORDER BY r.createdDate DESC
        `
      )

      return result.records.map(record => 
        RelationshipModel.fromNeo4jRelationship(
          record.get('r'),
          record.get('from'),
          record.get('to')
        )
      )
    } finally {
      await session.close()
    }
  }

  async relationshipExists({fromId, toId, relationshipType}) {
    const session = this.neo4jService.getSession()
    
    try {
      const fromLabel = 'Asset'
      const toLabel = 'Asset'

      const result = await session.run(
        `
        MATCH (from:${fromLabel})-[r:${relationshipType}]->(to:${toLabel})
        WHERE id(from) = $fromId AND id(to) = $toId
        RETURN count(r) > 0 as exists
        `,
        { 
          fromId: this.neo4jService.int(fromId),
          toId: this.neo4jService.int(toId)
        }
      )

      return result.records[0]?.get('exists') || false
    } finally {
      await session.close()
    }
  }

  async getAllRelationshipTypes() {
    // Get relationship types from RelationshipClasses (templates)
    const relationshipClasses = await this.relationshipClassService.getAllRelationshipClasses()
    return relationshipClasses
      .filter(rc => !rc.relationshipType.startsWith('_')) // Filter out ITM app internal types
      .map(rc => rc.relationshipType)
      .sort()
  }



  // Helper method to validate Neo4j relationship type names
  isValidRelationshipType(relationshipType) {
    // Neo4j relationship types should be uppercase with underscores
    // ITM app internal relationships start with underscore
    return /^_?[A-Z][A-Z0-9_]*$/.test(relationshipType)
  }

  // Utility method to get relationship statistics
  async getRelationshipStats() {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH ()-[r]->()
        WHERE r.isActive = true
        RETURN 
          type(r) as relationshipType,
          count(r) as count,
          labels(startNode(r))[0] as fromType,
          labels(endNode(r))[0] as toType
        ORDER BY count DESC
        `
      )

      return result.records.map(record => ({
        relationshipType: record.get('relationshipType'),
        count: record.get('count').toNumber(),
        fromType: record.get('fromType'),
        toType: record.get('toType')
      }))
    } finally {
      await session.close()
    }
  }



  async getRelationshipsByClass({relationshipClassId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (from)-[r]->(to)
        WHERE r.relationshipClassId = $relationshipClassId AND r.isActive = true
        RETURN r, from, to
        ORDER BY r.createdDate DESC
        `,
        { relationshipClassId }
      )

      return result.records.map(record => 
        RelationshipModel.fromNeo4jRelationship(
          record.get('r'),
          record.get('from'),
          record.get('to')
        )
      )
    } finally {
      await session.close()
    }
  }

  async switchRelationshipDirection({relationshipId}) {
    const session = this.neo4jService.getSession()
    
    try {
      // First, get the current relationship to validate it exists and get its details
      const currentRelationship = await this.getRelationship({relationshipId})
      if (!currentRelationship) {
        throw new Error(`Relationship with ID '${relationshipId}' not found`)
      }

      // Validate that this is an Asset-to-Asset relationship (RelationshipService restriction)
      if (!currentRelationship.isAssetToAsset()) {
        throw new Error('RelationshipService only handles Asset-to-Asset relationships')
      }

      // Get the RelationshipClass to validate if direction switching is allowed
      const relationshipClass = await this.relationshipClassService.getRelationshipClass({
        classId: currentRelationship.relationshipClassId
      })
      
      if (!relationshipClass) {
        throw new Error(`RelationshipClass '${currentRelationship.relationshipClassId}' not found`)
      }

      // Validate that the reversed direction is still valid according to RelationshipClass
      const reverseValidation = relationshipClass.validateNodeTypes('Asset', 'Asset')
      if (!reverseValidation.valid) {
        throw new Error(`Cannot switch direction: ${reverseValidation.errors.join(', ')}`)
      }

      // Perform the direction switch in Neo4j
      // This creates a new relationship in the opposite direction and deletes the old one
      const result = await session.run(
        `
        MATCH (from)-[oldRel]->(to)
        WHERE id(oldRel) = $relationshipId
        CREATE (to)-[newRel:${currentRelationship.relationshipType}]->(from)
        SET newRel = properties(oldRel)
        DELETE oldRel
        RETURN newRel, to as newFrom, from as newTo
        `,
        { relationshipId: this.neo4jService.int(relationshipId) }
      )

      if (result.records.length === 0) {
        throw new Error(`Failed to switch relationship direction. Relationship with ID '${relationshipId}' not found.`)
      }

      // Return the new relationship with switched direction
      const record = result.records[0]
      return RelationshipModel.fromNeo4jRelationship(
        record.get('newRel'),
        record.get('newFrom'),
        record.get('newTo')
      )
    } finally {
      await session.close()
    }
  }

  async analyzeRelationshipClassCompatibility({relationshipId, newRelationshipClassId}) {
    // Get current relationship
    const currentRelationship = await this.getRelationship({relationshipId})
    if (!currentRelationship) {
      throw new Error(`Relationship with ID '${relationshipId}' not found`)
    }

    // Get current RelationshipClass
    const currentRelationshipClass = await this.relationshipClassService.getRelationshipClass({classId: currentRelationship.relationshipClassId})
    if (!currentRelationshipClass) {
      throw new Error(`Current RelationshipClass '${currentRelationship.relationshipClassId}' not found`)
    }

    // Get target RelationshipClass
    const newRelationshipClass = await this.relationshipClassService.getRelationshipClass({classId: newRelationshipClassId})
    if (!newRelationshipClass) {
      throw new Error(`Target RelationshipClass '${newRelationshipClassId}' not found`)
    }

    // Import compatibility analyzer
    const { RelationshipPropertyCompatibilityAnalyzer } = await import('../relationshipclass/RelationshipPropertyCompatibilityAnalyzer.js')
    
    // Analyze compatibility
    const analysis = RelationshipPropertyCompatibilityAnalyzer.analyzeRelationshipCompatibility(
      currentRelationship.properties,
      currentRelationshipClass,
      newRelationshipClass
    )

    // Add relationship-specific information
    return {
      ...analysis,
      relationshipId: relationshipId,
      currentRelationshipClass: {
        classId: currentRelationshipClass.classId,
        relationshipClassName: currentRelationshipClass.relationshipClassName,
        relationshipType: currentRelationshipClass.relationshipType
      },
      newRelationshipClass: {
        classId: newRelationshipClass.classId,
        relationshipClassName: newRelationshipClass.relationshipClassName,
        relationshipType: newRelationshipClass.relationshipType
      },
      compatibilityScore: RelationshipPropertyCompatibilityAnalyzer.calculateCompatibilityScore(analysis)
    }
  }

  async switchRelationshipClass({relationshipId, newRelationshipClassId, propertyMappings = {}, preserveLostProperties = true}) {
    const session = this.neo4jService.getSession()
    
    try {
      // First analyze compatibility
      const compatibility = await this.analyzeRelationshipClassCompatibility({relationshipId, newRelationshipClassId})
      
      // Check if the switch is possible (node type compatibility)
      if (!compatibility.nodeTypeCompatibility.compatible) {
        throw new Error(`Cannot switch relationship class: ${compatibility.nodeTypeCompatibility.issues.join(', ')}`)
      }
      
      // Get the target RelationshipClass for validation
      const newRelationshipClass = await this.relationshipClassService.getRelationshipClass({classId: newRelationshipClassId})
      
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
        metadata._preservedFromClass = compatibility.currentRelationshipClass.relationshipClassName
        metadata._preservedDate = new Date().toISOString()
      }
      
      // Validate final properties against new RelationshipClass
      const finalValidation = newRelationshipClass.validateAllProperties(newProperties)
      if (!finalValidation.valid) {
        throw new Error(`Property validation failed after mapping: ${finalValidation.errors.join(', ')}`)
      }
      
      // Update the relationship in Neo4j - need to handle relationship type change
      const currentRelationship = await this.getRelationship({relationshipId})
      
      let result
      if (compatibility.relationshipTypeChange) {
        // Need to create new relationship with new type and delete old one
        result = await session.run(
          `
          MATCH (from)-[oldRel]->(to)
          WHERE id(oldRel) = $relationshipId
          CREATE (from)-[newRel:${newRelationshipClass.relationshipType}]->(to)
          SET newRel = $newProperties
          SET newRel.relationshipClassId = $newRelationshipClassId
          ${Object.keys(metadata).length > 0 ? 'SET newRel += $metadata' : ''}
          DELETE oldRel
          RETURN newRel, from, to
          `,
          {
            relationshipId: this.neo4jService.int(relationshipId),
            newRelationshipClassId: newRelationshipClassId,
            newProperties: newProperties,
            ...(Object.keys(metadata).length > 0 ? { metadata } : {})
          }
        )
        
        if (result.records.length === 0) {
          throw new Error(`Failed to switch relationship class for relationship ${relationshipId}`)
        }
        
        const record = result.records[0]
        const updatedRelationship = RelationshipModel.fromNeo4jRelationship(
          record.get('newRel'),
          record.get('from'),
          record.get('to')
        )
        
        return {
          success: true,
          relationship: updatedRelationship,
          relationshipTypeChanged: true,
          compatibilityAnalysis: compatibility,
          appliedMappings: propertyMappings,
          preservedProperties: preserveLostProperties ? compatibility.lostProperties : {}
        }
      } else {
        // Just update properties and class ID
        result = await session.run(
          `
          MATCH (from)-[rel]->(to)
          WHERE id(rel) = $relationshipId
          SET rel.relationshipClassId = $newRelationshipClassId
          SET rel += $newProperties
          ${Object.keys(metadata).length > 0 ? 'SET rel += $metadata' : ''}
          RETURN rel, from, to
          `,
          {
            relationshipId: this.neo4jService.int(relationshipId),
            newRelationshipClassId: newRelationshipClassId,
            newProperties: newProperties,
            ...(Object.keys(metadata).length > 0 ? { metadata } : {})
          }
        )
        
        if (result.records.length === 0) {
          throw new Error(`Failed to update relationship ${relationshipId}`)
        }
        
        const record = result.records[0]
        const updatedRelationship = RelationshipModel.fromNeo4jRelationship(
          record.get('rel'),
          record.get('from'),
          record.get('to')
        )
        
        return {
          success: true,
          relationship: updatedRelationship,
          relationshipTypeChanged: false,
          compatibilityAnalysis: compatibility,
          appliedMappings: propertyMappings,
          preservedProperties: preserveLostProperties ? compatibility.lostProperties : {}
        }
      }
      
    } finally {
      await session.close()
    }
  }

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // No resources to clean up in RelationshipService
  }
}
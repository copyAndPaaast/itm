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

  async getAvailableRelationshipClasses() {
    // Get user-facing RelationshipClasses for UI selection
    const relationshipClasses = await this.relationshipClassService.getAllRelationshipClasses()
    return relationshipClasses
      .filter(rc => !rc.relationshipType.startsWith('_')) // Filter out ITM app internal types
      .map(rc => ({
        classId: rc.classId,
        relationshipClassName: rc.relationshipClassName,
        relationshipType: rc.relationshipType,
        description: rc.description,
        allowedFromTypes: rc.allowedFromTypes,
        allowedToTypes: rc.allowedToTypes
      }))
      .sort((a, b) => a.relationshipClassName.localeCompare(b.relationshipClassName))
  }

  async getRelationshipClassPropertySchema({relationshipClassId}) {
    const relationshipClass = await this.relationshipClassService.getRelationshipClass({classId: relationshipClassId})
    if (!relationshipClass) {
      throw new Error(`RelationshipClass with ID '${relationshipClassId}' not found`)
    }

    return {
      classId: relationshipClass.classId,
      relationshipClassName: relationshipClass.relationshipClassName,
      relationshipType: relationshipClass.relationshipType,
      description: relationshipClass.description,
      propertySchema: relationshipClass.propertySchema,
      requiredProperties: relationshipClass.requiredProperties,
      optionalProperties: relationshipClass.getOptionalProperties(),
      allowedFromTypes: relationshipClass.allowedFromTypes,
      allowedToTypes: relationshipClass.allowedToTypes,
      // Provide default values for properties
      defaultProperties: this.getDefaultPropertiesFromSchema(relationshipClass.propertySchema)
    }
  }

  getDefaultPropertiesFromSchema(propertySchema) {
    const defaults = {}
    for (const [propName, schema] of Object.entries(propertySchema)) {
      if (schema.default !== undefined) {
        defaults[propName] = schema.default
      } else if (schema.values && schema.values.length > 0) {
        defaults[propName] = schema.values[0] // First allowed value as default
      }
    }
    return defaults
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


  async getRelationshipClass({relationshipType}) {
    return await this.relationshipClassService.getRelationshipClassByType({relationshipType})
  }

  async validateRelationshipProperties({relationshipType, properties}) {
    return await this.relationshipClassService.validateRelationshipProperties({relationshipType, properties})
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

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // No resources to clean up in RelationshipService
  }
}
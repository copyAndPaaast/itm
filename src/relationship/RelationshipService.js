import { RelationshipInterface } from './RelationshipInterface.js'
import { RelationshipModel } from './RelationshipModel.js'
import { Neo4jService } from '../database/Neo4jService.js'

export class RelationshipService extends RelationshipInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
  }

  async createRelationship({fromId, toId, relationshipType, properties = {}, fromType = 'Asset', toType = 'Asset'}) {
    const session = this.neo4jService.getSession()
    
    try {
      // Validate relationship type name (Neo4j requirements)
      if (!this.isValidRelationshipType(relationshipType)) {
        throw new Error(`Invalid relationship type '${relationshipType}'. Must be uppercase with underscores only.`)
      }

      const relationship = new RelationshipModel({
        fromId,
        toId,
        fromType,
        toType,
        relationshipType,
        properties
      })

      // Build the Cypher query dynamically based on node types
      const fromLabel = fromType === 'Group' ? 'Group' : 'Asset'
      const toLabel = toType === 'Group' ? 'Group' : 'Asset'

      const result = await session.run(
        `
        MATCH (from:${fromLabel}), (to:${toLabel})
        WHERE id(from) = $fromId AND id(to) = $toId
        CREATE (from)-[r:${relationshipType} $properties]->(to)
        RETURN r, from, to
        `,
        { 
          fromId: this.neo4jService.int(fromId),
          toId: this.neo4jService.int(toId),
          properties: relationship.toNeo4jProperties()
        }
      )

      if (result.records.length === 0) {
        throw new Error(`Failed to create relationship. Source ${fromType}:${fromId} or target ${toType}:${toId} not found.`)
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

  async getRelationshipsFrom({nodeId, nodeType = 'Asset'}) {
    const session = this.neo4jService.getSession()
    
    try {
      const fromLabel = nodeType === 'Group' ? 'Group' : 'Asset'
      
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

  async getRelationshipsTo({nodeId, nodeType = 'Asset'}) {
    const session = this.neo4jService.getSession()
    
    try {
      const toLabel = nodeType === 'Group' ? 'Group' : 'Asset'
      
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

  async getAllRelationships({nodeId, nodeType = 'Asset'}) {
    const session = this.neo4jService.getSession()
    
    try {
      const nodeLabel = nodeType === 'Group' ? 'Group' : 'Asset'
      
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

  async relationshipExists({fromId, toId, relationshipType, fromType = 'Asset', toType = 'Asset'}) {
    const session = this.neo4jService.getSession()
    
    try {
      const fromLabel = fromType === 'Group' ? 'Group' : 'Asset'
      const toLabel = toType === 'Group' ? 'Group' : 'Asset'

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

  // Helper method to validate Neo4j relationship type names
  isValidRelationshipType(relationshipType) {
    // Neo4j relationship types should be uppercase with underscores
    return /^[A-Z][A-Z0-9_]*$/.test(relationshipType)
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


  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // No resources to clean up in RelationshipService
  }
}
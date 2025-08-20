import { RelationshipClassInterface } from './RelationshipClassInterface.js'
import { RelationshipClassModel } from './RelationshipClassModel.js'
import { Neo4jService } from '../../database/Neo4jService.js'

export class RelationshipClassService extends RelationshipClassInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
  }

  async createRelationshipClass({relationshipClassName, relationshipType, propertySchema, requiredProperties = [], allowedFromTypes = ['Asset'], allowedToTypes = ['Asset'], description = ''}) {
    const session = this.neo4jService.getSession()
    
    try {
      // Check if RelationshipClass already exists
      const exists = await this.relationshipClassExists({relationshipClassName})
      if (exists) {
        throw new Error(`RelationshipClass with name '${relationshipClassName}' already exists`)
      }

      // Validate relationship type format
      if (!this.isValidRelationshipTypeName(relationshipType)) {
        throw new Error(`Invalid relationship type '${relationshipType}'. Must be uppercase with underscores only.`)
      }

      // Validate property schema
      const schemaValidation = await this.validateRelationshipClassSchema({propertySchema})
      if (!schemaValidation.valid) {
        throw new Error(`Invalid property schema: ${schemaValidation.errors.join(', ')}`)
      }

      const relationshipClass = new RelationshipClassModel({
        relationshipClassName,
        relationshipType,
        propertySchema,
        requiredProperties,
        allowedFromTypes,
        allowedToTypes,
        description
      })

      const result = await session.run(
        `
        CREATE (rc:_RelationshipClass $properties)
        RETURN rc
        `,
        { properties: relationshipClass.toNeo4jProperties() }
      )

      if (result.records.length === 0) {
        throw new Error('Failed to create RelationshipClass')
      }

      return RelationshipClassModel.fromNeo4jNode(result.records[0].get('rc'))
    } finally {
      await session.close()
    }
  }

  async getRelationshipClass({classId = null, relationshipClassName = null}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (rc:_RelationshipClass)
        WHERE (CASE WHEN $classId IS NOT NULL THEN id(rc) = $classId ELSE false END) OR 
              (CASE WHEN $relationshipClassName IS NOT NULL THEN rc.relationshipClassName = $relationshipClassName ELSE false END)
        RETURN rc
        `,
        { 
          classId: classId ? this.neo4jService.int(classId) : null,
          relationshipClassName: relationshipClassName || null
        }
      )

      if (result.records.length === 0) {
        // Get available classes for error message
        const availableResult = await session.run(
          `
          MATCH (rc:_RelationshipClass)
          WHERE rc.isActive = true
          RETURN rc.relationshipClassName + ' (' + toString(id(rc)) + ')' as classInfo
          ORDER BY rc.relationshipClassName
          `
        )
        const classNames = availableResult.records.map(record => record.get('classInfo')).join(', ')
        throw new Error(`RelationshipClass '${classId || relationshipClassName}' not found. Available classes: ${classNames}`)
      }

      return RelationshipClassModel.fromNeo4jNode(result.records[0].get('rc'))
    } finally {
      await session.close()
    }
  }

  async getAllRelationshipClasses() {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (rc:_RelationshipClass)
        WHERE rc.isActive = true
        RETURN rc
        ORDER BY rc.relationshipClassName
        `
      )

      return result.records.map(record => 
        RelationshipClassModel.fromNeo4jNode(record.get('rc'))
      )
    } finally {
      await session.close()
    }
  }

  async getRelationshipClassByType({relationshipType}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (rc:_RelationshipClass)
        WHERE rc.relationshipType = $relationshipType AND rc.isActive = true
        RETURN rc
        `,
        { relationshipType }
      )

      if (result.records.length === 0) {
        return null
      }

      return RelationshipClassModel.fromNeo4jNode(result.records[0].get('rc'))
    } finally {
      await session.close()
    }
  }

  async updateRelationshipClass({classId, updates}) {
    const session = this.neo4jService.getSession()
    
    try {
      const allowedUpdates = ['relationshipClassName', 'relationshipType', 'propertySchema', 'requiredProperties', 'allowedFromTypes', 'allowedToTypes', 'description', 'isActive']
      const updateProperties = {}
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          if (key === 'propertySchema') {
            updateProperties[key] = JSON.stringify(value)
          } else if (key === 'allowedFromTypes' || key === 'allowedToTypes') {
            updateProperties[key] = JSON.stringify(value)
          } else {
            updateProperties[key] = value
          }
        }
      }

      if (Object.keys(updateProperties).length === 0) {
        throw new Error('No valid properties to update')
      }

      const result = await session.run(
        `
        MATCH (rc:_RelationshipClass)
        WHERE id(rc) = $classId
        SET rc += $updates
        RETURN rc
        `,
        { 
          classId: this.neo4jService.int(classId),
          updates: updateProperties
        }
      )

      if (result.records.length === 0) {
        return null
      }

      return RelationshipClassModel.fromNeo4jNode(result.records[0].get('rc'))
    } finally {
      await session.close()
    }
  }

  async deleteRelationshipClass({classId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (rc:_RelationshipClass)
        WHERE id(rc) = $classId
        DELETE rc
        RETURN count(rc) as deletedCount
        `,
        { classId: this.neo4jService.int(classId) }
      )

      return result.records[0]?.get('deletedCount')?.toNumber() > 0
    } finally {
      await session.close()
    }
  }

  async relationshipClassExists({relationshipClassName}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (rc:_RelationshipClass)
        WHERE rc.relationshipClassName = $relationshipClassName
        RETURN count(rc) > 0 as exists
        `,
        { relationshipClassName }
      )

      return result.records[0]?.get('exists') || false
    } finally {
      await session.close()
    }
  }

  async validateRelationshipProperties({classId = null, relationshipClassName = null, relationshipType = null, properties}) {
    let relationshipClass

    if (classId || relationshipClassName) {
      relationshipClass = await this.getRelationshipClass({classId, relationshipClassName})
    } else if (relationshipType) {
      relationshipClass = await this.getRelationshipClassByType({relationshipType})
    }

    if (!relationshipClass) {
      return {
        valid: false,
        errors: [`RelationshipClass not found`]
      }
    }

    return relationshipClass.validateAllProperties(properties)
  }

  async getRelationshipClassSchema({classId = null, relationshipClassName = null}) {
    const relationshipClass = await this.getRelationshipClass({classId, relationshipClassName})
    if (!relationshipClass) {
      const availableClasses = await this.getAllRelationshipClasses()
      const classNames = availableClasses.map(rc => `${rc.relationshipClassName} (${rc.classId})`).join(', ')
      throw new Error(`RelationshipClass '${classId || relationshipClassName}' not found. Available classes: ${classNames}`)
    }

    return {
      classId: relationshipClass.classId,
      relationshipClassName: relationshipClass.relationshipClassName,
      relationshipType: relationshipClass.relationshipType,
      description: relationshipClass.description,
      propertySchema: relationshipClass.propertySchema,
      requiredProperties: relationshipClass.getRequiredProperties(),
      optionalProperties: relationshipClass.getOptionalProperties(),
      allowedFromTypes: relationshipClass.allowedFromTypes,
      allowedToTypes: relationshipClass.allowedToTypes
    }
  }

  async validateRelationshipClassSchema({propertySchema}) {
    const errors = []

    for (const [propertyName, schema] of Object.entries(propertySchema)) {
      if (typeof schema !== 'object') {
        errors.push(`Schema for property ${propertyName} must be an object`)
        continue
      }

      if (schema.type && !['string', 'number', 'boolean', 'object', 'array'].includes(schema.type)) {
        errors.push(`Invalid type ${schema.type} for property ${propertyName}`)
      }

      if (schema.values && !Array.isArray(schema.values)) {
        errors.push(`Values for property ${propertyName} must be an array`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  async getAvailableRelationshipClasses() {
    // Get user-facing RelationshipClasses for UI selection (filters out ITM internal types)
    const relationshipClasses = await this.getAllRelationshipClasses()
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
    const relationshipClass = await this.getRelationshipClass({classId: relationshipClassId})
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
  isValidRelationshipTypeName(relationshipType) {
    // Neo4j relationship types should be uppercase with underscores
    // ITM app internal relationships start with underscore
    return /^_?[A-Z][A-Z0-9_]*$/.test(relationshipType)
  }

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // No resources to clean up in RelationshipClassService
  }
}
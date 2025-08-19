import { AssetClassInterface } from './AssetClassInterface.js'
import { AssetClassModel } from './AssetClassModel.js'
import { Neo4jService } from '../database/Neo4jService.js'

export class AssetClassService extends AssetClassInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
  }

  async createAssetClass(className, propertySchema, requiredProperties = []) {
    const session = this.neo4jService.getSession()
    
    try {
      // Check if AssetClass already exists
      const exists = await this.assetClassExists(className)
      if (exists) {
        throw new Error(`AssetClass with name '${className}' already exists`)
      }

      const assetClass = new AssetClassModel({
        className,
        propertySchema,
        requiredProperties
      })

      const result = await session.run(
        `
        CREATE (ac:AssetClass $properties)
        RETURN ac
        `,
        { properties: assetClass.toNeo4jProperties() }
      )

      if (result.records.length === 0) {
        throw new Error('Failed to create AssetClass')
      }

      return AssetClassModel.fromNeo4jNode(result.records[0].get('ac'))
    } finally {
      await session.close()
    }
  }

  async getAssetClass(classId) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (ac:AssetClass)
        WHERE id(ac) = $classId
        RETURN ac
        `,
        { classId: neo4j.int(classId) }
      )

      if (result.records.length === 0) {
        return null
      }

      return AssetClassModel.fromNeo4jNode(result.records[0].get('ac'))
    } finally {
      await session.close()
    }
  }

  async getAllAssetClasses() {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (ac:AssetClass)
        WHERE ac.isActive = true
        RETURN ac
        ORDER BY ac.className
        `
      )

      return result.records.map(record => 
        AssetClassModel.fromNeo4jNode(record.get('ac'))
      )
    } finally {
      await session.close()
    }
  }

  async updateAssetClass(classId, updates) {
    const session = this.neo4jService.getSession()
    
    try {
      const allowedUpdates = ['className', 'propertySchema', 'requiredProperties', 'isActive']
      const updateProperties = {}
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          if (key === 'propertySchema') {
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
        MATCH (ac:AssetClass)
        WHERE id(ac) = $classId
        SET ac += $updates
        RETURN ac
        `,
        { 
          classId: neo4j.int(classId),
          updates: updateProperties
        }
      )

      if (result.records.length === 0) {
        return null
      }

      return AssetClassModel.fromNeo4jNode(result.records[0].get('ac'))
    } finally {
      await session.close()
    }
  }

  async deleteAssetClass(classId) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (ac:AssetClass)
        WHERE id(ac) = $classId
        DELETE ac
        RETURN count(ac) as deletedCount
        `,
        { classId: neo4j.int(classId) }
      )

      return result.records[0]?.get('deletedCount')?.toNumber() > 0
    } finally {
      await session.close()
    }
  }

  async validateAssetClassSchema(propertySchema) {
    const errors = []

    for (const [propertyName, schema] of Object.entries(propertySchema)) {
      if (typeof schema !== 'object') {
        errors.push(`Schema for property ${propertyName} must be an object`)
        continue
      }

      if (schema.type && !['string', 'number', 'boolean', 'object', 'array'].includes(schema.type)) {
        errors.push(`Invalid type ${schema.type} for property ${propertyName}`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  async assetClassExists(className) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (ac:AssetClass)
        WHERE ac.className = $className
        RETURN count(ac) > 0 as exists
        `,
        { className }
      )

      return result.records[0]?.get('exists') || false
    } finally {
      await session.close()
    }
  }

  async getAssetClassByName(className) {
    const allClasses = await this.getAllAssetClasses()
    const assetClass = allClasses.find(ac => ac.className === className)
    
    if (!assetClass) {
      const classNames = allClasses.map(ac => ac.className).join(', ')
      throw new Error(`AssetClass '${className}' not found. Available classes: ${classNames}`)
    }
    
    return assetClass
  }

  async validatePropertiesForAssetClass(assetClassId, properties) {
    const assetClass = await this.getAssetClass(assetClassId)
    if (!assetClass) {
      return {
        valid: false,
        errors: [`AssetClass with ID '${assetClassId}' not found`]
      }
    }

    return assetClass.validateAllProperties(properties)
  }

  async validatePropertiesForAssetClassName(className, properties) {
    const assetClass = await this.getAssetClassByName(className)
    return assetClass.validateAllProperties(properties)
  }

  async getAssetClassSchema(assetClassId) {
    const assetClass = await this.getAssetClass(assetClassId)
    if (!assetClass) {
      const availableClasses = await this.getAllAssetClasses()
      const classNames = availableClasses.map(ac => `${ac.className} (${ac.classId})`).join(', ')
      throw new Error(`AssetClass '${assetClassId}' not found. Available classes: ${classNames}`)
    }

    return {
      classId: assetClass.classId,
      className: assetClass.className,
      description: assetClass.description,
      propertySchema: assetClass.propertySchema,
      requiredProperties: Object.entries(assetClass.propertySchema)
        .filter(([key, def]) => def.required)
        .map(([key, def]) => key),
      optionalProperties: Object.entries(assetClass.propertySchema)
        .filter(([key, def]) => !def.required)
        .map(([key, def]) => key)
    }
  }

  async getAssetClassSchemaByName(className) {
    const assetClass = await this.getAssetClassByName(className)
    return this.getAssetClassSchema(assetClass.classId)
  }

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // No resources to clean up in AssetClassService
  }
}
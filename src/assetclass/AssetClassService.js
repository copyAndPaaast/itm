import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'
import { AssetClassInterface } from './AssetClassInterface.js'
import { AssetClassModel } from './AssetClassModel.js'

dotenv.config()

export class AssetClassService extends AssetClassInterface {
  constructor() {
    super()
    this.driver = neo4j.driver(
      process.env.NEO4J_URI,
      neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
    )
    this.database = process.env.NEO4J_DATABASE || 'neo4j'
  }

  async createAssetClass(className, propertySchema, requiredProperties = []) {
    const session = this.driver.session({ database: this.database })
    
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
    const session = this.driver.session({ database: this.database })
    
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
    const session = this.driver.session({ database: this.database })
    
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
    const session = this.driver.session({ database: this.database })
    
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
    const session = this.driver.session({ database: this.database })
    
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
    const session = this.driver.session({ database: this.database })
    
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

  async close() {
    await this.driver.close()
  }
}
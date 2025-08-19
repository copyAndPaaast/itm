export class AssetClassModel {
  constructor({
    classId = null,
    className,
    propertySchema = {},
    requiredProperties = [],
    createdBy = 'system',
    createdDate = new Date().toISOString(),
    isActive = true
  }) {
    this.classId = classId
    this.className = className
    this.propertySchema = propertySchema
    this.requiredProperties = requiredProperties
    this.createdBy = createdBy
    this.createdDate = createdDate
    this.isActive = isActive
  }

  static fromNeo4jNode(node) {
    const properties = node.properties
    let propertySchema = {}
    try {
      propertySchema = JSON.parse(properties.propertySchema || '{}')
    } catch (e) {
      console.warn('Failed to parse propertySchema:', e.message)
    }
    
    return new AssetClassModel({
      classId: node.identity?.toString(),
      className: properties.className,
      propertySchema,
      requiredProperties: properties.requiredProperties || [],
      createdBy: properties.createdBy,
      createdDate: properties.createdDate,
      isActive: properties.isActive !== false
    })
  }

  toNeo4jProperties() {
    return {
      className: this.className,
      propertySchema: JSON.stringify(this.propertySchema),
      requiredProperties: this.requiredProperties,
      createdBy: this.createdBy,
      createdDate: this.createdDate,
      isActive: this.isActive
    }
  }

  validateProperty(propertyName, propertyValue) {
    const schema = this.propertySchema[propertyName]
    if (!schema) {
      return { valid: true }
    }

    if (schema.type && typeof propertyValue !== schema.type) {
      return { 
        valid: false, 
        error: `Property ${propertyName} must be of type ${schema.type}` 
      }
    }

    if (schema.required && (propertyValue === null || propertyValue === undefined)) {
      return { 
        valid: false, 
        error: `Property ${propertyName} is required` 
      }
    }

    return { valid: true }
  }

  validateAllProperties(properties) {
    const errors = []

    for (const required of this.requiredProperties) {
      if (!(required in properties)) {
        errors.push(`Required property ${required} is missing`)
      }
    }

    for (const [name, value] of Object.entries(properties)) {
      const validation = this.validateProperty(name, value)
      if (!validation.valid) {
        errors.push(validation.error)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
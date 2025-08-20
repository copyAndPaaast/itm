export class RelationshipClassModel {
  constructor({
    classId = null,
    relationshipClassName,
    relationshipType,
    propertySchema = {},
    requiredProperties = [],
    allowedFromTypes = ['Asset'],
    allowedToTypes = ['Asset'],
    description = '',
    createdBy = 'system',
    createdDate = new Date().toISOString(),
    isActive = true
  }) {
    this.classId = classId
    this.relationshipClassName = relationshipClassName
    this.relationshipType = relationshipType
    this.propertySchema = propertySchema
    this.requiredProperties = requiredProperties
    this.allowedFromTypes = allowedFromTypes
    this.allowedToTypes = allowedToTypes
    this.description = description
    this.createdBy = createdBy
    this.createdDate = createdDate
    this.isActive = isActive
  }

  static fromNeo4jNode(node) {
    const properties = node.properties
    let propertySchema = {}
    let allowedFromTypes = ['Asset']
    let allowedToTypes = ['Asset']
    
    try {
      propertySchema = JSON.parse(properties.propertySchema || '{}')
    } catch (e) {
      console.warn('Failed to parse propertySchema:', e.message)
    }

    try {
      allowedFromTypes = JSON.parse(properties.allowedFromTypes || '["Asset"]')
    } catch (e) {
      console.warn('Failed to parse allowedFromTypes:', e.message)
    }

    try {
      allowedToTypes = JSON.parse(properties.allowedToTypes || '["Asset"]')
    } catch (e) {
      console.warn('Failed to parse allowedToTypes:', e.message)
    }
    
    return new RelationshipClassModel({
      classId: node.identity?.toString(),
      relationshipClassName: properties.relationshipClassName,
      relationshipType: properties.relationshipType,
      propertySchema,
      requiredProperties: properties.requiredProperties || [],
      allowedFromTypes,
      allowedToTypes,
      description: properties.description || '',
      createdBy: properties.createdBy,
      createdDate: properties.createdDate,
      isActive: properties.isActive !== false
    })
  }

  toNeo4jProperties() {
    return {
      relationshipClassName: this.relationshipClassName,
      relationshipType: this.relationshipType,
      propertySchema: JSON.stringify(this.propertySchema),
      requiredProperties: this.requiredProperties,
      allowedFromTypes: JSON.stringify(this.allowedFromTypes),
      allowedToTypes: JSON.stringify(this.allowedToTypes),
      description: this.description,
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

    if (schema.values && !schema.values.includes(propertyValue)) {
      return {
        valid: false,
        error: `Property ${propertyName} must be one of: ${schema.values.join(', ')}`
      }
    }

    if (schema.minLength && typeof propertyValue === 'string' && propertyValue.length < schema.minLength) {
      return {
        valid: false,
        error: `Property ${propertyName} must be at least ${schema.minLength} characters`
      }
    }

    if (schema.maxLength && typeof propertyValue === 'string' && propertyValue.length > schema.maxLength) {
      return {
        valid: false,
        error: `Property ${propertyName} must be at most ${schema.maxLength} characters`
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

  validateNodeTypes(fromType, toType) {
    const errors = []

    if (!this.allowedFromTypes.includes(fromType)) {
      errors.push(`Source node type '${fromType}' not allowed. Allowed types: ${this.allowedFromTypes.join(', ')}`)
    }

    if (!this.allowedToTypes.includes(toType)) {
      errors.push(`Target node type '${toType}' not allowed. Allowed types: ${this.allowedToTypes.join(', ')}`)
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  getRequiredProperties() {
    return this.requiredProperties.slice()
  }

  getOptionalProperties() {
    return Object.keys(this.propertySchema).filter(prop => !this.requiredProperties.includes(prop))
  }

  isValidRelationshipType(relationshipType) {
    return this.relationshipType === relationshipType
  }
}
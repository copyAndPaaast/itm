export class RelationshipModel {
  constructor({
    relationshipId = null,
    tempUID = null,
    fromId,
    toId,
    fromType = 'Asset', // 'Asset' or 'Group'
    toType = 'Asset',   // 'Asset' or 'Group'
    relationshipType,
    properties = {},
    createdBy = 'system',
    createdDate = new Date().toISOString(),
    isActive = true
  }) {
    this.relationshipId = relationshipId
    this.tempUID = tempUID || this.generateTempUID()
    this.fromId = fromId
    this.toId = toId
    this.fromType = fromType
    this.toType = toType
    this.relationshipType = relationshipType
    this.properties = properties
    this.createdBy = createdBy
    this.createdDate = createdDate
    this.isActive = isActive
  }

  generateTempUID() {
    return `rel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static fromNeo4jRelationship(relationship, fromNode, toNode) {
    const relProps = relationship.properties
    
    // Determine node types based on labels
    const fromType = fromNode.labels.includes('Group') ? 'Group' : 'Asset'
    const toType = toNode.labels.includes('Group') ? 'Group' : 'Asset'

    // Extract custom properties (exclude system properties)
    const systemProps = ['tempUID', 'createdBy', 'createdDate', 'isActive']
    let properties = {}
    
    for (const [key, value] of Object.entries(relProps)) {
      if (!systemProps.includes(key)) {
        properties[key] = value
      }
    }

    return new RelationshipModel({
      relationshipId: relationship.identity?.toString(),
      tempUID: relProps.tempUID,
      fromId: fromNode.identity?.toString(),
      toId: toNode.identity?.toString(),
      fromType,
      toType,
      relationshipType: relationship.type,
      properties,
      createdBy: relProps.createdBy,
      createdDate: relProps.createdDate,
      isActive: relProps.isActive !== false
    })
  }

  toNeo4jProperties() {
    return {
      tempUID: this.tempUID,
      ...this.properties,
      createdBy: this.createdBy,
      createdDate: this.createdDate,
      isActive: this.isActive
    }
  }

  getId() {
    return this.relationshipId || this.tempUID
  }

  isPersisted() {
    return this.relationshipId !== null
  }

  updateProperty(key, value) {
    this.properties[key] = value
  }

  removeProperty(key) {
    delete this.properties[key]
  }

  getProperty(key, defaultValue = null) {
    return this.properties[key] ?? defaultValue
  }

  // Helper methods for relationship direction and types
  isFromAsset() {
    return this.fromType === 'Asset'
  }

  isFromGroup() {
    return this.fromType === 'Group'
  }

  isToAsset() {
    return this.toType === 'Asset'
  }

  isToGroup() {
    return this.toType === 'Group'
  }

  isAssetToAsset() {
    return this.fromType === 'Asset' && this.toType === 'Asset'
  }

  isGroupToAsset() {
    return this.fromType === 'Group' && this.toType === 'Asset'
  }

  isAssetToGroup() {
    return this.fromType === 'Asset' && this.toType === 'Group'
  }

  isGroupToGroup() {
    return this.fromType === 'Group' && this.toType === 'Group'
  }

  getDescription() {
    const fromDesc = `${this.fromType}:${this.fromId}`
    const toDesc = `${this.toType}:${this.toId}`
    return `${fromDesc} -[${this.relationshipType}]-> ${toDesc}`
  }
}
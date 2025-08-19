export class GroupModel {
  constructor({
    groupId = null,
    tempUID = null,
    groupName,
    groupType,
    description = '',
    members = [],
    metadata = {},
    createdBy = 'system',
    createdDate = new Date().toISOString(),
    isActive = true
  }) {
    this.groupId = groupId
    this.tempUID = tempUID || this.generateTempUID()
    this.groupName = groupName
    this.groupType = groupType
    this.description = description
    this.members = members
    this.metadata = metadata
    this.createdBy = createdBy
    this.createdDate = createdDate
    this.isActive = isActive
  }

  generateTempUID() {
    return `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static fromNeo4jNode(node) {
    const nodeProps = node.properties
    
    return new GroupModel({
      groupId: node.identity?.toString(),
      tempUID: nodeProps.tempUID,
      groupName: nodeProps.groupName,
      groupType: nodeProps.groupType,
      description: nodeProps.description || '',
      members: [], // Members loaded separately via relationships
      metadata: nodeProps.metadata ? JSON.parse(nodeProps.metadata) : {},
      createdBy: nodeProps.createdBy,
      createdDate: nodeProps.createdDate,
      isActive: nodeProps.isActive !== false
    })
  }

  toNeo4jProperties() {
    return {
      tempUID: this.tempUID,
      groupName: this.groupName,
      groupType: this.groupType,
      description: this.description,
      metadata: JSON.stringify(this.metadata),
      createdBy: this.createdBy,
      createdDate: this.createdDate,
      isActive: this.isActive
    }
  }

  getId() {
    return this.groupId || this.tempUID
  }

  isPersisted() {
    return this.groupId !== null
  }

  addMember(nodeId) {
    if (!this.members.includes(nodeId)) {
      this.members.push(nodeId)
    }
  }

  removeMember(nodeId) {
    this.members = this.members.filter(id => id !== nodeId)
  }

  hasMember(nodeId) {
    return this.members.includes(nodeId)
  }

  getMemberCount() {
    return this.members.length
  }

  updateMetadata(key, value) {
    this.metadata[key] = value
  }

  removeMetadata(key) {
    delete this.metadata[key]
  }

  getMetadata(key, defaultValue = null) {
    return this.metadata[key] ?? defaultValue
  }
}
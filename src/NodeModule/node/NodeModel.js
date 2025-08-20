export class NodeModel {
  constructor({
    nodeId = null,
    tempUID = null,
    assetClassId,
    title,
    properties = {},
    labels = [],
    createdBy = 'system',
    createdDate = new Date().toISOString(),
    isActive = true
  }) {
    this.nodeId = nodeId
    this.tempUID = tempUID || this.generateTempUID()
    this.assetClassId = assetClassId
    this.title = title
    this.properties = properties
    this.labels = labels
    this.createdBy = createdBy
    this.createdDate = createdDate
    this.isActive = isActive
  }

  generateTempUID() {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  static fromNeo4jNode(node) {
    const nodeProps = node.properties
    let properties = {}

    // Extract custom properties (exclude system properties)
    const systemProps = ['assetClassId', 'title', 'createdBy', 'createdDate', 'isActive', 'tempUID']
    for (const [key, value] of Object.entries(nodeProps)) {
      if (!systemProps.includes(key)) {
        properties[key] = value
      }
    }

    return new NodeModel({
      nodeId: node.identity?.toString(),
      tempUID: nodeProps.tempUID,
      assetClassId: nodeProps.assetClassId,
      title: nodeProps.title,
      properties,
      labels: node.labels || [],
      createdBy: nodeProps.createdBy,
      createdDate: nodeProps.createdDate,
      isActive: nodeProps.isActive !== false
    })
  }

  toNeo4jProperties() {
    return {
      tempUID: this.tempUID,
      assetClassId: this.assetClassId,
      title: this.title,
      ...this.properties,
      createdBy: this.createdBy,
      createdDate: this.createdDate,
      isActive: this.isActive
    }
  }

  getId() {
    return this.nodeId || this.tempUID
  }

  isPersisted() {
    return this.nodeId !== null
  }

  addLabel(label) {
    if (!this.labels.includes(label)) {
      this.labels.push(label)
    }
  }

  removeLabel(label) {
    this.labels = this.labels.filter(l => l !== label)
  }

  hasLabel(label) {
    return this.labels.includes(label)
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
}

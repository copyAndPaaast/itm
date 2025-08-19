export class SystemModel {
  constructor({
    systemLabel,
    displayName = null,
    description = null,
    nodeCount = 0,
    createdBy = 'system',
    createdDate = new Date().toISOString(),
    isActive = true,
    metadata = {}
  }) {
    this.systemLabel = systemLabel
    this.displayName = displayName || systemLabel
    this.description = description
    this.nodeCount = nodeCount
    this.createdBy = createdBy
    this.createdDate = createdDate
    this.isActive = isActive
    this.metadata = metadata
  }

  static fromSystemData(systemLabel, stats = {}) {
    return new SystemModel({
      systemLabel,
      nodeCount: stats.nodeCount || 0,
      ...stats
    })
  }

  static fromLabelAnalysis(systemLabel, nodes = []) {
    const nodeCount = nodes.length
    const assetClasses = [...new Set(nodes.map(node => node.assetClassId))]
    
    return new SystemModel({
      systemLabel,
      nodeCount,
      metadata: {
        assetClasses,
        assetClassCount: assetClasses.length
      }
    })
  }

  addNode() {
    this.nodeCount++
  }

  removeNode() {
    if (this.nodeCount > 0) {
      this.nodeCount--
    }
  }

  isEmpty() {
    return this.nodeCount === 0
  }

  getDisplayInfo() {
    return {
      label: this.systemLabel,
      name: this.displayName,
      description: this.description,
      nodeCount: this.nodeCount,
      isEmpty: this.isEmpty()
    }
  }

  updateMetadata(key, value) {
    this.metadata[key] = value
  }

  getMetadata(key, defaultValue = null) {
    return this.metadata[key] ?? defaultValue
  }
}
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

  getAssetClassName() {
    // In the demo, nodes are created with labels like: ['Asset', 'DemoServer', 'ProdWebSystem', ...]
    // The AssetClass name should be 'DemoServer' (from the AssetClass)
    // System labels are additional labels beyond Asset and AssetClass
    // For now, we'll use a heuristic: find the label that looks like an AssetClass name
    // (typically contains common class patterns or is the second label after 'Asset')
    
    const nonAssetLabels = this.labels.filter(label => label !== 'Asset')
    if (nonAssetLabels.length === 0) return 'Unknown'
    
    // Look for common AssetClass patterns first
    const classPatterns = /^(.*Class|.*Server|.*App|.*Device|.*Component)$/i
    const classMatch = nonAssetLabels.find(label => classPatterns.test(label))
    if (classMatch) return classMatch
    
    // Fallback to first non-Asset label if no pattern match
    return nonAssetLabels[0]
  }

  getSystemLabels() {
    // Get all labels except 'Asset' and the AssetClass name
    const assetClassName = this.getAssetClassName()
    return this.labels.filter(label => 
      label !== 'Asset' && 
      label !== assetClassName
    )
  }
}

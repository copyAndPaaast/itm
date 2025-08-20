/**
 * SystemModel represents ITM app internal system entities.
 * These nodes store system metadata while the corresponding labels provide performance.
 * 
 * Architecture:
 * - ITM App Internal: Uses '_System' label (underscore prefix)
 * - Hybrid Approach: Entity for data storage, label for node membership performance
 * - User Separation: System management data is separate from user asset data
 */
export class SystemModel {
  constructor({
    systemId = null,
    systemName,
    systemLabel,
    description = '',
    properties = {},
    nodeCount = 0,
    createdBy = 'system',
    createdDate = new Date().toISOString(),
    isActive = true
  }) {
    this.systemId = systemId
    this.systemName = systemName
    this.systemLabel = systemLabel
    this.description = description
    this.properties = properties
    this.nodeCount = nodeCount
    this.createdBy = createdBy
    this.createdDate = createdDate
    this.isActive = isActive
  }

  static fromNeo4jNode(node) {
    const nodeProps = node.properties
    let properties = {}

    // Extract custom properties (exclude system properties)
    const systemProps = ['systemName', 'systemLabel', 'description', 'nodeCount', 'createdBy', 'createdDate', 'isActive']
    for (const [key, value] of Object.entries(nodeProps)) {
      if (!systemProps.includes(key)) {
        properties[key] = value
      }
    }

    return new SystemModel({
      systemId: node.identity?.toString(),
      systemName: nodeProps.systemName,
      systemLabel: nodeProps.systemLabel,
      description: nodeProps.description || '',
      properties,
      nodeCount: nodeProps.nodeCount?.toNumber() || 0,
      createdBy: nodeProps.createdBy,
      createdDate: nodeProps.createdDate,
      isActive: nodeProps.isActive !== false
    })
  }

  static fromSystemData(systemLabel, stats = {}) {
    return new SystemModel({
      systemName: stats.systemName || systemLabel,
      systemLabel,
      nodeCount: stats.nodeCount || 0,
      ...stats
    })
  }

  static fromLabelAnalysis(systemLabel, nodes = []) {
    const nodeCount = nodes.length
    const assetClasses = [...new Set(nodes.map(node => node.assetClassId))]
    
    return new SystemModel({
      systemName: systemLabel,
      systemLabel,
      nodeCount,
      properties: {
        assetClasses,
        assetClassCount: assetClasses.length
      }
    })
  }

  toNeo4jProperties() {
    return {
      systemName: this.systemName,
      systemLabel: this.systemLabel,
      description: this.description,
      nodeCount: this.nodeCount,
      ...this.properties,
      createdBy: this.createdBy,
      createdDate: this.createdDate,
      isActive: this.isActive
    }
  }

  getId() {
    return this.systemId
  }

  isPersisted() {
    return this.systemId !== null
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
      systemId: this.systemId,
      label: this.systemLabel,
      name: this.systemName,
      description: this.description,
      nodeCount: this.nodeCount,
      isEmpty: this.isEmpty(),
      isActive: this.isActive
    }
  }

  /**
   * Validates that the system label follows Neo4j label conventions.
   * 
   * @returns {Object} Validation result with valid flag and any errors
   */
  validateSystemLabel() {
    const errors = []
    
    if (!this.systemLabel || typeof this.systemLabel !== 'string') {
      errors.push('System label must be a non-empty string')
      return { valid: false, errors }
    }
    
    // Neo4j label validation
    if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(this.systemLabel)) {
      errors.push('System label must start with a letter and contain only letters, numbers, and underscores')
    }
    
    // Prevent conflicts with ITM app internal labels
    if (this.systemLabel.startsWith('_')) {
      errors.push('System labels cannot start with underscore (reserved for ITM app internal use)')
    }
    
    // Prevent conflicts with core labels
    const reservedLabels = ['Asset', 'Group', 'AssetClass', 'RelationshipClass']
    if (reservedLabels.includes(this.systemLabel)) {
      errors.push(`System label '${this.systemLabel}' is reserved for ITM app internal use`)
    }
    
    return { valid: errors.length === 0, errors }
  }

  /**
   * Gets a summary of the system for display purposes.
   * 
   * @returns {Object} Display-ready system information
   */
  getDisplaySummary() {
    return {
      systemId: this.systemId,
      systemName: this.systemName,
      systemLabel: this.systemLabel,
      description: this.description,
      nodeCount: this.nodeCount,
      isActive: this.isActive,
      hasCustomProperties: Object.keys(this.properties).length > 0,
      customPropertyCount: Object.keys(this.properties).length
    }
  }
}
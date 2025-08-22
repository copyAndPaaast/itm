/**
 * GraphViewerMapper - Data Transformation Layer
 * 
 * Handles mapping from business data to Cytoscape elements
 * Supports both systems (compounds) and groups (hulls)
 */

export class GraphViewerMapper {
  constructor() {
    this.nodeMapping = new Map() // businessId -> displayId
    this.systemCompounds = new Map() // systemName -> compoundId
    this.displayCounter = 0
  }

  /**
   * Generate unique display ID for Cytoscape elements
   */
  generateDisplayId(prefix = 'display') {
    return `${prefix}_${++this.displayCounter}_${Date.now()}`
  }

  /**
   * Map business data to Cytoscape elements
   */
  mapToElements(nodes, edges) {
    // Reset mappings
    this.nodeMapping.clear()
    this.systemCompounds.clear()

    const elements = []

    // Step 1: Create system compounds
    this.createSystemCompounds(nodes, elements)

    // Step 2: Create nodes  
    this.createNodes(nodes, elements)

    // Step 3: Create edges
    this.createEdges(edges, elements)

    console.log(`Mapped ${nodes.length} nodes, ${edges.length} edges to ${elements.length} elements`)
    return elements
  }

  /**
   * Create system compound elements
   */
  createSystemCompounds(nodes, elements) {
    const systems = new Set()
    
    // Collect all system names
    nodes.forEach(node => {
      if (node.systems && node.systems.length > 0) {
        node.systems.forEach(system => systems.add(system))
      }
    })

    // Create compound for each system
    systems.forEach(systemName => {
      const compoundId = this.generateDisplayId('system')
      
      elements.push({
        group: 'nodes',
        data: {
          id: compoundId,
          label: `System: ${systemName}`,
          isCompound: true,
          compoundType: 'system',
          systemName: systemName
        },
        classes: 'system-compound'
      })

      this.systemCompounds.set(systemName, compoundId)
    })
  }

  /**
   * Create node elements
   */
  createNodes(nodes, elements) {
    nodes.forEach(node => {
      const businessId = node.nodeId
      const displayId = this.generateDisplayId('node')
      
      // Find parent system compound
      let parentId = null
      if (node.systems && node.systems.length > 0) {
        // Use first system as parent
        parentId = this.systemCompounds.get(node.systems[0])
      }

      const nodeElement = {
        group: 'nodes',
        data: {
          id: displayId,
          label: node.title || `Node ${businessId}`,
          originalNodeId: businessId,
          
          // Classification data
          assetClass: node.assetClass || 'default',
          type: this.mapAssetClassToType(node.assetClass),
          
          // Custom styling data (if provided)
          color: node.color,
          borderColor: node.borderColor,  
          shape: node.shape,
          size: node.size,
          
          // Membership data
          systems: node.systems || [],
          groups: node.groups || [],
          
          // Additional data
          properties: node.properties || {}
        }
      }

      // Set parent if in system
      if (parentId) {
        nodeElement.data.parent = parentId
      }

      elements.push(nodeElement)
      this.nodeMapping.set(businessId, displayId)
    })
  }

  /**
   * Create edge elements
   */
  createEdges(edges, elements) {
    edges.forEach(edge => {
      const sourceDisplayId = this.nodeMapping.get(edge.source)
      const targetDisplayId = this.nodeMapping.get(edge.target)

      if (sourceDisplayId && targetDisplayId) {
        const edgeElement = {
          group: 'edges',
          data: {
            id: edge.id,
            source: sourceDisplayId,
            target: targetDisplayId,
            label: edge.relationshipType || '',
            
            // Classification
            relationshipType: edge.relationshipType,
            type: edge.relationshipType || 'default',
            
            // Custom styling (if provided)
            color: edge.color,
            width: edge.width,
            style: edge.style,
            arrowShape: edge.arrowShape,
            
            // Additional data
            properties: edge.properties || {}
          }
        }

        elements.push(edgeElement)
      }
    })
  }

  /**
   * Map asset class to visual type for styling
   */
  mapAssetClassToType(assetClass) {
    if (!assetClass) return 'default'
    
    const lowerClass = assetClass.toLowerCase()
    
    if (lowerClass.includes('server') || lowerClass.includes('web')) return 'server'
    if (lowerClass.includes('database') || lowerClass.includes('db')) return 'database' 
    if (lowerClass.includes('application') || lowerClass.includes('app')) return 'application'
    if (lowerClass.includes('network') || lowerClass.includes('device')) return 'network'
    
    return 'default'
  }

  /**
   * Update hull overlays for groups
   * TODO: Implement hull drawing for groups (Step 3)
   */
  updateHulls(cy, groupVisibility = {}) {
    // Placeholder for hull implementation
    console.log('Hull updates will be implemented in Step 3')
  }

  /**
   * Get business node ID from display element
   */
  getBusinessId(displayElement) {
    return displayElement.data('originalNodeId')
  }
}
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
   * Creates visual boundary around group members using convex hull
   */
  updateHulls(cy, groupVisibility = {}) {
    console.log('Updating hulls with visibility:', groupVisibility)
    
    // Remove existing hulls
    cy.elements('node.group-hull').remove()
    
    // Get all unique groups from nodes
    const groups = new Map()
    cy.nodes().forEach(node => {
      const nodeGroups = node.data('groups') || []
      nodeGroups.forEach(groupName => {
        if (!groups.has(groupName)) {
          groups.set(groupName, [])
        }
        groups.get(groupName).push(node)
      })
    })
    
    // Create hull for each visible group
    groups.forEach((nodes, groupName) => {
      const isVisible = groupVisibility[groupName] !== false // Default true
      
      if (isVisible && nodes.length > 1) {
        this.createHullElement(cy, groupName, nodes)
      }
    })
  }

  /**
   * Create a hull element for a group
   */
  createHullElement(cy, groupName, nodes) {
    // Calculate bounding box of all nodes in group
    const positions = nodes.map(node => node.position())
    const padding = 60
    
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    
    positions.forEach(pos => {
      minX = Math.min(minX, pos.x)
      maxX = Math.max(maxX, pos.x)
      minY = Math.min(minY, pos.y)
      maxY = Math.max(maxY, pos.y)
    })
    
    // Add padding
    minX -= padding
    maxX += padding
    minY -= padding
    maxY += padding
    
    // Create hull element
    const hullId = `hull_${groupName.replace(/\s+/g, '_')}`
    const hullElement = {
      group: 'nodes',
      data: {
        id: hullId,
        label: groupName,
        isHull: true,
        groupName: groupName,
        memberCount: nodes.length
      },
      classes: 'group-hull',
      position: {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
      },
      style: {
        'width': maxX - minX,
        'height': maxY - minY,
        'background-color': this.getGroupColor(groupName),
        'background-opacity': 0.1,
        'border-width': 2,
        'border-color': this.getGroupColor(groupName),
        'border-opacity': 0.5,
        'border-style': 'dashed',
        'shape': 'round-rectangle',
        'label': groupName,
        'text-valign': 'top',
        'text-halign': 'center',
        'font-size': '14px',
        'font-weight': 'bold',
        'color': this.getGroupColor(groupName),
        'z-index': -1
      }
    }
    
    cy.add(hullElement)
    console.log(`Created hull for group: ${groupName} with ${nodes.length} members`)
  }

  /**
   * Get color for a group based on its name
   */
  getGroupColor(groupName) {
    // Color palette for different groups
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal  
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEAA7', // Yellow
      '#DDA0DD', // Plum
      '#98D8C8', // Mint
      '#F7DC6F'  // Gold
    ]
    
    // Hash group name to get consistent color
    let hash = 0
    for (let i = 0; i < groupName.length; i++) {
      hash = ((hash << 5) - hash + groupName.charCodeAt(i)) & 0xffffffff
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  /**
   * Get business node ID from display element
   */
  getBusinessId(displayElement) {
    return displayElement.data('originalNodeId')
  }
}
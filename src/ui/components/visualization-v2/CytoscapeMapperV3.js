/**
 * Simplified Hull-Based Cytoscape Mapper V3
 * 
 * This mapper uses hulls (village boundaries) for groups instead of 
 * compound nesting, eliminating the need for complex hierarchical logic
 * and node duplication.
 * 
 * Architecture:
 * - Systems: Rectangular compound nodes (only when >1 node)
 * - Groups: Visual hull overlays (village boundaries)
 * - Nodes: Single instance per asset, placed in system compounds
 * - Performance: Much better - no duplication, simpler logic
 */

export class CytoscapeMapperV3 {
  constructor() {
    this.nodeMapping = new Map() // originalId -> displayId (1:1 mapping)
    this.compoundMapping = new Map() // systemName -> compoundId
    this.displayIdCounter = 0
    this.groupHulls = new Map() // groupName -> hull instance
    this.hullUpdateTimeout = null // For throttling hull updates
    this.groupVisibility = new Map() // groupName -> boolean (visibility state)
    this.groupColors = new Map() // groupName -> color (custom colors)
  }

  /**
   * Main mapping function - simplified hull-based approach
   */
  mapToCytoscape(nodes, edges) {
    console.log("=== Hull-based mapping (V3) ===")
    
    this.reset()
    const elements = []
    
    // Step 1: Analyze systems only (no complex hierarchy)
    const systemAnalysis = this.analyzeSystemMembership(nodes)
    console.log("System analysis:", systemAnalysis)
    
    // Step 2: Create system compounds (rectangular)
    this.createSystemCompounds(systemAnalysis, elements)
    
    // Step 3: Add all nodes once to their systems
    this.createNodes(nodes, elements)
    
    // Step 4: Create edges
    this.createEdges(edges, elements)
    
    console.log("=== Hull mapping complete ===")
    console.log("Total elements:", elements.length)
    console.log("Node mapping size:", this.nodeMapping.size)
    
    return elements
  }

  /**
   * Simple system membership analysis - no hierarchy complexity
   */
  analyzeSystemMembership(nodes) {
    const systemMembership = new Map()
    
    nodes.forEach(node => {
      if (node.systems && node.systems.length > 0) {
        node.systems.forEach(systemName => {
          if (!systemMembership.has(systemName)) {
            systemMembership.set(systemName, [])
          }
          systemMembership.get(systemName).push(node)
        })
      }
    })
    
    return systemMembership
  }

  /**
   * Create system compounds (only rectangular, no nesting complexity)
   */
  createSystemCompounds(systemAnalysis, elements) {
    systemAnalysis.forEach((nodes, systemName) => {
      // Only create compound if system has multiple nodes
      if (nodes.length > 1) {
        const compoundId = this.generateDisplayId('system')
        
        const compound = {
          group: 'nodes',
          data: {
            id: compoundId,
            label: `System: ${systemName}`,
            isCompound: true,
            compoundType: 'system',
            compoundName: systemName
          },
          classes: 'compound-node system-compound'
        }
        
        elements.push(compound)
        this.compoundMapping.set(systemName, compoundId)
        console.log(`Created system compound: ${systemName} (${compoundId})`)
      }
    })
  }

  /**
   * Create nodes - one instance per asset, placed in system compound
   */
  createNodes(nodes, elements) {
    nodes.forEach(node => {
      const nodeId = this.getNodeId(node)
      const displayId = this.generateDisplayId('node')
      
      // Find system compound (if exists)
      let parentCompoundId = null
      if (node.systems && node.systems.length > 0) {
        // Use first system (nodes should typically belong to one system)
        parentCompoundId = this.compoundMapping.get(node.systems[0])
      }
      
      const nodeData = {
        id: displayId,
        label: `${node.title || node.name || 'Node'} [${nodeId}]`,
        originalNodeId: nodeId,
        // Store group membership for hull creation
        groups: node.groups || [],
        // Copy other node data
        type: this.determineNodeType(node),
        assetClass: node.assetClass || 'unknown'
      }
      
      if (parentCompoundId) {
        nodeData.parent = parentCompoundId
      }
      
      const displayNode = {
        group: 'nodes',
        data: nodeData,
        classes: this.getNodeClasses(node)
      }
      
      elements.push(displayNode)
      
      // Simple 1:1 mapping
      this.nodeMapping.set(nodeId, displayId)
      
      console.log(`Created node ${displayId} for asset ${nodeId}`)
    })
  }

  /**
   * Create edges - simple mapping since each node has only one instance
   */
  createEdges(edges, elements) {
    edges.forEach(edge => {
      const sourceDisplayId = this.nodeMapping.get(edge.source || edge.fromId)
      const targetDisplayId = this.nodeMapping.get(edge.target || edge.toId)
      
      if (sourceDisplayId && targetDisplayId) {
        const displayEdgeId = this.generateDisplayId('edge')
        
        const displayEdge = {
          group: 'edges',
          data: {
            id: displayEdgeId,
            source: sourceDisplayId,
            target: targetDisplayId,
            originalEdgeId: edge.id || edge.relationshipId,
            label: edge.relationshipType || edge.type || ''
          }
        }
        
        elements.push(displayEdge)
        console.log(`Created edge ${displayEdgeId}: ${sourceDisplayId} -> ${targetDisplayId}`)
      }
    })
  }

  /**
   * Draw group hulls using custom overlay elements
   * This creates visible village boundaries around group nodes
   * @param {Object} cy - Cytoscape instance
   * @param {Object} groupColors - Custom colors for groups {groupName: color}
   * @param {Object} groupVisibility - Toggle groups on/off {groupName: boolean}
   */
  drawGroupHulls(cy, groupColors = {}, groupVisibility = {}) {
    // Merge passed parameters with stored settings
    const mergedColors = { ...Object.fromEntries(this.groupColors), ...groupColors }
    const mergedVisibility = { ...Object.fromEntries(this.groupVisibility), ...groupVisibility }
    
    // Clear existing hull elements
    cy.elements('.group-hull').remove()
    this.groupHulls.clear()
    
    // Find all groups
    const groupNodes = new Map()
    
    cy.nodes().forEach(node => {
      const groups = node.data('groups')
      console.log(`Node ${node.data('label')} groups:`, groups)
      if (groups && groups.length > 0) {
        groups.forEach(groupName => {
          if (!groupNodes.has(groupName)) {
            groupNodes.set(groupName, [])
          }
          groupNodes.get(groupName).push(node)
          console.log(`Added node ${node.data('label')} to group ${groupName}`)
        })
      }
    })
    
    console.log("Found groups:", Array.from(groupNodes.entries()).map(([name, nodes]) => ({
      name, 
      nodeCount: nodes.length,
      nodeLabels: nodes.map(n => n.data('label'))
    })))
    
    // Draw hull for each group
    groupNodes.forEach((nodes, groupName) => {
      // Check if group should be visible (default: true)
      const isVisible = mergedVisibility.hasOwnProperty(groupName) ? mergedVisibility[groupName] : true
      
      if (nodes.length > 1 && isVisible) {
        const defaultColor = this.getGroupColor(groupName)
        const color = mergedColors[groupName] || defaultColor
        
        // Create convex hull overlay 
        const hullId = this.generateDisplayId('hull')
        const centroid = this.calculateCentroid(nodes)
        const hullPoints = this.calculateConvexHull(nodes)
        const bounds = this.calculateBounds(nodes)
        
        const hullElement = {
          group: 'nodes',
          data: {
            id: hullId,
            label: `${groupName}`,
            groupName: groupName
          },
          classes: 'group-hull village-boundary',
          position: centroid,
          style: {
            'shape': 'round-rectangle',
            'width': bounds.width + 120,
            'height': bounds.height + 120,
            'background-color': color,
            'background-opacity': 0.15,
            'border-color': color,
            'border-width': 3,
            'border-style': 'dashed',
            'border-opacity': 0.8,
            'corner-radius': 15,
            'z-index': -1, // Behind other elements
            'events': 'no', // Non-interactive
            // Label styling
            'text-opacity': 1,
            'color': '#000000',
            'font-size': 16,
            'font-weight': 'bold',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-margin-y': 0
          }
        }
        
        cy.add(hullElement)
        this.groupHulls.set(groupName, hullId)
        console.log(`Created group hull for: ${groupName} (${nodes.length} nodes)`)
      }
    })
  }

  /**
   * Update existing group hulls when nodes move
   * More efficient than full redraw
   */
  updateGroupHulls(cy) {
    // Find all groups and their current nodes
    const groupNodes = new Map()
    
    cy.nodes().forEach(node => {
      const groups = node.data('groups')
      if (groups && groups.length > 0) {
        groups.forEach(groupName => {
          if (!groupNodes.has(groupName)) {
            groupNodes.set(groupName, [])
          }
          groupNodes.get(groupName).push(node)
        })
      }
    })
    
    // Update hull positions and sizes
    groupNodes.forEach((nodes, groupName) => {
      if (nodes.length > 1) {
        const hullId = this.groupHulls.get(groupName)
        if (hullId) {
          const hullElement = cy.getElementById(hullId)
          if (hullElement.length > 0) {
            // Recalculate position and size
            const centroid = this.calculateCentroid(nodes)
            const bounds = this.calculateBounds(nodes)
            
            // Update hull element  
            hullElement.position(centroid)
            hullElement.style({
              'width': bounds.width + 120,
              'height': bounds.height + 120
            })
            
            console.log(`Updated hull for group: ${groupName}`)
          }
        }
      }
    })
  }

  /**
   * Calculate convex hull points for a set of nodes
   * Returns array of points that form the convex boundary
   */
  calculateConvexHull(nodes) {
    // Get node positions with padding
    const padding = 80 // Extra space around nodes
    const points = nodes.map(node => {
      const pos = node.position()
      const bbox = node.boundingBox()
      return {
        x: pos.x,
        y: pos.y,
        width: bbox.w + padding,
        height: bbox.h + padding
      }
    })
    
    // Simple convex hull using Gift wrapping algorithm
    if (points.length < 3) return points
    
    // Find the leftmost point
    let leftmost = points[0]
    for (let i = 1; i < points.length; i++) {
      if (points[i].x < leftmost.x) {
        leftmost = points[i]
      }
    }
    
    const hull = []
    let current = leftmost
    
    do {
      hull.push(current)
      let next = points[0]
      
      for (let i = 1; i < points.length; i++) {
        if (next === current || this.cross(current, next, points[i]) > 0) {
          next = points[i]
        }
      }
      
      current = next
    } while (current !== leftmost && hull.length < points.length)
    
    return hull
  }

  /**
   * Cross product for convex hull calculation
   */
  cross(O, A, B) {
    return (A.x - O.x) * (B.y - O.y) - (A.y - O.y) * (B.x - O.x)
  }

  /**
   * Calculate centroid of nodes for hull positioning
   */
  calculateCentroid(nodes) {
    let totalX = 0, totalY = 0
    nodes.forEach(node => {
      const pos = node.position()
      totalX += pos.x
      totalY += pos.y
    })
    return {
      x: totalX / nodes.length,
      y: totalY / nodes.length
    }
  }

  /**
   * Calculate bounding box of nodes
   */
  calculateBounds(nodes) {
    if (nodes.length === 0) return { width: 100, height: 100 }
    
    const positions = nodes.map(node => node.position())
    const minX = Math.min(...positions.map(p => p.x))
    const maxX = Math.max(...positions.map(p => p.x))
    const minY = Math.min(...positions.map(p => p.y))
    const maxY = Math.max(...positions.map(p => p.y))
    
    return {
      width: maxX - minX || 100,
      height: maxY - minY || 100
    }
  }

  /**
   * Convert hull points to Cytoscape polygon format
   * Points relative to centroid and bounds
   */
  pointsToPolygon(points, centroid, bounds) {
    if (points.length === 0) return '0 0'
    
    // Create a simple hull shape for now - can be improved later
    // For 2 points, create an elongated shape
    if (points.length === 2) {
      return '-0.8 -0.3 0.8 -0.3 0.8 0.3 -0.8 0.3'
    }
    
    // For more points, normalize relative to the bounding box
    const padding = 60
    const width = bounds.width + padding
    const height = bounds.height + padding
    
    return points.map(p => {
      const relativeX = (p.x - centroid.x) / width * 2
      const relativeY = (p.y - centroid.y) / height * 2
      // Clamp to reasonable bounds
      const clampedX = Math.max(-1, Math.min(1, relativeX))
      const clampedY = Math.max(-1, Math.min(1, relativeY))
      return `${clampedX} ${clampedY}`
    }).join(' ')
  }

  /**
   * Get color for group hull
   */
  getGroupColor(groupName) {
    // Simple color hash based on group name
    const colors = ['#FF9800', '#9C27B0', '#2196F3', '#4CAF50', '#F44336', '#FF5722']
    const hash = groupName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  /**
   * Helper methods (simplified)
   */
  
  determineNodeType(node) {
    const assetClass = (node.assetClass || '').toLowerCase()
    
    if (assetClass.includes('server')) return 'server'
    if (assetClass.includes('database') || assetClass.includes('db')) return 'database'
    if (assetClass.includes('application') || assetClass.includes('app')) return 'application'
    if (assetClass.includes('network') || assetClass.includes('switch') || assetClass.includes('router')) return 'network'
    
    return 'default'
  }
  
  getNodeClasses(node) {
    const classes = ['display-node']
    const nodeType = this.determineNodeType(node)
    classes.push(`node-${nodeType}`)
    return classes.join(' ')
  }
  
  generateDisplayId(prefix = 'element') {
    return `${prefix}-${++this.displayIdCounter}`
  }
  
  getNodeId(node) {
    return node.nodeId || node.tempUID || node.getId?.() || node.id
  }
  
  reset() {
    this.nodeMapping.clear()
    this.compoundMapping.clear()
    this.displayIdCounter = 0
    // Clear hulls
    this.groupHulls.forEach(hull => hull.remove())
    this.groupHulls.clear()
    this.groupVisibility.clear()
    this.groupColors.clear()
  }

  /**
   * Toggle group hull visibility
   * @param {string} groupName - Name of the group to toggle
   * @param {boolean} visible - Whether the group should be visible
   * @param {Object} cy - Cytoscape instance
   */
  setGroupVisibility(groupName, visible, cy) {
    this.groupVisibility.set(groupName, visible)
    
    if (cy) {
      // Immediately show/hide the hull
      const hullId = this.groupHulls.get(groupName)
      if (hullId) {
        const hullElement = cy.getElementById(hullId)
        if (hullElement.length > 0) {
          hullElement.style('display', visible ? 'element' : 'none')
        }
      }
    }
  }

  /**
   * Set custom color for a group hull
   * @param {string} groupName - Name of the group
   * @param {string} color - CSS color for the hull
   * @param {Object} cy - Cytoscape instance
   */
  setGroupColor(groupName, color, cy) {
    this.groupColors.set(groupName, color)
    
    if (cy) {
      // Immediately update the hull color
      const hullId = this.groupHulls.get(groupName)
      if (hullId) {
        const hullElement = cy.getElementById(hullId)
        if (hullElement.length > 0) {
          hullElement.style({
            'background-color': color,
            'border-color': color,
            'color': color
          })
        }
      }
    }
  }

  /**
   * Get all available group names
   * @param {Object} cy - Cytoscape instance
   * @returns {Array} Array of group names
   */
  getAvailableGroups(cy) {
    const groups = new Set()
    
    if (cy) {
      cy.nodes().forEach(node => {
        const nodeGroups = node.data('groups')
        if (nodeGroups && nodeGroups.length > 0) {
          nodeGroups.forEach(groupName => groups.add(groupName))
        }
      })
    }
    
    return Array.from(groups)
  }

  /**
   * Get visibility state of all groups
   * @returns {Object} {groupName: boolean}
   */
  getGroupVisibilityStates() {
    const states = {}
    this.groupVisibility.forEach((visible, groupName) => {
      states[groupName] = visible
    })
    return states
  }
}
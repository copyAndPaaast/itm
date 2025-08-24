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
   * Create node elements (with multi-system support)
   */
  createNodes(nodes, elements) {
    nodes.forEach(node => {
      const businessId = node.nodeId
      const systems = node.systems || []
      
      if (systems.length <= 1) {
        // Single system or no system - create single instance
        this.createSingleNodeInstance(node, elements)
      } else {
        // Multi-system asset - create display instance for each system
        this.createMultiSystemNodeInstances(node, elements)
      }
    })
  }

  /**
   * Create single node instance (standard case)
   */
  createSingleNodeInstance(node, elements) {
    const businessId = node.nodeId
    console.log('🔍 MAPPER DEBUG - creating single node:', { 
      nodeId: node.nodeId, 
      id: node.id, 
      businessId, 
      label: node.title || node.label 
    })
    const displayId = this.generateDisplayId('node')
    
    // Find parent system compound
    let parentId = null
    if (node.systems && node.systems.length > 0) {
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
        properties: node.properties || {},
        
        // Single system instance
        isMultiSystemAsset: false,
        systemContext: node.systems?.[0] || null
      }
    }

    // Add position data if available (crucial for manual positioning)
    if (node.position && node.position.x !== undefined && node.position.y !== undefined) {
      nodeElement.position = {
        x: node.position.x,
        y: node.position.y
      }
      console.log('🎯 MAPPER: Added position data for node', businessId, nodeElement.position)
    }

    // Set parent if in system
    if (parentId) {
      nodeElement.data.parent = parentId
    }

    elements.push(nodeElement)
    this.nodeMapping.set(businessId, displayId)
    console.log('🔍 MAPPER DEBUG - added to nodeMapping:', businessId, '->', displayId)
  }

  /**
   * Create multiple display instances for multi-system assets
   */
  createMultiSystemNodeInstances(node, elements) {
    const businessId = node.nodeId
    const systems = node.systems
    const displayIds = []

    // Create display instance for each system
    systems.forEach(systemName => {
      const displayId = this.generateDisplayId(`multi_${businessId}_${systemName}`)
      const parentId = this.systemCompounds.get(systemName)

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
          systems: [systemName], // Each instance belongs to one system context
          groups: node.groups || [],
          
          // Additional data
          properties: node.properties || {},
          
          // Multi-system instance metadata
          isMultiSystemAsset: true,
          systemContext: systemName,
          multiSystemGroup: businessId, // Link all instances together
          
          // Visual styling for multi-system assets
          borderStyle: 'dashed' // Special styling for multi-system instances
        }
      }

      // Add position data if available (crucial for manual positioning)
      if (node.position && node.position.x !== undefined && node.position.y !== undefined) {
        nodeElement.position = {
          x: node.position.x,
          y: node.position.y
        }
        console.log('🎯 MAPPER: Added position data for multi-system node', businessId, nodeElement.position)
      }

      // Set parent system compound
      if (parentId) {
        nodeElement.data.parent = parentId
      }

      elements.push(nodeElement)
      displayIds.push(displayId)
    })

    // Create mapping entry for each system context
    systems.forEach((systemName, index) => {
      const key = `${businessId}_${systemName}`
      this.nodeMapping.set(key, displayIds[index])
    })
    
    // Also create primary mapping (for backward compatibility)
    this.nodeMapping.set(businessId, displayIds[0])

    // Create dashed connection edges between instances
    this.createMultiSystemConnectionEdges(businessId, displayIds, elements)
  }

  /**
   * Create dashed edges connecting multi-system asset instances
   */
  createMultiSystemConnectionEdges(businessId, displayIds, elements) {
    // Create edges between all pairs of instances
    for (let i = 0; i < displayIds.length - 1; i++) {
      for (let j = i + 1; j < displayIds.length; j++) {
        const edgeId = `multi_system_connection_${businessId}_${i}_${j}`
        
        const connectionEdge = {
          group: 'edges',
          data: {
            id: edgeId,
            source: displayIds[i],
            target: displayIds[j],
            label: 'Multi System Asset',
            
            // Classification
            relationshipType: 'MULTI_SYSTEM_ASSET',
            type: 'multi_system_connection',
            
            // Visual styling
            lineStyle: 'dashed',
            color: '#ffcccb', // Light red
            
            // Metadata
            isMultiSystemConnection: true,
            originalNodeId: businessId
          },
          classes: 'multi-system-edge'
        }

        elements.push(connectionEdge)
      }
    }
  }

  /**
   * Create edge elements (with multi-system support)
   */
  createEdges(edges, elements) {
    edges.forEach(edge => {
      // Handle multi-system edge routing
      this.createEdgeWithSystemContext(edge, elements)
    })
  }

  /**
   * Create edge with proper system context routing
   */
  createEdgeWithSystemContext(edge, elements) {
    const sourceBusinessId = edge.source
    const targetBusinessId = edge.target
    
    // Get all possible display instances for source and target
    const sourceCandidates = this.getDisplayInstances(sourceBusinessId)
    const targetCandidates = this.getDisplayInstances(targetBusinessId)
    
    if (sourceCandidates.length === 0 || targetCandidates.length === 0) {
      console.warn(`Cannot create edge ${edge.id}: missing display instances`)
      return
    }
    
    // Determine which instances to connect based on relationship type and system context
    const connections = this.determineEdgeConnections(
      edge, 
      sourceCandidates, 
      targetCandidates
    )
    
    // Create edge for each valid connection
    connections.forEach((connection, index) => {
      const edgeId = connections.length > 1 ? `${edge.id}_${index}` : edge.id
      
      const edgeElement = {
        group: 'edges',
        data: {
          id: edgeId,
          source: connection.sourceDisplayId,
          target: connection.targetDisplayId,
          label: edge.relationshipType || '',
          
          // Classification
          relationshipType: edge.relationshipType,
          type: edge.relationshipType || 'default',
          
          // Custom styling (if provided)
          color: edge.color,
          width: edge.width,
          style: edge.style,
          arrowShape: edge.arrowShape,
          
          // System context metadata
          systemContext: connection.systemContext,
          
          // Additional data
          properties: edge.properties || {}
        }
      }

      elements.push(edgeElement)
    })
  }

  /**
   * Get all display instances for a business node ID
   */
  getDisplayInstances(businessId) {
    const instances = []
    
    console.log('🔍 MAPPER DEBUG - getDisplayInstances for:', businessId)
    console.log('🔍 MAPPER DEBUG - nodeMapping contents:', Array.from(this.nodeMapping.entries()))
    
    // Check primary mapping
    const primaryId = this.nodeMapping.get(businessId)
    if (primaryId) {
      instances.push({
        displayId: primaryId,
        businessId: businessId,
        systemContext: null // Will be determined from elements
      })
    }
    
    // Check system-specific mappings for multi-system nodes
    for (const [key, displayId] of this.nodeMapping.entries()) {
      // Ensure key is a string before calling startsWith
      const keyStr = String(key)
      const businessIdStr = String(businessId)
      
      if (keyStr.startsWith(`${businessIdStr}_`) && keyStr !== businessIdStr) {
        const systemName = keyStr.substring(`${businessIdStr}_`.length)
        instances.push({
          displayId: displayId,
          businessId: businessId,
          systemContext: systemName
        })
      }
    }
    
    return instances
  }

  /**
   * Determine which display instances should be connected
   */
  determineEdgeConnections(edge, sourceCandidates, targetCandidates) {
    const connections = []
    
    // Strategy 1: If both nodes are single-system, connect directly
    if (sourceCandidates.length === 1 && targetCandidates.length === 1) {
      connections.push({
        sourceDisplayId: sourceCandidates[0].displayId,
        targetDisplayId: targetCandidates[0].displayId,
        systemContext: sourceCandidates[0].systemContext || targetCandidates[0].systemContext
      })
      return connections
    }
    
    // Strategy 2: Connect instances that share the same system context
    sourceCandidates.forEach(source => {
      targetCandidates.forEach(target => {
        if (source.systemContext && target.systemContext && 
            source.systemContext === target.systemContext) {
          connections.push({
            sourceDisplayId: source.displayId,
            targetDisplayId: target.displayId,
            systemContext: source.systemContext
          })
        }
      })
    })
    
    // Strategy 3: If no shared system context, connect first instances
    // (This handles cases where relationship spans systems)
    if (connections.length === 0) {
      connections.push({
        sourceDisplayId: sourceCandidates[0].displayId,
        targetDisplayId: targetCandidates[0].displayId,
        systemContext: 'cross_system'
      })
    }
    
    return connections
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
    
    // Get all unique groups from nodes (exclude hull nodes and system compounds)
    const groups = new Map()
    cy.nodes().forEach(node => {
      // Skip hull nodes and system compounds
      if (node.hasClass('group-hull') || node.data('isCompound') || node.data('isHull')) {
        return
      }
      
      const nodeGroups = node.data('groups') || []
      console.log(`Node ${node.data('label')} has groups:`, nodeGroups)
      
      nodeGroups.forEach(groupName => {
        if (!groups.has(groupName)) {
          groups.set(groupName, [])
        }
        groups.get(groupName).push(node)
      })
    })
    
    console.log(`Found ${groups.size} groups:`, Array.from(groups.keys()))
    
    // Create hull for each visible group (including single-node groups)
    groups.forEach((nodes, groupName) => {
      const isVisible = groupVisibility[groupName] !== false // Default true
      
      if (isVisible && nodes.length >= 1) {
        this.createHullElement(cy, groupName, nodes)
      }
    })
  }

  /**
   * Create a hull element for a group
   */
  createHullElement(cy, groupName, nodes) {
    // Calculate bounding box using actual node boundaries, not just center positions
    const padding = 60
    const minHullSize = 120 // Minimum hull size for single nodes
    
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    
    // Use actual node boundaries instead of center positions
    nodes.forEach(node => {
      const bbox = node.boundingBox()
      // bbox gives us the actual rendered boundaries including node size
      const nodeLeft = bbox.x1
      const nodeRight = bbox.x2  
      const nodeTop = bbox.y1
      const nodeBottom = bbox.y2
      
      minX = Math.min(minX, nodeLeft)
      maxX = Math.max(maxX, nodeRight)
      minY = Math.min(minY, nodeTop)
      maxY = Math.max(maxY, nodeBottom)
    })
    
    // Add padding
    minX -= padding
    maxX += padding
    minY -= padding
    maxY += padding
    
    // Ensure minimum size for single-node hulls
    const currentWidth = maxX - minX
    const currentHeight = maxY - minY
    
    if (currentWidth < minHullSize) {
      const expand = (minHullSize - currentWidth) / 2
      minX -= expand
      maxX += expand
    }
    
    if (currentHeight < minHullSize) {
      const expand = (minHullSize - currentHeight) / 2
      minY -= expand
      maxY += expand
    }
    
    // Create hull element (using data attributes instead of inline styles)
    const hullId = `hull_${groupName.replace(/\s+/g, '_')}`
    const hullColor = this.getGroupColor(groupName)
    const hullElement = {
      group: 'nodes',
      data: {
        id: hullId,
        label: groupName,
        isHull: true,
        groupName: groupName,
        memberCount: nodes.length,
        hullColor: hullColor
      },
      classes: 'group-hull',
      position: {
        x: (minX + maxX) / 2,
        y: (minY + maxY) / 2
      }
    }
    
    // Add the hull element
    const addedElement = cy.add(hullElement)
    
    // Set size using style() method after adding (more reliable)
    addedElement.style({
      'width': maxX - minX,
      'height': maxY - minY
    })
    
    // Make hull elements non-interactive
    addedElement.ungrabify()
    addedElement.unselectify()
    
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
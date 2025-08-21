/**
 * Intelligent Data-to-Cytoscape Mapper
 * 
 * This mapper understands the semantic meaning of our data model and 
 * intelligently translates it to Cytoscape's technical constraints.
 * 
 * Key responsibilities:
 * - Handle multi-membership (node in both system AND group)
 * - Generate stable, unique Cytoscape IDs
 * - Create proper parent-child relationships
 * - Maintain mapping between business logic and display logic
 */

export class CytoscapeMapper {
  constructor() {
    this.nodeMapping = new Map() // originalId -> displayInstances[]
    this.edgeMapping = new Map() // originalId -> displayInstances[]
    this.compoundMapping = new Map() // compoundKey -> compoundId
    this.displayIdCounter = 0
  }

  /**
   * Main mapping function - converts business data to Cytoscape elements
   * @param {Array} nodes - Business nodes with systems/groups
   * @param {Array} edges - Business edges
   * @returns {Array} Cytoscape elements array
   */
  mapToCytoscape(nodes, edges) {
    console.log("=== Starting intelligent mapping ===")
    
    this.reset()
    const elements = []
    
    // Step 1: Analyze membership patterns
    const membershipAnalysis = this.analyzeMembership(nodes)
    console.log("Membership analysis:", membershipAnalysis)
    
    // Step 2: Create compounds based on analysis
    const compounds = this.createCompounds(membershipAnalysis, elements)
    console.log("Created compounds:", compounds)
    
    // Step 3: Create node instances with smart parent assignment
    this.createNodeInstances(nodes, elements, membershipAnalysis)
    
    // Step 4: Create edges between appropriate instances
    this.createEdgeInstances(edges, elements)
    
    console.log("=== Mapping complete ===")
    console.log("Total elements:", elements.length)
    console.log("Node mapping size:", this.nodeMapping.size)
    
    return elements
  }
  
  /**
   * Analyze membership patterns to make intelligent decisions
   */
  analyzeMembership(nodes) {
    const systemMembership = new Map()
    const groupMembership = new Map()
    
    nodes.forEach(node => {
      const nodeId = this.getNodeId(node)
      
      // Track system memberships
      if (node.systems && node.systems.length > 0) {
        node.systems.forEach(system => {
          if (!systemMembership.has(system)) {
            systemMembership.set(system, [])
          }
          systemMembership.get(system).push(node)
        })
      }
      
      // Track group memberships
      if (node.groups && node.groups.length > 0) {
        node.groups.forEach(group => {
          if (!groupMembership.has(group)) {
            groupMembership.set(group, [])
          }
          groupMembership.get(group).push(node)
        })
      }
    })
    
    return {
      systems: systemMembership,
      groups: groupMembership,
      // TODO: Add conflict resolution strategies
      conflicts: this.detectMembershipConflicts(systemMembership, groupMembership)
    }
  }
  
  /**
   * Detect when a node belongs to multiple compounds (conflicts to resolve)
   */
  detectMembershipConflicts(systemMembership, groupMembership) {
    const conflicts = new Map()
    
    // For each node, check if it appears in multiple compounds
    const allNodes = new Set()
    systemMembership.forEach(nodes => nodes.forEach(node => allNodes.add(this.getNodeId(node))))
    groupMembership.forEach(nodes => nodes.forEach(node => allNodes.add(this.getNodeId(node))))
    
    allNodes.forEach(nodeId => {
      const memberships = []
      
      systemMembership.forEach((nodes, system) => {
        if (nodes.some(n => this.getNodeId(n) === nodeId)) {
          memberships.push({ type: 'system', name: system })
        }
      })
      
      groupMembership.forEach((nodes, group) => {
        if (nodes.some(n => this.getNodeId(n) === nodeId)) {
          memberships.push({ type: 'group', name: group })
        }
      })
      
      if (memberships.length > 1) {
        conflicts.set(nodeId, memberships)
      }
    })
    
    return conflicts
  }
  
  /**
   * Create compound nodes with hierarchical nesting
   * If group nodes belong to same system, nest group inside system
   */
  createCompounds(analysis, elements) {
    const compounds = []
    const hierarchyAnalysis = this.analyzeHierarchy(analysis)
    
    // Create system compounds first (they may become parents)
    analysis.systems.forEach((nodes, systemName) => {
      if (nodes.length > 1) {
        const compoundId = this.generateDisplayId('compound-system')
        const compound = {
          group: 'nodes',
          data: {
            id: compoundId,
            label: `System: ${systemName} [${compoundId}]`,
            isCompound: true,
            compoundType: 'system',
            compoundName: systemName
          },
          classes: 'compound-node system-compound'
        }
        
        elements.push(compound)
        compounds.push({ type: 'system', name: systemName, id: compoundId })
        this.compoundMapping.set(`system-${systemName}`, compoundId)
        console.log(`Created system compound: ${systemName} (${compoundId})`)
      }
    })
    
    // Create group compounds with potential system parents
    analysis.groups.forEach((groupNodes, groupName) => {
      if (groupNodes.length > 1) {
        const compoundId = this.generateDisplayId('compound-group')
        
        // Check if this group should be nested in a system
        const parentSystemId = this.findGroupParentSystem(groupNodes, groupName, hierarchyAnalysis)
        
        const compound = {
          group: 'nodes',
          data: {
            id: compoundId,
            label: `Group: ${groupName} [${compoundId}]`,
            isCompound: true,
            compoundType: 'group',
            compoundName: groupName
          },
          classes: 'compound-node group-compound'
        }
        
        // Set parent system if found
        if (parentSystemId) {
          compound.data.parent = parentSystemId
          console.log(`Nesting group ${groupName} inside system compound ${parentSystemId}`)
        }
        
        elements.push(compound)
        compounds.push({ type: 'group', name: groupName, id: compoundId, parentSystemId })
        this.compoundMapping.set(`group-${groupName}`, compoundId)
        console.log(`Created group compound: ${groupName} (${compoundId})`)
      }
    })
    
    return compounds
  }
  
  /**
   * Analyze potential hierarchical relationships between groups and systems
   */
  analyzeHierarchy(analysis) {
    const hierarchy = new Map()
    
    // For each group, check if all its nodes belong to the same system
    analysis.groups.forEach((groupNodes, groupName) => {
      if (groupNodes.length > 1) {
        // Get all systems that these group nodes belong to
        const systemMemberships = new Map()
        
        groupNodes.forEach(node => {
          if (node.systems && node.systems.length > 0) {
            node.systems.forEach(systemName => {
              if (!systemMemberships.has(systemName)) {
                systemMemberships.set(systemName, 0)
              }
              systemMemberships.set(systemName, systemMemberships.get(systemName) + 1)
            })
          }
        })
        
        // Only nest groups that are truly contained within a single system
        // Cross-system groups remain independent
        if (systemMemberships.size === 1) {
          // All group nodes belong to exactly one system
          const [systemName, nodeCount] = systemMemberships.entries().next().value
          if (nodeCount === groupNodes.length && analysis.systems.get(systemName)?.length > 1) {
            // This group should be nested in this system (single-system group)
            hierarchy.set(groupName, systemName)
            console.log(`Hierarchy detected: Group "${groupName}" is contained in System "${systemName}" - will nest`)
          }
        } else if (systemMemberships.size > 1) {
          console.log(`Cross-system group detected: "${groupName}" spans multiple systems - remains independent`)
        }
      }
    })
    
    return hierarchy
  }
  
  /**
   * Find the parent system for a group compound (if applicable)
   */
  findGroupParentSystem(groupNodes, groupName, hierarchyAnalysis) {
    const parentSystemName = hierarchyAnalysis.get(groupName)
    if (parentSystemName) {
      return this.compoundMapping.get(`system-${parentSystemName}`)
    }
    return null
  }
  
  /**
   * Create node instances with membership validation rules
   */
  createNodeInstances(nodes, elements, analysis) {
    nodes.forEach(node => {
      const nodeId = this.getNodeId(node)
      const displayInstances = []
      
      // Apply membership validation rules
      const validatedMemberships = this.validateAndFilterMemberships(node, analysis)
      
      // Create instance for each valid group membership
      validatedMemberships.groups.forEach(groupName => {
        const groupCompoundId = this.compoundMapping.get(`group-${groupName}`)
        if (groupCompoundId) {
          const displayId = this.createNodeDisplayInstance(node, groupCompoundId, 'group', groupName, elements)
          displayInstances.push(displayId)
        }
      })
      
      // Create instance for each valid system membership
      validatedMemberships.systems.forEach(systemName => {
        const systemCompoundId = this.compoundMapping.get(`system-${systemName}`)
        if (systemCompoundId) {
          const displayId = this.createNodeDisplayInstance(node, systemCompoundId, 'system', systemName, elements)
          displayInstances.push(displayId)
        }
      })
      
      // If no compound memberships, create standalone instance
      if (displayInstances.length === 0) {
        const displayId = this.createNodeDisplayInstance(node, null, 'standalone', null, elements)
        displayInstances.push(displayId)
      }
      
      // Track all display instances for this asset node
      this.nodeMapping.set(nodeId, displayInstances)
      
      console.log(`Asset node ${nodeId} -> ${displayInstances.length} display instances:`, displayInstances)
    })
  }
  
  /**
   * Apply membership validation rules to prevent duplicates and enforce hierarchy
   */
  validateAndFilterMemberships(node, analysis) {
    const nodeId = this.getNodeId(node)
    
    // Rule 1: Deduplicate systems (no node in same system twice)
    const uniqueSystems = node.systems ? [...new Set(node.systems)] : []
    
    // Rule 2: Deduplicate groups (no node in same group twice)  
    const uniqueGroups = node.groups ? [...new Set(node.groups)] : []
    
    // Rule 3: HIERARCHICAL FILTERING - When a group is nested in a system,
    // nodes should appear ONLY in the group compound, not directly in the system
    const hierarchyAnalysis = this.analyzeHierarchy(analysis)
    
    let filteredSystems = [...uniqueSystems]
    let filteredGroups = [...uniqueGroups]
    
    // For each group this node belongs to, check if it's nested in a system
    uniqueGroups.forEach(groupName => {
      const parentSystemName = hierarchyAnalysis.get(groupName)
      if (parentSystemName && uniqueSystems.includes(parentSystemName)) {
        // This node belongs to both a group AND the system that contains the group
        // Remove the system membership - node should appear only in the nested group
        filteredSystems = filteredSystems.filter(sys => sys !== parentSystemName)
        console.log(`Node ${nodeId}: Hierarchical filtering - removed system "${parentSystemName}" membership (will appear in nested group "${groupName}")`)
      }
    })
    
    console.log(`Node ${nodeId}: Hierarchical membership validation`)
    console.log(`- Original systems: [${uniqueSystems.join(', ')}]`)
    console.log(`- Original groups: [${uniqueGroups.join(', ')}]`) 
    console.log(`- Filtered systems: [${filteredSystems.join(', ')}]`)
    console.log(`- Filtered groups: [${filteredGroups.join(', ')}]`)
    
    const result = {
      systems: filteredSystems,
      groups: filteredGroups
    }
    
    return result
  }
  
  /**
   * Create a display instance of a node for a specific compound context
   */
  createNodeDisplayInstance(node, parentCompoundId, membershipType, membershipName, elements) {
    const displayId = this.generateDisplayId(`node-${membershipType}`)
    
    const nodeData = {
      id: displayId,
      label: `${node.title || node.name || 'Node'} [${this.getNodeId(node)}]`,
      originalNodeId: this.getNodeId(node),
      membershipType: membershipType,
      membershipName: membershipName,
      // Copy other relevant node data
      type: this.determineNodeType(node),
      assetClass: node.assetClass || 'unknown'
    }
    
    if (parentCompoundId) {
      nodeData.parent = parentCompoundId
    }
    
    const displayNode = {
      group: 'nodes',
      data: nodeData,
      classes: this.getNodeClasses(node, membershipType)
    }
    
    elements.push(displayNode)
    
    console.log(`Created display node ${displayId} for asset ${this.getNodeId(node)} in ${membershipType}: ${membershipName}`)
    
    return displayId
  }
  
  /**
   * Determine node type from asset data
   */
  determineNodeType(node) {
    const assetClass = (node.assetClass || '').toLowerCase()
    
    if (assetClass.includes('server')) return 'server'
    if (assetClass.includes('database') || assetClass.includes('db')) return 'database'
    if (assetClass.includes('application') || assetClass.includes('app')) return 'application'
    if (assetClass.includes('network') || assetClass.includes('switch') || assetClass.includes('router')) return 'network'
    
    return 'default'
  }
  
  /**
   * Get CSS classes for a node based on its context
   */
  getNodeClasses(node, membershipType) {
    const classes = ['display-node']
    
    // Add type-based class
    const nodeType = this.determineNodeType(node)
    classes.push(`node-${nodeType}`)
    
    // Add context-based class
    if (membershipType) {
      classes.push(`member-${membershipType}`)
    }
    
    return classes.join(' ')
  }
  
  /**
   * Create edge instances between appropriate node instances
   */
  createEdgeInstances(edges, elements) {
    edges.forEach(edge => {
      const sourceInstances = this.nodeMapping.get(edge.fromId || edge.source) || []
      const targetInstances = this.nodeMapping.get(edge.toId || edge.target) || []
      
      // Create edge between first available instances
      // TODO: More sophisticated edge routing for multi-instance nodes
      if (sourceInstances.length > 0 && targetInstances.length > 0) {
        const displayEdgeId = this.generateDisplayId('edge')
        
        const displayEdge = {
          group: 'edges',
          data: {
            id: displayEdgeId,
            source: sourceInstances[0],
            target: targetInstances[0],
            originalEdgeId: edge.relationshipId || edge.id,
            label: edge.relationshipType || edge.type || ''
          }
        }
        
        elements.push(displayEdge)
        
        // Track mapping
        if (!this.edgeMapping.has(edge.relationshipId || edge.id)) {
          this.edgeMapping.set(edge.relationshipId || edge.id, [])
        }
        this.edgeMapping.get(edge.relationshipId || edge.id).push(displayEdgeId)
      }
    })
  }
  
  /**
   * Helper methods
   */
  
  generateDisplayId(prefix = 'element') {
    return `${prefix}-${++this.displayIdCounter}`
  }
  
  getNodeId(node) {
    return node.nodeId || node.tempUID || node.getId?.() || node.id
  }
  
  reset() {
    this.nodeMapping.clear()
    this.edgeMapping.clear()
    this.compoundMapping.clear()
    this.displayIdCounter = 0
  }
  
  /**
   * Reverse mapping - get original node ID from display node ID
   */
  getOriginalNodeId(displayNodeId) {
    for (const [originalId, displayIds] of this.nodeMapping.entries()) {
      if (displayIds.includes(displayNodeId)) {
        return originalId
      }
    }
    return null
  }
}
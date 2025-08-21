/**
 * GraphViewerService - Pure functions for graph operations and Cytoscape utilities
 * This service provides all the graph-related business logic without any React dependencies.
 */

import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import cola from 'cytoscape-cola'
import coseBilkent from 'cytoscape-cose-bilkent'
import { PermissionService } from '../../permissions/PermissionService.js'
import { buildCytoscapeStyle } from '../../styles/GraphViewerStyles.js'

// Register Cytoscape extensions
cytoscape.use(dagre)
cytoscape.use(cola)
cytoscape.use(coseBilkent)

/**
 * GraphViewerService - Collection of pure functions for graph operations
 */
export const GraphViewerService = {
  
  /**
   * Initializes Cytoscape instance with ITM-specific configuration
   */
  initializeCytoscape(container, nodes, edges, config) {
    if (!container) {
      throw new Error('Container element is required for Cytoscape initialization')
    }

    try {
      // Create deep mutable copies to avoid read-only property errors
      const mutableNodes = nodes.map(node => JSON.parse(JSON.stringify(node)))
      const mutableEdges = edges.map(edge => JSON.parse(JSON.stringify(edge)))
      
      const cytoscapeInstance = cytoscape({
        container: container,
        elements: [
          ...mutableNodes.map(node => this.transformNodeData(node)),
          ...mutableEdges.map(edge => this.transformEdgeData(edge))
        ],
        style: buildCytoscapeStyle(config.styling, config.theme),
        layout: this.calculateLayout(nodes, edges, config.layout),
        
        // Interaction settings
        userZoomingEnabled: !!config.enableZoom,
        userPanningEnabled: !!config.enablePan,
        boxSelectionEnabled: !!config.enableSelection,
        selectionType: config.selectionMode || 'single',
        
        // Initial viewport settings - ensure mutable objects
        zoom: 1,
        pan: { x: 0, y: 0 },
        
        // Performance settings
        hideEdgesOnViewport: nodes.length > 500,
        hideLabelsOnViewport: nodes.length > 500,
        pixelRatio: 'auto',
        motionBlur: true
      })

      return cytoscapeInstance
    } catch (error) {
      console.error('Failed to initialize Cytoscape:', error)
      throw error
    }
  },

  /**
   * Transforms ITM node data into Cytoscape format
   */
  transformNodeData(nodeData) {
    // Create completely mutable objects to avoid read-only errors
    const mutableNodeData = JSON.parse(JSON.stringify(nodeData))
    
    // Determine border color based on node type for hover restoration
    const nodeType = this.getNodeType(mutableNodeData)
    let originalBorderColor = '#666666' // default
    
    if (nodeType === 'server') originalBorderColor = '#388E3C'
    else if (nodeType === 'database') originalBorderColor = '#F57C00'
    else if (nodeType === 'application') originalBorderColor = '#7B1FA2'
    else if (nodeType === 'network') originalBorderColor = '#1976D2'
    
    return {
      data: {
        id: mutableNodeData.nodeId || mutableNodeData.id,
        label: mutableNodeData.title || mutableNodeData.name || `Node ${mutableNodeData.nodeId}`,
        type: this.getNodeType(mutableNodeData),
        assetClass: mutableNodeData.assetClass || 'unknown',
        systems: [...(mutableNodeData.systems || [])],
        groups: [...(mutableNodeData.groups || [])],
        properties: { ...(mutableNodeData.properties || {}) },
        // Store original border color for hover effects
        originalBorderColor: originalBorderColor,
        // Store full node data for access in events (mutable copy)
        nodeData: { ...mutableNodeData }
      },
      // Ensure position is mutable if it exists
      position: mutableNodeData.properties && (mutableNodeData.properties.x !== undefined && mutableNodeData.properties.y !== undefined) ? 
        { x: Number(mutableNodeData.properties.x), y: Number(mutableNodeData.properties.y) } : undefined
    }
  },

  /**
   * Transforms ITM relationship data into Cytoscape edge format  
   */
  transformEdgeData(edgeData) {
    // Create completely mutable objects to avoid read-only errors
    const mutableEdgeData = JSON.parse(JSON.stringify(edgeData))
    return {
      data: {
        id: mutableEdgeData.relationshipId || mutableEdgeData.id,
        source: mutableEdgeData.fromId || mutableEdgeData.source,
        target: mutableEdgeData.toId || mutableEdgeData.target,
        label: mutableEdgeData.relationshipType || mutableEdgeData.type || '',
        type: mutableEdgeData.relationshipType || 'default',
        properties: { ...(mutableEdgeData.properties || {}) },
        // Store full edge data for access in events (mutable copy)
        edgeData: { ...mutableEdgeData }
      }
    }
  },

  /**
   * Determines node type from ITM node data
   */
  getNodeType(nodeData) {
    // Try to determine type from asset class name
    const assetClass = (nodeData.assetClass || '').toLowerCase()
    
    if (assetClass.includes('server')) return 'server'
    if (assetClass.includes('database') || assetClass.includes('db')) return 'database'
    if (assetClass.includes('application') || assetClass.includes('app')) return 'application'
    if (assetClass.includes('network') || assetClass.includes('switch') || assetClass.includes('router')) return 'network'
    
    // Try to determine from node properties
    const props = nodeData.properties || {}
    if (props.type) return props.type.toLowerCase()
    
    return 'default'
  },


  /**
   * Calculates optimal layout configuration based on graph data
   */
  calculateLayout(nodes, edges, layoutType = 'dagre') {
    const nodeCount = nodes.length
    const edgeCount = edges.length
    const density = edgeCount / (nodeCount * (nodeCount - 1))
    
    switch (layoutType) {
      case 'dagre':
        return {
          name: 'dagre',
          rankDir: 'TB', // Top to bottom
          align: 'DR',   // Down-right alignment
          rankerNodeSpacing: 50,
          edgeLengthVal: 10,
          animate: nodeCount < 100,
          animationDuration: 500
        }
        
      case 'cola':
        return {
          name: 'cola',
          animate: nodeCount < 200,
          maxSimulationTime: 3000,
          ungrabifyWhileSimulating: false,
          fit: true,
          padding: 30,
          edgeLength: 100,
          nodeSpacing: 30
        }
        
      case 'cose-bilkent':
        return {
          name: 'cose-bilkent',
          animate: nodeCount < 150,
          animationDuration: 1000,
          fit: true,
          padding: 30,
          idealEdgeLength: 100,
          nodeRepulsion: 4500,
          nestingFactor: 0.1
        }
        
      case 'grid':
        return {
          name: 'grid',
          fit: true,
          padding: 30,
          rows: Math.ceil(Math.sqrt(nodeCount)),
          animate: false
        }
        
      case 'circle':
        return {
          name: 'circle',
          fit: true,
          padding: 30,
          animate: nodeCount < 50,
          animationDuration: 500
        }
        
      default:
        // Auto-select best layout based on graph characteristics
        if (density > 0.3 || nodeCount < 20) return this.calculateLayout(nodes, edges, 'circle')
        if (this.hasHierarchicalStructure(edges)) return this.calculateLayout(nodes, edges, 'dagre')
        return this.calculateLayout(nodes, edges, 'cola')
    }
  },

  /**
   * Checks if graph has hierarchical structure (for layout selection)
   */
  hasHierarchicalStructure(edges) {
    // Simple heuristic: check for dependency-type relationships
    const dependencyTypes = ['depends_on', 'contains', 'parent_of']
    const hierarchicalEdges = edges.filter(edge => 
      dependencyTypes.some(type => 
        (edge.relationshipType || edge.type || '').toLowerCase().includes(type)
      )
    )
    return hierarchicalEdges.length > edges.length * 0.5
  },

  /**
   * Validates user permissions for operations that permanently change graph data
   * Delegates to PermissionService for centralized permission management
   */
  checkPermission(operation, userPermissions, context = {}) {
    return PermissionService.checkPermission(operation, userPermissions, context)
  },

  /**
   * Applies filters to graph data
   */
  applyFilters(nodes, edges, filters) {
    let filteredNodes = [...nodes]
    let filteredEdges = [...edges]
    
    // Filter by asset types
    if (filters.assetTypes && filters.assetTypes.length > 0) {
      filteredNodes = filteredNodes.filter(node => 
        filters.assetTypes.includes(this.getNodeType(node))
      )
    }
    
    // Filter by systems
    if (filters.systems && filters.systems.length > 0) {
      filteredNodes = filteredNodes.filter(node =>
        node.systems && node.systems.some(system => filters.systems.includes(system))
      )
    }
    
    // Filter by groups
    if (filters.groups && filters.groups.length > 0) {
      filteredNodes = filteredNodes.filter(node =>
        node.groups && node.groups.some(group => filters.groups.includes(group))
      )
    }
    
    // Text search in properties
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filteredNodes = filteredNodes.filter(node => {
        const searchableText = [
          node.title,
          node.assetClass,
          JSON.stringify(node.properties)
        ].join(' ').toLowerCase()
        return searchableText.includes(query)
      })
    }
    
    // Filter edges to only include those with both endpoints in filtered nodes
    const nodeIds = new Set(filteredNodes.map(node => node.nodeId || node.id))
    filteredEdges = filteredEdges.filter(edge =>
      nodeIds.has(edge.fromId || edge.source) && nodeIds.has(edge.toId || edge.target)
    )
    
    return { nodes: filteredNodes, edges: filteredEdges }
  },

  /**
   * Calculates graph metrics and statistics
   */
  calculateMetrics(nodes, edges) {
    const nodeCount = nodes.length
    const edgeCount = edges.length
    
    // Calculate degree distribution
    const degrees = {}
    nodes.forEach(node => {
      const nodeId = node.nodeId || node.id
      degrees[nodeId] = 0
    })
    
    edges.forEach(edge => {
      const sourceId = edge.fromId || edge.source
      const targetId = edge.toId || edge.target
      if (degrees[sourceId] !== undefined) degrees[sourceId]++
      if (degrees[targetId] !== undefined) degrees[targetId]++
    })
    
    const degreeValues = Object.values(degrees)
    const avgDegree = degreeValues.reduce((sum, deg) => sum + deg, 0) / nodeCount
    const maxDegree = Math.max(...degreeValues)
    
    // Calculate connectivity
    const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2
    const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0
    
    // Asset type distribution
    const assetTypeDistribution = {}
    nodes.forEach(node => {
      const type = this.getNodeType(node)
      assetTypeDistribution[type] = (assetTypeDistribution[type] || 0) + 1
    })
    
    // Relationship type distribution
    const relationshipTypeDistribution = {}
    edges.forEach(edge => {
      const type = edge.relationshipType || edge.type || 'unknown'
      relationshipTypeDistribution[type] = (relationshipTypeDistribution[type] || 0) + 1
    })
    
    return {
      nodeCount,
      edgeCount,
      density: Math.round(density * 1000) / 1000,
      averageDegree: Math.round(avgDegree * 10) / 10,
      maxDegree,
      assetTypeDistribution,
      relationshipTypeDistribution,
      isConnected: this.isGraphConnected(nodes, edges),
      hasCycles: this.hasGyphics(edges)
    }
  },

  /**
   * Checks if graph is connected
   */
  isGraphConnected(nodes, edges) {
    if (nodes.length <= 1) return true
    
    // Build adjacency list
    const adjacency = {}
    nodes.forEach(node => {
      adjacency[node.nodeId || node.id] = []
    })
    
    edges.forEach(edge => {
      const source = edge.fromId || edge.source
      const target = edge.toId || edge.target
      if (adjacency[source]) adjacency[source].push(target)
      if (adjacency[target]) adjacency[target].push(source)
    })
    
    // BFS from first node
    const visited = new Set()
    const queue = [nodes[0].nodeId || nodes[0].id]
    
    while (queue.length > 0) {
      const current = queue.shift()
      if (visited.has(current)) continue
      
      visited.add(current)
      const neighbors = adjacency[current] || []
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      })
    }
    
    return visited.size === nodes.length
  },

  /**
   * Checks if graph has cycles
   */
  hasGyphics(edges) {
    // Simple cycle detection using DFS
    const adjacency = {}
    const visited = new Set()
    const recursionStack = new Set()
    
    // Build directed adjacency list
    edges.forEach(edge => {
      const source = edge.fromId || edge.source
      const target = edge.toId || edge.target
      if (!adjacency[source]) adjacency[source] = []
      adjacency[source].push(target)
    })
    
    const hasCycleUtil = (node) => {
      visited.add(node)
      recursionStack.add(node)
      
      const neighbors = adjacency[node] || []
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleUtil(neighbor)) return true
        } else if (recursionStack.has(neighbor)) {
          return true
        }
      }
      
      recursionStack.delete(node)
      return false
    }
    
    for (const startNode of Object.keys(adjacency)) {
      if (!visited.has(startNode)) {
        if (hasCycleUtil(startNode)) return true
      }
    }
    
    return false
  },

  /**
   * Exports graph data in various formats
   */
  exportGraph(cytoscapeInstance, format) {
    if (!cytoscapeInstance) {
      throw new Error('Cytoscape instance is required for export')
    }
    
    switch (format) {
      case 'png':
        return cytoscapeInstance.png({
          output: 'base64',
          bg: 'white',
          full: true,
          scale: 2
        })
        
      case 'jpg':
        return cytoscapeInstance.jpg({
          output: 'base64',
          bg: 'white', 
          full: true,
          scale: 2
        })
        
      case 'svg':
        return cytoscapeInstance.svg({
          full: true,
          scale: 1
        })
        
      case 'json':
        return JSON.stringify(cytoscapeInstance.json(), null, 2)
        
      case 'elements':
        return {
          nodes: cytoscapeInstance.nodes().map(node => node.data()),
          edges: cytoscapeInstance.edges().map(edge => edge.data())
        }
        
      default:
        throw new Error(`Unsupported export format: ${format}`)
    }
  }
}
/**
 * GraphViewer - Pure React View Component
 * 
 * Clean component focused only on rendering with V1 styling system
 */

import React, { useRef, useEffect, useCallback, forwardRef } from 'react'
import { Box, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import cytoscape from 'cytoscape'
import dagre from 'cytoscape-dagre'
import { buildCytoscapeStyle } from '../../styles/GraphViewerStyles.js'

// Register Cytoscape extensions
cytoscape.use(dagre)

/**
 * Pure GraphViewer component with clean architecture
 */
const GraphViewer = forwardRef(({
  elements = [],
  style = {},
  onEvent = () => {},
  onCytoscapeReady = () => {},
  onNodesMove = () => {},
  userPermissions = 'viewer',
  ...props
}, ref) => {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const theme = useTheme()
  
  // Use refs for stable callback references
  const onEventRef = useRef(onEvent)
  const onCytoscapeReadyRef = useRef(onCytoscapeReady)
  const onNodesMoveRef = useRef(onNodesMove)
  
  // Update refs when props change
  onEventRef.current = onEvent
  onCytoscapeReadyRef.current = onCytoscapeReady
  onNodesMoveRef.current = onNodesMove

  /**
   * Setup interactive features: hover effects and drag-to-connect
   */
  const setupInteractiveFeatures = useCallback((cy) => {
    // Hover effects - 10px blue border
    cy.on('mouseover', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.selected()) {
        node.style('border-color', '#0074cc')
        node.style('border-width', 10)
      }
      
      onEventRef.current('node_hover', {
        nodeId: node.id(),
        nodeData: node.data(),
        position: node.position()
      })
    })

    cy.on('mouseout', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.selected()) {
        // Restore original border color based on node type
        const nodeType = node.data('type') || 'unknown'
        let originalColor = '#666666' // default
        
        if (nodeType === 'server') originalColor = '#388E3C'
        else if (nodeType === 'database') originalColor = '#F57C00'  
        else if (nodeType === 'application') originalColor = '#7B1FA2'
        else if (nodeType === 'network') originalColor = '#1976D2'
        
        node.style('border-color', originalColor)
        node.style('border-width', 2)
      }
    })

    // Drag-to-connect functionality
    let isDragging = false
    let dragStartNode = null

    cy.on('mousedown', 'node', (event) => {
      const node = event.target
      if (node.hasClass('group-hull')) return
      
      const mousePos = event.position || event.cyPosition
      const nodePos = node.position()
      const nodeSize = node.width() || 60
      
      // Calculate distance from center to click point
      const distance = Math.sqrt(
        Math.pow(mousePos.x - nodePos.x, 2) + Math.pow(mousePos.y - nodePos.y, 2)
      )
      const borderThickness = 8
      
      // If click is near border (within 8px of edge), start drag-to-connect
      if (distance > (nodeSize/2 - borderThickness)) {
        if (userPermissions === 'editor' || userPermissions === 'admin') {
          dragStartNode = node
          isDragging = true
          node.ungrabify() // Prevent normal dragging
          event.stopPropagation()
          event.preventDefault()
          
          onEventRef.current('drag_connect_start', {
            nodeId: node.id(),
            nodeData: node.data()
          })
        }
      } else {
        // Normal click - allow selection and dragging
        node.grabify()
      }
    })

    cy.on('mousemove', (event) => {
      if (isDragging && dragStartNode) {
        // Remove existing temp elements
        cy.elements('.temp-edge, .temp-node').remove()
        
        const timestamp = Date.now()
        const tempNodeId = `temp-target-${timestamp}`
        const tempEdgeId = `temp-edge-${timestamp}`
        
        // Create temporary visual feedback
        cy.add([
          {
            group: 'nodes',
            data: { 
              id: tempNodeId,
              label: '',
              type: 'temp'
            },
            position: { x: event.position.x, y: event.position.y },
            classes: 'temp-node'
          },
          {
            group: 'edges', 
            data: {
              id: tempEdgeId,
              source: dragStartNode.id(),
              target: tempNodeId
            },
            classes: 'temp-edge'
          }
        ])
      }
    })

    cy.on('mouseup', (event) => {
      if (isDragging && dragStartNode) {
        // Clean up temp elements
        cy.elements('.temp-edge, .temp-node').remove()
        
        // Re-enable node dragging
        dragStartNode.grabify()
        
        const targetNode = event.target
        
        if (targetNode.isNode && targetNode.isNode() && 
            !targetNode.hasClass('temp-node') && 
            !targetNode.hasClass('group-hull') &&
            dragStartNode.id() !== targetNode.id()) {
          // Connect to existing node
          onEventRef.current('create_edge', {
            sourceId: dragStartNode.id(),
            targetId: targetNode.id(),
            sourceData: dragStartNode.data(),
            targetData: targetNode.data()
          })
        } else {
          // Check if dropped on empty space
          const position = event.position
          if (position && !targetNode.isNode()) {
            onEventRef.current('create_node_and_edge', {
              sourceId: dragStartNode.id(),
              sourceData: dragStartNode.data(),
              position: position
            })
          }
        }
        
        // Reset drag state
        isDragging = false
        dragStartNode = null
      }
    })

    // Background click for node creation (Ctrl+click)
    cy.on('tap', (event) => {
      if (event.target === cy) { // Clicked on background
        const originalEvent = event.originalEvent
        if (originalEvent && originalEvent.ctrlKey) {
          if (userPermissions === 'editor' || userPermissions === 'admin') {
            onEventRef.current('create_node', {
              position: event.position
            })
          }
        } else {
          // Clear selection on background click
          cy.elements().unselect()
          onEventRef.current('background_click', {
            position: event.position
          })
        }
      }
    })

    // Node click events
    cy.on('tap', 'node', (event) => {
      const node = event.target
      if (node.hasClass('group-hull')) return
      
      const originalEvent = event.originalEvent
      
      onEventRef.current('node_click', {
        nodeId: node.id(),
        nodeData: node.data(),
        position: event.position,
        ctrlKey: originalEvent ? !!originalEvent.ctrlKey : false,
        shiftKey: originalEvent ? !!originalEvent.shiftKey : false
      })
    })

    cy.on('dbltap', 'node', (event) => {
      const node = event.target
      if (node.hasClass('group-hull')) return
      
      onEventRef.current('node_double_click', {
        nodeId: node.id(),
        nodeData: node.data(),
        position: event.position
      })
    })

    // Edge events
    cy.on('tap', 'edge', (event) => {
      const edge = event.target
      if (edge.hasClass('temp-edge')) return
      
      onEventRef.current('edge_click', {
        edgeId: edge.id(),
        edgeData: edge.data(),
        sourceId: edge.source().id(),
        targetId: edge.target().id(),
        position: event.position
      })
    })

    cy.on('dbltap', 'edge', (event) => {
      const edge = event.target
      if (edge.hasClass('temp-edge')) return
      
      onEventRef.current('edge_double_click', {
        edgeId: edge.id(), 
        edgeData: edge.data(),
        sourceId: edge.source().id(),
        targetId: edge.target().id(),
        position: event.position
      })
    })

  }, [])

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return

    console.log('GraphViewer: Initializing Cytoscape with V1 styling system')
    
    const cy = cytoscape({
      container: containerRef.current,
      style: buildCytoscapeStyle({}, theme),
      layout: {
        name: 'dagre',
        nodeSep: 100,
        edgeSep: 50,
        rankSep: 150
      },
      wheelSensitivity: 0.2,
      maxZoom: 3,
      minZoom: 0.1,
      // Enable user interaction
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: true,
      // This should be enabled by default, but let's be explicit
      autoungrabify: false,
      autolock: false
    })

    cyRef.current = cy
    console.log('GraphViewer: Cytoscape initialized successfully')
    
    // Setup node move listeners for hull auto-refresh
    
    cy.on('position', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.data('isCompound')) {
        // Throttle hull updates to avoid excessive redraws
        clearTimeout(cy._hullUpdateTimeout)
        cy._hullUpdateTimeout = setTimeout(() => {
          onNodesMoveRef.current()
        }, 100)
      }
    })
    
    // Listen to drag events for immediate feedback
    cy.on('drag', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.data('isCompound')) {
        clearTimeout(cy._hullUpdateTimeout)
        cy._hullUpdateTimeout = setTimeout(() => {
          onNodesMoveRef.current()
        }, 50) // Faster updates during drag
      }
    })
    
    // Listen to free (end of drag) events for final update
    cy.on('free', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.data('isCompound')) {
        onNodesMoveRef.current() // Immediate final update
      }
    })
    
    // Setup interactive features
    setupInteractiveFeatures(cy)
    
    // Notify parent component that Cytoscape is ready
    onCytoscapeReadyRef.current(cy)

    return () => {
      if (cyRef.current) {
        // Clear any pending timeouts
        clearTimeout(cyRef.current._hullUpdateTimeout)
        clearTimeout(cyRef.current._dragTimeout)
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [theme])

  // Update elements when data changes
  useEffect(() => {
    if (!cyRef.current) return
    
    console.log(`GraphViewer: Updating ${elements.length} elements`)
    
    cyRef.current.batch(() => {
      cyRef.current.elements().remove()
      cyRef.current.add(elements)
    })
    
    // Apply layout
    cyRef.current.layout({ 
      name: 'dagre',
      nodeSep: 100,
      edgeSep: 50,
      rankSep: 150
    }).run()
    
    // Fit to viewport
    setTimeout(() => {
      if (cyRef.current) {
        cyRef.current.fit(null, 50)
      }
    }, 100)
    
  }, [elements])

  return (
    <Paper
      elevation={2}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#fafafa',
        ...style
      }}
      {...props}
    >
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />
    </Paper>
  )
})

GraphViewer.displayName = 'GraphViewer'

export default GraphViewer
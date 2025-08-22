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
   * Setup interactive features: custom drag-to-connect system
   */
  const setupInteractiveFeatures = useCallback((cy) => {
    console.log('🎯 Setting up custom drag-to-connect system')
    
    // State for drag-to-connect
    let isDragging = false
    let dragStartNode = null
    let tempEdge = null
    
    // Enhanced hover effects
    cy.on('mouseover', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.data('isCompound') && !node.selected()) {
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
      if (!node.hasClass('group-hull') && !node.data('isCompound') && !node.selected()) {
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

    // Border click detection for edge creation
    cy.on('mousedown', 'node', (event) => {
      const node = event.target
      
      // Skip for hull groups and compound nodes
      if (node.hasClass('group-hull') || node.data('isCompound')) {
        return
      }
      
      // Only allow edge creation for editors/admins
      if (userPermissions !== 'editor' && userPermissions !== 'admin') {
        node.select()
        return
      }
      
      // Check if click is on the border (edge creation zone)
      const mousePos = event.position || event.cyPosition
      const nodePos = node.position()
      const nodeSize = node.width()
      
      const distance = Math.sqrt(
        Math.pow(mousePos.x - nodePos.x, 2) + 
        Math.pow(mousePos.y - nodePos.y, 2)
      )
      
      const borderThickness = 8
      
      if (distance > (nodeSize/2 - borderThickness)) {
        // Border click - start edge creation
        console.log('🎯 Border click detected - starting edge creation')
        dragStartNode = node
        isDragging = true
        node.ungrabify()
        event.stopPropagation()
        event.preventDefault()
        
        onEventRef.current('edge_creation_start', {
          sourceId: node.id(),
          sourceData: node.data()
        })
      } else {
        // Center click - normal selection/dragging
        node.grabify()
        node.select()
      }
    })

    // Create temporary edge during drag
    cy.on('mousemove', (event) => {
      if (isDragging && dragStartNode && (userPermissions === 'editor' || userPermissions === 'admin')) {
        // Ensure dragStartNode still exists in the graph
        if (!cy.getElementById(dragStartNode.id()).length) {
          console.warn('Drag source node no longer exists, canceling drag')
          isDragging = false
          dragStartNode = null
          return
        }

        // Remove previous temp elements
        cy.elements('.temp-edge').remove()
        cy.elements('.temp-node').remove()

        const timestamp = Date.now()
        const tempNodeId = `temp-target-${timestamp}`
        const tempEdgeId = `temp-edge-${timestamp}`

        try {
          // Create temporary target node
          const tempNode = cy.add({
            group: 'nodes',
            data: { 
              id: tempNodeId,
              label: 'temp-target'
            },
            position: { x: event.position.x, y: event.position.y },
            classes: 'temp-node'
          })

          // Create temporary edge only if both nodes exist
          if (cy.getElementById(dragStartNode.id()).length && cy.getElementById(tempNodeId).length) {
            tempEdge = cy.add({
              group: 'edges',
              data: {
                id: tempEdgeId,
                source: dragStartNode.id(),
                target: tempNodeId
              },
              classes: 'temp-edge'
            })
          }
        } catch (error) {
          console.warn('Error creating temp elements:', error)
          // Clean up on error
          cy.elements('.temp-edge').remove()
          cy.elements('.temp-node').remove()
        }
      }
    })

    // Complete edge creation on mouse up
    cy.on('mouseup', (event) => {
      if (isDragging && dragStartNode) {
        // Clean up temp elements
        cy.elements('.temp-edge').remove()
        cy.elements('.temp-node').remove()

        dragStartNode.grabify()

        // Only create edges if user has permissions
        if (userPermissions === 'editor' || userPermissions === 'admin') {
          const targetNode = event.target
          
          if (targetNode !== cy && targetNode.isNode() && !targetNode.hasClass('temp-node') && 
              !targetNode.hasClass('group-hull') && !targetNode.data('isCompound')) {
            
            // Prevent self-loops (same source and target)
            if (targetNode.id() === dragStartNode.id()) {
              console.log('🚫 Preventing self-loop creation')
              return
            }
            
            // Connect to existing node
            console.log('✅ Creating edge between nodes')
            const edgeId = `edge_${dragStartNode.id()}_${targetNode.id()}_${Date.now()}`
            
            cy.add({
              group: 'edges',
              data: {
                id: edgeId,
                source: dragStartNode.id(),
                target: targetNode.id(),
                relationshipType: 'connects_to'
              }
            })
            
            onEventRef.current('create_edge', {
              sourceId: dragStartNode.id(),
              targetId: targetNode.id(),
              edgeId: edgeId,
              sourceData: dragStartNode.data(),
              targetData: targetNode.data()
            })
          } else {
            // Check if we can create a node at this position
            const nodeAtPosition = cy.nodes().filter(function(node) {
              if (node.hasClass('temp-node') || node.hasClass('group-hull') || node.data('isCompound')) return false
              const nodePos = node.position()
              const distance = Math.sqrt(
                Math.pow(event.position.x - nodePos.x, 2) +
                Math.pow(event.position.y - nodePos.y, 2)
              )
              return distance < node.width() / 2
            })

            if (nodeAtPosition.length > 0) {
              // Connect to node at position
              const targetNode = nodeAtPosition[0]
              console.log('✅ Creating edge to node at position')
              const edgeId = `edge_${dragStartNode.id()}_${targetNode.id()}_${Date.now()}`
              
              cy.add({
                group: 'edges',
                data: {
                  id: edgeId,
                  source: dragStartNode.id(),
                  target: targetNode.id(),
                  relationshipType: 'connects_to'
                }
              })
              
              onEventRef.current('create_edge', {
                sourceId: dragStartNode.id(),
                targetId: targetNode.id(),
                edgeId: edgeId
              })
            } else {
              // Create new node and connect
              console.log('🆕 Creating new node at empty space')
              const nodeId = `node_${Date.now()}`
              const newNode = cy.add({
                group: 'nodes',
                data: {
                  id: nodeId,
                  label: `New Node`,
                  type: 'application',
                  assetClass: 'Application'
                },
                position: {
                  x: event.position.x,
                  y: event.position.y
                }
              })
              
              const edgeId = `edge_${dragStartNode.id()}_${nodeId}_${Date.now()}`
              cy.add({
                group: 'edges',
                data: {
                  id: edgeId,
                  source: dragStartNode.id(),
                  target: nodeId,
                  relationshipType: 'connects_to'
                }
              })
              
              onEventRef.current('create_node', {
                nodeId: nodeId,
                position: event.position,
                nodeData: newNode.data()
              })
              
              onEventRef.current('create_edge', {
                sourceId: dragStartNode.id(),
                targetId: nodeId,
                edgeId: edgeId
              })
            }
          }
        }
      }
      
      // Reset drag state
      isDragging = false
      dragStartNode = null
      tempEdge = null
    })

    // Simple tooltip system using HTML title attribute (no popper plugin needed)
    const setupSimpleTooltips = () => {
      cy.nodes().forEach(node => {
        if (node.hasClass('group-hull')) return
        
        const nodeData = node.data()
        const tooltipText = [
          `${nodeData.label || nodeData.id}`,
          `Type: ${nodeData.type || 'Unknown'}`,
          nodeData.assetClass ? `Asset: ${nodeData.assetClass}` : '',
          nodeData.systems ? `Systems: ${nodeData.systems.join(', ')}` : '',
          nodeData.groups ? `Groups: ${nodeData.groups.join(', ')}` : ''
        ].filter(Boolean).join('\n')
        
        // Add title attribute for native browser tooltips
        node.data('tooltip', tooltipText)
      })
    }

    // Setup simple tooltips after initial render
    setTimeout(setupSimpleTooltips, 100)

    // Background click for node creation (Ctrl+click or Cmd+click) with debug logging
    cy.on('tap', (event) => {
      if (event.target === cy) { // Clicked on background
        const originalEvent = event.originalEvent
        const isModifierClick = originalEvent && (originalEvent.ctrlKey || originalEvent.metaKey)
        
        console.log('Background click detected:', {
          hasOriginalEvent: !!originalEvent,
          ctrlKey: originalEvent?.ctrlKey,
          metaKey: originalEvent?.metaKey,
          isModifierClick,
          userPermissions,
          position: event.position
        })
        
        if (isModifierClick) {
          if (userPermissions === 'editor' || userPermissions === 'admin') {
            console.log('Creating node at:', event.position)
            
            // Actually create the node in the graph (like the original implementation)
            const nodeId = `node_${Date.now()}`
            const newNodeData = {
              group: 'nodes',
              data: {
                id: nodeId,
                label: `New Node`,
                type: 'application', // Default type
                assetClass: 'Application'
              },
              position: {
                x: event.position.x,
                y: event.position.y
              }
            }
            
            const newNode = cy.add(newNodeData)
            
            // Fire event for logging/monitoring
            onEventRef.current('create_node', {
              nodeId: nodeId,
              position: event.position,
              nodeData: newNode.data()
            })
          } else {
            console.log('Node creation blocked - insufficient permissions')
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
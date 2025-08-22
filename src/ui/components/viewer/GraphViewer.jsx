/**
 * GraphViewer - Pure React View Component
 * 
 * Clean component focused only on rendering with V1 styling system
 */

import React, { useRef, useEffect, forwardRef } from 'react'
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
  ...props
}, ref) => {
  const containerRef = useRef(null)
  const cyRef = useRef(null)
  const theme = useTheme()

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
          onNodesMove()
        }, 100)
      }
    })
    
    // Listen to drag events for immediate feedback
    cy.on('drag', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.data('isCompound')) {
        clearTimeout(cy._hullUpdateTimeout)
        cy._hullUpdateTimeout = setTimeout(() => {
          onNodesMove()
        }, 50) // Faster updates during drag
      }
    })
    
    // Listen to free (end of drag) events for final update
    cy.on('free', 'node', (event) => {
      const node = event.target
      if (!node.hasClass('group-hull') && !node.data('isCompound')) {
        onNodesMove() // Immediate final update
      }
    })
    
    // Notify parent component that Cytoscape is ready
    onCytoscapeReady(cy)

    return () => {
      if (cyRef.current) {
        // Clear any pending timeouts
        clearTimeout(cyRef.current._hullUpdateTimeout)
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
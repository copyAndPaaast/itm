/**
 * GraphViewer V2 - Clean implementation with intelligent data mapping
 * 
 * This version uses the CytoscapeMapper to handle the complexity of
 * translating business data to Cytoscape display requirements.
 */

import React, { useRef, useEffect, useState } from 'react'
import { Box, Paper, Typography } from '@mui/material'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import { CytoscapeMapper } from './CytoscapeMapper.js'

// Register layout extension
cytoscape.use(coseBilkent)

// Basic styles for compounds and nodes
const CYTOSCAPE_STYLES = [
  // Regular nodes
  {
    selector: 'node:parent',
    style: {
      'background-opacity': 0.1,
      'background-color': '#E3F2FD',
      'border-width': 2,
      'border-color': '#1976D2',
      'border-style': 'solid',
      'label': 'data(label)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': 16,
      'font-weight': 'bold',
      'color': '#1976D2',
      'text-margin-y': 10,
      'padding': 30,
      'min-width': 200,
      'min-height': 150
    }
  },
  
  // Group compounds (light grey background)
  {
    selector: '.group-compound',
    style: {
      'background-color': '#F8F8F8',
      'background-opacity': 0.8,
      'border-color': '#BDBDBD',
      'border-style': 'solid',
      'color': '#757575'
    }
  },
  
  // System compounds (green)
  {
    selector: '.system-compound',
    style: {
      'background-color': '#E8F5E8',
      'border-color': '#4CAF50',
      'color': '#2E7D32',
      'border-style': 'dashed'
    }
  },
  
  // Regular nodes
  {
    selector: 'node:child',
    style: {
      'background-color': '#ffffff',
      'border-width': 2,
      'border-color': '#666666',
      'width': 60,
      'height': 60,
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': 12
    }
  },
  
  // Edges
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#666666',
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#666666'
    }
  }
]

export const GraphViewerV2 = ({ nodes = [], edges = [] }) => {
  const containerRef = useRef(null)
  const cytoscapeRef = useRef(null)
  const mapperRef = useRef(new CytoscapeMapper())
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    // Initialize Cytoscape
    const cy = cytoscape({
      container: containerRef.current,
      style: CYTOSCAPE_STYLES,
      elements: [], // Start empty
      layout: { name: 'preset' },
      userZoomingEnabled: true,
      userPanningEnabled: true,
      boxSelectionEnabled: false
    })

    cytoscapeRef.current = cy
    setIsInitialized(true)

    // Cleanup
    return () => {
      if (cytoscapeRef.current) {
        cytoscapeRef.current.destroy()
      }
    }
  }, [])

  // Update graph when data changes
  useEffect(() => {
    if (!isInitialized || !cytoscapeRef.current) return
    if (!nodes.length) return

    console.log("=== GraphViewer V2 updating ===")
    console.log("Input nodes:", nodes.length)
    console.log("Input edges:", edges.length)

    try {
      // Use the intelligent mapper
      const cytoscapeElements = mapperRef.current.mapToCytoscape(nodes, edges)
      
      // Clear and add new elements
      cytoscapeRef.current.elements().remove()
      cytoscapeRef.current.add(cytoscapeElements)
      
      // Apply layout
      cytoscapeRef.current.layout({
        name: 'cose-bilkent',
        quality: 'default',
        animate: true,
        animationDuration: 1000,
        fit: true,
        padding: 30,
        nodeRepulsion: 4500,
        idealEdgeLength: 100,
        nestingFactor: 1.2,
        gravity: 0.25
      }).run()
      
      console.log("=== GraphViewer V2 update complete ===")
      
    } catch (error) {
      console.error("Error updating GraphViewer V2:", error)
    }
  }, [nodes, edges, isInitialized])

  return (
    <Paper sx={{ height: '100%', width: '100%', position: 'relative' }}>
      <Box
        ref={containerRef}
        sx={{
          height: '100%',
          width: '100%',
          '& canvas': {
            outline: 'none'
          }
        }}
      />
      
      {/* Debug info */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '4px 8px',
          borderRadius: 1,
          fontSize: '0.75rem'
        }}
      >
        GraphViewer V2 | Nodes: {nodes.length} | Edges: {edges.length}
      </Box>
    </Paper>
  )
}

export default GraphViewerV2
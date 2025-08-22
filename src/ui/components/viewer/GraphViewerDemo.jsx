/**
 * GraphViewerDemo - Development State Demo
 * 
 * Demo with exactly four nodes reflecting current development state
 */

import React, { useState, useCallback } from 'react'
import { Box, Typography, Paper, Chip } from '@mui/material'

import GraphViewer from './GraphViewer.jsx'
import { GraphViewerMapper } from './GraphViewerMapper.js'
import { ViewerEvents } from './GraphViewerInterface.js'

/**
 * Demo data - exactly four nodes reflecting current development state
 */
const createDemoData = () => {
  // Four nodes representing current viewer development phases
  const nodes = [
    {
      nodeId: 1001,
      title: 'GraphViewer Interface',
      assetClass: 'Application',
      systems: ['ViewerArchitecture'],
      groups: ['Step1Foundation'],
      properties: { 
        status: 'completed',
        description: 'Interface definitions and contracts'
      }
    },
    {
      nodeId: 1002, 
      title: 'Data Mapper',
      assetClass: 'WebServer',
      systems: ['ViewerArchitecture'],
      groups: ['Step1Foundation'],
      properties: {
        status: 'completed', 
        description: 'Business data to Cytoscape transformation'
      }
    },
    {
      nodeId: 1003,
      title: 'Service Layer',
      assetClass: 'DatabaseServer',
      systems: ['ViewerArchitecture'], 
      groups: ['Step5Interactive'],
      properties: {
        status: 'placeholder',
        description: 'Interactive features and event handling'
      }
    },
    {
      nodeId: 1004,
      title: 'React Component',
      assetClass: 'Application',
      systems: ['ViewerArchitecture'],
      groups: ['Step4ViewComponent'],
      properties: {
        status: 'placeholder',
        description: 'Pure view component with Cytoscape'
      }
    }
  ]

  const edges = [
    {
      id: 'edge_1',
      source: 1001,
      target: 1002,
      relationshipType: 'defines_contract_for'
    },
    {
      id: 'edge_2', 
      source: 1002,
      target: 1004,
      relationshipType: 'transforms_data_for'
    },
    {
      id: 'edge_3',
      source: 1003,
      target: 1004,
      relationshipType: 'handles_events_for' 
    }
  ]

  return { nodes, edges }
}

/**
 * GraphViewer development demo
 */
function GraphViewerDemo() {
  const [eventLog, setEventLog] = useState([])
  const [elements, setElements] = useState([])

  // Initialize mapper and demo data
  React.useEffect(() => {
    const mapper = new GraphViewerMapper()
    const { nodes, edges } = createDemoData()
    const mappedElements = mapper.mapToElements(nodes, edges)
    setElements(mappedElements)
  }, [])

  // Handle viewer events
  const handleViewerEvent = useCallback((eventType, payload) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = { timestamp, eventType, payload }
    
    setEventLog(prev => [...prev.slice(-4), logEntry]) // Keep last 5 events
    console.log('Viewer Event:', logEntry)
  }, [])

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          GraphViewer Demo - Step 2 V1 Styling
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="✅ Clean Architecture" color="success" size="small" />
          <Chip label="✅ Interface Definitions" color="success" size="small" />
          <Chip label="✅ Data Mapper" color="success" size="small" />
          <Chip label="✅ V1 Styling System" color="success" size="small" />
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, p: 2, overflow: 'hidden' }}>
        {/* GraphViewer */}
        <Box sx={{ flexGrow: 1 }}>
          <GraphViewer
            elements={elements}
            onEvent={handleViewerEvent}
          />
        </Box>

        {/* Event Log */}
        <Box sx={{ width: 300, minWidth: 300 }}>
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Event Monitor
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Elements: {elements.length}
            </Typography>
            
            {eventLog.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Events will appear here...
              </Typography>
            ) : (
              eventLog.map((entry, index) => (
                <Box key={index} sx={{ mb: 1, p: 1, backgroundColor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    {entry.timestamp}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {entry.eventType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {JSON.stringify(entry.payload, null, 1).substring(0, 100)}...
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default GraphViewerDemo
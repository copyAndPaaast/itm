/**
 * GraphViewerDemo - Development State Demo
 * 
 * Demo with exactly four nodes reflecting current development state
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Box, Typography, Paper, Chip, Switch, FormControlLabel, Divider, Stack } from '@mui/material'

import GraphViewer from './GraphViewer.jsx'
import { GraphViewerMapper } from './GraphViewerMapper.js'
import { ViewerEvents } from './GraphViewerInterface.js'

/**
 * Comprehensive demo data - Multi-system asset testing scenarios
 */
const createDemoData = () => {
  // Enhanced test data with 18 different membership scenarios
  const nodes = [
    // ViewerArchitecture System Nodes
    {
      nodeId: 1001,
      title: 'GraphViewer Interface',
      assetClass: 'Application',
      systems: ['ViewerArchitecture'],
      groups: ['Core Components'],
      properties: { 
        status: 'completed',
        description: 'Interface definitions and contracts'
      }
    },
    {
      nodeId: 1004,
      title: 'React Component',
      assetClass: 'Application',
      systems: ['ViewerArchitecture'],
      groups: ['Core Components'],
      properties: {
        status: 'in_progress',
        description: 'Pure view component with Cytoscape'
      }
    },
    {
      nodeId: 1005,
      title: 'Styling Engine',
      assetClass: 'WebServer',
      systems: ['ViewerArchitecture'],
      groups: ['UI Layer'],
      properties: {
        status: 'completed',
        description: 'Material UI themed graph styles'
      }
    },

    // ViewerArchitecture1 System Nodes  
    {
      nodeId: 1003,
      title: 'Service Layer',
      assetClass: 'DatabaseServer',
      systems: ['ViewerArchitecture1'], 
      groups: ['Backend Services'],
      properties: {
        status: 'in_progress',
        description: 'Interactive features and event handling'
      }
    },
    {
      nodeId: 1006,
      title: 'Event Processor',
      assetClass: 'Application',
      systems: ['ViewerArchitecture1'],
      groups: ['Backend Services'],
      properties: {
        status: 'completed',
        description: 'Mouse and keyboard event handling'
      }
    },

    // DataFlow System Nodes
    {
      nodeId: 1007,
      title: 'Neo4j Connector',
      assetClass: 'DatabaseServer',
      systems: ['DataFlow'],
      groups: ['Data Access'],
      properties: {
        status: 'completed',
        description: 'Graph database connectivity'
      }
    },
    {
      nodeId: 1008,
      title: 'Query Builder',
      assetClass: 'Application',
      systems: ['DataFlow'],
      groups: ['Data Access'],
      properties: {
        status: 'in_progress',
        description: 'Cypher query construction'
      }
    },

    // Multi-System Assets (Cross-System Shared Components)
    {
      nodeId: 1002, 
      title: 'Data Mapper',
      assetClass: 'WebServer',
      systems: ['ViewerArchitecture', 'ViewerArchitecture1'],
      groups: ['Core Components'],
      properties: {
        status: 'completed', 
        description: 'Business data to Cytoscape transformation'
      }
    },
    {
      nodeId: 1009,
      title: 'State Manager',
      assetClass: 'Application',
      systems: ['ViewerArchitecture', 'DataFlow'],
      groups: ['Core Components', 'Data Access'],
      properties: {
        status: 'in_progress',
        description: 'Redux store for graph state'
      }
    },
    {
      nodeId: 1010,
      title: 'Authentication Hub',
      assetClass: 'WebServer',
      systems: ['ViewerArchitecture1', 'DataFlow'],
      groups: ['Backend Services'],
      properties: {
        status: 'completed',
        description: 'User permissions and access control'
      }
    },

    // Triple-System Asset (Ultimate Multi-System Test)
    {
      nodeId: 1011,
      title: 'Configuration Engine',
      assetClass: 'Application',
      systems: ['ViewerArchitecture', 'ViewerArchitecture1', 'DataFlow'],
      groups: ['Core Components', 'Backend Services', 'Data Access'],
      properties: {
        status: 'completed',
        description: 'Global system configuration management'
      }
    }
  ]

  const edges = [
    // Intra-system relationships (ViewerArchitecture)
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
      id: 'edge_5',
      source: 1005,
      target: 1004,
      relationshipType: 'styles'
    },

    // Intra-system relationships (ViewerArchitecture1)
    {
      id: 'edge_3',
      source: 1003,
      target: 1004,
      relationshipType: 'handles_events_for' 
    },
    {
      id: 'edge_6',
      source: 1006,
      target: 1003,
      relationshipType: 'processes_events_for'
    },

    // Intra-system relationships (DataFlow)
    {
      id: 'edge_7',
      source: 1007,
      target: 1008,
      relationshipType: 'provides_data_to'
    },

    // Cross-system relationships (Multi-system routing tests)
    {
      id: 'edge_8',
      source: 1009,
      target: 1002,
      relationshipType: 'manages_state_for'
    },
    {
      id: 'edge_9',
      source: 1010,
      target: 1003,
      relationshipType: 'authenticates'
    },
    {
      id: 'edge_10',
      source: 1007,
      target: 1009,
      relationshipType: 'feeds_data_to'
    },

    // Configuration Engine connections (Triple-system test)
    {
      id: 'edge_11',
      source: 1011,
      target: 1001,
      relationshipType: 'configures'
    },
    {
      id: 'edge_12',
      source: 1011,
      target: 1003,
      relationshipType: 'configures'
    },
    {
      id: 'edge_13',
      source: 1011,
      target: 1007,
      relationshipType: 'configures'
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
  const [groupVisibility, setGroupVisibility] = useState({})
  const [cyRef, setCyRef] = useState(null)
  const mapperRef = React.useRef(null)

  // Get all unique groups from demo data
  const availableGroups = useMemo(() => {
    const { nodes } = createDemoData()
    const groups = new Set()
    nodes.forEach(node => {
      if (node.groups) {
        node.groups.forEach(group => groups.add(group))
      }
    })
    return Array.from(groups).sort()
  }, [])

  // Initialize all groups as visible
  React.useEffect(() => {
    const initialVisibility = {}
    availableGroups.forEach(group => {
      initialVisibility[group] = true
    })
    setGroupVisibility(initialVisibility)
  }, [availableGroups])

  // Initialize mapper and demo data
  React.useEffect(() => {
    const mapper = new GraphViewerMapper()
    mapperRef.current = mapper
    const { nodes, edges } = createDemoData()
    const mappedElements = mapper.mapToElements(nodes, edges)
    setElements(mappedElements)
  }, [])

  // Update hulls when group visibility changes
  React.useEffect(() => {
    if (cyRef && mapperRef.current) {
      mapperRef.current.updateHulls(cyRef, groupVisibility)
    }
  }, [groupVisibility, cyRef])

  // Handle viewer events
  const handleViewerEvent = useCallback((eventType, payload) => {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = { timestamp, eventType, payload }
    
    setEventLog(prev => [...prev.slice(-4), logEntry]) // Keep last 5 events
    console.log('Viewer Event:', logEntry)
  }, [])

  // Handle individual group toggle
  const handleGroupToggle = useCallback((groupName, visible) => {
    setGroupVisibility(prev => ({
      ...prev,
      [groupName]: visible
    }))
  }, [])

  // Handle global toggle
  const handleGlobalToggle = useCallback((visible) => {
    const newVisibility = {}
    availableGroups.forEach(group => {
      newVisibility[group] = visible
    })
    setGroupVisibility(newVisibility)
  }, [availableGroups])

  // Check if all groups are visible and if any groups are visible
  const { allGroupsVisible, anyGroupsVisible } = useMemo(() => {
    const allVisible = availableGroups.every(group => groupVisibility[group] !== false)
    const anyVisible = availableGroups.some(group => groupVisibility[group] !== false)
    return { allGroupsVisible: allVisible, anyGroupsVisible: anyVisible }
  }, [availableGroups, groupVisibility])

  // Handle Cytoscape ref
  const handleCytoscapeReady = useCallback((cy) => {
    setCyRef(cy)
    if (mapperRef.current) {
      mapperRef.current.updateHulls(cy, groupVisibility)
    }
  }, [groupVisibility])

  // Handle nodes moving - refresh hulls
  const handleNodesMove = useCallback(() => {
    if (cyRef && mapperRef.current) {
      mapperRef.current.updateHulls(cyRef, groupVisibility)
    }
  }, [cyRef, groupVisibility])

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" gutterBottom>
          GraphViewer Demo - Multi-System Asset Architecture
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Comprehensive test with 11 nodes across 3 systems • 4 multi-system assets • 5 group hulls
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="✅ Clean Architecture" color="success" size="small" />
          <Chip label="✅ Multi-System Assets" color="success" size="small" />
          <Chip label="✅ Display Instances" color="success" size="small" />
          <Chip label="✅ Edge Routing" color="success" size="small" />
          <Chip label="✅ Hull Grouping" color="success" size="small" />
          <Chip label="✅ Drag-to-Connect" color="success" size="small" />
          <Chip label="✅ System Compounds" color="success" size="small" />
          <Chip label="✅ Dashed Styling" color="success" size="small" />
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, p: 2, overflow: 'hidden' }}>
        {/* GraphViewer */}
        <Box sx={{ flexGrow: 1 }}>
          <GraphViewer
            elements={elements}
            onEvent={handleViewerEvent}
            onCytoscapeReady={handleCytoscapeReady}
            onNodesMove={handleNodesMove}
            userPermissions="editor"
          />
        </Box>

        {/* Control Panel */}
        <Box sx={{ width: 300, minWidth: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Group Controls */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Group Controls
            </Typography>
            
            {/* Global Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={allGroupsVisible}
                  onChange={(e) => handleGlobalToggle(e.target.checked)}
                  color="primary"
                />
              }
              label={`Show All Groups (${Object.values(groupVisibility).filter(Boolean).length}/${availableGroups.length})`}
              sx={{ 
                mb: 1,
                '& .MuiSwitch-switchBase': !allGroupsVisible && anyGroupsVisible ? {
                  color: 'orange'
                } : {}
              }}
            />
            
            <Divider sx={{ my: 1 }} />
            
            {/* Individual Group Toggles */}
            <Stack spacing={1}>
              {availableGroups.map(groupName => (
                <FormControlLabel
                  key={groupName}
                  control={
                    <Switch
                      checked={groupVisibility[groupName] !== false}
                      onChange={(e) => handleGroupToggle(groupName, e.target.checked)}
                      color="secondary"
                      size="small"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{groupName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Group hull
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Stack>
          </Paper>

          {/* Multi-System Features Guide */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Multi-System Features
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Multi-System Assets:</strong> Data Mapper, State Manager, Auth Hub, Config Engine
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Display Instances:</strong> Each asset appears in its respective system compounds
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Dashed Borders:</strong> Multi-system instances have distinctive dashed styling
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Connection Edges:</strong> Light red dashed edges link related instances
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Edge Routing:</strong> Smart routing based on system context
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Drag-to-Connect:</strong> Click node border, drag to create edges
              </Typography>
            </Box>
          </Paper>

          {/* Event Monitor */}
          <Paper sx={{ p: 2, height: '100%', overflow: 'auto' }}>
            <Typography variant="h6" gutterBottom>
              Event Monitor
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Elements: {elements.length}
            </Typography>
            
            {eventLog.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Interact with the graph to see events...
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
                    {JSON.stringify(entry.payload, null, 1).substring(0, 80)}...
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
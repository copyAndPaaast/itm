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
 * Enhanced demo data - Two systems with six nodes, groups, and multi-system asset
 */
const createDemoData = () => {
  const nodes = [
    // Production System Nodes
    {
      nodeId: 1001,
      title: 'Web Server',
      assetClass: 'Server',
      systems: ['Production'],
      groups: ['WebCluster'],
      properties: { 
        hostname: 'web01.company.com',
        status: 'active',
        cpu_cores: 4,
        memory_gb: 16
      }
    },
    {
      nodeId: 1002,
      title: 'Database Server',
      assetClass: 'Server', 
      systems: ['Production'],
      groups: ['WebCluster'],
      properties: {
        hostname: 'db01.company.com',
        status: 'active',
        db_type: 'PostgreSQL',
        storage_gb: 500
      }
    },
    {
      nodeId: 1003,
      title: 'Load Balancer',
      assetClass: 'NetworkDevice',
      systems: ['Production'],
      groups: [],
      properties: {
        device_type: 'HAProxy',
        status: 'active',
        capacity: '10Gbps'
      }
    },
    // Development System Nodes
    {
      nodeId: 2001,
      title: 'Dev Server',
      assetClass: 'Server',
      systems: ['Development'],
      groups: [],
      properties: {
        hostname: 'dev01.company.com',
        status: 'active',
        purpose: 'development'
      }
    },
    {
      nodeId: 2002,
      title: 'Test Database',
      assetClass: 'Database',
      systems: ['Development'],
      groups: [],
      properties: {
        db_name: 'test_db',
        status: 'active',
        environment: 'testing'
      }
    },
    // Multi-System Node (appears in both systems)
    {
      nodeId: 3001,
      title: 'Monitoring Service',
      assetClass: 'Application',
      systems: ['Production', 'Development'],
      groups: [],
      properties: {
        service_type: 'monitoring',
        status: 'active',
        monitors: 'both environments',
        version: '2.1.0'
      }
    }
  ]

  const edges = [
    {
      edgeId: 'edge_1001_1002',
      source: 1001,
      target: 1002,
      relationshipType: 'connects_to',
      properties: {
        connection_type: 'database',
        port: 5432
      }
    },
    {
      edgeId: 'edge_1003_1001', 
      source: 1003,
      target: 1001,
      relationshipType: 'routes_to',
      properties: {
        protocol: 'HTTP',
        weight: 100
      }
    },
    {
      edgeId: 'edge_2001_2002',
      source: 2001,
      target: 2002,
      relationshipType: 'uses',
      properties: {
        access_type: 'read_write',
        purpose: 'development'
      }
    },
    {
      edgeId: 'edge_3001_1001',
      source: 3001,
      target: 1001,
      relationshipType: 'monitors',
      properties: {
        check_type: 'health',
        interval: '30s'
      }
    },
    {
      edgeId: 'edge_3001_2001',
      source: 3001,
      target: 2001,
      relationshipType: 'monitors',
      properties: {
        check_type: 'health', 
        interval: '60s'
      }
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
  const [systemCollapsed, setSystemCollapsed] = useState({})
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

  // Get all unique systems from demo data
  const availableSystems = useMemo(() => {
    const { nodes } = createDemoData()
    const systems = new Set()
    nodes.forEach(node => {
      if (node.systems) {
        node.systems.forEach(system => systems.add(system))
      }
    })
    return Array.from(systems).sort()
  }, [])

  // Initialize all groups as visible and systems as expanded
  React.useEffect(() => {
    const initialVisibility = {}
    availableGroups.forEach(group => {
      initialVisibility[group] = true
    })
    setGroupVisibility(initialVisibility)

    const initialSystemState = {}
    availableSystems.forEach(system => {
      initialSystemState[system] = false // false = expanded, true = collapsed
    })
    setSystemCollapsed(initialSystemState)
  }, [availableGroups, availableSystems])

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

  // Handle system collapse/expand
  const handleSystemToggle = useCallback((systemName, collapsed) => {
    if (!cyRef || !cyRef._expandCollapseAPI) return

    // Find the system compound node
    const systemCompound = cyRef.nodes(`[compoundType = "system"][systemName = "${systemName}"]`)
    
    if (systemCompound.length > 0) {
      const systemNode = systemCompound[0]
      
      if (collapsed) {
        cyRef._expandCollapseAPI.collapse(systemNode)
        console.log('🔽 Collapsing system via UI control:', systemName)
      } else {
        cyRef._expandCollapseAPI.expand(systemNode)
        console.log('🔼 Expanding system via UI control:', systemName)
      }
      
      setSystemCollapsed(prev => ({
        ...prev,
        [systemName]: collapsed
      }))
      
      // Force hull updates after collapse/expand
      setTimeout(() => {
        if (mapperRef.current) {
          mapperRef.current.updateHulls(cyRef, groupVisibility)
          console.log('🔄 Forced hull update after system toggle')
        }
      }, 150) // Slightly longer delay to ensure collapse/expand animation completes
    }
  }, [cyRef, groupVisibility])

  // Handle global system toggle
  const handleGlobalSystemToggle = useCallback((collapsed) => {
    if (!cyRef || !cyRef._expandCollapseAPI) return

    availableSystems.forEach(systemName => {
      handleSystemToggle(systemName, collapsed)
    })
  }, [cyRef, availableSystems, handleSystemToggle])

  // Check if all groups are visible and if any groups are visible
  const { allGroupsVisible, anyGroupsVisible } = useMemo(() => {
    const allVisible = availableGroups.every(group => groupVisibility[group] !== false)
    const anyVisible = availableGroups.some(group => groupVisibility[group] !== false)
    return { allGroupsVisible: allVisible, anyGroupsVisible: anyVisible }
  }, [availableGroups, groupVisibility])

  // Check system collapse states
  const { allSystemsCollapsed, anySystemsCollapsed } = useMemo(() => {
    const allCollapsed = availableSystems.every(system => systemCollapsed[system] === true)
    const anyCollapsed = availableSystems.some(system => systemCollapsed[system] === true)
    return { allSystemsCollapsed: allCollapsed, anySystemsCollapsed: anyCollapsed }
  }, [availableSystems, systemCollapsed])

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
          GraphViewer Demo - Enhanced Multi-System Architecture
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          2 systems • 6 nodes • WebCluster group • Multi-system monitoring • Search & expand-collapse functionality
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label="✅ Search Toolbar" color="success" size="small" />
          <Chip label="✅ Layout Options" color="success" size="small" />
          <Chip label="✅ Multi-System Assets" color="success" size="small" />
          <Chip label="✅ Group Management" color="success" size="small" />
          <Chip label="✅ System Collapse" color="success" size="small" />
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
            availableGroups={availableGroups}
            availableSystems={availableSystems}
            groupVisibility={groupVisibility}
            systemCollapsed={systemCollapsed}
            onGroupToggle={handleGroupToggle}
            onSystemToggle={handleSystemToggle}
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

          {/* System Collapse Controls */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              System Collapse Controls
            </Typography>
            
            {/* Global System Toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={!allSystemsCollapsed}
                  onChange={(e) => handleGlobalSystemToggle(!e.target.checked)}
                  color="primary"
                />
              }
              label={`Expand All Systems (${availableSystems.filter(s => !systemCollapsed[s]).length}/${availableSystems.length})`}
              sx={{ 
                mb: 1,
                '& .MuiSwitch-switchBase': allSystemsCollapsed ? {
                  color: 'orange'
                } : anySystemsCollapsed ? {
                  color: 'orange'
                } : {}
              }}
            />
            
            <Divider sx={{ my: 1 }} />
            
            {/* Individual System Toggles */}
            <Stack spacing={1}>
              {availableSystems.map(systemName => (
                <FormControlLabel
                  key={systemName}
                  control={
                    <Switch
                      checked={!systemCollapsed[systemName]}
                      onChange={(e) => handleSystemToggle(systemName, !e.target.checked)}
                      color="info"
                      size="small"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{systemName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {systemCollapsed[systemName] ? 'Collapsed' : 'Expanded'} • Click cue to toggle
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Stack>
          </Paper>

          {/* Simple Test Instructions */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Simple Test Instructions
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Use UI Controls:</strong> Toggle system collapse/expand using the controls below
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Check Console:</strong> Should show expand-collapse API messages
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Expected Result:</strong> System should collapse/expand programmatically via controls
              </Typography>
              <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                <strong>Visual Cues:</strong> Still investigating why visual cues don't appear
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
                    {JSON.stringify(entry.payload, (key, value) => {
                      // Filter out circular references and complex objects
                      if (key === 'nodeData' || key === 'targetData' || key === 'sourceData') {
                        return '[NodeData]'
                      }
                      if (typeof value === 'object' && value !== null && value.constructor && value.constructor.name === 'Element2') {
                        return '[CytoscapeElement]'
                      }
                      return value
                    }, 1).substring(0, 80)}...
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
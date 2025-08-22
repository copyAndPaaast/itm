/**
 * GraphViewerDemo - Demonstrates the Component + Hook + Service pattern
 * Shows how GraphViewer, useGraphViewer, and GraphViewerService work together
 */

import React, { useState, useCallback } from 'react'
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Alert
} from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'

import GraphViewer from './GraphViewer.jsx'
import { useGraphViewer } from './useGraphViewer.js'
import { PermissionService } from '../../permissions/PermissionService.js'

/**
 * Mock ITM data for demonstration
 */
const MOCK_NODES = [
  {
    nodeId: 'server1',
    title: 'Web Server 01',
    assetClass: 'WebServer',
    systems: ['Production', 'WebTier'],
    groups: ['WebCluster'],
    properties: {
      hostname: 'web01.company.com',
      ip: '10.0.1.10',
      os: 'Ubuntu 20.04'
    }
  },
  {
    nodeId: 'server2', 
    title: 'Database Server 01',
    assetClass: 'DatabaseServer',
    systems: ['Production', 'DataTier'],
    groups: ['DatabaseCluster'],
    properties: {
      hostname: 'db01.company.com',
      ip: '10.0.2.10',
      dbType: 'PostgreSQL'
    }
  },
  {
    nodeId: 'app1',
    title: 'User Portal',
    assetClass: 'WebApplication',
    systems: ['Production'],
    groups: ['DatabaseCluster'],
    properties: {
      framework: 'React',
      version: '18.2.0'
    }
  },
  {
    nodeId: 'lb1',
    title: 'Load Balancer',
    assetClass: 'NetworkDevice',
    systems: ['Production', 'Network'],
    groups: ['Infrastructure'],
    properties: {
      type: 'HAProxy',
      capacity: '10Gbps'
    }
  }
]

const MOCK_EDGES = [
  {
    relationshipId: 'rel1',
    fromId: 'app1',
    toId: 'server1',
    relationshipType: 'depends_on',
    properties: {
      dependency_type: 'runtime'
    }
  },
  {
    relationshipId: 'rel2',
    fromId: 'server1',
    toId: 'server2',
    relationshipType: 'connects_to',
    properties: {
      port: '5432',
      protocol: 'TCP'
    }
  },
  {
    relationshipId: 'rel3',
    fromId: 'lb1',
    toId: 'server1',
    relationshipType: 'flows_to',
    properties: {
      weight: '100'
    }
  }
]

/**
 * GraphViewerDemo Component
 */
export const GraphViewerDemo = () => {
  // Demo state  
  const [selectedPermission, setSelectedPermission] = useState('editor')
  const [graphConfig, setGraphConfig] = useState({
    layout: 'dagre',
    enableZoom: true,
    enablePan: true,
    enableSelection: true,
    selectionMode: 'multiple',
    showLabels: true
  })
  const [eventLog, setEventLog] = useState([])
  const [selectedElement, setSelectedElement] = useState(null)

  // Hook integration
  const {
    nodes,
    edges,
    config,
    selection,
    loading,
    error,
    handleEvent,
    selectNode,
    selectEdge,
    clearSelection,
    fitGraph,
    setLayout,
    zoomTo,
    addNode,
    updateNode,
    deleteNode,
    initializeCytoscape,
    performanceMetrics,
    exportGraph,
    lastEvent
  } = useGraphViewer({
    graphId: 'demo',
    initialNodes: MOCK_NODES,
    initialEdges: MOCK_EDGES,
    config: graphConfig,
    userPermissions: selectedPermission,
    onSelectionChange: (newSelection) => {
      setSelectedElement(newSelection.lastSelected)
      logEvent('Selection Changed', newSelection)
    },
    onDataChange: (change) => {
      logEvent('Data Changed', change)
    },
    onError: (error) => {
      logEvent('Error', { message: error.message })
    }
  })

  /**
   * Event logging for demonstration
   */
  const logEvent = useCallback((eventType, eventData) => {
    const timestamp = new Date().toLocaleTimeString()
    setEventLog(prev => [...prev.slice(-9), { timestamp, eventType, eventData }])
  }, [])

  /**
   * Handle GraphViewer events
   */
  const handleGraphEvent = useCallback((eventType, eventData) => {
    logEvent(`Graph Event: ${eventType}`, eventData)
    
    // Forward to hook
    handleEvent(eventType, eventData)
    
    // Handle specific events for demo
    switch (eventType) {
      case 'nodeClick':
        logEvent('Node Body Clicked', { 
          nodeId: eventData.nodeId, 
          ctrl: eventData.ctrlKey,
          shift: eventData.shiftKey 
        })
        break
        
      case 'nodeBorderClick':
        logEvent('Node Border Clicked', { 
          nodeId: eventData.nodeId, 
          region: eventData.borderRegion,
          message: `Good for creating connections from ${eventData.borderRegion} side`
        })
        break
        
      case 'edgeClick':
        logEvent('Edge Clicked', { 
          edgeId: eventData.edgeId,
          from: eventData.sourceNodeId,
          to: eventData.targetNodeId,
          ctrl: eventData.ctrlKey
        })
        break
        
      case 'edgeDoubleClick':
        logEvent('Edge Double-Clicked', { 
          edgeId: eventData.edgeId,
          message: 'Perfect for editing edge properties'
        })
        break
        
      case 'export':
        try {
          const exportedData = exportGraph(eventData.format || 'png')
          logEvent('Export Success', { format: eventData.format, size: exportedData.length })
        } catch (error) {
          logEvent('Export Failed', { error: error.message })
        }
        break
        
      case 'fullscreen':
        logEvent('Fullscreen Requested', {})
        break
        
      case 'keyboard':
        if (eventData.key === 'Delete' && selectedElement) {
          handleDeleteSelected()
        }
        break
    }
  }, [handleEvent, exportGraph, selectedElement])

  /**
   * Demo control handlers
   */
  const handleAddRandomNode = async () => {
    const newNode = {
      title: `New Node ${Date.now()}`,
      assetClass: 'GenericAsset',
      systems: ['Demo'],
      properties: {
        created: new Date().toISOString()
      }
    }
    
    try {
      await addNode(newNode)
      logEvent('Node Added', newNode)
    } catch (error) {
      logEvent('Add Node Failed', { error: error.message })
    }
  }

  const handleDeleteSelected = async () => {
    if (!selectedElement) return
    
    try {
      await deleteNode(selectedElement)
      logEvent('Node Deleted', { nodeId: selectedElement })
      setSelectedElement(null)
    } catch (error) {
      logEvent('Delete Failed', { error: error.message })
    }
  }

  const handleUpdateSelected = async () => {
    if (!selectedElement) return
    
    const updates = {
      title: `Updated ${Date.now()}`,
      properties: {
        lastModified: new Date().toISOString()
      }
    }
    
    try {
      await updateNode(selectedElement, updates)
      logEvent('Node Updated', { nodeId: selectedElement, updates })
    } catch (error) {
      logEvent('Update Failed', { error: error.message })
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        GraphViewer Demo - Component + Hook + Service Pattern
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        💡 <strong>Tips:</strong> Ctrl+Click to create nodes • Drag from node border to connect nodes • Click center to move nodes • Hover for border highlights
      </Typography>
      
      <Box sx={{ display: 'flex', flex: 1, gap: 2 }}>
        {/* Main Graph Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <GraphViewer
            nodes={nodes}
            edges={edges}
            config={config}
            selection={selection}
            loading={loading}
            error={error}
            onEvent={handleGraphEvent}
            onInitialize={initializeCytoscape}
            height="100%"
            showMetrics={true}
            performanceMetrics={performanceMetrics}
            lastEvent={lastEvent}
          />
        </Box>
        
        {/* Control Panel */}
        <Paper sx={{ width: 350, p: 2, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Controls & Information
          </Typography>
          
          {/* Permission Control */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>User Permission</InputLabel>
            <Select
              value={selectedPermission}
              onChange={(e) => setSelectedPermission(e.target.value)}
              label="User Permission"
            >
              {PermissionService.getPermissionLevels().map(level => (
                <MenuItem key={level} value={level}>
                  {level.charAt(0).toUpperCase() + level.slice(1)} ({PermissionService.getPermissionDescription(level)})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* Layout Control */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Layout</InputLabel>
            <Select
              value={config.layout}
              onChange={(e) => setLayout(e.target.value)}
              label="Layout"
            >
              <MenuItem value="dagre">Hierarchical (Dagre)</MenuItem>
              <MenuItem value="cola">Force Directed (Cola)</MenuItem>
              <MenuItem value="cose-bilkent">High Quality (Cose-Bilkent)</MenuItem>
              <MenuItem value="circle">Circle</MenuItem>
            </Select>
          </FormControl>
          
          {/* Action Buttons */}
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleAddRandomNode}
              disabled={loading || !PermissionService.canModifyData(selectedPermission)}
            >
              Add Random Node
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={handleUpdateSelected}
              disabled={loading || !selectedElement || selectedPermission === 'viewer'}
            >
              Update Selected
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={handleDeleteSelected}
              disabled={loading || !selectedElement || selectedPermission === 'viewer'}
            >
              Delete Selected
            </Button>
            
            <Button
              variant="outlined"
              onClick={fitGraph}
              disabled={loading}
            >
              Fit Graph
            </Button>
            
            <Button
              variant="outlined"
              onClick={clearSelection}
              disabled={loading}
            >
              Clear Selection
            </Button>
          </Stack>
          
          {/* Current Selection */}
          <Typography variant="subtitle2" gutterBottom>
            Current Selection:
          </Typography>
          <Box sx={{ mb: 2 }}>
            {selectedElement ? (
              <Chip label={selectedElement} color="primary" />
            ) : (
              <Typography variant="body2" color="text.secondary">
                None
              </Typography>
            )}
          </Box>
          
          {/* Performance Metrics */}
          <Typography variant="subtitle2" gutterBottom>
            Performance Metrics:
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2">
              Nodes: {performanceMetrics.nodeCount || 0}
            </Typography>
            <Typography variant="body2">
              Edges: {performanceMetrics.edgeCount || 0}
            </Typography>
            <Typography variant="body2">
              Density: {performanceMetrics.density || 0}
            </Typography>
            <Typography variant="body2">
              Render Time: {Math.round(performanceMetrics.renderTime || 0)}ms
            </Typography>
            {performanceMetrics.isConnected !== undefined && (
              <Typography variant="body2">
                Connected: {performanceMetrics.isConnected ? 'Yes' : 'No'}
              </Typography>
            )}
          </Box>
          
          {/* Event Log */}
          <Typography variant="subtitle2" gutterBottom>
            Event Log:
          </Typography>
          <Box 
            sx={{ 
              height: 200, 
              overflow: 'auto', 
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              p: 1,
              fontSize: '0.75rem'
            }}
          >
            {eventLog.map((event, index) => (
              <Box key={index} sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {event.timestamp}
                </Typography>
                <Typography variant="body2">
                  <strong>{event.eventType}</strong>
                </Typography>
                <Typography variant="caption" sx={{ wordBreak: 'break-all' }}>
                  {JSON.stringify(event.eventData, null, 2).substring(0, 100)}
                  {JSON.stringify(event.eventData).length > 100 && '...'}
                </Typography>
              </Box>
            ))}
            {eventLog.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No events yet. Interact with the graph to see events.
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  )
}

export default GraphViewerDemo
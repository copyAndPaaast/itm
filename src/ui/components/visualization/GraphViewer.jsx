/**
 * GraphViewer - Pure React component for displaying ITM graph visualization
 * This component only handles presentation and user interactions, no business logic.
 */

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react'
import { 
  Box, 
  Paper, 
  Toolbar, 
  IconButton, 
  Typography, 
  Alert, 
  CircularProgress,
  Chip,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material'
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  AccountTree,
  Refresh,
  GetApp,
  LinearScale,
  Hub,
  ScatterPlot,
  RadioButtonUnchecked
} from '@mui/icons-material'

/**
 * GraphViewer Component - Pure presentation component
 */
export const GraphViewer = forwardRef((props, ref) => {
  const {
    // Data props
    nodes = [],
    edges = [],
    config = {},
    selection = { selectedNodes: [], selectedEdges: [], lastSelected: null },
    loading = false,
    error = null,
    
    // Event handlers
    onEvent = () => {},
    
    // Display props
    height = '100%',
    width = '100%',
    className = '',
    style = {},
    
    // UI customization
    showToolbar = true,
    showStatusBar = true,
    showMetrics = false,
    toolbar = null,
    statusBar = null,
    
    // Initialization callback
    onInitialize = null,
    
    // Performance metrics (from hook)
    performanceMetrics = {},
    
    // Latest event for debugging
    lastEvent = null
  } = props

  // Refs
  const containerRef = useRef(null)
  const graphContainerRef = useRef(null)
  
  // Local state for layout menu
  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState(null)

  /**
   * Initialize graph when container is ready
   */
  useEffect(() => {
    if (graphContainerRef.current && onInitialize) {
      onInitialize(graphContainerRef.current)
    }
  }, [onInitialize])

  /**
   * Expose control methods via ref
   */
  useImperativeHandle(ref, () => ({
    getContainer: () => graphContainerRef.current,
    focus: () => {
      if (graphContainerRef.current) {
        graphContainerRef.current.focus()
      }
    },
    scrollIntoView: () => {
      if (containerRef.current) {
        containerRef.current.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }), [])

  /**
   * Handle toolbar actions
   */
  const handleZoomIn = () => {
    onEvent('zoom', { action: 'zoomIn', factor: 1.2 })
  }

  const handleZoomOut = () => {
    onEvent('zoom', { action: 'zoomOut', factor: 0.8 })
  }

  const handleFit = () => {
    onEvent('layout', { action: 'fit' })
  }

  const handleRefresh = () => {
    onEvent('refresh', {})
  }

  const handleLayoutMenuOpen = (event) => {
    setLayoutMenuAnchor(event.currentTarget)
  }

  const handleLayoutMenuClose = () => {
    setLayoutMenuAnchor(null)
  }

  const handleLayoutChange = (layoutType) => {
    onEvent('layout', { action: 'change', layoutType })
    handleLayoutMenuClose()
  }

  const handleExport = () => {
    onEvent('export', { format: 'png' })
  }

  // Layout options with icons and descriptions
  const layoutOptions = [
    { type: 'dagre', label: 'Hierarchical', icon: <AccountTree />, description: 'Top-down hierarchy' },
    { type: 'cola', label: 'Force Directed', icon: <Hub />, description: 'Physics-based layout' },
    { type: 'cose-bilkent', label: 'High Quality', icon: <ScatterPlot />, description: 'Optimized positioning' },
    { type: 'circle', label: 'Circle', icon: <RadioButtonUnchecked />, description: 'Circular arrangement' }
  ]

  /**
   * Get selection summary for display
   */
  const getSelectionSummary = () => {
    const nodeCount = selection.selectedNodes.length
    const edgeCount = selection.selectedEdges.length
    
    if (nodeCount === 0 && edgeCount === 0) {
      return 'No selection'
    }
    
    const parts = []
    if (nodeCount > 0) parts.push(`${nodeCount} node${nodeCount > 1 ? 's' : ''}`)
    if (edgeCount > 0) parts.push(`${edgeCount} edge${edgeCount > 1 ? 's' : ''}`)
    
    return parts.join(', ') + ' selected'
  }

  /**
   * Get performance status color
   */
  const getPerformanceColor = () => {
    const nodeCount = performanceMetrics.nodeCount || 0
    if (nodeCount > 1000) return 'error'
    if (nodeCount > 500) return 'warning'
    return 'success'
  }

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        height,
        width,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        backgroundColor: '#fafafa',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        ...style
      }}
    >
      {/* Toolbar */}
      {showToolbar && (
        <Paper elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
          <Toolbar variant="dense" sx={{ minHeight: 48 }}>
            {toolbar || (
              <>
                <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
                  ITM Graph ({nodes.length} nodes, {edges.length} edges)
                </Typography>
                
                {/* Zoom Controls */}
                <IconButton 
                  size="small" 
                  onClick={handleZoomIn}
                  title="Zoom In"
                  disabled={loading}
                >
                  <ZoomIn />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  disabled={loading}
                >
                  <ZoomOut />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  onClick={handleFit}
                  title="Fit to View"
                  disabled={loading}
                >
                  <CenterFocusStrong />
                </IconButton>
                
                {/* Layout Controls */}
                <IconButton 
                  size="small" 
                  onClick={handleLayoutMenuOpen}
                  title="Change Layout"
                  disabled={loading}
                >
                  <AccountTree />
                </IconButton>
                
                {/* Action Controls */}
                <IconButton 
                  size="small" 
                  onClick={handleRefresh}
                  title="Refresh"
                  disabled={loading}
                >
                  <Refresh />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  onClick={handleExport}
                  title="Export Image"
                  disabled={loading}
                >
                  <GetApp />
                </IconButton>
              </>
            )}
          </Toolbar>
        </Paper>
      )}

      {/* Layout Selection Menu */}
      <Menu
        anchorEl={layoutMenuAnchor}
        open={Boolean(layoutMenuAnchor)}
        onClose={handleLayoutMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1 }
        }}
      >
        {layoutOptions.map((option) => (
          <MenuItem 
            key={option.type}
            onClick={() => handleLayoutChange(option.type)}
            selected={config.layout === option.type}
          >
            <ListItemIcon>
              {option.icon}
            </ListItemIcon>
            <ListItemText 
              primary={option.label}
              secondary={option.description}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Error Display */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ m: 1, borderRadius: 1 }}
          onClose={() => onEvent('error', { action: 'dismiss' })}
        >
          {error}
        </Alert>
      )}

      {/* Main Graph Container */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#fff'
        }}
      >
        {/* Cytoscape Container */}
        <div
          ref={graphContainerRef}
          style={{
            width: '100%',
            height: '100%',
            outline: 'none'
          }}
          tabIndex={0}
          onKeyDown={(e) => {
            // Forward keyboard events
            onEvent('keyboard', { 
              key: e.key, 
              ctrlKey: e.ctrlKey, 
              shiftKey: e.shiftKey,
              altKey: e.altKey 
            })
          }}
        />

        {/* Loading Overlay */}
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              zIndex: 1000
            }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Loading graph...
            </Typography>
          </Box>
        )}

        {/* Performance Metrics Overlay */}
        {showMetrics && performanceMetrics && (
          <Paper
            elevation={2}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              p: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              fontSize: '0.75rem',
              minWidth: 120
            }}
          >
            <div>Nodes: {performanceMetrics.nodeCount || 0}</div>
            <div>Edges: {performanceMetrics.edgeCount || 0}</div>
            <div>Density: {performanceMetrics.density || 0}</div>
            <div>Render: {Math.round(performanceMetrics.renderTime || 0)}ms</div>
            {performanceMetrics.averageDegree && (
              <div>Avg Degree: {performanceMetrics.averageDegree}</div>
            )}
            {lastEvent && (
              <>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', marginTop: 4, paddingTop: 4 }}>
                  <strong>Last Event:</strong>
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
                  {lastEvent.type}
                </div>
                {lastEvent.timestamp && (
                  <div style={{ fontSize: '0.6rem', opacity: 0.7 }}>
                    {new Date(lastEvent.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </>
            )}
          </Paper>
        )}

        {/* Empty State */}
        {!loading && nodes.length === 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'text.secondary'
            }}
          >
            <Typography variant="h6" gutterBottom>
              No Data to Display
            </Typography>
            <Typography variant="body2">
              Add nodes and relationships to visualize your ITM graph
            </Typography>
          </Box>
        )}
      </Box>

      {/* Status Bar */}
      {showStatusBar && (
        <Paper 
          elevation={0} 
          sx={{ 
            borderTop: '1px solid #e0e0e0',
            px: 2,
            py: 1
          }}
        >
          {statusBar || (
            <Stack direction="row" spacing={2} alignItems="center">
              {/* Selection Info */}
              <Typography variant="body2">
                {getSelectionSummary()}
              </Typography>
              
              {/* Performance Indicator */}
              <Chip
                size="small"
                label={`${nodes.length} nodes`}
                color={getPerformanceColor()}
                variant="outlined"
              />
              
              {/* Layout Info */}
              <Typography variant="body2" color="text.secondary">
                Layout: {config.layout || 'dagre'}
              </Typography>
              
              {/* Connection Status */}
              {performanceMetrics.isConnected !== undefined && (
                <Chip
                  size="small"
                  label={performanceMetrics.isConnected ? 'Connected' : 'Disconnected'}
                  color={performanceMetrics.isConnected ? 'success' : 'warning'}
                  variant="outlined"
                />
              )}
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  )
})

GraphViewer.displayName = 'GraphViewer'

export default GraphViewer
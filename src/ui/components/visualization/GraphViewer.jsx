/**
 * GraphViewer - Pure React component for displaying ITM graph visualization
 * This component only handles presentation and user interactions, no business logic.
 */

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState } from 'react'
import { 
  Box, 
  Paper, 
  Alert, 
  CircularProgress,
  Chip,
  Stack
} from '@mui/material'
import GraphViewerToolbar from './GraphViewerToolbar.jsx'
import GraphSearchService from './GraphSearchService.js'

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
  const searchServiceRef = useRef(null)
  
  // Search state
  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState([])

  /**
   * Initialize graph when container is ready
   */
  useEffect(() => {
    if (graphContainerRef.current && onInitialize) {
      // Enhanced initialization that includes search service setup
      const enhancedInitialize = (container) => {
        onInitialize(container)
        // Note: Search service will be initialized when cytoscape instance is passed back
      }
      enhancedInitialize(graphContainerRef.current)
    }
  }, [onInitialize])

  /**
   * Initialize search service when cytoscape instance is available
   * This should be called from the hook that manages the cytoscape instance
   */
  const initializeSearchService = (cytoscapeInstance) => {
    if (cytoscapeInstance && !searchServiceRef.current) {
      searchServiceRef.current = new GraphSearchService(cytoscapeInstance)
      console.log('🔍 Search service initialized')
    }
  }

  /**
   * Expose control methods via ref
   */
  useImperativeHandle(ref, () => ({
    getContainer: () => graphContainerRef.current,
    initializeSearchService: initializeSearchService,
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
  }), [initializeSearchService])


  /**
   * Search functionality
   */
  const handleSearch = (query) => {
    setSearchValue(query)
    
    if (searchServiceRef.current) {
      if (query.trim()) {
        const matches = searchServiceRef.current.searchHighlightAndFocus(query)
        setSearchResults(matches)
        console.log(`🔍 Search results: ${matches.length} nodes found`)
      } else {
        searchServiceRef.current.clearHighlight()
        setSearchResults([])
      }
    }
  }

  const handleSearchEvent = (eventData) => {
    if (!searchServiceRef.current) return

    switch (eventData.action) {
      case 'highlight':
        handleSearch(eventData.query)
        break
      case 'clear':
        searchServiceRef.current.clearHighlight()
        setSearchValue('')
        setSearchResults([])
        break
      case 'selectResult':
        // Focus on specific search result
        if (eventData.resultId) {
          const node = searchServiceRef.current.cy.getElementById(eventData.resultId)
          if (node.length > 0) {
            searchServiceRef.current.cy.center(node)
            node.select()
          }
        }
        break
      default:
        break
    }
  }

  // Enhanced event handler that includes search events
  const handleEnhancedEvent = (type, data) => {
    if (type === 'search') {
      handleSearchEvent(data)
    } else {
      onEvent(type, data)
    }
  }


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
      {/* Enhanced Toolbar with Search */}
      {showToolbar && (
        toolbar || (
          <GraphViewerToolbar
            nodes={nodes}
            edges={edges}
            config={config}
            selection={selection}
            loading={loading}
            onEvent={handleEnhancedEvent}
            onSearch={handleSearch}
            searchValue={searchValue}
            searchResults={searchResults}
            performanceMetrics={performanceMetrics}
            showTitle={true}
            showSearch={true}
            showMetrics={showMetrics}
          />
        )
      )}

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
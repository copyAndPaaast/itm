/**
 * GraphViewerToolbar - Enhanced toolbar component with search functionality
 * Recreates the existing toolbar with added search capabilities
 */

import React, { useState, useRef, useEffect } from 'react'
import {
  Box,
  Paper,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
  Fade,
  Stack,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material'
import {
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  AccountTree,
  Refresh,
  GetApp,
  Search,
  Close,
  Hub,
  ScatterPlot,
  RadioButtonUnchecked
} from '@mui/icons-material'

/**
 * Enhanced GraphViewer Toolbar with Search
 */
export const GraphViewerToolbar = ({
  // Data props
  nodes = [],
  edges = [],
  config = {},
  selection = { selectedNodes: [], selectedEdges: [], lastSelected: null },
  loading = false,
  
  // Event handlers
  onEvent = () => {},
  
  // Search props
  onSearch = () => {},
  searchValue = '',
  searchResults = [],
  
  // Display customization
  showTitle = true,
  showSearch = true,
  showMetrics = true,
  title = null,
  
  // Performance metrics
  performanceMetrics = {}
}) => {
  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [localSearchValue, setLocalSearchValue] = useState(searchValue)
  const searchInputRef = useRef(null)
  
  // Layout menu state
  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState(null)

  // Sync external search value
  useEffect(() => {
    setLocalSearchValue(searchValue)
  }, [searchValue])

  // Focus search input when expanded
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchExpanded])

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

  const handleExport = () => {
    onEvent('export', { format: 'png' })
  }

  /**
   * Search functionality
   */
  const handleSearchToggle = () => {
    if (isSearchExpanded) {
      // Closing search - clear if no value
      if (!localSearchValue.trim()) {
        handleSearchClear()
      }
      setIsSearchExpanded(false)
    } else {
      // Opening search
      setIsSearchExpanded(true)
    }
  }

  const handleSearchChange = (event) => {
    const value = event.target.value
    setLocalSearchValue(value)
    
    // Call search function that will highlight matching nodes
    if (value.trim()) {
      onSearch(value)
      onEvent('search', { action: 'highlight', query: value })
    } else {
      // Clear search highlights when empty
      onEvent('search', { action: 'clear' })
    }
  }

  const handleSearchClear = () => {
    setLocalSearchValue('')
    onSearch('')
    onEvent('search', { action: 'clear' })
    setIsSearchExpanded(false)
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Escape') {
      handleSearchClear()
    } else if (event.key === 'Enter') {
      event.preventDefault()
      // Focus first search result if available
      if (searchResults.length > 0) {
        onEvent('search', { action: 'selectResult', resultId: searchResults[0].id })
      }
    }
  }

  /**
   * Layout menu functionality
   */
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
    const nodeCount = performanceMetrics.nodeCount || nodes.length
    if (nodeCount > 1000) return 'error'
    if (nodeCount > 500) return 'warning'
    return 'success'
  }

  return (
    <Paper elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar variant="dense" sx={{ minHeight: 48, gap: 1 }}>
        {/* Title Section */}
        {showTitle && (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            {title || (
              <Typography variant="subtitle1">
                ITM Graph ({nodes.length} nodes, {edges.length} edges)
              </Typography>
            )}
            
            {/* Metrics Chips */}
            {showMetrics && (
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  label={getSelectionSummary()}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  size="small"
                  label={`Layout: ${config.layout || 'dagre'}`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                {performanceMetrics.isConnected !== undefined && (
                  <Chip
                    size="small"
                    label={performanceMetrics.isConnected ? 'Connected' : 'Disconnected'}
                    color={performanceMetrics.isConnected ? 'success' : 'warning'}
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                )}
              </Stack>
            )}
          </Box>
        )}

        {/* Search Section */}
        {showSearch && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Fade in={isSearchExpanded} timeout={200}>
              <TextField
                ref={searchInputRef}
                size="small"
                placeholder="Search nodes..."
                value={localSearchValue}
                onChange={handleSearchChange}
                onKeyDown={handleSearchKeyDown}
                sx={{
                  width: isSearchExpanded ? 200 : 0,
                  transition: 'width 0.2s ease-in-out',
                  '& .MuiOutlinedInput-root': {
                    height: 32
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ fontSize: 16 }} />
                    </InputAdornment>
                  ),
                  endAdornment: localSearchValue && (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={handleSearchClear}
                        sx={{ padding: 0.5 }}
                      >
                        <Close sx={{ fontSize: 14 }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Fade>
            
            {!isSearchExpanded && (
              <IconButton
                size="small"
                onClick={handleSearchToggle}
                title="Search Nodes"
                disabled={loading}
                sx={{
                  backgroundColor: localSearchValue ? 'primary.light' : 'transparent',
                  color: localSearchValue ? 'primary.contrastText' : 'inherit',
                  '&:hover': {
                    backgroundColor: localSearchValue ? 'primary.main' : 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                <Search />
              </IconButton>
            )}

            {/* Search Results Indicator */}
            {searchResults.length > 0 && (
              <Chip
                size="small"
                label={`${searchResults.length} found`}
                color="primary"
                variant="filled"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
        )}

        {/* Zoom Controls */}
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
        </Box>

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
        <Box sx={{ display: 'flex', gap: 0.5 }}>
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
        </Box>
      </Toolbar>

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
    </Paper>
  )
}

export default GraphViewerToolbar
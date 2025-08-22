/**
 * GraphViewerToolbar - Enhanced toolbar component with search functionality
 * Specifically designed for the viewer GraphViewer component
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
  Close
} from '@mui/icons-material'

/**
 * Enhanced GraphViewer Toolbar with Search for Viewer Component
 */
export const GraphViewerToolbar = ({
  // Data props
  nodeCount = 0,
  edgeCount = 0,
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
  title = null
}) => {
  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [localSearchValue, setLocalSearchValue] = useState(searchValue)
  const searchInputRef = useRef(null)

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

  const handleLayout = () => {
    onEvent('layout', { action: 'dagre' })
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

  return (
    <Paper elevation={0} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar variant="dense" sx={{ minHeight: 48, gap: 1 }}>
        {/* Title Section */}
        {showTitle && (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            {title || (
              <Typography variant="subtitle1">
                ITM Graph ({nodeCount} nodes, {edgeCount} edges)
              </Typography>
            )}
            
            {/* Metrics Chips */}
            {showMetrics && (
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  label={`${nodeCount} nodes`}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  size="small"
                  label={`${edgeCount} edges`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
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
          onClick={handleLayout}
          title="Apply Layout"
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
    </Paper>
  )
}

export default GraphViewerToolbar
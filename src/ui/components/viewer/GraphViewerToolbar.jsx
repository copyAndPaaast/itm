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
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Divider
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
  RadioButtonUnchecked,
  UnfoldLess,
  UnfoldMore,
  Folder,
  FolderOpen,
  ViewModule,
  ViewComfy
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
  title = 'ITM Graph', // Default fallback title
  
  // Group and system collapse data
  availableGroups = [],
  availableSystems = [],
  groupVisibility = {},
  systemCollapsed = {},
  onGroupToggle = () => {},
  onSystemToggle = () => {},
  
  // System view mode (to conditionally show system controls)
  systemViewMode = 'single'
}) => {
  // Search state
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [localSearchValue, setLocalSearchValue] = useState(searchValue)
  const searchInputRef = useRef(null)
  
  // Layout menu state
  const [layoutMenuAnchor, setLayoutMenuAnchor] = useState(null)
  
  // Collapse menu state
  const [collapseMenuAnchor, setCollapseMenuAnchor] = useState(null)

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

  /**
   * Collapse menu functionality
   */
  const handleCollapseMenuOpen = (event) => {
    setCollapseMenuAnchor(event.currentTarget)
  }

  const handleCollapseMenuClose = () => {
    setCollapseMenuAnchor(null)
  }

  const handleGroupToggle = (groupName, visible) => {
    onGroupToggle(groupName, visible)
  }

  const handleSystemToggle = (systemName, collapsed) => {
    // Update Redux state
    onSystemToggle(systemName, collapsed)
    
    // Also trigger Cytoscape collapse/expand
    onEvent('collapse', { 
      action: 'toggleSystem', 
      systemName, 
      collapsed 
    })
  }

  const handleExpandAll = () => {
    // Expand all systems
    availableSystems.forEach(system => {
      if (systemCollapsed[system]) {
        handleSystemToggle(system, false)
      }
    })
    
    // Show all groups
    availableGroups.forEach(group => {
      if (!groupVisibility[group]) {
        handleGroupToggle(group, true)
      }
    })
    
    onEvent('collapse', { action: 'expandAll' })
    handleCollapseMenuClose()
  }

  const handleCollapseAll = () => {
    // Collapse all systems
    availableSystems.forEach(system => {
      if (!systemCollapsed[system]) {
        handleSystemToggle(system, true)
      }
    })
    
    onEvent('collapse', { action: 'collapseAll' })
    handleCollapseMenuClose()
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
            <Typography variant="subtitle1">
              {title}
            </Typography>
            
            {/* Metrics Chips */}
            {showMetrics && (
              <Stack direction="row" spacing={1}>
                <Chip
                  size="small"
                  label={`${nodeCount} Assets`}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
                <Chip
                  size="small"
                  label={`${edgeCount} Beziehungen`}
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
          onClick={handleLayoutMenuOpen}
          title="Change Layout"
          disabled={loading}
        >
          <AccountTree />
        </IconButton>

        {/* Collapse Controls */}
        <IconButton 
          size="small" 
          onClick={handleCollapseMenuOpen}
          title="Collapse/Expand Controls"
          disabled={loading}
        >
          <ViewModule />
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
        <MenuItem key="layout-dagre" onClick={() => handleLayoutChange('dagre')}>
          <ListItemIcon>
            <AccountTree />
          </ListItemIcon>
          <ListItemText 
            primary="Hierarchical"
            secondary="Top-down hierarchy"
          />
        </MenuItem>
        <MenuItem key="layout-cola" onClick={() => handleLayoutChange('cola')}>
          <ListItemIcon>
            <Hub />
          </ListItemIcon>
          <ListItemText 
            primary="Force Directed"
            secondary="Physics-based layout"
          />
        </MenuItem>
        <MenuItem key="layout-cose-bilkent" onClick={() => handleLayoutChange('cose-bilkent')}>
          <ListItemIcon>
            <ScatterPlot />
          </ListItemIcon>
          <ListItemText 
            primary="High Quality"
            secondary="Optimized positioning"
          />
        </MenuItem>
        <MenuItem key="layout-circle" onClick={() => handleLayoutChange('circle')}>
          <ListItemIcon>
            <RadioButtonUnchecked />
          </ListItemIcon>
          <ListItemText 
            primary="Circle"
            secondary="Circular arrangement"
          />
        </MenuItem>
      </Menu>

      {/* Collapse Controls Menu */}
      <Menu
        anchorEl={collapseMenuAnchor}
        open={Boolean(collapseMenuAnchor)}
        onClose={handleCollapseMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1, minWidth: 280 }
        }}
      >
        {/* Quick Actions Header */}
        <MenuItem key="quick-actions-header" disabled>
          <ListItemText 
            primary="Quick Actions"
            secondary="Bulk operations for all elements"
          />
        </MenuItem>
        
        {/* Quick Action Buttons */}
        <MenuItem key="expand-all" onClick={handleExpandAll}>
          <ListItemIcon>
            <UnfoldMore color="success" />
          </ListItemIcon>
          <ListItemText 
            primary="Expand All"
            secondary={`Show all ${availableSystems.length} systems & ${availableGroups.length} groups`}
          />
        </MenuItem>
        <MenuItem key="collapse-all" onClick={handleCollapseAll}>
          <ListItemIcon>
            <UnfoldLess color="warning" />
          </ListItemIcon>
          <ListItemText 
            primary="Collapse All Systems"
            secondary={`Collapse ${availableSystems.length} system compounds`}
          />
        </MenuItem>
        
        {/* Divider */}
        {((systemViewMode !== 'single' && availableSystems.length > 0) || availableGroups.length > 0) && <Divider />}
        
        {/* Systems Section */}
        {availableSystems.length > 0 && (
          <>
            <MenuItem key="systems-header" disabled>
              <ListItemIcon>
                <ViewComfy />
              </ListItemIcon>
              <ListItemText 
                primary="Systems"
                secondary={`${availableSystems.length} available`}
              />
            </MenuItem>
            {availableSystems.map(system => (
              <MenuItem 
                key={system}
                sx={{ pl: 2, py: 1 }}
                disableRipple
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={!systemCollapsed[system]}
                      onChange={(e) => handleSystemToggle(system, !e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{system}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {systemCollapsed[system] ? 'Collapsed' : 'Expanded'}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', ml: 0, mr: 0 }}
                />
              </MenuItem>
            ))}
          </>
        )}
        
        {/* Groups Section */}
        {availableGroups.length > 0 && (
          <>
            {availableSystems.length > 0 && <Divider />}
            <MenuItem key="groups-header" disabled>
              <ListItemIcon>
                <ViewModule />
              </ListItemIcon>
              <ListItemText 
                primary="Groups"
                secondary={`${availableGroups.length} available`}
              />
            </MenuItem>
            {availableGroups.map(group => (
              <MenuItem 
                key={group}
                sx={{ pl: 2, py: 1 }}
                disableRipple
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={groupVisibility[group] || false}
                      onChange={(e) => handleGroupToggle(group, e.target.checked)}
                      size="small"
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2">{group}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {groupVisibility[group] ? 'Visible' : 'Hidden'}
                      </Typography>
                    </Box>
                  }
                  sx={{ width: '100%', ml: 0, mr: 0 }}
                />
              </MenuItem>
            ))}
          </>
        )}
        
        {/* Empty state */}
        {availableSystems.length === 0 && availableGroups.length === 0 && (
          <MenuItem key="empty-state" disabled>
            <ListItemText 
              primary="No collapse options"
              secondary="No systems or groups available"
            />
          </MenuItem>
        )}
      </Menu>
    </Paper>
  )
}

export default GraphViewerToolbar
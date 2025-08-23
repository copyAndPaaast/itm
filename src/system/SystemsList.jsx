/**
 * SystemsList - List component for displaying and selecting systems
 * 
 * Automatically loads systems from database and displays them in a selectable list.
 * Clicking a system sets it as the currently active system.
 */

import React, { useEffect } from 'react'
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { 
  selectSystems,
  selectCurrentSystemId,
  selectIsLoading,
  selectError,
  setCurrentSystemId
} from '../store/systemSlice.js'
import { loadAllSystemsAction } from './SystemActions.js'
import { createSystemsListStyles } from './SystemsListStyles.js'

const SystemsList = () => {
  const theme = useTheme()
  const styles = createSystemsListStyles(theme)
  const dispatch = useDispatch()
  
  // Redux state
  const systems = useSelector(selectSystems)
  const currentSystemId = useSelector(selectCurrentSystemId)
  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)

  /**
   * Load systems on component mount
   */
  useEffect(() => {
    console.log('📦 Loading systems on SystemsList mount')
    dispatch(loadAllSystemsAction())
  }, [dispatch])

  /**
   * Handle system selection
   */
  const handleSystemClick = (systemId) => {
    console.log('🎯 System selected:', systemId)
    dispatch(setCurrentSystemId(systemId))
  }

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress size={24} />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Loading systems...
        </Typography>
      </Box>
    )
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Alert severity="error" sx={styles.errorAlert}>
        <Typography variant="body2">
          {error.message}
        </Typography>
        {error.details && (
          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
            {error.details}
          </Typography>
        )}
      </Alert>
    )
  }

  /**
   * Render empty state
   */
  if (!systems || systems.length === 0) {
    return (
      <Box sx={styles.emptyContainer}>
        <Typography variant="body2" color="text.secondary">
          No systems found
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Create a new system to get started
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={styles.listContainer}>
      <List sx={styles.list} disablePadding>
        {systems.map((system) => {
          const isActive = currentSystemId === system.systemId
          
          return (
            <ListItem 
              key={system.systemId} 
              disablePadding
              sx={styles.listItem}
            >
              <ListItemButton
                selected={isActive}
                onClick={() => handleSystemClick(system.systemId)}
                sx={{
                  ...styles.listItemButton,
                  ...(isActive && styles.activeListItemButton)
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={styles.primaryTextContainer}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{
                          ...styles.systemName,
                          ...(isActive && styles.activeSystemName)
                        }}
                      >
                        {system.systemName}
                      </Typography>
                      {isActive && (
                        <Chip 
                          label="Active" 
                          size="small" 
                          color="primary" 
                          sx={styles.activeChip}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Box sx={styles.secondaryContainer}>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={isActive && styles.activeSecondaryText}
                      >
                        {system.systemLabel}
                      </Typography>
                      {system.description && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            ...styles.description,
                            ...(isActive && styles.activeSecondaryText)
                          }}
                        >
                          {system.description}
                        </Typography>
                      )}
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={isActive && styles.activeSecondaryText}
                      >
                        Nodes: {system.nodeCount || 0}
                      </Typography>
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
    </Box>
  )
}

export default SystemsList
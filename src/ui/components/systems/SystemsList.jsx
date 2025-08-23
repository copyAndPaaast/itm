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
  Chip
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { 
  selectSystems,
  selectCurrentSystemId,
  setCurrentSystemId
} from '../../../store/systemSlice.js'
import { loadAllSystemsAction } from '../../../system/SystemActions.js'
import { createSystemsListStyles } from './SystemsListStyles.js'

const SystemsList = () => {
  const theme = useTheme()
  const styles = createSystemsListStyles(theme)
  const dispatch = useDispatch()
  
  // Redux state
  const systems = useSelector(selectSystems)
  const currentSystemId = useSelector(selectCurrentSystemId)

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

  // Note: Loading and error states are handled by the central StatusIndicator

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
                    <Box sx={styles.compactRowContainer}>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.systemName,
                          ...(isActive && styles.activeSystemName)
                        }}
                      >
                        {system.systemName}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.systemLabel,
                          ...(isActive && styles.activeSystemLabel)
                        }}
                      >
                        [{system.systemLabel}]
                      </Typography>
                      <Typography 
                        variant="body2" 
                        component="span"
                        sx={{
                          ...styles.nodeCount,
                          ...(isActive && styles.activeNodeCount)
                        }}
                      >
                        {system.nodeCount || 0}
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
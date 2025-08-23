/**
 * Header - Application header component
 * 
 * Features:
 * - Three-column layout (App name | Current view | User actions)
 * - Layout reset functionality
 * - User profile and logout actions
 * - Material UI theming integration
 */

import React from 'react'
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { AccountCircle, Logout, ViewQuilt } from '@mui/icons-material'
import { createHeaderStyles } from './HeaderStyles.js'

const Header = ({ 
  appName = "Graph2 - ITM System",
  currentView = "Main Dashboard", 
  onLayoutReset = () => {},
  onUserProfile = () => {},
  onLogout = () => {}
}) => {
  const theme = useTheme()
  const styles = createHeaderStyles(theme)
  return (
    <AppBar position="static" elevation={1} sx={styles.appBar}>
      <Toolbar sx={styles.toolbar}>
        {/* Left Column - App Name */}
        <Box sx={styles.leftColumn}>
          <Typography variant="h6" component="div" sx={styles.appName}>
            {appName}
          </Typography>
        </Box>
        
        {/* Middle Column - Current View */}
        <Box sx={styles.middleColumn}>
          <Typography variant="subtitle1" sx={styles.currentView}>
            {currentView}
          </Typography>
        </Box>
        
        {/* Right Column - User Actions */}
        <Box sx={styles.rightColumn}>
          <IconButton 
            size="small" 
            sx={styles.actionButton}
            title="Reset Layout"
            onClick={onLayoutReset}
          >
            <ViewQuilt fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            sx={styles.actionButton}
            title="User Profile"
            onClick={onUserProfile}
          >
            <Avatar sx={styles.userAvatar}>
              U
            </Avatar>
          </IconButton>
          <IconButton 
            size="small" 
            sx={styles.actionButton}
            title="Logout"
            onClick={onLogout}
          >
            <Logout fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Header
/**
 * Footer - Application footer component
 * 
 * Features:
 * - StatusIndicator integration on the left
 * - App information in the center
 * - Expandable right section for future features
 * - Material UI theming integration
 */

import React from 'react'
import { Paper, Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import StatusIndicator from '../../status/StatusIndicator.jsx'
import { createFooterStyles } from './FooterStyles.js'

const Footer = ({ 
  appInfo = "Graph2 ITM System - Resizable Layout",
  showStatus = true,
  children // For future right-side content
}) => {
  const theme = useTheme()
  const styles = createFooterStyles(theme)
  return (
    <Paper elevation={1} sx={styles.paper}>
      <Box sx={styles.container}>
        {/* Left Side - Status Indicator */}
        <Box sx={styles.leftSection}>
          {showStatus ? <StatusIndicator /> : null}
        </Box>
        
        {/* Center - App Info */}
        <Box sx={styles.centerSection}>
          <Typography variant="caption" sx={styles.appInfo}>
            {appInfo}
          </Typography>
        </Box>
        
        {/* Right Side - Expandable for future features */}
        <Box sx={styles.rightSection}>
          {children}
        </Box>
      </Box>
    </Paper>
  )
}

export default Footer
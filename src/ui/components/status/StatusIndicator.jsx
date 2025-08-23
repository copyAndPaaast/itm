/**
 * StatusIndicator - Unobtrusive status feedback component
 * 
 * Features:
 * - Animated circular progress indicator with status colors
 * - Text message showing last action
 * - Connected to Redux status state
 * - Material UI theming integration
 * - Hover tooltip for additional details
 */

import React from 'react'
import { useSelector } from 'react-redux'
import { Box, Typography, CircularProgress, Tooltip } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  selectStatus,
  selectStatusMessage,
  selectStatusTimestamp,
  selectIsAnimating,
  selectStatusDetails,
  StatusTypes
} from '../../../store/statusSlice.js'
import {
  createStatusIndicatorStyles,
  createStatusTooltipStyles,
  getStatusColors,
  StatusSizing
} from '../../styles/StatusIndicatorStyles.js'

const StatusIndicator = () => {
  const theme = useTheme()
  const status = useSelector(selectStatus)
  const message = useSelector(selectStatusMessage)
  const timestamp = useSelector(selectStatusTimestamp)
  const isAnimating = useSelector(selectIsAnimating)
  const details = useSelector(selectStatusDetails)
  
  // Get theme-aware styles and colors
  const styles = createStatusIndicatorStyles(theme)
  const tooltipStyles = createStatusTooltipStyles(theme)
  const colors = getStatusColors(theme)

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  /**
   * Get status icon component with theme-aware styling
   */
  const getStatusIndicator = () => {
    
    if (isAnimating || status === StatusTypes.LOADING) {
      return (
        <CircularProgress 
          size={StatusSizing.dot.size}
          thickness={StatusSizing.dot.thickness}
          sx={styles.loadingSpinner}
        />
      )
    }

    // Theme-aware glowing status dot
    return (
      <Box
        className={status}
        sx={{
          ...styles.statusDot,
          backgroundColor: colors[status]
        }}
      />
    )
  }

  /**
   * Create tooltip content with details
   */
  const getTooltipContent = () => {
    const parts = [message]
    
    if (timestamp) {
      parts.push(`Last updated: ${formatTimestamp(timestamp)}`)
    }
    
    if (details) {
      parts.push(`Details: ${details}`)
    }
    
    return parts.join('\n')
  }

  return (
    <Tooltip 
      title={getTooltipContent()} 
      placement="top-start"
      arrow
      componentsProps={{
        tooltip: {
          sx: tooltipStyles.tooltip
        }
      }}
    >
      <Box
        className={details ? 'has-details' : ''}
        sx={styles.container}
      >
        {/* Animated Status Circle */}
        {getStatusIndicator()}

        {/* Status Message */}
        <Typography
          variant="caption"
          className={status}
          sx={styles.statusMessage}
        >
          {message}
        </Typography>

        {/* Optional timestamp for debugging */}
        {process.env.NODE_ENV === 'development' && timestamp && (
          <Typography
            variant="caption"
            sx={styles.debugTimestamp}
          >
            {formatTimestamp(timestamp)}
          </Typography>
        )}
      </Box>
    </Tooltip>
  )
}

export default StatusIndicator
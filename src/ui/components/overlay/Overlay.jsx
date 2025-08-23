/**
 * Overlay - Reusable modal overlay component with flexible content slots
 * 
 * Provides a consistent overlay interface that can be used by any component
 * for modals, dialogs, editors, forms, and other overlay content.
 */

import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  IconButton,
  Typography,
  Fade
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useTheme } from '@mui/material/styles'
import { createOverlayStyles } from './OverlayStyles.js'

const Overlay = ({
  // Core overlay props
  open = false,
  onClose = () => {},
  
  // Content configuration
  title = null,
  subtitle = null,
  content = null,
  actions = null,
  
  // Sizing and behavior
  maxWidth = 'md',
  fullWidth = true,
  fullScreen = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  
  // Styling
  sx = {},
  contentSx = {},
  
  // Advanced props
  TransitionComponent = Fade,
  transitionDuration = 300,
  
  // Accessibility
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  
  // Custom close button
  showCloseButton = true,
  closeButtonProps = {}
}) => {
  const theme = useTheme()
  const styles = createOverlayStyles(theme)

  /**
   * Handle dialog close with backdrop click prevention
   */
  const handleClose = (event, reason) => {
    if (disableBackdropClick && reason === 'backdropClick') {
      return
    }
    if (disableEscapeKeyDown && reason === 'escapeKeyDown') {
      return
    }
    onClose(event, reason)
  }

  /**
   * Handle close button click
   */
  const handleCloseButtonClick = (event) => {
    onClose(event, 'closeButtonClick')
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={fullScreen}
      TransitionComponent={TransitionComponent}
      transitionDuration={transitionDuration}
      sx={{
        ...styles.dialog,
        ...sx
      }}
      aria-labelledby={ariaLabelledBy || (title ? 'overlay-title' : undefined)}
      aria-describedby={ariaDescribedBy || (subtitle ? 'overlay-subtitle' : undefined)}
    >
      {/* Dialog Title */}
      {(title || subtitle || showCloseButton) && (
        <DialogTitle sx={styles.dialogTitle}>
          <Box sx={styles.titleContainer}>
            <Box sx={styles.titleContent}>
              {title && (
                <Typography
                  id="overlay-title"
                  variant="h6"
                  component="h2"
                  sx={styles.title}
                >
                  {title}
                </Typography>
              )}
              {subtitle && (
                <Typography
                  id="overlay-subtitle"
                  variant="body2"
                  color="text.secondary"
                  sx={styles.subtitle}
                >
                  {subtitle}
                </Typography>
              )}
            </Box>
            
            {showCloseButton && (
              <IconButton
                onClick={handleCloseButtonClick}
                sx={styles.closeButton}
                size="small"
                aria-label="Close overlay"
                {...closeButtonProps}
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        </DialogTitle>
      )}

      {/* Dialog Content */}
      {content && (
        <DialogContent
          sx={{
            ...styles.dialogContent,
            ...contentSx
          }}
        >
          {content}
        </DialogContent>
      )}

      {/* Dialog Actions */}
      {actions && (
        <DialogActions sx={styles.dialogActions}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  )
}

export default Overlay
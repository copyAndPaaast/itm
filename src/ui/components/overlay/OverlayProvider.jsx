/**
 * OverlayProvider - Global overlay state management
 * 
 * Provides a context-based system for managing overlays throughout the app.
 * Allows any component to show/hide overlays without prop drilling.
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import Overlay from './Overlay.jsx'

// Create overlay context
const OverlayContext = createContext(null)

/**
 * Hook to access overlay context
 */
export const useOverlay = () => {
  const context = useContext(OverlayContext)
  if (!context) {
    throw new Error('useOverlay must be used within an OverlayProvider')
  }
  return context
}

/**
 * Overlay Provider component
 */
export const OverlayProvider = ({ children }) => {
  const [overlayState, setOverlayState] = useState({
    open: false,
    title: null,
    subtitle: null,
    content: null,
    actions: null,
    maxWidth: 'md',
    fullWidth: true,
    fullScreen: false,
    disableBackdropClick: false,
    disableEscapeKeyDown: false,
    sx: {},
    contentSx: {},
    onClose: null
  })

  /**
   * Show overlay with configuration
   */
  const showOverlay = useCallback((config) => {
    setOverlayState(prevState => ({
      ...prevState,
      open: true,
      ...config
    }))
  }, [])

  /**
   * Hide overlay
   */
  const hideOverlay = useCallback(() => {
    setOverlayState(prevState => ({
      ...prevState,
      open: false
    }))
  }, [])

  /**
   * Update overlay content while open
   */
  const updateOverlay = useCallback((updates) => {
    setOverlayState(prevState => ({
      ...prevState,
      ...updates
    }))
  }, [])

  /**
   * Handle overlay close with custom callback
   */
  const handleOverlayClose = useCallback((event, reason) => {
    // Call custom onClose if provided
    if (overlayState.onClose) {
      overlayState.onClose(event, reason)
    }
    
    // Always hide overlay
    hideOverlay()
  }, [overlayState.onClose, hideOverlay])

  /**
   * Convenience methods for common overlay types
   */
  const showDialog = useCallback((title, content, actions, options = {}) => {
    showOverlay({
      title,
      content,
      actions,
      maxWidth: 'sm',
      ...options
    })
  }, [showOverlay])

  const showEditor = useCallback((title, content, actions, options = {}) => {
    showOverlay({
      title,
      content,
      actions,
      maxWidth: 'md',
      fullWidth: true,
      disableBackdropClick: true,
      ...options
    })
  }, [showOverlay])

  const showFullScreen = useCallback((title, content, actions, options = {}) => {
    showOverlay({
      title,
      content,
      actions,
      fullScreen: true,
      ...options
    })
  }, [showOverlay])

  // Context value
  const contextValue = {
    // State
    isOpen: overlayState.open,
    
    // Core methods
    showOverlay,
    hideOverlay,
    updateOverlay,
    
    // Convenience methods
    showDialog,
    showEditor,
    showFullScreen
  }

  return (
    <OverlayContext.Provider value={contextValue}>
      {children}
      
      {/* Global Overlay Instance */}
      <Overlay
        open={overlayState.open}
        onClose={handleOverlayClose}
        title={overlayState.title}
        subtitle={overlayState.subtitle}
        content={overlayState.content}
        actions={overlayState.actions}
        maxWidth={overlayState.maxWidth}
        fullWidth={overlayState.fullWidth}
        fullScreen={overlayState.fullScreen}
        disableBackdropClick={overlayState.disableBackdropClick}
        disableEscapeKeyDown={overlayState.disableEscapeKeyDown}
        sx={overlayState.sx}
        contentSx={overlayState.contentSx}
      />
    </OverlayContext.Provider>
  )
}

export default OverlayProvider
/**
 * Header Styles - Material UI themed styles for application header
 * 
 * Provides theme-aware styling for header component with proper separation
 * of styling concerns from component logic.
 */

/**
 * Create theme-aware header styles
 * @param {Object} theme - Material UI theme object
 * @returns {Object} Header styles object
 */
export const createHeaderStyles = (theme) => ({
  /**
   * Main AppBar styling
   */
  appBar: {
    borderRadius: 0
  },

  /**
   * Toolbar with three-column layout
   */
  toolbar: {
    justifyContent: 'space-between',
    px: 3
  },

  /**
   * Left column for app name
   */
  leftColumn: {
    flex: 1
  },

  /**
   * App name typography
   */
  appName: {
    fontWeight: theme.typography.h6.fontWeight,
    fontSize: theme.typography.h6.fontSize
  },

  /**
   * Middle column for current view
   */
  middleColumn: {
    flex: 1,
    textAlign: 'center'
  },

  /**
   * Current view typography
   */
  currentView: {
    opacity: 0.9,
    fontSize: theme.typography.subtitle1.fontSize
  },

  /**
   * Right column for user actions
   */
  rightColumn: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 1
  },

  /**
   * Action icon buttons
   */
  actionButton: {
    color: 'inherit',
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  },

  /**
   * User avatar styling
   */
  userAvatar: {
    width: 28,
    height: 28,
    fontSize: '14px',
    backgroundColor: theme.palette.grey[600],
    '&:hover': {
      backgroundColor: theme.palette.grey[500]
    }
  }
})

export default createHeaderStyles
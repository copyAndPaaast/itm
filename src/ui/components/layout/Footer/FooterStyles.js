/**
 * Footer Styles - Material UI themed styles for application footer
 * 
 * Provides theme-aware styling for footer component with proper separation
 * of styling concerns from component logic.
 */

/**
 * Create theme-aware footer styles
 * @param {Object} theme - Material UI theme object
 * @returns {Object} Footer styles object
 */
export const createFooterStyles = (theme) => ({
  /**
   * Main footer paper container
   */
  paper: {
    borderTop: 1,
    borderColor: 'divider',
    borderRadius: 0
  },

  /**
   * Footer content container with three-section layout
   */
  container: {
    p: 1.5,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /**
   * Left section for status indicator
   */
  leftSection: {
    minWidth: 120,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },

  /**
   * Center section for app information
   */
  centerSection: {
    flex: 1,
    textAlign: 'center'
  },

  /**
   * App info typography styling
   */
  appInfo: {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize
  },

  /**
   * Right section for expandable content
   */
  rightSection: {
    width: 120,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },

  /**
   * Placeholder spacing when status is disabled
   */
  spacerPlaceholder: {
    width: 120
  }
})

export default createFooterStyles
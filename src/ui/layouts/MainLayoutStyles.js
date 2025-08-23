/**
 * MainLayout Styles - Material UI themed styles for main application layout
 * 
 * Provides theme-aware styling for the main layout component with proper separation
 * of styling concerns from component logic.
 */

/**
 * Create theme-aware main layout styles
 * @param {Object} theme - Material UI theme object
 * @returns {Object} MainLayout styles object
 */
export const createMainLayoutStyles = (theme) => ({
  /**
   * Main container - full viewport
   */
  mainContainer: {
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    flexDirection: 'column',
    overflow: 'hidden'
  },

  /**
   * Content area below header
   */
  contentArea: {
    flex: 1, 
    display: 'flex', 
    overflow: 'hidden'
  },

  /**
   * Left control panel
   */
  controlPanelPaper: {
    height: '100%', 
    borderRadius: 0,
    borderRight: 1,
    borderColor: 'divider',
    backgroundColor: theme.palette.grey[50],
    p: 2
  },

  /**
   * Middle column container
   */
  middleColumnContainer: {
    height: '100%', 
    display: 'flex', 
    flexDirection: 'column'
  },

  /**
   * Actions panel paper
   */
  actionsPanelPaper: {
    height: '100%', 
    borderRadius: 0,
    borderBottom: 1,
    borderColor: 'divider',
    backgroundColor: 'background.paper',
    p: 2
  },

  /**
   * Status testing container
   */
  statusTestingContainer: {
    mt: 2
  },

  /**
   * Status testing label
   */
  statusTestingLabel: {
    color: theme.palette.text.secondary,
    fontSize: theme.typography.caption.fontSize,
    marginBottom: theme.spacing(1),
    display: 'block'
  },

  /**
   * Status testing button stack
   */
  statusButtonStack: {
    flexDirection: 'row',
    spacing: 1,
    flexWrap: 'wrap',
    gap: 1
  },

  /**
   * Viewer panel paper
   */
  viewerPanelPaper: {
    height: '100%', 
    borderRadius: 0,
    backgroundColor: 'background.default',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    p: 2
  },

  /**
   * Viewer content container
   */
  viewerContent: {
    textAlign: 'center'
  },

  /**
   * Table panel paper
   */
  tablePanelPaper: {
    height: '100%', 
    borderRadius: 0,
    borderTop: 1,
    borderColor: 'divider',
    backgroundColor: 'grey.50',
    p: 2
  },

  /**
   * Properties panel paper  
   */
  propertiesPanelPaper: {
    height: '100%', 
    borderRadius: 0,
    borderLeft: 1,
    borderColor: 'divider',
    backgroundColor: 'grey.50',
    p: 2
  },

  /**
   * Panel resize handle styles
   */
  resizeHandle: {
    horizontal: {
      width: '1px', 
      background: '#e0e0e0', 
      cursor: 'col-resize'
    },
    vertical: {
      height: '1px', 
      background: '#e0e0e0', 
      cursor: 'row-resize'
    }
  }
})

export default createMainLayoutStyles
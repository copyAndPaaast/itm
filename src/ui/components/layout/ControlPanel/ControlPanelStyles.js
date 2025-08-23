/**
 * ControlPanelStyles - Theme-aware styles for the ControlPanel component
 * 
 * Provides professional accordion styling with proper Material UI integration
 */

export const createControlPanelStyles = (theme) => ({
  controlPanelContainer: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius
  },

  header: {
    p: 2,
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[50]
  },

  accordionContainer: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },

  accordion: {
    '&:before': {
      display: 'none' // Remove default MUI accordion divider
    },
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.divider}`
    },
    boxShadow: 'none', // Remove default elevation
    backgroundColor: 'transparent',
    
    '&.Mui-expanded': {
      margin: 0 // Remove default expanded margin
    }
  },

  accordionSummary: {
    backgroundColor: theme.palette.grey[25] || '#fafafa',
    minHeight: 48,
    
    '&.Mui-expanded': {
      minHeight: 48, // Keep consistent height when expanded
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText
    },
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },

    '& .MuiAccordionSummary-content': {
      margin: '8px 0',
      
      '&.Mui-expanded': {
        margin: '8px 0' // Keep consistent margin when expanded
      }
    },

    '& .MuiAccordionSummary-expandIconWrapper': {
      color: theme.palette.text.secondary,
      
      '&.Mui-expanded': {
        color: theme.palette.primary.contrastText
      }
    }
  },

  accordionTitle: {
    fontWeight: theme.typography.fontWeightMedium,
    fontSize: theme.typography.body1.fontSize
  },

  accordionDetails: {
    padding: theme.spacing(1),
    paddingTop: theme.spacing(1.5),
    backgroundColor: theme.palette.background.default,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 120, // Ensure minimum space for components
    maxHeight: 300, // Prevent excessive height
    overflow: 'auto' // Allow scrolling if content is too long
  }
})

export default createControlPanelStyles
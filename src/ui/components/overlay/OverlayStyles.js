/**
 * OverlayStyles - Theme-aware styles for the reusable Overlay component
 * 
 * Provides professional modal styling with consistent design patterns
 */

export const createOverlayStyles = (theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      borderRadius: theme.shape.borderRadius * 2,
      boxShadow: theme.shadows[24],
      backgroundImage: 'none', // Remove default MUI gradient
      backgroundColor: theme.palette.background.paper
    },
    
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
    }
  },

  dialogTitle: {
    padding: theme.spacing(2, 3),
    borderBottom: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.grey[50] || '#fafafa'
  },

  titleContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing(2)
  },

  titleContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5)
  },

  title: {
    fontWeight: theme.typography.fontWeightSemiBold,
    color: theme.palette.text.primary,
    lineHeight: 1.2
  },

  subtitle: {
    lineHeight: 1.4,
    marginTop: theme.spacing(0.25)
  },

  closeButton: {
    color: theme.palette.text.secondary,
    padding: theme.spacing(0.5),
    marginTop: theme.spacing(-0.5),
    marginRight: theme.spacing(-0.5),
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
      color: theme.palette.text.primary
    }
  },

  dialogContent: {
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.default,
    
    // Remove default padding on first/last elements
    '& > :first-of-type': {
      marginTop: 0
    },
    
    '& > :last-child': {
      marginBottom: 0
    }
  },

  dialogActions: {
    padding: theme.spacing(2, 3),
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
    gap: theme.spacing(1),
    justifyContent: 'flex-end',
    
    '& .MuiButton-root': {
      minWidth: '80px'
    }
  }
})

export default createOverlayStyles
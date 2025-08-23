/**
 * SystemsListStyles - Theme-aware styles for the SystemsList component
 * 
 * Provides professional list styling with active state highlighting
 */

export const createSystemsListStyles = (theme) => ({
  listContainer: {
    width: '100%',
    height: '100%',
    overflow: 'auto'
  },

  list: {
    width: '100%'
  },

  listItem: {
    '&:not(:last-child)': {
      borderBottom: `1px solid ${theme.palette.divider}`
    }
  },

  listItemButton: {
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.5, 0),
    
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    },

    '&.Mui-selected': {
      backgroundColor: 'transparent' // We'll use custom active styling
    },

    '&.Mui-selected:hover': {
      backgroundColor: theme.palette.primary.light + '20'
    }
  },

  activeListItemButton: {
    backgroundColor: theme.palette.primary.light + '30',
    border: `1px solid ${theme.palette.primary.main}`,
    
    '&:hover': {
      backgroundColor: theme.palette.primary.light + '40'
    }
  },

  primaryTextContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1)
  },

  systemName: {
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  activeSystemName: {
    color: theme.palette.primary.dark,
    fontWeight: theme.typography.fontWeightSemiBold
  },

  activeChip: {
    height: 20,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightMedium
  },

  secondaryContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.25),
    mt: theme.spacing(0.5)
  },

  description: {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    lineHeight: 1.2
  },

  activeSecondaryText: {
    color: theme.palette.primary.dark + '80'
  },

  // Loading state styles
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    minHeight: 120
  },

  // Error state styles
  errorAlert: {
    margin: theme.spacing(1, 0),
    '& .MuiAlert-message': {
      width: '100%'
    }
  },

  // Empty state styles
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    minHeight: 120,
    textAlign: 'center'
  }
})

export default createSystemsListStyles
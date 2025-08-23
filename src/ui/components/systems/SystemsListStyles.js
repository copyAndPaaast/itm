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
    padding: theme.spacing(0.75, 1),
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(0.25, 0),
    minHeight: 36,
    
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

  compactRowContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%'
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

  systemLabel: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
    flexShrink: 0
  },

  activeSystemLabel: {
    color: theme.palette.primary.dark + '90'
  },

  nodeCount: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
    minWidth: '20px',
    textAlign: 'right',
    flexShrink: 0
  },

  activeNodeCount: {
    color: theme.palette.primary.dark + '90',
    fontWeight: theme.typography.fontWeightMedium
  },

  activeChip: {
    height: 18,
    fontSize: theme.typography.caption.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
    marginLeft: 'auto'
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
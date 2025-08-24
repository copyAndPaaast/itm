/**
 * RelationshipClassesListStyles - Theme-aware styles for the RelationshipClassesList component
 * 
 * Provides professional list styling with active state highlighting for relationship class selection
 */

export const createRelationshipClassesListStyles = (theme) => ({
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
      backgroundColor: theme.palette.secondary.light + '20'
    }
  },

  activeListItemButton: {
    backgroundColor: theme.palette.secondary.light + '30',
    border: `1px solid ${theme.palette.secondary.main}`,
    
    '&:hover': {
      backgroundColor: theme.palette.secondary.light + '40'
    }
  },

  compactRowContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    width: '100%'
  },

  relationshipType: {
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.palette.text.primary,
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },

  activeRelationshipType: {
    color: theme.palette.secondary.dark,
    fontWeight: theme.typography.fontWeightSemiBold
  },

  connectionSummary: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
    flexShrink: 0,
    fontSize: theme.typography.caption.fontSize
  },

  activeConnectionSummary: {
    color: theme.palette.secondary.dark + '90'
  },

  propertyInfo: {
    color: theme.palette.text.secondary,
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.caption.fontSize,
    flexShrink: 0,
    textAlign: 'right',
    minWidth: '45px'
  },

  activePropertyInfo: {
    color: theme.palette.secondary.dark + '90',
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

export default createRelationshipClassesListStyles
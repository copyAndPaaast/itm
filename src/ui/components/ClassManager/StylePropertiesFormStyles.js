export const createStylePropertiesFormStyles = (theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2),
    height: '100%',
    padding: theme.spacing(1),
  },

  mainLayout: {
    display: 'flex',
    gap: theme.spacing(2),
    flex: 1,
    minHeight: 0,
  },

  propertiesColumn: {
    flex: 1.5,
    overflowY: 'auto',
    maxHeight: '70vh',
  },

  previewColumn: {
    flex: 1,
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    minWidth: '300px',
    maxWidth: '400px',
  },

  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(1),
  },

  divider: {
    marginBottom: theme.spacing(2),
  },

  categoryPaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.divider}`,
  },

  categoryTitle: {
    marginBottom: theme.spacing(2),
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },

  formControl: {
    marginBottom: theme.spacing(2),
  },

  colorPickerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },

  colorInput: {
    '& .MuiInputBase-root': {
      paddingRight: theme.spacing(6),
    },
  },

  colorPreview: {
    width: 32,
    height: 32,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    position: 'absolute',
    right: theme.spacing(1),
    top: '50%',
    transform: 'translateY(-50%)',
  },

  sliderLabel: {
    marginBottom: theme.spacing(1),
    fontWeight: 'medium',
  },

  slider: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    '& .MuiSlider-mark': {
      backgroundColor: theme.palette.divider,
    },
    '& .MuiSlider-markActive': {
      backgroundColor: theme.palette.primary.main,
    },
  },

  previewPaper: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
  },

  previewContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.shape.borderRadius,
    border: `1px solid ${theme.palette.divider}`,
    minHeight: '250px',
  },

  cytoscapeContainer: {
    width: '100%',
    height: '180px',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor: theme.palette.background.default,
    position: 'relative',
  },

  previewNode: {
    minWidth: '140px',
    minHeight: '140px',
    border: '2px solid',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: 'bold',
    '&:hover': {
      transform: 'scale(1.05)',
    },
  },

  relationshipPreview: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
    width: '100%',
    justifyContent: 'center',
    minWidth: '200px',
    '& > div:first-of-type, & > div:last-of-type': {
      width: '40px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: theme.palette.grey[300],
      border: `2px solid ${theme.palette.grey[500]}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      fontWeight: 'bold',
      color: theme.palette.text.primary,
      flexShrink: 0,
    }
  },

  previewEdge: {
    flex: 1,
    height: '2px',
    borderTop: '2px solid #757575',
    margin: '0 -1px',
    position: 'relative',
    transition: 'all 0.3s ease',
    '&::after': {
      content: '""',
      position: 'absolute',
      right: '-8px',
      top: '-4px',
      width: 0,
      height: 0,
      borderLeft: '8px solid #757575',
      borderTop: '4px solid transparent',
      borderBottom: '4px solid transparent',
      transition: 'all 0.3s ease',
    }
  },
});

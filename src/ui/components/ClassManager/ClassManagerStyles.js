export const createClassManagerStyles = (theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  main: {
    display: 'flex',
    flex: 1,
    minHeight: 0, 
  },
  listContainer: {
    width: '300px',
    overflowY: 'auto',
    borderRight: `1px solid ${theme.palette.divider}`,
  },
  editContainer: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: 'auto',
  },
  placeholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: theme.palette.text.secondary,
  },
  editTitle: {
    marginBottom: theme.spacing(2),
  },
});
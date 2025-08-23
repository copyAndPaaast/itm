/**
 * SystemPropertiesForm - System creation and editing form
 * 
 * Domain-specific component for system properties management.
 * Handles creation of new systems and editing existing system properties.
 */

import React from 'react'
import { 
  Box, 
  TextField, 
  Typography, 
  Button, 
  Stack,
  Paper,
  Divider,
  Alert
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { useDispatch, useSelector } from 'react-redux'
import { 
  selectSystemFormData, 
  selectIsCreatingSystem, 
  selectError, 
  selectIsLoading,
  updateSystemFormData, 
  clearSystemFormData 
} from '../store/systemSlice.js'
import { createSystemAction } from './SystemActions.js'

/**
 * Create system properties form styles
 */
const createSystemFormStyles = (theme) => ({
  formContainer: {
    p: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  
  formHeader: {
    mb: 2
  },
  
  formFields: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2)
  },
  
  formActions: {
    mt: 2,
    pt: 2,
    borderTop: `1px solid ${theme.palette.divider}`
  },
  
  helperText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    mt: 0.5
  }
})

const SystemPropertiesForm = () => {
  const theme = useTheme()
  const styles = createSystemFormStyles(theme)
  const dispatch = useDispatch()
  
  // Redux state
  const formData = useSelector(selectSystemFormData)
  const isCreatingSystem = useSelector(selectIsCreatingSystem)
  const error = useSelector(selectError)
  const isLoading = useSelector(selectIsLoading)

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field) => (event) => {
    dispatch(updateSystemFormData({
      [field]: event.target.value
    }))
  }

  /**
   * Handle save system
   */
  const handleSave = async () => {
    try {
      await dispatch(createSystemAction({
        systemName: formData.systemName,
        systemLabel: formData.systemLabel,
        description: formData.description,
        properties: formData.properties
      }))
    } catch (error) {
      console.error('Failed to create system:', error)
    }
  }

  /**
   * Handle cancel creation
   */
  const handleCancel = () => {
    dispatch(clearSystemFormData())
  }

  /**
   * Validate form data
   */
  const isFormValid = () => {
    return formData.systemName.trim() && 
           formData.systemLabel.trim() && 
           /^[A-Za-z][A-Za-z0-9_]*$/.test(formData.systemLabel)
  }

  if (!isCreatingSystem) {
    return (
      <Box sx={styles.formContainer}>
        <Typography variant="body2" color="text.secondary">
          Select a system to view properties or click "New System" to create one.
        </Typography>
      </Box>
    )
  }

  return (
    <Paper elevation={0} sx={styles.formContainer}>
      {/* Form Header */}
      <Box sx={styles.formHeader}>
        <Typography variant="h6" gutterBottom>
          Create New System
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Define a new system with its properties and configuration.
        </Typography>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="body2">
            {error.message}
          </Typography>
          {error.details && (
            <Typography variant="caption" display="block">
              {error.details}
            </Typography>
          )}
        </Alert>
      )}

      {/* Form Fields */}
      <Box sx={styles.formFields}>
        <TextField
          label="System Name"
          value={formData.systemName}
          onChange={handleFieldChange('systemName')}
          fullWidth
          required
          placeholder="e.g., Production Environment"
          helperText="Human-readable name for the system"
          disabled={isLoading}
        />

        <TextField
          label="System Label"
          value={formData.systemLabel}
          onChange={handleFieldChange('systemLabel')}
          fullWidth
          required
          placeholder="e.g., ProductionSystem"
          helperText="Neo4j label for nodes (letters, numbers, underscore only)"
          error={Boolean(formData.systemLabel && !/^[A-Za-z][A-Za-z0-9_]*$/.test(formData.systemLabel))}
          disabled={isLoading}
        />

        <TextField
          label="Description"
          value={formData.description}
          onChange={handleFieldChange('description')}
          fullWidth
          multiline
          rows={3}
          placeholder="Describe the purpose and scope of this system..."
          helperText="Optional description of the system's purpose and components"
          disabled={isLoading}
        />
      </Box>

      {/* Form Actions */}
      <Box sx={styles.formActions}>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create System'}
          </Button>
        </Stack>
      </Box>
    </Paper>
  )
}

export default SystemPropertiesForm
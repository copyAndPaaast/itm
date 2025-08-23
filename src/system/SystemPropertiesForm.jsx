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
  selectIsEditingSystem,
  selectCurrentSystemId,
  selectCurrentSystem,
  selectError, 
  selectIsLoading,
  updateSystemFormData, 
  clearSystemFormData 
} from '../store/systemSlice.js'
import { createSystemAction } from './SystemActions.js'
import { startEditSystem } from '../store/systemSlice.js'
import { PermissionService } from '../user/PermissionService.js'

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
  const isEditingSystem = useSelector(selectIsEditingSystem)
  const currentSystemId = useSelector(selectCurrentSystemId)
  const currentSystem = useSelector(selectCurrentSystem)
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
   * Handle create system
   */
  const handleCreate = async () => {
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
   * Handle save system changes (edit mode)
   */
  const handleSave = async () => {
    // TODO: Implement system update action
    console.log('Save system changes:', formData)
    // For now, just show success message
    dispatch(clearSystemFormData())
  }

  /**
   * Handle delete system
   */
  const handleDelete = async () => {
    // TODO: Implement system delete action
    console.log('Delete system:', formData)
    // For now, just clear form
    dispatch(clearSystemFormData())
  }

  /**
   * Handle edit system (viewing mode)
   */
  const handleEdit = () => {
    if (currentSystemId) {
      dispatch(startEditSystem(currentSystemId))
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

  // Show form if creating, editing, or has active system
  const hasActiveSystem = currentSystemId || isCreatingSystem || isEditingSystem
  
  if (!hasActiveSystem) {
    return (
      <Box sx={styles.formContainer}>
        <Typography variant="body2" color="text.secondary">
          Select a system to view properties or click "New System" to create one.
        </Typography>
      </Box>
    )
  }

  const isEditing = isEditingSystem
  const isCreating = isCreatingSystem
  const isViewing = currentSystemId && !isCreatingSystem && !isEditingSystem

  return (
    <Paper elevation={0} sx={styles.formContainer}>
      {/* Form Header */}
      <Box sx={styles.formHeader}>
        <Typography variant="h6" gutterBottom>
          {isCreating ? 'Create New System' : 
           isEditing ? 'Edit System' : 
           'System Properties'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isCreating 
            ? 'Define a new system with its properties and configuration.'
            : isEditing
            ? 'Modify the system properties and save changes.'
            : `View and manage system: ${currentSystem?.systemName || 'Unknown System'}`
          }
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
          InputProps={{
            readOnly: isViewing
          }}
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
          InputProps={{
            readOnly: isViewing
          }}
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
          InputProps={{
            readOnly: isViewing
          }}
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
            {isViewing ? 'Close' : 'Cancel'}
          </Button>
          
          {isCreating && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreate}
              disabled={!isFormValid() || isLoading || !PermissionService.checkPermission('create', 'editor')}
            >
              {isLoading ? 'Creating...' : 'Create System'}
            </Button>
          )}
          
          {isViewing && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleEdit}
              disabled={isLoading || !PermissionService.checkPermission('edit', 'editor')}
            >
              Edit System
            </Button>
          )}
          
          {isEditing && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={handleDelete}
                disabled={isLoading || !PermissionService.checkPermission('delete', 'editor')}
              >
                Delete
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={!isFormValid() || isLoading || !PermissionService.checkPermission('edit', 'editor')}
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </Stack>
      </Box>
    </Paper>
  )
}

export default SystemPropertiesForm
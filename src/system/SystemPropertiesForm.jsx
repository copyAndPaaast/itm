/**
 * SystemPropertiesForm - System creation and editing form
 *
 * Domain-specific component for system properties management.
 * Handles creation of new systems and editing existing system properties.
 */

import React, { useEffect } from 'react'
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
import { getNodes, getEdges } from '../store/selectors.js'
import { NodeService } from '../NodeModule/node/NodeService.js'
import { RelationshipService } from '../RelationModule/relationship/RelationshipService.js'
import { addNode, updateNode, addEdge, updateEdge } from '../store/graphViewerSlice.js'

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

  // Get current system's nodes and edges for saving
  const currentNodes = useSelector(state => currentSystemId ? getNodes(state, currentSystemId) : [])
  const currentEdges = useSelector(state => currentSystemId ? getEdges(state, currentSystemId) : [])

  /**
   * Populate form data when currentSystem changes (for viewing mode)
   */
  useEffect(() => {
    if (currentSystem && !isCreatingSystem && !isEditingSystem) {
      console.log('📝 Populating form with current system data:', currentSystem)

      // Parse properties if they're stored as JSON string
      let properties = {}
      if (currentSystem.properties) {
        try {
          properties = typeof currentSystem.properties === 'string'
            ? JSON.parse(currentSystem.properties)
            : currentSystem.properties
        } catch (error) {
          console.warn('Failed to parse system properties:', error)
          properties = {}
        }
      }

      dispatch(updateSystemFormData({
        systemName: currentSystem.systemName || '',
        systemLabel: currentSystem.systemLabel || '',
        description: currentSystem.description || '',
        properties: properties
      }))
    }
  }, [currentSystem, isCreatingSystem, isEditingSystem, dispatch])

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
    console.log('💾 Starting save process...')
    console.log('📝 System form data:', formData)
    console.log('🔍 Current nodes to save:', currentNodes)
    console.log('🔍 Current edges to save:', currentEdges)

    try {
      const nodeService = new NodeService()
      const relationshipService = new RelationshipService()
      
      // Separate new items from existing items
      const newNodes = currentNodes.filter(node => 
        !node.nodeId || String(node.nodeId).startsWith('node_')
      )
      const existingNodes = currentNodes.filter(node => 
        node.nodeId && !String(node.nodeId).startsWith('node_')
      )
      const newEdges = currentEdges.filter(edge => 
        !edge.relationshipId || String(edge.relationshipId).startsWith('edge_')
      )
      const existingEdges = currentEdges.filter(edge => 
        edge.relationshipId && !String(edge.relationshipId).startsWith('edge_')
      )
      
      console.log('📊 Summary:', {
        newNodes: newNodes.length,
        existingNodes: existingNodes.length, 
        newEdges: newEdges.length,
        existingEdges: existingEdges.length
      })
      
      // Step 1: Update existing nodes individually
      for (const node of existingNodes) {
        console.log('🔄 UPDATE node:', node.nodeId, node.label)
        
        const updateProperties = {
          ...node.properties,
          positionX: node.position?.x || 0,
          positionY: node.position?.y || 0
        }
        
        await nodeService.updateNode(node.nodeId, updateProperties)
      }
      
      // Step 2: Update existing edges individually
      for (const edge of existingEdges) {
        console.log('🔄 UPDATE edge:', edge.relationshipId, edge.source, '→', edge.target)
        await relationshipService.updateRelationship(edge.relationshipId, edge.properties || {})
      }
      
      // Step 3: Create new nodes and edges together using temp IDs as names
      if (newNodes.length > 0 || newEdges.length > 0) {
        console.log('🆕 Creating new nodes and edges in bulk using temp IDs as names')
        
        await createNodesAndEdgesBulk(newNodes, newEdges, currentSystem.systemLabel)
      }

      console.log('✅ Save completed successfully')
      // TODO: Refresh Redux state with new Neo4j data
      // TODO: Show success message to user
      
    } catch (error) {
      console.error('❌ Save failed:', error)
      // TODO: Show error message to user
    }
  }
  
  /**
   * Create nodes and edges in a single bulk operation using temp IDs as names
   */
  const createNodesAndEdgesBulk = async (newNodes, newEdges, systemLabel) => {
    const session = new NodeService().neo4jService.getSession()
    
    try {
      // Build Cypher query parts
      let nodeCreateStatements = []
      let edgeCreateStatements = []
      let returnStatements = []
      
      // Create node statements using temp ID as name
      newNodes.forEach((node, index) => {
        const nodeVar = `n${index}`
        const tempId = node.id || node.nodeId
        const nodeName = node.label || node.title || tempId
        
        nodeCreateStatements.push(`
          (${nodeVar}:Asset:Default:${systemLabel} {
            name: '${nodeName}',
            positionX: ${node.position?.x || 0},
            positionY: ${node.position?.y || 0}
          })
        `)
        
        returnStatements.push(nodeVar)
      })
      
      // Create edge statements using temp IDs to find source/target nodes
      newEdges.forEach((edge, index) => {
        const sourceNodeIndex = newNodes.findIndex(n => 
          (n.id || n.nodeId) === edge.source
        )
        const targetNodeIndex = newNodes.findIndex(n => 
          (n.id || n.nodeId) === edge.target
        )
        
        if (sourceNodeIndex >= 0 && targetNodeIndex >= 0) {
          edgeCreateStatements.push(`
            (n${sourceNodeIndex})-[:CONNECTS_TO {
              connection_type: '${edge.relationshipType || 'connects_to'}'
            }]->(n${targetNodeIndex})
          `)
        }
      })
      
      // Combine into single CREATE statement
      const createStatement = `
        CREATE 
          ${nodeCreateStatements.join(',\n')}
          ${edgeCreateStatements.length > 0 ? ',\n' + edgeCreateStatements.join(',\n') : ''}
        RETURN ${returnStatements.join(', ')}
      `
      
      console.log('🔥 Bulk CREATE Cypher:', createStatement)
      
      const result = await session.run(createStatement)
      
      console.log('✅ Bulk create completed:', result.records.length, 'nodes created')
      
    } finally {
      await session.close()
    }
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

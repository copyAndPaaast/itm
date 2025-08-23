/**
 * OverlayExamples - Example usage patterns for the Overlay component
 * 
 * Demonstrates different ways to use the reusable Overlay component
 * for various UI patterns like dialogs, editors, and full-screen overlays.
 */

import React from 'react'
import { Button, Stack, TextField, Typography, Box } from '@mui/material'
import { useOverlay } from './OverlayProvider.jsx'

const OverlayExamples = () => {
  const { showDialog, showEditor, showFullScreen, showOverlay } = useOverlay()

  /**
   * Example 1: Simple dialog with actions
   */
  const showSimpleDialog = () => {
    showDialog(
      'Confirm Action',
      <Typography>Are you sure you want to delete this item?</Typography>,
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" onClick={() => hideOverlay()}>
          Cancel
        </Button>
        <Button variant="contained" color="error">
          Delete
        </Button>
      </Stack>
    )
  }

  /**
   * Example 2: Editor overlay for node types
   */
  const showNodeTypeEditor = () => {
    const editorContent = (
      <Box sx={{ minHeight: 300, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Node Type Name"
          defaultValue="ServerNode"
          fullWidth
        />
        <TextField
          label="Description"
          defaultValue="Represents a server in the infrastructure"
          multiline
          rows={3}
          fullWidth
        />
        <TextField
          label="Properties Schema"
          defaultValue='{"cpu_cores": "number", "memory_gb": "number", "hostname": "string"}'
          multiline
          rows={4}
          fullWidth
          helperText="JSON schema for node properties"
        />
      </Box>
    )

    const editorActions = (
      <Stack direction="row" spacing={1}>
        <Button variant="outlined">
          Cancel
        </Button>
        <Button variant="contained" color="primary">
          Save Node Type
        </Button>
      </Stack>
    )

    showEditor(
      'Edit Node Type',
      editorContent,
      editorActions,
      {
        subtitle: 'Configure the properties and behavior for this node type'
      }
    )
  }

  /**
   * Example 3: Full-screen overlay for complex operations
   */
  const showSystemManager = () => {
    const fullScreenContent = (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h5">System Management Dashboard</Typography>
        <Typography variant="body1" color="text.secondary">
          This would be a complex full-screen interface for managing systems,
          nodes, and relationships with multiple panels and controls.
        </Typography>
        <Box sx={{ flex: 1, backgroundColor: 'grey.100', borderRadius: 1, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Full-screen content area would go here...
          </Typography>
        </Box>
      </Box>
    )

    const fullScreenActions = (
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" size="large">
          Reset
        </Button>
        <Button variant="contained" size="large">
          Apply Changes
        </Button>
      </Stack>
    )

    showFullScreen(
      'System Manager',
      fullScreenContent,
      fullScreenActions,
      {
        subtitle: 'Comprehensive system management interface'
      }
    )
  }

  /**
   * Example 4: Custom overlay configuration
   */
  const showCustomOverlay = () => {
    showOverlay({
      title: 'Custom Configuration',
      subtitle: 'This overlay uses custom settings',
      content: (
        <Box sx={{ p: 2 }}>
          <Typography>This overlay demonstrates custom configuration:</Typography>
          <ul>
            <li>Custom max width (xs)</li>
            <li>Backdrop click disabled</li>
            <li>Escape key disabled</li>
            <li>Custom styling</li>
          </ul>
        </Box>
      ),
      actions: (
        <Button variant="contained">
          Close
        </Button>
      ),
      maxWidth: 'xs',
      disableBackdropClick: true,
      disableEscapeKeyDown: true,
      sx: {
        '& .MuiDialog-paper': {
          backgroundColor: 'warning.light'
        }
      }
    })
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Overlay Component Examples
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Click the buttons below to see different overlay configurations:
      </Typography>

      <Stack spacing={2} direction="row" flexWrap="wrap" gap={2}>
        <Button variant="outlined" onClick={showSimpleDialog}>
          Simple Dialog
        </Button>
        
        <Button variant="outlined" onClick={showNodeTypeEditor}>
          Node Type Editor
        </Button>
        
        <Button variant="outlined" onClick={showSystemManager}>
          Full-Screen Manager
        </Button>
        
        <Button variant="outlined" onClick={showCustomOverlay}>
          Custom Configuration
        </Button>
      </Stack>

      <Box sx={{ mt: 4, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          Usage Patterns
        </Typography>
        
        <Typography variant="body2" component="div">
          <strong>Simple Dialogs:</strong> Confirmations, alerts, simple forms
          <br />
          <strong>Editors:</strong> Node type editing, system configuration, complex forms
          <br />
          <strong>Full-Screen:</strong> Complex dashboards, multi-panel interfaces
          <br />
          <strong>Custom:</strong> Specialized overlays with unique requirements
        </Typography>
      </Box>
    </Box>
  )
}

export default OverlayExamples
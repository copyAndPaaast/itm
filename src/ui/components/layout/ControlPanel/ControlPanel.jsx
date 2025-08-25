/**
 * ControlPanel - Left panel with accordion sections for different components
 * 
 * Provides organized accordion sections for systems, nodes, and relationships
 * with slots for different list components.
 */

import React, { useState } from 'react'
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  IconButton,
  Divider,
  Tooltip,
  Button
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import AccountTreeIcon from '@mui/icons-material/AccountTree'
import { useTheme } from '@mui/material/styles'
import { createControlPanelStyles } from './ControlPanelStyles.js'
import { PermissionService } from '../../../../user/PermissionService.js'
import { useOverlay } from '../../overlay/OverlayProvider.jsx'
import AssetClassesList from '../../assetclasses/AssetClassesList.jsx'
import RelationshipClassesList from '../../relationshipclasses/RelationshipClassesList.jsx'
import ClassManager from '../../ClassManager/ClassManager.jsx'

const ControlPanel = ({
  systemsComponent = null,
  nodesComponent = null,
  relationshipsComponent = null,
  userPermissions = 'editor', // TODO: Get from user context/Redux
  onAssetClassSelect = () => {},
  onRelationshipClassSelect = () => {}
}) => {
  const theme = useTheme()
  const styles = createControlPanelStyles(theme)
  
  // Track which accordion sections are expanded
  const [expanded, setExpanded] = useState({
    systems: true,    // Systems expanded by default
    nodes: false,
    relationships: false
  })

  /**
   * Handle accordion expansion changes
   */
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(prev => ({
      ...prev,
      [panel]: isExpanded
    }))
  }

  /**
   * Check if user can edit node types
   */
  const canEditNodeTypes = PermissionService.checkPermission('edit', userPermissions)

  /**
   * Check if user can edit relationships  
   */
  const canEditRelationships = PermissionService.checkPermission('edit', userPermissions)

  // Access overlay context
  const { showEditor, hideOverlay } = useOverlay()

  /**
   * Handle Edit Node Types action
   */
  const handleEditNodeTypes = () => {
    if (!canEditNodeTypes) {
      console.warn('🚫 User does not have permission to edit node types')
      return
    }
    
    console.log('🔧 Edit Node Types clicked')
    
    // Open overlay for testing
    showEditor(
      'Class Manager - Asset Administration',
      <ClassManager type='asset' />,
      <Button variant="contained" onClick={hideOverlay}>
        Close
      </Button>,
      {
        subtitle: 'Configure asset and relationship class templates'
      }
    )
  }

  /**
   * Handle Edit Relationships action
   */
  const handleEditRelationships = () => {
    if (!canEditRelationships) {
      console.warn('🚫 User does not have permission to edit relationships')
      return
    }
    
    console.log('🔗 Edit Relationships clicked')
    
    // Open overlay for testing
    showEditor(
      'Class Manager - Relationship Administration',
      <ClassManager type='relationship' />,
      <Button variant="contained" onClick={hideOverlay}>
        Close
      </Button>,
      {
        subtitle: 'Configure asset and relationship class templates'
      }
    )
  }

  return (
    <Paper elevation={0} sx={styles.controlPanelContainer}>
      {/* Control Panel Header */}
      <Box sx={styles.header}>
        <Typography variant="h6" gutterBottom>
          Control Panel
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage systems, nodes, and relationships
        </Typography>
      </Box>

      {/* Accordion Sections */}
      <Box sx={styles.accordionContainer}>
        
        {/* Systems Section */}
        <Accordion
          expanded={expanded.systems}
          onChange={handleAccordionChange('systems')}
          sx={styles.accordion}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.accordionSummary}
          >
            <Typography variant="subtitle1" sx={styles.accordionTitle}>
              Systems
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={styles.accordionDetails}>
            {systemsComponent ? (
              systemsComponent
            ) : (
              <Typography variant="body2" color="text.secondary">
                Systems list component will be displayed here
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

        {/* Nodes Section */}
        <Accordion
          expanded={expanded.nodes}
          onChange={handleAccordionChange('nodes')}
          sx={styles.accordion}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.accordionSummary}
          >
            <Typography variant="subtitle1" sx={styles.accordionTitle}>
              Nodes
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={styles.accordionDetails}>
            {nodesComponent || (
              <AssetClassesList onAssetClassSelect={onAssetClassSelect} />
            )}
          </AccordionDetails>
        </Accordion>

        {/* Relationships Section */}
        <Accordion
          expanded={expanded.relationships}
          onChange={handleAccordionChange('relationships')}
          sx={styles.accordion}
          disableGutters
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={styles.accordionSummary}
          >
            <Typography variant="subtitle1" sx={styles.accordionTitle}>
              Relationships
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={styles.accordionDetails}>
            {relationshipsComponent || (
              <RelationshipClassesList onRelationshipClassSelect={onRelationshipClassSelect} />
            )}
          </AccordionDetails>
        </Accordion>

      </Box>

      {/* Action Icons Section - Only show if user has permissions */}
      {(canEditNodeTypes || canEditRelationships) && (
        <>
          <Divider />
          <Box sx={styles.actionsContainer}>
            {canEditNodeTypes && (
              <Tooltip title="Edit Node Types" placement="top">
                <IconButton 
                  onClick={handleEditNodeTypes}
                  sx={styles.actionButton}
                  size="medium"
                  aria-label="Edit Node Types"
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            )}
            
            {canEditRelationships && (
              <Tooltip title="Edit Relationships" placement="top">
                <IconButton 
                  onClick={handleEditRelationships}
                  sx={styles.actionButton}
                  size="medium"
                  aria-label="Edit Relationships"
                >
                  <AccountTreeIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </>
      )}
    </Paper>
  )
}

export default ControlPanel
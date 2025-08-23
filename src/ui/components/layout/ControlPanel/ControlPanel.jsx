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
  Paper
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTheme } from '@mui/material/styles'
import { createControlPanelStyles } from './ControlPanelStyles.js'

const ControlPanel = ({
  systemsComponent = null,
  nodesComponent = null,
  relationshipsComponent = null
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
            {nodesComponent ? (
              nodesComponent
            ) : (
              <Typography variant="body2" color="text.secondary">
                Nodes list component will be displayed here
              </Typography>
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
            {relationshipsComponent ? (
              relationshipsComponent
            ) : (
              <Typography variant="body2" color="text.secondary">
                Relationships list component will be displayed here
              </Typography>
            )}
          </AccordionDetails>
        </Accordion>

      </Box>
    </Paper>
  )
}

export default ControlPanel
/**
 * MainLayout - Main application layout with resizable and collapsible panels
 * 
 * Features:
 * - Full-width header and footer
 * - Left control panel (resizable/collapsible)
 * - Right properties panel (resizable/collapsible) 
 * - Middle column with top actions, viewer, and bottom table sections
 * - Viewer section is fixed, other sections in middle column are resizable/collapsible
 */

import React, { useRef, useEffect } from 'react'
import { Box, Button, Stack, Typography, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setSuccess, setError, setWarning, setIdle, showTemporarySuccess, executeWithStatus } from '../../store/statusSlice.js'
import { startCreateSystem, selectIsCreatingSystem, selectIsEditingSystem, selectCurrentSystemId } from '../../store/systemSlice.js'
import Header from '../components/layout/Header/Header.jsx'
import Footer from '../components/layout/Footer/Footer.jsx'
import GraphViewer from '../components/viewer/GraphViewer.jsx'
import SystemPropertiesForm from '../../system/SystemPropertiesForm.jsx'
import { createMainLayoutStyles } from './MainLayoutStyles.js'

const MainLayout = ({ children }) => {
  const mainLayoutRef = useRef(null)
  const middleColumnRef = useRef(null)
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = createMainLayoutStyles(theme)
  
  // System state
  const isCreatingSystem = useSelector(selectIsCreatingSystem)
  const isEditingSystem = useSelector(selectIsEditingSystem)
  const currentSystemId = useSelector(selectCurrentSystemId)

  /**
   * Reset all panels to their default sizes
   */
  const resetLayout = () => {
    console.log('🔄 Resetting layout to default sizes')
    
    // Show status feedback for layout reset
    dispatch(setLoading('Resetting layout...'))
    
    // Reset main layout (left: 20%, middle: 80%, right: 0%)
    if (mainLayoutRef.current) {
      mainLayoutRef.current.setLayout([20, 80, 0])
    }
    
    // Reset middle column (actions: 15%, viewer: 85%, table: 0%)
    if (middleColumnRef.current) {
      middleColumnRef.current.setLayout([15, 85, 0])
    }
    
    // Show success feedback
    setTimeout(() => {
      dispatch(showTemporarySuccess('Layout reset to defaults'))
    }, 500)
    
    console.log('✅ Layout reset complete')
  }

  /**
   * Status testing functions (development only)
   */
  const testStatusLoading = () => dispatch(setLoading('Connecting to database...'))
  const testStatusSuccess = () => dispatch(showTemporarySuccess('Graph saved successfully'))
  const testStatusError = () => dispatch(setError({ message: 'Failed to connect to Neo4j', details: 'Connection timeout after 5s' }))
  const testStatusWarning = () => dispatch(setWarning({ message: 'Large dataset detected', details: 'Graph rendering may be slow' }))
  const testStatusIdle = () => dispatch(setIdle('Ready for next operation'))

  const testAsyncOperation = () => {
    dispatch(executeWithStatus(
      'Saving graph to database...',
      () => new Promise(resolve => setTimeout(resolve, 2000)), // Mock async operation
      'Graph saved successfully'
    ))
  }

  /**
   * Auto-expand Properties Panel when there's an active system or during creation
   */
  useEffect(() => {
    const hasActiveSystem = currentSystemId || isCreatingSystem || isEditingSystem
    
    if (hasActiveSystem) {
      let mode = 'viewing'
      if (isCreatingSystem) mode = 'creation'
      else if (isEditingSystem) mode = 'editing'
      
      console.log(`🔧 Auto-expanding Properties Panel for system ${mode} (systemId: ${currentSystemId})`)
      
      // Expand Properties Panel to 30% when there's an active system
      if (mainLayoutRef.current) {
        mainLayoutRef.current.setLayout([20, 50, 30])
      }
      
      dispatch(showTemporarySuccess(`Properties Panel expanded for system ${mode}`))
    } else {
      console.log('🔄 No active system, Properties Panel can be collapsed')
    }
  }, [currentSystemId, isCreatingSystem, isEditingSystem, dispatch])

  /**
   * System management actions
   */
  const handleNewSystem = () => {
    console.log('🚀 Starting new system creation')
    dispatch(startCreateSystem())
  }
  return (
    <Box sx={styles.mainContainer}>
      {/* Header Component */}
      <Header 
        onLayoutReset={resetLayout}
        onUserProfile={() => console.log('User profile clicked')}
        onLogout={() => console.log('Logout clicked')}
      />

      {/* Main Content Area - Three Column Layout */}
      <Box sx={styles.contentArea}>
        <PanelGroup direction="horizontal" autoSaveId="main-layout" ref={mainLayoutRef}>
          {/* Left Panel - Control Panel */}
          <Panel 
            defaultSize={20} 
            minSize={15} 
            maxSize={40}
            collapsible={true}
            id="control-panel"
          >
            <Paper elevation={0} sx={styles.controlPanelPaper}>
              <Typography variant="h6" gutterBottom>
                Control Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Left resizable/collapsible panel for controls
              </Typography>
            </Paper>
          </Panel>

          <PanelResizeHandle style={styles.resizeHandle.horizontal} />

          {/* Middle Column - Actions, Viewer, Table */}
          <Panel minSize={30} defaultSize={80}>
            <Box sx={styles.middleColumnContainer}>
              <PanelGroup direction="vertical" autoSaveId="middle-column" ref={middleColumnRef}>
                {/* Top Actions Section */}
                <Panel 
                  defaultSize={15} 
                  minSize={10} 
                  maxSize={30}
                  collapsible={true}
                  id="actions-panel"
                >
                  <Paper elevation={0} sx={styles.actionsPanelPaper}>
                    {/* System Management Actions */}
                    <Box sx={styles.systemActionsContainer}>
                     
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      <Typography variant="h6" gutterBottom>
                        Actions Panel
                      </Typography>
                        <Button 
                          variant="contained" 
                          color="primary"
                          size="small"
                          onClick={handleNewSystem}
                          disabled={isCreatingSystem}
                        >
                          {isCreatingSystem ? 'Creating System...' : 'New System'}
                        </Button>
                      </Stack>
                    </Box>
                  </Paper>
                </Panel>

                <PanelResizeHandle style={styles.resizeHandle.vertical} />

                {/* Viewer Section - Resizable, Takes Most Space */}
                <Panel 
                  defaultSize={80} 
                  minSize={10}
                  collapsible={true}
                  id="viewer-panel"
                >
                  <GraphViewer
                    elements={[]}
                    style={{ height: '100%', width: '100%' }}
                  />
                </Panel>

                <PanelResizeHandle style={styles.resizeHandle.vertical} />

                {/* Bottom Table Section */}
                <Panel 
                  defaultSize={0} 
                  minSize={0}
                  collapsible={true}
                  id="table-panel"
                >
                  <Paper elevation={0} sx={styles.tablePanelPaper}>
                    <Typography variant="h6" gutterBottom>
                      Table Panel
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bottom resizable/collapsible section for table-based graph information
                    </Typography>
                  </Paper>
                </Panel>
              </PanelGroup>
            </Box>
          </Panel>

          <PanelResizeHandle style={styles.resizeHandle.horizontal} />

          {/* Right Panel - Properties Panel */}
          <Panel 
            defaultSize={0} 
            minSize={0} 
            maxSize={40}
            collapsible={true}
            id="properties-panel"
          >
            <Box sx={styles.propertiesPanelPaper}>
              <SystemPropertiesForm />
            </Box>
          </Panel>
        </PanelGroup>
      </Box>

      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default MainLayout
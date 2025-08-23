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

import React, { useRef } from 'react'
import { Box, Button, Stack, Typography, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useDispatch } from 'react-redux'
import { setLoading, setSuccess, setError, setWarning, setIdle, showTemporarySuccess, executeWithStatus } from '../store/statusSlice.js'
import Header from '../components/layout/Header/Header.jsx'
import Footer from '../components/layout/Footer/Footer.jsx'
import { createMainLayoutStyles } from './MainLayoutStyles.js'

const MainLayout = ({ children }) => {
  const mainLayoutRef = useRef(null)
  const middleColumnRef = useRef(null)
  const dispatch = useDispatch()
  const theme = useTheme()
  const styles = createMainLayoutStyles(theme)

  /**
   * Reset all panels to their default sizes
   */
  const resetLayout = () => {
    console.log('🔄 Resetting layout to default sizes')
    
    // Show status feedback for layout reset
    dispatch(setLoading('Resetting layout...'))
    
    // Reset main layout (left: 20%, middle: 60%, right: 20%)
    if (mainLayoutRef.current) {
      mainLayoutRef.current.setLayout([20, 60, 20])
    }
    
    // Reset middle column (actions: 15%, viewer: 60%, table: 25%)
    if (middleColumnRef.current) {
      middleColumnRef.current.setLayout([15, 60, 25])
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
          <Panel minSize={30}>
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
                    <Typography variant="h6" gutterBottom>
                      Actions Panel
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Top resizable/collapsible section for various actions
                    </Typography>
                    
                    {/* Status Testing Buttons (Development Only) */}
                    {process.env.NODE_ENV === 'development' && (
                      <Box sx={styles.statusTestingContainer}>
                        <Typography variant="caption" sx={styles.statusTestingLabel}>
                          Status Testing:
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                          <Button size="small" variant="outlined" onClick={testStatusLoading}>
                            Loading
                          </Button>
                          <Button size="small" variant="outlined" onClick={testStatusSuccess}>
                            Success  
                          </Button>
                          <Button size="small" variant="outlined" onClick={testStatusError}>
                            Error
                          </Button>
                          <Button size="small" variant="outlined" onClick={testStatusWarning}>
                            Warning
                          </Button>
                          <Button size="small" variant="outlined" onClick={testStatusIdle}>
                            Idle
                          </Button>
                          <Button size="small" variant="outlined" onClick={testAsyncOperation}>
                            Async Op
                          </Button>
                        </Stack>
                      </Box>
                    )}
                  </Paper>
                </Panel>

                <PanelResizeHandle style={styles.resizeHandle.vertical} />

                {/* Viewer Section - Resizable, Takes Most Space */}
                <Panel 
                  defaultSize={60} 
                  minSize={10}
                  collapsible={true}
                  id="viewer-panel"
                >
                  <Paper elevation={0} sx={styles.viewerPanelPaper}>
                    <Box sx={styles.viewerContent}>
                      <Typography variant="h4" gutterBottom>
                        Graph Viewer
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Main viewer area - Resizable, fills most space initially
                      </Typography>
                    </Box>
                  </Paper>
                </Panel>

                <PanelResizeHandle style={styles.resizeHandle.vertical} />

                {/* Bottom Table Section */}
                <Panel 
                  defaultSize={25} 
                  minSize={15}
                  collapsible={true}
                  defaultCollapsed={true}
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
            defaultSize={20} 
            minSize={15} 
            maxSize={40}
            collapsible={true}
            defaultCollapsed={true}
            id="properties-panel"
          >
            <Paper elevation={0} sx={styles.propertiesPanelPaper}>
              <Typography variant="h6" gutterBottom>
                Properties Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Right resizable/collapsible panel for properties
              </Typography>
            </Paper>
          </Panel>
        </PanelGroup>
      </Box>

      {/* Footer Component */}
      <Footer />
    </Box>
  )
}

export default MainLayout
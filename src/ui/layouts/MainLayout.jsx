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

import React from 'react'
import { Box, AppBar, Toolbar, Typography, Paper, IconButton, Avatar } from '@mui/material'
import { AccountCircle, Logout } from '@mui/icons-material'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'

const MainLayout = ({ children }) => {
  return (
    <Box sx={{ 
      height: '100vh', 
      width: '100vw', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header - Full Width with Three Columns */}
      <AppBar position="static" elevation={1} sx={{ borderRadius: 0 }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: 3 }}>
          {/* Left Column - App Name */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              Graph2 - ITM System
            </Typography>
          </Box>
          
          {/* Middle Column - Current View */}
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
              Main Dashboard
            </Typography>
          </Box>
          
          {/* Right Column - User Actions */}
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <IconButton 
              size="small" 
              sx={{ color: 'inherit' }}
              title="User Profile"
            >
              <Avatar sx={{ width: 28, height: 28, fontSize: '14px' }}>
                U
              </Avatar>
            </IconButton>
            <IconButton 
              size="small" 
              sx={{ color: 'inherit' }}
              title="Logout"
            >
              <Logout fontSize="small" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area - Three Column Layout */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <PanelGroup direction="horizontal" autoSaveId="main-layout">
          {/* Left Panel - Control Panel */}
          <Panel 
            defaultSize={20} 
            minSize={15} 
            maxSize={40}
            collapsible={true}
            id="control-panel"
          >
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%', 
                borderRadius: 0,
                borderRight: 1,
                borderColor: 'divider',
                backgroundColor: 'grey.50',
                p: 2
              }}
            >
              <Typography variant="h6" gutterBottom>
                Control Panel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Left resizable/collapsible panel for controls
              </Typography>
            </Paper>
          </Panel>

          <PanelResizeHandle style={{ width: '4px', background: '#e0e0e0', cursor: 'col-resize' }} />

          {/* Middle Column - Actions, Viewer, Table */}
          <Panel minSize={30}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <PanelGroup direction="vertical" autoSaveId="middle-column">
                {/* Top Actions Section */}
                <Panel 
                  defaultSize={15} 
                  minSize={10} 
                  maxSize={30}
                  collapsible={true}
                  id="actions-panel"
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 0,
                      borderBottom: 1,
                      borderColor: 'divider',
                      backgroundColor: 'background.paper',
                      p: 2
                    }}
                  >
                    <Typography variant="h6" gutterBottom>
                      Actions Panel
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Top resizable/collapsible section for various actions
                    </Typography>
                  </Paper>
                </Panel>

                <PanelResizeHandle style={{ height: '4px', background: '#e0e0e0', cursor: 'row-resize' }} />

                {/* Viewer Section - Resizable, Takes Most Space */}
                <Panel 
                  defaultSize={60} 
                  minSize={10}
                  collapsible={true}
                  id="viewer-panel"
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 0,
                      backgroundColor: 'background.default',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 2
                    }}
                  >
                    <Box textAlign="center">
                      <Typography variant="h4" gutterBottom>
                        Graph Viewer
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        Main viewer area - Resizable, fills most space initially
                      </Typography>
                    </Box>
                  </Paper>
                </Panel>

                <PanelResizeHandle style={{ height: '4px', background: '#e0e0e0', cursor: 'row-resize' }} />

                {/* Bottom Table Section */}
                <Panel 
                  defaultSize={25} 
                  minSize={15}
                  collapsible={true}
                  id="table-panel"
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      height: '100%', 
                      borderRadius: 0,
                      borderTop: 1,
                      borderColor: 'divider',
                      backgroundColor: 'grey.50',
                      p: 2
                    }}
                  >
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

          <PanelResizeHandle style={{ width: '4px', background: '#e0e0e0', cursor: 'col-resize' }} />

          {/* Right Panel - Properties Panel */}
          <Panel 
            defaultSize={20} 
            minSize={15} 
            maxSize={40}
            collapsible={true}
            id="properties-panel"
          >
            <Paper 
              elevation={0} 
              sx={{ 
                height: '100%', 
                borderRadius: 0,
                borderLeft: 1,
                borderColor: 'divider',
                backgroundColor: 'grey.50',
                p: 2
              }}
            >
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

      {/* Footer - Full Width */}
      <Paper 
        elevation={1} 
        sx={{ 
          borderTop: 1, 
          borderColor: 'divider',
          borderRadius: 0
        }}
      >
        <Box sx={{ p: 1.5, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Graph2 ITM System - Resizable Layout Demo
          </Typography>
        </Box>
      </Paper>
    </Box>
  )
}

export default MainLayout
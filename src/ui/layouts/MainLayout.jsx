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

import React, { useRef, useEffect, useMemo } from 'react'
import { Box, Button, Stack, Typography, Paper } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setSuccess, setError, setWarning, setIdle, showTemporarySuccess, executeWithStatus } from '../../store/statusSlice.js'
import { 
  startCreateSystem, 
  selectIsCreatingSystem, 
  selectIsEditingSystem, 
  selectCurrentSystemId, 
  selectCurrentSystem, 
  selectSystemViewMode,
  selectGroupVisibility,
  selectSystemCollapsed,
  toggleGroupVisibility,
  toggleSystemCollapsed 
} from '../../store/systemSlice.js'
import { SYSTEM_VIEW_MODES } from '../../store/systemViewModes.js'
import { getNodeCount, getEdgeCount, getNodes, getEdges } from '../../store/selectors.js'
import { addNode, addEdge, initializeGraph } from '../../store/graphViewerSlice.js'
import { createNodeAction } from '../../NodeModule/node/NodeActions.js'
import { GraphViewerMapper } from '../components/viewer/GraphViewerMapper.js'
import Header from '../components/layout/Header/Header.jsx'
import Footer from '../components/layout/Footer/Footer.jsx'
import ControlPanel from '../components/layout/ControlPanel/ControlPanel.jsx'
import GraphViewer from '../components/viewer/GraphViewer.jsx'
import SystemPropertiesForm from '../../system/SystemPropertiesForm.jsx'
import SystemsList from '../components/systems/SystemsList.jsx'
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
  const currentSystem = useSelector(selectCurrentSystem)
  const systemViewMode = useSelector(selectSystemViewMode)
  const groupVisibility = useSelector(selectGroupVisibility)
  const systemCollapsed = useSelector(selectSystemCollapsed)

  // Get node and edge data from Redux state
  const nodes = useSelector(state => currentSystemId ? getNodes(state, currentSystemId) : [])
  const edges = useSelector(state => currentSystemId ? getEdges(state, currentSystemId) : [])
  const nodeCount = useSelector(state => currentSystemId ? getNodeCount(state, currentSystemId) : 0)
  const edgeCount = useSelector(state => currentSystemId ? getEdgeCount(state, currentSystemId) : 0)

  // Get available groups and systems from current data
  const availableGroups = useMemo(() => {
    const groups = new Set()
    nodes.forEach(node => {
      if (node.groups) {
        node.groups.forEach(group => groups.add(group))
      }
    })
    return Array.from(groups)
  }, [nodes])

  const availableSystems = useMemo(() => {
    const systems = new Set()
    nodes.forEach(node => {
      if (node.systems) {
        node.systems.forEach(system => systems.add(system))
      }
    })
    return Array.from(systems)
  }, [nodes])

  // Initialize graph when system changes (only if not already initialized)
  useEffect(() => {
    if (currentSystemId && currentSystem) {
      // Check if graph state already exists for this system
      if (nodes.length === 0 && edges.length === 0) {
        console.log('🔧 Initializing graph for NEW system:', currentSystemId)
        dispatch(initializeGraph({ 
          graphId: currentSystemId, 
          initialNodes: [], 
          initialEdges: [] 
        }))
      } else {
        console.log('🔄 Graph already exists for system:', currentSystemId, '- skipping initialization')
        console.log('  Existing nodes:', nodes.length, 'edges:', edges.length)
      }
    }
  }, [currentSystemId, currentSystem, dispatch, nodes.length, edges.length])

  // Map Redux state to Cytoscape elements using GraphViewerMapper
  const elements = useMemo(() => {
    if (!currentSystemId || !nodes.length && !edges.length) {
      console.log('🔍 No elements to map - returning empty array')
      return []
    }
    
    const mapper = new GraphViewerMapper()
    const mappedElements = mapper.mapToElements(nodes, edges, {
      groupVisibility,
      systemCollapsed
    })
    console.log('🔍 GraphViewerMapper: Mapped', nodes.length, 'nodes and', edges.length, 'edges to', mappedElements.length, 'elements')
    console.log('🔍 Visibility states:', { groupVisibility, systemCollapsed })
    console.log('🔍 Redux nodes:', nodes.map(n => ({ id: n.nodeId || n.id, label: n.label })))
    console.log('🔍 Redux edges:', edges.map(e => ({ id: e.id, source: e.source, target: e.target, type: e.relationshipType })))
    console.log('🔍 Mapped elements:', mappedElements.filter(e => e.group === 'edges').map(e => ({ id: e.data.id, source: e.data.source, target: e.data.target })))
    return mappedElements
  }, [nodes, edges, currentSystemId, groupVisibility, systemCollapsed])

  // Debug system state
  useEffect(() => {
    console.log('🔍 MainLayout System State Debug:')
    console.log('  currentSystemId:', currentSystemId)
    console.log('  currentSystem:', currentSystem)
    console.log('  systemViewMode:', systemViewMode)
    console.log('  isCreatingSystem:', isCreatingSystem)
    console.log('  nodeCount:', nodeCount, 'edgeCount:', edgeCount)
    console.log('  elements:', elements.length, 'Redux nodes:', nodes.length, 'Redux edges:', edges.length)
    console.log('  EDGE COUNT MISMATCH CHECK: Redux edges array:', edges.length, 'vs selector edgeCount:', edgeCount)
    if (edges.length !== edgeCount) {
      console.log('⚠️ EDGE COUNT MISMATCH! Redux has', edges.length, 'edges but selector returns', edgeCount)
    }
  }, [currentSystemId, currentSystem, systemViewMode, isCreatingSystem, nodeCount, edgeCount, elements.length, nodes.length, edges.length])

  /**
   * Determine the graph viewer title based on current system state
   */
  const getGraphViewerTitle = () => {
    // If in compound view mode, show "System Übersicht"
    if (systemViewMode === SYSTEM_VIEW_MODES.COMPOUND) {
      return 'System Übersicht'
    }
    
    // If we have a current system in single mode, show its name
    if (currentSystem && systemViewMode === SYSTEM_VIEW_MODES.SINGLE) {
      return currentSystem.systemName || `System ${currentSystem.systemId}`
    }
    
    // If creating a system, show creation state
    if (isCreatingSystem) {
      return 'Neues System'
    }
    
    // Default fallback
    return 'ITM Graph'
  }

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

  /**
   * Handle asset class selection for node creation
   */
  const handleAssetClassSelect = (assetClass) => {
    console.log('🎯 AssetClass selected in MainLayout:', assetClass.className)
    // TODO: Open node creation overlay/dialog with pre-filled asset class
    dispatch(showTemporarySuccess(`Active node type: ${assetClass.className}`))
  }

  /**
   * Handle relationship class selection for edge creation
   */
  const handleRelationshipClassSelect = (relationshipClass) => {
    console.log('🔗 RelationshipClass selected in MainLayout:', relationshipClass.relationshipType)
    // TODO: Open edge creation mode with pre-selected relationship type
    dispatch(showTemporarySuccess(`Active edge type: ${relationshipClass.relationshipType}`))
  }


  /**
   * Handle GraphViewer events - including node creation
   */
  const handleGraphViewerEvent = (eventType, eventData) => {
    console.log('📡 GraphViewer event:', eventType, eventData)
    
    switch (eventType) {
      case 'create_node_blocked':
        if (eventData.reason === 'no_system_selected') {
          dispatch(setWarning({
            message: 'System Selection Required',
            details: 'Please select a system from the Systems list before creating nodes'
          }))
        } else if (eventData.reason === 'system_not_editing') {
          dispatch(setWarning({
            message: 'Edit Mode Required',
            details: 'Please activate "Edit System" mode to create nodes in the selected system'
          }))
        }
        break
        
      case 'create_node':
        // Show immediate feedback with context
        const actionType = eventData.isEditingSystem ? 'Adding node to system being edited' : 'Creating node in selected system'
        dispatch(setLoading(actionType + '...'))
        
        console.log('🎯 Node created in system:', eventData.systemName, 'Context:', eventData.context)
        console.log('📝 Node data:', eventData.nodeData)
        
        // Add node to Redux graphViewer state
        if (currentSystemId && currentSystem) {
          const nodeForState = {
            nodeId: eventData.nodeId,
            id: eventData.nodeId,
            label: eventData.nodeData.label,
            type: eventData.nodeData.type,
            assetClass: eventData.nodeData.assetClass,
            systemId: currentSystemId,
            systemName: currentSystem.systemName,
            position: eventData.position,
            systems: [currentSystem.systemLabel], // Use systemLabel for Neo4j consistency
            groups: [],
            properties: {}
          }
          
          console.log('💾 Adding node to Redux state:', nodeForState)
          dispatch(addNode({ 
            graphId: currentSystemId, 
            node: nodeForState 
          }))
        }
        
        // Show success message
        setTimeout(() => {
          const successMessage = eventData.isEditingSystem 
            ? `Node added to system "${eventData.systemName}" (currently editing)`
            : `Node created in "${eventData.systemName}"`
          dispatch(showTemporarySuccess(successMessage))
        }, 500)
        break
        
      case 'create_edge':
        // Show immediate feedback
        dispatch(setLoading('Creating edge relationship...'))
        
        console.log('🔗 Edge created between:', eventData.sourceId, '->', eventData.targetId)
        console.log('📝 Edge data:', eventData)
        
        // Add edge to Redux graphViewer state
        if (currentSystemId) {
          // Extract business node IDs from Cytoscape node data
          console.log('🔍 DEBUG eventData.sourceData:', eventData.sourceData)
          console.log('🔍 DEBUG eventData.targetData:', eventData.targetData)
          console.log('🔍 DEBUG sourceId fallback:', eventData.sourceId)
          console.log('🔍 DEBUG targetId fallback:', eventData.targetId)
          
          const sourceBusinessId = eventData.sourceData?.originalNodeId || eventData.sourceId
          const targetBusinessId = eventData.targetData?.originalNodeId || eventData.targetId
          
          console.log('🔍 DEBUG final business IDs:', { sourceBusinessId, targetBusinessId })
          
          const edgeForState = {
            id: eventData.edgeId,  // GraphViewerMapper expects 'id', not 'edgeId'
            source: sourceBusinessId,  // Business node ID (matches nodeId in Redux nodes)
            target: targetBusinessId,  // Business node ID (matches nodeId in Redux nodes)
            relationshipType: 'connects_to', // Default type - TODO: Use selected RelationshipClass
            systemId: currentSystemId,
            properties: {}
          }
          
          console.log('💾 Adding edge to Redux state:', edgeForState)
          console.log('💾 Dispatching addEdge with graphId:', currentSystemId)
          dispatch(addEdge({ 
            graphId: currentSystemId, 
            edge: edgeForState 
          }))
          
          // Debug: Check Redux state after dispatch
          setTimeout(() => {
            console.log('🔍 Redux state after edge creation - edges:', edges.length, 'nodes:', nodes.length)
            console.log('🔍 All Redux edges:', edges)
          }, 100)
        }
        
        // Show success message
        setTimeout(() => {
          dispatch(showTemporarySuccess('Edge relationship created successfully'))
        }, 500)
        break
        
      case 'background_click':
        // Clear any temporary status messages on background click
        break
        
      default:
        console.log('📡 Unhandled GraphViewer event:', eventType)
    }
  }

  /**
   * Handle group visibility toggle
   */
  const handleGroupToggle = (groupName, visible) => {
    console.log('🔍 Group toggle:', groupName, 'visible:', visible)
    dispatch(toggleGroupVisibility({ groupName, visible }))
  }

  /**
   * Handle system collapse toggle
   */
  const handleSystemToggle = (systemName, collapsed) => {
    console.log('🏗️ System toggle:', systemName, 'collapsed:', collapsed)
    dispatch(toggleSystemCollapsed({ systemName, collapsed }))
  }

  /**
   * Auto-manage group/system visibility states based on current viewing context
   */
  useEffect(() => {
    if (systemViewMode === SYSTEM_VIEW_MODES.SINGLE && currentSystem) {
      console.log('🎯 Single system mode detected - setting appropriate default states')
      
      // In single system mode, automatically set current system as expanded
      const currentSystemName = currentSystem.systemName
      if (currentSystemName && systemCollapsed[currentSystemName] !== false) {
        console.log('🏗️ Auto-expanding current system:', currentSystemName)
        dispatch(toggleSystemCollapsed({ systemName: currentSystemName, collapsed: false }))
      }
      
      // Set appropriate group visibility defaults (show all groups in single system)
      availableGroups.forEach(groupName => {
        if (groupVisibility[groupName] === undefined) {
          console.log('🔍 Auto-showing group in single system mode:', groupName)
          dispatch(toggleGroupVisibility({ groupName, visible: true }))
        }
      })
      
      // Collapse other systems that aren't the current one (if any exist)
      availableSystems.forEach(systemName => {
        if (systemName !== currentSystemName && systemCollapsed[systemName] !== true) {
          console.log('🏗️ Auto-collapsing non-current system:', systemName)
          dispatch(toggleSystemCollapsed({ systemName, collapsed: true }))
        }
      })
    }
  }, [systemViewMode, currentSystem, availableGroups, availableSystems, groupVisibility, systemCollapsed, dispatch])

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
            <ControlPanel
              systemsComponent={<SystemsList />}
              nodesComponent={null}
              relationshipsComponent={null}
              userPermissions="editor" // TODO: Get from user context/Redux state
              onAssetClassSelect={handleAssetClassSelect}
              onRelationshipClassSelect={handleRelationshipClassSelect}
            />
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
                    elements={elements}
                    style={{ height: '100%', width: '100%' }}
                    title={getGraphViewerTitle()}
                    userPermissions="editor"
                    currentSystemId={currentSystemId}
                    currentSystem={currentSystem}
                    isEditingSystem={isEditingSystem}
                    nodeCount={nodeCount}
                    edgeCount={edgeCount}
                    availableGroups={availableGroups}
                    availableSystems={availableSystems}
                    groupVisibility={groupVisibility}
                    systemCollapsed={systemCollapsed}
                    onGroupToggle={handleGroupToggle}
                    onSystemToggle={handleSystemToggle}
                    systemViewMode={systemViewMode}
                    onEvent={handleGraphViewerEvent}
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
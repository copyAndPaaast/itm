/**
 * Demo showing hull toggle functionality
 */
import React, { useState, useEffect } from 'react'
import { Box, Button, Stack, Typography, Switch, FormControlLabel } from '@mui/material'
import GraphViewerV2 from './GraphViewerV2.jsx'

// Test data with multiple groups
const TEST_NODES = [
  {
    nodeId: 1001,
    title: 'Web Server 01',
    systems: ['Production'],
    groups: ['WebCluster', 'CriticalInfra']
  },
  {
    nodeId: 1002, 
    title: 'Database 01',
    systems: ['Production'],
    groups: ['DataLayer']
  },
  {
    nodeId: 1003,
    title: 'Web Server 02',
    systems: ['Test'],
    groups: ['WebCluster']
  },
  {
    nodeId: 1004,
    title: 'Database 02',
    systems: ['Test'],
    groups: ['DataLayer', 'CriticalInfra']
  }
]

const TEST_EDGES = [
  {
    id: 'edge1',
    source: 1001,
    target: 1002,
    relationshipType: 'connects_to'
  },
  {
    id: 'edge2', 
    source: 1003,
    target: 1004,
    relationshipType: 'connects_to'
  },
  {
    id: 'edge3',
    source: 1002,
    target: 1004,
    relationshipType: 'replicates_to'
  }
]

export const HullToggleDemo = ({ mapperRef, cyRef }) => {
  const [groupStates, setGroupStates] = useState({
    WebCluster: true,
    DataLayer: true, 
    CriticalInfra: true
  })

  const toggleGroup = (groupName) => {
    const newState = !groupStates[groupName]
    setGroupStates(prev => ({
      ...prev,
      [groupName]: newState
    }))
    
    // Update the mapper if available
    if (mapperRef?.current && cyRef?.current) {
      mapperRef.current.setGroupVisibility(groupName, newState, cyRef.current)
    }
  }

  const setGroupColor = (groupName, color) => {
    if (mapperRef?.current && cyRef?.current) {
      mapperRef.current.setGroupColor(groupName, color, cyRef.current)
    }
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Group Hull Toggle Demo
      </Typography>
      
      {/* Controls */}
      <Box sx={{ mb: 2, p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>Hull Controls:</Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          {Object.entries(groupStates).map(([groupName, visible]) => (
            <FormControlLabel
              key={groupName}
              control={
                <Switch 
                  checked={visible}
                  onChange={() => toggleGroup(groupName)}
                />
              }
              label={groupName}
            />
          ))}
          
          {/* Color controls */}
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setGroupColor('WebCluster', '#FF9800')}
          >
            WebCluster → Orange
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setGroupColor('DataLayer', '#2196F3')}
          >
            DataLayer → Blue
          </Button>
          <Button 
            variant="outlined" 
            size="small"
            onClick={() => setGroupColor('CriticalInfra', '#F44336')}
          >
            CriticalInfra → Red
          </Button>
        </Stack>
      </Box>
      
      {/* Graph */}
      <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: 1 }}>
        <GraphViewerV2 
          nodes={TEST_NODES}
          edges={TEST_EDGES}
        />
      </Box>
    </Box>
  )
}

export default HullToggleDemo
/**
 * GraphViewer V2 Demo - Test the clean implementation
 */

import React from 'react'
import { Box, Typography } from '@mui/material'
import GraphViewerV2 from './GraphViewerV2.jsx'

// Comprehensive test data with edge cases - Neo4j numeric IDs
const TEST_NODES = [
  // Case 1: Multi-membership (system + group)
  {
    nodeId: 1001,
    title: 'Web Server 01',
    systems: ['Production'],
    groups: ['WebCluster']
  },
  {
    nodeId: 1002, 
    title: 'Web Server 02',
    systems: ['Production'],
    groups: ['WebCluster']
  },
  {
    nodeId: 1003,
    title: 'Database 01',
    systems: ['Production'],
    groups: []
  }
]

const TEST_EDGES = [
  // Production flow - Fixed edge targets
  {
    id: 'edge1',
    source: 1001, // Web Server 01
    target: 1003, // Database 01
    relationshipType: 'connects_to'
  },
  {
    id: 'edge2', 
    source: 1002, // Web Server 02  
    target: 1003, // Database 01
    relationshipType: 'connects_to'
  }
]

export const GraphViewerV2Demo = () => {
  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        GraphViewer V2 - Clean Implementation Demo
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Testing intelligent data mapping with compound nodes
      </Typography>
      
      <Box sx={{ flex: 1, border: '1px solid #ccc', borderRadius: 1 }}>
        <GraphViewerV2 
          nodes={TEST_NODES}
          edges={TEST_EDGES}
        />
      </Box>
    </Box>
  )
}

export default GraphViewerV2Demo
# System Module

## Overview
The System module provides functionality for grouping and managing nodes using Neo4j labels. It allows nodes to belong to multiple systems simultaneously, enabling flexible organization of IT infrastructure assets.

## Purpose
In IT asset management, assets often belong to multiple logical groupings:
- A web server might be part of both "ProdWebSystem" and "BackupInfra"
- A database could belong to "DatabaseCluster", "BackupInfra", and "MonitoringStack"
- Assets can be moved between systems during infrastructure changes

## Architecture

### SystemInterface
Defines the contract for system management operations:
- `addNodeToSystem(nodeId, systemLabel)` - Add a node to a system
- `removeNodeFromSystem(nodeId, systemLabel)` - Remove a node from a system  
- `getSystemNodes(systemLabel)` - Get all nodes in a system
- `getNodeSystems(nodeId)` - Get all systems a node belongs to
- `listSystems()` - Get all systems with node counts
- `systemExists(systemLabel)` - Check if a system exists
- `getSystemStats(systemLabel)` - Get detailed system statistics
- `moveNodesBetweenSystems(from, to, nodeIds)` - Bulk move nodes between systems

### SystemModel
Represents a system with metadata:
- `systemLabel` - The Neo4j label used for the system
- `displayName` - Human-readable name
- `description` - System description
- `nodeCount` - Number of nodes in the system
- `metadata` - Additional system information

### SystemService
Neo4j implementation of SystemInterface:
- Manages Neo4j label operations
- Validates system label formatting
- Provides statistics and analytics
- Handles bulk operations efficiently

## Usage Examples

### Creating Nodes with Systems
```javascript
import { NodeService } from '../node/NodeService.js'

const nodeService = new NodeService()

// Create node with initial systems
const server = await nodeService.createNode(
  'Server',
  { hostname: 'web01', ip: '10.0.1.5' },
  'Web Server',
  ['ProdWebSystem', 'BackupInfra']  // Multiple systems from creation
)
```

### Managing System Membership
```javascript
import { SystemService } from './SystemService.js'

const systemService = new SystemService()

// Add node to system
await systemService.addNodeToSystem(nodeId, 'DatabaseCluster')

// Remove from system
await systemService.removeNodeFromSystem(nodeId, 'BackupInfra')

// Get node's systems
const systems = await systemService.getNodeSystems(nodeId)
console.log(`Node belongs to: ${systems.join(', ')}`)
```

### System Analytics
```javascript
// List all systems
const systems = await systemService.listSystems()
systems.forEach(system => {
  console.log(`${system.systemLabel}: ${system.nodeCount} nodes`)
})

// Get detailed system stats
const stats = await systemService.getSystemStats('ProdWebSystem')
console.log(`Total nodes: ${stats.nodeCount}`)
stats.assetClassBreakdown?.forEach(breakdown => {
  console.log(`${breakdown.assetClass}: ${breakdown.nodeCount} nodes`)
})
```

### Bulk Operations
```javascript
// Move all nodes from old to new system
const result = await systemService.moveNodesBetweenSystems(
  'BackupInfra', 
  'BackupInfraV2'
)
console.log(`Migrated ${result.movedCount} nodes`)
```

## Neo4j Implementation Details

### Label Structure
Nodes have multiple labels combining AssetClass and System information:
```cypher
// Example node with multiple systems
(:Asset:Server:ProdWebSystem:BackupInfra {
  hostname: "web01",
  assetClassId: "Server",
  title: "Production Web Server"
})
```

### System Label Validation
System labels must:
- Start with a letter
- Contain only letters, numbers, and underscores
- Be non-empty strings
- Follow Neo4j label naming conventions

### Query Patterns
```cypher
-- Find all nodes in a system
MATCH (n:Asset:ProdWebSystem) RETURN n

-- Find nodes in multiple systems
MATCH (n:Asset:ProdWebSystem:BackupInfra) RETURN n

-- Get node's systems (filter out 'Asset' and AssetClass labels)
MATCH (n:Asset) WHERE id(n) = $nodeId
RETURN labels(n) as allLabels
```

## Demo
Run the system demo to see all functionality:
```bash
node src/system/demo.js
```

The demo demonstrates:
- Creating nodes with and without initial systems
- Adding/removing nodes from systems
- System analytics and statistics
- Bulk system migrations
- Error handling and validation

## Integration with Other Modules

### NodeInterface Integration
- Extended `createNode()` to accept optional `systems` parameter
- Validates system labels during node creation
- Maintains compatibility with existing node operations

### AssetClass Integration
- System labels are distinct from AssetClass labels
- Both can coexist on the same node
- System operations respect AssetClass constraints

## Status: ✅ Complete
- [x] SystemInterface defined
- [x] SystemModel implemented  
- [x] SystemService with full Neo4j integration
- [x] NodeInterface extended for system support
- [x] Comprehensive demo with real-world scenarios
- [x] Input validation and error handling
- [x] Documentation and examples

## Future Enhancements
- System metadata persistence (descriptions, owners, etc.)
- System hierarchies and relationships
- System-based access control
- Automated system assignment rules
- System health monitoring and alerting
# Group Module

The Group module provides flexible node organization and grouping capabilities that complement the existing System architecture. Groups enable visual clustering in Cytoscape.js compound nodes and can participate in relationships just like individual assets.

## Key Features

- **Flexible Grouping**: Create arbitrary collections of nodes with any groupType
- **Cytoscape.js Compatible**: Groups map to compound nodes for visual organization  
- **Relationship Participation**: Groups can be sources or targets of relationships
- **System Integration**: Groups can belong to Systems and be filtered by System
- **Rich Metadata**: Store custom properties and organizational data

## Core Components

### GroupInterface
Defines the contract for group operations with clear object parameter signatures:

```javascript
// Core group operations
async createGroup({groupName, groupType, description, metadata})
async getGroup({groupId})
async updateGroup({groupId, updates})
async deleteGroup({groupId})

// Membership management  
async addNodeToGroup({nodeId, groupId})
async removeNodeFromGroup({nodeId, groupId})
async getGroupMembers({groupId})
async getNodeGroups({nodeId})

// System-based filtering
async getGroupsInSystem({systemLabel})
async getGroupsWithMembersInSystem({systemLabel})
async getSystemGroupStats({systemLabel})
```

### GroupModel  
Represents group data with flexible metadata support:

```javascript
{
  groupId: "neo4j-id",
  groupName: "Web-Server-Cluster", 
  groupType: "CLUSTER", // Completely open
  description: "High-availability web server cluster",
  members: [nodeId1, nodeId2], // Populated via relationships
  metadata: {
    // Completely flexible properties
    environment: "production",
    owner: "web-team",
    failoverType: "active-passive"
  }
}
```

### GroupService
Neo4j-based implementation with advanced querying capabilities.

## Group Types (Examples)

Groups support any user-defined type. Common patterns:

- **CLUSTER** - High-availability groups (database clusters, web server pools)
- **FUNCTIONAL** - Functional groupings (payment-processing, user-auth)  
- **GEOGRAPHIC** - Location-based groups (us-east, eu-west)
- **INFRASTRUCTURE** - Infrastructure layers (network, storage, compute)
- **STATUS** - Operational states (maintenance, end-of-life, testing)
- **OWNERSHIP** - Team-based groupings (team-alpha, dba-team)

## Relationship Patterns

Groups participate in relationships just like individual assets:

```javascript
// Asset → Group: WebApp depends on Database-Cluster  
await relationshipService.createRelationship({
  fromId: webApp.nodeId,
  toId: dbCluster.groupId,
  fromType: 'Asset',
  toType: 'Group',
  relationshipType: 'DEPENDS_ON'
})

// Group → Asset: Database-Cluster hosted on DataCenter
await relationshipService.createRelationship({
  fromId: dbCluster.groupId, 
  toId: datacenter.nodeId,
  fromType: 'Group',
  toType: 'Asset',
  relationshipType: 'HOSTED_ON'
})

// Group → Group: Primary-Cluster replicates to Backup-Cluster
await relationshipService.createRelationship({
  fromId: primaryCluster.groupId,
  toId: backupCluster.groupId, 
  fromType: 'Group',
  toType: 'Group',
  relationshipType: 'REPLICATES_TO'
})
```

## System Integration

Groups complement the existing System architecture:

### Groups can belong to Systems
```javascript
// Groups can have system labels just like assets
CREATE (g:Group:NetworkInfra:CriticalSystems)
```

### System-based group filtering
```javascript
// Find groups directly in a system
const networkGroups = await groupService.getGroupsInSystem({
  systemLabel: 'NetworkInfra'
})

// Find groups that have members in a system
const groupsWithProdMembers = await groupService.getGroupsWithMembersInSystem({
  systemLabel: 'Production'
})

// Get system statistics including grouping effectiveness
const stats = await groupService.getSystemGroupStats({
  systemLabel: 'Production'
})
// Returns: directGroups, groupsWithMembers, groupedAssets, ungroupedAssets
```

### Advanced filtering
```javascript
// Multi-criteria filtering
const results = await groupService.getGroupsByCriteria({
  systemLabel: 'Production',
  groupType: 'CLUSTER', 
  hasMembers: true
})
```

## Cytoscape.js Integration

Groups map naturally to Cytoscape.js compound nodes:

```javascript
// Group becomes parent compound node
{
  data: {
    id: 'group-web-cluster',
    label: 'Web Server Cluster',
    type: 'group'
  },
  classes: 'group-node'
}

// Members become child nodes
{
  data: {
    id: 'web-server-1',
    parent: 'group-web-cluster', // Creates compound relationship
    label: 'Web Server 1'
  }
}

// Relationships can connect to groups
{
  data: {
    source: 'load-balancer',
    target: 'group-web-cluster', // Connect to group, not individual members
    label: 'DISTRIBUTES_TO'
  }
}
```

## Use Cases

### 1. Failover Groups
```javascript
const failoverGroup = await groupService.createGroup({
  groupName: 'DB-Primary-Secondary',
  groupType: 'FAILOVER',
  metadata: {
    failoverType: 'active-passive',
    autoFailover: true,
    priority: 'critical'
  }
})
```

### 2. Geographic Clustering  
```javascript
const regionGroup = await groupService.createGroup({
  groupName: 'US-East-Assets',
  groupType: 'GEOGRAPHIC',
  metadata: {
    region: 'us-east-1',
    datacenter: 'virginia'
  }
})
```

### 3. Functional Organization
```javascript
const apiGroup = await groupService.createGroup({
  groupName: 'Payment-API-Stack', 
  groupType: 'FUNCTIONAL',
  metadata: {
    domain: 'payments',
    team: 'payments-team',
    compliance: 'PCI-DSS'
  }
})
```

## Neo4j Schema

```cypher
// Group nodes with flexible properties
CREATE (g:Group {
  groupName: "Web-Server-Cluster",
  groupType: "CLUSTER",
  description: "...",
  metadata: "...", // JSON string
  createdBy: "system",
  createdDate: "2024-01-15T10:00:00Z",
  isActive: true
})

// Group membership relationships
CREATE (asset:Asset)-[:MEMBER_OF]->(g:Group)

// Groups can have system labels  
CREATE (g:Group:NetworkInfra:CriticalSystems)

// Groups participate in relationships
CREATE (app:Asset)-[:DEPENDS_ON]->(g:Group)
CREATE (g1:Group)-[:REPLICATES_TO]->(g2:Group)
```

## Benefits

### Organizational
- **Visual Clustering**: Compound nodes in graph visualization
- **Logical Organization**: Group related assets regardless of System boundaries
- **Flexible Taxonomy**: User-defined group types and metadata

### Operational  
- **Relationship Simplification**: Connect to group instead of individual nodes
- **System Analytics**: Track grouping effectiveness within Systems
- **Cross-System Organization**: Groups can span multiple Systems

### Technical
- **Cytoscape.js Ready**: Direct mapping to compound node structure
- **Relationship Capable**: Groups as first-class relationship participants  
- **System Compatible**: Works alongside existing System architecture
- **Scalable**: Efficient Neo4j queries with proper indexing

## Demo

Run the comprehensive demo to see all features:

```bash
node src/group/demo.js
```

The demo showcases:
- Group creation and membership
- Relationship patterns (Asset↔Group, Group↔Group)
- System-based filtering
- Cytoscape.js element structure  
- Real-world use case examples
import { GroupService } from './GroupService.js'
import { NodeService } from '../node/NodeService.js'
import { AssetClassService } from '../assetclass/AssetClassService.js'
import { RelationshipService } from '../relationship/RelationshipService.js'

async function groupDemo() {
  console.log('\n=== Group Management & Relationships Demo ===\n')
  
  const groupService = new GroupService()
  const nodeService = new NodeService()
  const assetClassService = new AssetClassService()
  const relationshipService = new RelationshipService()

  try {
    console.log('💡 Note: Groups complement Systems and can participate in relationships')
    console.log('   Groups are organizational helpers that can be connected like individual nodes\\n')
    
    // === Setup: Create AssetClass and Nodes ===
    console.log('1. Setting up demo assets...')
    
    // Ensure Server AssetClass exists
    let serverClass
    try {
      serverClass = await assetClassService.getAssetClass({className: 'Server'})
    } catch (error) {
      serverClass = await assetClassService.createAssetClass({
        className: 'Server',
        propertySchema: {
          hostname: { type: 'string' },
          ip: { type: 'string' },
          role: { type: 'string' }
        }
      })
    }

    // Create individual assets for grouping
    const webServer1 = await nodeService.createNode(
      'Server',
      { hostname: 'web01', ip: '10.0.1.10', role: 'primary' },
      'Web Server 1',
      ['ProdWebSystem']
    )
    
    const webServer2 = await nodeService.createNode(
      'Server',
      { hostname: 'web02', ip: '10.0.1.11', role: 'secondary' },
      'Web Server 2', 
      ['ProdWebSystem']
    )

    const loadBalancer = await nodeService.createNode(
      'Server',
      { hostname: 'lb01', ip: '10.0.1.5', role: 'load-balancer' },
      'Load Balancer',
      ['NetworkInfra']
    )

    const database = await nodeService.createNode(
      'Server',
      { hostname: 'db01', ip: '10.0.1.20', role: 'database' },
      'Database Server',
      ['DatabaseSystem']
    )

    console.log('   ✓ Created 4 individual assets')

    // === Group Creation ===
    console.log('\\n2. Creating groups for organization...')
    
    // Create a web server cluster group
    const webCluster = await groupService.createGroup({
      groupName: 'Web-Server-Cluster',
      groupType: 'CLUSTER',
      description: 'High-availability web server cluster',
      metadata: {
        environment: 'production',
        failoverType: 'active-passive',
        owner: 'web-team'
      }
    })

    // Create a backend services group  
    const backendGroup = await groupService.createGroup({
      groupName: 'Backend-Services',
      groupType: 'FUNCTIONAL',
      description: 'Core backend processing services',
      metadata: {
        criticality: 'high',
        backup: true,
        monitoring: '24x7'
      }
    })

    console.log('   ✓ Created Web-Server-Cluster group')
    console.log('   ✓ Created Backend-Services group')

    // === Group Membership ===
    console.log('\\n3. Adding assets to groups...')
    
    await groupService.addNodeToGroup({nodeId: webServer1.nodeId, groupId: webCluster.groupId})
    await groupService.addNodeToGroup({nodeId: webServer2.nodeId, groupId: webCluster.groupId})
    await groupService.addNodeToGroup({nodeId: database.nodeId, groupId: backendGroup.groupId})

    console.log('   ✓ Added web servers to Web-Server-Cluster')
    console.log('   ✓ Added database to Backend-Services')

    // Show group memberships
    const webClusterMembers = await groupService.getGroupMembers({groupId: webCluster.groupId})
    const backendMembers = await groupService.getGroupMembers({groupId: backendGroup.groupId})

    console.log('\\n📊 Group Memberships:')
    console.log('====================')
    console.log(`\\n🌐 ${webCluster.groupName}:`)
    webClusterMembers.forEach(member => {
      console.log(`   • ${member.title} (${member.properties.hostname})`)
    })

    console.log(`\\n🔧 ${backendGroup.groupName}:`)
    backendMembers.forEach(member => {
      console.log(`   • ${member.title} (${member.properties.hostname})`)
    })

    // === Group Relationships ===
    console.log('\\n4. Creating relationships involving groups...')

    // Load Balancer distributes to Web Server Cluster (individual -> group)
    const lbToCluster = await relationshipService.createRelationship({
      fromId: loadBalancer.nodeId,
      toId: webCluster.groupId,
      fromType: 'Asset',
      toType: 'Group',
      relationshipType: 'DISTRIBUTES_TO',
      properties: {
        algorithm: 'round-robin',
        healthCheck: true,
        timeout: 30
      }
    })

    // Web Server Cluster depends on Backend Services (group -> group)  
    const clusterToBackend = await relationshipService.createRelationship({
      fromId: webCluster.groupId,
      toId: backendGroup.groupId,
      fromType: 'Group',
      toType: 'Group', 
      relationshipType: 'DEPENDS_ON',
      properties: {
        dependency: 'database-access',
        critical: true
      }
    })

    console.log('   ✓ Load Balancer DISTRIBUTES_TO Web-Server-Cluster')
    console.log('   ✓ Web-Server-Cluster DEPENDS_ON Backend-Services')

    // === Relationship Analysis ===
    console.log('\\n5. Analyzing group relationships...')

    // Show all relationships FROM the web cluster
    const webClusterOutgoing = await relationshipService.getRelationshipsFrom({
      nodeId: webCluster.groupId, 
      nodeType: 'Group'
    })
    
    // Show all relationships TO the web cluster
    const webClusterIncoming = await relationshipService.getRelationshipsTo({
      nodeId: webCluster.groupId,
      nodeType: 'Group'
    })

    console.log(`\\n🔗 Web-Server-Cluster Relationships:`)
    console.log(`   Outgoing (${webClusterOutgoing.length}):`)
    webClusterOutgoing.forEach(rel => {
      console.log(`   • ${rel.relationshipType} -> ${rel.toType}:${rel.toId}`)
      if (Object.keys(rel.properties).length > 0) {
        console.log(`     Properties: ${JSON.stringify(rel.properties)}`)
      }
    })

    console.log(`   Incoming (${webClusterIncoming.length}):`)
    webClusterIncoming.forEach(rel => {
      console.log(`   • ${rel.fromType}:${rel.fromId} -${rel.relationshipType}->`)
      if (Object.keys(rel.properties).length > 0) {
        console.log(`     Properties: ${JSON.stringify(rel.properties)}`)
      }
    })

    // === Mixed Relationships Demo ===
    console.log('\\n6. Creating mixed relationships (individual assets to groups)...')

    // Database server provides services to the web cluster
    const dbToCluster = await relationshipService.createRelationship({
      fromId: database.nodeId,
      toId: webCluster.groupId,
      fromType: 'Asset',
      toType: 'Group',
      relationshipType: 'PROVIDES_DATA_TO',
      properties: {
        protocol: 'TCP',
        port: 5432,
        ssl: true
      }
    })

    console.log('   ✓ Database Server PROVIDES_DATA_TO Web-Server-Cluster')

    // === Cytoscape.js Visualization Example ===
    console.log('\\n7. Cytoscape.js compound node structure...')
    
    // Show how this would map to Cytoscape.js elements
    console.log(`\\n📐 Cytoscape.js Elements Structure:`)
    console.log(`   // Parent compound nodes (groups)`)
    console.log(`   { data: { id: '${webCluster.groupId}', label: '${webCluster.groupName}', type: 'group' }}`)
    console.log(`   { data: { id: '${backendGroup.groupId}', label: '${backendGroup.groupName}', type: 'group' }}`)
    console.log()
    console.log(`   // Child nodes (group members)`)
    webClusterMembers.forEach(member => {
      console.log(`   { data: { id: '${member.nodeId}', parent: '${webCluster.groupId}', label: '${member.title}' }}`)
    })
    backendMembers.forEach(member => {
      console.log(`   { data: { id: '${member.nodeId}', parent: '${backendGroup.groupId}', label: '${member.title}' }}`)
    })
    console.log()
    console.log(`   // Relationships (including group-level connections)`)
    const allRelationships = [
      ...webClusterOutgoing,
      ...webClusterIncoming,
      ...(await relationshipService.getRelationshipsFrom({nodeId: backendGroup.groupId, nodeType: 'Group'}))
    ]

    // Remove duplicates
    const uniqueRels = allRelationships.filter((rel, index, self) => 
      index === self.findIndex(r => r.relationshipId === rel.relationshipId)
    )

    uniqueRels.forEach(rel => {
      console.log(`   { data: { source: '${rel.fromId}', target: '${rel.toId}', label: '${rel.relationshipType}' }}`)
    })

    // === Group Statistics ===
    console.log('\\n8. Group and relationship statistics...')
    
    const allGroups = await groupService.getAllGroups()
    const relationshipStats = await relationshipService.getRelationshipStats()

    console.log(`\\n📈 Statistics:`)
    console.log(`   Total Groups: ${allGroups.length}`)
    console.log(`   Group Types: ${[...new Set(allGroups.map(g => g.groupType))].join(', ')}`)
    console.log(`   `)
    console.log(`   Relationship Types:`)
    relationshipStats.forEach(stat => {
      console.log(`   • ${stat.relationshipType}: ${stat.count} (${stat.fromType} -> ${stat.toType})`)
    })

    // === System-Based Group Filtering ===
    console.log('\\n9. System-based group filtering...')

    // Add some groups directly to systems (groups can have system labels)
    const networkGroup = await groupService.createGroup({
      groupName: 'Network-Infrastructure',
      groupType: 'INFRASTRUCTURE',
      description: 'Core network components'
    })

    // Add load balancer to this group and make the group part of NetworkInfra system
    await groupService.addNodeToGroup({nodeId: loadBalancer.nodeId, groupId: networkGroup.groupId})
    
    // We'll simulate system labels by using Neo4j directly to add system labels to groups
    const session = groupService.neo4jService.getSession()
    try {
      await session.run(
        `MATCH (g:Group) WHERE id(g) = $groupId SET g:NetworkInfra`,
        { groupId: groupService.neo4jService.int(networkGroup.groupId) }
      )
    } finally {
      await session.close()
    }

    console.log('   ✓ Created Network-Infrastructure group in NetworkInfra system')

    // Test 1: Find groups directly in a system
    console.log('\\n   Finding groups directly in NetworkInfra system:')
    const groupsInNetworkInfra = await groupService.getGroupsInSystem({systemLabel: 'NetworkInfra'})
    groupsInNetworkInfra.forEach(group => {
      console.log(`   • ${group.groupName} (${group.groupType}) - ${group.members.length} members`)
    })

    // Test 2: Find groups that have members in ProdWebSystem
    console.log('\\n   Finding groups with members in ProdWebSystem:')
    const groupsWithWebMembers = await groupService.getGroupsWithMembersInSystem({systemLabel: 'ProdWebSystem'})
    groupsWithWebMembers.forEach(group => {
      console.log(`   • ${group.groupName}: ${group.systemMemberCount}/${group.totalMemberCount} members in ProdWebSystem`)
    })

    // Test 3: Get comprehensive system statistics  
    console.log('\\n   System group statistics for ProdWebSystem:')
    const webSystemStats = await groupService.getSystemGroupStats({systemLabel: 'ProdWebSystem'})
    console.log(`   📊 System: ${webSystemStats.systemLabel}`)
    console.log(`      • Groups directly in system: ${webSystemStats.directGroups}`)
    console.log(`      • Groups with members in system: ${webSystemStats.groupsWithMembers}`)
    console.log(`      • Total assets in system: ${webSystemStats.totalSystemAssets}`)
    console.log(`      • Grouped assets in system: ${webSystemStats.groupedSystemAssets}`)
    console.log(`      • Ungrouped assets in system: ${webSystemStats.ungroupedSystemAssets}`)
    
    if (webSystemStats.groupDetails.length > 0) {
      console.log(`      • Group breakdown:`)
      webSystemStats.groupDetails.forEach(detail => {
        console.log(`        - ${detail.groupName} (${detail.groupType}): ${detail.systemMemberCount} members`)
      })
    }

    // Test 4: Advanced criteria-based filtering
    console.log('\\n   Advanced group filtering examples:')
    
    // Find all CLUSTER type groups
    const clusterGroups = await groupService.getGroupsByCriteria({groupType: 'CLUSTER'})
    console.log(`   • CLUSTER groups: ${clusterGroups.map(g => g.groupName).join(', ')}`)
    
    // Find groups in NetworkInfra system that have members
    const networkGroupsWithMembers = await groupService.getGroupsByCriteria({
      systemLabel: 'NetworkInfra', 
      hasMembers: true
    })
    console.log(`   • NetworkInfra groups with members: ${networkGroupsWithMembers.map(g => g.groupName).join(', ')}`)

    // === Use Case Examples ===
    console.log('\\n10. Real-world use cases for system-group filtering...')
    console.log(`\\n📋 Common scenarios:`)
    console.log(`   🔍 "Show me all database clusters in the Production system"`)
    console.log(`      → getGroupsByCriteria({systemLabel: 'Production', groupType: 'CLUSTER'})`)
    console.log()
    console.log(`   🔍 "Which groups have assets that need maintenance in DR system?"`)  
    console.log(`      → getGroupsWithMembersInSystem({systemLabel: 'DisasterRecovery'})`)
    console.log()
    console.log(`   🔍 "System health: how many assets are grouped vs ungrouped in Production?"`)
    console.log(`      → getSystemGroupStats({systemLabel: 'Production'})`)
    console.log()
    console.log(`   🔍 "Show empty groups that need cleanup in Development system"`) 
    console.log(`      → getGroupsByCriteria({systemLabel: 'Development', hasMembers: false})`)

    // === Demonstrate Group Benefits ===
    console.log('\\n11. Benefits of groups for large systems...')
    console.log(`\\n💡 Groups provide several advantages:`)
    console.log(`   ✅ Visual organization - Compound nodes in Cytoscape.js`)
    console.log(`   ✅ Logical clustering - Related assets grouped together`) 
    console.log(`   ✅ Relationship simplification - Connect to group instead of individual nodes`)
    console.log(`   ✅ System integration - Groups can belong to Systems too`)
    console.log(`   ✅ System filtering - Find groups within specific systems`)
    console.log(`   ✅ Flexible metadata - Store group-specific properties`)
    console.log(`   ✅ Easy sharing - Move entire groups between systems`)
    console.log(`   ✅ System analytics - Track grouping effectiveness per system`)

    console.log('\\n=== Demo Complete ===')
    console.log('Groups successfully created and integrated with relationship system!')

  } catch (error) {
    console.error('Demo failed:', error)
    throw error
  } finally {
    // Cleanup
    await groupService.close()
    await nodeService.close()
    await assetClassService.close()
    await relationshipService.close()
    // Close Neo4j connection for demo cleanup
    const { Neo4jService } = await import('../database/Neo4jService.js')
    const neo4jService = Neo4jService.getInstance()
    await neo4jService.close()
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  groupDemo()
    .then(() => {
      console.log('\\nDemo completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\\nDemo failed:', error)
      process.exit(1)
    })
}

export { groupDemo }
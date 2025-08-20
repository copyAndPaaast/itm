import { AssetClassService } from '../NodeModule/assetclass/AssetClassService.js'
import { NodeService } from '../NodeModule/node/NodeService.js'
import { GroupService } from '../group/GroupService.js'
import { SystemService } from '../system/SystemService.js'

async function membershipQueryDemo() {
  console.log('\n=== Node Membership Query Demo ===\n')
  
  const assetClassService = new AssetClassService()
  const nodeService = new NodeService()
  const groupService = new GroupService()
  const systemService = new SystemService()

  try {
    console.log('💡 Note: Nodes need to query their group and system memberships for display')
    console.log('   This demo shows how nodes can discover their memberships\n')
    
    // === Setup: Create AssetClass ===
    console.log('1. Setting up demo assets...')
    
    let serverClass
    try {
      const exists = await assetClassService.assetClassExists({className: 'DemoServer'})
      if (!exists) {
        serverClass = await assetClassService.createAssetClass({
          className: 'DemoServer',
          propertySchema: {
            hostname: { type: 'string', required: true },
            ip: { type: 'string', required: true },
            role: { type: 'string', required: false }
          }
        })
        console.log('   ✓ Created DemoServer AssetClass')
      } else {
        serverClass = await assetClassService.getAssetClass({className: 'DemoServer'})
        console.log('   ✓ Using existing DemoServer AssetClass')
      }
    } catch (error) {
      console.log('   ⚠ AssetClass setup error:', error.message)
      return
    }

    // === Create Test Nodes ===
    console.log('\n2. Creating test nodes with different system memberships...')
    
    // Node 1: Web server in multiple systems
    const webServer = await nodeService.createNode(
      serverClass.classId,
      {
        hostname: 'web-server-01',
        ip: '10.0.1.10',
        role: 'web'
      },
      'Web Server Node',
      ['ProdWebSystem', 'MonitoringSystem', 'BackupSystem']
    )
    console.log(`   ✓ Created web server (ID: ${webServer.nodeId}) with 3 systems`)

    // Node 2: Database server in fewer systems
    const dbServer = await nodeService.createNode(
      serverClass.classId,
      {
        hostname: 'db-server-01',
        ip: '10.0.1.20',
        role: 'database'
      },
      'Database Server Node',
      ['DatabaseSystem']
    )
    console.log(`   ✓ Created database server (ID: ${dbServer.nodeId}) with 1 system`)

    // Node 3: Standalone server (no additional systems)
    const standaloneServer = await nodeService.createNode(
      serverClass.classId,
      {
        hostname: 'standalone-01',
        ip: '10.0.1.30',
        role: 'standalone'
      },
      'Standalone Server Node'
    )
    console.log(`   ✓ Created standalone server (ID: ${standaloneServer.nodeId}) with no additional systems`)

    // === Create Test Groups ===
    console.log('\n3. Creating test groups and adding nodes...')

    let webClusterGroup, infrastructureGroup
    
    try {
      const webExists = await groupService.groupExists('Web-Cluster-Demo')
      if (!webExists) {
        webClusterGroup = await groupService.createGroup({
          groupName: 'Web-Cluster-Demo',
          groupType: 'CLUSTER',
          description: 'Demo web server cluster'
        })
        console.log(`   ✓ Created web cluster group (ID: ${webClusterGroup.groupId})`)
      } else {
        webClusterGroup = await groupService.getGroupByName({groupName: 'Web-Cluster-Demo'})
        console.log(`   ✓ Using existing web cluster group (ID: ${webClusterGroup.groupId})`)
      }
    } catch (error) {
      console.log('   ⚠ Web cluster group setup error:', error.message)
      return
    }

    try {
      const infraExists = await groupService.groupExists('Infrastructure-Demo')
      if (!infraExists) {
        infrastructureGroup = await groupService.createGroup({
          groupName: 'Infrastructure-Demo',
          groupType: 'INFRASTRUCTURE',
          description: 'Demo infrastructure group'
        })
        console.log(`   ✓ Created infrastructure group (ID: ${infrastructureGroup.groupId})`)
      } else {
        infrastructureGroup = await groupService.getGroupByName({groupName: 'Infrastructure-Demo'})
        console.log(`   ✓ Using existing infrastructure group (ID: ${infrastructureGroup.groupId})`)
      }
    } catch (error) {
      console.log('   ⚠ Infrastructure group setup error:', error.message)
      return
    }

    // Add nodes to groups
    await groupService.addNodeToGroup({nodeId: webServer.nodeId, groupId: webClusterGroup.groupId})
    await groupService.addNodeToGroup({nodeId: dbServer.nodeId, groupId: infrastructureGroup.groupId})
    await groupService.addNodeToGroup({nodeId: webServer.nodeId, groupId: infrastructureGroup.groupId})
    
    console.log('   ✓ Added web server to both groups')
    console.log('   ✓ Added database server to infrastructure group')
    console.log('   ✓ Standalone server remains ungrouped')

    // === Demo 1: System Membership Queries ===
    console.log('\n4. Querying system memberships...')

    console.log('\n🏷️  Web Server System Membership:')
    const webSystemSummary = await nodeService.getNodeSystemSummary({nodeId: webServer.nodeId})
    console.log(`   Title: ${webSystemSummary.displayInfo.title}`)
    console.log(`   Asset Type: ${webSystemSummary.displayInfo.assetType}`)
    console.log(`   Systems: ${webSystemSummary.displayInfo.systems}`)
    console.log(`   System Count: ${webSystemSummary.systemCount}`)
    console.log(`   All Labels: [${webSystemSummary.allLabels.join(', ')}]`)

    console.log('\n🏷️  Database Server System Membership:')
    const dbSystemSummary = await nodeService.getNodeSystemSummary({nodeId: dbServer.nodeId})
    console.log(`   Title: ${dbSystemSummary.displayInfo.title}`)
    console.log(`   Asset Type: ${dbSystemSummary.displayInfo.assetType}`)
    console.log(`   Systems: ${dbSystemSummary.displayInfo.systems}`)
    console.log(`   System Count: ${dbSystemSummary.systemCount}`)

    console.log('\n🏷️  Standalone Server System Membership:')
    const standaloneSystemSummary = await nodeService.getNodeSystemSummary({nodeId: standaloneServer.nodeId})
    console.log(`   Title: ${standaloneSystemSummary.displayInfo.title}`)
    console.log(`   Asset Type: ${standaloneSystemSummary.displayInfo.assetType}`)
    console.log(`   Systems: ${standaloneSystemSummary.displayInfo.systems}`)
    console.log(`   System Count: ${standaloneSystemSummary.systemCount}`)

    // === Demo 2: Group Membership Queries ===
    console.log('\n5. Querying group memberships...')

    console.log('\n👥 Web Server Group Membership:')
    const webGroupSummary = await groupService.getNodeGroupSummary({nodeId: webServer.nodeId})
    console.log(`   Group Count: ${webGroupSummary.groupCount}`)
    console.log(`   Has Groups: ${webGroupSummary.hasGroups}`)
    if (webGroupSummary.hasGroups) {
      console.log(`   Group Names: [${webGroupSummary.groupNames.join(', ')}]`)
      console.log(`   Group Types: [${webGroupSummary.groupTypes.join(', ')}]`)
    }

    console.log('\n👥 Database Server Group Membership:')
    const dbGroupSummary = await groupService.getNodeGroupSummary({nodeId: dbServer.nodeId})
    console.log(`   Group Count: ${dbGroupSummary.groupCount}`)
    console.log(`   Has Groups: ${dbGroupSummary.hasGroups}`)
    if (dbGroupSummary.hasGroups) {
      console.log(`   Group Names: [${dbGroupSummary.groupNames.join(', ')}]`)
    }

    console.log('\n👥 Standalone Server Group Membership:')
    const standaloneGroupSummary = await groupService.getNodeGroupSummary({nodeId: standaloneServer.nodeId})
    console.log(`   Group Count: ${standaloneGroupSummary.groupCount}`)
    console.log(`   Has Groups: ${standaloneGroupSummary.hasGroups}`)

    // === Demo 3: Combined Membership Summary ===
    console.log('\n6. Combined membership summaries for display...')

    console.log('\n📊 Web Server Complete Membership:')
    const webCompleteSummary = await nodeService.getNodeMembershipSummary({nodeId: webServer.nodeId})
    console.log(`   Title: ${webCompleteSummary.displaySummary.title}`)
    console.log(`   Asset Type: ${webCompleteSummary.displaySummary.assetType}`)
    console.log(`   System Membership: ${webCompleteSummary.displaySummary.systemMembership}`)
    console.log(`   Group Membership: ${webCompleteSummary.displaySummary.groupMembership}`)
    console.log(`   Total Memberships: ${webCompleteSummary.displaySummary.totalMemberships}`)

    console.log('\n📊 Database Server Complete Membership:')
    const dbCompleteSummary = await nodeService.getNodeMembershipSummary({nodeId: dbServer.nodeId})
    console.log(`   Title: ${dbCompleteSummary.displaySummary.title}`)
    console.log(`   Asset Type: ${dbCompleteSummary.displaySummary.assetType}`)
    console.log(`   System Membership: ${dbCompleteSummary.displaySummary.systemMembership}`)
    console.log(`   Group Membership: ${dbCompleteSummary.displaySummary.groupMembership}`)
    console.log(`   Total Memberships: ${dbCompleteSummary.displaySummary.totalMemberships}`)

    console.log('\n📊 Standalone Server Complete Membership:')
    const standaloneCompleteSummary = await nodeService.getNodeMembershipSummary({nodeId: standaloneServer.nodeId})
    console.log(`   Title: ${standaloneCompleteSummary.displaySummary.title}`)
    console.log(`   Asset Type: ${standaloneCompleteSummary.displaySummary.assetType}`)
    console.log(`   System Membership: ${standaloneCompleteSummary.displaySummary.systemMembership}`)
    console.log(`   Group Membership: ${standaloneCompleteSummary.displaySummary.groupMembership}`)
    console.log(`   Total Memberships: ${standaloneCompleteSummary.displaySummary.totalMemberships}`)

    // === Demo 4: Specific Membership Checks ===
    console.log('\n7. Testing specific membership checks...')

    // Check if web server is in specific system
    const webInProdSystem = await nodeService.isNodeInSystem({
      nodeId: webServer.nodeId,
      systemLabel: 'ProdWebSystem'
    })
    console.log(`   ✓ Web server in ProdWebSystem: ${webInProdSystem}`)

    const webInDatabaseSystem = await nodeService.isNodeInSystem({
      nodeId: webServer.nodeId,
      systemLabel: 'DatabaseSystem'
    })
    console.log(`   ✓ Web server in DatabaseSystem: ${webInDatabaseSystem}`)

    // Check if web server is in specific group
    const webInClusterGroup = await groupService.isNodeInGroup({
      nodeId: webServer.nodeId,
      groupId: webClusterGroup.groupId
    })
    console.log(`   ✓ Web server in Web-Cluster-Demo: ${webInClusterGroup}`)

    const dbInClusterGroup = await groupService.isNodeInGroup({
      nodeId: dbServer.nodeId,
      groupId: webClusterGroup.groupId
    })
    console.log(`   ✓ Database server in Web-Cluster-Demo: ${dbInClusterGroup}`)

    // === Demo 5: Using NodeModel Methods Directly ===
    console.log('\n8. Using NodeModel methods for direct label access...')

    console.log('\n🔍 Web Server Label Analysis:')
    console.log(`   Asset Class Name: ${webServer.getAssetClassName()}`)
    console.log(`   System Labels: [${webServer.getSystemLabels().join(', ')}]`)
    console.log(`   All Labels: [${webServer.labels.join(', ')}]`)

    console.log('\n🔍 Standalone Server Label Analysis:')
    console.log(`   Asset Class Name: ${standaloneServer.getAssetClassName()}`)
    console.log(`   System Labels: [${standaloneServer.getSystemLabels().join(', ')}]`)
    console.log(`   All Labels: [${standaloneServer.labels.join(', ')}]`)

    // === Demo 6: Display-Ready Information ===
    console.log('\n9. Display-ready membership information...')

    const allNodes = [
      { node: webServer, name: 'Web Server' },
      { node: dbServer, name: 'Database Server' },
      { node: standaloneServer, name: 'Standalone Server' }
    ]

    console.log('\n📋 Membership Summary Table:')
    console.log('┌─────────────────────────┬─────────────────────────┬─────────────────────────┬───────────┐')
    console.log('│ Node                    │ Systems                 │ Groups                  │ Total     │')
    console.log('├─────────────────────────┼─────────────────────────┼─────────────────────────┼───────────┤')

    for (const {node, name} of allNodes) {
      const summary = await nodeService.getNodeMembershipSummary({nodeId: node.nodeId})
      const systemsText = summary.systems.hasSystems ? 
        summary.systems.systems.slice(0, 2).join(', ') + (summary.systems.systems.length > 2 ? '...' : '') :
        'None'
      const groupsText = summary.groups.hasGroups ?
        summary.groups.groupNames.slice(0, 2).join(', ') + (summary.groups.groupNames.length > 2 ? '...' : '') :
        'None'
      
      console.log(`│ ${name.padEnd(23)} │ ${systemsText.padEnd(23)} │ ${groupsText.padEnd(23)} │ ${summary.displaySummary.totalMemberships.toString().padEnd(9)} │`)
    }
    console.log('└─────────────────────────┴─────────────────────────┴─────────────────────────┴───────────┘')

    // === Demo 7: Use Cases for UI ===
    console.log('\n10. Common UI use cases...')

    console.log('\n💻 Use Case Examples:')
    console.log('   🔍 "Show me which systems this node belongs to"')
    console.log('      → nodeService.getNodeSystems({nodeId})')
    console.log()
    console.log('   🔍 "Show me which groups this node is part of"')
    console.log('      → groupService.getNodeGroups({nodeId})')
    console.log()
    console.log('   🔍 "Is this node in the Production system?"')
    console.log('      → nodeService.isNodeInSystem({nodeId, systemLabel: "Production"})')
    console.log()
    console.log('   🔍 "Display node card with all memberships"')
    console.log('      → nodeService.getNodeMembershipSummary({nodeId})')
    console.log()
    console.log('   🔍 "Quick system labels from node object"')
    console.log('      → node.getSystemLabels()')

    console.log('\n=== Demo Complete ===')
    console.log('Node membership query functionality demonstrated successfully!')

  } catch (error) {
    console.error('Demo failed:', error)
    throw error
  } finally {
    // Cleanup
    await assetClassService.close()
    await nodeService.close()
    await groupService.close()
    await systemService.close()
    // Close Neo4j connection for demo cleanup
    const { Neo4jService } = await import('../database/Neo4jService.js')
    const neo4jService = Neo4jService.getInstance()
    await neo4jService.close()
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  membershipQueryDemo()
    .then(() => {
      console.log('\nMembership query demo completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nMembership query demo failed:', error)
      process.exit(1)
    })
}

export { membershipQueryDemo }
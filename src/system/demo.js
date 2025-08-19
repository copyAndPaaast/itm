import { SystemService } from './SystemService.js'
import { NodeService } from '../node/NodeService.js'
import { AssetClassService } from '../assetclass/AssetClassService.js'

async function systemDemo() {
  console.log('\n=== System Management Demo ===\n')
  
  const systemService = new SystemService()
  const nodeService = new NodeService()
  const assetClassService = new AssetClassService()

  try {
    console.log('💡 Note: SystemService uses centralized Neo4jService for database connections')
    console.log('   Run `node src/database/demo.js` to see Neo4j connection management demo\n')
    
    // === Setup: Create AssetClass and Nodes ===
    console.log('1. Setting up demo data...')
    
    // Create Server AssetClass if it doesn't exist
    let serverClass
    try {
      serverClass = await assetClassService.getAssetClass('Server')
      if (!serverClass) {
        serverClass = await assetClassService.createAssetClass(
          'Server',
          'Physical or virtual server',
          {
            hostname: { type: 'string', required: true },
            ip: { type: 'string', required: true },
            os: { type: 'string', required: false }
          }
        )
        console.log('   ✓ Created Server AssetClass')
      } else {
        console.log('   ✓ Using existing Server AssetClass')
      }
    } catch (error) {
      console.log('   ⚠ AssetClass setup error:', error.message)
      return
    }

    // Create nodes with different system combinations
    const nodes = []
    
    // Node 1: Web server in ProdWebSystem
    const webServer = await nodeService.createNode(
      'Server',
      { hostname: 'web01', ip: '10.0.1.5', os: 'Ubuntu 20.04' },
      'Production Web Server',
      ['ProdWebSystem']
    )
    nodes.push({ node: webServer, name: 'Web Server' })
    console.log('   ✓ Created web server in ProdWebSystem')

    // Node 2: Database server without initial system
    const dbServer = await nodeService.createNode(
      'Server',
      { hostname: 'db01', ip: '10.0.1.10', os: 'Ubuntu 20.04' },
      'Database Server'
    )
    nodes.push({ node: dbServer, name: 'Database Server' })
    console.log('   ✓ Created database server without system')

    // Node 3: Load balancer in multiple systems
    const loadBalancer = await nodeService.createNode(
      'Server',
      { hostname: 'lb01', ip: '10.0.1.15', os: 'Ubuntu 20.04' },
      'Load Balancer',
      ['ProdWebSystem', 'NetworkInfra']
    )
    nodes.push({ node: loadBalancer, name: 'Load Balancer' })
    console.log('   ✓ Created load balancer in multiple systems')

    console.log(`   Created ${nodes.length} demo nodes\n`)

    // === System Operations Demo ===
    console.log('2. Demonstrating system operations...\n')

    // Add database server to BackupInfra system
    console.log('   Adding database server to BackupInfra system...')
    await systemService.addNodeToSystem(dbServer.nodeId, 'BackupInfra')
    console.log('   ✓ Database server added to BackupInfra\n')

    // Add database server to DatabaseCluster as well
    console.log('   Adding database server to DatabaseCluster system...')
    await systemService.addNodeToSystem(dbServer.nodeId, 'DatabaseCluster')
    console.log('   ✓ Database server added to DatabaseCluster\n')

    // Show all systems
    console.log('   Current systems in the graph:')
    const systems = await systemService.listSystems()
    systems.forEach(system => {
      console.log(`   - ${system.systemLabel}: ${system.nodeCount} nodes`)
    })
    console.log()

    // Show nodes in specific systems
    console.log('   Nodes in ProdWebSystem:')
    const prodWebNodes = await systemService.getSystemNodes('ProdWebSystem')
    prodWebNodes.forEach(node => {
      console.log(`   - ${node.properties.hostname} (${node.properties.title})`)
    })
    console.log()

    // Show systems for specific node
    console.log('   Systems for database server:')
    const dbSystems = await systemService.getNodeSystems(dbServer.nodeId)
    dbSystems.forEach(system => {
      console.log(`   - ${system}`)
    })
    console.log()

    // Get detailed stats for a system
    console.log('   Detailed stats for ProdWebSystem:')
    const prodWebStats = await systemService.getSystemStats('ProdWebSystem')
    console.log(`   - Total nodes: ${prodWebStats.nodeCount}`)
    if (prodWebStats.assetClassBreakdown) {
      prodWebStats.assetClassBreakdown.forEach(breakdown => {
        console.log(`   - ${breakdown.assetClass}: ${breakdown.nodeCount} nodes`)
      })
    }
    console.log()

    // Move load balancer from NetworkInfra to SecurityTools
    console.log('   Moving load balancer from NetworkInfra to SecurityTools...')
    await systemService.removeNodeFromSystem(loadBalancer.nodeId, 'NetworkInfra')
    await systemService.addNodeToSystem(loadBalancer.nodeId, 'SecurityTools')
    console.log('   ✓ Load balancer moved to SecurityTools\n')

    // Show updated systems for load balancer
    console.log('   Updated systems for load balancer:')
    const lbSystems = await systemService.getNodeSystems(loadBalancer.nodeId)
    lbSystems.forEach(system => {
      console.log(`   - ${system}`)
    })
    console.log()

    // === System Workflow Demo ===
    console.log('3. Demonstrating real-world workflows...\n')

    // Scenario: Infrastructure migration
    console.log('   Scenario: Migrating all BackupInfra nodes to BackupInfraV2...')
    const migrationResult = await systemService.moveNodesBetweenSystems('BackupInfra', 'BackupInfraV2')
    console.log(`   ✓ Migrated ${migrationResult.movedCount} nodes from ${migrationResult.fromSystem} to ${migrationResult.toSystem}\n`)

    // Final system overview
    console.log('   Final system overview:')
    const finalSystems = await systemService.listSystems()
    finalSystems.forEach(system => {
      console.log(`   - ${system.systemLabel}: ${system.nodeCount} nodes`)
    })
    console.log()

    // === Edge Cases Demo ===
    console.log('4. Testing edge cases and validation...\n')

    try {
      await systemService.addNodeToSystem(999999, 'TestSystem')
    } catch (error) {
      console.log('   ✓ Correctly handled non-existent node:', error.message)
    }

    try {
      await systemService.addNodeToSystem(webServer.nodeId, 'Invalid-System-Name!')
    } catch (error) {
      console.log('   ✓ Correctly validated system label format:', error.message)
    }

    try {
      await systemService.addNodeToSystem(webServer.nodeId, '')
    } catch (error) {
      console.log('   ✓ Correctly handled empty system label:', error.message)
    }

    console.log('\n=== Demo Complete ===')
    console.log('System management functionality demonstrated successfully!')

  } catch (error) {
    console.error('Demo failed:', error)
    throw error
  } finally {
    // Cleanup
    await systemService.close()
    await nodeService.close()
    await assetClassService.close()
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  systemDemo()
    .then(() => {
      console.log('\nDemo completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nDemo failed:', error)
      process.exit(1)
    })
}

export { systemDemo }
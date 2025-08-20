import { NodeFactory } from '../NodeModule/node/NodeFactory.js'
import { SystemService } from '../system/SystemService.js'
import { AssetClassService } from '../NodeModule/assetclass/AssetClassService.js'

async function runNodeDemo() {
  const factory = new NodeFactory()
  const systemService = new SystemService()
  const assetClassService = new AssetClassService()
  
  try {
    console.log('Creating IT Asset Nodes using AssetClass-based NodeFactory...')
    console.log('===========================================================')
    
    console.log('💡 Note: All services now use centralized Neo4jService for database connections')
    console.log('   Run `node src/database/demo.js` to see Neo4j connection management demo\n')
    
    // === Setup: Create AssetClasses first ===
    console.log('\n1. Setting up AssetClass definitions...')
    
    let serverClass, databaseClass, networkDeviceClass
    
    try {
      // Check if Server AssetClass exists, create if not
      const serverExists = await assetClassService.assetClassExists({className: 'Server'})
      if (!serverExists) {
        serverClass = await assetClassService.createAssetClass({
          className: 'Server',
          propertySchema: {
            hostname: { type: 'string', required: true },
            ip_address: { type: 'string', required: true },
            os: { type: 'string', required: false },
            cpu_cores: { type: 'number', required: false },
            memory_gb: { type: 'number', required: false },
            is_virtual: { type: 'boolean', required: false },
            datacenter: { type: 'string', required: false }
          }
        })
        console.log('   ✓ Created Server AssetClass')
      } else {
        console.log('   ✓ Using existing Server AssetClass')
      }
      serverClass = await assetClassService.getAssetClass({className: 'Server'})

      // Check if Database AssetClass exists, create if not
      const databaseExists = await assetClassService.assetClassExists({className: 'Database'})
      if (!databaseExists) {
        databaseClass = await assetClassService.createAssetClass({
          className: 'Database',
          propertySchema: {
            name: { type: 'string', required: true },
            type: { type: 'string', required: true },
            version: { type: 'string', required: false },
            size_gb: { type: 'number', required: false },
            backup_enabled: { type: 'boolean', required: false },
            connection_string: { type: 'string', required: false }
          }
        })
        console.log('   ✓ Created Database AssetClass')
      } else {
        console.log('   ✓ Using existing Database AssetClass')
      }
      databaseClass = await assetClassService.getAssetClass({className: 'Database'})

      // Check if NetworkDevice AssetClass exists, create if not
      const networkDeviceExists = await assetClassService.assetClassExists({className: 'NetworkDevice'})
      if (!networkDeviceExists) {
        networkDeviceClass = await assetClassService.createAssetClass({
          className: 'NetworkDevice',
          propertySchema: {
            hostname: { type: 'string', required: true },
            ip_address: { type: 'string', required: true },
            device_type: { type: 'string', required: true },
            vlan: { type: 'number', required: false },
            management_ip: { type: 'string', required: false }
          }
        })
        console.log('   ✓ Created NetworkDevice AssetClass')
      } else {
        console.log('   ✓ Using existing NetworkDevice AssetClass')
      }
      networkDeviceClass = await assetClassService.getAssetClass({className: 'NetworkDevice'})

    } catch (error) {
      console.log('   ⚠ AssetClass setup error:', error.message)
      console.log('   Note: This may be expected if AssetClasses already exist')
    }

    // === Node Creation using AssetClass-based approach ===
    console.log('\n2. Creating nodes using AssetClass definitions...')
    
    // Create a Server node using AssetClass ID
    const webServer = await factory.createNode(
      'Server',  // AssetClass ID
      'Web Server - Production',  // Node title
      {
        hostname: 'web-prod-01',
        ip_address: '192.168.1.100',
        os: 'Ubuntu 22.04 LTS',
        cpu_cores: 8,
        memory_gb: 32,
        is_virtual: true,
        datacenter: 'DC-East'
      }
    )
    console.log('   ✓ Created Server node using AssetClass definition')
    
    // Create a Database node using AssetClass name (convenience method)
    const database = await factory.createNodeByClassName(
      'Database',  // AssetClass name
      'Customer Database',  // Node title
      {
        name: 'customers_db',
        type: 'PostgreSQL',
        version: '14.9',
        size_gb: 250,
        backup_enabled: true,
        connection_string: 'postgresql://db-prod:5432/customers'
      }
    )
    console.log('   ✓ Created Database node using AssetClass name')
    
    // Create a NetworkDevice node with initial systems
    const router = await factory.createNodeByClassName(
      'NetworkDevice',
      'Core Router',
      {
        hostname: 'core-router-01',
        ip_address: '192.168.1.1',
        device_type: 'Router',
        vlan: 100,
        management_ip: '10.0.0.1'
      },
      ['NetworkInfra', 'CriticalSystems']  // Initial systems
    )
    console.log('   ✓ Created NetworkDevice node with initial systems')

    console.log('\n✅ Three nodes created successfully in Neo4j:')
    console.log('┌─────────────────────────┬────────┬──────────────┬─────────────────────────┐')
    console.log('│ Title                   │ Neo4j  │ Asset Class  │ Key Properties          │')
    console.log('│                         │ ID     │              │                         │')
    console.log('├─────────────────────────┼────────┼──────────────┼─────────────────────────┤')
    console.log(`│ ${webServer.title.padEnd(23)} │ ${webServer.nodeId.padEnd(6)} │ ${webServer.labels[1].padEnd(12)} │ ${webServer.properties.hostname}, ${webServer.properties.os.substring(0, 10)}... │`)
    console.log(`│ ${database.title.padEnd(23)} │ ${database.nodeId.padEnd(6)} │ ${database.labels[1].padEnd(12)} │ ${database.properties.name}, ${database.properties.type}   │`)
    console.log(`│ ${router.title.padEnd(23)} │ ${router.nodeId.padEnd(6)} │ ${router.labels[1].padEnd(12)} │ ${router.properties.hostname}, ${router.properties.device_type}       │`)
    console.log('└─────────────────────────┴────────┴──────────────┴─────────────────────────┘')
    
    console.log('\n📊 Node Details:')
    console.log('================')
    
    console.log(`\n🖥️  ${webServer.title} (ID: ${webServer.nodeId})`)
    console.log(`   AssetClass: ${webServer.assetClassId}`)
    console.log(`   Labels: [${webServer.labels.join(', ')}]`)
    console.log(`   TempUID: ${webServer.tempUID}`)
    console.log(`   Properties: hostname=${webServer.properties.hostname}, memory=${webServer.properties.memory_gb}GB, virtual=${webServer.properties.is_virtual}`)
    
    console.log(`\n🗄️  ${database.title} (ID: ${database.nodeId})`)
    console.log(`   AssetClass: ${database.assetClassId}`)
    console.log(`   Labels: [${database.labels.join(', ')}]`)
    console.log(`   TempUID: ${database.tempUID}`)
    console.log(`   Properties: name=${database.properties.name}, type=${database.properties.type}, size=${database.properties.size_gb}GB`)
    
    console.log(`\n🌐 ${router.title} (ID: ${router.nodeId})`)
    console.log(`   AssetClass: ${router.assetClassId}`)
    console.log(`   Labels: [${router.labels.join(', ')}]`)
    console.log(`   TempUID: ${router.tempUID}`)
    console.log(`   Properties: hostname=${router.properties.hostname}, type=${router.properties.device_type}, vlan=${router.properties.vlan}`)
    console.log(`   Initial Systems: [${router.labels.filter(l => !['Asset', router.assetClassId].includes(l)).join(', ')}]`)
    
    // Demonstrate getting all nodes
    console.log('\n🔍 Retrieving all Asset nodes from Neo4j:')
    console.log('==========================================')
    
    const allNodes = await factory.getNodeService().getAllNodes()
    console.log(`Found ${allNodes.length} Asset nodes:`)
    
    allNodes.forEach(node => {
      const assetType = node.labels.find(label => label !== 'Asset')
      console.log(`  • ${node.title} (${assetType}) - ID: ${node.nodeId}`)
    })
    
    console.log('\n✅ Check Neo4j Browser with: MATCH (n:Asset) RETURN n')
    console.log('✅ Or by asset type: MATCH (n:Server) RETURN n')
    
    // Demonstrate system integration
    console.log('\n🏷️  System Integration Demo:')
    console.log('============================')
    
    // Add servers to systems
    console.log('\nAdding nodes to systems...')
    await systemService.addNodeToSystem(webServer.nodeId, 'ProdWebSystem')
    await systemService.addNodeToSystem(database.nodeId, 'DatabaseCluster')
    await systemService.addNodeToSystem(database.nodeId, 'BackupInfra')
    await systemService.addNodeToSystem(router.nodeId, 'NetworkInfra')
    
    console.log('✅ Web server added to ProdWebSystem')
    console.log('✅ Database added to DatabaseCluster and BackupInfra') 
    console.log('✅ Router added to NetworkInfra')
    
    // Show systems for nodes
    console.log('\nNode system memberships:')
    const webServerSystems = await systemService.getNodeSystems(webServer.nodeId)
    const databaseSystems = await systemService.getNodeSystems(database.nodeId)
    const routerSystems = await systemService.getNodeSystems(router.nodeId)
    
    console.log(`  • ${webServer.title}: [${webServerSystems.join(', ')}]`)
    console.log(`  • ${database.title}: [${databaseSystems.join(', ')}]`)
    console.log(`  • ${router.title}: [${routerSystems.join(', ')}]`)
    
    // Show all systems
    console.log('\nAll systems in graph:')
    const allSystems = await systemService.listSystems()
    allSystems.forEach(system => {
      console.log(`  • ${system.systemLabel}: ${system.nodeCount} nodes`)
    })
    
    // Create a node directly with system labels using NodeFactory
    console.log('\n🆕 Creating node with initial systems using NodeFactory...')
    const monitoringServer = await factory.createNodeByClassName(
      'Server',
      'Monitoring Server',
      {
        hostname: 'monitor-01',
        ip_address: '192.168.1.50',
        os: 'Ubuntu 22.04 LTS',
        cpu_cores: 4,
        memory_gb: 16
      },
      ['MonitoringStack', 'SecurityTools']  // Multiple systems from creation
    )
    
    console.log('✅ Created monitoring server with initial systems')
    const monitoringSystems = await systemService.getNodeSystems(monitoringServer.nodeId)
    console.log(`  • ${monitoringServer.title}: [${monitoringSystems.join(', ')}]`)
    
    // === AssetClass Schema Validation Demo ===
    console.log('\n🧪 Testing AssetClass schema validation:')
    console.log('=======================================')
    
    // Show available AssetClasses and their schemas
    console.log('\nAvailable AssetClass schemas:')
    const availableClasses = await assetClassService.getAllAssetClasses()
    for (const assetClass of availableClasses) {
      console.log(`\n• ${assetClass.className} (${assetClass.classId}):`)
      console.log(`  Description: ${assetClass.description}`)
      
      const schema = await assetClassService.getAssetClassSchema({classId: assetClass.classId})
      console.log(`  Required: [${schema.requiredProperties.join(', ')}]`)
      console.log(`  Optional: [${schema.optionalProperties.join(', ')}]`)
    }
    
    // Test validation - missing required property
    console.log('\nTesting validation - missing required property:')
    try {
      await factory.createNodeByClassName('Server', 'Invalid Server', {
        hostname: 'test-server'
        // Missing required ip_address
      })
      console.log('❌ ERROR: Validation should have failed!')
    } catch (validationError) {
      console.log('✅ Property validation works:', validationError.message)
    }
    
    // Test validation - wrong property type
    console.log('\nTesting validation - wrong property type:')
    try {
      await factory.createNodeByClassName('Server', 'Invalid Server 2', {
        hostname: 'test-server-2',
        ip_address: '192.168.1.200',
        cpu_cores: 'not_a_number' // Wrong type
      })
      console.log('❌ ERROR: Validation should have failed!')
    } catch (validationError) {
      console.log('✅ Type validation works:', validationError.message)
    }
    
    // Test validation before creation
    console.log('\nTesting pre-validation:')
    const validationResult = await assetClassService.validatePropertiesForAssetClass({className: 'Database', properties: {
      name: 'test_db',
      type: 'MySQL'
      // All good - name and type are required, others optional
    }})
    console.log(`✅ Pre-validation result: valid=${validationResult.valid}`)
    
    const invalidValidationResult = await assetClassService.validatePropertiesForAssetClass({className: 'Database', properties: {
      name: 'test_db'
      // Missing required 'type'
    }})
    console.log(`✅ Pre-validation catches errors: valid=${invalidValidationResult.valid}, errors=[${invalidValidationResult.errors.join(', ')}]`)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await factory.close()
    await systemService.close()
    await assetClassService.close()
    // Close Neo4j connection for demo cleanup
    const { Neo4jService } = await import('../database/Neo4jService.js')
    const neo4jService = Neo4jService.getInstance()
    await neo4jService.close()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runNodeDemo()
}

export { runNodeDemo }
import { NodeFactory } from './NodeFactory.js'

async function runNodeDemo() {
  const factory = new NodeFactory()
  
  try {
    console.log('Creating IT Asset Nodes using NodeFactory...')
    console.log('===============================================')
    
    // Create a Server node
    const webServer = await factory.createServerNode(
      'Web Server - Production',
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
    
    // Create an Application node
    const webApp = await factory.createApplicationNode(
      'E-Commerce API',
      {
        name: 'ecommerce-api',
        version: '2.1.4',
        port: 8080,
        protocol: 'HTTP',
        status: 'running',
        language: 'Node.js'
      }
    )
    
    // Create a Database node  
    const database = await factory.createDatabaseNode(
      'Customer Database',
      {
        name: 'customers_db',
        type: 'PostgreSQL',
        version: '14.9',
        size_gb: 250,
        backup_enabled: true,
        connection_string: 'postgresql://db-prod:5432/customers'
      }
    )
    
    // Create a NetworkDevice node
    const router = await factory.createNetworkDeviceNode(
      'Core Router',
      {
        hostname: 'core-router-01',
        ip_address: '192.168.1.1',
        device_type: 'Router',
        vlan: 100,
        management_ip: '10.0.0.1'
      }
    )

    console.log('\n✅ Four nodes created successfully in Neo4j:')
    console.log('┌─────────────────────────┬────────┬──────────────┬─────────────────────────┐')
    console.log('│ Title                   │ Neo4j  │ Asset Class  │ Key Properties          │')
    console.log('│                         │ ID     │              │                         │')
    console.log('├─────────────────────────┼────────┼──────────────┼─────────────────────────┤')
    console.log(`│ ${webServer.title.padEnd(23)} │ ${webServer.nodeId.padEnd(6)} │ ${webServer.labels[1].padEnd(12)} │ ${webServer.properties.hostname}, ${webServer.properties.os.substring(0, 10)}... │`)
    console.log(`│ ${webApp.title.padEnd(23)} │ ${webApp.nodeId.padEnd(6)} │ ${webApp.labels[1].padEnd(12)} │ ${webApp.properties.name}, v${webApp.properties.version}     │`)
    console.log(`│ ${database.title.padEnd(23)} │ ${database.nodeId.padEnd(6)} │ ${database.labels[1].padEnd(12)} │ ${database.properties.name}, ${database.properties.type}   │`)
    console.log(`│ ${router.title.padEnd(23)} │ ${router.nodeId.padEnd(6)} │ ${router.labels[1].padEnd(12)} │ ${router.properties.hostname}, ${router.properties.device_type}       │`)
    console.log('└─────────────────────────┴────────┴──────────────┴─────────────────────────┘')
    
    console.log('\n📊 Node Details:')
    console.log('================')
    
    console.log(`\n🖥️  ${webServer.title} (ID: ${webServer.nodeId})`)
    console.log(`   Labels: [${webServer.labels.join(', ')}]`)
    console.log(`   TempUID: ${webServer.tempUID}`)
    console.log(`   Properties: hostname=${webServer.properties.hostname}, memory=${webServer.properties.memory_gb}GB`)
    
    console.log(`\n📱 ${webApp.title} (ID: ${webApp.nodeId})`)
    console.log(`   Labels: [${webApp.labels.join(', ')}]`)
    console.log(`   TempUID: ${webApp.tempUID}`)
    console.log(`   Properties: port=${webApp.properties.port}, language=${webApp.properties.language}`)
    
    console.log(`\n🗄️  ${database.title} (ID: ${database.nodeId})`)
    console.log(`   Labels: [${database.labels.join(', ')}]`)
    console.log(`   TempUID: ${database.tempUID}`)
    console.log(`   Properties: type=${database.properties.type}, size=${database.properties.size_gb}GB`)
    
    console.log(`\n🌐 ${router.title} (ID: ${router.nodeId})`)
    console.log(`   Labels: [${router.labels.join(', ')}]`)
    console.log(`   TempUID: ${router.tempUID}`)
    console.log(`   Properties: device_type=${router.properties.device_type}, vlan=${router.properties.vlan}`)
    
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
    
    // Test property validation
    console.log('\n🧪 Testing property validation:')
    console.log('================================')
    
    try {
      await factory.createServerNode('Invalid Server', {
        hostname: 'test',
        // Missing required ip_address
        cpu_cores: 'not_a_number' // Wrong type
      })
      console.log('❌ ERROR: Validation should have failed!')
    } catch (validationError) {
      console.log('✅ Property validation works:', validationError.message)
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await factory.close()
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runNodeDemo()
}

export { runNodeDemo }
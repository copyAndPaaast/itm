import { AssetClassService } from './AssetClassService.js'

async function runAssetClassDemo() {
  const service = new AssetClassService()
  
  try {
    console.log('Creating AssetClasses in Neo4j...')
    console.log('==================================')
    
    console.log('💡 Note: AssetClassService uses centralized Neo4jService for database connections')
    console.log('   Run `node src/database/demo.js` to see Neo4j connection management demo\n')
    
    // Create or get Server AssetClass
    let serverClass
    try {
      serverClass = await service.createAssetClass({
        className: 'Server',
        propertySchema: {
          hostname: { type: 'string' },
          ip_address: { type: 'string' },
          os: { type: 'string' },
          cpu_cores: { type: 'number' },
          memory_gb: { type: 'number' },
          is_virtual: { type: 'boolean' },
          datacenter: { type: 'string' }
        },
        requiredProperties: ['hostname', 'ip_address']
      })
      console.log('✅ Created Server AssetClass')
    } catch (error) {
      if (error.message.includes('already exists')) {
        serverClass = await service.getAssetClass({className: 'Server'})
        console.log('✅ Using existing Server AssetClass')
      } else {
        throw error
      }
    }
    
    // Create or get Application AssetClass
    let appClass
    try {
      appClass = await service.createAssetClass({
        className: 'Application',
        propertySchema: {
          name: { type: 'string' },
          version: { type: 'string' },
          port: { type: 'number' },
          protocol: { type: 'string' },
          status: { type: 'string' },
          language: { type: 'string' }
        },
        requiredProperties: ['name', 'version']
      })
      console.log('✅ Created Application AssetClass')
    } catch (error) {
      if (error.message.includes('already exists')) {
        appClass = await service.getAssetClass({className: 'Application'})
        console.log('✅ Using existing Application AssetClass')
      } else {
        throw error
      }
    }
    
    // Create or get Database AssetClass
    let dbClass
    try {
      dbClass = await service.createAssetClass({
        className: 'Database',
        propertySchema: {
          name: { type: 'string' },
          type: { type: 'string' },
          version: { type: 'string' },
          size_gb: { type: 'number' },
          backup_enabled: { type: 'boolean' },
          connection_string: { type: 'string' }
        },
        requiredProperties: ['name', 'type']
      })
      console.log('✅ Created Database AssetClass')
    } catch (error) {
      if (error.message.includes('already exists')) {
        dbClass = await service.getAssetClass({className: 'Database'})
        console.log('✅ Using existing Database AssetClass')
      } else {
        throw error
      }
    }
    
    // Create or get NetworkDevice AssetClass
    let networkClass
    try {
      networkClass = await service.createAssetClass({
        className: 'NetworkDevice',
        propertySchema: {
          hostname: { type: 'string' },
          ip_address: { type: 'string' },
          device_type: { type: 'string' },
          vlan: { type: 'number' },
          management_ip: { type: 'string' }
        },
        requiredProperties: ['hostname', 'device_type']
      })
      console.log('✅ Created NetworkDevice AssetClass')
    } catch (error) {
      if (error.message.includes('already exists')) {
        networkClass = await service.getAssetClass({className: 'NetworkDevice'})
        console.log('✅ Using existing NetworkDevice AssetClass')
      } else {
        throw error
      }
    }
    
    // Create or get User AssetClass
    let userClass
    try {
      userClass = await service.createAssetClass({
        className: 'User',
        propertySchema: {
          username: { type: 'string' },
          email: { type: 'string' },
          department: { type: 'string' },
          role: { type: 'string' },
          is_active: { type: 'boolean' }
        },
        requiredProperties: ['username', 'email']
      })
      console.log('✅ Created User AssetClass')
    } catch (error) {
      if (error.message.includes('already exists')) {
        userClass = await service.getAssetClass({className: 'User'})
        console.log('✅ Using existing User AssetClass')
      } else {
        throw error
      }
    }

    console.log('\nAssetClasses created and stored in Neo4j:')
    console.log('┌───────────────┬────────┬─────────────────┬─────────────┐')
    console.log('│ ClassName     │ Neo4j  │ Required Props  │ Total Props │')
    console.log('│               │ ID     │                 │             │')
    console.log('├───────────────┼────────┼─────────────────┼─────────────┤')
    console.log(`│ ${serverClass.className.padEnd(13)} │ ${serverClass.classId.padEnd(6)} │ ${serverClass.requiredProperties.length.toString().padEnd(15)} │ ${Object.keys(serverClass.propertySchema).length.toString().padEnd(11)} │`)
    console.log(`│ ${appClass.className.padEnd(13)} │ ${appClass.classId.padEnd(6)} │ ${appClass.requiredProperties.length.toString().padEnd(15)} │ ${Object.keys(appClass.propertySchema).length.toString().padEnd(11)} │`)
    console.log(`│ ${dbClass.className.padEnd(13)} │ ${dbClass.classId.padEnd(6)} │ ${dbClass.requiredProperties.length.toString().padEnd(15)} │ ${Object.keys(dbClass.propertySchema).length.toString().padEnd(11)} │`)
    console.log(`│ ${networkClass.className.padEnd(13)} │ ${networkClass.classId.padEnd(6)} │ ${networkClass.requiredProperties.length.toString().padEnd(15)} │ ${Object.keys(networkClass.propertySchema).length.toString().padEnd(11)} │`)
    console.log(`│ ${userClass.className.padEnd(13)} │ ${userClass.classId.padEnd(6)} │ ${userClass.requiredProperties.length.toString().padEnd(15)} │ ${Object.keys(userClass.propertySchema).length.toString().padEnd(11)} │`)
    console.log('└───────────────┴────────┴─────────────────┴─────────────┘')
    
    console.log('\n✅ Check Neo4j Browser with: MATCH (ac:AssetClass) RETURN ac')
    
    // Demonstrate getting all AssetClasses
    console.log('\nRetrieving all AssetClasses from Neo4j:')
    console.log('=======================================')
    
    const allClasses = await service.getAllAssetClasses()
    
    console.log('┌───────────────┬────────┬─────────────────────────────────┐')
    console.log('│ ClassName     │ Neo4j  │ Required Properties             │')
    console.log('│               │ ID     │                                 │')
    console.log('├───────────────┼────────┼─────────────────────────────────┤')
    
    allClasses.forEach(assetClass => {
      const requiredProps = assetClass.requiredProperties.join(', ')
      console.log(`│ ${assetClass.className.padEnd(13)} │ ${assetClass.classId.padEnd(6)} │ ${requiredProps.padEnd(31)} │`)
    })
    
    console.log('└───────────────┴────────┴─────────────────────────────────┘')
    console.log(`\nTotal AssetClasses available: ${allClasses.length}`)
    
    // Test duplicate creation prevention
    console.log('\nTesting duplicate prevention:')
    console.log('=============================')
    
    try {
      await service.createAssetClass({className: 'Server', propertySchema: {}})
      console.log('❌ ERROR: Duplicate Server creation should have failed!')
    } catch (duplicateError) {
      console.log('✅ Duplicate prevention works:', duplicateError.message)
    }
    
    // Test existence check
    const serverExists = await service.assetClassExists({className: 'Server'})
    const nonExistentExists = await service.assetClassExists({className: 'NonExistent'})
    
    console.log('\nExistence checks:')
    console.log('┌─────────────┬────────┐')
    console.log('│ Class Name  │ Exists │')
    console.log('├─────────────┼────────┤')
    console.log(`│ Server      │ ${serverExists.toString().padEnd(6)} │`)
    console.log(`│ NonExistent │ ${nonExistentExists.toString().padEnd(6)} │`)
    console.log('└─────────────┴────────┘')
    
    // Test delete and recreate
    console.log('\nTesting delete and recreate:')
    console.log('============================')
    
    const deleteResult = await service.deleteAssetClass({classId: userClass.classId})
    console.log('✅ User class deleted:', deleteResult)
    
    const afterDeleteExists = await service.assetClassExists({className: 'User'})
    console.log('✅ User exists after delete:', afterDeleteExists)
    
    // Now recreate User class
    const newUserClass = await service.createAssetClass({
      className: 'User',
      propertySchema: {
        username: { type: 'string' },
        email: { type: 'string' },
        full_name: { type: 'string' }
      },
      requiredProperties: ['username']
    })
    console.log('✅ User class recreated with ID:', newUserClass.classId)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await service.close()
    // Close Neo4j connection for demo cleanup
    const { Neo4jService } = await import('../database/Neo4jService.js')
    const neo4jService = Neo4jService.getInstance()
    await neo4jService.close()
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runAssetClassDemo()
}

export { runAssetClassDemo }
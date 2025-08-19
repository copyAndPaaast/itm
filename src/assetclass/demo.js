import { AssetClassService } from './AssetClassService.js'

async function runAssetClassDemo() {
  const service = new AssetClassService()
  
  try {
    console.log('Creating AssetClasses in Neo4j...')
    console.log('==================================')
    
    console.log('💡 Note: AssetClassService uses centralized Neo4jService for database connections')
    console.log('   Run `node src/database/demo.js` to see Neo4j connection management demo\n')
    
    // Create Server AssetClass
    const serverClass = await service.createAssetClass(
      'Server',
      {
        hostname: { type: 'string' },
        ip_address: { type: 'string' },
        os: { type: 'string' },
        cpu_cores: { type: 'number' },
        memory_gb: { type: 'number' },
        is_virtual: { type: 'boolean' },
        datacenter: { type: 'string' }
      },
      ['hostname', 'ip_address']
    )
    
    // Create Application AssetClass
    const appClass = await service.createAssetClass(
      'Application',
      {
        name: { type: 'string' },
        version: { type: 'string' },
        port: { type: 'number' },
        protocol: { type: 'string' },
        status: { type: 'string' },
        language: { type: 'string' }
      },
      ['name', 'version']
    )
    
    // Create Database AssetClass
    const dbClass = await service.createAssetClass(
      'Database',
      {
        name: { type: 'string' },
        type: { type: 'string' },
        version: { type: 'string' },
        size_gb: { type: 'number' },
        backup_enabled: { type: 'boolean' },
        connection_string: { type: 'string' }
      },
      ['name', 'type']
    )
    
    // Create NetworkDevice AssetClass
    const networkClass = await service.createAssetClass(
      'NetworkDevice',
      {
        hostname: { type: 'string' },
        ip_address: { type: 'string' },
        device_type: { type: 'string' },
        vlan: { type: 'number' },
        management_ip: { type: 'string' }
      },
      ['hostname', 'device_type']
    )
    
    // Create User AssetClass
    const userClass = await service.createAssetClass(
      'User',
      {
        username: { type: 'string' },
        email: { type: 'string' },
        department: { type: 'string' },
        role: { type: 'string' },
        is_active: { type: 'boolean' }
      },
      ['username', 'email']
    )

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
      await service.createAssetClass('Server', {}, [])
      console.log('❌ ERROR: Duplicate Server creation should have failed!')
    } catch (duplicateError) {
      console.log('✅ Duplicate prevention works:', duplicateError.message)
    }
    
    // Test existence check
    const serverExists = await service.assetClassExists('Server')
    const nonExistentExists = await service.assetClassExists('NonExistent')
    
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
    
    const deleteResult = await service.deleteAssetClass(userClass.classId)
    console.log('✅ User class deleted:', deleteResult)
    
    const afterDeleteExists = await service.assetClassExists('User')
    console.log('✅ User exists after delete:', afterDeleteExists)
    
    // Now recreate User class
    const newUserClass = await service.createAssetClass(
      'User',
      {
        username: { type: 'string' },
        email: { type: 'string' },
        full_name: { type: 'string' }
      },
      ['username']
    )
    console.log('✅ User class recreated with ID:', newUserClass.classId)
    
  } catch (error) {
    console.error('\n❌ Error:', error.message)
  } finally {
    await service.close()
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  runAssetClassDemo()
}

export { runAssetClassDemo }
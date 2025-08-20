import { AssetClassService } from '../NodeModule/assetclass/AssetClassService.js'
import { NodeService } from '../NodeModule/node/NodeService.js'
import { RelationshipClassService } from '../RelationModule/relationshipclass/RelationshipClassService.js'
import { RelationshipService } from '../RelationModule/relationship/RelationshipService.js'

async function classSwitchingDemo() {
  console.log('\n=== Class Switching & Property Compatibility Demo ===\n')
  
  const assetClassService = new AssetClassService()
  const nodeService = new NodeService()
  const relationshipClassService = new RelationshipClassService()
  const relationshipService = new RelationshipService()

  try {
    console.log('💡 Note: This demo shows how to handle class switching during design process')
    console.log('   Users often need to change node/relationship classes and preserve data\n')
    
    // === Setup: Create Different AssetClasses ===
    console.log('1. Setting up AssetClass variations for compatibility testing...')
    
    // Create basic server class
    let basicServerClass
    try {
      const exists = await assetClassService.assetClassExists({className: 'BasicServer'})
      if (!exists) {
        basicServerClass = await assetClassService.createAssetClass({
          className: 'BasicServer',
          propertySchema: {
            hostname: { type: 'string', required: true },
            ip_address: { type: 'string', required: true },
            os: { type: 'string', required: false }
          },
          requiredProperties: ['hostname', 'ip_address']
        })
        console.log('   ✓ Created BasicServer AssetClass')
      } else {
        basicServerClass = await assetClassService.getAssetClass({className: 'BasicServer'})
        console.log('   ✓ Using existing BasicServer AssetClass')
      }
    } catch (error) {
      console.log('   ⚠ BasicServer setup error:', error.message)
      return
    }

    // Create advanced server class with more properties
    let advancedServerClass
    try {
      const exists = await assetClassService.assetClassExists({className: 'AdvancedServer'})
      if (!exists) {
        advancedServerClass = await assetClassService.createAssetClass({
          className: 'AdvancedServer',
          propertySchema: {
            hostname: { type: 'string', required: true },
            ip_address: { type: 'string', required: true },
            os: { type: 'string', required: true },
            cpu_cores: { type: 'number', required: true },
            memory_gb: { type: 'number', required: true },
            environment: { 
              type: 'string', 
              required: true,
              values: ['development', 'staging', 'production']
            },
            virtualized: { type: 'boolean', required: false },
            cluster_name: { type: 'string', required: false }
          },
          requiredProperties: ['hostname', 'ip_address', 'os', 'cpu_cores', 'memory_gb', 'environment']
        })
        console.log('   ✓ Created AdvancedServer AssetClass')
      } else {
        advancedServerClass = await assetClassService.getAssetClass({className: 'AdvancedServer'})
        console.log('   ✓ Using existing AdvancedServer AssetClass')
      }
    } catch (error) {
      console.log('   ⚠ AdvancedServer setup error:', error.message)
      return
    }

    // Create a completely different class
    let databaseClass
    try {
      const exists = await assetClassService.assetClassExists({className: 'DatabaseApp'})
      if (!exists) {
        databaseClass = await assetClassService.createAssetClass({
          className: 'DatabaseApp',
          propertySchema: {
            database_name: { type: 'string', required: true },
            db_type: { 
              type: 'string', 
              required: true,
              values: ['mysql', 'postgresql', 'mongodb', 'redis']
            },
            version: { type: 'string', required: false },
            port: { type: 'number', required: false },
            cluster_enabled: { type: 'boolean', required: false }
          },
          requiredProperties: ['database_name', 'db_type']
        })
        console.log('   ✓ Created DatabaseApp AssetClass')
      } else {
        databaseClass = await assetClassService.getAssetClass({className: 'DatabaseApp'})
        console.log('   ✓ Using existing DatabaseApp AssetClass')
      }
    } catch (error) {
      console.log('   ⚠ DatabaseApp setup error:', error.message)
      return
    }

    // === Create Test Node ===
    console.log('\n2. Creating test node with BasicServer class...')
    
    const testNode = await nodeService.createNode(
      basicServerClass.classId,
      {
        hostname: 'test-server-01',
        ip_address: '192.168.1.100',
        os: 'Ubuntu 20.04'
      },
      'Test Server for Class Switching'
    )
    console.log(`   ✓ Created node: ${testNode.title} (ID: ${testNode.nodeId})`)
    console.log(`   Properties: ${JSON.stringify(testNode.properties)}`)

    // === Compatibility Analysis Demo ===
    console.log('\n3. Analyzing compatibility for different class switches...')

    // Test 1: Compatible upgrade (BasicServer -> AdvancedServer)
    console.log('\n📊 Test 1: BasicServer → AdvancedServer (Compatible Upgrade)')
    const upgradeAnalysis = await nodeService.analyzeAssetClassCompatibility({
      nodeId: testNode.nodeId,
      newAssetClassId: advancedServerClass.classId
    })
    
    console.log(`   Compatibility Score: ${upgradeAnalysis.compatibilityScore}%`)
    console.log(`   Compatible: ${upgradeAnalysis.compatible}`)
    console.log(`   Preserved Properties: [${Object.keys(upgradeAnalysis.preservedProperties).join(', ')}]`)
    console.log(`   Lost Properties: [${Object.keys(upgradeAnalysis.lostProperties).join(', ')}]`)
    console.log(`   Missing Required: [${upgradeAnalysis.missingRequiredProperties.map(m => m.property).join(', ')}]`)
    
    if (upgradeAnalysis.migrations.length > 0) {
      console.log('   Suggested Migrations:')
      upgradeAnalysis.migrations.forEach(migration => {
        console.log(`     • ${migration.action}`)
      })
    }

    // Test 2: Incompatible switch (BasicServer -> DatabaseApp)
    console.log('\n📊 Test 2: BasicServer → DatabaseApp (Incompatible Switch)')
    const incompatibleAnalysis = await nodeService.analyzeAssetClassCompatibility({
      nodeId: testNode.nodeId,
      newAssetClassId: databaseClass.classId
    })
    
    console.log(`   Compatibility Score: ${incompatibleAnalysis.compatibilityScore}%`)
    console.log(`   Compatible: ${incompatibleAnalysis.compatible}`)
    console.log(`   Preserved Properties: [${Object.keys(incompatibleAnalysis.preservedProperties).join(', ')}]`)
    console.log(`   Lost Properties: [${Object.keys(incompatibleAnalysis.lostProperties).join(', ')}]`)
    console.log(`   Missing Required: [${incompatibleAnalysis.missingRequiredProperties.map(m => m.property).join(', ')}]`)

    // === Successful Class Switch Demo ===
    console.log('\n4. Performing successful class switch (BasicServer → AdvancedServer)...')
    
    const switchResult = await nodeService.switchAssetClass({
      nodeId: testNode.nodeId,
      newAssetClassId: advancedServerClass.classId,
      propertyMappings: {
        cpu_cores: 4,
        memory_gb: 16,
        environment: 'development'
      },
      preserveLostProperties: true
    })
    
    console.log(`   ✅ Switch successful: ${switchResult.success}`)
    console.log(`   New Class: ${switchResult.node.assetClassId}`)
    console.log(`   Updated Properties: ${JSON.stringify(switchResult.node.properties)}`)
    console.log(`   Applied Mappings: ${JSON.stringify(switchResult.appliedMappings)}`)
    if (Object.keys(switchResult.preservedProperties).length > 0) {
      console.log(`   Preserved Properties: ${JSON.stringify(switchResult.preservedProperties)}`)
    }

    // === Relationship Class Switching Demo ===
    console.log('\n5. Setting up RelationshipClass switching demo...')

    // Create different relationship classes
    let basicDependencyClass, advancedDependencyClass

    try {
      const basicExists = await relationshipClassService.relationshipClassExists({relationshipClassName: 'Basic Dependency'})
      if (!basicExists) {
        basicDependencyClass = await relationshipClassService.createRelationshipClass({
          relationshipClassName: 'Basic Dependency',
          relationshipType: 'BASIC_DEPENDS_ON',
          propertySchema: {
            dependency_type: { type: 'string', required: true }
          },
          requiredProperties: ['dependency_type']
        })
        console.log('   ✓ Created Basic Dependency RelationshipClass')
      } else {
        basicDependencyClass = await relationshipClassService.getRelationshipClass({relationshipClassName: 'Basic Dependency'})
        console.log('   ✓ Using existing Basic Dependency RelationshipClass')
      }

      const advancedExists = await relationshipClassService.relationshipClassExists({relationshipClassName: 'Advanced Dependency'})
      if (!advancedExists) {
        advancedDependencyClass = await relationshipClassService.createRelationshipClass({
          relationshipClassName: 'Advanced Dependency',
          relationshipType: 'ADVANCED_DEPENDS_ON',
          propertySchema: {
            dependency_type: { type: 'string', required: true },
            criticality: { 
              type: 'string', 
              required: true,
              values: ['low', 'medium', 'high', 'critical']
            },
            sla_minutes: { type: 'number', required: false },
            auto_failover: { type: 'boolean', required: false }
          },
          requiredProperties: ['dependency_type', 'criticality']
        })
        console.log('   ✓ Created Advanced Dependency RelationshipClass')
      } else {
        advancedDependencyClass = await relationshipClassService.getRelationshipClass({relationshipClassName: 'Advanced Dependency'})
        console.log('   ✓ Using existing Advanced Dependency RelationshipClass')
      }
    } catch (error) {
      console.log('   ⚠ RelationshipClass setup error:', error.message)
      return
    }

    // Create another node for relationship
    const targetNode = await nodeService.createNode(
      basicServerClass.classId,
      {
        hostname: 'target-server-01',
        ip_address: '192.168.1.200',
        os: 'CentOS 8'
      },
      'Target Server'
    )

    // Create test relationship
    const testRelationship = await relationshipService.createRelationship({
      fromId: switchResult.node.nodeId,
      toId: targetNode.nodeId,
      relationshipClassId: basicDependencyClass.classId,
      properties: {
        dependency_type: 'service'
      }
    })
    
    console.log(`   ✓ Created test relationship (ID: ${testRelationship.relationshipId})`)

    // === Relationship Compatibility Analysis ===
    console.log('\n6. Analyzing relationship class compatibility...')

    const relCompatibility = await relationshipService.analyzeRelationshipClassCompatibility({
      relationshipId: testRelationship.relationshipId,
      newRelationshipClassId: advancedDependencyClass.classId
    })

    console.log(`   Compatibility Score: ${relCompatibility.compatibilityScore}%`)
    console.log(`   Compatible: ${relCompatibility.compatible}`)
    console.log(`   Relationship Type Change: ${relCompatibility.relationshipTypeChange}`)
    console.log(`   Node Type Compatible: ${relCompatibility.nodeTypeCompatibility.compatible}`)
    console.log(`   Semantically Related: ${relCompatibility.semanticCompatibility.semanticallyRelated}`)

    // === Relationship Class Switch ===
    console.log('\n7. Performing relationship class switch...')

    const relSwitchResult = await relationshipService.switchRelationshipClass({
      relationshipId: testRelationship.relationshipId,
      newRelationshipClassId: advancedDependencyClass.classId,
      propertyMappings: {
        criticality: 'medium'
      }
    })

    console.log(`   ✅ Relationship switch successful: ${relSwitchResult.success}`)
    console.log(`   Relationship Type Changed: ${relSwitchResult.relationshipTypeChanged}`)
    console.log(`   New Relationship ID: ${relSwitchResult.relationship.relationshipId}`)
    console.log(`   Updated Properties: ${JSON.stringify(relSwitchResult.relationship.properties)}`)

    // === Error Handling Demo ===
    console.log('\n8. Testing error handling for incompatible switches...')

    console.log('\nTesting incompatible node class switch:')
    try {
      await nodeService.switchAssetClass({
        nodeId: testNode.nodeId,
        newAssetClassId: databaseClass.classId,
        propertyMappings: {} // Not providing required mappings
      })
      console.log('   ❌ ERROR: Should have failed!')
    } catch (error) {
      console.log(`   ✓ Correctly prevented incompatible switch: ${error.message.substring(0, 80)}...`)
    }

    // === Summary ===
    console.log('\n9. Class switching capabilities summary...')
    console.log('\n🎯 Key Features Demonstrated:')
    console.log('   ✅ Property compatibility analysis with scoring')
    console.log('   ✅ Automatic property preservation and mapping')
    console.log('   ✅ Missing required property detection')
    console.log('   ✅ Type conversion and value mapping suggestions')
    console.log('   ✅ Lost property preservation in metadata')
    console.log('   ✅ Relationship class switching with type changes')
    console.log('   ✅ Node type compatibility validation')
    console.log('   ✅ Semantic relationship analysis')
    console.log('   ✅ Comprehensive error handling')

    console.log('\n💡 Use Cases:')
    console.log('   • Upgrading from basic to detailed asset classes')
    console.log('   • Correcting misclassified assets during design')
    console.log('   • Evolving relationship semantics')
    console.log('   • Data migration between schema versions')
    console.log('   • Preserving user data during class refactoring')

    console.log('\n=== Demo Complete ===')
    console.log('Class switching and property compatibility system demonstrated successfully!')

  } catch (error) {
    console.error('Demo failed:', error)
    throw error
  } finally {
    // Cleanup
    await assetClassService.close()
    await nodeService.close()
    await relationshipClassService.close()
    await relationshipService.close()
    // Close Neo4j connection for demo cleanup
    const { Neo4jService } = await import('../database/Neo4jService.js')
    const neo4jService = Neo4jService.getInstance()
    await neo4jService.close()
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  classSwitchingDemo()
    .then(() => {
      console.log('\nClass switching demo completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nClass switching demo failed:', error)
      process.exit(1)
    })
}

export { classSwitchingDemo }
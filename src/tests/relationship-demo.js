import { RelationshipClassService } from '../RelationModule/relationshipclass/RelationshipClassService.js'
import { RelationshipService } from '../RelationModule/relationship/RelationshipService.js'
import { AssetClassService } from '../NodeModule/assetclass/AssetClassService.js'
import { NodeService } from '../NodeModule/node/NodeService.js'

async function relationshipDemo() {
  console.log('\n=== Relationship Management & RelationshipClass Demo ===\n')
  
  const relationshipClassService = new RelationshipClassService()
  const relationshipService = new RelationshipService()
  const assetClassService = new AssetClassService()
  const nodeService = new NodeService()

  try {
    console.log('💡 Note: RelationshipService uses RelationshipClass templates for validation')
    console.log('   This demo shows the template-driven relationship creation system\n')
    
    // === Setup: Create AssetClass and Nodes ===
    console.log('1. Setting up demo assets...')
    
    // Ensure Server AssetClass exists
    let serverClass
    try {
      const serverExists = await assetClassService.assetClassExists({className: 'Server'})
      if (!serverExists) {
        serverClass = await assetClassService.createAssetClass({
          className: 'Server',
          propertySchema: {
            hostname: { type: 'string', required: true },
            ip: { type: 'string', required: true },
            role: { type: 'string' }
          }
        })
        console.log('   ✓ Created Server AssetClass')
      } else {
        console.log('   ✓ Using existing Server AssetClass')
      }
      serverClass = await assetClassService.getAssetClass({className: 'Server'})
    } catch (error) {
      console.log('   ⚠ AssetClass setup error:', error.message)
      return
    }

    // Create some assets for relationship testing
    const webServer = await nodeService.createNode(
      'Server',
      { hostname: 'web01', ip: '10.0.1.10', role: 'web-server' },
      'Web Server',
      ['ProdWebSystem']
    )
    
    const dbServer = await nodeService.createNode(
      'Server', 
      { hostname: 'db01', ip: '10.0.1.20', role: 'database' },
      'Database Server',
      ['DatabaseSystem']
    )

    const loadBalancer = await nodeService.createNode(
      'Server',
      { hostname: 'lb01', ip: '10.0.1.5', role: 'load-balancer' },
      'Load Balancer',
      ['NetworkInfra']
    )

    console.log('   ✓ Created 3 demo assets for relationship testing')

    // === RelationshipClass Creation ===
    console.log('\n2. Creating RelationshipClass templates...')
    
    // Create DEPENDS_ON RelationshipClass
    let dependsOnClass
    try {
      const dependsOnExists = await relationshipClassService.relationshipClassExists({relationshipClassName: 'Application Dependency'})
      if (!dependsOnExists) {
        dependsOnClass = await relationshipClassService.createRelationshipClass({
          relationshipClassName: 'Application Dependency',
          relationshipType: 'DEPENDS_ON',
          propertySchema: {
            dependency_type: { 
              type: 'string', 
              required: true,
              values: ['database', 'service', 'network', 'storage']
            },
            criticality: {
              type: 'string',
              required: false,
              values: ['low', 'medium', 'high', 'critical']
            },
            port: { type: 'number', required: false },
            protocol: { type: 'string', required: false }
          },
          requiredProperties: ['dependency_type'],
          allowedFromTypes: ['Asset'],
          allowedToTypes: ['Asset'],
          description: 'Defines dependency relationships between assets'
        })
        console.log('   ✓ Created DEPENDS_ON RelationshipClass')
      } else {
        console.log('   ✓ Using existing DEPENDS_ON RelationshipClass')
        dependsOnClass = await relationshipClassService.getRelationshipClass({relationshipClassName: 'Application Dependency'})
      }
    } catch (error) {
      console.log('   ⚠ DEPENDS_ON RelationshipClass error:', error.message)
    }

    // Create LOAD_BALANCES RelationshipClass
    let loadBalancesClass
    try {
      const loadBalancesExists = await relationshipClassService.relationshipClassExists({relationshipClassName: 'Load Balancing'})
      if (!loadBalancesExists) {
        loadBalancesClass = await relationshipClassService.createRelationshipClass({
          relationshipClassName: 'Load Balancing',
          relationshipType: 'LOAD_BALANCES',
          propertySchema: {
            algorithm: {
              type: 'string',
              required: true,
              values: ['round-robin', 'least-connections', 'weighted', 'ip-hash']
            },
            health_check: { type: 'boolean', required: false },
            timeout: { type: 'number', required: false },
            max_connections: { type: 'number', required: false }
          },
          requiredProperties: ['algorithm'],
          allowedFromTypes: ['Asset'],
          allowedToTypes: ['Asset'],
          description: 'Load balancing relationships between load balancers and servers'
        })
        console.log('   ✓ Created LOAD_BALANCES RelationshipClass')
      } else {
        console.log('   ✓ Using existing LOAD_BALANCES RelationshipClass')
        loadBalancesClass = await relationshipClassService.getRelationshipClass({relationshipClassName: 'Load Balancing'})
      }
    } catch (error) {
      console.log('   ⚠ LOAD_BALANCES RelationshipClass error:', error.message)
    }

    // === RelationshipClass Schema Inspection ===
    console.log('\n3. Inspecting RelationshipClass schemas...')
    
    const availableClasses = await relationshipClassService.getAllRelationshipClasses()
    console.log(`\n📋 Available RelationshipClasses (${availableClasses.length}):`)
    
    for (const relationshipClass of availableClasses) {
      console.log(`\n• ${relationshipClass.relationshipClassName} (${relationshipClass.classId}):`)
      console.log(`  Type: ${relationshipClass.relationshipType}`)
      console.log(`  Description: ${relationshipClass.description || 'No description'}`)
      console.log(`  From: [${relationshipClass.allowedFromTypes.join(', ')}]`)
      console.log(`  To: [${relationshipClass.allowedToTypes.join(', ')}]`)
      console.log(`  Required Properties: [${relationshipClass.requiredProperties.join(', ')}]`)
      console.log(`  Optional Properties: [${relationshipClass.getOptionalProperties().join(', ')}]`)
    }

    // === Relationship Creation with Validation ===
    console.log('\n4. Creating relationships using RelationshipClass templates...')

    // Create dependency: Web Server depends on Database Server
    const webToDependency = await relationshipService.createRelationship({
      fromId: webServer.nodeId,
      toId: dbServer.nodeId,
      relationshipClassId: dependsOnClass.classId,
      properties: {
        dependency_type: 'database',
        criticality: 'high',
        port: 5432,
        protocol: 'TCP'
      }
    })
    console.log('   ✓ Created Web Server DEPENDS_ON Database Server')

    // Create load balancing: Load Balancer balances Web Server
    const lbToWebRelationship = await relationshipService.createRelationship({
      fromId: loadBalancer.nodeId,
      toId: webServer.nodeId,
      relationshipClassId: loadBalancesClass.classId,
      properties: {
        algorithm: 'round-robin',
        health_check: true,
        timeout: 30,
        max_connections: 1000
      }
    })
    console.log('   ✓ Created Load Balancer LOAD_BALANCES Web Server')

    // === Property Validation Demo ===
    console.log('\n5. Testing RelationshipClass property validation...')

    // Test 1: Valid properties
    console.log('\nTesting valid properties:')
    const validValidation = await relationshipClassService.validateRelationshipProperties({
      classId: dependsOnClass.classId,
      properties: {
        dependency_type: 'service',
        criticality: 'medium'
      }
    })
    console.log(`   ✓ Valid properties: ${validValidation.valid}`)

    // Test 2: Invalid enum value
    console.log('\nTesting invalid enum value:')
    const invalidEnumValidation = await relationshipClassService.validateRelationshipProperties({
      classId: dependsOnClass.classId,
      properties: {
        dependency_type: 'invalid_type',  // Not in allowed values
        criticality: 'medium'
      }
    })
    console.log(`   ✗ Invalid enum: ${invalidEnumValidation.valid}, errors: [${invalidEnumValidation.errors.join(', ')}]`)

    // Test 3: Missing required property
    console.log('\nTesting missing required property:')
    const missingRequiredValidation = await relationshipClassService.validateRelationshipProperties({
      classId: loadBalancesClass.classId,
      properties: {
        health_check: true  // Missing required 'algorithm'
      }
    })
    console.log(`   ✗ Missing required: ${missingRequiredValidation.valid}, errors: [${missingRequiredValidation.errors.join(', ')}]`)

    // === Relationship Query and Analysis ===
    console.log('\n6. Analyzing created relationships...')

    // Get all relationships from web server
    const webServerRelationships = await relationshipService.getRelationshipsFrom({nodeId: webServer.nodeId})
    console.log(`\n🔗 Web Server outgoing relationships (${webServerRelationships.length}):`)
    webServerRelationships.forEach(rel => {
      console.log(`   • ${rel.relationshipType} -> Asset:${rel.toId}`)
      console.log(`     Class: ${rel.relationshipClassId}`)
      console.log(`     Properties: ${JSON.stringify(rel.properties)}`)
    })

    // Get all relationships to web server
    const webServerIncoming = await relationshipService.getRelationshipsTo({nodeId: webServer.nodeId})
    console.log(`\n⬅️  Web Server incoming relationships (${webServerIncoming.length}):`)
    webServerIncoming.forEach(rel => {
      console.log(`   • Asset:${rel.fromId} -${rel.relationshipType}->`)
      console.log(`     Class: ${rel.relationshipClassId}`)
      console.log(`     Properties: ${JSON.stringify(rel.properties)}`)
    })

    // === RelationshipClass-based Queries ===
    console.log('\n7. RelationshipClass-based relationship queries...')

    // Get all DEPENDS_ON relationships
    const dependencyRelationships = await relationshipService.getRelationshipsByClass({relationshipClassId: dependsOnClass.classId})
    console.log(`\n📊 DEPENDS_ON relationships (${dependencyRelationships.length}):`)
    dependencyRelationships.forEach(rel => {
      console.log(`   • Asset:${rel.fromId} -[${rel.relationshipType}]-> Asset:${rel.toId}`)
      console.log(`     Dependency Type: ${rel.properties.dependency_type}, Criticality: ${rel.properties.criticality || 'not set'}`)
    })

    // Get all LOAD_BALANCES relationships
    const loadBalanceRelationships = await relationshipService.getRelationshipsByClass({relationshipClassId: loadBalancesClass.classId})
    console.log(`\n⚖️  LOAD_BALANCES relationships (${loadBalanceRelationships.length}):`)
    loadBalanceRelationships.forEach(rel => {
      console.log(`   • Asset:${rel.fromId} -[${rel.relationshipType}]-> Asset:${rel.toId}`)
      console.log(`     Algorithm: ${rel.properties.algorithm}, Health Check: ${rel.properties.health_check}`)
    })

    // === RelationshipClass Property Schema Helpers ===
    console.log('\n8. RelationshipClass property schema helpers...')

    const dependsOnSchema = await relationshipService.getRelationshipClassPropertySchema({relationshipClassId: dependsOnClass.classId})
    console.log(`\n📋 DEPENDS_ON RelationshipClass schema:`)
    console.log(`   Class ID: ${dependsOnSchema.classId}`)
    console.log(`   Relationship Type: ${dependsOnSchema.relationshipType}`)
    console.log(`   Required Properties: [${dependsOnSchema.requiredProperties.join(', ')}]`)
    console.log(`   Optional Properties: [${dependsOnSchema.optionalProperties.join(', ')}]`)
    console.log(`   Default Properties: ${JSON.stringify(dependsOnSchema.defaultProperties)}`)

    // === Relationship Statistics ===
    console.log('\n9. Relationship statistics and overview...')

    const relationshipStats = await relationshipService.getRelationshipStats()
    console.log(`\n📈 Relationship Statistics:`)
    relationshipStats.forEach(stat => {
      console.log(`   • ${stat.relationshipType}: ${stat.count} relationships (${stat.fromType} -> ${stat.toType})`)
    })

    // === Available RelationshipClasses for UI ===
    console.log('\n10. Available RelationshipClasses for UI selection...')

    const availableForUI = await relationshipService.getAvailableRelationshipClasses()
    console.log(`\n🎯 User-facing RelationshipClasses (${availableForUI.length}):`)
    availableForUI.forEach(rc => {
      console.log(`   • ${rc.relationshipClassName} (${rc.classId})`)
      console.log(`     Type: ${rc.relationshipType}`)
      console.log(`     From: [${rc.allowedFromTypes.join(', ')}] To: [${rc.allowedToTypes.join(', ')}]`)
      console.log(`     Description: ${rc.description || 'No description'}`)
    })

    // === Error Handling Demo ===
    console.log('\n11. Testing error handling and validation...')

    // Test 1: Try to create relationship with non-existent RelationshipClass
    console.log('\nTesting non-existent RelationshipClass:')
    try {
      await relationshipService.createRelationship({
        fromId: webServer.nodeId,
        toId: dbServer.nodeId,
        relationshipClassId: 'non-existent-class',
        properties: {}
      })
      console.log('   ❌ ERROR: Should have failed!')
    } catch (error) {
      console.log(`   ✓ Correctly handled non-existent RelationshipClass: ${error.message.substring(0, 80)}...`)
    }

    // Test 2: Try to create relationship with invalid properties
    console.log('\nTesting invalid properties:')
    try {
      await relationshipService.createRelationship({
        fromId: webServer.nodeId,
        toId: dbServer.nodeId,
        relationshipClassId: dependsOnClass.classId,
        properties: {
          dependency_type: 'invalid_value'  // Not in allowed enum values
        }
      })
      console.log('   ❌ ERROR: Should have failed!')
    } catch (error) {
      console.log(`   ✓ Correctly validated property values: ${error.message.substring(0, 80)}...`)
    }

    // Test 3: Try to create relationship missing required properties
    console.log('\nTesting missing required properties:')
    try {
      await relationshipService.createRelationship({
        fromId: loadBalancer.nodeId,
        toId: webServer.nodeId,
        relationshipClassId: loadBalancesClass.classId,
        properties: {
          health_check: true  // Missing required 'algorithm'
        }
      })
      console.log('   ❌ ERROR: Should have failed!')
    } catch (error) {
      console.log(`   ✓ Correctly validated required properties: ${error.message.substring(0, 80)}...`)
    }

    console.log('\n=== Demo Complete ===')
    console.log('RelationshipClass template system and Relationship validation demonstrated successfully!')

  } catch (error) {
    console.error('Demo failed:', error)
    throw error
  } finally {
    // Cleanup
    await relationshipClassService.close()
    await relationshipService.close()
    await assetClassService.close()
    await nodeService.close()
    // Close Neo4j connection for demo cleanup
    const { Neo4jService } = await import('../database/Neo4jService.js')
    const neo4jService = Neo4jService.getInstance()
    await neo4jService.close()
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  relationshipDemo()
    .then(() => {
      console.log('\nRelationship demo completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nRelationship demo failed:', error)
      process.exit(1)
    })
}

export { relationshipDemo }
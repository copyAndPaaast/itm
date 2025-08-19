import { Neo4jService } from './Neo4jService.js'

async function databaseDemo() {
  console.log('\n=== Neo4j Database Service Demo ===\n')
  
  try {
    // === Singleton Pattern Demo ===
    console.log('1. Demonstrating singleton pattern...')
    const neo4j1 = Neo4jService.getInstance()
    const neo4j2 = Neo4jService.getInstance()
    const neo4j3 = new Neo4jService()
    
    console.log(`   ✓ getInstance() returns same instance: ${neo4j1 === neo4j2}`)
    console.log(`   ✓ new Neo4jService() returns same instance: ${neo4j1 === neo4j3}`)
    console.log(`   ✓ All references point to same singleton\n`)

    // === Connection Testing Demo ===
    console.log('2. Testing database connectivity...')
    const connectionTest = await neo4j1.testConnection()
    console.log(`   ✓ Connection test result: ${connectionTest ? 'SUCCESS' : 'FAILED'}`)
    
    if (connectionTest) {
      const status = neo4j1.getStatus()
      console.log(`   ✓ Database: ${status.databaseName}`)
      console.log(`   ✓ URI: ${status.neo4jUri}`)
      console.log(`   ✓ Connected: ${status.isConnected}`)
      console.log(`   ✓ Active sessions: ${status.activeSessions}\n`)
    } else {
      console.log('   ⚠ Skipping remaining demos due to connection failure\n')
      return
    }

    // === Direct Query Execution Demo ===
    console.log('3. Demonstrating direct query execution...')
    const result = await neo4j1.executeQuery(
      'RETURN $message as greeting, datetime() as timestamp', 
      { message: 'Hello from Neo4jService!' }
    )
    const record = result.records[0]
    console.log(`   ✓ Query result: ${record.get('greeting')}`)
    console.log(`   ✓ Timestamp: ${record.get('timestamp').toString()}\n`)

    // === Session Management Demo ===
    console.log('4. Demonstrating session management and tracking...')
    const initialSessions = neo4j1.getStatus().activeSessions
    console.log(`   Initial active sessions: ${initialSessions}`)
    
    // Create multiple sessions
    const session1 = neo4j1.getSession()
    const session2 = neo4j1.getSession()
    const session3 = neo4j1.getSession()
    
    const midSessions = neo4j1.getStatus().activeSessions
    console.log(`   After creating 3 sessions: ${midSessions}`)
    console.log(`   ✓ Session count increased by 3: ${midSessions === initialSessions + 3}`)
    
    // Use sessions
    const sessionResults = await Promise.all([
      session1.run('RETURN "Session 1" as id'),
      session2.run('RETURN "Session 2" as id'),
      session3.run('RETURN "Session 3" as id')
    ])
    
    sessionResults.forEach((result, index) => {
      console.log(`   ✓ ${result.records[0].get('id')} executed successfully`)
    })
    
    // Close sessions
    await session1.close()
    await session2.close()
    await session3.close()
    
    const finalSessions = neo4j1.getStatus().activeSessions
    console.log(`   After closing sessions: ${finalSessions}`)
    console.log(`   ✓ Session count returned to initial: ${finalSessions === initialSessions}\n`)

    // === Transaction Demo ===
    console.log('5. Demonstrating transaction support...')
    
    // Write transaction
    const writeResult = await neo4j1.executeTransaction(async (tx) => {
      const result = await tx.run(
        'CREATE (demo:DemoNode {name: $name, created: datetime()}) RETURN demo',
        { name: 'Neo4jService Demo Node' }
      )
      return result
    })
    
    const createdNode = writeResult.records[0].get('demo')
    console.log(`   ✓ Created demo node with ID: ${createdNode.identity.toString()}`)
    
    // Read transaction
    const readResult = await neo4j1.executeReadTransaction(async (tx) => {
      return await tx.run('MATCH (demo:DemoNode) RETURN count(demo) as nodeCount')
    })
    
    const nodeCount = readResult.records[0].get('nodeCount').toNumber()
    console.log(`   ✓ Found ${nodeCount} demo nodes in database`)
    
    // Cleanup
    await neo4j1.executeTransaction(async (tx) => {
      return await tx.run('MATCH (demo:DemoNode) DELETE demo')
    })
    console.log(`   ✓ Cleaned up demo nodes\n`)

    // === Neo4j Types Demo ===
    console.log('6. Demonstrating Neo4j type helpers...')
    const types = neo4j1.getTypes()
    const intValue = neo4j1.int(12345)
    
    console.log(`   ✓ Neo4j integer helper: ${intValue.toString()}`)
    console.log(`   ✓ Available types: ${Object.keys(types).join(', ')}\n`)

    // === Final Status ===
    console.log('7. Final database service status...')
    const finalStatus = neo4j1.getStatus()
    console.log(`   Database: ${finalStatus.databaseName}`)
    console.log(`   Connected: ${finalStatus.isConnected}`)
    console.log(`   Active sessions: ${finalStatus.activeSessions}`)
    console.log(`   URI: ${finalStatus.neo4jUri}`)

    console.log('\n=== Demo Complete ===')
    console.log('Neo4j Database Service functionality demonstrated successfully!')
    
    // Close connection for demo cleanup (normally this would be done at app shutdown)
    console.log('\n🔧 Closing Neo4j connection for demo cleanup...')
    await neo4j1.close()
    console.log('✅ Connection closed')

  } catch (error) {
    console.error('\n❌ Demo failed:', error.message)
    console.error('Stack:', error.stack)
    
    // Ensure cleanup on error
    try {
      const neo4jService = Neo4jService.getInstance()
      await neo4jService.close()
    } catch (closeError) {
      console.error('Error during cleanup:', closeError.message)
    }
    
    throw error
  }
}

// Run demo if this file is executed directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  databaseDemo()
    .then(() => {
      console.log('\nDatabase demo completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\nDatabase demo failed:', error)
      process.exit(1)
    })
}

export { databaseDemo }
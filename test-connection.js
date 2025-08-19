import { Neo4jService } from './src/database/Neo4jService.js'

async function testConnection() {
  console.log('Testing Neo4j connection using centralized Neo4jService...')
  
  const neo4jService = Neo4jService.getInstance()
  const status = neo4jService.getStatus()
  
  console.log('URI:', status.neo4jUri)
  console.log('Database:', status.databaseName)
  
  try {
    console.log('Attempting to connect and run simple query...')
    const connectionTest = await neo4jService.testConnection()
    
    if (connectionTest) {
      console.log('✅ Connection test successful!')
      
      // Test direct query execution
      const result = await neo4jService.executeQuery('RETURN "Hello Neo4j via Neo4jService" as message')
      console.log('Result:', result.records[0].get('message'))
      
      // Test session management
      const session = neo4jService.getSession()
      const sessionResult = await session.run('RETURN "Session test" as sessionMessage')
      console.log('Session Result:', sessionResult.records[0].get('sessionMessage'))
      await session.close()
      
      console.log('\n📊 Final Status:')
      const finalStatus = neo4jService.getStatus()
      console.log('Connected:', finalStatus.isConnected)
      console.log('Active Sessions:', finalStatus.activeSessions)
      
    } else {
      console.error('❌ Connection test failed!')
    }
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
  }
  
  // Close connection for test cleanup
  console.log('\n🔧 Closing connection for test cleanup...')
  await neo4jService.close()
  console.log('✅ Connection closed')
}

testConnection()
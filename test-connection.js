import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'

dotenv.config()

async function testConnection() {
  console.log('Testing Neo4j connection...')
  console.log('URI:', process.env.NEO4J_URI)
  console.log('Username:', process.env.NEO4J_USERNAME)
  console.log('Database:', process.env.NEO4J_DATABASE)
  
  const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USERNAME, process.env.NEO4J_PASSWORD)
  )
  
  try {
    const session = driver.session({ database: process.env.NEO4J_DATABASE || 'neo4j' })
    
    console.log('Attempting to connect and run simple query...')
    const result = await session.run('RETURN "Hello Neo4j" as message')
    
    console.log('✅ Connection successful!')
    console.log('Result:', result.records[0].get('message'))
    
    await session.close()
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
  } finally {
    await driver.close()
  }
}

testConnection()
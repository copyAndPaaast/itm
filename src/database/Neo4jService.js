import neo4j from 'neo4j-driver'

/**
 * Centralized Neo4j connection service implementing Singleton pattern
 * Provides database sessions to other services while managing connection lifecycle
 * Browser-only implementation using Vite environment variables
 */
export class Neo4jService {
  static instance = null

  constructor() {
    if (Neo4jService.instance) {
      return Neo4jService.instance
    }
    
    this.driver = neo4j.driver(
      import.meta.env.VITE_NEO4J_URI,
      neo4j.auth.basic(import.meta.env.VITE_NEO4J_USERNAME, import.meta.env.VITE_NEO4J_PASSWORD)
    )
    this.database = import.meta.env.VITE_NEO4J_DATABASE || 'neo4j'
    this.isConnected = false
    this.sessionCount = 0

    Neo4jService.instance = this
  }

  /**
   * Get the singleton instance
   * @returns {Neo4jService} The singleton instance
   */
  static getInstance() {
    if (!Neo4jService.instance) {
      Neo4jService.instance = new Neo4jService()
    }
    return Neo4jService.instance
  }

  /**
   * Get a Neo4j session for database operations
   * @param {object} options - Session options (optional)
   * @returns {Session} Neo4j session
   */
  getSession(options = {}) {
    const sessionOptions = {
      database: this.database,
      ...options
    }
    
    this.sessionCount++
    const session = this.driver.session(sessionOptions)
    
    // Wrap the close method to track session count
    const originalClose = session.close.bind(session)
    session.close = async () => {
      this.sessionCount--
      return await originalClose()
    }

    return session
  }

  /**
   * Execute a query with automatic session management
   * @param {string} query - Cypher query
   * @param {object} parameters - Query parameters
   * @param {object} options - Session options
   * @returns {Promise<Result>} Query result
   */
  async executeQuery(query, parameters = {}, options = {}) {
    const session = this.getSession(options)
    
    try {
      const result = await session.run(query, parameters)
      return result
    } finally {
      await session.close()
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} transactionWork - Function that receives transaction object
   * @param {object} options - Session options
   * @returns {Promise} Transaction result
   */
  async executeTransaction(transactionWork, options = {}) {
    const session = this.getSession(options)
    
    try {
      return await session.executeWrite(transactionWork)
    } finally {
      await session.close()
    }
  }

  /**
   * Execute read-only transaction
   * @param {Function} transactionWork - Function that receives transaction object
   * @param {object} options - Session options
   * @returns {Promise} Transaction result
   */
  async executeReadTransaction(transactionWork, options = {}) {
    const session = this.getSession(options)
    
    try {
      return await session.executeRead(transactionWork)
    } finally {
      await session.close()
    }
  }

  /**
   * Test database connectivity
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      await this.executeQuery('RETURN 1 as test')
      this.isConnected = true
      return true
    } catch (error) {
      this.isConnected = false
      console.error('Neo4j connection test failed:', error.message)
      return false
    }
  }

  /**
   * Get connection status information
   * @returns {object} Connection status details
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      activeSessions: this.sessionCount,
      databaseName: this.database,
      neo4jUri: import.meta.env.VITE_NEO4J_URI
    }
  }

  /**
   * Get Neo4j integer helper
   * @param {number} value - Number to convert
   * @returns {Integer} Neo4j integer
   */
  int(value) {
    return neo4j.int(value)
  }

  /**
   * Get Neo4j types for direct access
   * @returns {object} Neo4j types
   */
  getTypes() {
    return {
      int: neo4j.int,
      Date: neo4j.Date,
      DateTime: neo4j.DateTime,
      Duration: neo4j.Duration,
      LocalDate: neo4j.LocalDate,
      LocalDateTime: neo4j.LocalDateTime,
      LocalTime: neo4j.LocalTime,
      Time: neo4j.Time
    }
  }

  /**
   * Close the database connection
   * Should only be called when application is shutting down
   */
  async close() {
    if (this.sessionCount > 0) {
      console.warn(`Closing Neo4j driver with ${this.sessionCount} active sessions`)
    }
    
    await this.driver.close()
    this.isConnected = false
    Neo4jService.instance = null
  }

  /**
   * Reset the singleton instance (for testing purposes only)
   */
  static resetInstance() {
    if (Neo4jService.instance) {
      Neo4jService.instance.close()
    }
    Neo4jService.instance = null
  }
}
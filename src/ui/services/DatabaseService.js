/**
 * DatabaseService - UI service for database operations and health checks
 * 
 * Provides UI-friendly interface to the backend Neo4j service with proper
 * error handling and status feedback integration.
 */

import { Neo4jService } from '../../database/Neo4jService.js'

export class DatabaseService {
  static instance = null

  constructor() {
    if (DatabaseService.instance) {
      return DatabaseService.instance
    }

    this.neo4jService = Neo4jService.getInstance()
    this.lastHealthCheck = null
    this.healthCheckInterval = null
    
    DatabaseService.instance = this
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService()
    }
    return DatabaseService.instance
  }

  /**
   * Perform comprehensive database health check
   * @returns {Promise<Object>} Health check result with details
   */
  async performHealthCheck() {
    const startTime = Date.now()
    
    try {
      // Test basic connectivity
      const isConnected = await this.neo4jService.testConnection()
      const responseTime = Date.now() - startTime
      
      if (!isConnected) {
        return {
          status: 'error',
          message: 'Database connection failed',
          details: 'Unable to connect to Neo4j database',
          timestamp: Date.now(),
          responseTime: responseTime
        }
      }

      // Get additional status information
      const dbStatus = this.neo4jService.getStatus()
      
      // Test a simple query to verify functionality
      const queryStartTime = Date.now()
      await this.neo4jService.executeQuery('RETURN datetime() as currentTime')
      const queryTime = Date.now() - queryStartTime

      this.lastHealthCheck = {
        status: 'success',
        message: 'Database connection healthy',
        details: `Connected to ${dbStatus.databaseName} (${responseTime}ms response, ${queryTime}ms query)`,
        timestamp: Date.now(),
        responseTime: responseTime,
        queryTime: queryTime,
        activeSessions: dbStatus.activeSessions,
        databaseName: dbStatus.databaseName
      }

      return this.lastHealthCheck

    } catch (error) {
      const errorResult = {
        status: 'error', 
        message: 'Database health check failed',
        details: error.message,
        timestamp: Date.now(),
        responseTime: Date.now() - startTime,
        error: error.name
      }

      this.lastHealthCheck = errorResult
      return errorResult
    }
  }

  /**
   * Start periodic health checks
   * @param {number} intervalMs - Check interval in milliseconds (default: 30 seconds)
   * @param {Function} onStatusChange - Callback for status changes
   */
  startHealthMonitoring(intervalMs = 30000, onStatusChange = null) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      const result = await this.performHealthCheck()
      if (onStatusChange) {
        onStatusChange(result)
      }
    }, intervalMs)
  }

  /**
   * Stop periodic health checks
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * Get last health check result
   */
  getLastHealthCheck() {
    return this.lastHealthCheck
  }

  /**
   * Quick connection test (lightweight)
   * @returns {Promise<boolean>} True if connected
   */
  async isConnected() {
    try {
      return await this.neo4jService.testConnection()
    } catch (error) {
      return false
    }
  }

  /**
   * Get database status for display
   */
  getDisplayStatus() {
    if (!this.lastHealthCheck) {
      return {
        status: 'unknown',
        message: 'Checking database connection...',
        details: 'Initial health check in progress'
      }
    }

    return this.lastHealthCheck
  }

  /**
   * Ensure default node and edge classes exist
   * Proxy method to Neo4jService.ensureDefaultClasses()
   */
  async ensureDefaultClasses() {
    console.log('📞 DatabaseService.ensureDefaultClasses() called - proxying to Neo4jService...')
    return await this.neo4jService.ensureDefaultClasses()
  }
}

export default DatabaseService
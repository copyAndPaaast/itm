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
   * Create database constraints to prevent duplicate entries
   */
  async ensureConstraints() {
    const session = this.getSession()
    
    try {
      console.log('🔒 Creating database constraints...')
      
      // Constraint for unique AssetClass names
      await session.run(`
        CREATE CONSTRAINT assetclass_name_unique 
        IF NOT EXISTS 
        FOR (ac:_AssetClass) 
        REQUIRE ac.className IS UNIQUE
      `)
      
      // Constraint for unique RelationshipClass names  
      await session.run(`
        CREATE CONSTRAINT relationshipclass_name_unique 
        IF NOT EXISTS 
        FOR (rc:_RelationshipClass) 
        REQUIRE rc.relationshipClassName IS UNIQUE
      `)
      
      console.log('✅ Database constraints created successfully')
      
    } catch (error) {
      // Constraints might already exist, which is fine
      console.log('ℹ️ Constraints already exist or creation skipped:', error.message)
    } finally {
      await session.close()
    }
  }

  /**
   * Ensure default node and edge classes exist for basic graph operations
   * Creates minimal generic classes if they don't already exist
   */
  async ensureDefaultClasses() {
    // First ensure constraints exist to prevent duplicates
    await this.ensureConstraints()
    if (this._defaultClassesInitialized) {
      console.log('✅ Default classes already initialized, skipping...')
      return // Already initialized
    }

    try {
      console.log('🏗️ Starting default classes initialization...')
      console.log('🔍 Current Neo4j connection status:', this.getStatus())

      // Import services dynamically to avoid circular dependencies
      console.log('📦 Importing AssetClassService...')
      const { AssetClassService } = await import('../NodeModule/assetclass/AssetClassService.js')
      console.log('📦 Importing RelationshipClassService...')
      const { RelationshipClassService } = await import('../RelationModule/relationshipclass/RelationshipClassService.js')

      console.log('🏭 Creating service instances...')
      const assetClassService = new AssetClassService()
      const relationshipClassService = new RelationshipClassService()

      console.log('🏗️ Creating default asset class...')
      await this._ensureDefaultAssetClass(assetClassService)

      console.log('🔗 Creating default relationship class...')
      await this._ensureDefaultRelationshipClass(relationshipClassService)

      this._defaultClassesInitialized = true
      console.log('✅ Default classes initialization complete successfully')

    } catch (error) {
      console.error('❌ FAILED to initialize default classes:')
      console.error('   Error type:', error.constructor.name)
      console.error('   Error message:', error.message)
      console.error('   Stack trace:', error.stack)
      throw error
    }
  }

  /**
   * Create default generic asset class for basic node creation
   * @private
   */
  async _ensureDefaultAssetClass(assetClassService) {
    const className = 'Default'

    try {
      console.log(`🔍 Checking if AssetClass '${className}' exists...`)
      const exists = await assetClassService.assetClassExists({ className })
      console.log(`📋 AssetClass '${className}' exists check result:`, exists)

      if (!exists) {
        console.log(`🏗️ Creating default AssetClass: ${className}`)
        console.log('📝 AssetClass data:', {
          className,
          propertySchema: {
            name: {
              type: 'string',
              required: true,
              default: 'New Asset',
              description: 'Asset name or identifier'
            },
            description: {
              type: 'string',
              required: false,
              default: '',
              description: 'Optional asset description'
            }
          },
          requiredProperties: ['name']
        })

        await assetClassService.createAssetClass({
          className,
          propertySchema: {
            name: {
              type: 'string',
              required: true,
              default: 'New Asset',
              description: 'Asset name or identifier'
            },
            description: {
              type: 'string',
              required: false,
              default: '',
              description: 'Optional asset description'
            }
          },
          requiredProperties: ['name']
        })
        console.log(`✅ Default AssetClass '${className}' created successfully`)
      } else {
        console.log(`✅ Default AssetClass '${className}' already exists`)
      }
    } catch (error) {
      console.error(`❌ FAILED to ensure default AssetClass '${className}':`)
      console.error('   Error type:', error.constructor.name)
      console.error('   Error message:', error.message)
      console.error('   Stack trace:', error.stack)
      throw error
    }
  }

  /**
   * Create default generic relationship class for basic edge creation
   * @private
   */
  async _ensureDefaultRelationshipClass(relationshipClassService) {
    const relationshipClassName = 'Default'
    const relationshipType = 'CONNECTS_TO'

    try {
      console.log(`🔍 Checking if RelationshipClass '${relationshipClassName}' exists...`)
      const exists = await relationshipClassService.relationshipClassExists({ relationshipClassName })
      console.log(`📋 RelationshipClass '${relationshipClassName}' exists check result:`, exists)

      if (!exists) {
        console.log(`🏗️ Creating default RelationshipClass: ${relationshipClassName} (${relationshipType})`)
        console.log('📝 RelationshipClass data:', {
          relationshipClassName,
          relationshipType,
          propertySchema: {
            connection_type: {
              type: 'string',
              required: false,
              default: 'general',
              description: 'Type of connection between assets'
            }
          },
          requiredProperties: [],
          allowedFromTypes: ['Asset'],
          allowedToTypes: ['Asset'],
          description: 'Generic connection between any two assets'
        })

        await relationshipClassService.createRelationshipClass({
          relationshipClassName,
          relationshipType,
          propertySchema: {
            connection_type: {
              type: 'string',
              required: false,
              default: 'general',
              description: 'Type of connection between assets'
            }
          },
          requiredProperties: [],
          allowedFromTypes: ['Asset'],
          allowedToTypes: ['Asset'],
          description: 'Generic connection between any two assets'
        })
        console.log(`✅ Default RelationshipClass '${relationshipClassName}' created successfully`)
      } else {
        console.log(`✅ Default RelationshipClass '${relationshipClassName}' already exists`)
      }
    } catch (error) {
      console.error(`❌ FAILED to ensure default RelationshipClass '${relationshipClassName}':`)
      console.error('   Error type:', error.constructor.name)
      console.error('   Error message:', error.message)
      console.error('   Stack trace:', error.stack)
      throw error
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
    this._defaultClassesInitialized = false
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

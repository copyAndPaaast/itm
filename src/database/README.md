# Database Module

## Overview
The Database module provides centralized Neo4j connection management through a singleton service. This eliminates code duplication and ensures consistent database connection handling across all services.

## Neo4jService

### Purpose
- **Singleton pattern**: Ensures only one Neo4j driver instance across the application
- **Session management**: Provides session creation with automatic tracking
- **Connection lifecycle**: Handles connection setup, testing, and cleanup
- **Utility methods**: Provides Neo4j types and helper functions

### Key Features

**Singleton Pattern:**
```javascript
const neo4j1 = Neo4jService.getInstance()
const neo4j2 = Neo4jService.getInstance()
// neo4j1 === neo4j2 (same instance)
```

**Session Management:**
```javascript
const session = neo4jService.getSession()
// Use session for queries
await session.close() // Automatically tracked
```

**Query Helpers:**
```javascript
// Simple query with auto-session management
const result = await neo4jService.executeQuery('MATCH (n) RETURN n')

// Transaction support
const result = await neo4jService.executeTransaction(async (tx) => {
  return await tx.run('CREATE (n:Test) RETURN n')
})
```

**Connection Management:**
```javascript
// Test connectivity
const isConnected = await neo4jService.testConnection()

// Get status information
const status = neo4jService.getStatus()
// { isConnected, activeSessions, databaseName, neo4jUri }
```

### Usage in Services

**Before (duplicated in each service):**
```javascript
import neo4j from 'neo4j-driver'
import dotenv from 'dotenv'

export class SomeService {
  constructor() {
    this.driver = neo4j.driver(...)
    this.database = process.env.NEO4J_DATABASE || 'neo4j'
  }
  
  async someMethod() {
    const session = this.driver.session({ database: this.database })
    try {
      const result = await session.run('...', { id: neo4j.int(id) })
      return result
    } finally {
      await session.close()
    }
  }
}
```

**After (using centralized Neo4jService):**
```javascript
import { Neo4jService } from '../database/Neo4jService.js'

export class SomeService {
  constructor() {
    this.neo4jService = Neo4jService.getInstance()
  }
  
  async someMethod() {
    const session = this.neo4jService.getSession()
    try {
      const result = await session.run('...', { id: this.neo4jService.int(id) })
      return result
    } finally {
      await session.close()
    }
  }
}
```

### Integration with Existing Services

**Services Updated:**
- `NodeService` - Uses Neo4jService for all database operations
- `AssetClassService` - Uses Neo4jService for all database operations  
- `SystemService` - Uses Neo4jService for all database operations

**Benefits:**
- **Single connection pool**: All services share the same Neo4j driver instance
- **Consistent configuration**: Database settings managed in one place
- **Session tracking**: Monitor active sessions across all services
- **Easier testing**: Single point to mock or configure database connections
- **Better resource management**: Centralized connection lifecycle management

### Configuration

Uses the same environment variables as before:
```env
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j
```

### Testing

Run the comprehensive test:
```bash
node test-neo4j-service.js
```

This tests:
- Singleton pattern behavior
- Connection functionality
- Session tracking
- Service integration
- Query execution
- Resource cleanup

### Application Shutdown

The Neo4jService should be closed when the application shuts down:
```javascript
// At application shutdown
const neo4jService = Neo4jService.getInstance()
await neo4jService.close()
```

Individual services no longer manage Neo4j connections directly - they only clean up their own resources when closed.

## Status: ✅ Complete
- [x] Neo4jService singleton implementation
- [x] Session management with tracking
- [x] Query execution helpers
- [x] Transaction support
- [x] All services migrated to use Neo4jService
- [x] Connection testing and status monitoring
- [x] Comprehensive test suite
- [x] Documentation

## Migration Benefits
- **Eliminated code duplication**: Removed ~50 lines of duplicated connection code across services
- **Centralized configuration**: Single point for database settings
- **Better resource management**: Shared connection pool and session tracking
- **Easier maintenance**: Database-related changes only need to be made in one place
- **Improved testability**: Single service to mock for testing
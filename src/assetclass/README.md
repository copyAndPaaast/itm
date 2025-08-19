# AssetClass Module

## Overview
The AssetClass module defines types for IT assets that can be created in the graph system. AssetClasses serve as templates that define what properties an asset should have.

## Components

### AssetClassInterface.js
Defines the contract for AssetClass operations:
- `createAssetClass(className, propertySchema, requiredProperties)`
- `getAssetClass(classId)`
- `getAllAssetClasses()`
- `updateAssetClass(classId, updates)`
- `deleteAssetClass(classId)` (hard delete - removes node from Neo4j)
- `assetClassExists(className)` (checks if AssetClass with name exists)
- `validateAssetClassSchema(propertySchema)`

### AssetClassModel.js
Data model representing an AssetClass:
- **classId**: Neo4j node ID (null until persisted)
- **className**: Name of the asset type (e.g., "Server", "Application")
- **propertySchema**: Object defining expected properties and their types
- **requiredProperties**: Array of property names that must be present
- **createdBy**: Who created this class
- **createdDate**: When it was created
- **isActive**: Whether this class is available for use

### AssetClassService.js
Neo4j-backed implementation of AssetClassInterface:
- Connects to Neo4j using environment variables
- Creates nodes with `:AssetClass` label
- Provides CRUD operations
- Validates property schemas

## Property Schema Format
```javascript
{
  "hostname": { "type": "string", "required": true },
  "cpu_cores": { "type": "number" },
  "is_virtual": { "type": "boolean" }
}
```

## Example Usage
```javascript
const service = new AssetClassService()

// Create a Server asset class
const serverClass = await service.createAssetClass(
  "Server",
  {
    hostname: { type: "string" },
    ip_address: { type: "string" },
    os: { type: "string" },
    cpu_cores: { type: "number" },
    memory_gb: { type: "number" }
  },
  ["hostname", "ip_address"]
)
```

## Current Status
✅ **COMPLETED** - Ready for use
- Interface defined
- Model implemented with validation
- Neo4j service implementation
- Property schema validation
- Hard delete functionality (actual node removal)
- Duplicate prevention with existence checking
- Allow recreation of deleted AssetClasses

## Neo4j Schema
```cypher
CREATE (ac:AssetClass {
  className: "Server",
  propertySchema: {...},
  requiredProperties: [...],
  createdBy: "user",
  createdDate: "2024-01-15T10:30:00Z",
  isActive: true
})
```
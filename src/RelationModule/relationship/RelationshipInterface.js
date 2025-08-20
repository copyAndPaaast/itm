/**
 * RelationshipInterface defines the contract for Relationship management in the ITM system.
 * Relationships represent connections between nodes (IT assets) based on RelationshipClass templates.
 * 
 * Key Concepts:
 * - Relationships are instances of RelationshipClasses with validated properties
 * - Direction Matters: Relationships have explicit from/to directionality
 * - Property Validation: All properties must conform to the RelationshipClass schema
 * - User Data Only: Interface manages user business relationships, not ITM app internals
 * - Class Switching: Relationships can change type while preserving properties
 */
export class RelationshipInterface {
  
  /**
   * Creates a new relationship instance from a RelationshipClass template.
   * 
   * @param {Object} params - Relationship creation parameters
   * @param {string|number} params.fromId - Source node identifier
   * @param {string|number} params.toId - Target node identifier
   * @param {string|number} params.relationshipClassId - RelationshipClass to instantiate
   * @param {Object} params.properties - Key-value pairs for relationship properties
   * @returns {Promise<RelationshipModel>} The created relationship with generated relationshipId
   * 
   * Purpose: Establish typed connections between IT assets based on business rules.
   * Examples: Dependencies, data flows, ownership, physical connections.
   * Validation: Properties are validated against RelationshipClass schema.
   * Direction: Creates directional relationship from source to target node.
   */
  async createRelationship({fromId, toId, relationshipClassId, properties = {}}) {
    throw new Error('createRelationship method must be implemented')
  }

  /**
   * Retrieves a single relationship by its unique identifier.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.relationshipId - The unique identifier of the relationship
   * @returns {Promise<RelationshipModel|null>} The relationship if found, null otherwise
   * 
   * Purpose: Fetch complete relationship data including properties and endpoints.
   * Usage: Relationship details, edit forms, validation, debugging.
   */
  async getRelationship({relationshipId}) {
    throw new Error('getRelationship method must be implemented')
  }

  /**
   * Retrieves all relationships originating from a specific node.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The source node identifier
   * @returns {Promise<RelationshipModel[]>} Array of outgoing relationships
   * 
   * Purpose: Find dependencies, connections, or outputs from a specific asset.
   * Usage: Dependency analysis, impact assessment, network topology.
   * Direction: Returns relationships where the specified node is the source.
   */
  async getRelationshipsFrom({nodeId}) {
    throw new Error('getRelationshipsFrom method must be implemented')
  }

  /**
   * Retrieves all relationships terminating at a specific node.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The target node identifier
   * @returns {Promise<RelationshipModel[]>} Array of incoming relationships
   * 
   * Purpose: Find what depends on, connects to, or inputs into a specific asset.
   * Usage: Dependency analysis, upstream impact, reverse lookups.
   * Direction: Returns relationships where the specified node is the target.
   */
  async getRelationshipsTo({nodeId}) {
    throw new Error('getRelationshipsTo method must be implemented')
  }

  /**
   * Retrieves all relationships connected to a specific node (both directions).
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The node identifier
   * @returns {Promise<RelationshipModel[]>} Array of all connected relationships
   * 
   * Purpose: Complete connectivity view for a node regardless of direction.
   * Usage: Full relationship inventory, comprehensive impact analysis.
   * Performance: Combines both incoming and outgoing relationships.
   */
  async getAllRelationships({nodeId}) {
    throw new Error('getAllRelationships method must be implemented')
  }

  /**
   * Updates properties of an existing relationship.
   * 
   * @param {Object} params - Update parameters
   * @param {string|number} params.relationshipId - The unique identifier of the relationship
   * @param {Object} params.properties - Properties to update (partial update supported)
   * @returns {Promise<RelationshipModel|null>} The updated relationship if successful
   * 
   * Purpose: Modify relationship data while maintaining RelationshipClass schema compliance.
   * Validation: New properties are merged with existing and validated against RelationshipClass.
   * Behavior: Partial updates supported; only provided properties are changed.
   */
  async updateRelationship({relationshipId, properties}) {
    throw new Error('updateRelationship method must be implemented')
  }

  /**
   * Permanently removes a relationship from the system.
   * 
   * @param {Object} params - Deletion parameters
   * @param {string|number} params.relationshipId - The unique identifier of the relationship
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   * 
   * Purpose: Remove incorrect or obsolete connections between assets.
   * Warning: This is a destructive operation; consider archiving for audit trails.
   * Safety: Does not affect the connected nodes, only the relationship.
   */
  async deleteRelationship({relationshipId}) {
    throw new Error('deleteRelationship method must be implemented')
  }

  /**
   * Retrieves all relationships of a specific type.
   * 
   * @param {Object} params - Query parameters
   * @param {string} params.relationshipType - The relationship type to filter by
   * @returns {Promise<RelationshipModel[]>} Array of relationships of the specified type
   * 
   * Purpose: Find all instances of a specific relationship pattern.
   * Examples: All dependencies, all data flows, all ownership relationships.
   * Usage: Pattern analysis, bulk operations, relationship type auditing.
   */
  async getRelationshipsByType({relationshipType}) {
    throw new Error('getRelationshipsByType method must be implemented')
  }

  /**
   * Checks if a relationship exists between two specific nodes.
   * 
   * @param {Object} params - Check parameters
   * @param {string|number} params.fromId - Source node identifier
   * @param {string|number} params.toId - Target node identifier
   * @param {string} params.relationshipType - The relationship type to check for
   * @returns {Promise<boolean>} True if relationship exists, false otherwise
   * 
   * Purpose: Prevent duplicate relationships, validate connections before operations.
   * Performance: Lightweight check without loading full relationship data.
   * Direction: Checks for relationship in the specified direction only.
   */
  async relationshipExists({fromId, toId, relationshipType}) {
    throw new Error('relationshipExists method must be implemented')
  }

  /**
   * Retrieves all unique relationship types currently in use.
   * 
   * @returns {Promise<string[]>} Array of relationship type strings
   * 
   * Purpose: Discover available relationship patterns, build filter lists.
   * Usage: UI dropdowns, reporting categories, system inventory.
   * Result: Returns only types that have active relationship instances.
   */
  async getAllRelationshipTypes() {
    throw new Error('getAllRelationshipTypes method must be implemented')
  }

  /**
   * Switches the direction of a relationship while preserving properties.
   * 
   * @param {Object} params - Direction switch parameters
   * @param {string|number} params.relationshipId - The relationship to reverse
   * @returns {Promise<RelationshipModel>} The new relationship with reversed direction
   * 
   * Purpose: Correct relationship direction during design process.
   * Behavior: Creates new relationship in opposite direction, deletes original.
   * Atomicity: Operation is transactional; failure leaves system unchanged.
   * Properties: All properties are preserved in the reversed relationship.
   */
  async switchRelationshipDirection({relationshipId}) {
    throw new Error('switchRelationshipDirection method must be implemented')
  }

  /**
   * Analyzes compatibility between current relationship and a target RelationshipClass.
   * 
   * @param {Object} params - Analysis parameters
   * @param {string|number} params.relationshipId - The relationship to analyze
   * @param {string|number} params.newRelationshipClassId - Target RelationshipClass for switching
   * @returns {Promise<Object>} Compatibility analysis with score, issues, and migration suggestions
   * 
   * Purpose: Evaluate feasibility of changing relationship type during design process.
   * Result: Includes compatibility score, property migration plan, semantic analysis.
   */
  async analyzeRelationshipClassCompatibility({relationshipId, newRelationshipClassId}) {
    throw new Error('analyzeRelationshipClassCompatibility method must be implemented')
  }

  /**
   * Switches a relationship from its current RelationshipClass to a new one with property migration.
   * 
   * @param {Object} params - Switch parameters
   * @param {string|number} params.relationshipId - The relationship to switch
   * @param {string|number} params.newRelationshipClassId - Target RelationshipClass
   * @param {Object} params.propertyMappings - Manual property mappings for missing required properties
   * @param {boolean} params.preserveLostProperties - Whether to preserve incompatible properties
   * @returns {Promise<Object>} Switch result with updated relationship and migration details
   * 
   * Purpose: Change relationship type during design process while preserving data.
   * Validation: Ensures final properties comply with target RelationshipClass schema.
   * Behavior: May create new relationship with different type if type change required.
   */
  async switchRelationshipClass({relationshipId, newRelationshipClassId, propertyMappings = {}, preserveLostProperties = true}) {
    throw new Error('switchRelationshipClass method must be implemented')
  }
}
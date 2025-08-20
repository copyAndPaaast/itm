/**
 * RelationshipClassInterface defines the contract for RelationshipClass management in the ITM system.
 * RelationshipClasses serve as templates for creating relationships between nodes with defined property schemas.
 * 
 * Key Concepts:
 * - Templates: RelationshipClasses define structure and validation rules for relationships
 * - Relationship Types: Neo4j relationship types (e.g., 'DEPENDS_ON', 'CONNECTS_TO')
 * - Property Schema: Type definitions, constraints, and validation rules for relationship properties
 * - Node Type Constraints: Restrict which types of nodes can be connected
 * - Required Properties: Properties that must be provided when creating relationships
 */
export class RelationshipClassInterface {
  
  /**
   * Creates a new RelationshipClass template for defining relationship types.
   * 
   * @param {Object} params - RelationshipClass creation parameters
   * @param {string} params.relationshipClassName - Unique human-readable name
   * @param {string} params.relationshipType - Neo4j relationship type (e.g., 'DEPENDS_ON')
   * @param {Object} params.propertySchema - Property definitions with types and constraints
   * @param {string[]} params.requiredProperties - Array of required property names
   * @param {string[]} params.allowedFromTypes - Node types that can be source endpoints
   * @param {string[]} params.allowedToTypes - Node types that can be target endpoints
   * @param {string} params.description - Optional description of the relationship purpose
   * @returns {Promise<RelationshipClassModel>} The created RelationshipClass with generated classId
   * 
   * Purpose: Define templates for relationship types with structured property validation.
   * Examples: Dependencies, data flows, physical connections, ownership relationships.
   * Validation: Schema structure and node type constraints are validated before creation.
   */
  async createRelationshipClass({relationshipClassName, relationshipType, propertySchema, requiredProperties = [], allowedFromTypes = ['Asset'], allowedToTypes = ['Asset'], description = ''}) {
    throw new Error('createRelationshipClass method must be implemented')
  }

  /**
   * Retrieves a single RelationshipClass by identifier or name.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.classId - The unique identifier (optional)
   * @param {string} params.relationshipClassName - The unique name (optional)
   * @returns {Promise<RelationshipClassModel|null>} The RelationshipClass if found
   * 
   * Purpose: Fetch RelationshipClass definition for validation, relationship creation, editing.
   * Usage: Relationship instantiation, schema validation, class management interfaces.
   * Flexibility: Supports lookup by either ID or name for different use cases.
   */
  async getRelationshipClass({classId = null, relationshipClassName = null}) {
    throw new Error('getRelationshipClass method must be implemented')
  }

  /**
   * Retrieves all RelationshipClasses in the system.
   * 
   * @returns {Promise<RelationshipClassModel[]>} Array of all RelationshipClasses, ordered by name
   * 
   * Purpose: System overview, relationship type selection lists, bulk operations.
   * Usage: UI dropdowns, reporting, system inventory, migration planning.
   * Performance: Consider pagination for systems with many RelationshipClasses.
   */
  async getAllRelationshipClasses() {
    throw new Error('getAllRelationshipClasses method must be implemented')
  }

  /**
   * Retrieves a RelationshipClass by its Neo4j relationship type.
   * 
   * @param {Object} params - Query parameters
   * @param {string} params.relationshipType - The Neo4j relationship type
   * @returns {Promise<RelationshipClassModel|null>} The RelationshipClass if found
   * 
   * Purpose: Lookup RelationshipClass by the actual database relationship type.
   * Usage: Reverse lookups from existing relationships, type-based operations.
   */
  async getRelationshipClassByType({relationshipType}) {
    throw new Error('getRelationshipClassByType method must be implemented')
  }

  /**
   * Updates an existing RelationshipClass definition.
   * 
   * @param {Object} params - Update parameters
   * @param {string|number} params.classId - The unique identifier of the RelationshipClass
   * @param {Object} params.updates - Properties to update (schema, constraints, etc.)
   * @returns {Promise<RelationshipClassModel|null>} The updated RelationshipClass if successful
   * 
   * Purpose: Evolve RelationshipClass definitions to support changing business requirements.
   * Caution: Schema changes may affect existing relationship instances.
   * Usage: Add properties, modify constraints, update node type restrictions.
   */
  async updateRelationshipClass({classId, updates}) {
    throw new Error('updateRelationshipClass method must be implemented')
  }

  /**
   * Permanently removes a RelationshipClass from the system.
   * 
   * @param {Object} params - Deletion parameters
   * @param {string|number} params.classId - The unique identifier of the RelationshipClass
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   * 
   * Purpose: Remove obsolete or incorrect RelationshipClass templates.
   * Warning: Cannot delete RelationshipClasses that have existing relationship instances.
   * Safety: Check for dependent relationships before allowing deletion.
   */
  async deleteRelationshipClass({classId}) {
    throw new Error('deleteRelationshipClass method must be implemented')
  }

  /**
   * Checks if a RelationshipClass with a specific name already exists.
   * 
   * @param {Object} params - Check parameters
   * @param {string} params.relationshipClassName - The RelationshipClass name to check
   * @returns {Promise<boolean>} True if RelationshipClass exists, false otherwise
   * 
   * Purpose: Prevent duplicate RelationshipClass names, validate before creation.
   * Performance: Lightweight check without loading full RelationshipClass data.
   * Usage: Form validation, duplicate prevention, name availability checking.
   */
  async relationshipClassExists({relationshipClassName}) {
    throw new Error('relationshipClassExists method must be implemented')
  }

  /**
   * Validates a set of properties against a RelationshipClass schema.
   * 
   * @param {Object} params - Validation parameters
   * @param {string|number} params.classId - RelationshipClass identifier (optional)
   * @param {string} params.relationshipClassName - RelationshipClass name (optional)
   * @param {string} params.relationshipType - Relationship type (optional)
   * @param {Object} params.properties - Properties to validate
   * @returns {Promise<Object>} Validation result with success status and any errors
   * 
   * Purpose: Validate relationship properties before creation or update operations.
   * Usage: Form validation, data import validation, API request validation.
   * Result: Includes detailed error messages for each validation failure.
   */
  async validateRelationshipProperties({classId = null, relationshipClassName = null, relationshipType = null, properties}) {
    throw new Error('validateRelationshipProperties method must be implemented')
  }

  /**
   * Retrieves the property schema for a RelationshipClass without full object data.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.classId - RelationshipClass identifier (optional)
   * @param {string} params.relationshipClassName - RelationshipClass name (optional)
   * @returns {Promise<Object|null>} The property schema if found, null otherwise
   * 
   * Purpose: Get schema definition for validation, form generation, documentation.
   * Performance: Lightweight operation returning only schema data.
   * Usage: Dynamic form generation, validation rules, API documentation.
   */
  async getRelationshipClassSchema({classId = null, relationshipClassName = null}) {
    throw new Error('getRelationshipClassSchema method must be implemented')
  }

  /**
   * Validates the structure and constraints of a relationship property schema.
   * 
   * @param {Object} params - Validation parameters
   * @param {Object} params.propertySchema - The property schema to validate
   * @returns {Promise<Object>} Validation result with any errors or warnings
   * 
   * Purpose: Ensure property schema follows correct format and logical constraints.
   * Validation: Checks types, required flags, value constraints, naming conventions.
   * Usage: Pre-creation validation, schema editing assistance, error prevention.
   */
  async validateRelationshipClassSchema({propertySchema}) {
    throw new Error('validateRelationshipClassSchema method must be implemented')
  }

  /**
   * Retrieves simplified list of available RelationshipClasses for selection UI.
   * 
   * @returns {Promise<Object[]>} Array of simplified RelationshipClass info for UI
   * 
   * Purpose: Provide lightweight RelationshipClass data for selection interfaces.
   * Performance: Returns minimal data (ID, name, type) without full schemas.
   * Usage: Dropdown lists, relationship creation wizards, quick selection.
   */
  async getAvailableRelationshipClasses() {
    throw new Error('getAvailableRelationshipClasses method must be implemented')
  }

  /**
   * Retrieves property schema with default values for a specific RelationshipClass.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.relationshipClassId - The RelationshipClass identifier
   * @returns {Promise<Object|null>} Property schema with defaults if found
   * 
   * Purpose: Get schema with default values for relationship creation forms.
   * Usage: Form initialization, property templates, creation assistance.
   * Result: Includes both schema definitions and suggested default values.
   */
  async getRelationshipClassPropertySchema({relationshipClassId}) {
    throw new Error('getRelationshipClassPropertySchema method must be implemented')
  }
}
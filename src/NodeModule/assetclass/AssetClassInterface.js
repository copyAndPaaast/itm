/**
 * AssetClassInterface defines the contract for AssetClass management in the ITM system.
 * AssetClasses serve as templates for creating nodes (IT assets) with defined property schemas.
 * 
 * Key Concepts:
 * - Templates: AssetClasses define the structure and validation rules for nodes
 * - Property Schema: Type definitions, constraints, and validation rules for node properties
 * - Required Properties: Properties that must be provided when creating nodes
 * - Schema Evolution: AssetClasses can be updated to support system growth
 * - Validation: All node instances must comply with their AssetClass schema
 */
export class AssetClassInterface {
  
  /**
   * Creates a new AssetClass template for defining node types.
   * 
   * @param {Object} params - AssetClass creation parameters
   * @param {string} params.className - Unique name for the AssetClass
   * @param {Object} params.propertySchema - Property definitions with types and constraints
   * @param {string[]} params.requiredProperties - Array of property names that are required
   * @returns {Promise<AssetClassModel>} The created AssetClass with generated classId
   * 
   * Purpose: Define templates for IT asset types with structured property validation.
   * Examples: Server classes, application classes, network device classes.
   * Schema Format: {propertyName: {type: 'string|number|boolean', required: boolean, values: []}}
   * Validation: Schema structure is validated before AssetClass creation.
   */
  async createAssetClass({className, propertySchema, requiredProperties = []}) {
    throw new Error('createAssetClass method must be implemented')
  }

  /**
   * Retrieves a single AssetClass by identifier or name.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.classId - The unique identifier of the AssetClass (optional)
   * @param {string} params.className - The unique name of the AssetClass (optional)
   * @returns {Promise<AssetClassModel|null>} The AssetClass if found, null otherwise
   * 
   * Purpose: Fetch AssetClass definition for validation, node creation, or editing.
   * Usage: Node instantiation, schema validation, class management interfaces.
   * Flexibility: Supports lookup by either ID or name for different use cases.
   */
  async getAssetClass({classId = null, className = null}) {
    throw new Error('getAssetClass method must be implemented')
  }

  /**
   * Retrieves all AssetClasses in the system.
   * 
   * @returns {Promise<AssetClassModel[]>} Array of all AssetClasses, ordered by name
   * 
   * Purpose: System overview, class selection lists, bulk operations.
   * Usage: UI dropdowns, reporting, system inventory, migration planning.
   * Performance: Consider pagination for systems with many AssetClasses.
   */
  async getAllAssetClasses() {
    throw new Error('getAllAssetClasses method must be implemented')
  }

  /**
   * Updates an existing AssetClass definition.
   * 
   * @param {Object} params - Update parameters
   * @param {string|number} params.classId - The unique identifier of the AssetClass
   * @param {Object} params.updates - Properties to update (schema, description, etc.)
   * @returns {Promise<AssetClassModel|null>} The updated AssetClass if successful
   * 
   * Purpose: Evolve AssetClass definitions to support changing business requirements.
   * Caution: Schema changes may affect existing node instances; validate compatibility.
   * Usage: Add new properties, modify constraints, update documentation.
   */
  async updateAssetClass({classId, updates}) {
    throw new Error('updateAssetClass method must be implemented')
  }

  /**
   * Permanently removes an AssetClass from the system.
   * 
   * @param {Object} params - Deletion parameters
   * @param {string|number} params.classId - The unique identifier of the AssetClass
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   * 
   * Purpose: Remove obsolete or incorrect AssetClass templates.
   * Warning: Cannot delete AssetClasses that have existing node instances.
   * Safety: Check for dependent nodes before allowing deletion.
   */
  async deleteAssetClass({classId}) {
    throw new Error('deleteAssetClass method must be implemented')
  }

  /**
   * Validates the structure and constraints of a property schema.
   * 
   * @param {Object} params - Validation parameters
   * @param {Object} params.propertySchema - The property schema to validate
   * @returns {Promise<Object>} Validation result with any errors or warnings
   * 
   * Purpose: Ensure property schema follows correct format and logical constraints.
   * Validation: Checks types, required flags, value constraints, naming conventions.
   * Usage: Pre-creation validation, schema editing assistance, error prevention.
   */
  async validateAssetClassSchema({propertySchema}) {
    throw new Error('validateAssetClassSchema method must be implemented')
  }

  /**
   * Checks if an AssetClass with a specific name already exists.
   * 
   * @param {Object} params - Check parameters
   * @param {string} params.className - The AssetClass name to check
   * @returns {Promise<boolean>} True if AssetClass exists, false otherwise
   * 
   * Purpose: Prevent duplicate AssetClass names, validate before creation.
   * Performance: Lightweight check without loading full AssetClass data.
   * Usage: Form validation, duplicate prevention, name availability checking.
   */
  async assetClassExists({className}) {
    throw new Error('assetClassExists method must be implemented')
  }

  /**
   * Validates a set of properties against an AssetClass schema.
   * 
   * @param {Object} params - Validation parameters
   * @param {string|number} params.classId - AssetClass identifier (optional)
   * @param {string} params.className - AssetClass name (optional)
   * @param {Object} params.properties - Properties to validate
   * @returns {Promise<Object>} Validation result with success status and any errors
   * 
   * Purpose: Validate node properties before creation or update operations.
   * Usage: Form validation, data import validation, API request validation.
   * Result: Includes detailed error messages for each validation failure.
   */
  async validatePropertiesForAssetClass({classId = null, className = null, properties}) {
    throw new Error('validatePropertiesForAssetClass method must be implemented')
  }

  /**
   * Retrieves the property schema for an AssetClass without full object data.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.classId - AssetClass identifier (optional)
   * @param {string} params.className - AssetClass name (optional)
   * @returns {Promise<Object|null>} The property schema if found, null otherwise
   * 
   * Purpose: Get schema definition for validation, form generation, documentation.
   * Performance: Lightweight operation returning only schema data.
   * Usage: Dynamic form generation, validation rules, API documentation.
   */
  async getAssetClassSchema({classId = null, className = null}) {
    throw new Error('getAssetClassSchema method must be implemented')
  }
}
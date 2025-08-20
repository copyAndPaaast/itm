/**
 * NodeInterface defines the contract for Node management in the ITM system.
 * Nodes represent IT assets (servers, devices, applications) based on AssetClass templates.
 * 
 * Key Concepts:
 * - Nodes are instances of AssetClasses with validated properties
 * - System Labels: Additional Neo4j labels representing system membership (e.g., 'ProductionSystem')
 * - Group Membership: Relationships to Group nodes for logical organization
 * - Property Validation: All properties must conform to the AssetClass schema
 */
export class NodeInterface {
  
  /**
   * Creates a new node instance from an AssetClass template.
   * 
   * @param {string|number} assetClassId - ID or name of the AssetClass to instantiate
   * @param {Object} properties - Key-value pairs for node properties (validated against AssetClass schema)
   * @param {string} title - Human-readable title for the node
   * @param {string[]} systems - Array of system labels to add to the node (optional)
   * @returns {Promise<NodeModel>} The created node with generated nodeId
   * 
   * Purpose: Create IT assets (servers, applications, devices) from predefined templates.
   * Validation: Properties are validated against AssetClass schema before creation.
   * Labels: Node gets 'Asset' label + AssetClass name + system labels.
   */
  async createNode(assetClassId, properties, title, systems = []) {
    throw new Error('createNode method must be implemented')
  }

  /**
   * Retrieves a single node by its unique identifier.
   * 
   * @param {string|number} nodeId - The unique identifier of the node
   * @returns {Promise<NodeModel|null>} The node if found, null otherwise
   * 
   * Purpose: Fetch complete node data including properties, labels, and metadata.
   * Usage: Display node details, edit forms, relationship endpoints.
   */
  async getNode(nodeId) {
    throw new Error('getNode method must be implemented')
  }

  /**
   * Retrieves all active nodes in the system.
   * 
   * @returns {Promise<NodeModel[]>} Array of all active nodes, ordered by title
   * 
   * Purpose: System overview, bulk operations, reporting.
   * Performance: Use with caution in large systems; consider pagination.
   */
  async getAllNodes() {
    throw new Error('getAllNodes method must be implemented')
  }

  /**
   * Retrieves all nodes that are instances of a specific AssetClass.
   * 
   * @param {string|number} assetClassId - The AssetClass identifier
   * @returns {Promise<NodeModel[]>} Array of nodes of the specified class
   * 
   * Purpose: Find all instances of a specific asset type (e.g., all servers, all databases).
   * Usage: Asset inventory, class-specific operations, migration planning.
   */
  async getNodesByAssetClass(assetClassId) {
    throw new Error('getNodesByAssetClass method must be implemented')
  }

  /**
   * Updates properties of an existing node.
   * 
   * @param {string|number} nodeId - The unique identifier of the node
   * @param {Object} properties - Properties to update (partial update supported)
   * @returns {Promise<NodeModel|null>} The updated node if successful, null if not found
   * 
   * Purpose: Modify node data while maintaining AssetClass schema compliance.
   * Validation: New properties are merged with existing and validated against AssetClass.
   * Behavior: Partial updates supported; only provided properties are changed.
   */
  async updateNode(nodeId, properties) {
    throw new Error('updateNode method must be implemented')
  }

  /**
   * Permanently removes a node and all its relationships.
   * 
   * @param {string|number} nodeId - The unique identifier of the node
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   * 
   * Purpose: Remove obsolete or incorrect nodes from the system.
   * Warning: This is a destructive operation that also removes all relationships.
   * Alternative: Consider soft deletion by setting isActive = false.
   */
  async deleteNode(nodeId) {
    throw new Error('deleteNode method must be implemented')
  }

  /**
   * Checks if a node exists in the system.
   * 
   * @param {string|number} nodeId - The unique identifier to check
   * @returns {Promise<boolean>} True if node exists, false otherwise
   * 
   * Purpose: Validation before operations, relationship endpoint verification.
   * Performance: Lightweight check without loading full node data.
   */
  async nodeExists(nodeId) {
    throw new Error('nodeExists method must be implemented')
  }

  /**
   * Analyzes compatibility between current node and a target AssetClass.
   * 
   * @param {Object} params - Analysis parameters
   * @param {string|number} params.nodeId - The node to analyze
   * @param {string|number} params.newAssetClassId - Target AssetClass for switching
   * @returns {Promise<Object>} Compatibility analysis with score, issues, and migration suggestions
   * 
   * Purpose: Evaluate feasibility of changing a node's AssetClass during design process.
   * Result: Includes compatibility score, preserved/lost properties, required mappings.
   */
  async analyzeAssetClassCompatibility({nodeId, newAssetClassId}) {
    throw new Error('analyzeAssetClassCompatibility method must be implemented')
  }

  /**
   * Switches a node from its current AssetClass to a new one with property migration.
   * 
   * @param {Object} params - Switch parameters
   * @param {string|number} params.nodeId - The node to switch
   * @param {string|number} params.newAssetClassId - Target AssetClass
   * @param {Object} params.propertyMappings - Manual property mappings for missing required properties
   * @param {boolean} params.preserveLostProperties - Whether to preserve incompatible properties in metadata
   * @returns {Promise<Object>} Switch result with updated node and migration details
   * 
   * Purpose: Change node type during design process while preserving as much data as possible.
   * Validation: Ensures final properties comply with target AssetClass schema.
   * Safety: Lost properties can be preserved in metadata for potential recovery.
   */
  async switchAssetClass({nodeId, newAssetClassId, propertyMappings = {}, preserveLostProperties = true}) {
    throw new Error('switchAssetClass method must be implemented')
  }

  /**
   * Retrieves system labels for a node (excludes 'Asset' and AssetClass labels).
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The node to query
   * @returns {Promise<string[]>} Array of system labels
   * 
   * Purpose: Identify which systems a node belongs to for display and filtering.
   * Usage: System membership indicators, access control, deployment grouping.
   */
  async getNodeSystems({nodeId}) {
    throw new Error('getNodeSystems method must be implemented')
  }

  /**
   * Provides comprehensive system membership information for display purposes.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The node to summarize
   * @returns {Promise<Object>} System membership summary with display-ready information
   * 
   * Purpose: Generate formatted system membership data for UI components.
   * Result: Includes system count, list, display strings, and AssetClass information.
   */
  async getNodeSystemSummary({nodeId}) {
    throw new Error('getNodeSystemSummary method must be implemented')
  }

  /**
   * Checks if a node belongs to a specific system.
   * 
   * @param {Object} params - Check parameters
   * @param {string|number} params.nodeId - The node to check
   * @param {string} params.systemLabel - The system label to check for
   * @returns {Promise<boolean>} True if node is in the system, false otherwise
   * 
   * Purpose: System membership validation, access control, filtering logic.
   * Performance: Efficient boolean check without loading full membership data.
   */
  async isNodeInSystem({nodeId, systemLabel}) {
    throw new Error('isNodeInSystem method must be implemented')
  }

  /**
   * Provides complete membership summary combining systems and groups for display.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The node to summarize
   * @returns {Promise<Object>} Complete membership summary with display-ready information
   * 
   * Purpose: Generate comprehensive membership data for node detail views and cards.
   * Result: Combines system and group membership with formatted display strings.
   * Usage: Node overview panels, membership widgets, reporting dashboards.
   */
  async getNodeMembershipSummary({nodeId}) {
    throw new Error('getNodeMembershipSummary method must be implemented')
  }
}
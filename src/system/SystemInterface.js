/**
 * SystemInterface defines the contract for System management in the ITM system.
 * Systems use a hybrid approach: labels for performance + ITM app internal nodes for data storage.
 * 
 * Key Concepts:
 * - System Labels: Neo4j labels on user nodes for high-performance filtering (e.g., 'ProductionSystem')
 * - System Entities: ITM app internal nodes (labeled '_System') storing system metadata and properties
 * - Hybrid Approach: Labels provide fast queries, entities provide data storage capabilities
 * - System Properties: Description, owner, configuration, deployment info stored in system entities
 * - Label-Performance: User asset filtering remains optimized via Neo4j label indexing
 * - Data Separation: System management data is ITM app internal, user assets keep clean labels
 */
export class SystemInterface {
  
  /**
   * Creates a new system with both entity storage and label definition.
   * 
   * @param {Object} params - System creation parameters
   * @param {string} params.systemName - Human-readable name for the system
   * @param {string} params.systemLabel - Neo4j label to be applied to nodes (e.g., 'ProductionSystem')
   * @param {string} params.description - Description of the system's purpose
   * @param {Object} params.properties - Additional system properties (owner, environment, etc.)
   * @returns {Promise<SystemModel>} The created system entity with generated systemId
   * 
   * Purpose: Define new systems with metadata storage and label-based node membership.
   * Behavior: Creates ITM app internal '_System' node + registers label for node assignment.
   * Examples: Production system, Testing environment, Monitoring infrastructure.
   * Architecture: Hybrid approach - entity for data, label for performance.
   */
  async createSystem({systemName, systemLabel, description = '', properties = {}}) {
    throw new Error('createSystem method must be implemented')
  }

  /**
   * Retrieves a system entity by ID or label.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.systemId - The unique system entity ID (optional)
   * @param {string} params.systemLabel - The system label (optional)
   * @returns {Promise<SystemModel|null>} The system entity if found, null otherwise
   * 
   * Purpose: Fetch system metadata, configuration, and properties.
   * Usage: System management interfaces, configuration editing, reporting.
   * Flexibility: Supports lookup by either entity ID or label.
   */
  async getSystem({systemId = null, systemLabel = null}) {
    throw new Error('getSystem method must be implemented')
  }

  /**
   * Updates system properties and metadata.
   * 
   * @param {Object} params - Update parameters
   * @param {string|number} params.systemId - The unique system entity ID
   * @param {Object} params.updates - Properties to update (name, description, properties)
   * @returns {Promise<SystemModel|null>} The updated system entity if successful
   * 
   * Purpose: Modify system configuration, descriptions, and custom properties.
   * Behavior: Updates the ITM app internal system entity, not the label.
   * Usage: System administration, configuration management, metadata updates.
   */
  async updateSystem({systemId, updates}) {
    throw new Error('updateSystem method must be implemented')
  }

  /**
   * Adds a node to a system by applying a system label.
   * 
   * @param {string|number} nodeId - The unique identifier of the node
   * @param {string} systemLabel - The system label to add (e.g., 'ProductionSystem')
   * @returns {Promise<boolean>} True if the label was successfully added
   * 
   * Purpose: Assign nodes to systems for logical organization and access control.
   * Behavior: Adds the system label to the node's existing labels.
   * Examples: Adding servers to 'ProductionSystem', 'TestingSystem', 'MonitoringSystem'.
   * Performance: Uses Neo4j's efficient label operations.
   */
  async addNodeToSystem(nodeId, systemLabel) {
    throw new Error('addNodeToSystem method must be implemented')
  }

  /**
   * Removes a node from a system by removing the system label.
   * 
   * @param {string|number} nodeId - The unique identifier of the node
   * @param {string} systemLabel - The system label to remove
   * @returns {Promise<boolean>} True if the label was successfully removed
   * 
   * Purpose: Remove nodes from systems during decommissioning or reorganization.
   * Behavior: Removes only the specified system label, preserving other labels.
   * Safety: Does not affect the node's AssetClass label or other system memberships.
   */
  async removeNodeFromSystem(nodeId, systemLabel) {
    throw new Error('removeNodeFromSystem method must be implemented')
  }

  /**
   * Retrieves all nodes that belong to a specific system.
   * 
   * @param {string} systemLabel - The system label to query
   * @returns {Promise<NodeModel[]>} Array of nodes in the system, ordered by title
   * 
   * Purpose: Get inventory of all assets within a specific system boundary.
   * Usage: System audits, deployment planning, security assessments.
   * Performance: Highly efficient due to Neo4j's label indexing.
   * Examples: All production servers, all development databases.
   */
  async getSystemNodes(systemLabel) {
    throw new Error('getSystemNodes method must be implemented')
  }

  /**
   * Retrieves all systems that a specific node belongs to.
   * 
   * @param {string|number} nodeId - The unique identifier of the node
   * @returns {Promise<string[]>} Array of system labels the node belongs to
   * 
   * Purpose: Identify system memberships for access control and display.
   * Usage: Permission checks, node detail views, membership validation.
   * Result: Returns only system labels, excluding 'Asset' and AssetClass labels.
   */
  async getNodeSystems(nodeId) {
    throw new Error('getNodeSystems method must be implemented')
  }

  /**
   * Retrieves all system entities currently defined in the ITM system.
   * 
   * @returns {Promise<SystemModel[]>} Array of system entities, ordered by name
   * 
   * Purpose: System management overview, configuration interfaces, reporting.
   * Usage: System administration panels, configuration management, system selection.
   * Result: Returns full system entities with metadata, not just labels.
   * Performance: Queries ITM app internal '_System' nodes for complete information.
   */
  async listSystems() {
    throw new Error('listSystems method must be implemented')
  }

  /**
   * Checks if a system entity exists by label.
   * 
   * @param {string} systemLabel - The system label to check
   * @returns {Promise<boolean>} True if the system entity exists
   * 
   * Purpose: Validate system existence before operations, prevent orphaned references.
   * Performance: Lightweight check of ITM app internal system entities.
   * Usage: Form validation, system cleanup, administrative tools.
   */
  async systemExists(systemLabel) {
    throw new Error('systemExists method must be implemented')
  }

  /**
   * Permanently removes a system entity and optionally handles nodes with that label.
   * 
   * @param {Object} params - Deletion parameters
   * @param {string|number} params.systemId - The unique system entity ID
   * @param {string} params.handleNodes - How to handle nodes: 'remove_labels', 'move_to_system', 'require_empty'
   * @param {string} params.targetSystemLabel - Target system for node migration (if handleNodes = 'move_to_system')
   * @returns {Promise<Object>} Deletion result with affected node count and any issues
   * 
   * Purpose: Remove obsolete systems while handling existing node memberships.
   * Safety: Provides options for handling nodes that currently use the system label.
   * Options: Remove labels from nodes, migrate to another system, or require empty system.
   */
  async deleteSystem({systemId, handleNodes = 'require_empty', targetSystemLabel = null}) {
    throw new Error('deleteSystem method must be implemented')
  }

  /**
   * Provides comprehensive statistics and metrics for a specific system.
   * 
   * @param {string} systemLabel - The system label to analyze
   * @returns {Promise<Object>} Statistics including node counts, types, relationships
   * 
   * Purpose: Generate system health metrics, capacity planning, reporting.
   * Result: Includes node count, AssetClass distribution, relationship counts.
   * Usage: System dashboards, capacity reports, health monitoring.
   * Examples: Production system with 150 servers, 30 databases, 500 dependencies.
   */
  async getSystemStats(systemLabel) {
    throw new Error('getSystemStats method must be implemented')
  }

  /**
   * Moves nodes between systems by updating their system labels.
   * 
   * @param {string} fromSystemLabel - Source system to move nodes from
   * @param {string} toSystemLabel - Target system to move nodes to
   * @param {string[]|null} nodeIds - Specific node IDs to move (null = all nodes)
   * @returns {Promise<Object>} Summary of moved nodes and any failures
   * 
   * Purpose: Bulk system reassignment for migrations, reorganizations.
   * Behavior: Removes old system label and adds new system label atomically.
   * Safety: Operation is transactional; partial failures are reported.
   * Examples: Promote staging servers to production, migrate test to development.
   * Performance: Efficient batch operation for large-scale system changes.
   */
  async moveNodesBetweenSystems(fromSystemLabel, toSystemLabel, nodeIds = null) {
    throw new Error('moveNodesBetweenSystems method must be implemented')
  }
}
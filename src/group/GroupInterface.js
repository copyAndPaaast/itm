/**
 * GroupInterface defines the contract for Group management in the ITM system.
 * Groups provide logical organization of nodes through explicit membership relationships.
 * 
 * Key Concepts:
 * - Groups organize nodes through _MEMBER_OF relationships (not labels)
 * - Group Types: CLUSTER, INFRASTRUCTURE, ORGANIZATIONAL, FUNCTIONAL, etc.
 * - System Groups: Groups can have system labels for system-specific grouping
 * - Flexible Membership: Nodes can belong to multiple groups simultaneously
 * - Metadata Support: Groups can store additional configuration and documentation
 */
export class GroupInterface {
  
  /**
   * Creates a new group for organizing nodes.
   * 
   * @param {Object} params - Group creation parameters
   * @param {string} params.groupName - Unique name for the group
   * @param {string} params.groupType - Type/category of the group (e.g., 'CLUSTER', 'INFRASTRUCTURE')
   * @param {string} params.description - Optional description of the group's purpose
   * @param {Object} params.metadata - Optional additional metadata for the group
   * @returns {Promise<GroupModel>} The created group with generated groupId
   * 
   * Purpose: Create logical containers for organizing related nodes.
   * Examples: Server clusters, application tiers, organizational units, deployment environments.
   * Validation: Group names must be unique across the system.
   */
  async createGroup({groupName, groupType, description = '', metadata = {}}) {
    throw new Error('createGroup method must be implemented')
  }

  /**
   * Retrieves a single group by its unique identifier, including member list.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.groupId - The unique identifier of the group
   * @returns {Promise<GroupModel|null>} The group with members if found, null otherwise
   * 
   * Purpose: Fetch complete group data including all member nodes.
   * Usage: Group detail views, membership management, configuration editing.
   * Performance: Includes member list; use getGroupByName for metadata-only queries.
   */
  async getGroup({groupId}) {
    throw new Error('getGroup method must be implemented')
  }

  /**
   * Retrieves a single group by its name, including member list.
   * 
   * @param {Object} params - Query parameters
   * @param {string} params.groupName - The unique name of the group
   * @returns {Promise<GroupModel|null>} The group with members if found, null otherwise
   * 
   * Purpose: Lookup groups by human-readable name for user interfaces.
   * Usage: Group search, name-based operations, user-friendly lookups.
   */
  async getGroupByName({groupName}) {
    throw new Error('getGroupByName method must be implemented')
  }

  /**
   * Retrieves all active groups in the system with their member counts.
   * 
   * @returns {Promise<GroupModel[]>} Array of all active groups, ordered by name
   * 
   * Purpose: System overview, group management interfaces, reporting.
   * Usage: Groups can be organized by groupType on the client side if needed.
   * Performance: Use with caution in large systems; consider pagination.
   */
  async getAllGroups() {
    throw new Error('getAllGroups method must be implemented')
  }

  /**
   * Updates group properties and metadata.
   * 
   * @param {Object} params - Update parameters
   * @param {string|number} params.groupId - The unique identifier of the group
   * @param {Object} params.updates - Properties to update (partial update supported)
   * @returns {Promise<GroupModel|null>} The updated group if successful, null if not found
   * 
   * Purpose: Modify group configuration, descriptions, and metadata.
   * Allowed Updates: groupName, groupType, description, metadata, isActive.
   * Safety: Group membership is managed through separate methods.
   */
  async updateGroup({groupId, updates}) {
    throw new Error('updateGroup method must be implemented')
  }

  /**
   * Permanently removes a group and all its membership relationships.
   * 
   * @param {Object} params - Deletion parameters
   * @param {string|number} params.groupId - The unique identifier of the group
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise
   * 
   * Purpose: Remove obsolete or incorrect groups from the system.
   * Warning: This removes all membership relationships but does not delete member nodes.
   * Alternative: Consider soft deletion by setting isActive = false.
   */
  async deleteGroup({groupId}) {
    throw new Error('deleteGroup method must be implemented')
  }

  /**
   * Adds a node to a group, creating a membership relationship.
   * 
   * @param {Object} params - Membership parameters
   * @param {string|number} params.nodeId - The node to add to the group
   * @param {string|number} params.groupId - The group to add the node to
   * @returns {Promise<boolean>} True if addition was successful
   * 
   * Purpose: Establish logical relationships between nodes and groups.
   * Behavior: Uses MERGE to prevent duplicate relationships.
   * Validation: Both node and group must exist before adding membership.
   */
  async addNodeToGroup({nodeId, groupId}) {
    throw new Error('addNodeToGroup method must be implemented')
  }

  /**
   * Removes a node from a group, deleting the membership relationship.
   * 
   * @param {Object} params - Membership parameters
   * @param {string|number} params.nodeId - The node to remove from the group
   * @param {string|number} params.groupId - The group to remove the node from
   * @returns {Promise<boolean>} True if removal was successful
   * 
   * Purpose: Remove logical relationships between nodes and groups.
   * Safety: Only removes the relationship; does not delete the node or group.
   */
  async removeNodeFromGroup({nodeId, groupId}) {
    throw new Error('removeNodeFromGroup method must be implemented')
  }

  /**
   * Retrieves all nodes that are members of a specific group.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.groupId - The group to query
   * @returns {Promise<NodeModel[]>} Array of member nodes, ordered by title
   * 
   * Purpose: List all assets within a logical group.
   * Usage: Group inventory, member management, bulk operations on group members.
   */
  async getGroupMembers({groupId}) {
    throw new Error('getGroupMembers method must be implemented')
  }

  /**
   * Retrieves all groups that a specific node belongs to.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The node to query
   * @returns {Promise<GroupModel[]>} Array of groups the node belongs to
   * 
   * Purpose: Display node's group memberships for UI and reporting.
   * Usage: Node detail views, membership widgets, access control logic.
   */
  async getNodeGroups({nodeId}) {
    throw new Error('getNodeGroups method must be implemented')
  }


  /**
   * Retrieves groups that have a specific system label (groups belonging to a system).
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.systemId - The system entity ID (optional)
   * @param {string} params.systemLabel - The system label (optional)
   * @returns {Promise<GroupModel[]>} Array of groups with the system label
   * 
   * Purpose: Find groups that are part of a specific system deployment.
   * Usage: System-specific group management, deployment organization.
   * Flexibility: Supports lookup by either system entity ID or label.
   */
  async getGroupsInSystem({systemId = null, systemLabel = null}) {
    throw new Error('getGroupsInSystem method must be implemented')
  }

  /**
   * Retrieves groups that have at least one member belonging to a specific system.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.systemId - The system entity ID (optional)
   * @param {string} params.systemLabel - The system label (optional)
   * @returns {Promise<GroupModel[]>} Array of groups with members in the system
   * 
   * Purpose: Find groups containing assets from a specific system.
   * Usage: Cross-system dependency analysis, impact assessment.
   * Result: Includes metadata about system member counts for each group.
   * Flexibility: Supports lookup by either system entity ID or label.
   */
  async getGroupsWithMembersInSystem({systemId = null, systemLabel = null}) {
    throw new Error('getGroupsWithMembersInSystem method must be implemented')  
  }

  /**
   * Provides comprehensive statistics about groups and assets within a system.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.systemId - The system entity ID (optional)
   * @param {string} params.systemLabel - The system label (optional)
   * @returns {Promise<Object>} Statistics about system groups and asset distribution
   * 
   * Purpose: Generate system-wide grouping analytics and metrics.
   * Result: Includes direct groups, groups with members, asset counts, grouping ratios.
   * Usage: System health dashboards, organizational analysis, capacity planning.
   * Flexibility: Supports lookup by either system entity ID or label.
   */
  async getSystemGroupStats({systemId = null, systemLabel = null}) {
    throw new Error('getSystemGroupStats method must be implemented')
  }

  /**
   * Checks if a specific node is a member of a specific group.
   * 
   * @param {Object} params - Check parameters
   * @param {string|number} params.nodeId - The node to check
   * @param {string|number} params.groupId - The group to check membership in
   * @returns {Promise<boolean>} True if node is a member, false otherwise
   * 
   * Purpose: Group membership validation, access control, UI state management.
   * Performance: Efficient boolean check without loading full membership data.
   */
  async isNodeInGroup({nodeId, groupId}) {
    throw new Error('isNodeInGroup method must be implemented')
  }

  /**
   * Provides comprehensive group membership information for a node for display purposes.
   * 
   * @param {Object} params - Query parameters
   * @param {string|number} params.nodeId - The node to summarize
   * @returns {Promise<Object>} Group membership summary with display-ready information
   * 
   * Purpose: Generate formatted group membership data for UI components.
   * Result: Includes group count, names, types, and display strings.
   * Usage: Node overview panels, membership widgets, reporting dashboards.
   */
  async getNodeGroupSummary({nodeId}) {
    throw new Error('getNodeGroupSummary method must be implemented')
  }
}
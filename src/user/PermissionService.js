/**
 * Permission Service - Centralized permission management for ITM UI
 * Handles user permissions and access control for graph operations
 */

/**
 * Simplified permission system - only track operations that permanently change graph data
 */
const PERMISSION_MATRIX = {
  viewer: [], // No permanent changes allowed
  editor: ['create', 'edit', 'delete'], // Can modify graph data
  admin: ['create', 'edit', 'delete'] // Same as editor - no distinction needed for graph operations
}

/**
 * Permission Service - Validates user permissions for graph operations
 */
export const PermissionService = {
  
  /**
   * Validates user permissions for operations that permanently change graph data
   * Only checks: create, edit, delete operations
   * All other operations (zoom, pan, select, filter, export) are always allowed
   * 
   * @param {string} operation - The operation being attempted
   * @param {string} userPermissions - User permission level (viewer, editor, admin)
   * @param {Object} context - Additional context for permission checking
   * @returns {boolean} Whether the operation is allowed
   */
  checkPermission(operation, userPermissions, context = {}) {
    // Only check permissions for operations that permanently change data
    const restrictedOperations = ['create', 'edit', 'delete']
    
    if (!restrictedOperations.includes(operation)) {
      return true // Allow all non-destructive operations (zoom, pan, select, etc.)
    }
    
    const allowedOps = PERMISSION_MATRIX[userPermissions] || []
    return allowedOps.includes(operation)
  },

  /**
   * Get all available permission levels
   * @returns {Array} List of permission levels
   */
  getPermissionLevels() {
    return Object.keys(PERMISSION_MATRIX)
  },

  /**
   * Get allowed operations for a permission level
   * @param {string} userPermissions - User permission level
   * @returns {Array} List of allowed operations
   */
  getAllowedOperations(userPermissions) {
    return PERMISSION_MATRIX[userPermissions] || []
  },

  /**
   * Check if a user can perform any data modification
   * @param {string} userPermissions - User permission level
   * @returns {boolean} Whether user can modify data
   */
  canModifyData(userPermissions) {
    const allowedOps = this.getAllowedOperations(userPermissions)
    return allowedOps.some(op => ['create', 'edit', 'delete'].includes(op))
  },

  /**
   * Get user-friendly description for permission level
   * @param {string} userPermissions - User permission level
   * @returns {string} Description of permission level
   */
  getPermissionDescription(userPermissions) {
    switch (userPermissions) {
      case 'viewer':
        return 'No Data Changes'
      case 'editor':
        return 'Can Modify Data'
      case 'admin':
        return 'Can Modify Data'
      default:
        return 'Unknown Permission'
    }
  }
}
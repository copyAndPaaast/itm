/**
 * GraphViewerInterface - Clean Architecture Interface Definitions
 * 
 * Defines the contract between view, service, and mapper layers
 */

/**
 * Node data structure - supports both assetClass and custom styling
 */
export const NodeDataInterface = {
  // Core identification
  nodeId: 'number',           // Neo4j internal ID (numeric) - can be null for new nodes
  tempUID: 'string',          // Frontend temporary ID for new nodes  
  title: 'string',            // Display name
  
  // Classification (for automatic styling)
  assetClass: 'string',       // WebServer, DatabaseServer, etc.
  
  // Membership (Neo4j IDs or names)
  systems: 'Array<string>',   // System names for compound membership  
  groups: 'Array<string>',    // Group names for hull membership
  
  // Custom styling (overrides assetClass defaults)
  color: 'string',           // Background color
  borderColor: 'string',     // Border color
  shape: 'string',           // Cytoscape shape
  size: 'number',            // Node size
  
  // Additional data
  properties: 'Object'       // Extra properties
}

/**
 * Edge data structure - supports custom styling
 */
export const EdgeDataInterface = {
  // Core identification
  id: 'string',              // Unique identifier (edge ID)
  source: 'number',          // Source node Neo4j ID
  target: 'number',          // Target node Neo4j ID
  
  // Classification
  relationshipType: 'string', // connects_to, depends_on, etc.
  
  // Custom styling (overrides relationshipType defaults)
  color: 'string',           // Line color
  width: 'number',           // Line width
  style: 'string',           // solid, dashed, dotted
  arrowShape: 'string',      // Arrow head shape
  
  // Additional data
  properties: 'Object'       // Extra properties
}

/**
 * Viewer events - semantic event system
 */
export const ViewerEvents = {
  // Node events
  NODE_CREATED: 'nodeCreated',
  NODE_UPDATED: 'nodeUpdated',
  NODE_DELETED: 'nodeDeleted',
  NODE_SELECTED: 'nodeSelected',
  
  // Edge events
  EDGE_CREATED: 'edgeCreated',
  EDGE_UPDATED: 'edgeUpdated', 
  EDGE_DELETED: 'edgeDeleted',
  EDGE_SELECTED: 'edgeSelected',
  
  // View events
  LAYOUT_CHANGED: 'layoutChanged',
  SELECTION_CLEARED: 'selectionCleared',
  
  // System events
  ERROR: 'error'
}

/**
 * Event payload structures
 */
export const EventPayloads = {
  nodeCreated: {
    nodeId: 'string',
    nodeData: 'NodeDataInterface',
    position: '{ x: number, y: number }'
  },
  
  edgeCreated: {
    edgeId: 'string',
    sourceId: 'string',
    targetId: 'string', 
    edgeData: 'EdgeDataInterface'
  },
  
  nodeSelected: {
    nodeId: 'string',
    ctrlKey: 'boolean',
    shiftKey: 'boolean'
  }
}
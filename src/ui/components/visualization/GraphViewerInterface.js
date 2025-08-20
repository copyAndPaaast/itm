/**
 * GraphViewerInterface defines the contracts for the ITM graph visualization components.
 * Uses the Component + Hook + Service pattern for modern React architecture.
 * 
 * Key Concepts:
 * - GraphViewer: Pure presentation component for rendering nodes
 * - useGraphViewer: Custom hook managing state and business logic
 * - GraphViewerService: Pure functions for graph operations
 * - Event-driven architecture: Components communicate through events
 */

/**
 * Event types that GraphViewer can emit
 */
export const GRAPH_VIEWER_EVENTS = {
  NODE_SELECT: 'nodeSelect',
  NODE_DESELECT: 'nodeDeselect', 
  NODE_HOVER: 'nodeHover',
  NODE_DOUBLE_CLICK: 'nodeDoubleClick',
  NODE_RIGHT_CLICK: 'nodeRightClick',
  EDGE_SELECT: 'edgeSelect',
  EDGE_DESELECT: 'edgeDeselect',
  EDGE_HOVER: 'edgeHover',
  BACKGROUND_CLICK: 'backgroundClick',
  LAYOUT_COMPLETE: 'layoutComplete',
  ZOOM_CHANGE: 'zoomChange',
  PAN_CHANGE: 'panChange'
}

/**
 * GraphViewer Component Interface
 * Pure presentation component that only receives data and emits events
 */
export class GraphViewerInterface {
  
  /**
   * Renders the graph visualization with nodes and edges.
   * 
   * @param {Object} props - Component props
   * @param {Array} props.nodes - Array of node data objects
   * @param {Array} props.edges - Array of edge data objects  
   * @param {Object} props.config - Display configuration
   * @param {Object} props.selection - Current selection state
   * @param {Function} props.onEvent - Event handler function
   * @param {Object} props.style - Container styling
   * @param {boolean} props.loading - Loading state
   * @param {string} props.error - Error message if any
   * @returns {ReactElement} Graph visualization component
   * 
   * Purpose: Pure presentation of ITM graph data with user interactions.
   * Behavior: Emits events for all user interactions, no business logic.
   * Integration: Receives data from useGraphViewer hook.
   */
  render(props) {
    throw new Error('GraphViewer render method must be implemented')
  }
}

/**
 * useGraphViewer Hook Interface  
 * Custom hook that manages graph state, business logic, and Redux integration
 */
export class UseGraphViewerInterface {
  
  /**
   * Provides graph state and event handlers for GraphViewer component.
   * 
   * @param {Object} options - Hook configuration
   * @param {string} options.graphId - Unique identifier for this graph instance
   * @param {Array} options.initialNodes - Initial node data
   * @param {Array} options.initialEdges - Initial edge data
   * @param {Object} options.config - Graph configuration
   * @param {string} options.userPermissions - User permission level
   * @returns {Object} Hook return object with state and handlers
   * 
   * Purpose: Manage graph state, handle events, integrate with Redux store.
   * Features: Node selection, layout management, permission guards, undo/redo.
   * Integration: Connects to Redux store and ITM backend services.
   */
  useGraphViewer(options) {
    throw new Error('useGraphViewer hook must be implemented')
  }
  
  /**
   * Hook return object structure:
   * {
   *   // Data for GraphViewer
   *   nodes: Array,
   *   edges: Array,
   *   config: Object,
   *   selection: Object,
   *   loading: boolean,
   *   error: string|null,
   *   
   *   // Event handlers
   *   handleEvent: Function,
   *   
   *   // Control methods
   *   selectNode: Function,
   *   selectEdge: Function,
   *   clearSelection: Function,
   *   fitGraph: Function,
   *   setLayout: Function,
   *   zoomTo: Function,
   *   
   *   // Data operations (permission-gated)
   *   addNode: Function,
   *   updateNode: Function,
   *   deleteNode: Function,
   *   addEdge: Function,
   *   updateEdge: Function,
   *   deleteEdge: Function
   * }
   */
}

/**
 * GraphViewerService Interface
 * Pure functions for graph operations, Cytoscape utilities, and calculations
 */
export class GraphViewerServiceInterface {
  
  /**
   * Initializes Cytoscape instance with ITM-specific configuration.
   * 
   * @param {HTMLElement} container - DOM container for the graph
   * @param {Array} nodes - Node data array
   * @param {Array} edges - Edge data array
   * @param {Object} config - Graph configuration
   * @returns {Object} Cytoscape instance
   * 
   * Purpose: Create and configure Cytoscape graph with ITM styling and behavior.
   * Features: Custom node styles, edge styles, interaction handlers.
   */
  initializeCytoscape(container, nodes, edges, config) {
    throw new Error('initializeCytoscape method must be implemented')
  }
  
  /**
   * Transforms ITM node data into Cytoscape format.
   * 
   * @param {Object} nodeData - ITM node data from backend
   * @returns {Object} Cytoscape node definition
   * 
   * Purpose: Convert ITM NodeModel data to Cytoscape-compatible format.
   * Mapping: Node properties, asset class types, system labels, styling.
   */
  transformNodeData(nodeData) {
    throw new Error('transformNodeData method must be implemented')
  }
  
  /**
   * Transforms ITM relationship data into Cytoscape edge format.
   * 
   * @param {Object} edgeData - ITM relationship data from backend
   * @returns {Object} Cytoscape edge definition
   * 
   * Purpose: Convert ITM RelationshipModel data to Cytoscape edges.
   * Mapping: Relationship properties, types, direction, styling.
   */
  transformEdgeData(edgeData) {
    throw new Error('transformEdgeData method must be implemented')
  }
  
  /**
   * Applies ITM-specific styling to graph elements.
   * 
   * @param {string} elementType - 'node' or 'edge'
   * @param {Object} elementData - Element data
   * @returns {Object} Cytoscape style definition
   * 
   * Purpose: Generate styles based on ITM asset types and relationship types.
   * Features: Asset class colors, system badges, relationship arrows.
   */
  getElementStyle(elementType, elementData) {
    throw new Error('getElementStyle method must be implemented')
  }
  
  /**
   * Calculates optimal layout for ITM graph based on node types and relationships.
   * 
   * @param {Array} nodes - Node array
   * @param {Array} edges - Edge array
   * @param {string} layoutType - Requested layout type
   * @returns {Object} Layout configuration for Cytoscape
   * 
   * Purpose: Provide intelligent layout suggestions for ITM data.
   * Algorithms: Hierarchical for dependencies, force-directed for networks.
   */
  calculateLayout(nodes, edges, layoutType) {
    throw new Error('calculateLayout method must be implemented')
  }
  
  /**
   * Validates user permissions for graph operations.
   * 
   * @param {string} operation - Operation being attempted
   * @param {string} userPermissions - User permission level
   * @param {Object} context - Operation context (element data, etc.)
   * @returns {boolean} Whether operation is allowed
   * 
   * Purpose: Enforce permission-based access control for graph operations.
   * Permissions: viewer, editor, admin, analyst - each with different capabilities.
   */
  checkPermission(operation, userPermissions, context) {
    throw new Error('checkPermission method must be implemented')
  }
  
  /**
   * Filters graph data based on user criteria.
   * 
   * @param {Array} nodes - All nodes
   * @param {Array} edges - All edges  
   * @param {Object} filters - Filter criteria
   * @returns {Object} Filtered {nodes, edges}
   * 
   * Purpose: Apply user-defined filters to reduce graph complexity.
   * Filters: Asset types, systems, relationships, search terms, date ranges.
   */
  applyFilters(nodes, edges, filters) {
    throw new Error('applyFilters method must be implemented')
  }
  
  /**
   * Calculates graph metrics and statistics.
   * 
   * @param {Array} nodes - Node array
   * @param {Array} edges - Edge array
   * @returns {Object} Graph metrics
   * 
   * Purpose: Provide insights about graph structure and complexity.
   * Metrics: Node count, edge count, connectivity, clustering, centrality.
   */
  calculateMetrics(nodes, edges) {
    throw new Error('calculateMetrics method must be implemented')
  }
  
  /**
   * Exports graph data in various formats.
   * 
   * @param {Object} cytoscapeInstance - Cytoscape instance
   * @param {string} format - Export format ('png', 'svg', 'json', 'graphml')
   * @returns {string|Object} Exported data
   * 
   * Purpose: Allow users to export graph visualizations and data.
   * Formats: Images for presentations, data formats for external tools.
   */
  exportGraph(cytoscapeInstance, format) {
    throw new Error('exportGraph method must be implemented')
  }
}

/**
 * Event data structures for different graph interactions
 */
export const EVENT_DATA_STRUCTURES = {
  
  /**
   * Node selection event data
   * @typedef {Object} NodeSelectEvent
   * @property {string} nodeId - Selected node ID
   * @property {Object} nodeData - Complete node data
   * @property {Array} selectedNodes - All currently selected nodes
   * @property {boolean} isMultiSelect - Whether this is multi-selection
   */
  
  /**
   * Edge selection event data  
   * @typedef {Object} EdgeSelectEvent
   * @property {string} edgeId - Selected edge ID
   * @property {Object} edgeData - Complete edge data
   * @property {string} sourceNodeId - Source node ID
   * @property {string} targetNodeId - Target node ID
   * @property {Array} selectedEdges - All currently selected edges
   */
  
  /**
   * Layout completion event data
   * @typedef {Object} LayoutCompleteEvent
   * @property {string} layoutType - Layout type that completed
   * @property {number} duration - Layout execution time in ms
   * @property {Object} finalPositions - Final node positions
   */
  
  /**
   * Zoom change event data
   * @typedef {Object} ZoomChangeEvent  
   * @property {number} zoomLevel - New zoom level
   * @property {number} previousZoom - Previous zoom level
   * @property {Object} centerPoint - Center point of zoom
   */
}

/**
 * Configuration objects for graph display and behavior
 */
export const CONFIG_STRUCTURES = {
  
  /**
   * Graph display configuration
   * @typedef {Object} GraphConfig
   * @property {string} layout - Layout type ('dagre', 'cola', 'grid')
   * @property {boolean} showLabels - Whether to show node/edge labels
   * @property {boolean} enableZoom - Allow zoom operations
   * @property {boolean} enablePan - Allow pan operations  
   * @property {boolean} enableSelection - Allow element selection
   * @property {string} selectionMode - 'single' or 'multiple'
   * @property {Object} styling - Custom styling overrides
   * @property {Object} animation - Animation configuration
   */
  
  /**
   * User permission configuration
   * @typedef {Object} PermissionConfig
   * @property {string} level - 'viewer', 'editor', 'admin', 'analyst'
   * @property {Array} allowedOperations - Specific operations allowed
   * @property {Array} restrictedElements - Elements user cannot modify
   */
}

/**
 * Integration patterns for connecting GraphViewer with Redux and services
 */
export const INTEGRATION_PATTERNS = {
  
  /**
   * Redux integration structure
   * - State slice: graphViewer (selection, layout, filters, etc.)
   * - Actions: selectNode, updateLayout, applyFilter, etc.
   * - Selectors: getSelectedNodes, getFilteredGraph, getGraphMetrics
   * - Middleware: Permission checking, undo/redo tracking
   */
  
  /**
   * Service integration structure  
   * - NodeService: CRUD operations for nodes
   * - RelationshipService: CRUD operations for relationships
   * - SystemService: System membership operations
   * - GroupService: Group membership operations
   */
  
  /**
   * Event flow pattern
   * 1. User interacts with GraphViewer
   * 2. GraphViewer emits event via onEvent prop
   * 3. useGraphViewer hook receives event
   * 4. Hook processes event (permission check, state update)
   * 5. Hook dispatches Redux actions if needed
   * 6. Hook calls backend services if needed
   * 7. Hook updates local state
   * 8. GraphViewer re-renders with new state
   */
}
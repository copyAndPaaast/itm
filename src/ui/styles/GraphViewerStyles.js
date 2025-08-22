/**
 * GraphViewer Styles - Material UI themed styles for graph visualization
 * Supports Material UI theming and ITM-specific visual design
 */

/**
 * ITM-specific node styling based on asset types
 * These colors work well with both light and dark Material UI themes
 */
export const NODE_STYLES = {
  server: {
    'background-color': '#4CAF50',
    'shape': 'rectangle',
    'border-color': '#388E3C',
    'color': '#fff'
  },
  database: {
    'background-color': '#FF9800', 
    'shape': 'hexagon',
    'border-color': '#F57C00',
    'color': '#fff'
  },
  application: {
    'background-color': '#9C27B0',
    'shape': 'round-rectangle', 
    'border-color': '#7B1FA2',
    'color': '#fff'
  },
  network: {
    'background-color': '#2196F3',
    'shape': 'diamond',
    'border-color': '#1976D2', 
    'color': '#fff'
  },
  default: {
    'background-color': '#757575',
    'shape': 'ellipse',
    'border-color': '#424242',
    'color': '#fff'
  }
}

/**
 * ITM-specific edge styling based on relationship types
 */
export const EDGE_STYLES = {
  depends_on: {
    'line-color': '#F44336',
    'target-arrow-color': '#F44336',
    'line-style': 'solid'
  },
  connects_to: {
    'line-color': '#2196F3', 
    'target-arrow-color': '#2196F3',
    'line-style': 'solid'
  },
  contains: {
    'line-color': '#4CAF50',
    'target-arrow-color': '#4CAF50',
    'line-style': 'dashed'
  },
  flows_to: {
    'line-color': '#FF9800',
    'target-arrow-color': '#FF9800',
    'line-style': 'solid'
  },
  default: {
    'line-color': '#757575',
    'target-arrow-color': '#757575',
    'line-style': 'solid'
  }
}

/**
 * Base Cytoscape style configuration for ITM graphs
 * Compatible with Material UI theme colors
 */
export const BASE_CYTOSCAPE_STYLE = [
  // Default node style - no overlay effects
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'text-valign': 'center',
      'text-halign': 'center',
      'border-width': 2,
      'width': '60px',
      'height': '60px',
      'font-size': '12px',
      'text-outline-width': 1,
      'text-outline-color': '#000',
      'overlay-opacity': 0 // Ensure no overlay by default
    }
  },
  // Default edge style
  {
    selector: 'edge',
    style: {
      'width': 2,
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'font-size': '10px',
      'text-rotation': 'autorotate',
      'text-margin-y': -10
    }
  },
  // Edge label style (only for edges with labels)
  {
    selector: 'edge[label]',
    style: {
      'label': 'data(label)'
    }
  },
  // Selected element highlighting - uses Material UI primary color
  {
    selector: ':selected',
    style: {
      'border-color': '#FF5722', // Material UI deep orange
      'border-width': 4,
      'line-color': '#FF5722',
      'target-arrow-color': '#FF5722'
    }
  },
  // Group hull styling
  {
    selector: 'node.group-hull',
    style: {
      'background-opacity': 0.1,
      'border-width': 2,
      'border-opacity': 0.5,
      'border-style': 'dashed',
      'shape': 'round-rectangle',
      'label': 'data(label)',
      'text-valign': 'top',
      'text-halign': 'center',
      'font-size': '14px',
      'font-weight': 'bold',
      'z-index': -1,
      'background-color': 'data(hullColor)',
      'border-color': 'data(hullColor)',
      'color': 'data(hullColor)'
    }
  }
]

/**
 * Material UI themed styles for GraphViewer components
 */
export const createGraphViewerStyles = (theme) => ({
  // Main container styles
  container: {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    backgroundColor: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },

  // Toolbar styles
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    minHeight: 48,
    '& .MuiIconButton-root': {
      color: theme.palette.text.secondary,
      '&:hover': {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.action.hover,
      },
      '&:disabled': {
        color: theme.palette.action.disabled,
      }
    }
  },

  // Graph container
  graphContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: theme.palette.background.paper,
  },

  // Performance metrics overlay
  metricsOverlay: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: theme.palette.common.white,
    fontSize: '0.75rem',
    minWidth: 120,
    borderRadius: theme.shape.borderRadius,
    fontFamily: theme.typography.fontFamily,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.action.hover,
    zIndex: 1000,
  },

  // Empty state
  emptyState: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },

  // Status bar
  statusBar: {
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(1, 2),
    backgroundColor: theme.palette.background.paper,
  },

  // Layout menu
  layoutMenu: {
    '& .MuiPaper-root': {
      marginTop: theme.spacing(1),
    },
    '& .MuiMenuItem-root': {
      '&.Mui-selected': {
        backgroundColor: theme.palette.action.selected,
      }
    }
  }
})

/**
 * Build complete Cytoscape style array with ITM-specific styles
 * @param {Object} customStyles - Additional custom styles
 * @param {Object} theme - Material UI theme object
 * @returns {Array} Complete style array for Cytoscape
 */
export const buildCytoscapeStyle = (customStyles = {}, theme = null) => {
  const styles = [...BASE_CYTOSCAPE_STYLE]
  
  // Add node type styles
  Object.entries(NODE_STYLES).forEach(([nodeType, style]) => {
    styles.push({
      selector: `node[type="${nodeType}"]`,
      style: style
    })
  })
  
  // Add edge type styles  
  Object.entries(EDGE_STYLES).forEach(([edgeType, style]) => {
    styles.push({
      selector: `edge[type="${edgeType}"]`,
      style: style
    })
  })
  
  // Add system-based node highlighting
  styles.push({
    selector: 'node[systems.length > 0]',
    style: {
      'border-style': 'double',
      'border-width': 3
    }
  })
  
  // Use Material UI theme colors if available
  if (theme) {
    styles.push({
      selector: ':selected',
      style: {
        'border-color': theme.palette.primary.main,
        'line-color': theme.palette.primary.main,
        'target-arrow-color': theme.palette.primary.main
      }
    })
  }
  
  // Merge any custom styles
  if (customStyles.nodes) {
    styles.push({
      selector: 'node',
      style: customStyles.nodes
    })
  }
  
  if (customStyles.edges) {
    styles.push({
      selector: 'edge', 
      style: customStyles.edges
    })
  }
  
  // Add temp element styles for drag-to-connect
  styles.push({
    selector: '.temp-node',
    style: {
      'opacity': 0,
      'width': 1,
      'height': 1
    }
  })
  
  styles.push({
    selector: '.temp-edge',
    style: {
      'width': 2,
      'line-color': '#0074cc',
      'curve-style': 'straight',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#0074cc',
      'arrow-scale': 1.2,
      'opacity': 0.7,
      'line-style': 'dashed'
    }
  })
  
  // Note: Hover effects are now handled via direct style manipulation in event handlers
  // No CSS hover selectors needed since we use instance.on('mouseover') and node.style()
  
  return styles
}
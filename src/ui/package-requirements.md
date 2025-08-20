# ITM React UI - NPM Package Requirements

Based on the architecture requirements:
- React-based frontend
- Material UI with icon library
- Cytoscape (no React wrapper) for graph visualization
- Redux for state management with undo/redo capabilities
- Direct service integration (no REST API)
- Permission guards for different user types

## Core Dependencies

### React Ecosystem
```bash
npm install react react-dom
npm install react-router-dom                    # Client-side routing
npm install react-redux @reduxjs/toolkit        # State management
```

### Material UI
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material                 # Material UI icons
npm install @mui/lab                            # Material UI lab components
npm install @mui/x-data-grid                    # Advanced data grid for tables
npm install @mui/x-date-pickers                 # Date/time pickers
```

### Graph Visualization
```bash
npm install cytoscape                           # Core graph library (no React wrapper)
npm install cytoscape-dagre                     # Hierarchical layout
npm install cytoscape-cola                      # Force-directed layout
npm install cytoscape-cose-bilkent             # High-quality layout
npm install cytoscape-context-menus            # Context menu support
npm install cytoscape-node-resize              # Node resizing
npm install cytoscape-edgehandles              # Edge creation by dragging
```

### State Management & Undo/Redo
```bash
npm install redux-undo                          # Undo/redo functionality
npm install immer                               # Immutable state updates
npm install reselect                            # Memoized selectors
```

### Forms & Validation
```bash
npm install react-hook-form                     # Performant forms
npm install @hookform/resolvers                 # Form validation resolvers
npm install yup                                 # Schema validation
```

### Utilities
```bash
npm install lodash                              # Utility functions
npm install date-fns                           # Date manipulation
npm install uuid                               # UUID generation
npm install classnames                         # Conditional CSS classes
```

### Development Dependencies
```bash
npm install --save-dev @types/react @types/react-dom
npm install --save-dev @types/cytoscape
npm install --save-dev @types/lodash
npm install --save-dev typescript
npm install --save-dev @vitejs/plugin-react    # If using Vite
npm install --save-dev eslint eslint-plugin-react
npm install --save-dev prettier
```

## Optional Enhancement Packages

### Performance & Optimization
```bash
npm install react-window react-window-infinite-loader  # Virtualization for large lists
npm install react-error-boundary                       # Error boundaries
```

### Advanced UI Features
```bash
npm install react-beautiful-dnd                # Drag and drop
npm install react-resizable-panels             # Resizable layouts
npm install react-hotkeys-hook                 # Keyboard shortcuts
```

### Export/Import Capabilities
```bash
npm install xlsx                               # Excel export/import
npm install file-saver                        # File download utility
npm install papaparse                         # CSV parsing
```

## Architecture Rationale

### Why These Choices:

**Material UI**: 
- Comprehensive component library
- Built-in theming and accessibility
- Professional look and feel
- Extensive icon library

**Cytoscape (no wrapper)**:
- Maximum control over graph rendering
- Rich ecosystem of extensions
- High performance for large graphs
- Direct DOM manipulation when needed

**Redux Toolkit + Redux Undo**:
- Predictable state management
- Built-in undo/redo capabilities
- Time travel debugging
- Action tracking for user analytics

**React Hook Form + Yup**:
- Performant form handling
- Schema-based validation matching our backend
- Minimal re-renders
- Easy integration with Material UI

## Project Structure Integration

The packages support our modular architecture:
- Redux slices for each domain (assets, relationships, systems)
- Material UI components with consistent theming
- Cytoscape integration without wrapper constraints
- Form validation aligned with backend schemas
- Permission guards using Redux state

## Next Steps Consideration

After package installation, we'll need:
1. Redux store configuration with undo/redo
2. Material UI theme setup
3. Cytoscape integration layer
4. Permission/guard system architecture
5. Service integration patterns
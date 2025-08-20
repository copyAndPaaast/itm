# ITM System User Interface

This directory contains the user interface components for the IT Asset Management (ITM) system.

## Architecture Overview

The UI is organized around core ITM workflows and follows a component-based architecture:

### Core Workflows
1. **Asset Management** - Create, edit, and manage IT assets
2. **Relationship Mapping** - Define dependencies and connections between assets
3. **System Organization** - Group assets into logical systems and groups
4. **Template Management** - Manage AssetClass and RelationshipClass templates
5. **Impact Analysis** - Visualize and analyze asset dependencies
6. **System Overview** - Dashboards and reporting

### Technology Stack
- **Framework**: [To be determined - React, Vue, or vanilla JS]
- **Graph Visualization**: For dependency mapping and impact analysis
- **State Management**: For complex application state
- **Styling**: Component-based styling approach

## Directory Structure

```
src/ui/
├── components/           # Reusable UI components
│   ├── common/          # Generic components (buttons, forms, modals)
│   ├── asset/           # Asset-specific components
│   ├── relationship/    # Relationship-specific components
│   ├── system/          # System and group components
│   ├── template/        # Template management components
│   └── visualization/   # Graph and chart components
├── pages/               # Full page components/views
│   ├── dashboard/       # System overview and dashboards
│   ├── assets/          # Asset management pages
│   ├── relationships/   # Relationship management pages
│   ├── systems/         # System and group management
│   ├── templates/       # Template management pages
│   └── analysis/        # Impact analysis and reporting
├── services/            # UI service layer (API communication)
├── utils/               # UI utility functions
├── styles/              # Global styles and themes
├── hooks/               # Custom hooks (if using React)
└── store/               # State management
```

## Component Design Principles

1. **Domain-Driven**: Components organized by ITM domain concepts
2. **Reusable**: Common components shared across different features
3. **Accessible**: Following accessibility best practices
4. **Responsive**: Mobile-friendly design where applicable
5. **Graph-Centric**: Heavy emphasis on visual relationship representation

## Key UI Features

### Asset Management
- Asset creation wizard with AssetClass templates
- Asset property editor with schema validation
- Asset search and filtering
- Bulk asset operations

### Relationship Mapping
- Visual relationship creation between assets
- Relationship property editor
- Direction switching interface
- Dependency chain visualization

### System Organization
- System and group management interface
- Drag-and-drop asset assignment
- System health dashboards
- Membership visualization

### Impact Analysis
- Interactive dependency graphs
- Impact assessment tools
- Change impact preview
- Relationship path analysis

### Template Management
- AssetClass schema editor
- RelationshipClass definition interface
- Template preview and validation
- Schema migration tools
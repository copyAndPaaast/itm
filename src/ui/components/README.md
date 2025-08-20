# UI Components

Reusable components for the ITM system, organized by domain and functionality.

## Component Categories

### Common Components (`/common`)
Generic, reusable components used throughout the application:

- **Button** - Primary, secondary, danger buttons with loading states
- **Input** - Text inputs with validation and schema support
- **Select** - Dropdown selectors with search and multi-select
- **Modal** - Overlay dialogs for forms and confirmations
- **Table** - Data tables with sorting, filtering, pagination
- **Card** - Content containers with consistent styling
- **Badge** - Status indicators and labels
- **Tabs** - Tab navigation for organizing content
- **Tooltip** - Contextual help and information
- **Loading** - Loading spinners and skeleton screens
- **IconButton** - Icon-only buttons for actions
- **SearchBox** - Search input with autocomplete
- **PropertyEditor** - Generic property key-value editor
- **SchemaForm** - Dynamic form generator from property schemas

### Asset Components (`/asset`)
Asset-specific UI components:

- **AssetCard** - Display asset summary with membership info
- **AssetForm** - Create/edit asset with AssetClass validation
- **AssetClassSelector** - AssetClass selection with preview
- **AssetList** - Paginated asset listing with filters
- **AssetSearch** - Advanced asset search with facets
- **AssetMembershipWidget** - Shows system/group memberships
- **AssetPropertyPanel** - Property editor with schema validation
- **AssetCompatibilityChecker** - Class switching compatibility analysis
- **AssetClassSwitcher** - Interface for changing asset classes
- **AssetSystemLabels** - Visual system label display
- **AssetRelationshipSummary** - Shows asset's relationships

### Relationship Components (`/relationship`)
Relationship-specific components:

- **RelationshipForm** - Create/edit relationships
- **RelationshipCard** - Display relationship with endpoints
- **RelationshipClassSelector** - RelationshipClass selection
- **RelationshipDirectionSwitcher** - Switch relationship direction
- **RelationshipPropertyPanel** - Edit relationship properties
- **RelationshipPathViewer** - Show relationship chains
- **RelationshipTypeFilter** - Filter by relationship types
- **RelationshipCompatibilityChecker** - Class switching analysis
- **RelationshipEndpointSelector** - Select source/target assets
- **RelationshipValidationSummary** - Show validation results

### System Components (`/system`)
System and group management components:

- **SystemCard** - System overview with metadata
- **SystemForm** - Create/edit system entities
- **SystemMemberList** - List assets in a system
- **SystemHealthDashboard** - System metrics and health
- **GroupCard** - Group overview with members
- **GroupForm** - Create/edit groups
- **GroupMembershipManager** - Add/remove group members
- **SystemSelector** - System selection dropdown
- **MembershipSummaryWidget** - Node's complete membership info
- **SystemStatsWidget** - System statistics display
- **SystemLabelManager** - Manage system label assignments

### Template Components (`/template`)
Template management components:

- **AssetClassForm** - Create/edit AssetClass templates
- **AssetClassList** - Browse available AssetClasses
- **AssetClassPreview** - Preview AssetClass definition
- **RelationshipClassForm** - Create/edit RelationshipClass templates
- **RelationshipClassList** - Browse RelationshipClasses
- **PropertySchemaEditor** - Visual schema definition editor
- **SchemaValidator** - Validate schema definitions
- **TemplateUsageStats** - Show template usage statistics
- **SchemaPreview** - Preview generated forms from schemas
- **PropertyTypeSelector** - Select property types and constraints
- **TemplateImportExport** - Import/export template definitions

### Visualization Components (`/visualization`)
Graph and chart components for relationship visualization:

- **DependencyGraph** - Interactive asset dependency visualization
- **RelationshipDiagram** - Visual relationship mapper
- **SystemTopology** - System architecture visualization
- **ImpactAnalysisChart** - Visual impact assessment
- **NetworkMap** - Network-style asset relationship view
- **HierarchyTree** - Hierarchical asset organization
- **FlowDiagram** - Data/dependency flow visualization
- **GraphControls** - Graph manipulation controls (zoom, pan, filter)
- **NodeRenderer** - Custom node rendering for different asset types
- **EdgeRenderer** - Custom edge rendering for different relationships
- **GraphLegend** - Legend for graph symbols and colors
- **GraphFilter** - Interactive graph filtering interface

## Component Standards

### Props Interface
Each component should have a clear TypeScript interface defining:
- Required vs optional props
- Prop types and validation
- Event handlers and callbacks
- Default values

### Event Handling
Components emit semantic events:
- `onAssetSelect` - Asset selection events
- `onRelationshipCreate` - Relationship creation
- `onPropertyChange` - Property modifications
- `onValidationError` - Validation failures

### Error Handling
Components handle errors gracefully:
- Display user-friendly error messages
- Provide fallback UI for failed operations
- Emit error events for parent handling

### Accessibility
All components follow accessibility guidelines:
- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support

### Testing
Each component includes:
- Unit tests for logic
- Integration tests for user interactions
- Visual regression tests for UI consistency
- Accessibility tests
# UI Pages

Full page components that compose multiple components into complete user workflows.

## Page Structure

Each page directory contains:
- Main page component
- Page-specific subcomponents
- Page-level state management
- Route definitions and guards

## Page Categories

### Dashboard (`/dashboard`)
System overview and monitoring pages:

**DashboardOverview**
- System health summary cards
- Key metrics and KPIs (asset count, relationship count, system count)
- Recent activity feed
- Quick access to common tasks
- Alert notifications for issues

**SystemDashboard**
- Individual system health and metrics
- Asset distribution charts
- Relationship health indicators
- Performance metrics
- System-specific alerts

**AssetDashboard**
- Asset inventory summary
- AssetClass distribution
- Asset health indicators
- Compliance status
- Asset lifecycle metrics

### Assets (`/assets`)
Asset management and inventory pages:

**AssetInventory**
- Comprehensive asset listing with advanced filters
- Bulk operations (assign systems, update properties)
- Asset import/export functionality
- Search with faceted filtering
- Asset health status overview

**AssetDetails**
- Individual asset detail view
- Property editor with schema validation
- Relationship visualization (connected assets)
- System and group membership display
- Asset history and change log
- Compatible class switching options

**AssetCreate**
- Asset creation wizard
- AssetClass selection and preview
- Property form with validation
- System assignment
- Relationship creation
- Preview before creation

**AssetEdit**
- Asset property editor
- Class switching interface with compatibility analysis
- System membership management
- Relationship modification
- Change preview and validation

### Relationships (`/relationships`)
Relationship management and mapping pages:

**RelationshipMapper**
- Visual relationship creation interface
- Drag-and-drop asset connection
- Relationship type selection
- Property assignment
- Bulk relationship creation

**RelationshipInventory**
- List all relationships with filtering
- Relationship health status
- Bulk operations (direction switching, property updates)
- Relationship validation and cleanup

**RelationshipDetails**
- Individual relationship detail view
- Property editor
- Direction switching interface
- Class switching with compatibility check
- Endpoint asset details
- Related relationships

**DependencyAnalysis**
- Asset dependency chain visualization
- Impact analysis for changes
- Circular dependency detection
- Critical path analysis
- Dependency health assessment

### Systems (`/systems`)
System and group organization pages:

**SystemOverview**
- List all systems with health indicators
- System creation and management
- System hierarchy visualization
- Cross-system relationship analysis

**SystemDetails**
- Individual system detail view
- Asset inventory within system
- System property management
- Group organization within system
- System health metrics and alerts

**SystemManagement**
- System creation and configuration
- System property editor
- Label management
- Asset assignment interface
- System migration tools

**GroupManagement**
- Group creation and organization
- Member management (add/remove assets)
- Group hierarchy and nesting
- Group-based operations
- Group analytics

### Templates (`/templates`)
Template management for AssetClasses and RelationshipClasses:

**TemplateOverview**
- Browse all AssetClass and RelationshipClass templates
- Template usage statistics
- Template health and validation status
- Quick template actions

**AssetClassManager**
- Create and edit AssetClass templates
- Property schema visual editor
- Template validation and testing
- Usage impact analysis
- Template versioning

**RelationshipClassManager**
- Create and edit RelationshipClass templates
- Relationship property schema editor
- Node type constraints definition
- Template validation
- Usage statistics

**SchemaEditor**
- Visual property schema editor
- Property type selection and configuration
- Validation rule definition
- Schema preview and testing
- Import/export schema definitions

### Analysis (`/analysis`)
Advanced analysis and reporting pages:

**ImpactAnalysis**
- Change impact assessment
- Asset dependency analysis
- System interdependency mapping
- Risk assessment for changes
- Impact simulation

**ComplianceReporting**
- Asset compliance status
- Audit trail and change history
- Compliance dashboard
- Regulatory reporting
- Policy violation detection

**PerformanceAnalytics**
- System performance metrics
- Asset utilization analysis
- Relationship health trends
- Capacity planning insights
- Performance optimization recommendations

**DataInsights**
- Asset and relationship trend analysis
- Usage pattern identification
- Anomaly detection
- Predictive analytics
- Business intelligence reports

## Page Navigation

### Primary Navigation
- Dashboard (home)
- Assets (inventory management)
- Relationships (dependency mapping)
- Systems (organization)
- Templates (schema management)
- Analysis (insights and reporting)

### Contextual Navigation
- Breadcrumb navigation for deep pages
- Related page suggestions
- Quick access to frequently used features
- Search-driven navigation

### User Workflows
Pages are designed to support common ITM workflows:

1. **Asset Discovery**: Create → Configure → Organize → Analyze
2. **Relationship Mapping**: Discover → Connect → Validate → Monitor
3. **System Organization**: Plan → Implement → Monitor → Optimize
4. **Change Management**: Assess → Plan → Execute → Validate
5. **Compliance Monitoring**: Audit → Report → Remediate → Monitor

## Responsive Design

All pages support:
- Desktop-first design with mobile adaptation
- Responsive layouts for different screen sizes
- Touch-friendly interfaces for mobile devices
- Progressive disclosure for complex features
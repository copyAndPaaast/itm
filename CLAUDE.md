# Graph2 - ITM Neo4j Graph System ✅ COMPLETED

## Core Architecture - ✅ COMPLETE
- ✅ Neo4j driver with environment configuration
- ✅ Module pattern with interfaces (Node, Relationship, Group, System, AssetClass)
- ✅ Demo-driven validation (no automated tests) - backend modules only
- ✅ React UI with GraphViewer (Component + Hook + Service pattern) - manual browser testing

## Build Commands
- Backend: `npm run build`, `npm run dev` 
- UI: `npm run dev:ui`, `npm run build:ui`

## Cytoscape.js Plugin Ecosystem
**IMPORTANT**: Before implementing custom graph functionality, always check the official Cytoscape.js plugin repository: 
- **Repository**: https://github.com/orgs/cytoscape/repositories?type=all
- **Available plugins**: edgehandles, compound-drag-and-drop, autopan-on-drag, etc.
- **Principle**: Use official plugins instead of custom implementations whenever possible
- **Benefits**: Better performance, maintenance, testing, and community support

**Current plugins in use:**
- `cytoscape-dagre`: Hierarchical layout algorithm
- `cytoscape-expand-collapse`: Professional compound node collapse/expand with visual cues
- `cytoscape-compound-drag-and-drop`: Interactive node grouping and hierarchy management

## ITM Context
**IT Asset Management** - Graph nodes represent servers, applications, databases, network devices, users, locations with typed relationships carrying properties.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

---

## 🎯 **NEW: Collapsible System Compounds** - *August 22, 2025*
**Advanced ITAM visualization with sophisticated system management**

### **Screenshot**: `screenshots/collapsible_systems_demo_2025-08-22T19-16-37-485Z.png`
*Comprehensive demo showing 11 nodes across 3 collapsible systems with multi-system assets*

### **Key Features Implemented:**
- **✅ Visual Collapse Cues**: Top-right corner buttons (16px) on system compounds with professional Material UI styling
- **✅ Smart Collapse Behavior**: Animated transitions (500ms) with dagre re-layout and hull auto-updates
- **✅ Comprehensive UI Controls**: Global "Expand All Systems" toggle + individual system controls with real-time status
- **✅ Professional Styling**: Collapsed systems appear as compact blue proxy nodes (120x80px) with double borders
- **✅ Multi-System Asset Support**: Advanced nodes appearing in multiple systems with sophisticated edge routing

### **ITAM Use Cases:**
- **Large Infrastructure Overview**: Collapse entire datacenter systems for executive dashboards
- **Drill-Down Navigation**: Expand specific systems when detailed analysis needed
- **Presentation Mode**: Clean high-level view for stakeholder meetings
- **Performance Optimization**: Better rendering with hundreds of nodes across many systems

### **Technical Implementation:**
- **Plugin**: `cytoscape-expand-collapse ^4.1.1` with custom configuration
- **Selector**: `expandCollapseCueSelector: 'node[compoundType = "system"]'` (only system compounds show cues)
- **Layout Integration**: Automatic dagre re-layout after expand/collapse with hull refresh
- **State Management**: React state synchronization with Cytoscape operations
- **Event Handling**: Before/after collapse hooks with proper cleanup and validation

### **How to Use:**
1. **Visual Cues**: Click collapse/expand buttons (top-right corner of system compounds)
2. **UI Controls**: Use "System Collapse Controls" panel for programmatic toggle
3. **Global Operations**: "Expand All Systems" toggle for bulk operations
4. **Status Indicators**: Real-time "Expanded/Collapsed" status with color coding

### **Demo Features Visible in Screenshot:**
- **3 Systems**: ViewerArchitecture, ViewerArchitecture1, DataFlow (all expandable)
- **Multi-System Assets**: Data Mapper appears in multiple systems with dashed borders
- **Light Red Connections**: Dashed edges linking multi-system asset instances
- **Group Hulls**: 5 colored group boundaries (Core Components, Backend Services, Data Access, UI Layer)
- **Professional UI**: Material UI controls with real-time state indicators
- **Complete Architecture**: 11 nodes demonstrating sophisticated ITAM relationships

---

## 🚀 **MAJOR FEATURE RELEASES** - *August 24, 2025*
**Complete professional ITM application with advanced UI and auto-configuration**

### **🎯 Feature 1: Auto-Creation of Default Node & Edge Classes**
**Zero-configuration startup for immediate graph creation**

#### **Key Achievements:**
- **✅ Startup Auto-Creation**: Default 'Default' AssetClass and RelationshipClass created automatically on app startup
- **✅ Zero Configuration**: Users can start drawing nodes and edges immediately without any setup
- **✅ Fallback Safety**: Generic defaults available when no specific asset classes are selected
- **✅ One-Time Creation**: Classes created once, reused throughout application lifecycle

#### **Default Classes Created:**
**Default AssetClass "Default":**
```javascript
{
  className: 'Default',
  propertySchema: {
    name: { type: 'string', required: true, default: 'New Asset' },
    description: { type: 'string', required: false, default: '' }
  },
  requiredProperties: ['name']
}
```

**Default RelationshipClass "Default" (CONNECTS_TO):**
```javascript
{
  relationshipClassName: 'Default',
  relationshipType: 'CONNECTS_TO',
  propertySchema: {
    connection_type: { type: 'string', default: 'general' }
  },
  allowedFromTypes: ['Asset'],
  allowedToTypes: ['Asset']
}
```

#### **Technical Implementation:**
- **Neo4jService.ensureDefaultClasses()**: Core auto-creation with dynamic imports to avoid circular dependencies
- **DatabaseService proxy**: UI-friendly wrapper with comprehensive error handling
- **App.jsx integration**: Startup flow with graceful degradation if creation fails
- **Comprehensive Logging**: Detailed step-by-step debugging for troubleshooting

#### **User Experience:**
- **Immediate Usability**: Can start creating graph structures instantly
- **Professional Feedback**: Clear success/error status messages
- **No Setup Required**: Works out-of-the-box for new installations

---

### **🎯 Feature 2: Dynamic Context-Aware Graph Viewer Titles**
**Intelligent graph viewer titles based on current system state**

#### **Key Achievements:**
- **✅ Context Awareness**: Graph title automatically reflects current viewing context
- **✅ Multi-Language Support**: German UI elements ("System Übersicht", "Neues System")
- **✅ Redux Integration**: Title logic connected to system state management
- **✅ Professional UX**: Users always know what system/context they're viewing

#### **Dynamic Title Logic:**
1. **"System Übersicht"**: When in compound view mode (viewing multiple systems)
2. **System Name** (e.g., "ViewerArchitecture"): When viewing specific system in single mode
3. **"Neues System"**: During new system creation workflow
4. **"ITM Graph"**: Default fallback when no specific system context

#### **Technical Implementation:**
- **MainLayout.getGraphViewerTitle()**: Smart title calculation based on Redux state
- **GraphViewer title prop**: Clean component API for title passing
- **GraphViewerToolbar**: Dynamic title rendering with fallback handling
- **System State Integration**: Uses selectCurrentSystem, selectSystemViewMode selectors

---

### **🎯 Feature 3: Professional Control Panel with Action Icons**
**Comprehensive management interface with permission-based functionality**

#### **Key Achievements:**
- **✅ Accordion Architecture**: Professional collapsible sections for Systems, Nodes, Relationships
- **✅ Permission-Based UI**: Action icons only visible to users with appropriate permissions
- **✅ Overlay Integration**: Connected to reusable overlay system for future functionality
- **✅ SystemsList Component**: Auto-loading, compact system display with selection

#### **Control Panel Features:**
- **Systems Section**: Auto-loading SystemsList with format "System Name [Label] NodeCount"
- **Action Icons**: Edit Node Types and Edit Relationships (permission-dependent)
- **Professional Styling**: Material UI with hover effects, tooltips, spacing
- **Future-Ready**: Slots ready for Nodes and Relationships list components

#### **SystemsList Component:**
- **Auto-Loading**: Uses loadAllSystemsAction on mount
- **Compact Layout**: Horizontal "SystemName [SystemLabel] NodeCount" format
- **Active Selection**: Visual feedback for currently selected system
- **Central Status**: Integrates with StatusIndicator (no local loading states)

---

### **🎯 Feature 4: Reusable Overlay System**
**Professional modal/dialog system for consistent UI patterns**

#### **Key Achievements:**
- **✅ Complete Overlay Architecture**: Overlay, OverlayProvider, useOverlay hook
- **✅ Context-Based Management**: Global overlay state without prop drilling
- **✅ Flexible API**: Support for dialogs, editors, full-screen overlays
- **✅ Material UI Integration**: Professional styling with accessibility features

#### **Overlay System Components:**
- **Overlay Component**: Reusable modal with flexible content/actions
- **OverlayProvider**: Context provider for global overlay management
- **useOverlay Hook**: Simple API (showDialog, showEditor, hideOverlay)
- **Testing Integration**: Connected to Control Panel action icons

#### **Usage Patterns:**
```javascript
// Simple dialog
const { showDialog } = useOverlay()
showDialog('Title', <Content />, <Actions />)

// Editor overlay
const { showEditor } = useOverlay()
showEditor('Edit Node Types', <Editor />, <SaveCancel />)
```

---

### **🎯 Technical Architecture Improvements**

#### **Component Organization:**
- **Proper Separation**: UI components in `/src/ui/components/` vs business logic
- **Style Extraction**: All styling in separate ComponentStyles.js files
- **Clean APIs**: Components focus on logic, not styling clutter
- **Folder Structure**: Each component gets its own directory with styles

#### **State Management:**
- **Redux Integration**: Proper serialization handling for Neo4j objects
- **Form Synchronization**: SystemPropertiesForm syncs with Redux state
- **Status Management**: Central StatusIndicator for all loading/error states
- **Permission Integration**: PermissionService for conditional UI rendering

#### **Error Handling:**
- **Comprehensive Logging**: Step-by-step debugging for all operations
- **Graceful Degradation**: App continues even if non-critical features fail
- **User Feedback**: Professional error messages with actionable details
- **Development Tools**: Enhanced console logging for troubleshooting

---

### **🎯 ITM Business Value**

#### **Immediate Productivity:**
- **Zero Setup Time**: Users can start creating ITM graphs immediately
- **Professional Interface**: Enterprise-ready UI with proper error handling
- **Context Awareness**: Always know which systems/assets you're managing
- **Permission Security**: Role-based access to editing capabilities

#### **Scalability & Maintenance:**
- **Modular Architecture**: Clean separation of concerns across all components
- **Extensible Design**: Overlay system ready for future node/relationship editing
- **Professional Patterns**: Consistent Material UI styling and component structure
- **Performance Optimized**: Proper state management and rendering patterns

#### **Enterprise Ready:**
- **Professional Logging**: Comprehensive debugging and monitoring capabilities
- **Error Resilience**: Graceful handling of database and initialization failures
- **Security Patterns**: Permission-based UI with proper access control
- **Multilingual Support**: German UI elements for international deployment

**Result**: Complete professional ITM application ready for enterprise deployment with zero-configuration startup and advanced graph management capabilities.

---

## 🎯 **MILESTONE: Professional Node Creation with System Context** - *August 24, 2025*
**Context-aware node creation with proper system integration and edit mode requirements**

### **Key Achievements:**
- **✅ Neo4j Element ID Integration**: Fixed all system ID handling to use proper Neo4j `elementId()` instead of custom numeric IDs
- **✅ Context-Aware Node Creation**: Nodes can only be created when system is in edit mode (Properties Panel active)
- **✅ System State Integration**: GraphViewer properly receives and tracks currentSystemId, currentSystem, and isEditingSystem props
- **✅ Closure Issue Resolution**: Fixed React closure/stale data issues using refs for real-time prop tracking
- **✅ Professional User Feedback**: Context-aware warning messages for different blocking scenarios

### **Node Creation Workflow:**
```javascript
// Required Steps:
1. Select System from SystemsList → ✅ System selected
2. Activate "Edit System" → ✅ Properties Panel opens (isEditingSystem: true)  
3. Ctrl+Click on Graph → ✅ Node creation allowed

// Blocking Scenarios:
- No System Selected → "System Selection Required"
- System Selected but Not Editing → "Edit Mode Required - Please activate 'Edit System' mode"
- Insufficient Permissions → "Node creation blocked - insufficient permissions"
```

### **Technical Implementation:**
- **GraphViewer Props**: `currentSystemId`, `currentSystem`, `isEditingSystem` properly passed from MainLayout
- **Ref-Based State Tracking**: `currentSystemIdRef`, `currentSystemRef`, `isEditingSystemRef` for real-time updates
- **Event-Driven Architecture**: `create_node` and `create_node_blocked` events with detailed context data
- **Redux Integration**: Full system state management with proper selectors and actions

### **System ID Format:**
- **Before**: Custom numeric IDs (`"64"`)
- **After**: Full Neo4j element IDs (`"4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64"`)
- **SystemService**: All queries updated to use `elementId(s)` instead of `toString(id(s))`

### **User Experience:**
- **Professional Feedback**: Clear warning messages explain exactly what's needed for node creation
- **Context Awareness**: Different messages for editing vs selecting systems
- **Visual Consistency**: Proper Neo4j ID handling prevents ID mismatches across UI components
- **Edit Mode Enforcement**: Ensures deliberate system modification workflow

### **Console Logging:**
- `🔍 Node creation check:` - Shows systemId, editing state, system name
- `⚠️ Node creation requires system to be in edit mode` - Clear blocking message
- `🎯 Creating node in editing system:` - Success confirmation
- `🔄 Updated system refs:` - Real-time prop updates

### **ITM Business Value:**
- **Controlled Asset Creation**: Prevents accidental node creation outside of deliberate editing sessions
- **System Integrity**: Ensures all nodes are properly associated with systems in edit context
- **Professional UX**: Enterprise-ready workflow with clear feedback and proper error handling
- **Audit Trail**: Comprehensive logging of node creation attempts and system context

**Result**: Professional node creation workflow that requires deliberate system editing activation, ensuring controlled and context-aware IT asset management.

## Organizational Rules

### Permission Management
- **Permission matrices and access control logic must be kept in `/src/ui/permissions/`**
- Use `PermissionService` for centralized permission management
- Never embed permission logic directly in components or services

### Styling and Theming - CRITICAL RULE
- **ALL styles must be kept in component-local style files**
- **NEVER use inline sx={{ }} styling in components**
- **ALWAYS use sx={styles.container} pattern**
- **Each component gets its own folder with ComponentStyles.js**
- Support Material UI theming with `createComponentStyles(theme)` pattern
- Extract global styles (like Cytoscape) to `/src/ui/styles/` for shared usage
- Never embed styling constants directly in components

**Component Structure:**
```
src/ui/components/layout/Footer/
├── Footer.jsx              # Clean component logic
├── FooterStyles.js         # All styling extracted
└── FooterInterface.js      # API documentation (if needed)
```

**Example of CORRECT styling separation:**
```jsx
// ❌ WRONG - Inline styling clutters component
<Box sx={{ 
  p: 1.5, 
  display: 'flex', 
  justifyContent: 'space-between' 
}}>

// ✅ CORRECT - Clean component with extracted styles
import { createFooterStyles } from './FooterStyles.js'
const styles = createFooterStyles(theme)
<Box sx={styles.container}>
```

**REMINDER**: Components must be as readable as possible. No styling clutter!

## MANDATORY: Function Duplication Check
Before implementing any new method or function:
1. **Check if the method already exists** in the appropriate service module
2. **Verify if it belongs in the current module** or should be moved to its correct service
3. **Avoid duplicating functionality** across different modules
4. **Use existing methods** from their proper services rather than recreating them

Example violations to avoid:
- Adding `getAvailableAssetClasses()` to NodeFactory when it exists in AssetClassService
- Adding `validateProperties()` to NodeFactory when it should be in AssetClassService  
- Creating wrapper methods that just call other service methods without adding value

**Correct approach**: Call methods directly from their appropriate service (AssetClassService, NodeService, SystemService) rather than wrapping them unnecessarily.

## MANDATORY: Simple Cypher Queries
Keep all Cypher queries as simple as possible:
1. **Prefer simple MATCH patterns** over complex multi-step queries
2. **Avoid complex WHERE conditions** when possible - use simple property matching
3. **Minimize nested subqueries** and complex aggregations
4. **Use basic CREATE, MATCH, SET, DELETE patterns**
5. **Avoid advanced Cypher features** unless absolutely necessary

**If complex queries are unavoidable:**
- **Discussion required** before implementation
- **Document the complexity** and why simpler alternatives won't work
- **Consider breaking into multiple simple queries** instead of one complex query

**Examples of preferred simple patterns:**
```cypher
// Good - Simple and clear
MATCH (n:Asset) WHERE id(n) = $nodeId RETURN n

// Good - Basic relationship creation
CREATE (a)-[:DEPENDS_ON $properties]->(b)

// Avoid - Complex aggregation and filtering
MATCH (g:Group) WHERE g.isActive = true
WITH g
MATCH (member:Asset:ProdWebSystem)-[:MEMBER_OF]->(g)
WITH g, collect(toString(id(member))) as systemMembers
OPTIONAL MATCH (allMembers:Asset)-[:MEMBER_OF]->(g)
RETURN g, systemMembers, collect(toString(id(allMembers))) as allMembers
```

**Goal**: Maintain readable, maintainable, and performant Neo4j interactions.

## CRITICAL: Module Independence and Separation of Concerns

### Core Principle
**Modules MUST remain ignorant of other modules and components.** Each module should only know about its own domain and responsibilities.

### ❌ FORBIDDEN - Module Cross-Dependencies
- RelationshipService handling Group relationships
- NodeService knowing about Group membership logic
- AssetClass operations mixed with Node operations
- Any module calling methods from another module's domain

### ✅ REQUIRED - Clean Module Boundaries
Each module operates only within its domain:

**RelationshipService:**
- ONLY Asset-to-Asset relationships
- NO Group relationships (use GroupService)
- NO Node creation (use NodeService)

**GroupService:**
- ONLY Group operations and membership
- NO Asset relationships (use RelationshipService)
- Handles its own `:_MEMBER_OF` relationships

**NodeService:**
- ONLY Asset node operations
- NO Group membership management
- NO Relationship creation

**AssetClassService:**
- ONLY AssetClass template management
- NO Asset node creation
- NO Relationship definitions

### Implementation Rules
1. **Single Responsibility**: Each module handles ONE domain
2. **No Cross-Module Calls**: Never call methods from other service modules
3. **Clear APIs**: Interface methods reflect only module's domain
4. **Domain Validation**: Reject operations outside module scope
5. **Error Messages**: Guide users to correct module for their needs

### Example Violations to Avoid
```javascript
// ❌ WRONG - RelationshipService handling groups
relationshipService.createRelationship({
  fromType: 'Group', // NO! Use GroupService
  toType: 'Asset'
})

// ❌ WRONG - NodeService managing group membership  
nodeService.addToGroup({nodeId, groupId}) // NO! Use GroupService

// ❌ WRONG - AssetClassService creating nodes
assetClassService.createNodeFromClass() // NO! Use NodeService
```

### Correct Approach
```javascript
// ✅ CORRECT - Each module handles its domain
relationshipService.createRelationship({...}) // Asset-to-Asset only
groupService.addMemberToGroup({...})           // Group membership
nodeService.createNode({...})                  // Node creation
assetClassService.createAssetClass({...})      // Template management
```

### Benefits of Module Independence
- **Maintainability**: Changes isolated to single modules
- **Testability**: Each module tested independently  
- **Clarity**: Clear responsibility boundaries
- **Scalability**: Modules can evolve independently
- **Debugging**: Issues contained to specific domains

**REMEMBER: When tempted to add cross-module functionality, create a higher-level orchestrator service instead of breaking module boundaries.**

## Cross-Platform Path Handling

### Issue
Demo files use `import.meta.url` comparison to detect if they're run directly, but path handling differs between platforms:
- **macOS/Linux**: `process.argv[1]` already uses forward slashes
- **Windows**: `process.argv[1]` uses backslashes, needs conversion

### Current Problem
```javascript
// This fails on macOS - creates extra slash
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
```

### Solutions
1. **Simple fix**: Remove extra slash and backslash replacement
   ```javascript
   if (import.meta.url === `file://${process.argv[1]}`) {
   ```

2. **Cross-platform helper function**: Create utility for reliable path comparison
   ```javascript
   function isMainModule(importMetaUrl) {
     const currentPath = process.argv[1]
     const normalizedPath = process.platform === 'win32' 
       ? currentPath.replace(/\\/g, '/') 
       : currentPath
     return importMetaUrl === `file://${normalizedPath}`
   }
   ```

3. **Use Node.js built-ins**: 
   ```javascript
   import { fileURLToPath } from 'url'
   import { resolve } from 'path'
   
   const __filename = fileURLToPath(import.meta.url)
   if (__filename === resolve(process.argv[1])) {
   ```

### Recommendation
**For all demo files**: Use simple fix (option 1) since it works on both platforms, or implement the cross-platform helper function for more robust detection.

## ITM App vs User Data - Label-Based Separation

### Concept
Use different Neo4j labels to distinguish between ITM application internals and user business data:

- **User/Business Items**: `:Group`, `:LOCATED_IN`, `:ASSIGNED_TO`, `:OWNS`, `:REPORTS_TO`
- **ITM App System Items**: `:_AssetClass`, `:_Group`, `:_MEMBER_OF`, `:_DEPENDS_ON`, `:_CONFIG_REF`, `:_TEMPLATE_LINK`

### Implementation Principle
**Module retrieval functions should only know about their specific labels** and return items that belong to their domain:

- **GroupService**: Only returns `:Group` nodes (user-created groups, not `:_Group` ITM app internal groups)
- **RelationshipService**: Only returns user relationship types (`:LOCATED_IN`, `:ASSIGNED_TO`, etc. - not `:_MEMBER_OF`, `:_DEPENDS_ON` ITM app internals)
- **NodeService**: Returns `:Asset` nodes (user IT assets, not ITM app internal nodes)

### Module Responsibility
```javascript
// GroupService - only knows about :Group
async getAllGroups() {
  return session.run('MATCH (g:Group) WHERE g.isActive = true RETURN g')
}

// RelationshipService - only knows about user relationship types
async getAllRelationshipTypes() {
  return session.run('MATCH ()-[r]-() RETURN DISTINCT type(r) WHERE NOT type(r) STARTS WITH "_"')
}

// ITM App internal services would handle :_Group, :_DEPENDS_ON separately
async getAppInternalGroups() {
  return session.run('MATCH (sg:_Group) WHERE sg.isActive = true RETURN sg')
}

async getAppInternalRelationships() {
  return session.run('MATCH ()-[r]-() WHERE type(r) STARTS WITH "_" RETURN DISTINCT type(r)')
}
```

### Benefits
- **Clean separation**: Modules naturally only see their domain
- **No filtering needed**: Neo4j label matching handles visibility automatically
- **Better performance**: Label indexes instead of property filtering
- **Self-documenting**: Labels clearly show system vs user items in Neo4j Browser
- **Native Neo4j**: Leverages built-in label functionality
- **Module isolation**: Each service only knows about its own label space

### Cross-Module Access
When ITM app internal operations need to access both user data and app internals, use higher-level services or explicit multi-label queries:

```javascript
// ITM App internal service combining both domains
async getAllGroupsIncludingAppInternals() {
  return session.run('MATCH (g) WHERE g:Group OR g:_Group RETURN g')
}
```

### ITM App Internal Node Example
```cypher
// Example: ITM app creates internal template nodes for system functionality
CREATE (template:_NodeTemplate {
  templateName: "ServerTemplate",
  defaultProperties: "{'cpu_cores': 4, 'memory_gb': 16}",
  requiredFields: "['hostname', 'ip_address']",
  createdBy: "ITM_APP",
  version: "1.0"
})

// ITM app internal relationship tracking dependencies between user nodes
CREATE (server1:Asset)-[:_DEPENDS_ON {dependency_type: "network", strength: "critical"}]->(router:Asset)
```

**These ITM app internal items should never appear in user-facing lists or relationship dropdowns.**

## Code Changes Required

### 1. RelationshipService.js
**File:** `src/relationship/RelationshipService.js`
**Method:** `getAllRelationshipTypes()`
**Change:** Add filter to exclude relationships starting with `_`
```javascript
// Add WHERE clause to filter ITM app internals
WHERE NOT type(r) STARTS WITH "_"
```

### 2. RelationshipInterface.js  
**File:** `src/relationship/RelationshipInterface.js`
**Method:** `getAllRelationshipTypes()`
**Change:** Update method signature and documentation to clarify it returns only user relationships

### 3. Demo Files - Relationship Examples
**Files to update:**
- `src/relationship/demo.js`
- `src/assetclass/demo.js` (if it shows relationships)
- `src/node/demo.js` (if it shows relationships)

**Change:** Replace `DEPENDS_ON`, `CONNECTS_TO`, `HOSTS` with user relationships like `MEMBER_OF`, `LOCATED_IN`, `ASSIGNED_TO`

### 4. Documentation Updates
**Files to update:**
- `src/relationship/README.md`
- Any relationship examples in module READMEs

**Change:** Update relationship examples to show user relationships, not ITM app internals

### 5. Verify NodeService Filtering
**File:** `src/node/NodeService.js`
**Check:** Ensure `getAllNodes()` only returns `:Asset` nodes, not ITM app internal node types
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
- **Available plugins**: edgehandles, compound-drag-and-drop, popper, autopan-on-drag, etc.
- **Principle**: Use official plugins instead of custom implementations whenever possible
- **Benefits**: Better performance, maintenance, testing, and community support

**Current plugins in use:**
- `cytoscape-dagre`: Hierarchical layout algorithm
- `cytoscape-edgehandles`: Professional drag-to-connect edge creation
- `cytoscape-compound-drag-and-drop`: Interactive node grouping and hierarchy management  
- `cytoscape-popper`: Tooltip and popup positioning

## ITM Context
**IT Asset Management** - Graph nodes represent servers, applications, databases, network devices, users, locations with typed relationships carrying properties.

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Organizational Rules

### Permission Management
- **Permission matrices and access control logic must be kept in `/src/ui/permissions/`**
- Use `PermissionService` for centralized permission management
- Never embed permission logic directly in components or services

### Styling and Theming  
- **All styles must be kept in separate files in `/src/ui/styles/`**
- Support Material UI theming with `createGraphViewerStyles(theme)` pattern
- Extract Cytoscape styles to modular functions like `buildCytoscapeStyle(customStyles, theme)`
- Never embed styling constants directly in components or services

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
# Graph2 - Neo4j Compatible Graph Data Structure

## Project Overview
Goal: Develop a reliable graph data structure that works with Neo4j

## Project Requirements

### Core Architecture
- [x] Use Neo4j database driver for database connectivity
- [x] Environment-based configuration (.env support)
- [x] Module pattern with well-defined component interfaces
- [x] Immutable function components - once marked as "correct", they cannot be overridden
- [x] Interface-driven development to ensure component isolation

### Neo4j Integration
- [x] Use official Neo4j driver
- [x] Environment-based connection configuration
- [ ] Connection method: Bolt protocol (default for Neo4j driver)

### Module Design Pattern
- [x] NodeInterface - for creating nodes with attribute sets and getting nodes
- [x] RelationshipInterface - for creating relationships with attribute sets and getting relationships
- [x] Node Model - representation of a single node
- [x] Relationship Model - representation of a single relationship
- [x] Graph Model - representation of the node system/graph
- [x] Each completed component/module requires a README.md documenting current state
- [x] Interface changes require explicit permission/confirmation
- [x] Components marked as "finished" are immutable

### Node Implementation Details
- [x] Node identification: Neo4j ID system (permanent) + temporary UID (before persistence)
- [x] Node labels: Neo4j labels for grouping nodes
- [x] Node title: User-facing title for searching/display
- [x] AssetClass system: User-defined asset types with required base attributes
- [x] AssetClass storage: Same Neo4j database (users select from available classes)
- [x] Custom properties: Asset nodes can have additional properties beyond AssetClass definition
- [x] User-defined classes: Users create AssetClass definitions (except core required attributes)
- [x] No inheritance: Flat class structure
- [x] Relationship classes: Different relationship types that carry data/properties

### IT Asset Management Context
**Purpose:** Graph system for managing IT infrastructure assets and their relationships

**Node Classes/Types Examples:**
- Server (properties: hostname, IP, OS, CPU, RAM, storage)
- Application (properties: name, version, port, dependencies)
- Database (properties: name, type, version, size, backup_schedule)
- Network Device (properties: hostname, IP, device_type, VLAN)
- User (properties: username, department, role, permissions)
- Location (properties: datacenter, rack, floor, building)

**Relationship Examples:**
- Server --[HOSTS {port: 8080, protocol: "HTTP"}]--> Application
- Application --[CONNECTS_TO {connection_string: "...", timeout: 30}]--> Database
- Server --[LOCATED_IN {rack_position: "U42", power_outlet: "A1"}]--> Location
- User --[HAS_ACCESS_TO {permission_level: "admin", last_login: "2024-01-15"}]--> Server
- Application --[DEPENDS_ON {dependency_type: "critical", version_requirement: ">=2.0"}]--> Application
- Server --[CONNECTED_TO {interface: "eth0", bandwidth: "1Gbps", VLAN: 100}]--> Network Device

### Neo4j Relationship Properties
**Yes, Neo4j natively supports relationship properties!** Relationships in Neo4j can carry data just like nodes:
```cypher
CREATE (a:Server)-[:HOSTS {port: 8080, protocol: "HTTP", status: "active"}]->(b:Application)
```

### Asset Auto-Discovery Concept
**Auto-discovery** would automatically detect IT assets in your infrastructure and create corresponding nodes:

**Methods:**
- **Network scanning**: Ping sweeps, port scans to find devices
- **SNMP polling**: Query network devices for inventory data
- **Agent-based**: Software agents report system information
- **API integration**: Pull data from cloud providers (AWS, Azure), virtualization platforms (VMware), monitoring tools
- **Configuration management**: Import from Ansible, Puppet, Chef inventories
- **Log parsing**: Extract asset information from system logs

**Process:**
1. Scan/query infrastructure
2. Detect assets and their properties
3. Match to existing AssetClass or suggest new class
4. Create asset nodes with discovered properties
5. Detect relationships (network connections, dependencies)
6. Update existing assets with new information

**Questions:**
1. Which discovery methods interest you most?
2. Should auto-discovery create new AssetClasses automatically or require user approval?
3. How should conflicts be handled (discovered asset vs. existing manual entry)?

### Demo & Validation Strategy
**Instead of automated tests: Maintainable demo suite using the same interfaces**

**Demo Scenarios:**
- **ID Management Demo**: Create nodes with tempUID → persist → verify Neo4j ID assignment
- **AssetClass Demo**: Create Server class → create actual server nodes → validate properties
- **Relationship Demo**: Connect assets with typed relationships carrying data
- **Data Integrity Demo**: Show validation of AssetClass schemas and custom properties
- **Interface Demo**: Demonstrate all interface methods work correctly

**Demo Structure:**
- Each module gets a demo file alongside its README.md
- Demos can be run manually to verify functionality
- Demos serve as living documentation and usage examples
- Common demo data fixtures for consistent testing

**Demo Infrastructure:**
- Simple demo runner scripts
- Shared demo database setup/cleanup utilities
- Demo data fixtures (sample AssetClasses, nodes, relationships)

### Performance Requirements
- [ ] Expected graph size? (nodes/edges count)
- [ ] Performance priorities? (memory usage, query speed, sync speed)
- [ ] Concurrent access requirements?

### API Design
- [ ] Preferred API style? (functional, OOP, fluent interface)
- [ ] Browser and/or Node.js support needed?
- [ ] TypeScript support required?

### Build & Development
- Commands to run:
  - Build: `npm run build`
  - Dev: `npm run dev`
  - Test: `npm test` (to be implemented)

## Architecture Notes
(To be filled as design decisions are made)

## Neo4j Schema
(To be defined based on requirements)

## Implementation Progress
- [x] Basic Vite module setup
- [x] Initial graph structure skeleton
- [ ] Neo4j integration
- [ ] Core graph operations
- [ ] Testing framework
- [ ] Documentation
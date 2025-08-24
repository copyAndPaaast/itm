🎯 Expand-collapse setup complete for system compounds
MainLayout.jsx:222 📡 GraphViewer event: node_hover {nodeId: 'system_1_1756040072396', nodeData: {…}, position: {…}}
MainLayout.jsx:333 📡 Unhandled GraphViewer event: node_hover
MainLayout.jsx:222 📡 GraphViewer event: node_hover {nodeId: 'node_2_1756040072396', nodeData: {…}, position: {…}}
MainLayout.jsx:333 📡 Unhandled GraphViewer event: node_hover
GraphViewer.jsx:268 🎯 Border click detected - starting edge creation
MainLayout.jsx:222 📡 GraphViewer event: edge_creation_start {sourceId: 'node_2_1756040072396', sourceData: {…}}
MainLayout.jsx:333 📡 Unhandled GraphViewer event: edge_creation_start
GraphViewer.jsx:453 🆕 Creating new node at empty space via drag-and-drop
MainLayout.jsx:222 📡 GraphViewer event: create_node {nodeId: 'node_1756040074053', position: {…}, systemId: '4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64', systemName: 'IPOS', isEditingSystem: true, …}
MainLayout.jsx:244 🎯 Node created in system: IPOS Context: editing
MainLayout.jsx:245 📝 Node data: {id: 'node_1756040074053', label: 'New Node', type: 'application', assetClass: 'Default', systemId: '4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64', …}
MainLayout.jsx:263 💾 Adding node to Redux state: {nodeId: 'node_1756040074053', id: 'node_1756040074053', label: 'New Node', type: 'application', assetClass: 'Default', …}
MainLayout.jsx:222 📡 GraphViewer event: create_edge {sourceId: 'node_2_1756040072396', targetId: 'node_1756040074053', edgeId: 'edge_node_2_1756040072396_node_1756040074053_1756040074054'}
MainLayout.jsx:283 🔗 Edge created between: node_2_1756040072396 -> node_1756040074053
MainLayout.jsx:284 📝 Edge data: {sourceId: 'node_2_1756040072396', targetId: 'node_1756040074053', edgeId: 'edge_node_2_1756040072396_node_1756040074053_1756040074054'}
MainLayout.jsx:289 🔍 DEBUG eventData.sourceData: undefined
MainLayout.jsx:290 🔍 DEBUG eventData.targetData: undefined
MainLayout.jsx:291 🔍 DEBUG sourceId fallback: node_2_1756040072396
MainLayout.jsx:292 🔍 DEBUG targetId fallback: node_1756040074053
MainLayout.jsx:297 🔍 DEBUG final business IDs: {sourceBusinessId: 'node_2_1756040072396', targetBusinessId: 'node_1756040074053'}
MainLayout.jsx:308 💾 Adding edge to Redux state: {id: 'edge_node_2_1756040072396_node_1756040074053_1756040074054', source: 'node_2_1756040072396', target: 'node_1756040074053', relationshipType: 'connects_to', systemId: '4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64', …}
MainLayout.jsx:309 💾 Dispatching addEdge with graphId: 4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64
GraphViewerMapper.js:101 🔍 MAPPER DEBUG - creating single node: {nodeId: 'node_1756040072387', id: 'node_1756040072387', businessId: 'node_1756040072387', label: 'New Node'}
GraphViewerMapper.js:152 🔍 MAPPER DEBUG - added to nodeMapping: node_1756040072387 -> node_2_1756040074060
GraphViewerMapper.js:101 🔍 MAPPER DEBUG - creating single node: {nodeId: 'node_1756040074053', id: 'node_1756040074053', businessId: 'node_1756040074053', label: 'New Node'}
GraphViewerMapper.js:152 🔍 MAPPER DEBUG - added to nodeMapping: node_1756040074053 -> node_3_1756040074060
GraphViewerMapper.js:334 🔍 MAPPER DEBUG - getDisplayInstances for: node_2_1756040072396
GraphViewerMapper.js:335 🔍 MAPPER DEBUG - nodeMapping contents: (2) [Array(2), Array(2)]
GraphViewerMapper.js:334 🔍 MAPPER DEBUG - getDisplayInstances for: node_1756040074053
GraphViewerMapper.js:335 🔍 MAPPER DEBUG - nodeMapping contents: (2) [Array(2), Array(2)]
GraphViewerMapper.js:283 Cannot create edge edge_node_2_1756040072396_node_1756040074053_1756040074054: missing display instances
createEdgeWithSystemContext @ GraphViewerMapper.js:283
(anonymous) @ GraphViewerMapper.js:267
createEdges @ GraphViewerMapper.js:265
mapToElements @ GraphViewerMapper.js:39
(anonymous) @ MainLayout.jsx:77
updateMemo @ chunk-FD5SMSK5.js?v=049003aa:12258
useMemo @ chunk-FD5SMSK5.js?v=049003aa:12774
useMemo @ chunk-YHPANKLD.js?v=049003aa:1094
MainLayout @ MainLayout.jsx:70
renderWithHooks @ chunk-FD5SMSK5.js?v=049003aa:11596
updateFunctionComponent @ chunk-FD5SMSK5.js?v=049003aa:14630
beginWork @ chunk-FD5SMSK5.js?v=049003aa:15972
beginWork$1 @ chunk-FD5SMSK5.js?v=049003aa:19806
performUnitOfWork @ chunk-FD5SMSK5.js?v=049003aa:19251
workLoopSync @ chunk-FD5SMSK5.js?v=049003aa:19190
renderRootSync @ chunk-FD5SMSK5.js?v=049003aa:19169
performSyncWorkOnRoot @ chunk-FD5SMSK5.js?v=049003aa:18927
flushSyncCallbacks @ chunk-FD5SMSK5.js?v=049003aa:9166
(anonymous) @ chunk-FD5SMSK5.js?v=049003aa:18677
GraphViewerMapper.js:41 Mapped 2 nodes, 1 edges to 3 elements
MainLayout.jsx:78 🔍 GraphViewerMapper: Mapped 2 nodes and 1 edges to 3 elements
MainLayout.jsx:79 🔍 Redux nodes: (2) [{…}, {…}]
MainLayout.jsx:80 🔍 Redux edges: [{…}]
MainLayout.jsx:81 🔍 Mapped elements: []
GraphViewerMapper.js:101 🔍 MAPPER DEBUG - creating single node: {nodeId: 'node_1756040072387', id: 'node_1756040072387', businessId: 'node_1756040072387', label: 'New Node'}
GraphViewerMapper.js:152 🔍 MAPPER DEBUG - added to nodeMapping: node_1756040072387 -> node_2_1756040074062
GraphViewerMapper.js:101 🔍 MAPPER DEBUG - creating single node: {nodeId: 'node_1756040074053', id: 'node_1756040074053', businessId: 'node_1756040074053', label: 'New Node'}
GraphViewerMapper.js:152 🔍 MAPPER DEBUG - added to nodeMapping: node_1756040074053 -> node_3_1756040074062
GraphViewerMapper.js:334 🔍 MAPPER DEBUG - getDisplayInstances for: node_2_1756040072396
GraphViewerMapper.js:335 🔍 MAPPER DEBUG - nodeMapping contents: (2) [Array(2), Array(2)]
GraphViewerMapper.js:334 🔍 MAPPER DEBUG - getDisplayInstances for: node_1756040074053
GraphViewerMapper.js:335 🔍 MAPPER DEBUG - nodeMapping contents: (2) [Array(2), Array(2)]
GraphViewerMapper.js:283 Cannot create edge edge_node_2_1756040072396_node_1756040074053_1756040074054: missing display instances
createEdgeWithSystemContext @ GraphViewerMapper.js:283
(anonymous) @ GraphViewerMapper.js:267
createEdges @ GraphViewerMapper.js:265
mapToElements @ GraphViewerMapper.js:39
(anonymous) @ MainLayout.jsx:77
updateMemo @ chunk-FD5SMSK5.js?v=049003aa:12258
useMemo @ chunk-FD5SMSK5.js?v=049003aa:12774
useMemo @ chunk-YHPANKLD.js?v=049003aa:1094
MainLayout @ MainLayout.jsx:70
renderWithHooks @ chunk-FD5SMSK5.js?v=049003aa:11596
updateFunctionComponent @ chunk-FD5SMSK5.js?v=049003aa:14635
beginWork @ chunk-FD5SMSK5.js?v=049003aa:15972
beginWork$1 @ chunk-FD5SMSK5.js?v=049003aa:19806
performUnitOfWork @ chunk-FD5SMSK5.js?v=049003aa:19251
workLoopSync @ chunk-FD5SMSK5.js?v=049003aa:19190
renderRootSync @ chunk-FD5SMSK5.js?v=049003aa:19169
performSyncWorkOnRoot @ chunk-FD5SMSK5.js?v=049003aa:18927
flushSyncCallbacks @ chunk-FD5SMSK5.js?v=049003aa:9166
(anonymous) @ chunk-FD5SMSK5.js?v=049003aa:18677
GraphViewerMapper.js:41 Mapped 2 nodes, 1 edges to 3 elements
MainLayout.jsx:78 🔍 GraphViewerMapper: Mapped 2 nodes and 1 edges to 3 elements
MainLayout.jsx:79 🔍 Redux nodes: (2) [{…}, {…}]
MainLayout.jsx:80 🔍 Redux edges: [{…}]
MainLayout.jsx:81 🔍 Mapped elements: []
GraphViewer.jsx:773 GraphViewer: Updating 3 elements
MainLayout.jsx:63 🔄 Graph already exists for system: 4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64 - skipping initialization
MainLayout.jsx:64   Existing nodes: 2 edges: 1
MainLayout.jsx:87 🔍 MainLayout System State Debug:
MainLayout.jsx:88   currentSystemId: 4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64
MainLayout.jsx:89   currentSystem: {systemId: '4:ec64f237-8ce7-454d-a18a-b9d8efe32416:64', systemName: 'IPOS', systemLabel: 'IPOS', description: '', nodeCount: 0, …}
MainLayout.jsx:90   systemViewMode: single
MainLayout.jsx:91   isCreatingSystem: false
MainLayout.jsx:92   nodeCount: 2 edgeCount: 1
MainLayout.jsx:93   elements: 3 Redux nodes: 2 Redux edges: 1
MainLayout.jsx:94   EDGE COUNT MISMATCH CHECK: Redux edges array: 1 vs selector edgeCount: 1
MainLayout.jsx:317 🔍 Redux state after edge creation - edges: 0 nodes: 1
MainLayout.jsx:318 🔍 All Redux edges: []
GraphViewer.jsx:811 🔧 Expand-collapse extension ready with 1 system compounds
GraphViewer.jsx:815 System compound: {id: 'system_1_1756040074062', compoundType: 'system', systemName: 'IPOS', isCompound: true, children: 2}
GraphViewer.jsx:825 🎯 Checking expand-collapse state...
GraphViewer.jsx:827 API available: true
GraphViewer.jsx:862 🎯 Expand-collapse setup complete for system compounds
MainLayout.jsx:222 📡 GraphViewer event: node_hover {nodeId: 'system_1_1756040074062', nodeData: {…}, position: {…}}
MainLayout.jsx:333 📡 Unhandled GraphViewer event: node_hover
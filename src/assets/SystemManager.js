/**
 * System Manager Module
 * Handles system switching, multi-system loading, and graph merging
 */

/**
 * Creates system management functionality
 * @param {React.RefObject} cyInstanceRef - Reference to Cytoscape instance
 * @param {React.RefObject} currentSystemRef - Reference to current system
 * @param {Function} setIsMultiSystemView - Setter for multi-system view state
 * @param {Function} onSystemChange - System change callback
 * @param {Function} onGraphElementsUpdate - Graph elements update callback
 * @param {Object} compoundNodeManager - Compound node management functions
 * @returns {Object} Object containing system management functions
 */
export const createSystemManager = (
    cyInstanceRef,
    currentSystemRef,
    setIsMultiSystemView,
    onSystemChange,
    onGraphElementsUpdate,
    compoundNodeManager
) => {
    const {
        createOrGetCompoundNode,
        organizeExistingNodesIntoCompounds,
        applyCompoundLayout
    } = compoundNodeManager;

    /**
     * Handles system change and graph merging for multi-system view
     * @param {string} systemName - Name of the system to load
     */
    const handleSystemChange = async (systemName) => {
        try {
            console.log(`\\n=== LOADING SYSTEM: ${systemName} ===`);
            
            // Import Neo4j connection
            const { default: neo4jConnection } = await import('../../connection/Neo4jConnection');
            
            // Load the selected system's graph
            const newGraphData = await neo4jConnection.loadGraph(systemName);
            
            if (newGraphData && cyInstanceRef.current) {
                const cy = cyInstanceRef.current;
                
                console.log(`Loaded ${newGraphData.nodes.length} nodes and ${newGraphData.edges.length} edges for system "${systemName}"`);
                console.log('Sample node data:', newGraphData.nodes[0]?.data);
                
                // Switch to mixed system mode - prevents saving and indicates multi-system view
                setIsMultiSystemView(true);
                
                // Change current system to mixed mode
                if (onSystemChange) {
                    onSystemChange('MIXED_SYSTEMS_VIEW');
                }
                
                // Handle first system loading
                await handleFirstSystemLoad(cy, systemName);
                
                // Create compound node for the new system
                const compoundNode = createOrGetCompoundNode(cy, systemName);
                
                // Merge new system data with existing graph
                const { newNodes, newEdges } = await mergeSystemData(cy, newGraphData, systemName, compoundNode);
                
                // Apply layout and update parent state
                await finalizeSystemLoad(cy, systemName, newNodes, newEdges);
                
                // Create shared node indicators after loading system
                setTimeout(() => {
                    createSharedNodeIndicators(cy);
                }, 100);
            }
        } catch (error) {
            console.error('Error switching system:', error);
        }
    };

    /**
     * Handles the first system being loaded into multi-system view
     * @param {Object} cy - Cytoscape instance
     * @param {string} systemName - Name of the system being loaded
     */
    const handleFirstSystemLoad = async (cy, systemName) => {
        // If this is the first system being loaded, organize existing nodes into compounds
        const hasCompounds = cy.nodes().some(n => n.data('isCompound'));
        console.log(`Has compounds already: ${hasCompounds}`);
        
        if (!hasCompounds) {
            console.log('First compound load - organizing existing nodes');
            // Use the original system name for the first compound, not MIXED_SYSTEMS_VIEW
            const firstSystemName = currentSystemRef.current !== 'MIXED_SYSTEMS_VIEW' ? 
                currentSystemRef.current : systemName;
            organizeExistingNodesIntoCompounds(cy, firstSystemName);
        }
    };

    /**
     * Merges new system data with existing graph
     * @param {Object} cy - Cytoscape instance
     * @param {Object} newGraphData - New graph data to merge
     * @param {string} systemName - Name of the system
     * @param {Object} compoundNode - Compound node for the system
     * @returns {Object} Object containing newNodes and newEdges arrays
     */
    const mergeSystemData = async (cy, newGraphData, systemName, compoundNode) => {
        // Get existing IDs to prevent duplicates (use system-specific IDs for display)
        const existingNodeIds = new Set(cy.nodes().map(n => n.id()));
        const existingEdgeIds = new Set(cy.edges().map(e => e.id()));
        
        // Create system-specific node IDs for display while preserving original IDs for detection
        const idMapping = {};
        const systemPrefix = systemName.replace(/[^a-zA-Z0-9]/g, '_');
        
        // Process nodes
        const newNodes = processNewNodes(newGraphData.nodes, existingNodeIds, systemPrefix, idMapping, compoundNode);
        
        // Process edges
        const newEdges = processNewEdges(newGraphData.edges, existingEdgeIds, systemPrefix, idMapping);
        
        console.log(`Adding ${newNodes.length} new nodes and ${newEdges.length} new edges to system ${systemName}`);
        
        return { newNodes, newEdges };
    };

    /**
     * Processes new nodes for system merging
     * @param {Array} nodes - Array of node data
     * @param {Set} existingNodeIds - Set of existing node IDs
     * @param {string} systemPrefix - System prefix for IDs
     * @param {Object} idMapping - ID mapping object
     * @param {Object} compoundNode - Compound node for the system
     * @returns {Array} Processed nodes array
     */
    const processNewNodes = (nodes, existingNodeIds, systemPrefix, idMapping, compoundNode) => {
        return nodes.filter(nodeData => {
            const originalId = nodeData.data.id;
            const systemSpecificId = `${systemPrefix}-${originalId}`;
            
            // Check if this system-specific ID already exists
            if (existingNodeIds.has(systemSpecificId)) {
                console.log(`Node ${systemSpecificId} already exists in mixed view`);
                return false; // Skip this node
            }
            
            // Map old ID to new system-specific ID
            idMapping[originalId] = systemSpecificId;
            return true;
        }).map(nodeData => {
            const originalId = nodeData.data.id;
            const systemSpecificId = idMapping[originalId];
            
            return {
                ...nodeData,
                data: {
                    ...nodeData.data,
                    id: systemSpecificId,
                    originalId: originalId, // Keep reference to original Neo4j ID for shared detection
                    parent: compoundNode.id() // Assign to compound node
                }
            };
        });
    };

    /**
     * Processes new edges for system merging
     * @param {Array} edges - Array of edge data
     * @param {Set} existingEdgeIds - Set of existing edge IDs
     * @param {string} systemPrefix - System prefix for IDs
     * @param {Object} idMapping - ID mapping object
     * @returns {Array} Processed edges array
     */
    const processNewEdges = (edges, existingEdgeIds, systemPrefix, idMapping) => {
        return edges.filter(edgeData => {
            const systemSpecificEdgeId = `${systemPrefix}-${edgeData.data.id}`;
            return !existingEdgeIds.has(systemSpecificEdgeId);
        }).map(edgeData => {
            const originalSourceId = edgeData.data.source;
            const originalTargetId = edgeData.data.target;
            const originalEdgeId = edgeData.data.id;
            
            // Map to system-specific IDs
            const newSourceId = idMapping[originalSourceId] || originalSourceId;
            const newTargetId = idMapping[originalTargetId] || originalTargetId;
            const newEdgeId = `${systemPrefix}-${originalEdgeId}`;
            
            console.log(`Mapping edge: ${originalEdgeId} (${originalSourceId} → ${originalTargetId}) to ${newEdgeId} (${newSourceId} → ${newTargetId})`);
            
            return {
                ...edgeData,
                data: {
                    ...edgeData.data,
                    id: newEdgeId,
                    source: newSourceId,
                    target: newTargetId,
                    originalId: originalEdgeId,
                    originalSource: originalSourceId,
                    originalTarget: originalTargetId
                }
            };
        });
    };

    /**
     * Finalizes system loading with layout and state updates
     * @param {Object} cy - Cytoscape instance
     * @param {string} systemName - Name of the system
     * @param {Array} newNodes - New nodes to add
     * @param {Array} newEdges - New edges to add
     */
    const finalizeSystemLoad = async (cy, systemName, newNodes, newEdges) => {
        // Add the new elements to the graph
        if (newNodes.length > 0 || newEdges.length > 0) {
            cy.add([...newNodes, ...newEdges]);
            
            // Apply compound-aware layout to arrange the merged graph
            applyCompoundLayout(cy);
            
            console.log(`Merged system "${systemName}": added ${newNodes.length} nodes and ${newEdges.length} edges to compound`);
        } else {
            console.log(`System "${systemName}" already fully merged`);
        }
        
        // Update the graph elements in parent
        if (onGraphElementsUpdate) {
            const elements = cy.elements().jsons();
            onGraphElementsUpdate(elements);
        }
    };

    /**
     * Detects and creates visual indicators for shared nodes across systems
     * @param {Object} cy - Cytoscape instance
     */
    const createSharedNodeIndicators = (cy) => {
        console.log('=== CREATING SHARED NODE INDICATORS ===');
        
        // Remove existing shared node indicators
        cy.edges('.shared-node-indicator').remove();
        
        // Get all non-compound nodes with originalId data
        const nodes = cy.nodes().filter(node => 
            !node.data('isCompound') && 
            node.data('originalId')
        );
        
        // Group nodes by their originalId AND label (both must match for true sharing)
        const nodeGroups = {};
        nodes.forEach(node => {
            const originalId = node.data('originalId');
            const nodeLabel = node.data('label') || originalId;
            
            // Create a composite key: originalId + label to ensure both match
            const sharedNodeKey = `${originalId}|${nodeLabel}`;
            
            if (!nodeGroups[sharedNodeKey]) {
                nodeGroups[sharedNodeKey] = [];
            }
            nodeGroups[sharedNodeKey].push(node);
        });
        
        // Create indicators for nodes that appear in multiple systems (shared nodes)
        let indicatorCount = 0;
        Object.entries(nodeGroups).forEach(([sharedNodeKey, nodeList]) => {
            if (nodeList.length > 1) {
                const sampleNode = nodeList[0];
                const originalId = sampleNode.data('originalId');
                const nodeLabel = sampleNode.data('label') || originalId;
                console.log(`Found shared node "${nodeLabel}" (original ID: ${originalId}) in ${nodeList.length} systems`);
                
                // Create indicators between all pairs of shared nodes
                for (let i = 0; i < nodeList.length; i++) {
                    for (let j = i + 1; j < nodeList.length; j++) {
                        const node1 = nodeList[i];
                        const node2 = nodeList[j];
                        const indicatorId = `shared-indicator-${originalId.replace(/[^a-zA-Z0-9]/g, '_')}-${indicatorCount++}`;
                        
                        cy.add({
                            group: 'edges',
                            data: {
                                id: indicatorId,
                                source: node1.id(),
                                target: node2.id(),
                                isSharedIndicator: true,
                                sharedNodeLabel: nodeLabel,
                                originalNodeId: originalId
                            },
                            classes: 'shared-node-indicator'
                        });
                        
                        console.log(`Created shared node indicator for "${nodeLabel}" between ${node1.id()} and ${node2.id()}`);
                    }
                }
            }
        });
        
        console.log(`Created ${indicatorCount} shared node indicators`);
    };

    /**
     * Loads multiple systems for a multi-system node
     * @param {Array} systemNames - Array of system names to load
     */
    const loadMultipleSystems = async (systemNames) => {
        try {
            console.log(`\\n=== LOADING MULTIPLE SYSTEMS: ${systemNames.join(', ')} ===`);
            
            if (!systemNames || systemNames.length === 0) {
                console.warn('No systems provided to load');
                return;
            }
            
            const cy = cyInstanceRef.current;
            if (!cy) {
                console.error('Cytoscape instance not available');
                return;
            }
            
            // Clear the existing graph
            cy.elements().remove();
            
            // Set multi-system view mode
            setIsMultiSystemView(true);
            if (onSystemChange) {
                onSystemChange('MIXED_SYSTEMS_VIEW');
            }
            
            // Load each system sequentially
            for (const systemName of systemNames) {
                await handleSystemChange(systemName);
            }
            
            // After loading all systems, create shared node indicators
            setTimeout(() => {
                createSharedNodeIndicators(cy);
            }, 500); // Small delay to ensure layout is complete
            
            console.log(`Successfully loaded ${systemNames.length} systems into multi-system view`);
        } catch (error) {
            console.error('Error loading multiple systems:', error);
        }
    };

    return {
        handleSystemChange,
        loadMultipleSystems,
        createSharedNodeIndicators
    };
};
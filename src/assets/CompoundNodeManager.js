/**
 * Compound Node Manager Module
 * Handles compound node creation, organization, and cleanup for multi-system views
 */

/**
 * Creates compound node management utilities
 * @returns {Object} Object containing compound node management functions
 */
export const createCompoundNodeManager = () => {
    /**
     * Helper function to create or get compound node for a system
     * @param {Object} cy - Cytoscape instance
     * @param {string} systemName - System name
     * @returns {Object} Cytoscape compound node element
     */
    const createOrGetCompoundNode = (cy, systemName) => {
        const compoundId = `compound-${systemName.replace(/[^a-zA-Z0-9]/g, '_')}`;
        let compoundNode = cy.getElementById(compoundId);
        
        if (compoundNode.length === 0) {
            // Create compound node if it doesn't exist
            compoundNode = cy.add({
                group: 'nodes',
                data: {
                    id: compoundId,
                    label: systemName,
                    isCompound: true
                },
                classes: 'compound-node',
                grabbable: true  // Explicitly ensure compound nodes are draggable
            });
            
            // Ensure the compound node is grabbable after creation
            compoundNode.grabify();
            
            console.log(`Created compound node for system: ${systemName}`);
        }
        
        return compoundNode;
    };

    /**
     * Helper function to cleanup empty compound nodes
     * @param {Object} cy - Cytoscape instance
     */
    const cleanupEmptyCompoundNodes = (cy) => {
        console.log('=== CLEANING UP EMPTY COMPOUND NODES ===');
        const compoundNodes = cy.nodes().filter(node => node.data('isCompound'));
        
        compoundNodes.forEach(node => {
            const children = node.children();
            const label = node.data('label');
            console.log(`Compound "${label}": ${children.length} children`);
            
            if (children.length === 0) {
                console.log(`🗑️ Removing empty compound node: ${label}`);
                cy.remove(node);
            } else {
                console.log(`✅ Keeping compound "${label}" with ${children.length} children`);
            }
        });
    };

    /**
     * Simple function to put all existing nodes into one compound (for first system)
     * @param {Object} cy - Cytoscape instance
     * @param {string} firstSystemName - Name of the first system
     */
    const organizeExistingNodesIntoCompounds = (cy, firstSystemName) => {
        console.log(`=== ORGANIZING ALL EXISTING NODES INTO COMPOUND: ${firstSystemName} ===`);
        
        // Get all non-compound nodes
        const existingNodes = cy.nodes().filter(node => !node.data('isCompound'));
        
        if (existingNodes.length > 0) {
            // Create compound for the first system
            const compoundNode = createOrGetCompoundNode(cy, firstSystemName);
            
            // Update existing nodes to have system-specific IDs for mixed view
            const systemPrefix = firstSystemName.replace(/[^a-zA-Z0-9]/g, '_');
            const idMapping = {};
            
            existingNodes.forEach(node => {
                const originalId = node.id();
                const systemSpecificId = `${systemPrefix}-${originalId}`;
                
                // Store ID mapping for edges
                idMapping[originalId] = systemSpecificId;
                
                // Update node with system-specific ID
                node.data({
                    ...node.data(),
                    id: systemSpecificId,
                    originalId: originalId, // Keep reference to original ID
                    systemName: firstSystemName
                });
                
                // Move to compound parent
                node.move({ parent: compoundNode.id() });
                console.log(`Organized node ${originalId} → ${systemSpecificId} in compound ${firstSystemName}`);
            });
            
            // Update existing edges to use system-specific node IDs  
            cy.edges().forEach(edge => {
                const originalSourceId = edge.data('source');
                const originalTargetId = edge.data('target');
                const newSourceId = idMapping[originalSourceId] || originalSourceId;
                const newTargetId = idMapping[originalTargetId] || originalTargetId;
                
                if (newSourceId !== originalSourceId || newTargetId !== originalTargetId) {
                    edge.data({
                        ...edge.data(),
                        source: newSourceId,
                        target: newTargetId,
                        originalSource: originalSourceId,
                        originalTarget: originalTargetId
                    });
                    console.log(`Updated edge: ${originalSourceId} → ${originalTargetId} to ${newSourceId} → ${newTargetId}`);
                }
            });
            
            console.log(`✅ Organized ${existingNodes.length} existing nodes into compound: ${firstSystemName}`);
            
            // Apply layout
            applyCompoundLayout(cy);
        }
    };

    /**
     * Applies compound-aware layout
     * @param {Object} cy - Cytoscape instance
     */
    const applyCompoundLayout = (cy) => {
        setTimeout(() => {
            cy.layout({
                name: 'fcose',
                quality: 'default',
                randomize: false,
                animate: true,
                animationDuration: 1500,
                fit: true,
                padding: 60,
                nodeRepulsion: 4500,
                idealEdgeLength: 50,
                edgeElasticity: 0.45,
                nestingFactor: 0.1,
                gravity: 0.25,
                numIter: 2500,
                tile: true,
                samplingType: true,
                sampleSize: 25,
                nodeSeparation: 75
            }).run();
        }, 100);
    };

    return {
        createOrGetCompoundNode,
        cleanupEmptyCompoundNodes,
        organizeExistingNodesIntoCompounds,
        applyCompoundLayout
    };
};
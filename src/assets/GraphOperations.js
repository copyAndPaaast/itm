import Node from '../Node.js';
import Edge from '../Edge.js';
import neo4jConnection from '../../connection/Neo4jConnection.js';

export const createGraphOperations = (
    cyInstanceRef,
    nodeIdCounterRef,
    edgeIdCounterRef,
    selectedNodeTypeRef,
    selectedEdgeTypeRef,
    currentSystemRef,
    onElementSelect,
    updateGraphElements
) => {
    const createNodeAtPosition = (position) => {
        const nodeId = `node-${nodeIdCounterRef.current++}`;
        const currentNodeType = selectedNodeTypeRef.current;
        const currentSystem = currentSystemRef.current;
        const node = new Node(currentNodeType);
        const nodeData = node.getCytoscapeData(nodeId, { x: position.x, y: position.y }, currentSystem);
        const newNode = cyInstanceRef.current.add(nodeData);
        
        // Apply initial style properties - ALWAYS apply styles to ensure visibility
        const styleProps = nodeData.data.styleProperties || {};
        applyStyleProperties(newNode, styleProps);
        
        // Update graph elements after adding node
        if (updateGraphElements) updateGraphElements();
        
        return newNode;
    };

    const createImportedNodeAtPosition = (position, importedNodeData) => {
        const currentSystem = currentSystemRef.current;
        
        // Check if this specific node already exists in the current graph
        // We check by originalId first, then fallback to label+type combination
        const existingNodes = cyInstanceRef.current.nodes();
        const duplicateNode = existingNodes.filter(node => {
            const nodeData = node.data();
            
            // Primary check: Match by original ID from the original system
            if (nodeData.originalId && (importedNodeData.originalId || importedNodeData.id)) {
                if (nodeData.originalId === (importedNodeData.originalId || importedNodeData.id)) {
                    return true;
                }
            }
            
            // Fallback check: Match by label + type combination (semantic equality)
            if (nodeData.label === importedNodeData.label && nodeData.type === importedNodeData.type) {
                return true;
            }
            
            return false;
        });
        
        if (duplicateNode.length > 0) {
            // Check if the node is being dragged from the same system to the same system
            const existingNode = duplicateNode[0];
            const sourceSystemName = importedNodeData.systemName; // System where node is being dragged FROM
            const targetSystemName = currentSystem; // System where node is being dropped TO
            
            
            if (sourceSystemName === targetSystemName) {
                // Same system - prevent duplicate
                const errorMessage = `Der Knoten "${importedNodeData.label}" existiert bereits in diesem System.`;
                console.warn('Duplicate node in same system detected:', errorMessage);
                
                // Dispatch custom event for toast notification
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: errorMessage,
                        type: 'error'
                    }
                }));
                
                return null; // Don't create the node
            } else {
                // Different system - update existing node to belong to multiple systems
                
                const existingSystems = existingNode.data('systems') || [existingNode.data('systemName')];
                const updatedSystems = [...new Set([...existingSystems, targetSystemName])];
                
                // Update the existing node with new system membership
                existingNode.data({
                    ...existingNode.data(),
                    systems: updatedSystems,
                    systemsCount: updatedSystems.length,
                    systemName: targetSystemName // Update primary system to target
                });
                
                // Show success message
                window.dispatchEvent(new CustomEvent('showToast', {
                    detail: {
                        message: `Knoten "${importedNodeData.label}" wurde von "${sourceSystemName}" zu "${targetSystemName}" hinzugefügt.`,
                        type: 'success'
                    }
                }));
                
                return existingNode; // Return the updated existing node
            }
        }
        
        // Generate a fresh unique ID for imported nodes
        const nodeId = `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        
        // Create node data preserving original data but with new position and system
        const nodeData = {
            group: 'nodes',
            data: {
                id: nodeId,
                label: importedNodeData.label,
                notes: importedNodeData.notes || '',
                type: importedNodeData.type,
                originalLabel: importedNodeData.label,
                styleProperties: importedNodeData.styleProperties || {},
                customAttributes: importedNodeData.customAttributes || {},
                systemName: currentSystem, // Update to current system
                systems: [currentSystem], // Current system this node is being added to
                originalSystems: importedNodeData.systems || [importedNodeData.systemName], // Keep reference to all original systems
                originalId: importedNodeData.originalId || importedNodeData.id // Keep reference to original ID
            },
            position: { x: position.x, y: position.y },
            classes: `node-${importedNodeData.type}`
        };
        
        const newNode = cyInstanceRef.current.add(nodeData);
        
        // Apply imported style properties with delay to override CSS classes
        setTimeout(() => {
            const styleProps = importedNodeData.styleProperties || {};
            const cytoscapeStyles = {};
            
            if (styleProps.size) {
                cytoscapeStyles.width = styleProps.size;
                cytoscapeStyles.height = styleProps.size;
            }
            if (styleProps.fillColor) {
                cytoscapeStyles['background-color'] = styleProps.fillColor;
            }
            if (styleProps.borderColor) {
                cytoscapeStyles['border-color'] = styleProps.borderColor;
            }
            
            if (Object.keys(cytoscapeStyles).length > 0) {
                newNode.style(cytoscapeStyles);
            }
        }, 10);
        
        // Update graph elements after adding node
        if (updateGraphElements) updateGraphElements();
        
        // Show success toast
        window.dispatchEvent(new CustomEvent('showToast', {
            detail: {
                message: `Knoten "${importedNodeData.label}" erfolgreich aus System "${importedNodeData.systemName}" hinzugefügt.`,
                type: 'success'
            }
        }));
        
        return newNode;
    };

    const createEdge = (sourceId, targetId) => {
        if (sourceId !== targetId) {
            const edgeId = `edge-${edgeIdCounterRef.current++}`;
            const currentEdgeType = selectedEdgeTypeRef.current;
            const edge = new Edge(currentEdgeType);
            const edgeData = edge.getCytoscapeData(edgeId, sourceId, targetId, edgeIdCounterRef.current);
            const newEdge = cyInstanceRef.current.add(edgeData);
            
            // Apply initial style properties - ALWAYS apply styles to ensure visibility
            const styleProps = edgeData.data.styleProperties || {};
            applyStyleProperties(newEdge, styleProps);
            
            // Update graph elements after adding edge
            if (updateGraphElements) updateGraphElements();
        }
    };

    const applyStyleProperties = (element, styleProps) => {
        
        // Use setTimeout to ensure custom styles override CSS class styles
        setTimeout(() => {
            if (element.isNode()) {
                // Build Cytoscape-specific style object
                const cytoscapeStyles = {};
                
                if (styleProps.size !== undefined) {
                    cytoscapeStyles.width = styleProps.size;
                    cytoscapeStyles.height = styleProps.size;
                }
                if (styleProps.fillColor !== undefined) {
                    cytoscapeStyles['background-color'] = styleProps.fillColor;
                }
                if (styleProps.borderColor !== undefined) {
                    cytoscapeStyles['border-color'] = styleProps.borderColor;
                }
                if (styleProps.shape !== undefined) {
                    cytoscapeStyles['shape'] = styleProps.shape;
                }
                
                // Apply styles with higher priority to override CSS
                if (Object.keys(cytoscapeStyles).length > 0) {
                    element.style(cytoscapeStyles);
                } else {
                }
                
            } else if (element.isEdge()) {
                // Build Cytoscape-specific style object
                const cytoscapeStyles = {};
                
                if (styleProps.curveType !== undefined) {
                    cytoscapeStyles['curve-style'] = styleProps.curveType;
                }
                if (styleProps.color !== undefined) {
                    cytoscapeStyles['line-color'] = styleProps.color;
                    cytoscapeStyles['target-arrow-color'] = styleProps.color;
                }
                if (styleProps.lineType !== undefined) {
                    cytoscapeStyles['line-style'] = styleProps.lineType;
                }
                
                // Apply styles with higher priority
                element.style(cytoscapeStyles);
            }
        }, 10); // Small delay to ensure CSS classes are applied first
    };

    const updateElement = (elementId, data) => {
        const element = cyInstanceRef.current.getElementById(elementId);
        if (element) {
            element.data('label', data.label);
            element.data('notes', data.notes);
            
            // Handle node type change
            if (data.type && element.isNode()) {
                const oldType = element.data('type');
                if (oldType !== data.type) {
                    // Update the type data first
                    element.data('type', data.type);
                    
                    // Get new type configuration
                    const nodeInstance = new Node(data.type);
                    const config = nodeInstance.config;
                    
                    // Remove old type class and add new one
                    if (oldType) {
                        element.removeClass(`node-${oldType}`);
                    }
                    element.addClass(`node-${data.type}`);
                    
                    // Update style properties - always use new type's default colors
                    // This ensures consistent styling when changing types
                    const currentStyleProps = element.data('styleProperties') || {};
                    const updatedStyleProps = {
                        size: currentStyleProps.size || 60, // Keep custom size if set
                        fillColor: config.backgroundColor,   // Always use new type's color
                        borderColor: config.borderColor      // Always use new type's border
                    };
                    
                    // Update the data and apply styles immediately
                    element.data('styleProperties', updatedStyleProps);
                    applyStyleProperties(element, updatedStyleProps);
                    
                    
                    // Selection refresh is handled automatically by the type change
                }
            }
            
            // Handle edge type change
            if (data.type && element.isEdge()) {
                const oldType = element.data('type');
                if (oldType !== data.type) {
                    // Update the type data first
                    element.data('type', data.type);
                    
                    // Get new type configuration
                    const edgeInstance = new Edge(data.type);
                    const config = edgeInstance.config;
                    
                    // Remove old type class and add new one
                    if (oldType) {
                        element.removeClass(`edge-${oldType}`);
                    }
                    element.addClass(`edge-${data.type}`);
                    
                    // Update style properties - always use new type's default colors
                    const currentStyleProps = element.data('styleProperties') || {};
                    const updatedStyleProps = {
                        curveType: currentStyleProps.curveType || 'straight',
                        color: config.color,        // Always use new type's color
                        lineType: currentStyleProps.lineType || 'solid'
                    };
                    
                    // Update the data and apply styles immediately
                    element.data('styleProperties', updatedStyleProps);
                    applyStyleProperties(element, updatedStyleProps);
                    
                    
                    // Selection refresh is handled automatically by the type change
                }
            }
            
            // Update custom attributes
            if (data.customAttributes) {
                element.data('customAttributes', data.customAttributes);
            }
            
            // Update and apply style properties immediately
            if (data.styleProperties) {
                element.data('styleProperties', data.styleProperties);
                applyStyleProperties(element, data.styleProperties); // Immediate visual update
            }
            
            // Update graph elements after updating element
            if (updateGraphElements) updateGraphElements();
        }
    };

    const deleteElement = async (elementId) => {
        const element = cyInstanceRef.current.getElementById(elementId);
        if (!element) {
            return;
        }

        // Prevent deletion of shared node indicators - they're visual aids only
        if (element.data('isSharedIndicator')) {
            return;
        }

        const isNode = element.isNode();
        const currentSystem = currentSystemRef.current;

        console.log(`🔍 Delete element called - isNode: ${isNode}, currentSystem: ${currentSystem}, elementId: ${elementId}`);
        
        if (!currentSystem) {
            alert('No current system selected. Cannot delete from database.');
            return;
        }

        try {
            if (isNode) {
                const nodeCustomId = element.data('id');
                
                console.log(`🗑️ Attempting to delete node ${nodeCustomId} from system ${currentSystem}`);
                
                // Check if this is a temporary node (not saved to Neo4j yet)
                const isTemporaryNode = /^node-\d+$/.test(nodeCustomId);
                
                if (isTemporaryNode) {
                    // Temporary node - just remove from visualization
                    console.log(`🆕 Deleting temporary node ${nodeCustomId} (not saved to database)`);
                    cyInstanceRef.current.remove(element);
                    onElementSelect && onElementSelect(null);
                    console.log(`✅ Temporary node ${nodeCustomId} deleted from visualization`);
                } else {
                    // Saved node - delete from Neo4j database first
                    console.log(`💾 Deleting saved node ${nodeCustomId} from database`);
                    
                    const result = await neo4jConnection.deleteNodeByCustomId(nodeCustomId, currentSystem, false);
                    
                    console.log('Delete result:', result);
                    
                    if (result && (result.success || result.updatedCount > 0)) {
                        // Remove from Cytoscape visualization
                        cyInstanceRef.current.remove(element);
                        onElementSelect && onElementSelect(null);
                        
                        console.log(`✅ Saved node ${nodeCustomId} deleted successfully`);
                    } else {
                        console.error(`❌ Failed to delete saved node ${nodeCustomId}:`, result);
                        alert(`Failed to delete node: ${result?.message || 'Unknown error'}`);
                        return;
                    }
                }
            } else {
                // For edges, just remove from visualization (edges are recreated on save)
                cyInstanceRef.current.remove(element);
                onElementSelect && onElementSelect(null);
                console.log(`🗑️ Edge ${elementId} deleted from visualization`);
            }
            
            // Update graph elements after deleting element
            if (updateGraphElements) updateGraphElements();
            
        } catch (error) {
            console.error(`❌ Error deleting element ${elementId}:`, error);
            alert(`Error deleting element: ${error.message}`);
        }
    };

    const reverseEdge = (edgeId) => {
        const edge = cyInstanceRef.current.getElementById(edgeId);
        if (edge && edge.isEdge()) {
            const sourceId = edge.source().id();
            const targetId = edge.target().id();
            const edgeData = edge.data();

            // Create new edge data with swapped source and target
            const newEdgeData = {
                ...edgeData,
                source: targetId,
                target: sourceId
            };

            // Remove old edge and add new reversed edge
            cyInstanceRef.current.remove(edge);
            cyInstanceRef.current.add({
                group: 'edges',
                data: newEdgeData,
                classes: edge.classes()
            });

            // Clear selection since the element was replaced
            onElementSelect && onElementSelect(null);
            
            // Update graph elements after reversing edge
            if (updateGraphElements) updateGraphElements();
        }
    };

    const exportData = () => {
        const elements = cyInstanceRef.current.elements().jsons();
        const nodes = elements.filter(el => el.group === 'nodes');
        const edges = elements.filter(el => el.group === 'edges' && !el.data.isSharedIndicator);

        // Generate Neo4j Cypher statements
        let cypherStatements = [];

        // Create node statements
        cypherStatements.push('// Create nodes');
        nodes.forEach(node => {
            const nodeId = node.data.id;
            const nodeType = node.data.type || 'Node';
            const label = node.data.label || nodeId;
            const notes = node.data.notes || '';
            const systemName = node.data.systemName || '';
            const systemLabel = node.data.systemLabel;
            const customAttributes = node.data.customAttributes || {};
            const styleProperties = node.data.styleProperties || {};

            // Build labels for Neo4j - combine type and system
            const labels = [nodeType.charAt(0).toUpperCase() + nodeType.slice(1)];
            if (systemLabel) {
                labels.push(systemLabel);
            }
            const labelString = labels.join(':');

            // Build the properties object for the Cypher statement (no system property needed)
            let properties = {
                id: `"${nodeId}"`,
                label: `"${label}"`,
                notes: `"${notes}"`,
                systemName: `"${systemName}"`, // Keep original system name for reference
                type: `"${nodeType}"`,
                x: Math.round(node.position.x),
                y: Math.round(node.position.y)
            };

            // Add custom attributes to properties
            Object.entries(customAttributes).forEach(([attrName, attrData]) => {
                const sanitizedName = attrName.replace(/[^a-zA-Z0-9_]/g, '_');
                let value;
                
                switch (attrData.type) {
                    case 'number':
                        value = parseFloat(attrData.value) || 0;
                        break;
                    case 'date':
                        value = `"${attrData.value}"`;
                        break;
                    case 'email':
                    case 'text':
                    default:
                        value = `"${(attrData.value || '').toString().replace(/"/g, '\\"')}"`;
                        break;
                }
                
                properties[`${sanitizedName}_${attrData.type}`] = value;
            });

            // Add style properties to export
            if (styleProperties.size) {
                properties.size = styleProperties.size;
            }
            if (styleProperties.fillColor) {
                properties.fillColor = `"${styleProperties.fillColor}"`;
            }
            if (styleProperties.borderColor) {
                properties.borderColor = `"${styleProperties.borderColor}"`;
            }

            // Generate the Cypher CREATE statement with labels
            const propertyString = Object.entries(properties)
                .map(([key, value]) => `    ${key}: ${value}`)
                .join(',\n');

            const cypher = `CREATE (${nodeId.replace(/[^a-zA-Z0-9]/g, '_')}:${labelString} {
${propertyString}
})`;
            cypherStatements.push(cypher);
        });

        cypherStatements.push('');
        cypherStatements.push('// Create relationships');

        // Create relationship statements
        edges.forEach(edge => {
            const sourceId = edge.data.source.replace(/[^a-zA-Z0-9]/g, '_');
            const targetId = edge.data.target.replace(/[^a-zA-Z0-9]/g, '_');
            const edgeType = edge.data.type || 'RELATES_TO';
            const label = edge.data.label || '';
            const notes = edge.data.notes || '';
            const customAttributes = edge.data.customAttributes || {};
            const styleProperties = edge.data.styleProperties || {};

            const relationshipType = edgeType.toUpperCase().replace(/[^A-Z0-9]/g, '_');

            // Build properties string for relationships
            let properties = [
                `id: "${edge.data.id}"`,
                `label: "${label}"`,
                `notes: "${notes}"`,
                `type: "${edgeType}"`
            ];

            // Add custom attributes
            Object.entries(customAttributes).forEach(([attrName, attrData]) => {
                const sanitizedName = attrName.replace(/[^a-zA-Z0-9_]/g, '_');
                let value;
                
                switch (attrData.type) {
                    case 'number':
                        value = parseFloat(attrData.value) || 0;
                        break;
                    case 'date':
                        value = `"${attrData.value}"`;
                        break;
                    case 'email':
                    case 'text':
                    default:
                        value = `"${(attrData.value || '').toString().replace(/"/g, '\\"')}"`;
                        break;
                }
                
                properties.push(`${sanitizedName}_${attrData.type}: ${value}`);
            });

            // Add style properties
            if (styleProperties.curveType) {
                properties.push(`curveType: "${styleProperties.curveType}"`);
            }
            if (styleProperties.color) {
                properties.push(`color: "${styleProperties.color}"`);
            }
            if (styleProperties.lineType) {
                properties.push(`lineType: "${styleProperties.lineType}"`);
            }

            const cypher = `MATCH (source {id: "${edge.data.source}"}), (target {id: "${edge.data.target}"})
                                    CREATE (source)-[:${relationshipType} {
                                        ${properties.join(',\n                                        ')}
                                    }]->(target)`;
            cypherStatements.push(cypher);
        });

        cypherStatements.push('');
        cypherStatements.push('// Metadata');
        cypherStatements.push(`// Generated on: ${new Date().toISOString()}`);
        cypherStatements.push(`// Nodes: ${nodes.length}, Relationships: ${edges.length}`);
        
        // Count custom attributes
        const totalCustomAttributes = nodes.reduce((count, node) => {
            const customAttributes = node.data.customAttributes || {};
            return count + Object.keys(customAttributes).length;
        }, 0);
        if (totalCustomAttributes > 0) {
            cypherStatements.push(`// Total custom attributes: ${totalCustomAttributes}`);
        }

        return {
            cypher: cypherStatements.join('\n'),
            metadata: {
                exportDate: new Date().toISOString(),
                nodeCount: nodes.length,
                edgeCount: edges.length,
                format: 'Neo4j Cypher'
            }
        };
    };

    const applyLayout = (layoutName) => {
        const layout = cyInstanceRef.current.layout({
            name: layoutName,
            animate: true,
            animationDuration: 500,
            fit: true,
            padding: 50
        });
        layout.run();
    };

    return {
        createNodeAtPosition,
        createImportedNodeAtPosition,
        createEdge,
        updateElement,
        deleteElement,
        reverseEdge,
        exportData,
        applyLayout
    };
};
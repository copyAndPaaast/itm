/**
 * Graph Persistence Module
 * Handles saving and loading graph data to/from Neo4j database
 */

/**
 * Creates graph persistence handlers
 * @param {React.RefObject} cyInstanceRef - Reference to Cytoscape instance
 * @param {React.RefObject} currentSystemRef - Reference to current system
 * @param {React.RefObject} currentSystemDataRef - Reference to current system data
 * @param {React.RefObject} nodeIdCounterRef - Reference to node ID counter
 * @param {React.RefObject} edgeIdCounterRef - Reference to edge ID counter
 * @param {boolean} isMultiSystemView - Multi-system view state
 * @param {Function} setIsMultiSystemView - Setter for multi-system view state
 * @param {Function} updateGraphElements - Function to update parent graph elements
 * @returns {Object} Object containing saveGraph and loadGraph functions
 */
export const createGraphPersistence = (
    cyInstanceRef,
    currentSystemRef,
    currentSystemDataRef,
    nodeIdCounterRef,
    edgeIdCounterRef,
    isMultiSystemView,
    setIsMultiSystemView,
    updateGraphElements
) => {
    /**
     * Saves the current graph to Neo4j database
     * @returns {Promise<boolean>} Success status
     */
    const saveGraph = async () => {
        if (!currentSystemRef.current) {
            throw new Error('Kein System aktiv. Bitte erstellen Sie zuerst ein System.');
        }
        
        // Prevent saving in mixed system view
        if (currentSystemRef.current === 'MIXED_SYSTEMS_VIEW') {
            throw new Error('Speichern ist in der gemischten Systemansicht nicht möglich. Bitte wechseln Sie zu einem einzelnen System.');
        }

        const cy = cyInstanceRef.current;
        if (!cy) {
            throw new Error('Graph ist nicht initialisiert.');
        }

        const currentSystemName = currentSystemRef.current;
        console.log(`💾 Saving system: ${currentSystemName}, isMultiSystemView: ${isMultiSystemView}`);
        
        // Validate state consistency
        validateSaveState(isMultiSystemView, currentSystemName);
        
        // Extract graph data
        const { nodes, edges } = extractGraphData(cy);
        
        // Prepare metadata
        const metadata = prepareMetadata(currentSystemDataRef.current, cy);
        
        // Save to Neo4j
        const result = await saveToNeo4j(currentSystemName, nodes, edges, metadata);
        
        console.log('Graph saved successfully:', result);
        return true;
    };

    /**
     * Loads graph data from provided graph data object
     * @param {Object} graphData - Graph data containing nodes, edges, and metadata
     * @returns {Promise<boolean>} Success status
     */
    const loadGraph = async (graphData) => {
        const cy = cyInstanceRef.current;
        if (!cy) {
            throw new Error('Graph ist nicht initialisiert.');
        }

        console.log('Loading graph data:', {
            nodes: graphData.nodes?.length || 0,
            edges: graphData.edges?.length || 0,
            systemName: graphData.systemName
        });

        // Clear existing graph
        cy.elements().remove();

        // Load nodes and edges
        await loadGraphElements(cy, graphData);
        
        // Apply custom styles
        await applyCustomStyles(cy, graphData);
        
        // Restore viewport
        restoreViewport(cy, graphData);
        
        // Update counters and state
        updateCountersAndState(cy, nodeIdCounterRef, edgeIdCounterRef, setIsMultiSystemView, updateGraphElements);

        console.log('Graph loaded successfully:', graphData.systemName);
        return true;
    };

    return { saveGraph, loadGraph };
};

/**
 * Validates the current state before saving
 * @param {boolean} isMultiSystemView - Multi-system view state
 * @param {string} currentSystemName - Current system name
 */
const validateSaveState = (isMultiSystemView, currentSystemName) => {
    if (isMultiSystemView && currentSystemName === 'MIXED_SYSTEMS_VIEW') {
        throw new Error('Speichern ist in der gemischten Systemansicht nicht möglich.');
    }
    
    if (isMultiSystemView) {
        throw new Error('Unerwarteter Zustand: Multi-System-Ansicht ohne MIXED_SYSTEMS_VIEW.');
    }
};

/**
 * Extracts nodes and edges data from Cytoscape instance
 * @param {Object} cy - Cytoscape instance
 * @returns {Object} Object containing nodes and edges arrays
 */
const extractGraphData = (cy) => {
    // Get all non-compound nodes
    const regularNodes = cy.nodes().filter(node => !node.data('isCompound'));
    
    const nodes = regularNodes.map(node => ({
        id: node.id(),
        label: node.data('label') || '',
        notes: node.data('notes') || '',
        type: node.data('type') || 'default',
        originalLabel: node.data('originalLabel') || node.data('label'),
        position: node.position(),
        styleProperties: node.data('styleProperties') || {},
        customAttributes: node.data('customAttributes') || {}
    }));

    const edges = cy.edges().map(edge => ({
        id: edge.id(),
        source: edge.source().id(),
        target: edge.target().id(),
        label: edge.data('label') || '',
        notes: edge.data('notes') || '',
        type: edge.data('type') || 'default',
        originalLabel: edge.data('originalLabel') || edge.data('label'),
        styleProperties: edge.data('styleProperties') || {},
        customAttributes: edge.data('customAttributes') || {}
    }));
    
    console.log(`💾 Single-system save: Found ${nodes.length} nodes and ${edges.length} edges`);
    
    return { nodes, edges };
};

/**
 * Prepares metadata for saving
 * @param {Object} currentSystemData - Current system data
 * @param {Object} cy - Cytoscape instance
 * @returns {Object} Metadata object
 */
const prepareMetadata = (currentSystemData, cy) => {
    const customFields = currentSystemData?.customFields || {};
    const cleanCustomFields = JSON.parse(JSON.stringify(customFields));
    
    return {
        version: '1.0',
        createdBy: 'Graph Viewer',
        systemNotes: currentSystemData?.notes || '',
        systemCustomFields: cleanCustomFields,
        viewport: {
            zoom: cy.zoom(),
            pan: cy.pan()
        }
    };
};

/**
 * Saves graph data to Neo4j
 * @param {string} systemName - System name
 * @param {Array} nodes - Nodes array
 * @param {Array} edges - Edges array
 * @param {Object} metadata - Metadata object
 * @returns {Promise<Object>} Save result
 */
const saveToNeo4j = async (systemName, nodes, edges, metadata) => {
    const { default: neo4jConnection } = await import('../../connection/Neo4jConnection');
    return await neo4jConnection.storeGraph(systemName, nodes, edges, metadata);
};

/**
 * Loads nodes and edges into Cytoscape
 * @param {Object} cy - Cytoscape instance
 * @param {Object} graphData - Graph data
 */
const loadGraphElements = async (cy, graphData) => {
    // Add nodes first
    if (graphData.nodes && graphData.nodes.length > 0) {
        const nodeIds = graphData.nodes.map(n => n.data?.id || 'unknown');
        console.log('Node IDs being loaded:', nodeIds);
        cy.add(graphData.nodes);
        console.log(`Added ${graphData.nodes.length} nodes to graph`);
    }

    // Add edges with validation
    if (graphData.edges && graphData.edges.length > 0) {
        const { validEdges, invalidEdges } = validateAndFilterEdges(cy, graphData.edges);
        
        if (validEdges.length > 0) {
            cy.add(validEdges);
            console.log(`Added ${validEdges.length} valid edges to graph`);
        }
        
        if (invalidEdges.length > 0) {
            console.warn(`Skipped ${invalidEdges.length} invalid edges due to missing nodes`);
        }
    }
};

/**
 * Validates and filters edges based on node existence
 * @param {Object} cy - Cytoscape instance
 * @param {Array} edges - Edges array
 * @returns {Object} Object containing validEdges and invalidEdges arrays
 */
const validateAndFilterEdges = (cy, edges) => {
    const validEdges = [];
    const invalidEdges = [];
    
    edges.forEach(edge => {
        const sourceExists = cy.getElementById(edge.data.source).length > 0;
        const targetExists = cy.getElementById(edge.data.target).length > 0;
        
        if (sourceExists && targetExists) {
            validEdges.push(edge);
        } else {
            invalidEdges.push(edge);
            console.warn(`Skipping edge ${edge.data.id}: source=${edge.data.source} (exists: ${sourceExists}), target=${edge.data.target} (exists: ${targetExists})`);
        }
    });
    
    return { validEdges, invalidEdges };
};

/**
 * Applies custom styles to loaded elements
 * @param {Object} cy - Cytoscape instance
 * @param {Object} graphData - Graph data
 */
const applyCustomStyles = async (cy, graphData) => {
    if (!graphData) {
        console.log('No graph data to apply styles to');
        return;
    }
    
    // Small delay to ensure CSS classes are applied first
    setTimeout(() => {
        applyNodeStyles(cy, graphData.nodes);
        applyEdgeStyles(cy, graphData.edges);
    }, 100);
};

/**
 * Applies custom styles to nodes
 * @param {Object} cy - Cytoscape instance
 * @param {Array} nodes - Nodes array
 */
const applyNodeStyles = (cy, nodes) => {
    if (!nodes || !Array.isArray(nodes)) {
        console.log('No nodes to apply styles to');
        return;
    }
    
    nodes.forEach(nodeData => {
        if (nodeData.data.styleProperties && Object.keys(nodeData.data.styleProperties).length > 0) {
            const nodeElement = cy.getElementById(nodeData.data.id);
            if (nodeElement.length > 0) {
                const cytoscapeStyles = convertNodeStyleProperties(nodeData.data.styleProperties);
                nodeElement.style(cytoscapeStyles);
                console.log(`Applied custom styles to node ${nodeData.data.id}:`, cytoscapeStyles);
            }
        }
    });
};

/**
 * Applies custom styles to edges
 * @param {Object} cy - Cytoscape instance
 * @param {Array} edges - Edges array
 */
const applyEdgeStyles = (cy, edges) => {
    if (!edges || !Array.isArray(edges)) {
        console.log('No edges to apply styles to');
        return;
    }
    
    edges.forEach(edgeData => {
        if (edgeData.data.styleProperties && Object.keys(edgeData.data.styleProperties).length > 0) {
            const edgeElement = cy.getElementById(edgeData.data.id);
            if (edgeElement.length > 0) {
                const cytoscapeStyles = convertEdgeStyleProperties(edgeData.data.styleProperties);
                edgeElement.style(cytoscapeStyles);
                console.log(`Applied custom styles to edge ${edgeData.data.id}:`, cytoscapeStyles);
            }
        }
    });
};

/**
 * Converts stored node style properties to Cytoscape format
 * @param {Object} styleProps - Style properties
 * @returns {Object} Cytoscape styles object
 */
const convertNodeStyleProperties = (styleProps) => {
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
    if (styleProps.shape) {
        cytoscapeStyles['shape'] = styleProps.shape;
    }
    
    return cytoscapeStyles;
};

/**
 * Converts stored edge style properties to Cytoscape format
 * @param {Object} styleProps - Style properties
 * @returns {Object} Cytoscape styles object
 */
const convertEdgeStyleProperties = (styleProps) => {
    const cytoscapeStyles = {};
    
    if (styleProps.curveType) {
        cytoscapeStyles['curve-style'] = styleProps.curveType;
    }
    if (styleProps.color) {
        cytoscapeStyles['line-color'] = styleProps.color;
        cytoscapeStyles['target-arrow-color'] = styleProps.color;
    }
    if (styleProps.lineType) {
        cytoscapeStyles['line-style'] = styleProps.lineType;
    }
    
    return cytoscapeStyles;
};

/**
 * Restores viewport settings
 * @param {Object} cy - Cytoscape instance
 * @param {Object} graphData - Graph data
 */
const restoreViewport = (cy, graphData) => {
    if (graphData.metadata?.viewport) {
        const viewport = graphData.metadata.viewport;
        if (viewport.zoom) cy.zoom(viewport.zoom);
        if (viewport.pan) cy.pan(viewport.pan);
    } else {
        cy.fit();
    }
};

/**
 * Updates counters and component state after loading
 * @param {Object} cy - Cytoscape instance
 * @param {React.RefObject} nodeIdCounterRef - Node ID counter ref
 * @param {React.RefObject} edgeIdCounterRef - Edge ID counter ref
 * @param {Function} setIsMultiSystemView - Multi-system view setter
 * @param {Function} updateGraphElements - Graph elements updater
 */
const updateCountersAndState = (cy, nodeIdCounterRef, edgeIdCounterRef, setIsMultiSystemView, updateGraphElements) => {
    // Update counters based on loaded elements
    const nodeIds = cy.nodes().map(n => n.id()).map(id => parseInt(id.split('-')[1]) || 0);
    const edgeIds = cy.edges().map(e => e.id()).map(id => parseInt(id.split('-')[1]) || 0);

    nodeIdCounterRef.current = Math.max(...nodeIds, 0) + 1;
    edgeIdCounterRef.current = Math.max(...edgeIds, 0) + 1;

    // Don't automatically set multi-system view when loading a regular graph
    setIsMultiSystemView(false);

    // Update graph elements in parent
    updateGraphElements();
};
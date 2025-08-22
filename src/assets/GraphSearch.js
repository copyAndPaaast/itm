/**
 * Graph Search Module
 * Handles search functionality for graph elements including highlighting and filtering
 */

/**
 * Creates a graph search handler function
 * @param {React.RefObject} cyInstanceRef - Reference to the Cytoscape instance
 * @returns {Function} handleGraphSearch function
 */
export const createGraphSearchHandler = (cyInstanceRef) => {
    /**
     * Handles graph search with highlighting and dimming
     * @param {string} searchValue - The search term to filter by
     */
    const handleGraphSearch = (searchValue) => {
        const cy = cyInstanceRef.current;
        if (!cy) return;
        
        if (!searchValue || searchValue.trim() === '') {
            // Reset all elements to normal style
            resetSearchHighlighting(cy);
        } else {
            // Search for matching nodes and highlight them
            performSearch(cy, searchValue);
        }
    };

    return handleGraphSearch;
};

/**
 * Resets all search highlighting and dimming effects
 * @param {Object} cy - Cytoscape instance
 */
const resetSearchHighlighting = (cy) => {
    cy.elements().removeClass('dimmed highlighted');
    cy.elements().removeStyle();
};

/**
 * Performs the actual search and applies highlighting
 * @param {Object} cy - Cytoscape instance  
 * @param {string} searchValue - The search term
 */
const performSearch = (cy, searchValue) => {
    const searchLower = searchValue.toLowerCase();
    
    // Find matching nodes
    const matchingNodes = cy.nodes().filter(node => 
        isNodeMatching(node, searchLower)
    );
    
    // Get connected edges to highlighted nodes
    const connectedEdges = matchingNodes.connectedEdges();
    const highlightedElements = matchingNodes.union(connectedEdges);
    
    // Apply highlighting effects
    applySearchHighlighting(cy, highlightedElements);
};

/**
 * Checks if a node matches the search criteria
 * @param {Object} node - Cytoscape node object
 * @param {string} searchLower - Lowercase search term
 * @returns {boolean} True if node matches search criteria
 */
const isNodeMatching = (node, searchLower) => {
    const data = node.data();
    
    // Search in node label
    if (data.label && data.label.toLowerCase().includes(searchLower)) {
        return true;
    }
    
    // Search in node type
    if (data.type && data.type.toLowerCase().includes(searchLower)) {
        return true;
    }
    
    // Search in custom attributes
    if (data.customAttributes) {
        for (const [key, attr] of Object.entries(data.customAttributes)) {
            if (key.toLowerCase().includes(searchLower) || 
                (attr.value && attr.value.toString().toLowerCase().includes(searchLower))) {
                return true;
            }
        }
    }
    
    return false;
};

/**
 * Applies search highlighting effects to elements
 * @param {Object} cy - Cytoscape instance
 * @param {Object} highlightedElements - Elements to highlight
 */
const applySearchHighlighting = (cy, highlightedElements) => {
    // Dim all elements first
    cy.elements().addClass('dimmed');
    
    // Highlight matching elements
    highlightedElements.removeClass('dimmed').addClass('highlighted');
};

/**
 * Additional search utilities
 */
export const searchUtils = {
    resetSearchHighlighting,
    performSearch,
    isNodeMatching,
    applySearchHighlighting
};
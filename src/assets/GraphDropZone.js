/**
 * Graph Drop Zone Module
 * Handles HTML5 drag and drop functionality for importing nodes into the graph
 */

/**
 * Creates drop zone functionality
 * @param {React.RefObject} cyRef - Reference to the Cytoscape container DOM element
 * @param {React.RefObject} cyInstanceRef - Reference to Cytoscape instance
 * @param {Function} createImportedNodeAtPosition - Function to create imported nodes
 * @param {React.RefObject} isEditableRef - Reference to editable state
 * @returns {Object} Object containing drop zone setup function
 */
export const createGraphDropZone = (cyRef, cyInstanceRef, createImportedNodeAtPosition, isEditableRef) => {
    /**
     * Sets up HTML5 drag and drop for importing nodes
     */
    const setupDropZone = () => {
        const container = cyRef.current;
        if (container) {
            container.addEventListener('dragover', handleDragOver);
            container.addEventListener('drop', handleDrop);
        }
    };

    /**
     * Handles dragover events to enable dropping
     * @param {DragEvent} e - Drag event
     */
    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    /**
     * Handles drop events to create imported nodes
     * @param {DragEvent} e - Drop event
     */
    const handleDrop = (e) => {
        e.preventDefault();
        
        // Only allow drops if graph is editable
        if (!isEditableRef.current) {
            console.log('Drop blocked - graph is not editable');
            return;
        }
        
        try {
            const dragData = JSON.parse(e.dataTransfer.getData('application/json'));
            if (dragData.type === 'existing-node') {
                const position = calculateDropPosition(e);
                const modelPosition = convertToModelPosition(position);
                
                // Create the imported node
                const createdNode = createImportedNodeAtPosition(modelPosition, dragData.nodeData);
                
                if (createdNode) {
                    console.log('Dropped existing node at position:', modelPosition);
                } else {
                    console.log('Node creation blocked - duplicate detected');
                }
            }
        } catch (err) {
            console.error('Error handling dropped node:', err);
        }
    };

    /**
     * Calculates the drop position relative to the container
     * @param {DragEvent} e - Drop event
     * @returns {Object} Position object with x, y coordinates
     */
    const calculateDropPosition = (e) => {
        const container = cyRef.current;
        const containerRect = container.getBoundingClientRect();
        return {
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top
        };
    };

    /**
     * Converts screen coordinates to Cytoscape model coordinates
     * @param {Object} position - Screen position
     * @returns {Object} Model position
     */
    const convertToModelPosition = (position) => {
        // Get current pan and zoom from Cytoscape
        const cytoscapePosition = cyInstanceRef.current.pan();
        const zoom = cyInstanceRef.current.zoom();
        
        // Convert rendered position to model position
        return {
            x: (position.x - cytoscapePosition.x) / zoom,
            y: (position.y - cytoscapePosition.y) / zoom
        };
    };

    /**
     * Cleanup function to remove event listeners
     */
    const cleanup = () => {
        const container = cyRef.current;
        if (container) {
            container.removeEventListener('dragover', handleDragOver);
            container.removeEventListener('drop', handleDrop);
        }
    };

    return {
        setupDropZone,
        cleanup
    };
};
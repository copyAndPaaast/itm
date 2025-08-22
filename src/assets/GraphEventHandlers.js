export const setupEventHandlers = (
    cyInstanceRef,
    createNodeAtPosition,
    createEdge,
    onElementSelect,
    isDraggingRef,
    dragStartNodeRef,
    tempEdgeRef,
    isEditableRef
) => {
    const cy = cyInstanceRef.current;

    const setupTapHandlers = () => {
        cy.on('tap', function(evt) {
            if (evt.target === cy) {
                // Clear all selections when clicking on empty canvas
                cy.elements().unselect();
                onElementSelect && onElementSelect(null);
                
                // Only create node if graph is editable AND Ctrl/Cmd key is held
                if (isEditableRef.current && (evt.originalEvent.ctrlKey || evt.originalEvent.metaKey)) {
                    createNodeAtPosition(evt.position);
                }
            }
        });
    };

    const setupSelectionHandlers = () => {
        // Throttle selection updates to improve performance
        let selectionTimeout = null;
        
        const handleSelection = (element) => {
            if (selectionTimeout) clearTimeout(selectionTimeout);
            selectionTimeout = setTimeout(() => {
                onElementSelect && onElementSelect(element);
            }, 10); // Small delay to batch selection changes
        };

        cy.on('select', 'node', function(evt) {
            // Unselect all other elements first
            cy.elements().not(evt.target).unselect();
            handleSelection(evt.target);
        });

        cy.on('select', 'edge', function(evt) {
            // Skip selection for shared node indicators - they're visual aids only
            if (evt.target.data('isSharedIndicator')) {
                evt.target.unselect();
                return;
            }
            
            // Unselect all other elements first  
            cy.elements().not(evt.target).unselect();
            handleSelection(evt.target);
        });

        cy.on('unselect', 'node', function(evt) {
            // Reset visual style for unselected nodes
            const styleProperties = evt.target.data('styleProperties');
            if (styleProperties && styleProperties.borderColor) {
                evt.target.style('border-color', styleProperties.borderColor);
            } else {
                evt.target.style('border-color', '#666666');
            }
            evt.target.style('border-width', 3);
            // console.log('Node unselected and style reset:', evt.target.id());
        });

        cy.on('unselect', 'edge', function(evt) {
            // console.log('Edge unselected:', evt.target.id());
        });

        cy.on('unselect', function(evt) {
            // Check if anything is still selected
            if (cy.$(':selected').length === 0) {
                onElementSelect && onElementSelect(null);
                // console.log('Nothing selected');
            }
        });
    };

    const setupMouseInteractionHandlers = () => {
        cy.on('mousedown', 'node', function(evt) {
            const node = evt.target;
            
            // Skip edge creation logic for compound nodes - allow them to be draggable
            if (node.data('isCompound')) {
                node.select();
                return;
            }
            
            // Always allow selection
            if (!isEditableRef.current) {
                node.select();
                return;
            }
            
            const mousePos = evt.position || evt.cyPosition;
            const nodePos = node.position();
            const nodeSize = node.width();

            const distance = Math.sqrt(Math.pow(mousePos.x - nodePos.x, 2) + Math.pow(mousePos.y - nodePos.y, 2));
            const borderThickness = 8;

            if (distance > (nodeSize/2 - borderThickness)) {
                dragStartNodeRef.current = node;
                isDraggingRef.current = true;
                node.ungrabify();
                evt.stopPropagation();
                evt.preventDefault();
            } else {
                node.grabify();
                node.select();
            }
        });

        cy.on('mouseover', 'node', function(evt) {
            // Skip hover effects for compound nodes
            if (evt.target.data('isCompound')) {
                return;
            }
            
            if (!isDraggingRef.current && !evt.target.selected()) {
                evt.target.style('border-color', '#0074cc');
                evt.target.style('border-width', 10);
            }
        });

        cy.on('mouseout', 'node', function(evt) {
            // Skip hover effects for compound nodes
            if (evt.target.data('isCompound')) {
                return;
            }
            
            if (!evt.target.selected() && !isDraggingRef.current) {
                // Reset to original style from the node's data
                const styleProperties = evt.target.data('styleProperties');
                if (styleProperties && styleProperties.borderColor) {
                    evt.target.style('border-color', styleProperties.borderColor);
                } else {
                    evt.target.style('border-color', '#666666');
                }
                evt.target.style('border-width', 3); // Match default border width
            }
        });
    };

    const setupDragToCreateEdgeHandlers = () => {
        cy.on('mousemove', function(evt) {
            if (isDraggingRef.current && dragStartNodeRef.current && isEditableRef.current) {
                cy.elements('.temp-edge').remove();
                cy.elements('.temp-node').remove();

                const timestamp = Date.now();
                const tempNodeId = `temp-target-${timestamp}`;
                const tempEdgeId = `temp-edge-${timestamp}`;

                cy.add({
                    group: 'nodes',
                    data: { 
                        id: tempNodeId,
                        label: 'temp-target'
                    },
                    position: { x: evt.position.x, y: evt.position.y },
                    classes: 'temp-node'
                });

                tempEdgeRef.current = cy.add({
                    group: 'edges',
                    data: {
                        id: tempEdgeId,
                        source: dragStartNodeRef.current.id(),
                        target: tempNodeId
                    },
                    classes: 'temp-edge'
                });
            }
        });

        cy.on('mouseup', function(evt) {
            if (isDraggingRef.current && dragStartNodeRef.current) {
                cy.elements('.temp-edge').remove();
                cy.elements('.temp-node').remove();

                dragStartNodeRef.current.grabify();

                // Only create edges if editable
                if (isEditableRef.current) {
                    const targetNode = evt.target;
                    if (targetNode !== cy && targetNode.isNode() && !targetNode.hasClass('temp-node')) {
                        createEdge(dragStartNodeRef.current.id(), targetNode.id());
                    } else {
                        const nodeAtPosition = cy.nodes().filter(function(node) {
                            if (node.hasClass('temp-node')) return false;
                            const nodePos = node.position();
                            const distance = Math.sqrt(
                                Math.pow(evt.position.x - nodePos.x, 2) +
                                Math.pow(evt.position.y - nodePos.y, 2)
                            );
                            return distance < node.width() / 2;
                        });

                        if (nodeAtPosition.length > 0) {
                            createEdge(dragStartNodeRef.current.id(), nodeAtPosition[0].id());
                        } else {
                            const newNode = createNodeAtPosition(evt.position);
                            createEdge(dragStartNodeRef.current.id(), newNode.id());
                        }
                    }
                }
            }
            isDraggingRef.current = false;
            dragStartNodeRef.current = null;
            tempEdgeRef.current = null;
        });
    };

    // Setup all handlers
    setupTapHandlers();
    setupSelectionHandlers();
    setupMouseInteractionHandlers();
    setupDragToCreateEdgeHandlers();
};
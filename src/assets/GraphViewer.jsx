import React, { useEffect, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';
import { cytoscapeStyles } from './CytoscapeStyles.js';
import { setupEventHandlers } from './GraphEventHandlers.js';
import { createGraphOperations } from './GraphOperations.js';
import { createGraphSearchHandler } from './GraphSearch.js';
import { createGraphPersistence } from './GraphPersistence.js';
import { createCompoundNodeManager } from './CompoundNodeManager.js';
import { createSystemManager } from './SystemManager.js';
import { createGraphDropZone } from './GraphDropZone.js';
import {Paper} from "@mui/material";
import LayoutSelector from "../LayoutSelector.jsx";
import MultiSystemNodeIndicators from "../MultiSystemNodeIndicators.jsx";
import ProgressiveFailureControls from "../ProgressiveFailureControls.jsx";
import Node from '../Node.js';

const GraphViewer = ({ selectedNodeType, selectedEdgeType, currentSystem, currentSystemData, onElementSelect, onUpdateElement, onDeleteElement, onReverseEdge, onExportData, onApplyLayout, onClearCanvas, onGraphElementsUpdate, onSaveGraph, onLoadGraph, onMultiSystemViewChange, onSystemChange, isFailureAnalysisMode, failureAnalysisAsset, failureAnalysisSteps, onStepsChange, onRelationFilterChange }) => {
    const cyRef = useRef(null);
    const cyInstanceRef = useRef(null);
    const [isMultiSystemView, setIsMultiSystemView] = useState(false);
    const nodeIdCounterRef = useRef(0);
    const edgeIdCounterRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragStartNodeRef = useRef(null);
    const tempEdgeRef = useRef(null);
    const selectedNodeTypeRef = useRef(selectedNodeType);
    const selectedEdgeTypeRef = useRef(selectedEdgeType);
    const currentSystemRef = useRef(currentSystem);
    const currentSystemDataRef = useRef(currentSystemData);
    const handleGraphSearchRef = useRef(null);
    const handleSystemChangeRef = useRef(null);
    const isEditableRef = useRef(true);

    useEffect(() => {
        // Register fcose layout extension for compound-aware layouts
        cytoscape.use(fcose);
        
        // Initialize Cytoscape with combined styles
        const initialStyles = [...cytoscapeStyles, ...Node.getPendingStyles()];

        cyInstanceRef.current = cytoscape({
            container: cyRef.current,
            style: initialStyles,
            elements: [],
            layout: {
                name: 'preset'
            },
            userZoomingEnabled: true,
            userPanningEnabled: true,
            boxSelectionEnabled: false,
            selectionType: 'single',
            autoungrabify: false
        });

        // Listen for style updates
        const handleStyleUpdate = () => {
            if (cyInstanceRef.current) {
                const newStyles = [...cytoscapeStyles, ...Node.getPendingStyles()];
                cyInstanceRef.current.style().fromJson(newStyles);
            }
        };

        window.addEventListener('nodeStylesUpdated', handleStyleUpdate);

        // Update graph elements function
        const updateGraphElements = () => {
            if (onGraphElementsUpdate && cyInstanceRef.current) {
                const elements = cyInstanceRef.current.elements().jsons();
                onGraphElementsUpdate(elements);
            }
        };

        // Create graph operations
        const {
            createNodeAtPosition,
            createImportedNodeAtPosition,
            createEdge,
            updateElement,
            deleteElement,
            reverseEdge,
            exportData,
            applyLayout
        } = createGraphOperations(
            cyInstanceRef,
            nodeIdCounterRef,
            edgeIdCounterRef,
            selectedNodeTypeRef,
            selectedEdgeTypeRef,
            currentSystemRef,
            onElementSelect,
            updateGraphElements
        );

        // Create graph search handler
        handleGraphSearchRef.current = createGraphSearchHandler(cyInstanceRef);

        // Create graph persistence handlers
        const { saveGraph, loadGraph } = createGraphPersistence(
            cyInstanceRef,
            currentSystemRef,
            currentSystemDataRef,
            nodeIdCounterRef,
            edgeIdCounterRef,
            isMultiSystemView,
            setIsMultiSystemView,
            updateGraphElements
        );

        // Create compound node manager
        const compoundNodeManager = createCompoundNodeManager();

        // Create system manager  
        const { handleSystemChange, loadMultipleSystems } = createSystemManager(
            cyInstanceRef,
            currentSystemRef,
            setIsMultiSystemView,
            onSystemChange,
            onGraphElementsUpdate,
            compoundNodeManager
        );
        handleSystemChangeRef.current = handleSystemChange;
        
        // Expose loadMultipleSystems function globally for NodeSearch
        window.loadMultipleSystems = loadMultipleSystems;

        // Create drop zone handler
        const { setupDropZone, cleanup: cleanupDropZone } = createGraphDropZone(
            cyRef,
            cyInstanceRef,
            createImportedNodeAtPosition,
            isEditableRef
        );

        // Setup event handlers
        setupEventHandlers(
            cyInstanceRef,
            createNodeAtPosition,
            createEdge,
            onElementSelect,
            isDraggingRef,
            dragStartNodeRef,
            tempEdgeRef,
            isEditableRef
        );

        // Clear canvas function
        const clearCanvas = () => {
            cyInstanceRef.current.elements().remove();
            nodeIdCounterRef.current = 0;
            edgeIdCounterRef.current = 0;
            onElementSelect && onElementSelect(null);
            updateGraphElements(); // Update parent state
        };



        // Make functions available to parent component
        if (onUpdateElement) onUpdateElement.current = updateElement;
        if (onDeleteElement) onDeleteElement.current = deleteElement;
        if (onReverseEdge) onReverseEdge.current = reverseEdge;
        if (onExportData) onExportData.current = exportData;
        if (onApplyLayout) onApplyLayout.current = applyLayout;
        if (onClearCanvas) onClearCanvas.current = clearCanvas;
        if (onSaveGraph) onSaveGraph.current = saveGraph;
        if (onLoadGraph) onLoadGraph.current = loadGraph;


        // Reset view function to center and fit graph
        const resetView = () => {
            if (cyInstanceRef.current) {
                cyInstanceRef.current.fit();
                cyInstanceRef.current.center();
            }
        };

        // Make reset view function available globally for LayoutSelector
        window.resetGraphView = resetView;

        // Setup drop zone
        setupDropZone();

        return () => {
            window.removeEventListener('nodeStylesUpdated', handleStyleUpdate);
            cleanupDropZone();
            // Clean up global function
            delete window.resetGraphView;
            if (cyInstanceRef.current) {
                cyInstanceRef.current.destroy();
            }
        };
    }, []);

    // Update type refs when props change
    useEffect(() => {
        selectedNodeTypeRef.current = selectedNodeType;
    }, [selectedNodeType]);

    useEffect(() => {
        selectedEdgeTypeRef.current = selectedEdgeType;
    }, [selectedEdgeType]);

    useEffect(() => {
        currentSystemRef.current = currentSystem;
    }, [currentSystem]);

    useEffect(() => {
        currentSystemDataRef.current = currentSystemData;
    }, [currentSystemData]);


    // Notify parent about multi-system view changes
    useEffect(() => {
        if (onMultiSystemViewChange) {
            onMultiSystemViewChange(isMultiSystemView);
        }
    }, [isMultiSystemView, onMultiSystemViewChange]);





    return <Paper sx={{ height: "100%", position:"relative"}}>
                <LayoutSelector 
                    onApplyLayout={(layoutId) => onApplyLayout?.current?.(layoutId)}
                    onGraphSearch={(searchValue) => handleGraphSearchRef.current?.(searchValue)}
                    onResetView={() => window.resetGraphView?.()}
                />
                <ProgressiveFailureControls 
                    isFailureAnalysisMode={isFailureAnalysisMode}
                    failureAnalysisAsset={failureAnalysisAsset}
                    currentSteps={failureAnalysisSteps}
                    onStepsChange={onStepsChange}
                    onRelationFilterChange={onRelationFilterChange}
                    onRefreshAnalysis={() => {
                        // Reload the analysis with current parameters
                        if (failureAnalysisAsset && onStepsChange) {
                            onStepsChange(failureAnalysisSteps);
                        }
                    }}
                />
                <MultiSystemNodeIndicators 
                    cyInstance={cyInstanceRef.current}
                    onSystemChange={(systemName) => handleSystemChangeRef.current?.(systemName)}
                />
                <div ref={cyRef} id="cy" style={{height: "100%", width: "100%", zIndex:0}}/>
            </Paper>;
};

export default GraphViewer;

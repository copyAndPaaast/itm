export const cytoscapeStyles = [
    {
        selector: 'node',
        style: {
            'background-color': '#ffffff',
            'border-width': 3,
            'border-color': '#666666',
            'width': 60,
            'height': 60,
            'label': 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': -10,
            'font-size': 12
        }
    },
    {
        selector: '.node-default',
        style: {
            'background-color': '#9e9e9e',
            'border-color': '#424242'
        }
    },
    {
        selector: '.node-type1',
        style: {
            'background-color': '#ffeb3b',
            'border-color': '#f57f17'
        }
    },
    {
        selector: '.node-type2',
        style: {
            'background-color': '#2196f3',
            'border-color': '#0d47a1'
        }
    },
    {
        selector: '.node-type3',
        style: {
            'background-color': '#4caf50',
            'border-color': '#1b5e20'
        }
    },
    {
        selector: 'node:selected',
        style: {
            'border-color': '#ff6b35',
            'border-width': 10
        }
    },
    {
        selector: '.temp-node',
        style: {
            'opacity': 0,
            'width': 1,
            'height': 1
        }
    },
    {
        selector: 'edge[label]',
        style: {
            'width': 3,
            'line-color': '#666666',
            'curve-style': 'straight',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#666666',
            'arrow-scale': 1.2,
            'label': 'data(label)',
            'font-size': 12,
            'text-rotation': 'autorotate',
            'text-margin-y': -10
        }
    },
    {
        selector: 'edge',
        style: {
            'width': 3,
            'line-color': '#666666',
            'curve-style': 'straight',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#666666',
            'arrow-scale': 1.2
        }
    },
    {
        selector: '.edge-default',
        style: {
            'line-color': '#666666',
            'target-arrow-color': '#666666'
        }
    },
    {
        selector: '.edge-type1',
        style: {
            'line-color': '#2196f3',
            'target-arrow-color': '#2196f3'
        }
    },
    {
        selector: '.edge-type2',
        style: {
            'line-color': '#f44336',
            'target-arrow-color': '#f44336'
        }
    },
    {
        selector: '.edge-type3',
        style: {
            'line-color': '#4caf50',
            'target-arrow-color': '#4caf50'
        }
    },
    {
        selector: 'edge:selected',
        style: {
            'line-color': '#ff6b35',
            'target-arrow-color': '#ff6b35',
            'width': 4
        }
    },
    {
        selector: '.temp-edge',
        style: {
            'width': 2,
            'line-color': '#0074cc',
            'curve-style': 'straight',
            'target-arrow-shape': 'triangle',
            'target-arrow-color': '#0074cc',
            'arrow-scale': 1.2,
            'opacity': 0.7,
            'line-style': 'dashed'
        }
    },
    // Search highlight and dim styles
    {
        selector: '.dimmed',
        style: {
            'opacity': 0.3,
            'color': '#999999',
            'background-color': '#f0f0f0',
            'border-color': '#cccccc',
            'line-color': '#cccccc',
            'target-arrow-color': '#cccccc'
        }
    },
    {
        selector: 'node.highlighted',
        style: {
            'opacity': 1,
            'border-width': 4,
            'border-color': '#ff6b35',
            'color': '#000000',
            'font-weight': 'bold'
        }
    },
    {
        selector: 'edge.highlighted',
        style: {
            'opacity': 1,
            'width': 3,
            'line-color': '#ff6b35',
            'target-arrow-color': '#ff6b35'
        }
    },
    // Multi-system node styles
    {
        selector: 'node[systemsCount > 1]',
        style: {
            'border-width': 5,
            'border-style': 'double',
            'border-color': '#4CAF50'
        }
    },
    // Compound node styles (system containers)
    {
        selector: ':parent',
        style: {
            'background-opacity': 0.1,
            'background-color': '#E3F2FD',
            'border-width': 2,
            'border-color': '#1976D2',
            'border-style': 'solid',
            'label': 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'font-size': 16,
            'font-weight': 'bold',
            'color': '#1976D2',
            'text-margin-y': 10,
            'padding': 30,
            'min-width': 200,
            'min-height': 150,
            'compound-sizing-wrt-labels': 'include'
        }
    },
    {
        selector: '.compound-node',
        style: {
            'background-opacity': 0.12,
            'background-color': '#E8F5E8',
            'border-width': 2,
            'border-color': '#388E3C',
            'border-style': 'dashed',
            'label': 'data(label)',
            'text-valign': 'top',
            'text-halign': 'center',
            'font-size': 16,
            'font-weight': 'bold',
            'color': '#2E7D32',
            'text-margin-y': 15,
            'padding': 40,
            'min-width': 250,
            'min-height': 200,
            'text-background-color': '#FFFFFF',
            'text-background-opacity': 0.9,
            'text-background-padding': 8,
            'text-border-width': 1,
            'text-border-color': '#388E3C',
            'text-border-opacity': 0.5,
            'compound-sizing-wrt-labels': 'include',
            'grabbable': true  // Explicitly make compound nodes draggable
        }
    },
    {
        selector: ':parent:selected',
        style: {
            'border-color': '#FF6B35',
            'border-width': 3
        }
    },
    {
        selector: '.compound-node:selected',
        style: {
            'border-color': '#FF6B35',
            'border-width': 4,
            'background-opacity': 0.25
        }
    },
    // Shared node indicator line styling
    {
        selector: '.shared-node-indicator',
        style: {
            'line-color': 'rgba(255, 99, 99, 0.6)',
            'line-style': 'dashed',
            'line-dash-pattern': [8, 8],
            'line-cap': 'round',
            'width': 2,
            'curve-style': 'straight',
            'source-arrow-shape': 'none',
            'target-arrow-shape': 'none',
            'label': 'shared node',
            'font-size': 10,
            'color': 'rgba(255, 99, 99, 0.8)',
            'text-background-color': 'white',
            'text-background-opacity': 0.9,
            'text-background-padding': 3,
            'text-border-width': 1,
            'text-border-color': 'rgba(255, 99, 99, 0.6)',
            'text-border-opacity': 0.8,
            'edge-text-rotation': 'autorotate',
            'z-index': 1
        }
    }
];
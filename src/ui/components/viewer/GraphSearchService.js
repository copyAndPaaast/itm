/**
 * GraphSearchService - Search and highlighting functionality for GraphViewer
 * Handles node label search with visual highlighting (grey out non-matching elements)
 */

export class GraphSearchService {
  constructor(cytoscape) {
    this.cy = cytoscape
    this.originalStyles = new Map() // Store original node/edge styles
    this.isSearchActive = false
    this.lastSearchQuery = ''
  }

  /**
   * Search for nodes by label and highlight matches
   * @param {string} query - Search query to match against node labels
   * @returns {Array} Array of matching node IDs
   */
  searchAndHighlight(query) {
    if (!query || !query.trim()) {
      this.clearHighlight()
      return []
    }

    const searchTerm = query.toLowerCase().trim()
    this.lastSearchQuery = searchTerm

    // Find matching nodes based on label
    const matchingNodes = this.cy.nodes().filter(node => {
      const label = this.getNodeLabel(node)
      return label.toLowerCase().includes(searchTerm)
    })

    const matchingNodeIds = matchingNodes.map(node => node.id())

    // Apply highlighting
    this.applySearchHighlight(matchingNodeIds)

    return matchingNodeIds
  }

  /**
   * Get node label from various possible data fields
   * @param {Object} node - Cytoscape node object
   * @returns {string} Node label
   */
  getNodeLabel(node) {
    const data = node.data()
    return data.label || data.name || data.title || data.id || 'Unnamed'
  }

  /**
   * Apply search highlighting by greying out non-matching elements
   * @param {Array} matchingNodeIds - Array of node IDs that match the search
   */
  applySearchHighlight(matchingNodeIds) {
    if (this.isSearchActive) {
      this.clearHighlight()
    }

    this.isSearchActive = true
    const matchingSet = new Set(matchingNodeIds)

    // Store original styles and apply grey styling to non-matching elements
    this.cy.elements().forEach(element => {
      const elementId = element.id()
      
      // Store original style
      this.originalStyles.set(elementId, {
        opacity: element.style('opacity'),
        backgroundColor: element.style('background-color'),
        lineColor: element.style('line-color'),
        targetArrowColor: element.style('target-arrow-color'),
        sourceArrowColor: element.style('source-arrow-color'),
        borderColor: element.style('border-color'),
        color: element.style('color')
      })

      // Determine if this element should be highlighted
      const isNode = element.isNode()
      const isEdge = element.isEdge()
      let shouldHighlight = false

      if (isNode) {
        shouldHighlight = matchingSet.has(elementId)
      } else if (isEdge) {
        // Highlight edge if either source or target node matches
        const sourceId = element.source().id()
        const targetId = element.target().id()
        shouldHighlight = matchingSet.has(sourceId) || matchingSet.has(targetId)
      }

      // Apply styling
      if (shouldHighlight) {
        // Keep original colors for matching elements but maybe enhance them
        if (isNode) {
          element.style({
            'border-width': '4px',
            'border-color': '#ff6b6b'
          })
        } else {
          element.style({
            'line-color': '#ff6b6b',
            'target-arrow-color': '#ff6b6b',
            'source-arrow-color': '#ff6b6b',
            'width': '3px'
          })
        }
      } else {
        // Grey out non-matching elements
        if (isNode) {
          element.style({
            'background-color': '#e0e0e0',
            'border-color': '#bdbdbd',
            'color': '#9e9e9e',
            'opacity': 0.4
          })
        } else {
          element.style({
            'line-color': '#e0e0e0',
            'target-arrow-color': '#e0e0e0',
            'source-arrow-color': '#e0e0e0',
            'opacity': 0.3
          })
        }
      }
    })

    // Add search highlight class for CSS-based styling if needed
    this.cy.elements().forEach(element => {
      const elementId = element.id()
      const isNode = element.isNode()
      const isEdge = element.isEdge()
      
      if (isNode && matchingSet.has(elementId)) {
        element.addClass('search-match')
      } else if (isEdge) {
        const sourceId = element.source().id()
        const targetId = element.target().id()
        if (matchingSet.has(sourceId) || matchingSet.has(targetId)) {
          element.addClass('search-match')
        } else {
          element.addClass('search-dimmed')
        }
      } else {
        element.addClass('search-dimmed')
      }
    })

    console.log(`🔍 Search highlight applied: ${matchingNodeIds.length} nodes found for "${this.lastSearchQuery}"`)
  }

  /**
   * Clear search highlighting and restore original styles
   */
  clearHighlight() {
    if (!this.isSearchActive) return

    // Restore original styles
    this.originalStyles.forEach((originalStyle, elementId) => {
      const element = this.cy.getElementById(elementId)
      if (element.length > 0) {
        element.style(originalStyle)
      }
    })

    // Remove search classes
    this.cy.elements().removeClass('search-match search-dimmed')

    // Clear stored styles
    this.originalStyles.clear()
    this.isSearchActive = false
    this.lastSearchQuery = ''

    console.log('🔍 Search highlight cleared')
  }

  /**
   * Get current search state
   * @returns {Object} Search state information
   */
  getSearchState() {
    return {
      isActive: this.isSearchActive,
      query: this.lastSearchQuery,
      matchCount: this.isSearchActive ? this.cy.elements('.search-match').length : 0
    }
  }

  /**
   * Focus on search results (fit view to matching nodes)
   * @param {Array} matchingNodeIds - Node IDs to focus on
   */
  focusSearchResults(matchingNodeIds) {
    if (matchingNodeIds.length === 0) return

    const matchingNodes = this.cy.collection()
    matchingNodeIds.forEach(id => {
      const node = this.cy.getElementById(id)
      if (node.length > 0) {
        matchingNodes.merge(node)
      }
    })

    if (matchingNodes.length > 0) {
      this.cy.fit(matchingNodes, 50) // 50px padding
      console.log(`🎯 Focused on ${matchingNodes.length} search results`)
    }
  }

  /**
   * Search for nodes and automatically focus on results
   * @param {string} query - Search query
   * @returns {Array} Matching node IDs
   */
  searchHighlightAndFocus(query) {
    const matches = this.searchAndHighlight(query)
    if (matches.length > 0) {
      this.focusSearchResults(matches)
    }
    return matches
  }

  /**
   * Get all possible node labels for autocomplete
   * @returns {Array} Array of unique node labels
   */
  getAllNodeLabels() {
    const labels = new Set()
    this.cy.nodes().forEach(node => {
      const label = this.getNodeLabel(node)
      if (label && label !== 'Unnamed') {
        labels.add(label)
      }
    })
    return Array.from(labels).sort()
  }
}

export default GraphSearchService
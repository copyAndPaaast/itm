export function createGraph() {
  return {
    nodes: [],
    edges: [],
    addNode(node) {
      this.nodes.push(node)
    },
    addEdge(edge) {
      this.edges.push(edge)
    },
    getNodes() {
      return this.nodes
    },
    getEdges() {
      return this.edges
    }
  }
}

export default createGraph
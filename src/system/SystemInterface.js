export class SystemInterface {
  
  async addNodeToSystem(nodeId, systemLabel) {
    throw new Error('addNodeToSystem method must be implemented')
  }

  async removeNodeFromSystem(nodeId, systemLabel) {
    throw new Error('removeNodeFromSystem method must be implemented')
  }

  async getSystemNodes(systemLabel) {
    throw new Error('getSystemNodes method must be implemented')
  }

  async getNodeSystems(nodeId) {
    throw new Error('getNodeSystems method must be implemented')
  }

  async listSystems() {
    throw new Error('listSystems method must be implemented')
  }

  async systemExists(systemLabel) {
    throw new Error('systemExists method must be implemented')
  }

  async getSystemStats(systemLabel) {
    throw new Error('getSystemStats method must be implemented')
  }

  async moveNodesBetweenSystems(fromSystemLabel, toSystemLabel, nodeIds = null) {
    throw new Error('moveNodesBetweenSystems method must be implemented')
  }
}
export class NodeInterface {
  
  async createNode(assetClassId, properties, title) {
    throw new Error('createNode method must be implemented')
  }

  async getNode(nodeId) {
    throw new Error('getNode method must be implemented')
  }

  async getAllNodes() {
    throw new Error('getAllNodes method must be implemented')
  }

  async getNodesByAssetClass(assetClassId) {
    throw new Error('getNodesByAssetClass method must be implemented')
  }

  async updateNode(nodeId, properties) {
    throw new Error('updateNode method must be implemented')
  }

  async deleteNode(nodeId) {
    throw new Error('deleteNode method must be implemented')
  }

  async validateNodeProperties(assetClassId, properties) {
    throw new Error('validateNodeProperties method must be implemented')
  }

  async nodeExists(nodeId) {
    throw new Error('nodeExists method must be implemented')
  }
}
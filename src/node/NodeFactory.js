import { NodeService } from './NodeService.js'
import { AssetClassService } from '../assetclass/AssetClassService.js'

export class NodeFactory {
  constructor() {
    this.nodeService = new NodeService()
    this.assetClassService = new AssetClassService()
    this.assetClassCache = new Map()
  }

  /**
   * Create a node based on AssetClass ID
   * @param {string} assetClassId - The AssetClass identifier
   * @param {string} title - Node title for display
   * @param {object} properties - Node properties according to AssetClass schema
   * @param {string[]} systems - Optional system labels for the node
   * @returns {NodeModel} Created node
   */
  async createNode(assetClassId, title, properties, systems = []) {
    // Load AssetClass definition to validate against schema
    const assetClass = await this.getAssetClass(assetClassId)
    
    // Validate properties against AssetClass schema
    const validation = assetClass.validateAllProperties(properties)
    if (!validation.valid) {
      throw new Error(`Property validation failed for AssetClass '${assetClassId}': ${validation.errors.join(', ')}`)
    }

    return await this.nodeService.createNode(assetClassId, properties, title, systems)
  }

  /**
   * Create a node based on AssetClass name (convenience method)
   * @param {string} assetClassName - The AssetClass name
   * @param {string} title - Node title for display
   * @param {object} properties - Node properties according to AssetClass schema
   * @param {string[]} systems - Optional system labels for the node
   * @returns {NodeModel} Created node
   */
  async createNodeByClassName(assetClassName, title, properties, systems = []) {
    const assetClass = await this.assetClassService.getAssetClassByName(assetClassName)
    // Cache it for future use
    this.assetClassCache.set(assetClass.classId, assetClass)
    return await this.createNode(assetClass.classId, title, properties, systems)
  }

  /**
   * Get AssetClass by ID with caching
   * @param {string} assetClassId - AssetClass ID
   * @returns {AssetClassModel} AssetClass definition
   */
  async getAssetClass(assetClassId) {
    if (this.assetClassCache.has(assetClassId)) {
      return this.assetClassCache.get(assetClassId)
    }

    const assetClass = await this.assetClassService.getAssetClass(assetClassId)
    if (!assetClass) {
      const availableClasses = await this.assetClassService.getAllAssetClasses()
      const classNames = availableClasses.map(ac => `${ac.className} (${ac.classId})`).join(', ')
      throw new Error(`AssetClass '${assetClassId}' not found. Available classes: ${classNames}`)
    }

    this.assetClassCache.set(assetClassId, assetClass)
    return assetClass
  }


  /**
   * Clear AssetClass cache (useful for testing or after AssetClass changes)
   */
  clearCache() {
    this.assetClassCache.clear()
  }

  /**
   * Get direct access to NodeService (for advanced operations)
   * @returns {NodeService} The NodeService instance
   */
  getNodeService() {
    return this.nodeService
  }

  /**
   * Get direct access to AssetClassService (for advanced operations)
   * @returns {AssetClassService} The AssetClassService instance
   */
  getAssetClassService() {
    return this.assetClassService
  }

  /**
   * Close all connections and cleanup resources
   */
  async close() {
    this.clearCache()
    await this.nodeService.close()
    await this.assetClassService.close()
  }
}
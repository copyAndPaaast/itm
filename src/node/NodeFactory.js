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
    // Determine if assetClassId is numeric ID or class name
    let assetClass
    if (typeof assetClassId === 'number' || /^\d+$/.test(assetClassId)) {
      assetClass = await this.getAssetClass({classId: assetClassId})
    } else {
      assetClass = await this.getAssetClass({className: assetClassId})
    }
    
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
   * Get AssetClass with caching using clear object parameters
   * @param {Object} params - Parameters object
   * @param {string} [params.classId] - AssetClass ID
   * @param {string} [params.className] - AssetClass name
   * @returns {AssetClassModel} AssetClass definition
   */
  async getAssetClass({classId = null, className = null}) {
    if (!classId && !className) {
      throw new Error('Either classId or className must be provided')
    }

    const cacheKey = classId || className
    if (this.assetClassCache.has(cacheKey)) {
      return this.assetClassCache.get(cacheKey)
    }

    const assetClass = await this.assetClassService.getAssetClass({classId, className})
    
    if (!assetClass) {
      const availableClasses = await this.assetClassService.getAllAssetClasses()
      const classNames = availableClasses.map(ac => `${ac.className} (${ac.classId})`).join(', ')
      throw new Error(`AssetClass '${classId || className}' not found. Available classes: ${classNames}`)
    }

    this.assetClassCache.set(cacheKey, assetClass)
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
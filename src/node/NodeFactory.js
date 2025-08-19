import { NodeService } from './NodeService.js'
import { AssetClassService } from '../assetclass/AssetClassService.js'

export class NodeFactory {
  constructor() {
    this.nodeService = new NodeService()
    this.assetClassService = new AssetClassService()
  }

  async createServerNode(title, properties) {
    const serverClass = await this.getAssetClassByName('Server')
    return await this.nodeService.createNode(serverClass.classId, properties, title)
  }

  async createApplicationNode(title, properties) {
    const appClass = await this.getAssetClassByName('Application')
    return await this.nodeService.createNode(appClass.classId, properties, title)
  }

  async createDatabaseNode(title, properties) {
    const dbClass = await this.getAssetClassByName('Database')
    return await this.nodeService.createNode(dbClass.classId, properties, title)
  }

  async createNetworkDeviceNode(title, properties) {
    const networkClass = await this.getAssetClassByName('NetworkDevice')
    return await this.nodeService.createNode(networkClass.classId, properties, title)
  }

  async createUserNode(title, properties) {
    const userClass = await this.getAssetClassByName('User')
    return await this.nodeService.createNode(userClass.classId, properties, title)
  }

  async createNodeByAssetClassName(assetClassName, title, properties) {
    const assetClass = await this.getAssetClassByName(assetClassName)
    return await this.nodeService.createNode(assetClass.classId, properties, title)
  }

  async createNodeByAssetClassId(assetClassId, title, properties) {
    return await this.nodeService.createNode(assetClassId, properties, title)
  }

  async getAssetClassByName(className) {
    const allClasses = await this.assetClassService.getAllAssetClasses()
    const assetClass = allClasses.find(ac => ac.className === className)
    
    if (!assetClass) {
      throw new Error(`AssetClass '${className}' not found. Available classes: ${allClasses.map(ac => ac.className).join(', ')}`)
    }
    
    return assetClass
  }

  async getAvailableAssetClasses() {
    return await this.assetClassService.getAllAssetClasses()
  }

  async validatePropertiesForAssetClass(assetClassName, properties) {
    const assetClass = await this.getAssetClassByName(assetClassName)
    return assetClass.validateAllProperties(properties)
  }

  getNodeService() {
    return this.nodeService
  }

  async close() {
    await this.nodeService.close()
    await this.assetClassService.close()
  }
}
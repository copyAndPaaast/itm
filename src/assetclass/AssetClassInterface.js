export class AssetClassInterface {
  
  async createAssetClass(className, propertySchema, requiredProperties = []) {
    throw new Error('createAssetClass method must be implemented')
  }

  async getAssetClass(classId) {
    throw new Error('getAssetClass method must be implemented')
  }

  async getAllAssetClasses() {
    throw new Error('getAllAssetClasses method must be implemented')
  }

  async updateAssetClass(classId, updates) {
    throw new Error('updateAssetClass method must be implemented')
  }

  async deleteAssetClass(classId) {
    throw new Error('deleteAssetClass method must be implemented')
  }

  async validateAssetClassSchema(propertySchema) {
    throw new Error('validateAssetClassSchema method must be implemented')
  }

  async assetClassExists(className) {
    throw new Error('assetClassExists method must be implemented')
  }
}
export class RelationshipInterface {
  
  async createRelationship({fromId, toId, relationshipType, properties = {}, fromType = 'Asset', toType = 'Asset'}) {
    throw new Error('createRelationship method must be implemented')
  }

  async getRelationship({relationshipId}) {
    throw new Error('getRelationship method must be implemented')
  }

  async getRelationshipsFrom({nodeId, nodeType = 'Asset'}) {
    throw new Error('getRelationshipsFrom method must be implemented')
  }

  async getRelationshipsTo({nodeId, nodeType = 'Asset'}) {
    throw new Error('getRelationshipsTo method must be implemented')
  }

  async getAllRelationships({nodeId, nodeType = 'Asset'}) {
    throw new Error('getAllRelationships method must be implemented')
  }

  async updateRelationship({relationshipId, properties}) {
    throw new Error('updateRelationship method must be implemented')
  }

  async deleteRelationship({relationshipId}) {
    throw new Error('deleteRelationship method must be implemented')
  }

  async getRelationshipsByType({relationshipType}) {
    throw new Error('getRelationshipsByType method must be implemented')
  }

  async relationshipExists({fromId, toId, relationshipType, fromType = 'Asset', toType = 'Asset'}) {
    throw new Error('relationshipExists method must be implemented')
  }
}
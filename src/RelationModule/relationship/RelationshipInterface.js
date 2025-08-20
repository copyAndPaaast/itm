export class RelationshipInterface {
  
  async createRelationship({fromId, toId, relationshipClassId, properties = {}}) {
    throw new Error('createRelationship method must be implemented')
  }

  async getRelationship({relationshipId}) {
    throw new Error('getRelationship method must be implemented')
  }

  async getRelationshipsFrom({nodeId}) {
    throw new Error('getRelationshipsFrom method must be implemented')
  }

  async getRelationshipsTo({nodeId}) {
    throw new Error('getRelationshipsTo method must be implemented')
  }

  async getAllRelationships({nodeId}) {
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

  async relationshipExists({fromId, toId, relationshipType}) {
    throw new Error('relationshipExists method must be implemented')
  }

  async getAllRelationshipTypes() {
    throw new Error('getAllRelationshipTypes method must be implemented')
  }
}
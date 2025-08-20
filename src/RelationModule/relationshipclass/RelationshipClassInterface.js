export class RelationshipClassInterface {
  
  async createRelationshipClass({relationshipClassName, relationshipType, propertySchema, requiredProperties = [], allowedFromTypes = ['Asset'], allowedToTypes = ['Asset'], description = ''}) {
    throw new Error('createRelationshipClass method must be implemented')
  }

  async getRelationshipClass({classId = null, relationshipClassName = null}) {
    throw new Error('getRelationshipClass method must be implemented')
  }

  async getAllRelationshipClasses() {
    throw new Error('getAllRelationshipClasses method must be implemented')
  }

  async getRelationshipClassByType({relationshipType}) {
    throw new Error('getRelationshipClassByType method must be implemented')
  }

  async updateRelationshipClass({classId, updates}) {
    throw new Error('updateRelationshipClass method must be implemented')
  }

  async deleteRelationshipClass({classId}) {
    throw new Error('deleteRelationshipClass method must be implemented')
  }

  async relationshipClassExists({relationshipClassName}) {
    throw new Error('relationshipClassExists method must be implemented')
  }

  async validateRelationshipProperties({classId = null, relationshipClassName = null, relationshipType = null, properties}) {
    throw new Error('validateRelationshipProperties method must be implemented')
  }

  async getRelationshipClassSchema({classId = null, relationshipClassName = null}) {
    throw new Error('getRelationshipClassSchema method must be implemented')
  }

  async validateRelationshipClassSchema({propertySchema}) {
    throw new Error('validateRelationshipClassSchema method must be implemented')
  }
}
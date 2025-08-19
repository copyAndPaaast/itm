export class GroupInterface {
  
  async createGroup({groupName, groupType, description = '', metadata = {}}) {
    throw new Error('createGroup method must be implemented')
  }

  async getGroup({groupId}) {
    throw new Error('getGroup method must be implemented')
  }

  async getGroupByName({groupName}) {
    throw new Error('getGroupByName method must be implemented')
  }

  async getAllGroups() {
    throw new Error('getAllGroups method must be implemented')
  }

  async updateGroup({groupId, updates}) {
    throw new Error('updateGroup method must be implemented')
  }

  async deleteGroup({groupId}) {
    throw new Error('deleteGroup method must be implemented')
  }

  async addNodeToGroup({nodeId, groupId}) {
    throw new Error('addNodeToGroup method must be implemented')
  }

  async removeNodeFromGroup({nodeId, groupId}) {
    throw new Error('removeNodeFromGroup method must be implemented')
  }

  async getGroupMembers({groupId}) {
    throw new Error('getGroupMembers method must be implemented')
  }

  async getNodeGroups({nodeId}) {
    throw new Error('getNodeGroups method must be implemented')
  }

  async getGroupsByType({groupType}) {
    throw new Error('getGroupsByType method must be implemented')
  }

  async getGroupsInSystem({systemLabel}) {
    throw new Error('getGroupsInSystem method must be implemented')
  }

  async getGroupsWithMembersInSystem({systemLabel}) {
    throw new Error('getGroupsWithMembersInSystem method must be implemented')  
  }

  async getSystemGroupStats({systemLabel}) {
    throw new Error('getSystemGroupStats method must be implemented')
  }
}
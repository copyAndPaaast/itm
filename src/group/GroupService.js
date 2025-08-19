import { GroupInterface } from './GroupInterface.js'
import { GroupModel } from './GroupModel.js'
import { Neo4jService } from '../database/Neo4jService.js'

export class GroupService extends GroupInterface {
  constructor() {
    super()
    this.neo4jService = Neo4jService.getInstance()
  }

  async createGroup({groupName, groupType, description = '', metadata = {}}) {
    const session = this.neo4jService.getSession()
    
    try {
      // Check if group already exists
      const exists = await this.groupExists(groupName)
      if (exists) {
        throw new Error(`Group with name '${groupName}' already exists`)
      }

      const group = new GroupModel({
        groupName,
        groupType,
        description,
        metadata
      })

      const result = await session.run(
        `
        CREATE (g:Group $properties)
        RETURN g
        `,
        { properties: group.toNeo4jProperties() }
      )

      if (result.records.length === 0) {
        throw new Error('Failed to create Group')
      }

      return GroupModel.fromNeo4jNode(result.records[0].get('g'))
    } finally {
      await session.close()
    }
  }

  async getGroup({groupId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE id(g) = $groupId
        OPTIONAL MATCH (member:Asset)-[:MEMBER_OF]->(g)
        RETURN g, collect(toString(id(member))) as members
        `,
        { groupId: this.neo4jService.int(groupId) }
      )

      if (result.records.length === 0) {
        throw new Error(`Group with ID '${groupId}' not found`)
      }

      const record = result.records[0]
      const group = GroupModel.fromNeo4jNode(record.get('g'))
      group.members = record.get('members').filter(id => id !== null)
      
      return group
    } finally {
      await session.close()
    }
  }

  async getGroupByName({groupName}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE g.groupName = $groupName
        OPTIONAL MATCH (member:Asset)-[:MEMBER_OF]->(g)
        RETURN g, collect(toString(id(member))) as members
        `,
        { groupName }
      )

      if (result.records.length === 0) {
        throw new Error(`Group with name '${groupName}' not found`)
      }

      const record = result.records[0]
      const group = GroupModel.fromNeo4jNode(record.get('g'))
      group.members = record.get('members').filter(id => id !== null)
      
      return group
    } finally {
      await session.close()
    }
  }

  async getAllGroups() {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE g.isActive = true
        OPTIONAL MATCH (member:Asset)-[:MEMBER_OF]->(g)
        RETURN g, collect(toString(id(member))) as members
        ORDER BY g.groupName
        `
      )

      return result.records.map(record => {
        const group = GroupModel.fromNeo4jNode(record.get('g'))
        group.members = record.get('members').filter(id => id !== null)
        return group
      })
    } finally {
      await session.close()
    }
  }

  async updateGroup({groupId, updates}) {
    const session = this.neo4jService.getSession()
    
    try {
      const allowedUpdates = ['groupName', 'groupType', 'description', 'metadata', 'isActive']
      const updateProperties = {}
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedUpdates.includes(key)) {
          if (key === 'metadata') {
            updateProperties[key] = JSON.stringify(value)
          } else {
            updateProperties[key] = value
          }
        }
      }

      if (Object.keys(updateProperties).length === 0) {
        throw new Error('No valid properties to update')
      }

      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE id(g) = $groupId
        SET g += $updates
        RETURN g
        `,
        { 
          groupId: this.neo4jService.int(groupId),
          updates: updateProperties
        }
      )

      if (result.records.length === 0) {
        throw new Error(`Group with ID '${groupId}' not found`)
      }

      return GroupModel.fromNeo4jNode(result.records[0].get('g'))
    } finally {
      await session.close()
    }
  }

  async deleteGroup({groupId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE id(g) = $groupId
        DETACH DELETE g
        RETURN count(g) as deletedCount
        `,
        { groupId: this.neo4jService.int(groupId) }
      )

      return result.records[0]?.get('deletedCount')?.toNumber() > 0
    } finally {
      await session.close()
    }
  }

  async addNodeToGroup({nodeId, groupId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (n:Asset), (g:Group)
        WHERE id(n) = $nodeId AND id(g) = $groupId
        MERGE (n)-[:MEMBER_OF]->(g)
        RETURN n, g
        `,
        { 
          nodeId: this.neo4jService.int(nodeId),
          groupId: this.neo4jService.int(groupId)
        }
      )

      if (result.records.length === 0) {
        throw new Error(`Node '${nodeId}' or Group '${groupId}' not found`)
      }

      return true
    } finally {
      await session.close()
    }
  }

  async removeNodeFromGroup({nodeId, groupId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (n:Asset)-[r:MEMBER_OF]->(g:Group)
        WHERE id(n) = $nodeId AND id(g) = $groupId
        DELETE r
        RETURN count(r) as removedCount
        `,
        { 
          nodeId: this.neo4jService.int(nodeId),
          groupId: this.neo4jService.int(groupId)
        }
      )

      return result.records[0]?.get('removedCount')?.toNumber() > 0
    } finally {
      await session.close()
    }
  }

  async getGroupMembers({groupId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (member:Asset)-[:MEMBER_OF]->(g:Group)
        WHERE id(g) = $groupId
        RETURN member
        ORDER BY member.title
        `,
        { groupId: this.neo4jService.int(groupId) }
      )

      // Import NodeModel to convert results
      const { NodeModel } = await import('../node/NodeModel.js')
      return result.records.map(record => 
        NodeModel.fromNeo4jNode(record.get('member'))
      )
    } finally {
      await session.close()
    }
  }

  async getNodeGroups({nodeId}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (n:Asset)-[:MEMBER_OF]->(g:Group)
        WHERE id(n) = $nodeId
        RETURN g
        ORDER BY g.groupName
        `,
        { nodeId: this.neo4jService.int(nodeId) }
      )

      return result.records.map(record => 
        GroupModel.fromNeo4jNode(record.get('g'))
      )
    } finally {
      await session.close()
    }
  }

  async getGroupsByType({groupType}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE g.groupType = $groupType AND g.isActive = true
        OPTIONAL MATCH (member:Asset)-[:MEMBER_OF]->(g)
        RETURN g, collect(toString(id(member))) as members
        ORDER BY g.groupName
        `,
        { groupType }
      )

      return result.records.map(record => {
        const group = GroupModel.fromNeo4jNode(record.get('g'))
        group.members = record.get('members').filter(id => id !== null)
        return group
      })
    } finally {
      await session.close()
    }
  }

  async groupExists(groupName) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE g.groupName = $groupName
        RETURN count(g) > 0 as exists
        `,
        { groupName }
      )

      return result.records[0]?.get('exists') || false
    } finally {
      await session.close()
    }
  }

  async getGroupsInSystem({systemLabel}) {
    const session = this.neo4jService.getSession()
    
    try {
      // Find groups that have the system label themselves
      const result = await session.run(
        `
        MATCH (g:Group:${systemLabel})
        WHERE g.isActive = true
        OPTIONAL MATCH (member:Asset)-[:MEMBER_OF]->(g)
        RETURN g, collect(toString(id(member))) as members
        ORDER BY g.groupName
        `
      )

      return result.records.map(record => {
        const group = GroupModel.fromNeo4jNode(record.get('g'))
        group.members = record.get('members').filter(id => id !== null)
        return group
      })
    } finally {
      await session.close()
    }
  }

  async getGroupsWithMembersInSystem({systemLabel}) {
    const session = this.neo4jService.getSession()
    
    try {
      // Find groups that have at least one member in the specified system
      const result = await session.run(
        `
        MATCH (g:Group)
        WHERE g.isActive = true
        WITH g
        MATCH (member:Asset:${systemLabel})-[:MEMBER_OF]->(g)
        WITH g, collect(toString(id(member))) as systemMembers
        OPTIONAL MATCH (allMembers:Asset)-[:MEMBER_OF]->(g)
        RETURN g, 
               systemMembers,
               collect(toString(id(allMembers))) as allMembers,
               size(systemMembers) as systemMemberCount,
               size(collect(allMembers)) as totalMemberCount
        ORDER BY g.groupName
        `
      )

      return result.records.map(record => {
        const group = GroupModel.fromNeo4jNode(record.get('g'))
        group.members = record.get('allMembers').filter(id => id !== null)
        
        // Add system-specific metadata
        group.systemMembers = record.get('systemMembers').filter(id => id !== null)
        group.systemMemberCount = record.get('systemMemberCount').toNumber()
        group.totalMemberCount = record.get('totalMemberCount').toNumber()
        
        return group
      })
    } finally {
      await session.close()
    }
  }

  async getSystemGroupStats({systemLabel}) {
    const session = this.neo4jService.getSession()
    
    try {
      const result = await session.run(
        `
        // Groups directly in system  
        MATCH (directGroups:Group:${systemLabel})
        WHERE directGroups.isActive = true
        WITH count(directGroups) as directGroupCount
        
        // Groups with members in system
        MATCH (g:Group)
        WHERE g.isActive = true
        OPTIONAL MATCH (systemMember:Asset:${systemLabel})-[:MEMBER_OF]->(g)
        WITH directGroupCount, g, count(systemMember) as systemMemberCount
        WHERE systemMemberCount > 0
        WITH directGroupCount, count(g) as groupsWithMembersCount,
             collect({
               groupName: g.groupName,
               groupType: g.groupType, 
               systemMemberCount: systemMemberCount
             }) as groupDetails
        
        // Overall system stats
        MATCH (systemAssets:Asset:${systemLabel})
        WITH directGroupCount, groupsWithMembersCount, groupDetails, count(systemAssets) as totalSystemAssets
        
        MATCH (groupedSystemAssets:Asset:${systemLabel})-[:MEMBER_OF]->(:Group)
        WITH directGroupCount, groupsWithMembersCount, groupDetails, totalSystemAssets,
             count(DISTINCT groupedSystemAssets) as groupedSystemAssets
        
        RETURN {
          systemLabel: '${systemLabel}',
          directGroups: directGroupCount,
          groupsWithMembers: groupsWithMembersCount,
          totalSystemAssets: totalSystemAssets,
          groupedSystemAssets: groupedSystemAssets,
          ungroupedSystemAssets: totalSystemAssets - groupedSystemAssets,
          groupDetails: groupDetails
        } as stats
        `
      )

      return result.records[0]?.get('stats') || {
        systemLabel,
        directGroups: 0,
        groupsWithMembers: 0,
        totalSystemAssets: 0,
        groupedSystemAssets: 0,
        ungroupedSystemAssets: 0,
        groupDetails: []
      }
    } finally {
      await session.close()
    }
  }

  // Advanced method: Get groups by multiple criteria
  async getGroupsByCriteria({systemLabel = null, groupType = null, hasMembers = null}) {
    const session = this.neo4jService.getSession()
    
    try {
      let whereConditions = ['g.isActive = true']
      let matchPattern = '(g:Group)'
      
      // Add system label to match pattern if specified
      if (systemLabel) {
        matchPattern = `(g:Group:${systemLabel})`
      }
      
      // Add group type condition
      if (groupType) {
        whereConditions.push('g.groupType = $groupType')
      }
      
      // Add member count condition  
      if (hasMembers !== null) {
        if (hasMembers) {
          whereConditions.push('size((g)<-[:MEMBER_OF]-()) > 0')
        } else {
          whereConditions.push('size((g)<-[:MEMBER_OF]-()) = 0')
        }
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : ''
      
      const result = await session.run(
        `
        MATCH ${matchPattern}
        ${whereClause}
        OPTIONAL MATCH (member:Asset)-[:MEMBER_OF]->(g)
        RETURN g, collect(toString(id(member))) as members
        ORDER BY g.groupName
        `,
        { groupType }
      )

      return result.records.map(record => {
        const group = GroupModel.fromNeo4jNode(record.get('g'))
        group.members = record.get('members').filter(id => id !== null)
        return group
      })
    } finally {
      await session.close()
    }
  }

  async close() {
    // Neo4j connection is managed by Neo4jService singleton
    // No resources to clean up in GroupService
  }
}
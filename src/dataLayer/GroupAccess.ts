import {Group} from '../models/Group'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk'

export class GroupAccess {
  constructor(
    private readonly docClient:DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly groupsTable = process.env.GROUPS_TABLE) {}

    async getAllGroups(): Promise<Group[]> {
      console.log('getting all groups')
      const result = await this.docClient.scan({
        TableName: this.groupsTable
      }).promise()

      const items = result.Items;
      return items as Group[]
    }

    async createGroup(group: Group) :Promise<Group> {
      console.log(`creating group ${group.id}`)

      await this.docClient.put({
        TableName:this.groupsTable,
        Item: group
      }).promise()

      return group
    } 

}
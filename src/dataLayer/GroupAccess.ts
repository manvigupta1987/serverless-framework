import {Group} from '../models/Group'
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

export class GroupAccess {
  constructor(
    private readonly docClient:DocumentClient = createDynmoDbClient(),
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

function createDynmoDbClient() {
  if(process.env.IS_OFFLINE) {
    console.log('creating dynamo db client locally') 
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }
  return new XAWS.DynamoDB.DocumentClient()
} 
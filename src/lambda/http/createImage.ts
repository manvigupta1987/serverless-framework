import { APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'
import * as middy from 'middy'
import {cors} from 'middy/middlewares'

import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)
const docClient = new XAWS.DynamoDB.DocumentClient();
const imagesTable = process.env.IMAGES_TABLE;
const groupsTable = process.env.GROUPS_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

const s3 = new AWS.S3({ signatureVersion: 'v4' })

export const handler = middy(async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);

  const timestamp = new Date().toISOString()
  const groupId = event.pathParameters.groupId
  const validGroupId = await groupExists(groupId)
  if(!validGroupId) {
    return {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin": "*"
      },
      body: JSON.stringify({ error: 'Group doesnt exist' })
    }
  }
  const imageId = uuid.v4();
  const parseBody = JSON.parse(event.body);
  const url = getUploadUrl(imageId)

  const newItem = {
    timestamp,
    groupId,
    imageId,
    ...parseBody,
    imageUrl: `https://${bucketName}.s3.amazonaws.com/${imageId}`
  };

  await docClient.put({ TableName: imagesTable, Item: newItem }).promise();

  // Return result
  return {
    statusCode: 201,
    body: JSON.stringify({ newItem, 
            uploadUrl: url })
  };
});

async function groupExists(groupId: String) {
  const result = await docClient.get({
    TableName: groupsTable,
    Key : {
      id: groupId
    }
  }).promise()
  return !!result.Item
}

function getUploadUrl(imageId: string) {
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: imageId,
    Expires: 300
  })
}

handler.use(cors({
  credentials: true
}))
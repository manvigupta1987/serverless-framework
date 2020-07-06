import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import * as uuid from 'uuid'

const docClient = new AWS.DynamoDB.DocumentClient();
const imagesTable = process.env.IMAGES_TABLE;
const groupsTable = process.env.GROUPS_TABLE;
const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;

const s3 = new AWS.S3({ signatureVersion: 'v4' })

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
    headers: {
      "Access-Control-Allow-Origin": "*",
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({ newItem, 
            uploadUrl: url })
  };
};

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
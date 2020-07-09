import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import 'source-map-support/register'
import {createGroup} from '../../businessLogic/groups';
import { CreateGroupRequest } from '../../requests/createGroupRequest';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("Processing event: ", event);
  
  const newGroup:CreateGroupRequest = JSON.parse(event.body)
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  
  const newItem = await createGroup(newGroup, jwtToken)

  // Return result
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({ newItem })
  };
};

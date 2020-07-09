import 'source-map-support/register'
import {CustomAuthorizerHandler,CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'

export const handler: CustomAuthorizerHandler = async(event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    
    verifyToken(event.authorizationToken)
    console.log('User was authorized')

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User was not authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string) {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  if(token !== '123') {
    throw new Error ('Invalid Token')
  }

  
  // return verify(token, secret) as JwtToken
}




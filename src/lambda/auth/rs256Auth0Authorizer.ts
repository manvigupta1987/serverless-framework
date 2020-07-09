import 'source-map-support/register'
import {CustomAuthorizerHandler,CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'

import {verify} from 'jsonwebtoken'
import {JwtToken} from '../../auth/jwtToken'

const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJBDf1b0QaW8/TMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi01Y3pueGt4Mi51cy5hdXRoMC5jb20wHhcNMjAwNzA5MDgxODA0WhcN
MzQwMzE4MDgxODA0WjAkMSIwIAYDVQQDExlkZXYtNWN6bnhreDIudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA4JWPpX4enGC1XY9g
6CYI4iZgb4sE0JWe/YnGR/8lV4H0RvriSCM7e58oEwVX1MS8s5RzRotN9WSDpP3I
9pNXtL+85555sPzl6OuYRc4mMJ0EQHBuYubsB05uGpCxaHSLoGVPRiCyISxjiAd2
pRBAMDyFJ85zRYFAjVkktaBbY3ffMBjaX3fh/DzkIGxQQcG5E1gOz5EUfQSNZ/+s
w1LtJyjjs5EuH2AFhVpB400+jVio8wZUPODsYZQRVSM/riASqhrWjJhCZ/lfT7Bi
zCRYqxNMzHcVrtqoutUUMAhperkUk1eBvPq5nctQjumSecByXNM01G0eZChh60hS
UA7XGwIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBQKMBRoVcpq
wpgZ5NkK8vt3hisvGTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ALpDe9EgvXdNHvwJFCsEEZQYJvrQzSW0BhMaY6U/bwJp0jIffKpQ0OStx3Oa/vAM
uFCShS/aIag3NhMo61kV0szsJNHrVvQH3vREM2/hOjm1Wpqwoy/hL7ktDyClUK5O
EgpgYlQty/05EZA2dz918F4huQIWrkLrHRf8mp8BVnyKvZakI12jQ4x4aiHKHr+W
WTQd///jhDiJYfuHpUGPIifXKyqpYt1cErshX0RnrYBrhim+Mw4QumAUtUon0JQP
zFRy4zwjbkpzWSW+RLBf8zsdjZpkr0gG/MwAhFQFelOqCkHl4jvheqdAxc0q0TGP
gRAR2Vvg8snrViMsDu90VQ8=
-----END CERTIFICATE-----`

export const handler: CustomAuthorizerHandler = async(event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    
    const jwtToken = await verifyToken(event.authorizationToken)
    console.log('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
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

async function verifyToken(authHeader: string): Promise<JwtToken> {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}
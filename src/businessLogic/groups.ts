import { GroupAccess } from "../dataLayer/GroupAccess";
import { CreateGroupRequest } from "../requests/createGroupRequest";
import { Group } from "../models/group";
import { getUserId } from "../auth/utils";

import * as uuid from 'uuid'


const groupAccess = new GroupAccess()
export async function getAllGroups(): Promise<Group[]> {
  return groupAccess.getAllGroups()
}

export async function createGroup(
            createGroupRequest:CreateGroupRequest,
            jwtToken:string):Promise<Group> {

    const itemId = uuid.v4()
    const userId = getUserId(jwtToken)

    const newItem:Group = {
      id: itemId,
      userId: userId,
      name: createGroupRequest.name,
      description: createGroupRequest.description,
      timestamp: new Date().toISOString()
    }
    return await groupAccess.createGroup(newItem)
  }
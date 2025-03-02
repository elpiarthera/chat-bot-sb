import { UserGroupCreation, UserGroupUpdate } from "@/lib/types/groups"

export const fetchUserGroups = async () => {
  return fetch("/api/manage/admin/user-group", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
}

export const createUserGroup = async (group: UserGroupCreation) => {
  return fetch("/api/manage/admin/user-group", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(group)
  })
}

export const updateUserGroup = async (
  groupId: number,
  update: UserGroupUpdate
) => {
  return fetch(`/api/manage/admin/user-group/${groupId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(update)
  })
}

export const deleteUserGroup = async (groupId: number) => {
  return fetch(`/api/manage/admin/user-group/${groupId}`, {
    method: "DELETE"
  })
}

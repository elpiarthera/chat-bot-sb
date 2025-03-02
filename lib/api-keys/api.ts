import { APIKey, APIKeyArgs } from "@/lib/types/api-keys"

export async function createApiKey(args: APIKeyArgs): Promise<Response> {
  return fetch("/api/admin/api-key", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args)
  })
}

export async function updateApiKey(
  keyId: number,
  args: APIKeyArgs
): Promise<Response> {
  return fetch(`/api/admin/api-key/${keyId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(args)
  })
}

export async function regenerateApiKey(key: APIKey): Promise<Response> {
  return fetch(`/api/admin/api-key/${key.api_key_id}/regenerate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
}

export async function deleteApiKey(keyId: number): Promise<Response> {
  return fetch(`/api/admin/api-key/${keyId}`, {
    method: "DELETE"
  })
}

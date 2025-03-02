/**
 * Clone an existing persona/assistant
 * 
 * Creates a copy of an existing assistant with all its settings,
 * including tools, knowledge configuration, and prompts.
 * 
 * @param personaId - The ID of the persona to clone
 * @returns Promise with the response from the API
 */
export async function clonePersona(personaId: number): Promise<Response> {
  return fetch(`/api/persona/${personaId}/clone`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
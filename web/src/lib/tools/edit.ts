import { MethodSpec, ToolSnapshot } from "./interfaces";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Validates a tool definition
 */
export async function validateToolDefinition({
  definition,
}: {
  definition: any;
}): Promise<ApiResponse<MethodSpec[]>> {
  try {
    const response = await fetch("/api/admin/tools/validate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ definition }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
}

/**
 * Creates a new custom tool
 */
export async function createCustomTool(toolData: {
  name: string;
  description: string;
  definition: any;
  custom_headers: { key: string; value: string }[];
  passthrough_auth: boolean;
}): Promise<ApiResponse<ToolSnapshot>> {
  try {
    const response = await fetch("/api/admin/tools", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toolData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
}

/**
 * Updates an existing custom tool
 */
export async function updateCustomTool(
  toolId: number,
  toolData: {
    name: string;
    description: string;
    definition: any;
    custom_headers: { key: string; value: string }[];
    passthrough_auth: boolean;
  }
): Promise<ApiResponse<ToolSnapshot>> {
  try {
    const response = await fetch(`/api/admin/tools/${toolId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(toolData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText };
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: String(error) };
  }
}

/**
 * Deletes a custom tool
 */
export async function deleteCustomTool(
  toolId: number
): Promise<ApiResponse<boolean>> {
  try {
    const response = await fetch(`/api/admin/tools/${toolId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { error: errorText };
    }

    return { data: true };
  } catch (error) {
    return { error: String(error) };
  }
}
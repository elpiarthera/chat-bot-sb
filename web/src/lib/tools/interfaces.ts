export interface ToolSnapshot {
  id: number;
  name: string;
  description: string;
  definition: any;
  in_code_tool_id: string | null;
  custom_headers?: { key: string; value: string }[];
  passthrough_auth?: boolean;
}

export interface MethodSpec {
  name: string;
  summary: string;
  method: string;
  path: string;
} 
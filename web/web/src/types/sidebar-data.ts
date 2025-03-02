// Define Tables type locally since there's an issue with the import
type Tables<T extends string> = any;

export type DataListType =
  | Tables<"collections">[]
  | Tables<"chats">[]
  | Tables<"presets">[]
  | Tables<"prompts">[]
  | Tables<"files">[]
  | Tables<"assistants">[]
  | Tables<"tools">[]
  | Tables<"models">[];

export type DataItemType =
  | Tables<"collections">
  | Tables<"chats">
  | Tables<"presets">
  | Tables<"prompts">
  | Tables<"files">
  | Tables<"assistants">
  | Tables<"tools">
  | Tables<"models">;
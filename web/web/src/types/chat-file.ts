export interface ChatFile {
  id: string;
  name: string;
  type: string;
  description: string;
  file: File | null;
} 
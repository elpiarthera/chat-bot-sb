declare module "@mistralai/mistralai" {
  export interface ChatMessage {
    role: string
    content: string
  }

  export interface ChatOptions {
    model: string
    messages: ChatMessage[]
    temperature?: number
    stream?: boolean
  }

  export interface StreamChunk {
    type: string
    text?: string
  }

  export default class MistralClient {
    constructor(apiKey: string)
    chat(options: ChatOptions): AsyncIterableIterator<StreamChunk>
  }
}

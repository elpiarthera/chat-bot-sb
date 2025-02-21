declare module "@mistralai/mistralai" {
  interface ChatMessage {
    role: string
    content: string
  }

  interface ChatOptions {
    model: string
    messages: ChatMessage[]
    temperature?: number
    max_tokens?: number
    stream?: boolean
  }

  class MistralClient {
    constructor(config: { apiKey: string })
    chat(options: ChatOptions): Promise<Response>
  }

  export default MistralClient
}

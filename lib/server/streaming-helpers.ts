import { Stream } from "openai/streaming"
import { ChatCompletionChunk } from "openai/resources/chat/completions"

export function createStream(response: Response | Stream<ChatCompletionChunk>) {
  // If it's already a Response object
  if (response instanceof Response) {
    if (!response.body) {
      throw new Error("Response body is null")
    }

    const reader = response.body.getReader()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(value)
          }
        } finally {
          controller.close()
          reader.releaseLock()
        }
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    })
  }

  // If it's a Stream from OpenAI
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of response) {
        // Convert the chunk to a string and encode it
        const text = JSON.stringify(chunk)
        const encoded = new TextEncoder().encode(text)
        controller.enqueue(encoded)
      }
      controller.close()
    }
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive"
    }
  })
}

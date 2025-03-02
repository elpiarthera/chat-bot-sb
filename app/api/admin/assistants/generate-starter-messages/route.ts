import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import OpenAI from "openai"

// Initialize OpenAI client
// Note: This is just one implementation example, you could use any LLM provider
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(cookies())
    // Verify admin access
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }

    // Get request body
    const body = await req.json()
    // Validate required fields
    if (!body.prompt || !body.name || !body.description) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: prompt, name, and description are required"
        },
        { status: 400 }
      )
    }

    // Generate starter messages using AI
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that creates example starter messages for a conversational AI. Generate 3-4 engaging, diverse starter messages that users might send to the AI. These should be natural, conversational, and showcase different capabilities. Respond in JSON format with an array of messages."
          },
          {
            role: "user",
            content: `Create 3-4 example starter messages for an AI assistant with the following details: Name: ${body.name}
Description: ${body.description}
System Prompt: ${body.prompt}

The starter messages should be natural things a user might ask this assistant. Keep each message under 100 characters if possible. Respond with a JSON array containing only the message strings.`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })

      // Parse response
      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error("Failed to generate starter messages")
      }

      let parsedContent
      try {
        parsedContent = JSON.parse(content)
      } catch (e) {
        throw new Error("Failed to parse AI response")
      }

      // Format messages for response
      const messages = Array.isArray(parsedContent.messages)
        ? parsedContent.messages.map(
            (message: { content: string; role?: string }) => ({ message })
          )
        : []

      // Ensure we have at least one message
      if (messages.length === 0) {
        messages.push({ message: "Hi! How can you help me?" })
      }

      return NextResponse.json({ messages })
    } catch (aiError) {
      console.error("Error generating starter messages with AI:", aiError)

      // Fallback to default starter messages
      const defaultMessages = [
        { message: "Hi! How can you help me?" },
        { message: `Can you tell me more about ${body.name}?` },
        { message: "What kinds of questions can I ask you?" }
      ]

      return NextResponse.json({ messages: defaultMessages })
    }
  } catch (error) {
    console.error("Error in generate starter messages API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

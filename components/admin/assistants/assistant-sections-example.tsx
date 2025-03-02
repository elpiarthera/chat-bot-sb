"use client"

import React from "react"
import { HidableSection } from "./hidable-section"
import { CollapsibleSection } from "./collapsible-section"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"

/**
 * This is an example component showing how to use both HidableSection and CollapsibleSection
 * in an assistant form or settings page.
 */
export function AssistantSectionsExample() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Assistant Configuration Examples</h1>
      <p className="text-muted-foreground">
        This page demonstrates different ways to organize assistant
        configuration sections using collapsible components.
      </p>

      {/* Example 1: Basic Configuration with HidableSection */}
      <HidableSection sectionTitle="Basic Configuration" defaultHidden={false}>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Assistant Name</Label>
              <Input
                id="name"
                placeholder="Enter assistant name"
                defaultValue="Customer Support Assistant"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select defaultValue="gpt-4o">
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this assistant does"
              defaultValue="A helpful customer support assistant that can answer product questions and handle support tickets."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is_visible" defaultChecked />
            <Label htmlFor="is_visible">Visible to users</Label>
          </div>
        </div>
      </HidableSection>

      <Separator />

      {/* Example 2: System Prompt with CollapsibleSection */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">System Prompt</h2>
        <Textarea
          rows={4}
          placeholder="Enter system prompt"
          defaultValue="You are a helpful customer support assistant. Be friendly and concise in your responses. Use the provided documentation to answer customer questions accurately."
        />

        <CollapsibleSection prompt="Advanced Prompt Settings">
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <Input
                  id="temperature"
                  type="number"
                  min="0"
                  max="2"
                  step="0.1"
                  defaultValue="0.7"
                />
                <p className="text-muted-foreground text-xs">
                  Controls randomness: lower values are more focused, higher
                  values more creative.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context_length">Context Length</Label>
                <Input
                  id="context_length"
                  type="number"
                  min="1000"
                  max="32000"
                  step="1000"
                  defaultValue="4000"
                />
                <p className="text-muted-foreground text-xs">
                  Maximum context window size for this assistant.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="include_profile" />
              <Label htmlFor="include_profile">
                Include user profile context
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="include_instructions" />
              <Label htmlFor="include_instructions">
                Include workspace instructions
              </Label>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      <Separator />

      {/* Example 3: Nested Sections */}
      <HidableSection sectionTitle="Knowledge Sources" defaultHidden={true}>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Select files and collections that this assistant can access during
            conversations.
          </p>

          <Card>
            <CardHeader>
              <CardTitle>Selected Knowledge Sources</CardTitle>
              <CardDescription>
                These sources will be available to the assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border px-4 py-2">
                  <span>Product Documentation</span>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
                <div className="flex items-center justify-between rounded-md border px-4 py-2">
                  <span>FAQ Collection</span>
                  <Button variant="outline" size="sm">
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Add Source</Button>
            </CardFooter>
          </Card>

          <CollapsibleSection prompt="Embedding Settings">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="embedding_provider">Embeddings Provider</Label>
                <Select defaultValue="openai">
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="local">Local Embeddings</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="use_retrieval" defaultChecked />
                <Label htmlFor="use_retrieval">
                  Enable retrieval for all conversations
                </Label>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </HidableSection>
    </div>
  )
}

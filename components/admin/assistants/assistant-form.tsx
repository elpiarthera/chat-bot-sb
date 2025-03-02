"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tables } from "@/supabase/types"
// Commenting out the missing import - we'll need to create this component
// import { DocumentSelectTabs } from "@/components/document-select/document-select-tabs";
import {
  ASSISTANT_TEMPLATES,
  getModelOptions,
  getModelProviders
} from "@/lib/assistants/utils"
import { StarterMessagesList } from "@/components/admin/assistants/starter-message-list"
import { StarterMessage, AssistantLabel } from "@/lib/assistants/interfaces"
import { toast } from "sonner"
import { X } from "lucide-react"

// Temporary placeholder for the missing DocumentSelectTabs component
// This should be replaced with the actual component when available
interface DocumentSelectTabsProps {
  selectedFileIds: string[]
  selectedCollectionIds: string[]
  onFileIdsChange: (ids: string[]) => void
  onCollectionIdsChange: (ids: string[]) => void
}

function DocumentSelectTabs({
  selectedFileIds,
  selectedCollectionIds,
  onFileIdsChange,
  onCollectionIdsChange
}: DocumentSelectTabsProps) {
  return (
    <div className="border rounded-md p-4">
      <p className="text-sm text-muted-foreground mb-2">
        Document selection component placeholder. This component needs to be
        implemented.
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onFileIdsChange([...selectedFileIds, `file-${Date.now()}`])
          }
        >
          Add File
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            onCollectionIdsChange([
              ...selectedCollectionIds,
              `collection-${Date.now()}`
            ])
          }
        >
          Add Collection
        </Button>
      </div>
    </div>
  )
}

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Name is required."
    })
    .max(100, {
      message: "Name must be less than 100 characters."
    }),
  description: z
    .string()
    .min(1, {
      message: "Description is required."
    })
    .max(500, {
      message: "Description must be less than 500 characters."
    }),
  model: z.string().min(1, {
    message: "Model is required."
  }),
  prompt: z
    .string()
    .min(1, {
      message: "System prompt is required."
    })
    .max(100000, {
      message: "System prompt must be less than 100,000 characters."
    }),
  temperature: z.number().min(0).max(2),
  context_length: z.number().min(512).max(32000),
  include_profile_context: z.boolean().default(false),
  include_workspace_instructions: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  is_default: z.boolean().default(false),
  sharing: z.string().default("private"),
  embeddings_provider: z.string().default("openai"),
  image_path: z.string().default("")
})

export type AssistantFormValues = z.infer<typeof formSchema>

interface AssistantFormProps {
  initialData?: Tables<"assistants"> & {
    starter_messages?: StarterMessage[]
    labels?: AssistantLabel[]
  }
  labels?: AssistantLabel[]
  onSuccess?: (data: Tables<"assistants">) => void
}

export function AssistantForm({
  initialData,
  labels = [],
  onSuccess
}: AssistantFormProps): JSX.Element {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [starterMessages, setStarterMessages] = useState<StarterMessage[]>(
    initialData?.starter_messages || [{ message: "" }]
  )
  const [selectedLabels, setSelectedLabels] = useState<AssistantLabel[]>(
    initialData?.labels || []
  )
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [modelProvider, setModelProvider] = useState("openai")

  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      model: "gpt-4o",
      prompt: ASSISTANT_TEMPLATES.general,
      temperature: 0.7,
      context_length: 4000,
      include_profile_context: false,
      include_workspace_instructions: false,
      is_visible: true,
      is_default: false,
      sharing: "private",
      embeddings_provider: "openai",
      image_path: ""
    }
  })

  // Update the model options based on the selected provider
  useEffect(() => {
    const currentModel = form.getValues("model")
    const modelOptions = getModelOptions(modelProvider)
    // If current model is not in the options for the selected provider, reset to first option
    if (
      modelOptions.length > 0 &&
      !modelOptions.some(option => option.value === currentModel)
    ) {
      form.setValue("model", modelOptions[0].value)
    }
  }, [modelProvider, form])

  const onSubmit = async (values: AssistantFormValues) => {
    try {
      setIsLoading(true)

      const payload = {
        ...values,
        user_id: "current-user", // This should be replaced with the actual user ID in a real implementation
        starter_messages: starterMessages.filter(
          msg => msg.message.trim() !== ""
        ),
        document_sets: [...selectedFiles, ...selectedCollections],
        tools: selectedTools,
        labels: selectedLabels.map(label => label.id)
      }

      let response

      if (initialData) {
        // Update existing assistant
        response = await fetch(`/api/admin/assistants/${initialData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
      } else {
        // Create new assistant
        response = await fetch("/api/admin/assistants", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save assistant")
      }

      const data = await response.json()
      toast.success(initialData ? "Assistant updated" : "Assistant created")

      if (onSuccess) {
        onSuccess(data)
      } else {
        router.push("/admin/assistants")
        router.refresh()
      }
    } catch (error) {
      console.error("Error saving assistant:", error)
      toast.error("Failed to save assistant")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateStarterMessages = async () => {
    try {
      setIsLoading(true)

      // This would be connected to an AI generation endpoint
      const response = await fetch(
        "/api/admin/assistants/generate-starter-messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            prompt: form.getValues("prompt"),
            name: form.getValues("name"),
            description: form.getValues("description"),
            model: form.getValues("model")
          })
        }
      )

      if (!response.ok) {
        throw new Error("Failed to generate starter messages")
      }

      const data = await response.json()
      setStarterMessages(data.messages)
      toast.success("Starter messages generated")
    } catch (error) {
      console.error("Error generating starter messages:", error)
      toast.error("Failed to generate starter messages")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddLabel = (label: AssistantLabel) => {
    if (!selectedLabels.some(l => l.id === label.id)) {
      setSelectedLabels([...selectedLabels, label])
    }
  }

  const handleRemoveLabel = (labelId: string) => {
    setSelectedLabels(selectedLabels.filter(label => label.id !== labelId))
  }

  return (
    <div className="space-y-6">
      <div />
      <Tabs
        defaultValue="basic"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid grid-cols-5 sm:grid-cols-5 lg:w-auto">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        <TabsTrigger value="knowledge">Knowledge</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
        <TabsTrigger value="interactions">Interactions</TabsTrigger>
      </Tabs>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mt-8">
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="My Assistant" {...field} />
                    </FormControl>
                    <FormDescription>
                      A name for your assistant.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A helpful assistant that..."
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormDescription>
                      A short description explaining what this assistant does.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <FormLabel>Model Provider</FormLabel>
                  <Select
                    value={modelProvider}
                    onValueChange={setModelProvider}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {getModelProviders().map(provider => (
                        <SelectItem key={provider.value} value={provider.value}>
                          {provider.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    The AI provider for this assistant.
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {getModelOptions(modelProvider).map(model => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The AI model this assistant will use.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        field.onChange(ASSISTANT_TEMPLATES.general)
                      }
                      className="col-span-1"
                    >
                      General Template
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        field.onChange(ASSISTANT_TEMPLATES.customer_support)
                      }
                      className="col-span-1"
                    >
                      Customer Support
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        field.onChange(ASSISTANT_TEMPLATES.technical)
                      }
                      className="col-span-1"
                    >
                      Technical
                    </Button>
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="You are a helpful assistant..."
                      {...field}
                      rows={12}
                      className="font-mono text-sm"
                    />
                  </FormControl>
                  <FormDescription>
                    Instructions that define the behavior and capabilities of
                    the assistant.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          <TabsContent value="advanced" className="space-y-4">
            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature: {field.value.toFixed(1)}</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={2}
                        step={0.1}
                        value={[field.value]}
                        onValueChange={value => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower values produce more consistent outputs, higher
                      values more creative ones.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="context_length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context Length: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1000}
                        max={32000}
                        step={1000}
                        value={[field.value]}
                        onValueChange={value => field.onChange(value[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum context length in tokens. Higher values allow more
                      conversation history.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="sharing"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sharing</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select sharing option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="workspace">Workspace</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Controls who can access this assistant.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="embeddings_provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Embeddings Provider</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="local">Local</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Provider for document embeddings.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="include_profile_context"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          User Profile Context
                        </FormLabel>
                        <FormDescription>
                          Include user profile information in conversations.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="include_workspace_instructions"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Workspace Instructions
                        </FormLabel>
                        <FormDescription>
                          Include workspace instructions in conversations.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_visible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Visible to Users
                        </FormLabel>
                        <FormDescription>
                          Show this assistant in the chat interface.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_default"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Default Assistant
                        </FormLabel>
                        <FormDescription>
                          Make this the default assistant for new chats.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="knowledge" className="space-y-4">
            <div className="space-y-4">
              <div>
                <FormLabel>Knowledge Sources</FormLabel>
                <FormDescription className="mb-4">
                  Select files and collections that this assistant can access as
                  context.
                </FormDescription>

                <DocumentSelectTabs
                  selectedFileIds={selectedFiles}
                  selectedCollectionIds={selectedCollections}
                  onFileIdsChange={setSelectedFiles}
                  onCollectionIdsChange={setSelectedCollections}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="tools" className="space-y-4">
            <div className="space-y-4">
              <div>
                <FormLabel>Available Tools</FormLabel>
                <FormDescription className="mb-4">
                  Select tools that this assistant can use during conversations.
                </FormDescription>

                <div className="p-8 text-center border rounded-md">
                  <p className="text-muted-foreground">
                    Tool selection component will be implemented here.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="interactions" className="space-y-4">
            <div className="space-y-6">
              <div>
                <FormLabel>Labels</FormLabel>
                <FormDescription className="mb-2">
                  Add labels to categorize this assistant.
                </FormDescription>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedLabels.map(label => (
                    <Badge
                      key={label.id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {label.name}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-4 text-muted-foreground hover:text-foreground p-0"
                        onClick={() => handleRemoveLabel(label.id)}
                      >
                        <X className="size-3" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    </Badge>
                  ))}
                </div>

                <Select
                  onValueChange={value => {
                    const label = labels.find(l => l.id === value)
                    if (label) handleAddLabel(label)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a label" />
                  </SelectTrigger>
                  <SelectContent>
                    {labels
                      .filter(
                        label => !selectedLabels.some(l => l.id === label.id)
                      )
                      .map(label => (
                        <SelectItem key={label.id} value={label.id}>
                          {label.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <FormLabel>Starter Messages</FormLabel>
                    <FormDescription>
                      Example messages to help users get started with this
                      assistant.
                    </FormDescription>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateStarterMessages}
                    disabled={isLoading}
                  >
                    Generate
                  </Button>
                </div>

                <StarterMessagesList
                  starterMessages={starterMessages}
                  onChange={setStarterMessages}
                  isGenerating={isLoading}
                  generationEnabled={true}
                />
              </div>
            </div>
          </TabsContent>

          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/assistants")}
              disabled={isLoading}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : initialData
                  ? "Update Assistant"
                  : "Create Assistant"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

import { ChatbotUIContext } from "@/context/context"
import { createDocXFile, createFile } from "@/db/files"
import { LLM_LIST } from "@/lib/models/llm/llm-list"
import { ChatFile } from "@/types"
import mammoth from "mammoth"
import { useCallback, useContext, useEffect, useState } from "react"
import { toast } from "sonner"

export const ACCEPTED_FILE_TYPES = [
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/json",
  "text/markdown",
  "application/pdf",
  "text/plain"
].join(",")

// Extended ChatFile type that includes both the imported type and context type properties
interface ExtendedChatFile extends ChatFile {
  url: string
}

export const useSelectFileHandler = () => {
  const {
    selectedWorkspace,
    profile,
    chatSettings,
    setNewMessageImages,
    setNewMessageFiles,
    setShowFilesDisplay,
    setFiles,
    setUseRetrieval
  } = useContext(ChatbotUIContext)

  const [filesToAccept, setFilesToAccept] = useState(ACCEPTED_FILE_TYPES)

  // Define handleFilesToAccept with useCallback to avoid the dependency cycle
  const handleFilesToAccept = useCallback(() => {
    const model = chatSettings?.model
    const FULL_MODEL = LLM_LIST.find(llm => llm.modelId === model)
    if (!FULL_MODEL) return

    // Add Azure OpenAI check
    if (profile?.use_azure_openai) {
      setFilesToAccept(ACCEPTED_FILE_TYPES)
      return
    }

    setFilesToAccept(
      FULL_MODEL.imageInput
        ? `${ACCEPTED_FILE_TYPES},image/*`
        : ACCEPTED_FILE_TYPES
    )
  }, [chatSettings?.model, profile?.use_azure_openai])

  useEffect(() => {
    handleFilesToAccept()
  }, [handleFilesToAccept])

  const handleSelectDeviceFile = async (file: File) => {
    if (!profile || !selectedWorkspace || !chatSettings) return

    setShowFilesDisplay(true)
    setUseRetrieval(true)
    let simplifiedFileType = file.type.split("/")[1]
    let reader = new FileReader()
    if (file.type.includes("image")) {
      reader.readAsDataURL(file)
    } else if (ACCEPTED_FILE_TYPES.split(",").includes(file.type)) {
      if (simplifiedFileType.includes("vnd.adobe.pdf")) {
        simplifiedFileType = "pdf"
      } else if (
        simplifiedFileType.includes(
          "vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) ||
        simplifiedFileType.includes("docx")
      ) {
        simplifiedFileType = "docx"
      }

      setNewMessageFiles(prev => [
        ...prev,
        {
          id: "loading",
          name: file.name,
          type: simplifiedFileType,
          description: file.name,
          file: file,
          url: "" // Add empty url to satisfy the type
        } as ExtendedChatFile
      ])

      // Handle docx files
      if (
        file.type.includes(
          "vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) ||
        file.type.includes("docx")
      ) {
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({
          arrayBuffer
        })

        const createdFile = await createDocXFile(
          result.value,
          file,
          {
            user_id: profile.user_id,
            description: "",
            file_path: "",
            name: file.name,
            size: file.size,
            tokens: 0,
            type: simplifiedFileType
          },
          selectedWorkspace.id,
          chatSettings.embeddingsProvider as "openai" | "local"
        )

        setFiles(prev => [...prev, createdFile])

        setNewMessageFiles(prev =>
          prev.map(item =>
            item.id === "loading"
              ? ({
                  id: createdFile.id,
                  name: createdFile.name,
                  type: createdFile.type,
                  description: createdFile.name,
                  file: file,
                  url: createdFile.file_path || "" // Use file_path as url or empty string
                } as ExtendedChatFile)
              : item
          )
        )

        reader.onloadend = null

        return
      } else {
        // Use readAsArrayBuffer for PDFs and readAsText for other types
        file.type.includes("pdf")
          ? reader.readAsArrayBuffer(file)
          : reader.readAsText(file)
      }
    } else {
      throw new Error("Unsupported file type")
    }

    reader.onloadend = async function () {
      try {
        if (file.type.includes("image")) {
          // Create a temp url for the image file
          const imageUrl = URL.createObjectURL(file)
          // This is a temporary image for display purposes in the chat input
          setNewMessageImages(prev => [
            ...prev,
            {
              messageId: "temp",
              path: "",
              base64: reader.result, // base64 image
              url: imageUrl,
              file
            }
          ])
        } else {
          const createdFile = await createFile(
            file,
            {
              user_id: profile.user_id,
              description: "",
              file_path: "",
              name: file.name,
              size: file.size,
              tokens: 0,
              type: simplifiedFileType
            },
            selectedWorkspace.id,
            chatSettings.embeddingsProvider as "openai" | "local"
          )

          setFiles(prev => [...prev, createdFile])

          setNewMessageFiles(prev =>
            prev.map(item =>
              item.id === "loading"
                ? ({
                    id: createdFile.id,
                    name: createdFile.name,
                    type: createdFile.type,
                    description: createdFile.name,
                    file: file,
                    url: createdFile.file_path || "" // Use file_path as url or empty string
                  } as ExtendedChatFile)
                : item
            )
          )
        }
      } catch (error: any) {
        toast.error("Failed to upload. " + error?.message, {
          duration: 10000
        })
        setNewMessageImages(prev =>
          prev.filter(img => img.messageId !== "temp")
        )
        setNewMessageFiles(prev => prev.filter(file => file.id !== "loading"))
      }
    }
  }

  return {
    handleSelectDeviceFile,
    filesToAccept
  }
}

// db/files.ts

export const createDocXFile = async (
  text: string,
  file: File,
  fileRecord: TablesInsert<"files">,
  workspace_id: string,
  embeddingsProvider: "openai" | "local"
) => {
  const { data: createdFile, error } = await supabase
    .from("files")
    .insert([fileRecord])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await createFileWorkspace({
    user_id: createdFile.user_id,
    file_id: createdFile.id,
    workspace_id
  })

  const filePath = await uploadFile(file, {
    name: createdFile.name,
    user_id: createdFile.user_id,
    file_id: createdFile.name // I think you meant createdFile.id here
  })

  await updateFile(createdFile.id, {
    file_path: filePath
  })

  // Use FormData
  const formData = new FormData()
  formData.append("text", text)
  formData.append("fileId", createdFile.id)
  formData.append("embeddingsProvider", embeddingsProvider)
  formData.append("fileExtension", "docx") // No need to get it from the file name.

  const response = await fetch("/api/retrieval/process/docx", {
    method: "POST", // Ensure POST method
    body: formData // Send FormData directly
    // DO NOT set Content-Type, let the browser handle it.
  })

  if (!response.ok) {
    const jsonText = await response.text()
    const json = JSON.parse(jsonText)
    console.error(
      `Error processing file:${createdFile.id}, status:${response.status}, response:${json.message}`
    )
    toast.error("Failed to process file. Reason:" + json.message, {
      duration: 10000
    })
    await deleteFile(createdFile.id)
  }

  const fetchedFile = await getFileById(createdFile.id)

  return fetchedFile
}

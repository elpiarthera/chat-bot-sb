import { ChatbotUIContext } from "@/context/context"
import { getFileFromStorage } from "@/db/storage/files"
import { Tables } from "@/supabase/types"
import { FC, useContext, useEffect, useState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

interface FilePickerProps {
  selectedFile: Tables<"files"> | null
  onSelectFile: (file: Tables<"files">) => void
}

// Extend the Tables<"files"> type to include collection_id
interface FileWithCollection extends Tables<"files"> {
  collection_id?: string
}

export const FilePicker: FC<FilePickerProps> = ({
  selectedFile,
  onSelectFile
}) => {
  const { profile, files, collections } = useContext(ChatbotUIContext) as {
    profile: Tables<"profiles">
    files: FileWithCollection[]
    collections: Tables<"collections">[]
  }

  const [search, setSearch] = useState("")
  const [filteredFiles, setFilteredFiles] = useState<FileWithCollection[]>([])
  const [filteredCollections, setFilteredCollections] = useState<
    Tables<"collections">[]
  >([])

  useEffect(() => {
    if (!search) {
      setFilteredFiles(files)
      setFilteredCollections(collections)
      return
    }

    const lowerCaseSearch = search.toLowerCase()

    const filteredFiles = files.filter(file =>
      file.name.toLowerCase().includes(lowerCaseSearch)
    )

    const filteredCollections = collections.filter(collection =>
      collection.name.toLowerCase().includes(lowerCaseSearch)
    )

    setFilteredFiles(filteredFiles)
    setFilteredCollections(filteredCollections)
  }, [search, files, collections])

  const handleSelectFile = async (file: FileWithCollection) => {
    onSelectFile(file)
  }

  const handleSelectCollection = async (collection: Tables<"collections">) => {
    const collectionFiles = files.filter(
      file => file.collection_id === collection.id
    )

    if (collectionFiles.length > 0) {
      onSelectFile(collectionFiles[0])
    }
  }

  if (!profile) return null

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col space-y-2">
        <Label>Search Files</Label>

        <Input
          placeholder="Search files..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="files">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="mt-4">
          <div className="flex max-h-[300px] flex-col space-y-1 overflow-auto">
            {filteredFiles.length === 0 ? (
              <div className="text-muted-foreground p-1 text-sm">
                No files found.
              </div>
            ) : (
              filteredFiles.map(file => (
                <div
                  key={file.id}
                  className={`hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg p-2 text-sm ${
                    selectedFile?.id === file.id ? "bg-accent" : ""
                  }`}
                  onClick={() => handleSelectFile(file)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="max-w-[200px] truncate">{file.name}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="collections" className="mt-4">
          <div className="flex max-h-[300px] flex-col space-y-1 overflow-auto">
            {filteredCollections.length === 0 ? (
              <div className="text-muted-foreground p-1 text-sm">
                No collections found.
              </div>
            ) : (
              filteredCollections.map(collection => (
                <div
                  key={collection.id}
                  className="hover:bg-accent flex cursor-pointer items-center justify-between rounded-lg p-2 text-sm"
                  onClick={() => handleSelectCollection(collection)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="max-w-[200px] truncate">
                      {collection.name}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

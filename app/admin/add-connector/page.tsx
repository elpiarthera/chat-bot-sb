"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { AdminPageTitle } from "@/components/admin/admin-page-title"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SourceMetadata, SourceCategory } from "@/lib/types/connectors"
import {
  listSourceMetadata,
  getSourceCategoryDescription
} from "@/lib/connectors/sources"
import { SourceIcon } from "@/components/admin/connectors/SourceIcon"
import { Database } from "lucide-react"

interface SourceTileProps {
  sourceMetadata: SourceMetadata
  preSelect?: boolean
}

function SourceTile({ sourceMetadata, preSelect = false }: SourceTileProps) {
  return (
    <Link
      className={`
        flex 
        flex-col 
        items-center 
        justify-center 
        p-4 
        rounded-lg 
        w-40 
        cursor-pointer
        shadow-md
        hover:bg-muted
        ${preSelect ? "bg-muted subtle-pulse ring-2 ring-primary" : "bg-card"}
      `}
      href={sourceMetadata.adminUrl}
    >
      <div className="mb-2">
        <SourceIcon sourceType={sourceMetadata.internalName} iconSize={24} />
      </div>
      <p className="font-medium text-sm text-center">
        {sourceMetadata.displayName}
      </p>
      {sourceMetadata.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2 text-center text-xs">
          {sourceMetadata.description}
        </p>
      )}
    </Link>
  )
}

export default function AddConnectorPage() {
  const sources = useMemo(() => listSourceMetadata(), [])
  const [searchTerm, setSearchTerm] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchInputRef])

  const filterSources = useCallback(
    (sources: SourceMetadata[]) => {
      const lowerSearchTerm = searchTerm.toLowerCase()
      return sources.filter(
        source =>
          source.displayName.toLowerCase().includes(lowerSearchTerm) ||
          source.category.toLowerCase().includes(lowerSearchTerm) ||
          (source.description &&
            source.description.toLowerCase().includes(lowerSearchTerm))
      )
    },
    [searchTerm]
  )

  const categorizedSources = useMemo(() => {
    const filtered = filterSources(sources)
    return Object.values(SourceCategory).reduce(
      (acc, category) => {
        acc[category] = sources.filter(
          source =>
            source.category === category &&
            (filtered.includes(source) ||
              category.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        return acc
      },
      {} as Record<SourceCategory, SourceMetadata[]>
    )
  }, [searchTerm, filterSources, sources])

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const filteredCategories = Object.entries(categorizedSources).filter(
        ([_, sources]) => sources.length > 0
      )
      if (
        filteredCategories.length > 0 &&
        filteredCategories[0][1].length > 0
      ) {
        const firstSource = filteredCategories[0][1][0]
        if (firstSource) {
          window.location.href = firstSource.adminUrl
        }
      }
    }
  }

  return (
    <div className="mx-auto container">
      <AdminPageTitle
        title="Add Connector"
        icon={<Database className="size-8" />}
        farRightElement={
          <Link href="/admin/indexing/status">
            <Button variant="outline">See Connectors</Button>
          </Link>
        }
      />

      <Input
        ref={searchInputRef}
        type="text"
        placeholder="Search connectors..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyPress}
        className="ml-1 w-96 h-9 mb-6"
      />

      {Object.entries(categorizedSources)
        .filter(([_, sources]) => sources.length > 0)
        .map(([category, sources], categoryInd) => (
          <div key={category} className="mb-8">
            <div className="flex mt-8">
              <h2 className="text-xl font-semibold">{category}</h2>
            </div>
            <p className="text-muted-foreground mb-2">
              {getSourceCategoryDescription(category as SourceCategory)}
            </p>
            <div className="flex flex-wrap gap-4 p-4">
              {sources.map((source, sourceInd) => (
                <SourceTile
                  key={source.internalName}
                  sourceMetadata={source}
                  preSelect={
                    searchTerm.length > 0 &&
                    categoryInd === 0 &&
                    sourceInd === 0
                  }
                />
              ))}
            </div>
          </div>
        ))}

      {Object.values(categorizedSources).every(
        sources => sources.length === 0
      ) && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            No connectors found matching &quot;{searchTerm}&quot;
          </p>
        </div>
      )}
    </div>
  )
}

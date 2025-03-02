"use client"

import { updateBoost } from "./lib"
import { EditableValue } from "@/components/EditableValue"
import { PopupSpec } from "@/lib/types"

interface ScoreEditorProps {
  documentId: string
  initialScore: number
  onScoreUpdate: () => void
  setPopup: (popup: { message: string; type: "success" | "error" }) => void
  consistentWidth?: boolean
}

export const ScoreEditor = ({
  documentId,
  initialScore,
  onScoreUpdate,
  setPopup,
  consistentWidth = true
}: ScoreEditorProps) => {
  const onSubmit = async (value: string) => {
    const numericScore = Number(value)
    if (isNaN(numericScore)) {
      setPopup({
        message: "Score must be a number",
        type: "error"
      })
      return false
    }

    const errorMsg = await updateBoost(documentId, numericScore)
    if (errorMsg) {
      setPopup({
        message: errorMsg,
        type: "error"
      })
      return false
    } else {
      setPopup({
        message: "Updated score!",
        type: "success"
      })
      onScoreUpdate()
    }

    return true
  }

  return (
    <EditableValue
      initialValue={initialScore.toString()}
      onSubmit={onSubmit}
      consistentWidth={consistentWidth}
    />
  )
}

// ScoreSection component that's used in other files
interface ScoreSectionProps {
  documentId: string
  initialScore: number
  setPopup: (popup: PopupSpec | null) => void
  refresh: () => void
}

export const ScoreSection = ({
  documentId,
  initialScore,
  setPopup,
  refresh
}: ScoreSectionProps) => {
  return (
    <ScoreEditor
      documentId={documentId}
      initialScore={initialScore}
      onScoreUpdate={refresh}
      setPopup={setPopup as any}
    />
  )
}

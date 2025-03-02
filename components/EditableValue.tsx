import React, { useState, useRef, useEffect } from "react"

interface EditableValueProps {
  initialValue: string
  onSubmit: (value: string) => Promise<boolean>
  consistentWidth?: boolean
}

export const EditableValue: React.FC<EditableValueProps> = ({
  initialValue,
  onSubmit,
  consistentWidth = true
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const [width, setWidth] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const displayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (displayRef.current && consistentWidth) {
      setWidth(displayRef.current.offsetWidth)
    }
  }, [value, consistentWidth])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleClick = () => {
    if (!isSubmitting) {
      setIsEditing(true)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  const handleBlur = async () => {
    if (value !== initialValue) {
      await handleSubmit()
    } else {
      setIsEditing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit()
    } else if (e.key === "Escape") {
      setValue(initialValue)
      setIsEditing(false)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const success = await onSubmit(value)
      if (!success) {
        setValue(initialValue)
      }
      setIsEditing(false)
    } catch (error) {
      console.error("Error submitting value:", error)
      setValue(initialValue)
      setIsEditing(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative inline-block">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={width ? { width: `${width + 16}px` } : undefined}
          disabled={isSubmitting}
        />
      ) : (
        <div
          ref={displayRef}
          onClick={handleClick}
          className="px-2 py-1 cursor-pointer hover:bg-gray-100 rounded inline-block"
        >
          {value}
        </div>
      )}
    </div>
  )
}

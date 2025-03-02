import React, { useState } from "react"
import { Field as FormikField, ErrorMessage, useField } from "formik"
import { ChevronDown, ChevronUp } from "lucide-react"

interface TextFieldProps {
  name: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  disabled?: boolean
  className?: string
  testId?: string
}

export const TextField: React.FC<TextFieldProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  testId
}) => {
  const [field, meta] = useField(name)

  return (
    <>
      <div className={`mb-4 ${className}`}>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <FormikField
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${
            meta.touched && meta.error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          aria-label={`${name}-input`}
          data-testid={testId}
        />
        <ErrorMessage
          name={name}
          component="div"
          className="mt-1 text-sm text-red-500"
        />
      </div>
    </>
  )
}

interface TextAreaFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  className?: string
  testId?: string
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
  rows = 4,
  className = "",
  testId
}) => {
  const [field, meta] = useField(name)

  return (
    <>
      <div className={`mb-4 ${className}`}>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <FormikField
          as="textarea"
          id={name}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          className={`w-full px-3 py-2 border ${
            meta.touched && meta.error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          data-testid={testId}
        />
        <ErrorMessage
          name={name}
          component="div"
          className="mt-1 text-sm text-red-500"
        />
      </div>
    </>
  )
}

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultOpen = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <>
      <div className={`border rounded-md mb-4 ${className}`}>
        <button
          type="button"
          className="flex justify-between items-center w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className="text-md font-medium">{title}</h3>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isOpen && <div className="p-4">{children}</div>}
      </div>
    </>
  )
}

interface TextFormFieldProps extends TextFieldProps {
  subtext?: string
  small?: boolean
}

export const TextFormField: React.FC<TextFormFieldProps> = ({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
  className = "",
  testId,
  subtext,
  small = false
}) => {
  return (
    <>
      <div className={`mb-4 ${className}`}>
        <TextField
          name={name}
          label={label}
          placeholder={placeholder}
          type={type}
          required={required}
          disabled={disabled}
          testId={testId}
          className={small ? "mb-2" : ""}
        />
        {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
      </div>
    </>
  )
}

interface SelectorOption {
  value: string
  label: string
}

interface SelectorFormFieldProps {
  name: string
  label: string
  options: SelectorOption[]
  required?: boolean
  disabled?: boolean
  className?: string
  subtext?: string
  testId?: string
}

export const SelectorFormField: React.FC<SelectorFormFieldProps> = ({
  name,
  label,
  options,
  required = false,
  disabled = false,
  className = "",
  subtext,
  testId
}) => {
  const [field, meta, helpers] = useField(name)

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        {...field}
        disabled={disabled}
        className={`w-full px-3 py-2 border ${
          meta.touched && meta.error ? "border-red-500" : "border-gray-300"
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
        data-testid={testId}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
      <ErrorMessage
        name={name}
        component="div"
        className="mt-1 text-sm text-red-500"
      />
    </div>
  )
}

interface MultiSelectFieldProps {
  name: string
  label: string
  options: SelectorOption[]
  required?: boolean
  disabled?: boolean
  className?: string
  subtext?: string
  testId?: string
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  name,
  label,
  options,
  required = false,
  disabled = false,
  className = "",
  subtext,
  testId
}) => {
  const [field, meta, helpers] = useField(name)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      option => option.value
    )
    helpers.setValue(selectedOptions)
  }

  return (
    <>
      <div className={`mb-4 ${className}`}>
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id={name}
          multiple
          value={field.value || []}
          onChange={handleChange}
          disabled={disabled}
          className={`w-full px-3 py-2 border ${
            meta.touched && meta.error ? "border-red-500" : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
          data-testid={testId}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
        <ErrorMessage
          name={name}
          component="div"
          className="mt-1 text-sm text-red-500"
        />
      </div>
    </>
  )
}

interface TextArrayFieldProps {
  name: string
  label: string
  placeholder?: string
  addButtonText?: string
  required?: boolean
  disabled?: boolean
  className?: string
  testId?: string
}

export const TextArrayField: React.FC<TextArrayFieldProps> = ({
  name,
  label,
  placeholder,
  addButtonText = "Add Item",
  required = false,
  disabled = false,
  className = "",
  testId
}) => {
  const [field, meta, helpers] = useField(name)
  const [newItem, setNewItem] = useState("")

  const handleAddItem = () => {
    if (newItem.trim() === "") return

    const currentValues = field.value || []
    helpers.setValue([...currentValues, newItem.trim()])
    setNewItem("")
  }

  const handleRemoveItem = (index: number) => {
    const currentValues = [...field.value]
    currentValues.splice(index, 1)
    helpers.setValue(currentValues)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddItem()
    }
  }

  return (
    <div className={`mb-4 ${className}`}>
      <label
        htmlFor={`${name}-input`}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="flex mb-2">
        <input
          id={`${name}-input`}
          type="text"
          value={newItem}
          onChange={e => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          data-testid={testId}
        />
        <button
          type="button"
          onClick={handleAddItem}
          disabled={disabled || newItem.trim() === ""}
          className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {addButtonText}
        </button>
      </div>

      {field.value && field.value.length > 0 ? (
        <ul className="mt-2 border rounded-md divide-y">
          {field.value.map((item: string, index: number) => (
            <li key={index} className="flex justify-between items-center p-2">
              <span className="text-sm">{item}</span>
              <button
                type="button"
                onClick={() => handleRemoveItem(index)}
                disabled={disabled}
                className="text-red-500 hover:text-red-700 focus:outline-none"
                aria-label={`Remove ${item}`}
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 mt-2">No items added yet</p>
      )}

      <ErrorMessage
        name={name}
        component="div"
        className="mt-1 text-sm text-red-500"
      />
    </div>
  )
}

export const SubLabel: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  return <p className="text-sm text-gray-500 mb-4">{children}</p>
}

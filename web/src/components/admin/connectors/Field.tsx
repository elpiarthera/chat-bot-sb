import React, { useState } from "react";
import { Field as FormikField, FieldProps, ErrorMessage, useField } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";

interface FieldBaseProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

interface TextFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  testId?: string;
}

// TextField component
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
  const [field, meta] = useField(name);
  
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
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
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-500" />
    </div>
  );
};

// TextFormField for backward compatibility
export const TextFormField = ({
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
}: TextFieldProps & { subtext?: string; small?: boolean }) => {
  return (
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
  );
};

// TextAreaField component
export const TextAreaField = ({
  name,
  label,
  description,
  required = false,
  className,
  ...props
}: FieldBaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={name} className="flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <FormikField name={name}>
        {({ field, meta }: FieldProps) => (
          <div>
            <Textarea
              id={name}
              {...field}
              {...props}
              className={cn(meta.touched && meta.error ? "border-red-500" : "")}
            />
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
            {meta.touched && meta.error && (
              <p className="mt-1 text-sm text-red-500">{meta.error}</p>
            )}
          </div>
        )}
      </FormikField>
    </div>
  );
};

// CollapsibleSection component
export const CollapsibleSection = ({
  title,
  children,
  defaultOpen = false,
  className,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("border rounded-md", className)}>
      <button
        type="button"
        className="flex items-center justify-between w-full p-4 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-lg font-medium">{title}</h3>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && <div className="p-4 pt-0 border-t">{children}</div>}
    </div>
  );
};

interface SelectorFieldProps {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  testId?: string;
}

export const SelectorField: React.FC<SelectorFieldProps> = ({
  name,
  label,
  options,
  required = false,
  disabled = false,
  placeholder = "Select an option",
  className = "",
  testId
}) => {
  const [field, meta, helpers] = useField(name);
  
  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={name} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        disabled={disabled}
        value={field.value}
        onValueChange={(value) => helpers.setValue(value)}
        data-testid={testId}
      >
        <SelectTrigger className={`w-full ${meta.touched && meta.error ? "border-red-500" : ""}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-500" />
    </div>
  );
};

// SelectorFormField for backward compatibility
export const SelectorFormField = SelectorField;

interface MultiSelectFieldProps {
  name: string;
  label: string;
  options: { label: string; value: string }[];
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  testId?: string;
}

export const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  name,
  label,
  options,
  required = false,
  disabled = false,
  placeholder = "Select options",
  className = "",
  testId
}) => {
  const [field, meta, helpers] = useField(name);
  
  return (
    <div className={`mb-4 ${className}`}>
      <Label htmlFor={name} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <MultiSelect
        options={options}
        selected={field.value || []}
        onChange={(values) => helpers.setValue(values)}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={testId}
        className={meta.touched && meta.error ? "border-red-500" : ""}
      />
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-500" />
    </div>
  );
};
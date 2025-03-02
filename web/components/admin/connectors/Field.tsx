import React, { useState } from "react";
import { Field as FormikField, FieldProps } from "formik";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldBaseProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
}

// TextField component
export const TextField = ({
  name,
  label,
  description,
  required = false,
  className,
  ...props
}: FieldBaseProps & React.InputHTMLAttributes<HTMLInputElement>) => {
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
            <Input
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
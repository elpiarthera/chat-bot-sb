import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, indeterminate, ...props }, ref) => {
  const innerRef = React.useRef<HTMLButtonElement>(null);
  
  React.useEffect(() => {
    if (innerRef.current) {
      // Use DOM API to set indeterminate state since it's not a standard React prop
      (innerRef.current as any).indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  return (
    <CheckboxPrimitive.Root
      ref={(node) => {
        // Handle both the forwarded ref and our internal ref
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          // Cast to any to avoid TypeScript errors with read-only properties
          (ref as any).current = node;
        }
        // Cast to any to avoid TypeScript errors with read-only properties
        (innerRef as any).current = node;
      }}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        {indeterminate ? (
          <div className="h-2 w-2 bg-current" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox }; 
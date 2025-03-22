"use client";

import * as React from "react";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

// Create a basic RadioGroup context
type RadioGroupContextValue = {
  value?: string;
  onValueChange?: (value: string) => void;
};

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: string;
    onValueChange?: (value: string) => void;
    defaultValue?: string;
  }
>(({ className, value, onValueChange, defaultValue, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");

  const contextValue = React.useMemo(
    () => ({
      value: value !== undefined ? value : internalValue,
      onValueChange: (newValue: string) => {
        setInternalValue(newValue);
        onValueChange?.(newValue);
      },
    }),
    [value, internalValue, onValueChange]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div className={cn("grid gap-2", className)} {...props} ref={ref} />
    </RadioGroupContext.Provider>
  );
});
RadioGroup.displayName = "RadioGroup";

const RadioGroupItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value: string;
    disabled?: boolean;
  }
>(({ className, value, disabled, ...props }, ref) => {
  const { value: groupValue, onValueChange } =
    React.useContext(RadioGroupContext);
  const checked = value === groupValue;

  return (
    <div
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked && "bg-primary",
        className
      )}
      onClick={() => {
        if (!disabled) {
          onValueChange?.(value);
        }
      }}
      data-state={checked ? "checked" : "unchecked"}
      data-disabled={disabled ? true : undefined}
      {...props}
    >
      {checked && (
        <div className="flex items-center justify-center">
          <Circle className="h-2.5 w-2.5 fill-current text-current text-white" />
        </div>
      )}
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

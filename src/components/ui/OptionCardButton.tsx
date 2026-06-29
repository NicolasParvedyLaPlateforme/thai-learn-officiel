import * as React from "react"
import { cn } from "@/lib/utils"

export interface OptionCardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDense?: boolean;
  isSelected?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  activeColorClass?: string;
}

export const OptionCardButton = React.forwardRef<HTMLButtonElement, OptionCardButtonProps>(
  ({ className, isDense, isSelected, isError, isSuccess, activeColorClass, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "relative button-sketch !font-thai transition-all",
          isDense ? "min-h-[50px] sm:min-h-[60px]" : "min-h-[60px] sm:min-h-[80px]",
          
          // Default state
          !isSelected && !isError && !isSuccess && "border-slate-300 hover:bg-slate-50 text-slate-700",
          
          // Selection state
          isSelected && !isError && !isSuccess && (activeColorClass || "bg-indigo-50 !border-indigo-500 text-indigo-700"),
          
          // Error state
          isError && "bg-rose-50 !border-rose-400 text-rose-600",
          
          // Success state
          isSuccess && "bg-emerald-50 !border-emerald-500 text-emerald-700",
          
          // Disabled state modifiers
          disabled && !isSelected && !isError && !isSuccess && "opacity-50",
          disabled ? "cursor-default" : "",
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
OptionCardButton.displayName = "OptionCardButton"

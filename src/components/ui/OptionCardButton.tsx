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
          "relative rounded-2xl border-2 text-center transition-all flex flex-col items-center justify-center",
          isDense ? "p-2 sm:p-3 min-h-[50px] sm:min-h-[60px]" : "p-3 sm:p-5 min-h-[60px] sm:min-h-[80px]",
          
          // Default state
          !isSelected && !isError && !isSuccess && "bg-white border-slate-200 hover:bg-slate-50 text-slate-700",
          
          // Selection state
          isSelected && !isError && !isSuccess && (activeColorClass || "bg-indigo-50 border-indigo-400 text-indigo-600"),
          
          // Error state
          isError && "bg-rose-50 border-rose-400 text-rose-600",
          
          // Success state
          isSuccess && "bg-emerald-50 border-emerald-400 text-emerald-600",
          
          // Disabled state modifiers
          disabled && !isSelected && !isError && !isSuccess && "opacity-50",
          disabled ? "cursor-default active:scale-100 hover:scale-100" : "cursor-pointer active:scale-95 hover:scale-[1.02]",
          
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

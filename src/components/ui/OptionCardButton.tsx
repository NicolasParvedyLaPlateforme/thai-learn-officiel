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
          "relative rounded-2xl border-2 border-b-4 text-center transition-all flex flex-col items-center justify-center",
          isDense ? "p-2 sm:p-3 min-h-[50px] sm:min-h-[60px]" : "p-3 sm:p-5 min-h-[60px] sm:min-h-[80px]",
          
          // Default state
          !isSelected && !isError && !isSuccess && "bg-white border-slate-200 hover:bg-slate-50 text-slate-700",
          
          // Selection state
          isSelected && !isError && !isSuccess && (activeColorClass || "bg-indigo-50 border-indigo-500 border-b-indigo-500 text-indigo-700 shadow-[inset_0_0_0_1px_rgba(99,102,241,0.2)]"),
          
          // Error state
          isError && "bg-rose-50 border-rose-300 text-rose-500",
          
          // Success state
          isSuccess && "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]",
          
          // Disabled state modifiers
          disabled && !isSelected && !isError && !isSuccess && "opacity-50",
          disabled ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5 active:translate-y-[2px] active:border-b-2",
          
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

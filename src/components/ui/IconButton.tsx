import * as React from "react"
import { cn } from "@/lib/utils"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline" | "solid" | "glass";
  active?: boolean;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = "md", variant = "ghost", active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
          
          // Sizes
          size === "sm" && "h-8 w-8",
          size === "md" && "h-10 w-10",
          size === "lg" && "h-12 w-12",
          
          // Variants
          variant === "ghost" && "bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700",
          variant === "outline" && "bg-transparent border-2 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700",
          variant === "solid" && "bg-slate-100 text-slate-600 hover:bg-slate-200",
          variant === "glass" && "bg-white/80 backdrop-blur-lg border border-white/60 shadow-sm hover:bg-white text-slate-600",
          
          // Active state
          active && variant === "ghost" && "bg-slate-100 text-slate-800",
          
          className
        )}
        {...props}
      />
    )
  }
)
IconButton.displayName = "IconButton"

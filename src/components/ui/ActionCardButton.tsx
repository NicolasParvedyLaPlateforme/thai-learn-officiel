import * as React from "react"
import { cn } from "@/lib/utils"

interface ActionCardButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  tooltip?: React.ReactNode;
  activeColorClass?: string;
  activeIconColorClass?: string;
}

export const ActionCardButton = React.forwardRef<HTMLButtonElement, ActionCardButtonProps>(
  ({ className, disabled, icon, label, tooltip, activeColorClass = "hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600", activeIconColorClass = "text-blue-500", ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          "flex-1 relative rounded-[16px] p-3 flex flex-col items-center justify-center gap-1.5 transition-all group/btn",
          disabled
            ? "bg-slate-50 border-2 border-slate-100 text-slate-400 cursor-not-allowed opacity-50"
            : cn("bg-white border-2 border-slate-200 text-slate-700 active:scale-95 cursor-pointer", activeColorClass),
          className
        )}
        {...props}
      >
        <div className={cn(!disabled && activeIconColorClass, disabled && "text-slate-400")}>
          {icon}
        </div>
        <span className="font-bold text-[13px]">{label}</span>

        {tooltip && (
          <div className="absolute -top-16 left-0 bg-white border-2 border-slate-100 text-slate-600 text-[13px] font-bold px-4 py-3 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-all pointer-events-none shadow-[0_8px_30px_rgba(0,0,0,0.08)] z-20 w-[220px] text-center leading-snug">
            {tooltip}
            <div className="absolute -bottom-2 left-[30%] -translate-x-1/2 w-3.5 h-3.5 bg-white border-b-2 border-r-2 border-slate-100 rotate-45"></div>
          </div>
        )}
      </button>
    )
  }
)
ActionCardButton.displayName = "ActionCardButton"

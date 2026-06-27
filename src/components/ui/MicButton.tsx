import * as React from "react"
import { cn } from "@/lib/utils"
import { Mic, Square, Loader2 } from "lucide-react"

export interface MicButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status: 'idle' | 'listening' | 'evaluating' | 'success' | 'failed' | 'timeup';
}

export const MicButton = React.forwardRef<HTMLButtonElement, MicButtonProps>(
  ({ className, status, disabled, ...props }, ref) => {
    
    if (status === 'success') {
      return (
        <div className={cn("w-20 h-20 bg-emerald-500/50 text-white rounded-full flex items-center justify-center z-10 opacity-60 cursor-not-allowed", className)}>
           <Mic size={32} />
        </div>
      )
    }

    const isListening = status === 'listening';
    
    return (
      <button
        ref={ref}
        disabled={disabled || status === 'evaluating'}
        className={cn(
          "w-20 h-20 text-white flex items-center justify-center transition-all group z-10",
          isListening 
            ? "bg-rose-500 hover:bg-rose-400 rounded-3xl shadow-[0_8px_0_rgb(225,29,72)] active:shadow-[0_0px_0_rgb(225,29,72)] active:translate-y-2" 
            : "bg-orange-500 hover:bg-orange-400 rounded-full shadow-[0_8px_0_rgb(194,65,12)] active:shadow-[0_0px_0_rgb(194,65,12)] active:translate-y-2",
          className
        )}
        {...props}
      >
        {status === 'evaluating' ? (
           <Loader2 size={32} className="animate-spin" />
        ) : isListening ? (
           <Square size={32} className="fill-current group-hover:scale-110 transition-transform" />
        ) : (
           <Mic size={32} className="group-hover:scale-110 transition-transform" />
        )}
      </button>
    )
  }
)
MicButton.displayName = "MicButton"

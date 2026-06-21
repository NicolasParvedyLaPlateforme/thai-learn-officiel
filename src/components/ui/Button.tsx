import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md active:scale-95",
        secondary: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95",
        outline: "border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 active:scale-95",
        ghost: "hover:bg-slate-100 text-slate-600 active:scale-95",
        danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm active:scale-95",
        dangerOutline: "border-2 border-rose-200 bg-transparent hover:bg-rose-50 text-rose-600 active:scale-95",
        gamified: "bg-emerald-500 text-white border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1",
        gamifiedSecondary: "bg-slate-100 text-slate-700 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 hover:bg-slate-200 hover:border-slate-300",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-9 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

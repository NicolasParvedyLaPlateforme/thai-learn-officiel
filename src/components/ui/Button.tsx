import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const gamifiedVariants = [
  "gamified",
  "dangerGamified",
  "blueGamified",
  "amberGamified",
  "indigoGamified",
  "purpleGamified",
  "orangeGamified",
  "fuchsiaGamified",
  "darkGamified",
  "gamifiedSecondary",
] as const

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
        dangerSoft: "bg-rose-100 text-rose-600 hover:bg-rose-200 active:scale-95 shadow-none",
        orange: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm active:scale-95",
        gamified: "bg-emerald-500 text-white border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 hover:bg-emerald-400",
        dangerGamified: "bg-rose-500 text-white border-b-4 border-rose-600 active:border-b-0 active:translate-y-1 hover:bg-rose-600",
        blueGamified: "bg-blue-500 text-white border-b-4 border-blue-600 active:border-b-0 active:translate-y-1 hover:bg-blue-400",
        amberGamified: "bg-amber-500 text-white border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 hover:bg-amber-400",
        indigoGamified: "bg-indigo-500 text-white border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 hover:bg-indigo-400",
        purpleGamified: "bg-purple-500 text-white border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 hover:bg-purple-400",
        orangeGamified: "bg-orange-500 text-white border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 hover:bg-orange-400",
        fuchsiaGamified: "bg-fuchsia-500 text-white border-b-4 border-fuchsia-700 active:border-b-0 active:translate-y-1 hover:bg-fuchsia-400",
        darkGamified: "bg-zinc-900 text-white border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1 hover:bg-zinc-800 shadow-lg",
        gamifiedSecondary: "bg-slate-100 text-slate-700 border-b-4 border-slate-200 active:border-b-0 active:translate-y-1 hover:bg-slate-200 hover:border-slate-300",
        flat: "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 active:scale-95 shadow-none",
        chipIndigo: "bg-indigo-50 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-100 active:scale-95 shadow-none font-bold",
        chipSlate: "bg-slate-100 text-slate-500 hover:text-slate-600 hover:bg-slate-200 active:scale-95 shadow-none font-bold",
        "glass-menu": "bg-white/80 backdrop-blur-lg border border-white/60 shadow-lg transition-all duration-300 hover:bg-white !justify-between",
      },
      size: {
        default: "h-12 px-6 py-2",
        xs: "h-auto rounded-md px-2 py-1 text-xs",
        sm: "h-9 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-8 text-base font-bold",
        xl: "h-auto py-6 rounded-2xl px-8 text-lg font-bold",
        icon: "h-12 w-12",
        "icon-sm": "h-10 w-10 rounded-full",
        "glass": "min-w-[240px] p-3.5 pr-4 rounded-[1.25rem] h-auto text-left",
      },
    },
    compoundVariants: gamifiedVariants.map((variant) => ({
      variant,
      class: "disabled:active:border-b-4 disabled:active:translate-y-0",
    })),
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && !asChild && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

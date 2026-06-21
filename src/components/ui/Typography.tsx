import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const typographyVariants = cva("text-slate-800", {
  variants: {
    variant: {
      h1: "text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "text-3xl font-bold tracking-tight",
      h3: "text-2xl font-bold tracking-tight",
      h4: "text-xl font-bold tracking-tight",
      p: "text-base leading-7 text-slate-600",
      blockquote: "mt-6 border-l-2 border-emerald-500 pl-6 italic text-slate-600",
      small: "text-sm font-medium leading-none text-slate-500",
      muted: "text-sm text-slate-500",
    },
  },
  defaultVariants: {
    variant: "p",
  },
})

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: React.ElementType
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, as, ...props }, ref) => {
    // Default mapping from variant to HTML tag
    const defaultTagMap: Record<string, React.ElementType> = {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      p: "p",
      blockquote: "blockquote",
      small: "small",
      muted: "p",
    }

    const Comp = as || (variant ? defaultTagMap[variant] : "p") || "p"

    return (
      <Comp
        ref={ref}
        className={cn(typographyVariants({ variant, className }))}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

export { Typography, typographyVariants }

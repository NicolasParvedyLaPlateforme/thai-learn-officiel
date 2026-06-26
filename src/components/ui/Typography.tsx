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
      overline: "text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-500",
      "h3-hero": "text-2xl sm:text-[32px] font-extrabold text-slate-800 leading-tight",
      "p-hero": "text-slate-500 text-sm sm:text-base font-medium",
      "h3-modal": "text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight",
      "p-modal": "text-slate-500 text-sm leading-relaxed mb-6 font-medium",
      "h3-modal-center": "text-2xl font-extrabold text-slate-800 mb-2 mt-4 text-center",
      "p-modal-center": "text-sm font-medium text-slate-500 text-center mb-6",
      "alert-title": "text-amber-800 font-bold text-[13px]",
      "alert-desc": "text-amber-700 text-[12px] font-medium leading-snug",
      "h2-hero-banner": "text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm",
      "p-hero-banner": "mb-8 font-medium text-lg leading-snug drop-shadow-sm max-w-xl",
      "sticky-banner-desktop": "text-white font-extrabold text-lg drop-shadow-sm",
      "sticky-banner-mobile": "text-white font-extrabold text-[15px] truncate max-w-[200px] drop-shadow-sm",
      "timeline-unit-title": "text-[20px] sm:text-3xl font-extrabold text-white tracking-tight break-words drop-shadow-sm",
      "timeline-unit-desc": "text-white w-[70%] mb-0 font-medium text-sm sm:text-base leading-snug drop-shadow-sm",
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
      overline: "span",
      "h3-hero": "h3",
      "p-hero": "p",
      "h3-modal": "h3",
      "p-modal": "p",
      "h3-modal-center": "h3",
      "p-modal-center": "p",
      "alert-title": "span",
      "alert-desc": "span",
      "h2-hero-banner": "h2",
      "p-hero-banner": "p",
      "sticky-banner-desktop": "h2",
      "sticky-banner-mobile": "h2",
      "timeline-unit-title": "h2",
      "timeline-unit-desc": "p",
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

import * as React from "react"
import { Button, ButtonProps, getGamifiedVariant } from "./Button"
import { getTranslation } from "@/hooks/useTranslation"

interface ReviewButtonProps extends Omit<ButtonProps, 'variant'> {
  themeColor?: string;
  language?: string;
  label?: string;
}

export const ReviewButton = React.forwardRef<HTMLButtonElement, ReviewButtonProps>(
  ({ themeColor, language = 'fr', label, className, children, ...props }, ref) => {
    const variant = getGamifiedVariant(themeColor);
    
    return (
      <Button
        ref={ref}
        variant={variant}
        className={className}
        {...props}
      >
        {children || (
          <>
            {label || getTranslation('auto.review', language) || "Réviser"}
          </>
        )}
      </Button>
    )
  }
)
ReviewButton.displayName = "ReviewButton"

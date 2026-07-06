import * as React from "react"
import { Button, ButtonProps, getGamifiedVariant } from "./Button"
import { Play } from "lucide-react"
import { getTranslation } from "@/hooks/useTranslation"

interface NextButtonProps extends Omit<ButtonProps, 'variant'> {
  themeColor?: string;
  language?: string;
  label?: string;
}

export const NextButton = React.forwardRef<HTMLButtonElement, NextButtonProps>(
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
            {label || getTranslation('auto.next', language) || "Suivant"}
          </>
        )}
      </Button>
    )
  }
)
NextButton.displayName = "NextButton"

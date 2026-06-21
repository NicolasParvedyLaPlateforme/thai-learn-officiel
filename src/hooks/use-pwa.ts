import * as React from "react"

export function useIsPWA() {
  const [isPWA, setIsPWA] = React.useState<boolean>(false)

  React.useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;
    setIsPWA(isStandalone);
  }, [])

  return isPWA
}

import { useEffect, useState } from "react"

export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(setDebouncedValue, delayMs, value)
    return () => window.clearTimeout(timeoutId)
  }, [value, delayMs])

  return debouncedValue
}

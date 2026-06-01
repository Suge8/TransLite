import type { ReactNode } from "react"
import { useId } from "react"
import { cn } from "@/utils/styles/utils"

interface GradientBackgroundProps {
  children: ReactNode
  className?: string
}

export function GradientBackground({ children, className }: GradientBackgroundProps) {
  const filterId = useId()
  const svg = `<svg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'>
  <filter id='${filterId}'>
    <feTurbulence
      type='fractalNoise'
      baseFrequency='0.9'
      numOctaves='2'
      stitchTiles='stitch'/>
    <feColorMatrix type='saturate' values='0'/>
  </filter>

  <rect width='100%' height='100%' filter='url(#${filterId})' opacity='0.03'/>
</svg>`

  return (
    <div
      className={cn("w-full py-8 flex items-center justify-center rounded-xl my-8", className)}
      style={{
        backgroundImage: [
          "radial-gradient(circle at 72% 12%, rgba(139 92 246 / 0.22), transparent 60%)",
          "radial-gradient(circle at 5% 85%, rgba(99 102 241 / 0.18), transparent 55%)",
          "radial-gradient(circle at 55% 55%, rgba(217 70 239 / 0.12), transparent 60%)",
          `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        ].join(", "),
      }}
    >
      {children}
    </div>
  )
}

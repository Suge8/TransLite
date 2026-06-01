import Container from "@/components/container"
import { cn } from "@/utils/styles/utils"

export function PageLayout({ children, className, innerClassName }: { children: React.ReactNode, className?: string, innerClassName?: string }) {
  return (
    <div className={cn("w-full pb-20", className)}>
      <Container>
        <div className={cn("mx-auto max-w-2xl @container", innerClassName)}>
          {children}
        </div>
      </Container>
    </div>
  )
}

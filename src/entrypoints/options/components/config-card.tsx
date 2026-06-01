import { cn } from "@/utils/styles/utils"

export function ConfigCard({ id, title, description, children, className, titleClassName, inline }:
{ id?: string, title: React.ReactNode, description?: React.ReactNode, children: React.ReactNode, className?: string, titleClassName?: string, inline?: boolean }) {
  return (
    <section
      id={id}
      className={cn(
        "px-5 py-4",
        inline ? "flex items-center justify-between gap-6" : "flex flex-col gap-3",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className={cn("text-sm font-medium text-foreground", titleClassName)}>{title}</h2>
        {description && (
          <div className="text-[13px] leading-relaxed text-muted-foreground text-pretty">{description}</div>
        )}
      </div>
      {inline ? <div className="flex shrink-0 items-center justify-end">{children}</div> : children}
    </section>
  )
}

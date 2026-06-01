export function SettingsGroup({ label, children }: { label: React.ReactNode, children: React.ReactNode }) {
  return (
    <section className="pt-8 first:pt-7">
      <h2 className="mb-2.5 flex items-center gap-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground/70">
        <span className="size-1.5 rounded-full bg-gradient-to-br from-brand-from to-brand-to" />
        {label}
      </h2>
      <div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-colors hover:border-border">
        {children}
      </div>
    </section>
  )
}

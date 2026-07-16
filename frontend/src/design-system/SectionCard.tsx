import type { ReactNode } from "react"
import { cn } from "../lib/cn"

interface SectionCardProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/** Cartão com cabeçalho padronizado, base de composição das seções. */
export function SectionCard({
  title,
  description,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-low",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-outline-variant px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <h2 className="font-semibold text-on-surface">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-sm text-muted">{description}</p>
            ) : null}
          </div>
        </div>
        {action}
      </header>
      <div className={cn("p-5 sm:p-6", bodyClassName)}>{children}</div>
    </section>
  )
}

import { cn } from "../lib/cn"

interface IconProps {
  name: string
  filled?: boolean
  className?: string
}

/** Wrapper do Material Symbols usado em todo o design system Orby. */
export function Icon({ name, filled = false, className }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("material-symbols-outlined leading-none", className)}
      style={filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
    >
      {name}
    </span>
  )
}

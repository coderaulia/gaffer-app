import * as React from 'react'
import { cn } from '@/lib/utils'

type Variant = 'default' | 'ghost' | 'outline' | 'accent'
type Size = 'sm' | 'md' | 'icon'

const variants: Record<Variant, string> = {
  default: 'bg-panel-2 hover:bg-border text-fg',
  ghost: 'hover:bg-panel-2 text-muted hover:text-fg',
  outline: 'border border-border hover:bg-panel-2 text-fg',
  accent: 'bg-accent text-bg hover:opacity-90 font-medium',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-2.5 text-xs gap-1.5',
  md: 'h-9 px-3.5 text-sm gap-2',
  icon: 'h-9 w-9',
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md transition-colors select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
        'disabled:opacity-40 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

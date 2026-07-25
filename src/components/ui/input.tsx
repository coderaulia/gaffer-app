import * as React from 'react'
import { cn } from '@/lib/utils'

const base = cn(
  'w-full rounded-md border border-border bg-panel-2 px-3 text-[13px] text-fg',
  'placeholder:text-muted focus:ring-2 focus:ring-accent/50 focus:outline-none',
  'disabled:opacity-50',
)

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(base, 'h-10', className)} {...props} />
))
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(base, 'resize-y py-2 leading-relaxed', className)}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(base, 'h-10 pr-8', className)} {...props} />
))
Select.displayName = 'Select'

/** Labelled form row used across the management pages. */
export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string
  hint?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1 flex items-baseline gap-2">
        <span className="text-[12px] text-muted">{label}</span>
        {hint && <span className="text-[11px] text-muted/70">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

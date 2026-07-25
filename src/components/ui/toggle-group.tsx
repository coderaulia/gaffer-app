import * as React from 'react'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import { cn } from '@/lib/utils'

export const ToggleGroup = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Root
    ref={ref}
    className={cn(
      'inline-flex items-center gap-0.5 rounded-md bg-panel-2 p-0.5',
      className,
    )}
    {...props}
  />
))
ToggleGroup.displayName = 'ToggleGroup'

export const ToggleGroupItem = React.forwardRef<
  React.ComponentRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      'inline-flex h-7 min-w-11 items-center justify-center rounded px-2.5 text-xs',
      'text-muted transition-colors hover:text-fg',
      'data-[state=on]:bg-accent data-[state=on]:text-bg data-[state=on]:font-medium',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
      className,
    )}
    {...props}
  />
))
ToggleGroupItem.displayName = 'ToggleGroupItem'

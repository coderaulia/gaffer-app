import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Action } from './types'
import { STATIONARY_ACTIONS } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isStationary(action: Action) {
  return STATIONARY_ACTIONS.includes(action)
}

export function formatTime(s: number) {
  const whole = Math.floor(s)
  const tenths = Math.floor((s - whole) * 10)
  return `${whole}.${tenths}s`
}

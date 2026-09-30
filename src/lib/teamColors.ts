import type { Team } from './types'

export const TEAM_COLORS: Record<Team, { shirt: string; shorts: string }> = {
  attack: { shirt: '#e35d4a', shorts: '#f2f2f2' },
  defense: { shirt: '#4a7fe3', shorts: '#1f2937' },
  neutral: { shirt: '#f2c14e', shorts: '#1f2937' },
  gk: { shirt: '#57c98a', shorts: '#1f2937' },
}

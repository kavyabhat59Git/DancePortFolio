// Picks a quality level once, from what the device tells us, so the heavy effects
// scale down on older phones and low-end laptops.
//  high: everything (desktop-class machines)
//  mid:  phones like iPhone 12–15 / mid-range Android, 4–6 core laptops
//  low:  older or slower devices, data-saver on, or reduced-motion
export type Tier = 'high' | 'mid' | 'low'

type NavExtras = Navigator & {
  deviceMemory?: number
  connection?: { saveData?: boolean; effectiveType?: string }
}

function detect(): Tier {
  if (typeof window === 'undefined') return 'mid'
  const nav = navigator as NavExtras
  const cores = nav.hardwareConcurrency || 4
  const memory = nav.deviceMemory // Chrome/Android only; undefined on Safari
  const conn = nav.connection
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const touch = window.matchMedia('(pointer: coarse)').matches
  const slowNet = conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '3g'

  if (reduced || conn?.saveData || slowNet) return 'low'
  if ((memory !== undefined && memory <= 3) || cores <= 3) return 'low'
  if (touch) return cores >= 6 && (memory === undefined || memory >= 4) ? 'mid' : 'low'
  if (cores >= 8 && (memory === undefined || memory >= 8)) return 'high'
  return 'mid'
}

const forced = new URLSearchParams(window.location.search).get('tier') as Tier | null
export const tier: Tier = forced === 'high' || forced === 'mid' || forced === 'low' ? forced : detect()

document.documentElement.classList.add(`tier-${tier}`)

/** Run something when the browser is idle (falls back to a timeout in Safari). */
export function whenIdle(fn: () => void, timeout = 1500) {
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
  if (w.requestIdleCallback) w.requestIdleCallback(fn, { timeout })
  else setTimeout(fn, Math.min(timeout, 600))
}

/** Set to true if the 3D scene detects the frame rate dropping; effects then ease off. */
export const runtime = { struggling: false }

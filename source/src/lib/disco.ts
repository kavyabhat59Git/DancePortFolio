// Shared "disco state" so the 3D ball (React Three Fiber + Rapier), the reflection
// spots (OGL) and the page (party mode dimming) all move to the same beat.
import { useSyncExternalStore } from 'react'

export const disco = {
  /** current spin angle of the ball, radians — written by the 3D scene every frame */
  spin: 0,
  /** 0..1, eased party intensity — written by the 3D scene every frame */
  party: 0,
  /** where the ball is, as 0..1 of the hero (x from left, y from top) */
  ballX: 0.8,
  ballY: 0.22,
  partyUntil: 0,
}

const listeners = new Set<() => void>()
let partyOn = false
let timer: ReturnType<typeof setTimeout> | undefined

const emit = () => listeners.forEach((l) => l())

export function startParty(ms = 6000) {
  disco.partyUntil = performance.now() + ms
  partyOn = true
  emit()
  clearTimeout(timer)
  timer = setTimeout(() => {
    partyOn = false
    emit()
  }, ms)
}

/** Ends the party early. Nothing snaps: the 3D scene eases the spin, beams and
 * reflections back down, and the page fades the lights up. */
export function stopParty() {
  disco.partyUntil = 0
  partyOn = false
  clearTimeout(timer)
  emit()
}

export const isParty = () => partyOn

export function useParty() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => partyOn,
  )
}

/** Lets the 3D scene set the custom cursor's label (it can't use data-cursor on a canvas). */
export function setCursorLabel(label: string | null) {
  window.dispatchEvent(new CustomEvent('cursor-label', { detail: label }))
}

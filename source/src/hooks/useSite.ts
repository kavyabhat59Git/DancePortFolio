import { useEffect, useState } from 'react'
import Lenis from 'lenis'
import { motionValue } from 'motion/react'

const reducedQuery = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia(reducedQuery).matches

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/* ---------- Smooth scrolling (Lenis) ---------- */

let lenis: Lenis | null = null

// Lenis drives the scroll. GSAP loads later (it's big), and hooks itself in via onLenis.
const lenisWaiters: ((l: Lenis) => void)[] = []
export function onLenis(fn: (l: Lenis) => void) {
  if (lenis) fn(lenis)
  else lenisWaiters.push(fn)
}

export function useSmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const l = new Lenis({ lerp: 0.11, anchors: { offset: -40 }, autoRaf: true })
    lenis = l
    lenisWaiters.splice(0).forEach((fn) => fn(l))
    return () => {
      l.destroy()
      lenis = null
    }
  }, [])
}

export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { offset: -40, duration: 1.4 })
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function lockScroll(locked: boolean) {
  if (locked) lenis?.stop()
  else lenis?.start()
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}

/* ---------- Shared pointer position (-1..1 from screen centre) ---------- */

export const pointerX = motionValue(0)
export const pointerY = motionValue(0)

let pointerBound = false
export function bindPointer() {
  if (pointerBound) return
  pointerBound = true
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1)
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1)
    },
    { passive: true },
  )
}

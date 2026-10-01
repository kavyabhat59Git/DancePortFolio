import { useEffect, useRef, useState } from 'react'
import { createTimeline } from 'animejs'
import { lockScroll, prefersReducedMotion } from '../hooks/useSite'

/** A dancer's count-in: 5, 6, 7, 8 — then the curtain lifts. */
export default function Loader({ onReveal }: { onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const [gone, setGone] = useState(false)
  const revealRef = useRef(onReveal)
  revealRef.current = onReveal

  useEffect(() => {
    if (prefersReducedMotion() || !root.current) {
      setGone(true)
      revealRef.current()
      return
    }
    lockScroll(true)
    const el = root.current
    const nums = el.querySelectorAll<HTMLElement>('.count span')
    const tl = createTimeline({ defaults: { ease: 'outBack(2)' } })
    nums.forEach((n, i) => {
      const t = 120 + i * 300
      tl.add(n, { opacity: [0, 1], scale: [0.2, 1], rotate: [i % 2 ? 18 : -18, 0], duration: 260 }, t)
      if (i < nums.length - 1) tl.add(n, { opacity: 0, scale: 1.5, duration: 160, ease: 'inQuad' }, t + 240)
    })
    const end = 120 + nums.length * 300
    tl.add(el.querySelector('.count')!, { scale: 1.25, opacity: 0, duration: 260, ease: 'inBack' }, end)
      .call(() => {
        lockScroll(false)
        revealRef.current()
      }, end + 120)
      .add(el, { translateY: '-105%', duration: 750, ease: 'inOutExpo' }, end + 80)
      .call(() => setGone(true), end + 860)

    return () => {
      tl.revert()
      lockScroll(false)
    }
  }, [])

  if (gone) return null
  return (
    <div className="loader" ref={root} aria-hidden>
      <div className="count">
        <span>5</span>
        <span>6</span>
        <span>7</span>
        <span>8!</span>
      </div>
      <svg className="loader-wave" viewBox="0 0 1440 80" preserveAspectRatio="none">
        <path d="M0 0h1440v30c-120 40-240 40-360 0s-240-40-360 0-240 40-360 0S120-10 0 30z" />
      </svg>
    </div>
  )
}

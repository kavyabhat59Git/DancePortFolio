import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { animate } from 'animejs'
import { prefersReducedMotion, useMediaQuery } from '../hooks/useSite'

const COLORS = ['#FFD60A', '#FF3D8B', '#FF9F1C', '#7C8CFF', '#FFF4E0']

/** Dot + springy ring, trailing little sparkles. Mouse/trackpad only. */
export default function Cursor() {
  const fine = useMediaQuery('(pointer: fine)')
  const [label, setLabel] = useState('')
  const [hovering, setHovering] = useState(false)
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 380, damping: 28, mass: 0.6 })
  const ry = useSpring(y, { stiffness: 380, damping: 28, mass: 0.6 })
  const trail = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fine) return
    document.documentElement.classList.add('custom-cursor')
    const reduced = prefersReducedMotion()
    let last = 0
    let lastX = 0
    let lastY = 0

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = performance.now()
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY)
      if (reduced || !trail.current || t - last < 45 || dist < 14) return
      last = t
      lastX = e.clientX
      lastY = e.clientY
      const s = document.createElement('span')
      s.className = 'spark'
      s.style.left = `${e.clientX}px`
      s.style.top = `${e.clientY}px`
      s.style.color = COLORS[Math.floor(Math.random() * COLORS.length)]
      trail.current.appendChild(s)
      animate(s, {
        translateY: [0, 26 + Math.random() * 30],
        translateX: [0, (Math.random() - 0.5) * 40],
        rotate: [0, (Math.random() - 0.5) * 300],
        scale: [1, 0],
        opacity: [1, 0],
        duration: 800,
        ease: 'outQuad',
        onComplete: () => s.remove(),
      })
    }

    const onOver = (e: Event) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('a, button, [data-cursor], input, select, textarea, label')
      setHovering(!!t)
      setLabel(t?.dataset.cursor ?? '')
    }

    // the 3D disco ball sets its label this way (it lives on a canvas, not a DOM element)
    const onLabel = (e: Event) => {
      const label = (e as CustomEvent<string | null>).detail
      setHovering(!!label)
      setLabel(label ?? '')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerover', onOver)
    window.addEventListener('cursor-label', onLabel)
    return () => {
      window.removeEventListener('cursor-label', onLabel)
      document.documentElement.classList.remove('custom-cursor')
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerover', onOver)
    }
  }, [fine, x, y])

  if (!fine) return null
  return (
    <>
      <div className="spark-layer" ref={trail} aria-hidden />
      <motion.div className="cursor-dot" style={{ x, y }} aria-hidden />
      <motion.div
        className={`cursor-ring ${label ? 'has-label' : ''}`}
        style={{ x: rx, y: ry }}
        animate={{ scale: label ? 2.6 : hovering ? 1.7 : 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        aria-hidden
      >
        <span>{label}</span>
      </motion.div>
    </>
  )
}

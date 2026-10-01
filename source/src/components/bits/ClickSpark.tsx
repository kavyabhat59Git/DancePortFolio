// Adapted from React Bits "ClickSpark" (reactbits.dev): instead of wrapping one area,
// it's a screen-sized layer that sparks wherever you click, in Kavya's colours,
// and only animates while sparks are on screen.
import { useEffect, useRef } from 'react'

interface ClickSparkProps {
  colors?: string[]
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  duration?: number
}

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
  color: string
}

const ease = (t: number) => t * (2 - t)

export default function ClickSpark({
  colors = ['#fff'],
  sparkSize = 14,
  sparkRadius = 34,
  sparkCount = 10,
  duration = 500,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let sparks: Spark[] = []
    let raf = 0
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const draw = (now: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      sparks = sparks.filter((s) => {
        const p = (now - s.startTime) / duration
        if (p >= 1) return false
        const e = ease(p)
        const d = e * sparkRadius
        const len = sparkSize * (1 - e)
        ctx.strokeStyle = s.color
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(s.x + d * Math.cos(s.angle), s.y + d * Math.sin(s.angle))
        ctx.lineTo(s.x + (d + len) * Math.cos(s.angle), s.y + (d + len) * Math.sin(s.angle))
        ctx.stroke()
        return true
      })
      raf = sparks.length ? requestAnimationFrame(draw) : 0
    }

    const onDown = (e: PointerEvent) => {
      const now = performance.now()
      const color = colors[Math.floor(Math.random() * colors.length)]
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, angle: (2 * Math.PI * i) / sparkCount, startTime: now, color })
      }
      if (!raf) raf = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    window.addEventListener('pointerdown', onDown)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [colors, sparkSize, sparkRadius, sparkCount, duration])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 1450 }}
    />
  )
}

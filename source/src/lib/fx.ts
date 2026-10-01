// Little one-off effects that live on top of the page (petals, speech bubbles, notes, smoke).
import { animate } from 'animejs'
import { prefersReducedMotion } from '../hooks/useSite'

export const MARIGOLD = ['#FFD60A', '#FF9F1C', '#FFB43A', '#FF3D8B', '#C8102E']
export const JASMINE = ['#FFFFFF', '#FFF4E0', '#FFD9E8', '#F7F1E3']

const spawn = (className: string, x: number, y: number) => {
  const el = document.createElement('span')
  el.className = className
  el.style.left = `${x}px`
  el.style.top = `${y}px`
  document.body.appendChild(el)
  return el
}

export const centerOf = (el: Element) => {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, r }
}

/** Petals bursting out from a point. */
export function burst(x: number, y: number, colors = MARIGOLD, count = 24, spread = 160) {
  if (prefersReducedMotion()) return
  for (let i = 0; i < count; i++) {
    const p = spawn('petal', x, y)
    p.style.background = colors[i % colors.length]
    const angle = Math.random() * Math.PI * 2
    const dist = spread * (0.5 + Math.random() * 0.8)
    animate(p, {
      translateX: Math.cos(angle) * dist,
      translateY: [0, Math.sin(angle) * dist - 60, Math.sin(angle) * dist + 120],
      rotate: Math.random() * 720,
      scale: [1, 0.4],
      opacity: [1, 1, 0],
      duration: 1100 + Math.random() * 500,
      ease: 'outCubic',
      onComplete: () => p.remove(),
    })
  }
}

/** Petals raining down across the whole screen. */
export function shower(colors = MARIGOLD, count = 70) {
  if (prefersReducedMotion()) return
  const w = window.innerWidth
  const h = window.innerHeight
  for (let i = 0; i < count; i++) {
    const p = spawn('petal petal-lg', Math.random() * w, -30)
    p.style.background = colors[i % colors.length]
    const drift = (Math.random() - 0.5) * 220
    animate(p, {
      translateY: [0, h + 80],
      translateX: [0, drift * 0.4, drift],
      rotate: [Math.random() * 180, Math.random() * 900],
      duration: 2200 + Math.random() * 1800,
      delay: Math.random() * 900,
      ease: 'inQuad',
      onComplete: () => p.remove(),
    })
  }
}

/** A comic speech bubble that pops up and floats away. */
export function bubble(x: number, y: number, text: string, color = 'var(--sun)') {
  const b = spawn('pop-bubble', x, y)
  b.textContent = text
  b.style.background = color
  if (prefersReducedMotion()) {
    setTimeout(() => b.remove(), 1200)
    return
  }
  animate(b, {
    scale: [0, 1.15, 1],
    rotate: [-20, (Math.random() - 0.5) * 16],
    translateY: [0, -50],
    duration: 600,
    ease: 'outBack(2)',
  })
  animate(b, { opacity: [1, 0], translateY: -90, delay: 900, duration: 400, ease: 'inQuad', onComplete: () => b.remove() })
}

/** Music notes floating up. */
export function notes(x: number, y: number) {
  if (prefersReducedMotion()) return
  const glyphs = ['♪', '♫', '♩', '♬']
  for (let i = 0; i < 7; i++) {
    const n = spawn('note', x, y)
    n.textContent = glyphs[i % glyphs.length]
    n.style.color = ['#FFD60A', '#FF3D8B', '#FFF4E0', '#FF9F1C'][i % 4]
    animate(n, {
      translateY: [0, -140 - Math.random() * 120],
      translateX: [0, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 160],
      rotate: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40],
      scale: [0.4, 1.3, 1],
      opacity: [0, 1, 0],
      delay: i * 110,
      duration: 1400,
      ease: 'outQuad',
      onComplete: () => n.remove(),
    })
  }
}

/** Puffs of exhaust smoke. */
export function smoke(x: number, y: number, dir = -1) {
  if (prefersReducedMotion()) return
  for (let i = 0; i < 6; i++) {
    const s = spawn('smoke', x, y)
    animate(s, {
      translateX: [0, dir * (40 + i * 18)],
      translateY: [0, -10 - Math.random() * 30],
      scale: [0.3, 1.4 + Math.random()],
      opacity: [0.9, 0],
      delay: i * 60,
      duration: 800,
      ease: 'outQuad',
      onComplete: () => s.remove(),
    })
  }
}

/** Tiny star sparks. */
export function sparks(x: number, y: number, count = 10) {
  if (prefersReducedMotion()) return
  for (let i = 0; i < count; i++) {
    const s = spawn('spark spark-fx', x, y)
    s.style.color = ['#FFD60A', '#FF3D8B', '#FFF4E0', '#FF9F1C'][i % 4]
    const a = (Math.PI * 2 * i) / count
    animate(s, {
      translateX: [0, Math.cos(a) * 90],
      translateY: [0, Math.sin(a) * 90],
      rotate: [0, 270],
      scale: [1.4, 0],
      duration: 750,
      ease: 'outCubic',
      onComplete: () => s.remove(),
    })
  }
}

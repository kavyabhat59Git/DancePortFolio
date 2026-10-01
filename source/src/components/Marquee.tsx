import { useRef } from 'react'
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'motion/react'
import { stickerSmall, styles, type StickerName } from '../data'
import { prefersReducedMotion } from '../hooks/useSite'

const wrap = (min: number, max: number, v: number) => {
  const r = max - min
  return ((((v - min) % r) + r) % r) + min
}

/** A tape that drifts on its own and speeds up / flips with your scroll. */
function Tape({ speed, className, icons }: { speed: number; className: string; icons: StickerName[] }) {
  const baseX = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [0, 1000], [0, 4], { clamp: false })
  const x = useTransform(baseX, (v) => `${wrap(-25, 0, v)}%`)
  const dir = useRef(1)
  const reduced = useRef(prefersReducedMotion())
  const box = useRef<HTMLDivElement>(null)
  const visible = useInView(box)

  useAnimationFrame((_, delta) => {
    if (reduced.current || !visible) return
    let move = dir.current * speed * (delta / 1000)
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    move += dir.current * move * f
    baseX.set(baseX.get() + move)
  })

  const row = (k: number) => (
    <span className="tape-row" key={k} aria-hidden={k > 0}>
      {styles.map((s, i) => (
        <span key={s} className="tape-item">
          {s}
          <img src={stickerSmall(icons[i % icons.length])} alt="" loading="lazy" />
        </span>
      ))}
    </span>
  )

  return (
    <div className={`tape ${className}`} ref={box}>
      <motion.div className="tape-track" style={{ x }}>
        {[0, 1, 2, 3].map(row)}
      </motion.div>
    </div>
  )
}

export default function Marquee() {
  return (
    <div className="marquee">
      <Tape speed={-3} className="tape-sun" icons={['sparkle', 'marigold']} />
      <Tape speed={3} className="tape-pink" icons={['vinyl', 'sparkle']} />
    </div>
  )
}

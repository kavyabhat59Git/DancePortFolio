import { useEffect, useRef } from 'react'
import { motion, useInView, useScroll, useTransform, type MotionValue } from 'motion/react'
import { animate, createDrawable, stagger } from 'animejs'
import Sticker from './Sticker'
import StickerPeel from './bits/StickerPeel'
import PlayfulSticker from './PlayfulSticker'
import { useMediaQuery } from '../hooks/useSite'
import { bubble, burst, shower } from '../lib/fx'

/** Dropping the marigold on a paragraph garlands it and showers the page in petals. */
function onMarigoldDrop(x: number, y: number) {
  const para = document
    .elementsFromPoint(x, y)
    .find((el) => el.classList.contains('scroll-words')) as HTMLElement | undefined
  if (!para) {
    burst(x, y, undefined, 10, 80)
    bubble(x, y - 70, 'drop me on the words ↓', 'var(--cream)')
    return
  }
  para.querySelectorAll<HTMLElement>('.word').forEach((w, i) => (w.style.transitionDelay = `${i * 12}ms`))
  para.classList.add('garlanded')
  document.querySelector('.peel-hint')?.classList.add('is-done')
  shower()
  bubble(x, y - 80, 'shower of marigolds!')
}
import { sticker, story } from '../data'

/** Words light up one by one as the paragraph scrolls past. */
function ScrollWords({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 85%', 'end 55%'] })
  const words = text.split(' ')
  return (
    <p className="scroll-words" ref={ref}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ))}
      </span>
    </p>
  )
}

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0.14, 1])
  const y = useTransform(progress, range, [6, 0])
  return (
    <motion.span style={{ opacity, y }} className="word">
      {children}{' '}
    </motion.span>
  )
}

/** Hand-drawn scribbles that draw themselves in (anime.js). */
function Scribbles() {
  const ref = useRef<HTMLHeadingElement>(null)
  const seen = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })
  useEffect(() => {
    if (!seen || !ref.current) return
    const paths = ref.current.querySelectorAll<SVGPathElement>('.scribble path')
    const drawables = createDrawable(paths)
    const a = animate(drawables, {
      draw: ['0 0', '0 1'],
      duration: 900,
      delay: stagger(500, { start: 250 }),
      ease: 'inOutQuad',
    })
    return () => void a.revert()
  }, [seen])

  return (
    <h2 className="about-title" ref={ref}>
      Where{' '}
      <span className="mark mark-tradition">
        tradition
        <svg className="scribble scribble-under" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden>
          <path d="M4 18 C60 6, 120 26, 180 14 S 270 8, 296 16" />
        </svg>
      </span>{' '}
      meets the{' '}
      <span className="mark mark-street">
        street
        <svg className="scribble scribble-circle" viewBox="0 0 300 120" preserveAspectRatio="none" aria-hidden>
          <path d="M150 8 C60 4, 8 30, 12 62 S 90 116, 170 112 S 296 84, 290 52 S 210 6, 120 14" />
        </svg>
      </span>
    </h2>
  )
}

/** Two worlds slide in from either side and collide into one dancer. */
function Collision() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center 45%'] })
  const leftX = useTransform(scrollYProgress, [0, 1], ['-80%', '22%'])
  const rightX = useTransform(scrollYProgress, [0, 1], ['80%', '-22%'])
  const leftR = useTransform(scrollYProgress, [0, 1], [-25, -6])
  const rightR = useTransform(scrollYProgress, [0, 1], [25, 6])
  const badgeScale = useTransform(scrollYProgress, [0.82, 1], [0, 1])
  const badgeRotate = useTransform(scrollYProgress, [0.82, 1], [-90, -8])

  return (
    <div className="collision" ref={ref}>
      <motion.div className="world world-classical" style={{ x: leftX, rotate: leftR }}>
        <PlayfulSticker name="ghungroo" className="world-sticker ws-1" />
        <PlayfulSticker name="mudra" className="world-sticker ws-2" />
        <h3>Bharatanatyam</h3>
        <p>discipline · storytelling · precision</p>
      </motion.div>
      <motion.div className="world world-disco" style={{ x: rightX, rotate: rightR }}>
        <PlayfulSticker name="vinyl" className="world-sticker ws-1" />
        <PlayfulSticker name="mic" className="world-sticker ws-2" />
        <h3>Waacking</h3>
        <p>attitude · history · freedom</p>
      </motion.div>
      <motion.div className="collision-badge" style={{ scale: badgeScale, rotate: badgeRotate }}>
        <span>= Kavya</span>
      </motion.div>
    </div>
  )
}

export default function About() {
  const wide = useMediaQuery('(min-width: 960px)')
  return (
    <section className="about" id="about">
      <div className="container">
        <p className="eyebrow">
          <span>✦</span> About me
        </p>
        <Scribbles />
        <Collision />
        <div className="story">
          {story.map((p, i) => (
            <ScrollWords key={i} text={p} />
          ))}
          {wide ? (
            <div className="peel-zone">
              <StickerPeel
                imageSrc={sticker('marigold')}
                width={130}
                rotate={20}
                peelBackHoverPct={24}
                peelBackActivePct={42}
                shadowIntensity={0.35}
                lightingIntensity={0.12}
                initialPosition={{ x: 790, y: 20 }}
                className="peel-sticker"
                onDrop={onMarigoldDrop}
              />
              <span className="peel-hint hand-note">drag me onto her story ↙</span>
            </div>
          ) : (
            <Sticker name="marigold" size="clamp(70px, 8vw, 110px)" className="s-story-1" depth={20} rotate={14} />
          )}
          <Sticker name="sparkle" size="clamp(40px, 4vw, 60px)" className="s-story-2" depth={-30} />
        </div>
      </div>
    </section>
  )
}

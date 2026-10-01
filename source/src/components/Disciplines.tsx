import { useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { disciplines } from '../data'
import PlayfulSticker from './PlayfulSticker'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../hooks/useSite'

type D = (typeof disciplines)[number]

function Card({ d }: { d: D }) {
  // 3D tilt toward the pointer (Motion). The card's slide-in and sticker spin are GSAP.
  const rx = useMotionValue(0)
  const ry = useMotionValue(0)
  const srx = useSpring(rx, { stiffness: 200, damping: 18 })
  const sry = useSpring(ry, { stiffness: 200, damping: 18 })

  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== 'mouse' || prefersReducedMotion()) return
    const r = e.currentTarget.getBoundingClientRect()
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16)
    rx.set(((e.clientY - r.top) / r.height - 0.5) * -16)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div className="discipline-slot">
      <motion.article
        className={`discipline c-${d.color}`}
        style={{ rotateX: srx, rotateY: sry, transformPerspective: 900 }}
        onPointerMove={onMove}
        onPointerLeave={reset}
      >
        <span className="discipline-n" aria-hidden>
          {d.n}
        </span>
        <div className="discipline-sticker">
          <PlayfulSticker name={d.sticker} />
        </div>
        <div className="discipline-body">
          <span className="pill">{d.meta}</span>
          <h3>{d.title}</h3>
          <p>{d.body}</p>
        </div>
      </motion.article>
    </div>
  )
}

export default function Disciplines() {
  const section = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      // Wide screens: pin the section and slide the cards sideways as you scroll down.
      mm.add('(min-width: 960px) and (prefers-reduced-motion: no-preference)', () => {
        const track = section.current!.querySelector<HTMLElement>('.h-track')!
        const distance = () => track.scrollWidth - window.innerWidth
        const slide = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: section.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        })
        // each sticker spins and each card bobs up as it crosses the screen
        gsap.utils.toArray<HTMLElement>('.discipline-slot').forEach((slot, i) => {
          gsap.fromTo(
            slot.querySelector('.discipline-sticker'),
            { rotate: -40, scale: 0.6 },
            {
              rotate: 30 + i * 15,
              scale: 1,
              ease: 'none',
              scrollTrigger: { trigger: slot, containerAnimation: slide, start: 'left right', end: 'right left', scrub: true },
            },
          )
          gsap.fromTo(
            slot,
            { yPercent: i % 2 ? 14 : -14, rotate: i % 2 ? 5 : -5 },
            {
              yPercent: 0,
              rotate: i % 2 ? 1.5 : -1.5,
              ease: 'none',
              scrollTrigger: { trigger: slot, containerAnimation: slide, start: 'left right', end: 'center center', scrub: true },
            },
          )
        })
      })

      // Narrow screens: cards pop in one by one as they arrive.
      mm.add('(max-width: 959px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.discipline-slot').forEach((slot, i) => {
          gsap.from(slot, {
            y: 80,
            rotate: i % 2 ? 6 : -6,
            opacity: 0,
            duration: 0.9,
            ease: 'back.out(1.6)',
            scrollTrigger: { trigger: slot, start: 'top 88%' },
          })
        })
      })
    },
    { scope: section },
  )

  return (
    <section className="disciplines" id="disciplines" ref={section}>
      <div className="h-track">
        <div className="disciplines-intro">
          <p className="eyebrow">
            <span>✦</span> What I do
          </p>
          <h2 className="section-title">
            My <em>disciplines</em>
          </h2>
          <p className="hand-note">keep scrolling, they slide →</p>
        </div>
        {disciplines.map((d) => (
          <Card key={d.n} d={d} />
        ))}
        <div className="h-spacer" aria-hidden />
      </div>
    </section>
  )
}

import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { motion, useInView, useSpring, useTransform } from 'motion/react'
import { animate, splitText, stagger } from 'animejs'
import Sticker from './Sticker'
import { asset } from '../data'
import { pointerX, pointerY, prefersReducedMotion, scrollToId, useMediaQuery } from '../hooks/useSite'
import RotatingText from './bits/RotatingText'
import Magnet from './bits/Magnet'
import { tier, whenIdle } from '../lib/perf'
import { useParty } from '../lib/disco'

const DiscoScene = lazy(() => import('./DiscoScene'))
const DiscoLights = lazy(() => import('./DiscoLights'))

function CountUp({ to, run, suffix = '' }: { to: number; run: boolean; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!run || !ref.current) return
    const obj = { v: 0 }
    const a = animate(obj, {
      v: to,
      duration: 1400,
      ease: 'outExpo',
      onUpdate: () => ref.current && (ref.current.textContent = `${Math.round(obj.v)}${suffix}`),
    })
    return () => void a.cancel()
  }, [run, to, suffix])
  return <span ref={ref}>{`${run ? 0 : to}${suffix}`}</span>
}

/** "I do ___" — the pill glides to each new word's width instead of snapping. */
function RotatorPill({ reduced }: { reduced: boolean }) {
  const inner = useRef<HTMLSpanElement>(null)
  const [width, setWidth] = useState<number | 'auto'>('auto')
  useEffect(() => {
    const el = inner.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.offsetWidth))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <motion.span
      className="rot-pill"
      animate={{ width }}
      transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9 }}
    >
      <span className="rot-inner" ref={inner}>
        <RotatingText
          texts={['Bharatanatyam', 'Waacking', 'battles', 'choreography', 'all of it']}
          splitLevelClassName="rot-split"
          staggerFrom="last"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '-120%' }}
          staggerDuration={0.025}
          transition={{ type: 'spring', damping: 30, stiffness: 400 }}
          rotationInterval={2200}
          auto={!reduced}
        />
      </span>
    </motion.span>
  )
}

export default function Hero({ ready }: { ready: boolean }) {
  const title = useRef<HTMLHeadingElement>(null)
  const section = useRef<HTMLElement>(null)
  const inView = useInView(section, { margin: '0px 0px -10% 0px' })
  const [reduced] = useState(prefersReducedMotion)
  const mouse = useMediaQuery('(pointer: fine) and (min-width: 960px)')
  const party = useParty()
  // the 3D disco starts after the intro, once the browser is idle, then fades in
  const [show3d, setShow3d] = useState(false)
  useEffect(() => {
    if (ready) whenIdle(() => setShow3d(true), 1200)
  }, [ready])
  const [partied, setPartied] = useState(false)
  useEffect(() => void (party && setPartied(true)), [party])

  // photo tilts gently toward the mouse
  const sx = useSpring(pointerX, { stiffness: 80, damping: 20 })
  const sy = useSpring(pointerY, { stiffness: 80, damping: 20 })
  const rotY = useTransform(sx, (v) => v * 8)
  const rotX = useTransform(sy, (v) => v * -6)

  // GSAP ScrollTrigger (loaded after first paint): as you scroll away on wide screens,
  // the photo sinks and tilts, the words drift up
  useEffect(() => {
    if (reduced || !ready || !window.matchMedia('(min-width: 960px)').matches) return
    let ctx: { revert: () => void } | undefined
    let cancelled = false
    import('../lib/gsap').then(({ gsap }) => {
      if (cancelled) return
      ctx = gsap.context(() => {
        const st = { trigger: section.current, start: 'top top', end: 'bottom top', scrub: 0.6 }
        gsap.to('.hero-visual', { yPercent: 22, scale: 0.88, rotate: -5, ease: 'none', scrollTrigger: st })
        gsap.to('.hero-copy', { yPercent: -18, opacity: 0.2, ease: 'none', scrollTrigger: st })
        gsap.to('.sunburst', { scale: 1.4, ease: 'none', scrollTrigger: st })
      }, section)
    })
    return () => {
      cancelled = true
      ctx?.revert()
    }
  }, [reduced, ready])

  // split the name into letters; each one bounces when you hover it
  useEffect(() => {
    const el = title.current
    if (!el) return
    const split = splitText(el, { chars: { class: 'char', wrap: 'clip' }, accessible: true })
    const chars = split.chars as HTMLElement[]
    if (!ready) {
      chars.forEach((c) => (c.style.transform = 'translateY(110%)'))
      return () => void split.revert()
    }
    if (!reduced) {
      animate(chars, {
        translateY: ['110%', '0%'],
        rotate: [() => (Math.random() - 0.5) * 40, 0],
        duration: 900,
        delay: stagger(55, { start: 150 }),
        ease: 'outElastic(1, .6)',
      })
    } else chars.forEach((c) => (c.style.transform = 'none'))

    const bounce = (e: Event) => {
      if (reduced) return
      animate(e.currentTarget as HTMLElement, {
        translateY: [0, -28, 0],
        rotate: [0, (Math.random() - 0.5) * 30, 0],
        duration: 700,
        ease: 'outElastic(1, .4)',
      })
    }
    chars.forEach((c) => c.addEventListener('pointerenter', bounce))
    return () => {
      chars.forEach((c) => c.removeEventListener('pointerenter', bounce))
      split.revert()
    }
  }, [ready, reduced])

  const rise = (d: number) => ({
    initial: { y: 40, opacity: 0 },
    animate: ready ? { y: 0, opacity: 1 } : {},
    transition: { delay: d, type: 'spring' as const, stiffness: 120, damping: 16 },
  })

  return (
    <section className={`hero ${party ? 'is-party' : ''} ${inView ? '' : 'is-offscreen'}`} id="top" ref={section}>
      <div className="sunburst" aria-hidden />
      <div className="party-dim" aria-hidden />
      {show3d && (
        <Suspense fallback={null}>
          {tier !== 'low' && <DiscoLights active={inView} />}
          <div className="disco-layer">
            <DiscoScene active={inView} reduced={reduced} eventSource={section} />
          </div>
        </Suspense>
      )}
      <p className={`hand-note disco-hint ${partied ? 'is-done' : ''}`} aria-hidden>
        swat me, or click for a party ↗
      </p>

      <div className="hero-copy">
        <motion.p className="eyebrow eyebrow-light" {...rise(0.1)}>
          <span>✦</span> Dancer · Choreographer · Freestyle artist
        </motion.p>

        <h1 className="hero-title" ref={title}>
          <span className="line">Kavya</span>
          <span className="line line-2">Bhat</span>
        </h1>

        <motion.p className="hand-note hero-note" {...rise(0.7)}>
          <svg viewBox="0 0 80 40" aria-hidden>
            <path d="M75 5 C60 30, 30 35, 8 22 M8 22 l10 -2 M8 22 l4 9" />
          </svg>
          classical roots, disco heart
        </motion.p>

        <motion.p className="hero-rotator" {...rise(0.45)}>
          <span>I do</span>
          <RotatorPill reduced={reduced} />
        </motion.p>

        <motion.p className="hero-lede" {...rise(0.5)}>
          Eight years of <strong>Bharatanatyam</strong> gave me the foundation. <strong>Waacking</strong> gave me
          wings. Now I do both, loudly, across India and London.
        </motion.p>

        <motion.div className="hero-ctas" {...rise(0.65)}>
          <Magnet padding={60} magnetStrength={4}>
          <a
            href="#contact"
            className="btn btn-sun btn-lg"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('contact')
            }}
          >
            Book me <span aria-hidden>✦</span>
          </a>
          </Magnet>
          <Magnet padding={60} magnetStrength={4}>
          <a
            href="#watch"
            className="btn btn-ghost btn-lg"
            onClick={(e) => {
              e.preventDefault()
              scrollToId('watch')
            }}
          >
            <span className="play-dot" aria-hidden>
              ▶
            </span>{' '}
            Watch me move
          </a>
          </Magnet>
        </motion.div>

        <motion.dl className="stats" {...rise(0.8)}>
          <div>
            <dt>Years training</dt>
            <dd>
              <CountUp to={8} suffix="+" run={ready && !reduced} />
            </dd>
          </div>
          <div>
            <dt>Countries</dt>
            <dd>
              <CountUp to={2} run={ready && !reduced} />
            </dd>
          </div>
          <div>
            <dt>Passion</dt>
            <dd className="spin-infinity">∞</dd>
          </div>
        </motion.dl>
      </div>

      <div className="hero-visual">
        <motion.div
          className="arch"
          style={mouse ? { rotateX: rotX, rotateY: rotY, transformPerspective: 1200 } : undefined}
          initial={{ y: 120, opacity: 0, rotate: 8 }}
          animate={ready ? { y: 0, opacity: 1, rotate: 3 } : {}}
          transition={{ delay: 0.35, type: 'spring', stiffness: 70, damping: 14 }}
        >
          <img
            src={asset('media/kavya.webp')}
            alt="Kavya in a marigold dress walking down cobalt-blue steps"
            width={900}
            height={1600}
            fetchPriority="high"
          />
          <span className="arch-bubble">hi, I’m Kavya!</span>
        </motion.div>

        <Sticker name="marigold" size="clamp(90px, 11vw, 150px)" className="s-hero-marigold" depth={28} rotate={-12} />
        <Sticker name="ghungroo" size="clamp(100px, 13vw, 190px)" className="s-hero-ghungroo" depth={-36} rotate={10} />
        <Sticker name="sparkle" size="clamp(44px, 5vw, 70px)" className="s-hero-sparkle" depth={50} />
        <Sticker name="jasmine" size="clamp(120px, 15vw, 220px)" className="s-hero-jasmine" depth={18} rotate={-20} />
      </div>

      <svg className="hero-wave" viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40c160 50 320 50 480 0s320-50 480 0 320 50 480 0v50H0z" />
      </svg>
    </section>
  )
}

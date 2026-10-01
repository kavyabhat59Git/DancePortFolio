import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import Sticker from './Sticker'
import { asset, videos } from '../data'
import { gsap, useGSAP } from '../lib/gsap'

/** Shows a still first; YouTube only loads once someone presses play. */
function VideoCard({ v, i }: { v: (typeof videos)[number]; i: number }) {
  const [playing, setPlaying] = useState(false)
  const tilt = i % 2 ? 4 : -4
  return (
    <div className="video-par">
    <motion.figure
      className="video-card"
      initial={{ y: 100, rotate: tilt * 3, opacity: 0 }}
      whileInView={{ y: 0, rotate: tilt, opacity: 1 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      whileHover={playing ? undefined : { rotate: 0, y: -10, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 120, damping: 14 }}
    >
      <div className="video-frame">
        {playing ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1`}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button className="video-poster" onClick={() => setPlaying(true)} data-cursor="play" aria-label={`Play ${v.title}`}>
            <img src={asset(v.poster)} alt="" loading="lazy" />
            <span className="play-btn" aria-hidden>
              <svg viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
        )}
      </div>
      <figcaption>
        <span className="pill">{v.label}</span>
        <span className="video-title">{v.title}</span>
      </figcaption>
    </motion.figure>
    </div>
  )
}

export default function Watch() {
  const ref = useRef<HTMLElement>(null)
  // GSAP ScrollTrigger parallax: the two phones drift at different speeds
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 760px) and (prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.video-par').forEach((el, i) => {
          gsap.fromTo(
            el,
            { yPercent: i % 2 ? 16 : -6 },
            {
              yPercent: i % 2 ? -10 : 8,
              ease: 'none',
              scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
            },
          )
        })
      })
    },
    { scope: ref },
  )

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect()
    ref.current!.style.setProperty('--mx', `${e.clientX - r.left}px`)
    ref.current!.style.setProperty('--my', `${e.clientY - r.top}px`)
  }

  return (
    <section className="watch" id="watch" ref={ref} onPointerMove={onMove}>
      <div className="spotlight" aria-hidden />
      <div className="disco-flecks dim" aria-hidden />
      <div className="container">
        <p className="eyebrow eyebrow-light">
          <span>✦</span> Watch me move
        </p>
        <h2 className="section-title light">
          See the <em>work</em>
        </h2>
        <p className="hand-note watch-note">turn the sound up ↓</p>
        <div className="videos">
          {videos.map((v, i) => (
            <VideoCard key={v.id} v={v} i={i} />
          ))}
        </div>
      </div>
      <Sticker name="vinyl" size="clamp(110px, 14vw, 200px)" className="s-watch-vinyl spin-slow" depth={24} bob={false} />
      <Sticker name="mic" size="clamp(90px, 11vw, 160px)" className="s-watch-mic" depth={-30} rotate={-14} />
    </section>
  )
}

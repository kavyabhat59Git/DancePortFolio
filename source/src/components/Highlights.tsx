import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { animate, createDraggable, type Draggable } from 'animejs'
import { highlights } from '../data'
import PlayfulSticker from './PlayfulSticker'
import { prefersReducedMotion, useMediaQuery } from '../hooks/useSite'

const TILTS = [-6, 4, -3, 7, -5, 3]

export default function Highlights() {
  const board = useRef<HTMLDivElement>(null)
  const drags = useRef<Draggable[]>([])
  const canDrag = useMediaQuery('(min-width: 960px) and (pointer: fine)')

  useEffect(() => {
    if (!canDrag || !board.current) return
    let z = 10
    const cards = board.current.querySelectorAll<HTMLElement>('.hl-card')
    drags.current = [...cards].map((card) =>
      createDraggable(card, {
        container: board.current!.closest('section')!,
        containerPadding: 8,
        releaseStiffness: 120,
        releaseDamping: 12,
        onGrab: (d) => {
          const el = d.$target as HTMLElement
          el.style.zIndex = String(++z)
          el.classList.add('is-grabbed')
        },
        onRelease: (d) => (d.$target as HTMLElement).classList.remove('is-grabbed'),
      }),
    )
    return () => {
      drags.current.forEach((d) => d.revert())
      drags.current = []
    }
  }, [canDrag])

  const tidy = () => {
    drags.current.forEach((d) => {
      animate(d.$target as HTMLElement, {
        x: 0,
        y: 0,
        duration: prefersReducedMotion() ? 0 : 700,
        ease: 'outElastic(1, .7)',
        onComplete: () => d.setX(0).setY(0),
      })
    })
  }

  return (
    <section className="highlights" id="highlights">
      <div className="container">
        <div className="hl-head">
          <div>
            <p className="eyebrow">
              <span>✦</span> Highlights
            </p>
            <h2 className="section-title">
              Performances <em>&</em> achievements
            </h2>
          </div>
          {canDrag && (
            <div className="hl-actions">
              <p className="hand-note">psst… these are stickers. drag them around!</p>
              <button className="btn btn-ink" onClick={tidy}>
                Tidy up ✦
              </button>
            </div>
          )}
        </div>

        <div className={`hl-board ${canDrag ? 'is-draggable' : ''}`} ref={board}>
          {highlights.map((h, i) => (
            // outer div is moved by anime.js dragging, inner card by Motion — so they never fight
            <div key={h.title} className={`hl-card hl-pos-${i}`} data-cursor={canDrag ? 'drag' : undefined}>
              <motion.article
                className="hl-inner"
                initial={{ opacity: 0, scale: 0.4, rotate: TILTS[i] * 4 }}
                whileInView={{ opacity: 1, scale: 1, rotate: TILTS[i] }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ type: 'spring', stiffness: 180, damping: 12, delay: (i % 3) * 0.08 }}
              >
                <PlayfulSticker name={h.sticker} className="hl-sticker" label />
                <h3>{h.title}</h3>
                <p>{h.body}</p>
              </motion.article>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

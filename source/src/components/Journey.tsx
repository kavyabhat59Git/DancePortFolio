import { useRef } from 'react'
import { motion, useScroll, useSpring } from 'motion/react'
import { journey } from '../data'
import PlayfulSticker from './PlayfulSticker'

export default function Journey() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] })
  const pathLength = useSpring(scrollYProgress, { stiffness: 90, damping: 24 })

  return (
    <section className="journey" aria-labelledby="journey-title">
      <div className="container">
        <p className="eyebrow">
          <span>✦</span> The journey so far
        </p>
        <h2 className="section-title" id="journey-title">
          From temple stage <em>to</em> London battles
        </h2>

        <div className="journey-track" ref={ref}>
          <svg className="journey-line" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden>
            <path className="journey-line-ghost" d="M50 0 C 90 100, 10 200, 50 300 S 90 500, 50 600 S 10 800, 50 1000" />
            <motion.path
              d="M50 0 C 90 100, 10 200, 50 300 S 90 500, 50 600 S 10 800, 50 1000"
              style={{ pathLength }}
            />
          </svg>

          <ol className="milestones">
            {journey.map((m, i) => (
              <motion.li
                key={m.title}
                className={`milestone c-${m.color} ${i % 2 ? 'right' : 'left'}`}
                initial={{ opacity: 0, scale: 0.7, rotate: i % 2 ? 8 : -8, y: 60 }}
                whileInView={{ opacity: 1, scale: 1, rotate: i % 2 ? 1.5 : -1.5, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -15% 0px' }}
                transition={{ type: 'spring', stiffness: 140, damping: 14 }}
                whileHover={{ rotate: 0, scale: 1.03 }}
              >
                <span className="milestone-dot" aria-hidden />
                <PlayfulSticker name={m.sticker} className="milestone-sticker" label />
                <span className="pill">{m.tag}</span>
                <h3>{m.title}</h3>
                <p>{m.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

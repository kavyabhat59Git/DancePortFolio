import { lazy, Suspense, useRef, useState } from 'react'
import { motion, useInView } from 'motion/react'
import CircularText from './bits/CircularText'
import Magnet from './bits/Magnet'
import { burst as petalBurst } from '../lib/fx'
import Sticker from './Sticker'
import { contact, opportunityTypes, stickerSmall } from '../data'
import { prefersReducedMotion } from '../hooks/useSite'
import { tier } from '../lib/perf'

const PetalShower = lazy(() => import('./PetalShower'))

/** Headline whose letters bob like a crowd. */
function Wavy({ text }: { text: string }) {
  return (
    <span className="wavy" aria-label={text}>
      {text.split(' ').map((word, w, words) => {
        const offset = words.slice(0, w).join(' ').length + (w ? 1 : 0)
        return (
          <span key={w} className="wavy-word" aria-hidden>
            {[...word].map((c, i) => (
              <span key={i} style={{ animationDelay: `${(offset + i) * 0.07}s` }}>
                {c}
              </span>
            ))}
            {w < words.length - 1 && ' '}
          </span>
        )
      })}
    </span>
  )
}

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const btn = useRef<HTMLButtonElement>(null)
  const section = useRef<HTMLElement>(null)
  const inView = useInView(section, { margin: '100px 0px' })
  const [reduced] = useState(prefersReducedMotion)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.location.href = `mailto:${contact.email}`
    }
  }

  // No server: the form just opens the visitor's own email app, pre-filled.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const name = String(f.get('name') ?? '').trim()
    const email = String(f.get('email') ?? '').trim()
    const type = String(f.get('type') ?? '')
    const message = String(f.get('message') ?? '').trim()
    const subject = `${type} enquiry from ${name}`
    const body = `${message}\n\n${name}\n${email}`
    if (btn.current) {
      const r = btn.current.getBoundingClientRect()
      petalBurst(r.left + r.width / 2, r.top + r.height / 2, undefined, 28)
    }
    setTimeout(
      () =>
        (window.location.href = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`),
      450,
    )
  }

  return (
    <section className="contact" id="contact" ref={section}>
      <div className="sunburst slow" aria-hidden />
      {!reduced && tier !== 'low' && (
        <div className="petal-layer" aria-hidden>
          <Suspense fallback={null}>
            <PetalShower active={inView} count={tier === 'high' ? 70 : 32} />
          </Suspense>
        </div>
      )}
      <div className="container contact-grid">
        <div className="contact-copy">
          <p className="eyebrow eyebrow-light">
            <span>✦</span> Get in touch
          </p>
          <div className="badge" aria-hidden data-cursor="wheee">
            <CircularText text="BOOK ME ✦ LET'S DANCE ✦ " spinDuration={14} onHover="goBonkers" className="badge-ring" />
            <img src={stickerSmall('trophy')} alt="" className="badge-center" />
          </div>
          <h2 className="contact-title">
            Book me for <Wavy text="your project" />
          </h2>
          <p className="contact-lede">
            If you’ve got a stage, a project, or a class that needs some life breathed into it, let’s talk. I’m based
            in London but genuinely love an excuse to travel.
          </p>

          <ul className="contact-links">
            <li>
              <span className="cl-label">Email</span>
              <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <button className="copy-btn" onClick={copyEmail} aria-live="polite">
                {copied ? 'Copied! ✦' : 'Copy'}
              </button>
            </li>
            <li>
              <span className="cl-label">Instagram</span>
              <a href={contact.instagramUrl} target="_blank" rel="noreferrer">
                @{contact.instagram}
              </a>
            </li>
            <li>
              <span className="cl-label">Based in</span>
              <span>{contact.location}</span>
            </li>
          </ul>
        </div>

        <motion.form
          className="contact-form"
          onSubmit={onSubmit}
          initial={{ y: 80, rotate: 6, opacity: 0 }}
          whileInView={{ y: 0, rotate: 1.5, opacity: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ type: 'spring', stiffness: 100, damping: 14 }}
        >
          <span className="form-tape" aria-hidden />
          <label>
            Your name
            <input name="name" required autoComplete="name" placeholder="Who’s asking?" />
          </label>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </label>
          <fieldset>
            <legend>What’s the opportunity?</legend>
            <div className="chips">
              {opportunityTypes.map((t, i) => (
                <label key={t} className="chip">
                  <input type="radio" name="type" value={t} defaultChecked={i === 0} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            Message
            <textarea name="message" rows={4} required placeholder="Dates, place, vibe…" />
          </label>
          <Magnet padding={50} magnetStrength={5} wrapperClassName="send-wrap">
            <button className="btn btn-pink btn-lg send-btn" ref={btn} type="submit">
              Send it <span aria-hidden>→</span>
            </button>
          </Magnet>
          <p className="form-note">This opens your email app with everything filled in. Nothing is saved on this site.</p>
        </motion.form>
      </div>
      <Sticker name="bus" size="clamp(120px, 14vw, 210px)" className="s-contact-bus" depth={26} rotate={-6} />
      <Sticker name="rickshaw" size="clamp(100px, 12vw, 180px)" className="s-contact-rickshaw" depth={-22} rotate={8} />
    </section>
  )
}

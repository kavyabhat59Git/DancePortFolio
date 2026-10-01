import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { lockScroll, scrollToId } from '../hooks/useSite'

const links = [
  { id: 'about', label: 'About' },
  { id: 'watch', label: 'Watch' },
  { id: 'disciplines', label: 'What I do' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'contact', label: 'Contact' },
]

export default function Nav() {
  const { scrollY } = useScroll()
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (v) => {
    const prev = scrollY.getPrevious() ?? 0
    setHidden(v > prev && v > 300 && !open)
    setScrolled(v > 40)
  })

  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    setOpen(false)
    // wait a beat so the menu can close before we glide
    setTimeout(() => scrollToId(id), open ? 350 : 0)
  }

  return (
    <>
      <motion.header
        className={`nav ${scrolled ? 'is-scrolled' : ''}`}
        animate={{ y: hidden ? '-130%' : '0%' }}
        transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      >
        <a href="#top" className="nav-logo" onClick={go('top')} aria-label="Kavya Bhat, back to top">
          Kavya<span className="nav-star">✦</span>
        </a>
        <nav aria-label="Main">
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} onClick={go(l.id)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <a href="#contact" className="btn btn-sun nav-cta" onClick={go('contact')}>
          Book me
        </a>
        <button
          className="nav-burger"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="burger-lines" aria-hidden>
            <i />
            <i />
          </span>
          {open ? 'Close' : 'Menu'}
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="mobile-menu"
            initial={{ clipPath: 'circle(0% at 92% 4%)' }}
            animate={{ clipPath: 'circle(150% at 92% 4%)' }}
            exit={{ clipPath: 'circle(0% at 92% 4%)' }}
            transition={{ duration: 0.6, ease: [0.7, 0, 0.2, 1] }}
          >
            <ul>
              {[...links, { id: 'top', label: 'Back to top' }].map((l, i) => (
                <motion.li
                  key={l.id}
                  initial={{ y: 60, opacity: 0, rotate: -6 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 200, damping: 16 }}
                >
                  <a href={`#${l.id}`} onClick={go(l.id)}>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

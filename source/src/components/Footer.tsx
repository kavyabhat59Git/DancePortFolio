import { motion } from 'motion/react'
import { contact } from '../data'
import { scrollToId } from '../hooks/useSite'

export default function Footer() {
  return (
    <footer className="footer">
      <motion.p
        className="footer-name"
        initial={{ y: '60%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: 'spring', stiffness: 80, damping: 16 }}
        aria-hidden
      >
        Kavya Bhat
      </motion.p>
      <div className="footer-row">
        <p>
          © {new Date().getFullYear()} · Bharatanatyam · Waacking · London
        </p>
        <p className="footer-links">
          <a href={`mailto:${contact.email}`}>Email</a>
          <a href={contact.instagramUrl} target="_blank" rel="noreferrer">
            Instagram
          </a>
        </p>
        <button className="to-top" onClick={() => scrollToId('top')}>
          5 · 6 · 7 · 8 <span aria-hidden>↑</span> back to top
        </button>
      </div>
    </footer>
  )
}

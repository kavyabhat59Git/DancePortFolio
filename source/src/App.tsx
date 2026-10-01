import { lazy, startTransition, Suspense, useEffect, useState } from 'react'
import { MotionConfig } from 'motion/react'
import { bindPointer, useSmoothScroll } from './hooks/useSite'
import { whenIdle } from './lib/perf'
import Loader from './components/Loader'
import Cursor from './components/Cursor'
import ScrollProgress from './components/ScrollProgress'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Marquee from './components/Marquee'
import ClickSpark from './components/bits/ClickSpark'

const BelowFold = lazy(() => import('./components/BelowFold'))
const Footer = lazy(() => import('./components/BelowFold').then((m) => ({ default: m.Footer })))

const SPARK_COLORS = ['#FFD60A', '#FF3D8B', '#FF9F1C', '#2335D9']

export default function App() {
  const [ready, setReady] = useState(false)
  // build the lower sections in small slices so the phone never freezes while they appear
  const [showRest, setShowRest] = useState(false)
  useEffect(() => {
    if (ready) startTransition(() => setShowRest(true))
  }, [ready])
  useSmoothScroll()
  useEffect(bindPointer, [])
  // fetch the rest of the page in the background while the intro plays
  useEffect(() => whenIdle(() => void import('./components/BelowFold'), 800), [])

  return (
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#about">
        Skip to content
      </a>
      <Loader onReveal={() => setReady(true)} />
      <Cursor />
      <ScrollProgress />
      <ClickSpark colors={SPARK_COLORS} />
      <Nav />
      <main>
        <Hero ready={ready} />
        <Marquee />
        {/* the rest of the page loads while the 5-6-7-8 intro plays */}
        {showRest && (
          <Suspense fallback={<div className="below-fold-placeholder" />}>
            <BelowFold />
          </Suspense>
        )}
      </main>
      {showRest && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
      <div className="grain" aria-hidden />
    </MotionConfig>
  )
}

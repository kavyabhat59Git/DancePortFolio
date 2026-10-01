// Everything below the hero, in its own bundle so the top of the page can show first.
import About from './About'
import Journey from './Journey'
import Watch from './Watch'
import Disciplines from './Disciplines'
import Highlights from './Highlights'
import CurveBand from './CurveBand'
import Contact from './Contact'
import FooterSection from './Footer'

export default function BelowFold() {
  return (
    <>
      <About />
      <Journey />
      <Watch />
      <Disciplines />
      <Highlights />
      <CurveBand />
      <Contact />
    </>
  )
}

export const Footer = FooterSection

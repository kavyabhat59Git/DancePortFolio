import CurvedLoop from './bits/CurvedLoop'
import { prefersReducedMotion } from '../hooks/useSite'

/** React Bits CurvedLoop: a swooping text ribbon you can grab and fling. */
export default function CurveBand() {
  return (
    <div className="curve-band" data-cursor="drag">
      <CurvedLoop
        marqueeText="Let’s dance ✦ Book Kavya ✦ Shows ✦ Battles ✦ Workshops ✦ Music videos ✦ "
        speed={prefersReducedMotion() ? 0 : 1.6}
        curveAmount={160}
        direction="left"
        interactive
        className="curve-text"
      />
    </div>
  )
}

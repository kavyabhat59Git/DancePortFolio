// What each sticker does when you click it. Animates the wrapper span (never the
// image itself, which may already be bobbing via CSS).
import { animate, createTimeline } from 'animejs'
import type { StickerName } from '../data'
import { prefersReducedMotion } from '../hooks/useSite'
import { bubble, burst, centerOf, JASMINE, MARIGOLD, notes, smoke, sparks } from './fx'

export const stickerCursor: Partial<Record<StickerName, string>> = {
  ghungroo: 'jingle!',
  mudra: 'flick!',
  marigold: 'bloom!',
  jasmine: 'scatter!',
  sparkle: 'twinkle!',
  trophy: 'cheer!',
  vinyl: 'scratch!',
  mic: 'sing!',
  rickshaw: 'vroom!',
  bus: 'honk!',
  sneaker: 'hop!',
}

function driveOff(el: HTMLElement, text: string, color: string) {
  const { x, y, r } = centerOf(el)
  bubble(x, r.top, text, color)
  const out = window.innerWidth - r.left + 60
  const back = r.right + 60
  smoke(r.left + r.width * 0.15, r.bottom - r.height * 0.2)
  createTimeline({ onComplete: () => delete el.dataset.playing })
    // engine revving
    .add(el, { translateX: [0, -8, 6, -8, 6, -4, 0], rotate: [0, -2, 2, -2, 0], duration: 600, ease: 'linear' })
    .call(() => smoke(r.left + r.width * 0.15, r.bottom - r.height * 0.2), 300)
    // zoom off to the right with a little wheelie
    .add(el, { translateX: out, rotate: [0, -6, 0], duration: 650, ease: 'inQuad' })
    .set(el, { translateX: -back })
    // and roll back in from the left
    .add(el, { translateX: 0, duration: 900, ease: 'outBack(1.2)' }, '+=350')
  void y
}

export function playSticker(el: HTMLElement, name: StickerName) {
  if (el.dataset.playing) return
  el.dataset.playing = '1'
  const done = () => delete el.dataset.playing
  const { x, y, r } = centerOf(el)

  if (prefersReducedMotion()) {
    // still give feedback, just without the motion
    const words: Partial<Record<StickerName, string>> = { rickshaw: 'vroom vroom!', bus: 'honk honk!', ghungroo: 'jingle!' }
    bubble(x, r.top, words[name] ?? '✦')
    setTimeout(done, 600)
    return
  }

  switch (name) {
    case 'rickshaw':
      return driveOff(el, 'vroom vroom!', 'var(--sun)')
    case 'bus':
      return driveOff(el, 'honk honk!', 'var(--cream)')
    case 'ghungroo':
      bubble(x, r.top, 'jingle jingle!')
      sparks(x, y, 8)
      animate(el, {
        rotate: [0, -16, 16, -14, 14, -10, 10, -5, 0],
        translateY: [0, -12, 0, -8, 0],
        duration: 900,
        ease: 'linear',
        onComplete: done,
      })
      return
    case 'mudra':
      bubble(x, r.top, 'ta ka dhi mi!', 'var(--pink)')
      sparks(x, r.top + r.height * 0.3, 8)
      animate(el, {
        rotate: [0, -38, 24, -12, 0],
        scale: [1, 1.25, 1.1, 1],
        translateY: [0, -20, 0],
        duration: 1100,
        ease: 'outElastic(1, .5)',
        onComplete: done,
      })
      return
    case 'marigold':
      burst(x, y, MARIGOLD, 26)
      animate(el, { rotate: [0, 360], scale: [1, 1.3, 1], duration: 900, ease: 'outBack(1.6)', onComplete: done })
      return
    case 'jasmine':
      burst(x, y, JASMINE, 22, 130)
      animate(el, { rotate: [0, 16, -16, 10, -6, 0], duration: 1000, ease: 'inOutSine', onComplete: done })
      return
    case 'sparkle':
      sparks(x, y, 12)
      animate(el, { rotate: [0, 720], scale: [1, 1.7, 1], duration: 900, ease: 'outBack(1.4)', onComplete: done })
      return
    case 'trophy':
      bubble(x, r.top, 'champion!')
      burst(x, r.top + 20, ['#FFD60A', '#E0A526', '#FFF4E0', '#FF3D8B'], 28)
      animate(el, { translateY: [0, -70, 0], rotate: [0, 360], duration: 1000, ease: 'outBack(1.4)', onComplete: done })
      return
    case 'vinyl':
      bubble(x, r.top, 'wikka wikka!', 'var(--pink)')
      animate(el, { rotate: [0, -120, 80, -60, 360], duration: 1200, ease: 'inOutQuad', onComplete: done })
      return
    case 'mic':
      bubble(x, r.top, 'mic check!')
      notes(x, r.top + 10)
      animate(el, {
        rotate: [0, -28, 20, -12, 6, 0],
        scale: [1, 1.15, 1],
        duration: 1200,
        ease: 'outElastic(1, .4)',
        onComplete: done,
      })
      return
    case 'sneaker':
      bubble(x, r.top, '5, 6, 7, 8!', 'var(--pink)')
      sparks(x, r.bottom - 10, 8)
      animate(el, {
        translateY: [0, -70, 0, -30, 0],
        rotate: [0, -20, 8, -6, 0],
        duration: 1100,
        ease: 'outQuad',
        onComplete: done,
      })
      return
  }
}

import { useRef } from 'react'
import { sticker, stickerAlt, stickerSet, type StickerName } from '../data'
import { playSticker, stickerCursor } from '../lib/playSticker'

type Props = {
  name: StickerName
  /** class for the clickable wrapper (put positioning here) */
  className?: string
  imgClassName?: string
  label?: boolean
  lazy?: boolean
}

/**
 * A sticker you can click (or tap / press Enter on) to make it do its trick.
 * Ignores the click that ends a drag, so draggable cards don't fire by accident.
 */
export default function PlayfulSticker({ name, className = '', imgClassName, label = false, lazy = true }: Props) {
  const ref = useRef<HTMLSpanElement>(null)
  const down = useRef<{ x: number; y: number } | null>(null)

  const play = () => ref.current && playSticker(ref.current, name)

  return (
    <span
      ref={ref}
      className={`play ${className}`}
      role="button"
      tabIndex={0}
      aria-label={`${stickerAlt[name]}: click for a surprise`}
      data-cursor={stickerCursor[name]}
      onPointerDown={(e) => (down.current = { x: e.clientX, y: e.clientY })}
      onClick={(e) => {
        const d = down.current
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 6) return
        e.stopPropagation()
        play()
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          play()
        }
      }}
    >
      <img
        className={imgClassName}
        src={sticker(name)}
        srcSet={stickerSet(name)}
        sizes="(max-width: 959px) 150px, 220px"
        alt={label ? stickerAlt[name] : ''}
        draggable={false}
        loading={lazy ? 'lazy' : undefined}
      />
    </span>
  )
}

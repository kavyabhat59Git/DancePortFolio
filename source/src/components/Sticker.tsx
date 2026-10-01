import type { CSSProperties } from 'react'
import { motion, useSpring, useTransform } from 'motion/react'
import { pointerX, pointerY } from '../hooks/useSite'
import type { StickerName } from '../data'
import PlayfulSticker from './PlayfulSticker'

type Props = {
  name: StickerName
  size: string
  className?: string
  style?: CSSProperties
  /** How far it drifts with the mouse, in px. 0 = stays put. */
  depth?: number
  rotate?: number
  bob?: boolean
  /** Give it alt text only when it carries meaning. */
  label?: boolean
}

export default function Sticker({
  name,
  size,
  className = '',
  style,
  depth = 0,
  rotate = 0,
  bob = true,
  label = false,
}: Props) {
  const sx = useSpring(pointerX, { stiffness: 60, damping: 18 })
  const sy = useSpring(pointerY, { stiffness: 60, damping: 18 })
  const x = useTransform(sx, (v) => v * depth)
  const y = useTransform(sy, (v) => v * depth)

  return (
    <motion.div
      className={`sticker ${className}`}
      style={{ width: size, x, y, rotate, ...style }}
      whileHover={{ scale: 1.12, rotate: rotate + 8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
    >
      <PlayfulSticker name={name} imgClassName={bob ? 'bob' : undefined} label={label} />
    </motion.div>
  )
}

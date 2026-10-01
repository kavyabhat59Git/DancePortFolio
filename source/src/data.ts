// All of Kavya's words live here, so copy edits never touch layout code.

export const BASE = import.meta.env.BASE_URL

export const asset = (p: string) => `${BASE}${p}`

export const contact = {
  email: 'kavyabhat59@gmail.com',
  instagram: 'kavv_yeaah',
  instagramUrl: 'https://instagram.com/kavv_yeaah',
  location: 'London, United Kingdom',
}

export const styles = [
  'Bharatanatyam',
  'Waacking',
  'Choreographer',
  'Battle Artist',
  'Dance Fitness',
]

export const story = [
  "Honestly? I can't remember a time when I wasn't dancing. I grew up with Bharatanatyam: the discipline, the storytelling, the sheer physical precision of it. It shaped everything about how I move.",
  'Then Waacking found me, and my world got a lot bigger and a lot louder. I fell completely in love with its attitude, its history, its freedom. I competed, won battles, co-founded BaangWaack (Bangalore’s first Waacking crew!), and eventually found my people at House of Suraj in London.',
  'These days I perform, choreograph, teach, and generally cause a scene on whatever stage I can find. I bring the same joy to a beginner workshop as I do to Black Pride. Come find me.',
]

export const journey = [
  {
    title: 'Karnataka State Board',
    tag: 'Merit award',
    body: 'Junior level Bharatanatyam: recognised merit for classical dance excellence.',
    sticker: 'ghungroo',
    color: 'crimson',
  },
  {
    title: 'Attakalari: Sankshipta 6.0',
    tag: '6-month residency',
    body: 'Intensive at Attakalari Centre for Movement Arts, Bangalore. Bharatanatyam, Yoga, Kalaripayattu & Contemporary.',
    sticker: 'mudra',
    color: 'marigold',
  },
  {
    title: 'Cult Fit',
    tag: 'Dance fitness instructor',
    body: '8 months of high-energy dance fitness classes for all kinds of bodies across India.',
    sticker: 'sneaker',
    color: 'pink',
  },
  {
    title: 'BaangWaack',
    tag: 'Co-founder',
    body: 'Co-founded Bangalore’s first Waacking crew and helped build the city’s battle scene.',
    sticker: 'rickshaw',
    color: 'sun',
  },
  {
    title: 'House of Suraj, London',
    tag: 'Member',
    body: 'Performing in major shows including Black Pride, music videos, and teaching Waacking internationally.',
    sticker: 'bus',
    color: 'blue',
  },
] as const

export const videos = [
  {
    id: '93NmWNcGPsU',
    title: 'Waacking: Choreography',
    label: 'Performance',
    poster: 'media/choreo.webp',
  },
  {
    id: 'j-R2QtaqqY8',
    title: 'Waacking: Battle',
    label: 'Freestyle',
    poster: 'media/battle.webp',
  },
]

export const disciplines = [
  {
    n: '01',
    title: 'Choreographer',
    meta: 'Shows · Music videos · House of Suraj London',
    body: 'Creating and directing movement for live shows, music videos and classes, from intimate studios to large productions like Black Pride London.',
    sticker: 'mic',
    color: 'pink',
  },
  {
    n: '02',
    title: 'Freestyle & Battles',
    meta: 'Advanced · Multi-title winner',
    body: 'Battle-tested at advanced level in solo and crew formats across India. Multiple titles, and a co-founder of Bangalore’s Waacking battle scene.',
    sticker: 'trophy',
    color: 'sun',
  },
  {
    n: '03',
    title: 'Classical Performance',
    meta: '8+ years · Karnataka State Board merit',
    body: 'Over 8 years of structured training: abhinaya (expression), nritta (pure technique) and nritya (the two together).',
    sticker: 'mudra',
    color: 'marigold',
  },
  {
    n: '04',
    title: 'Dance Fitness',
    meta: 'Instructor · Cult Fit · 8 months',
    body: 'High-energy sessions blending real dance technique with cardio, so dance feels open to every body.',
    sticker: 'sneaker',
    color: 'blue',
  },
] as const

export const highlights: { title: string; body: string; sticker: StickerName }[] = [
  {
    title: 'Battle titles won',
    body: 'Multiple Waacking battle wins across Bangalore and India, solo and crew.',
    sticker: 'trophy',
  },
  {
    title: 'Black Pride London',
    body: 'Performed at one of the UK’s most celebrated LGBTQ+ cultural events with House of Suraj.',
    sticker: 'bus',
  },
  {
    title: 'Music video performer',
    body: 'Featured dancer in professional music videos, bringing Waacking to screen.',
    sticker: 'vinyl',
  },
  {
    title: 'Attakalari residency',
    body: 'Selected for the 6-month Sankshipta 6.0 at one of India’s leading movement institutions.',
    sticker: 'mudra',
  },
  {
    title: 'Co-founded BaangWaack',
    body: 'The first-ever Waacking crew in Bangalore, building community around the form.',
    sticker: 'rickshaw',
  },
  {
    title: 'Waacking teacher',
    body: 'Beginner to advanced classes for HipHop India Foundation, plus workshops and masterclasses.',
    sticker: 'mic',
  },
]

export const opportunityTypes = [
  'Performance',
  'Choreography',
  'Workshop or class',
  'Music video',
  'Battle or judging',
  'Something else',
]

export type StickerName =
  | 'ghungroo'
  | 'mudra'
  | 'marigold'
  | 'jasmine'
  | 'trophy'
  | 'bus'
  | 'rickshaw'
  | 'vinyl'
  | 'sparkle'
  | 'mic'
  | 'sneaker'

export const stickerAlt: Record<StickerName, string> = {
  ghungroo: 'Ankle bells (ghungroo)',
  mudra: 'Hand in a lotus mudra',
  marigold: 'Marigold flower',
  jasmine: 'String of jasmine flowers',
  trophy: 'Battle trophy topped with a disco ball',
  bus: 'London bus wearing a marigold garland',
  rickshaw: 'Bangalore auto-rickshaw',
  vinyl: 'Vinyl record',
  sparkle: 'Sparkle',
  mic: 'Retro microphone',
  sneaker: 'Dance sneaker mid-hop',
}

export const sticker = (name: StickerName) => asset(`stickers/${name}.webp`)
/** two sizes so phones download the small one */
export const stickerSet = (name: StickerName) =>
  `${asset(`stickers/${name}-320.webp`)} 320w, ${asset(`stickers/${name}.webp`)} 640w`
export const stickerSmall = (name: StickerName) => asset(`stickers/${name}-320.webp`)

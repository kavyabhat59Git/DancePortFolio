import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { useGSAP } from '@gsap/react'
import { onLenis } from '../hooks/useSite'

gsap.registerPlugin(ScrollTrigger, Draggable, useGSAP)

// keep ScrollTrigger in step with Lenis smooth scrolling
onLenis((l) => l.on('scroll', ScrollTrigger.update))

export { gsap, ScrollTrigger, useGSAP }

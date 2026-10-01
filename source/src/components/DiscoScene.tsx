// The hero's disco ball (React Three Fiber + drei).
// It shows straight away as a plain spinning ball with beams, glints and party mode,
// then swaps to the physics version (DiscoPhysics) once the physics engine has downloaded.
import { lazy, Suspense, useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import * as THREE from 'three'
import { disco, isParty, setCursorLabel, startParty, stopParty } from '../lib/disco'
import { Beams, Glints, MirrorBall, useLayout } from './DiscoParts'
import { runtime, tier, whenIdle } from '../lib/perf'

const DiscoPhysics = lazy(() => import('./DiscoPhysics'))

/** Same look as the physics ball, minus swinging and loose tiles. */
function PlainBall({ reduced, onPlay }: { reduced: boolean; onPlay: () => void }) {
  const { R, x, y, top, halfW } = useLayout()
  const ball = useRef<THREE.Group>(null)
  const spinSpeed = useRef(0.45)
  const string = useMemo(() => ({ len: top + 0.2 - y, mid: (top + 0.2 + y) / 2 }), [top, y])

  useFrame((_, dt) => {
    const g = ball.current
    if (!g) return
    const party = performance.now() < disco.partyUntil
    const target = reduced ? 0.06 : party ? 2.8 : 0.45
    spinSpeed.current = THREE.MathUtils.damp(spinSpeed.current, target, spinSpeed.current < target ? 2.2 : 0.9, dt)
    g.rotation.y += spinSpeed.current * dt
    disco.spin += spinSpeed.current * dt
    disco.party = THREE.MathUtils.damp(disco.party, party ? 1 : 0, party ? 3 : 1.4, dt)
    disco.ballX = x / (halfW * 2) + 0.5
    disco.ballY = 0.5 - y / (top * 2)
  })

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onPlay()
    if (isParty()) {
      stopParty()
      setCursorLabel('party!')
      return
    }
    startParty(6500)
    setCursorLabel('stop')
  }

  return (
    <>
      <group
        ref={ball}
        position={[x, y, 0]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          onPlay()
          setCursorLabel(isParty() ? 'stop' : 'party!')
        }}
        onPointerOut={() => setCursorLabel(null)}
      >
        <MirrorBall R={R} />
      </group>
      <mesh position={[x, string.mid, 0]}>
        <cylinderGeometry args={[R * 0.012, R * 0.012, string.len, 6]} />
        <meshStandardMaterial color="#d9dcf5" metalness={0.6} roughness={0.3} />
      </mesh>
      <Beams R={R} follow={ball} />
      <Glints R={R} follow={ball} />
    </>
  )
}

export default function DiscoScene({
  active,
  reduced,
  eventSource,
}: {
  active: boolean
  reduced: boolean
  eventSource: RefObject<HTMLElement | null>
}) {
  // Physics (swinging + falling tiles) is a big download:
  //  high: fetch it quietly once the page is idle
  //  mid (most phones): only once someone actually plays with the ball
  //  low: never — the plain ball still spins and parties
  const [physics, setPhysics] = useState(false)
  useEffect(() => {
    if (tier === 'high') whenIdle(() => setPhysics(true), 3000)
  }, [])
  const wantPhysics = () => tier !== 'low' && !physics && setPhysics(true)

  const maxDpr = tier === 'high' ? 1.75 : tier === 'mid' ? 1.4 : 1
  const [dpr, setDpr] = useState(maxDpr)

  return (
    <Canvas
      className="disco-scene"
      dpr={dpr}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      eventSource={eventSource as RefObject<HTMLElement>}
      eventPrefix="client"
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 3, 4]} intensity={1.2} />
      {/* if frames start dropping, render at lower sharpness and ease off the extras */}
      <PerformanceMonitor
        onDecline={() => {
          runtime.struggling = true
          setDpr(1)
        }}
        onIncline={() => setDpr(maxDpr)}
        flipflops={3}
        onFallback={() => {
          runtime.struggling = true
          setDpr(1)
        }}
      />
      {physics ? (
        <Suspense fallback={<PlainBall reduced={reduced} onPlay={wantPhysics} />}>
          <DiscoPhysics reduced={reduced} active={active} />
        </Suspense>
      ) : (
        <PlainBall reduced={reduced} onPlay={wantPhysics} />
      )}
      <Environment resolution={tier === 'high' ? 256 : 128} frames={1}>
        <color attach="background" args={['#5a63a8']} />
        <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 0, 5]} scale={[10, 10, 1]} />
        <Lightformer form="ring" intensity={6} color="#FF9F1C" position={[3, 2, 2]} scale={2} />
        <Lightformer intensity={5} color="#FF3D8B" position={[-3, -1, 2]} scale={[3, 1, 1]} />
        <Lightformer intensity={4} color="#ffffff" position={[0, 4, -1]} scale={[5, 1, 1]} />
        <Lightformer intensity={4} color="#5D72FF" position={[0, -3, 1]} scale={[4, 1, 1]} />
        <Lightformer form="circle" intensity={6} color="#FFD60A" position={[-2, 3, 3]} scale={1.2} />
      </Environment>
    </Canvas>
  )
}

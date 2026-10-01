import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

const COLORS = ['#FF9F1C', '#FFB43A', '#FFD60A', '#FF3D8B', '#C8102E', '#FFF4E0']

/** One petal: drifts down, flutters, wraps back to the top, leans with the mouse. */
function Petal({ seed }: { seed: number }) {
  const ref = useRef<THREE.Group>(null)
  const rnd = useMemo(() => {
    const r = (n: number) => {
      const x = Math.sin(seed * 9301 + n * 49297) * 233280
      return x - Math.floor(x)
    }
    return {
      x: (r(1) - 0.5) * 16,
      y: (r(2) - 0.5) * 10,
      z: -r(3) * 6,
      speed: 0.35 + r(4) * 0.6,
      spin: 0.5 + r(5) * 1.8,
      sway: 0.4 + r(6) * 0.9,
      scale: 0.12 + r(7) * 0.14,
      color: COLORS[Math.floor(r(8) * COLORS.length)],
    }
  }, [seed])

  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.position.y -= rnd.speed * delta
    if (g.position.y < -6) g.position.y = 6
    g.position.x = rnd.x + Math.sin(t * rnd.sway + seed) * 0.6 + state.pointer.x * 1.2
    g.rotation.x += rnd.spin * delta
    g.rotation.z += rnd.spin * 0.6 * delta
  })

  return (
    <group ref={ref} position={[rnd.x, rnd.y, rnd.z]}>
      <Instance color={rnd.color} scale={[rnd.scale, rnd.scale * 0.07, rnd.scale * 0.55]} />
    </group>
  )
}

export default function PetalShower({ active, count }: { active: boolean; count: number }) {
  return (
    <Canvas
      className="petal-canvas"
      dpr={[1, count > 50 ? 1.5 : 1.25]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 8], fov: 50 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[2, 4, 5]} intensity={1.6} />
      <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.6}>
        <Instances limit={count}>
          <sphereGeometry args={[1, 14, 10]} />
          <meshStandardMaterial roughness={0.45} />
          {Array.from({ length: count }, (_, i) => (
            <Petal key={i} seed={i + 1} />
          ))}
        </Instances>
      </Float>
    </Canvas>
  )
}

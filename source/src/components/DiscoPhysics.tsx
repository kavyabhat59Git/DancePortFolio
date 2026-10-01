// React Three Rapier: the disco ball hangs on a joint, so you can swat it and it
// swings; clicking it starts party mode and knocks loose mirror tiles that bounce.
// Loaded after the plain ball is already showing (the physics engine is large).
import { useMemo, useRef, useState, type RefObject } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { CuboidCollider, Physics, RigidBody, useSphericalJoint, type RapierRigidBody } from '@react-three/rapier'
import * as THREE from 'three'
import { disco, isParty, setCursorLabel, startParty, stopParty } from '../lib/disco'
import { Beams, Glints, looseMats, MirrorBall, useLayout } from './DiscoParts'

/* ---------- loose mirror tiles that fall out in party mode ---------- */
type Loose = { id: number; pos: [number, number, number]; vel: [number, number, number]; spin: [number, number, number] }

function LooseTile({ t, size }: { t: Loose; size: number }) {
  return (
    <RigidBody
      position={t.pos}
      linearVelocity={t.vel}
      angularVelocity={t.spin}
      colliders="cuboid"
      restitution={0.55}
      friction={0.4}
      enabledTranslations={[true, true, false]}
    >
      <mesh material={looseMats[t.id % looseMats.length]}>
        <boxGeometry args={[size, size, size * 0.2]} />
      </mesh>
    </RigidBody>
  )
}

/* ---------- the hanging, swingable ball ---------- */
function World({ reduced }: { reduced: boolean }) {
  const { R, x, y, top, bottom, halfW, u, mobile } = useLayout()
  const anchor = useRef<RapierRigidBody>(null)
  const body = useRef<RapierRigidBody>(null)
  const string = useRef<THREE.Mesh>(null)
  const ballGroup = useRef<THREE.Group>(null)
  const [loose, setLoose] = useState<Loose[]>([])
  const nextId = useRef(0)
  const ropeLength = top - y

  useSphericalJoint(anchor as RefObject<RapierRigidBody>, body as RefObject<RapierRigidBody>, [
    [0, 0, 0],
    [0, ropeLength, 0],
  ])

  const up = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const tmp = useMemo(() => ({ a: new THREE.Vector3(), b: new THREE.Vector3(), d: new THREE.Vector3() }), [])

  useFrame((_, dt) => {
    const b = body.current
    if (!b) return
    const party = performance.now() < disco.partyUntil
    const av = b.angvel()
    const target = reduced ? 0.06 : party ? 2.8 : 0.45
    // speeds up quickly, winds down slowly
    const ease = av.y < target ? 2.2 : 0.9
    b.setAngvel({ x: av.x * 0.95, y: THREE.MathUtils.damp(av.y, target, ease, dt), z: av.z * 0.95 }, true)
    disco.spin += av.y * dt
    disco.party = THREE.MathUtils.damp(disco.party, party ? 1 : 0, party ? 3 : 1.4, dt)

    const p = b.translation()
    disco.ballX = p.x / (halfW * 2) + 0.5
    disco.ballY = 0.5 - p.y / (top * 2)

    // the string runs from the ceiling anchor to the top of the (swinging) ball
    const s = string.current
    if (s) {
      tmp.a.set(x, top + 0.2, 0)
      tmp.b.set(p.x, p.y, p.z)
      tmp.d.subVectors(tmp.a, tmp.b)
      const len = tmp.d.length()
      s.position.copy(tmp.b).addScaledVector(tmp.d, 0.5)
      s.scale.set(1, len, 1)
      s.quaternion.setFromUnitVectors(up, tmp.d.normalize())
    }
  })

  // bat it around: pushing the mouse across the ball nudges it
  const onMove = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    const b = body.current
    if (!b || reduced) return
    const mx = THREE.MathUtils.clamp(e.nativeEvent.movementX, -40, 40)
    if (Math.abs(mx) < 2) return
    b.applyImpulse({ x: mx * u * b.mass() * 0.9, y: 0, z: 0 }, true)
  }

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    const b = body.current
    if (!b) return
    // second click while partying: wind it down gently
    if (isParty()) {
      stopParty()
      setCursorLabel('party!')
      return
    }
    startParty(6500)
    setCursorLabel('stop')
    b.applyImpulse({ x: (Math.random() > 0.5 ? 1 : -1) * R * 2.2 * b.mass(), y: 0, z: 0 }, true)
    if (reduced) return
    const p = b.translation()
    const fresh: Loose[] = Array.from({ length: mobile ? 8 : 14 }, () => {
      const a = Math.random() * Math.PI * 2
      return {
        id: nextId.current++,
        pos: [p.x + Math.cos(a) * R, p.y + Math.sin(a) * R, 0],
        vel: [Math.cos(a) * (2 + Math.random() * 3) * R, (2 + Math.random() * 4) * R, 0],
        spin: [Math.random() * 10, Math.random() * 10, Math.random() * 10],
      }
    })
    setLoose((l) => [...l, ...fresh].slice(-40))
    const ids = new Set(fresh.map((f) => f.id))
    setTimeout(() => setLoose((l) => l.filter((t) => !ids.has(t.id))), 6000)
  }

  return (
    <>
      <RigidBody ref={anchor} type="fixed" position={[x, top, 0]} colliders={false} />
      <RigidBody
        ref={body}
        position={[x, y, 0]}
        colliders="ball"
        mass={1}
        linearDamping={0.35}
        angularDamping={0.1}
        enabledTranslations={[true, true, false]}
      >
        <group
          ref={ballGroup}
          onPointerMove={onMove}
          onPointerOver={(e) => {
            e.stopPropagation()
            setCursorLabel(isParty() ? 'stop' : 'party!')
          }}
          onPointerOut={() => setCursorLabel(null)}
          onClick={onClick}
        >
          <MirrorBall R={R} />
        </group>
      </RigidBody>

      <mesh ref={string}>
        <cylinderGeometry args={[R * 0.012, R * 0.012, 1, 6]} />
        <meshStandardMaterial color="#d9dcf5" metalness={0.6} roughness={0.3} />
      </mesh>

      <Beams R={R} follow={ballGroup} />
      <Glints R={R} follow={ballGroup} />

      {loose.map((t) => (
        <LooseTile key={t.id} t={t} size={R * 0.34} />
      ))}

      {/* floor and walls so the loose tiles bounce around inside the hero */}
      <CuboidCollider position={[0, bottom - 0.5, 0]} args={[halfW * 2, 0.5, 2]} restitution={0.5} />
      <CuboidCollider position={[-halfW - 0.5, 0, 0]} args={[0.5, top * 2, 2]} />
      <CuboidCollider position={[halfW + 0.5, 0, 0]} args={[0.5, top * 2, 2]} />
    </>
  )
}

function Keyed({ reduced }: { reduced: boolean }) {
  // rebuild the physics world when the screen size changes, so the ball stays in place
  const { key } = useLayout()
  return <World key={key} reduced={reduced} />
}

export default function DiscoPhysics({ reduced, active }: { reduced: boolean; active: boolean }) {
  return (
    <Physics gravity={[0, -12, 0]} paused={!active}>
      <Keyed reduced={reduced} />
    </Physics>
  )
}

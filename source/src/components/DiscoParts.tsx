// Shared pieces of the hero disco ball (no physics here, so they load fast):
// layout, mirror-tile ball, light beams and star glints.
import { useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { disco } from '../lib/disco'
import { runtime, tier } from '../lib/perf'

const RINGS = 26
const BEAM_COLORS = ['#FFD60A', '#FF3D8B', '#FF9F1C', '#FFF4E0', '#7C8CFF', '#FF3D8B', '#FFD60A']

/* ---------- where the ball sits, in world units, from the canvas size ---------- */
export function useLayout() {
  const { size, viewport } = useThree()
  const u = viewport.width / size.width // world units per CSS pixel
  const mobile = size.width < 960
  const ballPx = mobile ? 112 : Math.min(260, Math.max(170, size.width * 0.17))
  const cx = mobile ? size.width - 72 : size.width * 0.83
  const cy = mobile ? 158 : 190
  return {
    u,
    mobile,
    R: (ballPx / 2) * u,
    x: (cx - size.width / 2) * u,
    y: (size.height / 2 - cy) * u,
    top: viewport.height / 2,
    bottom: -viewport.height / 2,
    halfW: viewport.width / 2,
    key: `${size.width}x${size.height}`,
  }
}

/* ---------- shared mirror material + tile layout ---------- */
export const mirror = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.1, envMapIntensity: 1.8 })
// loose tiles glow a little in her colours so they read at small sizes
export const looseMats = ['#FFD60A', '#FF3D8B', '#FFF4E0', '#FF9F1C', '#9AA6FF'].map(
  (c) =>
    new THREE.MeshStandardMaterial({
      color: '#ffffff',
      metalness: 0.9,
      roughness: 0.15,
      envMapIntensity: 1.6,
      emissive: new THREE.Color(c),
      emissiveIntensity: 0.55,
    }),
)

function useTiles(R: number) {
  return useMemo(() => {
    const out: { m: THREE.Matrix4; c: THREE.Color }[] = []
    const d = new THREE.Object3D()
    const silver = new THREE.Color('#e9ecff')
    const gold = new THREE.Color('#ffd76a')
    const pink = new THREE.Color('#ff8fc0')
    for (let i = 0; i < RINGS; i++) {
      const phi = (Math.PI * (i + 0.5)) / RINGS
      const count = Math.max(6, Math.round(RINGS * 2 * Math.sin(phi)))
      for (let j = 0; j < count; j++) {
        const theta = (2 * Math.PI * j) / count + ((i % 2) * Math.PI) / count
        const pos = new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)).multiplyScalar(R)
        d.position.copy(pos)
        d.lookAt(pos.clone().multiplyScalar(2))
        d.rotateZ((Math.random() - 0.5) * 0.08)
        d.updateMatrix()
        const r = Math.random()
        out.push({ m: d.matrix.clone(), c: r < 0.08 ? gold : r < 0.13 ? pink : silver })
      }
    }
    return out
  }, [R])
}

export function MirrorBall({ R }: { R: number }) {
  const tiles = useTiles(R)
  const tileSize = (Math.PI * R) / RINGS - R * 0.012
  const setRef = (mesh: THREE.InstancedMesh | null) => {
    if (!mesh || mesh.userData.ready === R) return
    tiles.forEach((t, i) => {
      mesh.setMatrixAt(i, t.m)
      mesh.setColorAt(i, t.c)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.userData.ready = R
  }
  return (
    <>
      <mesh>
        <sphereGeometry args={[R * 0.985, 48, 48]} />
        <meshStandardMaterial color="#1b1e3d" roughness={0.6} />
      </mesh>
      <instancedMesh ref={setRef} args={[undefined, undefined, tiles.length]} material={mirror}>
        <boxGeometry args={[tileSize, tileSize, R * 0.025]} />
      </instancedMesh>
      <mesh position={[0, R + R * 0.04, 0]}>
        <cylinderGeometry args={[R * 0.07, R * 0.09, R * 0.1, 16]} />
        <meshStandardMaterial color="#e0a526" metalness={1} roughness={0.25} />
      </mesh>
    </>
  )
}

/* ---------- light beams shooting out of the ball ---------- */
const beamMaterial = (color: string) =>
  new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: new THREE.Color(color) }, uI: { value: 0.15 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vView = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uI;
      varying vec2 vUv; varying vec3 vN; varying vec3 vView;
      void main() {
        float along = pow(vUv.y, 1.8);                     // bright at the ball, fading out
        float core = pow(abs(dot(vN, vView)), 2.0);       // soft edges, like a real beam
        float a = along * core * uI;
        gl_FragColor = vec4(uColor, a);
      }`,
  })

export function Beams({ R, follow }: { R: number; follow: RefObject<THREE.Object3D | null> }) {
  const group = useRef<THREE.Group>(null)
  const length = R * 16
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(R * 1.6, length, 32, 1, true)
    g.translate(0, -length / 2, 0) // tip at the ball, opening outwards
    return g
  }, [R, length])
  const colors = tier === 'low' ? BEAM_COLORS.slice(1, 5) : BEAM_COLORS
  const beams = useMemo(
    () =>
      colors.map((c, i) => ({
        mat: beamMaterial(c),
        rotZ: -1.25 + (i / (colors.length - 1)) * 2.5,
        rotX: ((i % 3) - 1) * 0.5,
      })),
    [],
  )

  useFrame((state) => {
    const g = group.current
    const b = follow.current
    if (!g || !b) return
    b.getWorldPosition(g.position)
    g.rotation.y = disco.spin * 0.6
    g.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.35
    const intensity = (0.06 + disco.party * 0.32) * (runtime.struggling ? 0.7 : 1)
    beams.forEach((b) => (b.mat.uniforms.uI.value = intensity))
  })

  return (
    <group ref={group}>
      {beams.map((b, i) => (
        <mesh key={i} geometry={geo} material={b.mat} rotation={[b.rotX, 0, b.rotZ]} />
      ))}
    </group>
  )
}

/* ---------- star glints popping on the ball's face ---------- */
function useStarTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.15, 'rgba(255,240,200,0.8)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    // four-point star
    ctx.moveTo(64, 0)
    ctx.quadraticCurveTo(70, 58, 128, 64)
    ctx.quadraticCurveTo(70, 70, 64, 128)
    ctx.quadraticCurveTo(58, 70, 0, 64)
    ctx.quadraticCurveTo(58, 58, 64, 0)
    ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])
}

export function Glints({ R, follow }: { R: number; follow: RefObject<THREE.Object3D | null> }) {
  const group = useRef<THREE.Group>(null)
  const tex = useStarTexture()
  const glints = useMemo(
    () =>
      Array.from({ length: tier === 'high' ? 9 : 5 }, () => {
        const a = Math.random() * Math.PI * 2
        const r = Math.sqrt(Math.random()) * R * 0.9
        return { x: Math.cos(a) * r, y: Math.sin(a) * r, speed: 1.5 + Math.random() * 2.5, phase: Math.random() * 10 }
      }),
    [R],
  )
  const refs = useRef<(THREE.Sprite | null)[]>([])

  useFrame((state) => {
    const b = follow.current
    if (!group.current || !b) return
    b.getWorldPosition(group.current.position)
    group.current.position.z += R * 1.05
    const time = state.clock.elapsedTime
    glints.forEach((g, i) => {
      const s = refs.current[i]
      if (!s) return
      const flash = Math.pow(Math.max(0, Math.sin(time * g.speed * (1 + disco.party) + g.phase)), 10)
      s.scale.setScalar(R * (0.15 + 0.75 * flash) * (1 + disco.party * 0.6))
      ;(s.material as THREE.SpriteMaterial).opacity = flash
    })
  })

  return (
    <group ref={group}>
      {glints.map((g, i) => (
        <sprite key={i} ref={(s) => void (refs.current[i] = s)} position={[g.x, g.y, 0]}>
          <spriteMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </sprite>
      ))}
    </group>
  )
}


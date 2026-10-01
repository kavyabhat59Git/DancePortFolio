// OGL: disco-ball reflections — coloured light spots that sweep across the walls, her
// photo and everything else, in sync with the 3D ball's spin.
// Each spot is drawn as a single point sprite, so the graphics chip only works on the
// spots themselves rather than running a loop over every pixel of the screen.
import { useEffect, useRef } from 'react'
import { Geometry, Mesh, Program, Renderer } from 'ogl'
import { disco } from '../lib/disco'
import { runtime, tier } from '../lib/perf'
import { prefersReducedMotion } from '../hooks/useSite'

const vertex = /* glsl */ `
  attribute float aIndex;
  uniform vec2 uRes;
  uniform float uSpin;
  uniform float uParty;
  uniform float uTime;
  uniform vec2 uBall;
  varying vec3 vColor;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  vec3 palette(float h) {
    if (h < 0.25) return vec3(1.0, 0.84, 0.04);   // sun
    if (h < 0.45) return vec3(1.0, 0.24, 0.55);   // pink
    if (h < 0.65) return vec3(1.0, 0.62, 0.11);   // marigold
    if (h < 0.85) return vec3(1.0, 0.97, 0.9);    // cream-white
    return vec3(0.55, 0.62, 1.0);                 // icy blue
  }

  void main() {
    float fi = aIndex;
    // each spot = one mirror tile catching the light, at a point on the ball
    float phi = acos(1.0 - 2.0 * hash(fi * 1.37 + 0.11));
    float theta = hash(fi * 7.13 + 0.37) * 6.2831853 + uSpin;
    float facing = cos(theta);

    vec2 c = vec2(uBall.x + sin(theta) * sin(phi) * 1.25, 0.5 - cos(phi) * 0.62);
    gl_Position = vec4(c.x * 2.0 - 1.0, 1.0 - c.y * 2.0, 0.0, 1.0);

    float size = mix(0.008, 0.024, hash(fi * 3.1 + 0.7)) * (1.0 + uParty * 0.2);
    gl_PointSize = facing > 0.0 ? 2.0 * size * uRes.y / 0.62 : 0.0;

    float twinkle = 0.7 + 0.3 * sin(uTime * (2.0 + hash(fi) * 3.0) + fi);
    float strength = 0.42 + uParty * 0.6;
    vColor = palette(hash(fi * 5.7)) * smoothstep(0.0, 0.35, facing) * twinkle * strength;
  }
`

const fragment = /* glsl */ `
  precision mediump float;
  varying vec3 vColor;
  void main() {
    vec2 pc = gl_PointCoord * 2.0 - 1.0;
    // stretched sideways, like a moving reflection
    float d = length(vec2(pc.x, pc.y / 0.62));
    float spot = smoothstep(1.0, 0.72, d);
    vec3 col = vColor * spot;
    gl_FragColor = vec4(col, max(col.r, max(col.g, col.b)));
  }
`

export default function DiscoLights({ active }: { active: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const activeRef = useRef(active)
  activeRef.current = active

  useEffect(() => {
    const el = host.current
    if (!el) return
    const count = tier === 'high' ? 80 : 46
    const reduced = prefersReducedMotion()
    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio, tier === 'high' ? 2 : 1.5),
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    el.appendChild(gl.canvas)

    const index = new Float32Array(count)
    for (let i = 0; i < count; i++) index[i] = i
    const geometry = new Geometry(gl, { aIndex: { size: 1, data: index } })

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      depthTest: false,
      uniforms: {
        uRes: { value: [1, 1] },
        uSpin: { value: 0 },
        uParty: { value: 0 },
        uTime: { value: 0 },
        uBall: { value: [disco.ballX, disco.ballY] },
      },
    })
    program.setBlendFunc(gl.ONE, gl.ONE) // overlapping spots add up, like real light
    const mesh = new Mesh(gl, { geometry, program, mode: gl.POINTS })

    const resize = () => {
      renderer.setSize(el.clientWidth, el.clientHeight)
      program.uniforms.uRes.value = [gl.drawingBufferWidth, gl.drawingBufferHeight]
    }
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    resize()

    let raf = 0
    let frame = 0
    let ownSpin = 0
    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!activeRef.current) return
      // if the device is struggling, update the spots at half rate
      if (runtime.struggling && frame++ % 2) return
      ownSpin += dt * (reduced ? 0 : 0.45)
      const u = program.uniforms
      u.uSpin.value = disco.spin || ownSpin
      u.uParty.value = disco.party
      u.uTime.value = reduced ? 0 : now / 1000
      u.uBall.value = [disco.ballX, disco.ballY]
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.canvas.remove()
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <div className="disco-lights" ref={host} aria-hidden />
}

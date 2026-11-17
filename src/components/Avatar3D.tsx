import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

// A toy-figure version of Bipin sitting on a metro seat: dark swept-up hair, beard, white henley tee,
// blue jeans, a watch and a thin silver chain. The head and eyes follow the pointer, it breathes and
// blinks, and it waves on load and whenever it is clicked.

const C = {
  skin: '#b97a55',
  skinDark: '#a0654a',
  hair: '#161110',
  beard: '#3b2a22',
  tee: '#f4f3ef',
  button: '#24324a',
  jeans: '#4f6f9c',
  shoe: '#efeee9',
  sole: '#cfcac2',
  seat: '#2f4a6b',
  metal: '#a9b0b6',
  watch: '#15181c',
}

export default function Avatar3D({ calm = false }: { calm?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const wave = useRef(() => {})

  useEffect(() => {
    const el = box.current!
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'
    el.prepend(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50)
    camera.position.set(0, 2.2, 9.6)
    camera.lookAt(0.25, 1.6, 0)

    scene.add(new THREE.HemisphereLight('#fff6ec', '#8a8f96', 1.5))
    const key = new THREE.DirectionalLight('#fff1e0', 2.6)
    key.position.set(3, 6, 5)
    key.castShadow = true
    key.shadow.mapSize.set(1024, 1024)
    Object.assign(key.shadow.camera, { left: -3, right: 3, top: 4, bottom: -1 })
    key.shadow.radius = 6
    const rim = new THREE.DirectionalLight('#bcd4ff', 1.4)
    rim.position.set(-4, 3, -3)
    scene.add(key, rim)

    // vinyl-toy materials: soft, slightly glossy
    const vinyl = (color: string, rough = 0.55) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, clearcoat: 0.35, clearcoatRoughness: 0.5 })
    const cloth = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.92 })
    const skin = vinyl(C.skin, 0.5)
    const add = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0) => {
      const m = new THREE.Mesh(geo, mat)
      m.position.set(x, y, z)
      m.castShadow = true
      m.receiveShadow = true
      parent.add(m)
      return m
    }
    const capsule = (r: number, len: number) => new THREE.CapsuleGeometry(r, len, 8, 16)
    const sphere = (r: number) => new THREE.SphereGeometry(r, 32, 24)

    const root = new THREE.Group()
    root.rotation.y = -0.32
    scene.add(root)

    // ---- the metro seat and a grab pole
    const seat = new THREE.Group()
    root.add(seat)
    add(seat, new RoundedBoxGeometry(2.7, 0.24, 0.95, 4, 0.1), cloth(C.seat), 0, 0.92, 0)
    add(seat, new RoundedBoxGeometry(2.7, 1.05, 0.2, 4, 0.09), cloth(C.seat), 0, 1.55, -0.45)
    add(seat, new RoundedBoxGeometry(2.5, 0.8, 0.8, 2, 0.04), vinyl(C.metal, 0.35), 0, 0.42, -0.05)
    add(seat, new THREE.CylinderGeometry(0.045, 0.045, 3.6, 16), vinyl(C.metal, 0.25), 1.5, 1.8, 0.25)

    // ---- legs
    const jeans = cloth(C.jeans)
    for (const s of [-1, 1]) {
      const thigh = add(root, capsule(0.19, 0.5), jeans, s * 0.22, 1.12, 0.32)
      thigh.rotation.x = Math.PI / 2
      add(root, capsule(0.165, 0.56), jeans, s * 0.22, 0.62, 0.62)
      add(root, new RoundedBoxGeometry(0.3, 0.16, 0.48, 3, 0.07), vinyl(C.shoe, 0.6), s * 0.22, 0.13, 0.74)
      add(root, new RoundedBoxGeometry(0.31, 0.05, 0.5, 2, 0.02), vinyl(C.sole, 0.7), s * 0.22, 0.04, 0.74)
    }

    // ---- torso: white henley with a button placket
    const torso = new THREE.Group()
    torso.position.set(0, 1.18, 0.02)
    root.add(torso)
    const tee = cloth(C.tee)
    add(torso, new RoundedBoxGeometry(1.0, 0.98, 0.6, 5, 0.24), tee, 0, 0.48, 0)
    add(torso, new RoundedBoxGeometry(0.1, 0.34, 0.03, 2, 0.01), cloth('#e9e7e1'), 0, 0.76, 0.3)
    for (const y of [0.86, 0.76, 0.66]) add(torso, sphere(0.026), vinyl(C.button, 0.4), 0, y, 0.32)

    // ---- arms: shoulder pivot > upper arm (sleeve + skin) > elbow pivot > forearm > hand
    const arm = (s: number) => {
      const shoulder = new THREE.Group()
      shoulder.position.set(s * 0.6, 0.86, 0)
      torso.add(shoulder)
      add(shoulder, capsule(0.16, 0.16), tee, 0, -0.12, 0)
      add(shoulder, capsule(0.12, 0.22), skin, 0, -0.38, 0)
      const elbow = new THREE.Group()
      elbow.position.set(0, -0.56, 0)
      shoulder.add(elbow)
      const fore = add(elbow, capsule(0.11, 0.34), skin, 0, 0, 0.22)
      fore.rotation.x = Math.PI / 2
      add(elbow, sphere(0.13), skin, 0, 0, 0.5)
      return { shoulder, elbow }
    }
    const left = arm(-1)
    const right = arm(1)
    // the watch, on the left wrist
    add(left.elbow, new THREE.TorusGeometry(0.118, 0.03, 10, 24), vinyl(C.watch, 0.4), 0, 0, 0.36)
    const face = add(left.elbow, new RoundedBoxGeometry(0.14, 0.05, 0.16, 2, 0.02), vinyl(C.watch, 0.3), 0, 0.12, 0.36)
    add(face, new THREE.BoxGeometry(0.1, 0.01, 0.12), new THREE.MeshStandardMaterial({ color: '#3a6ea8', emissive: '#1e4f86', emissiveIntensity: 0.6, roughness: 0.2 }), 0, 0.028, 0)
    const rest = () => {
      for (const a of [left, right]) {
        a.shoulder.rotation.set(0.55, 0, 0)
        a.elbow.rotation.set(-0.2, 0, 0)
      }
      left.shoulder.rotation.z = -0.08
      right.shoulder.rotation.z = 0.08
    }
    rest()

    // ---- neck and chain
    add(torso, new THREE.CylinderGeometry(0.15, 0.17, 0.26, 20), skin, 0, 1.02, 0)
    const chain = add(torso, new THREE.TorusGeometry(0.2, 0.013, 8, 40), vinyl('#d8dbe0', 0.15), 0, 0.98, 0.04)
    chain.rotation.x = Math.PI / 2 + 0.35

    // ---- head
    const head = new THREE.Group()
    head.position.set(0, 1.12, 0.02)
    torso.add(head)
    const skull = add(head, sphere(0.56), skin, 0, 0.5, 0)
    skull.scale.set(0.98, 1.06, 0.95)
    for (const s of [-1, 1]) add(head, sphere(0.1), vinyl(C.skinDark, 0.5), s * 0.54, 0.48, -0.02).scale.set(0.5, 1, 0.8)
    add(head, sphere(0.075), vinyl(C.skinDark, 0.5), 0, 0.46, 0.55)

    // beard: a dark shell over the lower front of the face, plus a moustache
    const beardMat = new THREE.MeshStandardMaterial({ color: C.beard, roughness: 1 })
    const beard = add(head, new THREE.SphereGeometry(0.568, 40, 20, Math.PI / 2 - 1.25, 2.5, 2.12, 0.8), beardMat, 0, 0.5, 0)
    beard.scale.set(0.98, 1.06, 0.95)
    const stache = add(head, capsule(0.032, 0.2), beardMat, 0, 0.34, 0.51)
    stache.rotation.z = Math.PI / 2
    add(head, capsule(0.02, 0.1), new THREE.MeshStandardMaterial({ color: '#6e3b2c', roughness: 0.6 }), 0, 0.27, 0.515).rotation.z = Math.PI / 2

    // eyes, which follow the pointer and blink
    const eyes = new THREE.Group()
    head.add(eyes)
    const pupils: THREE.Mesh[] = []
    const lids: THREE.Group[] = []
    for (const s of [-1, 1]) {
      const g = new THREE.Group()
      g.position.set(s * 0.2, 0.58, 0.46)
      eyes.add(g)
      add(g, sphere(0.085), new THREE.MeshStandardMaterial({ color: '#fbfaf7', roughness: 0.3 }))
      const p = add(g, sphere(0.05), new THREE.MeshStandardMaterial({ color: '#1b1210', roughness: 0.2 }), 0, 0, 0.055)
      add(p, sphere(0.014), new THREE.MeshBasicMaterial({ color: '#ffffff' }), 0.018, 0.02, 0.04)
      pupils.push(p)
      lids.push(g)
      const brow = add(head, new RoundedBoxGeometry(0.22, 0.05, 0.06, 2, 0.02), beardMat, s * 0.21, 0.73, 0.49)
      brow.rotation.z = s * -0.12
    }

    // hair: a dark cap with a voluminous swept-up front
    const hairMat = vinyl(C.hair, 0.45)
    const cap = add(head, sphere(0.59), hairMat, 0, 0.78, -0.1)
    cap.scale.set(1.0, 0.62, 1.0)
    for (const [x, y, z, r] of [
      [-0.24, 1.06, 0.24, 0.24],
      [0.04, 1.16, 0.28, 0.27],
      [0.3, 1.08, 0.18, 0.23],
      [-0.1, 1.24, 0.1, 0.22],
      [0.18, 1.26, 0.02, 0.2],
      [-0.36, 0.92, 0.02, 0.24],
      [0.38, 0.9, -0.05, 0.24],
      [-0.05, 1.08, -0.12, 0.3],
      [0.0, 0.8, -0.42, 0.34],
    ])
      add(head, sphere(r), hairMat, x, y, z)
    for (const s of [-1, 1]) add(head, sphere(0.13), hairMat, s * 0.5, 0.72, 0.05).scale.set(0.5, 1.1, 0.9)

    // ---- soft shadow on the floor
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.ShadowMaterial({ opacity: 0.28 }))
    floor.rotation.x = -Math.PI / 2
    floor.receiveShadow = true
    scene.add(floor)

    // ---- interaction
    let px = 0
    let py = 0
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect()
      px = THREE.MathUtils.clamp(((e.clientX - (b.left + b.width / 2)) / innerWidth) * 2.4, -1, 1)
      py = THREE.MathUtils.clamp(((e.clientY - (b.top + b.height * 0.3)) / innerHeight) * 2.4, -1, 1)
    }
    addEventListener('pointermove', onMove)
    let waveT = calm ? -1 : 0.4 // seconds into a wave; it waves once on arrival
    wave.current = () => {
      if (!calm) waveT = 0
    }

    const size = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight, false)
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
    })
    size.observe(el)
    let onScreen = true
    const seen = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting))
    seen.observe(el)

    const yaw = { v: 0 }
    const pitch = { v: 0 }
    let blinkAt = 2.5
    let last = performance.now()
    let raf = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!onScreen || document.hidden) return
      const t = now / 1000

      // head turns toward the pointer, eased
      const k = calm ? 1 : Math.min(1, dt * 5)
      yaw.v += (px * 0.62 - yaw.v) * k
      pitch.v += (py * 0.32 - pitch.v) * k
      head.rotation.set(pitch.v, yaw.v, -yaw.v * 0.12)
      torso.rotation.y = yaw.v * 0.18
      pupils.forEach((p) => p.position.set(px * 0.026, -py * 0.02, 0.055))

      if (!calm) {
        // breathing and blinking
        torso.scale.y = 1 + Math.sin(t * 1.7) * 0.012
        torso.position.y = 1.18 + Math.sin(t * 1.7) * 0.006
        blinkAt -= dt
        const lid = blinkAt < 0 ? Math.max(0.08, Math.abs(blinkAt + 0.07) / 0.07) : 1
        lids.forEach((g) => (g.scale.y = lid))
        if (blinkAt < -0.14) blinkAt = 2 + Math.random() * 3.5

        // wave: raise the right arm, rock the forearm, put it back
        if (waveT >= 0) {
          waveT += dt
          const up = waveT < 0.35 ? waveT / 0.35 : waveT > 1.9 ? Math.max(0, 1 - (waveT - 1.9) / 0.4) : 1
          const e = up * up * (3 - 2 * up)
          right.shoulder.rotation.set(0.55 * (1 - e) + 0.15 * e, 0, 0.08 + 2.35 * e)
          right.elbow.rotation.set(-0.2 * (1 - e) - 1.45 * e, 0, Math.sin(waveT * 11) * 0.45 * e)
          if (waveT > 2.3) {
            waveT = -1
            rest()
          }
        }
      }
      renderer.render(scene, camera)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', onMove)
      size.disconnect()
      seen.disconnect()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [calm])

  return (
    <div
      ref={box}
      className="avatar relative h-full w-full"
      data-cursor="Say hi"
      role="img"
      aria-label="A 3D toy figure of Bipin sitting on a metro seat. It looks toward your pointer and waves when clicked."
      onClick={() => wave.current()}
    />
  )
}

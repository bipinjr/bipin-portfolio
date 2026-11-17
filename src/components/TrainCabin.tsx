import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Reflector } from 'three/examples/jsm/objects/Reflector.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

// You are sitting inside the train. A row of windows, open sky and sea outside, still water on the floor
// that mirrors it all. Pick a station and the train pulls away, runs, then glides into that platform.

type Station = { id: string; label: string; color: string }
type Props = {
  station: Station
  film?: boolean // slow push-in while the film plays
  shift?: number // slide the picture sideways by this share of the width, to leave room for text
  children?: React.ReactNode
}

const LEN = 22 // carriage length (x), width runs along z, the windowed wall is at z = -1.5
const PITCH = 3.1 // one window + one pillar
const seeded = (seed: number) => () => (seed = (seed * 16807) % 2147483647) / 2147483647

const LOOK = {
  light: { sky: ['#1f6fd0', '#6fb4f2', '#d8efff'], wall: '#cfd8df', seat: '#27466e', sea: '#3d8fd6', cloud: '#ffffff', sun: '#fff6e0', hemi: 1.5, lamp: 0.5, bloom: 0.28, water: 0x9fc4e8 },
  dark: { sky: ['#060a24', '#3b2a6b', '#ff9a76'], wall: '#2b3858', seat: '#16213f', sea: '#1d2560', cloud: '#ffb3a0', sun: '#ffb38a', hemi: 1.0, lamp: 1.0, bloom: 0.38, water: 0xb4bde6 },
}

export default function TrainCabin({ station, film = false, shift = 0, children }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const live = useRef({ station, film, shift })
  const depart = useRef<() => void>(() => {})
  live.current = { station, film, shift }
  useEffect(() => depart.current(), [station.id])

  useEffect(() => {
    const el = box.current!
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches
    const r = seeded(5)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.prepend(renderer.domElement)
    renderer.domElement.style.cssText = 'display:block;width:100%;height:100%'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 600)
    const composer = new EffectComposer(renderer)
    const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.3, 0.8, 0.9)
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(bloom)
    composer.addPass(new OutputPass())

    // --- sky backdrop: a painted vertical gradient
    const skyCanvas = document.createElement('canvas')
    skyCanvas.width = 4
    skyCanvas.height = 512
    const skyTex = new THREE.CanvasTexture(skyCanvas)
    skyTex.colorSpace = THREE.SRGBColorSpace
    scene.background = skyTex

    const mat = (color: string, extra: THREE.MeshStandardMaterialParameters = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra })
    const add = (geo: THREE.BufferGeometry, m: THREE.Material, x: number, y: number, z: number, parent: THREE.Object3D = scene) => {
      const mesh = new THREE.Mesh(geo, m)
      mesh.position.set(x, y, z)
      parent.add(mesh)
      return mesh
    }

    // --- the carriage
    const wall = mat('#cfd8df')
    const trim = mat('#8fa0ad', { metalness: 0.5, roughness: 0.35 })
    const seat = mat('#27466e', { roughness: 0.9 })
    add(new THREE.BoxGeometry(LEN, 0.82, 0.14), wall, 0, 0.41, -1.5) // below the windows
    add(new THREE.BoxGeometry(LEN, 0.3, 0.14), wall, 0, 2.42, -1.5) // above the windows
    add(new THREE.BoxGeometry(LEN, 0.05, 0.22), trim, 0, 0.83, -1.46) // sill
    for (let x = -LEN / 2 + PITCH / 2; x < LEN / 2; x += PITCH) add(new THREE.BoxGeometry(0.3, 1.5, 0.14), wall, x - PITCH / 2, 1.55, -1.5) // pillars
    add(new THREE.PlaneGeometry(LEN, 1.5), new THREE.MeshStandardMaterial({ color: '#bfe2ff', transparent: true, opacity: 0.06, roughness: 0.05 }), 0, 1.55, -1.47) // glass
    const ceiling = add(new THREE.PlaneGeometry(LEN, 9), wall, 0, 2.55, 2)
    ceiling.rotation.x = Math.PI / 2
    for (const x of [-LEN / 2, LEN / 2]) add(new THREE.BoxGeometry(0.14, 2.6, 9), wall, x, 1.28, 2) // end walls
    // bench
    add(new THREE.BoxGeometry(LEN - 1.2, 0.36, 0.46), mat('#101820'), 0, 0.2, -1.2)
    add(new THREE.BoxGeometry(LEN - 1.2, 0.12, 0.56), seat, 0, 0.44, -1.17)
    add(new THREE.BoxGeometry(LEN - 1.2, 0.32, 0.09), seat, 0, 0.66, -1.41)
    // grab rail, hanging straps, poles
    const rail = add(new THREE.CylinderGeometry(0.022, 0.022, LEN, 10), trim, 0, 2.08, -0.7)
    rail.rotation.z = Math.PI / 2
    const straps: THREE.Group[] = []
    for (let x = -LEN / 2 + 0.6; x < LEN / 2; x += 0.62) {
      const g = new THREE.Group()
      g.position.set(x, 2.08, -0.7)
      add(new THREE.BoxGeometry(0.025, 0.24, 0.012), mat('#e9edf0'), 0, -0.12, 0, g)
      const ring = add(new THREE.TorusGeometry(0.07, 0.014, 8, 20), mat('#f3f5f7'), 0, -0.31, 0, g)
      ring.rotation.y = Math.PI / 2
      scene.add(g)
      straps.push(g)
    }
    for (const x of [-PITCH, PITCH]) add(new THREE.CylinderGeometry(0.026, 0.026, 2.55, 10), trim, x, 1.27, -0.9)
    const lampMat = new THREE.MeshStandardMaterial({ color: '#e9edf2', emissive: '#fff1d6', emissiveIntensity: 0.3 })
    add(new THREE.BoxGeometry(LEN - 1, 0.03, 0.2), lampMat, 0, 2.53, 0.2)

    // --- the floor is still water: a mirror
    const water = new Reflector(new THREE.PlaneGeometry(LEN, 9), { textureWidth: 1024, textureHeight: 1024, clipBias: 0.003, color: 0x9fc4e8 })
    water.rotation.x = -Math.PI / 2
    water.position.set(0, 0.01, 2)
    scene.add(water)

    // --- outside: sea to the horizon, far islands, clouds, poles that flick past
    const sea = add(new THREE.PlaneGeometry(1400, 700), mat('#3d8fd6', { roughness: 0.35, metalness: 0.2 }), 0, -3, -330)
    sea.rotation.x = -Math.PI / 2
    const islandMat = mat('#5d86b8', { flatShading: true })
    const moving: { o: THREE.Object3D; k: number; wrap: number }[] = [] // k = how much it moves per metre travelled
    for (let i = 0; i < 9; i++) {
      const isle = add(new THREE.ConeGeometry(14 + r() * 26, 5 + r() * 10, 6), islandMat, (r() - 0.5) * 520, -1 + r(), -190 - r() * 60)
      moving.push({ o: isle, k: 0.07, wrap: 280 })
    }
    const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 0.25, roughness: 1 })
    for (let i = 0; i < 18; i++) {
      const g = new THREE.Group()
      const n = 4 + Math.floor(r() * 4)
      for (let k = 0; k < n; k++) {
        const puff = add(new THREE.SphereGeometry(3 + r() * 4, 14, 10), cloudMat, (k - n / 2) * 4.2, r() * 2.4, r() * 3, g)
        puff.scale.y = 0.62
      }
      const z = -70 - r() * 110
      g.position.set((r() - 0.5) * 420, 4 + r() * (-z * 0.13), z)
      g.scale.setScalar(0.7 + r() * 1.3)
      scene.add(g)
      moving.push({ o: g, k: 0.035, wrap: 230 })
    }
    const poleMat = mat('#2a3440')
    for (let i = 0; i < 12; i++) moving.push({ o: add(new THREE.BoxGeometry(0.14, 7, 0.14), poleMat, i * 15 - 82.5, 1.5, -3.6), k: 1, wrap: 90 })
    add(new THREE.BoxGeometry(400, 0.03, 0.03), poleMat, 0, 4.6, -3.6) // overhead wire

    // --- the station that slides into the window: a platform, two lamps and a name board
    const platform = new THREE.Group()
    add(new THREE.BoxGeometry(34, 0.3, 3.2), mat('#aeb9c2'), 0, -0.2, -4.2, platform)
    add(new THREE.BoxGeometry(34, 0.06, 0.25), mat('#ffc629', { emissive: '#ffc629', emissiveIntensity: 0.4 }), 0, -0.03, -2.8, platform)
    const bulb = new THREE.MeshStandardMaterial({ color: '#fff', emissive: '#ffe2a8', emissiveIntensity: 2 })
    for (const x of [-7, 7]) {
      add(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 8), poleMat, x, 1.2, -5, platform)
      add(new THREE.SphereGeometry(0.16, 12, 8), bulb, x, 2.55, -5, platform)
    }
    const signCanvas = document.createElement('canvas')
    signCanvas.width = 1024
    signCanvas.height = 256
    const signTex = new THREE.CanvasTexture(signCanvas)
    signTex.colorSpace = THREE.SRGBColorSpace
    add(new THREE.PlaneGeometry(2.6, 0.65), new THREE.MeshBasicMaterial({ map: signTex, toneMapped: false }), 0, 1.32, -5.6, platform)
    for (const x of [-1.15, 1.15]) add(new THREE.BoxGeometry(0.06, 1.1, 0.06), poleMat, x, 0.5, -5.62, platform)
    scene.add(platform)
    const paintSign = (s: Station) => {
      const g = signCanvas.getContext('2d')!
      g.fillStyle = '#0d0f14'
      g.fillRect(0, 0, 1024, 256)
      g.fillStyle = s.color
      g.fillRect(0, 0, 1024, 26)
      g.beginPath()
      g.arc(110, 146, 44, 0, Math.PI * 2)
      g.lineWidth = 20
      g.strokeStyle = s.color
      g.stroke()
      g.fillStyle = '#ffffff'
      g.font = '650 104px Geist, system-ui, sans-serif'
      g.textBaseline = 'middle'
      let size = 104
      while (g.measureText(s.label).width > 800 && size > 40) g.font = `650 ${(size -= 6)}px Geist, system-ui, sans-serif`
      g.fillText(s.label, 190, 150)
      signTex.needsUpdate = true
    }
    paintSign(live.current.station)
    document.fonts?.ready.then(() => paintSign(live.current.station))

    // --- lights
    const hemi = new THREE.HemisphereLight('#ffffff', '#9fb4c8', 1.5)
    const sun = new THREE.DirectionalLight('#fff6e0', 2.2)
    sun.position.set(-8, 9, -14)
    const lamp = new THREE.PointLight('#fff1d6', 0.5, 14, 1.4)
    lamp.position.set(0, 1.7, 1.2)
    scene.add(hemi, sun, lamp)

    const theme = () => {
      const dark = live.current.film // bright blue day by default, dusk while the film plays
      const k = dark ? LOOK.dark : LOOK.light
      const g = skyCanvas.getContext('2d')!
      const grad = g.createLinearGradient(0, 0, 0, 512)
      grad.addColorStop(0, k.sky[0])
      grad.addColorStop(0.42, k.sky[1])
      grad.addColorStop(0.56, k.sky[2])
      grad.addColorStop(1, k.sky[2])
      g.fillStyle = grad
      g.fillRect(0, 0, 4, 512)
      skyTex.needsUpdate = true
      scene.fog = new THREE.Fog(k.sky[2], 120, 420)
      wall.color.set(k.wall)
      seat.color.set(k.seat)
      ;(sea.material as THREE.MeshStandardMaterial).color.set(k.sea)
      islandMat.color.set(dark ? '#2a2a66' : '#5d86b8')
      cloudMat.color.set(k.cloud)
      cloudMat.emissive.set(k.cloud)
      sun.color.set(k.sun)
      sun.intensity = dark ? 1.3 : 2.2
      hemi.intensity = k.hemi
      lamp.intensity = k.lamp * 2.2
      lampMat.emissiveIntensity = k.lamp * 0.45
      bloom.strength = k.bloom
      ;(water.material as THREE.ShaderMaterial).uniforms.color.value.set(k.water)
    }
    theme()
    const themeWatch = new MutationObserver(theme)
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    // --- the ride: pull away (old platform slides off), then glide into the new one
    const OUT = 2.0
    const IN = 2.9
    const FAR = 90
    let rideT = -1 // seconds into the current ride, -1 when standing at a platform
    let swapped = true
    let travelled = 0
    let again = false
    depart.current = () => {
      if (calm) return paintSign(live.current.station)
      if (rideT >= 0 && swapped) return void (again = true) // already arriving somewhere: go again once stopped
      if (rideT < 0) {
        rideT = 0
        travelled = 0
        swapped = false
      }
    }

    // --- look around with the mouse
    const look = { x: 0, y: 0, tx: 0, ty: 0 }
    const onMove = (e: PointerEvent) => {
      const b = el.getBoundingClientRect()
      look.tx = ((e.clientX - b.left) / b.width - 0.5) * 2
      look.ty = ((e.clientY - b.top) / b.height - 0.5) * 2
    }
    el.addEventListener('pointermove', onMove)

    let pushed = -1
    let themed = false
    const size = new ResizeObserver(() => {
      renderer.setSize(el.clientWidth, el.clientHeight, false)
      composer.setSize(el.clientWidth, el.clientHeight)
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      pushed = -1
    })
    size.observe(el)
    let onScreen = true
    const seen = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting))
    seen.observe(el)

    let last = performance.now()
    let raf = 0
    let fov = 52
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      if (!onScreen || document.hidden) return
      const t = now / 1000

      // how far the train has moved this frame
      let step = 0
      if (rideT >= 0) {
        rideT += dt
        let d: number
        if (rideT < OUT) {
          d = FAR * (rideT / OUT) ** 3
          platform.position.x = d
        } else {
          if (!swapped) {
            swapped = true
            paintSign(live.current.station)
          }
          const u = Math.min(1, (rideT - OUT) / IN)
          const e = 1 - (1 - u) ** 3
          d = FAR + FAR * e
          platform.position.x = -FAR + FAR * e
          if (u >= 1) {
            rideT = -1
            if (again) {
              again = false
              depart.current()
            }
          }
        }
        step = d - travelled
        travelled = d
      }
      const speed = step / dt // metres per second, for sway and shake
      for (const m of moving) {
        m.o.position.x += step * m.k + (m.k < 0.05 ? dt * 0.5 : 0) // clouds also drift on their own
        if (m.o.position.x > m.wrap) m.o.position.x -= m.wrap * 2
      }
      straps.forEach((s, i) => (s.rotation.z = Math.sin(t * 1.4 + i * 0.7) * 0.025 + Math.min(0.25, speed * 0.004)))

      // camera: seated, breathing slightly, turning a little with the mouse
      look.x += (look.tx - look.x) * Math.min(1, dt * 3)
      look.y += (look.ty - look.y) * Math.min(1, dt * 3)
      const filming = live.current.film
      if (filming !== themed) {
        themed = filming
        theme()
      }
      fov += ((filming ? 40 : 52) - fov) * Math.min(1, dt * 1.5)
      if (Math.abs(camera.fov - fov) > 0.01) {
        camera.fov = fov
        camera.updateProjectionMatrix()
        pushed = -1
      }
      const shake = calm ? 0 : Math.min(1, speed / 60) * 0.012
      camera.position.set(look.x * 0.35, 1.38 + Math.sin(t * 1.1) * 0.006 + Math.sin(t * 31) * shake, 2.5)
      camera.lookAt(look.x * 1.6 + (filming && !calm ? Math.sin(t * 0.25) * 1.2 : 0), 0.98 - look.y * 0.3, -1.5)

      const push = filming ? 0 : live.current.shift
      if (push !== pushed) {
        pushed = push
        if (push) camera.setViewOffset(el.clientWidth, el.clientHeight, -el.clientWidth * push, 0, el.clientWidth, el.clientHeight)
        else camera.clearViewOffset()
      }
      composer.render()
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      themeWatch.disconnect()
      size.disconnect()
      seen.disconnect()
      el.removeEventListener('pointermove', onMove)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return (
    <div ref={box} className="absolute inset-0 overflow-hidden bg-[#0a0f2c]">
      {children}
    </div>
  )
}

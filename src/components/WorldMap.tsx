import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { calm } from './motion'

// The home page map: a 3D isometric island (a Google Flow clip) that loops forward then backward, so the
// camera never jumps. Hotspots follow their landmark through the clip. Scrolling pins the map, zooms in on
// the station, then draws a path from the station to every landmark so the visitor picks where to go.
// Hovering a landmark (or its path chip) sends Jr over to introduce it.

type Pt = [x: number, y: number]
type Spot = { id: string; to: string | null; name: string; page: string; a: Pt; b: Pt; w: number; h: number; jr: string; act: string }

// a = first frame, b = last frame, in % of the 1280x570 video; w/h in % too
const SPOTS: Spot[] = [
  { id: 'doors', to: '/work', name: 'Door District', page: 'Work', a: [32.5, 34], b: [32, 36.5], w: 21, h: 40, act: 'point', jr: 'The Door District! Each door is a kind of work the boss takes on. Step inside one and see it running.' },
  { id: 'clock', to: '/story', name: 'Clock Tower', page: 'My story', a: [51.5, 23], b: [51.5, 26], w: 6, h: 32, act: 'think', jr: "The Clock Tower keeps the boss's story: college, 6 internships, and the night he won Colossus 3.0." },
  { id: 'market', to: '/services', name: 'Market', page: 'Services', a: [65.5, 41.5], b: [66, 44], w: 13, h: 26, act: 'cheer', jr: 'The Market. Everything the boss builds for clients: websites, AI tools, automations. Haggling is allowed.' },
  { id: 'station', to: null, name: 'Station', page: 'You are here', a: [51, 55], b: [51, 56], w: 17, h: 26, act: 'wave', jr: "This is the Station, where every trip starts. You are here! Pick a stop and I'll come with you." },
  { id: 'house', to: '/about', name: "Bipin's House", page: 'About', a: [34, 71], b: [35.5, 70], w: 17, h: 24, act: 'salute', jr: "Bipin's House. Come meet the boss: his skills, internships and certificates. Wipe your feet." },
  { id: 'lighthouse', to: '/contact', name: 'Lighthouse', page: 'Contact', a: [85, 65], b: [86, 63], w: 5, h: 30, act: 'wave', jr: 'The Lighthouse. Signal the boss from here. WhatsApp gets the fastest reply, trust me.' },
]
const HOME = SPOTS.find((s) => s.id === 'station')!
const W = 1280
const H = 570

const lerp = (a: Pt, b: Pt, k: number): Pt => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]
const clamp = (v: number) => Math.min(1, Math.max(0, v))
/** A curved route from the station to a landmark, in video pixels. */
const route = (from: Pt, to: Pt) => {
  const [x1, y1] = [(from[0] * W) / 100, (from[1] * H) / 100]
  const [x2, y2] = [(to[0] * W) / 100, (to[1] * H) / 100]
  return `M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 70} ${x2} ${y2}`
}

/** Tell Jr where to go and what to say; null sends him back to roaming. */
const callJr = (detail: { x: number; y: number; w: number; h: number; line: string; act: string } | null) =>
  dispatchEvent(new CustomEvent('jr:visit', { detail }))

export default function WorldMap() {
  const nav = useNavigate()
  const still = calm()
  const track = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const vid = useRef<HTMLVideoElement>(null)
  const spots = useRef<Record<string, HTMLAnchorElement | null>>({})
  const paths = useRef<Record<string, SVGPathElement | null>>({})
  const [active, setActive] = useState<string | null>(null)
  const [choosing, setChoosing] = useState(still)

  // one loop: follow the clip (hotspots + paths) and the scroll (zoom + path reveal), only while on screen
  useEffect(() => {
    const place = (k: number) => {
      const home = lerp(HOME.a, HOME.b, k)
      for (const s of SPOTS) {
        const [x, y] = lerp(s.a, s.b, k)
        const el = spots.current[s.id]
        if (el) (el.style.left = `${x}%`), (el.style.top = `${y}%`)
        paths.current[s.id]?.setAttribute('d', route(home, [x, y]))
      }
      return home
    }
    if (still) {
      place(1)
      return
    }
    const v = vid.current!
    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      // forward half then the mirrored half: progress through the camera move, 0..1..0
      const half = (v.duration || 7.84) / 2
      const t = v.currentTime
      const home = place(clamp(t < half ? t / half : (2 * half - t) / half))
      const r = track.current!.getBoundingClientRect()
      const p = clamp(-r.top / Math.max(1, r.height - innerHeight))
      const zoom = 1 + 0.16 * (1 - (1 - clamp(p / 0.55)) ** 3)
      const st = stage.current!
      st.style.transformOrigin = `${home[0]}% ${home[1]}%`
      st.style.transform = `scale(${zoom})`
      setChoosing(p > 0.32)
    }
    const seen = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) {
        v.play().catch(() => {})
        raf = requestAnimationFrame(tick)
      } else {
        v.pause()
        callJr(null)
      }
    })
    seen.observe(track.current!)
    return () => {
      seen.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [still])

  // send Jr back to roaming if the map unmounts while he is visiting
  useEffect(() => {
    return () => {
      callJr(null)
    }
  }, [])

  const enter = (s: Spot) => {
    setActive(s.id)
    const r = spots.current[s.id]?.getBoundingClientRect()
    if (r) callJr({ x: r.left, y: r.top, w: r.width, h: r.height, line: s.jr, act: s.act })
  }
  const leave = () => {
    setActive(null)
    callJr(null)
  }
  const go = (s: Spot) => (e: MouseEvent) => {
    e.preventDefault()
    if (s.to) nav(s.to, { viewTransition: true })
  }

  return (
    <div ref={track} className={`world-track ${still ? 'still' : ''}`}>
      <div className="world-pin">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h2 id="next-h" className="display text-[clamp(2rem,4.5vw,3.6rem)]">
            {choosing ? 'Choose your path' : 'Pick a destination'}
          </h2>
          <p className="max-w-md text-muted">
            {choosing ? 'Every route starts at the station. Hover one to hear about it, click to travel.' : 'Hover a landmark and Jr will show you around. Scroll to zoom in.'}
          </p>
        </div>

        <div className={`world mt-6 ${choosing ? 'choosing' : ''}`} onMouseLeave={leave}>
          <div ref={stage} className="world-stage">
            {still ? (
              <img src="/video/map-end.jpg" alt="" className="world-media" />
            ) : (
              <video ref={vid} src="/video/map-loop.mp4" poster="/video/map-start.jpg" muted loop playsInline preload="auto" aria-hidden="true" className="world-media" />
            )}

            <svg className="world-routes" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              {SPOTS.filter((s) => s.to).map((s) => (
                <path key={s.id} ref={(el) => void (paths.current[s.id] = el)} className={active === s.id ? 'on' : ''} pathLength={1} />
              ))}
            </svg>

            {SPOTS.map((s) => (
              <a
                key={s.id}
                ref={(el) => void (spots.current[s.id] = el)}
                href={s.to ?? '#top'}
                onClick={go(s)}
                onMouseEnter={() => enter(s)}
                onFocus={() => enter(s)}
                onBlur={leave}
                className={`spot ${active === s.id ? 'on' : ''} ${s.id === 'station' ? 'home' : ''}`}
                style={{ left: `${s.b[0]}%`, top: `${s.b[1]}%`, width: `${s.w}%`, height: `${s.h}%` }}
                data-cursor={s.to ? 'Travel' : 'You are here'}
                aria-label={s.to ? `${s.name}, ${s.page}. ${s.jr}` : s.jr}
              >
                <span className="spot-glow" aria-hidden="true" />
                <span className="spot-dot" aria-hidden="true" />
                <span className="spot-tag">{s.name}</span>
              </a>
            ))}
          </div>
        </div>

        <div className={`world-choices ${choosing ? 'on' : ''}`} aria-hidden={!choosing}>
          {SPOTS.filter((s) => s.to).map((s) => (
            <a
              key={s.id}
              href={s.to!}
              onClick={go(s)}
              onMouseEnter={() => enter(s)}
              onMouseLeave={leave}
              onFocus={() => enter(s)}
              onBlur={leave}
              tabIndex={choosing ? 0 : -1}
              className={`world-choice ${active === s.id ? 'on' : ''}`}
              data-cursor="Travel"
            >
              <span>{s.name}</span>
              <span className="text-muted">{s.page} →</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { NPCS, PLACES, lineFor, type Npc, type Place, type Say } from '../data/island'
import { calm } from './motion'
import { travel } from './Fall'
import { bell, sound, waterfall } from './sfx'

// The home page world. The Flow clip plays once as the entrance (through the clouds, the island appears),
// then hands over to a loop that drifts the camera back and forth, so it never stops or jumps (the loop's
// first frame is the entrance's last frame). Hotspots and bots follow the camera as it drifts.
// Scrolling pins the island and flies in toward the plaza, then routes light up to choose a path.
// Hosts introduce their place on hover; townsbots think out loud in comic bubbles.

const VIDEO = { intro: '/video/island-intro.mp4', loop: '/video/island-loop.mp4', poster: '/video/island-start.jpg', still: '/video/island-end.jpg' }
const W = 1600
const H = 900
// the camera drifts between these two moments of the source clip (seconds); positions are measured at both
const MOVE_FROM = 3.8
const MOVE_TO = 7.8
const CLIP_END = 7.93
const FALLS: [number, number] = [45, 84] // the big front waterfall, for its sound
const PLAZA = PLACES.find((p) => p.id === 'plaza')!
const onMap = PLACES.filter((p) => p.at)
const npcsOnMap = NPCS.filter((n) => n.at)

type Pt = [number, number]
type Bubble = { key: number; x: number; y: number; who: string; pal?: string; say: Say; host?: string; sign?: string; down?: boolean }
let keys = 0

const clamp = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2)
const lerp = (a: Pt, b: Pt | undefined, k: number): Pt => (b ? [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k] : a)
const route = (from: Pt, to: Pt) => {
  const [x1, y1] = [(from[0] * W) / 100, (from[1] * H) / 100]
  const [x2, y2] = [(to[0] * W) / 100, (to[1] * H) / 100]
  return `M${x1} ${y1} Q${(x1 + x2) / 2} ${Math.min(y1, y2) - 90} ${x2} ${y2}`
}

/** Comic bubble: a thought (cloud tail), or two lines of overheard talk, typed out. */
function ComicBubble({ b }: { b: Bubble }) {
  const talk = Array.isArray(b.say)
  const [a, z] = talk ? (b.say as [string, string]) : [b.say as string, '']
  const [n, setN] = useState(0)
  const total = a.length + z.length
  useEffect(() => {
    if (calm()) return setN(total)
    const id = setInterval(() => setN((v) => (v >= total ? (clearInterval(id), v) : v + 2)), 22)
    return () => clearInterval(id)
  }, [total])
  const below = b.down ?? b.y < 24
  const edge = b.x > 78 ? 'right' : b.x < 18 ? 'left' : ''
  return (
    <div className={`comic ${below ? 'below' : ''} ${edge}`} style={{ left: `${b.x}%`, top: `${b.y}%` }} role="status">
      <div className={`comic-box ${b.host ? 'host' : talk ? 'talk' : 'think'}`}>
        <p className="comic-who">{b.host ? b.host : b.who}</p>
        <p className="comic-line">{a.slice(0, n)}</p>
        {talk && n > a.length && (
          <>
            <p className="comic-who mt-2">{b.pal}</p>
            <p className="comic-line">{z.slice(0, n - a.length)}</p>
          </>
        )}
        {b.sign && n >= total && <p className="comic-sign">{b.sign}</p>}
        {!talk && !b.host && (
          <span className="comic-dots" aria-hidden="true">
            <i />
            <i />
          </span>
        )}
      </div>
    </div>
  )
}

type Props = { phase: 'intro' | 'reveal' | 'done'; fast: boolean; onLanded: () => void }

export default function Island({ phase, fast, onLanded }: Props) {
  const still = calm()
  const track = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const intro = useRef<HTMLVideoElement>(null)
  const loop = useRef<HTMLVideoElement>(null)
  const placeEls = useRef<Record<string, HTMLAnchorElement | null>>({})
  const npcEls = useRef<Record<string, HTMLButtonElement | null>>({})
  const routeEls = useRef<Record<string, SVGPathElement | null>>({})
  const k = useRef(1) // 0..1: where the camera is in its drift
  const landedAt = useRef(still ? -1e9 : Infinity)
  const zoomTo = useRef<Pt | null>(null)
  const hovering = useRef(false)
  const quiet = useRef(false)
  const [landed, setLanded] = useState(still)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [choosing, setChoosing] = useState(still)
  const [atTop, setAtTop] = useState(true)
  const [snd, setSnd] = useState(sound.on)
  useEffect(() => sound.subscribe(setSnd), [])

  const posOf = (x: { at?: Pt; end?: Pt }) => lerp(x.at!, x.end, k.current)

  // the entrance: play the clip once, then hand over to the loop on the very same frame
  useEffect(() => {
    if (phase !== 'reveal' || still) return
    const v = intro.current!
    v.currentTime = fast ? 2.6 : 0
    v.play().catch(() => land())
    const ring = fast ? 0 : window.setTimeout(bell, 3300) // a distant bell as the island appears
    return () => clearTimeout(ring)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const land = () => {
    if (landedAt.current !== Infinity) return
    loop.current?.play().catch(() => {})
    landedAt.current = performance.now()
    setLanded(true)
    onLanded()
  }

  // every frame: follow the camera drift, the scroll zoom, the pointer parallax, and the waterfall's volume
  useEffect(() => {
    let raf = 0
    let mx = 0
    let my = 0
    let px = 0
    let py = 0
    let water = 0
    const move = (e: PointerEvent) => {
      mx = e.clientX / innerWidth - 0.5
      my = e.clientY / innerHeight - 0.5
      const r = frame.current!.getBoundingClientRect()
      water = clamp(1 - Math.hypot(e.clientX - (r.left + (FALLS[0] / 100) * r.width), e.clientY - (r.top + (FALLS[1] / 100) * r.height)) / (innerWidth * 0.4))
    }
    // stage size in px, so hotspots can move with transforms (no layout work per frame)
    let sw = 1
    let sh = 1
    const measure = () => {
      sw = stage.current!.offsetWidth
      sh = stage.current!.offsetHeight
    }
    measure()
    const sized = new ResizeObserver(measure)
    sized.observe(stage.current!)
    const pin = track.current!.firstElementChild as HTMLElement
    // each hotspot rests at its final spot (left/top); the drift is a transform offset from there
    const at = (el: HTMLElement | null, x: number, y: number, end: Pt) => {
      if (el) el.style.transform = `translate3d(${((x - end[0]) * sw) / 100}px, ${((y - end[1]) * sh) / 100}px, 0) translate(-50%, -50%)`
    }
    let ps = -1 // scroll progress, eased toward the real value so wheel steps glide instead of jump
    let last = performance.now()
    let wasChoosing = false
    let wasTop = true
    let lastP = ''
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const r = track.current!.getBoundingClientRect()
      if (r.bottom < 0 || r.top > innerHeight) return

      // where is the camera? intro: clip time; loop: back from the end to MOVE_FROM, then forward again
      if (!still) {
        let t = CLIP_END
        if (landedAt.current === Infinity) t = intro.current!.currentTime
        else {
          const l = loop.current!
          const half = (l.duration || 8.08) / 2
          t = l.currentTime < half ? CLIP_END - l.currentTime : MOVE_FROM + (l.currentTime - half)
        }
        k.current = clamp((t - MOVE_FROM) / (MOVE_TO - MOVE_FROM))
      }
      const home = posOf(PLAZA)
      for (const p of onMap) {
        const [x, y] = posOf(p)
        at(placeEls.current[p.id], x, y, p.end!)
        routeEls.current[p.id]?.setAttribute('d', route(home, [x, y]))
      }
      for (const n of npcsOnMap) {
        const [x, y] = posOf(n)
        at(npcEls.current[n.id], x, y, n.end!)
      }

      const target = clamp(-r.top / Math.max(1, r.height - innerHeight))
      ps = ps < 0 ? target : ps + (target - ps) * (1 - Math.exp(-dt * 7))
      const p = ps
      const settle = ease(clamp((now - landedAt.current) / 2600))
      const e = 1 - (1 - clamp(p / 0.6)) ** 3
      const st = stage.current!
      if (zoomTo.current) {
        st.style.transition = 'transform 1.3s cubic-bezier(.65,0,.35,1)'
        st.style.transformOrigin = `${zoomTo.current[0]}% ${zoomTo.current[1]}%`
        st.style.transform = 'scale(2.4)'
      } else {
        // resting size: the whole island fits the width (the frame is 16:9 "cover", so it overflows on
        // narrower screens); wide screens also slide it right of the headline, narrow ones push it down
        const wide = innerWidth / innerHeight > 1.45
        const rest = Math.min(0.88, (innerWidth * (wide ? 1.08 : 1.3)) / Math.max(innerWidth, sw)) // island spans the screen (a bit more on phones)
        const [sx, sy] = wide ? [9, 2] : [0, 7]
        const z = 1 - (1 - rest) * settle * (1 - e) + 0.2 * e
        st.style.setProperty('--z', z.toFixed(2))
        st.style.transform = `translate3d(${settle * (1 - e) * sx}%, ${settle * (1 - e) * sy}%, 0) translate3d(${px * -12 * settle}px, ${py * -8 * settle}px, 0) scale(${z})`
      }
      px += (mx - px) * (1 - Math.exp(-dt * 2.5))
      py += (my - py) * (1 - Math.exp(-dt * 2.5))
      const pv = p.toFixed(2)
      if (pv !== lastP) pin.style.setProperty('--isle-p', (lastP = pv))
      const live = landedAt.current !== Infinity
      quiet.current = p > 0.3
      const choose = live && p > 0.38
      if (choose !== wasChoosing) setChoosing((wasChoosing = choose))
      const top = p < 0.06
      if (top !== wasTop) setAtTop((wasTop = top))
      waterfall(water * (0.6 + p * 0.6))
    }
    addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      sized.disconnect()
      removeEventListener('pointermove', move)
      waterfall(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [still])

  // after the entrance, play the loop only while the island is on screen
  useEffect(() => {
    if (!landed || still) return
    const v = loop.current!
    const seen = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()))
    seen.observe(track.current!)
    return () => seen.disconnect()
  }, [landed, still])

  const show = (b: Omit<Bubble, 'key'>, ms: number) => {
    const key = ++keys
    setBubbles((list) => [...list.filter((x) => x.who !== b.who).slice(-1), { ...b, key }])
    if (ms) setTimeout(() => setBubbles((list) => list.filter((x) => x.key !== key)), ms)
  }
  const hide = (who: string) => setBubbles((list) => list.filter((b) => b.who !== who))

  // townsbots talk on their own every few seconds, unless the visitor is hovering something
  useEffect(() => {
    if (phase !== 'done' || still) return
    const id = setInterval(() => {
      if (hovering.current || quiet.current || document.hidden) return
      const n = npcsOnMap[Math.floor(Math.random() * npcsOnMap.length)]
      const [x, y] = posOf(n)
      const down = (npcEls.current[n.id]?.getBoundingClientRect().top ?? 999) < 240
      show({ x, y, down, who: n.name, pal: n.pal, say: lineFor(n) }, 5200)
    }, 6500)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, still])

  // once the island has settled, Jr flies over to the plaza and says hello
  useEffect(() => {
    if (phase !== 'done') return
    const t = setTimeout(() => {
      const r = placeEls.current.plaza?.getBoundingClientRect()
      if (r) dispatchEvent(new CustomEvent('jr:visit', { detail: { x: r.left, y: r.top, w: r.width, h: r.height, act: 'wave', line: lineFor(PLAZA.host) } }))
    }, 2400)
    const back = setTimeout(() => dispatchEvent(new CustomEvent('jr:visit', { detail: null })), 9500)
    return () => {
      clearTimeout(t)
      clearTimeout(back)
    }
  }, [phase])

  const enterPlace = (p: Place) => {
    hovering.current = true
    setActive(p.id)
    const [x, y] = posOf(p)
    // open downward when the spot is near the top of the screen (under the header there is no room)
    const down = (placeEls.current[p.id]?.getBoundingClientRect().top ?? 999) < 260
    show({ x, y: down ? y + (p.h ?? 16) / 2 - 3 : y - (p.h ?? 16) / 2 + 3, down, who: p.host.name, host: `${p.name} · ${p.to || p.id === 'plaza' ? p.page : p.page + ' (soon)'}`, sign: `${p.host.name}, ${p.host.role.toLowerCase()}`, say: lineFor(p.host) }, 0)
  }
  const leavePlace = (p: Place) => {
    hovering.current = false
    setActive(null)
    hide(p.host.name)
  }
  const enterNpc = (n: Npc) => {
    hovering.current = true
    const [x, y] = posOf(n)
    const down = (npcEls.current[n.id]?.getBoundingClientRect().top ?? 999) < 240
    show({ x, y, down, who: n.name, pal: n.pal, say: lineFor(n) }, 0)
  }
  const leaveNpc = (n: Npc) => {
    hovering.current = false
    setTimeout(() => hide(n.name), 1600)
  }
  const goTo = (p: Place) => {
    if (!p.to) return enterPlace(p)
    zoomTo.current = posOf(p)
    travel(p.to)
  }
  const go = (p: Place) => (e: MouseEvent) => {
    e.preventDefault()
    goTo(p)
  }

  return (
    <section ref={track} className={`isle-track ${still ? 'still' : ''}`} aria-label="The island: every place is a page">
      <div className="isle-pin">
        <div ref={frame} className={`isle-frame ${landed ? 'live' : ''} ${choosing ? 'choosing' : ''}`}>
          <div ref={stage} className="isle-stage" style={{ transformOrigin: `${PLAZA.end![0]}% ${PLAZA.end![1]}%` }}>
            {still ? (
              <img src={VIDEO.still} alt="" className="isle-media" />
            ) : (
              <>
                <video ref={loop} src={VIDEO.loop} muted loop playsInline preload="auto" aria-hidden="true" className="isle-media" />
                <video
                  ref={intro}
                  src={VIDEO.intro}
                  poster={VIDEO.poster}
                  muted
                  playsInline
                  preload="auto"
                  onEnded={land}
                  aria-hidden="true"
                  className="isle-media"
                  style={{ visibility: landed ? 'hidden' : 'visible' }}
                />
              </>
            )}

            <div className="isle-vignette" aria-hidden="true" />

            <svg className="isle-routes" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true">
              {onMap.filter((p) => p.to).map((p) => (
                <path key={p.id} ref={(el) => void (routeEls.current[p.id] = el)} className={active === p.id ? 'on' : ''} pathLength={1} />
              ))}
            </svg>

            {npcsOnMap.map((n) => (
              <button
                key={n.id}
                ref={(el) => void (npcEls.current[n.id] = el)}
                className="npc"
                style={{ left: `${n.end![0]}%`, top: `${n.end![1]}%` }}
                onMouseEnter={() => enterNpc(n)}
                onMouseLeave={() => leaveNpc(n)}
                onFocus={() => enterNpc(n)}
                onBlur={() => leaveNpc(n)}
                onClick={() => enterNpc(n)}
                tabIndex={landed ? 0 : -1}
                data-cursor="none"
                aria-label={`${n.name}: listen`}
              />
            ))}

            {onMap.map((p) => (
              <a
                key={p.id}
                ref={(el) => void (placeEls.current[p.id] = el)}
                href={p.to ?? '#'}
                onClick={go(p)}
                onMouseEnter={() => enterPlace(p)}
                onMouseLeave={() => leavePlace(p)}
                onFocus={() => enterPlace(p)}
                onBlur={() => leavePlace(p)}
                tabIndex={landed ? 0 : -1}
                className={`place ${active === p.id ? 'on' : ''} ${p.id === 'plaza' ? 'home' : ''}`}
                style={{ left: `${p.end![0]}%`, top: `${p.end![1]}%`, width: `${p.w}%`, height: `${p.h}%` }}
                data-cursor="none"
                aria-label={`${p.name}, ${p.page}. Hosted by ${p.host.name}.`}
              >
                <span className="place-glow" aria-hidden="true" />
                <span className="place-dot" aria-hidden="true" />
              </a>
            ))}

            {bubbles.map((b) => (
              <ComicBubble key={b.key} b={b} />
            ))}
          </div>
        </div>

        <div className="isle-mist" aria-hidden="true" />

        <div className={`isle-copy ${phase === 'done' && atTop ? 'on' : ''}`}>
          <p className="text-sm font-medium tracking-wide">Bipin A · Full-stack developer · Bengaluru, working worldwide</p>
          <h1 className="isle-h1">
            Websites, AI tools and automations
            <span className="serif"> that feel like this.</span>
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="/contact" onClick={(e) => (e.preventDefault(), travel('/contact'))} className="pill pill-dark" data-cursor="Let's talk">
              Start a project
            </a>
            <button onClick={() => scrollTo({ top: (track.current?.offsetTop ?? 0) + innerHeight * 1.1, behavior: 'smooth' })} className="pill isle-ghost">
              Explore the island
            </button>
          </div>
        </div>

        <p className={`isle-choose ${choosing ? 'on' : ''}`} aria-hidden={!choosing}>
          <span>
            Choose your <span className="serif">path</span>
          </span>
          <span className="isle-choose-sub">Hover a glowing place to meet its host, click to travel</span>
        </p>

        {phase === 'done' && atTop && !still && <p className="isle-hint">Scroll to fly in</p>}

        <button className="isle-sound" onClick={() => sound.set(!snd)} aria-pressed={snd} data-cursor={snd ? 'Mute' : 'Sound'}>
          <span className={`eq ${snd ? 'on' : ''}`} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          Sound {snd ? 'on' : 'off'}
        </button>
      </div>
    </section>
  )
}

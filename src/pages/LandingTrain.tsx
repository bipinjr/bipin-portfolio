import { useEffect, useRef, useState } from 'react'
import { L } from '../components/bits'
import WorldMap from '../components/WorldMap'
import { calm, Words } from '../components/motion'

// The home page: a short boarding counter, then the hero over real train footage with the 3D figure on
// a metro seat, then three ways onward, each to its own page.
// (src/components/Avatar3D.tsx is the earlier code-built figure, kept but unused.)

const ROLES = ['Full-stack developer', 'AI feature builder', 'Automation builder', 'Web developer']

/** Counts 0 to 100 once per visit, then lifts away like a shutter. */
function Boarding() {
  const [n, setN] = useState(0)
  const [gone, setGone] = useState(() => {
    try {
      return calm() || sessionStorage.getItem('boarded') === '1'
    } catch {
      return calm()
    }
  })
  useEffect(() => {
    if (gone) return
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 1400)
      setN(Math.round((1 - (1 - p) ** 3) * 100))
      if (p < 1) return void (raf = requestAnimationFrame(tick))
      try {
        sessionStorage.setItem('boarded', '1')
      } catch {
        /* fine: it will just play again next time */
      }
      setTimeout(() => setGone(true), 900)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  if (gone) return null
  return (
    <div className={`boarding fixed inset-0 z-50 flex flex-col justify-between bg-[#100e0e] p-6 text-[#e8e4e0] sm:p-10 ${n === 100 ? 'lift' : ''}`} role="status" aria-label="Loading">
      <p className="text-sm">
        <span className="font-semibold">Bipin A</span> <span className="text-[#b3a8a8]">portfolio</span>
      </p>
      <div className="flex items-end justify-between gap-6">
        <p className="display text-[clamp(5rem,16vw,11rem)] leading-none tabular-nums">{n}</p>
        <p className="mb-5 text-sm text-[#b3a8a8]">Doors closing</p>
      </div>
    </div>
  )
}

/** The role on a ring-bound card that flips to the next one every few seconds. */
function RoleCard() {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (calm()) return
    const t = setInterval(() => setI((x) => (x + 1) % ROLES.length), 2800)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="relative mt-6 w-fit max-w-full [perspective:900px]">
      <div className="absolute -top-2.5 right-6 left-6 z-10 flex justify-between" aria-hidden="true">
        {Array.from({ length: 11 }, (_, k) => (
          <span key={k} className="h-5 w-2 rounded-full border-2 border-[#8d8380] bg-[#f6f3f0]" />
        ))}
      </div>
      <div key={i} className="flip-card rounded-xl bg-[#fbf9f7] px-6 pt-7 pb-5 text-[#1a1818] shadow-[0_8px_0_-2px_#1a1818] sm:px-8">
        <p className="display text-[clamp(1.9rem,4.4vw,3.4rem)] whitespace-nowrap">{ROLES[i]}</p>
      </div>
      <p className="sr-only">I am a {ROLES.join(', ')}.</p>
    </div>
  )
}

/**
 * The 3D figure of Bipin. A still pose, with short transparent action clips that play over it
 * (each clip starts and ends on the still pose, so the switch is invisible). It waves on arrival,
 * waves when clicked, and leans toward the pointer.
 * Safari cannot play see-through WebM, so it keeps the still pose and only gets the speech bubble.
 */
const ACTIONS = { wave: '/video/me-wave.webm' }
const canPlayAlpha = () => !/^((?!chrome|android).)*safari/i.test(navigator.userAgent)

function Portrait() {
  const fig = useRef<HTMLDivElement>(null)
  const clip = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [hi, setHi] = useState(false)

  const act = (name: keyof typeof ACTIONS) => {
    const v = clip.current
    if (!v || calm() || !canPlayAlpha()) return
    if (!v.src.endsWith(ACTIONS[name])) v.src = ACTIONS[name]
    v.currentTime = 0
    v.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
  }

  useEffect(() => {
    const first = setTimeout(() => act('wave'), 1400) // a wave once the page has settled
    const el = fig.current
    if (!el || calm() || !matchMedia('(pointer: fine)').matches) return () => clearTimeout(first)
    let tx = 0
    let ty = 0
    let x = 0
    let y = 0
    let raf = 0
    const move = (e: PointerEvent) => {
      tx = e.clientX / innerWidth - 0.5
      ty = e.clientY / innerHeight - 0.5
    }
    const tick = () => {
      raf = requestAnimationFrame(tick)
      x += (tx - x) * 0.06
      y += (ty - y) * 0.06
      el.style.transform = `perspective(1200px) rotateY(${x * 7}deg) rotateX(${-y * 4}deg) translate3d(${x * 14}px, ${y * 8}px, 0)`
    }
    addEventListener('pointermove', move, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      clearTimeout(first)
      cancelAnimationFrame(raf)
      removeEventListener('pointermove', move)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sayHi = () => {
    act('wave')
    setHi(true)
    setTimeout(() => setHi(false), 2800)
  }

  return (
    <div className="relative flex h-full items-end justify-center">
      <div className="absolute bottom-3 h-7 w-1/2 rounded-[50%] bg-black/25 blur-xl" aria-hidden="true" />
      <div ref={fig} className="relative h-full will-change-transform">
        <button onClick={sayHi} data-cursor="Say hi" className="relative block h-full" aria-label="Say hi to Bipin">
          <img src="/images/me-3d.webp" alt="A 3D animated-style figure of Bipin in a light blue oxford shirt and navy chinos, arms crossed" className={`h-full w-auto object-contain object-bottom select-none ${playing ? 'invisible' : ''}`} draggable={false} fetchPriority="high" />
          <video ref={clip} muted playsInline preload="auto" src={ACTIONS.wave} onEnded={() => setPlaying(false)} aria-hidden="true" className={`absolute inset-0 h-full w-full object-contain object-bottom ${playing ? '' : 'invisible'}`} />
        </button>
        {hi && (
          <p className="bubble absolute top-[2%] right-[72%] w-[13rem] rounded-2xl rounded-br-sm bg-ink px-4 py-3 text-sm font-medium text-paper" role="status">
            Hi! Tell me what you're building and I'll show you how I'd do it.
          </p>
        )}
      </div>
    </div>
  )
}

function Hero() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  useEffect(() => {
    const watch = new MutationObserver(() => setDark(document.documentElement.dataset.theme === 'dark'))
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => watch.disconnect()
  }, [])
  const clip = dark ? 'train-dusk' : 'train-day'
  return (
    <section className="relative isolate overflow-hidden" aria-label="Introduction">
      {/* real footage from inside a train; a still frame when motion is turned down */}
      {calm() ? (
        <img src={`/video/${clip}.jpg`} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      ) : (
        <video key={clip} src={`/video/${clip}.mp4`} poster={`/video/${clip}.jpg`} autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      )}
      <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--paper) 96%, transparent) 0%, color-mix(in srgb, var(--paper) 82%, transparent) 45%, color-mix(in srgb, var(--paper) 35%, transparent) 100%)' }} />

      <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] w-full max-w-[88rem] items-center gap-6 px-5 pt-10 sm:px-10 lg:grid-cols-[1.15fr_1fr] lg:pt-0">
        <div className="py-6 lg:py-16">
          <h1 className="display text-[clamp(2.8rem,6.6vw,5.4rem)]">
            <Words text="Hi, I'm Bipin." delay={150} />
            <span className="block text-muted">
              <Words text="I am a" delay={380} />
            </span>
          </h1>
          <div className="hero-in" style={{ ['--d' as string]: '600ms' }}>
            <RoleCard />
          </div>
          <p className="hero-in mt-8 max-w-md text-lg" style={{ ['--d' as string]: '750ms' }}>
            I build web apps, AI features and automations for clients in India and abroad. Based in Bengaluru, working remotely across time zones.
          </p>
          <div className="hero-in mt-8 flex flex-wrap gap-3" style={{ ['--d' as string]: '850ms' }}>
            <L to="/contact" className="pill pill-dark">
              Start a project
            </L>
            <L to="/work" className="pill pill-ghost">
              See my work
            </L>
          </div>
        </div>
        <div className="hero-in h-[min(68vh,40rem)] min-h-[22rem]" style={{ ['--d' as string]: '300ms' }}>
          <Portrait />
        </div>
      </div>
    </section>
  )
}

/** Where to go next: a game-style map of the site. */
function NextStations() {
  return (
    <section className="mx-auto max-w-[88rem] px-5 sm:px-10" aria-labelledby="next-h">
      <WorldMap />
    </section>
  )
}

export default function Landing() {
  return (
    <>
      <Boarding />
      <Hero />
      <NextStations />
    </>
  )
}

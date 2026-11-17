import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { calm } from './motion'
import { offers } from '../data/profile'
import { lineFor } from '../data/island'
import { LOOKS, placeFor } from './crew-looks'
import BotChat from './BotChat'

// Jr: a small robot who lives on the site. Bipin is his boss and his best friend, and he talks about
// him that way. He walks along the bottom, takes off with a jetpack to fly anywhere on screen, hovers,
// does barrel rolls and lands again. Every limb moves (SVG), his screen face changes expression and his
// eyes follow the cursor, and little effects pop around him (sparkles, hearts, notes, gears, z's).
// He greets by time of day, comments on each page, thinks random thoughts, dodges the cursor, reacts to
// fast scrolling, dozes at night, and answers questions (and tells jokes) when clicked.

type Act = 'idle' | 'walk' | 'fly' | 'wave' | 'point' | 'watch' | 'stretch' | 'dance' | 'hop' | 'sleep' | 'think' | 'cheer' | 'salute' | 'spin'
type Face = 'normal' | 'happy' | 'surprised' | 'sleep' | 'love'
type Fx = '' | 'sparkle' | 'hearts' | 'notes' | 'zz' | 'gear' | 'sweat'

const W = 76
const H = Math.round(W * 1.4)

const PAGE: Record<string, { line: string; act: Act }> = {
  '/': { line: 'Welcome aboard! The boss built this whole place. I just live here.', act: 'cheer' },
  '/work': { line: 'Every door here is something Bipin built. I helped. By watching.', act: 'point' },
  '/story': { line: 'Ah, the backstory. I was a doodle on a napkin back then.', act: 'think' },
  '/services': { line: 'Need something built? Boss builds it, I cheer. Fair split.', act: 'cheer' },
  '/about': { line: 'That is my boss. Best friend too. Do not tell him I said that.', act: 'salute' },
  '/contact': { line: 'WhatsApp him. He replies faster than I fly.', act: 'dance' },
}
const GREET: [number, number, string][] = [
  [5, 12, "Morning! The boss is on his third coffee. I run on vibes."],
  [12, 17, "Afternoon! Bipin's coding, I'm supervising. Mostly."],
  [17, 22, "Evening! Boss said 'one more feature'. He always says that."],
]
const NIGHT_GREET = "Shh, it's late. Bipin's still debugging. I'm moral support."
const THOUGHTS = [
  'Do robots dream of clean code?',
  "Boss said 'it works on my machine'. I am the machine.",
  'One day I will get a bigger jetpack.',
  'Is a semicolon just a tiny wink? ;)',
  'Boss fixed a bug at 2am. I was asleep. Heroic of me.',
  'Hire Bipin, get me free. Best deal in town.',
  'I am 76 pixels of pure enthusiasm.',
  'Low battery? Never. Low patience? Sometimes.',
  'If I debug myself, am I my own boss?',
  'Boss gave me a jetpack instead of a raise. Worth it.',
  'Note to self: stop flying into the footer.',
  'Bipin talks to his code. I talk to Bipin. We are a team.',
]
const TICKLES: [string, Act][] = [
  ['Hey! That tickles!', 'hop'],
  ["Boss, the cursor's poking me again!", 'hop'],
  ['Jetpack, engage!', 'fly'],
  ['Catch me if you can!', 'spin'],
  ['Personal space, please. I am a professional.', 'hop'],
]
const FX_FOR: Partial<Record<Act, Fx>> = { dance: 'notes', sleep: 'zz', think: 'gear', cheer: 'sparkle', hop: 'sweat', spin: 'sparkle' }

const hour = () => new Date().getHours()
const greeting = () => GREET.find(([a, b]) => hour() >= a && hour() < b)?.[2] ?? NIGHT_GREET
const isNight = () => hour() >= 22 || hour() < 5
const ground = () => innerHeight - H - 2
const rand = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

export default function Bot() {
  const { pathname } = useLocation()
  // each page has its own host bot (Pixel at the house, Bolt at the Foundry...); Jr is the boss's assistant on home
  const place = placeFor(pathname)
  const host = place.host
  const look = LOOKS[host.name] ?? LOOKS.Jr
  const isJr = host.name === 'Jr'
  const onHome = useRef(true)
  onHome.current = pathname === '/'
  const root = useRef<HTMLDivElement>(null)
  const art = useRef<HTMLDivElement>(null)
  const eyes = useRef<SVGGElement>(null)
  const [gone, setGone] = useState(() => {
    try {
      return sessionStorage.getItem('jr') === 'off'
    } catch {
      return false
    }
  })
  const [say, setSay] = useState<{ text: string; thought?: boolean } | null>(null)
  const [act, setAct] = useState<Act>('idle')
  const [face, setFace] = useState<Face>('normal')
  const [fx, setFx] = useState<Fx>('')
  const [facing, setFacing] = useState(1)
  const [jet, setJet] = useState(false)
  const [high, setHigh] = useState(false) // near the top: speech goes below him
  const [side, setSide] = useState<'l' | 'r' | 'c'>('c')
  const [menu, setMenu] = useState(false)
  const [onHero, setOnHero] = useState(false)
  const facingRef = useRef(1)
  facingRef.current = facing
  const s = useRef({
    x: 80,
    y: -1,
    gx: 80,
    gy: -1,
    speed: 60,
    sayUntil: 0,
    actUntil: 0,
    lastTickle: 0,
    lastMove: performance.now(),
    first: true,
    busy: false,
    visitUntil: 0,
    pending: '' as Act | '',
    faceTo: 1,
  })

  const speak = (text: string, ms = 3400, thought = false) => {
    setSay({ text, thought })
    s.current.sayUntil = performance.now() + ms
  }
  const perform = (a: Act, ms = 2200, f: Face = 'happy', effect?: Fx) => {
    if (calm() && a !== 'idle') return
    setAct(a)
    setFace(f)
    setFx(effect ?? FX_FOR[a] ?? '')
    s.current.actUntil = performance.now() + ms
  }
  /** Pick a new place to go: usually somewhere on the floor, sometimes up in the air. */
  const roam = (air = Math.random() < 0.4) => {
    const st = s.current
    // inner pages: stay in the side margins so the bot never sits on the text; the island is free to roam
    const side = () => (Math.random() < 0.5 ? 12 + Math.random() * Math.max(4, innerWidth * 0.1 - W) : innerWidth * 0.9 - 12 + Math.random() * Math.max(4, innerWidth * 0.1 - W))
    st.gx = onHome.current ? 16 + Math.random() * Math.max(40, innerWidth - W - 32) : side()
    if (air) {
      const edge = Math.random() < 0.7
      st.gx = edge ? side() : st.gx
      st.gy = 70 + Math.random() * innerHeight * 0.5
      st.speed = 150 + Math.random() * 60
    } else {
      st.gy = ground()
      st.speed = 55 + Math.random() * 25
    }
  }

  // arrival: greeting by time, introduction, then the page line with a matching action
  useEffect(() => {
    if (gone) return
    const say = (x: ReturnType<typeof lineFor>) => (Array.isArray(x) ? x.join(' ') : x)
    const page = isJr ? (PAGE[pathname] ?? { line: 'Ooh, a new page. The boss never tells me anything.', act: 'think' as Act }) : { line: say(lineFor(host)), act: 'point' as Act }
    const timers: number[] = []
    const later = (ms: number, f: () => void) => timers.push(window.setTimeout(f, ms))
    later(900, () => {
      if (!isJr) {
        // a different bot works here: they introduce themselves, then their place
        speak(`Hi! I'm ${host.name}, ${host.role.toLowerCase()} at ${place.name}. Bipin's my boss.`, 4000)
        perform('wave', 2400)
        later(4300, () => {
          speak(page.line, 4600)
          perform(page.act, 2600)
        })
      } else if (s.current.first) {
        s.current.first = false
        speak(greeting(), 3600)
        perform('wave', 2600)
        later(3900, () => {
          speak("I'm Jr. Bipin is my boss and my best friend. Click me, I know things.", 4200)
          perform('salute', 2400)
        })
        later(8400, () => {
          speak(page.line, 3800)
          perform(page.act, 2600)
        })
      } else {
        speak(page.line, 3800)
        perform(page.act, 2600)
      }
    })
    return () => timers.forEach(clearTimeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, gone])

  // Jr stays out of the way while the cloud-dive intro plays on the home page
  useEffect(() => {
    const check = () => setOnHero(pathname === '/' && document.documentElement.dataset.intro === '1')
    check()
    addEventListener('island:intro', check)
    return () => removeEventListener('island:intro', check)
  }, [pathname])

  useEffect(() => {
    if (gone) return
    const st = s.current
    if (st.y < 0) st.y = st.gy = ground()
    const fine = matchMedia('(pointer: fine)').matches
    const still = calm()
    let raf = 0
    let last = performance.now()
    let lastScroll = scrollY
    let lastScrollT = performance.now()
    let ex = 0
    let ey = 0
    let tex = 0
    let tey = 0
    let tilt = 0
    let flying = false

    const brain = setInterval(() => {
      if (still || st.busy || performance.now() < st.visitUntil || performance.now() - st.lastMove > 25000 || performance.now() < st.actUntil) return
      const r = Math.random()
      if (r < 0.45) roam()
      else if (r < 0.75) {
        const a = rand<Act>(['watch', 'stretch', 'wave', 'think', 'point', 'cheer', 'dance'])
        perform(a, 2400, a === 'think' ? 'normal' : 'happy')
        if (a === 'watch' && performance.now() > st.sayUntil) speak("Boss is late. Again. It's fine. I'm fine.", 2400)
      } else if (performance.now() > st.sayUntil) {
        speak(rand(THOUGHTS), 3600, true)
        perform('think', 2600, 'normal', 'gear')
      }
    }, 4500)

    const onMove = (e: PointerEvent) => {
      st.lastMove = performance.now()
      setAct((a) => (a === 'sleep' ? 'idle' : a))
      setFace((f) => (f === 'sleep' ? 'surprised' : f))
      setFx((f) => (f === 'zz' ? '' : f))
      const r = root.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + W / 2)
      const dy = e.clientY - (r.top + 30)
      const d = Math.hypot(dx, dy) || 1
      tex = (dx / d) * 3.5 * facingRef.current
      tey = (dy / d) * 2.5
      if (fine && !st.busy && d < 95 && performance.now() - st.lastTickle > 3500) {
        st.lastTickle = performance.now()
        const [line, a] = rand(TICKLES)
        speak(line, 1800)
        perform(a === 'fly' ? 'cheer' : a, a === 'spin' ? 900 : 700, 'surprised')
        if (!still) {
          // escape: up and away when he says jetpack, otherwise along the floor
          st.gx = Math.min(innerWidth - W - 16, Math.max(16, st.x - Math.sign(dx || 1) * 260))
          st.gy = a === 'fly' || a === 'spin' ? 80 + Math.random() * innerHeight * 0.4 : st.gy
          st.speed = 240
        }
      }
    }
    const onScroll = () => {
      const now = performance.now()
      const v = Math.abs(scrollY - lastScroll) / Math.max(16, now - lastScrollT)
      lastScroll = scrollY
      lastScrollT = now
      if (v > 3.2 && now > st.sayUntil && !st.busy) {
        perform('hop', 600, 'surprised')
        speak("Whoa! My jetpack can't keep up!", 1500)
      }
    }
    const idle = setInterval(() => {
      if (st.busy || performance.now() - st.lastMove < 25000) return
      if (isNight()) {
        st.gy = ground() // come down to nap
        setAct('sleep')
        setFace('sleep')
        setFx('zz')
        setSay({ text: 'Zzz… five more minutes, boss…' })
        st.sayUntil = Infinity
        st.actUntil = Infinity
      } else if (performance.now() > st.sayUntil) {
        speak("Still there? I'll guard the page. Very seriously.", 3000)
        perform('watch', 2200, 'normal')
      }
    }, 6000)
    // the map calls him over: stand beside the landmark (left of it if there is room), face it, introduce it
    const onVisit = (e: Event) => {
      const d = (e as CustomEvent).detail as { x: number; y: number; w: number; h: number; line: string; act: Act } | null
      if (!d) {
        st.visitUntil = performance.now() + 2500
        return
      }
      st.visitUntil = Infinity
      const left = d.x - W - 6
      const toLeft = left > 12
      st.gx = toLeft ? left : Math.min(innerWidth - W - 12, d.x + d.w + 6)
      st.gy = Math.max(70, Math.min(ground(), d.y + d.h / 2 - H / 2))
      st.speed = 420
      st.faceTo = toLeft ? 1 : -1
      st.pending = d.act
      st.lastMove = performance.now()
      speak(d.line, 5200)
    }
    const onResize = () => {
      if (st.gy > ground() || !flying) st.gy = ground()
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const dx = st.gx - st.x
      const dy = st.gy - st.y
      const dist = Math.hypot(dx, dy)
      const moving = dist > 2
      if (moving) {
        const step = Math.min(dist, st.speed * dt)
        st.x += (dx / dist) * step
        st.y += (dy / dist) * step
        if (Math.abs(dx) > 1 && Math.sign(dx) !== facingRef.current) setFacing(Math.sign(dx))
      }
      // in the air whenever he is above the floor or heading up
      const air = st.y < ground() - 3 || st.gy < ground() - 3
      if (air !== flying) {
        flying = air
        setJet(air)
      }
      const bob = flying && !still ? Math.sin(now / 260) * 4 : 0
      tilt += ((flying && moving ? Math.max(-14, Math.min(14, dx * 0.08)) : 0) - tilt) * 0.12
      if (root.current) root.current.style.transform = `translate(${st.x}px, ${st.y + bob}px)`
      if (art.current) art.current.style.rotate = `${tilt}deg`

      if (!moving && st.pending) {
        setFacing(st.faceTo)
        perform(st.pending, 2600, 'happy')
        st.pending = ''
      }
      if (now > st.actUntil) {
        st.actUntil = Infinity
        setAct(flying ? 'fly' : moving ? 'walk' : 'idle')
        setFace('normal')
        setFx('')
      } else if (st.actUntil === Infinity) setAct((a) => (a === 'sleep' ? a : flying ? 'fly' : moving ? 'walk' : a === 'walk' || a === 'fly' ? 'idle' : a))

      setHigh(st.y < 150)
      setSide(st.x < 140 ? 'l' : st.x > innerWidth - 220 ? 'r' : 'c')
      ex += (tex - ex) * 0.2
      ey += (tey - ey) * 0.2
      if (eyes.current) eyes.current.style.transform = `translate(${ex}px, ${ey}px)`
      if (now > st.sayUntil) setSay(null)
    }
    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    addEventListener('jr:visit', onVisit)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(brain)
      clearInterval(idle)
      removeEventListener('pointermove', onMove)
      removeEventListener('scroll', onScroll)
      removeEventListener('resize', onResize)
      removeEventListener('jr:visit', onVisit)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gone])

  // the question card pauses his wandering; Esc closes it
  useEffect(() => {
    s.current.busy = menu
    if (!menu) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setMenu(false)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [menu])

  if (gone) return null
  const dismiss = () => {
    try {
      sessionStorage.setItem('jr', 'off')
    } catch {
      /* fine: he will just come back next visit */
    }
    setGone(true)
  }

  return (
    <div ref={root} className={`bot ${onHero ? 'away' : ''}`} style={{ ['--eye' as string]: look.eye }} data-act={act} data-face={face} data-jet={jet} data-high={high} data-side={side}>
      {menu ? (
        <BotChat
          key={host.name}
          bot={host.name}
          intro={isJr ? "Hi! I'm Jr. Ask me anything about the boss." : `Hi, I'm ${host.name} from ${place.name}. Ask me anything about the boss.`}
          onClose={() => setMenu(false)}
          onAnswer={() => perform(rand(['cheer', 'wave', 'hop', 'think'] as Act[]), 2000, 'happy')}
        />
      ) : (
        say && (
          <p className={`bot-say ${say.thought ? 'thought' : ''}`} role="status">
            {say.text}
          </p>
        )
      )}

      <div className={`bot-fx fx-${fx}`} aria-hidden="true">
        <i />
        <i />
        <i />
      </div>

      <button
        className="bot-body"
        data-cursor={`Ask ${host.name}`}
        aria-label={`${host.name}, ${host.role.toLowerCase()}. Click to ask about Bipin.`}
        aria-expanded={menu}
        onClick={() => {
          setMenu((m) => !m)
          perform('wave', 1800, 'happy')
        }}
      >
        <div ref={art} className="bot-art" key={host.name}>
          <svg viewBox="0 0 100 140" width={W} height={H} style={{ transform: `scaleX(${facing})` }} aria-hidden="true">
            <ellipse className="bot-shadow" cx="50" cy="134" rx="24" ry="4" />
            <g className="all">
              {/* jetpack on his back, with two flames that only burn in the air */}
              <g className="jetpack">
                <rect x="14" y="58" width="16" height="32" rx="6" fill="#8a96a3" stroke="#1a1818" strokeWidth="1.6" />
                <rect x="17" y="62" width="10" height="6" rx="2" fill="#e0752f" />
                <rect x="15" y="88" width="6" height="6" rx="1.5" fill="#5b6570" />
                <rect x="23" y="88" width="6" height="6" rx="1.5" fill="#5b6570" />
                <g className="flame">
                  <path d="M15.5 94 Q18 112 20.5 94 Z" fill="#ffb347" />
                  <path d="M23.5 94 Q26 112 28.5 94 Z" fill="#ffb347" />
                  <path d="M16.6 94 Q18 104 19.4 94 Z" fill="#fff3c4" />
                  <path d="M24.6 94 Q26 104 27.4 94 Z" fill="#fff3c4" />
                </g>
              </g>
              <g className="leg l">
                <rect x="35" y="90" width="12" height="32" rx="6" fill={look.pants} />
                <rect x="31" y="118" width="18" height="9" rx="4.5" fill="#f4f3ef" stroke="#1a1818" strokeWidth="1.5" />
              </g>
              <g className="leg r">
                <rect x="53" y="90" width="12" height="32" rx="6" fill={look.pants} />
                <rect x="51" y="118" width="18" height="9" rx="4.5" fill="#f4f3ef" stroke="#1a1818" strokeWidth="1.5" />
              </g>
              <g className="arm l">
                <rect x="20" y="62" width="11" height="30" rx="5.5" fill={look.shirt} stroke="#1a1818" strokeWidth="1.5" />
                <rect x="20" y="82" width="11" height="5" rx="1.5" fill="#1a1818" />
                <circle cx="25.5" cy="94" r="6" fill="#d9dde3" stroke="#1a1818" strokeWidth="1.5" />
              </g>
              <g className="torso">
                <rect x="27" y="56" width="46" height="40" rx="14" fill={look.shirt} stroke="#1a1818" strokeWidth="2" />
                {look.extra && <g transform="translate(27 56) scale(0.82 0.87) translate(-22 -54)">{look.extra}</g>}
                <path d="M42 57 L50 65 L58 57 Z" fill="#f4f3ef" stroke="#1a1818" strokeWidth="1.2" />
                <circle cx="50" cy="71" r="1.6" fill="#24324a" />
                <rect x="55" y="68" width="13" height="8" rx="2" fill="#f2eee9" stroke="#1a1818" strokeWidth="1" />
                <text x="61.5" y="74.4" textAnchor="middle" fontSize="5.6" fontWeight="800" fill="#1a1818">
                  {look.badge}
                </text>
                <rect x="28" y="88" width="44" height="5" rx="2" fill="#7a4e2d" />
                <rect x="47" y="87.5" width="6" height="6" rx="1" fill="#d8b56a" />
              </g>
              <g className="arm r">
                <rect x="69" y="62" width="11" height="30" rx="5.5" fill={look.shirt} stroke="#1a1818" strokeWidth="1.5" />
                <circle cx="74.5" cy="94" r="6" fill="#d9dde3" stroke="#1a1818" strokeWidth="1.5" />
              </g>
              <g className="head">
                <rect x="46" y="50" width="8" height="8" rx="2" fill="#9aa3ab" />
                {isJr ? (
                  <path d="M24 20 C26 6 40 0 52 3 C62 0 76 4 78 16 C72 12 64 12 58 14 C54 9 46 9 40 13 C34 11 28 14 24 20 Z" fill="#1d1513" />
                ) : (
                  look.hair && <g transform="translate(17 12) scale(0.825 0.913) translate(-10 -12)">{look.hair}</g>
                )}
                <rect x="17" y="12" width="66" height="42" rx="17" fill="#f2eee9" stroke="#1a1818" strokeWidth="2.4" />
                <rect x="24" y="18" width="52" height="30" rx="11" fill="#1a1818" />
                {look.hat && <g transform="translate(17 12) scale(0.825 0.913) translate(-10 -12)">{look.hat}</g>}
                <g ref={eyes} className="eyes">
                  <g className="e-normal">
                    <rect x="35" y="27" width="7" height="11" rx="3.5" />
                    <rect x="58" y="27" width="7" height="11" rx="3.5" />
                  </g>
                  <g className="e-happy">
                    <path d="M34 34 Q38.5 27 43 34" />
                    <path d="M57 34 Q61.5 27 66 34" />
                  </g>
                  <g className="e-surprised">
                    <circle cx="38.5" cy="32" r="5" />
                    <circle cx="61.5" cy="32" r="5" />
                  </g>
                  <g className="e-sleep">
                    <path d="M34 33 H43" />
                    <path d="M57 33 H66" />
                  </g>
                  <g className="e-love">
                    <path d="M38.5 37 L34.5 32.5 A2.4 2.4 0 0 1 38.5 29.6 A2.4 2.4 0 0 1 42.5 32.5 Z" />
                    <path d="M61.5 37 L57.5 32.5 A2.4 2.4 0 0 1 61.5 29.6 A2.4 2.4 0 0 1 65.5 32.5 Z" />
                  </g>
                  <rect className="blush" x="28" y="38" width="6" height="3" rx="1.5" />
                  <rect className="blush" x="66" y="38" width="6" height="3" rx="1.5" />
                  <path className="mouth" d="M45 41 Q50 44.5 55 41" />
                </g>
              </g>
            </g>
          </svg>
        </div>
      </button>
      <button className="bot-close" onClick={dismiss} aria-label="Hide Jr for this visit">
        ×
      </button>
    </div>
  )
}

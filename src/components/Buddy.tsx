import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { calm } from './motion'

// A mini Bipin who walks along the bottom of the screen. He greets you by time of day, says something
// about each page, runs off when the cursor gets close, hops when you scroll fast, dozes at night when
// you go quiet, and waves when clicked. He can be sent away for the visit with the small × button.

const PAGE_LINES: Record<string, string> = {
  '/': "I'm your guide. Scroll down, I'll walk with you.",
  '/work': 'Pick a door, any door. They all open.',
  '/story': 'This is where it all started.',
  '/services': 'See something you need? Point at it.',
  '/about': "That's the long version of me.",
  '/contact': 'WhatsApp is the fastest way to reach the big me.',
}
const TICKLES = ['Hey, that tickles!', 'Personal space, please!', 'Catch me if you can!', 'Too close, too close!']

function greeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return "Good morning! I've had my coffee, have you?"
  if (h >= 12 && h < 17) return 'Good afternoon! Perfect time to start something.'
  if (h >= 17 && h < 22) return 'Good evening! Thanks for dropping by.'
  return 'Up late? Me too. Builders keep odd hours.'
}
const isNight = () => {
  const h = new Date().getHours()
  return h >= 22 || h < 5
}
const canPlayAlpha = () => !/^((?!chrome|android).)*safari/i.test(navigator.userAgent)
const W = 62 // drawn width of the figure, px

export default function Buddy() {
  const { pathname } = useLocation()
  const root = useRef<HTMLDivElement>(null)
  const clip = useRef<HTMLVideoElement>(null)
  const [gone, setGone] = useState(() => {
    try {
      return sessionStorage.getItem('buddy') === 'off'
    } catch {
      return false
    }
  })
  const [say, setSay] = useState('')
  const [mood, setMood] = useState<'' | 'walk' | 'hop' | 'sleep'>('')
  const [facing, setFacing] = useState(1)
  const [waving, setWaving] = useState(false)
  const [onHero, setOnHero] = useState(false)

  // shared, frame-to-frame state that should not cause re-renders
  const s = useRef({ x: 40, goal: 40, speed: 70, sayUntil: 0, lastTickle: 0, lastMove: performance.now(), firstGreet: true })

  const speak = (text: string, ms = 3200) => {
    setSay(text)
    s.current.sayUntil = performance.now() + ms
  }
  const hop = () => {
    setMood('hop')
    setTimeout(() => setMood((m) => (m === 'hop' ? '' : m)), 520)
  }
  const wave = () => {
    const v = clip.current
    if (!v || calm() || !canPlayAlpha()) return
    v.currentTime = 0
    v.play().then(() => setWaving(true)).catch(() => {})
  }

  // greet on arrival (time of day), then a line for each page
  useEffect(() => {
    if (gone) return
    const t = setTimeout(() => {
      if (s.current.firstGreet) {
        s.current.firstGreet = false
        speak(greeting(), 3600)
        setTimeout(() => speak(PAGE_LINES[pathname] ?? PAGE_LINES['/']), 3900)
      } else speak(PAGE_LINES[pathname] ?? "Ooh, a new page. Let's look around.")
    }, 900)
    return () => clearTimeout(t)
  }, [pathname, gone])

  // on the home page the big figure is already in the hero, so the buddy waits until you scroll past it
  useEffect(() => {
    const check = () => setOnHero(pathname === '/' && scrollY < innerHeight * 0.6)
    check()
    addEventListener('scroll', check, { passive: true })
    return () => removeEventListener('scroll', check)
  }, [pathname])

  useEffect(() => {
    if (gone || calm()) return
    const st = s.current
    const fine = matchMedia('(pointer: fine)').matches
    let raf = 0
    let last = performance.now()
    let lastScroll = scrollY
    let lastScrollT = performance.now()

    const pickGoal = () => {
      st.goal = 16 + Math.random() * Math.max(40, innerWidth - W - 32)
      st.speed = 60 + Math.random() * 30
    }
    const wander = setInterval(() => {
      if (performance.now() - st.lastMove > 25000) return // sleeping or waiting: stay put
      if (Math.random() < 0.7) pickGoal()
    }, 5200)

    const onMove = (e: PointerEvent) => {
      st.lastMove = performance.now()
      setMood((m) => (m === 'sleep' ? '' : m))
      if (!fine) return
      const r = root.current?.getBoundingClientRect()
      if (!r) return
      const dx = e.clientX - (r.left + r.width / 2)
      const dy = e.clientY - (r.top + r.height / 2)
      if (Math.hypot(dx, dy) < 95 && performance.now() - st.lastTickle > 3500) {
        st.lastTickle = performance.now()
        hop()
        speak(TICKLES[Math.floor(Math.random() * TICKLES.length)], 1800)
        // run away from the cursor
        st.goal = Math.min(innerWidth - W - 16, Math.max(16, st.x - Math.sign(dx || 1) * 240))
        st.speed = 230
      }
    }
    const onScroll = () => {
      const now = performance.now()
      const v = Math.abs(scrollY - lastScroll) / Math.max(16, now - lastScrollT)
      lastScroll = scrollY
      lastScrollT = now
      if (v > 3.2 && now > st.sayUntil) {
        hop()
        speak('Whoa, slow down!', 1400)
      }
    }
    const idle = setInterval(() => {
      if (performance.now() - st.lastMove > 25000) {
        if (isNight()) {
          setMood('sleep')
          setSay('Zzz…')
          st.sayUntil = Infinity
        } else if (performance.now() > st.sayUntil) speak("Still there? I'll wait right here.", 3000)
      }
    }, 6000)

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const d = st.goal - st.x
      if (Math.abs(d) > 2) {
        st.x += Math.sign(d) * Math.min(Math.abs(d), st.speed * dt)
        setFacing(Math.sign(d))
        setMood((m) => (m === 'hop' || m === 'sleep' ? m : 'walk'))
      } else setMood((m) => (m === 'walk' ? '' : m))
      if (root.current) root.current.style.transform = `translateX(${st.x}px)`
      if (now > st.sayUntil) setSay('')
    }
    addEventListener('pointermove', onMove, { passive: true })
    addEventListener('scroll', onScroll, { passive: true })
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(wander)
      clearInterval(idle)
      removeEventListener('pointermove', onMove)
      removeEventListener('scroll', onScroll)
    }
  }, [gone])

  if (gone) return null
  const dismiss = () => {
    try {
      sessionStorage.setItem('buddy', 'off')
    } catch {
      /* fine: he will just come back next visit */
    }
    setGone(true)
  }
  return (
    <div ref={root} className={`buddy ${mood} ${onHero ? 'away' : ''}`} style={{ transform: `translateX(${s.current.x}px)` }}>
      {say && (
        <p className="buddy-say" role="status">
          {say}
        </p>
      )}
      <button
        className="buddy-body"
        data-cursor="Wave"
        aria-label="Mini Bipin. Click to say hi."
        onClick={() => {
          wave()
          speak(greeting(), 3000)
        }}
      >
        <span className="buddy-flip" style={{ transform: `scaleX(${facing})` }}>
          <img src="/images/me-3d.webp" alt="" className={waving ? 'invisible' : ''} draggable={false} />
          <video ref={clip} src="/video/me-wave.webm" muted playsInline preload="none" onEnded={() => setWaving(false)} aria-hidden="true" className={waving ? '' : 'invisible'} />
        </span>
      </button>
      <button className="buddy-close" onClick={dismiss} aria-label="Hide mini Bipin for this visit">
        ×
      </button>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import Clouds, { type CloudCtl } from '../components/Clouds'
import Island from '../components/Island'
import { calm } from '../components/motion'
import { sound, whoosh } from '../components/sfx'

// The home page. First visit in a session: a calm gate above the clouds (enter with or without sound,
// since browsers only allow sound after a click). Entering fades the gate into the Flow clip, which
// flies through the clouds until the island appears. Later visits in the same session skip the gate and
// join the clip as the clouds part. The earlier train-and-avatar home page is kept in LandingTrain.tsx.

type Phase = 'intro' | 'reveal' | 'done'

const seen = () => {
  try {
    return sessionStorage.getItem('dove') === '1'
  } catch {
    return false
  }
}

function setIntro(on: boolean) {
  const el = document.documentElement
  if (on) el.dataset.intro = '1'
  else delete el.dataset.intro
  el.style.overflow = on ? 'hidden' : ''
  dispatchEvent(new Event('island:intro'))
}

/** The gate: drifting clouds, the name, two ways in. Fades away as the clip takes over. */
function Gate({ leaving, onEnter }: { leaving: boolean; onEnter: (withSound: boolean) => void }) {
  const night = document.documentElement.dataset.theme === 'dark' ? 1 : 0
  const ctl = useRef<CloudCtl>({ speed: 0.08, open: 0, night })
  const first = useRef<HTMLButtonElement>(null)
  useEffect(() => first.current?.focus(), [])
  useEffect(() => {
    if (leaving) ctl.current.speed = 1.2 // lean forward into the clouds as it fades
  }, [leaving])
  return (
    <div className={`intro ${leaving ? 'leaving' : ''}`}>
      <Clouds ctl={ctl} className="absolute inset-0 h-full w-full" />
      <div className="intro-gate">
        <p className="text-sm font-medium tracking-[0.2em] uppercase">A portfolio above the clouds</p>
        <h1 className="intro-name">
          Bipin <span className="serif">A</span>
        </h1>
        <p className="max-w-md text-lg">Full-stack developer. Websites, AI tools and automations for businesses in India and abroad.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button ref={first} onClick={() => onEnter(true)} className="pill pill-dark" data-cursor="Dive in" disabled={leaving}>
            Enter with sound
          </button>
          <button onClick={() => onEnter(false)} className="pill isle-ghost" data-cursor="Dive in" disabled={leaving}>
            Enter quietly
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Landing() {
  const [fast] = useState(seen)
  const [phase, setPhase] = useState<Phase>(() => (calm() ? 'done' : fast ? 'reveal' : 'intro'))
  const [gate, setGate] = useState(!calm() && !fast)

  // the entrance always starts at the top (the browser may restore an old scroll position on reload)
  useEffect(() => {
    if (phase === 'done') return
    scrollTo(0, 0)
    const again = requestAnimationFrame(() => scrollTo(0, 0))
    return () => cancelAnimationFrame(again)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setIntro(phase !== 'done')
    return () => setIntro(false)
  }, [phase])

  const enter = (withSound: boolean) => {
    sound.set(withSound)
    try {
      sessionStorage.setItem('dove', '1')
    } catch {
      /* the gate will just show again next time */
    }
    whoosh(3.6, 180, 1400)
    setPhase('reveal')
    setTimeout(() => setGate(false), 1300) // after the fade
  }

  return (
    <>
      {gate && <Gate leaving={phase !== 'intro'} onEnter={enter} />}
      <Island phase={phase} fast={fast} onLanded={() => setPhase('done')} />
    </>
  )
}

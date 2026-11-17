import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import Clouds, { type CloudCtl } from './Clouds'
import { fall } from './sfx'
import { calm } from './motion'

// Travelling between places: clouds close in from the edges, the page changes behind them, and the
// clouds part again on the new page, as if you dropped through the sky into it.
// Anything can start a trip with: dispatchEvent(new CustomEvent('island:fall', { detail: '/path' }))

export const travel = (to: string) => dispatchEvent(new CustomEvent('island:fall', { detail: to }))

export default function Fall() {
  const nav = useNavigate()
  const ctl = useRef<CloudCtl>({ speed: 0.25, open: 1, night: 0 })
  const [on, setOn] = useState(false)

  useEffect(() => {
    let timers: number[] = []
    const go = (e: Event) => {
      const to = (e as CustomEvent<string>).detail
      if (calm()) return void nav(to)
      timers.forEach(clearTimeout)
      ctl.current.night = document.documentElement.dataset.theme === 'dark' ? 1 : 0
      ctl.current.speed = 1.6
      ctl.current.open = 1 // mount clear, then close in
      setOn(true)
      fall()
      timers = [
        window.setTimeout(() => (ctl.current.open = 0), 40),
        window.setTimeout(() => {
          nav(to)
          scrollTo(0, 0)
        }, 1250),
        window.setTimeout(() => {
          ctl.current.open = 1
          ctl.current.speed = 0.35
        }, 1500),
        window.setTimeout(() => setOn(false), 3600),
      ]
    }
    addEventListener('island:fall', go)
    return () => {
      removeEventListener('island:fall', go)
      timers.forEach(clearTimeout)
    }
  }, [nav])

  return on ? <Clouds ctl={ctl} className="pointer-events-none fixed inset-0 z-[70] h-full w-full" /> : null
}

import PlaceHero from '../components/PlaceHero'
import { useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router'
import { calm } from '../components/motion'
import { offers } from '../data/profile'

// The work page (the Foundry): a row of arched doorways, one per kind of work.
// Opening a door slides its leaves apart, then the doorway grows to fill the screen and
// carries you through to that door's own page.

export const DOOR_COLOURS = ['#2f4a6e', '#7a3f3a', '#5f7d55', '#b0532f', '#3f6f73', '#a8843f']
export const doorColour = (id: string) => DOOR_COLOURS[Math.max(0, offers.findIndex((o) => o.id === id)) % DOOR_COLOURS.length]

/** Grow a panel from the door to the full screen, go to the page, then let the panel fade away. */
function walkThrough(door: HTMLElement, colour: string, label: string, go: () => void) {
  const r = door.getBoundingClientRect()
  const veil = document.createElement('div')
  veil.className = 'door-veil'
  veil.style.background = colour
  veil.innerHTML = `<span>${label}</span>`
  Object.assign(veil.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` })
  document.body.appendChild(veil)
  veil
    .animate([{}, { left: '0px', top: '0px', width: `${innerWidth}px`, height: `${innerHeight}px`, borderRadius: '0px' }], { duration: 750, delay: 520, easing: 'cubic-bezier(.76,0,.24,1)', fill: 'forwards' })
    .finished.then(() => {
      go()
      return veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 650, delay: 120, easing: 'ease-out', fill: 'forwards' }).finished
    })
    .finally(() => veil.remove())
}

export default function Doors() {
  const nav = useNavigate()
  const [open, setOpen] = useState<string | null>(null)

  const enter = (id: string, label: string, e: MouseEvent<HTMLButtonElement>) => {
    if (open) return
    const to = `/work/${id}`
    if (calm()) return nav(to)
    setOpen(id)
    walkThrough(e.currentTarget, doorColour(id), label, () => nav(to))
  }

  return (
    <section className="min-h-[calc(100dvh-3.5rem)] py-12 sm:py-16" aria-labelledby="works-h">
      <div className="mx-auto max-w-5xl px-5 sm:px-10" id="works-h">
        <PlaceHero id="foundry" title={<>The work is behind <span className="serif">the doors</span></>} lead="Each arch is one kind of work I take on. Step through one to see it running." />
      </div>

      <ul className="mx-auto mt-14 flex max-w-[100rem] snap-x gap-6 overflow-x-auto px-5 pt-4 pb-8 sm:px-10 xl:justify-center">
        {offers.map((o, i) => (
          <li key={o.id} className="flex-none snap-center">
            <button className="door" data-open={open === o.id} data-cursor="Enter" onClick={(e) => enter(o.id, o.label, e)} style={{ ['--c' as string]: DOOR_COLOURS[i % DOOR_COLOURS.length] }} aria-label={`${o.title}: open this door`}>
              <span className="door-inside">
                <span className="display text-2xl">{o.label}</span>
              </span>
              <span className="leaf l">
                <span className="pane" />
              </span>
              <span className="leaf r">
                <span className="pane" />
              </span>
              <span className="plate">{o.label}</span>
              <span className="door-light" />
            </button>
            <p className="mt-4 text-center text-sm text-muted">{o.who.split(',')[0]}</p>
          </li>
        ))}
      </ul>
      <p className="text-center text-sm text-muted xl:hidden">Swipe to see all {offers.length}.</p>
    </section>
  )
}

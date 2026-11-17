import { useEffect, useState } from 'react'
import { L, LineBadge, LivePreview, lineColor } from './bits'
import { offers, type Offer } from '../data/profile'
import type { Line } from '../data/projects'

// The home hero. Real footage from inside a train plays behind everything: the intro text, a panel and
// the controls float over it as glass. Every station is one kind of work I take on (not a named project):
// pick one and the train rides there, and the panel shows how that kind of thing looks and what it is for.
// On phones the same stations become swipe cards under the footage.

type Station = {
  id: string
  label: string
  line: Line
  offer?: Offer
  page?: { to: string; title: string; text: string; cta: string }
}

const stations: Station[] = [
  { id: 'you', label: 'Bipin A', line: 'startup', page: { to: '/about', title: 'Bipin A', text: 'You are here. I build for startups and for local businesses. Ride the line to see what I can make for you.', cta: 'About me' } },
  ...offers.map((o) => ({ id: o.id, label: o.label, line: o.line, offer: o })),
  { id: 'contact', label: 'Contact', line: 'local', page: { to: '/contact', title: 'Contact', text: 'Last stop. Tell me what you want built.', cta: 'Start a project' } },
]
// The film stops at the kinds of work that have something to show.
const filmStops = stations.filter((s) => s.offer?.preview)

/** Looping train footage. The dusk clip plays during the film. Still image only when motion is turned down. */
function TrainVideo({ dusk = false }: { dusk?: boolean }) {
  const clip = dusk ? 'train-dusk' : 'train-day'
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return <img src={`/video/${clip}.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover" />
  return <video key={clip} src={`/video/${clip}.mp4`} poster={`/video/${clip}.jpg`} autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" />
}

function StopCard({ s, preview }: { s: Station; preview: boolean }) {
  const o = s.offer
  if (!o)
    return (
      <div>
        <h3 className="display text-4xl">{s.page!.title}</h3>
        <p className="mt-2 text-muted">{s.page!.text}</p>
        <L to={s.page!.to} className="btn btn-solid mt-5">
          {s.page!.cta}
        </L>
      </div>
    )
  return (
    <div>
      <LineBadge line={o.line} />
      <h3 className="display mt-2 text-3xl">{o.title}</h3>
      {preview && o.preview && (
        <div className="mt-4">
          <LivePreview src={o.preview} title={`Sample ${o.title.toLowerCase()}`} interactive />
        </div>
      )}
      <p className="mt-4 font-medium">{o.usedFor}</p>
      <p className="mt-2 text-sm text-muted">Good for: {o.who}</p>
      <L to="/contact" className="btn btn-solid mt-5">
        Ask for one like this
      </L>
    </div>
  )
}

export default function Ride({ intro }: { intro: React.ReactNode }) {
  const [selected, setSelected] = useState('you')
  const [visited, setVisited] = useState<Set<string>>(() => new Set(['you']))
  const [touring, setTouring] = useState(false)
  const [film, setFilm] = useState(false)
  const [scene, setScene] = useState(-1) // -1 title card, 0..n-1 one per stop, n the closing card
  // Wide screens get the full-window hero; phones get the footage as a band with swipe cards under it.
  const [gl] = useState(() => matchMedia('(min-width: 768px)').matches)

  const goTo = (id: string) => {
    setSelected(id)
    setVisited((v) => new Set(v).add(id))
  }
  const index = stations.findIndex((s) => s.id === selected)
  const hop = (d: number) => goTo(stations[(index + d + stations.length) % stations.length].id)
  const pick = (id: string) => {
    setTouring(false)
    goTo(id)
  }

  // The tour: ride to the next station every few seconds until every stop has been seen once.
  useEffect(() => {
    if (!touring) return
    const t = setTimeout(() => (index === stations.length - 1 ? setTouring(false) : hop(1)), 6500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [touring, index])

  // The film: a title card, then the train rides to each stop while the camera pushes in, then a closing card.
  useEffect(() => {
    if (!film) return
    if (scene >= 0 && scene < filmStops.length) goTo(filmStops[scene].id)
    if (scene === filmStops.length) return goTo('you')
    const t = setTimeout(() => setScene(scene + 1), scene < 0 ? 3200 : 7000)
    return () => clearTimeout(t)
  }, [film, scene])
  useEffect(() => {
    if (!film) return
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setFilm(false)
    addEventListener('keydown', esc)
    return () => removeEventListener('keydown', esc)
  }, [film])
  const playFilm = () => {
    setTouring(false)
    setScene(-1)
    setFilm(true)
  }
  const shot = filmStops[scene]?.offer

  if (!gl)
    return (
      <div>
        {intro}
        <div className="relative mt-10 aspect-video overflow-hidden rounded-3xl border border-rule">
          <TrainVideo />
        </div>
        <h2 className="display mt-14 text-4xl">What I can build for you</h2>
        <ul className="-mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3">
          {stations.map((s) => (
            <li key={s.id} className="w-[85%] max-w-sm flex-none snap-center rounded-xl border border-rule bg-card p-5">
              <StopCard s={s} preview={false} />
            </li>
          ))}
        </ul>
        <p className="font-mono text-[0.8125rem] text-muted">Swipe to ride the line. {stations.length} stations.</p>
      </div>
    )

  const cur = stations[index] ?? stations[0]
  const bar = 'min-h-11 rounded-full border border-ink/70 px-4 text-sm font-semibold hover:bg-ink hover:text-paper'
  return (
    // Full-bleed: breaks out of the page column to span the whole window
    <section className="relative left-1/2 -mt-4 h-[min(90vh,820px)] min-h-[640px] w-screen -translate-x-1/2 overflow-hidden border-y border-rule" aria-label="Bipin A: the view from inside the train">
      <TrainVideo dusk={film} />
      <>
          {film ? (
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between text-white">
              <div className="flex items-start gap-3 bg-[#0b0c10] px-4 py-3 sm:px-8">
                <div className="flex flex-1 gap-1.5 pt-4" aria-hidden="true">
                  {filmStops.map((s, i) => (
                    <span key={s.id} className={`h-1 flex-1 rounded-full ${i <= scene ? 'bg-[#ffc629]' : 'bg-white/25'}`} />
                  ))}
                </div>
                <button onClick={() => setFilm(false)} className="pointer-events-auto min-h-11 rounded-full border border-white/50 px-4 text-sm font-semibold hover:bg-white hover:text-[#0b0c10]">
                  Stop the film
                </button>
              </div>
              <div key={scene} className="film-caption bg-[#0b0c10] px-5 py-5 sm:px-10 sm:py-7" aria-live="polite">
                {scene < 0 ? (
                  <>
                    <p className="font-mono text-sm text-[#ffc629]">A film in {filmStops.length} stations</p>
                    <p className="display text-6xl sm:text-8xl">
                      What I can <span className="serif">build for you</span>
                    </p>
                  </>
                ) : shot ? (
                  <>
                    <p className="font-mono text-sm text-[#ffc629]">
                      Station {scene + 1} of {filmStops.length}
                    </p>
                    <p className="display text-5xl sm:text-7xl">{shot.title}</p>
                    <p className="mt-2 max-w-2xl text-base text-white/85 sm:text-lg">{shot.usedFor}</p>
                  </>
                ) : (
                  <div className="pointer-events-auto flex flex-wrap items-center justify-between gap-4">
                    <p className="display text-5xl sm:text-7xl">
                      What should we <span className="serif">build next?</span>
                    </p>
                    <span className="flex flex-wrap gap-3">
                      <L to="/contact" className="btn border-[#ffc629] bg-[#ffc629] text-[#0b0c10]">
                        Start a project
                      </L>
                      <button onClick={playFilm} className="btn border-white text-white hover:bg-white hover:text-[#0b0c10]">
                        Watch again
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0">
              {/* soft wash behind the text so it stays readable over the view */}
              <div className="absolute inset-y-0 left-0 w-[48%]" style={{ background: 'linear-gradient(90deg, color-mix(in srgb, var(--paper) 86%, transparent) 0%, color-mix(in srgb, var(--paper) 60%, transparent) 45%, transparent 100%)' }} />
              <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-between px-6 py-8">
                <div className="max-w-xl [&_a]:pointer-events-auto">{intro}</div>

                <div className="flex max-w-full flex-col items-start gap-3">
                  {/* the in-carriage line map: pick a station; filled dots are the ones already visited */}
                  <nav aria-label="Stations" className="glass pointer-events-auto max-w-full overflow-x-auto rounded-2xl px-2 pt-3 pb-2">
                    <ol className="flex">
                      {stations.map((s) => (
                        <li key={s.id}>
                          <button onClick={() => pick(s.id)} aria-pressed={s.id === selected} className="group flex min-h-11 w-[5.4rem] flex-col items-center gap-1.5 text-xs leading-tight">
                            <span className="relative flex h-4 w-full items-center justify-center">
                              <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2" style={{ background: lineColor(s.line) }} />
                              <span className={`relative h-3.5 w-3.5 rounded-full border-[3px] border-ink transition-transform ${s.id === selected ? 'scale-150 bg-yellow' : visited.has(s.id) ? 'bg-ink' : 'bg-paper group-hover:bg-yellow'}`} />
                            </span>
                            <span className={s.id === selected ? 'font-bold' : 'text-muted group-hover:text-ink'}>{s.label}</span>
                          </button>
                        </li>
                      ))}
                    </ol>
                    <span className="sr-only">
                      {visited.size} of {stations.length} stations visited
                    </span>
                  </nav>
                  <div className="glass pointer-events-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-2xl p-2.5">
                    <button className={bar} onClick={() => (setTouring(false), hop(-1))}>
                      Previous station
                    </button>
                    <button className={bar} onClick={() => (setTouring(false), hop(1))}>
                      Next station
                    </button>
                    <button className={bar} onClick={() => setTouring((t) => !t)}>
                      {touring ? 'Stop the tour' : 'Start the tour'}
                    </button>
                    <button className="min-h-11 rounded-full border border-[#15171c] bg-yellow px-4 text-sm font-semibold text-[#15171c]" onClick={playFilm}>
                      Watch the film
                    </button>
                  </div>
                </div>
              </div>

              <aside className="glass pointer-events-auto absolute top-8 right-6 max-h-[calc(100%-4rem)] w-[min(340px,38vw)] overflow-y-auto rounded-2xl p-5" aria-live="polite">
                <StopCard s={cur} preview />
              </aside>
              <p className="absolute right-6 bottom-4 rounded-full bg-[#15171c]/75 px-3 py-1 font-mono text-[0.75rem] text-white">Pick a station below.</p>
            </div>
          )}
      </>
    </section>
  )
}

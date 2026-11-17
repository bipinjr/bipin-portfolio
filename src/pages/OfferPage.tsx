import { useParams } from 'react-router'
import { L, LivePreview } from '../components/bits'
import { Words } from '../components/motion'
import { offers } from '../data/profile'
import { doorColour } from './Doors'
import NotFound from './NotFound'

// The page behind one door: a colour band in that door's colour, the live example you can scroll,
// what this kind of work is for, and the next door along.

export default function OfferPage() {
  const { id } = useParams()
  const i = offers.findIndex((o) => o.id === id)
  if (i < 0)
    return (
      <div className="mx-auto max-w-5xl px-5 py-14 sm:px-10">
        <NotFound />
      </div>
    )
  const o = offers[i]
  const next = offers[(i + 1) % offers.length]
  const colour = doorColour(o.id)

  return (
    <article>
      <header data-dark className="relative overflow-hidden text-[#f2eee9]" style={{ background: colour }}>
        <div className="door-grain" aria-hidden="true" />
        <div className="relative mx-auto max-w-[88rem] px-5 pt-14 pb-28 sm:px-10 sm:pt-20">
          <L to="/work" className="inline-flex min-h-11 items-center gap-2 text-sm opacity-80 hover:opacity-100">
            All doors
          </L>
          <p className="mt-8 text-sm opacity-80">Door {i + 1} of {offers.length}</p>
          <h1 className="display mt-3 max-w-4xl text-[clamp(2.6rem,7vw,6rem)]">
            <Words text={o.title} />
          </h1>
          <p className="mt-6 max-w-2xl text-lg opacity-90 sm:text-xl">
            {o.usedFor}
          </p>
        </div>
      </header>

      <div className="mx-auto -mt-16 max-w-[88rem] px-5 sm:px-10">
        {o.preview ? (
          <div className="browser !m-0 shadow-[0_40px_80px_-30px_rgb(0_0_0/.45)]">
            <div className="browser-bar">
              <i />
              <i />
              <i />
              <span className="ml-2">Live example. Scroll inside it.</span>
            </div>
            <LivePreview src={o.preview} title={`Example of ${o.title.toLowerCase()}`} interactive />
          </div>
        ) : (
          <div className="grid aspect-[21/9] place-items-center rounded-2xl bg-card text-center">
            <p className="max-w-sm px-6 text-muted">This one is built to fit your business, so there is no one-size example. Tell me what you need and I'll sketch it.</p>
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-20 sm:px-10 md:grid-cols-[1fr_1.4fr]">
        <div>
          <p className="text-muted">Good for</p>
          <p className="display mt-2 text-3xl">{o.who}</p>
        </div>
        <div className="grid content-start gap-6">
          <p className="text-lg text-muted">We start with a short call about what you need. You get a working first version to click through early, and we shape it from there.</p>
          <div className="flex flex-wrap gap-3">
            <L to="/contact" className="pill pill-dark">
              Ask for one like this
            </L>
          </div>
        </div>
      </div>

      <L to={`/work/${next.id}`} className="group block border-t border-rule" data-cursor="Next">
        <div className="mx-auto flex max-w-[88rem] items-end justify-between gap-6 px-5 py-14 sm:px-10">
          <div>
            <p className="text-muted">Next door</p>
            <p className="display mt-2 text-[clamp(2rem,5vw,4rem)] transition-transform duration-500 group-hover:translate-x-3">{next.title}</p>
          </div>
          <span className="mb-3 h-12 w-12 shrink-0 rounded-full transition-transform duration-500 group-hover:scale-125" style={{ background: doorColour(next.id) }} aria-hidden="true" />
        </div>
      </L>
    </article>
  )
}

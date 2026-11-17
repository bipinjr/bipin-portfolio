import PlaceHero from '../components/PlaceHero'
import { useEffect, useRef, useState } from 'react'
import { Words } from '../components/motion'
import { story } from '../data/profile'

/** Timeline: the big year on the left follows whichever entry is in the middle of the screen. */
export default function Story() {
  const [at, setAt] = useState(0)
  const items = useRef<(HTMLLIElement | null)[]>([])
  useEffect(() => {
    const seen = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setAt(Number((e.target as HTMLElement).dataset.i))), { rootMargin: '-45% 0px -45% 0px' })
    items.current.forEach((el) => el && seen.observe(el))
    return () => seen.disconnect()
  }, [])
  const cur = story[at]
  return (
    <section className="min-h-[calc(100dvh-3.5rem)] py-12 sm:py-16" aria-labelledby="story-h">
      <div className="mx-auto max-w-5xl px-5 sm:px-10">
        <PlaceHero id="clock" title={<>My <span className="serif">story</span></>} lead="College, six internships, hackathons, and the work since. Scroll and the clock turns back." />
      </div>
      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 sm:px-10 lg:grid-cols-2">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <h2 id="story-h" className="display text-[clamp(2.2rem,5vw,4rem)]">
            <Words text="Let's go back in time." />
          </h2>
          <p key={cur.year} className="display rise mt-4 text-[clamp(6rem,17vw,13rem)] leading-none tabular-nums text-terra" aria-hidden="true">
            {cur.year}
          </p>
          <p className="mt-4 text-muted">{cur.range}</p>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <p>
              <span className="font-semibold">{String(at + 1).padStart(2, '0')}</span> <span className="text-muted">/ {String(story.length).padStart(2, '0')}</span>
            </p>
            <div className="h-px w-40 bg-rule">
              <div className="h-full bg-ink transition-[width] duration-500" style={{ width: `${((at + 1) / story.length) * 100}%` }} />
            </div>
          </div>
        </div>

        <ol className="border-l border-ink/25">
          {story.map((s, i) => (
            <li key={s.title} ref={(n) => void (items.current[i] = n)} data-i={i} className={`relative pb-16 pl-8 transition-opacity duration-500 last:pb-0 ${i === at ? '' : 'opacity-85'}`}>
              <span className={`absolute top-6 -left-[7px] h-3.5 w-3.5 rounded-full border-2 border-paper ${i === at ? 'bg-terra' : 'bg-ink/40'}`} />
              <p className="text-sm text-muted">{s.range}</p>
              <h3 className="display mt-2 text-3xl sm:text-4xl">{s.title}</h3>
              <p className="mt-1 text-lg font-medium">{s.org}</p>
              <ul className="mt-4 grid gap-2 text-muted">
                {s.points.map((p) => (
                  <li key={p} className="grid grid-cols-[1rem_1fr]">
                    <span aria-hidden="true">–</span>
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}


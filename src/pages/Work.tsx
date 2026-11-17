import PlaceHero from '../components/PlaceHero'
import { L, LineBadge, Ph, ProjectLinks, Shot, Tags, lineColor } from '../components/bits'
import { projects } from '../data/projects'

export default function Work() {
  const featured = projects.filter((p) => p.featured)
  const more = projects.filter((p) => !p.featured)
  return (
    <>
      <PlaceHero id="lab" title={<>Personal <span className="serif">projects</span></>} lead="Each project starts with the problem, then what I built to fix it." />

      <div className="mt-10 grid gap-12">
        {featured.map((p, i) => (
          <article key={p.slug} className="grid items-center gap-6 md:grid-cols-2">
            <div className={i % 2 ? 'md:order-2' : ''}>
              <Shot p={p} />
            </div>
            <div className="border-l-[6px] pl-5" style={{ borderColor: lineColor(p.line) }}>
              <LineBadge line={p.line} />
              <h2 className="display mt-2 text-4xl sm:text-5xl">
                <L to={`/projects/${p.slug}`} className="hover:underline" style={{ viewTransitionName: `p-${p.slug}` }}>
                  {p.name}
                </L>
              </h2>
              <p className="mt-3 text-lg font-medium">{p.problem}</p>
              <p className="mt-2 text-muted">{p.built}</p>
              <div className="mt-4">
                <Tags items={p.stack} />
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <L to={`/projects/${p.slug}`} className="btn btn-line">
                  Read about this project
                </L>
                <ProjectLinks p={p} />
              </div>
            </div>
          </article>
        ))}
      </div>

      <h2 className="display mt-16 text-4xl sm:text-5xl">More projects</h2>
      <ul className="mt-5 divide-y divide-rule border-y border-rule">
        {more.map((p) => (
          <li key={p.slug}>
            <L to={`/projects/${p.slug}`} className="grid gap-1 py-4 sm:grid-cols-[1fr_2fr_auto] sm:items-baseline sm:gap-6">
              <span className="flex items-center gap-2 text-lg font-bold">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: lineColor(p.line) }} />
                <span style={{ viewTransitionName: `p-${p.slug}` }}>{p.name}</span>
              </span>
              <span className="text-muted">{p.problem}</span>
              {p.placeholder ? <Ph>{p.placeholder}</Ph> : p.event ? <span className="tag">{p.event}</span> : null}
            </L>
          </li>
        ))}
      </ul>
    </>
  )
}

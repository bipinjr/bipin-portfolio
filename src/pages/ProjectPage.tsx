import { useParams } from 'react-router'
import { L, LineBadge, Ph, ProjectLinks, Shot, Tags, lineColor } from '../components/bits'
import { bySlug, projects } from '../data/projects'
import NotFound from './NotFound'

export default function ProjectPage() {
  const p = bySlug(useParams().slug)
  if (!p) return <NotFound />
  const i = projects.indexOf(p)
  const prev = projects[i - 1]
  const next = projects[i + 1]

  return (
    <article>
      <L to="/projects" className="font-bold underline underline-offset-4">
        Back to all work
      </L>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <LineBadge line={p.line} />
        {p.event && <span className="tag">{p.event}</span>}
        {p.placeholder && <Ph>{p.placeholder}</Ph>}
      </div>
      <h1 className="display mt-3 text-5xl sm:text-7xl" style={{ viewTransitionName: `p-${p.slug}` }}>
        {p.name}
      </h1>

      <div className="mt-8 grid gap-8 md:grid-cols-[3fr_2fr]">
        <Shot p={p} />
        <div className="border-l-[6px] pl-5" style={{ borderColor: lineColor(p.line) }}>
          <h2 className="font-bold">The problem</h2>
          <p className="mt-1 text-lg">{p.problem}</p>
          <h2 className="mt-5 font-bold">What I built</h2>
          <p className="mt-1 text-muted">{p.built}</p>
          {p.stack.length > 0 && (
            <>
              <h2 className="mt-5 mb-2 font-bold">Built with</h2>
              <Tags items={p.stack} />
            </>
          )}
          <div className="mt-6">
            <ProjectLinks p={p} />
          </div>
        </div>
      </div>

      <nav aria-label="Other projects" className="mt-14 grid grid-cols-2 gap-4 border-t border-rule pt-6">
        <div>
          {prev && (
            <L to={`/projects/${prev.slug}`} className="block">
              <span className="block font-mono text-[0.8125rem] text-muted">Previous project</span>
              <span className="font-bold underline underline-offset-4">{prev.name}</span>
            </L>
          )}
        </div>
        <div className="text-right">
          {next && (
            <L to={`/projects/${next.slug}`} className="block">
              <span className="block font-mono text-[0.8125rem] text-muted">Next project</span>
              <span className="font-bold underline underline-offset-4">{next.name}</span>
            </L>
          )}
        </div>
      </nav>
    </article>
  )
}

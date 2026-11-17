import { useEffect, useRef, useState } from 'react'
import { Link, type LinkProps } from 'react-router'
import type { Line, Project } from '../data/projects'
import type { Offer } from '../data/profile'

/** Router link that always animates the page change. */
export const L = (props: LinkProps) => <Link viewTransition {...props} />

/** A clearly marked placeholder for details not filled in yet. */
export const Ph = ({ children }: { children: string }) => (
  <span className="ph" title="Placeholder. Fill this in under src/data/">
    {children}
  </span>
)

export const lineColor = (line: Line) => (line === 'startup' ? 'var(--purple)' : 'var(--green)')
export const lineName = (line: Line) => (line === 'startup' ? 'Startup line' : 'Local line')

/** Two linked rings: the interchange between the two lines. Also the favicon. */
export const Mark = ({ size = 34 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
    <defs>
      <linearGradient id="mark-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#8f5cf0" />
        <stop offset="1" stopColor="#1fae78" />
      </linearGradient>
    </defs>
    <rect width="40" height="40" rx="11" fill="url(#mark-g)" />
    <circle cx="16" cy="20" r="7.5" fill="none" stroke="#fff" strokeWidth="3.4" />
    <circle cx="24" cy="20" r="7.5" fill="none" stroke="#fff" strokeWidth="3.4" strokeOpacity=".72" />
  </svg>
)

export const LineBadge = ({ line }: { line: Line }) => (
  <span className="inline-flex items-center gap-2 font-mono text-[0.8125rem]">
    <span className="h-3 w-3 rounded-full" style={{ background: lineColor(line) }} />
    {lineName(line)}
  </span>
)

export const Tags = ({ items }: { items: string[] }) =>
  items.length ? (
    <ul className="flex flex-wrap gap-2">
      {items.map((s) => (
        <li key={s} className="tag">
          {s}
        </li>
      ))}
    </ul>
  ) : null

/** Only links that exist are shown. With none, a marked placeholder appears instead of dead buttons. */
export const ProjectLinks = ({ p }: { p: Project }) => {
  const { live, github, caseStudy } = p.links
  if (!live && !github && !caseStudy) return <Ph>[add demo / GitHub link]</Ph>
  const ext = { target: '_blank', rel: 'noreferrer' }
  return (
    <div className="flex flex-wrap gap-3">
      {live && (
        <a className="btn btn-solid" href={live} {...ext}>
          Open live demo
        </a>
      )}
      {github && (
        <a className="btn btn-line" href={github} {...ext}>
          View code on GitHub
        </a>
      )}
      {caseStudy && (
        <a className="btn btn-line" href={caseStudy} {...ext}>
          Read case study
        </a>
      )}
    </div>
  )
}

/** Shows a site, shrunk to fit, so the card feels alive. With `interactive` visitors can scroll and click inside it. */
export function LivePreview({ src, title, interactive = false }: { src: string; title: string; interactive?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.3)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / 1280))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return (
    <div ref={box} className="relative aspect-video w-full overflow-hidden rounded-lg border border-rule bg-card">
      <p className="absolute inset-0 grid place-items-center font-mono text-sm text-muted">Loading the live site.</p>
      <iframe
        key={src}
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin"
        tabIndex={interactive ? 0 : -1}
        aria-hidden={interactive ? undefined : true}
        className={`absolute top-0 left-0 origin-top-left border-0 ${interactive ? '' : 'pointer-events-none'}`}
        style={{ width: 1280, height: 720, transform: `scale(${scale})` }}
      />
    </div>
  )
}

/** Project screenshot. Without one, the live site plays in its place; without that, a marked placeholder. */
export const Shot = ({ p }: { p: Project }) =>
  !p.image && p.links.live && p.embed !== false && matchMedia('(min-width: 768px)').matches ? (
    <LivePreview src={p.links.live} title={`${p.name} live preview`} />
  ) : p.image ? (
    <img src={p.image} alt={`${p.name} screenshot`} loading="lazy" className="aspect-video w-full rounded-lg border border-rule object-cover" />
  ) : (
    <div className="relative grid aspect-video w-full place-items-center overflow-hidden rounded-lg border border-rule bg-card">
      <svg className="absolute inset-0 h-full w-full opacity-25" viewBox="0 0 320 180" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 130H120L180 70H320" fill="none" stroke={lineColor(p.line)} strokeWidth="6" />
      </svg>
      <Ph>[add screenshot]</Ph>
    </div>
  )

/** One kind of work on offer: how it looks (in a plain browser frame) and what it is for. Not a link, no names. */
export const OfferCard = ({ o, wide = false }: { o: Offer; wide?: boolean }) => (
  <article className={`offer ${wide ? 'md:col-span-2' : ''}`}>
    {o.preview && matchMedia('(min-width: 768px)').matches && (
      <div className="browser">
        <div className="browser-bar">
          <i />
          <i />
          <i />
          <span className="ml-2">live</span>
        </div>
        <LivePreview src={o.preview} title={`Sample ${o.title.toLowerCase()}`} interactive />
      </div>
    )}
    <div className="p-5 sm:p-6">
      {o.preview && <p className="mb-3 font-mono text-[0.8125rem] text-muted">Scroll inside the window to explore.</p>}
      <h3 className="display text-3xl sm:text-4xl">{o.title}</h3>
      <p className="mt-3 max-w-2xl text-lg">{o.usedFor}</p>
      <p className="mt-2 text-muted">Good for: {o.who}</p>
    </div>
  </article>
)

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { PLACES, lineFor } from '../data/island'
import { calm } from './motion'

// The top of every inner page: the living island (the same loop as the home page, so it is usually
// already cached) zoomed onto this page's own spot, with its host bot speaking from right above it.
// The page title sits below the picture in plain text so it always reads clearly.

export default function PlaceHero({ id, title, lead, children }: { id: string; title: ReactNode; lead?: ReactNode; children?: ReactNode }) {
  const place = PLACES.find((p) => p.id === id) ?? PLACES[0]
  const [x, y] = place.end ?? [50, 50]
  const still = calm()
  const vid = useRef<HTMLVideoElement>(null)
  const [line] = useState(() => {
    const s = lineFor(place.host)
    return Array.isArray(s) ? s.join(' ') : s
  })

  // play only while the header is on screen
  useEffect(() => {
    const v = vid.current
    if (!v) return
    const seen = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()))
    seen.observe(v)
    return () => seen.disconnect()
  }, [])

  const media = { objectPosition: `${x}% ${y}%`, transformOrigin: `${x}% ${y}%` }
  // the bubble sits just above the place (or below it when the place is near the top), kept inside the frame
  const below = y < 38
  const say = {
    left: `clamp(10.5rem, ${x}%, calc(100% - 10.5rem))`,
    top: below ? `min(${y}%, calc(100% - 9.5rem))` : `max(${y}%, 9.25rem)`,
    ['--ty' as string]: below ? '18%' : '-112%',
  }

  return (
    <header className="place-hero">
      <div className="place-hero-view">
        {still ? (
          <img src="/video/island-end.jpg" alt="" style={media} />
        ) : (
          <video ref={vid} src="/video/island-loop.mp4" poster="/video/island-end.jpg" muted loop playsInline preload="auto" aria-hidden="true" style={media} />
        )}
        <span className="place-hero-pin" style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />
        <div className="place-hero-say" style={say} role="note" aria-label={`${place.host.name} says: ${line}`}>
          <p>{line}</p>
          <span>
            {place.host.name}, {place.host.role.toLowerCase()}
          </span>
        </div>
      </div>
      <p className="place-hero-eyebrow">
        <i aria-hidden="true" />
        {place.name}
      </p>
      <h1>{title}</h1>
      {lead && <p className="place-hero-lead">{lead}</p>}
      {children}
    </header>
  )
}

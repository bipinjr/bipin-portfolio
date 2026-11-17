import { useEffect, useState } from 'react'
import { NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router'
import { L } from './bits'
import { Cursor, useReveal } from './motion'
import Bot from './Bot'
import Fall from './Fall'
import { placeFor } from './crew-looks'
import { offers, profile } from '../data/profile'

// Page frame: top bar with links and the local time, the pull cord that switches day and dusk,
// and the dark closing section with the footer.

const links = [
  { to: '/', label: 'Home' },
  { to: '/work', label: 'Work' },
  { to: '/story', label: 'My story' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

/** Bengaluru time, refreshed twice a minute. */
function useLocalTime() {
  const read = () => {
    const now = new Date()
    const zone = { timeZone: 'Asia/Kolkata' } as const
    return {
      time: now.toLocaleTimeString('en-IN', { ...zone, hour: 'numeric', minute: '2-digit' }).replace(' ', ''),
      date: now.toLocaleDateString('en-GB', { ...zone, day: 'numeric', month: 'long', year: 'numeric' }),
    }
  }
  const [t, setT] = useState(read)
  useEffect(() => {
    const id = setInterval(() => setT(read()), 30000)
    return () => clearInterval(id)
  }, [])
  return t
}

/** A cord hanging from the top edge. Pull it to switch between the day and dusk look. */
function Cord() {
  const [dark, setDark] = useState(() => document.documentElement.dataset.theme === 'dark')
  const [pulled, setPulled] = useState(false)
  const pull = () => {
    const next = dark ? 'light' : 'dark'
    setPulled(true)
    setTimeout(() => setPulled(false), 260)
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* private mode: the choice just won't be remembered */
    }
    setDark(!dark)
  }
  return (
    <button onClick={pull} aria-pressed={dark} aria-label={dark ? 'Pull the cord for the day look' : 'Pull the cord for the dusk look'} className="cord fixed top-0 right-[5vw] z-40 hidden w-11 flex-col items-center sm:flex" data-pulled={pulled}>
      <span className="h-36 w-[3px] rounded-b bg-[#7a5a3c]" />
      <span className="-mt-0.5 h-7 w-4 rounded-[50%_50%_50%_50%/38%_38%_62%_62%] bg-[#8a4f2a] shadow-[inset_-3px_-3px_0_rgb(0_0_0/.25),0_6px_10px_rgb(0_0_0/.25)]" />
    </button>
  )
}

export default function Shell() {
  const { time, date } = useLocalTime()
  useReveal()
  // each page gets its own tab title, named after its place on the island
  const { pathname } = useLocation()
  useEffect(() => {
    const p = placeFor(pathname)
    document.title = pathname === '/' ? 'Bipin A | Full-stack developer in Bengaluru' : p.id === 'plaza' ? 'Lost in the clouds | Bipin A' : `${p.page} · ${p.name} | Bipin A`
  }, [pathname])
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
        Skip to content
      </a>
      <header className="sticky top-0 z-30 border-b border-rule bg-paper/95">
        <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-4 px-5 sm:px-10">
          <nav aria-label="Main" className="-mx-2 flex overflow-x-auto">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === '/'} viewTransition className="nav-link flex min-h-14 items-center px-2.5 text-[0.9375rem] whitespace-nowrap text-ink/75 hover:text-ink">
                {l.label}
              </NavLink>
            ))}
          </nav>
          <p className="hidden shrink-0 items-center gap-2 rounded-full border border-rule px-4 py-1.5 text-sm lg:flex sm:mr-[9vw]">
            <span className="text-muted">In Bengaluru it is</span>
            <span className="font-semibold">{time}</span>
            <span className="sr-only">on {date}</span>
          </p>
        </div>
      </header>
      <Cord />
      <Cursor />
      <Bot />
      <Fall />

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#1a1818] text-[#e8e4e0]">
        <div className="mx-auto max-w-[88rem] px-5 pt-20 pb-10 sm:px-10">
          <h2 className="display text-[clamp(2.6rem,7.5vw,6.5rem)]">
            Tell me what
            <span className="block text-[#9a8f8f]">you're building.</span>
          </h2>
          <p className="mt-6 max-w-md text-[#cfc7c3]">I work remotely with founders and businesses in India and abroad. Send a few lines about the idea and I'll reply within a day with how I'd build it.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <L to="/contact" className="pill pill-light">
              Start a project
            </L>
            <L to="/work" className="pill border border-white/20 text-[#e8e4e0] hover:bg-white/10">
              See my work
            </L>
          </div>

          <div className="mt-20 grid gap-10 border-t border-white/10 pt-8 text-[0.9375rem] sm:grid-cols-[2fr_1fr_1fr]">
            <div>
              <p className="font-semibold text-[#9a8f8f]">Work</p>
              <ul className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                {offers.map((o) => (
                  <li key={o.id}>
                    <L to={`/work/${o.id}`} className="hover:underline">
                      {o.label}
                    </L>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#9a8f8f]">Pages</p>
              <ul className="mt-3 grid gap-2">
                {links.slice(0, 1).concat(links.slice(2), [{ to: '/crew', label: 'The crew' }, { to: '/privacy', label: 'Privacy' }]).map((l) => (
                  <li key={l.to}>
                    <L to={l.to} className="hover:underline">
                      {l.label}
                    </L>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-semibold text-[#9a8f8f]">Availability</p>
              <ul className="mt-3 grid gap-2">
                <li>Freelance and part-time</li>
                <li>Remote, any time zone</li>
                <li>{profile.city} time {time}</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-end justify-between gap-4 text-sm text-[#a89c9c]">
            <p>© {new Date().getFullYear()} {profile.name}. Designed and built by Bipin.</p>
            <p className="-rotate-3 font-sign text-5xl leading-none text-[#e8e4e0]" aria-hidden="true">
              Bipin
            </p>
          </div>
        </div>
      </footer>
      <ScrollRestoration />
    </div>
  )
}

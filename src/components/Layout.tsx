import { useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { L, Mark } from './bits'
import { profile } from '../data/profile'

const stations = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function ThemeToggle() {
  const [dark, setDark] = useState(
    () => (document.documentElement.dataset.theme ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark',
  )
  const flip = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('theme', next)
    } catch {
      /* private mode: theme just won't be remembered */
    }
    setDark(!dark)
  }
  return (
    <button onClick={flip} className="min-h-11 rounded-full border border-rule px-4 font-mono text-[0.8125rem] hover:border-ink">
      {dark ? 'Switch to day service' : 'Switch to night service'}
    </button>
  )
}

export default function Layout() {
  const { pathname } = useLocation()
  const here = Math.max(
    0,
    stations.findIndex((s) => (s.to === '/' ? pathname === '/' : pathname.startsWith(s.to))),
  )
  const next = stations[here + 1]

  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 sm:px-6">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:bg-yellow focus:px-3 focus:py-2 focus:text-[#15171c]">
        Skip to content
      </a>
      <header className="flex items-center justify-between gap-4 pt-5">
        <L to="/" className="flex items-center gap-2.5" aria-label="Bipin A, home">
          <Mark />
          <span className="display text-2xl">
            bipin <span className="serif text-[1.15em]">a</span>
          </span>
        </L>
        <ThemeToggle />
      </header>

      {/* The route strip is the navigation: five stations, the yellow train sits on the current one */}
      <nav aria-label="Main" className="relative mt-5">
        <div className="absolute top-[9px] right-[12.5%] left-[12.5%] flex h-1.5" aria-hidden="true">
          <span className="flex-1 bg-purple" />
          <span className="flex-1 bg-green" />
        </div>
        <ul className="relative grid grid-cols-4">
          {stations.map((s, i) => (
            <li key={s.to}>
              <L to={s.to} aria-current={i === here ? 'page' : undefined} className="flex min-h-12 flex-col items-center gap-1.5">
                {i === here ? (
                  <span className="h-6 w-6 rounded-full border-[5px] border-ink bg-yellow" style={{ viewTransitionName: 'train' }} />
                ) : (
                  <span className="mt-1 h-4 w-4 rounded-full border-[3px] border-ink bg-paper" />
                )}
                <span className={`text-sm sm:text-base ${i === here ? 'font-bold' : 'text-muted'}`}>{s.label}</span>
              </L>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-center font-mono text-[0.8125rem] text-muted">
          This station: {stations[here].label}. {next ? `Next station: ${next.label}.` : 'End of the line. Say hello before you go.'}
        </p>
      </nav>

      <main id="main" className="flex-1 py-10 sm:py-14">
        <Outlet />
      </main>

      <footer className="border-t border-rule py-10 text-center">
        <p className="text-muted">Thanks for riding. Built and signed by</p>
        {/* The hand-signed sign-off */}
        <p className="-rotate-3 font-sign text-7xl leading-none text-purple sm:text-8xl" aria-label="Bipin">
          Bipin
        </p>
        <svg className="mx-auto -mt-1 text-green" width="180" height="14" viewBox="0 0 180 14" aria-hidden="true">
          <path d="M3 9C40 2 90 12 177 4" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <p className="mt-5 text-sm text-muted">
          {profile.city}.{' '}
          <a className="underline underline-offset-4 hover:text-ink" href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </p>
      </footer>
      <ScrollRestoration />
    </div>
  )
}

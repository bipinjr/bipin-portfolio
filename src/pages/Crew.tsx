import PlaceHero from '../components/PlaceHero'
import { NPCS, PLACES, isNight, type Say } from '../data/island'

// The Bot Citadel: the twelve bots who run the island, each with a job, a home and a way of talking.

const COLOURS: Record<string, string> = {
  Jr: '#85B7EB', Pixel: '#F0997B', Lofi: '#AFA9EC', Nova: '#5DCAA5', Scout: '#97C459', Dash: '#888780',
  Bolt: '#EF9F27', Juno: '#378ADD', Byte: '#D85A30', Echo: '#1D9E75', Chip: '#BA7517', Rivet: '#185FA5',
}

const rivet = NPCS.find((n) => n.id === 'rivet')!
const crew = [
  ...PLACES.map((p) => ({ ...p.host, home: p.name, night: false })),
  { name: 'Rivet', role: 'Night-shift mechanic', voice: 'Sleepy, kind, tells terrible robot jokes', intro: rivet.say, home: 'Bot Citadel', night: true },
]
const text = (s: Say) => (Array.isArray(s) ? s.join(' ') : s)

export default function Crew() {
  const night = isNight()
  return (
    <>
      <PlaceHero id="citadel" title={<>Twelve bots. One boss. <span className="serif">Zero days off.</span></>} />
      <p className="-mt-8 max-w-xl text-lg text-muted">
        They run the island while Bipin builds. Each one looks after a place, and every one of them calls him boss. Right now it's {night ? 'night' : 'day'} in Bengaluru, so the {night ? 'night shift is' : 'day crew are'} on.
      </p>

      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {crew.map((b) => {
          const onShift = b.night === night || b.name === 'Jr'
          return (
            <li key={b.name} className="isle-card p-5" data-reveal>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-full text-lg font-bold text-[#1d1714]" style={{ background: COLOURS[b.name] }} aria-hidden="true">
                  {b.name[0]}
                </span>
                <div>
                  <p className="text-lg leading-tight font-semibold">{b.name}</p>
                  <p className="text-sm text-muted">
                    {b.role} · {b.home}
                  </p>
                </div>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${onShift ? 'bg-[#dcefd0] text-[#27500a]' : 'bg-rule text-muted'}`}>{onShift ? 'On shift' : 'Resting'}</span>
              </div>
              <p className="mt-4 font-hand text-xl leading-snug">"{text(b.intro[0])}"</p>
              <p className="mt-3 text-sm text-muted">{b.voice}.</p>
            </li>
          )
        })}
      </ul>
    </>
  )
}

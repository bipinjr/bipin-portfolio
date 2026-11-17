import Ride from '../components/Ride'
import { L, LineBadge, OfferCard, lineColor } from '../components/bits'
import { offers, profile, services, skills } from '../data/profile'

export default function Home() {
  return (
    <>
      <Ride
        intro={
          <>
            <p className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-green" />
              Good service. Available for freelance
            </p>
            <h1 className="display mt-5 text-[clamp(3.6rem,8.5vw,7.25rem)]">
              Bipin <span className="serif grad text-[1.12em]">A</span>
            </h1>
            <p className="mt-4 max-w-md text-xl font-medium sm:text-2xl">{profile.role}</p>
            <p className="mt-2 max-w-md text-muted">Based in {profile.city}. I build the screens, the API and the AI part, then put it live.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <L to="/services" className="btn btn-solid">
                See what I build
              </L>
            </div>
          </>
        }
      />

      <section className="mt-20" aria-labelledby="dep-h">
        <h2 id="dep-h" className="display text-5xl sm:text-7xl">
          What I can <span className="serif grad">build for you</span>
        </h2>
        <p className="mt-3 max-w-xl text-lg text-muted">Each window shows how that kind of thing can look. Yours gets its own design.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {offers.map((o, i) => (
            <OfferCard key={o.id} o={o} wide={i === 0} />
          ))}
        </div>
        <L to="/contact" className="btn btn-solid mt-8">
          Start a project
        </L>
      </section>

      <div className="marquee relative left-1/2 mt-20 w-screen -translate-x-1/2" aria-hidden="true">
        <div>
          {[0, 1].map((k) => Object.values(skills).flat().map((s) => <span key={k + s}>{s}</span>))}
        </div>
      </div>

      <section className="mt-16 grid gap-8 md:grid-cols-2" aria-label="Services">
        {(['startup', 'local'] as const).map((key) => (
          <div key={key} className="border-t-[6px] pt-4" style={{ borderColor: lineColor(key) }}>
            <LineBadge line={key} />
            <h2 className="display mt-2 text-3xl">{services[key].who}</h2>
            <p className="mt-2 text-muted">{services[key].stops.map((s) => s.name).join(', ')}.</p>
            <L to="/services" className="mt-3 inline-block font-bold underline underline-offset-4">
              See what I offer
            </L>
          </div>
        ))}
      </section>
    </>
  )
}

import PlaceHero from '../components/PlaceHero'
import { L, OfferCard } from '../components/bits'
import { offers } from '../data/profile'

export default function Services() {
  return (
    <>
      <PlaceHero id="harbour" title={<>Working <span className="serif">together</span></>} lead="What I build for clients in India and abroad, what it looks like, and who it suits." />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {offers.map((o, i) => (
          <OfferCard key={o.id} o={o} wide={i === 0} />
        ))}
      </div>


      <div className="isle-card mt-14 p-6 sm:p-10">
        <h2 className="display text-3xl sm:text-4xl">Not sure which one fits?</h2>
        <p className="mt-2 text-muted">Tell me what you want built and I'll tell you if I'm the right person.</p>
        <L to="/contact" className="pill pill-dark mt-6">
          Start a project
        </L>
      </div>
    </>
  )
}

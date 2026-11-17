import PlaceHero from '../components/PlaceHero'
import { L, Ph } from '../components/bits'
import { achievements, certifications, internships, openSource, profile, skills } from '../data/profile'
import { projects } from '../data/projects'

export default function About() {
  const hackathons = projects.filter((p) => p.event)
  return (
    <>
      <PlaceHero id="house" title={<>About <span className="serif">me</span></>} lead="Who I am, how I like to work with people, and what I have done so far." />

      <section className="mt-8">
        <div>
          <p className="text-xl font-medium sm:text-2xl">{profile.role}.</p>
          <p className="mt-2 text-muted">{profile.education}</p>
          <p className="mt-1 text-muted">{profile.availability}.</p>
        </div>
      </section>

      <section className="mt-14 grid gap-4" aria-label="Achievements">
        {achievements.map((a) => (
          <div key={a.title} className="rounded-3xl bg-ink p-6 text-paper sm:p-10">
            <h2 className="display text-3xl sm:text-5xl">{a.title}</h2>
            <p className="mt-3 max-w-2xl opacity-80">{a.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-14" aria-labelledby="exp-h">
        <h2 id="exp-h" className="display text-4xl sm:text-5xl">
          Experience
        </h2>
        <p className="mt-2 text-muted">6 internships in full-stack and AI/ML.</p>
        <ol className="mt-6 ml-2 border-l-2 border-rule">
          {internships.map((x) => (
            <li key={x.org} className="relative flex flex-wrap items-baseline gap-x-3 gap-y-1 pb-5 pl-7">
              <span className="absolute top-1 -left-[13px] h-5 w-5 rounded-full border-4 border-ink bg-paper" />
              <span className="text-lg font-bold">{x.org}</span>
              {x.role && x.dates ? (
                <span className="text-muted">
                  {x.role}, {x.dates}
                </span>
              ) : (
                <Ph>[add dates/role]</Ph>
              )}
            </li>
          ))}
          <li className="relative flex flex-wrap items-baseline gap-x-3 gap-y-1 pl-7">
            <span className="absolute top-1 -left-[15px] h-6 w-6 rounded-full border-[5px] border-ink bg-yellow" />
            <span className="text-lg font-bold">Open source</span>
            <span className="text-muted">{openSource.text}</span>
            {openSource.link && (
              <a className="font-bold underline underline-offset-4" href={openSource.link} target="_blank" rel="noreferrer">
                See my contribution
              </a>
            )}
          </li>
        </ol>
      </section>

      <section className="mt-14" aria-labelledby="hack-h">
        <h2 id="hack-h" className="display text-4xl sm:text-5xl">
          Hackathons
        </h2>
        <ul className="mt-5 divide-y divide-rule border-y border-rule">
          {hackathons.map((p) => (
            <li key={p.slug}>
              <L to={`/projects/${p.slug}`} className="grid gap-1 py-4 sm:grid-cols-[1fr_2fr] sm:gap-6">
                <span className="font-bold underline decoration-rule underline-offset-4">
                  {p.name} <span className="font-normal text-muted">({p.event!.toLowerCase()})</span>
                </span>
                <span className="text-muted">{p.built}</span>
              </L>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14" aria-labelledby="skills-h">
        <h2 id="skills-h" className="display text-4xl sm:text-5xl">
          Skills
        </h2>
        <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(skills).map(([group, list]) => (
            <div key={group} className="border-t-2 border-ink pt-2">
              <dt className="font-bold">{group}</dt>
              <dd className="text-muted">{list.join(', ')}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-14" aria-labelledby="cert-h">
        <h2 id="cert-h" className="display text-4xl sm:text-5xl">
          Certifications
        </h2>
        <ul className="mt-5 grid gap-x-8 gap-y-2 text-muted sm:grid-cols-2">
          {certifications.map((c) => (
            <li key={c} className="border-t border-rule pt-2">
              {c}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

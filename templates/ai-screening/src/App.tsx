import { useMemo, useState } from 'react';

// SAMPLE TEMPLATE. Screening and ranking: set what you are looking for, press one button,
// and every candidate is scored and ranked with the reasons shown.
// The candidates are made up, and this sample scores by skill overlap in the browser.
// A real build reads uploaded resumes with an AI model.

const ALL_SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'SQL', 'FastAPI', 'Tailwind CSS', 'Testing', 'Docker', 'Communication'];
const ROLE = 'Full-stack developer';
const CANDIDATES = [
  { id: 'A', years: 3, skills: ['React', 'TypeScript', 'Node.js', 'SQL', 'Testing'], note: 'Built two internal dashboards.' },
  { id: 'B', years: 1, skills: ['React', 'Tailwind CSS', 'Communication'], note: 'Recent graduate, strong portfolio.' },
  { id: 'C', years: 5, skills: ['Python', 'FastAPI', 'SQL', 'Docker', 'Testing'], note: 'Mostly back-end work.' },
  { id: 'D', years: 2, skills: ['React', 'TypeScript', 'Python', 'FastAPI', 'SQL', 'Tailwind CSS'], note: 'Shipped a product end to end.' },
  { id: 'E', years: 4, skills: ['Node.js', 'SQL', 'Docker', 'Communication'], note: 'Led a small team.' },
  { id: 'F', years: 0, skills: ['Python', 'Communication'], note: 'Career switcher, bootcamp trained.' },
  { id: 'G', years: 6, skills: ['React', 'TypeScript', 'Node.js', 'Testing', 'Docker', 'Communication'], note: 'Senior front-end background.' },
];

/** Score out of 100: up to 80 for required skills matched, up to 20 for experience (capped at 5 years). */
export const score = (skills: string[], years: number, required: string[]) =>
  Math.round((required.length ? skills.filter((s) => required.includes(s)).length / required.length : 0) * 80 + Math.min(years, 5) * 4);

export default function App() {
  const [required, setRequired] = useState(['React', 'TypeScript', 'Python', 'SQL']);
  const [ranked, setRanked] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(() => {
    const scored = CANDIDATES.map((c) => ({ ...c, score: score(c.skills, c.years, required), matched: required.filter((s) => c.skills.includes(s)), missing: required.filter((s) => !c.skills.includes(s)) }));
    return ranked ? scored.sort((a, b) => b.score - a.score) : scored;
  }, [required, ranked]);

  const toggle = (s: string) => {
    setRequired((r) => (r.includes(s) ? r.filter((x) => x !== s) : [...r, s]));
    setRanked(false);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20">
      <header className="flex items-center justify-between py-5">
        <p className="text-lg font-bold"><span className="mr-2 inline-grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">S</span>SampleScreen</p>
        <p className="hidden rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand sm:block">{CANDIDATES.length} candidates loaded</p>
      </header>

      <main>
        <h1 className="mt-6 text-[clamp(2.2rem,6vw,3.6rem)] leading-[1.05] font-bold tracking-tight">Rank every candidate in one click.</h1>
        <p className="mt-3 max-w-xl text-lg text-soft">Say what the role needs. Each candidate gets a score, and you see exactly why.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.5fr]">
          <section className="h-fit rounded-2xl border border-rule bg-card p-5 sm:p-6" aria-labelledby="need-h">
            <h2 id="need-h" className="text-xl font-bold">The role</h2>
            <p className="mt-1 text-soft">{ROLE}</p>
            <p className="mt-5 text-sm font-semibold">Skills it needs</p>
            <p className="text-sm text-soft">Tap to add or remove.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ALL_SKILLS.map((s) => {
                const on = required.includes(s);
                return (
                  <button key={s} onClick={() => toggle(s)} aria-pressed={on} className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${on ? 'border-brand bg-brand text-white' : 'border-rule bg-card text-soft hover:border-brand hover:text-ink'}`}>
                    {s}
                  </button>
                );
              })}
            </div>
            {required.length === 0 && <p role="alert" className="mt-3 text-sm text-[#b42318]">Pick at least one skill to rank by.</p>}
            <button onClick={() => setRanked(true)} disabled={!required.length} className="mt-6 min-h-12 w-full rounded-xl bg-ink px-6 font-semibold text-white transition-transform active:scale-[.98] disabled:opacity-50">
              {ranked ? 'Ranked' : 'Rank candidates'}
            </button>
          </section>

          <section aria-labelledby="list-h" aria-live="polite">
            <h2 id="list-h" className="text-xl font-bold">{ranked ? 'Ranked shortlist' : 'Candidates, not ranked yet'}</h2>
            <ol className="mt-4 grid gap-3">
              {rows.map((c, i) => (
                <li key={c.id + ranked} className="rise rounded-2xl border border-rule bg-card" style={{ animationDelay: `${i * 50}ms` }}>
                  <button onClick={() => setOpen(open === c.id ? null : c.id)} aria-expanded={open === c.id} className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 p-4 text-left">
                    <span className={`grid h-10 w-10 place-items-center rounded-full text-sm font-bold ${ranked && i === 0 ? 'bg-ok text-white' : 'bg-brand-soft text-brand'}`}>{ranked ? i + 1 : c.id}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold">Candidate {c.id}</span>
                      <span className="block truncate text-sm text-soft">{c.years} {c.years === 1 ? 'year' : 'years'} · {c.note}</span>
                    </span>
                    {ranked && <span className="text-2xl font-bold tabular-nums">{c.score}</span>}
                    {ranked && (
                      <span className="col-span-3 h-2 overflow-hidden rounded-full bg-bg">
                        <span className="grow block h-full rounded-full bg-brand" style={{ width: `${c.score}%` }} />
                      </span>
                    )}
                  </button>
                  {open === c.id && (
                    <div className="border-t border-rule p-4 text-sm">
                      <p className="font-semibold">Why this score</p>
                      <p className="mt-1 text-soft">Matches {c.matched.length} of {required.length} needed skills, with {c.years} {c.years === 1 ? 'year' : 'years'} of experience.</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.matched.map((s) => <span key={s} className="rounded-full bg-ok-soft px-3 py-1 font-medium text-ok">Has {s}</span>)}
                        {c.missing.map((s) => <span key={s} className="rounded-full bg-bg px-3 py-1 text-soft">Missing {s}</span>)}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-sm text-soft">Tap a candidate to see the reasons.</p>
          </section>
        </div>
      </main>

      <footer className="mt-16 border-t border-rule pt-6 text-sm text-soft">
        Sample template. The candidates are made up and scored by skill overlap; a real build reads uploaded resumes with an AI model.
      </footer>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

// SAMPLE TEMPLATE. Every name, number, date and team here is made up.
// Three public screens of an event sign-up system: the event page, the registration form
// (ending in a pass with a code), and the live arrivals board. No database: it all runs in memory.

const EVENT = { name: 'SampleHack 2.0', tag: 'A 24-hour hackathon at your college', place: 'Main Auditorium, Your College' };
const TRACKS = ['AI agents', 'Web apps', 'Automation', 'Open idea'];
const SCHEDULE = [
  ['09:00', 'Check-in opens', 'Show your pass at the desk.'],
  ['10:00', 'Kick-off', 'Problem statements are revealed.'],
  ['13:00', 'Lunch', 'Served in the main hall.'],
  ['18:00', 'Mentor rounds', 'Mentors visit every team.'],
  ['10:00', 'Final demos', 'Next morning, five minutes per team.'],
];
const SAMPLE_TEAMS = ['Byte Builders', 'Null Pointers', 'Stack Smiths', 'Pixel Pilots', 'Loop Legends', 'Query Crew', 'Bug Hunters', 'Cloud Nine', 'Data Drift', 'Merge Masters'];

type Team = { id: string; name: string; college: string; track: string; members: string[]; arrived: boolean };
type View = 'home' | 'register' | 'pass' | 'arrivals';

/** Floating dots behind the page. */
function Particles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const g = c.getContext('2d')!;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const dots = Array.from({ length: 60 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.8 + 0.4, v: Math.random() * 0.00025 + 0.00008 }));
    const draw = () => {
      raf = requestAnimationFrame(draw);
      if (c.width !== innerWidth || c.height !== innerHeight) [c.width, c.height] = [innerWidth, innerHeight];
      g.clearRect(0, 0, c.width, c.height);
      for (const d of dots) {
        d.y = d.y < -0.02 ? 1.02 : d.y - d.v;
        g.beginPath();
        g.arc(d.x * c.width, d.y * c.height, d.r, 0, Math.PI * 2);
        g.fillStyle = 'hsla(265, 90%, 75%, .55)';
        g.fill();
      }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />;
}

/** Time left until the event, updated every second. */
function useCountdown(to: number) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.max(0, Math.floor((to - now) / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

/** A QR-looking pattern drawn from the pass code. Decorative: a real system prints a scannable code here. */
function PassCode({ code }: { code: string }) {
  const cells = useMemo(() => {
    let h = [...code].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7);
    const eye = (x: number, y: number) => [[0, 0], [14, 0], [0, 14]].some(([ex, ey]) => x >= ex && x < ex + 7 && y >= ey && y < ey + 7);
    const eyeOn = (x: number, y: number) => [[0, 0], [14, 0], [0, 14]].some(([ex, ey]) => {
      const dx = x - ex, dy = y - ey;
      return dx >= 0 && dx < 7 && dy >= 0 && dy < 7 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx > 1 && dx < 5 && dy > 1 && dy < 5));
    });
    return Array.from({ length: 21 * 21 }, (_, i) => {
      const x = i % 21, y = Math.floor(i / 21);
      h = (h * 1103515245 + 12345) >>> 0;
      return eye(x, y) ? eyeOn(x, y) : (h >> 16) % 2 === 0;
    });
  }, [code]);
  return (
    <svg viewBox="0 0 21 21" className="h-44 w-44 rounded-lg bg-white p-2" role="img" aria-label={`Pass code ${code}`} shapeRendering="crispEdges">
      {cells.map((on, i) => on && <rect key={i} x={i % 21} y={Math.floor(i / 21)} width="1" height="1" fill="#120b2e" />)}
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState<View>('home');
  const [teams, setTeams] = useState<Team[]>(() =>
    SAMPLE_TEAMS.map((name, i) => ({ id: `SH-${String(i + 1).padStart(4, '0')}`, name, college: `College ${String.fromCharCode(65 + (i % 5))}`, track: TRACKS[i % 4], members: ['Member One', 'Member Two', 'Member Three'], arrived: i < 4 })),
  );
  const [mine, setMine] = useState<Team | null>(null);
  const eventAt = useMemo(() => Date.now() + 1000 * 60 * 60 * 24 * 12 + 1000 * 60 * 60 * 5, []);
  const go = (v: View) => {
    setView(v);
    scrollTo(0, 0);
  };

  // The arrivals board is live: every few seconds one more waiting team checks in.
  useEffect(() => {
    if (view !== 'arrivals') return;
    const t = setInterval(() => setTeams((all) => {
      const i = all.findIndex((x) => !x.arrived);
      return i < 0 ? all : all.map((x, k) => (k === i ? { ...x, arrived: true } : x));
    }), 3500);
    return () => clearInterval(t);
  }, [view]);

  const people = teams.reduce((n, t) => n + t.members.length, 0);
  const arrived = teams.filter((t) => t.arrived).length;

  return (
    <>
      <Particles />
      <header className="sticky top-0 z-20 border-b border-violet/20 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
          <button onClick={() => go('home')} className="font-display text-lg font-bold">
            <span className="grad-text">⚡ {EVENT.name}</span>
          </button>
          <nav className="flex items-center gap-1 text-sm">
            <button onClick={() => go('arrivals')} className="min-h-11 rounded-lg px-3 text-mute hover:text-ink">Arrivals</button>
            <button onClick={() => go('register')} className="btn btn-main min-h-11 px-4 text-sm">Register</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24">
        {view === 'home' && <Home eventAt={eventAt} go={go} teams={teams.length} people={people} arrived={arrived} />}
        {view === 'register' && (
          <Register
            taken={teams.map((t) => t.name.toLowerCase())}
            onDone={(t) => {
              const team = { ...t, id: `SH-${String(teams.length + 1).padStart(4, '0')}`, arrived: false };
              setTeams((all) => [team, ...all]);
              setMine(team);
              go('pass');
            }}
          />
        )}
        {view === 'pass' && mine && (
          <section className="rise mx-auto max-w-md pt-14 text-center">
            <p className="text-ok">Registration complete</p>
            <h1 className="mt-2 text-4xl font-bold">Your team pass</h1>
            <div className="card mt-8 flex flex-col items-center gap-4 p-7">
              <PassCode code={mine.id} />
              <p className="font-display text-3xl font-bold tracking-wide">{mine.id}</p>
              <div>
                <p className="text-xl font-semibold">{mine.name}</p>
                <p className="text-mute">{mine.college} · {mine.track}</p>
                <p className="mt-2 text-sm text-mute">{mine.members.join(', ')}</p>
              </div>
            </div>
            <p className="mt-5 text-sm text-mute">Show this pass at the check-in desk. On a real event this code is scanned at the door.</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button className="btn btn-main" onClick={() => go('arrivals')}>See the arrivals board</button>
              <button className="btn btn-line" onClick={() => go('home')}>Back to the event</button>
            </div>
          </section>
        )}
        {view === 'arrivals' && (
          <section className="rise pt-14">
            <p className="flex items-center gap-2 text-sm text-ok"><span className="live-dot h-2.5 w-2.5 rounded-full bg-ok" /> Live</p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">Arrivals board</h1>
            <p className="mt-2 text-mute">Updates as teams check in at the desk.</p>
            <div className="card mt-8 p-6">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-3xl font-bold">{arrived} <span className="text-lg font-medium text-mute">of {teams.length} teams here</span></p>
                <p className="text-mute">{Math.round((arrived / teams.length) * 100)}%</p>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-raise">
                <div className="h-full rounded-full bg-gradient-to-r from-violet to-bright transition-[width] duration-700" style={{ width: `${(arrived / teams.length) * 100}%` }} />
              </div>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {teams.map((t) => (
                <li key={t.id} className={`card flex items-center justify-between gap-3 p-4 ${t.id === mine?.id ? 'border-bright' : ''}`}>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{t.name}{t.id === mine?.id && <span className="ml-2 text-sm text-bright">(your team)</span>}</p>
                    <p className="text-sm text-mute">{t.id} · {t.college}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${t.arrived ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'}`}>{t.arrived ? 'Arrived' : 'Waiting'}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <footer className="border-t border-violet/20 py-8 text-center text-sm text-mute">Sample template. Every name, number and date here is made up.</footer>
    </>
  );
}

function Home({ eventAt, go, teams, people, arrived }: { eventAt: number; go: (v: View) => void; teams: number; people: number; arrived: number }) {
  const left = useCountdown(eventAt);
  return (
    <>
      <section className="flex min-h-[78vh] flex-col items-center justify-center py-16 text-center">
        <p className="rise rounded-full border border-violet/40 px-4 py-1 text-sm text-mute">{EVENT.place}</p>
        <h1 className="rise mt-6 text-[clamp(2.8rem,9vw,6rem)] font-bold"><span className="grad-text">⚡ {EVENT.name}</span></h1>
        <p className="rise mt-3 max-w-xl text-lg text-mute">{EVENT.tag}</p>
        <div className="rise mt-8 flex flex-wrap justify-center gap-3">
          <button className="btn btn-main" onClick={() => go('register')}>Register your team</button>
          <button className="btn btn-line" onClick={() => go('arrivals')}>See who has arrived</button>
        </div>
        <div className="rise mt-12 grid grid-cols-4 gap-3" aria-label="Time until the event starts">
          {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, i) => (
            <div key={label} className="card w-[4.6rem] py-3 sm:w-24">
              <p className="font-display text-3xl font-bold tabular-nums sm:text-4xl">{String(left[i]).padStart(2, '0')}</p>
              <p className="text-xs text-mute">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Registration numbers">
        {[[teams, 'Teams registered'], [people, 'Participants'], [arrived, 'Teams checked in']].map(([n, label]) => (
          <div key={label} className="card p-6 text-center">
            <p className="grad-text font-display text-5xl font-bold tabular-nums">{n}</p>
            <p className="mt-1 text-mute">{label}</p>
          </div>
        ))}
      </section>

      <section className="mt-24">
        <h2 className="text-3xl font-bold sm:text-4xl">Pick a track</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {TRACKS.map((t, i) => (
            <div key={t} className="card p-6">
              <p className="font-display text-sm text-bright">Track {i + 1}</p>
              <h3 className="mt-1 text-2xl font-semibold">{t}</h3>
              <p className="mt-2 text-mute">A short description of this track goes here, with what teams are expected to build.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-3xl font-bold sm:text-4xl">How the day runs</h2>
        <ol className="mt-6 border-l-2 border-violet/40 pl-6">
          {SCHEDULE.map(([time, title, text]) => (
            <li key={title} className="relative pb-7 last:pb-0">
              <span className="absolute top-1.5 -left-[31px] h-3.5 w-3.5 rounded-full bg-bright shadow-[0_0_12px_hsl(271_91%_65%)]" />
              <p className="font-display text-sm text-bright">{time}</p>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-mute">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="card mt-24 p-8 text-center sm:p-12">
        <h2 className="text-3xl font-bold sm:text-4xl">Teams of two to four</h2>
        <p className="mx-auto mt-3 max-w-lg text-mute">Registration takes about two minutes. You get a team pass with a code to show at the door.</p>
        <button className="btn btn-main mt-6" onClick={() => go('register')}>Register your team</button>
      </section>
    </>
  );
}

function Register({ taken, onDone }: { taken: string[]; onDone: (t: Omit<Team, 'id' | 'arrived'>) => void }) {
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [track, setTrack] = useState(TRACKS[0]);
  const [members, setMembers] = useState(['', '']);
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const filled = members.map((m) => m.trim()).filter(Boolean);
    if (taken.includes(name.trim().toLowerCase())) return setError('That team name is taken. Try another.');
    if (filled.length < 2) return setError('Add at least two team members.');
    onDone({ name: name.trim(), college: college.trim(), track, members: filled });
  };
  const label = 'block text-sm font-medium text-mute';

  return (
    <section className="rise mx-auto max-w-xl pt-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Register your team</h1>
      <p className="mt-2 text-mute">This is a sample: nothing you type here is saved or sent anywhere.</p>
      <form onSubmit={submit} className="card mt-8 grid gap-5 p-6 sm:p-8">
        <label className={label}>
          Team name
          <input className="field mt-1" value={name} onChange={(e) => (setName(e.target.value), setError(''))} required placeholder="Byte Builders" />
        </label>
        <label className={label}>
          College
          <input className="field mt-1" value={college} onChange={(e) => setCollege(e.target.value)} required placeholder="Your College" />
        </label>
        <label className={label}>
          Track
          <select className="field mt-1" value={track} onChange={(e) => setTrack(e.target.value)}>
            {TRACKS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
        <fieldset className="grid gap-3">
          <legend className={label}>Team members (two to four)</legend>
          {members.map((m, i) => (
            <input key={i} className="field" value={m} aria-label={`Member ${i + 1} name`} placeholder={`Member ${i + 1} name`} onChange={(e) => (setMembers(members.map((x, k) => (k === i ? e.target.value : x))), setError(''))} />
          ))}
          {members.length < 4 && (
            <button type="button" className="min-h-11 justify-self-start text-sm font-semibold text-bright hover:underline" onClick={() => setMembers([...members, ''])}>
              Add another member
            </button>
          )}
        </fieldset>
        {error && <p role="alert" className="text-sm text-[hsl(0_84%_70%)]">{error}</p>}
        <button className="btn btn-main">Register and get the pass</button>
      </form>
    </section>
  );
}

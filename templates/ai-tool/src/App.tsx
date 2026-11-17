import { useState } from 'react';

// SAMPLE TEMPLATE. A message checker: paste a message, get a verdict and the tricks it uses.
// This sample runs simple word rules in the browser so it works with no server.
// A real build sends the message to an AI model and answers in the reader's own language.

type Trick = { id: string; name: string; why: string; re: RegExp };
const TRICKS: Trick[] = [
  { id: 'rush', name: 'False urgency', why: 'It pushes you to act before you can think or ask someone.', re: /urgent(ly)?|immediately|right now|within \d+ ?(hours?|minutes?|mins?)|today only|last chance|expires?( soon| today)?/gi },
  { id: 'secret', name: 'Asks for a secret code', why: 'No real bank or company asks for your OTP, PIN, password or CVV.', re: /\bOTP\b|\bPIN\b|password|\bCVV\b|verification code/gi },
  { id: 'lure', name: 'Money you did not expect', why: 'A prize, refund or cashback you never applied for is bait.', re: /you(?:'ve| have)? won|prize|lottery|cashback|reward|refund|free gift/gi },
  { id: 'link', name: 'Unknown link', why: 'Short or odd links hide where they really go.', re: /https?:\/\/\S+|bit\.ly\/\S*|tinyurl\.\S+|click (here|the link|below)/gi },
  { id: 'threat', name: 'Threat to your account', why: 'Fear of losing access makes people skip checking.', re: /blocked|suspend(ed)?|deactivat\w+|\bKYC\b|frozen|legal action/gi },
];

const SAMPLES = [
  { label: 'Bank alert', text: 'Dear customer, your account will be blocked today. Update your KYC immediately by clicking here: http://bit.ly/sample-kyc and share the OTP sent to your phone.' },
  { label: 'Prize', text: 'Congratulations! You have won a prize of 5,00,000 in our lucky draw. Claim your reward within 2 hours at http://sample-prize.example' },
  { label: 'Normal message', text: 'Hi, the meeting is moved to 4 pm tomorrow. I have shared the notes in the group. See you there.' },
];

type Result = { found: { trick: Trick; hits: string[] }[]; parts: { text: string; hit: boolean }[] };

/** Find every trick in the text, and split the text so the matched bits can be highlighted. */
function check(text: string): Result {
  const spans: [number, number][] = [];
  const found = TRICKS.map((trick) => {
    const hits = [...text.matchAll(trick.re)];
    hits.forEach((m) => spans.push([m.index!, m.index! + m[0].length]));
    return { trick, hits: [...new Set(hits.map((m) => m[0]))] };
  }).filter((f) => f.hits.length);
  spans.sort((a, b) => a[0] - b[0]);
  const parts: Result['parts'] = [];
  let at = 0;
  for (const [s, e] of spans) {
    if (s < at) continue; // overlapping match, already covered
    if (s > at) parts.push({ text: text.slice(at, s), hit: false });
    parts.push({ text: text.slice(s, e), hit: true });
    at = e;
  }
  if (at < text.length) parts.push({ text: text.slice(at), hit: false });
  return { found, parts };
}

const verdict = (n: number) =>
  n >= 3 ? { word: 'Likely a scam', tone: 'text-red', ring: '#ff5364', advice: 'Do not reply, click or share any code. Block the sender.' }
  : n >= 1 ? { word: 'Be careful', tone: 'text-amber', ring: '#ffb547', advice: 'Check with the company using a number you already trust before doing anything.' }
  : { word: 'Looks safe', tone: 'text-green', ring: '#32d6a0', advice: 'No common tricks found. Still, never share codes or passwords.' };

export default function App() {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState('');

  const run = (value = text) => {
    if (!value.trim()) return setError('Paste a message first.');
    setError('');
    setResult(null);
    setBusy(true);
    setTimeout(() => {
      setResult(check(value));
      setBusy(false);
    }, 900); // stands in for the wait on a real AI answer
  };
  const v = result && verdict(result.found.length);

  return (
    <div className="mx-auto max-w-3xl px-5 pb-20">
      <header className="flex items-center justify-between py-5">
        <p className="font-mono text-lg font-semibold"><span className="text-red">●</span> SampleCheck</p>
        <p className="hidden font-mono text-xs text-soft sm:block">Web · WhatsApp · Telegram</p>
      </header>

      <main>
        <h1 className="mt-8 text-[clamp(2.4rem,7vw,4.2rem)] leading-[1.02] font-bold tracking-tight">
          Is this message <span className="text-red">a scam?</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-soft">Paste any suspicious message. You get a clear answer and every trick it is using.</p>

        <div className="mt-8 rounded-2xl border border-rule bg-sheet p-4 sm:p-5">
          <label htmlFor="msg" className="font-mono text-xs text-soft">The message</label>
          <textarea id="msg" rows={5} value={text} onChange={(e) => (setText(e.target.value), setError(''))} placeholder="Paste the message here" className="mt-2 w-full resize-y rounded-xl border border-rule bg-raise p-3 text-base text-ink placeholder:text-soft/70 focus:border-red focus:outline-none" />
          {error && <p role="alert" className="mt-2 text-sm text-red">{error}</p>}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-sm text-soft">Try one:</span>
            {SAMPLES.map((s) => (
              <button key={s.label} onClick={() => (setText(s.text), run(s.text))} className="min-h-11 rounded-full border border-rule px-4 text-sm hover:border-red">{s.label}</button>
            ))}
            <button onClick={() => run()} disabled={busy} className="ml-auto min-h-12 rounded-xl bg-red px-6 font-semibold text-black transition-transform active:scale-[.97] disabled:opacity-60">
              {busy ? 'Checking' : 'Check the message'}
            </button>
          </div>
        </div>

        <div aria-live="polite">
          {busy && (
            <div className="mt-8 flex items-center gap-4 text-soft">
              <svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
                <circle cx="22" cy="22" r="19" fill="none" stroke="rgb(255 255 255 / .12)" strokeWidth="3" />
                <path className="sweep" d="M22 3a19 19 0 0 1 19 19" fill="none" stroke="#ff5364" strokeWidth="3" strokeLinecap="round" />
              </svg>
              Reading the message and looking for tricks.
            </div>
          )}

          {result && v && (
            <section className="rise mt-8 rounded-2xl border border-rule bg-sheet p-5 sm:p-7">
              <div className="flex items-center gap-5">
                <svg width="84" height="84" viewBox="0 0 84 84" role="img" aria-label={`${result.found.length} of ${TRICKS.length} tricks found`}>
                  <circle cx="42" cy="42" r="36" fill="none" stroke="rgb(255 255 255 / .1)" strokeWidth="7" />
                  <circle cx="42" cy="42" r="36" fill="none" stroke={v.ring} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${(Math.max(result.found.length, 0.25) / TRICKS.length) * 226} 226`} transform="rotate(-90 42 42)" />
                  <text x="42" y="49" textAnchor="middle" fontSize="24" fontWeight="700" fill="#f5f5f5">{result.found.length}</text>
                </svg>
                <div>
                  <p className={`text-3xl font-bold ${v.tone}`}>{v.word}</p>
                  <p className="text-soft">{v.advice}</p>
                </div>
              </div>

              <p className="mt-6 font-mono text-xs text-soft">Your message, with the risky parts marked</p>
              <p className="mt-2 rounded-xl bg-raise p-4 leading-relaxed break-words whitespace-pre-wrap">
                {result.parts.map((p, i) => (p.hit ? <mark key={i}>{p.text}</mark> : p.text))}
              </p>

              {result.found.length > 0 && (
                <>
                  <p className="mt-6 font-mono text-xs text-soft">Tricks found</p>
                  <ul className="mt-2 grid gap-3">
                    {result.found.map(({ trick, hits }) => (
                      <li key={trick.id} className="rounded-xl border border-rule p-4">
                        <p className="font-semibold">{trick.name}</p>
                        <p className="text-soft">{trick.why}</p>
                        <p className="mt-1 font-mono text-xs text-red">{hits.slice(0, 3).join('  ·  ')}</p>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}
        </div>
      </main>

      <footer className="mt-16 border-t border-rule pt-6 text-sm text-soft">
        Sample template. It checks with simple word rules; a real build uses an AI model and answers in the reader's language.
      </footer>
    </div>
  );
}

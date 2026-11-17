import PlaceHero from '../components/PlaceHero'
import { profile } from '../data/profile'

// The Notice Pier: what this site stores and sends, in plain words. Keep it in step with the code
// (localStorage / sessionStorage keys, third-party requests in index.html, iframes on offer pages).

const items = [
  { h: 'No tracking', p: 'There are no analytics, ads, tracking pixels or cookies on this site. Nobody is counting your clicks.' },
  {
    h: 'What your browser remembers',
    p: 'A few small settings stay in your own browser and never leave it: whether you chose the light or dark look ("theme") and whether sound is on ("sound"), kept until you clear them; and, for this visit only, whether you already saw the cloud intro ("dove") and whether you sent Jr away ("jr").',
  },
  { h: 'Fonts', p: "The typefaces load from Google Fonts, so Google receives your IP address when the page loads, as with any site that uses them. See Google's privacy policy for how it handles that." },
  { h: 'Live previews', p: "Some project pages show a client's real website in a frame. Those sites are run by their owners and follow their own privacy policies." },
  { h: 'When you contact me', p: 'The contact form does not send anything to a server. It opens WhatsApp or your email app with your message filled in, and you choose whether to send it. What you send is used only to reply to you about your project.' },
  { h: 'Sound', p: 'The sound is made live in your browser. Nothing is recorded, and the microphone is never used.' },
]

export default function Privacy() {
  return (
    <>
      <PlaceHero id="pier" title={<>Privacy, <span className="serif">in plain words</span></>} lead="What this site stores, what it sends, and what it never does." />

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {items.map((i) => (
          <section key={i.h} className="isle-card p-6" data-reveal>
            <h2 className="text-xl font-semibold">{i.h}</h2>
            <p className="mt-2 text-muted">{i.p}</p>
          </section>
        ))}
      </div>

      <p className="mt-14 border-t border-rule pt-6 text-sm text-muted">
        Questions about your data: {profile.email ? <a className="underline" href={`mailto:${profile.email}`}>{profile.email}</a> : 'use the contact page'}. Last updated November 2026.
      </p>
    </>
  )
}

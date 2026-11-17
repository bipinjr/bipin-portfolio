import PlaceHero from '../components/PlaceHero'
import { useState, type FormEvent } from 'react'
import { Ph } from '../components/bits'
import { profile, whatsappLink } from '../data/profile'

const hello = "Hi Bipin, I saw your portfolio and I'd like to talk about a project."

export default function Contact() {
  const [name, setName] = useState('')
  const [need, setNeed] = useState('')
  const canSend = Boolean(profile.whatsapp || profile.email)

  // No backend: the form just opens WhatsApp (or the email app) with the message filled in.
  const send = (e: FormEvent) => {
    e.preventDefault()
    const msg = `Hi Bipin, I'm ${name}. ${need}`
    const url = whatsappLink(msg) ?? `mailto:${profile.email}?subject=${encodeURIComponent('Project enquiry')}&body=${encodeURIComponent(msg)}`
    window.open(url, '_blank', 'noopener')
  }
  const wa = whatsappLink(hello)
  const field = 'mt-1 w-full rounded-lg border-2 border-rule bg-card px-3 py-3 text-base focus:border-ink focus:outline-none'

  return (
    <>
      <PlaceHero id="lighthouse" title={<>Send a <span className="serif">signal</span></>} lead={`${profile.availability}. WhatsApp is the fastest way to reach me.`} />

      <div className="mt-10 grid gap-12 md:grid-cols-2">
        <section aria-label="Ways to reach me">
          <ul className="grid gap-4">
            <li>
              {wa ? (
                <a className="btn btn-solid w-full sm:w-auto" href={wa} target="_blank" rel="noreferrer">
                  Message me on WhatsApp
                </a>
              ) : (
                <>
                  WhatsApp: <Ph>[your WhatsApp number]</Ph>
                </>
              )}
            </li>
            <li>
              {profile.email ? (
                <a className="btn btn-line w-full sm:w-auto" href={`mailto:${profile.email}`}>
                  Email me
                </a>
              ) : (
                <>
                  Email: <Ph>[your email]</Ph>
                </>
              )}
            </li>
            <li>
              {profile.resume ? (
                <a className="btn btn-line w-full sm:w-auto" href={profile.resume} download>
                  Download resume
                </a>
              ) : (
                <>
                  Resume: <Ph>[resume PDF]</Ph>
                </>
              )}
            </li>
            <li>
              {profile.linkedin ? (
                <a className="font-bold underline underline-offset-4" href={profile.linkedin} target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
              ) : (
                <>
                  LinkedIn: <Ph>[LinkedIn URL]</Ph>
                </>
              )}
            </li>
            <li>
              <a className="font-bold underline underline-offset-4" href={profile.github} target="_blank" rel="noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </section>

        <form onSubmit={send} className="rounded-xl border border-rule bg-card p-5 sm:p-7">
          <h2 className="display text-3xl">Tell me about it</h2>
          <label className="mt-4 block font-bold">
            Your name
            <input className={field} value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
          </label>
          <label className="mt-4 block font-bold">
            What do you need built?
            <textarea className={field} rows={4} value={need} onChange={(e) => setNeed(e.target.value)} required />
          </label>
          {canSend ? (
            <>
              <button className="btn btn-solid mt-5 w-full">{profile.whatsapp ? 'Send on WhatsApp' : 'Send by email'}</button>
              <p className="mt-2 text-sm text-muted">Opens {profile.whatsapp ? 'WhatsApp' : 'your email app'} with your message filled in. Nothing is stored here.</p>
            </>
          ) : (
            <p className="mt-5">
              <Ph>[add WhatsApp number or email to switch this form on]</Ph>
            </p>
          )}
        </form>
      </div>
    </>
  )
}

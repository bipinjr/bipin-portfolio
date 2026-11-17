import { useEffect, useRef, useState, type FormEvent } from 'react'
import { L } from './bits'
import { SUGGEST, reply, type Reply } from '../data/chat'

// The mini chat each bot carries: type anything, or tap a suggestion; the bot answers in its own voice.
// One conversation per bot, kept while the visitor stays on the site.

type Msg = { me: boolean; text: string; link?: Reply['link'] }
const logs: Record<string, Msg[]> = {}

export default function BotChat({ bot, intro, onClose, onAnswer }: { bot: string; intro: string; onClose: () => void; onAnswer: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>(() => logs[bot] ?? [{ me: false, text: intro }])
  const [text, setText] = useState('')
  const [typing, setTyping] = useState(false)
  const end = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    logs[bot] = msgs
  }, [bot, msgs])
  useEffect(() => {
    const log = end.current?.parentElement
    if (log) log.scrollTop = log.scrollHeight // scroll the chat only, never the page
  }, [msgs, typing])
  useEffect(() => {
    input.current?.focus({ preventScroll: true })
  }, [])

  const ask = (q: string) => {
    const clean = q.trim().slice(0, 200)
    if (!clean || typing) return
    setMsgs((m) => [...m, { me: true, text: clean }])
    setText('')
    setTyping(true)
    const r = reply(bot, clean)
    window.setTimeout(() => {
      setTyping(false)
      setMsgs((m) => [...m, { me: false, text: r.text, link: r.link }])
      onAnswer()
    }, 500 + Math.min(900, r.text.length * 8))
  }
  const send = (e: FormEvent) => {
    e.preventDefault()
    ask(text)
  }

  return (
    <div className="bot-card bot-chat" role="dialog" aria-label={`Chat with ${bot}`}>
      <p className="bot-chat-h">Chat with {bot}</p>
      <div className="bot-chat-log" aria-live="polite">
        {msgs.map((m, i) => (
          <div key={i} className={`bot-msg ${m.me ? 'me' : ''}`}>
            <p>{m.text}</p>
            {m.link && (
              <L to={m.link.to} className="bot-chip bot-chip-solid mt-1.5" onClick={onClose}>
                {m.link.text}
              </L>
            )}
          </div>
        ))}
        {typing && (
          <div className="bot-msg typing" aria-label={`${bot} is typing`}>
            <i />
            <i />
            <i />
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {(SUGGEST[bot] ?? SUGGEST.Jr).map((q) => (
          <button key={q} className="bot-chip" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>
      <form className="bot-chat-form" onSubmit={send}>
        <input ref={input} value={text} onChange={(e) => setText(e.target.value)} placeholder={`Ask ${bot} anything…`} aria-label={`Message ${bot}`} maxLength={200} />
        <button type="submit" aria-label="Send" disabled={!text.trim()}>
          ↑
        </button>
      </form>
      <button className="bot-x" onClick={onClose} aria-label="Close chat">
        ×
      </button>
    </div>
  )
}

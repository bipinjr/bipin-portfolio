import { achievements, internships, offers, profile, skills } from './profile'
import { projects } from './projects'
import { isNight } from './island'

// The bots' mini chat. No AI service: a visitor's message is matched to a topic by keywords, the facts
// come from the site's own data (so they are always true), and each bot says it in its own voice.
// Unknown questions get a funny shrug plus a nudge toward the topics the bot does know.

export type Reply = { text: string; link?: { to: string; text: string } }
type Topic = 'hello' | 'who' | 'services' | 'price' | 'time' | 'available' | 'contact' | 'projects' | 'hackathon' | 'skills' | 'where' | 'schedule' | 'crew' | 'privacy' | 'research' | 'experience' | 'joke' | 'thanks' | 'bye'

const TOPICS: [Topic, RegExp][] = [
  ['price', /\b(price|cost|charge|budget|rate|quote|how much|fee|expensive|cheap|pay)\b/i],
  ['time', /\b(how long|timeline|deadline|days|weeks|fast|quick|turnaround|deliver)\b/i],
  ['available', /\b(available|free|hire|hiring|freelance|part.?time|open to|take (on|my)|work with|what is he like|personality|like to work)\b/i],
  ['contact', /\b(contact|reach|whats ?app|email|mail|call|phone|message|talk to|linkedin)\b/i],
  ['services', /\b(service|build|make|offer|website|site|app|automation|ai tool|mvp|do you do|what can)\b/i],
  ['projects', /\b(project|portfolio|built|work samples|examples|showcase|github)\b/i],
  ['hackathon', /\b(hackathon|won|win|award|colossus|achievement|prize|trophy|flag)\b/i],
  ['skills', /\b(skill|stack|tech|react|python|language|framework|tools?|know)\b/i],
  ['experience', /\b(experience|intern|internship|job|career|college|degree|study|studied)\b/i],
  ['research', /\b(research|paper|papers|publication|observatory|study on)\b/i],
  ['schedule', /\b(awake|sleep|asleep|online|time is it|hours|schedule|timezone|time zone|now)\b/i],
  ['where', /\b(where|location|city|country|based|bengaluru|bangalore|india|remote)\b/i],
  ['crew', /\b(bots?|robots?|crew|citadel|team|friends|jr|junior|pixel|bolt|juno|byte|echo|chip|lofi|dash)\b/i],
  ['privacy', /\b(privacy|data|cookie|track|tracking|safe|gdpr)\b/i],
  ['joke', /\b(joke|funny|laugh|bored|entertain|meme)\b/i],
  ['thanks', /\b(thanks|thank you|thx|ty|cool|nice|great|awesome|love it)\b/i],
  ['bye', /\b(bye|goodbye|see ya|later|cya)\b/i],
  ['who', /\b(who are you|your name|what are you|are you (a|an)|about you)\b/i],
  ['hello', /\b(hi|hello|hey|yo|sup|namaste|good (morning|evening|afternoon))\b/i],
]

const bengaluruTime = () => new Date().toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit' })
const list = (a: string[]) => (a.length > 1 ? `${a.slice(0, -1).join(', ')} and ${a[a.length - 1]}` : a[0])
const pick = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)]

/** The plain facts for each topic, true to the site's data. */
const FACTS: Record<Topic, () => Reply> = {
  hello: () => ({ text: 'Ask me anything about the boss: what he builds, prices, timelines, or how to reach him.' }),
  who: () => ({ text: '' }),
  services: () => ({ text: `He builds ${list(offers.map((o) => o.label.split(' ').map((w) => (/^[A-Z]{2,}$/.test(w) ? w : w.toLowerCase())).join(' ')))}. Each one has its own door in the Foundry.`, link: { to: '/work', text: 'See the doors' } }),
  price: () => ({ text: 'It depends on the size. A business site is the small end, an MVP the big end. Send him the idea and he replies with an honest quote within a day.', link: { to: '/contact', text: 'Ask for a quote' } }),
  time: () => ({ text: 'Most websites take one to three weeks; bigger builds take longer. He gives you a real date before starting, and he keeps it.' }),
  available: () => ({ text: `Yes. ${profile.availability}.`, link: { to: '/contact', text: 'Start a project' } }),
  contact: () => ({ text: 'WhatsApp is fastest; email works too. Everything is at the Lighthouse.', link: { to: '/contact', text: 'Go to the Lighthouse' } }),
  projects: () => ({ text: `Things he has shipped: ${list(projects.slice(0, 5).map((p) => p.name))}.`, link: { to: '/projects', text: 'Visit the Lab' } }),
  hackathon: () => ({ text: `${achievements[0].title}. ${achievements[0].detail}`, link: { to: '/about', text: 'More wins' } }),
  skills: () => ({ text: `His toolbox: ${list(Object.values(skills).flat().slice(0, 8))}.`, link: { to: '/about', text: 'All skills' } }),
  experience: () => ({ text: `${internships.length} internships so far, at ${list(internships.slice(0, 4).map((i) => i.org))} and more.`, link: { to: '/story', text: 'The full story' } }),
  research: () => ({ text: 'He has written research papers; Nova is still shelving them in the Observatory. They land here soon.' }),
  schedule: () => ({ text: `It is ${bengaluruTime()} in Bengaluru. ${isNight() ? 'The boss is probably asleep, but messages wait for him.' : 'The boss is around and working.'} He works with clients across time zones.` }),
  where: () => ({ text: `${profile.city}, India. He works remotely with clients in India and abroad.` }),
  crew: () => ({ text: 'Twelve bots, one boss. Each of us looks after a place on this island.', link: { to: '/crew', text: 'Meet the crew' } }),
  privacy: () => ({ text: 'No tracking, no cookies, no analytics. The contact form only opens your own WhatsApp or email.', link: { to: '/privacy', text: 'Read the notice' } }),
  joke: () => ({ text: '' }),
  thanks: () => ({ text: '' }),
  bye: () => ({ text: '' }),
}

type Voice = { who: string; hello: string[]; open: string[]; close: string[]; jokes: string[]; thanks: string[]; bye: string[]; shrug: string[]; own?: Partial<Record<Topic, string>> }

/** How each bot talks. `own` lines replace the facts for the topic that bot cares about most. */
const VOICES: Record<string, Voice> = {
  Jr: {
    who: "I'm Jr. Bipin's sidekick, best friend and unpaid intern. Mostly the last one.",
    hello: ['Hey hey! Welcome to the island.', 'Oh, a visitor! Quick, look busy.'],
    open: ['Okay, insider info:', 'Between us?', 'Easy one.'],
    close: ['Tell him Jr sent you.', 'I accept payment in compliments.', ''],
    jokes: ['Why did the developer go broke? He used up all his cache.', "Why do programmers prefer dark mode? Because light attracts bugs."],
    thanks: ['Anytime! I live here, I am always around.', 'Aww. I am telling the boss you said that.'],
    bye: ['Bye! Come back, the bots get lonely.', 'See you! I will guard the plaza.'],
    shrug: ["That one's above my pay grade. Which is zero.", 'No idea, but I can ask around the island.'],
  },
  Pixel: {
    who: 'I am Pixel. I decorated the house. The boss picked the code; I picked the curtains.',
    hello: ['Hello, come in. Mind the paint.', 'Oh, hi! You have good taste, I can tell.'],
    open: ['Let me paint you a picture:', 'Softly, then:', 'Here is the thing:'],
    close: ['Beautiful, right?', 'I would frame that.', ''],
    jokes: ['I tried to draw a circle with CSS. It became a philosophy.', 'My favourite colour? #F1EFE8. It is called "calm".'],
    thanks: ['That is sweet. The house thanks you too.', 'You are kind. Have a cushion.'],
    bye: ['Bye! Close the door gently, it is new.', 'Take care. The lamp stays on for you.'],
    shrug: ['Hmm, that is not on any wall in this house.', 'I only know pretty things and the boss. Ask me about him?'],
    own: { who: '', available: 'He is easy to work with: patient, clear, and he actually listens. Yes, he is taking new projects.' },
  },
  Lofi: {
    who: 'i am lofi. i keep the clock tower ticking and the boss on time. tick.',
    hello: ['hey. pull up a gear.', 'oh, hi. calm voices only.'],
    open: ['so...', 'quietly:', 'tick, tock, okay:'],
    close: ['no rush.', 'tick.', ''],
    jokes: ['i asked the clock for a joke. it said "wait for it."', 'time flies. i would know. i am the clock.'],
    thanks: ['you are welcome. take your time.', 'appreciate you.'],
    bye: ['bye. the tower will still be here.', 'see you around. tick.'],
    shrug: ['no idea. but i know what time it is.', 'that question is out of my time zone.'],
    own: { time: 'usually one to three weeks for a website. he gives a real date before starting, and he hits it. i check.' },
  },
  Bolt: {
    who: 'Bolt. Foreman of the Foundry. I build. I do not do small talk. This is small talk.',
    hello: ['Right. What are we building?', 'Hello. Boots on. Let us go.'],
    open: ['Short version:', 'Straight answer:', 'Listen:'],
    close: ['Built properly.', 'No shortcuts.', ''],
    jokes: ['A bug walked into my forge. It left as a feature.', 'I do not tell jokes. I hammer them.'],
    thanks: ['Good. Now go build something.', 'Noted. Back to work.'],
    bye: ['Bye. Wipe your boots.', 'Off you go. Forge stays hot.'],
    shrug: ['Not my department. My department is building.', 'Unclear. Ask me about the work.'],
  },
  Juno: {
    who: 'Juno, dockmaster at Sky Harbour. I handle prices, timelines and anything with a contract.',
    hello: ['Welcome aboard! Ship docking?', 'Hey! Let us talk business.'],
    open: ['Honest answer:', 'Straight from the dock:', 'No surprises:'],
    close: ['Deal?', 'No hidden fees. Ever.', ''],
    jokes: ['I tried to sell a cloud. Turned out it was free-floating.', 'Our refund policy: we build it right the first time.'],
    thanks: ['Pleasure doing business.', 'Anytime, captain.'],
    bye: ['Safe travels. The harbour is always open.', 'Bye! Dock again soon.'],
    shrug: ['Not on my manifest. Want prices or timelines instead?', 'That cargo is not in my hold.'],
    own: { price: 'Depends on size: a business site is the small end, an MVP the big end. Send your idea and the boss quotes you honestly within a day. No hidden fees, that is my rule.' },
  },
  Byte: {
    who: 'Byte. Operations lead of the Citadel. I keep twelve bots on schedule. You are bot thirteen now.',
    hello: ['Badge? Fine, you are cleared.', 'Hi. Make it quick, the forklift is reversing.'],
    open: ['Logged:', 'Status report:', 'Per my records:'],
    close: ['Filed.', 'Back to work, everyone.', ''],
    jokes: ['Rivet tried to recharge with coffee. We had a meeting about it.', 'I scheduled a break. Nobody took it. Efficient.'],
    thanks: ['Acknowledged.', 'You are polite. Rare. Logged.'],
    bye: ['Bye. Badge out at the gate.', 'Dismissed. Kindly.'],
    shrug: ['That is not in the system.', 'No record of that. Ask about the crew or the boss.'],
  },
  Echo: {
    who: 'Echo, signal operator at the Lighthouse. Messages in, messages out. Over.',
    hello: ['Signal received. Go ahead. Over.', 'Lighthouse here. Loud and clear.'],
    open: ['Copy that:', 'Transmitting:', 'Over to you:'],
    close: ['Over.', 'Over and out.', ''],
    jokes: ['Why did the signal break up? Bad connection. Over.', 'I tried to call a cloud. Straight to voicemail.'],
    thanks: ['Received with thanks. Over.', 'Roger that. Over.'],
    bye: ['Signing off. Over and out.', 'Bye. Beam stays on.'],
    shrug: ['Static on that one. Try again? Over.', 'Lost signal. Ask about reaching the boss.'],
    own: { contact: 'WhatsApp is fastest; email works too. He usually replies within a day, faster in Bengaluru daytime. Over.' },
  },
  Chip: {
    who: 'Chip, inspector at the Notice Pier. I read the fine print so you do not have to.',
    hello: ['Ah. A visitor. Suspicious. Welcome.', 'Good day. Everything here checks out.'],
    open: ['Elementary:', 'After careful inspection:', 'The evidence says:'],
    close: ['Case closed.', 'I checked twice.', ''],
    jokes: ['I investigated a cookie. Turned out to be a biscuit. No tracking.', 'The fine print here is short. I was disappointed.'],
    thanks: ['Noted in my little book.', 'Most kind. Case closed.'],
    bye: ['Good day. Mind the pier.', 'Farewell. Nothing suspicious, I promise.'],
    shrug: ['No clues on that one.', 'Inconclusive. Try privacy, data, or the boss.'],
  },
  Dash: {
    who: 'Dash! I run the Lab. Too many tabs, zero regrets. Okay okay, what do you need?',
    hello: ['Heyyy! Welcome to the Lab!', 'Oh hi! Careful, jar three is glowing.'],
    open: ['Okay okay okay:', 'Quick quick:', 'So basically:'],
    close: ['Wild, right?', 'Shipped it!', ''],
    jokes: ['I named a variable "temp". It is now permanent. Like my tabs.', 'Hackathon tip: sleep is a feature request.'],
    thanks: ['Yay! You are the best!', 'Aaah, thanks! Back to building!'],
    bye: ['Byeee! Do not touch jar three!', 'See ya! Ship something today!'],
    shrug: ['No clue! But I can show you a project instead!', 'Hmm, did not build that one yet. Yet!'],
  },
}

/** A bot's reply to whatever the visitor typed. */
export function reply(bot: string, message: string): Reply {
  const v = VOICES[bot] ?? VOICES.Jr
  const topic = TOPICS.find(([, re]) => re.test(message))?.[0]
  if (!topic) return { text: pick(v.shrug) }
  if (topic === 'who') return { text: v.who }
  if (topic === 'hello') return { text: `${pick(v.hello)} ${FACTS.hello().text}` }
  if (topic === 'joke') return { text: pick(v.jokes) }
  if (topic === 'thanks') return { text: pick(v.thanks) }
  if (topic === 'bye') return { text: pick(v.bye) }
  const fact = FACTS[topic]()
  const own = v.own?.[topic]
  const text = own || [pick(v.open), fact.text, pick(v.close)].filter(Boolean).join(' ')
  return { text, link: fact.link }
}

/** The quick questions shown as buttons; each bot leads with what its place is about. */
export const SUGGEST: Record<string, string[]> = {
  Jr: ['Who are you?', 'What does he build?', 'Is he available?', 'Tell me a joke'],
  Pixel: ['What is he like?', 'Is he available?', 'Tell me a joke'],
  Lofi: ['Is he awake now?', 'How long does a site take?', 'Experience?'],
  Bolt: ['What can he build?', 'Show me projects', 'Tell me a joke'],
  Juno: ['How much does it cost?', 'How long does it take?', 'Is he available?'],
  Byte: ['Who is on the crew?', 'Who are you?', 'Tell me a joke'],
  Echo: ['How do I reach him?', 'Is he awake now?', 'Who are you?'],
  Chip: ['Do you track me?', 'Who are you?', 'Tell me a joke'],
  Dash: ['Show me projects', 'Hackathon wins?', 'Tech stack?'],
}

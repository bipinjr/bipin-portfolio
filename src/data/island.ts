// The island world: every location, its host bot, and the townsbots who live there.
// Positions are % of the island video frame: `at` where the camera move starts (3.8s into the clip),
// `end` where it finishes (7.8s); the page slides between them as the camera drifts. Bots without a
// position are not visible in the clip, so they only talk on the Crew page.
// A line is a thought (string) or an overheard exchange [this bot, its pal].

export type Say = string | [string, string]
export type Host = { name: string; role: string; voice: string; intro: Say[]; night?: Say[] }
export type Place = { id: string; name: string; page: string; to: string | null; host: Host; at?: [number, number]; end?: [number, number]; w?: number; h?: number }
export type Npc = { id: string; place: string; name: string; pal?: string; at?: [number, number]; end?: [number, number]; say: Say[]; night?: Say[] }

const jr: Host = {
  name: 'Jr',
  role: "The boss's assistant",
  voice: 'Cheeky best friend, talks about the boss like a proud little brother',
  intro: [
    "You're at the Arrival Plaza. Everything starts here. I'm Jr, the boss's assistant. Pick a place, I'll tag along.",
    'Welcome to the island! The boss built all of this. Well. I supervised.',
    "Lost? Good. The best stuff here is found by wandering. Or by asking me, I'm faster.",
  ],
  night: ["Boss is asleep, but I'm not. Night tours are my specialty.", 'Quiet hours. The island glows at night, look around.'],
}

export const PLACES: Place[] = [
  { id: 'plaza', at: [49,64], end: [51,64.6], w: 22, h: 14, name: 'Arrival Plaza', page: 'You are here', to: null, host: jr },
  {
    id: 'house', at: [33,44], end: [31,42.3], w: 12, h: 16, name: "Bipin's House", page: 'About me', to: '/about',
    host: {
      name: 'Pixel', role: 'Interior designer and friend of the house',
      voice: 'Warm and a little poetic, notices small details',
      intro: [
        "This is the boss's house. I chose the curtains. He chose everything else, mostly code.",
        'Come in. This is where you meet the person behind the projects: how he thinks, what he loves, how he works with people.',
        "Every room here says something about him. The tidy desk? That's new. Don't tell him I said that.",
      ],
      night: ['Shh. The lamp in the window means he is still thinking about something.'],
    },
  },
  {
    id: 'clock', at: [44.7,36], end: [44.5,35.2], w: 5, h: 20, name: 'Clock Tower', page: 'Career and schedule', to: '/story',
    host: {
      name: 'Lofi', role: 'Keeper of time',
      voice: 'Calm, unhurried, a little sleepy, always knows the time',
      intro: [
        'tick... tock. This tower keeps the boss’s whole career: college, six internships, every job since.',
        "It runs on Bengaluru time. I'll tell you when he's working, when he's free, and when he's definitely asleep.",
        "Every gear is a year. The newest one is still spinning. That's this one.",
      ],
      night: ["It's late in Bengaluru. Boss is off the clock. I'm not. I'm the clock."],
    },
  },
  {
    id: 'observatory', at: [19,24], end: [17.8,22.8], w: 9, h: 12, name: 'Observatory', page: 'Research papers', to: null,
    host: {
      name: 'Nova', role: 'Head of research',
      voice: 'Precise, curious, gets very excited about findings',
      intro: [
        "The Observatory. The boss's research papers live here. Problem, method, result. I fact-checked all of it. Twice.",
        'We point the telescope at hard problems and write down what we find. Peer-reviewed, mostly by me.',
      ],
    },
  },
  {
    id: 'summit', at: [43,20], end: [42.5,18.3], w: 12, h: 14, name: 'The Summit', page: 'Achievements', to: '/about',
    host: {
      name: 'Scout', role: 'Commentator',
      voice: 'Sports commentator, big energy, play-by-play',
      intro: [
        'AND HERE WE ARE at the Summit! Every flag is a hackathon. The tallest one? Colossus 3.0. Best Technical Implementation!',
        'Online, offline, overnight. The boss has been to more hackathons than I have batteries.',
      ],
    },
  },
  {
    id: 'lab', at: [18.5,48], end: [18,47.7], w: 14, h: 16, name: 'Glasshouse Lab', page: 'Personal projects', to: '/projects',
    host: {
      name: 'Dash', role: 'Lab runner',
      voice: 'Hackathon energy, talks fast, too many tabs open',
      intro: [
        "Okay okay okay, this is the Lab! The boss's own projects grow here. Some are huge. Some are weird. All of them work.",
        'Each glass case is a project. Tap one. Careful, that one bites. Kidding. Probably.',
      ],
    },
  },
  {
    id: 'foundry', at: [65,48], end: [66,48.6], w: 20, h: 16, name: 'The Foundry', page: 'Services', to: '/work',
    host: {
      name: 'Bolt', role: 'Foreman',
      voice: 'Gruff, practical, short sentences, secretly proud',
      intro: [
        'The Foundry. Websites, AI tools, automations. You bring the idea. We build it. Properly.',
        'Right. Each door is a kind of job the boss takes on. Go in. See it running. Wipe your boots.',
        "No shortcuts in here. Tested, fast, shipped. That's the rule.",
      ],
      night: ['Night shift. The forge never fully goes out.'],
    },
  },
  {
    id: 'harbour', at: [74,70], end: [76.5,71.7], w: 14, h: 12, name: 'Sky Harbour', page: 'Working together', to: '/services',
    host: {
      name: 'Juno', role: 'Dockmaster',
      voice: 'Confident, friendly, straight about prices and timelines',
      intro: [
        "Sky Harbour, where clients dock. How the boss works, what it costs, how long it takes. No surprises, that's my rule.",
        "Ship coming in? Tell me what you need and I'll tell you honestly what it takes.",
      ],
    },
  },
  {
    id: 'citadel', at: [71.5,28], end: [72.5,27.2], w: 18, h: 12, name: 'Bot Citadel', page: 'The crew', to: '/crew',
    host: {
      name: 'Byte', role: 'Operations lead',
      voice: 'Organised, a little bossy with the other bots, fiercely loyal',
      intro: [
        "The Citadel. Twelve bots, one boss, zero days off. I run operations. Don't touch the big red button.",
        'Every bot here has a job. Mine is making sure they do it.',
      ],
      night: ["Rivet's on nights. If he's asleep, wake him. Gently. He bites. (He doesn't.)"],
    },
  },
  {
    id: 'lighthouse', at: [81.8,48], end: [83.5,46], w: 5, h: 20, name: 'Lighthouse', page: 'Contact', to: '/contact',
    host: {
      name: 'Echo', role: 'Signal operator',
      voice: 'Radio operator, crisp, says "over" sometimes',
      intro: [
        'Lighthouse to visitor: signal received. Send the boss a message from here. WhatsApp is fastest. Over.',
        'The beam reaches every time zone. So does the boss. Replies within a day, usually much faster.',
      ],
      night: ['Night watch. Messages still land. Boss reads them first thing. Over.'],
    },
  },
  {
    id: 'pier', at: [24,67], end: [22.2,68], w: 8, h: 8, name: 'Notice Pier', page: 'Privacy', to: '/privacy',
    host: {
      name: 'Chip', role: 'Inspector',
      voice: 'Detective, dry humour, reads every word of the fine print',
      intro: [
        'The Notice Pier. Privacy and the fine print. Elementary: no tracking you, no selling your data. I checked.',
        'I read the whole policy. With a magnifying glass. It is short. You are welcome.',
      ],
    },
  },
]

export const NPCS: Npc[] = [
  // Arrival Plaza
  {
    id: 'gate-guard', at: [53.3,58], end: [54,57.5], place: 'plaza', name: 'Gate guard',
    say: ['Ticket? ...You look friendly. Go on through.', "Another visitor. That's eleven today. Boss will be thrilled.", "I'm supposed to look serious. Is it working?", 'No running on the plaza. Floating is fine.'],
    night: ['Night shift at the gate. The clouds are quiet tonight.'],
  },
  {
    id: 'bird-feeder', at: [54.8,68.5], end: [55.3,70], place: 'plaza', name: 'Bird feeder', pal: 'Pigeon (probably)',
    say: ['Not the crusts. The crusts are for the fish.', ['Do birds even need us up here?', 'Coo.'], 'This one has been here longer than me. Very senior pigeon.', 'Bread budget: exceeded. Again.'],
    night: ['The birds are asleep. I am just sitting here. Peacefully.'],
  },
  {
    id: 'fountain-sweeper', place: 'plaza', name: 'Sweeper', pal: 'Gate guard',
    say: [['Did you see that visitor scroll?', 'Smooth. Very smooth.'], 'Coins in the fountain again. Everyone wishes for a website.', 'Swept this plaza nine times. It was clean the first time.'],
  },
  // House
  {
    id: 'mopper', at: [35.7,53], end: [35,53], place: 'house', name: 'Mop bot',
    say: ['Boss tracked mud in again. Genius, but muddy.', 'Floors so clean you can see your source code in them.', "I mop. It's what I do. I'm good at it.", 'Wet floor. I mean it this time.'],
    night: ['Midnight mop. Nobody sees it. That is the point.'],
  },
  {
    id: 'waterer', place: 'house', name: 'Plant bot', pal: 'Mop bot',
    say: [['You missed a spot.', 'There are no spots. I am the spot remover.'], 'Boss named this plant "Deploy". It keeps growing.', 'Two cups of water. One for the plant, one for me. I am waterproof.'],
  },
  // Clock Tower
  {
    id: 'clock-keeper', at: [42.8,42.7], end: [43,41.5], place: 'clock', name: 'Gear keeper',
    say: ['If this clock is late, boss is late. Boss is never late.', 'A drop of oil on gear 6. That was internship number six. Lovely year.', "Don't look down. I said don't. ...You looked.", 'Tick. Tock. Tick. I love my job.'],
    night: ['The boss is asleep. The clock is not. Neither am I.'],
  },
  {
    id: 'bell-ringer', place: 'clock', name: 'Bell ringer', pal: 'Gear keeper',
    say: [['Ring it now?', 'Not yet. Not yet. ...Now.'], 'One ring per shipped project. My arms are tired.', 'The bell can be heard on every island. Even the grumpy ones.'],
  },
  // Foundry (doors)
  {
    id: 'smith', at: [64,53], end: [68.3,53], place: 'foundry', name: 'Blacksmith bot',
    say: ['Hammer, check. Pixel-perfect, check. Lunch, never.', 'Every website gets forged twice: once for looks, once for speed.', 'Sparks are just bugs leaving the building.', "Clang. Clang. That's a contact form. Clang. That's a payment flow."],
    night: ['Forge on low. Building something big for tomorrow.'],
  },
  {
    id: 'door-painter', at: [57,51.6], end: [59,51.2], place: 'foundry', name: 'Painter bot', pal: 'Blacksmith bot',
    say: [['Blue or purple for the next door?', 'Whatever the client likes. Then make it better.'], 'Fourth coat. Boss said three. I like four.', 'Each door opens to a real, running project. I just make them pretty.'],
  },
  // Harbour (market)
  {
    id: 'dockhand', at: [63.5,69], end: [64.5,70.8], place: 'harbour', name: 'Dockhand', pal: 'Crate bot',
    say: [['New ship docking!', 'Another website order?'], 'Unloading ideas. Careful, some are fragile.', 'Client from abroad again. Different time zone, same smile.', 'That crate says "urgent". They all say urgent.'],
    night: ['Night arrivals. Ships dock quietly up here.'],
  },
  {
    id: 'stall-keeper', at: [68.3,72], end: [69.7,75.3], place: 'harbour', name: 'Stall keeper',
    say: ['Fresh landing pages! Hand-made automations! Haggling is allowed, winning is not.', "Prices are on the board. No hidden fees. Juno would kill me.", 'Sold out of quick fixes. We only do proper ones now.'],
  },
  // Lighthouse
  {
    id: 'fisher', at: [85.5,57], end: [88,56.6], place: 'lighthouse', name: 'Fishing bot',
    say: ['Three hours. Zero fish. Peak relaxation.', "There aren't any fish up here. Don't tell me. I know.", 'Caught a cloud once. It got away.', "Shh. You'll scare away the fish that don't exist."],
    night: ['Night fishing. Same results. Better view.'],
  },
  {
    id: 'lamp-polisher', place: 'lighthouse', name: 'Lamp keeper', pal: 'Fishing bot',
    say: [['Any luck?', 'Define luck.'], 'Polished the lamp. Again. It reaches every time zone now.', 'Somebody in another country just saw this beam and thought: I need a website.'],
  },
  // Off the current clip until the new island video is in
  { id: 'telescope', place: 'observatory', name: 'Star watcher', say: ['Saw a new idea out there. Writing a paper on it.', 'Hypothesis: the boss never sleeps. Data: inconclusive.', 'Telescope cleaned. Universe still there.'] },
  { id: 'archivist', place: 'observatory', name: 'Archivist', pal: 'Star watcher', say: [['Cite your sources.', 'I am the source.'], 'Papers filed by year, then by how proud the boss was.'] },
  { id: 'flag-raiser', at: [40.2,17.8], end: [40,17.4], place: 'summit', name: 'Flag raiser', say: ['Need a bigger pole. Boss keeps winning.', 'Hackathon flag number... I lost count. That is a good sign.'] },
  { id: 'trophy-polisher', place: 'summit', name: 'Trophy polisher', pal: 'Flag raiser', say: [['Polish the Colossus one first?', 'Always.'], 'This one was won at 4 a.m. with cold pizza. Respect.'] },
  { id: 'gardener', at: [25.8,55.5], end: [24.3,56.6], place: 'lab', name: 'Gardener bot', say: ['Project 7 is growing. Project 4 is... also growing. Worryingly.', 'Talk to your projects. They ship faster.', 'Pruned three features nobody asked for. The project looks happier already.'] },
  { id: 'lab-tech', place: 'lab', name: 'Lab tech', pal: 'Gardener bot', say: [['Is it supposed to glow?', 'Everything glows here. Ship it.'], 'Hackathon prototype in jar 3. Do not feed after midnight.'] },
  { id: 'rivet', place: 'citadel', name: 'Rivet (night shift)', say: ['*yawn* Night shift again. Boss is asleep, we keep the lights on.', 'Why did the robot go on holiday? It needed to recharge. ...I will see myself out.'], night: ['Shh. Everyone is asleep but us and the servers.'] },
  { id: 'forklift', place: 'citadel', name: 'Forklift bot', pal: 'Rivet', say: [['Where does this crate go?', 'Wherever Byte says. Always wherever Byte says.'], 'Beep beep. Backing up. Like the boss backs up his databases.'] },
  { id: 'wall-guard', at: [72,35.6], end: [73,35.2], place: 'citadel', name: 'Wall guard', say: ['All quiet on the north wall. All quiet on every wall. We float.', 'Lantern check: twelve of twelve.'] },
  { id: 'notice-reader', place: 'pier', name: 'Notice reader', say: ['Read the privacy notice. Twice. It is honest. Strange feeling.', 'Small print, big respect.'] },
]

/** True between 10 p.m. and 6 a.m. in Bengaluru. */
export const isNight = () => {
  const h = Number(new Date().toLocaleString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', hour12: false }))
  return h >= 22 || h < 6
}
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]
/** A line for this bot, using its night lines in Bengaluru night hours. */
export const lineFor = (x: { say?: Say[]; intro?: Say[]; night?: Say[] }): Say => {
  const day = x.say ?? x.intro ?? []
  return isNight() && x.night?.length && Math.random() < 0.6 ? pick(x.night) : pick(day)
}

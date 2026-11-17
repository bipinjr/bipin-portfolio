// Edit projects here. Components read everything from this file.
// - featured: true  -> large entry on Work and a row on the home departure board
// - line: which of the two lines the project sits on (startup = purple, local = green)
// - links: leave a link out and its button is hidden
// - image: put the file in public/images/projects/ and set e.g. '/images/projects/skillmatch.png'

export type Line = 'startup' | 'local'

export type Project = {
  slug: string
  name: string
  short: string // station name on the map, keep it under ~14 characters
  line: Line
  featured: boolean
  problem: string
  built: string
  stack: string[]
  links: { live?: string; github?: string; caseStudy?: string }
  image?: string
  embed?: boolean // false when the live site refuses to be shown inside another page
  event?: string // set for hackathon / buildathon projects
  placeholder?: string // marks a slot that is not a real project yet
}

export const projects: Project[] = [
  {
    slug: 'scamdecoder',
    name: 'ScamDecoder',
    short: 'ScamDecoder',
    line: 'startup',
    featured: true,
    problem: 'People get scam messages every day and cannot tell which ones are real.',
    built:
      "Checks any suspicious message, voice note, screenshot or QR code, says whether it is a scam, and explains every trick in the reader's own language. One check service sits behind the web app, a browser extension, a Telegram bot and a WhatsApp bot.",
    stack: ['TypeScript', 'Supabase', 'Telegram bot', 'WhatsApp bot', 'Vercel'],
    links: { live: 'https://scamdecoderjr.vercel.app', github: 'https://github.com/bipinjr/ScamDecoder' },
  },
  {
    slug: 'yojana-saathi',
    name: 'Yojana Saathi',
    short: 'Yojana Saathi',
    line: 'startup',
    featured: true,
    event: 'Hackathon',
    problem: 'Many families who qualify for government schemes never claim them.',
    built:
      'An AI agent that finds the government schemes a citizen qualifies for, explains why, and gets them ready to apply. Works by text, voice or a photo of a document.',
    stack: ['TypeScript', 'Groq API', 'Vercel'],
    links: { live: 'https://yoajana-saathi.vercel.app', github: 'https://github.com/bipinjr/Yoajana-Saathi' },
    embed: false,
  },
  {
    slug: 'krishivision',
    name: 'KrishiVision',
    short: 'KrishiVision',
    line: 'startup',
    featured: true,
    event: 'Hackathon',
    problem: 'Farmers need to spot crop pests early.',
    built: 'An AI agriculture platform with a multi-agent pest detection system.',
    stack: ['React', 'Vite', 'Supabase'],
    links: { github: 'https://github.com/bipinjr/KrishiVision' },
  },
  {
    slug: 'gravity-dance-academy',
    name: 'Gravity Dance Academy',
    short: 'Gravity Dance',
    line: 'local',
    featured: true,
    placeholder: '[demo, add once the academy approves]',
    problem: 'A dance academy needs new students to find it and enrol without a phone call.',
    built: 'A website for a dance academy in Rajajinagar. The enrolment form opens WhatsApp with the message already filled in.',
    stack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS'],
    links: { live: 'https://gravity-dance-academy-five.vercel.app', github: 'https://github.com/bipinjr/gravity-dance-academy' },
  },
  {
    slug: 'hackmarch',
    name: 'HackMarch 2.0 registration',
    short: 'HackMarch',
    line: 'local',
    featured: true,
    problem: 'A hackathon has to register teams and mark who actually turned up.',
    built: 'A registration and live attendance marking platform, with check-in and an admin dashboard for the organisers.',
    stack: ['React', 'TypeScript'],
    links: { live: 'https://klesnc.vercel.app', github: 'https://github.com/bipinjr/klesnc' },
  },
  {
    slug: 'skillmatch-ai',
    name: 'SkillMatch AI',
    short: 'SkillMatch',
    line: 'startup',
    featured: false,
    problem: 'Recruiters read resumes one by one against a job description.',
    built:
      'An AI resume screener. It takes a job description and multiple resumes, extracts skills, education and experience, then scores and ranks the candidates.',
    stack: ['React', 'Supabase', 'Groq API', 'Vercel'],
    links: { live: 'https://skillmatch-ai-assistantt.vercel.app', github: 'https://github.com/bipinjr/skillmatch-ai-assistant' },
  },
  {
    slug: 'fdp-certificate-automation',
    name: 'FDP certificate automation',
    short: 'Certificates',
    line: 'local',
    featured: false,
    problem: 'Making and emailing a certificate for every participant by hand is slow.',
    built:
      'An n8n workflow that reads participants from a sheet, overlays each name on a certificate PDF with Python (PyMuPDF), and emails it automatically. Used for a real faculty development programme.',
    stack: ['n8n', 'Python', 'PyMuPDF'],
    links: {},
  },
  {
    slug: 'reliefready',
    name: 'ReliefReady',
    short: 'ReliefReady',
    line: 'startup',
    featured: false,
    event: 'Hackathon',
    problem: 'After a disaster, people do not know which relief schemes they qualify for, often with no network.',
    built: 'An offline-first post-disaster entitlement navigator with an AI scheme-eligibility engine.',
    stack: ['React Native', 'FastAPI', 'Supabase', 'Groq API'],
    links: {},
  },
  {
    slug: 'vibeshield',
    name: 'VibeShield',
    short: 'VibeShield',
    line: 'startup',
    featured: false,
    event: 'Buildathon',
    problem: 'AI-generated code can carry security problems nobody reviewed.',
    built: 'A security copilot concept for AI-generated code.',
    stack: [],
    links: {},
  },
]

export const bySlug = (slug?: string) => projects.find((p) => p.slug === slug)

if (import.meta.env.DEV && new Set(projects.map((p) => p.slug)).size !== projects.length) {
  throw new Error('projects.ts: two projects share a slug')
}

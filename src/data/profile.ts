// Your details. Anything left as null shows on the site as a clearly marked placeholder
// (never as a broken link). Fill these in and the real buttons appear.

export const profile = {
  name: 'Bipin A',
  role: 'Full-stack developer building web apps, AI features and automations',
  city: 'Bengaluru',
  education: "BCA, K.L.E. Society's S. Nijalingappa College, Bengaluru (June 2024 to present)",
  availability: 'Open to freelance projects and part-time roles, remote, for clients in India and abroad',
  github: 'https://github.com/bipinjr',
  email: 'anthonybipin23@gmail.com' as string | null,
  whatsapp: '919108316234' as string | null, // digits only, with country code
  linkedin: 'https://www.linkedin.com/in/bipinjr' as string | null,
  resume: '/resume.pdf' as string | null, // the file is public/resume.pdf
  photo: '/images/me.jpg' as string | null,
}

export const internships: { org: string; role: string | null; dates: string | null }[] = [
  { org: 'Edufyi Tech Solutions', role: 'AI/ML engineering intern', dates: 'Jul to Oct 2026' },
  { org: 'CodeAlpha', role: 'AI/ML engineering intern', dates: 'Feb to Mar 2026' },
  { org: 'InternPe', role: 'AI/ML engineering intern', dates: 'Oct to Nov 2025' },
  { org: 'SkillCraft Technology', role: 'Full-stack development intern', dates: 'Oct to Nov 2025' },
  { org: 'StaxTech', role: 'Full-stack development intern', dates: 'Oct to Nov 2025' },
  { org: 'Future Interns', role: 'Full-stack development intern', dates: 'Oct to Nov 2025' },
]

// From the resume. Shown at the top of the About page.
export const achievements = [
  {
    title: 'Best Technical Implementation, Colossus 3.0',
    detail: 'National-level 24-hour hackathon at Dr. Ambedkar Institute of Technology, Bengaluru (Nov 2026). Cybersecurity track, 70 finalist teams shortlisted from 2,500+ registrations.',
  },
]

export const certifications = [
  'Cybersecurity Fundamentals, IBM SkillsBuild',
  'Threat Intelligence and Hunting, IBM SkillsBuild',
  'Generative AI and ChatGPT, GeeksforGeeks',
  'AI Fundamentals, IBM',
  'UiPath Agentic Automation Developer Associate',
  "From Relational Model (SQL) to MongoDB's Document Model",
  'Celonis Process Mining Fundamentals',
  'Software Engineering Virtual Experience (Forage): J.P. Morgan, Deloitte, Accenture, Tata, Electronic Arts',
]

export const openSource = {
  text: 'Accepted into ELUSOC 2026, contributing to EduLink.',
  link: null as string | null,
}

export const skills: Record<string, string[]> = {
  Languages: ['Python', 'JavaScript', 'TypeScript', 'Java', 'SQL', 'C', 'C++'],
  Frontend: ['React', 'Next.js', 'Angular', 'Tailwind CSS'],
  Backend: ['Node.js', 'Express.js', 'FastAPI', 'Spring', 'REST APIs', 'Webhooks'],
  AI: ['LLM integration', 'Prompt engineering', 'Speech-to-text', 'OCR', 'Scikit-learn', 'OpenCV'],
  'Data and cloud': ['PostgreSQL', 'Supabase', 'MongoDB', 'Vercel', 'Docker'],
  'Mobile and browser': ['Android', 'Chrome extensions'],
  Automation: ['n8n'],
}

export const services = {
  startup: {
    line: 'Startup line',
    who: 'For startups',
    stops: [
      { name: 'Full-stack features', detail: 'React, FastAPI and Supabase, from the screen to the database.' },
      { name: 'AI integrations', detail: 'LLM features, parsing and agents inside your product.' },
      { name: 'MVP builds', detail: 'A first version you can put in front of users.' },
    ],
  },
  local: {
    line: 'Local line',
    who: 'For local businesses',
    stops: [
      { name: 'Websites', detail: 'With WhatsApp booking and enquiries built in.' },
      { name: 'Automations', detail: 'Reminders and updates sent to your customers for you.' },
      { name: 'Google Business Profile', detail: 'Set up so people nearby can find you.' },
    ],
  },
} as const

export const whatsappLink = (message: string) =>
  profile.whatsapp ? `https://wa.me/${profile.whatsapp}?text=${encodeURIComponent(message)}` : null

// What I can build for you, shown on the home page and the Services page.
// Each one is a KIND of work, not a named project: a title, what it is used for, who it suits,
// and (optionally) a preview that plays in a small window to show the look.
// A preview starting with /demos/ is one of our own sample templates: visitors can scroll and click inside it.
// A preview that is an outside address is look-only and still shows that site's own name.
export type Offer = { id: string; label: string; line: 'startup' | 'local'; title: string; usedFor: string; who: string; preview: string | null }

export const offers: Offer[] = [
  {
    id: 'business-website',
    label: 'Business site',
    line: 'local',
    title: 'Take bookings through your website',
    usedFor: 'Brings in bookings and enquiries without a phone call. The form opens WhatsApp with the message already written.',
    who: 'academies, studios, clinics, shops',
    preview: 'https://gravity-dance-academy-five.vercel.app', // the real site. Sample copy also exists at /demos/business-website/index.html
  },
  {
    id: 'event-registration',
    label: 'Event sign-up',
    line: 'local',
    title: 'Run sign-ups and check-in for your event',
    usedFor: 'People register online, you mark who turned up at the door, and an admin screen shows the numbers as they come in.',
    who: 'college fests, hackathons, workshops',
    preview: 'https://klesnc.vercel.app', // the real site. Sample copy also exists at /demos/event-registration/index.html
  },
  {
    id: 'automation',
    label: 'Automations',
    line: 'local',
    title: 'Stop sending the same messages by hand',
    usedFor: 'Reminders, certificates and updates that reach your customers without anyone sending them by hand.',
    who: 'any business that sends the same messages again and again',
    preview: null,
  },
  {
    id: 'ai-tool',
    label: 'AI tool',
    line: 'startup',
    title: 'Give your users an AI tool that answers',
    usedFor: 'People send a message, a photo or a voice note and get a clear answer in their own language. Works on the web, WhatsApp and Telegram.',
    who: 'startups adding an AI feature',
    preview: 'https://scamdecoderjr.vercel.app', // the real site. Sample copy also exists at /demos/ai-tool/index.html
  },
  {
    id: 'ai-screening',
    label: 'AI screening',
    line: 'startup',
    title: 'Screen and rank applications with AI',
    usedFor: 'Upload a pile of documents and get them scored and ranked against what you are looking for, with the reasons.',
    who: 'hiring teams and anyone sorting applications',
    preview: 'https://skillmatch-ai-assistantt.vercel.app', // the real site. Sample copy also exists at /demos/ai-screening/index.html
  },
  {
    id: 'mvp',
    label: 'MVP build',
    line: 'startup',
    title: 'Launch the first version of your product',
    usedFor: 'A first working version of your product: the screens, the API and the database, live on the internet.',
    who: 'founders with an idea to test',
    preview: null,
  },
]

// "My story" on the home page, newest first. The big year on the left follows the entry in view.
export const story = [
  {
    year: '2026',
    range: 'Nov 2026',
    title: 'Best Technical Implementation',
    org: 'Colossus 3.0, a national 24-hour hackathon',
    points: ['Won on the cybersecurity track with an AI scam-detection platform.', '70 finalist teams, shortlisted from 2,500+ registrations.'],
  },
  {
    year: '2026',
    range: 'Oct 2025 to Oct 2026',
    title: 'AI/ML engineering intern',
    org: 'Edufyi Tech Solutions, CodeAlpha, InternPe · Remote',
    points: [
      'Built a speech emotion recognition pipeline and compared SVM, Random Forest and MLP classifiers across 7 emotion classes.',
      'Built handwritten character recognition with a CNN, plus credit scoring and medical prediction classifiers in Python.',
    ],
  },
  {
    year: '2025',
    range: 'Oct 2025 to Nov 2025',
    title: 'Full-stack development intern',
    org: 'SkillCraft Technology, StaxTech, Future Interns · Remote',
    points: ['Built a task management system with a structured REST API in Node.js and Express.', 'Delivered an e-commerce storefront with product listings, cart and checkout.'],
  },
  {
    year: '2024',
    range: 'Jun 2024 to now',
    title: 'BCA, Computer Applications',
    org: "K.L.E. Society's S. Nijalingappa College, Bengaluru",
    points: ['Full-stack, AI/ML and cloud.', 'Tech lead for the college event platform, with registration and face-recognition check-in.'],
  },
  {
    year: '2022',
    range: 'Jun 2022 to Mar 2024',
    title: 'Pre-University (CSBA)',
    org: "K.L.E. Society's S. Nijalingappa College, Bengaluru",
    points: ['Where the code started.'],
  },
]

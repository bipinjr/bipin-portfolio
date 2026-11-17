# PRD: Personal portfolio website for Bipin

Build my personal portfolio site. It has two jobs:

1. **Win freelance and part-time work from startup founders**, who will decide in about 30 seconds whether I can ship.
2. **Win local business clients**, who need to see that I can build sites like theirs.

Build it, run it locally, and get it ready to deploy on Vercel.

## 1. About me (use exactly; anything else is a placeholder)

- **Name:** Bipin A
- **Role line:** Full-stack developer building web apps, AI features and automations
- **Based in:** Bengaluru
- **Education:** BCA, K.L.E. Society's S. Nijalingappa College, Bengaluru (expected 2027)
- **Stack:** React, TypeScript, Tailwind CSS, Supabase, PostgreSQL, Python, FastAPI, Groq API, n8n, Vercel
- **GitHub:** https://github.com/bipinjr
- **Internships:** SkillCraft Technology, StaxTech, Future Interns, InternPe, CodeAlpha (full-stack and AI/ML). Show as a compact list. Mark dates and roles `[add dates/role]`.
- **Open source:** accepted into ELUSOC 2026, contributing to EduLink. Mark `[add contribution link]`.
- **Availability:** open to freelance projects and part-time roles, about 15 hours a week

Placeholders: `[your email]`, `[your WhatsApp number]`, `[LinkedIn URL]`, `[resume PDF]`, `[photo]`. Never invent metrics, users, clients or awards.

## 2. Sections (single page, scrolling)

1. **Hero:** name, role line, one short sentence on what I build, and two buttons: "View my work" and "Hire me" (scrolls to contact). Small "Available for freelance" status badge.
2. **Selected work:** 3–4 featured project cards (see section 3). Each card has: name, one-line problem, what I built, stack tags, and links (Live demo / GitHub / Case study). Missing links are hidden, not shown as broken.
3. **Services:** two clear offers.
   - **For startups:** full-stack features (React + FastAPI + Supabase), AI integrations (LLM features, parsing, agents), MVP builds.
   - **For local businesses:** websites with WhatsApp booking and enquiries, automations (reminders, updates to customers), Google Business Profile setup.
4. **Experience:** internships and open source in a compact timeline.
5. **Hackathons:** a small list of hackathons I've competed in, each with one line on what we built.
6. **Skills:** grouped as Frontend, Backend, AI, Automation, Tools. No progress bars or percentage ratings.
7. **Contact:** WhatsApp button (wa.me link with a prefilled message), email, LinkedIn, GitHub, and a downloadable resume. A simple contact form that opens WhatsApp or the email client is fine. No backend.

## 3. Projects (I will pick the final 3–4 to feature)

Create a `src/data/projects.ts` file so I can edit projects without touching components. Pre-fill it with these, marking any missing links or images as placeholders:

- **SkillMatch AI:** AI resume screener. Takes a job description and multiple resumes, extracts skills, education and experience, then scores and ranks candidates for recruiters. Stack: React, Supabase, Groq API, Vercel.
- **AI-Powered Personalized Learning Path Generator:** generates personalized learning paths for students. Stack: Groq API, YouTube Data API, Supabase, Firebase, Vercel/Render.
- **FDP certificate automation:** n8n workflow that reads participants from a sheet, overlays each name on a certificate PDF with Python (PyMuPDF), and emails it automatically. Used for a real faculty development programme.
- **KrishiVision (hackathon):** AI agriculture platform with a multi-agent pest detection system. Stack: React, Vite, Supabase.
- **ReliefReady (hackathon):** offline-first post-disaster entitlement navigator with an AI scheme-eligibility engine. Stack: React Native, FastAPI, Supabase, Groq API.
- **VibeShield (buildathon):** security copilot concept for AI-generated code.
- **Client website demo slot:** a placeholder card for a local business site, marked `[add once client approves]`.

Featured projects show as large cards. The rest go in a smaller "More projects" list.

## 4. Tech stack

- React + TypeScript + Vite + Tailwind CSS
- No backend, no database
- Static build, deployable to Vercel
- Project screenshots served from `public/images/projects/`. Use tasteful placeholders where missing.
- Basic SEO: title, meta description, Open Graph image placeholder, so links look good when shared on WhatsApp and LinkedIn.

## 5. Design direction

- Should feel **sharp, confident and builder-like**: the site of someone who ships, not a student template.
- Avoid generic portfolio clichés: no typing-animation hero, no skill progress bars, no "Hi, I'm Bipin 👋" cliché, no gradient blobs, no identical card grids with the same shadow, no all-caps eyebrow labels.
- Before coding, write a short design plan (4–6 colour hex values, 1–2 typefaces with roles, a layout sketch), check it isn't generic, then build. Support light and dark mode.
- Mobile first. Many founders and business owners will open it from a WhatsApp or LinkedIn link on their phone.
- Subtle, purposeful motion only. Respect reduced motion. Accessible contrast and focus states.

## 6. Copy guidelines

- Short, plain, confident sentences. No buzzwords like "passionate," "guru" or "ninja."
- Describe each project by the problem it solves, then the tech.
- Buttons say exactly what happens: "Message me on WhatsApp", "Email me", "Download resume".

## 7. Done when

- Runs with `npm run dev` and builds with `npm run build` without errors.
- Looks great at 375px wide and on desktop, in both light and dark mode.
- All projects come from `src/data/projects.ts`.
- Every placeholder is clearly marked, and no broken links or empty buttons appear.
- A short README explains how to edit projects and deploy to Vercel.

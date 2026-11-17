<div align="center">

<img src="docs/preview.gif" alt="Diving through dawn clouds until a floating island of sand, blush and terracotta buildings appears, with small robots at work" width="560" />

# Bipin A · a portfolio above the clouds

**Full-stack developer in Bengaluru, building websites, AI tools and automations for clients in India and abroad.**

![React](https://img.shields.io/badge/React_19-20232a?logo=react&logoColor=61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-0f172a?logo=tailwindcss&logoColor=38bdf8)
![WebGL](https://img.shields.io/badge/WebGL_clouds-b0532f)
![Web Audio](https://img.shields.io/badge/Web_Audio_sound-5b7fa6)
![Vercel](https://img.shields.io/badge/deploys_on-Vercel-000?logo=vercel)

</div>

---

## The idea

You arrive above a sea of clouds, dive through them, and a floating island appears. Every building on it is a page. Scroll and the camera flies in; hover a place and its host robot introduces it; click and you fall through the clouds into that page.

Twelve robots live here. Bipin is their boss. They fish, mop, oil the clock gears and feed the birds, and they think out loud in comic bubbles when you hover them.

## The island

| Place | Page | Host bot | Their voice |
|---|---|---|---|
| Arrival Plaza | Home | **Jr** | Cheeky sidekick, the boss's best friend |
| Bipin's House | About | **Pixel** | Warm, a little poetic, chose the curtains |
| Clock Tower | Career and schedule | **Lofi** | calm, lowercase, always knows the time |
| The Foundry | What I build | **Bolt** | Gruff foreman. Short sentences. |
| Sky Harbour | Working together | **Juno** | Straight about prices and timelines |
| Glasshouse Lab | Personal projects | **Dash** | Hackathon energy, too many tabs |
| Lighthouse | Contact | **Echo** | Radio operator. Over. |
| Bot Citadel | The crew | **Byte** | Runs operations, a bit bossy |
| Notice Pier | Privacy | **Chip** | Detective; reads the fine print |
| Observatory and Summit | Research papers, achievements | **Nova**, **Scout** | Coming soon |

## What makes it tick

- **Cloud dive:** a WebGL shader draws the clouds live (sharp at any size, nothing to download), then hands over to a Google Flow clip of the island.
- **A loop that never jumps:** the island clip plays forward and back from the frame where the entrance ends, so the camera never cuts.
- **Hotspots that follow the camera:** every place and townsbot is measured at both ends of the camera drift and slides between them.
- **Falling into pages:** clouds close in, the page changes behind them, and the clouds part again.
- **Bots with a chat box:** each host answers questions in its own voice. It runs on keyword matching against the site's real data, so it is free, instant and never makes things up.
- **Sound for free:** wind, a falling whoosh, a distant bell, birds and a waterfall that gets louder near your cursor, all synthesized with Web Audio. Off until you turn it on.
- **A cursor for every place:** a compass needle in each place's colour with its own emblem, drawn by the operating system so it never lags.
- **Day and night:** the bots switch to night-shift lines after 10 p.m. Bengaluru time.
- **Considerate:** reduced-motion visitors get stills instead of motion, no tracking or cookies, and every page has one heading and labelled controls.

<details>
<summary><b>Run it locally</b></summary>

```bash
npm install
```

```bash
npm run dev
```

```bash
npm run build
```

</details>

<details>
<summary><b>Edit the content (no component changes needed)</b></summary>

| What | File |
|---|---|
| Projects, links, screenshots | `src/data/projects.ts` |
| Email, WhatsApp, LinkedIn, resume, internships, skills, services | `src/data/profile.ts` |
| Places, host bots, townsbot dialogue | `src/data/island.ts` |
| Bot chat answers and voices | `src/data/chat.ts` |
| Bot outfits | `src/components/crew-looks.tsx` |
| Colours, fonts, cursors | `src/index.css` |

- **Island video:** `public/video/island-intro.mp4` (cloud dive, plays once) and `public/video/island-loop.mp4` (the drifting loop). Hotspot positions in `island.ts` are percentages of that frame.
- **Share image:** `public/og.jpg` (1200x630).

</details>

<details>
<summary><b>Deploy to Vercel</b></summary>

1. On vercel.com choose **Add New > Project** and import this repository.
2. Keep the defaults (framework: Vite, build: `npm run build`, output: `dist`) and deploy.

`vercel.json` sends every route to `index.html` (so links like `/work/ai-tool` open directly), caches the island videos, and adds basic security headers.

</details>

---

<div align="center">

**Have something to build?** [Send a signal from the Lighthouse](https://www.linkedin.com/in/bipinjr) · [GitHub](https://github.com/bipinjr)

</div>

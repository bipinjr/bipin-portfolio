// One-off generator: turns a real client site (cloned in _repos/) into a name-free template with sample data.
// Output source goes to templates/business-website/. Build it with:  npm run build:demos
// Nothing from the real business survives: no name, phone, address, reviews or photos.
const fs = require('fs')
const path = require('path')
const SRC = path.join(__dirname, '..', '_repos', 'gravity-dance-academy')
const OUT = path.join(__dirname, 'business-website')

fs.rmSync(OUT, { recursive: true, force: true })
fs.mkdirSync(path.join(OUT, 'public', 'images', 'sample'), { recursive: true })
fs.cpSync(path.join(SRC, 'src'), path.join(OUT, 'src'), { recursive: true })
fs.copyFileSync(path.join(SRC, 'index.html'), path.join(OUT, 'index.html'))

// ---- data: every business fact replaced with obviously made-up sample values
fs.writeFileSync(
  path.join(OUT, 'src', 'data.ts'),
  `// SAMPLE DATA. Every name, number, address and review here is made up for the template.
const B = import.meta.env.BASE_URL;
export const PHONE_DISPLAY = '+91 00000 00000';
export const TEL = '#visit';
export const WA = '#enrol';
export const waLink = (_text: string) => WA; // the real site opens WhatsApp with the message filled in
export const TRIAL_MSG = 'Hello! I would like to book a trial class.';

export const RATING = 4.8;
export const REVIEWS = 120;

export const ADDRESS = '12 Sample Road, Your Area, Bengaluru 560001';
export const LANDMARK = 'Next to the metro station';
export const MAP_EMBED = 'https://www.google.com/maps?q=Bengaluru&output=embed';
export const DIRECTIONS = '#visit';

const img = (name: string) => ({ src: \`\${B}images/sample/\${name}.svg\` });
export const IMAGES = {
  studio: img('studio'),
  family: img('inauguration'),
  storefront: img('storefront'),
  teacher: img('teacher'),
  stageShow: img('stage-show'),
  groupAct: img('group-act'),
  kids: img('kids-class'),
  branch: img('branch-opening'),
  solo: img('solo'),
  classroom: img('studio-class'),
  logo: \`\${B}images/sample/logo.svg\`,
};

export const STYLES = [
  { name: 'Western dance', line: 'Hip-hop, freestyle and film-song routines.', who: 'Kids · Teens · Adults' },
  { name: 'Bharatanatyam', line: 'Classical grace, rhythm and expression.', who: 'Kids · Teens · Adults' },
  { name: 'Gymnastics', line: 'Flips, flexibility and strength.', who: 'Kids · Teens' },
  { name: 'Zumba fitness', line: 'Dance workouts that feel like a party.', who: 'Adults' },
  { name: 'Personal training', line: 'One-on-one coaching at your pace.', who: 'All ages' },
  { name: 'Show prep', line: 'Routines and coaching for stage and TV shows.', who: 'Teens · Adults' },
];

export const BATCHES = {
  Kids: { ages: '5 to 12 years', rows: ['Weekday evenings', 'Saturday', 'Sunday'] },
  Teens: { ages: '13 to 19 years', rows: ['Weekday evenings', 'Weekend'] },
  Adults: { ages: '20 and above', rows: ['Early morning', 'Late evening', 'Weekend'] },
} as const;

export const THEMES = [
  { title: 'Stage confidence', text: 'Parents say their children now perform on any stage without fear.' },
  { title: 'Choreography they love', text: 'The lead teacher and team are named again and again for their teaching and routines.' },
  { title: 'Real chances to perform', text: 'Students get to perform at functions and shows, a real platform to show their talent.' },
];
`,
)

// ---- wording: ordered replacements across the components
const swaps = [
  ['Gravity Dance Academy', 'Sample Dance Studio'],
  ['GRAVITY GRAVITY', 'SAMPLE SAMPLE'],
  ['Shekar Master', 'Lead Teacher'],
  ['In Rajajinagar, right behind Mahakavi Kuvempu Road Metro Station.', 'In your area, right next to the metro station.'],
  ['We give you wings to fly', 'Your tagline goes here'],
  ['Bangle Bangari, live on stage at Lulu Mall', 'Annual show, live on stage'],
  ['Dance Karnataka Dance — Round 2', 'Solo performance'],
  ['KGF stage act, choreographed by Lead Teacher', 'Group stage act'],
  ['the KGF stage act', 'a stage act'],
  ['Opening day at our Hebbal branch', 'Opening day at our second branch'],
  ['Hebbal branch', 'second branch'],
  ['The Gravity family at our studio opening', 'Students and families at our studio opening'],
  ['Branch 1: Rajajinagar · Branch 2: Hebbal', 'Branch 1: Your Area · Branch 2: Second Area'],
  [' on 2nd Cross Road, Rajajinagar', ''],
  [', Rajajinagar', ''],
  ['Demo preview prepared by Bipin.', 'Sample template. Every name, number and review here is made up.'],
  ['<span className="placeholder-tag">[add bio]</span>', 'Fifteen years of teaching and stage choreography.'],
  ['[replace with real testimonials, with permission]', '[sample reviews]'],
  ['window.open(waLink(buildMessage(f)), \'_blank\', \'noopener\');', "window.location.hash = '#enrol'; // sample: the real site opens WhatsApp here"],
  ['src="/images/gravity/logo-320.webp"', 'src={`${import.meta.env.BASE_URL}images/sample/logo.svg`}'],
  ['IMAGES.shekar', 'IMAGES.teacher'],
  ['IMAGES.kgf', 'IMAGES.groupAct'],
  ['IMAGES.hebbal', 'IMAGES.branch'],
  ['Gravity', 'Sample'],
]
for (const f of fs.readdirSync(path.join(OUT, 'src')).filter((n) => n.endsWith('.tsx') || n.endsWith('.css'))) {
  const p = path.join(OUT, 'src', f)
  let t = fs.readFileSync(p, 'utf8')
  for (const [a, b] of swaps) t = t.split(a).join(b)
  fs.writeFileSync(p, t)
}

// ---- index.html: neutral title, no link-preview tags pointing at the real site
let html = fs.readFileSync(path.join(OUT, 'index.html'), 'utf8')
html = html
  .split('\n')
  .filter((l) => !/property="og:|name="twitter:|rel="preload" as="image"|Link preview card/.test(l))
  .join('\n')
  .replace(/<title>.*<\/title>/, '<title>Sample Dance Studio · template</title>')
  .replace(/<meta name="description"[^>]*>/, '<meta name="description" content="Sample business website template with WhatsApp booking." />')
  .replace('/images/gravity/logo-320.webp', '/images/sample/logo.svg')
if (!/name="robots"/.test(html)) html = html.replace('</head>', '    <meta name="robots" content="noindex, nofollow" />\n  </head>')
fs.writeFileSync(path.join(OUT, 'index.html'), html)

fs.writeFileSync(
  path.join(OUT, 'vite.config.ts'),
  `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Built into the portfolio's public folder and shown inside a frame on the Services cards.
export default defineConfig({
  base: '/demos/business-website/',
  plugins: [react(), tailwindcss()],
  build: { outDir: '../../public/demos/business-website', emptyOutDir: true },
});
`,
)

// ---- pictures: abstract stage-light scenes instead of the real photos
const hues = { studio: 42, inauguration: 28, storefront: 200, teacher: 36, 'stage-show': 18, 'group-act': 0, 'kids-class': 48, 'branch-opening': 280, solo: 320, 'studio-class': 170 }
Object.entries(hues).forEach(([name, h], n) => {
  const beams = [0, 1, 2, 3]
    .map((i) => {
      const x = 180 + i * 300 + ((n * 67) % 90)
      const spread = 170 + ((n + i) % 3) * 50
      return `<polygon points="${x},-20 ${x - spread},860 ${x + spread},860" fill="url(#b)" opacity="${0.28 + ((i + n) % 3) * 0.12}"/>`
    })
    .join('')
  fs.writeFileSync(
    path.join(OUT, 'public', 'images', 'sample', name + '.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 853" preserveAspectRatio="xMidYMid slice">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h} 40% 9%)"/><stop offset="1" stop-color="hsl(${h} 30% 3%)"/></linearGradient>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="hsl(${h} 90% 70%)"/><stop offset="1" stop-color="hsl(${h} 90% 55%)" stop-opacity="0"/></linearGradient>
<radialGradient id="f"><stop offset="0" stop-color="hsl(${h} 90% 65%)" stop-opacity=".55"/><stop offset="1" stop-color="hsl(${h} 90% 50%)" stop-opacity="0"/></radialGradient>
</defs>
<rect width="1280" height="853" fill="url(#g)"/>${beams}
<ellipse cx="640" cy="800" rx="620" ry="120" fill="url(#f)"/>
<rect y="760" width="1280" height="93" fill="hsl(${h} 30% 4%)" opacity=".7"/>
<text x="40" y="60" font-family="system-ui,sans-serif" font-size="26" fill="#fff" opacity=".5">Your photo here</text>
</svg>
`,
  )
})
fs.writeFileSync(
  path.join(OUT, 'public', 'images', 'sample', 'logo.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><circle cx="160" cy="160" r="160" fill="#0d0b08"/><circle cx="160" cy="160" r="138" fill="none" stroke="#d9a441" stroke-width="8"/><text x="160" y="212" text-anchor="middle" font-family="Georgia,serif" font-size="150" font-weight="700" fill="#d9a441">S</text></svg>\n`,
)
fs.writeFileSync(path.join(OUT, 'public', 'robots.txt'), 'User-agent: *\nDisallow: /\n')

// ---- safety net: fail loudly if anything identifying is left
const bad = /gravity|shekar|rajajinagar|kuvempu|hebbal|88677|lulu|kgf/i
const leftovers = []
const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name)
    if (e.isDirectory()) return walk(p)
    fs.readFileSync(p, 'utf8')
      .split('\n')
      .forEach((l, i) => bad.test(l) && leftovers.push(`${path.relative(OUT, p)}:${i + 1}: ${l.trim().slice(0, 110)}`))
  })
walk(OUT)
if (leftovers.length) {
  console.error('Identifying text still present:\n' + leftovers.join('\n'))
  process.exit(1)
}
console.log('template written, no identifying text left')

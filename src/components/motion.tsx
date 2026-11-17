import { Fragment, useEffect, useRef, type CSSProperties } from 'react'
import { useLocation } from 'react-router'

// Site-wide motion: a custom cursor, magnetic buttons, a few scroll reveals and
// the word-by-word headline. All of it switches off for people who ask for reduced motion.

export const calm = () => matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => matchMedia('(pointer: fine)').matches

/**
 * The cursor. A bold arrow whose tip sits exactly on the pointer (outlined, so it shows on any
 * background), plus a different moving effect on each page, drawn on one canvas:
 *   home: ember trail · work: spotlight · story: string with physics · services: liquid ink trail
 *   about: smoke puffs · contact: magnetic frame that snaps onto buttons and fields
 * Over anything clickable a pill says what will happen there. Colours follow the page and theme.
 */
const PAGES: [RegExp, string][] = [
  [/^\/work/, 'work'],
  [/^\/story/, 'story'],
  [/^\/services/, 'services'],
  [/^\/about/, 'about'],
  [/^\/contact/, 'contact'],
]
const CURSOR_PAGES: [RegExp, string][] = [...PAGES, [/^\/projects/, 'projects'], [/^\/crew/, 'crew'], [/^\/privacy/, 'privacy']]
const ROUTE_WORDS: Record<string, string> = {
  '/': 'Home',
  '/work': 'Explore',
  '/story': 'Rewind',
  '/services': 'See offers',
  '/about': 'Meet me',
  '/contact': "Let's talk",
}
const TARGETS = 'a, button, [data-cursor], input, textarea, select, label, iframe'

/** The word for an element, from its own data-cursor or from where it leads. */
function wordFor(t: HTMLElement): string {
  if (t.dataset.cursor === 'none') return '' // the element speaks for itself (e.g. island bubbles), no pill
  if (t.dataset.cursor) return t.dataset.cursor
  const href = t.getAttribute('href') ?? ''
  if (href.startsWith('https://wa.me')) return 'Message'
  if (href.startsWith('mailto:')) return 'Write'
  if (t.hasAttribute('download') || href.endsWith('.pdf')) return 'Download'
  if (href.includes('linkedin.com')) return 'Connect'
  if (href.includes('github.com')) return 'Code'
  if (/^https?:/.test(href)) return 'Open'
  if (href.startsWith('/work/')) return 'Enter'
  if (href in ROUTE_WORDS) return ROUTE_WORDS[href]
  if (t.tagName === 'BUTTON') return (t.getAttribute('aria-label') ?? t.textContent ?? '').trim().split(/\s+/).slice(0, 2).join(' ') || 'Press'
  return 'Open'
}

type P = { x: number; y: number; vx: number; vy: number; life: number; r: number; c: string }
const ROPE = 16

export function Cursor() {
  const el = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const { pathname } = useLocation()
  useEffect(() => {
    if (el.current) el.current.dataset.page = PAGES.find(([re]) => re.test(pathname))?.[1] ?? 'home'
    // the arrow itself is a system cursor (never lags); each place on the island gets its own (see index.css)
    document.documentElement.dataset.cpage = CURSOR_PAGES.find(([re]) => re.test(pathname))?.[1] ?? 'home'
  }, [pathname])

  useEffect(() => {
    if (!finePointer() || calm()) return
    document.documentElement.classList.add('has-cursor')
    const c = el.current!
    const p = pill.current!
    const cv = canvas.current!
    const g = cv.getContext('2d')!
    let W = innerWidth
    let H = innerHeight
    const fit = () => {
      W = innerWidth
      H = innerHeight
      cv.width = W * devicePixelRatio
      cv.height = H * devicePixelRatio
      g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    }
    fit()

    // palette and mode come from the page / theme / surface, re-read only when those change
    let pal: string[] = []
    let ink = '#1a1818'
    let paper = '#f2eee9'
    let glow = false
    let mode = 'home'
    const read = () => {
      const s = getComputedStyle(c)
      pal = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => s.getPropertyValue('--c' + i).trim())
      const root = getComputedStyle(document.documentElement)
      ink = root.getPropertyValue('--ink').trim() || ink
      paper = root.getPropertyValue('--paper').trim() || paper
      glow = document.documentElement.dataset.theme === 'dark' || c.classList.contains('on-dark')
      mode = c.dataset.page ?? 'home'
    }
    read()
    const watch = new MutationObserver(read)
    watch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    watch.observe(c, { attributes: true, attributeFilter: ['data-page', 'class'] })

    let x = -200
    let y = -200
    let sx = x // smoothed follower, for effects that should trail a little
    let sy = y
    let lx = x
    let ly = y
    let angle = -Math.PI * 0.75
    let shown = false
    let label = ''
    let target: HTMLElement | null = null
    let gather = 0
    let pressed = false
    let spot = 150
    const box = { x: 0, y: 0, w: 26, h: 26, r: 8 }
    const parts: P[] = []
    const rope = Array.from({ length: ROPE }, () => ({ x: -200, y: -200, px: -200, py: -200 }))
    const trail: { x: number; y: number }[] = []
    let last = performance.now()
    let raf = 0

    const pick = () => pal[2 + Math.floor(Math.random() * 6)] || '#ff8a3d'
    const emit = (ax: number, ay: number, bx: number, by: number) => {
      if (label || (mode !== 'home' && mode !== 'about')) return
      const dx = bx - ax
      const dy = by - ay
      const dist = Math.hypot(dx, dy)
      if (dist < 0.5) return
      const every = mode === 'about' ? 16 : 7
      const n = Math.min(10, Math.floor(dist / every) + (Math.random() < (dist % every) / every ? 1 : 0))
      for (let i = 0; i < n && parts.length < 280; i++) {
        const t = (i + Math.random()) / Math.max(n, 1)
        const smoke = mode === 'about'
        parts.push({
          x: ax + dx * t,
          y: ay + dy * t,
          vx: (-dx / dist) * (smoke ? 8 : 20 + Math.random() * 30) + (Math.random() - 0.5) * (smoke ? 14 : 30),
          vy: (-dy / dist) * (smoke ? 8 : 20 + Math.random() * 30) + (Math.random() - 0.5) * (smoke ? 14 : 30) - (smoke ? 10 : 18),
          life: 1,
          r: smoke ? 6 + Math.random() * 6 : 1.4 + Math.random() * 2.4,
          c: pick(),
        })
      }
    }

    const move = (e: PointerEvent) => {
      const list = e.getCoalescedEvents?.() ?? []
      for (const q of list.length ? list : [e]) {
        if (shown) emit(x, y, q.clientX, q.clientY)
        x = q.clientX
        y = q.clientY
        if (mode === 'services') trail.unshift({ x, y })
      }
      if (trail.length > 22) trail.length = 22
      if (!shown) {
        sx = lx = x
        sy = ly = y
        rope.forEach((r) => ((r.x = r.px = x), (r.y = r.py = y)))
        shown = true
        c.style.opacity = '1'
      }
      const hit = (e.target as HTMLElement).closest<HTMLElement>(TARGETS)
      const field = !!hit?.matches('iframe')
      c.dataset.hidden = field ? 'true' : 'false'
      c.classList.toggle('on-dark', !!(e.target as HTMLElement).closest('footer, [data-dark]'))
      target = hit && !field ? hit : null
      const next = target && !target.matches('input, textarea, select') ? wordFor(target) : ''
      if (next !== label) {
        label = next
        if (next) p.textContent = next
      }
    }
    const down = () => (pressed = true)
    const up = () => (pressed = false)
    const leave = () => {
      shown = false
      c.style.opacity = '0'
    }

    /** The arrow: tip at (x, y), outlined in the page colour so it reads on light and dark. */
    const arrow = (s: number) => {
      if (s < 0.02) return
      g.save()
      g.translate(x, y)
      g.rotate(angle)
      g.scale(s * 1.15, s * 1.15)
      g.beginPath()
      g.moveTo(0, 0)
      g.lineTo(-17, -7.5)
      g.lineTo(-11.5, 0)
      g.lineTo(-17, 7.5)
      g.closePath()
      g.lineJoin = 'round'
      g.lineWidth = 3
      g.strokeStyle = glow ? '#1a1818' : paper
      g.shadowColor = glow ? pal[4] : 'rgba(0,0,0,.35)'
      g.shadowBlur = glow ? 12 : 4
      g.stroke()
      g.shadowBlur = 0
      g.fillStyle = glow ? pal[2] : pal[3]
      g.fill()
      g.restore()
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const vx = x - lx
      const vy = y - ly
      lx = x
      ly = y
      const speed = Math.hypot(vx, vy)
      const want = speed > 1.2 ? Math.atan2(vy, vx) : -Math.PI * 0.75
      let d = want - angle
      d = Math.atan2(Math.sin(d), Math.cos(d))
      angle += d * (1 - Math.exp(-dt * (speed > 1.2 ? 14 : 4)))
      sx += (x - sx) * (1 - Math.exp(-dt * 12))
      sy += (y - sy) * (1 - Math.exp(-dt * 12))
      gather += ((label ? 1 : 0) - gather) * (1 - Math.exp(-dt * 16))
      const press = pressed ? 0.8 : 1

      g.clearRect(0, 0, W, H)
      if (!shown) return

      if (mode === 'work') {
        // spotlight: the page dims a little everywhere except a warm pool of light around you
        const want = target ? 230 : 160
        spot += (want - spot) * (1 - Math.exp(-dt * 6))
        const rg = g.createRadialGradient(sx, sy, spot * 0.15, sx, sy, spot)
        rg.addColorStop(0, 'rgba(255,214,150,0)')
        rg.addColorStop(1, glow ? 'rgba(0,0,0,.42)' : 'rgba(20,14,8,.22)')
        g.fillStyle = rg
        g.fillRect(0, 0, W, H)
        const warm = g.createRadialGradient(sx, sy, 0, sx, sy, spot * 0.7)
        warm.addColorStop(0, 'rgba(255,200,120,.16)')
        warm.addColorStop(1, 'rgba(255,200,120,0)')
        g.fillStyle = warm
        g.fillRect(0, 0, W, H)
      }

      if (mode === 'story') {
        // a thread: verlet rope pinned to the pointer, with gentle gravity
        rope[0].x = x
        rope[0].y = y
        for (let i = 1; i < ROPE; i++) {
          const r = rope[i]
          const nx = r.x + (r.x - r.px) * 0.94
          const ny = r.y + (r.y - r.py) * 0.94 + 260 * dt * dt
          r.px = r.x
          r.py = r.y
          r.x = nx
          r.y = ny
        }
        for (let k = 0; k < 4; k++)
          for (let i = 1; i < ROPE; i++) {
            const a = rope[i - 1]
            const b = rope[i]
            const dx = b.x - a.x
            const dy = b.y - a.y
            const dd = Math.hypot(dx, dy) || 1
            const diff = (dd - 9) / dd
            if (i > 1) {
              a.x += dx * diff * 0.5
              a.y += dy * diff * 0.5
            }
            b.x -= dx * diff * (i > 1 ? 0.5 : 1)
            b.y -= dy * diff * (i > 1 ? 0.5 : 1)
          }
        g.lineCap = 'round'
        for (let i = 1; i < ROPE - 1; i++) {
          const a = rope[i - 1]
          const b = rope[i]
          const n = rope[i + 1]
          g.strokeStyle = pal[2 + (i % 6)]
          g.globalAlpha = 1 - i / ROPE
          g.lineWidth = 3.4 * (1 - i / ROPE) + 0.8
          g.beginPath()
          g.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2)
          g.quadraticCurveTo(b.x, b.y, (b.x + n.x) / 2, (b.y + n.y) / 2)
          g.stroke()
        }
        g.globalAlpha = 1
      }

      if (mode === 'services' && trail.length > 2 && !label) {
        // liquid ink: one stroke that tapers along the recent path, so it stretches like a drop
        const ease = 1 - Math.exp(-dt * 10)
        for (let i = trail.length - 1; i > 0; i--) {
          trail[i].x += (trail[i - 1].x - trail[i].x) * ease
          trail[i].y += (trail[i - 1].y - trail[i].y) * ease
        }
        g.lineCap = 'round'
        g.strokeStyle = glow ? pal[3] : pal[2]
        for (let i = 1; i < trail.length; i++) {
          g.lineWidth = 14 * (1 - i / trail.length)
          g.beginPath()
          g.moveTo(trail[i - 1].x, trail[i - 1].y)
          g.lineTo(trail[i].x, trail[i].y)
          g.stroke()
        }
      }

      if (mode === 'contact') {
        // magnetic frame: a soft rounded box on the pointer that snaps onto what you hover
        let tx = x - 13
        let ty = y - 13
        let tw = 26
        let th = 26
        let tr = 8
        if (target && target.isConnected) {
          const r = target.getBoundingClientRect()
          tx = r.left - 6
          ty = r.top - 6
          tw = r.width + 12
          th = r.height + 12
          tr = Math.min(18, th / 2)
        }
        const k = 1 - Math.exp(-dt * 18)
        box.x += (tx - box.x) * k
        box.y += (ty - box.y) * k
        box.w += (tw - box.w) * k
        box.h += (th - box.h) * k
        box.r += (tr - box.r) * k
        g.beginPath()
        g.roundRect(box.x, box.y, box.w * press, box.h * press, box.r)
        g.fillStyle = glow ? 'rgba(143,208,214,.16)' : 'rgba(47,93,98,.10)'
        g.fill()
        g.lineWidth = 2
        g.strokeStyle = pal[3]
        g.stroke()
      }

      // embers (home) and smoke (about)
      if (parts.length) {
        g.globalCompositeOperation = glow && mode === 'home' ? 'lighter' : 'source-over'
        for (let i = parts.length - 1; i >= 0; i--) {
          const q = parts[i]
          const smoke = mode === 'about'
          q.life -= dt * (smoke ? 1.1 : 1.7)
          if (q.life <= 0) {
            parts.splice(i, 1)
            continue
          }
          q.vx *= 1 - dt * 2.2
          q.vy = q.vy * (1 - dt * 2.2) - (smoke ? 8 : 26) * dt
          q.x += q.vx * dt
          q.y += q.vy * dt
          g.globalAlpha = q.life * (smoke ? 0.22 : glow ? 1 : 0.85)
          g.fillStyle = q.c
          g.beginPath()
          g.arc(q.x, q.y, smoke ? q.r * (1.8 - q.life) : q.r * (0.4 + q.life * 0.6), 0, Math.PI * 2)
          g.fill()
        }
        g.globalAlpha = 1
        g.globalCompositeOperation = 'source-over'
      }

      void arrow // the arrow itself is now the system cursor (see .has-cursor in index.css), so it never lags behind
      void press
      p.style.transform = `translate(${x}px, ${y}px) translate(-50%, -135%) scale(${0.6 + gather * 0.4})`
      p.style.opacity = String(gather)
    }
    addEventListener('pointermove', move, { passive: true })
    addEventListener('pointerdown', down)
    addEventListener('pointerup', up)
    addEventListener('resize', fit)
    document.documentElement.addEventListener('pointerleave', leave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      watch.disconnect()
      removeEventListener('pointermove', move)
      removeEventListener('pointerdown', down)
      removeEventListener('pointerup', up)
      removeEventListener('resize', fit)
      document.documentElement.removeEventListener('pointerleave', leave)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return (
    <div ref={el} className="cursor" aria-hidden="true">
      <canvas ref={canvas} className="cursor-embers" />
      <span ref={pill} className="cursor-pill" />
    </div>
  )
}

/** Lifts the few elements marked [data-reveal] as they scroll into view. Re-scans when the page changes. */
export function useReveal() {
  const { pathname } = useLocation()
  useEffect(() => {
    if (calm()) return
    const seen = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), seen.unobserve(e.target))),
      { rootMargin: '0px 0px -8% 0px' },
    )
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in)').forEach((n) => seen.observe(n))
    scan()
    const watch = new MutationObserver(scan)
    watch.observe(document.getElementById('main')!, { childList: true, subtree: true })
    document.documentElement.classList.add('reveal-on')
    return () => {
      seen.disconnect()
      watch.disconnect()
    }
  }, [pathname])
}

/** A headline whose words rise into place one after another. Screen readers get the plain sentence. */
export function Words({ text, delay = 0, className = '' }: { text: string; delay?: number; className?: string }) {
  return (
    <span className={`words ${className}`} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <Fragment key={i}>
          {i > 0 && ' '}
          <span className="word" aria-hidden="true">
            <span style={{ '--d': `${delay + i * 60}ms` } as CSSProperties}>{w}</span>
          </span>
        </Fragment>
      ))}
    </span>
  )
}

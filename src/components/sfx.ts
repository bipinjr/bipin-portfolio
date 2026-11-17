// Sound, made in the browser with Web Audio (no files, no cost): wind for the cloud dive, a falling
// whoosh, a distant bell, bird chirps, and a waterfall that gets louder as the pointer nears it.
// Off until the visitor turns it on; the choice is remembered.

let ctx: AudioContext | null = null
let master: GainNode
let noise: AudioBuffer
let water: GainNode | null = null
let wind: GainNode | null = null
let ambient = 0

const read = () => {
  try {
    return localStorage.getItem('sound') === 'on'
  } catch {
    return false
  }
}
let enabled = read()
const listeners = new Set<(on: boolean) => void>()

/** Must run inside a click or key handler the first time (browser autoplay rule). */
function boot() {
  if (ctx) return ctx.state === 'suspended' ? void ctx.resume() : undefined
  ctx = new AudioContext()
  master = ctx.createGain()
  master.gain.value = 0.7
  master.connect(ctx.destination)
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const d = noise.getChannelData(0)
  let b = 0
  for (let i = 0; i < d.length; i++) {
    b = 0.97 * b + 0.03 * (Math.random() * 2 - 1) // soft, slightly pink noise
    d[i] = b * 4
  }
}

const noiseSource = () => {
  const s = ctx!.createBufferSource()
  s.buffer = noise
  s.loop = true
  return s
}

/** A looping filtered-noise bed (wind, waterfall) at zero volume; returns its gain to turn up. */
function bed(type: BiquadFilterType, freq: number, q = 0.7) {
  const s = noiseSource()
  const f = ctx!.createBiquadFilter()
  f.type = type
  f.frequency.value = freq
  f.Q.value = q
  const g = ctx!.createGain()
  g.gain.value = 0
  s.connect(f).connect(g).connect(master)
  s.start()
  return g
}

function startAmbient() {
  if (!ctx || water) return
  water = bed('lowpass', 1100)
  wind = bed('bandpass', 380, 0.5)
  wind.gain.setTargetAtTime(0.05, ctx.currentTime, 2)
  const later = () => {
    ambient = window.setTimeout(() => {
      if (Math.random() < 0.18) bell()
      else chirp()
      later()
    }, 5000 + Math.random() * 9000)
  }
  later()
}

function stopAmbient() {
  clearTimeout(ambient)
  water?.gain.setTargetAtTime(0, ctx!.currentTime, 0.3)
  wind?.gain.setTargetAtTime(0, ctx!.currentTime, 0.3)
  water = wind = null
}

export const sound = {
  get on() {
    return enabled
  },
  set(on: boolean) {
    enabled = on
    try {
      localStorage.setItem('sound', on ? 'on' : 'off')
    } catch {
      /* not remembered, still works */
    }
    if (on) {
      boot()
      startAmbient()
    } else if (ctx) stopAmbient()
    listeners.forEach((f) => f(on))
  },
  /** Call from a click: if sound was left on last visit, this wakes it up. */
  wake() {
    if (enabled) {
      boot()
      startAmbient()
    }
  },
  subscribe(f: (on: boolean) => void) {
    listeners.add(f)
    return () => void listeners.delete(f)
  },
}

const live = () => enabled && ctx && ctx.state === 'running'

/** Rushing air: noise through a band that sweeps from one pitch to another. */
export function whoosh(dur = 2.6, from = 250, to = 1800, level = 0.55) {
  if (!live()) return
  const t = ctx!.currentTime
  const s = noiseSource()
  const f = ctx!.createBiquadFilter()
  f.type = 'bandpass'
  f.Q.value = 0.9
  f.frequency.setValueAtTime(from, t)
  f.frequency.exponentialRampToValueAtTime(to, t + dur * 0.7)
  f.frequency.exponentialRampToValueAtTime(from, t + dur)
  const g = ctx!.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(level, t + dur * 0.6)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  s.connect(f).connect(g).connect(master)
  s.start(t)
  s.stop(t + dur + 0.1)
}

/** Dropping through the clouds: a falling whoosh with a low rumble under it. */
export function fall() {
  if (!live()) return
  whoosh(1.8, 2200, 220, 0.6)
  const t = ctx!.currentTime
  const o = ctx!.createOscillator()
  o.frequency.setValueAtTime(90, t)
  o.frequency.exponentialRampToValueAtTime(40, t + 1.6)
  const g = ctx!.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(0.18, t + 0.5)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8)
  o.connect(g).connect(master)
  o.start(t)
  o.stop(t + 1.9)
}

/** A distant tower bell: a few inharmonic partials that ring out. */
export function bell() {
  if (!live()) return
  const t = ctx!.currentTime
  const lp = ctx!.createBiquadFilter()
  lp.frequency.value = 2400
  lp.connect(master)
  for (const [ratio, level] of [[1, 0.12], [2.76, 0.05], [5.4, 0.025], [8.93, 0.012]]) {
    const o = ctx!.createOscillator()
    o.frequency.value = 330 * ratio
    const g = ctx!.createGain()
    g.gain.setValueAtTime(level, t)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 4.5 / Math.sqrt(ratio))
    o.connect(g).connect(lp)
    o.start(t)
    o.stop(t + 4.6)
  }
}

/** Two or three quick bird chirps. */
export function chirp() {
  if (!live()) return
  const n = 2 + Math.floor(Math.random() * 2)
  const base = 2600 + Math.random() * 1200
  for (let i = 0; i < n; i++) {
    const t = ctx!.currentTime + i * 0.13
    const o = ctx!.createOscillator()
    o.frequency.setValueAtTime(base, t)
    o.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.07)
    const g = ctx!.createGain()
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(0.035, t + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
    o.connect(g).connect(master)
    o.start(t)
    o.stop(t + 0.1)
  }
}

/** 0..1: how close the visitor is to the waterfall. */
export function waterfall(level: number) {
  if (water && ctx) water.gain.setTargetAtTime(0.02 + level * 0.22, ctx.currentTime, 0.25)
}

import { useEffect, useRef } from 'react'

// A fly-through of soft dawn clouds, drawn on the GPU (no video, so it is sharp at any size and costs
// nothing to load). The parent steers it through a plain object it can change at any time:
//   speed  how fast the camera moves forward
//   open   0 = clouds fill the screen, 1 = a hole has opened in the middle and everything is clear
// Values ease toward their targets, so changes always feel smooth.

export type CloudCtl = { speed: number; open: number; night: number }

const FRAG = `
precision mediump float;
uniform vec2 r; uniform float t, z, open, night;
float h(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=(gl_FragCoord.xy-.5*r)/r.y;
 vec3 top=mix(vec3(.43,.56,.72),vec3(.07,.09,.2),night), low=mix(vec3(.98,.83,.72),vec3(.32,.24,.36),night);
 vec3 col=mix(low,top,smoothstep(-.7,.8,uv.y));
 col+=mix(vec3(1.,.78,.55),vec3(.5,.55,.8),night)*.35*exp(-length(uv-vec2(-.7,.2))*2.2);
 float hole=smoothstep(open*2.4-.35,open*2.4+.25,length(uv*vec2(.8,1.)));
 for(int i=0;i<9;i++){
  float fi=float(i);
  float d=1.-fract(fi/9.+z);                 // distance to this layer: shrinks as we fly forward
  vec2 p=uv*(.35+d*3.2)+vec2(fi*7.31,fi*3.17);
  float f=fbm(p+vec2(t*.015,0.));
  float c=smoothstep(.5,.68,f);                       // puffy edges, not haze
  float sh=fbm(p+vec2(.12,.18)+vec2(t*.015,0.));      // sample toward the sun: lit tops, shaded bellies
  float lite=clamp(.55+(f-sh)*4.,0.,1.);
  vec3 day=mix(vec3(.82,.7,.72),vec3(1.,.96,.9),lite);
  vec3 dark=mix(vec3(.2,.2,.32),vec3(.6,.6,.75),lite);
  float a=smoothstep(0.,.18,d)*smoothstep(1.,.55,d);
  col=mix(col,mix(day,dark,night),c*a*.85);
 }
 gl_FragColor=vec4(col*hole,hole);
}`

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

export default function Clouds({ ctl, className = '' }: { ctl: { current: CloudCtl }; className?: string }) {
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = cv.current!
    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false })
    if (!gl) return // no WebGL: the page simply shows without clouds
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u = (k: string) => gl.getUniformLocation(prog, k)
    const [uR, uT, uZ, uOpen, uNight] = ['r', 't', 'z', 'open', 'night'].map(u)

    // soft clouds do not need full resolution; half size keeps phones cool
    const size = () => {
      const s = 0.5 * Math.min(devicePixelRatio, 1.5)
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * s))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * s))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    size()
    addEventListener('resize', size)

    const cur = { ...ctl.current }
    const vel = { speed: 0, open: 0 }
    let z = 0
    let last = performance.now()
    let raf = 0
    // a critically damped spring: starts gently, arrives gently, never overshoots (no jolt either way)
    const spring = (key: 'speed' | 'open', dt: number, w: number) => {
      const a = w * w * (ctl.current[key] - cur[key]) - 2 * w * vel[key]
      vel[key] += a * dt
      cur[key] += vel[key] * dt
    }
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const tgt = ctl.current
      spring('speed', dt, 2.4)
      spring('open', dt, 3.2)
      cur.night += (tgt.night - cur.night) * (1 - Math.exp(-dt * 2))
      z += cur.speed * dt
      if (cur.open > 0.995 && tgt.open >= 1) return void (canvas.style.visibility = 'hidden')
      canvas.style.visibility = 'visible'
      gl.uniform2f(uR, canvas.width, canvas.height)
      gl.uniform1f(uT, now / 1000)
      gl.uniform1f(uZ, z)
      gl.uniform1f(uOpen, cur.open)
      gl.uniform1f(uNight, cur.night)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', size)
    }
  }, [ctl])

  return <canvas ref={cv} className={className} aria-hidden="true" />
}

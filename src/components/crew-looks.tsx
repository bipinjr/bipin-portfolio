import type { ReactNode } from 'react'
import { PLACES, type Place } from '../data/island'

// How each host bot looks (from the outfits chosen in the crew picker) and which page they look after.
// Shapes are drawn in the picker's head box (x 10-90, y 12-58) and fitted onto the roaming bot's head.

export type Look = { shirt: string; pants: string; eye: string; badge: string; hair?: ReactNode; hat?: ReactNode; extra?: ReactNode }

const K = '#1a1818'
const hair = {
  bob: (c: string) => <path d="M12 40 C8 8 92 8 88 40 L84 40 C84 18 16 18 16 40Z" fill={c} />,
  buns: (c: string) => (
    <>
      <circle cx="22" cy="10" r="9" fill={c} />
      <circle cx="78" cy="10" r="9" fill={c} />
    </>
  ),
  pony: (c: string) => (
    <>
      <path d="M80 14 C100 18 100 46 90 58 C94 40 88 26 78 22Z" fill={c} />
      <path d="M18 16 C30 2 70 2 82 16 C60 10 40 10 18 16Z" fill={c} />
    </>
  ),
  braids: (c: string) => (
    <>
      <path d="M14 30 C6 40 8 56 12 64 M86 30 C94 40 92 56 88 64" stroke={c} strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M16 18 C30 4 70 4 84 18 C60 12 40 12 16 18Z" fill={c} />
    </>
  ),
}
const hats = {
  beret: (
    <>
      <ellipse cx="50" cy="8" rx="30" ry="9" fill="#D4537E" stroke={K} strokeWidth="1.5" />
      <circle cx="50" cy="0" r="3" fill="#D4537E" />
    </>
  ),
  hardhat: (
    <>
      <path d="M18 16 C18 -4 82 -4 82 16Z" fill="#EF9F27" stroke={K} strokeWidth="1.5" />
      <rect x="12" y="14" width="76" height="5" rx="2" fill="#BA7517" />
    </>
  ),
  headset: (
    <>
      <path d="M14 30 C14 0 86 0 86 30" stroke={K} strokeWidth="4" fill="none" />
      <rect x="8" y="26" width="10" height="16" rx="4" fill={K} />
      <path d="M14 42 Q20 54 34 52" stroke={K} strokeWidth="2" fill="none" />
    </>
  ),
  headphones: (
    <>
      <path d="M12 32 C12 -2 88 -2 88 32" stroke="#7F77DD" strokeWidth="5" fill="none" />
      <rect x="4" y="24" width="14" height="20" rx="6" fill="#7F77DD" />
      <rect x="82" y="24" width="14" height="20" rx="6" fill="#7F77DD" />
    </>
  ),
  antenna: (
    <>
      <path d="M50 12 V-2" stroke={K} strokeWidth="2" />
      <circle cx="50" cy="-4" r="4" fill="#ED93B1" />
    </>
  ),
  deerstalker: (
    <>
      <path d="M16 16 C16 -4 84 -4 84 16Z" fill="#888780" stroke={K} strokeWidth="1.5" />
      <path d="M16 16 L6 22 M84 16 L94 22" stroke="#888780" strokeWidth="5" />
    </>
  ),
}

export const LOOKS: Record<string, Look> = {
  Jr: { shirt: '#a9c4e6', pants: '#24324a', eye: '#ffb27a', badge: 'JR' },
  Pixel: {
    shirt: '#f1efe8', pants: '#5b4a52', eye: '#ffb27a', badge: 'PX', hair: hair.bob('#633806'), hat: hats.beret,
    extra: (
      <>
        <circle cx="36" cy="72" r="3" fill="#D4537E" />
        <circle cx="44" cy="84" r="2.4" fill="#378ADD" />
        <circle cx="66" cy="84" r="2.4" fill="#EF9F27" />
      </>
    ),
  },
  Lofi: { shirt: '#AFA9EC', pants: '#3c3489', eye: '#cecbf6', badge: 'LO', hair: hair.bob('#3b2a4a'), hat: hats.headphones },
  Dash: {
    shirt: '#5F5E5A', pants: '#24324a', eye: '#ffb27a', badge: 'DA',
    extra: (
      <>
        <path d="M42 58 L50 80 L58 58" stroke="#EF9F27" strokeWidth="2" fill="none" />
        <rect x="45" y="78" width="10" height="11" rx="2" fill="#fff" stroke={K} strokeWidth="1" />
      </>
    ),
  },
  Bolt: {
    shirt: '#EF9F27', pants: '#3d3a33', eye: '#ffd27a', badge: 'BT', hat: hats.hardhat,
    extra: <path d="M30 70 h40 M30 82 h40" stroke="#C0DD97" strokeWidth="3.5" />,
  },
  Juno: { shirt: '#185FA5', pants: '#2c2c2a', eye: '#ffb27a', badge: 'JU', hair: hair.braids('#412402') },
  Byte: { shirt: '#D85A30', pants: '#2c2c2a', eye: '#ffb27a', badge: 'BY', hair: hair.pony('#26215C'), hat: hats.headset },
  Echo: { shirt: '#0F6E56', pants: '#2c2c2a', eye: '#9FE1CB', badge: 'EC', hair: hair.buns('#993556'), hat: hats.antenna },
  Chip: { shirt: '#BA7517', pants: '#3d3a33', eye: '#ffd27a', badge: 'CH', hat: hats.deerstalker },
}

/** Which place (and so which host) a page belongs to. The home page and anything unknown get Jr. */
export function placeFor(path: string): Place {
  const plaza = PLACES.find((p) => p.id === 'plaza')!
  if (path === '/') return plaza
  if (path.startsWith('/work')) return PLACES.find((p) => p.id === 'foundry')!
  if (path.startsWith('/projects')) return PLACES.find((p) => p.id === 'lab')!
  return PLACES.find((p) => p.to === path) ?? plaza
}

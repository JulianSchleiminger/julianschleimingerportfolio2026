// Generatives System der Richtung „Wurf“.
// Ein Wurf = Augenzahl (wählt das Raster) + Zufallszahl (wählt Palette, Schrift, Texturen, Verschiebungen).
// Rahmenbedingungen: Palette nur aus geprüften Paaren, Fließtext immer in derselben Schrift,
// Text liegt nie direkt auf Textur, sondern auf einer Fläche in Grundfarbe.
import { concreteClouds, concretePores, fibers, grain, noise, rng, smoke, weave } from './textures';

export interface Palette {
  name: string;
  bg: string;
  fg: string;
  accent: string;
  /** Zweite Flächenfarbe für Module und Würfelseiten. */
  alt: string;
}

export const PALETTES: Palette[] = [
  { name: 'Ätzgrün', bg: '#d4f53c', fg: '#101010', accent: '#2c2cff', alt: '#9fbf1f' },
  { name: 'Ultramarin', bg: '#1d27c9', fg: '#f2f0e8', accent: '#ff7ad1', alt: '#0e1478' },
  { name: 'Rohbeton', bg: '#b9b6ae', fg: '#121212', accent: '#ff4a00', alt: '#8d8a83' },
  { name: 'Nacht', bg: '#0f0f10', fg: '#ecebe5', accent: '#c9ff1f', alt: '#2a2a2c' },
  { name: 'Lachs', bg: '#ffb19e', fg: '#1a0f2e', accent: '#0047ff', alt: '#e98670' },
  { name: 'Ochsenblut', bg: '#4a0d12', fg: '#f3e9e4', accent: '#ffb000', alt: '#2c0609' },
  { name: 'Kreide', bg: '#e9e8e3', fg: '#151515', accent: '#e4002b', alt: '#cfcdc6' },
];

export interface DisplayFont {
  name: string;
  family: string;
  weight: number;
  style: 'normal' | 'italic';
  upper: boolean;
  tracking: string;
  leading: number;
  /** Größenfaktor, damit breite und schmale Schriften ähnlich viel Fläche füllen. */
  scale: number;
  axes: string;
}

export const FONTS: DisplayFont[] = [
  { name: 'Bodoni Moda', family: "'Bodoni Moda Variable', serif", weight: 800, style: 'italic', upper: false, tracking: '-0.03em', leading: 0.88, scale: 1, axes: "'opsz' 96" },
  { name: 'Big Shoulders', family: "'Big Shoulders Display Variable', sans-serif", weight: 900, style: 'normal', upper: true, tracking: '0em', leading: 0.82, scale: 1.25, axes: 'normal' },
  { name: 'Unbounded', family: "'Unbounded Variable', sans-serif", weight: 800, style: 'normal', upper: false, tracking: '-0.05em', leading: 0.92, scale: 0.72, axes: 'normal' },
  { name: 'Archivo Expanded', family: "'Archivo Variable', sans-serif", weight: 900, style: 'normal', upper: true, tracking: '-0.02em', leading: 0.86, scale: 0.74, axes: "'wdth' 125" },
  { name: 'Bricolage Condensed', family: "'Bricolage Grotesque Variable', sans-serif", weight: 800, style: 'normal', upper: true, tracking: '-0.02em', leading: 0.84, scale: 1.05, axes: "'wdth' 75" },
  { name: 'Alfa Slab', family: "'Alfa Slab One', serif", weight: 400, style: 'normal', upper: false, tracking: '-0.02em', leading: 0.9, scale: 0.8, axes: 'normal' },
  { name: 'Courier Prime', family: "'Courier Prime', monospace", weight: 700, style: 'normal', upper: false, tracking: '-0.06em', leading: 0.9, scale: 0.78, axes: 'normal' },
];

export const TEXTURE_NAMES = ['Korn', 'Beton', 'Faser', 'Rauch', 'Gewebe', 'Raster'] as const;
export type TextureName = (typeof TEXTURE_NAMES)[number];

/** CSS-Hintergrund für eine Textur auf einer Grundfarbe. */
export function texture(name: TextureName, seed: number, ink: string, base: string) {
  switch (name) {
    case 'Korn':
      return `${grain(seed, ink, 0.55)}, ${base}`;
    case 'Beton':
      return `${concretePores(seed, ink)}, ${concreteClouds(seed, ink)}, ${grain(seed + 3, ink, 0.3)}, ${base}`;
    case 'Faser':
      return `${fibers(seed, ink)}, ${grain(seed + 1, ink, 0.25)}, ${base}`;
    case 'Rauch':
      return `${smoke(seed, ink)}, ${base}`;
    case 'Gewebe':
      return `${weave(seed, ink)}, ${base}`;
    case 'Raster':
      return `radial-gradient(circle, ${ink} 0 34%, transparent 36%) 0 0 / 9px 9px, ${noise({ freq: '0.01', octaves: 3, seed, color: ink, gain: 0.6, bias: -0.25 })}, ${base}`;
  }
}

export const LAYOUT_NAMES = ['Raster', 'Treppe', 'Kollision', 'Säule', 'Streuung', 'Monument'] as const;

export interface Module {
  col: number;
  span: number;
  /** Versatz nach oben/unten in rem, erzeugt Überlappungen. */
  shift: number;
  rotate: number;
  /** 0 scharf, 1 leicht, 2 weit hinten: steuert Unschärfe und Parallaxe. */
  depth: 0 | 1 | 2;
  texture: TextureName;
  surface: 'bg' | 'alt' | 'accent';
}

type Rand = () => number;
const pick = <T,>(r: Rand, list: readonly T[]) => list[Math.floor(r() * list.length)];
const between = (r: Rand, a: number, b: number) => a + r() * (b - a);

function layoutFor(face: number, count: number, r: Rand): Pick<Module, 'col' | 'span' | 'shift' | 'rotate' | 'depth'>[] {
  return Array.from({ length: count }, (_, i) => {
    const depth = pick(r, [0, 0, 1, 2] as const);
    switch (face) {
      case 1: // Raster: drei Spalten, ruhig
        return { col: 1 + (i % 3) * 4, span: 4, shift: 0, rotate: 0, depth: 0 };
      case 2: // Treppe: diagonal absteigend
        return { col: 1 + ((i * 3) % 8), span: 5, shift: (i % 3) * 3, rotate: 0, depth };
      case 3: // Kollision: große Module, die sich überlappen
        return { col: i % 2 ? 6 : 1, span: 7, shift: i ? -6 : 0, rotate: between(r, -4, 4), depth };
      case 4: // Säule: schmale Mitte, Ausreißer
        return i % 3 === 2 ? { col: 1, span: 12, shift: 0, rotate: 0, depth: 0 } : { col: i % 2 ? 7 : 4, span: 4, shift: 0, rotate: 0, depth };
      case 5: // Streuung
        return { col: 1 + Math.floor(r() * 8), span: pick(r, [3, 4, 5]), shift: between(r, -3, 5), rotate: between(r, -8, 8), depth };
      default: // Monument: groß und klein im Wechsel
        return i % 2 ? { col: pick(r, [1, 9]), span: 4, shift: -10, rotate: 0, depth: 0 } : { col: pick(r, [1, 3]), span: 10, shift: 0, rotate: 0, depth };
    }
  });
}

export interface Edition {
  seed: number;
  face: number;
  layout: string;
  palette: Palette;
  font: DisplayFont;
  texture: TextureName;
  modules: Module[];
  /** Verschiebung der Namenszeilen, in vw. */
  nameShift: number;
  nameTilt: number;
}

export function roll(seed: number, face: number, count: number): Edition {
  const r = rng(seed);
  const palette = pick(r, PALETTES);
  const font = pick(r, FONTS);
  const tex = pick(r, TEXTURE_NAMES);
  const layout = layoutFor(face, count, r);
  return {
    seed,
    face,
    layout: LAYOUT_NAMES[face - 1],
    palette,
    font,
    texture: tex,
    nameShift: between(r, -3, 6),
    nameTilt: pick(r, [0, 0, -3, 2]),
    modules: layout.map((m) => ({ ...m, texture: pick(r, TEXTURE_NAMES), surface: pick(r, ['bg', 'alt', 'accent'] as const) })),
  };
}

/** Würfelseiten: welche Drehung zeigt welche Augenzahl nach vorn. */
export const FACE_ROTATION: Record<number, [number, number]> = {
  1: [0, 0],
  6: [0, 180],
  3: [0, -90],
  4: [0, 90],
  2: [-90, 0],
  5: [90, 0],
};

/** Augen je Seite als Positionen im 3×3-Raster (1–9, zeilenweise). */
export const PIPS: Record<number, number[]> = {
  1: [5],
  2: [1, 9],
  3: [1, 5, 9],
  4: [1, 3, 7, 9],
  5: [1, 3, 5, 7, 9],
  6: [1, 3, 4, 6, 7, 9],
};

const surfaceColor = (ed: Edition, s: Module['surface']) =>
  s === 'bg' ? ed.palette.bg : s === 'alt' ? ed.palette.alt : ed.palette.accent;

/** Tinte, die auf einer Fläche gut sichtbar ist. */
const inkFor = (ed: Edition, s: Module['surface']) => (s === 'accent' ? ed.palette.bg : ed.palette.fg);

/** CSS-Variablen für die ganze Seite. */
export function rootVars(ed: Edition): Record<string, string> {
  const { palette: p, font: f } = ed;
  return {
    '--bg': p.bg,
    '--fg': p.fg,
    '--accent': p.accent,
    '--alt': p.alt,
    '--d-family': f.family,
    '--d-weight': String(f.weight),
    '--d-style': f.style,
    '--d-case': f.upper ? 'uppercase' : 'none',
    '--d-tracking': f.tracking,
    '--d-leading': String(f.leading),
    '--d-scale': String(f.scale),
    '--d-axes': f.axes,
    '--page-texture': texture(ed.texture, ed.seed, p.fg, 'transparent'),
    '--name-shift': `${ed.nameShift.toFixed(2)}vw`,
    '--name-tilt': `${ed.nameTilt}deg`,
  };
}

export function moduleVars(ed: Edition, m: Module, i: number): Record<string, string> {
  const base = surfaceColor(ed, m.surface);
  return {
    '--col': String(m.col),
    '--span': String(Math.min(m.span, 13 - m.col)),
    '--shift': `${m.shift.toFixed(2)}rem`,
    '--rot': `${m.rotate.toFixed(2)}deg`,
    '--depth': String(m.depth),
    '--tex': texture(m.texture, ed.seed + i * 13, inkFor(ed, m.surface), base),
  };
}

/** Würfelseite k (1–6): jede Seite trägt eine andere Textur des aktuellen Wurfs. */
export function faceVars(ed: Edition, k: number): Record<string, string> {
  const surfaces: Module['surface'][] = ['bg', 'alt', 'accent'];
  const s = surfaces[k % 3];
  return {
    '--face': texture(TEXTURE_NAMES[(k + ed.seed) % TEXTURE_NAMES.length], ed.seed + k, inkFor(ed, s), surfaceColor(ed, s)),
    '--pip': inkFor(ed, s),
  };
}

export const toStyle = (vars: Record<string, string>) =>
  Object.entries(vars)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');

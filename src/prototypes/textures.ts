// Prozedurale Texturen als SVG-Data-URIs. Laufen im Build (Astro) und im Browser (Würfel).
// Alles entsteht aus feTurbulence, es gibt keine Bilddateien.

const svg = (w: number, h: number, body: string, extra = '') =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'${extra}>${body}</svg>`,
  )}")`;

const hex = (c: string) => {
  const n = parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => (v / 255).toFixed(3));
};

interface NoiseOptions {
  freq: string;
  octaves?: number;
  seed?: number;
  type?: 'fractalNoise' | 'turbulence';
  color?: string;
  /** Alpha = gain * Rauschwert + bias. Steuert Dichte und Härte. */
  gain?: number;
  bias?: number;
  size?: number;
}

/** Einfarbiges Rauschen mit transparentem Grund, zum Überlagern auf einer Fläche. */
export function noise({ freq, octaves = 3, seed = 1, type = 'fractalNoise', color = '#000000', gain = 1, bias = 0, size = 320 }: NoiseOptions) {
  const [r, g, b] = hex(color);
  return svg(
    size,
    size,
    `<filter id='n' x='0' y='0' width='100%' height='100%'><feTurbulence type='${type}' baseFrequency='${freq}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${r} 0 0 0 0 ${g} 0 0 0 0 ${b} ${gain} 0 0 0 ${bias}'/></filter><rect width='100%' height='100%' filter='url(#n)'/>`,
  );
}

/** Feines Filmkorn. */
export const grain = (seed = 1, color = '#000000', strength = 0.5) =>
  noise({ freq: '0.85', octaves: 2, seed, color, gain: strength * 1.6, bias: -strength * 0.55, size: 220 });

/** Betonflecken: großflächige Wolken plus Poren. */
export const concreteClouds = (seed = 1, color = '#000000') =>
  noise({ freq: '0.008', octaves: 5, seed, color, gain: 0.9, bias: -0.3, size: 600 });

export const concretePores = (seed = 1, color = '#000000') =>
  noise({ freq: '0.55', octaves: 1, seed, type: 'turbulence', color, gain: -6, bias: 1.6, size: 260 });

/** Papierfasern: gestreckte Turbulenz. */
export const fibers = (seed = 1, color = '#000000') =>
  noise({ freq: '0.004 0.22', octaves: 4, seed, type: 'turbulence', color, gain: 1.1, bias: -0.45, size: 400 });

/** Rauch und Marmor. */
export const smoke = (seed = 1, color = '#000000') =>
  noise({ freq: '0.006', octaves: 6, seed, type: 'turbulence', color, gain: 1.4, bias: -0.35, size: 700 });

/** Gewebe aus zwei sich kreuzenden Fadenrichtungen. */
export const weave = (seed = 1, color = '#000000') =>
  svg(
    160,
    160,
    `<filter id='w'><feTurbulence type='fractalNoise' baseFrequency='0.02 0.9' numOctaves='2' seed='${seed}' result='a'/><feTurbulence type='fractalNoise' baseFrequency='0.9 0.02' numOctaves='2' seed='${seed + 7}' result='b'/><feBlend in='a' in2='b' mode='multiply'/><feColorMatrix values='0 0 0 0 ${hex(color)[0]} 0 0 0 0 ${hex(color)[1]} 0 0 0 0 ${hex(color)[2]} 2.2 0 0 0 -0.75'/></filter><rect width='100%' height='100%' filter='url(#w)'/>`,
  );

/** Maske mit gerissener Kante: weiße Fläche, deren Rand durch Rauschen verschoben wird. */
export const tornMask = (seed = 1, w = 400, h = 300, depth = 14) =>
  svg(
    w,
    h,
    `<filter id='t' x='-5%' y='-5%' width='110%' height='110%'><feTurbulence type='fractalNoise' baseFrequency='0.045' numOctaves='4' seed='${seed}'/><feDisplacementMap in='SourceGraphic' scale='${depth}' xChannelSelector='R' yChannelSelector='G'/></filter><rect x='${depth}' y='${depth}' width='${w - depth * 2}' height='${h - depth * 2}' fill='white' filter='url(#t)'/>`,
    " preserveAspectRatio='none'",
  );

/** Kleiner deterministischer Zufallsgenerator, damit ein Wurf reproduzierbar bleibt. */
export function rng(seed: number) {
  // Startwert streuen und einige Runden verwerfen, damit nahe Startwerte verschiedene Folgen liefern.
  let s = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) >>> 0 || 1;
  for (let i = 0; i < 8; i++) {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
  }
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

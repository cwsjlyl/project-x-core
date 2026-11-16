import type { StageId } from './Stages';

/** Left edge + tile count for a row of upward spikes sitting on a surface. */
export interface SpikeSpec {
  x: number;
  /** World Y of the surface the spikes sit on (usually the ground top, 234). */
  surfaceY: number;
  count: number;
}

export interface MoverSpec {
  x: number;
  y: number;
  w: number;
  h: number;
  axis: 'x' | 'y';
  min: number;
  max: number;
  speed: number;
}

/** Falling pinecones / icicles that telegraph, drop, then reset. */
export interface FallerSpec {
  x: number;
  y: number;
  period: number;
  delay: number;
  kind: 'pinecone' | 'icicle';
}

/** Snap-plant that is safe while open and hurts while shut. */
export interface ChomperSpec {
  x: number;
  surfaceY: number;
  period: number;
  openMs: number;
  delay: number;
}

/** Slippery ice patch on the ground. */
export interface IceSpec {
  x: number;
  surfaceY: number;
  width: number;
}

/** Sinking sand that slows walking. */
export interface SandSpec {
  x: number;
  surfaceY: number;
  width: number;
}

/** Periodic heat or tide burst from the ground. */
export interface VentSpec {
  x: number;
  surfaceY: number;
  period: number;
  burstMs: number;
  delay: number;
  kind: 'heat' | 'tide';
}

export interface StageHazards {
  spikes: SpikeSpec[];
  movers: MoverSpec[];
  fallers: FallerSpec[];
  chompers: ChomperSpec[];
  ice: IceSpec[];
  sands: SandSpec[];
  vents: VentSpec[];
}

const GROUND = 234;

function spike(x: number, count: number, surfaceY = GROUND): SpikeSpec {
  return { x, surfaceY, count };
}

function moverX(x: number, y: number, min: number, max: number, speed = 42, w = 54): MoverSpec {
  return { x, y, w, h: 12, axis: 'x', min, max, speed };
}

function moverY(x: number, y: number, min: number, max: number, speed = 34, w = 54): MoverSpec {
  return { x, y, w, h: 12, axis: 'y', min, max, speed };
}

function emptyExtras(): Pick<StageHazards, 'fallers' | 'chompers' | 'ice' | 'sands' | 'vents'> {
  return { fallers: [], chompers: [], ice: [], sands: [], vents: [] };
}

/**
 * Classroom-friendly hazard layouts. Spikes are short groups that a -400 jump
 * can clear; movers travel slowly with a clearly visible path. Biome traps are
 * telegraphed and leave a clear walking gap. Nothing blocks stations, the
 * spawn, or the boss door.
 */
export const STAGE_HAZARDS: Record<StageId, StageHazards> = {
  beach: {
    spikes: [
      spike(240, 2),
      spike(486, 2),
      spike(702, 3),
      spike(954, 3),
      spike(1386, 3),
      spike(2040, 3)
    ],
    movers: [
      moverX(780, 204, 740, 940, 44),
      moverX(1140, 168, 1062, 1242, 40),
      moverY(1860, 200, 140, 214, 32),
      moverX(1764, 190, 1710, 1872, 40)
    ],
    ...emptyExtras(),
    vents: [
      { x: 420, surfaceY: GROUND, period: 2800, burstMs: 700, delay: 200, kind: 'tide' },
      { x: 1188, surfaceY: GROUND, period: 3000, burstMs: 700, delay: 900, kind: 'tide' }
    ]
  },
  forest: {
    spikes: [
      spike(258, 2),
      spike(504, 3),
      spike(720, 2),
      spike(972, 3),
      spike(1602, 3),
      spike(1998, 2)
    ],
    movers: [
      moverX(800, 206, 748, 948, 40),
      moverX(1170, 162, 1080, 1278, 38),
      moverY(1836, 198, 132, 214, 30),
      moverX(2052, 186, 1980, 2142, 40)
    ],
    ...emptyExtras(),
    fallers: [
      { x: 420, y: 70, period: 3200, delay: 0, kind: 'pinecone' },
      { x: 1100, y: 58, period: 3400, delay: 800, kind: 'pinecone' },
      { x: 1700, y: 64, period: 3000, delay: 1400, kind: 'pinecone' }
    ],
    chompers: [
      { x: 448, surfaceY: GROUND, period: 2600, openMs: 1500, delay: 0 },
      { x: 1488, surfaceY: GROUND, period: 2800, openMs: 1500, delay: 600 }
    ]
  },
  polar: {
    spikes: [
      spike(222, 3),
      spike(468, 2),
      spike(684, 3),
      spike(990, 2),
      spike(1422, 3),
      spike(2070, 3)
    ],
    movers: [
      moverX(820, 202, 750, 950, 36),
      moverX(1116, 174, 1044, 1230, 36),
      moverY(1692, 196, 136, 214, 28),
      moverX(1930, 188, 1860, 2040, 38)
    ],
    ...emptyExtras(),
    ice: [
      { x: 600, surfaceY: GROUND, width: 90 },
      { x: 1200, surfaceY: GROUND, width: 108 }
    ],
    fallers: [
      { x: 420, y: 52, period: 3000, delay: 200, kind: 'icicle' },
      { x: 1320, y: 48, period: 3200, delay: 900, kind: 'icicle' },
      { x: 1884, y: 56, period: 2800, delay: 400, kind: 'icicle' }
    ]
  },
  desert: {
    spikes: [
      spike(276, 2),
      spike(522, 3),
      spike(710, 2),
      spike(936, 3),
      spike(1512, 2),
      spike(2016, 3)
    ],
    movers: [
      moverX(790, 208, 742, 946, 46),
      moverX(1200, 166, 1116, 1300, 42),
      moverY(1782, 200, 138, 214, 34),
      moverX(2106, 184, 2016, 2190, 42)
    ],
    ...emptyExtras(),
    sands: [
      { x: 660, surfaceY: GROUND, width: 90 },
      { x: 1680, surfaceY: GROUND, width: 108 }
    ],
    vents: [
      { x: 246, surfaceY: GROUND, period: 2600, burstMs: 800, delay: 0, kind: 'heat' },
      { x: 1080, surfaceY: GROUND, period: 2800, burstMs: 800, delay: 700, kind: 'heat' },
      { x: 1860, surfaceY: GROUND, period: 3000, burstMs: 800, delay: 400, kind: 'heat' }
    ]
  }
};

export const SPIKE_TINT: Record<StageId, number> = {
  beach: 0xc45a4a,
  forest: 0x3d7a48,
  polar: 0x9ed4f0,
  desert: 0xd4893a
};

export const MOVER_TINT: Record<StageId, number> = {
  beach: 0xc8a060,
  forest: 0x6a9a4a,
  polar: 0xb8d8ea,
  desert: 0xd2a05a
};

export const SPIKE_DAMAGE = 16;
export const TRAP_DAMAGE = 12;

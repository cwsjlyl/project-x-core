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

export interface StageHazards {
  spikes: SpikeSpec[];
  movers: MoverSpec[];
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

/**
 * Classroom-friendly hazard layouts. Spikes are short groups that a -400 jump
 * can clear; movers travel slowly with a clearly visible path. Nothing blocks
 * stations, the spawn, or the boss door.
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

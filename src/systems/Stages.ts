export type StageId = 'beach' | 'forest' | 'polar' | 'desert';
export type BossTheme = 'crab' | 'owl' | 'bear' | 'lizard';
export type EnemyKind =
  | 'crab'
  | 'gull'
  | 'puppy'
  | 'squirrel'
  | 'owl'
  | 'fox'
  | 'penguin'
  | 'seal'
  | 'cub'
  | 'lizard'
  | 'fennec'
  | 'scorpion';

export interface StageDef {
  id: StageId;
  name: string;
  mapKey: string;
  tilesetKey: string;
  bgSky: string;
  bgFar: string;
  bgMid: string;
  bgProp?: string;
  bgPropX: number;
  bgPropY: number;
  animalKey: string;
  defaultKinds: [EnemyKind, EnemyKind, EnemyKind];
  bossName: string;
  bossTexture: string;
  bossTheme: BossTheme;
  bossMaxHp: number;
  rewardId: string;
  rewardName: string;
  next: StageId | null;
  requiresStations: boolean;
  intro: string;
}

export const STAGES: Record<StageId, StageDef> = {
  beach: {
    id: 'beach',
    name: '陽光沙灘',
    mapKey: 'stage1',
    tilesetKey: 'industrial',
    bgSky: 'bg_sky',
    bgFar: 'bg_far',
    bgMid: 'bg_mid',
    bgProp: 'bg_sun',
    bgPropX: 400,
    bgPropY: 48,
    animalKey: 'animals',
    defaultKinds: ['crab', 'gull', 'puppy'],
    bossName: '潮汐巨蟹',
    bossTexture: 'boss',
    bossTheme: 'crab',
    bossMaxHp: 600,
    rewardId: 'helm_thunder',
    rewardName: '潮汐甲盔',
    next: 'forest',
    requiresStations: true,
    intro: '陽光沙灘　—　要完成全部學習站才可挑戰首領'
  },
  forest: {
    id: 'forest',
    name: '翠影森林',
    mapKey: 'stage2',
    tilesetKey: 'tiles_forest',
    bgSky: 'bg_sky_forest',
    bgFar: 'bg_far_forest',
    bgMid: 'bg_mid_forest',
    bgPropX: 400,
    bgPropY: 48,
    animalKey: 'animals_forest',
    defaultKinds: ['squirrel', 'owl', 'fox'],
    bossName: '翠葉巨梟',
    bossTexture: 'boss_forest',
    bossTheme: 'owl',
    bossMaxHp: 640,
    rewardId: 'body_leaf',
    rewardName: '翠葉胸甲',
    next: 'polar',
    requiresStations: false,
    intro: '翠影森林　—　小心林間小動物，再挑戰翠葉巨梟'
  },
  polar: {
    id: 'polar',
    name: '霜白極地',
    mapKey: 'stage3',
    tilesetKey: 'tiles_polar',
    bgSky: 'bg_sky_polar',
    bgFar: 'bg_far_polar',
    bgMid: 'bg_mid_polar',
    bgProp: 'bg_moon_polar',
    bgPropX: 80,
    bgPropY: 40,
    animalKey: 'animals_polar',
    defaultKinds: ['penguin', 'seal', 'cub'],
    bossName: '霜原巨熊',
    bossTexture: 'boss_polar',
    bossTheme: 'bear',
    bossMaxHp: 680,
    rewardId: 'arms_frost',
    rewardName: '霜牙手臂',
    next: 'desert',
    requiresStations: false,
    intro: '霜白極地　—　踏過冰雪，再挑戰霜原巨熊'
  },
  desert: {
    id: 'desert',
    name: '炎陽沙漠',
    mapKey: 'stage4',
    tilesetKey: 'tiles_desert',
    bgSky: 'bg_sky_desert',
    bgFar: 'bg_far_desert',
    bgMid: 'bg_mid_desert',
    bgProp: 'bg_sun_desert',
    bgPropX: 400,
    bgPropY: 42,
    animalKey: 'animals_desert',
    defaultKinds: ['lizard', 'fennec', 'scorpion'],
    bossName: '炎砂巨蜥',
    bossTexture: 'boss_desert',
    bossTheme: 'lizard',
    bossMaxHp: 720,
    rewardId: 'legs_sand',
    rewardName: '炎砂腿甲',
    next: null,
    requiresStations: false,
    intro: '炎陽沙漠　—　最後一關，挑戰炎砂巨蜥'
  }
};

export const STAGE_ORDER: StageId[] = ['beach', 'forest', 'polar', 'desert'];

export function isStageId(value: string | null | undefined): value is StageId {
  return value === 'beach' || value === 'forest' || value === 'polar' || value === 'desert';
}

export function animKeyFor(kind: EnemyKind): string {
  return `animal-${kind}`;
}

export const FLYING_KINDS: ReadonlySet<EnemyKind> = new Set(['gull', 'owl']);

export { UI_FONT, UI_SIZE_BODY, UI_SIZE_TITLE } from './systems/UiText';

export const WORLD = {
  tile: 18,
  width: 2880,
  height: 270
} as const;

/** Display name of the beach boss (original animal, not official Mega Man). */
export const BOSS_NAME = '潮汐巨蟹';

export const STAGE_NAMES = {
  beach: '陽光沙灘',
  forest: '翠影森林',
  polar: '霜白極地',
  desert: '炎陽沙漠'
} as const;

export const BOSS_NAMES = {
  beach: '潮汐巨蟹',
  forest: '翠葉巨梟',
  polar: '霜原巨熊',
  desert: '炎砂巨蜥'
} as const;

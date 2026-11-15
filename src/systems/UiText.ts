import Phaser from 'phaser';

/** Fusion Pixel Font (OFL). Use only 12px body or 24px titles for crisp pixel scaling. */
export const UI_FONT = '"Fusion Pixel"';
export const UI_SIZE_BODY = 12;
export const UI_SIZE_TITLE = 24;

const SHADOW: Phaser.Types.GameObjects.Text.TextShadow = {
  offsetX: 1,
  offsetY: 1,
  color: '#000000',
  blur: 0,
  fill: true,
  stroke: false
};

export interface UiTextOpts {
  size?: 12 | 24;
  color?: string;
  align?: 'left' | 'center' | 'right';
  wordWrap?: number;
  shadow?: boolean;
  originX?: number;
  originY?: number;
}

export function uiTextStyle(opts: UiTextOpts = {}): Phaser.Types.GameObjects.Text.TextStyle {
  const size = opts.size ?? UI_SIZE_BODY;
  const style: Phaser.Types.GameObjects.Text.TextStyle = {
    fontFamily: UI_FONT,
    fontSize: `${size}px`,
    color: opts.color ?? '#e8fbff',
    align: opts.align ?? 'left',
    resolution: 1
  };
  if (opts.wordWrap) {
    style.wordWrap = { width: opts.wordWrap };
  }
  if (opts.shadow !== false) {
    style.shadow = SHADOW;
  }
  return style;
}

export function addUiText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  opts: UiTextOpts = {}
): Phaser.GameObjects.Text {
  const obj = scene.add.text(x, y, text, uiTextStyle(opts));
  obj.setResolution(1);
  if (opts.originX !== undefined || opts.originY !== undefined) {
    obj.setOrigin(opts.originX ?? 0, opts.originY ?? 0);
  }
  return obj;
}

export async function waitForUiFonts(): Promise<void> {
  const fonts = document.fonts;
  if (!fonts) return;
  const sample = 'Project X-Core 蒼藍核心 學習站 科學分 聲動齊心合力';
  try {
    await Promise.all([
      fonts.load(`12px ${UI_FONT}`, sample),
      fonts.load(`24px ${UI_FONT}`, sample),
      fonts.ready
    ]);
  } catch {
    /* continue with whatever is available */
  }
}

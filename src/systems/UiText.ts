import Phaser from 'phaser';

/** Baked Fusion Pixel 12px (OFL) bitmap atlas. Titles use integer 2× (24px). */
export const UI_FONT = 'fusion-12';
export const UI_SIZE_BODY = 12;
export const UI_SIZE_TITLE = 24;

export type UiSize = 12 | 24;

export interface UiTextOpts {
  size?: UiSize;
  color?: string;
  align?: 'left' | 'center' | 'right';
  wordWrap?: number;
  shadow?: boolean;
  originX?: number;
  originY?: number;
}

export function colorToTint(color: string): number {
  const c = color.trim();
  if (c.startsWith('#')) {
    const h = c.slice(1);
    if (h.length === 3) {
      return parseInt(h[0] + h[0] + h[1] + h[1] + h[2] + h[2], 16);
    }
    return parseInt(h.slice(0, 6), 16);
  }
  return 0xffffff;
}

/**
 * Crisp pixel UI label: bitmap glyphs + a 1px black drop shadow.
 * Do not use Phaser Text / system fonts for in-game UI.
 */
export class UiText extends Phaser.GameObjects.Container {
  readonly fill: Phaser.GameObjects.BitmapText;
  readonly shadow: Phaser.GameObjects.BitmapText;
  private ox = 0;
  private oy = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, opts: UiTextOpts = {}) {
    super(scene, Math.round(x), Math.round(y));
    const size = opts.size ?? UI_SIZE_BODY;
    const useShadow = opts.shadow !== false;

    this.shadow = scene.make.bitmapText({
      x: useShadow ? 1 : 0,
      y: useShadow ? 1 : 0,
      font: UI_FONT,
      text,
      size,
      add: false
    });
    this.shadow.setTint(0x000000);
    this.shadow.setVisible(useShadow);

    this.fill = scene.make.bitmapText({
      x: 0,
      y: 0,
      font: UI_FONT,
      text,
      size,
      add: false
    });
    this.fill.setTint(colorToTint(opts.color ?? '#e8fbff'));

    if (opts.align === 'center') {
      this.fill.setCenterAlign();
      this.shadow.setCenterAlign();
    } else if (opts.align === 'right') {
      this.fill.setRightAlign();
      this.shadow.setRightAlign();
    } else {
      this.fill.setLeftAlign();
      this.shadow.setLeftAlign();
    }
    if (opts.wordWrap) {
      this.fill.setMaxWidth(opts.wordWrap);
      this.shadow.setMaxWidth(opts.wordWrap);
    }

    this.ox = opts.originX ?? 0;
    this.oy = opts.originY ?? 0;
    this.fill.setOrigin(this.ox, this.oy);
    this.shadow.setOrigin(this.ox, this.oy);
    this.add([this.shadow, this.fill]);
    this.syncHitArea();
    scene.add.existing(this);
  }

  private syncHitArea(): void {
    const w = Math.max(1, this.fill.width);
    const h = Math.max(1, this.fill.height);
    this.setSize(w, h);
    const hx = -w * this.ox;
    const hy = -h * this.oy;
    if (this.input?.hitArea && this.input.hitArea instanceof Phaser.Geom.Rectangle) {
      this.input.hitArea.setTo(hx, hy, w, h);
    }
  }

  setText(value: string): this {
    this.fill.setText(value);
    this.shadow.setText(value);
    this.syncHitArea();
    return this;
  }

  get text(): string {
    return this.fill.text;
  }

  setColor(color: string): this {
    this.fill.setTint(colorToTint(color));
    return this;
  }

  setTint(tint?: number, ..._rest: number[]): this {
    if (tint !== undefined) this.fill.setTint(tint);
    return this;
  }

  setOrigin(x: number, y?: number): this {
    this.ox = x;
    this.oy = y ?? x;
    this.fill.setOrigin(this.ox, this.oy);
    this.shadow.setOrigin(this.ox, this.oy);
    this.syncHitArea();
    return this;
  }

  setInteractive(
    hitArea?: Phaser.Types.Input.InputConfiguration | object,
    callback?: Phaser.Types.Input.HitAreaCallback,
    dropZone?: boolean
  ): this {
    const w = Math.max(1, this.fill.width);
    const h = Math.max(1, this.fill.height);
    const rect = new Phaser.Geom.Rectangle(-w * this.ox, -h * this.oy, w, h);
    if (hitArea && typeof hitArea === 'object' && !callback && 'useHandCursor' in hitArea) {
      super.setInteractive(rect, Phaser.Geom.Rectangle.Contains, dropZone);
      if (this.input && (hitArea as { useHandCursor?: boolean }).useHandCursor) {
        this.input.cursor = 'pointer';
      }
      return this;
    }
    if (hitArea === undefined) {
      super.setInteractive(rect, Phaser.Geom.Rectangle.Contains);
      return this;
    }
    super.setInteractive(hitArea, callback, dropZone);
    return this;
  }

  setMaxWidth(width: number): this {
    this.fill.setMaxWidth(width);
    this.shadow.setMaxWidth(width);
    this.syncHitArea();
    return this;
  }
}

export function addUiText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  opts: UiTextOpts = {}
): UiText {
  return new UiText(scene, x, y, text, opts);
}

export async function waitForUiFonts(): Promise<void> {
  return;
}

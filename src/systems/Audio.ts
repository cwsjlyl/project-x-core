import Phaser from 'phaser';
import { addUiText, type UiText } from './UiText';

export const SFX_KEYS = [
  'jump',
  'dash',
  'shoot',
  'shoot3',
  'hit',
  'boss_hit',
  'hurt',
  'die',
  'pickup',
  'roar',
  'win',
  'correct',
  'wrong',
  'ui'
] as const;

export type SfxKey = (typeof SFX_KEYS)[number];

const STORAGE_KEY = 'xcore-muted';

export function preloadSfx(scene: Phaser.Scene): void {
  for (const key of SFX_KEYS) {
    scene.load.audio(`sfx-${key}`, `assets/sfx/${key}.wav`);
  }
}

/**
 * Original CC0 8-bit SFX helper. Mute is global (Phaser sound.mute)
 * and remembered in localStorage. Safe to call before bind(); plays are no-ops.
 */
export class GameAudio {
  private scene: Phaser.Scene | null = null;
  private muted = false;
  private unlocked = false;
  private muteBg: Phaser.GameObjects.Arc | null = null;
  private muteLabel: UiText | null = null;
  private readonly listeners = new Set<(muted: boolean) => void>();

  get isMuted(): boolean {
    return this.muted;
  }

  bind(scene: Phaser.Scene): void {
    this.scene = scene;
    this.muted = this.readMuted();
    scene.sound.mute = this.muted;
    const unlock = (): void => this.unlock();
    scene.input.on('pointerdown', unlock);
    scene.input.keyboard?.on('keydown', unlock);
    const keyM = scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.M);
    keyM?.on('down', () => this.toggle());
  }

  attachMuteButton(scene: Phaser.Scene, x = 408, y = 46): void {
    const bg = scene.add
      .circle(x, y, 20, 0x225566, 0.32)
      .setStrokeStyle(1, 0x8a7a70, 0.4)
      .setScrollFactor(0)
      .setDepth(2000)
      .setInteractive({ useHandCursor: true });
    const label = addUiText(scene, x, y, this.muted ? '靜' : '音', {
      size: 12,
      color: '#f0e4d4',
      originX: 0.5,
      originY: 0.5
    })
      .setScrollFactor(0)
      .setDepth(2001);
    bg.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      ptr.event.preventDefault?.();
      this.toggle();
    });
    this.muteBg = bg;
    this.muteLabel = label;
    this.refreshButton();
  }

  play(key: SfxKey, volume = 0.45): void {
    const scene = this.scene;
    if (!scene || this.muted) return;
    const cacheKey = `sfx-${key}`;
    if (!scene.cache.audio.exists(cacheKey)) return;
    try {
      this.unlock();
      scene.sound.play(cacheKey, { volume });
    } catch {
      // Autoplay or missing buffer should never break gameplay.
    }
  }

  toggle(): void {
    const next = !this.muted;
    if (next) {
      // Click first, then silence.
      const scene = this.scene;
      if (scene && scene.cache.audio.exists('sfx-ui')) {
        try {
          scene.sound.mute = false;
          scene.sound.play('sfx-ui', { volume: 0.4 });
        } catch {
          /* ignore */
        }
      }
      this.setMuted(true);
    } else {
      this.setMuted(false);
      this.play('ui');
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.scene) this.scene.sound.mute = muted;
    try {
      localStorage.setItem(STORAGE_KEY, muted ? '1' : '0');
    } catch {
      /* ignore */
    }
    this.refreshButton();
    this.emit();
  }

  onChange(fn: (muted: boolean) => void): () => void {
    this.listeners.add(fn);
    fn(this.muted);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn(this.muted);
  }

  private unlock(): void {
    if (this.unlocked || !this.scene) return;
    this.unlocked = true;
    try {
      this.scene.sound.unlock();
    } catch {
      /* ignore */
    }
  }

  private refreshButton(): void {
    if (this.muteLabel) this.muteLabel.setText(this.muted ? '靜' : '音');
    if (this.muteBg) this.muteBg.setFillStyle(0x225566, this.muted ? 0.55 : 0.32);
  }

  private readMuted(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  }
}

export const gameAudio = new GameAudio();

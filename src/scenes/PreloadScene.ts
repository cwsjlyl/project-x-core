import Phaser from 'phaser';
import { addUiText, waitForUiFonts } from '../systems/UiText';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload(): void {
    const { width, height } = this.cameras.main;
    const title = addUiText(this, width / 2, height / 2 - 32, 'Project X-Core  蒼藍核心', {
      size: 24,
      color: '#7ef0ff',
      originX: 0.5,
      originY: 0.5
    });
    const barBg = this.add.rectangle(width / 2, height / 2, 240, 12, 0x1a2639);
    const barFill = this.add.rectangle(width / 2 - 118, height / 2, 0, 8, 0x00e5ff).setOrigin(0, 0.5);
    const hint = addUiText(this, width / 2, height / 2 + 22, '載入中…', {
      size: 12,
      color: '#9ad6e0',
      originX: 0.5,
      originY: 0.5
    });

    this.load.on('progress', (value: number) => {
      barFill.width = 236 * value;
    });

    this.load.once('complete', () => {
      barBg.destroy();
      barFill.destroy();
      title.destroy();
      hint.destroy();
    });

    this.load.tilemapTiledJSON('stage1', 'assets/maps/stage1.json');
    this.load.image('industrial', 'assets/tiles/industrial.png');
    this.load.spritesheet('player', 'assets/sprites/player.png', {
      frameWidth: 48,
      frameHeight: 64
    });
  }

  create(): void {
    this.bakePixelTextures();
    this.createPlayerAnims();
    void this.startWhenReady();
  }

  private async startWhenReady(): Promise<void> {
    await waitForUiFonts();
    this.scene.start('GameScene');
  }

  private createPlayerAnims(): void {
    if (!this.textures.exists('player')) return;
    const mk = (
      key: string,
      frames: Phaser.Types.Animations.AnimationFrame[] | { start: number; end?: number },
      frameRate: number,
      repeat: number
    ): void => {
      if (this.anims.exists(key)) return;
      const list = Array.isArray(frames)
        ? frames
        : this.anims.generateFrameNumbers('player', { start: frames.start, end: frames.end ?? frames.start });
      this.anims.create({ key, frames: list, frameRate, repeat });
    };
    mk('player-idle', { start: 0, end: 1 }, 4, -1);
    mk('player-walk', { start: 2, end: 3 }, 8, -1);
    mk('player-jump', [{ key: 'player', frame: 4 }], 1, -1);
    mk('player-dash', [{ key: 'player', frame: 5 }], 1, -1);
    mk('player-shoot', [{ key: 'player', frame: 6 }], 1, -1);
    mk('player-wall', [{ key: 'player', frame: 7 }], 1, -1);
  }

  /** Bake original pixel textures into the Texture Manager (no ripped sprites). */
  private bakePixelTextures(): void {
    const g = this.make.graphics({ x: 0, y: 0 });

    // 1. Azure hunter (20x26)
    g.fillStyle(0x0088ff);
    g.fillRect(4, 2, 12, 10);
    g.fillStyle(0xff2a55);
    g.fillRect(13, 4, 3, 3);
    g.fillStyle(0xffe0bd);
    g.fillRect(10, 6, 5, 5);
    g.fillStyle(0x00bbff);
    g.fillRect(5, 12, 10, 8);
    g.fillStyle(0x0055cc);
    g.fillRect(13, 13, 7, 5);
    g.fillStyle(0x0066dd);
    g.fillRect(4, 20, 5, 6);
    g.fillStyle(0x0066dd);
    g.fillRect(11, 20, 5, 6);
    g.fillStyle(0x0a1a2a);
    g.fillRect(12, 7, 2, 2);
    g.generateTexture('player_tex', 20, 26);
    g.clear();

    // 2. Fallback baked tile (unused if Kenney sheet loads, kept for safety)
    g.fillStyle(0x1b2838);
    g.fillRect(0, 0, 32, 32);
    g.fillStyle(0x2c425c);
    g.fillRect(0, 0, 32, 4);
    g.fillStyle(0x00e5ff);
    g.fillRect(2, 2, 10, 2);
    g.lineStyle(1, 0x101824);
    g.strokeRect(0, 0, 32, 32);
    g.generateTexture('tile_tex', 32, 32);
    g.clear();

    // 3. Buster bolt (12x8)
    g.fillStyle(0x00ffff);
    g.fillRect(0, 1, 12, 6);
    g.fillStyle(0xffffff);
    g.fillRect(3, 2, 7, 4);
    g.generateTexture('buster_tex', 12, 8);
    g.clear();

    // 4. Patrol sentry (22x22)
    g.fillStyle(0xd9383a);
    g.fillRect(2, 4, 18, 14);
    g.fillStyle(0xffcc00);
    g.fillRect(4, 8, 6, 4);
    g.fillStyle(0x4a5568);
    g.fillRect(4, 18, 14, 4);
    g.fillStyle(0x1a1020);
    g.fillRect(14, 8, 4, 4);
    g.generateTexture('enemy_tex', 22, 22);
    g.clear();

    // 5. Thunder Rhino boss (64x48) — original animal-mech
    g.fillStyle(0x3a4658);
    g.fillRect(14, 16, 40, 22);
    g.fillStyle(0x2a3344);
    g.fillRect(10, 20, 10, 16);
    g.fillStyle(0x4a586c);
    g.fillRect(16, 12, 28, 12);
    // legs
    g.fillStyle(0x2c3546);
    g.fillRect(18, 36, 10, 12);
    g.fillRect(38, 36, 10, 12);
    g.fillStyle(0x1a222e);
    g.fillRect(16, 44, 14, 4);
    g.fillRect(36, 44, 14, 4);
    // head / snout
    g.fillStyle(0x505c70);
    g.fillRect(4, 18, 16, 14);
    g.fillStyle(0x2a3344);
    g.fillRect(2, 22, 8, 8);
    // horn
    g.fillStyle(0xffe066);
    g.fillRect(0, 14, 10, 5);
    g.fillStyle(0xfff3a0);
    g.fillRect(0, 15, 6, 3);
    g.fillStyle(0x66f0ff);
    g.fillRect(1, 16, 4, 1);
    // eye
    g.fillStyle(0xff2244);
    g.fillRect(12, 20, 5, 4);
    g.fillStyle(0xffffff);
    g.fillRect(14, 21, 2, 2);
    // shoulder plates + bolts
    g.fillStyle(0x6a788c);
    g.fillRect(22, 10, 14, 8);
    g.fillRect(38, 12, 12, 8);
    g.fillStyle(0x9aa8b8);
    g.fillRect(24, 12, 3, 3);
    g.fillRect(40, 14, 3, 3);
    // electric trim
    g.fillStyle(0x33e0ff);
    g.fillRect(20, 28, 18, 2);
    g.fillRect(48, 24, 2, 10);
    g.generateTexture('boss_tex', 64, 48);
    g.clear();

    // 6. Boss projectiles
    g.fillStyle(0xffe066);
    g.fillRect(1, 2, 10, 4);
    g.fillStyle(0xffffff);
    g.fillRect(3, 3, 6, 2);
    g.generateTexture('boss_bolt_tex', 12, 8);
    g.clear();

    g.fillStyle(0xff66ee);
    g.fillCircle(6, 6, 6);
    g.fillStyle(0xffffff);
    g.fillCircle(6, 6, 3);
    g.generateTexture('boss_orb_tex', 12, 12);
    g.clear();

    g.fillStyle(0xffcc33);
    g.fillRect(0, 2, 16, 4);
    g.fillStyle(0xffffff);
    g.fillRect(2, 3, 12, 2);
    g.generateTexture('boss_shock_tex', 16, 8);
    g.clear();

    // 7. Pickup capsule
    g.fillStyle(0x102030);
    g.fillRect(2, 1, 10, 12);
    g.fillStyle(0x44f0ff);
    g.fillRect(3, 2, 8, 10);
    g.fillStyle(0xffffff);
    g.fillRect(5, 4, 4, 3);
    g.generateTexture('pickup_tex', 14, 14);
    g.clear();

    // 8. Arena door block
    g.fillStyle(0x2a3340);
    g.fillRect(0, 0, 18, 18);
    g.fillStyle(0xffcc44);
    g.fillRect(0, 7, 18, 4);
    g.fillStyle(0x10141a);
    g.fillRect(0, 8, 18, 2);
    g.generateTexture('door_block_tex', 18, 18);
    g.clear();

    // 9. Science learning station kiosk
    g.fillStyle(0x1a2433);
    g.fillRect(2, 6, 14, 18);
    g.fillStyle(0x2c3d52);
    g.fillRect(3, 7, 12, 10);
    g.fillStyle(0x33e0ff);
    g.fillRect(4, 9, 10, 6);
    g.fillStyle(0xffffff);
    g.fillRect(6, 11, 6, 2);
    g.fillStyle(0x0a1a2a);
    g.fillRect(0, 22, 18, 2);
    g.fillStyle(0xffe066);
    g.fillRect(8, 4, 2, 2);
    g.generateTexture('station_tex', 18, 24);
    g.destroy();
  }
}

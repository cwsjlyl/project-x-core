import Phaser from 'phaser';
import { addUiText, waitForUiFonts } from '../systems/UiText';
import { ensureLookTexture } from '../systems/HeroLook';
import { preloadSfx } from '../systems/Audio';

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
    this.load.tilemapTiledJSON('stage2', 'assets/maps/stage2.json');
    this.load.tilemapTiledJSON('stage3', 'assets/maps/stage3.json');
    this.load.tilemapTiledJSON('stage4', 'assets/maps/stage4.json');
    this.load.image('industrial', 'assets/tiles/industrial.png');
    this.load.image('tiles_forest', 'assets/tiles/forest.png');
    this.load.image('tiles_polar', 'assets/tiles/polar.png');
    this.load.image('tiles_desert', 'assets/tiles/desert.png');
    this.load.image('bg_sky', 'assets/bg/sky.png');
    this.load.image('bg_far', 'assets/bg/far.png');
    this.load.image('bg_mid', 'assets/bg/mid.png');
    this.load.image('bg_sun', 'assets/bg/sun.png');
    this.load.image('bg_sky_forest', 'assets/bg/sky_forest.png');
    this.load.image('bg_far_forest', 'assets/bg/far_forest.png');
    this.load.image('bg_mid_forest', 'assets/bg/mid_forest.png');
    this.load.image('bg_sky_polar', 'assets/bg/sky_polar.png');
    this.load.image('bg_far_polar', 'assets/bg/far_polar.png');
    this.load.image('bg_mid_polar', 'assets/bg/mid_polar.png');
    this.load.image('bg_moon_polar', 'assets/bg/moon_polar.png');
    this.load.image('bg_sky_desert', 'assets/bg/sky_desert.png');
    this.load.image('bg_far_desert', 'assets/bg/far_desert.png');
    this.load.image('bg_mid_desert', 'assets/bg/mid_desert.png');
    this.load.image('bg_sun_desert', 'assets/bg/sun_desert.png');
    this.load.image('hud_frame', 'assets/ui/hud_frame.png');
    this.load.image('hud_badge', 'assets/ui/hud_badge.png');
    this.load.image('spark_tex', 'assets/ui/spark.png');
    this.load.image('muzzle_tex', 'assets/ui/muzzle.png');
    this.load.image('lightning_tex', 'assets/ui/lightning.png');
    this.load.spritesheet('player', 'assets/sprites/player.png', {
      frameWidth: 48,
      frameHeight: 64
    });
    const gearIds = [
      'helm_starter', 'helm_scout', 'helm_thunder',
      'body_starter', 'body_energy', 'body_leaf',
      'arms_starter', 'arms_rapid', 'arms_frost',
      'legs_starter', 'legs_airdash', 'legs_sand'
    ];
    for (const id of gearIds) {
      this.load.spritesheet(`gear_${id}`, `assets/sprites/gear/${id}.png`, {
        frameWidth: 48,
        frameHeight: 64
      });
    }
    this.load.spritesheet('animals', 'assets/sprites/animals.png', {
      frameWidth: 24,
      frameHeight: 24
    });
    this.load.spritesheet('animals_forest', 'assets/sprites/animals_forest.png', {
      frameWidth: 24,
      frameHeight: 24
    });
    this.load.spritesheet('animals_polar', 'assets/sprites/animals_polar.png', {
      frameWidth: 24,
      frameHeight: 24
    });
    this.load.spritesheet('animals_desert', 'assets/sprites/animals_desert.png', {
      frameWidth: 24,
      frameHeight: 24
    });
    this.load.image('boss', 'assets/sprites/boss.png');
    this.load.image('boss_forest', 'assets/sprites/boss_forest.png');
    this.load.image('boss_polar', 'assets/sprites/boss_polar.png');
    this.load.image('boss_desert', 'assets/sprites/boss_desert.png');
    preloadSfx(this);
  }

  create(): void {
    this.bakePixelTextures();
    ensureLookTexture(this);
    this.createPlayerAnims();
    this.createAnimalAnims();
    void this.startWhenReady();
  }

  private async startWhenReady(): Promise<void> {
    await waitForUiFonts();
    this.scene.start('GameScene');
  }

  private createPlayerAnims(): void {
    const sheet = this.textures.exists('player_look') ? 'player_look' : 'player';
    if (!this.textures.exists(sheet)) return;
    const mk = (
      key: string,
      frames: Phaser.Types.Animations.AnimationFrame[] | { start: number; end?: number },
      frameRate: number,
      repeat: number
    ): void => {
      if (this.anims.exists(key)) return;
      const list = Array.isArray(frames)
        ? frames
        : this.anims.generateFrameNumbers(sheet, { start: frames.start, end: frames.end ?? frames.start });
      this.anims.create({ key, frames: list, frameRate, repeat });
    };
    mk('player-idle', { start: 0, end: 1 }, 4, -1);
    mk('player-walk', { start: 2, end: 3 }, 8, -1);
    mk('player-jump', [{ key: sheet, frame: 4 }], 1, -1);
    mk('player-dash', [{ key: sheet, frame: 5 }], 1, -1);
    mk('player-shoot', [{ key: sheet, frame: 6 }], 1, -1);
    mk('player-wall', [{ key: sheet, frame: 7 }], 1, -1);
  }

  private createAnimalAnims(): void {
    const mk = (sheet: string, key: string, start: number, end: number): void => {
      if (!this.textures.exists(sheet) || this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(sheet, { start, end }),
        frameRate: 4,
        repeat: -1
      });
    };
    mk('animals', 'animal-crab', 0, 1);
    mk('animals', 'animal-gull', 2, 3);
    mk('animals', 'animal-puppy', 4, 5);
    mk('animals_forest', 'animal-squirrel', 0, 1);
    mk('animals_forest', 'animal-owl', 2, 3);
    mk('animals_forest', 'animal-fox', 4, 5);
    mk('animals_polar', 'animal-penguin', 0, 1);
    mk('animals_polar', 'animal-seal', 2, 3);
    mk('animals_polar', 'animal-cub', 4, 5);
    mk('animals_desert', 'animal-lizard', 0, 1);
    mk('animals_desert', 'animal-fennec', 2, 3);
    mk('animals_desert', 'animal-scorpion', 4, 5);
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

    // 3. Buster bolts — distinct charge tiers (original pixel art)
    // Lv1: small bright pellet + short trail
    g.fillStyle(0x3aa0c8);
    g.fillRect(0, 3, 3, 2);
    g.fillStyle(0x66e8ff);
    g.fillRect(2, 2, 5, 4);
    g.fillStyle(0xffffff);
    g.fillRect(5, 3, 5, 2);
    g.fillRect(8, 2, 3, 4);
    g.generateTexture('buster_lv1_tex', 12, 8);
    g.generateTexture('buster_tex', 12, 8);
    g.clear();

    // Lv2: larger bolt
    g.fillStyle(0x2a88b0);
    g.fillRect(0, 3, 4, 2);
    g.fillStyle(0x5ce8ff);
    g.fillRect(3, 2, 8, 4);
    g.fillStyle(0xffffff);
    g.fillRect(7, 2, 7, 4);
    g.fillStyle(0xd8ffff);
    g.fillRect(10, 1, 5, 6);
    g.fillStyle(0xffffff);
    g.fillRect(13, 3, 3, 2);
    g.generateTexture('buster_lv2_tex', 16, 8);
    g.clear();

    // Lv3: fat bright shot + longer trail
    g.fillStyle(0x1a6a90);
    g.fillRect(0, 5, 6, 2);
    g.fillStyle(0x3ecfff);
    g.fillRect(4, 3, 8, 6);
    g.fillStyle(0x66ffff);
    g.fillRect(10, 2, 8, 8);
    g.fillStyle(0xffffff);
    g.fillRect(14, 3, 7, 6);
    g.fillStyle(0xe8ffff);
    g.fillRect(17, 4, 4, 4);
    g.fillStyle(0xffffff);
    g.fillRect(19, 5, 3, 2);
    g.generateTexture('buster_lv3_tex', 22, 12);
    g.clear();

    // Unarmed default pellet (weaker / simpler)
    g.fillStyle(0x7ab0d0);
    g.fillRect(0, 2, 2, 2);
    g.fillStyle(0xc8e8ff);
    g.fillRect(2, 1, 5, 4);
    g.fillStyle(0xffffff);
    g.fillRect(4, 2, 3, 2);
    g.generateTexture('buster_pellet_tex', 8, 6);
    g.clear();

    // Short afterimage crumb
    g.fillStyle(0x66e8ff, 0.9);
    g.fillRect(0, 1, 8, 3);
    g.fillStyle(0xffffff, 0.7);
    g.fillRect(3, 1, 4, 3);
    g.generateTexture('buster_trail_tex', 8, 5);
    g.clear();

    // Stronger muzzle flash (overwrites loaded PNG)
    g.fillStyle(0xfff3b0);
    g.fillRect(0, 4, 3, 4);
    g.fillStyle(0xffffff);
    g.fillRect(2, 3, 6, 6);
    g.fillStyle(0x66ffff);
    g.fillRect(7, 2, 6, 8);
    g.fillStyle(0xffffff);
    g.fillRect(8, 4, 8, 4);
    g.fillStyle(0x9af0ff);
    g.fillRect(14, 5, 5, 2);
    g.generateTexture('muzzle_tex', 20, 12);
    g.clear();

    // Impact burst
    g.fillStyle(0xfff0a0);
    g.fillRect(7, 0, 2, 16);
    g.fillRect(0, 7, 16, 2);
    g.fillStyle(0xffffff);
    g.fillRect(6, 6, 4, 4);
    g.fillStyle(0x66ffff);
    g.fillRect(2, 2, 2, 2);
    g.fillRect(12, 2, 2, 2);
    g.fillRect(2, 12, 2, 2);
    g.fillRect(12, 12, 2, 2);
    g.fillStyle(0xffe080);
    g.fillRect(4, 4, 2, 2);
    g.fillRect(10, 4, 2, 2);
    g.fillRect(4, 10, 2, 2);
    g.fillRect(10, 10, 2, 2);
    g.generateTexture('spark_tex', 16, 16);
    g.clear();

    // 4. Fallback patrol (22x22), used only if the animal sheet is missing
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

    // 5. Fallback boss (64x48), used only if the beach-crab sprite is missing
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
    // extra original shading (still a rhino-mech, not a copied boss)
    g.fillStyle(0x5a6878);
    g.fillRect(24, 18, 16, 2);
    g.fillStyle(0x1a222e);
    g.fillRect(16, 30, 8, 2);
    g.fillRect(40, 32, 10, 2);
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
    g.clear();

    // Small-enemy projectiles
    g.fillStyle(0xe8c070);
    g.fillCircle(5, 5, 5);
    g.fillStyle(0xfff3c0);
    g.fillCircle(5, 5, 2);
    g.generateTexture('enemy_shot_tex', 10, 10);
    g.destroy();

    this.bakeTransparentTextures();
  }

  /** Canvas textures with a real alpha channel (Graphics.generateTexture often leaves a black square). */
  private bakeTransparentTextures(): void {
    const canvas = (key: string, w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) => {
      if (this.textures.exists(key)) this.textures.remove(key);
      const tex = this.textures.createCanvas(key, w, h);
      if (!tex) return;
      const ctx = tex.getContext();
      ctx.clearRect(0, 0, w, h);
      ctx.imageSmoothingEnabled = false;
      draw(ctx);
      tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
      tex.refresh();
    };

    canvas('aura_tex', 32, 32, (ctx) => {
      ctx.save();
      ctx.globalAlpha = 0.45;
      ctx.strokeStyle = '#88fff8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(16, 16, 12, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.25;
      ctx.beginPath();
      ctx.arc(16, 16, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
      // a few spark dots, no filled disc (avoids a solid block when tinted)
      ctx.fillStyle = 'rgba(200, 255, 255, 0.7)';
      ctx.fillRect(16, 3, 1, 2);
      ctx.fillRect(16, 27, 1, 2);
      ctx.fillRect(3, 16, 2, 1);
      ctx.fillRect(27, 16, 2, 1);
    });

    canvas('shield_tex', 48, 48, (ctx) => {
      ctx.strokeStyle = 'rgba(120, 230, 255, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(24, 24, 16, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(100, 220, 255, 0.06)';
      ctx.beginPath();
      ctx.arc(24, 24, 15, 0, Math.PI * 2);
      ctx.fill();
    });

    canvas('spike_tex', 18, 16, (ctx) => {
      const spike = (x0: number) => {
        ctx.fillStyle = '#5a2a24';
        ctx.beginPath();
        ctx.moveTo(x0, 16);
        ctx.lineTo(x0 + 4, 1);
        ctx.lineTo(x0 + 8, 16);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#e8d0b0';
        ctx.fillRect(x0 + 3, 2, 2, 8);
      };
      spike(1);
      spike(9);
      ctx.fillStyle = '#3a2018';
      ctx.fillRect(0, 14, 18, 2);
    });

    canvas('mover_tex', 54, 12, (ctx) => {
      ctx.fillStyle = '#3a2a1c';
      ctx.fillRect(0, 0, 54, 12);
      ctx.fillStyle = '#c8a060';
      ctx.fillRect(1, 1, 52, 10);
      ctx.fillStyle = '#ead09a';
      ctx.fillRect(1, 1, 52, 2);
      ctx.fillStyle = '#8a6a38';
      ctx.fillRect(1, 9, 52, 2);
      for (const x of [8, 20, 32, 44]) {
        ctx.fillStyle = '#6a4a28';
        ctx.fillRect(x, 3, 4, 6);
        ctx.fillStyle = '#ffe8b0';
        ctx.fillRect(x + 1, 4, 2, 2);
      }
    });

    canvas('door_sign_tex', 110, 42, (ctx) => {
      ctx.fillStyle = 'rgba(12, 18, 28, 0.9)';
      ctx.fillRect(0, 0, 110, 42);
      ctx.strokeStyle = '#e8c04a';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 108, 40);
      ctx.fillStyle = '#e8c04a';
      ctx.fillRect(6, 10, 8, 22);
      ctx.fillRect(8, 8, 4, 4);
      ctx.fillStyle = '#1a1208';
      ctx.fillRect(9, 18, 3, 4);
    });

    canvas('door_sign_open_tex', 110, 42, (ctx) => {
      ctx.fillStyle = 'rgba(8, 32, 22, 0.9)';
      ctx.fillRect(0, 0, 110, 42);
      ctx.strokeStyle = '#66ffaa';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, 108, 40);
      ctx.fillStyle = '#66ffaa';
      ctx.fillRect(6, 10, 8, 22);
      ctx.fillStyle = '#0a2018';
      ctx.fillRect(12, 18, 4, 8);
    });
  }
}

import Phaser from 'phaser';

/** Load the baked Fusion Pixel bitmap font before any UI text is created. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload(): void {
    this.load.bitmapFont('fusion-12', 'fonts/fusion-12.png', 'fonts/fusion-12.xml');
  }

  create(): void {
    if (this.textures.exists('fusion-12')) {
      this.textures.get('fusion-12').setFilter(Phaser.Textures.FilterMode.NEAREST);
    }
    this.scene.start('PreloadScene');
  }
}

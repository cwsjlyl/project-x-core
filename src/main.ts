import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 480,
  height: 270,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: '#5ec8ee',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 900 },
      fps: 60,
      debug: false
    }
  },
  input: {
    activePointers: 5
  },
  scene: [BootScene, PreloadScene, GameScene]
};

const game = new Phaser.Game(config);

declare global {
  interface Window {
    __xcoreGame?: Phaser.Game;
  }
}
window.__xcoreGame = game;

import Phaser from 'phaser';
import { addUiText } from './UiText';
import type { GameInput } from './GameInput';

interface PadBtn {
  bg: Phaser.GameObjects.Arc;
  label: Phaser.GameObjects.Text;
  key: keyof GameInput['touch'];
}

/** On-screen D-pad and action buttons, fixed to the camera (iPad Safari). */
export class TouchControls {
  private readonly buttons: PadBtn[] = [];
  private readonly root: Phaser.GameObjects.Container;
  private hidden = false;

  constructor(
    scene: Phaser.Scene,
    private readonly gameInput: GameInput
  ) {
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(800);
    this.makeBtn(scene, 28, 234, '左', 'left');
    this.makeBtn(scene, 74, 234, '右', 'right');
    this.makeBtn(scene, 356, 234, '跳', 'jump');
    this.makeBtn(scene, 406, 234, '射', 'shoot');
    this.makeBtn(scene, 456, 234, '衝', 'dash');
    this.makeBtn(scene, 456, 46, '裝', 'equip', 0x225566);
  }

  private makeBtn(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    key: keyof GameInput['touch'],
    color = 0x123044
  ): void {
    const bg = scene.add
      .circle(x, y, 20, color, 0.55)
      .setStrokeStyle(1, 0x7ad7ff, 0.7)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    const label = addUiText(scene, x, y, text, {
      size: 12,
      color: '#e8fbff',
      originX: 0.5,
      originY: 0.5
    }).setScrollFactor(0);
    this.root.add([bg, label]);

    const press = (down: boolean) => {
      this.gameInput.touch[key] = down;
      bg.setFillStyle(color, down ? 0.9 : 0.55);
      bg.setScale(down ? 0.92 : 1);
    };

    bg.on('pointerdown', (ptr: Phaser.Input.Pointer) => {
      ptr.event.preventDefault?.();
      press(true);
    });
    bg.on('pointerup', () => press(false));
    bg.on('pointerout', () => press(false));
    bg.on('pointerupoutside', () => press(false));
    this.buttons.push({ bg, label, key });
  }

  setPaused(paused: boolean): void {
    // Keep the equipment button usable while the menu is open.
    for (const btn of this.buttons) {
      if (btn.key === 'equip') continue;
      btn.bg.setVisible(!paused);
      btn.label.setVisible(!paused);
      if (paused) this.gameInput.touch[btn.key] = false;
    }
  }

  setVisible(visible: boolean): void {
    this.hidden = !visible;
    this.root.setVisible(visible);
    if (!visible) {
      (Object.keys(this.gameInput.touch) as (keyof GameInput['touch'])[]).forEach((k) => {
        this.gameInput.touch[k] = false;
      });
    }
  }

  destroy(): void {
    this.root.destroy(true);
    void this.hidden;
  }
}

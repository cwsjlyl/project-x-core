import Phaser from 'phaser';
import type { Player } from '../entities/Player';
import type { ScienceProgress } from './ScienceBank';
import { addUiText } from './UiText';

/** Original slim left-side HUD. Inspired by classic handheld action games, not official art. */
export class GameHud {
  private hpFill!: Phaser.GameObjects.Rectangle;
  private coreFill!: Phaser.GameObjects.Rectangle;
  private lvText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;

  private readonly frameX = 5;
  private readonly frameY = 26;
  private readonly wellTop = 12;
  private readonly wellH = 64;
  private readonly wellW = 6;
  private readonly hpWellX = 3;
  private readonly coreWellX = 14;

  constructor(private readonly scene: Phaser.Scene) {}

  create(): void {
    const s = this.scene;
    const depth = 200;

    const hpX = this.frameX + this.hpWellX;
    const coreX = this.frameX + this.coreWellX;
    const wellBottom = this.frameY + this.wellTop + this.wellH;

    this.hpFill = s.add
      .rectangle(hpX, wellBottom, this.wellW, this.wellH, 0x3cf0ff)
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(depth);

    this.coreFill = s.add
      .rectangle(coreX, wellBottom, this.wellW, 0, 0xffc24a)
      .setOrigin(0, 1)
      .setScrollFactor(0)
      .setDepth(depth);

    s.add
      .image(this.frameX, this.frameY, 'hud_frame')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    s.add
      .image(5, 5, 'hud_badge')
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(depth + 1);

    this.lvText = addUiText(s, 25, 14, 'LV.1', {
      size: 12,
      color: '#fff4e0',
      originX: 0.5,
      originY: 0.5
    })
      .setScrollFactor(0)
      .setDepth(depth + 2);

    this.infoText = addUiText(s, 32, 28, '', {
      size: 12,
      color: '#fff4e0'
    })
      .setScrollFactor(0)
      .setDepth(depth + 2);
  }

  update(player: Player, science: ScienceProgress): void {
    const hpRatio = player.maxHp > 0 ? Phaser.Math.Clamp(player.hp / player.maxHp, 0, 1) : 0;
    this.hpFill.height = Math.max(0, Math.round(this.wellH * hpRatio));
    this.hpFill.setFillStyle(hpRatio <= 0.25 ? 0xff6670 : 0x3cf0ff);

    const coreRatio = Phaser.Math.Clamp(player.chargeRatio, 0, 1);
    this.coreFill.height = Math.max(0, Math.round(this.wellH * coreRatio));
    this.coreFill.setFillStyle(coreRatio >= 1 ? 0xfff3a0 : coreRatio >= 400 / 1100 ? 0x80d8ff : 0xffc24a);

    this.lvText.setText(`LV.${player.level}`);
    this.infoText.setText(
      `科學分 ${science.score}\n學習站 ${science.clearedCount}/${science.totalStations}`
    );
  }
}

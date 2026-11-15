import Phaser from 'phaser';
import { addUiText, type UiText } from './UiText';
import type { EquipItem, EquipSlot, EquipmentSystem } from './Equipment';
import { chipAuraTint, LOOK_KEY } from './HeroLook';

const SLOT_ORDER: { slot: EquipSlot; label: string }[] = [
  { slot: 'helmet', label: '頭盔' },
  { slot: 'body', label: '胸甲' },
  { slot: 'arms', label: '手臂' },
  { slot: 'legs', label: '腿部' },
  { slot: 'chip1', label: '晶片 1' },
  { slot: 'chip2', label: '晶片 2' }
];

const PREVIEW_W = 96;
const PREVIEW_H = 128;

export class EquipmentUI {
  private readonly root: Phaser.GameObjects.Container;
  private readonly slotTexts: UiText[] = [];
  private readonly slotBoxes: Phaser.GameObjects.Rectangle[] = [];
  private readonly itemTexts: UiText[] = [];
  private readonly itemBoxes: Phaser.GameObjects.Rectangle[] = [];
  private descText: UiText;
  private preview!: Phaser.GameObjects.Sprite;
  private previewAura!: Phaser.GameObjects.Image;
  private selectedChip: 'chip1' | 'chip2' = 'chip1';
  private open = false;
  private animAcc = 0;
  private readonly onEsc: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly equipment: EquipmentSystem,
    private readonly onChanged: () => void
  ) {
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(1200).setVisible(false);

    const dim = scene.add.rectangle(240, 135, 480, 270, 0x02060c, 0.84).setScrollFactor(0);
    dim.setInteractive();
    dim.on('pointerdown', () => this.hide());

    const panel = scene.add
      .rectangle(240, 138, 456, 248, 0x101826, 0.96)
      .setStrokeStyle(1, 0x3ecfff)
      .setScrollFactor(0)
      .setInteractive();

    const title = addUiText(scene, 24, 12, '裝備配件 ／ 晶片', {
      size: 12,
      color: '#7ef0ff',
      originX: 0,
      originY: 0
    }).setScrollFactor(0);

    const closeBtn = scene.add
      .rectangle(336, 26, 72, 44, 0x155a66, 1)
      .setStrokeStyle(1, 0x5ce8ff)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    const closeLabel = addUiText(scene, 336, 26, '關閉', {
      size: 12,
      color: '#8ffff4',
      originX: 0.5,
      originY: 0.5
    }).setScrollFactor(0);
    closeBtn.on('pointerdown', () => this.hide());
    closeLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.hide());

    const closeXBtn = scene.add
      .rectangle(392, 26, 44, 44, 0x3a2230, 1)
      .setStrokeStyle(1, 0xc07080)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    const closeXLabel = addUiText(scene, 392, 26, '×', {
      size: 24,
      color: '#ffe8e0',
      originX: 0.5,
      originY: 0.5
    }).setScrollFactor(0);
    closeXBtn.on('pointerdown', () => this.hide());
    closeXLabel.setInteractive({ useHandCursor: true }).on('pointerdown', () => this.hide());

    const previewLabel = addUiText(scene, 70, 48, '外觀預覽', {
      size: 12,
      color: '#9ad6e0',
      originX: 0.5,
      originY: 0
    }).setScrollFactor(0);

    const previewBox = scene.add
      .rectangle(70, 128, 108, 140, 0x0c141e, 1)
      .setStrokeStyle(1, 0x2a4a5c)
      .setScrollFactor(0);

    const lookKey = scene.textures.exists(LOOK_KEY)
      ? LOOK_KEY
      : scene.textures.exists('player')
        ? 'player'
        : 'player_tex';
    this.previewAura = scene.add
      .image(70, 126, scene.textures.exists('aura_tex') ? 'aura_tex' : lookKey)
      .setScrollFactor(0)
      .setVisible(false)
      .setAlpha(0.7)
      .setScale(1.35)
      .setBlendMode(Phaser.BlendModes.ADD);
    this.preview = scene.add
      .sprite(70, 130, lookKey, 0)
      .setScrollFactor(0)
      .setDisplaySize(PREVIEW_W, PREVIEW_H)
      .setTexture(lookKey);
    this.preview.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);

    const leftLabel = addUiText(scene, 130, 50, '目前裝備', {
      size: 12,
      color: '#9ad6e0'
    }).setScrollFactor(0);

    SLOT_ORDER.forEach((entry, i) => {
      const y = 68 + i * 22;
      const box = scene.add
        .rectangle(196, y + 7, 128, 20, 0x182233, 1)
        .setStrokeStyle(1, 0x2a4a5c)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.onSlotClick(entry.slot));
      const txt = addUiText(scene, 134, y, `${entry.label}  —`, {
        size: 12,
        color: '#e8fbff'
      }).setScrollFactor(0);
      this.slotBoxes.push(box);
      this.slotTexts.push(txt);
    });

    const rightLabel = addUiText(scene, 270, 50, '持有物品（點擊裝備）', {
      size: 12,
      color: '#9ad6e0'
    }).setScrollFactor(0);

    this.descText = addUiText(scene, 24, 228, '選擇物品以查看效果。再按 E、Esc 或「關閉」繼續遊戲。', {
      size: 12,
      color: '#b8e6ee',
      wordWrap: 430
    }).setScrollFactor(0);

    this.root.add([
      dim,
      panel,
      title,
      closeBtn,
      closeLabel,
      closeXBtn,
      closeXLabel,
      previewLabel,
      previewBox,
      this.previewAura,
      this.preview,
      leftLabel,
      rightLabel,
      this.descText
    ]);
    this.slotBoxes.forEach((b) => this.root.add(b));
    this.slotTexts.forEach((t) => this.root.add(t));

    this.onEsc = () => {
      if (this.open) this.hide();
    };
    scene.input.keyboard?.on('keydown-ESC', this.onEsc);
  }

  get isOpen(): boolean {
    return this.open;
  }

  toggle(): void {
    if (this.open) this.hide();
    else this.show();
  }

  show(): void {
    this.open = true;
    this.root.setVisible(true);
    this.rebuildList();
    this.refreshSlots();
    this.refreshPreview();
    this.scene.physics.world.pause();
    this.scene.time.paused = true;
    this.scene.tweens.pauseAll();
  }

  hide(): void {
    this.open = false;
    this.root.setVisible(false);
    this.scene.physics.world.resume();
    this.scene.time.paused = false;
    this.scene.tweens.resumeAll();
  }

  refresh(): void {
    if (this.open) {
      this.rebuildList();
      this.refreshSlots();
      this.refreshPreview();
    }
  }

  /** Scene update still runs while the Clock is paused; step a simple idle pose. */
  update(delta: number): void {
    if (!this.open || !this.preview) return;
    this.animAcc += delta;
    const frame = Math.floor(this.animAcc / 280) % 2;
    if (this.preview.texture.frameTotal > 1) {
      this.preview.setFrame(frame);
    }
    this.preview.setDisplaySize(PREVIEW_W, PREVIEW_H);
  }

  private onSlotClick(slot: EquipSlot): void {
    if (slot === 'chip1' || slot === 'chip2') {
      this.selectedChip = slot;
    }
    const id = this.equipment.equippedId(slot);
    if (id) {
      this.equipment.unequip(slot);
      this.afterChange();
      const item = this.equipment.getItem(id);
      this.descText.setText(item ? `已卸下 ${item.name}。` : '已卸下。');
    } else if (slot === 'chip1' || slot === 'chip2') {
      this.descText.setText('已選擇此晶片槽，點擊右邊嘅晶片放入。');
      this.refreshSlots();
    } else {
      this.descText.setText('（空）　點擊右邊物品裝備，或再按此槽確認。');
      this.refreshSlots();
    }
  }

  private refreshSlots(): void {
    SLOT_ORDER.forEach((entry, i) => {
      const id = this.equipment.equippedId(entry.slot);
      const item = this.equipment.getItem(id);
      const name = item ? item.name : '（空）';
      this.slotTexts[i].setText(`${entry.label}  ${name}`);
      const selected = entry.slot === this.selectedChip;
      this.slotBoxes[i].setStrokeStyle(1, selected ? 0x7ef0ff : 0x2a4a5c);
    });
  }

  private refreshPreview(): void {
    const key = this.scene.textures.exists(LOOK_KEY)
      ? LOOK_KEY
      : this.scene.textures.exists('player')
        ? 'player'
        : 'player_tex';
    if (this.preview.texture.key !== key) this.preview.setTexture(key);
    this.preview.setDisplaySize(PREVIEW_W, PREVIEW_H);
    this.preview.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    const tint = chipAuraTint(this.equipment);
    this.previewAura.setVisible(!!tint);
    if (tint) this.previewAura.setTint(tint);
  }

  private rebuildList(): void {
    this.itemTexts.forEach((t) => t.destroy());
    this.itemBoxes.forEach((b) => b.destroy());
    this.itemTexts.length = 0;
    this.itemBoxes.length = 0;

    const items = this.equipment.ownedList();
    items.forEach((item, i) => {
      const col = i < 8 ? 0 : 1;
      const row = i < 8 ? i : i - 8;
      const x = 270 + col * 96;
      const y = 68 + row * 18;
      const equipped = this.equipment.isEquipped(item.id);
      const box = this.scene.add
        .rectangle(x + 44, y + 6, 92, 16, equipped ? 0x155a66 : 0x182233, 1)
        .setStrokeStyle(1, equipped ? 0x5ce8ff : 0x2a4a5c)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      const txt = addUiText(this.scene, x, y, item.name, {
        size: 12,
        color: equipped ? '#8ffff4' : '#e8fbff'
      }).setScrollFactor(0);
      box.on('pointerdown', () => this.onItemClick(item));
      this.root.add([box, txt]);
      this.itemBoxes.push(box);
      this.itemTexts.push(txt);
    });
  }

  private onItemClick(item: EquipItem): void {
    this.descText.setText(`${item.name}：${item.description}`);
    if (item.kind === 'chip') {
      this.equipment.equip(item.id, this.selectedChip);
    } else {
      this.equipment.equip(item.id);
    }
    this.afterChange();
  }

  private afterChange(): void {
    this.refreshSlots();
    this.rebuildList();
    this.onChanged();
    this.refreshPreview();
  }

  destroy(): void {
    this.scene.input.keyboard?.off('keydown-ESC', this.onEsc);
    this.root.destroy(true);
  }
}

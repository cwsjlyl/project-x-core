import Phaser from 'phaser';
import { UI_FONT } from '../constants';
import type { EquipItem, EquipSlot, EquipmentSystem } from './Equipment';

const SLOT_ORDER: { slot: EquipSlot; label: string }[] = [
  { slot: 'helmet', label: '頭盔' },
  { slot: 'body', label: '胸甲' },
  { slot: 'arms', label: '手臂' },
  { slot: 'legs', label: '腿部' },
  { slot: 'chip1', label: '晶片 1' },
  { slot: 'chip2', label: '晶片 2' }
];

export class EquipmentUI {
  private readonly root: Phaser.GameObjects.Container;
  private readonly slotTexts: Phaser.GameObjects.Text[] = [];
  private readonly slotBoxes: Phaser.GameObjects.Rectangle[] = [];
  private readonly itemTexts: Phaser.GameObjects.Text[] = [];
  private readonly itemBoxes: Phaser.GameObjects.Rectangle[] = [];
  private descText: Phaser.GameObjects.Text;
  private selectedChip: 'chip1' | 'chip2' = 'chip1';
  private open = false;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly equipment: EquipmentSystem,
    private readonly onChanged: () => void
  ) {
    this.root = scene.add.container(0, 0).setScrollFactor(0).setDepth(1200).setVisible(false);

    const dim = scene.add.rectangle(240, 135, 480, 270, 0x02060c, 0.84).setScrollFactor(0);
    dim.setInteractive();
    const panel = scene.add
      .rectangle(240, 135, 456, 246, 0x101826, 0.96)
      .setStrokeStyle(1, 0x3ecfff)
      .setScrollFactor(0);

    const title = scene.add
      .text(240, 22, '裝備配件 ／ 晶片', {
        fontFamily: UI_FONT,
        fontSize: '14px',
        color: '#7ef0ff'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0);

    const close = scene.add
      .text(448, 22, '關閉', {
        fontFamily: UI_FONT,
        fontSize: '11px',
        color: '#c9f6ff'
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });
    close.on('pointerdown', () => this.hide());

    const leftLabel = scene.add
      .text(24, 44, '目前裝備', {
        fontFamily: UI_FONT,
        fontSize: '10px',
        color: '#9ad6e0'
      })
      .setScrollFactor(0);

    SLOT_ORDER.forEach((entry, i) => {
      const y = 62 + i * 22;
      const box = scene.add
        .rectangle(110, y + 7, 170, 20, 0x182233, 1)
        .setStrokeStyle(1, 0x2a4a5c)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      box.on('pointerdown', () => this.onSlotClick(entry.slot));
      const txt = scene.add
        .text(28, y, `${entry.label}  —`, {
          fontFamily: UI_FONT,
          fontSize: '10px',
          color: '#e8fbff'
        })
        .setScrollFactor(0);
      this.slotBoxes.push(box);
      this.slotTexts.push(txt);
    });

    const rightLabel = scene.add
      .text(220, 44, '持有物品（點擊裝備）', {
        fontFamily: UI_FONT,
        fontSize: '10px',
        color: '#9ad6e0'
      })
      .setScrollFactor(0);

    this.descText = scene.add
      .text(24, 236, '選擇物品以查看效果。再按 E 或「關閉」繼續遊戲。', {
        fontFamily: UI_FONT,
        fontSize: '9px',
        color: '#b8e6ee',
        wordWrap: { width: 430 }
      })
      .setScrollFactor(0);

    this.root.add([dim, panel, title, close, leftLabel, rightLabel, this.descText]);
    this.slotBoxes.forEach((b) => this.root.add(b));
    this.slotTexts.forEach((t) => this.root.add(t));
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
    }
  }

  private onSlotClick(slot: EquipSlot): void {
    if (slot === 'chip1' || slot === 'chip2') {
      this.selectedChip = slot;
      const id = this.equipment.equippedId(slot);
      if (id) {
        this.equipment.unequipChip(slot);
        this.afterChange();
        const item = this.equipment.getItem(id);
        this.descText.setText(item ? `已卸下 ${item.name}。` : '已卸下晶片。');
      } else {
        this.descText.setText('已選擇此晶片槽，點擊右邊嘅晶片放入。');
        this.refreshSlots();
      }
    } else {
      const id = this.equipment.equippedId(slot);
      const item = this.equipment.getItem(id);
      if (item) this.descText.setText(`${item.name}：${item.description}`);
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

  private rebuildList(): void {
    this.itemTexts.forEach((t) => t.destroy());
    this.itemBoxes.forEach((b) => b.destroy());
    this.itemTexts.length = 0;
    this.itemBoxes.length = 0;

    const items = this.equipment.ownedList();
    items.forEach((item, i) => {
      const col = i < 8 ? 0 : 1;
      const row = i < 8 ? i : i - 8;
      const x = 300 + col * 86;
      const y = 62 + row * 18;
      const equipped = this.equipment.isEquipped(item.id);
      const box = this.scene.add
        .rectangle(x + 36, y + 6, 84, 16, equipped ? 0x155a66 : 0x182233, 1)
        .setStrokeStyle(1, equipped ? 0x5ce8ff : 0x2a4a5c)
        .setScrollFactor(0)
        .setInteractive({ useHandCursor: true });
      const txt = this.scene.add
        .text(x, y, item.name, {
          fontFamily: UI_FONT,
          fontSize: '9px',
          color: equipped ? '#8ffff4' : '#e8fbff'
        })
        .setScrollFactor(0);
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
  }

  destroy(): void {
    this.root.destroy(true);
  }
}

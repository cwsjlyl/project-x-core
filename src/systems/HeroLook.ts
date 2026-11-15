import Phaser from 'phaser';
import type { EquipmentSystem } from './Equipment';

export const LOOK_KEY = 'player_look';
const SHEET_W = 192;
const SHEET_H = 128;
const FRAME_W = 48;
const FRAME_H = 64;

/** Create a canvas spritesheet the hero and dash ghosts both draw from. */
export function ensureLookTexture(scene: Phaser.Scene): void {
  if (scene.textures.exists(LOOK_KEY)) return;
  if (!scene.textures.exists('player')) return;
  const tex = scene.textures.createCanvas(LOOK_KEY, SHEET_W, SHEET_H);
  if (!tex) return;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  const src = scene.textures.get('player').getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  ctx.drawImage(src, 0, 0);
  for (let i = 0; i < 8; i++) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    tex.add(i, 0, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
  }
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  tex.refresh();
}

/** Composite the photo base + equipped overlays into player_look and refresh. */
export function bakeHeroLook(scene: Phaser.Scene, equipment: EquipmentSystem): void {
  ensureLookTexture(scene);
  if (!scene.textures.exists(LOOK_KEY) || !scene.textures.exists('player')) return;
  const tex = scene.textures.get(LOOK_KEY) as Phaser.Textures.CanvasTexture;
  const ctx = tex.getContext();
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, SHEET_W, SHEET_H);
  const src = scene.textures.get('player').getSourceImage() as HTMLImageElement | HTMLCanvasElement;
  ctx.drawImage(src, 0, 0);
  const l = equipment.loadout;
  for (const id of [l.body, l.legs, l.arms, l.helmet]) {
    const key = `gear_${id}`;
    if (!id || !scene.textures.exists(key)) continue;
    const img = scene.textures.get(key).getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    ctx.drawImage(img, 0, 0);
  }
  tex.refresh();
}

export function chipAuraTint(equipment: EquipmentSystem): number | null {
  const ids = [equipment.loadout.chip1, equipment.loadout.chip2];
  const tints: Record<string, number> = {
    chip_charge: 0x66e0ff,
    chip_regen: 0x66ff99,
    chip_breaker: 0xff66cc,
    chip_iframe: 0xffe066,
    chip_double: 0xffaa66
  };
  for (const id of ids) {
    if (id && tints[id]) return tints[id];
  }
  return null;
}

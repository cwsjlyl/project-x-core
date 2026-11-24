import Phaser from 'phaser';
import type { StageData } from './MapLoader';

export const AZURE_TOWER_ACTIVE_KEY = 'azure_tower_active';
export const AZURE_TOWER_STANDBY_KEY = 'azure_tower_standby';
export const AZURE_TOWER_SLICES_KEY = 'azure_tower_slices';
const AZURE_TOWER_GLOW_KEY = 'azure_tower_glow_tex';

const SLICE_SIZE = 24;
const SLICE_COUNT = 42;
const FRAME_W = 40;
const FRAME_H = 60;
const ANGLE_COLS = 6;
const ANGLE_ROWS = 4;
const ANGLE_STEPS = ANGLE_COLS * ANGLE_ROWS; // 24 smooth 3D directions
const SQUASH = 0.72;
const SPACING = 1.0;

interface VoxelVolume {
  rgba: Uint8Array;      // [z * S * S + y * S + x] * 4
  emissive: Uint8Array;  // 1 if self-luminous plasma/crystal
  normals: Float32Array; // [idx * 3] -> nx, ny, nz
}

interface TowerNode {
  cpX: number;
  cpY: number;
  activated: boolean;
  sprite: Phaser.GameObjects.Sprite;
  glow: Phaser.GameObjects.Image;
}

function setVoxel(
  vol: VoxelVolume,
  x: number,
  y: number,
  z: number,
  r: number,
  g: number,
  b: number,
  emissive = false
): void {
  if (x < 0 || x >= SLICE_SIZE || y < 0 || y >= SLICE_SIZE || z < 0 || z >= SLICE_COUNT) return;
  const idx = z * SLICE_SIZE * SLICE_SIZE + y * SLICE_SIZE + x;
  const o = idx * 4;
  vol.rgba[o] = r;
  vol.rgba[o + 1] = g;
  vol.rgba[o + 2] = b;
  vol.rgba[o + 3] = 255;
  vol.emissive[idx] = emissive ? 1 : 0;
}

function computeNormals(vol: VoxelVolume): void {
  const total = SLICE_COUNT * SLICE_SIZE * SLICE_SIZE;
  for (let z = 0; z < SLICE_COUNT; z++) {
    for (let y = 0; y < SLICE_SIZE; y++) {
      for (let x = 0; x < SLICE_SIZE; x++) {
        const idx = z * SLICE_SIZE * SLICE_SIZE + y * SLICE_SIZE + x;
        if (vol.rgba[idx * 4 + 3] === 0) continue;
        let nx = 0;
        let ny = 0;
        let nz = 0;
        for (let dz = -1; dz <= 1; dz++) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0 && dz === 0) continue;
              const qx = x + dx;
              const qy = y + dy;
              const qz = z + dz;
              const empty =
                qx < 0 ||
                qx >= SLICE_SIZE ||
                qy < 0 ||
                qy >= SLICE_SIZE ||
                qz < 0 ||
                qz >= SLICE_COUNT ||
                vol.rgba[(qz * SLICE_SIZE * SLICE_SIZE + qy * SLICE_SIZE + qx) * 4 + 3] === 0;
              if (empty) {
                nx += dx;
                ny += dy;
                nz += dz;
              }
            }
          }
        }
        const len = Math.hypot(nx, ny, nz);
        const nIdx = idx * 3;
        if (len > 1e-4) {
          vol.normals[nIdx] = nx / len;
          vol.normals[nIdx + 1] = ny / len;
          vol.normals[nIdx + 2] = nz / len;
        } else {
          vol.normals[nIdx] = 0;
          vol.normals[nIdx + 1] = 0;
          vol.normals[nIdx + 2] = 1;
        }
      }
    }
  }
  void total;
}

/** Build the 3D voxel volume for the Azure X-Core Energy Tower. */
function buildTowerVolume(active: boolean): VoxelVolume {
  const total = SLICE_COUNT * SLICE_SIZE * SLICE_SIZE;
  const vol: VoxelVolume = {
    rgba: new Uint8Array(total * 4),
    emissive: new Uint8Array(total),
    normals: new Float32Array(total * 3)
  };

  // Symmetric center per sprite-stacking SKILL.md: (W - 1) * 0.5
  const half = (SLICE_SIZE - 1) * 0.5;

  const coreOuter: [number, number, number] = active ? [0, 180, 255] : [26, 86, 124];
  const coreMid: [number, number, number] = active ? [110, 242, 255] : [52, 138, 178];
  const coreHot: [number, number, number] = active ? [240, 255, 255] : [130, 210, 235];
  const trimGlow: [number, number, number] = active ? [0, 229, 255] : [48, 128, 160];

  for (let z = 0; z < SLICE_COUNT; z++) {
    for (let y = 0; y < SLICE_SIZE; y++) {
      for (let x = 0; x < SLICE_SIZE; x++) {
        const dx = x - half;
        const dy = y - half;
        const adx = Math.abs(dx);
        const ady = Math.abs(dy);
        const dist = Math.hypot(dx, dy);
        const oct = Math.max(adx, ady) + 0.42 * Math.min(adx, ady);

        // 1. Heavy stepped octagonal pedestal + 4 protruding stabilizer feet (z = 0..5)
        if (z <= 5) {
          const baseLimit = z <= 2 ? 9.4 : 7.8;
          const onFoot = z <= 2 && ((adx <= 2.1 && ady <= 11.2) || (ady <= 2.1 && adx <= 11.2));
          if (oct <= baseLimit || onFoot) {
            if (z === 2 && onFoot && Math.max(adx, ady) >= 9.2) {
              setVoxel(vol, x, y, z, trimGlow[0], trimGlow[1], trimGlow[2], active);
            } else if (z === 0) {
              setVoxel(vol, x, y, z, 18, 27, 40);
            } else if (z === 5 && oct <= 6.8 && oct >= 5.4) {
              setVoxel(vol, x, y, z, trimGlow[0], trimGlow[1], trimGlow[2], active);
            } else if ((z === 2 || z === 4) && oct >= baseLimit - 1.2) {
              setVoxel(vol, x, y, z, 62, 90, 122);
            } else {
              setVoxel(vol, x, y, z, 36, 54, 76);
            }
          }
          continue;
        }

        // 2. Open-frame 4-pillar containment cage + inner plasma column + energy rings (z = 6..25)
        if (z >= 6 && z <= 25) {
          // Central glowing plasma column (visible through gaps between pillars!)
          if (dist <= 3.2) {
            if (dist <= 1.3) {
              setVoxel(vol, x, y, z, coreHot[0], coreHot[1], coreHot[2], true);
            } else if (dist <= 2.3 || (z + x + y) % 3 === 0) {
              setVoxel(vol, x, y, z, coreMid[0], coreMid[1], coreMid[2], true);
            } else {
              setVoxel(vol, x, y, z, coreOuter[0], coreOuter[1], coreOuter[2], active);
            }
            continue;
          }

          // Dual stabilizer halo rings with directional energy nodes (z = 12..13 and z = 19..20)
          const isLowerRing = z === 12 || z === 13;
          const isUpperRing = z === 19 || z === 20;
          if ((isLowerRing || isUpperRing) && dist >= 4.8 && dist <= 7.7) {
            const nodeHit =
              (isLowerRing && dx > 4.2 && ady <= 1.8) ||
              (isLowerRing && dx < -4.2 && ady <= 1.8) ||
              (isUpperRing && dy > 4.2 && adx <= 1.8) ||
              (isUpperRing && dy < -4.2 && adx <= 1.8);
            if (nodeHit) {
              setVoxel(vol, x, y, z, coreHot[0], coreHot[1], coreHot[2], true);
            } else if (dist >= 6.6) {
              setVoxel(vol, x, y, z, trimGlow[0], trimGlow[1], trimGlow[2], active);
            } else {
              setVoxel(vol, x, y, z, 52, 76, 104);
            }
            continue;
          }

          // 4 diagonal armored corner struts (NE, NW, SE, SW) -> creates 3D parallax!
          if (adx >= 4.1 && ady >= 4.1 && adx <= 6.7 && ady <= 6.7) {
            if (z === 9 || z === 16 || z === 23) {
              setVoxel(vol, x, y, z, trimGlow[0], trimGlow[1], trimGlow[2], active);
            } else if (adx >= 5.6 || ady >= 5.6) {
              setVoxel(vol, x, y, z, 72, 102, 134);
            } else {
              setVoxel(vol, x, y, z, 40, 58, 82);
            }
          }
          continue;
        }

        // 3. Upper reactor crown + 4 cardinal emitter horns (z = 26..31)
        if (z >= 26 && z <= 31) {
          if (z <= 28) {
            const capR = z === 26 ? 7.6 : z === 27 ? 6.8 : 5.6;
            if (oct <= capR) {
              if (dist <= 2.4) {
                setVoxel(vol, x, y, z, coreHot[0], coreHot[1], coreHot[2], true);
              } else if (z === 27 && oct >= 5.6) {
                setVoxel(vol, x, y, z, trimGlow[0], trimGlow[1], trimGlow[2], active);
              } else {
                setVoxel(vol, x, y, z, 58, 84, 114);
              }
            }
          } else {
            // 4 upward emitter prongs cradling the floating X-Core crystal
            const shift = (z - 29) * 0.5;
            const onProng =
              (adx <= 1.5 && ady >= 4.6 + shift && ady <= 7.2 + shift) ||
              (ady <= 1.5 && adx >= 4.6 + shift && adx <= 7.2 + shift);
            if (onProng) {
              if (z === 31) {
                setVoxel(vol, x, y, z, coreMid[0], coreMid[1], coreMid[2], true);
              } else {
                setVoxel(vol, x, y, z, 76, 108, 142);
              }
            }
          }
          continue;
        }

        // z = 32 is an intentional empty air gap so the crystal floats!
        if (z === 32) continue;

        // 4. Floating 3D Octahedron Azure X-Core Crystal (z = 33..40)
        if (z >= 33 && z <= 40) {
          const midZ = 36.5;
          const span = 4.2 - Math.abs(z - midZ) * 1.05;
          const diamond = adx + ady;
          if (span > 0 && diamond <= span) {
            if (diamond <= span * 0.38) {
              setVoxel(vol, x, y, z, 255, 255, 255, true);
            } else if (diamond <= span * 0.72) {
              setVoxel(vol, x, y, z, coreMid[0], coreMid[1], coreMid[2], true);
            } else {
              setVoxel(vol, x, y, z, coreOuter[0], coreOuter[1], coreOuter[2], true);
            }
          }
        }
      }
    }
  }

  computeNormals(vol);
  return vol;
}

/**
 * Software sprite-stacking rasterizer adapted from cwsjlyl/sprite-stacking:
 * Stacks rotated horizontal slices from z = 0..H-1 with vertical squash and 3D normal shading.
 */
function rasterizeStackFrame(
  vol: VoxelVolume,
  angleRad: number,
  outBuf: Uint8ClampedArray
): void {
  outBuf.fill(0);
  const cos = Math.cos(-angleRad);
  const sin = Math.sin(-angleRad);
  const half = (SLICE_SIZE - 1) * 0.5;
  const cx = FRAME_W * 0.5;
  // Anchor z=0 near bottom of frame so origin(0.5, 1) sits cleanly on ground
  const baseY = FRAME_H - 11;

  // World-space directional sunlight rotated into slice space
  const sunWorldX = -0.58;
  const sunWorldY = -0.52;
  const sunWorldZ = 0.63;
  const lx = sunWorldX * cos - sunWorldY * sin;
  const ly = sunWorldX * sin + sunWorldY * cos;
  const lz = sunWorldZ;

  // Tight bounding radius in screen space
  const boundX = Math.ceil(half * (Math.abs(cos) + Math.abs(sin))) + 2;
  const boundY = Math.ceil(half * (Math.abs(cos) + Math.abs(sin)) * SQUASH) + 2;

  for (let z = 0; z < SLICE_COUNT; z++) {
    const layerCenterY = baseY - z * SPACING;
    const pyMin = Math.max(0, Math.floor(layerCenterY - boundY));
    const pyMax = Math.min(FRAME_H - 1, Math.ceil(layerCenterY + boundY));
    const pxMin = Math.max(0, Math.floor(cx - boundX));
    const pxMax = Math.min(FRAME_W - 1, Math.ceil(cx + boundX));
    const zOffset = z * SLICE_SIZE * SLICE_SIZE;

    for (let py = pyMin; py <= pyMax; py++) {
      const dy = (py + 0.5 - layerCenterY) / SQUASH;
      for (let px = pxMin; px <= pxMax; px++) {
        const dx = px + 0.5 - cx;
        const sx = Math.round(dx * cos - dy * sin + half);
        const sy = Math.round(dx * sin + dy * cos + half);
        if (sx < 0 || sx >= SLICE_SIZE || sy < 0 || sy >= SLICE_SIZE) continue;

        const vIdx = zOffset + sy * SLICE_SIZE + sx;
        const cOff = vIdx * 4;
        if (vol.rgba[cOff + 3] === 0) continue;

        let r = vol.rgba[cOff];
        let g = vol.rgba[cOff + 1];
        let b = vol.rgba[cOff + 2];

        if (vol.emissive[vIdx] === 1) {
          // Self-luminous plasma & floating crystal stay bright at every angle
          r = Math.min(255, Math.round(r * 1.08));
          g = Math.min(255, Math.round(g * 1.08));
          b = Math.min(255, Math.round(b * 1.08));
        } else {
          const nOff = vIdx * 3;
          const ndotl =
            vol.normals[nOff] * lx +
            vol.normals[nOff + 1] * ly +
            vol.normals[nOff + 2] * lz;
          const ao = 0.86 + 0.14 * (z / SLICE_COUNT);
          const shade = Math.max(0.45, Math.min(1.24, (0.68 + 0.48 * Math.max(-0.25, ndotl)) * ao));
          r = Math.min(255, Math.round(r * shade));
          g = Math.min(255, Math.round(g * shade));
          b = Math.min(255, Math.round(b * shade));
        }

        const dst = (py * FRAME_W + px) * 4;
        outBuf[dst] = r;
        outBuf[dst + 1] = g;
        outBuf[dst + 2] = b;
        outBuf[dst + 3] = 255;
      }
    }
  }
}

function bakeSheetForVolume(
  scene: Phaser.Scene,
  key: string,
  animKey: string,
  frameRate: number,
  vol: VoxelVolume
): void {
  if (scene.textures.exists(key)) scene.textures.remove(key);
  const sheetW = FRAME_W * ANGLE_COLS;
  const sheetH = FRAME_H * ANGLE_ROWS;
  const tex = scene.textures.createCanvas(key, sheetW, sheetH);
  if (!tex) return;

  const ctx = tex.getContext();
  ctx.clearRect(0, 0, sheetW, sheetH);
  ctx.imageSmoothingEnabled = false;

  const frameImg = ctx.createImageData(FRAME_W, FRAME_H);
  for (let i = 0; i < ANGLE_STEPS; i++) {
    const angle = (i / ANGLE_STEPS) * Math.PI * 2;
    rasterizeStackFrame(vol, angle, frameImg.data);
    const col = i % ANGLE_COLS;
    const row = Math.floor(i / ANGLE_COLS);
    ctx.putImageData(frameImg, col * FRAME_W, row * FRAME_H);
    tex.add(i, 0, col * FRAME_W, row * FRAME_H, FRAME_W, FRAME_H);
  }

  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  tex.refresh();

  if (!scene.anims.exists(animKey)) {
    scene.anims.create({
      key: animKey,
      frames: scene.anims.generateFrameNumbers(key, { start: 0, end: ANGLE_STEPS - 1 }),
      frameRate,
      repeat: -1
    });
  }
}

function bakeRawSliceStrip(scene: Phaser.Scene, vol: VoxelVolume): void {
  if (scene.textures.exists(AZURE_TOWER_SLICES_KEY)) {
    scene.textures.remove(AZURE_TOWER_SLICES_KEY);
  }
  const stripW = SLICE_SIZE * SLICE_COUNT;
  const tex = scene.textures.createCanvas(AZURE_TOWER_SLICES_KEY, stripW, SLICE_SIZE);
  if (!tex) return;
  const ctx = tex.getContext();
  const img = ctx.createImageData(stripW, SLICE_SIZE);
  for (let z = 0; z < SLICE_COUNT; z++) {
    for (let y = 0; y < SLICE_SIZE; y++) {
      for (let x = 0; x < SLICE_SIZE; x++) {
        const src = (z * SLICE_SIZE * SLICE_SIZE + y * SLICE_SIZE + x) * 4;
        const dst = (y * stripW + (z * SLICE_SIZE + x)) * 4;
        img.data[dst] = vol.rgba[src];
        img.data[dst + 1] = vol.rgba[src + 1];
        img.data[dst + 2] = vol.rgba[src + 2];
        img.data[dst + 3] = vol.rgba[src + 3];
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  tex.refresh();
}

function bakeGroundGlow(scene: Phaser.Scene): void {
  if (scene.textures.exists(AZURE_TOWER_GLOW_KEY)) return;
  const tex = scene.textures.createCanvas(AZURE_TOWER_GLOW_KEY, 44, 14);
  if (!tex) return;
  const ctx = tex.getContext();
  const grad = ctx.createRadialGradient(22, 7, 2, 22, 7, 21);
  grad.addColorStop(0, 'rgba(0, 235, 255, 0.55)');
  grad.addColorStop(0.6, 'rgba(0, 150, 255, 0.22)');
  grad.addColorStop(1, 'rgba(0, 120, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 44, 14);
  tex.setFilter(Phaser.Textures.FilterMode.NEAREST);
  tex.refresh();
}

/** Pre-bake 2.5D Sprite-Stacked Azure Energy Tower sheets during PreloadScene. */
export function bakeAzureTowerTextures(scene: Phaser.Scene): void {
  const activeVol = buildTowerVolume(true);
  const standbyVol = buildTowerVolume(false);
  bakeRawSliceStrip(scene, activeVol);
  bakeSheetForVolume(scene, AZURE_TOWER_ACTIVE_KEY, 'azure-tower-spin-active', 10, activeVol);
  bakeSheetForVolume(scene, AZURE_TOWER_STANDBY_KEY, 'azure-tower-spin-standby', 5, standbyVol);
  bakeGroundGlow(scene);
}

/** Manages Spawn Beacon + Checkpoint 3D Azure Energy Towers inside GameScene. */
export class AzureTowerManager {
  private nodes: TowerNode[] = [];

  spawnForStage(
    scene: Phaser.Scene,
    stage: StageData,
    applyLight?: (obj: Phaser.GameObjects.Components.Pipeline) => void
  ): void {
    this.nodes = [];
    if (!scene.textures.exists(AZURE_TOWER_ACTIVE_KEY)) return;

    // 1. Stage Start Spawn Beacon Tower (already active, immediately visible on stage entry)
    const startX = Math.max(40, stage.playerSpawn.x - 35);
    const startGroundY = stage.playerSpawn.y + 9;
    const startGlow = scene.add
      .image(startX, startGroundY - 1, AZURE_TOWER_GLOW_KEY)
      .setDepth(2)
      .setAlpha(0.85);
    const startTower = scene.add
      .sprite(startX, startGroundY + 9, AZURE_TOWER_ACTIVE_KEY, 0)
      .setOrigin(0.5, 1)
      .setDepth(3);
    startTower.play('azure-tower-spin-active');
    if (applyLight) applyLight(startTower);
    scene.tweens.add({
      targets: startGlow,
      alpha: 0.45,
      scaleX: 0.88,
      duration: 950,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut'
    });

    // 2. Checkpoint 3D Energy Towers across the stage (standby until player reaches them)
    for (const cp of stage.checkpoints) {
      let renderX = cp.x;
      // Avoid overlapping nearby science learning stations (e.g. stage1 checkpoint_door)
      for (const st of stage.scienceStations) {
        if (Math.abs(renderX - st.x) < 30) {
          renderX = st.x - 32;
        }
      }
      const groundY = cp.y + 9;
      const glow = scene.add
        .image(renderX, groundY - 1, AZURE_TOWER_GLOW_KEY)
        .setDepth(2)
        .setAlpha(0.32);
      const tower = scene.add
        .sprite(renderX, groundY + 9, AZURE_TOWER_STANDBY_KEY, 0)
        .setOrigin(0.5, 1)
        .setDepth(3);
      tower.play('azure-tower-spin-standby');
      if (applyLight) applyLight(tower);

      this.nodes.push({
        cpX: cp.x,
        cpY: cp.y,
        activated: false,
        sprite: tower,
        glow
      });
    }
  }

  /** Activate any checkpoint tower within range and return activation info. */
  checkAndActivate(
    scene: Phaser.Scene,
    playerX: number,
    playerY: number
  ): { x: number; y: number; renderX: number; newlyActivated: boolean } | null {
    for (const node of this.nodes) {
      if (Math.abs(playerX - node.cpX) < 24 && Math.abs(playerY - node.cpY) < 28) {
        if (!node.activated) {
          node.activated = true;
          node.sprite.setTexture(AZURE_TOWER_ACTIVE_KEY, 0);
          node.sprite.play('azure-tower-spin-active');
          node.glow.setAlpha(0.95);
          scene.tweens.add({
            targets: node.sprite,
            scaleX: 1.14,
            scaleY: 1.14,
            duration: 150,
            yoyo: true,
            ease: 'Quad.out'
          });
          scene.tweens.add({
            targets: node.glow,
            alpha: 0.5,
            scaleX: 0.88,
            duration: 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.inOut'
          });
          return {
            x: node.cpX,
            y: node.cpY,
            renderX: node.sprite.x,
            newlyActivated: true
          };
        }
        return {
          x: node.cpX,
          y: node.cpY,
          renderX: node.sprite.x,
          newlyActivated: false
        };
      }
    }
    return null;
  }
}

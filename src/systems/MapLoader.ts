import Phaser from 'phaser';

export interface SpawnPoint {
  x: number;
  y: number;
}

export interface EnemySpawn extends SpawnPoint {
  patrolMin: number;
  patrolMax: number;
}

export interface PickupSpawn extends SpawnPoint {
  itemId: string;
}

export interface ScienceStationSpawn extends SpawnPoint {
  topic: string;
}

export interface RectZone {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface StageData {
  map: Phaser.Tilemaps.Tilemap;
  solid: Phaser.Tilemaps.TilemapLayer;
  background: Phaser.Tilemaps.TilemapLayer | null;
  decor: Phaser.Tilemaps.TilemapLayer | null;
  playerSpawn: SpawnPoint;
  enemies: EnemySpawn[];
  pickups: PickupSpawn[];
  scienceStations: ScienceStationSpawn[];
  checkpoints: SpawnPoint[];
  bossSpawn: SpawnPoint;
  arena: RectZone;
  trigger: RectZone;
  door: RectZone;
  worldWidth: number;
  worldHeight: number;
}

function propsOf(obj: Phaser.Types.Tilemaps.TiledObject): Record<string, unknown> {
  const raw = obj.properties as unknown;
  if (!raw) return {};
  if (Array.isArray(raw)) {
    const out: Record<string, unknown> = {};
    for (const entry of raw as { name: string; value: unknown }[]) {
      out[entry.name] = entry.value;
    }
    return out;
  }
  return raw as Record<string, unknown>;
}

function centerOf(obj: Phaser.Types.Tilemaps.TiledObject): SpawnPoint {
  const w = obj.width ?? 0;
  const h = obj.height ?? 0;
  return { x: (obj.x ?? 0) + w / 2, y: (obj.y ?? 0) + h / 2 };
}

function rectOf(obj: Phaser.Types.Tilemaps.TiledObject): RectZone {
  return {
    x: obj.x ?? 0,
    y: obj.y ?? 0,
    width: obj.width ?? 0,
    height: obj.height ?? 0
  };
}

export function loadStage(scene: Phaser.Scene, useLights: boolean): StageData {
  const map = scene.make.tilemap({ key: 'stage1' });
  const tileset = map.addTilesetImage('industrial', 'industrial');
  if (!tileset) {
    throw new Error('未能載入 industrial tileset');
  }

  const background = map.createLayer('background', tileset, 0, 0);
  const decor = map.createLayer('decor', tileset, 0, 0);
  const solid = map.createLayer('solid', tileset, 0, 0);
  if (!solid) {
    throw new Error('地圖缺少 solid 圖層');
  }
  solid.setCollisionByExclusion([-1]);
  background?.setDepth(0);
  decor?.setDepth(1);
  solid.setDepth(2);
  // Sunny beach: keep tile colours bright. Light2D is not applied to
  // the tile layers even if the scene requested lights.
  void useLights;
  background?.setVisible(true);
  decor?.setVisible(false);

  const worldWidth = map.widthInPixels;
  const worldHeight = map.heightInPixels;

  let playerSpawn: SpawnPoint = { x: 72, y: 200 };
  const enemies: EnemySpawn[] = [];
  const pickups: PickupSpawn[] = [];
  const scienceStations: ScienceStationSpawn[] = [];
  const checkpoints: SpawnPoint[] = [];
  let bossSpawn: SpawnPoint = { x: worldWidth - 200, y: 180 };
  let arena: RectZone = { x: worldWidth - 576, y: 0, width: 576, height: worldHeight };
  let trigger: RectZone = { x: arena.x, y: 0, width: 18, height: worldHeight };
  let door: RectZone = { x: arena.x, y: 162, width: 18, height: 72 };

  const layer = map.getObjectLayer('objects');
  if (layer) {
    for (const obj of layer.objects) {
      const type = (obj.type || obj.name || '').toLowerCase();
      const p = propsOf(obj);
      const c = centerOf(obj);
      if (type === 'spawn' || obj.name === 'player') {
        playerSpawn = c;
      } else if (type === 'enemy' || obj.name.startsWith('patrol')) {
        enemies.push({
          x: c.x,
          y: c.y,
          patrolMin: Number(p.patrolMin ?? c.x - 80),
          patrolMax: Number(p.patrolMax ?? c.x + 80)
        });
      } else if (type === 'pickup' || obj.name.startsWith('pickup')) {
        const itemId = String(p.itemId ?? obj.name.replace(/^pickup_/, ''));
        pickups.push({ x: c.x, y: c.y, itemId });
      } else if (type === 'science' || type === 'station' || obj.name.startsWith('station')) {
        const topic = String(p.topic ?? obj.name.replace(/^station_/, ''));
        scienceStations.push({ x: c.x, y: c.y, topic });
      } else if (type === 'checkpoint') {
        checkpoints.push(c);
      } else if (type === 'boss') {
        bossSpawn = c;
      } else if (type === 'arena') {
        arena = rectOf(obj);
      } else if (type === 'trigger') {
        trigger = rectOf(obj);
      } else if (type === 'door') {
        door = rectOf(obj);
      }
    }
  }

  return {
    map,
    solid,
    background,
    decor,
    playerSpawn,
    enemies,
    pickups,
    scienceStations,
    checkpoints,
    bossSpawn,
    arena,
    trigger,
    door,
    worldWidth,
    worldHeight
  };
}

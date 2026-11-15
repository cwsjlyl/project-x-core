import Phaser from 'phaser';
import type { Player } from './Player';
import { FLYING_KINDS, animKeyFor, type EnemyKind } from '../systems/Stages';
import { isPositiveDamage } from '../systems/CombatMath';

export type EnemyShotKind = 'spit' | 'drop' | 'nut' | 'snow' | 'sting';

export interface EnemyShotRequest {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: EnemyShotKind;
  damage: number;
  gravity: boolean;
  life: number;
}

type EnemyMode = 'patrol' | 'telegraph' | 'attack' | 'recover';

export interface AnimalEnemy extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  maxHp: number;
  kind: EnemyKind;
  contactDamage: number;
  flying: boolean;
  patrolMin: number;
  patrolMax: number;
  hoverY: number;
  updateEnemy(delta: number, player: Player): void;
  takeHit(amount: number): boolean;
  previewAttack(player: Player): void;
}

const CONTACT: Record<EnemyKind, number> = {
  crab: 10,
  gull: 9,
  puppy: 11,
  squirrel: 9,
  owl: 10,
  fox: 12,
  penguin: 9,
  seal: 10,
  cub: 11,
  lizard: 10,
  fennec: 9,
  scorpion: 12
};

export function createAnimalEnemy(
  scene: Phaser.Scene,
  group: Phaser.Physics.Arcade.Group,
  x: number,
  y: number,
  kind: EnemyKind,
  patrolMin: number,
  patrolMax: number,
  textureKey: string,
  frame: number,
  spawnShot: (req: EnemyShotRequest) => void
): AnimalEnemy {
  const flying = FLYING_KINDS.has(kind);
  const ENEMY_SCALE = 1.7;
  const srcH = 24;
  const displayH = srcH * ENEMY_SCALE;
  // Map objects are 18px tall; y is the object centre. Sit grounded feet on the floor.
  const spawnY = flying
    ? Math.min(y - 72, 130)
    : y - Math.max(0, displayH / 2 - 9);
  const enemy = group.create(x, spawnY, textureKey, frame) as AnimalEnemy;
  enemy.setCollideWorldBounds(true);
  enemy.setDepth(9);
  enemy.setScale(ENEMY_SCALE);
  enemy.texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
  enemy.hp = 45;
  enemy.maxHp = 45;
  enemy.kind = kind;
  enemy.contactDamage = CONTACT[kind] ?? 10;
  enemy.flying = flying;
  enemy.patrolMin = patrolMin;
  enemy.patrolMax = patrolMax;
  enemy.hoverY = spawnY;
  const body = enemy.body as Phaser.Physics.Arcade.Body;
  // Source sizes (~16×16) scale with the sprite to about 27 world px.
  body.setSize(16, flying ? 14 : 16);
  body.setOffset(4, flying ? 5 : 8);
  body.setAllowGravity(!flying);
  if (flying) body.setGravityY(-scene.physics.world.gravity.y);

  let mode: EnemyMode = 'patrol';
  let elapsed = 0;
  let duration = 0;
  let cooldown = 400 + Math.random() * 600;
  let dir: 1 | -1 = 1;
  let scuttleTimer = 0;
  let attackName = '';
  let lungeVx = 0;

  const enter = (next: EnemyMode, dur: number, attack = ''): void => {
    mode = next;
    elapsed = 0;
    duration = dur;
    if (attack) attackName = attack;
  };

  const facePlayer = (player: Player): void => {
    dir = player.x >= enemy.x ? 1 : -1;
    enemy.setFlipX(dir === 1);
  };

  const inRange = (player: Player, range: number): boolean =>
    Phaser.Math.Distance.Between(enemy.x, enemy.y, player.x, player.y) < range;

  const beginTelegraph = (player: Player): void => {
    facePlayer(player);
    const pick = pickAttack(kind);
    attackName = pick;
    enemy.setTint(0xffe088);
    enter('telegraph', telegraphTime(kind), pick);
  };

  const beginAttack = (player: Player): void => {
    enemy.clearTint();
    facePlayer(player);
    const dmg = 8 + (CONTACT[kind] ?? 10) - 8;
    if (attackName === 'lunge' || attackName === 'bite' || attackName === 'pounce' || attackName === 'slide') {
      lungeVx = dir * (attackName === 'slide' ? 200 : 170);
      enemy.setVelocity(lungeVx, attackName === 'pounce' || attackName === 'bite' ? -180 : flying ? 0 : -40);
      enter('attack', 320, attackName);
    } else if (attackName === 'dive') {
      const dx = Phaser.Math.Clamp(player.x - enemy.x, -160, 160);
      const dy = Phaser.Math.Clamp(player.y - enemy.y, 20, 160);
      enemy.setVelocity(dx * 1.4, dy * 1.5);
      enter('attack', 520, attackName);
    } else if (attackName === 'swoop') {
      const dx = Phaser.Math.Clamp(player.x - enemy.x, -180, 180);
      enemy.setVelocity(dx * 1.5, 140);
      enter('attack', 480, attackName);
    } else if (attackName === 'spit' || attackName === 'drop' || attackName === 'nut' || attackName === 'snow' || attackName === 'sting') {
      const shotKind: EnemyShotKind =
        attackName === 'drop' ? 'drop' : attackName === 'nut' ? 'nut' : attackName === 'snow' ? 'snow' : attackName === 'sting' ? 'sting' : 'spit';
      const originY = attackName === 'drop' ? enemy.y + 8 : enemy.y;
      spawnShot({
        x: enemy.x + dir * 10,
        y: originY,
        vx: attackName === 'drop' ? 0 : dir * (160 + Math.random() * 20),
        vy: attackName === 'drop' ? 40 : attackName === 'nut' ? -40 : 10,
        kind: shotKind,
        damage: Math.max(7, dmg),
        gravity: attackName === 'drop' || attackName === 'nut' || attackName === 'snow',
        life: 1800
      });
      enemy.setVelocityX(0);
      enter('attack', 280, attackName);
    } else {
      enter('attack', 200, attackName);
    }
  };

  const patrolStep = (delta: number): void => {
    scuttleTimer -= delta;
    const burst = kind === 'crab' || kind === 'lizard' || kind === 'scorpion' || kind === 'squirrel';
    let speed = kind === 'puppy' || kind === 'fox' || kind === 'fennec' ? 80 : kind === 'penguin' ? 50 : 60;
    if (burst) {
      if (scuttleTimer <= 0) scuttleTimer = 520;
      speed = scuttleTimer > 260 ? 90 : 20;
    }
    if (flying) {
      const wobble = Math.sin(elapsed / 200) * 16;
      enemy.y = enemy.hoverY + wobble;
      body.setAllowGravity(false);
    }
    if (enemy.x <= enemy.patrolMin) dir = 1;
    if (enemy.x >= enemy.patrolMax) dir = -1;
    enemy.setFlipX(dir === 1);
    enemy.setVelocityX(dir * speed);
    if (flying) enemy.setVelocityY((enemy.hoverY - enemy.y) * 2);
  };

  enemy.updateEnemy = (delta: number, player: Player): void => {
    if (!enemy.active) return;
    elapsed += delta;
    if (enemy.flying) {
      body.setAllowGravity(false);
      body.setGravityY(-scene.physics.world.gravity.y);
    }
    switch (mode) {
      case 'patrol':
        patrolStep(delta);
        cooldown -= delta;
        if (cooldown <= 0 && inRange(player, flying ? 200 : 150) && !player.dead) {
          beginTelegraph(player);
        }
        break;
      case 'telegraph':
        enemy.setVelocityX(0);
        if (!flying) enemy.setVelocityY(enemy.body ? (enemy.body as Phaser.Physics.Arcade.Body).velocity.y : 0);
        enemy.setTint(Math.floor(elapsed / 80) % 2 === 0 ? 0xffe088 : 0xffffff);
        if (elapsed >= duration) beginAttack(player);
        break;
      case 'attack':
        if (attackName === 'dive' || attackName === 'swoop') {
          /* keep dive velocity */
        } else if (lungeVx) {
          enemy.setVelocityX(lungeVx);
        }
        if (elapsed >= duration) {
          lungeVx = 0;
          enemy.clearTint();
          enter('recover', 280);
        }
        break;
      case 'recover':
        enemy.setVelocityX(0);
        if (flying) {
          enemy.setVelocity(0, (enemy.hoverY - enemy.y) * 3);
        }
        if (elapsed >= duration) {
          enemy.clearTint();
          cooldown = 900 + Math.random() * 700;
          enter('patrol', 0);
        }
        break;
    }
  };

  enemy.takeHit = (amount: number): boolean => {
    if (!isPositiveDamage(amount) || !enemy.active) return false;
    enemy.hp = Math.max(0, enemy.hp - Math.round(amount));
    return enemy.hp <= 0;
  };

  enemy.previewAttack = (player: Player): void => {
    beginAttack(player);
    enemy.setTint(0xffcc66);
  };

  const anim = animKeyFor(kind);
  if (scene.anims.exists(anim)) enemy.play(anim, true);
  return enemy;
}

function pickAttack(kind: EnemyKind): string {
  switch (kind) {
    case 'crab':
      return Math.random() < 0.5 ? 'lunge' : 'spit';
    case 'gull':
      return Math.random() < 0.6 ? 'dive' : 'drop';
    case 'puppy':
      return 'bite';
    case 'squirrel':
      return Math.random() < 0.55 ? 'nut' : 'pounce';
    case 'owl':
      return Math.random() < 0.65 ? 'swoop' : 'drop';
    case 'fox':
      return 'pounce';
    case 'penguin':
      return Math.random() < 0.5 ? 'slide' : 'lunge';
    case 'seal':
      return Math.random() < 0.5 ? 'snow' : 'lunge';
    case 'cub':
      return 'bite';
    case 'lizard':
      return Math.random() < 0.55 ? 'spit' : 'lunge';
    case 'fennec':
      return Math.random() < 0.45 ? 'pounce' : 'spit';
    case 'scorpion':
      return Math.random() < 0.5 ? 'lunge' : 'sting';
    default:
      return 'lunge';
  }
}

function telegraphTime(kind: EnemyKind): number {
  if (kind === 'gull' || kind === 'owl') return 480;
  if (kind === 'scorpion' || kind === 'fox') return 360;
  return 400;
}

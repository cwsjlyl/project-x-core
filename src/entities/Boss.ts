import Phaser from 'phaser';
import type { Player } from './Player';

export type BossShotKind = 'bolt' | 'orb' | 'shock' | 'spiral';

export interface BossShotRequest {
  x: number;
  y: number;
  vx: number;
  vy: number;
  kind: BossShotKind;
  damage: number;
  gravity: boolean;
}

export interface ArenaBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

type BossMode = 'idle' | 'walk' | 'telegraph' | 'attack' | 'roar' | 'dead';

export class ThunderRhino extends Phaser.Physics.Arcade.Sprite {
  readonly maxHp = 600;
  hp = 600;
  phase: 1 | 2 | 3 = 1;
  fightStarted = false;
  defeated = false;
  contactDamage = 18;

  private mode: BossMode = 'idle';
  private attackName = '';
  private elapsed = 0;
  private duration = 0;
  private invuln = 0;
  private facing: 1 | -1 = -1;
  private lastAttack = '';
  private walkDir: 1 | -1 = -1;
  private pendingShots: { at: number; req: BossShotRequest }[] = [];
  private aura: Phaser.GameObjects.Rectangle | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly arena: ArenaBounds,
    private readonly spawnShot: (req: BossShotRequest) => void
  ) {
    super(scene, x, y, 'boss_tex');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setSize(48, 40);
    this.setOffset(8, 8);
    this.setDepth(10);
    this.setBounce(0);
  }

  startFight(): void {
    if (this.fightStarted || this.defeated) return;
    this.fightStarted = true;
    this.enter('roar', 1000, 'intro');
    this.invuln = 1000;
  }

  resetFight(x: number, y: number): void {
    if (this.defeated) return;
    this.hp = this.maxHp;
    this.phase = 1;
    this.contactDamage = 18;
    this.pendingShots = [];
    this.invuln = 900;
    this.fightStarted = true;
    this.clearTint();
    this.setAlpha(1);
    if (this.aura) {
      this.aura.destroy();
      this.aura = null;
    }
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
    this.enter('roar', 900, 'intro');
  }

  takeDamage(amount: number): boolean {
    if (!this.fightStarted || this.defeated || this.invuln > 0) return false;
    this.hp = Math.max(0, this.hp - amount);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (!this.active) return;
      this.clearTint();
      this.applyPhaseTint();
    });
    if (this.hp <= 0) {
      this.onDefeated();
      return true;
    }
    this.checkPhaseShift();
    return false;
  }

  updateBoss(delta: number, player: Player): void {
    if (!this.fightStarted || !this.active) return;
    if (this.invuln > 0) this.invuln -= delta;
    this.elapsed += delta;

    if (this.pendingShots.length > 0) {
      const remain: typeof this.pendingShots = [];
      for (const shot of this.pendingShots) {
        if (this.elapsed >= shot.at) this.spawnShot(shot.req);
        else remain.push(shot);
      }
      this.pendingShots = remain;
    }

    if (this.defeated) {
      this.setVelocityX(0);
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body;
    const px = player.x;
    if (this.mode !== 'attack' || this.attackName !== 'charge') {
      if (px < this.x - 8) this.facing = -1;
      else if (px > this.x + 8) this.facing = 1;
      this.setFlipX(this.facing === 1);
    }

    switch (this.mode) {
      case 'roar':
        this.setVelocityX(0);
        this.setAlpha(Math.floor(this.elapsed / 80) % 2 === 0 ? 1 : 0.55);
        if (this.elapsed >= this.duration) {
          this.setAlpha(1);
          this.applyPhaseTint();
          this.enter('idle', 300);
        }
        break;
      case 'idle':
        this.setVelocityX(0);
        if (this.elapsed >= this.duration) this.chooseAction(player);
        break;
      case 'walk':
        this.setVelocityX(this.walkDir * this.walkSpeed());
        this.keepInArena();
        if (body.blocked.left) this.walkDir = 1;
        if (body.blocked.right) this.walkDir = -1;
        if (this.elapsed >= this.duration) this.enter('idle', 200);
        break;
      case 'telegraph':
        this.setVelocityX(0);
        this.setTint(Math.floor(this.elapsed / 70) % 2 === 0 ? 0xffee88 : 0xffffff);
        if (this.elapsed >= this.duration) {
          this.clearTint();
          this.applyPhaseTint();
          this.beginAttack(player);
        }
        break;
      case 'attack':
        this.runAttack(delta, player);
        break;
      case 'dead':
        this.setVelocityX(0);
        break;
    }
  }

  private walkSpeed(): number {
    return this.phase === 1 ? 55 : this.phase === 2 ? 85 : 100;
  }

  private keepInArena(): void {
    const left = this.arena.x + 40;
    const right = this.arena.x + this.arena.width - 40;
    if (this.x < left) {
      this.x = left;
      this.walkDir = 1;
      this.setVelocityX(Math.abs(this.body!.velocity.x));
    } else if (this.x > right) {
      this.x = right;
      this.walkDir = -1;
      this.setVelocityX(-Math.abs(this.body!.velocity.x));
    }
  }

  private chooseAction(player: Player): void {
    const roll = Math.random();
    const options: string[] = [];
    if (this.phase === 1) {
      options.push('walk', 'walk', 'volley', 'volley', 'leap', 'horn');
    } else if (this.phase === 2) {
      options.push('walk', 'volley', 'charge', 'shock', 'leap', 'charge');
    } else {
      options.push('rain', 'spiral', 'charge', 'volley', 'rain');
    }
    let pick = options[Math.floor(roll * options.length)] ?? 'walk';
    if (pick === this.lastAttack && options.length > 1) {
      pick = options[(options.indexOf(pick) + 1) % options.length] ?? 'walk';
    }
    this.lastAttack = pick;
    if (pick === 'walk') {
      this.walkDir = player.x >= this.x ? 1 : -1;
      this.enter('walk', this.phase === 1 ? 800 : 600);
      return;
    }
    this.attackName = pick;
    const telegraph = pick === 'charge' || pick === 'rain' ? 650 : 420;
    this.enter('telegraph', telegraph, pick);
  }

  private beginAttack(player: Player): void {
    this.enter('attack', 1600, this.attackName);
    const dir = player.x >= this.x ? 1 : -1;
    this.facing = dir as 1 | -1;
    this.setFlipX(this.facing === 1);
    const dmg = this.phase === 3 ? 16 : this.phase === 2 ? 14 : 12;

    if (this.attackName === 'volley') {
      const angles = this.phase >= 2 ? [-0.35, -0.12, 0.12, 0.35] : [-0.25, 0, 0.25];
      angles.forEach((ang, i) => {
        const speed = 200;
        this.pendingShots.push({
          at: this.elapsed + i * 90,
          req: {
            x: this.x + this.facing * 24,
            y: this.y - 4,
            vx: Math.cos(ang) * speed * this.facing,
            vy: Math.sin(ang) * speed,
            kind: 'bolt',
            damage: dmg,
            gravity: false
          }
        });
      });
      this.duration = 200 + angles.length * 90;
    } else if (this.attackName === 'horn') {
      this.setVelocity(this.facing * 300, -40);
      this.duration = 320;
    } else if (this.attackName === 'leap') {
      const dx = Phaser.Math.Clamp(player.x - this.x, -220, 220);
      this.setVelocity(dx * 1.6, -360);
      this.duration = 700;
    } else if (this.attackName === 'charge') {
      this.setVelocity(this.facing * (this.phase === 3 ? 420 : 360), 0);
      this.duration = 700;
    } else if (this.attackName === 'shock') {
      const count = 5;
      for (let i = 0; i < count; i++) {
        const sx = this.x + this.facing * (28 + i * 36);
        this.pendingShots.push({
          at: this.elapsed + i * 80,
          req: {
            x: sx,
            y: this.y + 16,
            vx: this.facing * 140,
            vy: 0,
            kind: 'shock',
            damage: dmg + 2,
            gravity: false
          }
        });
      }
      this.setVelocity(0, 0);
      this.duration = 200 + count * 80;
    } else if (this.attackName === 'rain') {
      const left = this.arena.x + 20;
      const right = this.arena.x + this.arena.width - 20;
      const n = 8;
      for (let i = 0; i < n; i++) {
        const rx = left + ((i + 0.3) * (right - left)) / n + (Math.random() * 20 - 10);
        this.pendingShots.push({
          at: this.elapsed + i * 70,
          req: {
            x: rx,
            y: this.arena.y + 24,
            vx: 0,
            vy: 40,
            kind: 'orb',
            damage: dmg,
            gravity: true
          }
        });
      }
      this.duration = 200 + n * 70;
    } else if (this.attackName === 'spiral') {
      const n = 10;
      for (let i = 0; i < n; i++) {
        const ang = (Math.PI * 2 * i) / n;
        const speed = 160;
        this.pendingShots.push({
          at: this.elapsed + i * 40,
          req: {
            x: this.x,
            y: this.y - 6,
            vx: Math.cos(ang) * speed,
            vy: Math.sin(ang) * speed,
            kind: 'spiral',
            damage: dmg,
            gravity: false
          }
        });
      }
      this.duration = 200 + n * 40;
    }
  }

  private runAttack(_delta: number, _player: Player): void {
    if (this.attackName === 'charge' || this.attackName === 'horn') {
      this.keepInArena();
      const body = this.body as Phaser.Physics.Arcade.Body;
      if (body.blocked.left || body.blocked.right) {
        this.setVelocityX(0);
        this.enter('idle', 280);
        return;
      }
    }
    if (this.elapsed >= this.duration) {
      this.setVelocityX(0);
      this.enter('idle', this.phase === 3 ? 180 : 280);
    }
  }

  private checkPhaseShift(): void {
    if (this.phase === 1 && this.hp <= this.maxHp * (2 / 3)) {
      this.phase = 2;
      this.contactDamage = 22;
      this.pendingShots = [];
      this.invuln = 1100;
      this.enter('roar', 1100, 'phase2');
    } else if (this.phase === 2 && this.hp <= this.maxHp * 0.25) {
      this.phase = 3;
      this.contactDamage = 26;
      this.pendingShots = [];
      this.invuln = 1200;
      this.enter('roar', 1200, 'phase3');
      this.spawnAura();
    }
  }

  private spawnAura(): void {
    if (this.aura) return;
    this.aura = this.scene.add
      .rectangle(this.x, this.y, 70, 54, 0xff55ee, 0.18)
      .setDepth(9);
    this.scene.tweens.add({
      targets: this.aura,
      alpha: { from: 0.12, to: 0.32 },
      duration: 280,
      yoyo: true,
      repeat: -1
    });
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.aura) {
      this.aura.setPosition(this.x, this.y);
      this.aura.setVisible(this.visible && !this.defeated);
    }
  }

  private applyPhaseTint(): void {
    if (this.defeated) return;
    if (this.phase === 3) this.setTint(0xff99ee);
    else if (this.phase === 2) this.setTint(0xffddaa);
    else this.clearTint();
  }

  private onDefeated(): void {
    this.defeated = true;
    this.hp = 0;
    this.pendingShots = [];
    this.setVelocity(0, 0);
    this.clearTint();
    this.setTint(0x667788);
    this.enter('dead', 999999, 'dead');
    if (this.aura) {
      this.aura.destroy();
      this.aura = null;
    }
  }

  private enter(mode: BossMode, duration: number, attack = ''): void {
    this.mode = mode;
    this.duration = duration;
    this.elapsed = 0;
    if (attack) this.attackName = attack;
  }

  get phaseLabel(): string {
    if (this.defeated) return '已擊破';
    if (!this.fightStarted) return '';
    if (this.mode === 'roar' && this.attackName === 'phase2') return '第二形態';
    if (this.mode === 'roar' && this.attackName === 'phase3') return '決戰形態';
    return `第 ${this.phase} 階段`;
  }
}

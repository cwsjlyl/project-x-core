import Phaser from 'phaser';
import type { GameInput } from '../systems/GameInput';
import type { DerivedStats, EquipmentSystem } from '../systems/Equipment';

export interface ShotPayload {
  x: number;
  y: number;
  dir: number;
  chargeLevel: 1 | 2 | 3;
  damage: number;
}

const DISPLAY_W = 36;
const DISPLAY_H = 48;
const SRC_W = 48;
const SRC_H = 64;
/** World-space body after scale: 16×34, feet-aligned, under 54px gaps. */
const BODY_W = 16;
const BODY_H = 34;

export class Player extends Phaser.Physics.Arcade.Sprite {
  public level = 1;
  public exp = 0;
  public nextExp = 50;
  public baseMaxHp = 100;
  public hp = 108;
  public baseAtk = 12;
  public dead = false;

  private facing: 1 | -1 = 1;
  private isDashing = false;
  private dashTimer = 0;
  private ghostTimer = 0;
  private wallKickLockTimer = 0;
  private chargeTime = 0;
  private invulnTimer = 0;
  private airDashesLeft = 0;
  private regenAcc = 0;
  private shootPoseTimer = 0;
  private stats: DerivedStats;
  private readonly usesSheet: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly gameInput: GameInput,
    private readonly equipment: EquipmentSystem,
    private readonly onFireCallback: (payload: ShotPayload) => void,
    private readonly onGhostCallback: (x: number, y: number, flipX: boolean) => void
  ) {
    const usesSheet = scene.textures.exists('player');
    super(scene, x, y, usesSheet ? 'player' : 'player_tex');
    this.usesSheet = usesSheet;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setCollideWorldBounds(true);
    this.setupBody();
    this.stats = this.equipment.derive();
    this.hp = this.maxHp;
    if (this.usesSheet) {
      this.play('player-idle', true);
    }
  }

  private setupBody(): void {
    if (this.usesSheet) {
      this.setDisplaySize(DISPLAY_W, DISPLAY_H);
      const sx = DISPLAY_W / SRC_W;
      const sy = DISPLAY_H / SRC_H;
      const srcBodyW = BODY_W / sx;
      const srcBodyH = BODY_H / sy;
      this.setSize(srcBodyW, srcBodyH);
      this.setOffset((SRC_W - srcBodyW) / 2, SRC_H - srcBodyH);
    } else {
      this.setSize(14, 22);
      this.setOffset(3, 4);
    }
  }

  get maxHp(): number {
    return this.baseMaxHp + this.stats.maxHpBonus;
  }

  get attack(): number {
    return this.baseAtk + this.stats.atkBonus;
  }

  get derived(): DerivedStats {
    return this.stats;
  }

  get invulnerable(): boolean {
    return this.invulnTimer > 0 || this.dead;
  }

  get usingSheet(): boolean {
    return this.usesSheet;
  }

  /** 0..1 buster charge, for the CORE energy bar. */
  get chargeRatio(): number {
    return Math.min(1, this.chargeTime / 1100);
  }

  refreshLoadout(): void {
    const prevMax = this.maxHp;
    this.stats = this.equipment.derive();
    const nextMax = this.maxHp;
    if (nextMax !== prevMax) {
      const ratio = prevMax > 0 ? this.hp / prevMax : 1;
      this.hp = Math.max(1, Math.min(nextMax, Math.round(ratio * nextMax)));
    }
    if (!this.stats.canAirDash) this.airDashesLeft = 0;
  }

  updatePlayer(delta: number): void {
    if (this.dead) {
      this.setVelocity(0, 0);
      this.setAlpha(0.4);
      return;
    }

    this.stats = this.equipment.derive();
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;
    const onWallLeft = body.blocked.left && !onGround;
    const onWallRight = body.blocked.right && !onGround;
    const input = this.gameInput;

    if (onGround || onWallLeft || onWallRight) {
      this.airDashesLeft = this.stats.canAirDash ? 1 : 0;
    }

    if (this.invulnTimer > 0) {
      this.invulnTimer -= delta;
      this.setAlpha(Math.floor(this.invulnTimer / 60) % 2 === 0 ? 0.4 : 1);
    } else {
      this.setAlpha(1);
    }

    if (this.stats.regenPerSecond > 0 && this.hp > 0 && this.hp < this.maxHp) {
      this.regenAcc += (this.stats.regenPerSecond * delta) / 1000;
      if (this.regenAcc >= 1) {
        const heal = Math.floor(this.regenAcc);
        this.regenAcc -= heal;
        this.hp = Math.min(this.maxHp, this.hp + heal);
      }
    }

    const canAirDash = this.stats.canAirDash && this.airDashesLeft > 0 && !onGround;
    if (
      input.dashPressed &&
      !this.isDashing &&
      (onGround || onWallLeft || onWallRight || canAirDash)
    ) {
      this.isDashing = true;
      this.dashTimer = 240;
      if (!onGround && !onWallLeft && !onWallRight) {
        this.airDashesLeft = Math.max(0, this.airDashesLeft - 1);
      }
      if (onWallLeft) this.facing = 1;
      if (onWallRight) this.facing = -1;
    }

    if (this.isDashing) {
      this.dashTimer -= delta;
      this.ghostTimer -= delta;
      if (this.ghostTimer <= 0) {
        this.onGhostCallback(this.x, this.y, this.facing === -1);
        this.ghostTimer = 45;
      }
      if (this.dashTimer <= 0 || body.blocked.left || body.blocked.right) {
        this.isDashing = false;
      }
    }

    if (this.wallKickLockTimer > 0) {
      this.wallKickLockTimer -= delta;
    } else {
      const moveSpeed = this.isDashing ? 270 : 145;
      if (input.left) {
        this.facing = -1;
        this.setFlipX(true);
        body.setVelocityX(-moveSpeed);
      } else if (input.right) {
        this.facing = 1;
        this.setFlipX(false);
        body.setVelocityX(moveSpeed);
      } else if (this.isDashing && (onGround || this.dashTimer > 0)) {
        body.setVelocityX(this.facing * moveSpeed);
      } else if (!this.isDashing) {
        body.setVelocityX(0);
      }
    }

    const wallSliding = (onWallLeft || onWallRight) && body.velocity.y > 0;
    if (wallSliding) {
      body.setVelocityY(55);
    }

    if (input.jumpPressed) {
      if (onGround) {
        body.setVelocityY(-340);
      } else if (onWallLeft || onWallRight) {
        const kickDir: 1 | -1 = onWallLeft ? 1 : -1;
        this.facing = kickDir;
        this.setFlipX(kickDir === -1);
        const kickSpeedX = input.dashHeld ? 260 : 185;
        body.setVelocity(kickDir * kickSpeedX, -320);
        this.wallKickLockTimer = 140;
        this.isDashing = false;
      }
    }

    if (input.shootHeld) {
      this.chargeTime += delta * this.stats.chargeSpeed;
      if (this.chargeTime >= 1100) {
        this.setTint(Math.floor(this.chargeTime / 70) % 2 === 0 ? 0x00ffff : 0xffffff);
      } else if (this.chargeTime >= 400) {
        this.setTint(Math.floor(this.chargeTime / 90) % 2 === 0 ? 0x88eeff : 0xffffff);
      }
    }

    if (input.shootReleased) {
      this.fireChargedShot();
    }

    if (this.shootPoseTimer > 0) {
      this.shootPoseTimer -= delta;
    }

    this.updateAnimation(onGround, wallSliding, body.velocity.x);
  }

  private updateAnimation(onGround: boolean, wallSliding: boolean, vx: number): void {
    if (!this.usesSheet) return;
    let key = 'player-idle';
    if (this.isDashing) key = 'player-dash';
    else if (wallSliding) key = 'player-wall';
    else if (!onGround) key = 'player-jump';
    else if (this.shootPoseTimer > 0) key = 'player-shoot';
    else if (Math.abs(vx) > 8) key = 'player-walk';
    if (this.anims.currentAnim?.key !== key) {
      this.play(key, true);
    }
  }

  private fireChargedShot(): void {
    let chargeLevel: 1 | 2 | 3 = 1;
    let multiplier = 1;
    if (this.chargeTime >= 1100) {
      chargeLevel = 3;
      multiplier = 3.2;
    } else if (this.chargeTime >= 400) {
      chargeLevel = 2;
      multiplier = 1.8;
    }
    const damage = Math.round(this.attack * multiplier);
    const payload: ShotPayload = {
      x: this.x + this.facing * 14,
      y: this.y + 1,
      dir: this.facing,
      chargeLevel,
      damage
    };
    this.onFireCallback(payload);
    if (this.stats.doubleShot) {
      this.onFireCallback({
        ...payload,
        y: payload.y + 8,
        x: payload.x + this.facing * 2
      });
    }
    this.chargeTime = 0;
    this.shootPoseTimer = 180;
    this.clearTint();
  }

  gainExp(amount: number): boolean {
    this.exp += amount;
    let leveled = false;
    while (this.exp >= this.nextExp) {
      this.exp -= this.nextExp;
      this.level++;
      this.nextExp = Math.round(this.nextExp * 1.4);
      this.baseMaxHp += 20;
      this.baseAtk += 4;
      this.hp = this.maxHp;
      leveled = true;
    }
    return leveled;
  }

  takeDamage(dmg: number): void {
    if (this.invulnTimer > 0 || this.dead) return;
    const reduced = Math.max(1, Math.round(dmg * (1 - this.stats.damageReduction)));
    this.hp = Math.max(0, this.hp - reduced);
    this.invulnTimer = this.stats.invulnMs;
    if (this.hp <= 0) {
      this.dead = true;
      this.setVelocity(0, 0);
      this.setAlpha(0.4);
    }
  }

  reviveAt(x: number, y: number): void {
    this.dead = false;
    this.hp = this.maxHp;
    this.invulnTimer = 1200;
    this.chargeTime = 0;
    this.isDashing = false;
    this.shootPoseTimer = 0;
    this.clearTint();
    this.setAlpha(1);
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
    this.setupBody();
  }
}

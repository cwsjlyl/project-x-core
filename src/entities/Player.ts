import Phaser from 'phaser';
import type { GameInput } from '../systems/GameInput';
import type { DerivedStats, EquipmentSystem } from '../systems/Equipment';
import { bakeHeroLook, chipAuraTint, LOOK_KEY } from '../systems/HeroLook';
import { finiteNumber, isPositiveDamage } from '../systems/CombatMath';
import { gameAudio } from '../systems/Audio';

export interface ShotPayload {
  x: number;
  y: number;
  dir: number;
  chargeLevel: 1 | 2 | 3;
  damage: number;
  unarmed?: boolean;
  vy?: number;
  bulletScale?: number;
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
  public hp = 100;
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
  private stunTimer = 0;
  private aura: Phaser.GameObjects.Image | null = null;
  private shieldFx: Phaser.GameObjects.Image | null = null;
  private shieldCd = 0;
  private shieldLeft = 0;
  private stats: DerivedStats;
  private readonly usesSheet: boolean;
  private surface: 'normal' | 'ice' | 'sand' = 'normal';
  private iceVx = 0;


  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private readonly gameInput: GameInput,
    private readonly equipment: EquipmentSystem,
    private readonly onFireCallback: (payload: ShotPayload) => void,
    private readonly onGhostCallback: (x: number, y: number, flipX: boolean) => void
  ) {
    const usesSheet = scene.textures.exists(LOOK_KEY) || scene.textures.exists('player');
    const key = scene.textures.exists(LOOK_KEY) ? LOOK_KEY : usesSheet ? 'player' : 'player_tex';
    super(scene, x, y, key);
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
    bakeHeroLook(scene, this.equipment);
    this.syncAura();
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

  setSurface(kind: 'normal' | 'ice' | 'sand'): void {
    this.surface = kind;
    if (kind !== 'ice') this.iceVx = 0;
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
    bakeHeroLook(this.scene, this.equipment);
    this.syncAura();
  }

  stun(ms: number, opts?: { invuln?: boolean }): void {
    if (this.dead) return;
    this.stunTimer = Math.max(this.stunTimer, ms);
    this.chargeTime = 0;
    this.isDashing = false;
    this.setVelocity(0, 0);
    this.clearTint();
    if (opts?.invuln) {
      this.invulnTimer = Math.max(this.invulnTimer, ms);
    }
  }

  get isStunned(): boolean {
    return this.stunTimer > 0;
  }

  restore(data: { level: number; exp: number; nextExp: number; baseMaxHp: number; hp: number; baseAtk: number }): void {
    this.level = data.level;
    this.exp = data.exp;
    this.nextExp = data.nextExp;
    this.baseMaxHp = data.baseMaxHp;
    this.baseAtk = data.baseAtk;
    this.stats = this.equipment.derive();
    const hp = finiteNumber(data.hp, this.maxHp);
    this.hp = Math.max(1, Math.min(this.maxHp, hp));
    bakeHeroLook(this.scene, this.equipment);
    this.syncAura();
  }

  updatePlayer(delta: number): void {
    if (this.dead) {
      this.setVelocity(0, 0);
      this.setAlpha(0.4);
      return;
    }

    this.stats = this.equipment.derive();
    this.syncAura();
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      this.setVelocity(0, 0);
      this.chargeTime = 0;
      this.setTint(Math.floor(this.stunTimer / 80) % 2 === 0 ? 0xffff66 : 0xffffff);
      if (this.invulnTimer > 0) this.invulnTimer -= delta;
      if (this.stunTimer <= 0) this.clearTint();
      this.updateAnimation(true, false, 0);
      return;
    }
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
      if (this.shieldVisible) this.setAlpha(1);
      else this.setAlpha(Math.floor(this.invulnTimer / 60) % 2 === 0 ? 0.4 : 1);
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
      // Short basic dash without leg armor; full dash when legs are on.
      this.dashTimer = this.equipment.hasLegs() ? 240 : 160;
      if (!onGround && !onWallLeft && !onWallRight) {
        this.airDashesLeft = Math.max(0, this.airDashesLeft - 1);
      }
      if (onWallLeft) this.facing = 1;
      if (onWallRight) this.facing = -1;
      gameAudio.play('dash');
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
      const baseSpeed = this.isDashing ? (this.equipment.hasLegs() ? 270 : 200) : 145;
      const moveSpeed =
        this.surface === 'sand' && onGround && !this.isDashing ? Math.round(baseSpeed * 0.48) : baseSpeed;
      if (input.left) {
        this.facing = -1;
        this.setFlipX(true);
        body.setVelocityX(-moveSpeed);
        if (this.surface === 'ice' && onGround) this.iceVx = -moveSpeed;
      } else if (input.right) {
        this.facing = 1;
        this.setFlipX(false);
        body.setVelocityX(moveSpeed);
        if (this.surface === 'ice' && onGround) this.iceVx = moveSpeed;
      } else if (this.isDashing && (onGround || this.dashTimer > 0)) {
        body.setVelocityX(this.facing * moveSpeed);
        if (this.surface === 'ice' && onGround) this.iceVx = this.facing * moveSpeed;
      } else if (!this.isDashing) {
        if (this.surface === 'ice' && onGround) {
          this.iceVx *= 0.94;
          if (Math.abs(this.iceVx) < 8) this.iceVx = 0;
          body.setVelocityX(this.iceVx);
        } else {
          this.iceVx = 0;
          body.setVelocityX(0);
        }
      }
    }

    const wallSliding = (onWallLeft || onWallRight) && body.velocity.y > 0;
    if (wallSliding) {
      body.setVelocityY(55);
    }

    if (input.jumpPressed) {
      const boost = Math.min(80, Math.max(0, this.stats.jumpBoost || 0));
      if (onGround) {
        body.setVelocityY(-400 - boost);
        gameAudio.play('jump');
      } else if (onWallLeft || onWallRight) {
        const kickDir: 1 | -1 = onWallLeft ? 1 : -1;
        this.facing = kickDir;
        this.setFlipX(kickDir === -1);
        const kickSpeedX = input.dashHeld ? 260 : 185;
        body.setVelocity(kickDir * kickSpeedX, -380 - Math.round(boost * 0.7));
        this.wallKickLockTimer = 140;
        this.isDashing = false;
        gameAudio.play('jump');
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

    this.updateShield(delta);

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
    const unarmed = !this.equipment.hasArms();
    // Unarmed default pellet: same 3 charge tiers, but weaker than a cannon shot.
    if (unarmed) multiplier *= 0.6;
    const damage = Math.max(1, Math.round(finiteNumber(this.attack, 12) * multiplier));
    if (!Number.isFinite(damage) || damage <= 0) return;
    const payload: ShotPayload = {
      x: this.x + this.facing * 14,
      y: this.y + 1,
      dir: this.facing,
      chargeLevel,
      damage,
      unarmed,
      bulletScale: this.stats.bulletScale
    };
    const fire = (shot: ShotPayload) => this.onFireCallback(shot);
    fire(payload);
    if (this.stats.spreadShot) {
      fire({ ...payload, vy: -0.34 });
      fire({ ...payload, vy: 0.34 });
    }
    gameAudio.play(chargeLevel >= 3 ? 'shoot3' : 'shoot');
    if (this.stats.doubleShot) {
      const extra = { ...payload, y: payload.y + 8, x: payload.x + this.facing * 2 };
      fire(extra);
      if (this.stats.spreadShot) {
        fire({ ...extra, vy: -0.34 });
        fire({ ...extra, vy: 0.34 });
      }
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
    if (!isPositiveDamage(dmg)) return;
    const reduced = Math.max(1, Math.round(dmg * (1 - finiteNumber(this.stats.damageReduction))));
    if (!Number.isFinite(reduced)) return;
    this.hp = Math.max(0, this.hp - reduced);
    this.invulnTimer = this.stats.invulnMs;
    if (this.hp <= 0) {
      this.dead = true;
      this.setVelocity(0, 0);
      this.setAlpha(0.4);
      gameAudio.play('die');
    } else {
      gameAudio.play('hurt');
    }
  }

  reviveAt(x: number, y: number): void {
    this.dead = false;
    this.hp = this.maxHp;
    this.invulnTimer = 1200;
    this.chargeTime = 0;
    this.isDashing = false;
    this.shootPoseTimer = 0;
    this.stunTimer = 0;
    this.clearTint();
    this.setAlpha(1);
    this.enableBody(true, x, y, true, true);
    this.setVelocity(0, 0);
    this.setupBody();
  }

  get shieldVisible(): boolean {
    return this.shieldLeft > 0 && !this.dead;
  }

  /** Local preview: show the pulse shield without the hurt flicker. */
  previewShield(ms = 1400): void {
    this.invulnTimer = 0;
    this.setAlpha(1);
    this.shieldLeft = ms;
    this.shieldCd = 0;
    this.syncShieldFx();
  }


  private updateShield(delta: number): void {
    const period = this.stats.shieldPeriod;
    const duration = this.stats.shieldDuration;
    if (period <= 0 || duration <= 0 || this.dead) {
      this.shieldLeft = 0;
      this.syncShieldFx();
      return;
    }
    if (this.shieldLeft > 0) {
      this.shieldLeft -= delta;
      if (this.shieldLeft < 0) this.shieldLeft = 0;
    } else {
      this.shieldCd += delta;
      if (this.shieldCd >= period) {
        this.shieldCd = 0;
        this.shieldLeft = duration;
        this.invulnTimer = Math.max(this.invulnTimer, duration);
      }
    }
    this.syncShieldFx();
  }

  private syncAura(): void {
    if (!this.aura) {
      const key = this.scene.textures.exists('aura_tex') ? 'aura_tex' : '';
      if (!key) return;
      this.aura = this.scene.add.image(this.x, this.y, key).setDepth(9);
      this.aura.setBlendMode(Phaser.BlendModes.ADD);
    }
    const tint = chipAuraTint(this.equipment);
    this.aura.setPosition(this.x, this.y - 2);
    this.aura.setVisible(!!tint && this.visible && !this.dead);
    if (tint) this.aura.setTint(tint);
    this.aura.setAlpha(this.alpha * 0.7);
    this.aura.setScale(1.05);
  }

  private syncShieldFx(): void {
    if (!this.shieldFx) {
      const key = this.scene.textures.exists('shield_tex') ? 'shield_tex' : '';
      if (!key) return;
      this.shieldFx = this.scene.add.image(this.x, this.y, key).setDepth(12);
      this.shieldFx.setBlendMode(Phaser.BlendModes.ADD);
    }
    const on = this.shieldVisible;
    this.shieldFx.setVisible(on);
    if (!on) return;
    this.shieldFx.setPosition(this.x, this.y);
    const pulse = 0.55 + 0.25 * Math.sin(this.scene.time.now / 90);
    this.shieldFx.setAlpha(pulse);
    this.shieldFx.setScale(1.05 + 0.06 * Math.sin(this.scene.time.now / 70));
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.aura) {
      this.aura.setPosition(this.x, this.y - 2);
      this.aura.setAlpha(this.alpha * 0.7);
    }
    if (this.shieldFx && this.shieldFx.visible) {
      this.shieldFx.setPosition(this.x, this.y);
    }
  }
}

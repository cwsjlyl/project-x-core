import Phaser from 'phaser';
import { UI_FONT } from '../constants';
import { Player, type ShotPayload } from '../entities/Player';
import { ThunderRhino, type BossShotRequest } from '../entities/Boss';
import { EquipmentSystem, ITEM_CATALOG } from '../systems/Equipment';
import { EquipmentUI } from '../systems/EquipmentUI';
import { GameInput } from '../systems/GameInput';
import { loadStage, type StageData } from '../systems/MapLoader';
import { TouchControls } from '../systems/TouchControls';

interface EnemySprite extends Phaser.Physics.Arcade.Sprite {
  hp: number;
  patrolMin: number;
  patrolMax: number;
}

const PICKUP_TINT: Record<string, number> = {
  helmet: 0x66e0ff,
  body: 0x4a9fff,
  arms: 0xffe066,
  legs: 0x66ff99,
  chip: 0xff66cc
};

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private boss!: ThunderRhino;
  private stage!: StageData;
  private bulletPool!: Phaser.Physics.Arcade.Group;
  private ghostPool!: Phaser.GameObjects.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bossShots!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private playerLight: Phaser.GameObjects.Light | null = null;
  private hudText!: Phaser.GameObjects.Text;
  private messageText!: Phaser.GameObjects.Text;
  private bossBarBg!: Phaser.GameObjects.Rectangle;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarLabel!: Phaser.GameObjects.Text;
  private gameInput = new GameInput();
  private equipment = new EquipmentSystem();
  private equipUI!: EquipmentUI;
  private touch!: TouchControls;
  private useLights = false;
  private doorBlocker!: Phaser.Physics.Arcade.Image;
  private fightLocked = false;
  private battleClear = false;
  private checkpoint: { x: number; y: number } = { x: 80, y: 200 };
  private statusTimer = 0;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.useLights = this.tryEnableLights();
    this.stage = loadStage(this, this.useLights);

    const { worldWidth, worldHeight, playerSpawn, arena } = this.stage;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.checkpoint = { ...playerSpawn };

    if (this.useLights) {
      this.playerLight = this.lights.addLight(playerSpawn.x, playerSpawn.y, 130, 0x00e5ff, 1.6);
    }

    this.bulletPool = this.physics.add.group({
      defaultKey: 'buster_tex',
      maxSize: 30,
      allowGravity: false
    });
    this.ghostPool = this.add.group({ defaultKey: 'player_tex', maxSize: 16 });
    this.bossShots = this.physics.add.group({
      defaultKey: 'boss_bolt_tex',
      maxSize: 30,
      allowGravity: false
    });
    this.pickups = this.physics.add.group({ allowGravity: false });
    this.enemies = this.physics.add.group();

    this.gameInput.attach(this);
    this.player = new Player(
      this,
      playerSpawn.x,
      playerSpawn.y,
      this.gameInput,
      this.equipment,
      (payload) => this.spawnBullet(payload),
      (gx, gy, flip) => this.spawnDashGhost(gx, gy, flip)
    );
    this.player.setDepth(10);
    this.applyLight(this.player);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.spawnMappedEnemies();
    this.spawnMappedPickups();

    this.boss = new ThunderRhino(
      this,
      this.stage.bossSpawn.x,
      this.stage.bossSpawn.y,
      arena,
      (req) => this.spawnBossShot(req)
    );
    this.applyLight(this.boss);

    this.doorBlocker = this.physics.add.staticImage(
      this.stage.door.x + this.stage.door.width / 2,
      this.stage.door.y + this.stage.door.height / 2,
      'door_block_tex'
    );
    this.doorBlocker.setDisplaySize(this.stage.door.width, this.stage.door.height);
    this.doorBlocker.refreshBody();
    this.doorBlocker.disableBody(true, true);
    this.doorBlocker.setDepth(5);

    this.physics.add.collider(this.player, this.stage.solid);
    this.physics.add.collider(this.enemies, this.stage.solid);
    this.physics.add.collider(this.boss, this.stage.solid);
    this.physics.add.collider(this.player, this.doorBlocker);
    this.physics.add.collider(this.boss, this.doorBlocker);
    this.physics.add.collider(this.bulletPool, this.stage.solid, (bullet) => {
      this.recycleBullet(bullet as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.collider(this.bossShots, this.stage.solid, (shot) => {
      this.recycleBossShot(shot as Phaser.Physics.Arcade.Sprite);
    });

    this.physics.add.overlap(this.bulletPool, this.enemies, (bObj, eObj) => {
      this.onBulletHitEnemy(
        bObj as Phaser.Physics.Arcade.Sprite,
        eObj as EnemySprite
      );
    });
    this.physics.add.overlap(this.bulletPool, this.boss, (bObj) => {
      this.onBulletHitBoss(bObj as Phaser.Physics.Arcade.Sprite);
    });
    this.physics.add.overlap(this.player, this.enemies, () => {
      this.player.takeDamage(15);
    });
    this.physics.add.overlap(this.player, this.boss, () => {
      if (this.boss.fightStarted && !this.boss.defeated) {
        this.player.takeDamage(this.boss.contactDamage);
      }
    });
    this.physics.add.overlap(this.player, this.bossShots, (_p, sObj) => {
      const shot = sObj as Phaser.Physics.Arcade.Sprite;
      if (!shot.active || this.boss.defeated) return;
      const dmg = (shot.getData('damage') as number) || 12;
      this.player.takeDamage(dmg);
      this.recycleBossShot(shot);
    });
    this.physics.add.overlap(this.player, this.pickups, (_p, pObj) => {
      this.collectPickup(pObj as Phaser.Physics.Arcade.Sprite);
    });

    this.createHud();
    this.touch = new TouchControls(this, this.gameInput);
    this.equipUI = new EquipmentUI(this, this.equipment, () => {
      this.player.refreshLoadout();
      this.syncLightRadius();
      this.updateHud();
    });

    this.showBanner('工業迴廊　—　前方有高能量反應', 2600);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllKeys(true);
      this.time.removeAllEvents();
    });
  }

  update(_time: number, delta: number): void {
    this.gameInput.poll();

    if (this.gameInput.equipPressed && !this.player.dead) {
      this.equipUI.toggle();
      this.touch.setPaused(this.equipUI.isOpen);
    }
    if (this.equipUI.isOpen) {
      this.updateHud();
      return;
    }

    if (this.player.dead) {
      this.messageText.setText('系統過載　按「跳」重新起動');
      this.messageText.setVisible(true);
      if (this.gameInput.jumpPressed) this.retryFromCheckpoint();
      this.updateBossBar();
      this.updateHud();
      return;
    }

    this.player.updatePlayer(delta);
    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y);
    }

    const cam = this.cameras.main.worldView;
    this.bulletPool.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Sprite;
      if (b.active && (b.x < cam.left - 40 || b.x > cam.right + 40)) {
        this.recycleBullet(b);
      }
      return true;
    });
    this.bossShots.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Sprite;
      if (!b.active) return true;
      const life = (b.getData('life') as number) - delta;
      b.setData('life', life);
      if (life <= 0 || b.x < cam.left - 60 || b.x > cam.right + 60 || b.y > 300 || b.y < -40) {
        this.recycleBossShot(b);
      }
      return true;
    });

    this.enemies.children.each((child) => {
      const e = child as EnemySprite;
      if (!e.active) return true;
      if (e.x <= e.patrolMin) e.setVelocityX(55);
      if (e.x >= e.patrolMax) e.setVelocityX(-55);
      return true;
    });

    this.boss.updateBoss(delta, this.player);
    this.checkBossTrigger();
    this.updateCheckpoints();

    if (this.statusTimer > 0) {
      this.statusTimer -= delta;
      if (this.statusTimer <= 0) {
        if (!this.player.dead && !this.battleClear) this.messageText.setVisible(false);
      }
    }

    if (this.player.dead) {
      this.messageText.setText('系統過載　按「跳」重新起動');
      this.messageText.setVisible(true);
    }

    this.updateBossBar();
    this.updateHud();
  }

  private tryEnableLights(): boolean {
    if (this.game.renderer.type !== Phaser.WEBGL) return false;
    try {
      this.lights.enable().setAmbientColor(0x7a8aa8);
      return true;
    } catch {
      return false;
    }
  }

  private applyLight(obj: Phaser.GameObjects.Components.Pipeline): void {
    if (this.useLights) obj.setPipeline('Light2D');
  }

  private syncLightRadius(): void {
    if (this.playerLight) {
      this.playerLight.setRadius(this.player.derived.lightRadius);
    }
  }

  private spawnMappedEnemies(): void {
    for (const zone of this.stage.enemies) {
      const enemy = this.enemies.create(zone.x, zone.y, 'enemy_tex') as EnemySprite;
      this.applyLight(enemy);
      enemy.setCollideWorldBounds(true);
      enemy.setDepth(9);
      enemy.hp = 45;
      enemy.patrolMin = zone.patrolMin;
      enemy.patrolMax = zone.patrolMax;
      enemy.setVelocityX(55);
    }
  }

  private spawnMappedPickups(): void {
    for (const p of this.stage.pickups) {
      const spr = this.pickups.create(p.x, p.y, 'pickup_tex') as Phaser.Physics.Arcade.Sprite;
      spr.setData('itemId', p.itemId);
      const def = ITEM_CATALOG[p.itemId];
      spr.setTint(PICKUP_TINT[def?.kind ?? 'chip'] ?? 0xffffff);
      spr.setDepth(8);
      this.applyLight(spr);
      (spr.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
      this.tweens.add({
        targets: spr,
        y: p.y - 3,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }
  }

  private collectPickup(spr: Phaser.Physics.Arcade.Sprite): void {
    if (!spr.active) return;
    const itemId = spr.getData('itemId') as string;
    const item = ITEM_CATALOG[itemId];
    spr.disableBody(true, true);
    if (!item) return;
    const granted = this.equipment.grant(itemId);
    const msg = granted ? `獲得：${item.name}　按 E 裝備` : `已擁有：${item.name}`;
    this.showBanner(msg, 2400);
    this.showFloatingText(spr.x, spr.y - 12, item.name, '#7ef0ff');
    this.equipUI.refresh();
  }

  private checkBossTrigger(): void {
    if (this.fightLocked || this.battleClear) return;
    const t = this.stage.trigger;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const px = body.center.x;
    const py = body.center.y;
    if (px >= t.x && px <= t.x + t.width && py >= t.y && py <= t.y + t.height) {
      this.beginBossFight();
    }
  }

  private beginBossFight(): void {
    this.fightLocked = true;
    this.doorBlocker.enableBody(true, this.doorBlocker.x, this.doorBlocker.y, true, true);
    this.doorBlocker.setDisplaySize(this.stage.door.width, this.stage.door.height);
    this.doorBlocker.refreshBody();
    const a = this.stage.arena;
    this.cameras.main.setBounds(a.x, a.y, a.width, a.height);
    this.boss.startFight();
    this.showBanner('雷霆犀　降臨', 1800);
    this.bossBarBg.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.bossBarLabel.setVisible(true);
  }

  private onBossDefeated(): void {
    this.battleClear = true;
    this.fightLocked = false;
    this.doorBlocker.disableBody(true, true);
    this.cameras.main.setBounds(0, 0, this.stage.worldWidth, this.stage.worldHeight);
    const leveled = this.player.gainExp(200);
    const granted = this.equipment.grant('helm_thunder');
    const bits = ['關卡清除！'];
    if (granted) bits.push('獲得：雷霆角盔');
    if (leveled) bits.push('LEVEL UP!');
    this.showBanner(bits.join('　'), 6000);
    this.messageText.setText(bits.join('\n'));
    this.messageText.setVisible(true);
    this.showFloatingText(this.boss.x, this.boss.y - 28, '擊破！', '#00ff88');
    this.equipUI.refresh();
  }

  private retryFromCheckpoint(): void {
    this.player.reviveAt(this.checkpoint.x, this.checkpoint.y);
    this.messageText.setVisible(false);
    if (this.fightLocked && !this.battleClear) {
      this.boss.resetFight(this.stage.bossSpawn.x, this.stage.bossSpawn.y);
      this.showBanner('重新起動　首領戰再開', 1600);
    } else {
      this.showBanner('系統重新起動', 1400);
    }
  }

  private updateCheckpoints(): void {
    for (const cp of this.stage.checkpoints) {
      if (Math.abs(this.player.x - cp.x) < 24 && Math.abs(this.player.y - cp.y) < 28) {
        this.checkpoint = { ...cp };
      }
    }
    if (this.fightLocked) {
      // Respawn just inside the arena so the closed door cannot softlock the player.
      this.checkpoint = {
        x: this.stage.arena.x + 48,
        y: this.stage.playerSpawn.y
      };
    }
  }

  private onBulletHitEnemy(bullet: Phaser.Physics.Arcade.Sprite, enemy: EnemySprite): void {
    if (!bullet.active || !enemy.active) return;
    const dmg = bullet.getData('damage') as number;
    const level = bullet.getData('chargeLevel') as number;
    enemy.hp -= dmg;
    this.showFloatingText(enemy.x, enemy.y - 12, `-${dmg}`, level === 3 ? '#00ffff' : '#ffeb3b');
    if (level < 3 || enemy.hp > 0) this.recycleBullet(bullet);
    if (enemy.hp <= 0) {
      enemy.disableBody(true, true);
      const leveledUp = this.player.gainExp(25);
      if (leveledUp) this.showFloatingText(this.player.x, this.player.y - 24, 'LEVEL UP!', '#00ff88');
    }
  }

  private onBulletHitBoss(bullet: Phaser.Physics.Arcade.Sprite): void {
    if (!bullet.active || !this.boss.active || !this.boss.fightStarted) return;
    const base = bullet.getData('damage') as number;
    const level = bullet.getData('chargeLevel') as number;
    const dmg = Math.round(base * (1 + this.player.derived.bossDamageBonus));
    const slain = this.boss.takeDamage(dmg);
    this.showFloatingText(this.boss.x, this.boss.y - 20, `-${dmg}`, level === 3 ? '#00ffff' : '#ffeb3b');
    if (level < 3 || this.boss.hp > 0) this.recycleBullet(bullet);
    if (slain) this.onBossDefeated();
  }

  private spawnBullet(payload: ShotPayload): void {
    const bullet = this.bulletPool.get(payload.x, payload.y, 'buster_tex') as
      | Phaser.Physics.Arcade.Sprite
      | null;
    if (!bullet) return;
    bullet.enableBody(true, payload.x, payload.y, true, true);
    this.applyLight(bullet);
    bullet.setDepth(15);
    bullet.setData('damage', payload.damage);
    bullet.setData('chargeLevel', payload.chargeLevel);
    const scale = payload.chargeLevel === 3 ? 2.0 : payload.chargeLevel === 2 ? 1.4 : 0.9;
    bullet.setScale(scale);
    bullet.setTint(payload.chargeLevel === 3 ? 0x00ffff : payload.chargeLevel === 2 ? 0x80d8ff : 0xfff59d);
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    bullet.setVelocityX(payload.dir * 380);
    bullet.setVelocityY(0);
  }

  private recycleBullet(bullet: Phaser.Physics.Arcade.Sprite): void {
    bullet.disableBody(true, true);
  }

  private spawnDashGhost(x: number, y: number, flipX: boolean): void {
    const ghost = this.ghostPool.get(x, y, 'player_tex') as Phaser.GameObjects.Sprite | null;
    if (!ghost) return;
    ghost.setActive(true).setVisible(true).setPosition(x, y).setFlipX(flipX);
    ghost.setTint(0x00e5ff).setAlpha(0.55).setDepth(9);
    this.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        ghost.setActive(false).setVisible(false);
      }
    });
  }

  private spawnBossShot(req: BossShotRequest): void {
    const key =
      req.kind === 'orb' || req.kind === 'spiral'
        ? 'boss_orb_tex'
        : req.kind === 'shock'
          ? 'boss_shock_tex'
          : 'boss_bolt_tex';
    const shot = this.bossShots.get(req.x, req.y, key) as Phaser.Physics.Arcade.Sprite | null;
    if (!shot) return;
    shot.enableBody(true, req.x, req.y, true, true);
    shot.setTexture(key);
    this.applyLight(shot);
    shot.setDepth(14);
    shot.setScale(1);
    shot.setData('damage', req.damage);
    shot.setData('life', 2600);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(req.gravity);
    shot.setVelocity(req.vx, req.vy);
    if (req.kind === 'orb') shot.setTint(0xff88ee);
    else if (req.kind === 'shock') shot.setTint(0xffee55);
    else shot.clearTint();
  }

  private recycleBossShot(shot: Phaser.Physics.Arcade.Sprite): void {
    shot.disableBody(true, true);
  }

  private createHud(): void {
    this.hudText = this.add
      .text(8, 6, '', {
        fontFamily: UI_FONT,
        fontSize: '11px',
        color: '#e0f7fa',
        stroke: '#000000',
        strokeThickness: 3
      })
      .setScrollFactor(0)
      .setDepth(200);
    this.add
      .text(8, 22, '方向鍵／AD 移動　Z／空白 跳　X 射擊　C 衝刺　E 裝備', {
        fontFamily: UI_FONT,
        fontSize: '8px',
        color: '#80deea'
      })
      .setScrollFactor(0)
      .setDepth(200);

    this.messageText = this.add
      .text(240, 70, '', {
        fontFamily: UI_FONT,
        fontSize: '13px',
        color: '#fff3a0',
        stroke: '#000',
        strokeThickness: 4,
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(300)
      .setVisible(false);

    this.bossBarBg = this.add
      .rectangle(240, 42, 204, 10, 0x140a10, 0.9)
      .setStrokeStyle(1, 0xffe088)
      .setScrollFactor(0)
      .setDepth(210)
      .setVisible(false);
    this.bossBarFill = this.add
      .rectangle(140, 42, 200, 6, 0xff4466)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(211)
      .setVisible(false);
    this.bossBarLabel = this.add
      .text(240, 32, '雷霆犀', {
        fontFamily: UI_FONT,
        fontSize: '9px',
        color: '#ffe8a0',
        stroke: '#000',
        strokeThickness: 3
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(211)
      .setVisible(false);

    this.updateHud();
  }

  private updateHud(): void {
    const p = this.player;
    this.hudText.setText(
      `LV.${p.level} HP: ${p.hp}/${p.maxHp} ATK: ${p.attack} EXP: ${p.exp}/${p.nextExp}`
    );
  }

  private updateBossBar(): void {
    if (!this.boss?.fightStarted) return;
    const ratio = Math.max(0, this.boss.hp / this.boss.maxHp);
    this.bossBarFill.width = 200 * ratio;
    const label = this.boss.defeated ? '雷霆犀　已擊破' : `雷霆犀　${this.boss.phaseLabel}`;
    this.bossBarLabel.setText(label);
    if (this.boss.defeated) this.bossBarFill.setFillStyle(0x668088);
    else if (this.boss.phase === 3) this.bossBarFill.setFillStyle(0xff55cc);
    else if (this.boss.phase === 2) this.bossBarFill.setFillStyle(0xff8844);
    else this.bossBarFill.setFillStyle(0xff4466);
  }

  private showBanner(msg: string, duration: number): void {
    this.statusTimer = duration;
    this.messageText.setText(msg);
    this.messageText.setVisible(true);
  }

  private showFloatingText(x: number, y: number, msg: string, color: string): void {
    const txt = this.add
      .text(x, y, msg, {
        fontFamily: UI_FONT,
        fontSize: '10px',
        color,
        stroke: '#000',
        strokeThickness: 2
      })
      .setOrigin(0.5)
      .setDepth(20);
    this.tweens.add({
      targets: txt,
      y: y - 18,
      alpha: 0,
      duration: 550,
      onComplete: () => txt.destroy()
    });
  }
}

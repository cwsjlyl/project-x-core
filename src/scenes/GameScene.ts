import Phaser from 'phaser';
import { Player, type ShotPayload } from '../entities/Player';
import { StageBoss, type BossShotRequest } from '../entities/Boss';
import { createAnimalEnemy, type AnimalEnemy, type EnemyShotRequest } from '../entities/Enemy';
import { EquipmentSystem, ITEM_CATALOG } from '../systems/Equipment';
import { EquipmentUI } from '../systems/EquipmentUI';
import { GameInput } from '../systems/GameInput';
import { loadStage, type StageData } from '../systems/MapLoader';
import { TouchControls } from '../systems/TouchControls';
import { addUiText, type UiText } from '../systems/UiText';
import { GameHud } from '../systems/Hud';
import { ScienceProgress, TOPIC_BY_ID, pickBossQuestion, type TopicId } from '../systems/ScienceBank';
import { ScienceUI } from '../systems/ScienceUI';
import { STAGES, isStageId, type StageDef, type StageId, type EnemyKind } from '../systems/Stages';
import { STAGE_HAZARDS, SPIKE_TINT, MOVER_TINT, SPIKE_DAMAGE, TRAP_DAMAGE } from '../systems/Hazards';
import { finiteNumber, formatDamageText, isPositiveDamage } from '../systems/CombatMath';
import { gameAudio } from '../systems/Audio';

const PICKUP_TINT: Record<string, number> = {
  helmet: 0x66e0ff,
  body: 0x4a9fff,
  arms: 0xffe066,
  legs: 0x66ff99,
  chip: 0xff66cc
};

const QUIZ_THRESHOLDS = [0.75, 0.5, 0.25] as const;

interface SavedPlayer {
  level: number;
  exp: number;
  nextExp: number;
  baseMaxHp: number;
  hp: number;
  baseAtk: number;
}

interface RunState {
  equipment: EquipmentSystem;
  science: ScienceProgress;
  player: SavedPlayer;
}

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private boss!: StageBoss;
  private stage!: StageData;
  private stageId: StageId = 'beach';
  private stageDef!: StageDef;
  private bulletPool!: Phaser.Physics.Arcade.Group;
  private trailPool!: Phaser.GameObjects.Group;
  private ghostPool!: Phaser.GameObjects.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private bossShots!: Phaser.Physics.Arcade.Group;
  private enemyShots!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private playerLight: Phaser.GameObjects.Light | null = null;
  private hud!: GameHud;
  private controlHint!: UiText;
  private messageText!: UiText;
  private bossBarBg!: Phaser.GameObjects.Rectangle;
  private bossBarFill!: Phaser.GameObjects.Rectangle;
  private bossBarLabel!: UiText;
  private gameInput = new GameInput();
  private equipment = new EquipmentSystem();
  private equipUI!: EquipmentUI;
  private touch!: TouchControls;
  private science = new ScienceProgress();
  private scienceUI!: ScienceUI;
  private stationGroup!: Phaser.Physics.Arcade.StaticGroup;
  private stationHint!: UiText;
  private nearbyTopic: TopicId | null = null;
  private readonly autoOpened = new Set<TopicId>();
  private useLights = false;
  private doorBlocker!: Phaser.Physics.Arcade.Image;
  private fightLocked = false;
  private battleClear = false;
  private victory = false;
  private doorHintCooldown = 0;
  private stationExitGate: TopicId | null = null;
  private spikeSafeHintCd = 0;
  private spikeGroup!: Phaser.Physics.Arcade.StaticGroup;
  private moverGroup!: Phaser.Physics.Arcade.Group;
  private fallerGroup!: Phaser.Physics.Arcade.Group;
  private chomperGroup!: Phaser.Physics.Arcade.Group;
  private iceGroup!: Phaser.Physics.Arcade.StaticGroup;
  private sandGroup!: Phaser.Physics.Arcade.StaticGroup;
  private ventGroup!: Phaser.Physics.Arcade.Group;
  private doorSign: Phaser.GameObjects.Image | null = null;
  private doorSignLabel: UiText | null = null;
  private questHint: UiText | null = null;
  private checkpoint: { x: number; y: number } = { x: 80, y: 200 };
  private statusTimer = 0;
  private skyLayer!: Phaser.GameObjects.TileSprite;
  private farLayer!: Phaser.GameObjects.TileSprite;
  private midLayer!: Phaser.GameObjects.TileSprite;
  private triggeredQuizzes = new Set<number>();
  private quizQueue: number[] = [];
  private quizBusy = false;

  constructor() {
    super('GameScene');
  }

  create(): void {
    this.restoreRun();
    this.useLights = this.tryEnableLights();
    this.stage = loadStage(this, this.useLights, this.stageDef.mapKey, this.stageDef.tilesetKey);

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
    this.trailPool = this.add.group({
      defaultKey: 'buster_trail_tex',
      maxSize: 24
    });
    this.ghostPool = this.add.group({
      defaultKey: this.textures.exists('player_look')
        ? 'player_look'
        : this.textures.exists('player')
          ? 'player'
          : 'player_tex',
      maxSize: 16
    });
    this.bossShots = this.physics.add.group({
      defaultKey: 'boss_bolt_tex',
      maxSize: 30,
      allowGravity: false
    });
    this.enemyShots = this.physics.add.group({
      defaultKey: 'enemy_shot_tex',
      maxSize: 20,
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
    const saved = this.registry.get('runState') as RunState | undefined;
    if (saved?.player) this.player.restore(saved.player);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.createAtmosphere();

    this.spawnMappedEnemies();
    this.spawnMappedPickups();
    this.spawnScienceStations();

    this.boss = new StageBoss(
      this,
      this.stage.bossSpawn.x,
      this.stage.bossSpawn.y,
      arena,
      (req) => this.spawnBossShot(req),
      {
        name: this.stageDef.bossName,
        textureKey: this.stageDef.bossTexture,
        theme: this.stageDef.bossTheme,
        maxHp: this.stageDef.bossMaxHp
      }
    );
    this.applyLight(this.boss);

    this.doorBlocker = this.physics.add.staticImage(
      this.stage.door.x + this.stage.door.width / 2,
      this.stage.door.y + this.stage.door.height / 2,
      'door_block_tex'
    );
    this.doorBlocker.setDisplaySize(this.stage.door.width, this.stage.door.height);
    this.doorBlocker.refreshBody();
    this.doorBlocker.setDepth(5);
    if (this.stationsSatisfied()) {
      this.doorBlocker.disableBody(true, true);
    } else {
      this.doorBlocker.setVisible(true);
    }

    this.physics.add.collider(this.player, this.stage.solid);
    this.physics.add.collider(this.enemies, this.stage.solid);
    this.physics.add.collider(this.boss, this.stage.solid);
    this.physics.add.collider(this.player, this.doorBlocker);
    this.physics.add.collider(this.boss, this.doorBlocker);
    this.physics.add.collider(this.bulletPool, this.stage.solid, (bullet) => {
      const b = bullet as Phaser.Physics.Arcade.Sprite;
      const level = finiteNumber(b.getData('chargeLevel'), 1);
      this.spawnSpark(b.x, b.y, level === 3 ? 0x66ffff : 0xfff0b0, level === 3 ? 3 : 1);
      this.recycleBullet(b);
    });
    this.physics.add.collider(this.bossShots, this.stage.solid, (shot) => {
      const s = shot as Phaser.Physics.Arcade.Sprite;
      this.spawnSpark(s.x, s.y, 0xffcc66);
      this.recycleBossShot(s);
    });
    this.physics.add.collider(this.enemyShots, this.stage.solid, (shot) => {
      const s = shot as Phaser.Physics.Arcade.Sprite;
      this.recycleEnemyShot(s);
    });

    this.physics.add.overlap(this.bulletPool, this.enemies, (a, b) => {
      const bullet = this.asPlayerBullet(a) ?? this.asPlayerBullet(b);
      const enemy = this.asEnemy(a) ?? this.asEnemy(b);
      if (bullet && enemy) this.onBulletHitEnemy(bullet, enemy);
    });
    this.physics.add.overlap(this.bulletPool, this.boss, (a, b) => {
      const bullet = this.asPlayerBullet(a) ?? this.asPlayerBullet(b);
      if (bullet) this.onBulletHitBoss(bullet);
    });
    this.physics.add.overlap(this.player, this.enemies, (_p, eObj) => {
      const enemy = eObj as AnimalEnemy;
      if (enemy.active) this.player.takeDamage(finiteNumber(enemy.contactDamage, 10));
    });
    this.physics.add.overlap(this.player, this.boss, () => {
      if (this.boss.fightStarted && !this.boss.defeated && !this.boss.isStunned) {
        this.player.takeDamage(this.boss.contactDamage);
      }
    });
    this.physics.add.overlap(this.player, this.bossShots, (_p, sObj) => {
      const shot = sObj as Phaser.Physics.Arcade.Sprite;
      if (!shot.active || this.boss.defeated) return;
      const dmg = finiteNumber(shot.getData('damage'), 12);
      this.player.takeDamage(dmg);
      this.recycleBossShot(shot);
    });
    this.physics.add.overlap(this.player, this.enemyShots, (_p, sObj) => {
      const shot = sObj as Phaser.Physics.Arcade.Sprite;
      if (!shot.active) return;
      const dmg = finiteNumber(shot.getData('damage'), 8);
      this.player.takeDamage(dmg);
      this.recycleEnemyShot(shot);
    });
    this.physics.add.overlap(this.player, this.pickups, (_p, pObj) => {
      this.collectPickup(pObj as Phaser.Physics.Arcade.Sprite);
    });

    this.spawnHazards();
    this.createDoorSign();
    this.createHud();
    this.touch = new TouchControls(this.gameInput);
    this.equipUI = new EquipmentUI(this, this.equipment, () => {
      this.player.refreshLoadout();
      this.syncLightRadius();
      this.updateHud();
    });
    this.scienceUI = new ScienceUI(
      this,
      this.science,
      () => this.onScienceProgress(),
      () => this.touch.setPaused(false)
    );

    gameAudio.bind(this);

    this.showBanner(this.stageDef.intro, 2800);
    this.applyDebugOrPreview();
    if (this.debugParam()) {
      (window as unknown as { __xcoreDebug?: object }).__xcoreDebug = {
        hitBoss: (n?: number) => this.debugHitBoss(n ?? 80),
        forceEnemyAttack: () => this.debugForceEnemyAttack(),
        openEquip: () => this.debugOpenEquip(),
        hitEnemy: () => this.debugEnemyHit(),
        fireShot: (level?: 1 | 2 | 3) => this.debugShotFx(level ?? 3),
        finishStation: (topic?: TopicId) => this.debugFinishStation(topic ?? 'sound'),
        panToTowers: () => this.debugBeachLayout(),
        persistBossHit: () => this.debugBossPersist(),
        toggleMute: () => gameAudio.toggle(),
        stationOpen: () => this.debugStationOpen(),
        stationClosed: () => this.debugStationClosed(),
        hazards: () => this.debugHazards(),
        gearFx: () => this.debugGearFx(),
        doorHint: () => this.debugDoorHint(),
        testSpike: (safe?: boolean) => this.debugTestSpike(!!safe),
        testMover: () => this.debugTestMover(),
        warp: (x: number, y: number) => this.player.reviveAt(x, y),
        scatterGear: () => this.debugScatterGear(),
        forestStation: () => this.debugStageStation(),
        forestBossHit: () => this.debugBossPersist(),
        forestTraps: () => this.debugForestTraps(),
        polarPath: () => this.debugPolarPath(),
        desertPath: () => this.debugDesertPath()
      };
    }
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.input.keyboard?.removeAllKeys(true);
      this.time.removeAllEvents();
      this.touch?.destroy();
    });
  }

  update(_time: number, delta: number): void {
    this.gameInput.poll();
    this.syncParallax();
    if (this.spikeSafeHintCd > 0) this.spikeSafeHintCd -= delta;

    if (this.scienceUI?.isOpen) {
      this.updateHud();
      return;
    }

    if (this.victory) {
      this.updateHud();
      return;
    }

    if (this.gameInput.equipPressed && !this.player.dead && !this.scienceUI.isOpen) {
      this.equipUI.toggle();
    }
    this.touch.setPaused(this.equipUI.isOpen || this.scienceUI.isOpen, this.equipUI.isOpen);
    if (this.equipUI.isOpen) {
      this.equipUI.update(delta);
      this.updateHud();
      return;
    }

    if (this.tryOpenScienceStation()) {
      this.updateHud();
      return;
    }
    this.updateDoorLock(delta);

    if (this.player.dead) {
      this.messageText.setText('系統過載　按「跳」重新起動');
      this.messageText.setVisible(true);
      if (this.gameInput.jumpPressed) this.retryFromCheckpoint();
      this.updateBossBar();
      this.updateHud();
      return;
    }

    this.refreshPlayerSurface();
    this.player.updatePlayer(delta);
    this.updateMovers();
    this.updateBiomeHazards(delta);
    this.carryPlayerOnMover();
    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y);
    }

    const cam = this.cameras.main.worldView;
    this.bulletPool.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Sprite;
      if (!b.active) return true;
      if (b.x < cam.left - 40 || b.x > cam.right + 40) {
        this.recycleBullet(b);
        return true;
      }
      this.maybeSpawnBulletTrail(b, delta);
      return true;
    });
    this.bossShots.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Sprite;
      if (!b.active) return true;
      const life = finiteNumber(b.getData('life'), 0) - delta;
      b.setData('life', life);
      if (life <= 0 || b.x < cam.left - 60 || b.x > cam.right + 60 || b.y > 300 || b.y < -40) {
        this.recycleBossShot(b);
      }
      return true;
    });
    this.enemyShots.children.each((child) => {
      const b = child as Phaser.Physics.Arcade.Sprite;
      if (!b.active) return true;
      const life = finiteNumber(b.getData('life'), 0) - delta;
      b.setData('life', life);
      if (life <= 0 || b.x < cam.left - 60 || b.x > cam.right + 60 || b.y > 300 || b.y < -40) {
        this.recycleEnemyShot(b);
      }
      return true;
    });

    this.enemies.children.each((child) => {
      const e = child as AnimalEnemy;
      if (!e.active || !e.updateEnemy) return true;
      e.updateEnemy(delta, this.player);
      return true;
    });

    this.boss.updateBoss(delta, this.player);
    this.checkBossTrigger();
    this.updateCheckpoints();

    if (this.statusTimer > 0) {
      this.statusTimer -= delta;
      if (this.statusTimer <= 0) {
        if (!this.player.dead && !this.battleClear && !this.victory) this.messageText.setVisible(false);
      }
    }

    if (this.player.dead) {
      this.messageText.setText('系統過載　按「跳」重新起動');
      this.messageText.setVisible(true);
    }

    this.updateBossBar();
    this.updateHud();
  }

  private restoreRun(): void {
    const params = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
    const debug = params?.get('debug') ?? '';
    const saved = this.registry.get('runState') as RunState | undefined;
    const registryStage = this.registry.get('stageId');
    let stageId: StageId = 'beach';
    if (isStageId(typeof registryStage === 'string' ? registryStage : '')) {
      stageId = registryStage as StageId;
    } else if (isStageId(debug)) {
      stageId = debug;
    } else if (debug.startsWith('forest')) {
      stageId = 'forest';
    } else if (debug.startsWith('polar')) {
      stageId = 'polar';
    } else if (debug.startsWith('desert')) {
      stageId = 'desert';
    }
    this.stageId = stageId;
    this.stageDef = STAGES[stageId];
    if (saved?.equipment) this.equipment = saved.equipment;
    if (saved?.science) this.science = saved.science;
  }

  /** This stage's own stations are done (or the stage does not require them). */
  private stationsSatisfied(): boolean {
    return !this.stageDef.requiresStations || this.science.isStageCleared(this.stageId);
  }

  private captureRun(): RunState {
    return {
      equipment: this.equipment,
      science: this.science,
      player: {
        level: this.player.level,
        exp: this.player.exp,
        nextExp: this.player.nextExp,
        baseMaxHp: this.player.baseMaxHp,
        hp: this.player.hp,
        baseAtk: this.player.baseAtk
      }
    };
  }

  private goToStage(next: StageId): void {
    if (next === this.stageId) return;
    if (this.equipUI?.isOpen) this.equipUI.hide();
    if (this.scienceUI?.isOpen) this.scienceUI.hide();
    this.registry.set('runState', this.captureRun());
    this.registry.set('stageId', next);
    this.scene.restart();
  }

  private tryEnableLights(): boolean {
    return false;
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
    const kinds = this.stageDef.defaultKinds;
    const sheet = this.textures.exists(this.stageDef.animalKey) ? this.stageDef.animalKey : 'enemy_tex';
    this.stage.enemies.forEach((zone, i) => {
      const kind = (zone.kind as EnemyKind | undefined) ?? kinds[i % kinds.length];
      const frame = kindFrame(kind);
      createAnimalEnemy(
        this,
        this.enemies,
        zone.x,
        zone.y,
        kind,
        zone.patrolMin,
        zone.patrolMax,
        sheet,
        sheet === 'enemy_tex' ? 0 : frame,
        (req) => this.spawnEnemyShot(req)
      );
    });
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
    gameAudio.play('pickup');
    const granted = this.equipment.grant(itemId);
    const msg = granted ? `獲得：${item.name}　打開「裝備」就可以裝上` : `已擁有：${item.name}`;
    this.showBanner(msg, 2400);
    this.showFloatingText(spr.x, spr.y - 12, item.name, '#7ef0ff');
    this.equipUI.refresh();
  }

  private checkBossTrigger(): void {
    if (this.fightLocked || this.battleClear) return;
    if (!this.stationsSatisfied()) return;
    const a = this.stage.arena;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const px = body.center.x;
    const py = body.center.y;
    // Use the whole arena, not only the 18px door strip — later stages used to
    // leave the door open, so shots from just outside did nothing because the
    // fight had not started.
    if (px >= a.x - 4 && px <= a.x + a.width && py >= a.y && py <= a.y + a.height) {
      this.beginBossFight();
    }
  }

  private updateDoorLock(delta: number): void {
    if (this.doorHintCooldown > 0) this.doorHintCooldown -= delta;
    const unlocked = this.stationsSatisfied();
    if (unlocked) {
      if (!this.fightLocked && this.doorBlocker.active) {
        this.doorBlocker.disableBody(true, true);
      }
      return;
    }
    if (!this.doorBlocker.active) {
      this.doorBlocker.enableBody(true, this.doorBlocker.x, this.doorBlocker.y, true, true);
      this.doorBlocker.setDisplaySize(this.stage.door.width, this.stage.door.height);
      this.doorBlocker.refreshBody();
    }
    const d = this.stage.door;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const touching =
      body.right >= d.x - 4 &&
      body.left <= d.x + d.width + 4 &&
      body.bottom >= d.y &&
      body.top <= d.y + d.height;
    if (touching && this.doorHintCooldown <= 0) {
      const left = this.science.stageTotal(this.stageId) - this.science.stageClearedCount(this.stageId);
      this.showBanner(`仲有 ${left} 個學習站未完成，完成後先挑戰${this.stageDef.bossName}啦！`, 2400);
      this.doorHintCooldown = 2800;
    }
  }

  private spawnScienceStations(): void {
    this.stationGroup = this.physics.add.staticGroup();
    for (const s of this.stage.scienceStations) {
      const topic = s.topic as TopicId;
      if (!TOPIC_BY_ID[topic]) continue;
      const spr = this.stationGroup.create(s.x, s.y, 'station_tex') as Phaser.Physics.Arcade.Sprite;
      spr.setData('topic', topic);
      spr.setDepth(8);
      spr.refreshBody();
      this.applyLight(spr);
      const info = TOPIC_BY_ID[topic];
      const label = addUiText(this, s.x, s.y - 22, info.stationLabel, {
        size: 12,
        color: '#7ef0ff',
        originX: 0.5,
        originY: 1
      }).setDepth(8);
      spr.setData('label', label);
    }
    this.physics.add.overlap(this.player, this.stationGroup, (_p, sObj) => {
      const topic = (sObj as Phaser.Physics.Arcade.Sprite).getData('topic') as TopicId;
      if (topic) this.nearbyTopic = topic;
    });
    this.refreshStationLooks();
  }

  private tryOpenScienceStation(): boolean {
    const topic = this.resolveNearbyTopic();
    if (!topic || this.player.dead) {
      this.stationHint.setVisible(false);
      this.stationExitGate = null;
      return false;
    }
    // Cleared / no attempts left: station is inert (no hint, no jump swallow).
    if (this.science.isCleared(topic) || !this.science.canAsk(topic)) {
      this.stationHint.setVisible(false);
      return false;
    }
    if (this.stationExitGate === topic) {
      this.stationHint.setText('再接觸學習站就可以繼續答題');
      this.stationHint.setVisible(true);
      return false;
    }
    this.stationHint.setVisible(false);
    this.autoOpened.add(topic);
    this.openScienceStation(topic);
    return true;
  }

  private openScienceStation(topic: TopicId): void {
    if (this.equipUI?.isOpen) this.equipUI.hide();
    this.scienceUI.show(topic);
    this.touch.setPaused(true);
    this.stationExitGate = topic;
  }

  private resolveNearbyTopic(): TopicId | null {
    const topic = this.nearbyTopic;
    this.nearbyTopic = null;
    if (!topic) return null;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    let found: TopicId | null = null;
    this.stationGroup.children.each((child) => {
      const spr = child as Phaser.Physics.Arcade.Sprite;
      if (!spr.active) return true;
      const b = spr.body as Phaser.Physics.Arcade.StaticBody;
      const hit =
        body.right > b.left &&
        body.left < b.right &&
        body.bottom > b.top &&
        body.top < b.bottom;
      if (hit) found = spr.getData('topic') as TopicId;
      return true;
    });
    return found;
  }

  private onScienceProgress(): void {
    this.updateHud();
    this.refreshStationLooks();
    if (this.science.isStageCleared(this.stageId) && this.stageDef.requiresStations && !this.fightLocked) {
      this.doorBlocker.disableBody(true, true);
      this.refreshDoorSign();
      this.refreshQuestHint();
      const n = this.science.stageTotal(this.stageId);
      this.showBanner(`呢關 ${n} 個學習站都完成喇！可以去挑戰${this.stageDef.bossName}。`, 2800);
    }
  }

  private refreshStationLooks(): void {
    if (!this.stationGroup) return;
    this.stationGroup.children.each((child) => {
      const spr = child as Phaser.Physics.Arcade.Sprite;
      const topic = spr.getData('topic') as TopicId;
      const label = spr.getData('label') as UiText | undefined;
      const closed = this.science.isCleared(topic) || !this.science.canAsk(topic);
      if (closed) {
        spr.setTint(0x3a4650);
        spr.setAlpha(0.72);
        if (spr.body) spr.disableBody(true, false);
        if (label) {
          const info = TOPIC_BY_ID[topic];
          label.setColor('#8a969c');
          label.setText(`${info.stationLabel} 已關閉`);
        }
      } else if (this.science.attemptCount(topic) >= 1) {
        spr.setTint(0xffe066);
        spr.setAlpha(1);
        if (label) label.setColor('#7ef0ff');
      } else {
        spr.clearTint();
        spr.setAlpha(1);
        if (label) label.setColor('#7ef0ff');
      }
      return true;
    });
  }

  /** Used by the local preview screenshot script. */
  openSciencePreview(topic: TopicId = 'sound'): void {
    this.openScienceStation(topic);
  }

  private beginBossFight(): void {
    this.fightLocked = true;
    this.triggeredQuizzes.clear();
    this.quizQueue = [];
    this.quizBusy = false;
    this.doorBlocker.enableBody(true, this.doorBlocker.x, this.doorBlocker.y, true, true);
    this.doorBlocker.setDisplaySize(this.stage.door.width, this.stage.door.height);
    this.doorBlocker.refreshBody();
    const a = this.stage.arena;
    this.cameras.main.setBounds(a.x, a.y, a.width, a.height);
    this.boss.startFight();
    gameAudio.play('roar');
    this.showBanner(`${this.stageDef.bossName}　降臨`, 1800);
    this.bossBarBg.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.bossBarLabel.setVisible(true);
  }

  private onBossDefeated(): void {
    if (this.battleClear) return;
    if (!this.boss.defeated || this.boss.hp > 0) return;
    this.boss.stayPresent();
    this.battleClear = true;
    this.fightLocked = false;
    gameAudio.play('win');
    this.doorBlocker.disableBody(true, true);
    this.cameras.main.setBounds(0, 0, this.stage.worldWidth, this.stage.worldHeight);
    const leveled = this.player.gainExp(200);
    const granted = this.equipment.grant(this.stageDef.rewardId);
    const bits = [`${this.stageDef.name}清除！`];
    if (granted) bits.push(`獲得：${this.stageDef.rewardName}`);
    if (leveled) bits.push('LEVEL UP!');
    this.showBanner(bits.join('　'), 2800);
    this.showFloatingText(this.boss.x, this.boss.y - 28, '擊破！', '#00ff88');
    this.equipUI.refresh();
    const next = this.stageDef.next;
    if (next) {
      this.time.delayedCall(2200, () => {
        this.showBanner(`前往${STAGES[next].name}…`, 1400);
        this.time.delayedCall(1400, () => this.goToStage(next));
      });
    } else {
      this.time.delayedCall(1600, () => this.showVictory());
    }
  }

  private showVictory(): void {
    this.victory = true;
    this.showBanner('完滿通關！四個區域嘅科學探索都完成喇！', 999999);
    this.messageText.setText('完滿通關！\n陽光沙灘、翠影森林、霜白極地、炎陽沙漠\n全部完成喇！');
    this.messageText.setVisible(true);
  }

  private retryFromCheckpoint(): void {
    this.player.reviveAt(this.checkpoint.x, this.checkpoint.y);
    this.messageText.setVisible(false);
    if (this.fightLocked && !this.battleClear) {
      this.triggeredQuizzes.clear();
      this.quizQueue = [];
      this.quizBusy = false;
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
      this.checkpoint = {
        x: this.stage.arena.x + 48,
        y: this.stage.playerSpawn.y
      };
    }
  }

  private onBulletHitEnemy(bullet: Phaser.Physics.Arcade.Sprite, enemy: AnimalEnemy): void {
    if (!bullet.active || !enemy.active) return;
    const dmg = finiteNumber(bullet.getData('damage'));
    if (!isPositiveDamage(dmg)) {
      this.recycleBullet(bullet);
      return;
    }
    const level = finiteNumber(bullet.getData('chargeLevel'), 1);
    const slain = enemy.takeHit(dmg);
    gameAudio.play('hit');
    this.spawnSpark(enemy.x, enemy.y, level === 3 ? 0x66ffff : 0xfff0a0, level === 3 ? 3 : level === 2 ? 2 : 1);
    this.showFloatingText(enemy.x, enemy.y - 12, formatDamageText(dmg), level === 3 ? '#00ffff' : '#ffeb3b');
    if (level < 3 || enemy.hp > 0) this.recycleBullet(bullet);
    if (slain) {
      enemy.disableBody(true, true);
      const leveledUp = this.player.gainExp(25);
      if (leveledUp) this.showFloatingText(this.player.x, this.player.y - 24, 'LEVEL UP!', '#00ff88');
    }
  }

  private onBulletHitBoss(bullet: Phaser.Physics.Arcade.Sprite): void {
    if (!this.asPlayerBullet(bullet) || !bullet.active) return;
    if (!this.boss.fightStarted) {
      if (!this.stationsSatisfied() || this.player.x < this.stage.arena.x - 80) return;
      this.beginBossFight();
      this.boss.clearInvuln();
    }
    if (this.boss.defeated) {
      this.recycleBullet(bullet);
      return;
    }
    if (bullet.getData('hitBoss')) return;
    const base = finiteNumber(bullet.getData('damage'));
    if (!isPositiveDamage(base)) {
      this.recycleBullet(bullet);
      return;
    }
    const level = finiteNumber(bullet.getData('chargeLevel'), 1);
    const bonus = finiteNumber(this.player.derived?.bossDamageBonus, 0);
    const dmg = Math.round(base * (1 + bonus));
    if (!isPositiveDamage(dmg)) {
      this.recycleBullet(bullet);
      return;
    }
    bullet.setData('hitBoss', true);
    const prevHp = this.boss.hp;
    const slain = this.boss.takeDamage(dmg);
    this.boss.stayPresent();
    if (prevHp !== this.boss.hp) gameAudio.play('boss_hit');
    this.spawnSpark(this.boss.x, this.boss.y - 8, level === 3 ? 0x66ffff : 0xfff0a0, level === 3 ? 3 : 2);
    this.showFloatingText(this.boss.x, this.boss.y - 20, formatDamageText(dmg), level === 3 ? '#00ffff' : '#ffeb3b');
    if (level < 3 || this.boss.hp > 0) this.recycleBullet(bullet);
    if (slain) {
      this.onBossDefeated();
      return;
    }
    this.queueBossQuizzes(prevHp, this.boss.hp);
  }

  private queueBossQuizzes(prevHp: number, newHp: number): void {
    const max = this.boss.maxHp;
    if (!Number.isFinite(prevHp) || !Number.isFinite(newHp) || !Number.isFinite(max) || max <= 0) return;
    if (newHp <= 0) return;
    for (const t of QUIZ_THRESHOLDS) {
      if (this.triggeredQuizzes.has(t)) continue;
      if (prevHp / max > t && newHp / max <= t) {
        this.triggeredQuizzes.add(t);
        this.quizQueue.push(t);
      }
    }
    this.tryStartBossQuiz();
  }

  private tryStartBossQuiz(): void {
    if (this.quizBusy || this.quizQueue.length === 0) return;
    if (this.boss.defeated || this.scienceUI.isOpen || this.player.dead) return;
    this.quizQueue.shift();
    this.quizBusy = true;
    const question = pickBossQuestion(this.science.answeredIds);
    if (this.equipUI?.isOpen) this.equipUI.hide();
    this.touch.setPaused(true);
    this.scienceUI.showBossQuestion(question, (correct) => {
      this.touch.setPaused(false);
      this.playShock(correct);
      if (correct) this.boss.stun(1500);
      else this.player.stun(1500, { invuln: true });
      this.time.delayedCall(1600, () => {
        this.quizBusy = false;
        this.tryStartBossQuiz();
      });
    });
  }

  private playShock(hitBoss: boolean): void {
    const target = hitBoss ? this.boss : this.player;
    const bolt = this.add.image(target.x, target.y - 20, 'lightning_tex').setDepth(30);
    bolt.setTint(hitBoss ? 0x66ffff : 0xffee66);
    this.tweens.add({
      targets: bolt,
      alpha: 0,
      y: target.y - 36,
      duration: 400,
      onComplete: () => bolt.destroy()
    });
    gameAudio.play(hitBoss ? 'correct' : 'wrong');
    this.showBanner(hitBoss ? '答對！電擊首領 1.5 秒' : '答錯！主角被電擊 1.5 秒', 1600);
  }

  private spawnBullet(payload: ShotPayload): void {
    const damage = finiteNumber(payload.damage);
    if (!isPositiveDamage(damage)) return;
    const unarmed = !!payload.unarmed;
    const level = payload.chargeLevel;
    const key = unarmed
      ? 'buster_pellet_tex'
      : level === 3
        ? 'buster_lv3_tex'
        : level === 2
          ? 'buster_lv2_tex'
          : 'buster_lv1_tex';
    const texKey = this.textures.exists(key) ? key : 'buster_tex';
    const bullet = this.bulletPool.get(payload.x, payload.y, texKey) as
      | Phaser.Physics.Arcade.Sprite
      | null;
    if (!bullet) return;
    bullet.enableBody(true, payload.x, payload.y, true, true);
    bullet.setTexture(texKey);
    this.applyLight(bullet);
    bullet.setDepth(15);
    bullet.setFlipX(payload.dir < 0);
    bullet.setData('damage', damage);
    bullet.setData('chargeLevel', level);
    bullet.setData('unarmed', unarmed);
    bullet.setData('hitBoss', false);
    bullet.setData('trailAcc', 0);
    // Visibly smaller when unarmed; charged cannon shots grow by tier.
    const gearScale = Number.isFinite(payload.bulletScale) ? (payload.bulletScale as number) : 1;
    const baseScale = unarmed
      ? level === 3
        ? 1.15
        : level === 2
          ? 1.0
          : 0.85
      : 1.0;
    const scale = baseScale * Math.min(2.2, Math.max(0.6, gearScale));
    bullet.setScale(scale);
    bullet.clearTint();
    if (unarmed) bullet.setTint(level === 3 ? 0xb8e8ff : 0xd0eeff);
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    // Slightly generous hitboxes so grazing shots count.
    const hitW = Math.round((unarmed ? 12 : level === 3 ? 22 : level === 2 ? 18 : 14) * scale);
    const hitH = Math.round((unarmed ? 10 : level === 3 ? 14 : level === 2 ? 12 : 10) * scale);
    body.setSize(hitW, hitH);
    body.setOffset((bullet.width - hitW) / 2, (bullet.height - hitH) / 2);
    const speed = unarmed ? 340 : 400;
    const vy = Number.isFinite(payload.vy) ? (payload.vy as number) : 0;
    bullet.setVelocityX(payload.dir * speed);
    bullet.setVelocityY(speed * vy);
    this.spawnMuzzle(payload.x, payload.y, payload.dir, level, unarmed);
  }

  private asPlayerBullet(obj: unknown): Phaser.Physics.Arcade.Sprite | null {
    if (!obj || obj === this.boss || obj === this.player) return null;
    const spr = obj as Phaser.Physics.Arcade.Sprite;
    if (!this.bulletPool.contains(spr)) return null;
    return spr;
  }

  private asEnemy(obj: unknown): AnimalEnemy | null {
    if (!obj || obj === this.boss || obj === this.player) return null;
    const spr = obj as AnimalEnemy;
    if (!this.enemies.contains(spr)) return null;
    return spr;
  }

  private recycleBullet(bullet: Phaser.Physics.Arcade.Sprite): void {
    // Never recycle the boss / player if an overlap callback swaps arguments.
    if (!this.asPlayerBullet(bullet)) return;
    bullet.setData('damage', 0);
    bullet.setData('hitBoss', false);
    bullet.setData('trailAcc', 0);
    bullet.disableBody(true, true);
  }

  private maybeSpawnBulletTrail(bullet: Phaser.Physics.Arcade.Sprite, delta: number): void {
    const unarmed = !!bullet.getData('unarmed');
    const level = finiteNumber(bullet.getData('chargeLevel'), 1);
    if (unarmed && level < 3) return;
    const interval = unarmed ? 70 : level === 3 ? 28 : level === 2 ? 42 : 55;
    const acc = finiteNumber(bullet.getData('trailAcc'), 0) + delta;
    if (acc < interval) {
      bullet.setData('trailAcc', acc);
      return;
    }
    bullet.setData('trailAcc', acc - interval);
    const trail = this.trailPool.get(bullet.x, bullet.y) as Phaser.GameObjects.Image | null;
    if (!trail) return;
    const tKey = this.textures.exists('buster_trail_tex') ? 'buster_trail_tex' : bullet.texture.key;
    trail.setTexture(tKey);
    trail.setActive(true).setVisible(true).setPosition(bullet.x, bullet.y);
    trail.setFlipX(bullet.flipX);
    trail.setDepth(14);
    trail.setAlpha(level === 3 ? 0.55 : 0.4);
    trail.setScale(level === 3 ? 0.9 : 0.7);
    trail.setTint(unarmed ? 0xc0e8ff : level === 3 ? 0x66ffff : 0xa8e0ff);
    this.tweens.add({
      targets: trail,
      alpha: 0,
      scale: 0.4,
      duration: level === 3 ? 140 : 100,
      onComplete: () => {
        trail.setActive(false).setVisible(false);
        trail.clearTint();
      }
    });
  }

  private spawnDashGhost(x: number, y: number, flipX: boolean): void {
    const key = this.player.texture.key;
    const ghost = this.ghostPool.get(x, y, key) as Phaser.GameObjects.Sprite | null;
    if (!ghost) return;
    const frame =
      this.player.anims.currentFrame?.textureFrame ??
      (this.player.usingSheet ? 5 : undefined);
    ghost.setTexture(key, frame);
    ghost.setActive(true).setVisible(true).setPosition(x, y).setFlipX(flipX);
    ghost.setDisplaySize(this.player.displayWidth, this.player.displayHeight);
    ghost.setTint(0x00e5ff).setAlpha(0.55).setDepth(9);
    this.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 180,
      onComplete: () => {
        ghost.setActive(false).setVisible(false);
        ghost.clearTint();
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
    const damage = isPositiveDamage(req.damage) ? req.damage : 12;
    shot.setData('damage', damage);
    shot.setData('life', 2600);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(req.gravity);
    shot.setVelocity(req.vx, req.vy);
    if (req.kind === 'orb') shot.setTint(0xff88ee);
    else if (req.kind === 'shock') shot.setTint(0xffee55);
    else shot.clearTint();
  }

  private recycleBossShot(shot: Phaser.Physics.Arcade.Sprite): void {
    shot.setData('damage', 0);
    shot.disableBody(true, true);
  }

  private spawnEnemyShot(req: EnemyShotRequest): void {
    const shot = this.enemyShots.get(req.x, req.y, 'enemy_shot_tex') as Phaser.Physics.Arcade.Sprite | null;
    if (!shot) return;
    shot.enableBody(true, req.x, req.y, true, true);
    shot.setTexture('enemy_shot_tex');
    shot.setDepth(13);
    shot.setScale(req.kind === 'drop' ? 1.1 : 1);
    const damage = isPositiveDamage(req.damage) ? req.damage : 8;
    shot.setData('damage', damage);
    shot.setData('life', req.life);
    const body = shot.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(req.gravity);
    shot.setVelocity(req.vx, req.vy);
    if (req.kind === 'nut') shot.setTint(0xc08040);
    else if (req.kind === 'snow') shot.setTint(0xe8f4ff);
    else if (req.kind === 'sting') shot.setTint(0xc04030);
    else if (req.kind === 'drop') shot.setTint(0xf0e0a0);
    else shot.setTint(0xe8c070);
  }

  private recycleEnemyShot(shot: Phaser.Physics.Arcade.Sprite): void {
    shot.setData('damage', 0);
    shot.disableBody(true, true);
  }

  private spawnHazards(): void {
    const pack = STAGE_HAZARDS[this.stageId];
    this.spikeGroup = this.physics.add.staticGroup();
    this.moverGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    const spikeTint = SPIKE_TINT[this.stageId];
    const moverTint = MOVER_TINT[this.stageId];
    const spikeKey = this.textures.exists('spike_tex') ? 'spike_tex' : 'pickup_tex';
    const moverKey = this.textures.exists('mover_tex') ? 'mover_tex' : 'door_block_tex';

    for (const s of pack.spikes) {
      for (let i = 0; i < s.count; i++) {
        const x = s.x + 9 + i * 18;
        const y = s.surfaceY - 8;
        const spr = this.spikeGroup.create(x, y, spikeKey) as Phaser.Physics.Arcade.Sprite;
        spr.setDepth(6);
        spr.setTint(spikeTint);
        spr.refreshBody();
        const body = spr.body as Phaser.Physics.Arcade.StaticBody;
        body.setSize(14, 12);
        body.setOffset(2, 4);
      }
    }
    this.physics.add.overlap(this.player, this.spikeGroup, () => this.onSpikeHit());

    for (const m of pack.movers) {
      const spr = this.moverGroup.create(m.x, m.y, moverKey) as Phaser.Physics.Arcade.Sprite;
      spr.setDisplaySize(m.w, m.h);
      spr.setTint(moverTint);
      spr.setDepth(4);
      spr.setData('axis', m.axis);
      spr.setData('min', m.min);
      spr.setData('max', m.max);
      spr.setData('speed', m.speed);
      spr.setData('dir', 1);
      const body = spr.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(m.w, m.h);
      body.setOffset(0, 0);
      if (m.axis === 'x') body.setVelocity(m.speed, 0);
      else body.setVelocity(0, m.speed);
    }
    this.physics.add.collider(this.player, this.moverGroup);
    this.spawnBiomeHazards();
  }

  private onSpikeHit(): void {
    if (this.player.dead) return;
    if (this.player.derived.spikeSafe) {
      if (this.spikeSafeHintCd <= 0) {
        this.showFloatingText(this.player.x, this.player.y - 22, '不怕尖刺', '#66ffaa');
        this.spikeSafeHintCd = 900;
      }
      return;
    }
    if (this.player.invulnerable) return;
    this.player.takeDamage(SPIKE_DAMAGE);
  }

  private updateMovers(): void {
    if (!this.moverGroup) return;
    this.moverGroup.children.each((child) => {
      const spr = child as Phaser.Physics.Arcade.Sprite;
      if (!spr.active) return true;
      const body = spr.body as Phaser.Physics.Arcade.Body;
      const axis = spr.getData('axis') as 'x' | 'y';
      const min = finiteNumber(spr.getData('min'));
      const max = finiteNumber(spr.getData('max'));
      const speed = finiteNumber(spr.getData('speed'), 40);
      let dir = finiteNumber(spr.getData('dir'), 1) >= 0 ? 1 : -1;
      if (axis === 'x') {
        if (spr.x >= max) dir = -1;
        if (spr.x <= min) dir = 1;
        spr.setData('dir', dir);
        body.setVelocity(dir * speed, 0);
      } else {
        if (spr.y >= max) dir = -1;
        if (spr.y <= min) dir = 1;
        spr.setData('dir', dir);
        body.setVelocity(0, dir * speed);
      }
      body.setImmovable(true);
      return true;
    });
  }

  private carryPlayerOnMover(): void {
    if (!this.moverGroup || this.player.dead) return;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body.blocked.down && !body.touching.down) return;
    let ride: Phaser.Physics.Arcade.Sprite | null = null;
    this.moverGroup.children.each((child) => {
      const spr = child as Phaser.Physics.Arcade.Sprite;
      const mb = spr.body as Phaser.Physics.Arcade.Body;
      if (!spr.active || !mb) return true;
      const onTop =
        mb.touching.up ||
        (body.bottom <= mb.top + 6 &&
          body.bottom >= mb.top - 4 &&
          body.right > mb.left + 2 &&
          body.left < mb.right - 2);
      if (onTop) ride = spr;
      return true;
    });
    if (!ride) return;
    const mb = (ride as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
    this.player.x += mb.deltaX();
    if (mb.velocity.y < 0 || body.velocity.y >= 0) {
      this.player.y += mb.deltaY();
    }
  }

  private createDoorSign(): void {
    if (!this.stageDef.requiresStations) return;
    const d = this.stage.door;
    const x = d.x + d.width / 2;
    const y = Math.max(48, d.y - 28);
    const key = this.textures.exists('door_sign_tex') ? 'door_sign_tex' : 'door_block_tex';
    this.doorSign = this.add.image(x, y, key).setDepth(7);
    this.doorSignLabel = addUiText(this, x + 6, y, '', {
      size: 12,
      color: '#ffe08a',
      originX: 0.5,
      originY: 0.5,
      align: 'center',
      wordWrap: 88
    }).setDepth(8);
    this.refreshDoorSign();
  }

  private refreshDoorSign(): void {
    if (!this.doorSign || !this.doorSignLabel) return;
    const open = this.stationsSatisfied();
    const openKey = this.textures.exists('door_sign_open_tex') ? 'door_sign_open_tex' : 'door_sign_tex';
    const lockKey = this.textures.exists('door_sign_tex') ? 'door_sign_tex' : 'door_block_tex';
    this.doorSign.setTexture(open ? openKey : lockKey);
    this.doorSignLabel.setColor(open ? '#b8ffd0' : '#ffe08a');
    this.doorSignLabel.setText(open ? '可以挑戰首領' : '要完成全部學習站\n才可挑戰首領');
  }

  private refreshQuestHint(): void {
    if (!this.questHint) return;
    if (!this.stageDef.requiresStations) {
      this.questHint.setVisible(false);
      return;
    }
    if (this.science.isStageCleared(this.stageId)) {
      this.questHint.setColor('#b8ffd0');
      this.questHint.setText('學習站已完成，可以挑戰首領');
      this.questHint.setVisible(true);
      return;
    }
    this.questHint.setColor('#ffe08a');
    this.questHint.setText('要完成全部學習站才可挑戰首領');
    this.questHint.setVisible(true);
  }

  private createHud(): void {

    this.hud = new GameHud(this);
    this.hud.create();

    this.controlHint = addUiText(this, 240, 258, '方向鍵／AD 移動　Z／空白 跳　X 射擊　C 衝刺　E 裝備', {
      size: 12,
      color: '#d8c8b0',
      originX: 0.5,
      originY: 1,
      align: 'center'
    })
      .setScrollFactor(0)
      .setDepth(200);
    this.time.delayedCall(4500, () => {
      if (this.controlHint) this.controlHint.setVisible(false);
    });

    this.stationHint = addUiText(this, 240, 86, '', {
      size: 12,
      color: '#fff3a0',
      originX: 0.5,
      originY: 0,
      align: 'center'
    })
      .setScrollFactor(0)
      .setDepth(220)
      .setVisible(false);

    this.questHint = addUiText(this, 240, 36, '', {
      size: 12,
      color: '#ffe08a',
      originX: 0.5,
      originY: 0,
      align: 'center'
    })
      .setScrollFactor(0)
      .setDepth(220)
      .setVisible(false);
    this.refreshQuestHint();

    this.messageText = addUiText(this, 240, 72, '', {
      size: 12,
      color: '#fff3a0',
      originX: 0.5,
      originY: 0.5,
      align: 'center',
      wordWrap: 420
    })
      .setScrollFactor(0)
      .setDepth(300)
      .setVisible(false);

    this.bossBarBg = this.add
      .rectangle(240, 18, 204, 10, 0x140a10, 0.9)
      .setStrokeStyle(1, 0xffe088)
      .setScrollFactor(0)
      .setDepth(210)
      .setVisible(false);
    this.bossBarFill = this.add
      .rectangle(140, 18, 200, 6, 0xff4466)
      .setOrigin(0, 0.5)
      .setScrollFactor(0)
      .setDepth(211)
      .setVisible(false);
    this.bossBarLabel = addUiText(this, 240, 8, this.stageDef.bossName, {
      size: 12,
      color: '#ffe8a0',
      originX: 0.5,
      originY: 0
    })
      .setScrollFactor(0)
      .setDepth(211)
      .setVisible(false);

    this.updateHud();
  }

  private updateHud(): void {
    this.hud.update(this.player, this.science, this.stageId);
  }

  private createAtmosphere(): void {
    const w = this.scale.width;
    const h = this.scale.height;
    this.skyLayer = this.add.tileSprite(0, 0, w, h, this.stageDef.bgSky).setOrigin(0, 0).setScrollFactor(0).setDepth(-30);
    if (this.stageDef.bgProp && this.textures.exists(this.stageDef.bgProp)) {
      this.add.image(this.stageDef.bgPropX, this.stageDef.bgPropY, this.stageDef.bgProp).setScrollFactor(0).setDepth(-25);
    }
    this.farLayer = this.add.tileSprite(0, 0, w, h, this.stageDef.bgFar).setOrigin(0, 0).setScrollFactor(0).setDepth(-20);
    this.midLayer = this.add.tileSprite(0, 0, w, h, this.stageDef.bgMid).setOrigin(0, 0).setScrollFactor(0).setDepth(-10);
    this.syncParallax();
  }

  private syncParallax(): void {
    if (!this.skyLayer) return;
    const x = this.cameras.main.scrollX;
    this.skyLayer.tilePositionX = x * 0.12;
    this.farLayer.tilePositionX = x * 0.32;
    this.midLayer.tilePositionX = x * 0.58;
  }

  private spawnSpark(x: number, y: number, tint = 0xfff2a0, burst = 1): void {
    const count = Math.max(1, Math.min(4, burst));
    for (let i = 0; i < count; i++) {
      const spr = this.add.image(x, y, 'spark_tex').setDepth(16).setTint(tint);
      const ang = (Math.PI * 2 * i) / count + 0.3;
      const dist = count > 1 ? 6 : 0;
      spr.setPosition(x + Math.cos(ang) * dist, y + Math.sin(ang) * dist);
      spr.setScale(count > 1 ? 0.85 : 1.1);
      this.tweens.add({
        targets: spr,
        alpha: 0,
        scale: count > 1 ? 1.5 : 1.9,
        x: spr.x + Math.cos(ang) * 8,
        y: spr.y + Math.sin(ang) * 8,
        duration: 160,
        onComplete: () => spr.destroy()
      });
    }
  }

  private spawnMuzzle(x: number, y: number, dir: number, level: 1 | 2 | 3, unarmed = false): void {
    const spr = this.add.image(x, y, 'muzzle_tex').setDepth(16);
    spr.setFlipX(dir < 0);
    const scale = unarmed
      ? level === 3
        ? 1.1
        : 0.85
      : level === 3
        ? 1.8
        : level === 2
          ? 1.35
          : 1.05;
    spr.setScale(scale);
    spr.setTint(unarmed ? 0xd0eeff : level === 3 ? 0x66ffff : level === 2 ? 0xa8e8ff : 0xfff3b0);
    this.tweens.add({
      targets: spr,
      alpha: 0,
      x: x + dir * (unarmed ? 4 : 8),
      scaleX: scale * 1.15,
      duration: unarmed ? 80 : 110,
      onComplete: () => spr.destroy()
    });
  }

  /** Local preview helper. Pans the camera without changing gameplay state. */
  panPreviewTo(x: number, y = 135): void {
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(Math.round(x), Math.round(y));
    this.syncParallax();
  }

  private updateBossBar(): void {
    if (!this.boss?.fightStarted) return;
    const max = this.boss.maxHp;
    const hp = finiteNumber(this.boss.hp, 0);
    const ratio = Number.isFinite(max) && max > 0 ? Phaser.Math.Clamp(hp / max, 0, 1) : 0;
    this.bossBarFill.width = 200 * ratio;
    const label = this.boss.defeated
      ? `${this.stageDef.bossName}　已擊破`
      : `${this.stageDef.bossName}　${this.boss.phaseLabel}`;
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
    if (!msg || msg.includes('NaN')) return;
    const txt = addUiText(this, x, y, msg, {
      size: 12,
      color,
      originX: 0.5,
      originY: 0.5
    }).setDepth(20);
    this.tweens.add({
      targets: txt,
      y: y - 18,
      alpha: 0,
      duration: 550,
      onComplete: () => txt.destroy()
    });
  }

  private debugParam(): string {
    if (typeof location === 'undefined') return '';
    return new URLSearchParams(location.search).get('debug') ?? '';
  }

  private applyDebugOrPreview(): void {
    if (typeof location !== 'undefined' && new URLSearchParams(location.search).get('preview') === 'science') {
      this.openSciencePreview('sound');
    }
    const debug = this.debugParam();
    if (!debug) return;
    // Query-param debug only; not shown in the student-facing UI. See WORKLOG.md.
    if (debug === 'science-explain') {
      this.time.delayedCall(200, () => this.scienceUI.previewCorrect('sound'));
    } else if (debug === 'boss' || debug === 'boss-quiz' || debug === 'boss-damage') {
      this.time.delayedCall(200, () => this.debugStartBoss(debug === 'boss-quiz'));
    } else if (debug === 'enemy-attack') {
      this.time.delayedCall(200, () => this.debugEnemyAttack());
    } else if (debug === 'equip-a' || debug === 'equip-b') {
      this.time.delayedCall(200, () => this.debugEquipLook(debug === 'equip-b'));
    } else if (debug === 'equip-menu') {
      this.time.delayedCall(200, () => this.debugOpenEquip());
    } else if (debug === 'equip-menu-on') {
      this.time.delayedCall(200, () => {
        this.debugEquipLook(true);
        this.debugOpenEquip();
      });
    } else if (debug === 'enemy-hit') {
      this.time.delayedCall(220, () => this.debugEnemyHit());
    } else if (debug === 'shot-fx') {
      this.time.delayedCall(220, () => this.debugShotFx(3));
    } else if (debug === 'station-done') {
      this.time.delayedCall(200, () => this.debugFinishStation('sound'));
    } else if (debug === 'beach-layout') {
      this.time.delayedCall(200, () => this.debugBeachLayout());
    } else if (debug === 'boss-persist') {
      this.time.delayedCall(220, () => this.debugBossPersist());
    } else if (debug === 'station-open') {
      this.time.delayedCall(240, () => this.debugStationOpen());
    } else if (debug === 'station-closed') {
      this.time.delayedCall(240, () => this.debugStationClosed());
    } else if (debug === 'hazards') {
      this.time.delayedCall(240, () => this.debugHazards());
    } else if (debug === 'gear-fx') {
      this.time.delayedCall(240, () => this.debugGearFx());
    } else if (debug === 'door-hint') {
      this.time.delayedCall(200, () => this.debugDoorHint());
    } else if (debug === 'scatter-gear' || debug === 'beach-spawn') {
      this.time.delayedCall(200, () => this.debugScatterGear());
    } else if (
      debug === 'forest-station' ||
      debug === 'polar-station' ||
      debug === 'desert-station' ||
      debug === 'stage-station'
    ) {
      this.time.delayedCall(240, () => this.debugStageStation());
    } else if (
      debug === 'forest-boss' ||
      debug === 'polar-boss' ||
      debug === 'desert-boss' ||
      debug === 'forest-boss-hit'
    ) {
      this.time.delayedCall(220, () => this.debugBossPersist());
    } else if (debug === 'forest-traps') {
      this.time.delayedCall(240, () => this.debugForestTraps());
    } else if (debug === 'polar-path') {
      this.time.delayedCall(200, () => this.debugPolarPath());
    } else if (debug === 'desert-path') {
      this.time.delayedCall(200, () => this.debugDesertPath());
    }
  }

  /** Local preview: mid staircase and lowered right towers. */
  debugBeachLayout(): void {
    this.player.reviveAt(1320, this.stage.playerSpawn.y);
    this.panPreviewTo(1380, 135);
  }

  /** Local preview: first bullet hits the crab boss; it must stay visible. */
  debugBossPersist(): void {
    this.debugStartBoss(false);
    this.boss.clearInvuln();
    const b = this.boss;
    this.spawnBullet({
      x: b.x - 40,
      y: b.y,
      dir: 1,
      chargeLevel: 1,
      damage: 18,
      unarmed: false
    });
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(b.x - 20, 135);
  }

  /** Preview hook: jump into the current stage's boss arena. */
  debugStartBoss(forceQuiz = false): void {
    if (this.stageDef.requiresStations) {
      for (const topic of this.science.stageTopics(this.stageId)) {
        this.science.topicCorrects[topic] = 2;
        this.science.topicAttempts[topic] = 2;
        this.science.clearedTopics.add(topic);
      }
      this.doorBlocker.disableBody(true, true);
      this.refreshStationLooks();
      this.refreshDoorSign();
      this.refreshQuestHint();
    }
    this.player.reviveAt(this.stage.bossSpawn.x - 90, this.stage.playerSpawn.y);
    this.beginBossFight();
    this.boss.clearInvuln();
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(this.stage.bossSpawn.x - 30, 135);
    if (forceQuiz) {
      const max = this.boss.maxHp;
      const prev = this.boss.hp;
      this.boss.hp = Math.round(max * 0.74);
      this.queueBossQuizzes(prev, this.boss.hp);
    }
  }

  debugEnemyAttack(): void {
    const first = this.enemies.getFirstAlive() as AnimalEnemy | null;
    if (!first) return;
    this.player.reviveAt(first.x + 40, first.y);
    this.panPreviewTo(first.x, 135);
  }

  debugHitBoss(amount = 80): void {
    if (!this.boss?.fightStarted) this.debugStartBoss(false);
    this.boss.clearInvuln();
    const dmg = Math.max(1, Math.round(amount));
    const slain = this.boss.takeDamage(dmg);
    this.spawnSpark(this.boss.x, this.boss.y - 8, 0x66ffff);
    this.showFloatingText(this.boss.x, this.boss.y - 20, formatDamageText(dmg), '#00ffff');
    this.updateBossBar();
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(this.boss.x - 20, 135);
    if (slain) this.onBossDefeated();
  }

  debugForceEnemyAttack(): void {
    const first = this.enemies.getFirstAlive() as AnimalEnemy | null;
    if (!first) return;
    this.player.reviveAt(first.x + 48, this.stage.playerSpawn.y);
    if (typeof first.previewAttack === 'function') first.previewAttack(this.player);
    this.panPreviewTo(first.x + 10, 135);
  }

  debugOpenEquip(): void {
    if (!this.equipUI.isOpen) this.equipUI.show();
    this.touch.setPaused(true, true);
    this.cameras.main.stopFollow();
  }

  debugEnemyHit(): void {
    const first = this.enemies.getFirstAlive() as AnimalEnemy | null;
    if (!first) return;
    const y = this.stage.playerSpawn.y;
    this.player.reviveAt(first.x - 56, y);
    this.panPreviewTo(first.x - 8, 135);
    this.spawnBullet({
      x: first.x - 28,
      y: first.y,
      dir: 1,
      chargeLevel: 2,
      damage: 18,
      unarmed: false
    });
  }

  debugShotFx(level: 1 | 2 | 3 = 3): void {
    const first = this.enemies.getFirstAlive() as AnimalEnemy | null;
    const x = first ? first.x - 96 : this.player.x + 16;
    const y = first ? first.y : this.player.y;
    if (first) {
      this.player.reviveAt(first.x - 120, this.stage.playerSpawn.y);
      this.panPreviewTo(first.x - 40, 135);
    }
    this.spawnBullet({
      x,
      y,
      dir: 1,
      chargeLevel: level,
      damage: level === 3 ? 36 : level === 2 ? 22 : 12,
      unarmed: false
    });
  }

  debugFinishStation(topic: TopicId = 'sound'): void {
    this.science.topicAttempts[topic] = 2;
    this.science.clearedTopics.add(topic);
    this.refreshStationLooks();
    const station = this.stage.scienceStations.find((s) => s.topic === topic);
    if (station) {
      this.player.reviveAt(station.x, station.y);
      this.panPreviewTo(station.x, 135);
    }
    this.showBanner('完成啦　呢個學習站已經答過兩題。', 2400);
    this.onScienceProgress();
  }

  debugStationOpen(): void {
    const station = this.stage.scienceStations.find((s) => s.topic === 'sound') ?? this.stage.scienceStations[0];
    if (!station) return;
    this.player.reviveAt(station.x, station.y);
    this.panPreviewTo(station.x, 135);
  }

  debugStationClosed(): void {
    this.debugFinishStation('sound');
    const station = this.stage.scienceStations.find((s) => s.topic === 'sound');
    if (station) {
      this.player.reviveAt(station.x + 28, station.y);
      (this.player as unknown as { invulnTimer: number }).invulnTimer = 0;
      this.player.setAlpha(1);
      const body = this.player.body as Phaser.Physics.Arcade.Body;
      body.setVelocity(0, -420);
      this.panPreviewTo(station.x, 135);
      this.messageText.setVisible(false);
    }
  }

  debugHazards(): void {
    const first = this.moverGroup?.getChildren()?.[0] as Phaser.Physics.Arcade.Sprite | undefined;
    if (first) {
      const top = first.y - first.displayHeight / 2;
      this.player.reviveAt(first.x, top - 18);
      this.panPreviewTo(first.x, 135);
    } else {
      this.player.reviveAt(840, this.stage.playerSpawn.y);
      this.panPreviewTo(840, 135);
    }
  }

  debugGearFx(): void {
    const ids = [
      'helm_thunder',
      'body_energy',
      'arms_frost',
      'legs_airdash',
      'chip_iframe',
      'chip_double'
    ];
    for (const id of ids) this.equipment.grant(id);
    this.equipment.equip('helm_thunder');
    this.equipment.equip('body_energy');
    this.equipment.equip('arms_frost');
    this.equipment.equip('legs_airdash');
    this.equipment.equip('chip_iframe', 'chip1');
    this.equipment.equip('chip_double', 'chip2');
    this.player.refreshLoadout();
    this.equipUI.refresh();
    this.player.reviveAt(420, this.stage.playerSpawn.y);
    this.panPreviewTo(420, 135);
    this.player.previewShield(2000);
    this.spawnBullet({
      x: this.player.x + 18,
      y: this.player.y,
      dir: 1,
      chargeLevel: 2,
      damage: 18,
      unarmed: false,
      bulletScale: 1.6
    });
    this.spawnBullet({
      x: this.player.x + 18,
      y: this.player.y,
      dir: 1,
      chargeLevel: 2,
      damage: 18,
      unarmed: false,
      vy: -0.34,
      bulletScale: 1.6
    });
    this.spawnBullet({
      x: this.player.x + 18,
      y: this.player.y,
      dir: 1,
      chargeLevel: 2,
      damage: 18,
      unarmed: false,
      vy: 0.34,
      bulletScale: 1.6
    });
  }

  debugDoorHint(): void {
    this.player.reviveAt(2208, this.stage.playerSpawn.y);
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(2248, 135);
    this.refreshDoorSign();
    this.refreshQuestHint();
  }

  debugTestSpike(safe: boolean): { hpBefore: number; hpAfter: number; safe: boolean } {
    if (safe) {
      this.equipment.grant('body_energy');
      this.equipment.equip('body_energy');
      this.player.refreshLoadout();
    } else {
      this.equipment.unequip('body');
      this.player.refreshLoadout();
    }
    const pack = STAGE_HAZARDS[this.stageId];
    const s = pack.spikes[0];
    this.player.reviveAt(s.x + 18, s.surfaceY - 18);
    (this.player as unknown as { invulnTimer: number }).invulnTimer = 0;
    this.player.setAlpha(1);
    const hpBefore = this.player.hp;
    this.onSpikeHit();
    return { hpBefore, hpAfter: this.player.hp, safe: this.player.derived.spikeSafe };
  }

  debugTestMover(): { onMover: boolean; x: number; y: number } {
    const first = this.moverGroup?.getChildren()?.[0] as Phaser.Physics.Arcade.Sprite | undefined;
    if (!first) return { onMover: false, x: 0, y: 0 };
    const top = first.y - first.displayHeight / 2;
    this.player.reviveAt(first.x, top - 18);
    return { onMover: true, x: first.x, y: first.y };
  }

  private spawnBiomeHazards(): void {
    const pack = STAGE_HAZARDS[this.stageId];
    this.fallerGroup = this.physics.add.group({ allowGravity: false });
    this.chomperGroup = this.physics.add.group({ allowGravity: false, immovable: true });
    this.iceGroup = this.physics.add.staticGroup();
    this.sandGroup = this.physics.add.staticGroup();
    this.ventGroup = this.physics.add.group({ allowGravity: false });

    for (const f of pack.fallers) {
      const key = f.kind === 'icicle'
        ? (this.textures.exists('icicle_tex') ? 'icicle_tex' : 'pickup_tex')
        : (this.textures.exists('pinecone_tex') ? 'pinecone_tex' : 'pickup_tex');
      const spr = this.fallerGroup.create(f.x, f.y, key) as Phaser.Physics.Arcade.Sprite;
      spr.setDepth(7);
      spr.setData('kind', f.kind);
      spr.setData('ox', f.x);
      spr.setData('oy', f.y);
      spr.setData('period', f.period);
      spr.setData('timer', -f.delay);
      spr.setData('state', 'wait');
      const body = spr.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setSize(10, 12);
    }
    this.physics.add.overlap(this.player, this.fallerGroup, (_p, obj) => {
      const spr = obj as Phaser.Physics.Arcade.Sprite;
      if (spr.getData('state') !== 'fall') return;
      this.hurtFromTrap(spr.x, spr.y - 8);
    });

    for (const c of pack.chompers) {
      const key = this.textures.exists('snapplant_tex') ? 'snapplant_tex' : 'pickup_tex';
      const spr = this.chomperGroup.create(c.x, c.surfaceY - 10, key) as Phaser.Physics.Arcade.Sprite;
      spr.setDepth(6);
      spr.setData('period', c.period);
      spr.setData('openMs', c.openMs);
      spr.setData('timer', -c.delay);
      spr.setData('open', true);
      const body = spr.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setImmovable(true);
      body.setSize(16, 14);
    }
    this.physics.add.overlap(this.player, this.chomperGroup, (_p, obj) => {
      const spr = obj as Phaser.Physics.Arcade.Sprite;
      if (spr.getData('open')) return;
      this.hurtFromTrap(spr.x, spr.y - 8);
    });

    const iceKey = this.textures.exists('ice_tex') ? 'ice_tex' : 'pickup_tex';
    for (const ice of pack.ice) {
      const tiles = Math.max(1, Math.round(ice.width / 18));
      for (let i = 0; i < tiles; i++) {
        const spr = this.iceGroup.create(ice.x + 9 + i * 18, ice.surfaceY - 4, iceKey) as Phaser.Physics.Arcade.Sprite;
        spr.setDepth(5);
        spr.refreshBody();
      }
    }

    const sandKey = this.textures.exists('sandsink_tex') ? 'sandsink_tex' : 'pickup_tex';
    for (const sand of pack.sands) {
      const tiles = Math.max(1, Math.round(sand.width / 18));
      for (let i = 0; i < tiles; i++) {
        const spr = this.sandGroup.create(sand.x + 9 + i * 18, sand.surfaceY - 4, sandKey) as Phaser.Physics.Arcade.Sprite;
        spr.setDepth(5);
        spr.refreshBody();
      }
    }

    for (const v of pack.vents) {
      const key =
        v.kind === 'tide'
          ? this.textures.exists('tidespray_tex')
            ? 'tidespray_tex'
            : 'pickup_tex'
          : this.textures.exists('heatvent_tex')
            ? 'heatvent_tex'
            : 'pickup_tex';
      const spr = this.ventGroup.create(v.x, v.surfaceY - 10, key) as Phaser.Physics.Arcade.Sprite;
      spr.setDepth(6);
      spr.setData('period', v.period);
      spr.setData('burstMs', v.burstMs);
      spr.setData('timer', -v.delay);
      spr.setData('state', 'idle');
      spr.setData('kind', v.kind);
      spr.setAlpha(0.85);
      const body = spr.body as Phaser.Physics.Arcade.Body;
      body.setAllowGravity(false);
      body.setSize(12, 16);
    }
    this.physics.add.overlap(this.player, this.ventGroup, (_p, obj) => {
      const spr = obj as Phaser.Physics.Arcade.Sprite;
      if (spr.getData('state') !== 'burst') return;
      this.hurtFromTrap(spr.x, spr.y - 10);
    });
  }

  private hurtFromTrap(x: number, y: number): void {
    if (this.player.dead || this.player.invulnerable) return;
    this.player.takeDamage(TRAP_DAMAGE);
    this.showFloatingText(x, y, `-${TRAP_DAMAGE}`, '#ff8866');
  }

  private refreshPlayerSurface(): void {
    if (!this.player || this.player.dead) {
      return;
    }
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (!body) return;
    let kind: 'normal' | 'ice' | 'sand' = 'normal';
    const touching = (group?: Phaser.Physics.Arcade.StaticGroup): boolean => {
      if (!group) return false;
      let hit = false;
      group.children.each((child) => {
        const spr = child as Phaser.Physics.Arcade.Sprite;
        const b = spr.body as Phaser.Physics.Arcade.StaticBody | undefined;
        if (!spr.active || !b) return true;
        const overlap =
          body.right > b.left + 2 &&
          body.left < b.right - 2 &&
          body.bottom <= b.bottom + 6 &&
          body.bottom >= b.top - 8;
        if (overlap) hit = true;
        return true;
      });
      return hit;
    };
    if (body.blocked.down && touching(this.iceGroup)) kind = 'ice';
    else if (body.blocked.down && touching(this.sandGroup)) kind = 'sand';
    this.player.setSurface(kind);
  }

  private updateBiomeHazards(delta: number): void {
    if (this.fallerGroup) {
      this.fallerGroup.children.each((child) => {
        const spr = child as Phaser.Physics.Arcade.Sprite;
        if (!spr.active) return true;
        const body = spr.body as Phaser.Physics.Arcade.Body;
        const period = finiteNumber(spr.getData('period'), 3000);
        let timer = finiteNumber(spr.getData('timer'), 0) + delta;
        let state = String(spr.getData('state') ?? 'wait');
        const ox = finiteNumber(spr.getData('ox'), spr.x);
        const oy = finiteNumber(spr.getData('oy'), spr.y);
        if (state === 'wait') {
          if (timer >= period) {
            state = 'shake';
            timer = 0;
          }
        } else if (state === 'shake') {
          spr.x = ox + Math.sin(timer / 40) * 2;
          if (timer >= 420) {
            state = 'fall';
            timer = 0;
            spr.x = ox;
            body.setAllowGravity(true);
            body.setVelocity(0, 40);
          }
        } else if (state === 'fall') {
          if (spr.y >= 230 || body.blocked.down) {
            state = 'wait';
            timer = 0;
            body.setAllowGravity(false);
            body.setVelocity(0, 0);
            spr.setPosition(ox, oy);
          }
        }
        spr.setData('timer', timer);
        spr.setData('state', state);
        return true;
      });
    }

    if (this.chomperGroup) {
      this.chomperGroup.children.each((child) => {
        const spr = child as Phaser.Physics.Arcade.Sprite;
        if (!spr.active) return true;
        const period = finiteNumber(spr.getData('period'), 2600);
        const openMs = finiteNumber(spr.getData('openMs'), 1400);
        let timer = finiteNumber(spr.getData('timer'), 0) + delta;
        if (timer < 0) {
          spr.setData('timer', timer);
          return true;
        }
        const cycle = timer % period;
        const open = cycle < openMs;
        spr.setData('open', open);
        spr.setAlpha(open ? 0.85 : 1);
        spr.setTint(open ? 0xb8ffb0 : 0xff8060);
        spr.setScale(open ? 1 : 1.08);
        spr.setData('timer', timer);
        return true;
      });
    }

    if (this.ventGroup) {
      this.ventGroup.children.each((child) => {
        const spr = child as Phaser.Physics.Arcade.Sprite;
        if (!spr.active) return true;
        const period = finiteNumber(spr.getData('period'), 2800);
        const burstMs = finiteNumber(spr.getData('burstMs'), 700);
        const telegraph = 450;
        let timer = finiteNumber(spr.getData('timer'), 0) + delta;
        if (timer < 0) {
          spr.setData('timer', timer);
          spr.setAlpha(0.55);
          return true;
        }
        const cycle = timer % period;
        let state = 'idle';
        if (cycle >= period - telegraph - burstMs && cycle < period - burstMs) {
          state = 'telegraph';
          spr.setAlpha(0.7 + 0.3 * Math.sin(cycle / 50));
          spr.setScale(1, 1.15);
        } else if (cycle >= period - burstMs) {
          state = 'burst';
          spr.setAlpha(1);
          spr.setScale(1, 1.8);
        } else {
          spr.setAlpha(0.7);
          spr.setScale(1, 1);
        }
        spr.setData('state', state);
        spr.setData('timer', timer);
        const body = spr.body as Phaser.Physics.Arcade.Body;
        if (state === 'burst') body.setSize(12, 28);
        else body.setSize(12, 10);
        return true;
      });
    }
  }

  debugScatterGear(): void {
    this.player.reviveAt(this.stage.playerSpawn.x, this.stage.playerSpawn.y);
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(this.stage.playerSpawn.x + 40, 135);
  }

  debugStageStation(): void {
    const station = this.stage.scienceStations[0];
    if (!station) return;
    const topic = station.topic as TopicId;
    this.player.reviveAt(station.x, station.y);
    this.panPreviewTo(station.x, 135);
    this.time.delayedCall(80, () => this.openScienceStation(topic));
  }

  debugForestTraps(): void {
    const pack = STAGE_HAZARDS[this.stageId];
    const target = pack.chompers[0]?.x ?? pack.fallers[0]?.x ?? this.player.x;
    this.player.reviveAt(target - 40, this.stage.playerSpawn.y);
    this.cameras.main.stopFollow();
    this.cameras.main.centerOn(target, 135);
  }

  debugPolarPath(): void {
    this.player.reviveAt(1320, this.stage.playerSpawn.y);
    this.panPreviewTo(1380, 135);
  }

  debugDesertPath(): void {
    this.player.reviveAt(1320, this.stage.playerSpawn.y);
    this.panPreviewTo(1380, 135);
  }

  debugEquipLook(alt: boolean): void {

    const grant = [
      'helm_starter', 'body_starter', 'arms_starter', 'legs_starter',
      'helm_scout', 'helm_thunder', 'body_energy', 'body_leaf',
      'arms_rapid', 'arms_frost', 'legs_airdash', 'legs_sand',
      'chip_breaker', 'chip_double'
    ];
    for (const id of grant) this.equipment.grant(id);
    if (alt) {
      this.equipment.equip('helm_thunder');
      this.equipment.equip('body_energy');
      this.equipment.equip('arms_rapid');
      this.equipment.equip('legs_airdash');
      this.equipment.equip('chip_breaker');
    } else {
      this.equipment.equip('helm_starter');
      this.equipment.equip('body_starter');
      this.equipment.equip('arms_starter');
      this.equipment.equip('legs_starter');
    }
    this.player.refreshLoadout();
    this.equipUI.refresh();
  }
}

function kindFrame(kind: EnemyKind): number {
  const order: Record<string, number> = {
    crab: 0, gull: 2, puppy: 4,
    squirrel: 0, owl: 2, fox: 4,
    penguin: 0, seal: 2, cub: 4,
    lizard: 0, fennec: 2, scorpion: 4
  };
  return order[kind] ?? 0;
}

import Phaser from 'phaser';

/** Merges keyboard + on-screen touch flags into one per-frame input snapshot. */
export class GameInput {
  left = false;
  right = false;
  jumpHeld = false;
  jumpPressed = false;
  shootHeld = false;
  shootReleased = false;
  dashHeld = false;
  dashPressed = false;
  equipPressed = false;

  readonly touch = {
    left: false,
    right: false,
    jump: false,
    shoot: false,
    dash: false,
    equip: false
  };

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private keyA: Phaser.Input.Keyboard.Key | null = null;
  private keyD: Phaser.Input.Keyboard.Key | null = null;
  private keyW: Phaser.Input.Keyboard.Key | null = null;
  private keyJump: Phaser.Input.Keyboard.Key | null = null;
  private keySpace: Phaser.Input.Keyboard.Key | null = null;
  private keyShoot: Phaser.Input.Keyboard.Key | null = null;
  private keyDash: Phaser.Input.Keyboard.Key | null = null;
  private keyEquip: Phaser.Input.Keyboard.Key | null = null;

  private prevJump = false;
  private prevShoot = false;
  private prevDashTouch = false;
  private prevEquipTouch = false;

  attach(scene: Phaser.Scene): void {
    const kb = scene.input.keyboard;
    if (!kb) return;
    this.cursors = kb.createCursorKeys();
    this.keyA = kb.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = kb.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyW = kb.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.keyJump = kb.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShoot = kb.addKey(Phaser.Input.Keyboard.KeyCodes.X);
    this.keyDash = kb.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    this.keyEquip = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }

  poll(): void {
    const left =
      !!this.cursors?.left.isDown || !!this.keyA?.isDown || this.touch.left;
    const right =
      !!this.cursors?.right.isDown || !!this.keyD?.isDown || this.touch.right;
    this.left = left && !right;
    this.right = right && !left;

    const jump =
      !!this.cursors?.up.isDown ||
      !!this.keyW?.isDown ||
      !!this.keyJump?.isDown ||
      !!this.keySpace?.isDown ||
      this.touch.jump;
    this.jumpHeld = jump;
    this.jumpPressed = jump && !this.prevJump;
    this.prevJump = jump;

    const shoot = !!this.keyShoot?.isDown || this.touch.shoot;
    this.shootHeld = shoot;
    this.shootReleased = !shoot && this.prevShoot;
    this.prevShoot = shoot;

    const dash = !!this.keyDash?.isDown || this.touch.dash;
    this.dashHeld = dash;
    const dashJustKey = this.keyDash
      ? Phaser.Input.Keyboard.JustDown(this.keyDash)
      : false;
    this.dashPressed = dashJustKey || (this.touch.dash && !this.prevDashTouch);
    this.prevDashTouch = this.touch.dash;

    const equipJustKey = this.keyEquip
      ? Phaser.Input.Keyboard.JustDown(this.keyEquip)
      : false;
    this.equipPressed =
      equipJustKey || (this.touch.equip && !this.prevEquipTouch);
    this.prevEquipTouch = this.touch.equip;
  }

  clearGameplay(): void {
    this.left = false;
    this.right = false;
    this.jumpHeld = false;
    this.jumpPressed = false;
    this.shootHeld = false;
    this.shootReleased = false;
    this.dashHeld = false;
    this.dashPressed = false;
  }
}

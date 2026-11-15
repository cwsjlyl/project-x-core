import type { GameInput } from './GameInput';
import { gameAudio } from './Audio';

/**
 * Full-window HTML / CSS overlay controls (Honkai-style landscape MOBA layout,
 * original artwork only). Lives outside the FIT-scaled 480×270 canvas so the
 * stick and action buttons stay thumb-sized on phones and tablets.
 */
export class TouchControls {
  private readonly overlay: HTMLElement | null;
  private readonly stick: HTMLElement | null;
  private readonly knob: HTMLElement | null;
  private readonly muteBtn: HTMLElement | null;
  private readonly unsubMute: (() => void) | null = null;
  private readonly cleanups: Array<() => void> = [];
  private stickPointer: number | null = null;
  private restLeft = 0;
  private restTop = 0;
  private hidden = false;
  private menusOpen = false;

  constructor(private readonly gameInput: GameInput) {
    this.overlay = document.getElementById('touch-overlay');
    this.stick = document.getElementById('touch-stick');
    this.knob = document.getElementById('touch-knob');
    this.muteBtn = document.getElementById('touch-mute');
    this.overlay?.classList.add('is-on');
    this.overlay?.classList.remove('menus-open');
    this.bindActions();
    this.bindStick();
    this.bindMute();
    this.bindGuards();
    this.rememberStickRest();
    this.unsubMute = gameAudio.onChange(() => this.refreshMute());
    this.refreshMute();
  }

  setPaused(paused: boolean, _raiseEquip = false): void {
    this.menusOpen = paused;
    this.overlay?.classList.toggle('menus-open', paused);
    if (paused) {
      this.resetStick();
      this.gameInput.touch.left = false;
      this.gameInput.touch.right = false;
      this.gameInput.touch.jump = false;
      this.gameInput.touch.shoot = false;
      this.gameInput.touch.dash = false;
      this.clearDown('touch-jump');
      this.clearDown('touch-shoot');
      this.clearDown('touch-dash');
    }
  }

  setVisible(visible: boolean): void {
    this.hidden = !visible;
    this.overlay?.classList.toggle('is-on', visible);
    if (!visible) {
      this.resetStick();
      (Object.keys(this.gameInput.touch) as (keyof GameInput['touch'])[]).forEach((k) => {
        this.gameInput.touch[k] = false;
      });
    }
  }

  destroy(): void {
    this.setVisible(false);
    this.overlay?.classList.remove('is-on', 'menus-open');
    this.resetStick();
    this.unsubMute?.();
    for (const off of this.cleanups) off();
    this.cleanups.length = 0;
    void this.hidden;
    void this.menusOpen;
  }

  private bindActions(): void {
    this.bindHold('touch-jump', 'jump');
    this.bindHold('touch-shoot', 'shoot');
    this.bindHold('touch-dash', 'dash');
    this.bindHold('touch-equip', 'equip');
  }

  private bindHold(id: string, key: keyof GameInput['touch']): void {
    const el = document.getElementById(id);
    if (!el) return;
    const down = (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
      this.gameInput.touch[key] = true;
      el.classList.add('is-down');
    };
    const up = (ev?: Event) => {
      ev?.preventDefault();
      this.gameInput.touch[key] = false;
      el.classList.remove('is-down');
    };
    this.on(el, 'pointerdown', down);
    this.on(el, 'pointerup', up);
    this.on(el, 'pointercancel', up);
    this.on(el, 'pointerout', (ev) => {
      const e = ev as PointerEvent;
      if (e.pointerType !== 'mouse') up(ev);
    });
    this.on(el, 'lostpointercapture', up);
    this.on(el, 'contextmenu', (ev) => ev.preventDefault());
    this.on(el, 'pointerdown', (ev) => {
      try {
        el.setPointerCapture((ev as PointerEvent).pointerId);
      } catch {
        /* ignore */
      }
    });
  }

  private bindStick(): void {
    const area = document.getElementById('touch-stick-area');
    if (!area || !this.stick) return;
    const start = (ev: Event) => {
      const e = ev as PointerEvent;
      if (this.stickPointer !== null) return;
      e.preventDefault();
      e.stopPropagation();
      this.stickPointer = e.pointerId;
      try {
        area.setPointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
      this.placeStickAt(e.clientX, e.clientY);
      this.nudgeKnob(e.clientX, e.clientY);
    };
    const move = (ev: Event) => {
      const e = ev as PointerEvent;
      if (this.stickPointer !== e.pointerId) return;
      e.preventDefault();
      this.nudgeKnob(e.clientX, e.clientY);
    };
    const end = (ev: Event) => {
      const e = ev as PointerEvent;
      if (this.stickPointer !== e.pointerId) return;
      e.preventDefault();
      this.resetStick();
    };
    this.on(area, 'pointerdown', start);
    this.on(area, 'pointermove', move);
    this.on(area, 'pointerup', end);
    this.on(area, 'pointercancel', end);
    this.on(area, 'lostpointercapture', end);
    this.on(area, 'contextmenu', (ev) => ev.preventDefault());
  }

  private bindMute(): void {
    if (!this.muteBtn) return;
    const toggle = (ev: Event) => {
      ev.preventDefault();
      ev.stopPropagation();
      gameAudio.toggle();
    };
    this.on(this.muteBtn, 'pointerdown', toggle);
    this.on(this.muteBtn, 'contextmenu', (ev) => ev.preventDefault());
  }

  private bindGuards(): void {
    const prevent = (ev: Event) => ev.preventDefault();
    this.on(document, 'gesturestart', prevent);
    this.on(document, 'gesturechange', prevent);
    this.on(document, 'gestureend', prevent);
  }

  private rememberStickRest(): void {
    const stick = this.stick;
    if (!stick) return;
    // Default CSS position (left / bottom). We only override via style when floating.
    stick.style.left = '';
    stick.style.top = '';
    stick.style.bottom = '';
    const area = document.getElementById('touch-stick-area');
    if (!area) return;
    const ar = area.getBoundingClientRect();
    const sr = stick.getBoundingClientRect();
    this.restLeft = sr.left - ar.left;
    this.restTop = sr.top - ar.top;
  }

  private placeStickAt(clientX: number, clientY: number): void {
    const stick = this.stick;
    const area = document.getElementById('touch-stick-area');
    if (!stick || !area) return;
    const ar = area.getBoundingClientRect();
    const size = stick.offsetWidth || 128;
    let left = clientX - ar.left - size / 2;
    let top = clientY - ar.top - size / 2;
    left = Math.max(0, Math.min(ar.width - size, left));
    top = Math.max(0, Math.min(ar.height - size, top));
    stick.style.left = `${left}px`;
    stick.style.top = `${top}px`;
    stick.style.bottom = 'auto';
  }

  private nudgeKnob(clientX: number, clientY: number): void {
    const stick = this.stick;
    const knob = this.knob;
    if (!stick || !knob) return;
    const sr = stick.getBoundingClientRect();
    const cx = sr.left + sr.width / 2;
    const cy = sr.top + sr.height / 2;
    const maxR = sr.width * 0.5 - knob.offsetWidth * 0.5;
    let dx = clientX - cx;
    let dy = clientY - cy;
    const len = Math.hypot(dx, dy);
    if (len > maxR && len > 0) {
      dx = (dx / len) * maxR;
      dy = (dy / len) * maxR;
    }
    const rest = (sr.width - knob.offsetWidth) / 2;
    knob.style.left = `${rest + dx}px`;
    knob.style.top = `${rest + dy}px`;

    // Horizontal only — upward is ignored so thumbs don't trigger jumps.
    const dead = maxR * 0.28;
    this.gameInput.touch.left = dx < -dead;
    this.gameInput.touch.right = dx > dead;
  }

  private resetStick(): void {
    this.stickPointer = null;
    this.gameInput.touch.left = false;
    this.gameInput.touch.right = false;
    if (this.stick) {
      this.stick.style.left = '';
      this.stick.style.top = '';
      this.stick.style.bottom = '';
      if (this.restLeft || this.restTop) {
        /* CSS defaults apply */
      }
    }
    if (this.knob) {
      this.knob.style.left = '';
      this.knob.style.top = '';
    }
  }

  private refreshMute(): void {
    if (this.muteBtn) this.muteBtn.textContent = gameAudio.isMuted ? '靜' : '音';
    this.muteBtn?.classList.toggle('is-down', gameAudio.isMuted);
  }

  private clearDown(id: string): void {
    document.getElementById(id)?.classList.remove('is-down');
  }

  private on(target: EventTarget, type: string, handler: (ev: Event) => void): void {
    target.addEventListener(type, handler, { passive: false });
    this.cleanups.push(() => target.removeEventListener(type, handler));
  }
}

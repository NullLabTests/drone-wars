const TURN_SPEED = 1.2;

export interface ControlState {
  turnRate: number;
  forward: boolean;
  brake: boolean;
  elevate: boolean;
  descend: boolean;
  /** One-shot: fire missile (plane); consumed each frame read. */
  missile: boolean;
  /** One-shot: vehicle special — carpet portal placement (Space); consumed each frame read. */
  specialAction: boolean;
  interact: boolean;
}

export class FlightControls {
  private keys = new Set<string>();
  private _enabled = true;
  private missileQueued = false;
  private specialActionQueued = false;
  private interactQueued = false;

  constructor(element: HTMLElement) {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    element.addEventListener("blur", this.reset);
  }

  get enabled() {
    return this._enabled;
  }

  set enabled(v: boolean) {
    this._enabled = v;
    if (!v) this.keys.clear();
  }

  getState(): ControlState {
    if (!this._enabled) {
      return {
        turnRate: 0,
        forward: false,
        brake: false,
        elevate: false,
        descend: false,
        missile: false,
        specialAction: false,
        interact: false,
      };
    }

    let turnRate = 0;
    if (this.keys.has("a")) turnRate += TURN_SPEED;
    if (this.keys.has("d")) turnRate -= TURN_SPEED;

    const forward = this.keys.has("w");
    const brake = this.keys.has("s");
    const elevate = this.keys.has("arrowup");
    const descend = false;
    const missile = this.missileQueued;
    this.missileQueued = false;
    const specialAction = this.specialActionQueued;
    this.specialActionQueued = false;
    const interact = this.interactQueued;
    this.interactQueued = false;

    return { turnRate, forward, brake, elevate, descend, missile, specialAction, interact };
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (!this._enabled) return;
    const key = e.key.toLowerCase();
    if (key === " " && !e.repeat) {
      // Space fires missile for plane AND triggers specialAction for carpet portal.
      this.missileQueued = true;
      this.specialActionQueued = true;
    }
    if (key === "f" && !e.repeat) {
      this.interactQueued = true;
    }
    if (key === " " || key === "arrowup") {
      e.preventDefault();
    }
    this.keys.add(key);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.key.toLowerCase());
  };

  private reset = () => {
    this.keys.clear();
  };

  dispose() {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}

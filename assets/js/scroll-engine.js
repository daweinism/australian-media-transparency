/**
 * Progress tracker for sticky acts.
 * Native scrolling only. Animations respond to scroll; they never hijack it.
 */
export class ScrollEngine {
  constructor({ reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion;
    this.acts = new Map();
    this.active = null;
    this._onAct = [];
    this._raf = 0;
    this._pending = false;
  }

  onAct(cb) {
    this._onAct.push(cb);
  }

  register(id, el, onProgress) {
    this.acts.set(id, { el, onProgress, lastP: -1 });
  }

  start() {
    const nodes = [...document.querySelectorAll("[data-act]")];

    const syncAct = () => {
      const mid = window.innerHeight * 0.28;
      let best = null;
      let dist = Infinity;
      for (const n of nodes) {
        const r = n.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const c = r.top + Math.min(r.height, window.innerHeight) * 0.2;
        const d = Math.abs(c - mid);
        if (d < dist) {
          dist = d;
          best = n.getAttribute("data-act");
        }
      }
      if (best && best !== this.active) {
        this.active = best;
        for (const cb of this._onAct) cb(best);
      }
    };

    const tick = () => {
      this._pending = false;
      this.acts.forEach((act) => {
        if (!act.onProgress) return;
        const r = act.el.getBoundingClientRect();
        const total = act.el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        if (r.bottom <= 0 || r.top >= window.innerHeight) return;
        let p = Math.min(1, Math.max(0, -r.top / total));
        if (this.reducedMotion) p = Math.round(p * 8) / 8;
        if (Math.abs(p - act.lastP) < 0.004) return;
        act.lastP = p;
        act.onProgress(p);
      });
      syncAct();
    };

    const schedule = () => {
      if (this._pending) return;
      this._pending = true;
      this._raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();
  }
}

export function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}
export function lerp(a, b, t) {
  return a + (b - a) * t;
}
export function ease(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

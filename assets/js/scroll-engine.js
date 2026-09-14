/**
 * Lightweight progress tracker for sticky acts.
 */
export class ScrollEngine {
  constructor({ reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion;
    this.acts = new Map();
    this.active = null;
    this._onAct = [];
  }

  onAct(cb) {
    this._onAct.push(cb);
  }

  register(id, el, onProgress) {
    this.acts.set(id, { el, onProgress });
  }

  start() {
    const nodes = [...document.querySelectorAll("[data-act]")];
    const syncAct = () => {
      const mid = window.innerHeight * 0.3;
      let best = null;
      let dist = Infinity;
      nodes.forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const c = r.top + Math.min(r.height, window.innerHeight) * 0.2;
        const d = Math.abs(c - mid);
        if (d < dist) {
          dist = d;
          best = n.getAttribute("data-act");
        }
      });
      if (best && best !== this.active) {
        this.active = best;
        this._onAct.forEach((cb) => cb(best));
      }
    };

    let raf = null;
    const loop = () => {
      this.acts.forEach((act) => {
        if (!act.onProgress) return;
        const r = act.el.getBoundingClientRect();
        const total = act.el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        if (r.bottom <= 0 || r.top >= window.innerHeight) return;
        const p = Math.min(1, Math.max(0, -r.top / total));
        act.onProgress(this.reducedMotion ? Math.round(p * 8) / 8 : p);
      });
      syncAct();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    window.addEventListener("scroll", syncAct, { passive: true });
    syncAct();
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

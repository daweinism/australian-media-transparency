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

  _viewportHeight() {
    return window.visualViewport?.height || window.innerHeight || 1;
  }

  start() {
    const nodes = [...document.querySelectorAll("[data-act]")];

    const syncAct = () => {
      const vh = this._viewportHeight();
      const mid = vh * 0.35;
      let best = null;
      let dist = Infinity;
      for (const n of nodes) {
        const r = n.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) continue;
        const c = r.top + Math.min(r.height, vh) * 0.25;
        const d = Math.abs(c - mid);
        if (d < dist) {
          dist = d;
          best = n.getAttribute("data-act");
        }
      }
      if (best && best !== this.active) {
        if (this.active) {
          document.getElementById(this.active)?.classList.remove("is-active");
        }
        this.active = best;
        document.getElementById(best)?.classList.add("is-active");
        for (const cb of this._onAct) cb(best);
      }
    };

    const tick = () => {
      this._pending = false;
      const vh = this._viewportHeight();
      this.acts.forEach((act) => {
        if (!act.onProgress) return;
        const r = act.el.getBoundingClientRect();
        const total = act.el.offsetHeight - vh;
        if (total <= 0) return;
        if (r.bottom <= 0 || r.top >= vh) return;
        let p = Math.min(1, Math.max(0, -r.top / total));
        if (this.reducedMotion) p = Math.round(p * 8) / 8;
        if (Math.abs(p - act.lastP) < 0.003) return;
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
    window.visualViewport?.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("scroll", schedule, { passive: true });
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
export function smoothstep(t) {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

/**
 * Scroll-state engine — chapter nav + continuous progress for short hero only.
 */
export class ScrollEngine {
  constructor({ reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion;
    this.scenes = new Map();
    this.activeChapter = null;
    this._chapterRaf = null;
    this._chapterCallbacks = [];
  }

  onChapter(cb) {
    this._chapterCallbacks.push(cb);
  }

  registerScene(id, el, { onProgress } = {}) {
    this.scenes.set(id, { el, onProgress });
  }

  start() {
    this._observeChapters();
    this._bindProgressLoop();
  }

  _observeChapters() {
    const chapters = [...document.querySelectorAll("[data-chapter]")];
    const update = () => {
      const mid = window.innerHeight * 0.32;
      let best = null;
      let bestDist = Infinity;
      chapters.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const center = r.top + Math.min(r.height, window.innerHeight) * 0.2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = c.getAttribute("data-chapter");
        }
      });
      if (best && best !== this.activeChapter) {
        this.activeChapter = best;
        this._chapterCallbacks.forEach((cb) => cb(best));
      }
    };
    window.addEventListener(
      "scroll",
      () => {
        if (this._chapterRaf) return;
        this._chapterRaf = requestAnimationFrame(() => {
          this._chapterRaf = null;
          update();
        });
      },
      { passive: true }
    );
    update();
  }

  _bindProgressLoop() {
    const tick = () => {
      this.scenes.forEach((scene) => {
        if (!scene.onProgress) return;
        const rect = scene.el.getBoundingClientRect();
        const total = scene.el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const progress = Math.min(1, Math.max(0, -rect.top / total));
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          scene.onProgress(this.reducedMotion ? Math.round(progress * 10) / 10 : progress);
        }
      });
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

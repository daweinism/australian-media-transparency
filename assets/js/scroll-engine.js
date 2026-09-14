/**
 * Scroll-state engine
 * Uses IntersectionObserver + rAF; no unthrottled scroll handlers for state.
 */
export class ScrollEngine {
  constructor({ reducedMotion = false } = {}) {
    this.reducedMotion = reducedMotion;
    this.scenes = new Map();
    this.activeChapter = null;
    this._raf = null;
    this._progressCallbacks = [];
    this._chapterCallbacks = [];
  }

  onProgress(cb) {
    this._progressCallbacks.push(cb);
  }

  onChapter(cb) {
    this._chapterCallbacks.push(cb);
  }

  registerScene(id, el, { steps = [], onProgress, onStep } = {}) {
    this.scenes.set(id, { el, steps, onProgress, onStep, activeStep: -1 });
  }

  start() {
    this._observeChapters();
    this._observeSteps();
    this._bindProgressLoop();
  }

  _observeChapters() {
    const chapters = [...document.querySelectorAll("[data-chapter]")];
    const update = () => {
      const mid = window.innerHeight * 0.35;
      let best = null;
      let bestDist = Infinity;
      chapters.forEach((c) => {
        const r = c.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) return;
        const center = r.top + Math.min(r.height, window.innerHeight) * 0.25;
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
    window.addEventListener("scroll", () => {
      if (this._chapterRaf) return;
      this._chapterRaf = requestAnimationFrame(() => {
        this._chapterRaf = null;
        update();
      });
    }, { passive: true });
    update();
  }

  _observeSteps() {
    const steps = document.querySelectorAll("[data-step]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const stepEl = entry.target;
          const sceneId = stepEl.closest("[data-scene]")?.getAttribute("data-scene");
          if (!sceneId) return;
          const scene = this.scenes.get(sceneId);
          if (!scene) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            stepEl.classList.add("is-active");
            const idx = Number(stepEl.getAttribute("data-step"));
            if (idx !== scene.activeStep) {
              scene.activeStep = idx;
              scene.onStep?.(idx, stepEl);
            }
          } else if (!entry.isIntersecting) {
            stepEl.classList.remove("is-active");
          }
        });
      },
      { threshold: [0.45, 0.6] }
    );
    steps.forEach((s) => io.observe(s));
  }

  _bindProgressLoop() {
    const tick = () => {
      this.scenes.forEach((scene, id) => {
        if (!scene.onProgress) return;
        const rect = scene.el.getBoundingClientRect();
        const total = scene.el.offsetHeight - window.innerHeight;
        if (total <= 0) return;
        const raw = -rect.top / total;
        const progress = Math.min(1, Math.max(0, raw));
        if (progress > 0 && progress < 1 || (progress === 0 && rect.top < window.innerHeight && rect.bottom > 0)) {
          scene.onProgress(this.reducedMotion ? Math.round(progress * 10) / 10 : progress);
        }
      });
      this._progressCallbacks.forEach((cb) => cb());
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);
  }
}

export function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Citation / source drawer system
 */
export class SourceSystem {
  constructor({ sources = [], drawer, backdrop } = {}) {
    this.sources = new Map(sources.map((s, i) => [s.id, { ...s, index: i + 1 }]));
    this.drawer = drawer;
    this.backdrop = backdrop;
    this.lastFocus = null;
  }

  indexOf(id) {
    return this.sources.get(id)?.index ?? null;
  }

  renderMarkers(root = document) {
    root.querySelectorAll("[data-sources]").forEach((el) => {
      const ids = el.getAttribute("data-sources").split(",").map((s) => s.trim()).filter(Boolean);
      const frag = document.createDocumentFragment();
      ids.forEach((id) => {
        const src = this.sources.get(id);
        if (!src) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "cite";
        btn.textContent = String(src.index);
        btn.setAttribute("aria-label", `Open source ${src.index}: ${src.title}`);
        btn.setAttribute("aria-expanded", "false");
        btn.dataset.sourceId = id;
        btn.addEventListener("click", () => this.open(id, btn));
        frag.appendChild(btn);
      });
      el.replaceWith(frag);
    });
  }

  open(id, trigger) {
    const src = this.sources.get(id);
    if (!src || !this.drawer) return;
    this.lastFocus = trigger || document.activeElement;
    this.drawer.innerHTML = `
      <button type="button" class="source-drawer__close" data-close>Close</button>
      <p class="tag tag--fact">Source ${src.index}</p>
      <h2 id="source-drawer-title" style="font-family:var(--font-display);font-weight:500;font-size:1.6rem;line-height:1.2;margin:0.6rem 0 0;">${escapeHtml(src.title)}</h2>
      <dl class="source-drawer__meta">
        <div><dt>Organisation</dt><dd>${escapeHtml(src.organisation)}</dd></div>
        <div><dt>Date</dt><dd>${escapeHtml(src.date)}</dd></div>
        <div><dt>Source type</dt><dd>${escapeHtml(src.type)}</dd></div>
        <div><dt>What this supports</dt><dd>${escapeHtml(src.supports)}</dd></div>
      </dl>
      <p style="color:var(--ink-soft);margin:0;">${escapeHtml(src.description)}</p>
      <a class="source-drawer__link" href="${escapeAttr(src.url)}" target="_blank" rel="noopener noreferrer">Open source ↗</a>
    `;
    this.drawer.classList.add("is-open");
    this.drawer.setAttribute("aria-hidden", "false");
    this.backdrop?.classList.add("is-open");
    this.backdrop?.setAttribute("aria-hidden", "false");
    document.querySelectorAll(".cite").forEach((c) => c.setAttribute("aria-expanded", String(c.dataset.sourceId === id)));
    this.drawer.querySelector("[data-close]")?.focus();
    this.drawer.querySelector("[data-close]")?.addEventListener("click", () => this.close());
  }

  close() {
    this.drawer?.classList.remove("is-open");
    this.drawer?.setAttribute("aria-hidden", "true");
    this.backdrop?.classList.remove("is-open");
    this.backdrop?.setAttribute("aria-hidden", "true");
    document.querySelectorAll(".cite").forEach((c) => c.setAttribute("aria-expanded", "false"));
    this.lastFocus?.focus?.();
  }

  bindGlobal() {
    this.backdrop?.addEventListener("click", () => this.close());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
  }
}

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeAttr(str = "") {
  return escapeHtml(str).replaceAll("'", "&#39;");
}

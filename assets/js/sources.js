export class SourceSystem {
  constructor({ sources = [], drawer, backdrop } = {}) {
    this.sources = new Map(sources.map((s, i) => [s.id, { ...s, index: i + 1 }]));
    this.drawer = drawer;
    this.backdrop = backdrop;
    this.lastFocus = null;
    this.details = {};
  }

  setDetails(map) {
    this.details = map;
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
        btn.setAttribute("aria-label", `Source ${src.index}`);
        btn.setAttribute("aria-expanded", "false");
        btn.dataset.sourceId = id;
        btn.addEventListener("click", () => this.openSource(id, btn));
        frag.appendChild(btn);
      });
      el.replaceWith(frag);
    });
  }

  openSource(id, trigger) {
    const src = this.sources.get(id);
    if (!src) return;
    this.lastFocus = trigger || document.activeElement;
    this._open(`Source ${src.index}`, `
      <dl>
        <div><dt>Organisation</dt><dd>${esc(src.organisation)}</dd></div>
        <div><dt>Date</dt><dd>${esc(src.date)}</dd></div>
        <div><dt>Type</dt><dd>${esc(src.type)}</dd></div>
        <div><dt>What this supports</dt><dd>${esc(src.supports)}</dd></div>
      </dl>
      <p style="color:var(--ink-2);margin:0 0 0.75rem;">${esc(src.description)}</p>
      <a class="drawer__go" href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">Open source ↗</a>
    `, src.title);
    document.querySelectorAll(".cite").forEach((c) => c.setAttribute("aria-expanded", String(c.dataset.sourceId === id)));
  }

  openDetail(key, trigger) {
    const d = this.details[key];
    if (!d) return;
    this.lastFocus = trigger || document.activeElement;
    this._open(d.badge || "Detail", `<p style="color:var(--ink-2);margin:0;line-height:1.55;">${d.body}</p>${d.extra || ""}`, d.title);
  }

  _open(badge, body, title) {
    this.drawer.innerHTML = `
      <button type="button" class="drawer__x" data-close>Close</button>
      <p class="badge">${esc(badge)}</p>
      <h2 id="drawer-title">${esc(title)}</h2>
      ${body}
    `;
    this.drawer.classList.add("is-on");
    this.drawer.setAttribute("aria-hidden", "false");
    this.backdrop.classList.add("is-on");
    this.backdrop.setAttribute("aria-hidden", "false");
    this.drawer.querySelector("[data-close]")?.focus();
    this.drawer.querySelector("[data-close]")?.addEventListener("click", () => this.close());
  }

  close() {
    this.drawer.classList.remove("is-on");
    this.drawer.setAttribute("aria-hidden", "true");
    this.backdrop.classList.remove("is-on");
    this.backdrop.setAttribute("aria-hidden", "true");
    document.querySelectorAll(".cite").forEach((c) => c.setAttribute("aria-expanded", "false"));
    this.lastFocus?.focus?.();
  }

  bind() {
    this.backdrop.addEventListener("click", () => this.close());
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.close();
    });
    document.querySelectorAll("[data-detail]").forEach((btn) => {
      btn.addEventListener("click", () => this.openDetail(btn.dataset.detail, btn));
    });
  }
}

function esc(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

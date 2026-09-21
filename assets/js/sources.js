export class SourceSystem {
  constructor({ sources = [], drawer, backdrop } = {}) {
    this.sources = new Map(sources.map((s, i) => [s.id, { ...s, index: i + 1 }]));
    this.drawer = drawer;
    this.backdrop = backdrop;
    this.lastFocus = null;
    this.details = {};
    this._scrollY = 0;
    this._touchBlock = null;
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
        btn.className = "cite interactive-control";
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
        <div><dt>What this supports</dt><dd>${esc(src.supports)}</dd></div>
      </dl>
      <a class="drawer__go interactive-control" href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">Open source →</a>
    `, src.title);
    document.querySelectorAll(".cite").forEach((c) =>
      c.setAttribute("aria-expanded", String(c.dataset.sourceId === id))
    );
  }

  openDetail(key, trigger) {
    const d = this.details[key];
    if (!d) return;
    this.lastFocus = trigger || document.activeElement;
    const body = [
      d.lead ? `<p class="lead">${d.lead}</p>` : "",
      ...(d.paras || []).map((p) => `<p class="body">${p}</p>`),
      d.takeaway
        ? `<div class="takeaway"><strong>Key takeaway</strong>${d.takeaway}</div>`
        : "",
      d.extra || "",
    ].join("");
    this._open(d.badge || "Detail", body, d.title);
  }

  _lockPage() {
    if (document.body.classList.contains("is-drawer-open")) return;
    this._scrollY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add("is-drawer-open");
    document.body.classList.add("is-drawer-open");
    document.body.style.top = `-${this._scrollY}px`;

    this._touchBlock = (e) => {
      if (this.drawer.contains(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener("touchmove", this._touchBlock, { passive: false });
  }

  _unlockPage() {
    if (!document.body.classList.contains("is-drawer-open")) return;
    document.documentElement.classList.remove("is-drawer-open");
    document.body.classList.remove("is-drawer-open");
    document.body.style.top = "";
    if (this._touchBlock) {
      document.removeEventListener("touchmove", this._touchBlock);
      this._touchBlock = null;
    }
    window.scrollTo(0, this._scrollY || 0);
  }

  _open(badge, body, title) {
    this._lockPage();
    this.drawer.innerHTML = `
      <button type="button" class="drawer__x interactive-control" data-close aria-label="Close">× Close</button>
      <p class="tag">${esc(badge)}</p>
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
    this._unlockPage();
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

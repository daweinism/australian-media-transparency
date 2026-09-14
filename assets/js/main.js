import { ScrollEngine } from "./scroll-engine.js";
import { SourceSystem } from "./sources.js";

const BASE = new URL("../../", import.meta.url);

async function loadJSON(path) {
  const res = await fetch(new URL(path, BASE));
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const NBI_CAPTIONS = [
  {
    tag: "Policy design",
    html: `Applies to significant social media or internet search services in Australia. <span data-sources="source-nbi-02,source-nbi-03"></span>`,
  },
  {
    tag: "Policy design",
    html: `Liability is keyed to relevant Australian digital advertising revenue above <strong>$250 million</strong>. <span data-sources="source-nbi-02"></span>`,
  },
  {
    tag: "Policy design",
    html: `The enacted charge rate is <strong>2.75%</strong> under the News Media Bargaining Charge Act 2026. <span data-sources="source-nbi-01,source-nbi-04"></span>`,
  },
  {
    tag: "Policy design",
    html: `Two pathways: qualifying expenditure that offsets liability, or payment of the charge. <span data-sources="source-nbi-02,source-nbi-03"></span>`,
  },
  {
    tag: "Policy design",
    html: `Offset entitlement needs eligible expenditure across at least <strong>8</strong> news-business groups, with a <strong>25%</strong> single-group cap. <span data-sources="source-nbi-02,source-nbi-03"></span>`,
  },
];

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
function clamp(n, a, b) {
  return Math.min(b, Math.max(a, n));
}
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function initHero(heroEl) {
  const content = heroEl.querySelector(".hero__content");
  const spans = [...heroEl.querySelectorAll(".hero__title span")];
  const sub = heroEl.querySelector(".hero__sub");
  const meta = heroEl.querySelector(".hero__meta");
  const eco = heroEl.querySelector(".hero__ecosystem");
  const hint = heroEl.querySelector(".hero__hint");
  const svg = eco.querySelector("svg");
  const gLinks = svg.querySelector(".links");
  const gNodes = svg.querySelector(".nodes");

  const seed = [
    [50, 50], [22, 28], [78, 24], [18, 62], [82, 58], [35, 78], [68, 76],
    [40, 32], [60, 36], [28, 48], [72, 46], [48, 68], [12, 40], [88, 40],
    [55, 18], [33, 58], [65, 62],
  ];

  seed.forEach(([x, y], i) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", i === 0 ? 2.4 : 1.1 + (i % 3) * 0.3);
    c.setAttribute("fill", i % 4 === 0 ? "#3d5c4b" : i % 5 === 0 ? "#b07d3a" : "#1a1917");
    c.style.opacity = "0";
    gNodes.appendChild(c);
  });
  for (let i = 1; i < seed.length; i++) {
    const a = seed[i];
    const b = seed[i % 3 === 0 ? 0 : i - 1];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", a[0]);
    line.setAttribute("y1", a[1]);
    line.setAttribute("x2", b[0]);
    line.setAttribute("y2", b[1]);
    line.setAttribute("stroke", "#1a1917");
    line.setAttribute("stroke-width", "0.35");
    line.style.strokeOpacity = "0";
    gLinks.appendChild(line);
  }

  const nodes = [...gNodes.children];
  const links = [...gLinks.children];

  return (progress) => {
    const p = clamp(progress, 0, 1);
    if (reducedMotion) {
      const show = p > 0.5;
      content.style.opacity = show ? "0.2" : "1";
      content.style.transform = show ? "scale(0.4)" : "scale(1)";
      eco.style.opacity = show ? "1" : "0";
      hint.style.opacity = p > 0.1 ? "0" : "1";
      return;
    }
    const zoom = lerp(1, 0.28, easeInOut(clamp((p - 0.05) / 0.55, 0, 1)));
    const ecoIn = clamp((p - 0.25) / 0.4, 0, 1);
    content.style.transform = `scale(${zoom})`;
    content.style.opacity = String(lerp(1, 0.1, clamp((p - 0.4) / 0.45, 0, 1)));
    spans.forEach((span, i) => {
      const sep = clamp((p - i * 0.03) / 0.28, 0, 1);
      span.style.transform = `translateY(${sep * (i - 1) * 22}px)`;
      span.style.opacity = String(lerp(1, 0.4, sep));
    });
    sub.style.opacity = String(1 - clamp((p - 0.1) / 0.35, 0, 1));
    meta.style.opacity = String(1 - clamp((p - 0.1) / 0.35, 0, 1));
    hint.style.opacity = String(1 - clamp(p / 0.12, 0, 1));
    eco.style.opacity = String(ecoIn);
    nodes.forEach((n, i) => {
      n.style.opacity = String(clamp((ecoIn - i * 0.025) / 0.2, 0, 1) * 0.9);
    });
    links.forEach((l, i) => {
      l.style.strokeOpacity = String(clamp((ecoIn - 0.2 - i * 0.02) / 0.25, 0, 1) * 0.22);
    });
  };
}

function initReveals() {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-in");
    }),
    { threshold: 0.18 }
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

function initDiversity(ecosystem) {
  const spectrum = document.getElementById("diversity-spectrum");
  const pills = document.getElementById("concept-pills");
  if (!spectrum) return;

  const widths = [78, 64, 71, 58, 52, 47, 41, 55, 44, 49];
  ecosystem.categories.forEach((cat, i) => {
    const row = document.createElement("div");
    row.className = "spectrum-row";
    row.innerHTML = `<span>${escapeHtml(cat.label)}</span><div class="spectrum-bar" style="--w:${widths[i]}%"><i></i></div>`;
    spectrum.appendChild(row);
  });
  ecosystem.diversityConcepts.forEach((c) => {
    const s = document.createElement("span");
    s.textContent = c.text;
    pills?.appendChild(s);
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          spectrum.querySelectorAll(".spectrum-bar").forEach((b) => b.classList.add("is-on"));
        }
      });
    },
    { threshold: 0.4 }
  );
  io.observe(spectrum);
}

function hasLiveInterview(item) {
  return item.status === "ready" && (item.audio || item.video || item.embed || (item.quote && !item.quote.includes("[INSERT")));
}

function initInterviews(root, data) {
  if (!root || !data) return;
  const live = (data.interviews || []).filter(hasLiveInterview);
  const useLive = data.mode === "live" || (data.mode === "auto" && live.length > 0);

  if (!useLive) {
    const fb = data.fallback;
    root.innerHTML = `
      <div class="status-banner">
        <span class="tag tag--illustrative">${escapeHtml(fb.statusLabel)}</span>
        <span style="color:var(--ink-soft);font-size:0.95rem;">${escapeHtml(fb.statusNote)}</span>
      </div>
      <p style="max-width:40rem;color:var(--ink-soft);">${escapeHtml(fb.lede)}</p>
      <div class="interview-grid" style="margin-top:1rem;">
        ${fb.panels
          .map(
            (p) => `
          <article class="stake-card">
            <p class="tag">Stakeholder</p>
            <h3>${escapeHtml(p.organisation)}</h3>
            <p><strong>Focus:</strong> ${escapeHtml(p.focus)}</p>
            <p><strong>Why it matters:</strong> ${escapeHtml(p.why)}</p>
            <p class="tag" style="margin-top:0.5rem;">Questions we would ask</p>
            <ul>${p.ask.map((q) => `<li>${escapeHtml(q)}</li>`).join("")}</ul>
            <a class="btn" href="${escapeHtml(p.linkUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(p.linkLabel)} ↗</a>
          </article>`
          )
          .join("")}
      </div>
    `;
    return;
  }

  root.innerHTML = `
    <div class="status-banner">
      <span class="tag tag--fact">Verified interviews</span>
      <span style="color:var(--ink-soft);font-size:0.95rem;">${escapeHtml(data.sectionSubtitle)}</span>
    </div>
    <div class="interview-live">
      <div class="interview-tabs" role="tablist"></div>
      <div data-panel></div>
    </div>
  `;
  const tabs = root.querySelector(".interview-tabs");
  const panel = root.querySelector("[data-panel]");

  function render(item) {
    panel.innerHTML = `
      <div class="interview-media">
        ${
          item.video
            ? `<video controls preload="none" playsinline><source src="${escapeHtml(item.video)}" type="video/mp4" /></video>`
            : item.embed
              ? `<iframe title="Interview" src="${escapeHtml(item.embed)}" loading="lazy" style="width:100%;height:100%;border:0;" allowfullscreen></iframe>`
              : item.portrait
                ? `<img src="${escapeHtml(item.portrait)}" alt="" loading="lazy" />`
                : `<span>[INSERT VIDEO / PORTRAIT]</span>`
        }
      </div>
      <blockquote class="interview-quote">${escapeHtml(item.quote)}</blockquote>
      <p class="tag" style="margin:0.5rem 0;">${escapeHtml(item.name)} · ${escapeHtml(item.role)} · ${escapeHtml(item.organisation)}</p>
      ${
        item.audio
          ? `<audio controls preload="none" style="width:100%;"><source src="${escapeHtml(item.audio)}" type="audio/mpeg" /></audio>`
          : ""
      }
      <details style="margin-top:0.75rem;"><summary class="tag" style="cursor:pointer;">Transcript</summary>
      <div class="interview-transcript">${escapeHtml(item.transcript)}</div></details>
    `;
  }

  live.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(i === 0));
    btn.textContent = item.organisation;
    btn.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      render(item);
    });
    tabs.appendChild(btn);
  });
  render(live[0]);
}

function initNbi(sourceSystem) {
  const board = document.getElementById("nbi-board");
  if (!board) return;
  const tabs = [...board.querySelectorAll("[data-nbi-step]")];
  const nodes = [...board.querySelectorAll("[data-flow]")];
  const caption = document.getElementById("nbi-caption");

  function setStep(step) {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(Number(t.dataset.nbiStep) === step)));
    nodes.forEach((n) => {
      const idx = Number(n.dataset.flow);
      n.classList.toggle("is-on", idx === step);
      n.classList.toggle("is-seen", idx < step);
    });
    if (caption && NBI_CAPTIONS[step]) {
      caption.innerHTML = `<p class="tag tag--policy">${NBI_CAPTIONS[step].tag}</p><p>${NBI_CAPTIONS[step].html}</p>`;
      sourceSystem.renderMarkers(caption);
    }
  }

  tabs.forEach((t) => t.addEventListener("click", () => setStep(Number(t.dataset.nbiStep))));
  setStep(0);
}

function initEight() {
  const board = document.getElementById("eight-board");
  if (!board) return;
  const buttons = [...board.querySelectorAll("[data-n]")];
  const nodes = [...board.querySelectorAll(".eight-node")];
  const center = document.getElementById("eight-center");

  nodes.forEach((n, i) => {
    const angle = (Math.PI * 2 * i) / nodes.length - Math.PI / 2;
    const x = 50 + 42 * Math.cos(angle);
    const y = 50 + 42 * Math.sin(angle);
    n.style.left = `calc(${x}% - 1.075rem)`;
    n.style.top = `calc(${y}% - 1.075rem)`;
  });

  function setCount(n) {
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.n) === n)));
    nodes.forEach((node, i) => node.classList.toggle("is-on", i < n));
    if (center) {
      center.textContent = n >= 8 ? "8+ groups" : n <= 1 ? "Concentration" : `${n} groups`;
      center.classList.toggle("is-diverse", n >= 8);
    }
  }

  buttons.forEach((b) => b.addEventListener("click", () => setCount(Number(b.dataset.n))));
  setCount(1);
}

function initTransparency() {
  const board = document.getElementById("transparency-board");
  if (!board) return;
  const tabs = [...board.querySelectorAll("[data-t]")];
  const layers = [...board.querySelectorAll(".t-layer")];

  function setLayer(step) {
    tabs.forEach((t) => t.setAttribute("aria-selected", String(Number(t.dataset.t) === step)));
    layers.forEach((l, i) => l.classList.toggle("is-off", step > i));
  }
  tabs.forEach((t) => t.addEventListener("click", () => setLayer(Number(t.dataset.t))));
  setLayer(0);
}

function initProposalChain() {
  const chain = document.getElementById("proposal-chain");
  if (!chain) return;
  const steps = [...chain.querySelectorAll("span")];
  let i = 0;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      if (reducedMotion) {
        steps.forEach((s) => s.classList.add("is-on"));
        return;
      }
      const tick = () => {
        steps.forEach((s, idx) => s.classList.toggle("is-on", idx <= i));
        i += 1;
        if (i < steps.length) setTimeout(tick, 380);
      };
      tick();
      io.disconnect();
    },
    { threshold: 0.5 }
  );
  io.observe(chain);
}

function initScenarios(root, data) {
  if (!root || !data?.scenarios) return;
  const note = document.createElement("p");
  note.className = "tag tag--scenario";
  note.textContent = `${data.label} — ${data.disclaimer}`;
  root.appendChild(note);

  const grid = document.createElement("div");
  grid.className = "scenario-grid";
  root.appendChild(grid);

  const patterns = [
    [90, 70, 40, 25, 15],
    [55, 60, 58, 62, 65],
    [25, 35, 50, 70, 85],
  ];

  data.scenarios.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scenario-card";
    btn.dataset.tone = s.tone;
    btn.setAttribute("aria-pressed", String(i === 0));
    const bars = patterns[i]
      .map((h, idx) => `<b style="height:${h}%;opacity:${i === 0 ? 0.75 : 0.25};background:${i === 0 ? "var(--ink)" : "var(--ink)"}" data-h="${h}"></b>`)
      .join("");
    btn.innerHTML = `
      <div class="scenario-visual" aria-hidden="true">${bars}</div>
      <span class="tag tag--scenario">Scenario ${i + 1}</span>
      <h4>${escapeHtml(s.title)}</h4>
      <p>${escapeHtml(s.summary)}</p>
    `;
    btn.addEventListener("click", () => {
      grid.querySelectorAll(".scenario-card").forEach((c) => {
        const on = c === btn;
        c.setAttribute("aria-pressed", String(on));
        c.querySelectorAll(".scenario-visual b").forEach((b) => {
          b.style.opacity = on ? "0.8" : "0.22";
          if (c.dataset.tone === "risk" && on) b.style.background = "var(--danger)";
          else if (c.dataset.tone === "support" && on) b.style.background = "var(--eucalyptus)";
          else if (c.dataset.tone === "aspirational" && on) b.style.background = "var(--ochre)";
          else if (!on) b.style.background = "var(--ink)";
        });
      });
    });
    grid.appendChild(btn);
  });
}

async function main() {
  const [sources, nbi, ecosystem, interviews, scenarios] = await Promise.all([
    loadJSON("data/sources.json"),
    loadJSON("data/nbi.json"),
    loadJSON("data/ecosystem.json"),
    loadJSON("data/interviews.json"),
    loadJSON("data/scenarios.json"),
  ]);

  const sourceSystem = new SourceSystem({
    sources,
    drawer: document.getElementById("source-drawer"),
    backdrop: document.getElementById("drawer-backdrop"),
  });
  sourceSystem.renderMarkers(document);
  sourceSystem.bindGlobal();

  document.querySelectorAll("[data-bind]").forEach((el) => {
    const key = el.getAttribute("data-bind");
    if (key === "rate") el.textContent = nbi.enactedChargeRate.value;
    if (key === "threshold") el.textContent = nbi.threshold.value;
    if (key === "groups") el.textContent = String(nbi.offset.minimumGroups);
    if (key === "cap") el.textContent = nbi.offset.singleGroupCap;
  });

  const evidenceList = document.getElementById("evidence-list");
  sources.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer"><span class="org">${i + 1}. ${escapeHtml(s.organisation)} · ${escapeHtml(s.type)}</span><br><strong>${escapeHtml(s.title)}</strong></a>`;
    evidenceList?.appendChild(li);
  });

  const nav = document.getElementById("progress-nav");
  const engine = new ScrollEngine({ reducedMotion });
  engine.onChapter((id) => {
    nav?.querySelectorAll("a").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
    });
  });

  const hero = document.getElementById("chapter-01");
  engine.registerScene("hero", hero, { onProgress: initHero(hero) });
  engine.start();

  initReveals();
  initDiversity(ecosystem);
  initInterviews(document.getElementById("interview-root"), interviews);
  initNbi(sourceSystem);
  initEight();
  initTransparency();
  initProposalChain();
  initScenarios(document.getElementById("scenario-root"), scenarios);
}

main().catch((err) => {
  console.error(err);
  const banner = document.createElement("div");
  banner.setAttribute("role", "alert");
  banner.style.cssText = "padding:1rem;background:#8a3b35;color:#fff;font-family:sans-serif;";
  banner.textContent = "Content failed to load. Serve over HTTP (not file://) and refresh.";
  document.body.prepend(banner);
});

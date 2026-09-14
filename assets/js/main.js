import { ScrollEngine, clamp, lerp, ease } from "./scroll-engine.js";
import { SourceSystem } from "./sources.js";

const BASE = new URL("../../", import.meta.url);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function load(path) {
  const res = await fetch(new URL(path, BASE));
  if (!res.ok) throw new Error(path);
  return res.json();
}

const DETAILS = {
  diversity: {
    badge: "Concept",
    title: "Media diversity",
    body: "A healthy information system is varied — local, regional, independent, community, First Nations, cultural and other perspectives. Labels are conceptual, not measured shares.",
  },
  voices: {
    badge: "Illustrative",
    title: "Who gets heard",
    body: "Conceptual model only — not measured audience data. Scale shows the idea of loud, quiet and missing voices, and who can keep speaking.",
  },
  "2021": {
    badge: "Fact",
    title: "2021 Bargaining Code",
    body: "Enacted February 2021, in effect March 2021. No platforms designated; the framework contributed to voluntary commercial agreements with Australian news organisations.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-code-01,source-code-02,source-code-03"></span></p>`,
  },
  rate: {
    badge: "Policy",
    title: "2.75% charge rate",
    body: "The enacted News Media Bargaining Charge Act 2026 sets the rate of charge at 2.75%. Earlier design versions used 2.5%; Parliament amended the rate before enactment.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-01,source-nbi-04"></span></p>`,
  },
  threshold: {
    badge: "Policy",
    title: "$250M+ threshold",
    body: "Liability turns on relevant Australian digital advertising revenue exceeding $250 million for the financial year.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-02"></span></p>`,
  },
  paths: {
    badge: "Policy",
    title: "Offset or payment",
    body: "Eligible expenditure supporting registered Australian news businesses can offset NMI liability. Amounts not offset are payable as charge and directed to the News Journalism Payment Scheme.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-02,source-nbi-03,source-nbi-05"></span></p>`,
  },
  eight: {
    badge: "Policy",
    title: "8+ news business groups",
    body: "Offset entitlement requires new eligible expenditure in relation to at least eight different news business corporate groups — designed to encourage broader participation.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-02,source-nbi-03"></span></p>`,
  },
  cap: {
    badge: "Policy",
    title: "25% one-group max",
    body: "A particular news business corporate group cannot contribute more than one quarter (25%) of the NMI offset amount.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-03"></span></p>`,
  },
  money: {
    badge: "Illustrative",
    title: "Money pathway",
    body: "Conceptual flow only — no invented dollar amounts. Charge receipts are directed to the News Journalism Payment Scheme under parliamentary materials.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-05"></span></p>`,
  },
  outcome: {
    badge: "Our analysis",
    title: "Design is not destiny",
    body: "The mechanism is designed to encourage support across a broader range of news businesses. That does not guarantee diverse journalism outcomes.",
  },
  transparency: {
    badge: "Our analysis",
    title: "Disclosure ≠ accountability",
    body: "Publishing numbers is not enough if methodology, recipients, journalism share and independent verification remain unclear.",
  },
  proposal: {
    badge: "Our proposal",
    title: "Voluntary transparency",
    body: "Disclose the structure of major platform agreements; independent review; public report; broader participation at the table. This is our intervention — not existing law.",
  },
};

function seedEco(svg, n = 16) {
  const gN = svg.querySelector(".nodes");
  const gL = svg.querySelector(".links");
  const pts = [[50, 50]];
  for (let i = 1; i < n; i++) {
    const a = (Math.PI * 2 * i) / n;
    const r = 16 + (i % 5) * 6;
    pts.push([50 + Math.cos(a) * r * 0.7, 50 + Math.sin(a) * r * 0.55]);
  }
  pts.forEach(([x, y], i) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", i === 0 ? 2.5 : 1 + (i % 3) * 0.35);
    c.classList.add("n");
    if (i % 4 === 1) c.classList.add("n-e");
    if (i % 5 === 2) c.classList.add("n-o");
    c.style.opacity = "0";
    gN.appendChild(c);
  });
  for (let i = 1; i < pts.length; i++) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    const b = pts[i % 3 === 0 ? 0 : i - 1];
    line.setAttribute("x1", pts[i][0]);
    line.setAttribute("y1", pts[i][1]);
    line.setAttribute("x2", b[0]);
    line.setAttribute("y2", b[1]);
    line.classList.add("l");
    line.style.strokeOpacity = "0";
    gL.appendChild(line);
  }
  return { nodes: [...gN.children], links: [...gL.children] };
}

function initHero(el) {
  const title = el.querySelector("#title-01");
  const spans = [...title.querySelectorAll("span")];
  const eco = el.querySelector("#eco-01");
  const cap = el.querySelector("#cap-01");
  const { nodes, links } = seedEco(eco, 18);

  return (p) => {
    if (reduced) {
      const show = p > 0.4;
      title.style.opacity = show ? "0.15" : "1";
      eco.style.opacity = show ? "1" : "0";
      cap.style.opacity = show ? "1" : "0";
      return;
    }
    const zoom = lerp(1, 0.28, ease(clamp((p - 0.05) / 0.45, 0, 1)));
    const ecoIn = clamp((p - 0.3) / 0.4, 0, 1);
    title.style.transform = `scale(${zoom})`;
    title.style.opacity = String(lerp(1, 0.08, clamp((p - 0.35) / 0.45, 0, 1)));
    spans.forEach((s, i) => {
      s.style.transform = `translateY(${clamp((p - i * 0.03) / 0.25, 0, 1) * (i - 1) * 20}px)`;
    });
    eco.style.opacity = String(ecoIn);
    cap.style.opacity = String(ecoIn);
    nodes.forEach((n, i) => {
      n.style.opacity = String(clamp((ecoIn - i * 0.02) / 0.2, 0, 1) * 0.9);
    });
    links.forEach((l, i) => {
      l.style.strokeOpacity = String(clamp((ecoIn - 0.2 - i * 0.015) / 0.25, 0, 1) * 0.2);
    });
  };
}

function initDiversity(el, cats) {
  const grid = el.querySelector("#chips-02");
  const word = el.querySelector("#word-02");
  const line = el.querySelector("#line-02");
  const labels = ["Local", "Regional", "Independent", "Community", "First Nations", "Cultural", "Disability", "Migrant"];
  labels.forEach((t) => {
    const s = document.createElement("span");
    s.className = "voice-chip";
    s.textContent = t;
    grid.appendChild(s);
  });
  const chips = [...grid.children];
  // ignore unused cats param length mismatch
  void cats;

  return (p) => {
    word.style.opacity = p < 0.25 ? "1" : String(lerp(1, 0.35, clamp((p - 0.25) / 0.2, 0, 1)));
    const n = Math.floor(clamp((p - 0.15) / 0.55, 0, 1) * chips.length);
    chips.forEach((c, i) => {
      c.classList.toggle("is-on", i < n);
      c.classList.toggle("is-hi", i === Math.max(0, n - 1) && n > 0);
    });
    line.textContent = p > 0.75 ? "More perspectives" : "One voice → many voices";
  };
}

function initHeard(el) {
  const meters = [...el.querySelectorAll(".meter")];
  return (p) => {
    meters.forEach((m) => m.classList.toggle("is-on", p > 0.2));
  };
}

function initTimeline(el) {
  const nodes = [...el.querySelectorAll(".tnode")];
  return (p) => {
    const idx = Math.min(4, Math.floor(clamp(p, 0, 0.999) * 5));
    nodes.forEach((n, i) => n.classList.toggle("is-on", i <= idx));
  };
}

function initRate(el) {
  const gauge = el.querySelector("#gauge-06");
  return (p) => {
    // Visual fill toward a readable slice (display exaggeration for 2.75% readability)
    const fill = lerp(0, 18, clamp(p / 0.55, 0, 1));
    gauge.style.setProperty("--p", String(fill));
  };
}

function initThreshold(el) {
  const bar = el.querySelector("#thr-bar");
  const line = el.querySelector("#thr-line");
  return (p) => {
    bar.style.setProperty("--w", `${Math.min(100, p * 115)}%`);
    bar.classList.toggle("is-on", p > 0.15);
    line.style.opacity = p > 0.7 ? "1" : "0";
  };
}

function initEight(el) {
  const core = el.querySelector("#ring-core");
  const dots = [...el.querySelectorAll(".ring__dot")];
  const num = el.querySelector("#eight-num");
  dots.forEach((d, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    d.style.left = `calc(${50 + 42 * Math.cos(a)}% - 1.05rem)`;
    d.style.top = `calc(${50 + 42 * Math.sin(a)}% - 1.05rem)`;
  });
  return (p) => {
    const n = Math.min(8, Math.max(1, Math.ceil(clamp(p, 0, 1) * 8)));
    dots.forEach((d, i) => d.classList.toggle("is-on", i < n));
    core.textContent = String(n);
    num.textContent = n >= 8 ? "8+" : String(n);
    num.style.opacity = n >= 6 ? "1" : "0.35";
  };
}

function initMoney(el) {
  const steps = [...el.querySelectorAll(".ladder__step")];
  return (p) => {
    const n = Math.floor(clamp(p, 0, 0.999) * steps.length);
    steps.forEach((s, i) => s.classList.toggle("is-on", i <= n));
  };
}

function initGlass(el) {
  const layers = [...el.querySelectorAll(".glass__l")];
  const cap = el.querySelector("#see-cap");
  const disc = el.querySelector("#disc-13");
  const asks = ["Can we see it?", "Can we check it?", "Can we verify it?"];
  return (p) => {
    const step = Math.min(3, Math.floor(clamp((p - 0.1) / 0.18, 0, 4)));
    layers.forEach((l, i) => l.classList.toggle("is-off", step > i));
    if (p < 0.75) {
      disc.style.opacity = "0";
      cap.style.opacity = "1";
      cap.textContent = asks[Math.min(2, Math.floor(p * 3))] || asks[0];
    } else {
      cap.style.opacity = "0";
      disc.style.opacity = "1";
    }
  };
}

function initChain(el) {
  const steps = [...el.querySelectorAll("#chain-14 span")];
  return (p) => {
    const n = Math.floor(clamp(p, 0, 0.999) * steps.length);
    steps.forEach((s, i) => s.classList.toggle("is-on", i <= n));
  };
}

function initFinale(el) {
  const q = el.querySelector("#q-15");
  const q2 = el.querySelector("#q2-15");
  return (p) => {
    if (p < 0.45) {
      q.textContent = "Who gets to tell Australia’s story?";
      q2.style.opacity = "0.35";
    } else {
      q.textContent = "Who gets to tell Australia’s story?";
      q2.style.opacity = "1";
    }
  };
}

async function main() {
  const [sources, nbi, ecosystem] = await Promise.all([
    load("data/sources.json"),
    load("data/nbi.json"),
    load("data/ecosystem.json"),
  ]);

  // Bind enacted rate into DOM
  const rateEl = document.getElementById("rate-06");
  if (rateEl) rateEl.textContent = nbi.enactedChargeRate.value;

  const sys = new SourceSystem({
    sources,
    drawer: document.getElementById("drawer"),
    backdrop: document.getElementById("backdrop"),
  });
  sys.setDetails(DETAILS);
  sys.renderMarkers(document);
  sys.bind();
  const _open = sys.openDetail.bind(sys);
  sys.openDetail = (key, trigger) => {
    _open(key, trigger);
    sys.renderMarkers(sys.drawer);
  };

  const list = document.getElementById("evidence-list");
  sources.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="org">${i + 1}. ${s.organisation}</span><br><strong>${s.title}</strong></a>`;
    list.appendChild(li);
  });

  const engine = new ScrollEngine({ reducedMotion: reduced });
  const rail = document.getElementById("rail");
  engine.onAct((id) => {
    rail.querySelectorAll("a").forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === `#${id}`));
  });

  const map = [
    ["act-01", initHero],
    ["act-02", (el) => initDiversity(el, ecosystem.categories)],
    ["act-03", initHeard],
    ["act-04", initTimeline],
    ["act-06", initRate],
    ["act-07", initThreshold],
    ["act-09", initEight],
    ["act-11", initMoney],
    ["act-13", initGlass],
    ["act-14", initChain],
    ["act-15", initFinale],
  ];

  map.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) engine.register(id, el, fn(el));
  });

  // Static acts still track for nav
  ["act-05", "act-08", "act-10", "act-12"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) engine.register(id, el, () => {});
  });

  engine.start();
}

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div role="alert" style="padding:1rem;background:#8a3530;color:#fff;">Failed to load. Serve over HTTP and refresh.</div>`
  );
});

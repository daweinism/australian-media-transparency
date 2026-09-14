import { SourceSystem } from "./sources.js";
import { ScrollEngine, clamp } from "./scroll-engine.js";

const BASE = new URL("../../", import.meta.url);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function load(p) {
  const r = await fetch(new URL(p, BASE));
  if (!r.ok) throw new Error(`Failed to load ${p}`);
  return r.json();
}

/* Optional depth only — never required to follow the story. */
const DETAILS = {
  diversity: {
    badge: "Context",
    title: "Why a range of voices matters",
    body: "Media diversity means different owners, different places and different communities producing news. When one organisation produces most of the reporting in a region, fewer stories get told and fewer decisions get scrutinised. Diversity is about who is able to report, not only how much reporting exists.",
  },
  resources: {
    badge: "Context",
    title: "Resources decide who keeps reporting",
    body: "Journalism costs money: salaries, courts, councils, legal risk. Larger organisations can absorb those costs across many mastheads. Small, regional, community and independent newsrooms often cannot. The visual is illustrative — it shows a relationship, not measured market share.",
  },
  code2021: {
    badge: "Policy · 2021",
    title: "The News Media and Digital Platforms Mandatory Bargaining Code",
    body: "The 2021 Code let the Treasurer designate a digital platform, which would then have to bargain with registered Australian news businesses, with arbitration if talks failed. In practice the threat of designation prompted commercial deals, and no platform has ever been designated. When a platform later chose not to renew deals, the framework had limited practical leverage.",
  },
  nbi: {
    badge: "Policy · 2026",
    title: "The News Bargaining Incentive",
    body: "The 2026 framework works through the tax system rather than designation. A charge is imposed on very large digital platforms with Australian digital advertising revenue above the threshold, and qualifying spending on Australian news reduces what a platform actually pays. The intent is to make paying for news the cheaper option.",
  },
  mechanism: {
    badge: "Policy · 2026",
    title: "The steps in order",
    body: "1. A platform earns Australian digital advertising revenue. 2. If that revenue is above $250 million, the charge applies. 3. The charge rate is 2.75%. 4. Qualifying spending on Australian news businesses can offset the charge, but only if it is spread across at least eight different news business corporate groups, with no single group counted for more than 25%.",
  },
  rate: {
    badge: "Legislation",
    title: "The 2.75% rate",
    body: "Section 3 of the News Media Bargaining Charge Act 2026 states: “The rate of charge is 2.75%.” Earlier public materials and the original design described 2.5%; the rate was increased to 2.75% before the Bill passed. This site follows the enacted text on the Federal Register of Legislation.",
  },
  threshold: {
    badge: "Legislation",
    title: "The $250 million threshold",
    body: "The charge is aimed at platforms with more than $250 million in relevant Australian digital advertising revenue in a year. Smaller platforms and ordinary websites are not captured. The threshold is what makes this a rule about a handful of very large companies.",
  },
  paths: {
    badge: "Policy · 2026",
    title: "Spend on news, or pay the charge",
    body: "A platform can reduce its liability through qualifying spending on Australian news, or it can simply pay. Charge receipts are directed to a government news journalism payment scheme rather than to any particular publisher. Government estimates quoted in the Bills Digest put commercial dealings at roughly $200–250 million, and the charge pathway at roughly $350–400 million a year.",
  },
  eight: {
    badge: "Legislation",
    title: "At least eight news business groups",
    body: "To claim the offset, a platform's qualifying spending must involve at least eight different news business corporate groups. The Parliamentary Library's Bills Digest describes this as designed to stop a platform satisfying the framework through deals with only one or two large publishers.",
  },
  cap: {
    badge: "Legislation",
    title: "The 25% single-group cap",
    body: "In calculating the offset, the amount attributable to any one corporate group is capped at one quarter of the total. One publisher cannot absorb the whole allocation, so a platform has to reach beyond its largest existing partners.",
  },
  money: {
    badge: "How to read this",
    title: "Where the money can go",
    body: "Two routes exist. Money spent directly on Australian news goes to news businesses under commercial arrangements. Charge money goes to the Commonwealth and is directed to the news journalism payment scheme. What is not routinely published is the detail: which publishers received what, and how those amounts were decided.",
  },
  outcome: {
    badge: "Analysis",
    title: "Scale is not the same as diversity",
    body: "The eight-group minimum and 25% cap widen participation compared with a small set of private deals. They do not guarantee that support reaches regional, community, First Nations or independent newsrooms. A platform could satisfy both rules using eight comparatively large groups. Whether the design produces diversity is an empirical question — and answering it requires data that is not currently published.",
  },
  transparency: {
    badge: "Analysis",
    title: "What the public cannot currently see",
    body: "Commercial arrangements between platforms and publishers are typically confidential, and offset calculations are tax information. So the public cannot verify how much was spent, which publishers benefited, how amounts were divided, what method was used, or who checked it. Without that, no one can test whether a diversity objective is being met.",
  },
  proposal: {
    badge: "Proposal",
    title: "Disclose, verify, report, widen",
    body: "Our proposal: voluntary public disclosure of aggregate amounts and recipient categories; independent verification by a body at arm's length from both platforms and publishers; a plain-English annual public report; and deliberate inclusion of smaller, regional, community and First Nations newsrooms. None of this requires reopening the legislation.",
  },
};

/* ——— small builders ——— */
const paper = (mod = "") =>
  `<div class="paper ${mod}"><b></b><i></i><i></i><i></i></div>`;

function voiceEl(labelText, mod) {
  const d = document.createElement("div");
  d.className = "voice";
  d.innerHTML = `${paper(mod)}<span>${labelText}</span>`;
  return d;
}

function fillPeople(el, n, cls = "") {
  el.innerHTML = Array.from({ length: n }, () => "<i></i>").join("");
  if (cls) el.classList.add(cls);
}

const step = (p, n) => clamp(Math.floor(p * n), 0, n - 1);

/* ——— 01 orientation → ecosystem ——— */
function initHero(el) {
  const svg = el.querySelector("#eco-01");
  const ng = svg.querySelector(".n-g");
  const lg = svg.querySelector(".l-g");
  const pts = [];
  for (let i = 0; i < 22; i++) {
    const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.22;
    const r = 16 + (i % 4) * 9;
    pts.push({ x: 50 + Math.cos(a) * r, y: 50 + Math.sin(a) * r * 0.72 });
  }
  ng.innerHTML = pts
    .map((p, i) => `<circle class="n ${i % 5 === 0 ? "n-e" : i % 7 === 0 ? "n-o" : ""}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(1 + (i % 3) * 0.5).toFixed(2)}" />`)
    .join("");
  lg.innerHTML = pts
    .map((p, i) => {
      const q = pts[(i + 5) % pts.length];
      return `<line class="l" x1="${p.x.toFixed(1)}" y1="${p.y.toFixed(1)}" x2="${q.x.toFixed(1)}" y2="${q.y.toFixed(1)}" />`;
    })
    .join("");

  const frame = el.querySelector("#f-01");
  const cue = el.querySelector("#cue-01");
  return (p) => {
    const t = clamp((p - 0.45) / 0.5, 0, 1);
    svg.style.opacity = String(t * 0.85);
    svg.style.transform = `scale(${0.7 + t * 0.4})`;
    frame.style.opacity = String(1 - t * 0.75);
    cue.style.opacity = String(1 - clamp(p * 3, 0, 1));
  };
}

/* ——— 02 one voice → many voices ——— */
function initVoices(el) {
  const wrap = el.querySelector("#voices-02");
  const head = el.querySelector("#head-02");
  const cats = [
    ["Metro daily", ""],
    ["Regional", "paper--euc"],
    ["Local", ""],
    ["Independent", "paper--och"],
    ["Community", "paper--euc"],
    ["First Nations", "paper--och"],
    ["Multicultural", ""],
  ];
  const nodes = cats.map(([t, m]) => {
    const v = voiceEl(t, m);
    wrap.appendChild(v);
    return v;
  });
  return (p) => {
    const shown = clamp(Math.round(p * 8), 1, nodes.length);
    nodes.forEach((n, i) => n.classList.toggle("is-on", i < shown));
    head.textContent = shown <= 1 ? "One voice" : shown < nodes.length ? "More voices" : "Many voices";
  };
}

/* ——— 03 resources ——— */
function initResources(el) {
  fillPeople(el.querySelector("#ppl-big"), 24);
  fillPeople(el.querySelector("#ppl-small"), 3);
  return null;
}

/* ——— 04 2021 → platform walks away ——— */
function initCode(el) {
  const deal = el.querySelector("#deal-04");
  const word = el.querySelector("#dealword-04");
  const note = el.querySelector("#note-04");
  const sub = el.querySelector("#sub-04");
  return (p) => {
    const s = step(p, 3);
    deal.classList.toggle("is-broken", s === 2);
    if (s === 0) {
      word.textContent = "Bargaining";
      sub.textContent = "The news media bargaining code";
      note.textContent = "Platforms and news businesses were pushed to negotiate deals.";
    } else if (s === 1) {
      word.textContent = "Deals";
      sub.textContent = "Money started moving";
      note.textContent = "Commercial deals were signed. The terms stayed private.";
    } else {
      word.textContent = "Deal ends";
      sub.textContent = "Then one platform stepped back";
      note.textContent = "What if a platform simply walks away?";
    }
  };
}

/* ——— generic sequential reveal (flow / pipe / chain) ——— */
function sequence(el, selector, { cumulative = false } = {}) {
  const items = [...el.querySelectorAll(selector)];
  return (p) => {
    const active = clamp(Math.round(p * (items.length + 0.4)), 0, items.length - 1);
    items.forEach((n, i) => {
      n.classList.toggle("is-on", cumulative ? i <= active : i === active);
      n.classList.toggle("is-past", !cumulative && i < active);
    });
  };
}

/* ——— 08 threshold meter ——— */
function initThreshold(el) {
  const fill = el.querySelector(".thresh__fill");
  const verdict = el.querySelector("#verdict-08");
  return (p) => {
    const w = clamp(p * 1.25, 0.04, 1) * 92;
    fill.style.width = `${w}%`;
    const over = w > 62;
    verdict.classList.toggle("is-on", over);
    verdict.textContent = over
      ? "Above the line — the charge applies"
      : "Below the line — the charge does not apply";
  };
}

/* ——— 10 eight news businesses ——— */
function initEight(el) {
  const grid = el.querySelector("#grid-10");
  const count = el.querySelector("#count-10");
  const lab = el.querySelector("#countlab-10");
  const note = el.querySelector("#note-10");
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const v = voiceEl(`News business ${i + 1}`, i % 3 === 1 ? "paper--euc" : i % 3 === 2 ? "paper--och" : "");
    grid.appendChild(v);
    return v;
  });
  return (p) => {
    const n = clamp(Math.round(p * 9), 1, 8);
    nodes.forEach((v, i) => v.classList.toggle("is-on", i < n));
    count.textContent = n === 8 ? "8+" : String(n);
    lab.textContent = n === 1 ? "News business group" : "News business groups";
    note.textContent =
      n < 8
        ? "One or two deals is not enough."
        : "Support must span at least eight separate news business groups.";
  };
}

/* ——— 11 the 25% cap ——— */
function initCap(el) {
  const one = el.querySelector("#one-11");
  const rest = el.querySelector("#rest-11");
  const pct = el.querySelector("#pct-11");
  const lab = el.querySelector("#caplab-11");
  const note = el.querySelector("#note-11");
  rest.innerHTML = Array.from({ length: 6 }, () => "<i></i>").join("");
  const bars = [...rest.querySelectorAll("i")];
  return (p) => {
    const grow = clamp(p / 0.5, 0, 1);
    const shown = Math.round(grow * 25);
    one.style.width = `${shown}%`;
    pct.textContent = `${shown}%`;
    const capped = grow >= 1;
    lab.textContent = capped ? "One group — maximum" : "One group takes…";
    const others = capped ? clamp(Math.round((p - 0.5) / 0.5 * bars.length), 0, bars.length) : 0;
    bars.forEach((b, i) => b.classList.toggle("is-on", i < others));
    note.textContent = !capped
      ? "One group tries to take the whole allocation."
      : others < bars.length
      ? "It stops at 25%. Other news businesses have to fill the rest."
      : "No single group can absorb the whole allocation.";
  };
}

/* ——— 13 scale vs diversity ——— */
function initSplit(el) {
  const many = el.querySelector("#many-13");
  many.innerHTML = Array.from({ length: 9 }, (_, i) =>
    paper(i % 3 === 0 ? "paper--small paper--euc" : i % 3 === 1 ? "paper--small paper--och" : "paper--small")
  ).join("");
  return null;
}

/* ——— 14 black box opens ——— */
function initBox(el) {
  const lid = el.querySelector("#lid-14");
  const rows = [...el.querySelectorAll(".box__row")];
  const lab = el.querySelector("#translab-14");
  const answers = [
    ["How much money", "Published"],
    ["Which publishers", "Named"],
    ["How it was split", "Itemised"],
    ["How it was decided", "Explained"],
    ["Checked by whom", "Independently verified"],
  ];
  return (p) => {
    const open = clamp((p - 0.12) / 0.15, 0, 1);
    lid.style.opacity = String(1 - open);
    lid.style.pointerEvents = open > 0.5 ? "none" : "auto";
    const n = clamp(Math.round((p - 0.25) / 0.6 * rows.length), 0, rows.length);
    rows.forEach((r, i) => {
      const on = i < n;
      r.classList.toggle("is-on", on);
      r.querySelector("b").textContent = on ? answers[i][1] : "?";
    });
    lab.textContent =
      p < 0.25
        ? "Right now, much of this is not public"
        : n < rows.length
        ? "What transparency would show"
        : "Disclosure → verification → accountability";
  };
}

/* ——— 16 finale zoom ——— */
function initFinale(el) {
  const zoom = el.querySelector("#zoom-16");
  const levels = ["Journalist", "Newsroom", "Publisher", "Media ecosystem", "Australia"];
  const frame = el.querySelector(".frame");
  return (p) => {
    zoom.textContent = levels[step(p, levels.length)];
    frame.style.transform = `scale(${1 + clamp(p, 0, 1) * 0.06})`;
  };
}

async function main() {
  const [sources] = await Promise.all([load("data/sources.json")]);

  const sys = new SourceSystem({
    sources,
    drawer: document.getElementById("drawer"),
    backdrop: document.getElementById("backdrop"),
  });
  sys.setDetails(DETAILS);
  sys.renderMarkers(document);
  sys.bind();

  const list = document.getElementById("evidence-list");
  list.innerHTML = sources
    .map(
      (s, i) => `<li>
        <p class="org">${i + 1} · ${s.organisation} · ${s.date}</p>
        <a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a>
      </li>`
    )
    .join("");

  const rail = document.getElementById("rail");
  const acts = [...document.querySelectorAll("[data-act]")];
  rail.innerHTML = acts
    .map((a) => `<a href="#${a.id}" data-id="${a.id}" data-l="${a.dataset.label || ""}"><span class="sr-only">${a.dataset.label || a.id}</span></a>`)
    .join("");

  const engine = new ScrollEngine({ reducedMotion: reduced });
  engine.onAct((id) => {
    rail.querySelectorAll("a").forEach((a) => a.classList.toggle("is-on", a.dataset.id === id));
  });

  const map = [
    ["act-01", initHero],
    ["act-02", initVoices],
    ["act-03", initResources],
    ["act-04", initCode],
    ["act-05", (el) => sequence(el, "#flow-05 .flow__box")],
    ["act-06", (el) => sequence(el, "#flow-06 .flow__box")],
    ["act-08", initThreshold],
    ["act-10", initEight],
    ["act-11", initCap],
    ["act-12", (el) => sequence(el, "#pipe-12 .pipe__node")],
    ["act-13", initSplit],
    ["act-14", initBox],
    ["act-15", (el) => sequence(el, "#chain-15 span", { cumulative: true })],
    ["act-16", initFinale],
  ];

  map.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) engine.register(id, el, fn(el));
  });

  engine.start();
}

main().catch((err) => {
  console.error(err);
});

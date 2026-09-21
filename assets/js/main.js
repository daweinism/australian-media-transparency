import { SourceSystem } from "./sources.js";
import { ScrollEngine, clamp } from "./scroll-engine.js";

const BASE = new URL("../../", import.meta.url);
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

async function load(p) {
  const r = await fetch(new URL(p, BASE));
  if (!r.ok) throw new Error(`Failed to load ${p}`);
  return r.json();
}

const DETAILS = {
  diversity: {
    badge: "Why this matters",
    title: "Why more than one kind of newsroom matters",
    lead: "Media diversity means different owners, places and communities producing news, including local, regional, independent, community and First Nations newsrooms.",
    paras: [
      "When one organisation produces most of the reporting in a region, fewer stories get told and fewer decisions get scrutinised.",
      "Different newsrooms bring different priorities and audiences to the same country.",
    ],
    takeaway: "Diversity is about who is able to report, alongside how much reporting exists.",
  },
  resources: {
    badge: "Why this matters",
    title: "Resources decide who keeps reporting",
    lead: "Journalism costs money: salaries, courts, councils, legal risk and time.",
    paras: [
      "Larger organisations can absorb those costs across many mastheads. Small and regional newsrooms often cannot.",
      "The comparison on screen is a conceptual picture of capacity. It is not a measured market-share chart.",
    ],
    takeaway: "Without resources, it is harder to keep covering communities.",
  },
  code2021: {
    badge: "How it worked",
    title: "The 2021 News Media Bargaining Code",
    lead: "The Code was designed to address bargaining power between Australian news businesses and digital platforms.",
    paras: [
      "It allowed the Treasurer to designate a platform, which would then have to bargain with registered news businesses, with arbitration if talks failed.",
      "In practice, the threat of designation prompted commercial deals. No platform has ever been designated. When a platform later stepped back from deals, the framework had limited practical leverage.",
    ],
    takeaway: "The 2021 system depended on designation and commercial deals, and could stall if a platform walked away.",
  },
  mechanism: {
    badge: "Legal detail",
    title: "How the News Bargaining Incentive works",
    lead: "The 2026 framework works through a charge on very large digital platforms' Australian digital advertising revenue.",
    paras: [
      "If relevant Australian digital ad revenue is above $250 million, a charge applies at 2.75%.",
      "Spending on Australian news that meets the rules can reduce what the platform pays. That spending must involve at least eight different news business corporate groups, and no single group can count for more than 25% of the offset.",
      "Earlier public materials used 2.5%. Section 3 of the News Media Bargaining Charge Act 2026 sets the enacted rate at 2.75%.",
    ],
    takeaway: "The design makes paying for Australian news the cheaper option for platforms above the threshold.",
  },
  eight: {
    badge: "Legal detail",
    title: "At least eight news business groups",
    lead: "To claim the offset, qualifying spending must involve at least eight different news business corporate groups.",
    paras: [
      "The Parliamentary Library's Bills Digest describes this as designed to encourage sustainability and diversity by spreading support beyond a small number of groups.",
    ],
    takeaway: "Support must span multiple groups, including beyond the largest existing partners.",
  },
  cap: {
    badge: "Legal detail",
    title: "The 25% single-group cap",
    lead: "In calculating the offset, the amount attributable to any one corporate group is capped at one quarter.",
    paras: [
      "One publisher cannot absorb the whole allocation, so a platform has to reach beyond its largest partners.",
    ],
    takeaway: "No single group can account for more than 25% of the offset.",
  },
  money: {
    badge: "How it works",
    title: "Two different pathways",
    lead: "The system creates a charge. Qualifying news support can offset it. Revenue collected through the charge can also fund news journalism payments.",
    paras: [
      "Path A: qualifying spending on Australian news businesses can reduce what a platform pays.",
      "Path B: charge that is actually collected goes to the Commonwealth and can be distributed through the News Journalism Payments Scheme to eligible participants.",
      "These are different parts of the framework. Qualifying news support is a separate route from payments under the scheme.",
    ],
    takeaway: "Offset spending and charge revenue travel through different pathways.",
  },
  outcome: {
    badge: "Our analysis",
    title: "Scale and diversity describe different things",
    lead: "The eight-group minimum and 25% cap widen participation compared with a small set of private deals.",
    paras: [
      "They still leave open whether support reaches regional, community, First Nations or independent newsrooms.",
      "A platform could satisfy both rules using eight comparatively large groups. Whether the design produces diversity is an empirical question, and answering it requires data that is not currently published.",
    ],
    takeaway: "More money can support journalism. More participants can broaden perspectives.",
  },
  transparency: {
    badge: "Why this matters",
    title: "What the public cannot currently see",
    lead: "Commercial arrangements and offset calculations are typically not public.",
    paras: [
      "Without published amounts, recipients, allocation methods and independent checking, no one can test whether a diversity objective is being met.",
      "Publishing the amount helps. Showing how it was calculated makes it easier to check.",
    ],
    takeaway: "Accountability depends on information that can be checked.",
  },
  proposal: {
    badge: "Our proposal",
    title: "Disclose, verify, report, widen",
    lead: "Our group's intervention: make the flow of support easier to see and independently check.",
    paras: [
      "Voluntary public disclosure of aggregate amounts and recipient categories.",
      "Independent verification at arm's length from platforms and publishers.",
      "A plain-English annual public report, and deliberate inclusion of smaller, regional, community and First Nations newsrooms.",
    ],
    takeaway: "This is a proposal for voluntary disclosure and review. It does not reopen the legislation.",
  },
};

const paper = (mod = "") =>
  `<div class="paper ${mod}"><b></b><i></i><i></i><i></i></div>`;

function voiceEl(labelText, mod) {
  const d = document.createElement("div");
  d.className = "voice";
  d.innerHTML = `${paper(mod)}<span>${labelText}</span>`;
  return d;
}

function catPillEl(labelText, mod) {
  const d = document.createElement("div");
  d.className = "cat-pill";
  if (labelText === "First Nations") d.classList.add("cat-pill--wide");
  if (labelText === "Independent") d.classList.add("cat-pill--indy");
  d.innerHTML = `${paper(mod)}<span>${labelText}</span>`;
  return d;
}

function fillPeople(el, n) {
  el.innerHTML = Array.from({ length: n }, () => "<i></i>").join("");
}

function showPane(root, index) {
  root.querySelectorAll(".story__pane").forEach((p) => {
    const on = Number(p.dataset.pane) === index;
    const wasOn = p.classList.contains("is-on");
    if (wasOn && !on) {
      p.classList.add("is-leaving");
      window.setTimeout(() => p.classList.remove("is-leaving"), 500);
    }
    p.classList.toggle("is-on", on);
  });
}

const step = (p, n) => clamp(Math.floor(p * n), 0, n - 1);

/** Sticky stepper: resists fast flicks so one swipe rarely skips a part. */
function makeStepper(n) {
  let cur = 0;
  return (p) => {
    const raw = clamp(p, 0, 0.999999) * n;
    const ideal = clamp(Math.floor(raw), 0, n - 1);
    if (ideal > cur) {
      while (cur < ideal && raw >= cur + 0.78) cur += 1;
    } else if (ideal < cur) {
      while (cur > ideal && raw <= cur + 0.22) cur -= 1;
    }
    return clamp(cur, 0, n - 1);
  };
}

const softTimers = new WeakMap();

function softText(el, text) {
  if (!el || el.textContent === text) return;
  if (reduced) {
    el.textContent = text;
    return;
  }
  const prev = softTimers.get(el);
  if (prev) window.clearTimeout(prev);
  el.classList.add("is-swapping");
  const id = window.setTimeout(() => {
    el.textContent = text;
    requestAnimationFrame(() => el.classList.remove("is-swapping"));
    softTimers.delete(el);
  }, 140);
  softTimers.set(el, id);
}

function setStepCue(el, part, total, label) {
  if (!el) return;
  softText(el, label || `Part ${part} of ${total}`);
}

function initHero(el) {
  const cue = el.querySelector("#cue-01");
  const orient = el.querySelector("#orient-01");
  const frame = el.querySelector("#f-01");
  const pin = el.querySelector(".act__pin");
  return (p) => {
    if (cue) cue.style.opacity = String(1 - clamp(p * 2.8, 0, 1));
    if (reduced) return;
    if (frame) frame.style.transform = `scale(${1 - clamp(p, 0, 1) * 0.06})`;
    if (orient) orient.style.transform = `scale(${1 + clamp(p, 0, 1) * 0.05})`;
    if (pin) pin.style.setProperty("--hero-dim", String(0.8 + clamp(p, 0, 1) * 0.12));
  };
}

function initVoices(el) {
  const wrap = el.querySelector("#voices-02");
  const strip = el.querySelector("#cats-02");
  const head = el.querySelector("#head-02");
  const ex = el.querySelector("#ex-02");
  const path = [...el.querySelectorAll("#path-02 span")];
  const cats = [
    ["Local", ""],
    ["Regional", "paper--euc"],
    ["Independent", "paper--och"],
    ["Community", "paper--euc"],
    ["First Nations", "paper--och"],
    ["Metro", ""],
    ["Multicultural", ""],
  ];
  const nodes = cats.map(([t, m]) => {
    const v = voiceEl(t, m);
    wrap.appendChild(v);
    const pill = catPillEl(t, m);
    strip.appendChild(pill);
    return { voice: v, pill };
  });
  return (p) => {
    const pathN = clamp(Math.round(clamp(p / 0.25, 0, 1) * path.length), 1, path.length);
    path.forEach((s, i) => s.classList.toggle("is-on", i < pathN));

    const shown = clamp(Math.round(clamp((p - 0.15) / 0.85, 0, 1) * 8), 1, nodes.length);
    nodes.forEach((n, i) => {
      n.voice.classList.toggle("is-on", i < shown);
      n.pill.classList.toggle("is-on", i < shown);
    });
    if (shown <= 1) {
      head.textContent = "One voice";
      ex.textContent = "Start with a single newsroom.";
    } else if (shown < nodes.length) {
      head.textContent = "More voices";
      ex.textContent = "Different communities bring different stories and priorities.";
    } else {
      head.textContent = "Many voices";
      ex.textContent = "A stronger media ecosystem includes more than one kind of newsroom.";
    }
  };
}

function initResources(el) {
  fillPeople(el.querySelector("#ppl-big"), 20);
  fillPeople(el.querySelector("#ppl-small"), 3);
  return null;
}

function initTimeline(el) {
  const deal = el.querySelector("#deal-04");
  const word = el.querySelector("#dealword-04");
  const ex = el.querySelector("#ex-04");
  const sub = el.querySelector("#sub-04");
  const year = el.querySelector("#year-04");
  const plat = el.querySelector("#plat-04");
  const morph = el.querySelector("#morph-04");
  const cue = el.querySelector("#step-04");
  const next = makeStepper(5);
  return (p) => {
    const s = next(p);
    setStepCue(cue, s + 1, 5);
    const showMorph = s >= 4;
    deal.hidden = showMorph;
    if (morph) {
      morph.hidden = !showMorph;
      morph.classList.toggle("is-on", showMorph);
    }
    deal.classList.toggle("is-broken", s >= 2 && s < 4);
    plat.classList.toggle("platform--alert", s === 2 || s === 3);
    if (s === 0) {
      softText(year, "2021");
      softText(word, "Bargaining");
      softText(sub, "News Media Bargaining Code");
      softText(ex, "Platforms and news businesses were pushed to negotiate commercial deals.");
    } else if (s === 1) {
      softText(year, "2021");
      softText(word, "Deals");
      softText(sub, "Money started moving");
      softText(ex, "Commercial deals were signed. The terms stayed private.");
    } else if (s === 2) {
      softText(year, "2021");
      softText(word, "Exit risk");
      softText(sub, "What if a platform walks away?");
      softText(
        ex,
        "If a platform steps back, people can lose a distribution channel, and news organisations can lose reach."
      );
    } else if (s === 3) {
      softText(year, "Why change?");
      softText(word, "Broken link");
      softText(sub, "Why create an incentive?");
      softText(ex, "Australia needed a stronger incentive for platforms to keep paying for news.");
    } else {
      softText(year, "2026");
      softText(sub, "News Bargaining Incentive");
      softText(ex, "A new incentive for commercial deals, through a charge on very large platforms.");
    }
  };
}

function initMechanism(el) {
  const story = el.querySelector("#story-05");
  const fill = el.querySelector("#fill-05");
  const fillM = el.querySelector("#fill-05m");
  const head = el.querySelector("#head-05");
  const ex = el.querySelector("#ex-05");
  const v = el.querySelector("#v-05a");
  const cue = el.querySelector("#step-05");
  const next = makeStepper(3);
  let lastPane = -1;
  return (p) => {
    const pane = next(p);
    setStepCue(cue, pane + 1, 3);
    if (pane !== lastPane) {
      showPane(story, pane);
      lastPane = pane;
    }
    if (pane === 0) {
      softText(head, "Who does it apply to?");
      softText(ex, "Only platforms with more than $250 million in Australian digital ad revenue.");
      const local = clamp(p / 0.3, 0, 1);
      const w = 8 + local * 78;
      fill.style.width = `${w}%`;
      if (fillM) fillM.style.height = `${w}%`;
      if (v) {
        v.textContent =
          w > 62
            ? "NBI applies above this level."
            : "Below this level, the charge does not apply.";
      }
    } else if (pane === 1) {
      softText(head, "What is the charge?");
      softText(ex, "A percentage of that Australian digital ad revenue.");
    } else {
      softText(head, "How can a platform respond?");
      softText(ex, "Spend on Australian news, or pay the charge.");
    }
  };
}

function initEight(el) {
  const grid = el.querySelector("#grid-06");
  const count = el.querySelector("#count-06");
  const lab = el.querySelector("#lab-06");
  const ex = el.querySelector("#ex-06");
  const nodes = Array.from({ length: 8 }, (_, i) => {
    const v = voiceEl(
      `Group ${i + 1}`,
      i % 3 === 1 ? "paper--euc" : i % 3 === 2 ? "paper--och" : ""
    );
    v.classList.add("is-ghost");
    grid.appendChild(v);
    return v;
  });
  const cue = el.querySelector("#step-06");
  return (p) => {
    const n = clamp(Math.round(p * 9), 1, 8);
    setStepCue(cue, n, 8, n < 8 ? `Group ${n} of 8` : `Part complete · 8+ groups`);
    nodes.forEach((v, i) => {
      v.classList.toggle("is-on", i < n);
      v.classList.toggle("is-ghost", i >= n);
    });
    count.textContent = n === 8 ? "8+" : String(n);
    lab.textContent = n === 1 ? "News business group" : "News business groups";
    ex.textContent =
      n < 8
        ? "Support spreads across more news business groups. Each box is a group that can be reached."
        : "Eligible spending must involve at least eight Australian news business groups. The boxes show breadth of participation.";
  };
}

function initCap(el) {
  const one = el.querySelector("#one-07");
  const rest = el.querySelector("#rest-07");
  const pct = el.querySelector("#pct-07");
  const lab = el.querySelector("#caplab-07");
  const ex = el.querySelector("#ex-07");
  const restlab = el.querySelector("#restlab-07");
  const cap8 = el.querySelector("#cap8-07");
  const tiles = Array.from({ length: 8 }, (_, i) => {
    const d = document.createElement("div");
    d.className = "cap8__tile";
    d.innerHTML = `${paper(i === 0 ? "paper--och" : i % 2 ? "paper--euc" : "")}<span>Group ${i + 1}</span>`;
    cap8.appendChild(d);
    return d;
  });
  rest.innerHTML = Array.from({ length: 7 }, (_, i) => `<i title="Group ${i + 2}"></i>`).join("");
  const bars = [...rest.querySelectorAll("i")];
  const cue = el.querySelector("#step-07");
  return (p) => {
    const grow = clamp(p / 0.4, 0, 1);
    const shown = Math.round(grow * 25);
    one.style.width = `${shown}%`;
    one.textContent = shown >= 10 ? "Group 1 · 25% max" : shown > 0 ? "Group 1" : "";
    pct.textContent = `${shown}%`;
    const capped = grow >= 1;
    setStepCue(
      cue,
      shown,
      25,
      capped ? "Cap reached · 25%" : `Filling toward 25% · ${shown}%`
    );
    lab.textContent = capped ? "One group max 25%" : "One group fills…";
    tiles[0].classList.toggle("is-focus", shown > 0);
    tiles[0].classList.toggle("is-capped", capped);
    const others = capped
      ? clamp(Math.round(((p - 0.4) / 0.6) * bars.length), 0, bars.length)
      : 0;
    bars.forEach((b, i) => b.classList.toggle("is-on", i < others));
    tiles.forEach((t, i) => {
      if (i === 0) return;
      t.classList.toggle("is-on", i <= others);
    });
    if (restlab) restlab.style.opacity = capped ? "1" : "0.35";
    if (!capped) {
      ex.textContent = "One group tries to absorb the whole allocation.";
    } else if (others < bars.length) {
      ex.textContent = "It stops at 25%. Other groups are needed for the remaining space.";
    } else {
      ex.textContent =
        "A single corporate group can account for no more than 25% of the NBI offset amount.";
    }
  };
}

function initFork(el) {
  const fork = el.querySelector("#fork-08");
  const top = fork.querySelector(".fork__top");
  const pathA = fork.querySelector(".fork__path--a");
  const pathB = fork.querySelector(".fork__path--b");
  const ex = el.querySelector("#money-ex");
  const cue = el.querySelector("#step-08");
  const next = makeStepper(3);
  return (p) => {
    const s = next(p);
    setStepCue(cue, s + 1, 3);
    top.classList.toggle("is-on", s >= 0);
    fork.classList.toggle("is-split", s >= 1);
    pathA.classList.toggle("is-on", s >= 1);
    pathB.classList.toggle("is-on", s >= 2);
    if (s === 0) {
      softText(
        ex,
        "The system creates a charge. Qualifying news support can offset it. Revenue collected through the charge can also fund news journalism payments."
      );
    } else if (s === 1) {
      softText(ex, "Path A: qualifying news support can reduce what the platform pays.");
    } else {
      softText(
        ex,
        "Path B: charge that is collected can fund the News Journalism Payments Scheme for eligible participants."
      );
    }
  };
}

function initSplit(el) {
  const many = el.querySelector("#many-09");
  many.innerHTML = Array.from({ length: 9 }, (_, i) =>
    paper(
      i % 3 === 0
        ? "paper--small paper--euc"
        : i % 3 === 1
        ? "paper--small paper--och"
        : "paper--small"
    )
  ).join("");
  return null;
}

function initTransparency(el) {
  const story = el.querySelector("#story-10");
  const lid = el.querySelector("#lid-10");
  const rows = [...el.querySelectorAll(".box__row")];
  const lab = el.querySelector("#translab-10");
  const eye = el.querySelector("#eye-10");
  const ex = el.querySelector("#ex-10");
  const answers = [
    ["Amount", "Published"],
    ["Recipient", "Named"],
    ["Allocation", "Itemised"],
    ["Method", "Explained"],
    ["Verification", "Independently checked"],
  ];
  const chain = [...el.querySelectorAll("#chain-10 span")];
  const cue = el.querySelector("#step-10");
  const next = makeStepper(2);
  let lastPane = -1;
  return (p) => {
    const pane = next(p);
    setStepCue(cue, pane + 1, 2);
    if (pane !== lastPane) {
      showPane(story, pane);
      lastPane = pane;
    }
    if (pane === 0) {
      eye.textContent = "Where did the money go?";
      const local = clamp(p / 0.48, 0, 1);
      const open = clamp((local - 0.08) / 0.18, 0, 1);
      lid.style.opacity = String(1 - open);
      const n = clamp(Math.round(((local - 0.22) / 0.7) * rows.length), 0, rows.length);
      rows.forEach((r, i) => {
        const on = i < n;
        r.classList.toggle("is-on", on);
        r.querySelector("b").textContent = on ? answers[i][1] : "?";
      });
      if (local < 0.2) {
        lab.textContent = "Right now, much of this is not public";
        ex.textContent =
          "Publishing the amount helps. Showing how it was calculated makes it easier to check.";
      } else if (n < rows.length) {
        lab.textContent = "What transparency would show";
        ex.textContent = "Amount, recipient, allocation, method, and who checked it.";
      } else {
        lab.textContent = "Disclosure → check → verify → account";
        ex.textContent = "Accountability depends on information that can be checked.";
      }
    } else {
      eye.textContent = "Our proposal";
      const n = clamp(Math.round(((p - 0.58) / 0.42) * chain.length), 1, chain.length);
      chain.forEach((c, i) => c.classList.toggle("is-on", i < n));
    }
  };
}

function initFinale(el) {
  const zoom = el.querySelector("#zoom-11");
  const levels = ["Journalist", "Newsroom", "News business", "Media ecosystem", "Australia"];
  return (p) => {
    zoom.textContent = levels[step(p, levels.length)];
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
        <a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title.replaceAll("—", ":")} →</a>
      </li>`
    )
    .join("");

  const rail = document.getElementById("rail");
  const acts = [...document.querySelectorAll("[data-act]")];
  rail.innerHTML = acts
    .map(
      (a, i) =>
        `<a href="#${a.id}" class="rail__link" data-id="${a.id}" data-l="${a.dataset.label || ""}" aria-label="${a.dataset.label || a.id}"><span class="rail__num">${String(i + 1).padStart(2, "0")}</span><span class="rail__dot" aria-hidden="true"></span><span class="rail__label">${a.dataset.label || ""}</span></a>`
    )
    .join("");

  const engine = new ScrollEngine({ reducedMotion: reduced });
  engine.onAct((id) => {
    rail.querySelectorAll("a").forEach((a) => a.classList.toggle("is-on", a.dataset.id === id));
  });

  const map = [
    ["act-01", initHero],
    ["act-02", initVoices],
    ["act-03", initResources],
    ["act-04", initTimeline],
    ["act-05", initMechanism],
    ["act-06", initEight],
    ["act-07", initCap],
    ["act-08", initFork],
    ["act-09", initSplit],
    ["act-10", initTransparency],
    ["act-11", initFinale],
  ];

  map.forEach(([id, fn]) => {
    const el = document.getElementById(id);
    if (el) engine.register(id, el, fn(el));
  });

  engine.start();
}

main().catch((err) => console.error(err));

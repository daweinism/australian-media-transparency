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
    title: "What diversity means here",
    body: "A healthy information system is varied — First Nations, regional, local, independent, community, cultural, disability, migrant and other perspectives. Labels are conceptual, not measured shares.",
  },
  voices: {
    badge: "Illustrative",
    title: "Who gets heard",
    body: "This model is conceptual. It does not claim measured audience or representation statistics. It asks who is easy to hear, who is faint, and who can keep speaking.",
  },
  interview: {
    badge: "Multimodal",
    title: "Why the field matters",
    body: "When verified interviews arrive, this section becomes audio, video and transcript. Until then it stays a clean placeholder — no fabricated quotes.",
  },
  "2021": {
    badge: "Fact",
    title: "The 2021 Code",
    body: "The Mandatory Bargaining Code was enacted in February 2021 and took effect in March 2021. No platforms were designated, but the framework contributed to voluntary commercial agreements.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-code-01,source-code-02,source-code-03"></span></p>`,
  },
  nbi: {
    badge: "Policy",
    title: "2026 NMI design",
    body: "Enacted charge rate 2.75% on relevant Australian digital advertising revenue above $250 million. Offset needs eligible expenditure across at least 8 news-business corporate groups, with a 25% single-group cap. Design encourages breadth — it does not guarantee diverse journalism.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-01,source-nbi-02,source-nbi-03,source-nbi-04"></span></p>`,
  },
  money: {
    badge: "Illustrative",
    title: "Follow the money",
    body: "Conceptual pathway only — no invented dollar amounts. Charge receipts are directed to the News Journalism Payment Scheme under parliamentary materials.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-05"></span></p>`,
  },
  eight: {
    badge: "Policy",
    title: "8+ and 25%",
    body: "Offset entitlement requires new eligible expenditure in relation to at least eight different news business corporate groups. A particular group cannot contribute more than one quarter (25%) of the NMI offset.",
    extra: `<p style="margin-top:1rem;"><span data-sources="source-nbi-02,source-nbi-03"></span></p>`,
  },
  outcome: {
    badge: "Our analysis",
    title: "Design is not destiny",
    body: "The mechanism is designed to encourage support across a broader range of news businesses. That is not the same as proving diverse journalism outcomes.",
  },
  transparency: {
    badge: "Our analysis",
    title: "Disclosure ≠ accountability",
    body: "Publishing numbers is not enough if the public cannot see methodology, recipients, journalism share versus overhead, and independent verification.",
  },
  proposal: {
    badge: "Our proposal",
    title: "Voluntary transparency",
    body: "News Corp voluntarily discloses the structure of major platform agreements; independent review; public report; smaller publishers at the table. This is our intervention — not existing law.",
  },
};

function seedNetwork(svg, count = 18, withLinks = true) {
  const gN = svg.querySelector(".nodes");
  const gL = svg.querySelector(".links");
  const pts = [];
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + (i % 3) * 0.15;
    const r = i === 0 ? 0 : 18 + (i % 5) * 7;
    pts.push([50 + Math.cos(a) * r * 0.55, 50 + Math.sin(a) * r * 0.45]);
  }
  // jitter center cluster
  pts[0] = [50, 50];
  pts.forEach(([x, y], i) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", x);
    c.setAttribute("cy", y);
    c.setAttribute("r", i === 0 ? 2.6 : 1 + (i % 4) * 0.35);
    c.classList.add("n");
    if (i % 4 === 1) c.classList.add("n-euc");
    if (i % 5 === 2) c.classList.add("n-och");
    c.style.opacity = "0";
    gN.appendChild(c);
  });
  if (withLinks && gL) {
    for (let i = 1; i < pts.length; i++) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      const b = pts[i % 4 === 0 ? 0 : Math.max(0, i - 1)];
      line.setAttribute("x1", pts[i][0]);
      line.setAttribute("y1", pts[i][1]);
      line.setAttribute("x2", b[0]);
      line.setAttribute("y2", b[1]);
      line.classList.add("l");
      line.style.strokeOpacity = "0";
      gL.appendChild(line);
    }
  }
  return { nodes: [...gN.children], links: gL ? [...gL.children] : [], pts };
}

function initHero(el) {
  const title = el.querySelector("#title-01");
  const spans = [...title.querySelectorAll("span")];
  const eco = el.querySelector("#eco-01");
  const meta = el.querySelector("#meta-01");
  const { nodes, links } = seedNetwork(eco, 20);

  return (p) => {
    if (reduced) {
      const show = p > 0.45;
      title.style.opacity = show ? "0.12" : "1";
      title.style.transform = show ? "scale(0.35)" : "scale(1)";
      eco.style.opacity = show ? "1" : "0";
      return;
    }
    const zoom = lerp(1, 0.22, ease(clamp((p - 0.05) / 0.5, 0, 1)));
    const ecoIn = clamp((p - 0.28) / 0.4, 0, 1);
    title.style.transform = `scale(${zoom})`;
    title.style.opacity = String(lerp(1, 0.06, clamp((p - 0.4) / 0.45, 0, 1)));
    spans.forEach((s, i) => {
      const sep = clamp((p - i * 0.03) / 0.25, 0, 1);
      s.style.transform = `translateY(${sep * (i - 1) * 26}px)`;
    });
    meta.style.opacity = String(1 - clamp(p / 0.2, 0, 1));
    eco.style.opacity = String(ecoIn);
    nodes.forEach((n, i) => {
      n.style.opacity = String(clamp((ecoIn - i * 0.02) / 0.2, 0, 1) * 0.9);
    });
    links.forEach((l, i) => {
      l.style.strokeOpacity = String(clamp((ecoIn - 0.2 - i * 0.015) / 0.25, 0, 1) * 0.22);
    });
  };
}

function initDiversity(el, cats) {
  const word = el.querySelector("#word-02");
  const eco = el.querySelector("#eco-02");
  const line = el.querySelector("#line-02");
  const labelsG = eco.querySelector(".labels");
  const { nodes, links } = seedNetwork(eco, cats.length + 4);

  cats.forEach((cat, i) => {
    const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
    t.classList.add("lbl");
    t.textContent = cat.label.toUpperCase();
    const n = nodes[i + 1] || nodes[i % nodes.length];
    t.setAttribute("x", n.getAttribute("cx"));
    t.setAttribute("y", Number(n.getAttribute("cy")) - 3.2);
    t.setAttribute("text-anchor", "middle");
    labelsG.appendChild(t);
  });
  const labels = [...labelsG.children];
  const lines = ["DIFFERENT VOICES.", "DIFFERENT STORIES.", "DIFFERENT NEEDS."];

  return (p) => {
    const phase = clamp(p, 0, 1);
    if (phase < 0.2) {
      word.style.opacity = "1";
      word.style.transform = `scale(${lerp(1, 0.7, phase / 0.2)})`;
      eco.style.opacity = "0";
      line.style.opacity = "0";
      return;
    }
    word.style.opacity = String(lerp(1, 0, clamp((phase - 0.2) / 0.15, 0, 1)));
    const ecoIn = clamp((phase - 0.25) / 0.35, 0, 1);
    eco.style.opacity = String(ecoIn);
    nodes.forEach((n, i) => {
      n.style.opacity = String(clamp((ecoIn - i * 0.04) / 0.2, 0, 1));
    });
    links.forEach((l, i) => {
      l.style.strokeOpacity = String(clamp((ecoIn - 0.15 - i * 0.03) / 0.25, 0, 1) * 0.2);
    });
    labels.forEach((l, i) => {
      l.style.opacity = String(clamp((ecoIn - 0.25 - i * 0.05) / 0.2, 0, 1));
    });
    const li = Math.min(2, Math.floor(clamp((phase - 0.65) / 0.12, 0, 3)));
    if (phase > 0.65) {
      line.style.opacity = "1";
      line.textContent = lines[li] || lines[2];
      line.style.position = "absolute";
    } else {
      line.style.opacity = "0";
    }
  };
}

function initVoices(el) {
  const svg = el.querySelector("#eco-03");
  const g = svg.querySelector(".nodes");
  const line = el.querySelector("#line-03");
  const msgs = ["LOUD", "QUIET", "MISSING", "WHO HAS THE RESOURCES\nTO KEEP SPEAKING?"];

  for (let i = 0; i < 24; i++) {
    const a = (Math.PI * 2 * i) / 24;
    const r = 12 + (i % 6) * 5;
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", 50 + Math.cos(a) * r * 0.7);
    c.setAttribute("cy", 50 + Math.sin(a) * r * 0.55);
    c.setAttribute("r", 0.8 + (i % 5) * 0.55);
    c.classList.add("n");
    g.appendChild(c);
  }
  const nodes = [...g.children];

  return (p) => {
    const phase = clamp(p, 0, 1);
    nodes.forEach((n, i) => {
      n.classList.remove("n-alert", "n-faint", "n-euc");
      if (phase > 0.25) {
        if (i % 5 === 0) n.classList.add("n-alert");
        else if (i % 3 === 0) n.classList.add("n-faint");
        else if (i % 4 === 0) n.classList.add("n-euc");
      }
      n.style.opacity = String(0.25 + clamp(phase * 2, 0, 0.7));
    });
    const idx = Math.min(3, Math.floor(phase * 4));
    line.style.opacity = phase > 0.15 ? "1" : "0";
    line.style.whiteSpace = "pre-line";
    line.textContent = msgs[idx];
  };
}

function initYears(el) {
  const years = [...el.querySelectorAll(".y")];
  const event = el.querySelector("#event-05");
  const events = ["CODE", "ENACTED", "DEALS", "PRESSURE", "NBI"];

  return (p) => {
    const idx = Math.min(4, Math.floor(clamp(p, 0, 0.999) * 5));
    years.forEach((y, i) => y.classList.toggle("is-on", i === idx));
    event.textContent = events[idx];
  };
}

function initNbi(el, nbi) {
  const num = el.querySelector("#num-06");
  const sub = el.querySelector("#sub-06");
  const badge = el.querySelector("#badge-06");
  const branch = el.querySelector("#branch-06");
  const boxes = [...branch.children];

  return (p) => {
    badge.style.opacity = p > 0.05 ? "1" : "0";
    if (p < 0.15) {
      num.textContent = "NBI";
      sub.style.opacity = "0";
      boxes.forEach((b) => b.classList.remove("is-on"));
    } else if (p < 0.35) {
      num.textContent = nbi.enactedChargeRate.value;
      sub.textContent = "CHARGE";
      sub.style.opacity = "1";
      boxes.forEach((b) => b.classList.remove("is-on"));
    } else if (p < 0.55) {
      num.textContent = nbi.threshold.value;
      sub.textContent = "AUSTRALIAN DIGITAL ADVERTISING";
      sub.style.opacity = "1";
      boxes.forEach((b) => b.classList.remove("is-on"));
    } else if (p < 0.75) {
      num.textContent = "NMI";
      sub.textContent = "TWO PATHWAYS";
      sub.style.opacity = "1";
      boxes.forEach((b) => b.classList.add("is-on"));
    } else {
      num.textContent = "NMI";
      sub.textContent = "DESIGN ≠ GUARANTEE";
      sub.style.opacity = "1";
      boxes.forEach((b) => b.classList.add("is-on"));
    }
  };
}

function initMoney(el) {
  const svg = el.querySelector("#money-07");
  const path = el.querySelector("#moneyPath");
  const dots = [...svg.querySelectorAll(".dot")];
  const labels = [...svg.querySelectorAll("text")];
  const d = path.getAttribute("d");

  dots.forEach((dot, i) => {
    if (!reduced) {
      dot.style.offsetPath = `path('${d}')`;
      dot.style.offsetDistance = "0%";
    }
  });

  return (p) => {
    labels.forEach((l, i) => {
      l.style.opacity = p > i * 0.12 ? "1" : "0.15";
    });
    if (reduced) {
      dots.forEach((dot, i) => {
        dot.style.opacity = p > 0.2 ? "0.8" : "0.2";
      });
      return;
    }
    dots.forEach((dot, i) => {
      const t = clamp((p - i * 0.08) / 0.7, 0, 1);
      dot.style.offsetDistance = `${t * 100}%`;
      dot.style.opacity = t > 0.02 && t < 0.98 ? "1" : "0.15";
    });
  };
}

function initEight(el) {
  const core = el.querySelector("#eight-core");
  const dots = [...el.querySelectorAll(".eight-dot")];
  const cap = el.querySelector("#cap-08");

  dots.forEach((n, i) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2;
    n.style.left = `calc(${50 + 42 * Math.cos(a)}% - 1.15rem)`;
    n.style.top = `calc(${50 + 42 * Math.sin(a)}% - 1.15rem)`;
  });

  return (p) => {
    const n = Math.min(8, Math.max(1, Math.ceil(clamp(p, 0, 1) * 8)));
    dots.forEach((d, i) => d.classList.toggle("is-on", i < n));
    core.textContent = n >= 8 ? "8+" : String(n);
    core.classList.toggle("is-wide", n >= 8);
    if (n >= 8 && p > 0.72) {
      core.textContent = "8+ groups";
      cap.classList.add("is-on");
    } else {
      cap.classList.remove("is-on");
    }
  };
}

function initOutcome(el) {
  const a = el.querySelector("#neq-a");
  const b = el.querySelector("#neq-b");
  return (p) => {
    if (p < 0.35) {
      a.textContent = "More money";
      b.textContent = "More diversity";
    } else {
      a.textContent = "Policy design";
      b.textContent = "Guaranteed outcome";
    }
    el.style.opacity = String(0.35 + clamp(p, 0, 1) * 0.65);
  };
}

function initGlass(el) {
  const word = el.querySelector("#word-10");
  const glass = el.querySelector("#glass-10");
  const layers = [...el.querySelectorAll(".glass__layer")];
  const ask = el.querySelector("#ask-10");
  const disc = el.querySelector("#disc-10");
  const asks = ["CAN YOU SEE IT?", "CAN YOU CHECK IT?", "CAN YOU VERIFY IT?"];

  return (p) => {
    if (p < 0.12) {
      word.style.opacity = "1";
      glass.style.opacity = "0";
      ask.style.opacity = "0";
      disc.style.opacity = "0";
      return;
    }
    word.style.opacity = String(lerp(1, 0, clamp((p - 0.12) / 0.12, 0, 1)));
    glass.style.opacity = "1";
    const step = Math.min(3, Math.floor(clamp((p - 0.2) / 0.15, 0, 4)));
    layers.forEach((l, i) => l.classList.toggle("is-off", step > i));
    if (p > 0.72 && p < 0.9) {
      ask.style.opacity = "1";
      ask.textContent = asks[Math.min(2, Math.floor((p - 0.72) / 0.06))];
      disc.style.opacity = "0";
    } else if (p >= 0.9) {
      ask.style.opacity = "0";
      glass.style.opacity = "0.15";
      disc.style.opacity = "1";
    } else {
      ask.style.opacity = "0";
      disc.style.opacity = "0";
    }
  };
}

function initProposal(el) {
  const steps = [...el.querySelectorAll("#prop-11 span")];
  return (p) => {
    const n = Math.floor(clamp(p, 0, 0.999) * steps.length);
    steps.forEach((s, i) => s.classList.toggle("is-on", i <= n));
  };
}

function initFinale(el) {
  const q = el.querySelector("#q-12");
  const eco = el.querySelector("#eco-12");
  seedNetwork(eco, 16);
  const qs = [
    "One story → Australia",
    "Who gets to tell Australia’s story?",
    "Who has the resources to keep telling it?",
    "Can we see whether it’s working?",
  ];
  return (p) => {
    const idx = Math.min(qs.length - 1, Math.floor(clamp(p, 0, 0.999) * qs.length));
    q.textContent = qs[idx];
    eco.style.opacity = String(0.25 + p * 0.45);
    eco.style.transform = `scale(${0.7 + p * 0.45})`;
  };
}

function initInterview(data) {
  const live = (data.interviews || []).find(
    (i) => i.status === "ready" && (i.audio || i.video || (i.quote && !String(i.quote).includes("[INSERT")))
  );
  const media = document.getElementById("hear-media");
  const ph = document.getElementById("hear-ph");
  const play = document.getElementById("hear-play");
  const audio = document.getElementById("hear-audio");
  const meta = document.getElementById("hear-meta");
  const transcript = document.getElementById("hear-transcript");

  if (!live) {
    meta.textContent = "Placeholder · interviews pending";
    return;
  }

  meta.textContent = `${live.name} · ${live.role} · ${live.organisation}`;
  transcript.textContent = live.transcript || "";
  ph.hidden = true;

  if (live.video) {
    const v = document.createElement("video");
    v.controls = true;
    v.preload = "none";
    v.playsInline = true;
    v.innerHTML = `<source src="${live.video}" type="video/mp4" />`;
    media.prepend(v);
    play.hidden = true;
  } else if (live.portrait) {
    const img = document.createElement("img");
    img.src = live.portrait;
    img.alt = "";
    img.loading = "lazy";
    media.prepend(img);
  }

  if (live.audio) {
    audio.hidden = false;
    audio.innerHTML = `<source src="${live.audio}" type="audio/mpeg" />`;
    play.hidden = false;
    play.addEventListener("click", () => {
      audio.play();
    });
  }
}

async function main() {
  const [sources, nbi, ecosystem, interviews] = await Promise.all([
    load("data/sources.json"),
    load("data/nbi.json"),
    load("data/ecosystem.json"),
    load("data/interviews.json"),
  ]);

  const sys = new SourceSystem({
    sources,
    drawer: document.getElementById("drawer"),
    backdrop: document.getElementById("backdrop"),
  });
  sys.setDetails(DETAILS);
  sys.renderMarkers(document);
  sys.bind();
  // re-bind detail markers inside drawers when opened
  const _openDetail = sys.openDetail.bind(sys);
  sys.openDetail = (key, trigger) => {
    _openDetail(key, trigger);
    sys.renderMarkers(sys.drawer);
  };

  const list = document.getElementById("evidence-list");
  sources.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="org">${i + 1}. ${s.organisation}</span><br><strong>${s.title}</strong></a>`;
    list.appendChild(li);
  });

  initInterview(interviews);

  const engine = new ScrollEngine({ reducedMotion: reduced });
  const rail = document.getElementById("rail");
  engine.onAct((id) => {
    rail.querySelectorAll("a").forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === `#${id}`));
  });

  engine.register("act-01", document.getElementById("act-01"), initHero(document.getElementById("act-01")));
  engine.register("act-02", document.getElementById("act-02"), initDiversity(document.getElementById("act-02"), ecosystem.categories));
  engine.register("act-03", document.getElementById("act-03"), initVoices(document.getElementById("act-03")));
  engine.register("act-05", document.getElementById("act-05"), initYears(document.getElementById("act-05")));
  engine.register("act-06", document.getElementById("act-06"), initNbi(document.getElementById("act-06"), nbi));
  engine.register("act-07", document.getElementById("act-07"), initMoney(document.getElementById("act-07")));
  engine.register("act-08", document.getElementById("act-08"), initEight(document.getElementById("act-08")));
  engine.register("act-09", document.getElementById("act-09"), initOutcome(document.getElementById("act-09")));
  engine.register("act-10", document.getElementById("act-10"), initGlass(document.getElementById("act-10")));
  engine.register("act-11", document.getElementById("act-11"), initProposal(document.getElementById("act-11")));
  engine.register("act-12", document.getElementById("act-12"), initFinale(document.getElementById("act-12")));
  engine.start();
}

main().catch((err) => {
  console.error(err);
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<div role="alert" style="padding:1rem;background:#8a3530;color:#fff;">Failed to load. Serve over HTTP and refresh.</div>`
  );
});

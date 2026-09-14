import { ScrollEngine } from "./scroll-engine.js";
import { SourceSystem } from "./sources.js";
import { initHero } from "./visuals/ecosystem.js";
import { initTimeline, initAsymmetry } from "./visuals/timeline.js";
import { initNbi, initMoney, initEight } from "./visuals/nbi.js";
import { initTransparency, initProposal, initDiversity, initVoices } from "./visuals/transparency.js";
import { initInterviews, initScenarios } from "./visuals/interviews.js";

const BASE = new URL("../../", import.meta.url);

async function loadJSON(path) {
  const res = await fetch(new URL(path, BASE));
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function main() {
  const reducedMotion = prefersReducedMotion();
  const [sources, nbi, timeline, ecosystem, interviews, scenarios] = await Promise.all([
    loadJSON("data/sources.json"),
    loadJSON("data/nbi.json"),
    loadJSON("data/timeline.json"),
    loadJSON("data/ecosystem.json"),
    loadJSON("data/interviews.json"),
    loadJSON("data/scenarios.json"),
  ]);

  // Sources
  const sourceSystem = new SourceSystem({
    sources,
    drawer: document.getElementById("source-drawer"),
    backdrop: document.getElementById("drawer-backdrop"),
  });
  sourceSystem.renderMarkers(document);
  sourceSystem.bindGlobal();

  // Fill evidence list
  const evidenceList = document.getElementById("evidence-list");
  if (evidenceList) {
    sources.forEach((s, i) => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="${s.url}" target="_blank" rel="noopener noreferrer"><span class="org">${i + 1}. ${s.organisation} · ${s.type}</span><br><strong>${s.title}</strong></a>`;
      evidenceList.appendChild(li);
    });
  }

  // NBI stats from data
  document.querySelectorAll("[data-bind]").forEach((el) => {
    const key = el.getAttribute("data-bind");
    if (key === "rate") el.textContent = nbi.enactedChargeRate.value;
    if (key === "threshold") el.textContent = nbi.threshold.value;
    if (key === "groups") el.textContent = String(nbi.offset.minimumGroups);
    if (key === "cap") el.textContent = nbi.offset.singleGroupCap;
  });

  // Progress nav
  const nav = document.getElementById("progress-nav");
  const engine = new ScrollEngine({ reducedMotion });
  engine.onChapter((id) => {
    nav?.querySelectorAll("a").forEach((a) => {
      a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
    });
  });

  // Hero
  const heroEl = document.getElementById("chapter-01");
  const updateHero = initHero({
    sticky: heroEl.querySelector(".hero__sticky"),
    content: heroEl.querySelector(".hero__content"),
    titleSpans: [...heroEl.querySelectorAll(".hero__title span")],
    sub: heroEl.querySelector(".hero__sub"),
    meta: heroEl.querySelector(".hero__meta"),
    ecosystem: heroEl.querySelector(".hero__ecosystem"),
    hint: heroEl.querySelector(".hero__scroll-hint"),
    reducedMotion,
  });
  engine.registerScene("hero", heroEl, { onProgress: updateHero });

  // Diversity
  const diversityScene = document.querySelector('[data-scene="diversity"]');
  if (diversityScene) {
    const updateDiv = initDiversity(diversityScene.querySelector(".sticky-scene__stage"), {
      categories: ecosystem.categories,
      concepts: ecosystem.diversityConcepts,
    });
    engine.registerScene("diversity", diversityScene, {
      onStep: (i) => updateDiv(i),
    });
  }

  // Voices
  const voicesScene = document.querySelector('[data-scene="voices"]');
  if (voicesScene) {
    const updateVoices = initVoices(voicesScene.querySelector("svg"));
    engine.registerScene("voices", voicesScene, { onStep: (i) => updateVoices(i) });
  }

  // Interviews
  const interviewRoot = document.querySelector('[data-scene="interviews"] .sticky-scene__stage');
  if (interviewRoot) initInterviews(interviewRoot, interviews);

  // Timeline
  const timelineScene = document.querySelector('[data-scene="timeline"]');
  if (timelineScene) {
    const updateTimeline = initTimeline(timelineScene.querySelector(".timeline-viz"));
    // populate narrative from data if empty slots exist
    timelineScene.querySelectorAll("[data-timeline-id]").forEach((el) => {
      const item = timeline.find((t) => t.id === el.dataset.timelineId);
      if (!item) return;
      el.querySelector("[data-field='title']") && (el.querySelector("[data-field='title']").textContent = item.title);
      el.querySelector("[data-field='summary']") && (el.querySelector("[data-field='summary']").textContent = item.summary);
    });
    engine.registerScene("timeline", timelineScene, { onStep: (i) => updateTimeline(i) });
  }

  // Asymmetry
  const asymScene = document.querySelector('[data-scene="asymmetry"]');
  if (asymScene) {
    const updateAsym = initAsymmetry(asymScene.querySelector(".sticky-scene__stage"));
    engine.registerScene("asymmetry", asymScene, { onStep: (i) => updateAsym(i) });
  }

  // NBI
  const nbiScene = document.querySelector('[data-scene="nbi"]');
  if (nbiScene) {
    const updateNbi = initNbi(nbiScene.querySelector(".nbi-flow"));
    engine.registerScene("nbi", nbiScene, { onStep: (i) => updateNbi(i) });
  }

  // Money
  const moneyScene = document.querySelector('[data-scene="money"]');
  if (moneyScene) {
    const updateMoney = initMoney(moneyScene.querySelector(".money-stage"), { reducedMotion });
    engine.registerScene("money", moneyScene, { onStep: (i) => updateMoney(i) });
  }

  // Eight groups
  const eightScene = document.querySelector('[data-scene="eight"]');
  if (eightScene) {
    const updateEight = initEight(eightScene.querySelector(".sticky-scene__stage"));
    engine.registerScene("eight", eightScene, { onStep: (i) => updateEight(i) });
  }

  // Transparency
  const transScene = document.querySelector('[data-scene="transparency"]');
  if (transScene) {
    const updateTrans = initTransparency(transScene.querySelector(".sticky-scene__stage"));
    engine.registerScene("transparency", transScene, { onStep: (i) => updateTrans(i) });
  }

  // Proposal
  const propScene = document.querySelector('[data-scene="proposal"]');
  if (propScene) {
    const updateProp = initProposal(propScene.querySelector(".sticky-scene__stage"));
    engine.registerScene("proposal", propScene, { onStep: (i) => updateProp(i) });
  }

  // Scenarios
  const scenarioRoot = document.querySelector("#scenario-root");
  if (scenarioRoot) initScenarios(scenarioRoot, scenarios);

  // Finale zoom
  const finale = document.getElementById("chapter-12");
  if (finale) {
    const questions = [...finale.querySelectorAll(".finale__q")];
    const cta = finale.querySelector(".finale__cta");
    const eco = finale.querySelector(".hero__ecosystem");

    engine.registerScene("finale", finale, {
      onProgress: (p) => {
        const idx = Math.min(questions.length - 1, Math.floor(p * questions.length));
        questions.forEach((q, i) => q.classList.toggle("is-active", i === idx));
        cta?.classList.toggle("is-visible", p > 0.82);
        if (eco) {
          const scale = reducedMotion ? 1 : 0.6 + p * 0.9;
          eco.style.opacity = String(0.25 + p * 0.55);
          eco.style.transform = `scale(${scale})`;
        }
      },
    });
  }

  engine.start();

  // Skip link focus
  document.getElementById("skip-to-content")?.addEventListener("click", () => {
    document.getElementById("chapter-02")?.focus?.();
  });
}

main().catch((err) => {
  console.error(err);
  const banner = document.createElement("div");
  banner.setAttribute("role", "alert");
  banner.style.cssText = "padding:1rem;background:#8a3b35;color:#fff;font-family:sans-serif;";
  banner.textContent = "Content failed to load. Please refresh, or check that you are serving the site over HTTP (not file://).";
  document.body.prepend(banner);
});

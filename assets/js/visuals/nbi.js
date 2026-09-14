export function initNbi(root) {
  const nodes = [...root.querySelectorAll("[data-nbi]")];
  const arrows = [...root.querySelectorAll(".nbi-arrow")];
  const stats = [...root.querySelectorAll(".nbi-stat")];

  return (step) => {
    nodes.forEach((n) => {
      const showAt = Number(n.dataset.nbi);
      n.classList.toggle("is-visible", step >= showAt);
      n.classList.toggle("is-emphasis", step === showAt);
    });
    arrows.forEach((a, i) => a.classList.toggle("is-visible", step > i));
    stats.forEach((s) => s.classList.toggle("is-visible", step >= 4));
  };
}

export function initMoney(root, { reducedMotion = false } = {}) {
  const particles = [...root.querySelectorAll(".money-particle")];
  const path = root.querySelector("#moneyPath");

  particles.forEach((p, i) => {
    if (path && !reducedMotion) {
      p.style.offsetPath = "path('" + path.getAttribute("d") + "')";
      p.style.animationDelay = `${i * 0.55}s`;
    }
  });

  return (step) => {
    root.classList.toggle("is-flowing", step >= 1 && !reducedMotion);
    root.querySelectorAll(".money-label").forEach((l, i) => {
      l.style.opacity = step >= i ? "1" : "0.2";
    });
  };
}

export function initEight(root) {
  const nodes = [...root.querySelectorAll(".eight-node")];
  const center = root.querySelector(".eight-center");
  const compare = root.querySelector(".intent-outcome");

  // position on circle
  nodes.forEach((n, i) => {
    const angle = (Math.PI * 2 * i) / nodes.length - Math.PI / 2;
    const r = 42;
    const x = 50 + r * Math.cos(angle);
    const y = 50 + r * Math.sin(angle);
    n.style.left = `calc(${x}% - 1.2rem)`;
    n.style.top = `calc(${y}% - 1.2rem)`;
  });

  return (step) => {
    const count = Math.min(8, Math.max(0, step + 1));
    nodes.forEach((n, i) => n.classList.toggle("is-visible", i < count));
    if (center) {
      center.textContent = count >= 8 ? "8+ groups" : count <= 1 ? "Concentration" : `${count} groups`;
      center.classList.toggle("is-diverse", count >= 8);
    }
    compare?.classList.toggle("is-visible", step >= 8);
    if (compare) compare.style.opacity = step >= 8 ? "1" : "0";
  };
}

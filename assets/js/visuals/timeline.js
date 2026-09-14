export function initTimeline(root) {
  const fill = root.querySelector(".timeline-rail__fill");
  const years = [...root.querySelectorAll(".timeline-year")];

  return (step) => {
    years.forEach((y, i) => y.classList.toggle("is-active", i === step));
    if (fill) {
      const pct = ((step + 1) / years.length) * 100;
      fill.style.height = `${pct}%`;
    }
  };
}

export function initAsymmetry(root) {
  const walk = root.querySelector(".walk-away");
  const blocks = root.querySelectorAll(".asymmetry");
  return (step) => {
    blocks.forEach((b) => {
      b.style.opacity = step >= 2 ? "0.2" : "1";
    });
    walk?.classList.toggle("is-visible", step >= 2);
  };
}

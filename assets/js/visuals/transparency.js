export function initTransparency(root) {
  const layers = [...root.querySelectorAll(".t-layer")];
  const neq = root.querySelector(".disclosure-neq");

  return (step) => {
    // step 0 opaque; each step peels a layer
    layers.forEach((layer, i) => {
      layer.classList.toggle("is-hidden", step > i);
    });
    if (neq) {
      neq.style.opacity = step >= 5 ? "1" : "0";
      neq.style.transform = step >= 5 ? "none" : "translateY(10px)";
    }
  };
}

export function initProposal(root) {
  const steps = [...root.querySelectorAll(".proposal-step")];
  return (step) => {
    steps.forEach((s, i) => s.classList.toggle("is-active", i <= step));
  };
}

export function initDiversity(root, { categories = [], concepts = [] } = {}) {
  const chipWrap = root.querySelector(".diversity-grid");
  const conceptWrap = root.querySelector(".concept-stack");

  categories.forEach((cat) => {
    const el = document.createElement("span");
    el.className = "diversity-chip";
    el.textContent = cat.label;
    el.dataset.id = cat.id;
    chipWrap?.appendChild(el);
  });

  concepts.forEach((c) => {
    const el = document.createElement("span");
    el.textContent = c.text;
    el.dataset.id = c.id;
    conceptWrap?.appendChild(el);
  });

  const chips = [...(chipWrap?.children || [])];
  const conceptEls = [...(conceptWrap?.children || [])];

  return (step) => {
    chips.forEach((chip, i) => {
      chip.classList.toggle("is-visible", step >= 1 && i <= step * 2);
      chip.classList.toggle("is-active", step >= 2 && i === Math.min(chips.length - 1, step));
    });
    conceptEls.forEach((c, i) => c.classList.toggle("is-visible", step >= 3 + i));
  };
}

export function initVoices(svg) {
  const nodes = [...svg.querySelectorAll(".node")];
  return (step) => {
    nodes.forEach((n, i) => {
      n.classList.remove("node--faint", "node--accent");
      if (step >= 1) {
        // some prominent, some faint
        if (i % 5 === 0) n.classList.add("node--accent");
        else if (i % 3 === 0) n.classList.add("node--faint");
      }
      n.style.opacity = step === 0 ? String(0.2 + (i % 4) * 0.15) : undefined;
    });
  };
}

import { clamp, lerp } from "../scroll-engine.js";

export function initHero({ sticky, content, titleSpans, sub, meta, ecosystem, hint, reducedMotion }) {
  const nodes = [];
  const links = [];
  const svg = ecosystem.querySelector("svg");
  const gLinks = svg.querySelector(".links");
  const gNodes = svg.querySelector(".nodes");

  const seed = [
    [50, 50], [22, 28], [78, 24], [18, 62], [82, 58], [35, 78], [68, 76],
    [40, 32], [60, 36], [28, 48], [72, 46], [48, 68], [12, 40], [88, 40],
    [55, 18], [33, 58], [65, 62], [42, 20], [58, 82], [25, 75]
  ];

  seed.forEach(([x, y], i) => {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("cx", String(x));
    c.setAttribute("cy", String(y));
    c.setAttribute("r", String(i === 0 ? 2.2 : 1.1 + (i % 3) * 0.35));
    c.classList.add("node");
    if (i % 4 === 0) c.classList.add("node--soft");
    if (i % 5 === 0) c.classList.add("node--ochre");
    gNodes.appendChild(c);
    nodes.push(c);
  });

  for (let i = 1; i < seed.length; i++) {
    const a = seed[i];
    const b = seed[i % 3 === 0 ? 0 : i - 1];
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(a[0]));
    line.setAttribute("y1", String(a[1]));
    line.setAttribute("x2", String(b[0]));
    line.setAttribute("y2", String(b[1]));
    line.classList.add("link");
    gLinks.appendChild(line);
    links.push(line);
  }

  return (progress) => {
    if (reducedMotion) {
      const showEco = progress > 0.55;
      content.style.opacity = showEco ? "0.15" : "1";
      content.style.transform = showEco ? "scale(0.35)" : "scale(1)";
      ecosystem.style.opacity = showEco ? "1" : "0";
      hint.style.opacity = progress > 0.08 ? "0" : "1";
      return;
    }

    const p = clamp(progress, 0, 1);
    const zoom = lerp(1, 0.22, easeInOut(clamp((p - 0.08) / 0.55, 0, 1)));
    const fadeCopy = 1 - clamp((p - 0.12) / 0.35, 0, 1);
    const ecoIn = clamp((p - 0.28) / 0.35, 0, 1);

    content.style.transform = `scale(${zoom})`;
    content.style.opacity = String(lerp(1, 0.08, clamp((p - 0.45) / 0.4, 0, 1)));

    titleSpans.forEach((span, i) => {
      const sep = clamp((p - 0.02 - i * 0.03) / 0.25, 0, 1);
      span.style.transform = `translateY(${sep * (i - 1) * 28}px) scale(${lerp(1, 0.85, sep)})`;
      span.style.letterSpacing = `${lerp(-0.035, 0.08, sep)}em`;
      span.style.opacity = String(lerp(1, 0.35, sep * fadeCopy));
    });

    sub.style.opacity = String(fadeCopy);
    meta.style.opacity = String(fadeCopy);
    hint.style.opacity = String(1 - clamp(p / 0.1, 0, 1));

    ecosystem.style.opacity = String(ecoIn);
    nodes.forEach((n, i) => {
      const appear = clamp((ecoIn - i * 0.03) / 0.25, 0, 1);
      n.style.opacity = String(appear * (i === 0 ? 0.95 : 0.75));
      n.setAttribute("r", String((i === 0 ? 2.4 : 1.2) * lerp(0.2, 1, appear)));
    });
    links.forEach((l, i) => {
      const appear = clamp((ecoIn - 0.25 - i * 0.02) / 0.3, 0, 1);
      l.style.strokeOpacity = String(appear * 0.22);
    });
  };
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

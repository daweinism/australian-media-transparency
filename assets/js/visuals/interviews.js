export function initInterviews(root, data) {
  const tabs = root.querySelector(".interview-tabs");
  const panel = root.querySelector("[data-interview-panel]");
  if (!tabs || !panel || !data?.interviews?.length) return () => {};

  data.interviews.forEach((item, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = item.organisation;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", String(i === 0));
    btn.dataset.id = item.id;
    btn.addEventListener("click", () => {
      tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
      render(item);
    });
    tabs.appendChild(btn);
  });

  render(data.interviews[0]);

  function render(item) {
    const hasAudio = Boolean(item.audio);
    const hasVideo = Boolean(item.video);
    const hasEmbed = Boolean(item.embed);

    panel.innerHTML = `
      <div class="interview-media" aria-label="Interview media">
        ${
          hasVideo
            ? `<video controls preload="none" playsinline poster="${item.portrait || ""}"><source src="${item.video}" type="video/mp4" />[INSERT VIDEO]</video>`
            : hasEmbed
              ? `<iframe title="Interview video" src="${item.embed}" loading="lazy" style="width:100%;height:100%;border:0;" allowfullscreen></iframe>`
              : item.portrait
                ? `<img src="${item.portrait}" alt="" loading="lazy" />`
                : `<span>[INSERT VIDEO / PORTRAIT]</span>`
        }
      </div>
      <blockquote class="interview-quote">${escape(item.quote)}</blockquote>
      <p class="interview-meta"><strong>${escape(item.name)}</strong> · ${escape(item.role)} · ${escape(item.organisation)}</p>
      <div class="interview-players">
        ${
          hasAudio
            ? `<audio controls preload="none"><source src="${item.audio}" type="audio/mpeg" />Your browser does not support audio.</audio>`
            : `<p class="tag">[INSERT AUDIO]</p>`
        }
      </div>
      <details>
        <summary class="tag" style="cursor:pointer;">Transcript</summary>
        <div class="interview-transcript">${escape(item.transcript)}</div>
      </details>
    `;
  }

  return () => {};
}

export function initScenarios(root, data) {
  const wrap = root.querySelector(".scenario-cards");
  if (!wrap || !data?.scenarios) return () => {};

  const note = document.createElement("p");
  note.className = "tag tag--scenario";
  note.textContent = data.label + " : " + data.disclaimer;
  wrap.before(note);

  data.scenarios.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "scenario-card";
    btn.dataset.tone = s.tone;
    btn.setAttribute("aria-pressed", String(i === 0));
    btn.innerHTML = `<span class="tag tag--scenario">Scenario ${i + 1}</span><h4>${escape(s.title)}</h4><p>${escape(s.summary)}</p>`;
    btn.addEventListener("click", () => {
      wrap.querySelectorAll(".scenario-card").forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
      root.dispatchEvent(new CustomEvent("scenario-change", { detail: s }));
    });
    wrap.appendChild(btn);
  });
}

function escape(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

# Who Gets to Tell Australia's Story?

Interactive scrollytelling site supporting an SMBA6005 group pitch on Australia's News Bargaining Incentive (NBI / NMI), media diversity, power, money flows, transparency and accountability.

**Central question:** Who gets to tell Australia's story?  
**Deeper question:** If the NBI is supposed to support a diverse news media, how can we tell whether it actually does?

Live deployment target: GitHub Pages  
Repository: https://github.com/daweinism/australian-media-transparency

## Technology

- Static HTML, CSS and vanilla ES modules
- SVG + CSS transforms for camera / scale storytelling
- `IntersectionObserver` + `requestAnimationFrame` scroll engine
- JSON content in `/data`
- No build step, no server, no database, no paid APIs

This website requires **no paid backend or hosting service**. GitHub Pages alone is enough.

## Local development

Because the site loads JSON via `fetch`, serve it over HTTP (not `file://`).

```bash
# Python
python -m http.server 8080

# Node
npx --yes serve -l 8080
```

Then open http://localhost:8080

## GitHub Pages deployment

A workflow at `.github/workflows/deploy.yml` publishes the repository root to GitHub Pages on every push to `main`.

After the first successful run:

1. Repo **Settings → Pages**
2. Ensure Source is **GitHub Actions**
3. Site URL will be similar to:  
   `https://daweinism.github.io/australian-media-transparency/`

Asset paths are relative (`./assets/...`, `./data/...`) so project-site base paths work.

## File structure

```
/
  index.html                 Visual essay experience
  README.md
  assets/
    css/                     Design system + chapter graphics
    js/                      Scroll engine, sources, app logic
    img/                     Editorial photo moments
  data/
    sources.json             Auditable citations
    timeline.json            2020–2026 context
    nbi.json                 Enacted NMI design figures
    ecosystem.json           Diversity categories (conceptual)
    interviews.json          Live interviews OR fallback briefing
    scenarios.json           Hypothetical pathways
  media/
    interviews/              Drop audio / video here when ready
  .github/workflows/
    deploy.yml
```

## How to update sources

Edit `data/sources.json`. Each entry needs:

| Field | Purpose |
| --- | --- |
| `id` | Stable ID referenced in the page |
| `organisation` | Publishing body |
| `title` | Document title |
| `date` | ISO date |
| `url` | Canonical link |
| `type` | `primary` / secondary |
| `description` | Short abstract |
| `supports` | What claim this backs |

In HTML, mark citations with:

```html
<span data-sources="source-nbi-01,source-nbi-02"></span>
```

On load, these become clickable `[n]` markers that open the source drawer.

## Interviews — live or fallback

`data/interviews.json` supports both outcomes:

| `mode` | Behaviour |
| --- | --- |
| `auto` (default) | Shows live players if any interview has `status: "ready"` and real media/quote; otherwise shows the stakeholder fallback briefing |
| `fallback` | Always show the backup briefing (MDA / LINA focus, why it matters, questions we would ask, org links) |
| `live` | Force the player UI (only when verified content is ready) |

**If interviews do not happen:** leave `mode: "auto"` and `status: "pending"`. The site already shows a premium multimodal backup — no fake quotes.

**If interviews arrive:**

1. Add files to `media/interviews/` (e.g. `mda.mp3`, `mda.mp4`)
2. Update the matching interview object:

```json
{
  "id": "mda",
  "organisation": "Media Diversity Australia",
  "name": "Verified name",
  "role": "Verified role",
  "quote": "Verified quote",
  "audio": "./media/interviews/mda.mp3",
  "video": "./media/interviews/mda.mp4",
  "embed": "",
  "transcript": "Full transcript…",
  "portrait": "",
  "status": "ready"
}
```

Native `<audio controls>` / `<video controls>` are used. Optional embeds via `embed`. Do **not** fabricate quotes.

## How to change content

| Content | File / location |
| --- | --- |
| NBI figures | `data/nbi.json` |
| Timeline copy | `data/timeline.json` + chapter 05 in `index.html` |
| Diversity categories | `data/ecosystem.json` |
| Scenarios | `data/scenarios.json` |
| Narrative steps | `index.html` chapter sections |
| Visual behaviour | `assets/js/visuals/*` |
| Look & feel | `assets/css/main.css`, `assets/css/chapters.css` |

## Scroll & visual approach

The experience is closer to an **ABC News-style visual essay** than an endless sticky scrolly:

- Short hero camera zoom into the media ecosystem
- Each chapter pairs a **photo moment** and/or **infographic** with a short caption
- Interactive boards (NBI steps, eight-group stepper, transparency layers, scenarios) replace long sticky narratives
- Total scroll length is intentionally compressed so the story can be understood quickly without flooding readers with text

`assets/js/scroll-engine.js` still tracks chapter progress for the quiet nav and drives the hero zoom. Most other visuals activate on enter or via explicit controls (better for mobile and reduced-motion users).

## Analytical integrity

Labels used throughout:

- **FACT** — sourced legal / institutional claims
- **POLICY** — design of the enacted framework
- **OUR ANALYSIS** — group interpretation
- **OUR PROPOSAL** — voluntary intervention pitched to News Corp
- **SCENARIO** — hypothetical pathway, not a prediction
- **ILLUSTRATIVE MODEL** — conceptual visualisation only

Enacted NMI figures used on the site (verify in `data/sources.json`):

- Charge rate **2.75%** (News Media Bargaining Charge Act 2026)
- Threshold **more than $250 million** relevant Australian digital advertising revenue
- Offset requires eligible expenditure with at least **8** news business corporate groups
- Single-group contribution capped at **25%** of the NMI offset

## Licence / use

Produced for university assessment (SMBA6005). Prefer primary sources when updating claims.

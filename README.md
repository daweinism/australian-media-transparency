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
  index.html                 Full scrollytelling experience
  README.md
  assets/
    css/                     Design system + chapter visuals
    js/                      Scroll engine, sources, visuals
  data/
    sources.json             Auditable citations
    timeline.json            2020–2026 context
    nbi.json                 Enacted NMI design figures
    ecosystem.json           Diversity categories (conceptual)
    interviews.json          Interview metadata (placeholders)
    scenarios.json           Hypothetical pathways
  media/
    interviews/              Drop audio / video here
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

## How to insert interviews

1. Add files to `media/interviews/` (e.g. `mda.mp3`, `mda.mp4`, `mda.txt`)
2. Edit `data/interviews.json`:

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

Native `<audio controls>` and `<video controls>` are used. Optional YouTube/Vimeo embeds are supported via `embed`, but local files are preferred. Do **not** fabricate quotes.

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

## Scroll engine

`assets/js/scroll-engine.js` provides:

1. **Chapter observer** — updates the quiet progress nav
2. **Step observer** — activates sticky-scene narrative steps and drives visual state changes
3. **Progress loop** — measures sticky section progress for continuous camera moments (hero, finale)

Major visuals use sticky stages + scrolling steps. On small screens, sticky durations are shortened via CSS. `prefers-reduced-motion: reduce` disables parallax, particle travel and continuous camera scaling while preserving content.

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

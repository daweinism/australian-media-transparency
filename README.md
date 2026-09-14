# Who Gets to Tell Australia's Story?

A **visual-first** interactive documentary on Australian media diversity, the 2026 News Bargaining Incentive (NBI / NMI), transparency and accountability.

Supplementary material for an SMBA6005 group pitch — not a transcript of the presentation.

**Live:** https://daweinism.github.io/australian-media-transparency/

## Design principle

Fewer words. More visual storytelling.

- Primary screen copy: roughly 1–7 words
- Supporting lines: roughly 5–12 words
- Longer explanation lives behind **Detail** controls and the source drawer
- Scroll acts as a camera through a continuous visual sequence

## Technology

Static HTML / CSS / vanilla ES modules on **GitHub Pages**. No backend, database, or paid APIs.

Technical hosting notes belong here — not on the public site.

## Local development

```bash
python -m http.server 8080
```

Open http://localhost:8080

## Key enacted NMI figures (verified)

From primary legislation (see `data/sources.json` and `data/nbi.json`):

| Item | Value |
| --- | --- |
| Charge rate | **2.75%** (News Media Bargaining Charge Act 2026 s 3) |
| Threshold | **$250M+** relevant Australian digital advertising revenue |
| Offset groups | **≥ 8** news business corporate groups |
| Single-group cap | **25%** of the NMI offset |

Note: Some earlier public materials referred to **2.5%**. The **enacted** Act sets **2.75%**. The site follows the Federal Register text.

## Interviews

`data/interviews.json`:

- Leave `status: "pending"` → elegant field placeholder (no fake quotes)
- Set `status: "ready"` + media paths → audio / video / transcript players appear

Media files go in `media/interviews/`.

## Sources

Edit `data/sources.json`. In the page, use:

```html
<span data-sources="source-nbi-01"></span>
```

## Structure

```
index.html
assets/css/   design + act visuals
assets/js/    scroll camera + sources
assets/img/   editorial stills
data/         JSON content + citations
media/interviews/
.github/workflows/deploy.yml
```

## Accessibility

Semantic structure, keyboard drawer, focus states, and `prefers-reduced-motion` (major camera motion reduced; content retained).

# Who Gets to Tell Australia's Story?

A visual-first interactive explainer on Australian media diversity, the 2026 News Bargaining Incentive (NBI), transparency and accountability.

Live: https://daweinism.github.io/australian-media-transparency/

## Design principle

Every visual must say something. The default scroll experience explains itself — no click is ever required to understand the main story.

- One dominant visual per screen, one short headline, one short supporting phrase
- Interaction (`More`, source markers) adds legal/technical depth only
- Concrete metaphors: newspaper cards, platform blocks, money pipeline, a black box that opens
- 16 sticky acts, comfortably scrollable in 2–4 minutes

## Chapters

1. Orientation — who tells Australia's story (Australia → news → platforms → money)
2. Many voices — what media diversity means
3. Resources — large organisation vs small newsroom (illustrative)
4. 2021 — the bargaining code, deals, and a platform stepping back
5. 2026 — the News Bargaining Incentive
6. How it works — platform → ad revenue → threshold → charge → news spending
7. The charge — 2.75%
8. The threshold — $250M+
9. Two paths — pay news, or pay the charge
10. 8+ news business groups
11. The 25% single-group cap
12. Follow the money
13. Scale ≠ diversity (our analysis)
14. Transparency — the black box opens
15. Our proposal — disclose, verify, report, widen
16. Return + evidence

## Verified figures

| Item | Value | Source |
| --- | --- | --- |
| Charge rate | **2.75%** | News Media Bargaining Charge Act 2026, s 3(2): "The rate of charge is 2.75%." |
| Revenue threshold | **$250M+** relevant Australian digital advertising revenue | News Media Bargaining (Administration) Act 2026 |
| Minimum news business groups | **8** | News Media Bargaining (Administration) Act 2026; Bills Digest |
| Single-group cap | **25%** | News Media Bargaining (Administration) Act 2026; Bills Digest |

**On 2.5% vs 2.75%:** earlier public materials and the original policy design used 2.5%. The rate was increased before passage and the **enacted** Act sets **2.75%**. The site displays 2.75% and states the 2.5% history on screen, in line with the rule to follow verified primary legislation rather than earlier drafts.

## Data integrity

No fabricated statistics, quotes, deal terms, funding amounts or market shares. Conceptual diagrams (the resource comparison, the diversity split) are labelled **Illustrative**.

## Interviews

The expert interview section has been removed from the main narrative pending real audio/video. `data/interviews.json` is retained so a chapter can be re-added later: add a new `<section class="act">` in `index.html` and register an init function in the `map` array in `assets/js/main.js`.

## Technical

- Static HTML, CSS, JavaScript (ES modules) and inline SVG. No build step, no framework, no backend, no paid services.
- `assets/js/scroll-engine.js` reports 0–1 scroll progress per sticky act via `requestAnimationFrame`; each act's init function returns a progress handler.
- `assets/js/sources.js` renders numbered source markers and the detail drawer from `data/sources.json`.
- All asset paths are relative so the site works from the GitHub Pages sub-path.
- `prefers-reduced-motion: reduce` quantises progress so the sequence still advances without continuous motion.

Local preview:

```bash
python -m http.server 8000
```

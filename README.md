# Who Gets to Tell Australia's Story?

A visual explainer on Australian media diversity, the 2026 News Bargaining Incentive (NBI), transparency and accountability.

Live: https://daweinism.github.io/australian-media-transparency/

## Design principle

Every visual answers what you are looking at, what it means, and why it matters, without requiring a click.

- One dominant visual per screen
- Short plain-English explanation on the screen itself
- One important number or relationship
- Detail panels add depth only
- Scroll teaches; clicks deepen

## Chapters (about 2 to 4 minutes)

1. Start: Australian news, diversity, 2026 NBI, transparency
2. Diversity: one voice to many kinds of newsroom
3. Resources: large team and small team; who can keep reporting?
4. 2021 to 2026: bargaining code, deals, exit risk, News Bargaining Incentive
5. How it works: $250M+ threshold, 2.75% charge, spend on news or pay
6. 8+ groups: support must span multiple news business groups
7. 25% cap: one group maximum; others fill the rest
8. The money: platform to charge/spending to scheme to newsrooms to public
9. Scale and diversity: our analysis
10. Transparency to proposal: black box opens; disclose, review, report, widen
11. End: return to the opening question and evidence

## Verified figures

| Item | Value | Source |
| --- | --- | --- |
| Charge rate | **2.75%** | News Media Bargaining Charge Act 2026, s 3(2) |
| Revenue threshold | **$250M+** relevant Australian digital advertising revenue | News Media Bargaining (Administration) Act 2026 |
| Minimum news business groups | **8** | Administration Act; Bills Digest |
| Single-group cap | **25%** | Administration Act; Bills Digest |

On 2.5% vs 2.75%: earlier public materials used 2.5%. The enacted Act sets 2.75%. The site displays 2.75% and states the history on screen.

## Interviews

Removed from the main narrative pending real audio/video. `data/interviews.json` is retained. To re-add: insert a new `<section class="act">` in `index.html` and register an init function in `assets/js/main.js`.

## Technical

Static HTML / CSS / JS (ES modules) / SVG. No build step, no backend, no paid services. Relative paths for GitHub Pages sub-path hosting. Images are compressed local JPEGs with editorial overlays.

```bash
python -m http.server 8000
```

# The Talking Mine — Handoff Document
**Last updated:** 2026-05-24  
**Live URL:** https://talking-mine.vercel.app  
**Vercel project:** `markus-s-projects-4132dcff/talking-mine`

---

## What This Is

A pitch deck for **Mark Wexler** to present to **Doug Cole (CEO)** and **Alberto Rosende (Strategy)** at **M2i Global**. Mark is the presenter — his role is strategic/creative lead, not salesperson. The goal is to get M2i to fund a Hawthorne Army Depot pilot through their existing relationship.

The product being pitched is **The Talking Mine** — an AI-powered mine persona built by Terra Mater Studios that gives a mine a real-time voice: investor Q&A, DoD compliance packets, Senate briefing drafts, provenance ledgers.

---

## The Narrative Spine

**Hook (Slide 02):**  
> "You're about to ring the bell on NYSE American. The question is what story they'll find when they do."

**Three Arguments (Slide 05):**  
1. **Execution Proof** — We built this for ESA (HERA spacecraft, 11M km away). If it works there, it works underground.  
2. **The Uplisting Narrative** — When investors Google M2i next quarter, they need a story, not just a stock price.  
3. **Force Multiplier** — Al manages communications for the whole portfolio without adding headcount. Build once at Hawthorne, roll across every mine.

**The Ask (Slide 08):**  
- $220K fixed fee · 90-day pilot · Hawthorne Army Depot · Q3 2026 launch

---

## Strategic Constraints (Do Not Violate)

| Constraint | Reason |
|---|---|
| Hawthorne TUA status: **not confirmed** | Status was unknown at time of build — say "pilot slot open," not "confirmed" |
| Volato merger: **not closed** | Don't reference it as done |
| Mark is **not the salesperson** | He's the strategic/creative lead bringing the concept. Doug/Al are the decision-makers. |
| Goal is NOT to sell to Mark | M2i should fund from their side |

---

## File Structure

```
talking-mine/
├── index.html          # Complete 8-slide deck (567 lines)
├── styles.css          # Global deck styles
├── chat.css            # Chat component styles (v=16)
├── chat.js             # Chat personas + conversation scripts (v=16)
├── provenance-map.js   # SVG Pacific route map for slide 4 (v=16)
├── telemetry.js        # Live-ticking sensor data
├── tokens.js           # Design token variables
├── deck-stage.js       # <deck-stage> custom web component (1920×1080)
├── tweaks-panel.jsx    # React-based presenter controls
├── vercel.json         # Routing config for static deploy
├── assets/
│   ├── rocket-launch.png          # Slide 05, Card I (HERA launch)
│   ├── google-research.png        # Slide 05, Card II (investor googling)
│   ├── mining-network.png         # Slide 05, Card III (mine map)
│   ├── m2i-investor.png           # Fallback for Card II
│   ├── hero-fatherson-dashboards.png  # Slides 01, 08 background
│   ├── before-after-split.png     # Slide 02 background (subtle)
│   ├── water-clarifier-hud.png    # Slide 07 right-side visual
│   ├── hero-mine-overlook.png     # Fallback for Card III
│   ├── hera-crew.png              # Available, not currently used
│   ├── hera-01.jpg                # Available, not currently used
│   ├── hera-asteroid.png          # Available, not currently used
│   ├── hand-phone-dashboard.png   # Available, not currently used
│   └── before-after-split.png     # Available
```

---

## Slide-by-Slide Summary

| Slide | Label | Core Content |
|---|---|---|
| 01 | Cover | "What if a mine could talk?" · Presented to Doug Cole & Alberto Rosende, M2i Global |
| 02 | The Moment | NYSE bell hook · Three facts: The Asset / The Problem / The Window |
| 03 | Live Demo | Animated chat: Doug + Al × Hawthorne CMR · DoD inventory, Senate briefing, investor one-liner |
| 04 | Provenance | Molecular tracer + blockchain ledger · Pacific route map (Australia → Hawthorne) · Batch 4F2A-9C13 |
| 05 | Three Arguments | Three columns: Execution Proof / Uplisting Narrative / Force Multiplier + images |
| 06 | The Pilot | $220K = $160K platform + $60K ops · 90 days · Hawthorne · "the rollout is the product" |
| 07 | Why Now | "The mine that answers is the mine that gets covered" · ESA/NASA proof anchor |
| 08 | The Ask | "Hawthorne pilot." at 152px · $220K · 90 days · Q3 launch · Markus contact |

---

## Chat Scripts (chat.js)

### Slide 03 — Live Demo (mode: 'live')
**Personas:** Doug Cole (CEO), Alberto Rosende (Strategy), Hawthorne CMR (AI mine)

| Speaker | Message |
|---|---|
| Doug | What's our DoD-compliant inventory at Hawthorne right now? |
| Mine | 847 tonnes · all certifications current · DoD audit 72h ago |
| Al | I need a Senate briefing packet — Armed Services subcommittee. How fast? |
| Mine | Draft ready. 4 pages: stockpile, provenance chain, allied supply chain diagram, China-dependency comparison. 90-day trajectory. Sending now. |
| Doug | Anything the Army inspector might flag on Tuesday? |
| Mine | Two items: Batch 7C-Bravo tracer unverified by receiving lab (reminder sent) · Q1 environmental compliance due Friday (draft ready for Al). |
| Al | Give me one sentence for the investor call at three. |
| Mine | "Hawthorne CMR holds verified critical mineral inventory in an allied supply chain — traceable from extraction, auditable by DoD, zero dependence on adversarial sources." |

### Slide 04 — Provenance (mode: 'provenance')
**Topic:** Batch 4F2A-9C13 · 2,180 tonnes · molecular tracer + blockchain

Full chain: Allied Extraction → Darwin → Pacific Transit → US Defense Industrial Base  
Active leg: Pacific Transit (shown as pulsing red dot on route map)

---

## Key Architecture Details

**Rendering:** Static HTML/CSS/JS. No build step. No framework. Fonts loaded from Google Fonts (Fraunces serif, Inter Tight, JetBrains Mono).

**Slide container:** `<deck-stage width="1920" height="1080">` — custom web component that scales to viewport, maintaining aspect ratio.

**Cache busting:** All JS/CSS imports use `?v=16` query string. Increment this when deploying changes to cached files.

**Chat autoplay:** Slides 3 and 4 auto-replay when navigated to via `message` event listener watching for `slideIndexChanged`.

**Tweaks panel:** React-based presenter control (bottom-right corner). Lets presenter adjust: typing speed (slow/normal/fast), telemetry panel visibility, mine name, replay buttons.

**Telemetry panel (Slide 03):** Tiles showing waterClarity, pH, dissolved Fe, CO₂, storage (MWh), hectares, trout count, conversations, local hires, uptime. All tick via `mine-tick` events from `telemetry.js`.

---

## Deploying Changes

```bash
# From the talking-mine/ directory:
vercel --prod --yes
```

Vercel project is already linked. No build step needed — it's a static deploy. Full upload takes ~10s.

Note: Vercel CLI is outdated (50.44.0). Upgrade with `npm i -g vercel@latest` for best compatibility.

---

## Open Questions / Next Steps

- **Hawthorne TUA confirmation** — once status is known, Slide 08's "pilot slot open" language may need tightening
- **Slide 05, Card I image** — currently `rocket-launch.png` (ChatGPT-generated). Could be upgraded to an actual HERA or ESA launch photo if rights are secured
- **Speaker notes** — already embedded in `index.html` as JSON (see `<script id="speaker-notes">`). One note per slide, covering the full arc. Not currently displayed in-browser.
- **Mobile / tablet view** — deck is fixed at 1920px viewport width; designed for laptop/display presentation, not mobile

---

## Contact

**Presenter:** Markus Mooslechner · Director, Innovation & Content · Terra Mater Studios  
**Email:** markus.mooslechner@terramater.com  
**Audience:** Doug Cole (CEO, M2i Global) · Alberto Rosende (Strategy, M2i Global)

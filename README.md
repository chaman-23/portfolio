# Chaman Kumar Singh — Portfolio

Interactive portfolio for a Business Analyst / Data Analyst. Live at **https://portfolio-five-sable-46.vercel.app**

A static site (HTML, CSS and vanilla JavaScript, no build step and no runtime dependencies). Every major section has an interaction tied to real work:

| Section | Interaction | Data |
|---|---|---|
| Hero | Layered SVG analyst at a laptop: typing, blinking, breathing, screen glow, pointer parallax, floating KPI panels | Payroll trend and churn figures from the projects |
| AI BI & RCA Engine | RCA explorer (KPI → anomaly → dimension → evidence → root cause → recommendations) and a data-pipeline diagram with flowing packets | Illustrative sample numbers, labelled as such |
| Workforce & Payroll | Mini HR dashboard with department/period filters, KPI cards, trend tooltips, clickable department bars | Computed from the project's MySQL dump (simulated HR data) |
| Customer Churn | SQL → results → chart workstation with three analyses | Precomputed from `tele_data.csv` (7,043 rows); not a live database |
| Experience | Scroll-progress timeline, IHRO stage explorer, AS-IS / TO-BE toggle, SmartHomie journey | Verified experience; workflow diagram labelled illustrative |
| Method | Scroll-driven six-stage story using the churn project | Real project steps; outcome stage states it wasn't measured |
| Skills | Capability map linking tools to projects | — |

Accessibility: keyboard-operable tabs (arrow keys), visible focus, ARIA live regions, `prefers-reduced-motion` support, no horizontal overflow from 360px up.

## Structure

```
index.html        content and markup
styles.css        design tokens, themes, layout, motion
js/data.js        real project data (workforce + churn)
js/core.js        shared helpers, theme, nav, menu, counters
js/hero.js        hero sparkline, parallax, mobile crop
js/experience.js  timeline, stage explorer, AS-IS/TO-BE, journey
js/projects.js    RCA explorer, pipeline, dashboard, SQL workstation
js/sections.js    method story, capability map, contact network
fonts/            self-hosted Fraunces, IBM Plex Sans, IBM Plex Mono
resume/           Chaman_Singh_Resume.pdf
```

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push to `main`; Vercel serves the folder as a static site with no build settings.

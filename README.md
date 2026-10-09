# Chaman Kumar Singh — Portfolio

Personal portfolio for a Data Analyst / Business Analyst. Live at **https://portfolio-five-sable-46.vercel.app**

A static site (HTML, CSS and vanilla JavaScript, no build step), designed as an analyst's report:

- **Hero:** a SQL query types itself, runs, and draws the real result from the [churn project](https://github.com/chaman-23/churn-prediction) (churn rate by contract type).
- **Selected work:** case studies with diagrams that draw as you scroll.
- **Experience timeline, skills, education** and a one-page resume download.
- Light and dark themes, keyboard accessible, and respects `prefers-reduced-motion`.
- Self-hosted fonts: Fraunces, IBM Plex Sans and IBM Plex Mono.

## Structure

```
index.html      page content
styles.css      design tokens, layout and themes
main.js         hero animation, scroll-drawn diagrams, theme toggle, menu
fonts/          self-hosted woff2 files
resume/         Chaman_Singh_Resume.pdf
og-image.png    social preview image
```

## Run locally

```bash
python -m http.server 8000
# open http://localhost:8000
```

## Deploy

Push to `main`; Vercel serves the folder as a static site with no build settings.

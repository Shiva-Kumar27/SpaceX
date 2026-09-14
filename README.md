# SpaceX

A small, minimalist site exploring three extreme objects general relativity allows: **black holes**, **white holes**, and **wormholes**.

Built as a design/frontend exercise — pure HTML, CSS, and JS, no frameworks, no build step.

## Live pages

| Route | File |
|---|---|
| Home | `index.html` |
| Blackholes | `blackholes.html` |
| White holes | `whiteholes.html` |
| Wormholes | `wormholes.html` |

## Stack

- HTML5
- CSS3 (custom properties, no framework)
- Vanilla JS (`IntersectionObserver` for scroll reveals, active-nav state)
- Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) (headings) + [Inter](https://fonts.google.com/specimen/Inter) (body), via Google Fonts

## Design

- Dark graphite base, one soft pastel accent per page (lavender / cream / pink-mint)
- Medium-rounded surfaces, no hard edges
- One orchestrated motion per page (glowing orb) instead of scattered hover effects
- Respects `prefers-reduced-motion`

## Structure

```
spacex/
├── index.html
├── blackholes.html
├── whiteholes.html
├── wormholes.html
├── style.css
└── script.js
```

## Run locally

Just open `index.html` in a browser — no server required.

## Roadmap

- [ ] Backend integration
- [ ] Deploy via GitHub Pages

## License

Personal project — no license applied.

# Content Strategy Library

A free, practical reference for the frameworks content strategists actually use — what each
tool is, when to reach for it, and how the tools connect. Built from a Claude Design handoff.

32 tools across 8 categories, a 3-question tool recommender, a submit-a-tool form, an About
page, and an FAQ.

## Running it

It's a static site with no build step. Serve the folder with any static server:

```bash
npx serve .
# or
python -m http.server 8000
```

Then open the printed URL. (Opening `index.html` directly via `file://` also works, since
there are no module imports.)

## Structure

```
index.html        Entry point — loads the styles and scripts
css/
  styles.css      Design tokens (color, type, spacing, effects) + all component styles
js/
  data.js         The 32 tools, FAQ content, and recommender scoring config
  icons.js        Inline SVG tool icons + the 10 detail-page diagrams
  app.js          Hash router + view rendering + interactions
```

## How it works

- **Routing** is hash-based, so every tool has a shareable URL (`#/tool/<id>`) and the
  views — `#/`, `#/recommend`, `#/submit`, `#/about`, `#/faq` — are all linkable.
- **No dependencies.** Views are rendered as HTML strings into `#app`; interactions use
  event delegation on `data-action` attributes. The submit form tracks input without
  re-rendering so focus is preserved.
- **Keyboard:** on a tool page, ← / → move to the previous / next tool.
- The **Submit a tool** form opens the visitor's email client with the details pre-filled
  (`mailto:`), matching the original design.

## Design system

Warm-neutral "ink" palette with a single highlighter-yellow accent (`#F7C531`), set in
Plus Jakarta Sans. All tokens live at the top of `css/styles.css` as CSS custom properties.

Credit: Created by [Tommy Stubblefield](https://stubblefield.info). Library icon by
Soetarman Atmodjo from The Noun Project. All content may be freely duplicated; attribution
to the linked original sources is preferred.

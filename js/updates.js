/* ============================================================
   Content Strategy Library, updates feed + Best of 2026
   ------------------------------------------------------------
   Ported verbatim from the October 2026 design handoff. The
   explainer-videos post is deliberately not included.
   ============================================================ */

window.UPDATES = [
  {
    "slug": "best-of-2026",
    "date": "2026-09-28",
    "title": "Introducing Best of 2026",
    "hero": "/images/best-of-2026-badge.svg",
    "heroVideo": "/images/best-of-2026-hero.mp4",
    "body": [
      "This year the Content Strategy Library starts recognizing the resources, tools, and people that moved content strategy forward. Best of 2026 covers frameworks, books, newsletters, podcasts, training, templates, and the practitioners and teams doing the work.",
      "Honorees will be listed on the Best of 2026 page as they are announced. Each one receives a badge to display on their own site, linking back to the category they were recognized in.",
      "If you know something that belongs on the list, suggest it through the submission form."
    ],
    "cta": {
      "label": "See the categories",
      "href": "/best-of-2026/"
    }
  },
  {
    "slug": "web-version",
    "date": "2026-09-21",
    "title": "Share your plan as a web page",
    "hero": "/images/updates/web-version-hero.svg",
    "heroVideo": null,
    "body": [
      "The Workspace and the Tool Recommender can now produce a web version of your plan alongside the PDF and PowerPoint. It is a link that opens your selected tools, your name, your accent color, and your success statement as a page anyone can read.",
      "Everything in the web version is written into the link itself. Nothing is saved on the library’s servers, and the part of the link that holds your plan is never sent to them. Logos stay out of the web version and only appear in the downloads, which never leave your device.",
      "Anyone who opens the link can copy the plan into their own Workspace and change it from there."
    ],
    "cta": {
      "label": "Open the Workspace",
      "href": "/workspace/"
    }
  },
  {
    "slug": "tool-pages-rebuilt",
    "date": "2026-09-14",
    "title": "Tool pages, rebuilt",
    "hero": null,
    "heroVideo": null,
    "body": [
      "Every tool page now follows the same structure. Section headers are phrased as the questions people actually ask, like what a tool is and when to use it, and a contents card lets you jump to any section or copy a link to it.",
      "Templates, sharing, embedding, and citation now sit in four collapsible sections at the bottom of each page, so the explanation comes first. Notion and Miro versions of the templates are on the way; you can sign up to hear when they are ready."
    ],
    "cta": {
      "label": "Browse the tools",
      "href": "/"
    }
  }
];

/* Best of 2026 categories. Honorees are announced later; the page ships
   with every row in its "to be announced" state. */
window.AWARD_CATEGORIES = [
  {
    "name": "Framework of the year",
    "desc": "A model or method that changed how teams plan, make, or measure content."
  },
  {
    "name": "Book",
    "desc": "A book that practitioners kept reaching for this year."
  },
  {
    "name": "Newsletter",
    "desc": "A regular read that made the practice sharper."
  },
  {
    "name": "Podcast",
    "desc": "A show worth the commute for anyone working in content."
  },
  {
    "name": "Course or training",
    "desc": "Teaching that turned people into better strategists."
  },
  {
    "name": "Template or toolkit",
    "desc": "A free resource that saved teams real time."
  },
  {
    "name": "Content team",
    "desc": "A team whose program set an example for everyone else."
  }
];

window.AWARD_INFLUENCERS = [
  {
    "name": "Lifetime contribution",
    "desc": "Someone whose work over many years shaped how the field thinks and works."
  },
  {
    "name": "Educator",
    "desc": "Someone who taught content strategy to more people this year, through courses, books, or talks."
  },
  {
    "name": "Rising voice",
    "desc": "A newer voice whose ideas are already changing the conversation."
  },
  {
    "name": "Bridge builder",
    "desc": "Someone who brought content strategy into UX, product, marketing, or the executive suite."
  },
  {
    "name": "Community builder",
    "desc": "Someone who created spaces where practitioners learn from each other."
  }
];

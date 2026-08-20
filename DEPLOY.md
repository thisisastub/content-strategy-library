# Deploying the Content Strategy Library

Hosted on **GitHub Pages** (repo `thisisastub/content-strategy-library`, branch `main`, root),
domain **contentstrategylibrary.com** at **GoDaddy**, form handled by **Web3Forms**.

The site is still plain static files — but there is now a **build step** that prerenders a
crawlable HTML page for every tool, category, and term (for SEO and AI/answer-engine crawlers).
`js/data.js` is the single source of truth; `build.js` generates everything else.

## ⚠️ The one rule: rebuild before you commit content changes

The prerendered pages under `tools/`, `categories/`, `terminology/`, etc. are **committed files**.
If you edit `js/data.js` (or any content) they do **not** update until you re-run the build.

```bash
node build.js --home
```

That regenerates every static page **and** the prerendered homepage (`index.html`), plus
`sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, and `404.html`. Then commit + push:

```bash
node build.js --home
git add -A
git commit -m "Update content"
git push origin main
```

Pushing to `main` triggers the GitHub Pages deploy automatically (live in ~1–3 minutes).

- `node build.js` alone builds everything **except** the homepage (writes a preview to
  `_prerender-preview/home.html` instead). Use `--home` when you actually want to publish.
- `npm run build` = `node build.js`; `npm run build:home` = `node build.js --home`.
- Requires Node.js. No dependencies to install — standard library only.

## What lives in the repo

Committed (the live site):
- `index.html` (prerendered homepage that hydrates into the app)
- `css/`, `js/`
- Generated pages: `tools/`, `categories/`, `terminology/`, `faq/`, `about/`,
  `recommend/`, `submit/`, `workspace/`, `404.html`
- Crawl files: `sitemap.xml`, `robots.txt`, `llms.txt`, `llms-full.txt`, `.nojekyll`
- `build.js`, `package.json`, `CNAME` (required for the custom domain)

Gitignored (local only, never published): `content-pipeline/`, `_handoff/`, `_design-import/`,
`_prerender-preview/`, `.claude/`, `*.bak`.

## After a content deploy: ping the crawlers

New/changed pages get found faster if you resubmit the sitemap in
**Google Search Console → Sitemaps** (`https://contentstrategylibrary.com/sitemap.xml`).
See the "Search Console" steps below (one-time setup, then just resubmit).

## GitHub Pages (already set up)
Settings → Pages → Source: **Deploy from a branch** → Branch **main**, folder **/ (root)**.
Custom domain `contentstrategylibrary.com`, **Enforce HTTPS** on. The `CNAME` file keeps this.

## GoDaddy DNS (contentstrategylibrary.com)
In GoDaddy → your domain → **DNS / Manage DNS**:

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | 185.199.108.153          |
| A     | @    | 185.199.109.153          |
| A     | @    | 185.199.110.153          |
| A     | @    | 185.199.111.153          |
| CNAME | www  | `thisisastub.github.io`  |

## The form
The "Submit a Tool" form posts to Web3Forms (`WEB3FORMS_ACCESS_KEY` in `js/app.js`).
Send one real test submission after a deploy and check your inbox (and spam the first time).

## Google Search Console (one-time, then resubmit after big content changes)
1. Go to **search.google.com/search-console** and sign in with your Google account.
2. Add a property → **URL prefix** → `https://contentstrategylibrary.com` → Continue.
3. Verify ownership. Easiest here: the **HTML tag** method — Search Console gives you a
   `<meta name="google-site-verification" content="…">` tag. Two ways to add it:
   - Ask the coding agent to drop it into the `<head>` of every page (it goes in `build.js`'s
     `head()` function, then rebuild) — or
   - Add it once to `index.html`'s `<head>` and use the **domain** DNS method instead (a TXT
     record at GoDaddy) if you'd rather not touch the build.
4. Once verified: **Sitemaps** (left nav) → enter `sitemap.xml` → Submit.
5. Optionally use **URL Inspection** on a few tool URLs → "Request indexing" to nudge the
   first crawl.

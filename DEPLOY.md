# Deploying the Content Strategy Library

Static site, no build step. Hosted on **GitHub Pages**, domain **contentstrategylibrary.com** at
**GoDaddy**, form handled by **Web3Forms**.

## What to upload to the repo (the whole site is just these)
- `index.html`
- `css/` (folder)
- `js/` (folder)
- `CNAME` (already in this folder — required for the custom domain)

You can skip `_handoff/`, `content-pipeline/`, `.claude/`, `desktop.ini`, and this file — they're
project working files, not part of the live site.

## GitHub Pages
1. Create a GitHub account (github.com) if you don't have one.
2. Create a **new public repository** (any name, e.g. `content-strategy-library`).
3. Upload the files listed above (drag-and-drop in the browser works).
4. Repo **Settings → Pages** → "Build and deployment" → Source: **Deploy from a branch** →
   Branch: **main**, folder: **/ (root)** → Save.
5. Still on the Pages screen, under **Custom domain**, enter `contentstrategylibrary.com` → Save.
   (GitHub re-adds/keeps the `CNAME` file automatically.)
6. Wait for the DNS check to pass, then tick **Enforce HTTPS**.

## GoDaddy DNS (contentstrategylibrary.com)
In GoDaddy → your domain → **DNS / Manage DNS**, set:

| Type  | Name | Value                         |
|-------|------|-------------------------------|
| A     | @    | 185.199.108.153               |
| A     | @    | 185.199.109.153               |
| A     | @    | 185.199.110.153               |
| A     | @    | 185.199.111.153               |
| CNAME | www  | `YOUR-USERNAME.github.io`      |

(Replace `YOUR-USERNAME` with your GitHub username. Delete GoDaddy's default parked/forwarding
A record for `@` first.) DNS can take 15 minutes to a few hours; HTTPS is issued automatically.

## The form
The "Submit a Tool" form posts to Web3Forms (key in `js/app.js`, `WEB3FORMS_ACCESS_KEY`).
Send one real test submission after go-live and check your inbox (and spam the first time).

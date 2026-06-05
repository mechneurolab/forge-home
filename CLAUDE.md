# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

The umbrella landing page for the **FORGE MRI suite**, served at `forge-mri.dev`. It is a
VitePress site that renders the top-level page, plus a Cloudflare Worker that proxies three
subpaths to the suite's separately-deployed subprojects:

| Path                  | Subproject               | Repo                       |
| --------------------- | ------------------------ | -------------------------- |
| `forge-mri.dev/`      | this landing page        | (this repo)                |
| `forge-mri.dev/forge` | FORGE (reconstruction)   | `mechneurolab/forge`       |
| `forge-mri.dev/studio`| FORGE Studio             | `mechneurolab/forge-studio`|
| `forge-mri.dev/sentinel` | Sentinel (MRE)        | `mechneurolab/sentinel`    |

The subprojects are **not** part of this repo. They have their own repos, CI, and deployments;
this repo only links to them and routes their subpaths.

## Commands

```bash
npm run dev      # VitePress dev server (landing page only — subpaths 404 here, see below)
npm run build    # Build static site to docs/.vitepress/dist
npm run preview  # Preview the built static site
npm run cf:dev   # Build, then run the full site under Wrangler (landing page + subpath proxy)
npm run deploy   # Build + deploy the Worker to Cloudflare (needs Cloudflare auth)
npx wrangler deploy --dry-run   # Validate worker/wrangler config without deploying
```

There is no separate test/lint suite; `npm run build` is the gate (it fails on broken links and
bad config).

## Architecture

Two pieces deploy together as a single Cloudflare Worker:

1. **Landing page** — VitePress in `docs/`. Source of truth for content is `docs/index.md`
   (the home hero + the three project feature cards) and `docs/.vitepress/config.ts` (nav,
   social links, footer). Brand colors live in `docs/.vitepress/theme/custom.css` as overrides
   of VitePress's CSS variables. Build output goes to `docs/.vitepress/dist`.

2. **Router** — `worker/index.ts`. The Worker serves the built site as static assets
   (the `ASSETS` binding) for most requests, and reverse-proxies `/forge`, `/studio`,
   `/sentinel` to the origins configured in `wrangler.toml` (`[vars]`). Routing is keyed on the
   first path segment in `ROUTES`. If a subproject's origin is **empty**, the Worker serves a
   built-in "coming soon" page instead of proxying — so a subproject is switched on by setting
   its origin in `wrangler.toml`, with no code change. `STUDIO_ORIGIN` is set
   (`forge-studio-80p.pages.dev`), so `/studio` serves live docs; `/forge` and `/sentinel` are
   still empty and show the coming-soon page.

### The subpath base-path contract (important)

Each subproject is built with its base set to the subpath — VitePress `base: '/studio/'` (or
`/forge/`, `/sentinel/`), or the equivalent for a Documenter.jl (Julia) subproject — and deployed
at its **own origin root**. The Worker **strips** the `/<name>` prefix before proxying, so the
origin receives root-relative paths while the browser still sees `/<name>/...` and the build's
absolute asset URLs (`/studio/assets/...`) resolve back through the Worker. A subproject built
with `base: '/'` will not work — its assets point at the domain root and miss the subpath.

### Why subpaths 404 under `npm run dev`

`vitepress dev` only knows about pages in `docs/`. The `/forge`, `/studio`, `/sentinel` routes
exist only at the Worker layer, so they resolve under `npm run cf:dev`, `wrangler dev`, and in
production — but not under plain `vitepress dev`. This is expected, not a bug.

## Deploying

CI is in `.github/workflows/ci.yml`: every push/PR builds; PRs upload a Worker preview version
(unique URL); pushes to `main` deploy. Both deploy steps need repo secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` (both set). The apex domain `forge-mri.dev` is
bound to the Worker via the `routes` (`custom_domain`) entry in `wrangler.toml`.

## Switching a subproject on

1. Build/deploy the subproject with VitePress `base: '/<name>/'`, deployed at its own root (the
   Worker strips the prefix). `/studio` is the working example — see `mechneurolab/forge-studio`
   `docs/.vitepress/config.ts`.
2. Set its origin in `wrangler.toml` `[vars]` to the deployment URL (e.g.
   `STUDIO_ORIGIN = "https://forge-studio-80p.pages.dev"`).
3. Deploy this Worker. The "coming soon" page is replaced by the proxied docs.

## Editing notes

- Adding/renaming a subproject is a **two-place** change: add a route in `worker/index.ts`
  (`ROUTES` + the `Env` origin var) and its origin in `wrangler.toml` `[vars]`, then add the
  feature card in `docs/index.md` and nav entry in `config.ts`.
- When lighting up a subproject whose docs include internal `docs/superpowers/**` planning files
  (both `forge` and `forge-studio` have them), exclude those via VitePress `srcExclude` — they
  contain tag-like text that breaks the build. `forge-studio` already does this.

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
| `forge-mri.dev/sentinel` | Sentinel (MRE)        | `mechneurolab/Sentinel.jl` |

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
   its origin in `wrangler.toml`, with no code change. As of this writing all three origins are
   empty (none of the subprojects are deployed under their prefix yet).

### The subpath base-path contract (important)

The Worker passes the path through **unchanged**, prefix included. So each subproject must serve
its docs *under its prefix*, not at root. For a VitePress subproject that means
`base: '/forge/'` (or `/studio/`, `/sentinel/`); for a Documenter.jl (Julia) subproject, deploy
under the same prefix. If a subproject is built with `base: '/'`, its absolute asset URLs
(`/assets/...`) will escape the subpath and hit this landing page instead — that's the symptom of
a misconfigured base.

### Why subpaths 404 under `npm run dev`

`vitepress dev` only knows about pages in `docs/`. The `/forge`, `/studio`, `/sentinel` routes
exist only at the Worker layer, so they resolve under `npm run cf:dev`, `wrangler dev`, and in
production — but not under plain `vitepress dev`. This is expected, not a bug.

## Deploying

CI is in `.github/workflows/ci.yml`: every push/PR builds; PRs upload a Worker preview version
(unique URL); pushes to `main` deploy. Both deploy steps need repo secrets
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The apex domain is bound in Cloudflare (and
can be pinned via the commented `routes` line in `wrangler.toml`).

## Switching a subproject on

1. Build/deploy the subproject with its `base` set to the matching prefix (e.g. VitePress
   `base: '/studio/'`).
2. Set its origin in `wrangler.toml` `[vars]` to the deployment URL (e.g.
   `STUDIO_ORIGIN = "https://forge-studio-80p.pages.dev"`).
3. Deploy this Worker. The "coming soon" page is replaced by the proxied docs.

## Editing notes

- Adding/renaming a subproject is a **two-place** change: add a route in `worker/index.ts`
  (`ROUTES` + the `Env` origin var) and its origin in `wrangler.toml` `[vars]`, then add the
  feature card in `docs/index.md` and nav entry in `config.ts`.
- The FORGE and Sentinel project-card descriptions in `docs/index.md` are placeholders marked
  with `# TODO` (Studio's is its real one-liner). The subprojects' repos are private.

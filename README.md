# forge-home

Umbrella landing page for the **FORGE MRI suite**, served at [forge-mri.dev](https://forge-mri.dev).

Built with [VitePress](https://vitepress.dev) and deployed as a [Cloudflare Worker](https://developers.cloudflare.com/workers/)
that serves this landing page at the root and reverse-proxies the suite's subprojects:

- `/forge` → [FORGE](https://github.com/mechneurolab/forge) — MRI reconstruction
- `/studio` → [FORGE Studio](https://github.com/mechneurolab/forge-studio)
- `/sentinel` → [Sentinel](https://github.com/mechneurolab/Sentinel.jl) — magnetic resonance elastography

## Develop

```bash
npm install
npm run dev       # landing page (subpaths are served by the Worker, not here)
npm run cf:dev    # full site under Wrangler, including subpath routing
npm run deploy    # build + deploy to Cloudflare
```

See [CLAUDE.md](./CLAUDE.md) for architecture and the subpath base-path contract.

From the Mechanical Neuroimaging Laboratory, University of Delaware.

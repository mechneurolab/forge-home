/**
 * Cloudflare Worker router for forge-mri.dev.
 *
 * Responsibilities:
 *   - Serve the VitePress landing page (static assets) at the root.
 *   - Reverse-proxy the suite subpaths to each subproject's own deployment:
 *       /forge/*    -> FORGE_ORIGIN
 *       /studio/*   -> STUDIO_ORIGIN
 *       /sentinel/* -> SENTINEL_ORIGIN
 *   - If a subproject's origin is not set yet, serve a "coming soon" page
 *     instead of proxying to nothing. Set the origin in wrangler.toml to switch
 *     the subproject on — no code change needed.
 *
 * The base-path contract: the prefix is passed through unchanged, so each
 * subproject MUST serve its docs UNDER that prefix. For a VitePress subproject:
 *     export default defineConfig({ base: '/forge/' })   // or /studio/, /sentinel/
 * Otherwise its absolute asset URLs (/assets/...) escape the subpath.
 */
interface Env {
  ASSETS: Fetcher
  FORGE_ORIGIN: string
  STUDIO_ORIGIN: string
  SENTINEL_ORIGIN: string
}

const ROUTES: Record<string, { origin: keyof Env; name: string }> = {
  forge: { origin: 'FORGE_ORIGIN', name: 'FORGE' },
  studio: { origin: 'STUDIO_ORIGIN', name: 'FORGE Studio' },
  sentinel: { origin: 'SENTINEL_ORIGIN', name: 'Sentinel' },
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    const segment = url.pathname.split('/')[1]
    const route = ROUTES[segment]

    if (route) {
      const origin = (env[route.origin] as string | undefined)?.trim()
      if (!origin) {
        return comingSoon(route.name)
      }
      const target = new URL(url.pathname + url.search, origin)
      // Preserve method, headers, and body; just swap the origin.
      return fetch(new Request(target, request))
    }

    // Everything else is the landing page.
    return env.ASSETS.fetch(request)
  },
}

function comingSoon(name: string): Response {
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${name} — coming soon</title>
<style>
  :root { color-scheme: light dark; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center;
         font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: #fff; color: #213547; }
  @media (prefers-color-scheme: dark) { body { background: #1b1b1f; color: #dfdfd6; } }
  main { text-align: center; padding: 2rem; }
  h1 { font-size: 2.5rem; font-weight: 700; color: #3451b2; margin: 0 0 .5rem; }
  p { font-size: 1.1rem; opacity: .8; margin: .25rem 0 1.5rem; }
  a { color: #3451b2; text-decoration: none; font-weight: 500; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>
<main>
  <h1>${name}</h1>
  <p>Documentation is coming soon.</p>
  <a href="/">&larr; Back to FORGE</a>
</main>
</body>
</html>`
  return new Response(html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}

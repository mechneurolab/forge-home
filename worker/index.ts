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
 * The base-path contract: each subproject is built with its base set to the
 * subpath — e.g. VitePress `base: '/studio/'` — and deployed at its own origin
 * ROOT. The Worker strips the `/studio` prefix before proxying, so the origin
 * receives root-relative paths, while the browser still sees `/studio/...` and
 * the build's absolute asset URLs (/studio/assets/...) resolve back through here.
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
      // Strip the /<segment> prefix: the origin serves the base-'/<segment>/'
      // build at its own root, so it expects root-relative paths.
      const rest = url.pathname.slice(segment.length + 1) || '/'
      const target = new URL(rest + url.search, origin)
      const resp = await fetch(new Request(target, request))

      // Inject the unified FORGE Suite banner into HTML pages only (not assets).
      const contentType = resp.headers.get('content-type') || ''
      if (!contentType.includes('text/html')) return resp
      const rewritten = new HTMLRewriter()
        .on('head', new HeadInjector(bannerCss(segment)))
        .on('body', new BodyInjector(bannerHtml(segment)))
        .transform(resp)
      // HTMLRewriter emits decompressed HTML — drop stale encoding/length headers.
      const headers = new Headers(rewritten.headers)
      headers.delete('content-encoding')
      headers.delete('content-length')
      return new Response(rewritten.body, {
        status: rewritten.status,
        statusText: rewritten.statusText,
        headers,
      })
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
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Never cache the placeholder — visitors must get the real docs the moment
      // the subproject's origin is set, without a stale cached "coming soon".
      'cache-control': 'no-store',
    },
  })
}

// ---- Unified FORGE Suite banner ----------------------------------------------
// Injected into every proxied subproject page so the three docs sites share one
// cross-suite bar. Centralized here — no changes needed in the subproject repos.

const BANNER_H = 36

function bannerHtml(segment: string): string {
  // target="_self" forces a real page load — without it VitePress (studio/sentinel)
  // hijacks the same-origin click and tries to SPA-route to a non-existent page.
  const tab = (seg: string, label: string) =>
    `<a href="/${seg}/" target="_self"${seg === segment ? ' class="active"' : ''}>${label}</a>`
  return (
    `<div id="fsb">` +
    `<a class="fsb-brand" href="/" target="_self">◆ FORGE Suite</a>` +
    `<nav class="fsb-nav">${tab('forge', 'FORGE')}${tab('studio', 'Studio')}${tab('sentinel', 'Sentinel')}</nav>` +
    `<div class="fsb-meta">` +
    `<a href="https://github.com/mechneurolab" target="_blank" rel="noopener">GitHub</a>` +
    `<span class="fsb-lab">Mechanical Neuroimaging Lab · Univ. of Delaware</span>` +
    `</div>` +
    `</div>`
  )
}

function bannerCss(segment: string): string {
  // Each theme has its own fixed/sticky header; offset it below the banner.
  // VitePress (studio, sentinel) has a native top slot for exactly this.
  const themeOffset =
    segment === 'forge'
      ? `.md-header{top:${BANNER_H}px!important}` +
        `.md-tabs{top:${BANNER_H + 48}px!important}` +
        `[data-md-component=announce]{top:${BANNER_H}px}`
      : `:root{--vp-layout-top-height:${BANNER_H}px!important}`
  return (
    `html{scroll-padding-top:${BANNER_H}px}` +
    `#fsb{position:fixed;top:0;left:0;right:0;height:${BANNER_H}px;z-index:2147483000;` +
    `display:flex;align-items:center;gap:1rem;padding:0 14px;box-sizing:border-box;` +
    `background:#1b1b2e;color:#fff;` +
    `font:600 13px/1 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}` +
    `#fsb a{color:#fff;text-decoration:none}` +
    `#fsb .fsb-brand{font-weight:800;letter-spacing:.2px}` +
    `#fsb .fsb-nav{display:flex;gap:.85rem}` +
    `#fsb .fsb-nav a{opacity:.72;font-weight:600}` +
    `#fsb .fsb-nav a:hover{opacity:1}` +
    `#fsb .fsb-nav a.active{opacity:1;color:#9db2ff}` +
    `#fsb .fsb-meta{margin-left:auto;display:flex;align-items:center;gap:.9rem;font-weight:500;font-size:12px}` +
    `#fsb .fsb-meta a{opacity:.85}#fsb .fsb-meta a:hover{opacity:1}` +
    `#fsb .fsb-lab{color:#aeaec2}` +
    `@media(max-width:720px){#fsb .fsb-lab{display:none}}` +
    themeOffset
  )
}

class HeadInjector {
  constructor(private readonly css: string) {}
  element(el: Element) {
    el.append(`<style>${this.css}</style>`, { html: true })
  }
}

class BodyInjector {
  constructor(private readonly html: string) {}
  element(el: Element) {
    el.prepend(this.html, { html: true })
  }
}

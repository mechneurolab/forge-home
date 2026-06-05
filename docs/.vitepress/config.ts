import { defineConfig } from 'vitepress'

// Landing page for the FORGE MRI suite (forge-mri.dev).
//
// The /forge, /studio, and /sentinel paths are NOT pages in this site — they are
// reverse-proxied to each subproject's own deployment by the Cloudflare Worker
// router in ../../worker/index.ts. They resolve in production (and `wrangler dev`),
// but 404 under plain `vitepress dev`. That's expected.
export default defineConfig({
  title: 'FORGE Suite',
  description: 'Open MRI software suite — forge-mri.dev',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'FORGE', link: '/forge/' },
      { text: 'Studio', link: '/studio/' },
      { text: 'Sentinel', link: '/sentinel/' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/mechneurolab' },
    ],
    footer: {
      message: 'Mechanical Neuroimaging Laboratory · University of Delaware',
      copyright: 'MIT Licensed',
    },
  },
})

# Clarkston Concrete

Lightweight static marketing site and server-side Vercel estimate endpoint. A distinct warm concrete, charcoal and clay identity, with self-hosted Manrope headings and DM Sans body text, SVG branding and responsive WebP photography.

## Commands

Requires Node 24. No application dependencies or paid database.

```sh
npm run build
npm test
```

Build output is `dist/`. Deploy the repository to Vercel as Other, with build `npm run build` and output `dist`. Vercel separately builds `api/estimate.js` as a Node function. No credentials are included in source.

Read [SETUP.md](SETUP.md) for exact setup steps and [docs/sources.md](docs/sources.md) for photo rights and content research. Business details are in `src/company.mjs`; layout is in `src/page.html`; styling and client behavior are in `public/`.

The default is review mode, with noindex and no analytics or advertising tracking. Email credentials, a verified sender domain and Cloudflare Turnstile credentials are required before the hosted form can send. Review mode does not simulate a successful submission.

No submission database is used. Resend accepts notifications server-side; the user receives a thank-you redirect only after a successful response. Resend idempotency avoids duplicate notifications for a retried request ID. Provider acceptance and inbox delivery are separate; verify delivery with Rob after setup.

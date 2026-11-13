# Clarkston Concrete: live website

Launched November 13, 2026.

- Public website: https://clarkstonconcreteco.com/
- Repository: https://github.com/tcole823/clarkston-concrete
- Vercel team: TC Design (`tc-design2`)
- Vercel project: `clarkston-concrete`
- Project ID: `prj_Ex04mqFV8lSDozcODpj1GhP069F0`

## Website and DNS

The apex and www records are DNS-only CNAME records pointing to the project-specific Vercel target returned during setup. HTTPS is active. The www hostname redirects to the apex with a permanent 308 response. Canonical URLs, structured data, robots.txt and the sitemap use the permanent hostname. Production has `SITE_LIVE=true`; Preview and Development retain `SITE_LIVE=false`.

The former review hostname uses a narrowly scoped Cloudflare redirect rule in the sitesbytc.com zone, phase `http_request_dynamic_redirect`, matching only `clarkstonconcrete.sitesbytc.com` and preserving the path and query string. Only that legacy website DNS record is proxied for this edge redirect. The verified sender DNS records remain unchanged. The Vercel config also includes legacy alias redirect rules.

## Form and email verification

The existing dedicated Resend sending domain is fully verified: DKIM and sending records all report verified. The domain-restricted API key, approved sender and business recipient remain configured privately in Vercel. Notification mail continues to use the already verified branded sender under clarkstonconcrete.sitesbytc.com; using the permanent website domain does not require changing that sender.

The Managed Turnstile widget `Clarkston Concrete estimate form` now permits `clarkstonconcreteco.com` as well as the original review hosts. Server-side hostname and action checks remain enforced. No credentials are exposed in source.

A real browser launch test on the permanent domain passed Turnstile automatically, submitted successfully and reached `/thank-you/`. Resend confirmed the resulting `Clarkston Concrete estimate request` message was delivered to the configured recipient at 19:25 UTC on November 13, 2026. The test name clearly identified it as a website launch test requiring no response. Provider-reported delivery confirms acceptance by the recipient mail system, not that the recipient read the message.

## Verification

- All 14 automated checks passed before release, covering validation, origin and spam protection, provider errors, successful delivery response, confirmation guards and conversion deduplication.
- Production build passed and deployment reached READY.
- Permanent domain HTTPS returned 200; www returned a permanent redirect.
- Live HTML uses the approved canonical URL and permits indexing. The thank-you page remains noindex.
- Live config has the permanent hostname, live mode and the correct public widget key. No analytics or advertising identifiers are configured.
- The actual form success page was inspected at a 1363px viewport with no horizontal overflow.
- Runtime error scan for the launch window found no error records.

## Future updates

Source is in GitHub and direct Git-source deployments through the connected Vercel tool work. The existing project is still not automatically linked to GitHub. This does not prevent the live website or assistant-triggered deployments. To enable automatic deployments on every push, connect `tcole823/clarkston-concrete`, branch `main`, in TC Design → clarkston-concrete → Settings → Git. Future projects should be created Git-linked from the start.

Google Analytics and advertising tracking remain disabled until project-specific accounts and IDs are configured. Successful-submission tracking is prepared and deduplicated; no customer details are included in conversion events. Update the privacy wording when tracking is enabled.

The source retains licensed stock photography labeled as illustrative. Authentic project photos can replace it when supplied. No claims about years in business, insurance, reviews, warranties, prices or completion guarantees have been invented.

Reusable account provisioning guidance remains in `docs/provisioning/standard-workflow.md`; use separate client widgets and restricted sender keys, preserve unrelated DNS and never use purchase or billing operations.

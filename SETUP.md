# Clarkston Concrete: review and remaining setup

Review site: https://clarkstonconcrete.sitesbytc.com/
Repository: https://github.com/tcole823/clarkston-concrete
Vercel team: TC Design (`tc-design2`)
Vercel project: `clarkston-concrete`
Project ID: `prj_Ex04mqFV8lSDozcODpj1GhP069F0`

## Completed setup, October 10, 2026

The connected Cloudflare OAuth integration works for DNS and Turnstile operations. The review website CNAME is DNS-only and all four Resend sender records resolve publicly. A separate Managed widget named `Clarkston Concrete estimate form` allows `clarkstonconcrete.sitesbytc.com` and `clarkston-concrete.vercel.app`. Its public key and sensitive secret were installed directly in this Vercel project. No secret is stored in source or printed in chat.

The independent Resend key named `Clarkston Concrete Website` is restricted to this site's sender domain and installed privately in Vercel. Sender, recipient and allowed origins are also configured privately. Resend domain verification has been triggered after public DNS resolution; the last provider status was pending. Do not create replacement credentials or duplicate DNS records.

The site was deployed successfully directly from GitHub main with the latest credentials. It remains a client review preview: noindex/nofollow, robots disallow-all, empty sitemap, `SITE_LIVE=false`, advertising and analytics disabled. No database or paid add-on is used. The permanent domain awaits approval.

## Remaining technical checks

1. Recheck Resend domain verification and confirm delivery after it reports verified. The four records resolve publicly with the required values.
2. Finish one clearly labeled test form submission. The cloud browser displays an interactive human-verification checkbox. Completing this CAPTCHA requires action-time user confirmation under the browser policy. No submission or real inbox delivery has yet been verified with the production widget.
3. Attach the existing project for automatic deployments: in the user's normal Vercel session, open TC Design → clarkston-concrete → Settings → Git → Connect Git Repository, select `tcole823/clarkston-concrete`, branch `main`. The connector can deploy Git source but cannot attach an existing unlinked project. Direct deployments already work; future projects should be created Git-linked from the start.

## Reusable automation

`docs/provisioning/standard-workflow.md` documents the standard client setup. The preferred route is the already-connected official Cloudflare OAuth MCP integration. It avoids cloud-browser sign-in and manual credential copying. Preserve unrelated records, use separate widgets and domain-restricted email keys for each client, and do not use purchase, upgrade, registrar or billing operations. Functional DNS/Turnstile access is verified; the API results do not independently audit every granted billing permission.

`scripts/provision-cloudflare.mjs` remains an optional direct API fallback for an authenticated operator. It defaults to a plan without network requests, preflights conflicts, creates missing records only, reuses a matching widget and passes widget keys directly to Vercel. No manual DNS import or widget creation is needed for this site now. The DNS manifest and import file are retained as configuration records.

## Rob's content review

Confirm actual services among driveways, patios, walkways, slabs, replacement and decorative finishes; available finishes and limitations; service-area boundaries; contact routing and sender address; estimate, permit, utility-locating, removal, cleanup and curing practices; and permanent domain. Authentic project photos can replace the licensed illustrative stock photography. Stock images are explicitly identified and never described as Rob's work. No experience, reviews, insurance, warranties, pricing or completion guarantees are invented.

## Before public launch

Configure the approved permanent domain in `src/company.mjs` and Vercel, confirm services and remove review notes, update privacy details for final tracking, add the permanent hostname to Turnstile and test email delivery again. Only then set `SITE_LIVE=true`, configure project-specific tracking IDs and redeploy. The build refuses live mode without a permanent hostname. Conversion events require a recent successful submission on the approved live hostname and use a random request ID for deduplication, with no customer details in tracking.

## Verification

- Node 24 build and Git-source Vercel deployment passed.
- All 14 tests passed: server validation, origins, spam checks, Turnstile hostname/action, provider failures, mocked success, thank-you guards, disabled review tracking, conversion deduplication and provisioning safety.
- Desktop layout inspected at 1363px; mobile layouts at 390px and 320px. Photos load, navigation works, and no horizontal overflow was observed. These were viewport checks, not physical device tests.
- Deployed unconfigured form previously returned an unavailable message without false confirmation. The configured widget now renders a real human-verification checkbox.
- End-to-end submission and provider-reported delivery remain pending the real widget interaction and sender verification.

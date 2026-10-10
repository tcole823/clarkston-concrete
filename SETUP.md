# Clarkston Concrete: review and remaining setup

Review site: https://clarkston-concrete.vercel.app/
Intended review address: https://clarkstonconcrete.sitesbytc.com/
Vercel team: TC Design (`tc-design2`)
Vercel project: `clarkston-concrete`
Project ID: `prj_Ex04mqFV8lSDozcODpj1GhP069F0`

The site is deployed for client review. It has `noindex, nofollow`, a disallow-all robots.txt, an empty sitemap and disabled advertising/analytics. No database is used. The form is intentionally unavailable until the separate Resend and Turnstile credentials are added. The permanent domain has not been confirmed.

## Completed account setup

The repository `tcole823/clarkston-concrete` exists and the connected GitHub app has push access. Source upload is handled through the connection. Vercel reports the review domain correctly configured as of October 10, 2026. The independent Resend key named `Clarkston Concrete Website` has been created with sending access restricted to this site's domain and installed directly as encrypted `RESEND_API_KEY` in this Vercel project for Production, Preview and Development. No credential is stored in source.

Git automatic deployment still requires linking this existing Vercel project to the repository. Remaining Cloudflare changes are being handled through account access where available. The DNS records below document the required configuration, rather than tasks the client should perform manually.

## One-time access connection, preferred

Cloudflare has an official OAuth MCP server at `https://mcp.cloudflare.com/mcp`. In ChatGPT Plugins, use the plus button and Add custom MCP server. Name: `Cloudflare API`. Description: `Manage TC Design website DNS and Turnstile setup`. Connection: public HTTPS endpoint. Authentication: OAuth. Authorize in the user's normal browser with the minimum DNS and Turnstile permissions available. Account/workspace policies can affect availability. No cloud-browser login or pasted API key is needed for this route.

After the connection becomes available, the assistant should inspect account identity and the `sitesbytc.com` zone, apply `docs/provisioning/clarkston-concrete.json`, verify the existing Resend domain and deploy. Restrict DNS changes to the named project records and preserve unrelated records. Install the Turnstile secret directly as a Vercel Secret. Do not print it or commit it.

## Fallback for this site only

If custom MCP connections are unavailable, the email records are prepared in `docs/provisioning/clarkston-concrete-dns.txt`. In the normal Cloudflare browser session: `sitesbytc.com` → DNS → Records → Import and Export. Import this file and uncheck Proxy imported DNS records. The file contains only the four sender records, not the working website record or any root email records. Tell the assistant when import completes; it can run Resend verification.

The only remaining Cloudflare object is a Managed Turnstile widget named `Clarkston Concrete estimate form`, with allowed hostnames `clarkstonconcrete.sitesbytc.com` and `clarkston-concrete.vercel.app`. Without direct account access, create this widget in the normal browser and enter its keys directly into Vercel: public key `PUBLIC_TURNSTILE_SITE_KEY` (Config), secret key `TURNSTILE_SECRET_KEY` (Secret), for Production and Preview. Keep secret values out of chat. The assistant can then redeploy and test.

The independent Resend key is already installed. `SITE_LIVE=false`, email recipient, email sender and allowed review origin are already configured privately in Vercel. Do not create another Resend key.

## Reusable automation

`docs/provisioning/standard-workflow.md` records the standard client setup. `scripts/provision-cloudflare.mjs` provides a direct API fallback for an authenticated local/CI operator. It defaults to a plan with no network requests, checks existing records and widget settings before any write, rejects conflicts, creates missing records only, reuses the project widget and passes its keys directly to Vercel. It never changes site live mode. Real API application awaits authentication; mocked tests and the plan command have passed.

Automatic deployments for the current project still require its Git link. The existing Vercel connector cannot attach an unlinked project. In the user's regular Vercel browser session, open TC Design → clarkston-concrete → Settings → Git → Connect Git Repository, select `tcole823/clarkston-concrete` and branch `main`. This is an exception for this existing project; future projects should be created linked from the start through the Vercel connector.

## 5. Rob's content review

Ask Rob to confirm:

1. Which of the six discussion options he actually offers: driveways, patios, walkways, slabs, replacement and decorative finishes.
2. Available finishes, slab uses and any project limitations.
3. Service-area boundaries and scheduling availability.
4. The business name, phone and email routing, plus the proposed sender address.
5. How estimates, permits, utility locating, preparation, removal, cleanup and curing instructions are handled.
6. A permanent domain and authentic project photos if available.

Stock photography is clearly identified as illustrative. No stock image is claimed as Rob's work. No invented experience, reviews, licensing, insurance, warranties, prices or guaranteed schedules are included.

## 6. Before public launch

Confirm and configure the permanent domain in `src/company.mjs` and Vercel. Confirm the services and remove client-review notes after approval. Update the privacy text to match the final tracking setup. Add the permanent hostname to Turnstile and verify email notifications again. Only then set `SITE_LIVE=true`, add project-specific GA4/Ads IDs and conversion label, and redeploy. The build refuses live mode without a permanent domain.

Conversion events are gated by live mode, the approved permanent hostname and a recent successful-submission receipt. The random request ID is used for Resend idempotency and Ads transaction deduplication; browser session storage prevents conversion events repeating on a thank-you reload. Customer details are excluded from tracking events.

## Verification

- Build: passed on Node 24 and deployed successfully on Vercel.
- Fourteen automated tests passed: server validation, origins, spam checks, Turnstile hostname, provider failure, successful mocked Resend acceptance, direct/expired thank-you visits, disabled review tracking and conversion deduplication.
- Desktop layout inspected at 1363px. All three photo assets loaded and no horizontal overflow was observed.
- Mobile layouts inspected inside browser frames at 390px and 320px. Mobile menu open/close tested and no horizontal overflow observed. This is viewport layout verification, not a physical iPhone/Android test.
- Deployed unconfigured form returns an unavailable message and stays on the form; no success confirmation is shown.
- Real Turnstile verification and inbox delivery still await Cloudflare access or the fallback steps above.

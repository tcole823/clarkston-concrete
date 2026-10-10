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

## 3. Verify the separate email sender domain

The domain `clarkstonconcrete.sitesbytc.com` is already created in Resend. The proposed review sender is `Clarkston Concrete <estimates@clarkstonconcrete.sitesbytc.com>`. It is configured in this Vercel project but cannot send until verification succeeds.

Add these records to the same Cloudflare `sitesbytc.com` zone. Names below are relative to that zone. Keep CNAME records DNS only.

| Type | Name | Value | Priority | TTL |
| --- | --- | --- | --- | --- |
| TXT | `resend._domainkey.clarkstonconcrete` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDMHJsbrh6+tTP11vpgLp4tCnS24K8xYYa3++05lHqC+Ubg44FPbNlxJBNDtHqm3G6v0B7gudX5WMewJrvSeuizZRCBAgB+zVPZbNHfeRnWZtN/UVXW4xKUS0osVXDOx6kcy8GPJa8L0FLbR8csS3hHv8qCynCc85X/YEa2ViUytQIDAQAB` | None | Auto |
| MX | `send.clarkstonconcrete` | `feedback-smtp.us-east-1.amazonses.com` | 10 | Auto |
| TXT | `send.clarkstonconcrete` | `v=spf1 include:amazonses.com ~all` | None | Auto |
| CNAME | `rsend.clarkstonconcrete` | `send.forge.rmta.net` | None | Auto |

These are the records returned by Resend for this specific domain. Open Resend → Domains → `clarkstonconcrete.sitesbytc.com` → Verify DNS Records. Wait for verified status.

The domain-restricted sending key is already installed in Vercel. Sender DNS verification is still pending.

## 4. Configure Cloudflare Turnstile

Open Cloudflare → Turnstile → Add widget:

- Widget name: `Clarkston Concrete estimate form`
- Widget mode: Managed
- Allowed hostnames: `clarkstonconcrete.sitesbytc.com` and `clarkston-concrete.vercel.app`

Add the generated values directly in Vercel → `clarkston-concrete` → Settings → Environment Variables:

| Variable | Value | Environments |
| --- | --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | The widget's site key | Production, Preview, Development |
| `TURNSTILE_SECRET_KEY` | The widget's secret key | Production, Preview, Development |
| `RESEND_API_KEY` | The new restricted sending key | Production, Preview, Development |

Already configured in Vercel:

| Variable | Current value |
| --- | --- |
| `SITE_LIVE` | `false` |
| `ESTIMATE_TO` | `Configured privately in Vercel` |
| `ESTIMATE_FROM` | `Clarkston Concrete <estimates@clarkstonconcrete.sitesbytc.com>` |
| `FORM_ALLOWED_ORIGINS` | `https://clarkston-concrete.vercel.app` |

The server also accepts the intended review host automatically. Add any other test origin explicitly if needed and add its hostname to Turnstile. All advertising IDs remain unset.

Redeploy the newest deployment after adding environment variables. Test through the form at the intended review address and confirm Rob receives the notification before relying on online estimates. A successful API response means Resend accepted the message, not that inbox delivery has been confirmed.

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
- Nine automated tests passed: server validation, origins, spam checks, Turnstile hostname, provider failure, successful mocked Resend acceptance, direct/expired thank-you visits, disabled review tracking and conversion deduplication.
- Desktop layout inspected at 1363px. All three photo assets loaded and no horizontal overflow was observed.
- Mobile layouts inspected inside browser frames at 390px and 320px. Mobile menu open/close tested and no horizontal overflow observed. This is viewport layout verification, not a physical iPhone/Android test.
- Deployed unconfigured form returns an unavailable message and stays on the form; no success confirmation is shown.
- Real Turnstile verification and inbox delivery still require the credentials/DNS above.

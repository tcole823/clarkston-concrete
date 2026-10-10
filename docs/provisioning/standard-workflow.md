# TC Design standard website setup

Prepared October 10, 2026. This is the working procedure for future lightweight contractor sites. Separate client repos, Vercel projects, sending keys and Turnstile widgets remain the default. No database is needed for email-only estimate forms.

## One-time connections

Keep GitHub, Vercel and Resend connected. Add the official Cloudflare API MCP server:

| Setting | Value |
| --- | --- |
| Name | Cloudflare API |
| Description | Manage TC Design website DNS and Turnstile setup |
| Public HTTPS endpoint | https://mcp.cloudflare.com/mcp |
| Authentication | OAuth |
| Scope | DNS read/write for approved zones; Turnstile read/edit for the chosen account |

Open ChatGPT Plugins → plus button → Add custom MCP server. Enter the settings, review the permissions and authorize with the regular browser. Account/workspace policies apply. If the dialog offers resource selection, start with `sitesbytc.com`; add a permanent client zone only when launch requires it. Avoid unrelated account permissions. The server covers Cloudflare APIs rather than only documentation or DNS analytics. After installing, enable it in the conversation; if tools are absent, start a new conversation with this repo and the plugin selected.

The assistant cannot install an arbitrary authenticated MCP connection through the current plugin-management tools. The initial connection/authorization is therefore an actual user step. No credentials should be pasted into chat.

## Per-client inputs

The client brief supplies business name, phone, approved notification recipient, review slug and confirmed services. The assistant creates a non-secret provisioning manifest with the zone, project namespace, exact provider-returned DNS records, widget settings and Vercel project/team IDs. Recipient addresses and all credentials stay in environment configuration. Permanent domain, claimed qualifications and final service boundaries require client confirmation.

## Assistant execution

1. Inspect the reference and prepare the site's independent design, content and tested form flow.
2. Upload source to the accessible client GitHub repository. Create a Vercel project linked to that repository through `create_git_project`, then set the build command, output directory and Node version. Wait for a ready deployment. If repo creation is unsupported, the user only creates the repo and grants connector access.
3. Add the review domain to Vercel and obtain its current recommended DNS target. Inspect existing Cloudflare records first. Add the project's CNAME as DNS-only if absent; stop on conflicting values. No guessing DNS targets and no changes to other clients.
4. Create the project's Resend sending domain. Use its returned DNS records in Cloudflare. Verify the domain. Create one sending-only key restricted to that domain, and pass it directly into that Vercel project's secret store without outputting the key. Configure the separately approved sender and recipient.
5. Create or reuse a Managed Turnstile widget with this project's review hostnames. Install the site key as Config and its private key as Secret. Each client has its own widget and secret. Verify hostname and action server-side.
6. Redeploy after environment changes. Verify HTTPS, desktop and mobile layouts, invalid requests, challenge verification, successful provider acceptance, delivery status and the thank-you guard. Label any authorized test inquiry clearly. Provider acceptance alone is not proof of inbox arrival.
7. Keep review pages out of search and advertising tracking off. Confirm permanent domain and client details before launch. Add the permanent hostname to the widget and origin allowlist, then enable launch configuration and approved tracking. Verify conversion deduplication without including customer details.

## Direct API fallback

If the MCP connection is unavailable but an authenticated local/CI runner is available, the repository includes an operator script. It reads credentials from the process environment, defaults to a no-network plan, preflights conflicts and never deletes records, alters another namespace, weakens widget restrictions or enables launch.

```sh
node scripts/provision-cloudflare.mjs docs/provisioning/clarkston-concrete.json
```

Apply only from an authenticated operator environment:

```sh
node scripts/provision-cloudflare.mjs docs/provisioning/clarkston-concrete.json --apply
```

Required operator variables are `CLOUDFLARE_API_TOKEN` and `VERCEL_TOKEN`. The Cloudflare token needs Zone Read and DNS Edit for the approved zone plus Turnstile Edit for the selected account. Use a scoped Vercel credential for the relevant team. Keep these setup credentials out of client runtime variables and Git. The script writes only the widget's public key and private key to the destination website project. Production and Preview receive the widget secret; use test credentials separately for local development.

If an apply fails after creating some resources, inspect the provider state and rerun after resolving the failure. Existing matching resources are reused. Script application does not verify Resend, link Git or redeploy; those remain connected-service steps. Automated tests cover the plan, conflict handling, namespace restriction, repeated setup and credential-safe errors. Live API execution is untested until authenticated.

## Small manual fallback

Only if neither connection nor authenticated runner is available: the assistant prepares a BIND DNS import file; the user imports it in their ordinary Cloudflare session with proxying disabled. The user creates the one project widget and saves its values directly in Vercel. The assistant then verifies, redeploys and tests. Never send a long list of tasks for work available through connected tools.

## Primary references

- Cloudflare API MCP and OAuth: https://github.com/cloudflare/mcp
- Cloudflare managed MCP servers: https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/
- ChatGPT custom MCP connection: https://developers.openai.com/plugins/deploy/connect-chatgpt
- Turnstile programmatic management: https://developers.cloudflare.com/turnstile/get-started/widget-management/api/
- Cloudflare DNS import: https://developers.cloudflare.com/dns/manage-dns-records/how-to/import-and-export/
- Resend domain verification: https://resend.com/docs/add-a-domain

## Current Clarkston Concrete status

Source uploaded to `tcole823/clarkston-concrete`; Vercel project `clarkston-concrete` in `tc-design2`; review website HTTPS working; separate Resend sending key installed. Sender DNS verification is pending. Turnstile and the existing project's Git link await access. The prepared email import contains no website/root mail changes. Site review and tracking gates remain disabled for launch.

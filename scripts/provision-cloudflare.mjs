import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

// Setup credentials belong in the operator's environment, never the website.
// Default mode prints a plan and makes no network requests.
export function validate(config) {
  const domain = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
  const recordName = /^(?:[a-z0-9_](?:[a-z0-9_-]*[a-z0-9_])?\.)+[a-z]{2,}$/;
  if (!domain.test(config.zone) || !domain.test(config.namespace) ||
      !config.namespace.endsWith('.' + config.zone)) throw Error('Invalid setup namespace.');
  if (!Array.isArray(config.records) || !config.records.length) throw Error('No DNS records configured.');
  const names = new Set();
  for (const r of config.records) {
    if (!recordName.test(r.name) || !r.name.endsWith('.' + config.zone) ||
        !(r.name === config.namespace || r.name.endsWith('.' + config.namespace))) throw Error('Record outside project namespace.');
    if (!['TXT', 'MX', 'CNAME'].includes(r.type) || typeof r.content !== 'string' || !r.content || /[\r\n]/.test(r.content)) throw Error('Invalid DNS record.');
    if (r.type === 'MX' && (!Number.isInteger(r.priority) || r.priority < 0)) throw Error('Invalid MX priority.');
    const key = `${r.type}:${r.name}`;
    if (names.has(key)) throw Error('Duplicate record specification.');
    names.add(key);
  }
  if (!config.widget?.name || config.widget.mode !== 'managed' ||
      !Array.isArray(config.widget.domains) || !config.widget.domains.length ||
      config.widget.domains.some(h => !domain.test(h))) throw Error('Invalid widget configuration.');
  if (!config.vercel?.projectId?.startsWith('prj_') || !config.vercel.teamId?.startsWith('team_')) throw Error('Missing project identifiers.');
  return config;
}

const normalized = value => value.replace(/\.$/, '').toLowerCase();
export function sameRecord(a, b) {
  return a.type === b.type && a.name === b.name &&
    (a.type === 'TXT' ? a.content === b.content : normalized(a.content) === normalized(b.content)) &&
    (a.type !== 'MX' || a.priority === b.priority) &&
    (a.type !== 'CNAME' || a.proxied === false);
}

export async function provision(config, { cf, vercel, apply = false }) {
  validate(config);
  if (!apply) return { mode: 'plan', zone: config.zone, records: config.records, widget: config.widget, writes: 0 };
  const zones = await cf('GET', `/zones?name=${encodeURIComponent(config.zone)}`);
  if (zones.length !== 1 || zones[0].name !== config.zone || zones[0].status !== 'active') throw Error('Expected one active DNS zone.');
  const zone = zones[0];
  if (!zone.account?.id) throw Error('Missing Cloudflare account identifier.');
  const missing = [];
  // Preflight every name before any write. Existing mismatches need human review.
  for (const wanted of config.records) {
    const existing = await cf('GET', `/zones/${zone.id}/dns_records?name=${encodeURIComponent(wanted.name)}&per_page=100`);
    if (existing.length >= 100) throw Error('Ambiguous record count.');
    const incompatible = existing.some(r => (r.type === wanted.type && !sameRecord(r, wanted)) ||
      (r.type === 'CNAME' && wanted.type !== 'CNAME') || (wanted.type === 'CNAME' && r.type !== 'CNAME'));
    if (incompatible) throw Error(`Existing DNS conflict at ${wanted.name}; no records changed.`);
    if (!existing.some(r => sameRecord(r, wanted))) missing.push(wanted);
  }
  const widgets = await cf('GET', `/accounts/${zone.account.id}/challenges/widgets?per_page=100`);
  if (widgets.length >= 100) throw Error('Widget pagination needs review.');
  const matches = widgets.filter(w => w.name === config.widget.name);
  if (matches.length > 1) throw Error('Ambiguous widget name.');
  let widget;
  if (matches.length === 1) {
    widget = await cf('GET', `/accounts/${zone.account.id}/challenges/widgets/${matches[0].sitekey}`);
    if (widget.mode !== config.widget.mode ||
        JSON.stringify([...widget.domains].sort()) !== JSON.stringify([...config.widget.domains].sort())) throw Error('Existing widget differs; no configuration changed.');
    if (!widget.sitekey || !widget.secret) throw Error('Widget credentials unavailable.');
  }
  for (const record of missing) await cf('POST', `/zones/${zone.id}/dns_records`, { ...record, ttl: 1 });
  if (!widget) widget = await cf('POST', `/accounts/${zone.account.id}/challenges/widgets`, config.widget);
  if (!widget.sitekey || !widget.secret) throw Error('Widget credentials unavailable.');
  // Pass credentials directly to the secret store. Never print or write them.
  await vercel('POST', `/v10/projects/${config.vercel.projectId}/env?teamId=${config.vercel.teamId}&upsert=true`, [
    { key: 'PUBLIC_TURNSTILE_SITE_KEY', value: widget.sitekey, type: 'plain', target: ['production', 'preview', 'development'] },
    { key: 'TURNSTILE_SECRET_KEY', value: widget.secret, type: 'sensitive', target: ['production', 'preview'] }
  ]);
  return { mode: 'applied', dnsCreated: missing.length, widget: config.widget.name, vercelConfigured: true, redeployRequired: true };
}

export function client(base, token, cloudflare = false) {
  return async (method, path, body) => {
    const response = await fetch(base + path, { method, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(20000) });
    const data = await response.json();
    // Provider error bodies can contain submitted secrets, so do not echo them.
    if (!response.ok || (cloudflare && data.success !== true)) throw Error(`Provider request failed (${response.status}); response withheld.`);
    return cloudflare ? data.result : data;
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');
    const file = args.find(a => !a.startsWith('--')) || 'docs/provisioning/clarkston-concrete.json';
    const config = JSON.parse(await readFile(file, 'utf8'));
    if (apply && (!process.env.CLOUDFLARE_API_TOKEN || !process.env.VERCEL_TOKEN)) throw Error('Setup credentials must be supplied securely through the operator environment.');
    const result = await provision(config, { apply,
      cf: client('https://api.cloudflare.com/client/v4', process.env.CLOUDFLARE_API_TOKEN, true),
      vercel: client('https://api.vercel.com', process.env.VERCEL_TOKEN) });
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

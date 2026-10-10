import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { provision, client, validate } from '../scripts/provision-cloudflare.mjs';
const config = JSON.parse(await readFile(new URL('../docs/provisioning/clarkston-concrete.json', import.meta.url)));

function fixtures(existing = []) {
  const calls = [];
  const widget = { ...config.widget, sitekey: 'public-test', secret: 'private-test' };
  return { calls, cf: async (method, path, body) => {
    calls.push({ method, path, body });
    if (path.startsWith('/zones?')) return [{ id: 'zone', name: config.zone, status: 'active', account: { id: 'account' } }];
    if (path.includes('/dns_records?')) return existing.filter(r => new URL(path, 'https://example.test').searchParams.get('name') === r.name);
    if (path.endsWith('widgets?per_page=100')) return [{ name: widget.name, sitekey: widget.sitekey }];
    if (path.endsWith('/public-test')) return widget;
    return body;
  }, vercel: async (method, path, body) => { calls.push({ method, path, body }); } };
}

test('plan mode uses no credentials or network', async () => {
  const f = fixtures();
  assert.equal((await provision(config, f)).writes, 0);
  assert.equal(f.calls.length, 0);
});
test('a conflict detected late in preflight prevents every write', async () => {
  const last = config.records.at(-1);
  const f = fixtures([{ ...last, content: 'different.example.com', proxied: false }]);
  await assert.rejects(provision(config, { ...f, apply: true }), /conflict/);
  assert.equal(f.calls.filter(c => c.method !== 'GET').length, 0);
});
test('repeat setup does not duplicate records and credentials go only to Vercel', async () => {
  const f = fixtures(config.records);
  const result = await provision(config, { ...f, apply: true });
  assert.equal(result.dnsCreated, 0);
  assert.equal(result.vercelConfigured, true);
  assert.equal(f.calls.filter(c => c.method === 'POST').length, 1);
  const env = f.calls.at(-1).body;
  assert.equal(env[1].type, 'sensitive');
  assert.equal(env[1].value, 'private-test');
  assert.ok(!JSON.stringify(result).includes('private-test'));
});
test('configuration cannot modify another project namespace', () => {
  const bad = structuredClone(config);
  bad.records[0].name = 'resend._domainkey.allfenceco.sitesbytc.com';
  assert.throws(() => validate(bad), /namespace/);
});
test('provider failures do not expose credentials in error messages', async () => {
  const original = global.fetch;
  try {
    global.fetch = async () => ({ ok: false, status: 401, json: async () => ({ secret: 'private-test' }) });
    await assert.rejects(client('https://api.example.test', 'test-only')('POST', '/env', {}), error => !error.message.includes('private-test'));
  } finally { global.fetch = original; }
});

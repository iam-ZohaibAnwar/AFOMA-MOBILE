/**
 * Phase 1 staging verification for Admin Settings V1.
 *
 * Setting types: affiliate-commission, seller-referral-commission,
 * buyer-referral-commission, shops
 *
 * Read-only by default. Mutations require --confirm and restore originals.
 *
 * Usage:
 *   node scripts/adminSettingsPhase1Capture.mjs
 *   node scripts/adminSettingsPhase1Capture.mjs --auth-matrix
 *   node scripts/adminSettingsPhase1Capture.mjs --round-trip --confirm
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SETTING_TYPES = [
  'affiliate-commission',
  'seller-referral-commission',
  'buyer-referral-commission',
  'shops',
];

function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env not found');
  }

  return Object.fromEntries(
    fs
      .readFileSync(envPath, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        return [line.slice(0, index), line.slice(index + 1)];
      }),
  );
}

function parseArgs(argv) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  return { flags };
}

function headers(apiKey, bearer) {
  const h = { 'x-api-key': apiKey };
  if (bearer) {
    h.Authorization = `Bearer ${bearer}`;
  }
  return h;
}

async function request(baseUrl, method, urlPath, apiKey, body, bearer) {
  const res = await fetch(`${baseUrl.replace(/\/$/, '')}${urlPath}`, {
    method,
    headers: {
      ...headers(apiKey, bearer),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  return { status: res.status, body: parsed };
}

function parseSettingContent(raw) {
  if (raw == null) {
    return null;
  }
  if (typeof raw !== 'string') {
    return raw;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

function summarizeSetting(type, doc) {
  if (!doc) {
    return { type, exists: false };
  }

  const parsed = parseSettingContent(doc.content);

  if (type === 'shops') {
    const shops = Array.isArray(parsed) ? parsed : [];
    return {
      type,
      exists: true,
      _id: doc._id,
      shopCount: shops.length,
      shopIds: shops.map((s) => s?.id ?? s?._id).filter(Boolean),
    };
  }

  return {
    type,
    exists: true,
    _id: doc._id,
    rawContent: doc.content,
    parsedContent: parsed,
  };
}

async function getSetting(baseUrl, apiKey, type, bearer) {
  const result = await request(baseUrl, 'GET', `/settings/type/${type}`, apiKey, undefined, bearer);
  const doc = result.body?.settings?.[0];
  return { ...result, doc, summary: summarizeSetting(type, doc) };
}

async function main() {
  const env = loadEnv();
  const baseUrl = env.EXPO_PUBLIC_API_URL;
  const apiKey = env.EXPO_PUBLIC_API_KEY;
  const { flags } = parseArgs(process.argv.slice(2));
  const bearer = process.env.ADMIN_BEARER_TOKEN || null;

  if (!baseUrl || !apiKey) {
    throw new Error('Missing EXPO_PUBLIC_API_URL or EXPO_PUBLIC_API_KEY in .env');
  }

  const outDir = path.join(ROOT, 'scripts', 'captures');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const report = {
    capturedAt: new Date().toISOString(),
    baseUrl,
    v1Types: SETTING_TYPES,
    reads: {},
    authMatrix: null,
    roundTrip: null,
  };

  console.log('Admin Settings Phase 1 capture (read-only probe)\n');

  for (const type of SETTING_TYPES) {
    const read = await getSetting(baseUrl, apiKey, type);
    report.reads[type] = {
      status: read.status,
      summary: read.summary,
      getShape: {
        hasMessage: typeof read.body?.message === 'string',
        settingsIsArray: Array.isArray(read.body?.settings),
      },
    };
    console.log(`${type}: HTTP ${read.status}`, JSON.stringify(read.summary));
  }

  if (flags.has('--auth-matrix')) {
    report.authMatrix = {};
    for (const type of ['affiliate-commission']) {
      const noAuth = await request(baseUrl, 'GET', `/settings/type/${type}`, '', undefined);
      const badKey = await request(baseUrl, 'GET', `/settings/type/${type}`, 'invalid-key', undefined);
      const apiKeyOnly = await getSetting(baseUrl, apiKey, type);
      const withBearer = bearer
        ? await getSetting(baseUrl, apiKey, type, bearer)
        : { status: 'skipped', note: 'Set ADMIN_BEARER_TOKEN to probe Bearer' };

      report.authMatrix[type] = {
        noAuth: noAuth.status,
        badApiKey: badKey.status,
        apiKeyOnly: apiKeyOnly.status,
        withBearer: withBearer.status,
      };
    }

    console.log('\nAuth matrix:', JSON.stringify(report.authMatrix, null, 2));
  }

  if (flags.has('--round-trip')) {
    if (!flags.has('--confirm')) {
      console.error('\n--round-trip requires --confirm (mutates staging, then restores).');
      process.exit(1);
    }

    report.roundTrip = {};
    for (const type of SETTING_TYPES) {
      const read = await getSetting(baseUrl, apiKey, type);
      const doc = read.doc;
      if (!doc?._id) {
        report.roundTrip[type] = { skipped: true, reason: 'no document' };
        continue;
      }

      const putSame = await request(
        baseUrl,
        'PUT',
        `/settings/${doc._id}`,
        apiKey,
        {
          type: doc.type,
          content: doc.content,
          createdBy: doc.createdBy,
        },
      );

      report.roundTrip[type] = {
        putSameStatus: putSame.status,
        putReturnsDoc: Boolean(putSame.body?._id),
        getWrapsSettings: Boolean(read.body?.settings),
      };
      console.log(`round-trip ${type}: PUT ${putSame.status}`);
    }
  }

  const outPath = path.join(outDir, `admin-settings-phase1-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

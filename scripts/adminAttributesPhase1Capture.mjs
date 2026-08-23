/**
 * Phase 1 staging verification for Admin Global Attributes.
 *
 * Read-only by default. Mutations require --mutations --confirm and restore state.
 *
 * Usage:
 *   node scripts/adminAttributesPhase1Capture.mjs
 *   node scripts/adminAttributesPhase1Capture.mjs --auth-matrix
 *   node scripts/adminAttributesPhase1Capture.mjs --mutations --confirm
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROBE_PREFIX = 'Phase1Probe_';

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
  const h = {};
  if (apiKey) {
    h['x-api-key'] = apiKey;
  }
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
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
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

async function getGlobalDocument(baseUrl, apiKey, bearer) {
  const result = await request(baseUrl, 'GET', '/global-attribute', apiKey, undefined, bearer);
  const documents = Array.isArray(result.body) ? result.body : [];
  const document = documents[0] ?? null;
  const attributes = Array.isArray(document?.attributes) ? document.attributes : [];

  return {
    ...result,
    documents,
    document,
    documentId: document?._id ?? null,
    attributes,
    attributeCount: attributes.length,
  };
}

function summarizeDocument(read) {
  if (!read.document) {
    return { exists: false, documentCount: read.documents.length };
  }

  return {
    exists: true,
    documentCount: read.documents.length,
    _id: read.document._id,
    attributeCount: read.attributeCount,
    attributes: read.attributes,
    createdAt: read.document.createdAt,
    updatedAt: read.document.updatedAt,
  };
}

async function addAttribute(baseUrl, apiKey, documentId, name, bearer) {
  return request(
    baseUrl,
    'PUT',
    `/global-attribute/add/${documentId}`,
    apiKey,
    { attributes: name },
    bearer,
  );
}

async function renameAttribute(baseUrl, apiKey, documentId, index, newName, bearer) {
  return request(
    baseUrl,
    'PUT',
    `/global-attribute/${documentId}`,
    apiKey,
    { updatedAttributeValue: newName, indexToUpdate: index },
    bearer,
  );
}

async function deleteAttribute(baseUrl, apiKey, documentId, name, bearer) {
  return request(baseUrl, 'DELETE', `/global-attribute/one/${documentId}`, apiKey, { attributes: name }, bearer);
}

function isProbeName(name) {
  return typeof name === 'string' && name.startsWith(PROBE_PREFIX);
}

async function cleanupProbes(baseUrl, apiKey, documentId, bearer) {
  const read = await getGlobalDocument(baseUrl, apiKey, bearer);
  const probes = read.attributes.filter(isProbeName);
  const deleted = [];

  for (const name of probes) {
    const del = await deleteAttribute(baseUrl, apiKey, documentId, name, bearer);
    deleted.push({ name, status: del.status, body: del.body });
  }

  return { deleted, finalRead: await getGlobalDocument(baseUrl, apiKey, bearer) };
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
    read: null,
    authMatrix: null,
    mutations: null,
  };

  console.log('Admin Attributes Phase 1 capture\n');

  const baseline = await getGlobalDocument(baseUrl, apiKey);
  report.read = {
    status: baseline.status,
    summary: summarizeDocument(baseline),
    rawFirstDocument: baseline.document,
  };
  console.log('GET /global-attribute:', baseline.status, JSON.stringify(report.read.summary));

  if (flags.has('--auth-matrix')) {
    const documentId = baseline.documentId;
    const endpoints = [
      { label: 'GET /global-attribute', method: 'GET', path: '/global-attribute' },
      ...(documentId
        ? [
            // Auth-only probes: invalid document id + noop-ish body avoids mutating the singleton.
            {
              label: 'PUT /global-attribute/{id}',
              method: 'PUT',
              path: '/global-attribute/000000000000000000000000',
              body: { updatedAttributeValue: 'AuthProbeSkip', indexToUpdate: 0 },
            },
            {
              label: 'PUT /global-attribute/add/{id}',
              method: 'PUT',
              path: '/global-attribute/add/000000000000000000000000',
              body: { attributes: `${PROBE_PREFIX}AuthSkip` },
            },
            {
              label: 'DELETE /global-attribute/one/{id}',
              method: 'DELETE',
              path: '/global-attribute/one/000000000000000000000000',
              body: { attributes: `${PROBE_PREFIX}AuthSkip` },
            },
          ]
        : []),
    ];

    report.authMatrix = {};

    for (const endpoint of endpoints) {
      const noAuth = await request(baseUrl, endpoint.method, endpoint.path, '', endpoint.body);
      const badKey = await request(baseUrl, endpoint.method, endpoint.path, 'invalid-key', endpoint.body);
      const keyOnly = await request(baseUrl, endpoint.method, endpoint.path, apiKey, endpoint.body);
      const withBearer = bearer
        ? await request(baseUrl, endpoint.method, endpoint.path, apiKey, endpoint.body, bearer)
        : { status: 'skipped', note: 'Set ADMIN_BEARER_TOKEN to probe Bearer + key' };
      const bearerOnly = bearer
        ? await request(baseUrl, endpoint.method, endpoint.path, '', endpoint.body, bearer)
        : { status: 'skipped', note: 'Set ADMIN_BEARER_TOKEN to probe Bearer without key' };

      report.authMatrix[endpoint.label] = {
        noAuth: noAuth.status,
        badApiKey: badKey.status,
        apiKeyOnly: keyOnly.status,
        bearerPlusKey: withBearer.status,
        bearerOnly: bearerOnly.status,
      };
    }

    console.log('\nAuth matrix:', JSON.stringify(report.authMatrix, null, 2));
  }

  if (flags.has('--mutations')) {
    if (!flags.has('--confirm')) {
      console.error('\n--mutations requires --confirm (mutates staging, then cleans probe names).');
      process.exit(1);
    }

    const documentId = baseline.documentId;
    if (!documentId) {
      throw new Error('No global attribute document found for mutation probes');
    }

    const mutations = {
      documentId,
      baselineAttributes: [...baseline.attributes],
      steps: [],
    };

    const record = (name, detail) => {
      mutations.steps.push({ step: name, ...detail });
      console.log(`${name}:`, JSON.stringify(detail.summary ?? detail));
    };

    // Ensure clean slate for probe names
    await cleanupProbes(baseUrl, apiKey, documentId, bearer);

    const probeA = `${PROBE_PREFIX}Alpha`;
    const probeB = `${PROBE_PREFIX}Beta`;
    const probeRenamed = `${PROBE_PREFIX}Renamed`;

    // ADD — happy path
    const addA = await addAttribute(baseUrl, apiKey, documentId, probeA, bearer);
    const afterAddA = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_happy_path', {
      request: { method: 'PUT', path: `/global-attribute/add/${documentId}`, body: { attributes: probeA } },
      response: { status: addA.status, body: addA.body },
      summary: {
        responseShape: typeof addA.body,
        attributesAfter: afterAddA.attributes,
        appendedAtEnd: afterAddA.attributes[afterAddA.attributes.length - 1] === probeA,
        indexOfAdded: afterAddA.attributes.indexOf(probeA),
      },
    });

    // ADD — duplicate exact
    const addDup = await addAttribute(baseUrl, apiKey, documentId, probeA, bearer);
    const afterDup = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_duplicate_exact', {
      request: { body: { attributes: probeA } },
      response: { status: addDup.status, body: addDup.body },
      summary: {
        duplicateCount: afterDup.attributes.filter((n) => n === probeA).length,
        attributesAfter: afterDup.attributes,
      },
    });

    // ADD — case variant
    const addCase = await addAttribute(baseUrl, apiKey, documentId, probeA.toLowerCase(), bearer);
    const afterCase = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_case_variant', {
      request: { body: { attributes: probeA.toLowerCase() } },
      response: { status: addCase.status, body: addCase.body },
      summary: {
        attributesAfter: afterCase.attributes,
        hasLowercaseVariant: afterCase.attributes.includes(probeA.toLowerCase()),
      },
    });

    // ADD — duplicate existing platform name
    const existingName = baseline.attributes[0];
    const addExistingDup = await addAttribute(baseUrl, apiKey, documentId, existingName, bearer);
    const afterExistingDup = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_duplicate_existing_platform_name', {
      request: { body: { attributes: existingName } },
      response: { status: addExistingDup.status, body: addExistingDup.body },
      summary: {
        existingName,
        duplicateCount: afterExistingDup.attributes.filter((n) => n === existingName).length,
      },
    });

    // ADD — empty string
    const addEmpty = await addAttribute(baseUrl, apiKey, documentId, '', bearer);
    const afterEmpty = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_empty_string', {
      response: { status: addEmpty.status, body: addEmpty.body },
      summary: { hasEmptyEntry: afterEmpty.attributes.includes(''), attributesAfter: afterEmpty.attributes },
    });

    // ADD — whitespace
    const addWhitespace = await addAttribute(baseUrl, apiKey, documentId, '   ', bearer);
    const afterWhitespace = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_whitespace', {
      response: { status: addWhitespace.status, body: addWhitespace.body },
      summary: {
        hasWhitespaceEntry: afterWhitespace.attributes.some((n) => n.trim() === '' && n.length > 0),
        attributesAfter: afterWhitespace.attributes,
      },
    });

    // ADD second probe for rename/delete ordering tests
    const addB = await addAttribute(baseUrl, apiKey, documentId, probeB, bearer);
    const afterAddB = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_second_probe', {
      response: { status: addB.status, body: addB.body },
      summary: { attributesAfter: afterAddB.attributes, probeBIndex: afterAddB.attributes.indexOf(probeB) },
    });

    const probeAIndex = afterAddB.attributes.indexOf(probeA);

    // RENAME — happy path by index
    const rename = await renameAttribute(baseUrl, apiKey, documentId, probeAIndex, probeRenamed, bearer);
    const afterRename = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('rename_happy_path', {
      request: {
        method: 'PUT',
        path: `/global-attribute/${documentId}`,
        body: { updatedAttributeValue: probeRenamed, indexToUpdate: probeAIndex },
      },
      response: { status: rename.status, body: rename.body },
      summary: {
        indexUsed: probeAIndex,
        stillHasOldName: afterRename.attributes.includes(probeA),
        hasNewName: afterRename.attributes.includes(probeRenamed),
        attributesAfter: afterRename.attributes,
      },
    });

    // RENAME — duplicate into existing platform name
    const renamedIndex = afterRename.attributes.indexOf(probeRenamed);
    const renameDup = await renameAttribute(baseUrl, apiKey, documentId, renamedIndex, existingName, bearer);
    const afterRenameDup = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('rename_to_existing_name', {
      request: { body: { updatedAttributeValue: existingName, indexToUpdate: renamedIndex } },
      response: { status: renameDup.status, body: renameDup.body },
      summary: {
        existingNameCount: afterRenameDup.attributes.filter((n) => n === existingName).length,
        attributesAfter: afterRenameDup.attributes,
      },
    });

    // RENAME — empty string
    const currentRenamedIndex = afterRenameDup.attributes.indexOf(probeRenamed);
    const renameEmpty =
      currentRenamedIndex >= 0
        ? await renameAttribute(baseUrl, apiKey, documentId, currentRenamedIndex, '', bearer)
        : { status: 'skipped', body: null };
    const afterRenameEmpty = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('rename_empty_string', {
      response: renameEmpty,
      summary: { hasEmptyEntry: afterRenameEmpty.attributes.includes(''), attributesAfter: afterRenameEmpty.attributes },
    });

    // RENAME — stale index
    const renameStale = await renameAttribute(baseUrl, apiKey, documentId, 9999, `${PROBE_PREFIX}Stale`, bearer);
    record('rename_stale_index', {
      request: { body: { updatedAttributeValue: `${PROBE_PREFIX}Stale`, indexToUpdate: 9999 } },
      response: { status: renameStale.status, body: renameStale.body },
    });

    // DELETE — by name (not index)
    const beforeDeleteB = await getGlobalDocument(baseUrl, apiKey, bearer);
    const deleteB = await deleteAttribute(baseUrl, apiKey, documentId, probeB, bearer);
    const afterDeleteB = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('delete_by_name', {
      request: {
        method: 'DELETE',
        path: `/global-attribute/one/${documentId}`,
        body: { attributes: probeB },
      },
      response: { status: deleteB.status, body: deleteB.body },
      summary: {
        before: beforeDeleteB.attributes,
        after: afterDeleteB.attributes,
        removedProbeB: !afterDeleteB.attributes.includes(probeB),
        orderChanged: beforeDeleteB.attributes.filter((n) => n !== probeB).join('|') !== afterDeleteB.attributes.join('|'),
      },
    });

    // DELETE — nonexistent name
    const deleteMissing = await deleteAttribute(baseUrl, apiKey, documentId, `${PROBE_PREFIX}Missing`, bearer);
    record('delete_missing_name', {
      response: { status: deleteMissing.status, body: deleteMissing.body },
    });

    // ADD after delete
    const addAfterDelete = await addAttribute(baseUrl, apiKey, documentId, `${PROBE_PREFIX}AfterDelete`, bearer);
    const afterAddAfterDelete = await getGlobalDocument(baseUrl, apiKey, bearer);
    record('add_after_delete', {
      response: { status: addAfterDelete.status, body: addAfterDelete.body },
      summary: { attributesAfter: afterAddAfterDelete.attributes },
    });

    // DELETE wrong document id
    const deleteWrongDoc = await deleteAttribute(baseUrl, apiKey, '000000000000000000000000', probeRenamed, bearer);
    record('delete_wrong_document_id', {
      response: { status: deleteWrongDoc.status, body: deleteWrongDoc.body },
    });

    // Cleanup all probe names
    const cleanup = await cleanupProbes(baseUrl, apiKey, documentId, bearer);
    record('cleanup_probes', {
      summary: {
        deleted: cleanup.deleted,
        finalAttributes: cleanup.finalRead.attributes,
        restoredToBaseline:
          JSON.stringify(cleanup.finalRead.attributes) === JSON.stringify(baseline.attributes),
      },
    });

    // Also remove any empty/whitespace entries introduced during probes
    const postCleanupRead = await getGlobalDocument(baseUrl, apiKey, bearer);
    const junkNames = postCleanupRead.attributes.filter((n) => n === '' || (typeof n === 'string' && n.trim() === ''));
    for (const junk of junkNames) {
      await deleteAttribute(baseUrl, apiKey, documentId, junk, bearer);
    }
    const finalRead = await getGlobalDocument(baseUrl, apiKey, bearer);
    mutations.finalAttributes = finalRead.attributes;
    mutations.restoredMatchesBaseline =
      JSON.stringify(finalRead.attributes) === JSON.stringify(baseline.attributes);

    report.mutations = mutations;
  }

  const outPath = path.join(outDir, `admin-attributes-phase1-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

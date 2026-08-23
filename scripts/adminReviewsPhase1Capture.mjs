/**
 * Phase 1 staging verification for Admin Reviews V1.
 *
 * Read-only by default. Status mutations require --mutations --confirm and restore original status.
 *
 * Usage:
 *   node scripts/adminReviewsPhase1Capture.mjs
 *   node scripts/adminReviewsPhase1Capture.mjs --auth-matrix
 *   node scripts/adminReviewsPhase1Capture.mjs --mutations --confirm
 *
 * Optional env for JWT probes:
 *   ADMIN_BEARER_TOKEN          — admin JWT (any admin)
 *   ADMIN_FULL_ACCESS_BEARER    — admin JWT with fullAccess=true
 *   NON_ADMIN_BEARER            — customer/seller JWT without admin role
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VALID_STATUSES = ['Approved', 'Pending', 'Disapproved'];
const INVALID_STATUS = 'Phase1InvalidStatus';
const INVALID_REVIEW_ID = '000000000000000000000000';

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

  return { status: res.status, body: parsed, textLength: text.length };
}

function topLevelKeys(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [];
  }
  return Object.keys(value);
}

function summarizeReviewItem(review) {
  if (!review || typeof review !== 'object') {
    return null;
  }

  const userId = review.UserId;
  const productId = review.productId;

  return {
    _id: review._id,
    reviewStatus: review.reviewStatus,
    title: review.title ?? review.heading ?? null,
    hasReviewText: Boolean(review.reviewText ?? review.comment),
    avgRating: review.avgRating,
    price: review.price,
    value: review.value,
    quality: review.quality,
    isReply: review.isReply ?? false,
    userIdType: typeof userId,
    userName:
      typeof userId === 'object' && userId
        ? `${userId.firstName ?? ''} ${userId.lastName ?? ''}`.trim()
        : null,
    productIdType: typeof productId,
    productName: typeof productId === 'object' && productId ? productId.productName ?? null : null,
    productHasCategory: typeof productId === 'object' && productId ? Boolean(productId.Category) : false,
    fieldKeys: Object.keys(review).sort(),
  };
}

function extractReviewList(body) {
  if (Array.isArray(body)) {
    return { wrapper: 'top-level-array', reviews: body };
  }
  if (body && typeof body === 'object') {
    for (const key of ['reviews', 'data', 'Reviews', 'result']) {
      if (Array.isArray(body[key])) {
        return { wrapper: key, reviews: body[key], topKeys: topLevelKeys(body) };
      }
    }
  }
  return { wrapper: 'unknown', reviews: [], topKeys: topLevelKeys(body) };
}

function uniqueStatuses(reviews) {
  return [...new Set(reviews.map((r) => r?.reviewStatus).filter(Boolean))].sort();
}

function diffKeys(listItem, detailItem) {
  if (!listItem || !detailItem) {
    return { onlyInList: [], onlyInDetail: [] };
  }
  const listKeys = new Set(Object.keys(listItem));
  const detailKeys = new Set(Object.keys(detailItem));
  return {
    onlyInList: [...listKeys].filter((k) => !detailKeys.has(k)).sort(),
    onlyInDetail: [...detailKeys].filter((k) => !listKeys.has(k)).sort(),
  };
}

async function getReviewList(baseUrl, apiKey, bearer, query = '') {
  const path = `/reviews/${query}`;
  const result = await request(baseUrl, 'GET', path, apiKey, undefined, bearer);
  const extracted = extractReviewList(result.body);
  return { ...result, ...extracted };
}

async function getReviewDetail(baseUrl, apiKey, reviewId, bearer) {
  return request(baseUrl, 'GET', `/reviews/${encodeURIComponent(reviewId)}`, apiKey, undefined, bearer);
}

async function updateReviewStatus(baseUrl, apiKey, reviewId, newStatus, bearer) {
  return request(
    baseUrl,
    'PUT',
    `/reviews/${encodeURIComponent(reviewId)}/update-status`,
    apiKey,
    { newStatus },
    bearer,
  );
}

async function main() {
  const env = loadEnv();
  const baseUrl = env.EXPO_PUBLIC_API_URL;
  const apiKey = env.EXPO_PUBLIC_API_KEY;
  const { flags } = parseArgs(process.argv.slice(2));

  const adminBearer = process.env.ADMIN_BEARER_TOKEN || null;
  const fullAccessBearer = process.env.ADMIN_FULL_ACCESS_BEARER || null;
  const nonAdminBearer = process.env.NON_ADMIN_BEARER || null;

  if (!baseUrl || !apiKey) {
    throw new Error('Missing EXPO_PUBLIC_API_URL or EXPO_PUBLIC_API_KEY in .env');
  }

  const outDir = path.join(ROOT, 'scripts', 'captures');
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const report = {
    capturedAt: new Date().toISOString(),
    baseUrl,
    list: null,
    listVariants: null,
    detail: null,
    detailInvalid: null,
    authMatrix: null,
    mutations: null,
    jwtEnv: {
      adminBearer: Boolean(adminBearer),
      fullAccessBearer: Boolean(fullAccessBearer),
      nonAdminBearer: Boolean(nonAdminBearer),
    },
  };

  console.log('Admin Reviews Phase 1 capture\n');

  const list = await getReviewList(baseUrl, apiKey);
  const reviews = list.reviews ?? [];
  const sample = reviews[0] ?? null;
  const sampleId = sample?._id ?? null;

  report.list = {
    status: list.status,
    wrapper: list.wrapper,
    topKeys: list.topKeys ?? (Array.isArray(list.body) ? ['array'] : topLevelKeys(list.body)),
    count: reviews.length,
    uniqueStatuses: uniqueStatuses(reviews),
    sample: summarizeReviewItem(sample),
    textLength: list.textLength,
  };

  console.log('GET /reviews/', list.status, JSON.stringify(report.list, null, 2));

  report.listVariants = {};
  for (const variant of [
    { label: 'no_trailing_slash', path: '/reviews' },
    { label: 'page_limit', path: '/reviews?page=1&limit=10' },
    { label: 'status_approved', path: '/reviews?reviewStatus=Approved' },
    { label: 'status_pending', path: '/reviews?reviewStatus=Pending' },
    { label: 'search_q', path: '/reviews?q=test' },
  ]) {
    const result = await request(baseUrl, 'GET', variant.path, apiKey);
    const extracted = extractReviewList(result.body);
    report.listVariants[variant.label] = {
      status: result.status,
      wrapper: extracted.wrapper,
      count: extracted.reviews.length,
      uniqueStatuses: uniqueStatuses(extracted.reviews),
    };
    console.log(`GET ${variant.path}`, result.status, 'count', extracted.reviews.length);
  }

  if (sampleId) {
    const detail = await getReviewDetail(baseUrl, apiKey, sampleId);
    const detailBody = detail.body;
    report.detail = {
      status: detail.status,
      isObject: detailBody && typeof detailBody === 'object' && !Array.isArray(detailBody),
      topKeys: topLevelKeys(detailBody),
      summary: summarizeReviewItem(detailBody),
      listVsDetailKeyDiff: diffKeys(sample, detailBody),
      textLength: detail.textLength,
    };
    console.log('\nGET /reviews/:id', detail.status, JSON.stringify(report.detail.summary));
  } else {
    report.detail = { skipped: true, reason: 'no reviews in list' };
  }

  const invalidDetail = await getReviewDetail(baseUrl, apiKey, INVALID_REVIEW_ID);
  report.detailInvalid = {
    status: invalidDetail.status,
    bodyPreview:
      typeof invalidDetail.body === 'string'
        ? invalidDetail.body.slice(0, 200)
        : invalidDetail.body,
  };
  console.log('GET invalid id', invalidDetail.status);

  if (flags.has('--auth-matrix')) {
    report.authMatrix = {};
    const authCases = [
      { label: 'no_auth', apiKey: '', bearer: null },
      { label: 'invalid_api_key', apiKey: 'invalid-key', bearer: null },
      { label: 'api_key_only', apiKey, bearer: null },
      { label: 'api_key_plus_admin_jwt', apiKey, bearer: adminBearer },
      { label: 'api_key_plus_full_access_jwt', apiKey, bearer: fullAccessBearer },
      { label: 'api_key_plus_non_admin_jwt', apiKey, bearer: nonAdminBearer },
      { label: 'bearer_only_admin', apiKey: '', bearer: adminBearer },
      { label: 'bearer_only_full_access', apiKey: '', bearer: fullAccessBearer },
    ];

    for (const endpoint of ['GET /reviews/', 'GET /reviews/:id', 'PUT /reviews/:id/update-status']) {
      report.authMatrix[endpoint] = {};
      for (const authCase of authCases) {
        if (
          (authCase.label.includes('jwt') || authCase.label.includes('bearer')) &&
          !authCase.bearer
        ) {
          report.authMatrix[endpoint][authCase.label] = 'skipped_no_token';
          continue;
        }

        let result;
        if (endpoint === 'GET /reviews/') {
          result = await getReviewList(baseUrl, authCase.apiKey, authCase.bearer);
        } else if (endpoint === 'GET /reviews/:id') {
          result = sampleId
            ? await getReviewDetail(baseUrl, authCase.apiKey, sampleId, authCase.bearer)
            : { status: 'skipped_no_sample' };
        } else {
          result = sampleId
            ? await updateReviewStatus(
                baseUrl,
                authCase.apiKey,
                sampleId,
                'Pending',
                authCase.bearer,
              )
            : { status: 'skipped_no_sample' };
        }

        report.authMatrix[endpoint][authCase.label] = result.status;
      }
    }

    console.log('\nAuth matrix:', JSON.stringify(report.authMatrix, null, 2));
  }

  if (flags.has('--mutations')) {
    if (!flags.has('--confirm')) {
      console.error('\n--mutations requires --confirm (mutates staging status, then restores).');
      process.exit(1);
    }

    if (!sampleId) {
      report.mutations = { skipped: true, reason: 'no sample review' };
    } else {
      const mutations = { reviewId: sampleId, steps: [] };
      const record = (step, detail) => {
        mutations.steps.push({ step, ...detail });
        console.log(step, JSON.stringify(detail.summary ?? { status: detail.status, body: detail.body }));
      };

      const baselineDetail = await getReviewDetail(baseUrl, apiKey, sampleId);
      const originalStatus = baselineDetail.body?.reviewStatus ?? 'Pending';
      mutations.originalStatus = originalStatus;

      for (const status of VALID_STATUSES) {
        const put = await updateReviewStatus(baseUrl, apiKey, sampleId, status, adminBearer ?? undefined);
        const afterPut = await getReviewDetail(baseUrl, apiKey, sampleId);
        const listAfter = await getReviewList(baseUrl, apiKey);
        const listItem = listAfter.reviews.find((r) => r._id === sampleId);

        record(`status_to_${status}`, {
          request: { newStatus: status },
          response: {
            status: put.status,
            topKeys: topLevelKeys(put.body),
            body: put.body,
          },
          summary: {
            detailStatus: afterPut.body?.reviewStatus,
            listStatus: listItem?.reviewStatus,
            listMatchesDetail: listItem?.reviewStatus === afterPut.body?.reviewStatus,
          },
        });
      }

      const repeat = await updateReviewStatus(
        baseUrl,
        apiKey,
        sampleId,
        originalStatus,
        adminBearer ?? undefined,
      );
      record('repeat_original_status', {
        response: { status: repeat.status, body: repeat.body },
      });

      const invalidStatus = await updateReviewStatus(
        baseUrl,
        apiKey,
        sampleId,
        INVALID_STATUS,
        adminBearer ?? undefined,
      );
      record('invalid_status', {
        response: { status: invalidStatus.status, body: invalidStatus.body },
      });

      const invalidId = await updateReviewStatus(baseUrl, apiKey, INVALID_REVIEW_ID, 'Pending');
      record('invalid_review_id', {
        response: { status: invalidId.status, body: invalidId.body },
      });

      const restore = await updateReviewStatus(baseUrl, apiKey, sampleId, originalStatus);
      const finalDetail = await getReviewDetail(baseUrl, apiKey, sampleId);
      mutations.restored = finalDetail.body?.reviewStatus === originalStatus;
      mutations.finalStatus = finalDetail.body?.reviewStatus;

      report.mutations = mutations;
    }
  }

  const outPath = path.join(outDir, `admin-reviews-phase1-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

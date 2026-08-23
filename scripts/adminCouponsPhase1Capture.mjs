/**
 * Phase 1 staging verification for Admin Coupons V1.
 *
 * Read-only by default. Mutations require --mutations --confirm and clean up probe coupons.
 *
 * Usage:
 *   node scripts/adminCouponsPhase1Capture.mjs
 *   node scripts/adminCouponsPhase1Capture.mjs --auth-matrix
 *   node scripts/adminCouponsPhase1Capture.mjs --mutations --confirm
 *
 * Optional env:
 *   ADMIN_USER_ID               — userId for GET /coupon/created-by/{id} (defaults: auto-discover)
 *   ADMIN_BEARER_TOKEN          — admin JWT for auth-matrix probes
 *   ADMIN_FULL_ACCESS_BEARER    — fullAccess admin JWT
 *   NON_ADMIN_BEARER            — non-admin JWT
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PROBE_PREFIX = 'Phase1Probe-';
const INVALID_COUPON_ID = '000000000000000000000000';

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

function summarizeCoupon(coupon) {
  if (!coupon || typeof coupon !== 'object') {
    return null;
  }

  const createdBy = coupon.createdBy;

  return {
    _id: coupon._id,
    couponCode: coupon.couponCode,
    couponType: coupon.couponType,
    discountAmount: coupon.discountAmount,
    minimumCartAmount: coupon.minimumCartAmount,
    usageCount: coupon.usageCount,
    usageLimitPerCoupon: coupon.usageLimitPerCoupon,
    usageLimitPerCustomer: coupon.usageLimitPerCustomer,
    expirationDate: coupon.expirationDate,
    hasDescription: Boolean(coupon.description),
    createdByType: typeof createdBy,
    createdById:
      typeof createdBy === 'object' && createdBy
        ? createdBy._id
        : typeof createdBy === 'string'
          ? createdBy
          : null,
    createdByRole:
      typeof createdBy === 'object' && createdBy ? createdBy.userRole ?? null : null,
    fieldKeys: Object.keys(coupon).sort(),
  };
}

function extractCreatedByList(body) {
  if (!body || typeof body !== 'object') {
    return { coupons: [], meta: {} };
  }

  return {
    coupons: Array.isArray(body.coupons) ? body.coupons : [],
    meta: {
      topKeys: topLevelKeys(body),
      totalPages: body.totalPages,
      totalCount: body.totalCount,
      page: body.page,
      limit: body.limit,
      message: body.message,
    },
  };
}

function futureExpirationDate() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 1);
  return date.toISOString().split('T')[0];
}

function buildProbePayload(code, couponType, discountAmount, adminUserId, overrides = {}) {
  return {
    couponCode: code,
    couponType,
    description: 'Phase 1 staging probe',
    discountAmount,
    minimumCartAmount: 10,
    expirationDate: futureExpirationDate(),
    usageLimitPerCoupon: 5,
    usageLimitPerCustomer: 1,
    createdBy: adminUserId,
    ...overrides,
  };
}

function extractCreatedCouponId(body) {
  return body?.coupon?._id ?? body?._id ?? null;
}

async function getAllCoupons(baseUrl, apiKey, bearer) {
  const result = await request(baseUrl, 'GET', '/coupon/', apiKey, undefined, bearer);
  const coupons = Array.isArray(result.body) ? result.body : [];
  return { ...result, coupons };
}

async function getCreatedByPage(baseUrl, apiKey, userId, page = 1, limit = 10, bearer) {
  const query = `?page=${page}&limit=${limit}`;
  const result = await request(
    baseUrl,
    'GET',
    `/coupon/created-by/${encodeURIComponent(userId)}${query}`,
    apiKey,
    undefined,
    bearer,
  );
  const extracted = extractCreatedByList(result.body);
  return { ...result, ...extracted };
}

async function getCouponDetail(baseUrl, apiKey, couponId, bearer) {
  return request(baseUrl, 'GET', `/coupon/${encodeURIComponent(couponId)}`, apiKey, undefined, bearer);
}

async function createCoupon(baseUrl, apiKey, payload, bearer) {
  return request(baseUrl, 'POST', '/coupon', apiKey, payload, bearer);
}

async function updateCoupon(baseUrl, apiKey, couponId, payload, bearer) {
  return request(
    baseUrl,
    'PUT',
    `/coupon/${encodeURIComponent(couponId)}`,
    apiKey,
    payload,
    bearer,
  );
}

async function deleteCoupon(baseUrl, apiKey, couponId, bearer) {
  return request(
    baseUrl,
    'DELETE',
    `/coupon/${encodeURIComponent(couponId)}`,
    apiKey,
    undefined,
    bearer,
  );
}

async function notifyAll(baseUrl, apiKey, couponId, bearer) {
  return request(
    baseUrl,
    'GET',
    `/notifications/send-all/${encodeURIComponent(couponId)}`,
    apiKey,
    undefined,
    bearer,
  );
}

async function discoverAdminUserId(baseUrl, apiKey) {
  if (process.env.ADMIN_USER_ID?.trim()) {
    return process.env.ADMIN_USER_ID.trim();
  }

  const all = await getAllCoupons(baseUrl, apiKey);
  const adminCreator = all.coupons.find(
    (coupon) =>
      typeof coupon.createdBy === 'object' &&
      coupon.createdBy?._id &&
      coupon.createdBy?.userRole === 'admin',
  );
  if (adminCreator?.createdBy?._id) {
    return adminCreator.createdBy._id;
  }

  for (const coupon of all.coupons) {
    const createdBy = coupon.createdBy;
    if (typeof createdBy === 'object' && createdBy?._id) {
      return createdBy._id;
    }
    if (typeof createdBy === 'string' && createdBy.trim()) {
      return createdBy.trim();
    }
  }

  return null;
}

function couponOrderingSnapshot(coupons) {
  return coupons.map((coupon) => ({
    _id: coupon._id,
    couponCode: coupon.couponCode,
    createdAt: coupon.createdAt ?? null,
    updatedAt: coupon.updatedAt ?? null,
    expirationDate: coupon.expirationDate ?? null,
  }));
}

async function probeListOrdering(baseUrl, apiKey, adminUserId) {
  const firstPage = await getCreatedByPage(baseUrl, apiKey, adminUserId, 1, 50);
  const totalPages = firstPage.meta.totalPages ?? 1;
  const allCodes = [...firstPage.coupons];

  for (let page = 2; page <= totalPages; page += 1) {
    const next = await getCreatedByPage(baseUrl, apiKey, adminUserId, page, 50);
    allCodes.push(...next.coupons);
  }

  const snapshots = couponOrderingSnapshot(allCodes);
  const createdAtValues = snapshots
    .map((item) => item.createdAt)
    .filter(Boolean)
    .map((value) => new Date(value).getTime());

  let createdAtMonotonic = 'unknown';
  if (createdAtValues.length >= 2) {
    const ascending = createdAtValues.every(
      (value, index) => index === 0 || value >= createdAtValues[index - 1],
    );
    const descending = createdAtValues.every(
      (value, index) => index === 0 || value <= createdAtValues[index - 1],
    );
    if (ascending && !descending) {
      createdAtMonotonic = 'ascending';
    } else if (descending && !ascending) {
      createdAtMonotonic = 'descending';
    } else if (ascending && descending) {
      createdAtMonotonic = 'flat_or_single';
    } else {
      createdAtMonotonic = 'mixed';
    }
  }

  return {
    totalCollected: snapshots.length,
    totalCount: firstPage.meta.totalCount,
    firstPageCodes: firstPage.coupons.map((c) => c.couponCode),
    allCodes: snapshots.map((s) => s.couponCode),
    hasCreatedAtField: snapshots.some((s) => s.createdAt),
    createdAtMonotonic,
    snapshots: snapshots.slice(0, 10),
  };
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
    adminUserId: null,
    list: null,
    pagination: null,
    listEmptyPage: null,
    listEmptyUser: null,
    listOrdering: null,
    allCoupons: null,
    detail: null,
    detailInvalid: null,
    notify: null,
    authMatrix: null,
    mutations: null,
    jwtEnv: {
      adminBearer: Boolean(adminBearer),
      fullAccessBearer: Boolean(fullAccessBearer),
      nonAdminBearer: Boolean(nonAdminBearer),
    },
  };

  console.log('Admin Coupons Phase 1 capture\n');

  const adminUserId = await discoverAdminUserId(baseUrl, apiKey);
  report.adminUserId = adminUserId;

  if (!adminUserId) {
    console.warn('No ADMIN_USER_ID and no coupons found for auto-discovery.');
  }

  const list = adminUserId
    ? await getCreatedByPage(baseUrl, apiKey, adminUserId, 1, 10)
    : { status: 'skipped', coupons: [], meta: {} };

  const sample = list.coupons?.[0] ?? null;
  const sampleId = sample?._id ?? null;

  report.list = {
    status: list.status,
    meta: list.meta,
    count: list.coupons.length,
    sample: summarizeCoupon(sample),
    textLength: list.textLength,
  };

  console.log('GET /coupon/created-by/:id', list.status, JSON.stringify(report.list, null, 2));

  report.pagination = { skipped: !adminUserId };
  if (adminUserId) {
    const page1 = await getCreatedByPage(baseUrl, apiKey, adminUserId, 1, 2);
    const page2 = await getCreatedByPage(baseUrl, apiKey, adminUserId, 2, 2);
    report.pagination = {
      limit: 2,
      page1: {
        status: page1.status,
        count: page1.coupons.length,
        codes: page1.coupons.map((c) => c.couponCode),
        totalPages: page1.meta.totalPages,
        totalCount: page1.meta.totalCount,
        page: page1.meta.page,
        limitReturned: page1.meta.limit,
      },
      page2: {
        status: page2.status,
        count: page2.coupons.length,
        codes: page2.coupons.map((c) => c.couponCode),
      },
      pagesDistinct:
        page1.coupons[0]?._id && page2.coupons[0]?._id
          ? page1.coupons[0]._id !== page2.coupons[0]._id
          : null,
    };
    console.log('Pagination probe', JSON.stringify(report.pagination, null, 2));

    const beyondPage = (report.pagination.page1?.totalPages ?? 1) + 5;
    const emptyPage = await getCreatedByPage(baseUrl, apiKey, adminUserId, beyondPage, 10);
    report.listEmptyPage = {
      requestedPage: beyondPage,
      status: emptyPage.status,
      count: emptyPage.coupons.length,
      totalPages: emptyPage.meta.totalPages,
      totalCount: emptyPage.meta.totalCount,
      page: emptyPage.meta.page,
    };
    console.log('Empty page probe', JSON.stringify(report.listEmptyPage));

    report.listOrdering = await probeListOrdering(baseUrl, apiKey, adminUserId);
    console.log('Ordering probe', JSON.stringify(report.listOrdering, null, 2));
  }

  const emptyUserList = await getCreatedByPage(baseUrl, apiKey, INVALID_COUPON_ID, 1, 10);
  report.listEmptyUser = {
    status: emptyUserList.status,
    count: emptyUserList.coupons.length,
    meta: emptyUserList.meta,
  };
  console.log('Empty user probe', JSON.stringify(report.listEmptyUser));

  const allCoupons = await getAllCoupons(baseUrl, apiKey);
  report.allCoupons = {
    status: allCoupons.status,
    wrapper: Array.isArray(allCoupons.body) ? 'top-level-array' : topLevelKeys(allCoupons.body),
    count: allCoupons.coupons.length,
    note: 'Tier B seller oversight source — documented only for V1 boundary',
  };
  console.log('GET /coupon/ (Tier B doc)', allCoupons.status, 'count', allCoupons.coupons.length);

  if (sampleId) {
    const detail = await getCouponDetail(baseUrl, apiKey, sampleId);
    report.detail = {
      status: detail.status,
      topKeys: topLevelKeys(detail.body),
      summary: summarizeCoupon(detail.body),
      listVsDetail: {
        listCreatedByType: typeof sample.createdBy,
        detailCreatedByType: typeof detail.body?.createdBy,
      },
      textLength: detail.textLength,
    };
    console.log('\nGET /coupon/:id', detail.status, JSON.stringify(report.detail.summary));
  } else {
    report.detail = { skipped: true, reason: 'no sample coupon in admin list' };
  }

  const invalidDetail = await getCouponDetail(baseUrl, apiKey, INVALID_COUPON_ID);
  report.detailInvalid = { status: invalidDetail.status, body: invalidDetail.body };
  console.log('GET invalid coupon id', invalidDetail.status);

  if (sampleId) {
    const notify = await notifyAll(baseUrl, apiKey, sampleId);
    report.notify = {
      status: notify.status,
      body: notify.body,
      tier: 'B — documented only; not in mobile V1',
    };
    console.log('GET /notifications/send-all/:id (Tier B doc)', notify.status, notify.body);
  }

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
    ];

    const endpoints = [
      {
        name: 'GET /coupon/created-by/:id',
        run: (authCase) =>
          adminUserId
            ? getCreatedByPage(baseUrl, authCase.apiKey, adminUserId, 1, 2, authCase.bearer)
            : { status: 'skipped_no_admin_user' },
      },
      {
        name: 'GET /coupon/:id',
        run: (authCase) =>
          sampleId
            ? getCouponDetail(baseUrl, authCase.apiKey, sampleId, authCase.bearer)
            : { status: 'skipped_no_sample' },
      },
      {
        name: 'POST /coupon',
        run: (authCase) => {
          if (!adminUserId) {
            return { status: 'skipped_no_admin_user' };
          }
          if (authCase.label === 'api_key_only') {
            return createCoupon(
              baseUrl,
              authCase.apiKey,
              buildProbePayload(`${PROBE_PREFIX}Auth${Date.now()}`, 'fixed', 5, adminUserId),
              authCase.bearer,
            );
          }
          return createCoupon(
            baseUrl,
            authCase.apiKey,
            buildProbePayload(`${PROBE_PREFIX}Auth${Date.now()}`, 'fixed', 5, adminUserId),
            authCase.bearer,
          );
        },
      },
      {
        name: 'PUT /coupon/:id',
        run: (authCase) => {
          if (!sampleId) {
            return { status: 'skipped_no_sample' };
          }
          if (authCase.label !== 'api_key_only') {
            return { status: 'skipped_avoid_sample_mutation' };
          }
          return updateCoupon(
            baseUrl,
            authCase.apiKey,
            sampleId,
            { description: 'auth matrix probe' },
            authCase.bearer,
          );
        },
      },
      {
        name: 'DELETE /coupon/:id',
        run: (authCase) => {
          if (authCase.label !== 'api_key_only') {
            return deleteCoupon(baseUrl, authCase.apiKey, INVALID_COUPON_ID, authCase.bearer);
          }
          return { status: 'skipped_avoid_sample_delete' };
        },
      },
      {
        name: 'GET /notifications/send-all/:id',
        run: (authCase) =>
          sampleId
            ? notifyAll(baseUrl, authCase.apiKey, sampleId, authCase.bearer)
            : { status: 'skipped_no_sample' },
      },
    ];

    for (const endpoint of endpoints) {
      report.authMatrix[endpoint.name] = {};
      for (const authCase of authCases) {
        if (
          (authCase.label.includes('jwt') || authCase.label.includes('bearer')) &&
          !authCase.bearer
        ) {
          report.authMatrix[endpoint.name][authCase.label] = 'skipped_no_token';
          continue;
        }

        const result = await endpoint.run(authCase);
        report.authMatrix[endpoint.name][authCase.label] = result.status;
      }
    }

    console.log('\nAuth matrix:', JSON.stringify(report.authMatrix, null, 2));
  }

  if (flags.has('--mutations')) {
    if (!flags.has('--confirm')) {
      console.error('\n--mutations requires --confirm (creates/deletes staging probe coupons).');
      process.exit(1);
    }

    if (!adminUserId) {
      report.mutations = { skipped: true, reason: 'no admin user id' };
    } else {
      const mutations = { adminUserId, createdIds: [], steps: [] };
      const record = (step, detail) => {
        mutations.steps.push({ step, ...detail });
        console.log(step, JSON.stringify(detail.summary ?? { status: detail.status, body: detail.body }));
      };

      const stampCode = Date.now();

      const createPercentage = await createCoupon(
        baseUrl,
        apiKey,
        buildProbePayload(`${PROBE_PREFIX}Pct${stampCode}`, 'percentage', 15, adminUserId),
      );
      const pctId = extractCreatedCouponId(createPercentage.body);
      if (pctId) {
        mutations.createdIds.push(pctId);
      }
      record('create_percentage', {
        status: createPercentage.status,
        body: createPercentage.body,
        summary: { couponId: pctId, topKeys: topLevelKeys(createPercentage.body) },
      });

      const createFixed = await createCoupon(
        baseUrl,
        apiKey,
        buildProbePayload(`${PROBE_PREFIX}Fix${stampCode}`, 'fixed', 8, adminUserId),
      );
      const fixId = extractCreatedCouponId(createFixed.body);
      if (fixId) {
        mutations.createdIds.push(fixId);
      }
      record('create_fixed', {
        status: createFixed.status,
        body: createFixed.body,
        summary: { couponId: fixId },
      });

      if (pctId) {
        const duplicate = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`${PROBE_PREFIX}Pct${stampCode}`, 'percentage', 15, adminUserId),
        );
        record('duplicate_code', {
          status: duplicate.status,
          body: duplicate.body,
        });

        const invalidType = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`${PROBE_PREFIX}BadType${stampCode}`, 'bogus', 5, adminUserId),
        );
        record('invalid_coupon_type', {
          status: invalidType.status,
          body: invalidType.body,
        });

        const highPercentage = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`${PROBE_PREFIX}Pct150${stampCode}`, 'percentage', 150, adminUserId),
        );
        const highPctId = extractCreatedCouponId(highPercentage.body);
        if (highPctId) {
          mutations.createdIds.push(highPctId);
        }
        record('percentage_over_100', {
          status: highPercentage.status,
          body: highPercentage.body,
          summary: { accepted: highPercentage.status === 201, couponId: highPctId },
        });

        const minCartZero = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`${PROBE_PREFIX}Min0${stampCode}`, 'fixed', 5, adminUserId, {
            minimumCartAmount: 0,
          }),
        );
        const minZeroId = extractCreatedCouponId(minCartZero.body);
        if (minZeroId) {
          mutations.createdIds.push(minZeroId);
        }
        record('minimum_cart_zero', {
          status: minCartZero.status,
          body: minCartZero.body,
        });

        const pastDate = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`${PROBE_PREFIX}Past${stampCode}`, 'fixed', 5, adminUserId, {
            expirationDate: '2020-01-01',
          }),
        );
        const pastId = extractCreatedCouponId(pastDate.body);
        if (pastId) {
          mutations.createdIds.push(pastId);
        }
        record('past_expiration_date', {
          status: pastDate.status,
          body: pastDate.body,
        });

        const shortCode = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload('AB', 'fixed', 5, adminUserId),
        );
        record('short_coupon_code', {
          status: shortCode.status,
          body: shortCode.body,
        });

        const longCode = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`${'A'.repeat(33)}${stampCode}`, 'fixed', 5, adminUserId),
        );
        record('long_coupon_code', {
          status: longCode.status,
          body: longCode.body,
        });

        const spaceCode = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`BAD CODE${stampCode}`, 'fixed', 5, adminUserId),
        );
        record('space_in_coupon_code', {
          status: spaceCode.status,
          body: spaceCode.body,
        });

        const underscoreCode = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`BAD_CODE${stampCode}`, 'fixed', 5, adminUserId),
        );
        record('underscore_in_coupon_code', {
          status: underscoreCode.status,
          body: underscoreCode.body,
        });

        const fixedZero = await createCoupon(
          baseUrl,
          apiKey,
          buildProbePayload(`${PROBE_PREFIX}Fix0${stampCode}`, 'fixed', 0, adminUserId),
        );
        const fixZeroId = extractCreatedCouponId(fixedZero.body);
        if (fixZeroId) {
          mutations.createdIds.push(fixZeroId);
        }
        record('fixed_discount_zero', {
          status: fixedZero.status,
          body: fixedZero.body,
        });

        const missingFields = await createCoupon(baseUrl, apiKey, {
          couponCode: `${PROBE_PREFIX}Missing${stampCode}`,
        });
        const missingId = extractCreatedCouponId(missingFields.body);
        if (missingId) {
          mutations.createdIds.push(missingId);
        }
        record('missing_required_fields', {
          status: missingFields.status,
          body: missingFields.body,
        });

        const noOwnerPayload = buildProbePayload(
          `${PROBE_PREFIX}NoOwner${stampCode}`,
          'fixed',
          5,
          adminUserId,
        );
        delete noOwnerPayload.createdBy;
        const noCreatedByResult = await createCoupon(baseUrl, apiKey, noOwnerPayload);
        const noOwnerId = extractCreatedCouponId(noCreatedByResult.body);
        if (noOwnerId) {
          mutations.createdIds.push(noOwnerId);
        }
        record('post_without_createdBy', {
          status: noCreatedByResult.status,
          body: noCreatedByResult.body,
          summary: { createdByOnCoupon: noCreatedByResult.body?.coupon?.createdBy ?? null },
        });

        const putInvalidId = await updateCoupon(baseUrl, apiKey, INVALID_COUPON_ID, {
          description: 'invalid id probe',
        });
        record('put_invalid_id', {
          status: putInvalidId.status,
          body: putInvalidId.body,
        });

        const allCoupons = await getAllCoupons(baseUrl, apiKey);
        const crossEditCandidate = allCoupons.coupons.find((coupon) => {
          const ownerId =
            typeof coupon.createdBy === 'object'
              ? coupon.createdBy?._id
              : typeof coupon.createdBy === 'string'
                ? coupon.createdBy
                : null;
          return coupon._id && ownerId && ownerId !== adminUserId;
        });

        if (crossEditCandidate?._id) {
          const crossBefore = await getCouponDetail(baseUrl, apiKey, crossEditCandidate._id);
          const crossOwner =
            typeof crossEditCandidate.createdBy === 'object'
              ? crossEditCandidate.createdBy._id
              : crossEditCandidate.createdBy;
          const crossPut = await updateCoupon(baseUrl, apiKey, crossEditCandidate._id, {
            ...crossBefore.body,
            expirationDate: String(crossBefore.body.expirationDate).split('T')[0],
            description: 'phase1 cross-edit probe',
            createdBy: adminUserId,
          });
          const crossAfter = await getCouponDetail(baseUrl, apiKey, crossEditCandidate._id);
          record('cross_edit_other_creator', {
            status: crossPut.status,
            summary: {
              couponId: crossEditCandidate._id,
              ownerBefore: crossOwner,
              createdByAfter: crossAfter.body?.createdBy,
              ownerChanged: crossAfter.body?.createdBy !== crossOwner,
            },
          });
          await updateCoupon(baseUrl, apiKey, crossEditCandidate._id, {
            ...crossAfter.body,
            expirationDate: String(crossAfter.body.expirationDate).split('T')[0],
            description: crossBefore.body?.description ?? '',
            createdBy: crossOwner,
          });
        } else {
          record('cross_edit_other_creator', {
            skipped: true,
            reason: 'no coupon from different creator found',
          });
        }

        const beforeEdit = await getCouponDetail(baseUrl, apiKey, pctId);
        const originalCreatedBy = beforeEdit.body?.createdBy;

        const putWrongOwner = await updateCoupon(baseUrl, apiKey, pctId, {
          ...beforeEdit.body,
          expirationDate: String(beforeEdit.body.expirationDate).split('T')[0],
          description: 'edited with wrong createdBy',
          discountAmount: 25,
          createdBy: INVALID_COUPON_ID,
        });
        const afterWrongOwner = await getCouponDetail(baseUrl, apiKey, pctId);
        record('edit_with_wrong_createdBy', {
          status: putWrongOwner.status,
          bodyTopKeys: topLevelKeys(putWrongOwner.body),
          summary: {
            originalCreatedBy,
            afterCreatedBy: afterWrongOwner.body?.createdBy,
            createdByChanged: afterWrongOwner.body?.createdBy !== originalCreatedBy,
          },
        });

        const putPreserve = await updateCoupon(baseUrl, apiKey, pctId, {
          couponCode: afterWrongOwner.body.couponCode,
          couponType: afterWrongOwner.body.couponType,
          discountAmount: 22,
          minimumCartAmount: afterWrongOwner.body.minimumCartAmount,
          expirationDate: String(afterWrongOwner.body.expirationDate).split('T')[0],
          usageLimitPerCoupon: afterWrongOwner.body.usageLimitPerCoupon,
          usageLimitPerCustomer: afterWrongOwner.body.usageLimitPerCustomer,
          description: 'restore createdBy',
          createdBy: originalCreatedBy,
        });
        const afterPreserve = await getCouponDetail(baseUrl, apiKey, pctId);
        record('edit_restore_createdBy', {
          status: putPreserve.status,
          summary: {
            createdBy: afterPreserve.body?.createdBy,
            discountAmount: afterPreserve.body?.discountAmount,
          },
        });

        const putPartial = await updateCoupon(baseUrl, apiKey, pctId, {
          description: 'partial update only',
        });
        const afterPartial = await getCouponDetail(baseUrl, apiKey, pctId);
        record('edit_partial_payload', {
          status: putPartial.status,
          bodyTopKeys: topLevelKeys(putPartial.body),
          summary: {
            createdBy: afterPartial.body?.createdBy,
            description: afterPartial.body?.description,
          },
        });
      }

      for (const couponId of [...new Set(mutations.createdIds)]) {
        const deleted = await deleteCoupon(baseUrl, apiKey, couponId);
        record(`delete_${couponId.slice(-6)}`, {
          status: deleted.status,
          body: deleted.body,
        });
      }

      const deleteInvalid = await deleteCoupon(baseUrl, apiKey, INVALID_COUPON_ID);
      record('delete_invalid_id', {
        status: deleteInvalid.status,
        body: deleteInvalid.body,
      });

      report.mutations = mutations;
    }
  }

  report.exitCriteria = {
    listContract: Boolean(report.list?.status === 200 && report.pagination?.pagesDistinct),
    createContract: Boolean(
      report.mutations?.steps?.some((s) => s.step === 'create_percentage' && s.status === 201) &&
        report.mutations?.steps?.some((s) => s.step === 'create_fixed' && s.status === 201),
    ),
    editContract: Boolean(report.mutations?.steps?.some((s) => s.step === 'edit_partial_payload')),
    deleteContract: Boolean(
      report.mutations?.steps?.some((s) => s.step === 'delete_invalid_id' && s.status === 404),
    ),
    validationContract: Boolean(report.mutations?.steps?.some((s) => s.step === 'duplicate_code')),
    authContract: Boolean(report.authMatrix?.['GET /coupon/created-by/:id']?.api_key_only === 200),
    notificationBoundary: Boolean(report.notify?.status === 200),
  };

  const outPath = path.join(outDir, `admin-coupons-phase1-${stamp}.json`);
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

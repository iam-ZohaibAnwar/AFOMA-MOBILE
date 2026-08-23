/**
 * Controlled staging capture for Admin Commission Phase 3 mutations.
 *
 * Read-only by default. Mutations require explicit flags — POST may send real Korapay email.
 *
 * Usage:
 *   node scripts/adminCommissionPhase3Capture.mjs                     # read-only probe
 *   node scripts/adminCommissionPhase3Capture.mjs --auth-matrix       # auth tests
 *   node scripts/adminCommissionPhase3Capture.mjs --candidates        # list safe initiate candidates
 *   node scripts/adminCommissionPhase3Capture.mjs --build-payload <commissionId>
 *   node scripts/adminCommissionPhase3Capture.mjs --initiate <commissionId> --confirm
 *   node scripts/adminCommissionPhase3Capture.mjs --status <commissionId> --to Paid --confirm
 *   node scripts/adminCommissionPhase3Capture.mjs --status <commissionId> --to Pending --confirm
 *
 * Optional: --bearer <jwt> to test with admin session token
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

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
  const flags = new Set();
  const positional = [];

  for (const arg of argv) {
    if (arg.startsWith('--')) {
      flags.add(arg);
    } else {
      positional.push(arg);
    }
  }

  return { flags, positional };
}

/** Web parity — returns full synthetic row objects (POST body shape). */
function distributeCartToOrders(orders, roleFilter = '') {
  const groupedOrdersByOrderId = {};

  orders.forEach((order) => {
    const orderId = order?.orderId?._id;
    if (!orderId) {
      return;
    }
    if (!groupedOrdersByOrderId[orderId]) {
      groupedOrdersByOrderId[orderId] = [];
    }
    groupedOrdersByOrderId[orderId].push(order);
  });

  const finalOrders = [];

  Object.values(groupedOrdersByOrderId).forEach((orderGroup) => {
    const orderMeta = orderGroup.find((o) => o?.orderId) || orderGroup[0];
    const cartItems = orderMeta?.orderId?.cart || [];

    const cartBySeller = {};
    const sellerDetailsMap = {};

    cartItems.forEach((item) => {
      const sellerId = item.productData?.seller?._id;
      if (!sellerId) {
        return;
      }
      if (!cartBySeller[sellerId]) {
        cartBySeller[sellerId] = [];
        sellerDetailsMap[sellerId] = item.productData?.seller;
      }
      cartBySeller[sellerId].push(item);
    });

    if (roleFilter === 'seller' || roleFilter === '') {
      Object.entries(cartBySeller).forEach(([sellerId, sellerCart]) => {
        let totalCommission = 0;
        let totalPayout = 0;
        let sellerCommission = null;

        orderGroup.forEach((order) => {
          if (order.seller?._id === sellerId) {
            if (!sellerCommission) {
              sellerCommission = order;
            }
            totalCommission += Number(order.commissionAmount || 0);
            totalPayout += Number(order.payoutAmount || 0);
          }
        });

        if (!sellerCommission) {
          return;
        }

        finalOrders.push({
          ...sellerCommission,
          type: 'seller',
          seller: sellerDetailsMap[sellerId] || sellerCommission.seller,
          orderId: {
            ...sellerCommission.orderId,
            cart: sellerCart,
          },
          totalCommission,
          totalPayout,
        });
      });
    }

    if (roleFilter === 'affiliate' || roleFilter === '') {
      let totalAffiliateCommission = 0;
      let affiliatPayout = 0;
      let affiliateUser = null;
      let affiliateCommission = null;

      orderGroup.forEach((order) => {
        if (order.userId?._id && order.affiliateAmount) {
          if (!affiliateCommission) {
            affiliateCommission = order;
          }
          affiliateUser = order.userId;
          totalAffiliateCommission += Number(order.commissionAmount || 0);
          affiliatPayout += Number(order.affiliateAmount || 0);
        }
      });

      if (affiliateCommission) {
        finalOrders.push({
          ...affiliateCommission,
          type: 'affiliate',
          affiliate: affiliateUser,
          orderId: {
            ...affiliateCommission.orderId,
            cart: [],
          },
          totalCommission: totalAffiliateCommission,
          affiliatPayout,
        });
      }
    }

    if (roleFilter === 'referral' || roleFilter === '') {
      let totalReferralCommission = 0;
      let referralPayout = 0;
      let referralUser = null;
      let referralCommission = null;

      orderGroup.forEach((order) => {
        if (order.userId?._id && order.referralAmount) {
          if (!referralCommission) {
            referralCommission = order;
          }
          referralUser = order.userId;
          totalReferralCommission += Number(order.commissionAmount || 0);
          referralPayout += Number(order.referralAmount || 0);
        }
      });

      if (referralCommission) {
        finalOrders.push({
          ...referralCommission,
          type: 'referral',
          referral: referralUser,
          orderId: {
            ...referralCommission.orderId,
            cart: [],
          },
          totalCommission: totalReferralCommission,
          referralPayout,
        });
      }
    }
  });

  return finalOrders;
}

async function apiFetch(base, pathSuffix, { method = 'GET', apiKey, bearer, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  const started = Date.now();
  const response = await fetch(`${base}${pathSuffix}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }

  return {
    status: response.status,
    elapsedMs: Date.now() - started,
    json,
    headers: Object.fromEntries(response.headers.entries()),
  };
}

function findSyntheticRowForCommissionId(records, commissionId, roleFilter = '') {
  const match = records.find((record) => record._id === commissionId);
  if (!match) {
    return null;
  }

  const orderId = match.orderId?._id;
  const sameOrderRecords = records.filter((record) => record.orderId?._id === orderId);
  const syntheticRows = distributeCartToOrders(sameOrderRecords, roleFilter);
  return syntheticRows.find((row) => row._id === commissionId) ?? null;
}

async function fetchCommissionPage(base, apiKey, page, query = '') {
  const response = await apiFetch(base, `/commission?page=${page}&limit=10${query}`, { apiKey });
  return response.json;
}

async function fetchCommissionById(base, apiKey, commissionId) {
  const response = await apiFetch(base, `/commission/${encodeURIComponent(commissionId)}`, { apiKey });
  return response;
}

function writeCapture(filename, data) {
  const outPath = path.join(ROOT, 'scripts', 'captures', filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
  console.log(`\nCapture written: ${outPath}`);
  return outPath;
}

async function runAuthMatrix(base, apiKey, bearer) {
  const cases = [
    { label: 'no auth', headers: {} },
    { label: 'invalid x-api-key', apiKey: 'invalid' },
    { label: 'valid x-api-key only', apiKey },
    { label: 'invalid bearer only', bearer: 'invalidtoken' },
    { label: 'valid x-api-key + bearer', apiKey, bearer },
  ];

  const results = [];

  for (const testCase of cases) {
    const response = await apiFetch(base, '/commission?page=1&limit=1', testCase);
    results.push({
      case: testCase.label,
      status: response.status,
      sample: typeof response.json === 'object' ? Object.keys(response.json) : response.json,
    });
    console.log(`${testCase.label}: HTTP ${response.status}`);
  }

  return results;
}

async function listCandidates(base, apiKey) {
  const candidates = [];

  for (let page = 1; page <= 5; page += 1) {
    const data = await fetchCommissionPage(base, apiKey, page, '&payoutStatus=Pending');
    const records = data.commissions ?? [];

    records.forEach((record) => {
      if (record.payoutStatus === 'Pending' && record.isPayout !== true) {
        candidates.push({
          commissionId: record._id,
          orderId: record.orderId?._id,
          payoutAmount: record.payoutAmount,
          affiliateAmount: record.affiliateAmount,
          referralAmount: record.referralAmount,
          seller: record.seller
            ? `${record.seller.firstName ?? ''} ${record.seller.lastName ?? ''}`.trim()
            : null,
          typeGuess: record.seller?._id
            ? 'seller'
            : record.affiliateAmount
              ? 'affiliate'
              : record.referralAmount
                ? 'referral'
                : 'unknown',
        });
      }
    });
  }

  const sorted = candidates
    .sort((a, b) => Number(a.payoutAmount ?? a.referralAmount ?? a.affiliateAmount ?? 999) - Number(b.payoutAmount ?? b.referralAmount ?? b.affiliateAmount ?? 999))
    .slice(0, 15);

  console.log('\nInitiate candidates (Pending + isPayout=false, lowest amounts first):');
  sorted.forEach((row, index) => {
    console.log(
      `${index + 1}. ${row.commissionId} | ${row.typeGuess} | payout=${row.payoutAmount ?? '—'} aff=${row.affiliateAmount ?? '—'} ref=${row.referralAmount ?? '—'} | seller=${row.seller ?? '—'}`,
    );
  });

  return sorted;
}

async function buildPayloadCapture(base, apiKey, commissionId) {
  const detail = await fetchCommissionById(base, apiKey, commissionId);
  const listPage = await fetchCommissionPage(base, apiKey, 1);
  let pageRecords = listPage.commissions ?? [];

  const inPage = pageRecords.some((record) => record._id === commissionId);
  if (!inPage) {
    for (let page = 1; page <= 20; page += 1) {
      const pageData = await fetchCommissionPage(base, apiKey, page);
      pageRecords = pageData.commissions ?? [];
      if (pageRecords.some((record) => record._id === commissionId)) {
        break;
      }
    }
  }

  const synthetic = findSyntheticRowForCommissionId(pageRecords, commissionId);
  const payload = synthetic ?? detail.json;

  return {
    commissionId,
    getById: detail,
    syntheticRow: synthetic,
    postBodyTopLevelKeys: synthetic ? Object.keys(synthetic).sort() : null,
    postBodyHasFilteredCart: Boolean(synthetic?.orderId?.cart),
    postBodyCartLength: synthetic?.orderId?.cart?.length ?? null,
    inferredContract: {
      bodyIsRawRecord: !synthetic,
      bodyIsSyntheticRow: Boolean(synthetic),
      commissionIdField: synthetic?._id ?? detail.json?._id,
      addedFieldsVsRaw: synthetic
        ? ['type', 'totalCommission', 'totalPayout', 'affiliatPayout', 'referralPayout', 'affiliate', 'referral'].filter(
            (key) => key in synthetic,
          )
        : [],
    },
    payloadPreview: synthetic
      ? {
          _id: synthetic._id,
          type: synthetic.type,
          payoutStatus: synthetic.payoutStatus,
          isPayout: synthetic.isPayout,
          totalCommission: synthetic.totalCommission,
          totalPayout: synthetic.totalPayout,
          affiliatPayout: synthetic.affiliatPayout,
          referralPayout: synthetic.referralPayout,
          orderId: {
            _id: synthetic.orderId?._id,
            cartItemCount: synthetic.orderId?.cart?.length ?? 0,
          },
        }
      : null,
    fullPostBody: synthetic,
  };
}

async function initiateCapture(base, apiKey, bearer, commissionId) {
  const before = await fetchCommissionById(base, apiKey, commissionId);
  const payloadCapture = await buildPayloadCapture(base, apiKey, commissionId);
  const body = payloadCapture.fullPostBody;

  if (!body) {
    throw new Error(`Could not build synthetic POST body for ${commissionId}`);
  }

  console.log('\nPOST /commission/payout-link-kora');
  console.log('Body top-level keys:', Object.keys(body).sort().join(', '));
  console.log('Body _id:', body._id, '| type:', body.type);

  const post = await apiFetch(base, '/commission/payout-link-kora', {
    method: 'POST',
    apiKey,
    bearer,
    body,
  });

  await new Promise((resolve) => setTimeout(resolve, 1500));

  const after = await fetchCommissionById(base, apiKey, commissionId);
  const listRefresh = await fetchCommissionPage(base, apiKey, 1, '&payoutStatus=Pending');

  return {
    commissionId,
    request: {
      method: 'POST',
      path: '/commission/payout-link-kora',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '(redacted)',
        Authorization: bearer ? 'Bearer (redacted)' : undefined,
      },
      bodyTopLevelKeys: Object.keys(body).sort(),
      bodyPreview: payloadCapture.payloadPreview,
      fullBody: body,
    },
    response: post,
    before: before.json,
    after: after.json,
    followUp: {
      isPayoutBefore: before.json?.isPayout,
      isPayoutAfter: after.json?.isPayout,
      payoutStatusBefore: before.json?.payoutStatus,
      payoutStatusAfter: after.json?.payoutStatus,
      listRefreshIssued: true,
      listRefreshSampleCount: listRefresh.commissions?.length ?? 0,
    },
    emailLinkExpectedFormats: [
      '/get-paid?token=<commissionId>',
      '/get-paid?commissionId=<commissionId>',
      '/payout?token=<commissionId>',
    ],
    emailLinkNote: 'Inspect Mailjet email manually — backend URL not returned in API response observed here.',
  };
}

async function statusCapture(base, apiKey, bearer, commissionId, newPayoutStatus) {
  const before = await fetchCommissionById(base, apiKey, commissionId);

  const put = await apiFetch(base, `/commission/updatePayoutStatus/${encodeURIComponent(commissionId)}`, {
    method: 'PUT',
    apiKey,
    bearer,
    body: { newPayoutStatus },
  });

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const after = await fetchCommissionById(base, apiKey, commissionId);

  return {
    commissionId,
    request: {
      method: 'PUT',
      path: `/commission/updatePayoutStatus/${commissionId}`,
      body: { newPayoutStatus },
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': '(redacted)',
        Authorization: bearer ? 'Bearer (redacted)' : undefined,
      },
    },
    response: put,
    before: before.json,
    after: after.json,
  };
}

async function main() {
  const env = loadEnv();
  const base = env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  const apiKey = env.EXPO_PUBLIC_API_KEY;
  const { flags, positional } = parseArgs(process.argv.slice(2));

  const bearerFlagIndex = process.argv.indexOf('--bearer');
  const bearer = bearerFlagIndex >= 0 ? process.argv[bearerFlagIndex + 1] : undefined;

  if (!base || !apiKey) {
    throw new Error('EXPO_PUBLIC_API_URL and EXPO_PUBLIC_API_KEY required in .env');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const capture = { timestamp, base, mode: 'read-only' };

  if (flags.has('--auth-matrix')) {
    capture.authMatrix = await runAuthMatrix(base, apiKey, bearer);
    capture.mode = 'auth-matrix';
  }

  if (flags.has('--candidates') || flags.size === 0) {
    capture.candidates = await listCandidates(base, apiKey);
  }

  const buildPayloadId = flags.has('--build-payload') ? positional[0] : null;
  if (buildPayloadId) {
    capture.payload = await buildPayloadCapture(base, apiKey, buildPayloadId);
    capture.mode = 'build-payload';
    console.log('\nInferred contract:', capture.payload.inferredContract);
  }

  const initiateId = flags.has('--initiate') ? positional[0] : null;
  if (initiateId) {
    if (!flags.has('--confirm')) {
      throw new Error('Refusing POST without --confirm (may send real Korapay email)');
    }
    capture.initiate = await initiateCapture(base, apiKey, bearer, initiateId);
    capture.mode = 'initiate';
    console.log('\nInitiate result:', capture.initiate.response.status);
    console.log('isPayout:', capture.initiate.followUp.isPayoutBefore, '→', capture.initiate.followUp.isPayoutAfter);
    console.log('payoutStatus:', capture.initiate.followUp.payoutStatusBefore, '→', capture.initiate.followUp.payoutStatusAfter);
  }

  const statusId = flags.has('--status') ? positional[0] : null;
  const toFlagIndex = process.argv.indexOf('--to');
  const newStatus = toFlagIndex >= 0 ? process.argv[toFlagIndex + 1] : undefined;

  if (statusId) {
    if (!flags.has('--confirm')) {
      throw new Error('Refusing PUT without --confirm');
    }
    if (!newStatus) {
      throw new Error('--status requires --to Pending|Paid');
    }
    capture.statusUpdate = await statusCapture(base, apiKey, bearer, statusId, newStatus);
    capture.mode = 'status-update';
    console.log('\nStatus update result:', capture.statusUpdate.response.status);
    console.log(
      'payoutStatus:',
      capture.statusUpdate.before?.payoutStatus,
      '→',
      capture.statusUpdate.after?.payoutStatus,
    );
  }

  writeCapture(`phase3-capture-${timestamp}.json`, capture);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

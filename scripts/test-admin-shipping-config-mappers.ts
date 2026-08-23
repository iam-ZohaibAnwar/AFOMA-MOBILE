/**
 * Regression checks for admin shipping matrix mappers.
 *
 *   npx --yes tsx scripts/test-admin-shipping-config-mappers.ts
 */

import assert from 'node:assert/strict';

import {
  buildShippingConfigSavePayload,
  mapApiMatrixToUiMap,
  migrateMatrixForTierChange,
  rebuildMatrixForTiers,
  validateAdminShippingTierDraft,
  validateAdminShippingTierNameUnique,
} from '../src/features/admin/settings/utils/adminShippingConfigMappers';

const tiers = [
  { tierName: 'North America', countires: ['Canada', 'United States'] },
  { tierName: 'Europe', countires: ['United Kingdom', 'France'] },
];

assert.deepEqual(mapApiMatrixToUiMap([{ from: 'North America', to: 'Europe', surcharge: 12 }]), {
  'North America': { Europe: '12' },
});

const rebuilt = rebuildMatrixForTiers(tiers, {
  'North America': { Europe: '12' },
});
assert.equal(rebuilt['North America'].Europe, '12');
assert.equal(rebuilt['North America']['North America'], '0');
assert.equal(rebuilt.Europe['North America'], '0');

const renamed = migrateMatrixForTierChange(
  tiers,
  [{ tierName: 'NA', countires: tiers[0].countires }, tiers[1]],
  rebuilt,
  0,
);
assert.equal(renamed.NA.Europe, '12');

const payload = buildShippingConfigSavePayload({
  configId: 'cfg-1',
  tiers,
  matrix: rebuilt,
});

assert.equal(payload._id, 'cfg-1');
assert.equal(payload.tiers.length, 2);
assert.equal(payload.tiers[0].countires[0], 'Canada');
assert.equal(payload.matrix.length, 4);
assert.equal(
  payload.matrix.find((entry) => entry.from === 'North America' && entry.to === 'Europe')?.surcharge,
  12,
);
assert.equal(
  payload.matrix.find((entry) => entry.from === 'Europe' && entry.to === 'North America')?.surcharge,
  0,
);

assert.equal(validateAdminShippingTierDraft({ tierName: '', countires: [] }), 'Tier name is required.');
assert.equal(
  validateAdminShippingTierNameUnique({ tierName: 'Europe', countires: ['France'] }, tiers, null),
  'Tier name must be unique.',
);

console.log('admin shipping config mapper tests passed');

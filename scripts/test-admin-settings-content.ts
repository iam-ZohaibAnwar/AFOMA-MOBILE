/**
 * Regression checks for admin settings content parse/stringify (Phase 2 foundation).
 *
 *   npx --yes tsx scripts/test-admin-settings-content.ts
 */

import assert from 'node:assert/strict';

import {
  parseAdminCommissionRateContent,
  parseAdminFeaturedShopsContent,
  stringifyAdminCommissionRateContent,
  stringifyAdminFeaturedShopsContent,
  validateAdminCommissionRateValue,
  validateAdminFeaturedShopsSelection,
} from '../src/features/admin/settings/utils/adminSettingsContent';
import {
  parseAdminCommissionRateInput,
  sanitizeAdminCommissionRateInput,
} from '../src/features/admin/settings/utils/adminCommissionRateInput';

assert.equal(parseAdminCommissionRateContent('"3"'), 3);
assert.equal(parseAdminCommissionRateContent('3'), 3);
assert.equal(stringifyAdminCommissionRateContent(3), '"3"');

const shops = [
  { id: 'a', fullName: 'Alpha', userRole: 'seller' },
  { id: 'b', fullName: 'Beta', userRole: 'seller' },
];
const shopsJson = stringifyAdminFeaturedShopsContent(shops);
const parsedShops = parseAdminFeaturedShopsContent(shopsJson);
assert.equal(parsedShops.length, 2);
assert.equal(parsedShops[0].id, 'a');
assert.equal(parsedShops[1].fullName, 'Beta');

assert.equal(validateAdminCommissionRateValue(9), null);
assert.match(validateAdminCommissionRateValue(10) ?? '', /between 0 and 9/);

assert.equal(validateAdminFeaturedShopsSelection(shops), null);
assert.match(
  validateAdminFeaturedShopsSelection([...shops, shops[0], { id: 'c' }]) ?? '',
  /up to 3/,
);

assert.equal(sanitizeAdminCommissionRateInput('12'), '9');
assert.equal(sanitizeAdminCommissionRateInput('3.5'), '3');
assert.equal(sanitizeAdminCommissionRateInput('abc'), '');
assert.equal(parseAdminCommissionRateInput('7'), 7);

const payload = stringifyAdminFeaturedShopsContent([
  { id: 'seller-1', fullName: 'Alpha', email: 'a@test.com', userRole: 'seller' },
]);
assert.match(payload, /seller-1/);
assert.match(payload, /a@test.com/);
assert.doesNotMatch(payload, /^\[\s*"seller-1"/);

console.log('admin settings content tests passed');

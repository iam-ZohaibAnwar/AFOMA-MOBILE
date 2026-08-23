/**
 * Regression checks for admin CSV export helpers.
 *
 *   npx --yes tsx scripts/test-admin-csv-export.ts
 */

import assert from 'node:assert/strict';

import { validateAdminCsvDateInput } from '../src/features/admin/settings/utils/adminCsvExportValidation';

assert.equal(validateAdminCsvDateInput(''), null);
assert.equal(validateAdminCsvDateInput('2026-01-15'), null);
assert.match(validateAdminCsvDateInput('15-01-2026') ?? '', /YYYY-MM-DD/);

console.log('admin csv export tests passed');

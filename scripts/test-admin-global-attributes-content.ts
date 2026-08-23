/**
 * Regression checks for admin global attributes parse + validation helpers.
 *
 *   npx --yes tsx scripts/test-admin-global-attributes-content.ts
 */

import assert from 'node:assert/strict';

import {
  getSingletonGlobalAttributeDocument,
  parseGlobalAttributeDocument,
  parseGlobalAttributeEntries,
  parseGlobalAttributeNames,
} from '../src/features/admin/attributes/utils/adminGlobalAttributesContent';
import {
  normalizeGlobalAttributeName,
  validateAddGlobalAttributeName,
  validateRenameGlobalAttributeName,
} from '../src/features/admin/attributes/utils/adminGlobalAttributeValidation';

const singletonResponse = [
  {
    _id: 'doc-1',
    attributes: ['Texture', null, 'Size', '', '   '],
  },
];

assert.deepEqual(getSingletonGlobalAttributeDocument(singletonResponse)?._id, 'doc-1');
assert.equal(getSingletonGlobalAttributeDocument([]), null);

assert.deepEqual(parseGlobalAttributeNames(['Texture', null, 'Size']), ['Texture', 'Size']);
assert.deepEqual(parseGlobalAttributeNames(undefined), []);

assert.deepEqual(parseGlobalAttributeEntries(['Texture', null, 'Size']), [
  { name: 'Texture', rawIndex: 0 },
  { name: 'Size', rawIndex: 2 },
]);

const parsed = parseGlobalAttributeDocument(singletonResponse[0]);
assert.equal(parsed.documentId, 'doc-1');
assert.deepEqual(parsed.attributeNames, ['Texture', 'Size', '', '   ']);
assert.equal(parsed.entries.length, 4);
assert.equal(parsed.entries[1].rawIndex, 2);

assert.equal(normalizeGlobalAttributeName(' Texture '), 'Texture');
assert.equal(validateAddGlobalAttributeName('', []), 'Attribute name is required');
assert.equal(validateAddGlobalAttributeName('   ', []), 'Attribute name cannot be only whitespace');
assert.equal(validateAddGlobalAttributeName('Texture', ['Texture']), 'An attribute with this name already exists');
assert.equal(validateAddGlobalAttributeName('texture', ['Texture']), 'An attribute with this name already exists');

const renameEntries = [
  { name: 'Texture', rawIndex: 0 },
  { name: 'Pattern', rawIndex: 2 },
];
assert.equal(validateRenameGlobalAttributeName('Colour', renameEntries, 0), null);
assert.equal(validateRenameGlobalAttributeName('Pattern', renameEntries, 0), 'An attribute with this name already exists');
assert.match(validateRenameGlobalAttributeName('Size', renameEntries, 99) ?? '', /no longer available/);

console.log('admin global attributes content tests passed');

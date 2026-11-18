import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSuffix, appendSuffix, hasSuffix, parseSuffix, MARKER } from '../src/index.js';

const CODE = 'bc_7abs5d4z';
// Known-good value, checked against the Base Builder Code spec layout.
const EXPECTED = '0x62635f376162733564347a0b0080218021802180218021802180218021';

test('buildSuffix matches the known encoded string', () => {
  assert.equal(buildSuffix(CODE), EXPECTED);
});

test('marker is 16 bytes', () => {
  assert.equal(MARKER.length, 32);
});

test('appendSuffix on empty calldata returns just the suffix', () => {
  assert.equal(appendSuffix('0x', CODE), EXPECTED);
  assert.equal(appendSuffix(undefined, CODE), EXPECTED);
});

test('appendSuffix keeps the original calldata in front', () => {
  const data = '0xa9059cbb0000000000000000000000000000000000000000000000000000000000000001';
  assert.equal(appendSuffix(data, CODE), data + EXPECTED.slice(2));
});

test('appendSuffix never double-appends', () => {
  const once = appendSuffix('0x1234', CODE);
  assert.equal(appendSuffix(once, CODE), once);
});

test('parseSuffix round-trips', () => {
  const data = appendSuffix('0xdeadbeef', CODE);
  assert.deepEqual(parseSuffix(data), { code: CODE, schemaId: 0 });
});

test('parseSuffix returns null without a suffix', () => {
  assert.equal(parseSuffix('0xdeadbeef'), null);
  assert.equal(hasSuffix('0xdeadbeef'), false);
});

test('invalid input is rejected', () => {
  assert.throws(() => buildSuffix(''), TypeError);
  assert.throws(() => buildSuffix('bc_é'), TypeError);
  assert.throws(() => appendSuffix('1234', CODE), TypeError);
  assert.throws(() => appendSuffix('0x123', CODE), TypeError);
});

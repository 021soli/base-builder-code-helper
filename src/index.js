/**
 * base-builder-code-helper
 * Build, append and parse Base Builder Code (ERC-8021, schema 0) data suffixes.
 *
 * Suffix layout (appended to the end of transaction calldata):
 *   [code ASCII bytes][codeLength: 1 byte][schemaId: 1 byte = 0x00][marker: 16 bytes]
 * where the marker is 0x8021 repeated 8 times.
 *
 * Contracts ignore the extra trailing bytes, so no contract change is needed.
 */

export const SCHEMA_ID = 0;
export const MARKER = '8021'.repeat(8); // 16 bytes, hex without 0x

const HEX_RE = /^0x([0-9a-fA-F]{2})*$/;

const toHex = (n) => n.toString(16).padStart(2, '0');

function assertCode(code) {
  if (typeof code !== 'string' || code.length === 0) {
    throw new TypeError('Builder code must be a non-empty string');
  }
  // Printable ASCII only, so one character is exactly one byte.
  if (!/^[\x20-\x7e]+$/.test(code)) {
    throw new TypeError('Builder code must contain printable ASCII characters only');
  }
  if (code.length > 255) {
    throw new RangeError('Builder code must be 255 characters or fewer');
  }
}

function assertHex(data) {
  if (typeof data !== 'string' || !HEX_RE.test(data)) {
    throw new TypeError('data must be a 0x-prefixed hex string with an even number of digits');
  }
}

/**
 * Build the ERC-8021 suffix for a builder code.
 * @param {string} code e.g. "bc_7abs5d4z"
 * @returns {string} 0x-prefixed hex suffix
 */
export function buildSuffix(code) {
  assertCode(code);
  const codeHex = Array.from(code, (ch) => toHex(ch.charCodeAt(0))).join('');
  return '0x' + codeHex + toHex(code.length) + toHex(SCHEMA_ID) + MARKER;
}

/**
 * Append the suffix to calldata. Safe to call with "0x" or undefined for
 * plain transfers. If the data already ends with an ERC-8021 suffix it is
 * returned unchanged, so calling this twice never double-appends.
 * @param {string | undefined} data 0x-prefixed calldata
 * @param {string} code builder code
 * @returns {string}
 */
export function appendSuffix(data, code) {
  const base = data === undefined || data === '' ? '0x' : data;
  assertHex(base);
  if (hasSuffix(base)) return base;
  return base + buildSuffix(code).slice(2);
}

/** True if the calldata ends with the ERC-8021 marker. */
export function hasSuffix(data) {
  assertHex(data);
  return data.toLowerCase().endsWith(MARKER);
}

/**
 * Read the builder code back out of calldata.
 * @param {string} data 0x-prefixed calldata
 * @returns {{ code: string, schemaId: number } | null} null if no valid suffix
 */
export function parseSuffix(data) {
  assertHex(data);
  const hex = data.slice(2).toLowerCase();
  if (!hex.endsWith(MARKER)) return null;

  const beforeMarker = hex.slice(0, hex.length - MARKER.length);
  if (beforeMarker.length < 4) return null; // needs schemaId + length bytes

  const schemaId = parseInt(beforeMarker.slice(-2), 16);
  const codeLen = parseInt(beforeMarker.slice(-4, -2), 16);
  const codeHex = beforeMarker.slice(-4 - codeLen * 2, -4);
  if (codeLen === 0 || codeHex.length !== codeLen * 2) return null;

  let code = '';
  for (let i = 0; i < codeHex.length; i += 2) {
    code += String.fromCharCode(parseInt(codeHex.slice(i, i + 2), 16));
  }
  return { code, schemaId };
}

export const SCHEMA_ID: 0;
export const MARKER: string;

/** Build the ERC-8021 suffix (0x-prefixed hex) for a builder code. */
export function buildSuffix(code: string): `0x${string}`;

/** Append the suffix to calldata. Never double-appends. */
export function appendSuffix(data: string | undefined, code: string): `0x${string}`;

/** True if the calldata already ends with the ERC-8021 marker. */
export function hasSuffix(data: string): boolean;

/** Read the builder code from calldata, or null if there is no valid suffix. */
export function parseSuffix(data: string): { code: string; schemaId: number } | null;

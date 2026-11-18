# base-builder-code-helper

A tiny, zero-dependency helper for adding **Base Builder Code** attribution ([ERC-8021](https://docs.base.org/apps/builder-codes/builder-codes)) to transaction calldata.

Append your builder code to any transaction and Base can attribute that activity to your app. Contracts ignore the extra trailing bytes, so you do not change any smart contract.

## Install

```bash
npm install base-builder-code-helper
```

Or copy `src/index.js`. It is one file with no dependencies.

## Usage

```js
import { appendSuffix } from 'base-builder-code-helper';

const BUILDER_CODE = 'bc_7abs5d4z'; // from base.dev → Settings → Builder Code

// Plain transaction (no calldata)
await provider.request({
  method: 'eth_sendTransaction',
  params: [{ from, to, data: appendSuffix('0x', BUILDER_CODE) }]
});

// Contract call encoded with ethers
const data = appendSuffix(iface.encodeFunctionData('startRun'), BUILDER_CODE);
await provider.request({
  method: 'eth_sendTransaction',
  params: [{ from, to: CONTRACT_ADDRESS, data }]
});
```

> A transaction **to your own address with data** is blocked by many wallets ("External transactions to internal accounts cannot include data"). Send to a real contract, or to another address, instead.

## API

| Function | Returns |
|----------|---------|
| `buildSuffix(code)` | The ERC-8021 suffix as a `0x` hex string. |
| `appendSuffix(data, code)` | Calldata with the suffix appended. Accepts `'0x'` or `undefined`. Never double-appends. |
| `hasSuffix(data)` | `true` if the calldata already ends with the ERC-8021 marker. |
| `parseSuffix(data)` | `{ code, schemaId }`, or `null` when there is no valid suffix. |

## Suffix layout (schema 0)

```
[ code (ASCII bytes) ][ code length (1 byte) ][ schemaId = 0x00 (1 byte) ][ marker 0x8021 × 8 (16 bytes) ]
```

For `bc_7abs5d4z`:

```
0x62635f376162733564347a 0b 00 80218021802180218021802180218021
     └ "bc_7abs5d4z"      │  │  └ marker
                          │  └ schemaId
                          └ length = 11
```

## Test

```bash
npm test
```

Requires Node 18 or newer.

## License

[MIT](LICENSE)

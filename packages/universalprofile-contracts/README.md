# Universal Profile &middot; [![npm version](https://img.shields.io/npm/v/@lukso/universalprofile-contracts.svg?style=flat)](https://www.npmjs.com/package/@lukso/universalprofile-contracts)

npm package with the smart contract implementation for **Universal Profile**, combining LSP0 ERC725Account and LSP3 Profile Metadata.

## Installation

```bash
npm install @lukso/universalprofile-contracts
```

## Solidity constants

The constants related to LSP3 Profile Metadata can be directly imported from the Solidity `Constants.sol` file.

<!-- prettier-ignore -->
```solidity
import {
  _LSP3_SUPPORTED_STANDARDS_KEY,
  _LSP3_SUPPORTED_STANDARDS_VALUE,
  _LSP3_PROFILE_KEY
} from "@lukso/universalprofile-contracts/contracts/Constants.sol";
```

## TypeScript types

You can also import the [type-safe ABI](https://abitype.dev/) of each LSP smart contract from the `/abi` path.

```typescript
import {
  universalProfileAbi,
  universalProfileInitAbi,
} from "@lukso/universalprofile-contracts/abi";
```

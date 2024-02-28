# CI Scripts

> You might experience errors if running these files outside of a CI environnement (like GitHub actions) for the reason below.

The following folder contains files that are usually used as part of the CI/CD of the repository (except for `fix_flattener.js`).

- `ci/check-deployer-balance.ts`: check if the deployer address has at least 1 LYX to deploy the contract via `ci/deploy-verify.sh`.
- `ci/deploy-verify.sh`: shell utility command to deploy + verify a smart contract on a specified network.
- `ci/docs-generate.ts`: used to generate the user and dev docs into separate JSON files (this is used as part of our release CI to prepare the package when publoishing it on [npmjs.org](https://www.npmjs.com/package/@lukso/lsp-smart-contracts)).
- `fix_flattener.js`: utility file to remove duplicate

## `deploy-verify.sh`

The `deploy-verify.sh` command can also be used standalone (outside of the CI) from the root folder of the repository as follows.

```
./scripts/ci/deploy-verify.sh -n luksoTesnet -c UniversalProfile
```

It requires to specify a private key in a local `.env` file under the global variable `CONTRACT_VERIFICATION_TESTNET_PK`.

```
CONTRACT_VERIFICATION_TESTNET_PK=0x...
```

The following arguments must be specified:

- `-n`: network to deploy on. **MUST be configured in the `hardhat.config.ts`**
- `-c`: contract to be deployed + verified. See [`DEPLOYMENT.md`](../../DEPLOYMENT.md) for more details of the available options.

## `fix_flattener.js`

This file can be used to remove the duplicate `pragma` and `SPDX` license identifier definitions from a flattened Solidity file.

1. simply write the path of your file name in this file under:

```js
let file = "./path/to/your/FlattenedContract.sol";
```

2. run the script with nodeJS

```sh
node ./scripts/fix_flattener.js
```

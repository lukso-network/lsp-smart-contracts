# Changelog

## [0.17.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.8...lsp7-contracts-v0.17.0) (2026-02-06)


### ⚠ BREAKING CHANGES

* change `if ... revert` with `require` + custom `error` in LSP7
* use `require` with custom `error` in LSP7 Votes + increase minimum pragma compiler version
* change casing in `LSP7DigitalAsset` from `_isNonDivisible` to `_IS_NON_DIVISIBLE` to distinguish variable as `immutable`
* mark `_isNonDivisible` as `immutable` in `LSP7DigitalAsset` contract with `constructor`
* upgrade solc compiler + EVM version in LSP7 package to optimize runtime cost

### Features

* create customizeable token contract ([82d8a33](https://github.com/lukso-network/lsp-smart-contracts/commit/82d8a339defd873990bf2202638c2afd429f3c1f))
* create hardhat-packager plugin ([21ba47c](https://github.com/lukso-network/lsp-smart-contracts/commit/21ba47c0490b36cf3dadc29f174138e247b477f5))
* create proxy version of CustomizableToken ([eded50a](https://github.com/lukso-network/lsp-smart-contracts/commit/eded50aeac5444b50a8840fc1a67ac3c71f96bd6))
* protect address(0) and dead address in allowlist for burning ([060d520](https://github.com/lukso-network/lsp-smart-contracts/commit/060d520275c04ea75d1d2c296a2130078cc14b3d))
* upgrade dependencies and Hardhat version to v3 ([32cbc59](https://github.com/lukso-network/lsp-smart-contracts/commit/32cbc5929774bcf58b48414c697325a6ee7c6b39))


### Bug Fixes

* prevent makeTransferable from executing when token is already transferable ([9a3c20d](https://github.com/lukso-network/lsp-smart-contracts/commit/9a3c20d751b999a288429a6bf4708d7f1608bba5))
* resolve `solidity-bytes-utils` dependency to `0.8.4` to remove trufflehd-wallet and other vulnerabilities in dependencies ([cbe21e9](https://github.com/lukso-network/lsp-smart-contracts/commit/cbe21e99ec3b6a74136c17cc364f3d00f6ddd37b))
* security improvements ([8efd690](https://github.com/lukso-network/lsp-smart-contracts/commit/8efd690dc7cb792d6c62c2cda0aef417c77c526d))


### Performance Improvements

* use `calldata` for `external initialize(...)` functions for new LSP7 token extension ([73fae6d](https://github.com/lukso-network/lsp-smart-contracts/commit/73fae6d4813e793727a63a8dc2c9e934b3bff35c))
* use `require` with custom `error` in new LSP7 extensions ([3ca92c4](https://github.com/lukso-network/lsp-smart-contracts/commit/3ca92c46612fca0e999914f3e608389329f5f6a4))


### Code Refactoring

* change `if ... revert` with `require` + custom `error` in LSP7 ([53ad54f](https://github.com/lukso-network/lsp-smart-contracts/commit/53ad54fdf736e2a449948efa39c9f05cc7024b58))
* change casing in `LSP7DigitalAsset` from `_isNonDivisible` to `_IS_NON_DIVISIBLE` to distinguish variable as `immutable` ([44daac3](https://github.com/lukso-network/lsp-smart-contracts/commit/44daac3aed32574c881954951d547a4831427e64))
* mark `_isNonDivisible` as `immutable` in `LSP7DigitalAsset` contract with `constructor` ([7a6d2c9](https://github.com/lukso-network/lsp-smart-contracts/commit/7a6d2c90e97e45544ec5384f9a4c7d9c228e83b3))
* upgrade solc compiler + EVM version in LSP7 package to optimize runtime cost ([b0a4c7f](https://github.com/lukso-network/lsp-smart-contracts/commit/b0a4c7fb487f228d9d2b2f5c56a7113d0fe99f24))
* use `require` with custom `error` in LSP7 Votes + increase minimum pragma compiler version ([4d3f7d4](https://github.com/lukso-network/lsp-smart-contracts/commit/4d3f7d4e2c23de11b76f1aacb59ccf4c5f1683c9))

## [0.16.8](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.7...lsp7-contracts-v0.16.8) (2025-06-19)

### Bug Fixes

- upgrade nodejs to v22 to fix failed release CI ([93e19e6](https://github.com/lukso-network/lsp-smart-contracts/commit/93e19e6849e7587822fa353ec3c8dac5632039b5))

## [0.16.7](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.6...lsp7-contracts-v0.16.7) (2025-06-19)

### Bug Fixes

- order of exports to allow exporting constants + abi from CJS and ESM ([823a24f](https://github.com/lukso-network/lsp-smart-contracts/commit/823a24f433312250b3116054b3bfbe9dc8ad314d))

## [0.16.6](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.5...lsp7-contracts-v0.16.6) (2025-06-19)

### Bug Fixes

- fix release process to include `artifacts/*.json` folder ([ab58e3d](https://github.com/lukso-network/lsp-smart-contracts/commit/ab58e3da2300bb6032cc90a51fe6a7762b3ae068))

## [0.16.5](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.4...lsp7-contracts-v0.16.5) (2025-06-18)

### Bug Fixes

- abi exports for up, lsp16 & lsp23 packages ([4486fdb](https://github.com/lukso-network/lsp-smart-contracts/commit/4486fdb59bc7b460919a8c751a1ff718abcde926))

## [0.16.4](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.3...lsp7-contracts-v0.16.4) (2025-04-19)

### Bug Fixes

- adjust build to export without errors Typescript typed ABIs from `@lukso/lsp7-contracts` package ([7750782](https://github.com/lukso-network/lsp-smart-contracts/commit/7750782b80676c97ca73c5d94c5ba3875261b0b1))
- error when importing `/types` folder from packages ([a4ac079](https://github.com/lukso-network/lsp-smart-contracts/commit/a4ac079e8ee06d14f0a2c2b042c5cf9c178c32fb))
- use correct contract `LSP17ExtendableInitAbstract` in inheritance of LSP7 Init ([1cf2726](https://github.com/lukso-network/lsp-smart-contracts/commit/1cf27267784fa0f8aa79214bf1acc89dbbbd7a03))

## [0.16.3](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.2...lsp7-contracts-v0.16.3) (2025-01-17)

### Bug Fixes

- remove duplicate callback to LSP1 `universalReceiver(...)` in LSP7 ([aaa90b6](https://github.com/lukso-network/lsp-smart-contracts/commit/aaa90b6d9f0b10b3dd0e01bbe2a99422c5c005cc))

## [0.16.2](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.1...lsp7-contracts-v0.16.2) (2025-01-14)

### Bug Fixes

- installation instructions in README ([3390a6f](https://github.com/lukso-network/lsp-smart-contracts/commit/3390a6fe659efecb0c6c12e88263c1996d714fae))

## [0.16.1](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.0...lsp7-contracts-v0.16.1) (2025-01-13)

### Bug Fixes

- add missing `LSP7/8Votes` folders in lsp-smart-contracts package ([6f34a1c](https://github.com/lukso-network/lsp-smart-contracts/commit/6f34a1c8241e9aeae19918aa8c9052c9491a4e63))
- dependencies and build to trigger 0.16.1 patch release ([ce2e962](https://github.com/lukso-network/lsp-smart-contracts/commit/ce2e962741f8e18cabd15f786fffd2229ff41ab0))

## [0.16.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0...lsp7-contracts-v0.16.0) (2025-01-13)

### ⚠ BREAKING CHANGES

- upgrade LPS4, 7 and 8 Tokens to `@erc725/smart-contracts` v8.0.0
- remove `Core` contract from LSP7 package

### Features

- add force to internal functions LSP7 ([c2f7909](https://github.com/lukso-network/lsp-smart-contracts/commit/c2f79091a1919422f6d9e160c13e0accf321a747))
- Add LSP7Votes and LSP8Votes extensions ([3571355](https://github.com/lukso-network/lsp-smart-contracts/commit/35713557e132c7c347ddd380dfb19a500a621ec4))
- add old interfaces ids as Solidity constants for lsp7 & lsp8 ([8e1e93e](https://github.com/lukso-network/lsp-smart-contracts/commit/8e1e93e3cb63956614d906bb08d6a91566afbaf9))
- create LSP7VotesConstants.sol ([0818c94](https://github.com/lukso-network/lsp-smart-contracts/commit/0818c94939cdd0aeb2bd8fb0d78cc04410f63a34))
- create LSP7VotesInitAbstract contract ([fed8f18](https://github.com/lukso-network/lsp-smart-contracts/commit/fed8f18c8b6674623d3de5ab2172858b833bfee0))

### Bug Fixes

- disallow arbitrary sending of 0 amount in LSP7 ([e21f431](https://github.com/lukso-network/lsp-smart-contracts/commit/e21f431fbdaeaab90391923c9d1ea4baf55aa918))

### Code Refactoring

- remove `Core` contract from LSP7 package ([ddc5d7f](https://github.com/lukso-network/lsp-smart-contracts/commit/ddc5d7f2f02f7ff3711bb2acbec5be73420e80c5))
- upgrade LPS4, 7 and 8 Tokens to `@erc725/smart-contracts` v8.0.0 ([fde66b8](https://github.com/lukso-network/lsp-smart-contracts/commit/fde66b80d90f4789cce76021136b9e065e561579))

## [0.15.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.5...lsp7-contracts-v0.15.0) (2024-04-05)

### Miscellaneous Chores

- release lsp-smart-contracts 0.15.0 ([fbbd048](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbd0484aa8208fec06d639e44d864c66650edbd))

## [0.15.0-rc.5](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.4...lsp7-contracts-v0.15.0-rc.5) (2024-04-03)

### Miscellaneous Chores

- release lsp-smart-contracts 0.15.0-rc.5 ([a314f08](https://github.com/lukso-network/lsp-smart-contracts/commit/a314f08fbabf7b166aca4d2212a69ae444405155))

## [0.15.0-rc.4](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.3...lsp7-contracts-v0.15.0-rc.4) (2024-04-02)

### Miscellaneous Chores

- release lsp-smart-contracts 0.15.0-rc.4 ([adac8fe](https://github.com/lukso-network/lsp-smart-contracts/commit/adac8fe1df9b962dbb648d40c5c70de561fe7f88))

## [0.15.0-rc.3](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.2...lsp7-contracts-v0.15.0-rc.3) (2024-04-02)

### Miscellaneous Chores

- release lsp-smart-contracts 0.15.0-rc.3 ([83584f2](https://github.com/lukso-network/lsp-smart-contracts/commit/83584f2b62e1b317ca3687adff85e53ce0b90f42))

## [0.15.0-rc.2](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.1...lsp7-contracts-v0.15.0-rc.2) (2024-04-02)

### Features

- add JSON ABIs for old LSP7 and LSP8 interface IDs ([71cd129](https://github.com/lukso-network/lsp-smart-contracts/commit/71cd129b9143d2e052d65665241afb6ba5c81c2b))

### Bug Fixes

- add missing `"package"` script and missing artifacts ([f713935](https://github.com/lukso-network/lsp-smart-contracts/commit/f713935b0dfdb022dc8b3fd008203a894654cc66))

### Miscellaneous Chores

- release lsp-smart-contracts 0.15.0-rc.2 ([138f2bb](https://github.com/lukso-network/lsp-smart-contracts/commit/138f2bb132bd98d600f3bd408acf8eca3b978402))

## [0.15.0-rc.1](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.1) (2024-03-22)

### Features

- add contract TS types generated by wagmi in each packages ([f40ba0f](https://github.com/lukso-network/lsp-smart-contracts/commit/f40ba0f7486906c527756ad30ce4927fa816d7ff))

### Miscellaneous Chores

- release lsp-smart-contracts 0.15.0-rc.1 ([1ac4013](https://github.com/lukso-network/lsp-smart-contracts/commit/1ac4013b943d0d316005511e3c70cb2751864de7))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.0) (2024-03-07)

### Miscellaneous Chores

- release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
- release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.0) (2024-03-06)

### Miscellaneous Chores

- release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
- release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.0) (2024-03-06)

### Miscellaneous Chores

- release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
- release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## 0.15.0-rc.0 (2024-03-06)

### Miscellaneous Chores

- release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
- release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

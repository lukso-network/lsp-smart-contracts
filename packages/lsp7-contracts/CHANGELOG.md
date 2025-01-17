# Changelog

## [0.16.3](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.2...lsp7-contracts-v0.16.3) (2025-01-17)


### Bug Fixes

* remove duplicate callback to LSP1 `universalReceiver(...)` in LSP7 ([aaa90b6](https://github.com/lukso-network/lsp-smart-contracts/commit/aaa90b6d9f0b10b3dd0e01bbe2a99422c5c005cc))

## [0.16.2](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.1...lsp7-contracts-v0.16.2) (2025-01-14)


### Bug Fixes

* installation instructions in README ([3390a6f](https://github.com/lukso-network/lsp-smart-contracts/commit/3390a6fe659efecb0c6c12e88263c1996d714fae))

## [0.16.1](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.16.0...lsp7-contracts-v0.16.1) (2025-01-13)


### Bug Fixes

* add missing `LSP7/8Votes` folders in lsp-smart-contracts package ([6f34a1c](https://github.com/lukso-network/lsp-smart-contracts/commit/6f34a1c8241e9aeae19918aa8c9052c9491a4e63))
* dependencies and build to trigger 0.16.1 patch release ([ce2e962](https://github.com/lukso-network/lsp-smart-contracts/commit/ce2e962741f8e18cabd15f786fffd2229ff41ab0))

## [0.16.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0...lsp7-contracts-v0.16.0) (2025-01-13)


### ⚠ BREAKING CHANGES

* upgrade LPS4, 7 and 8 Tokens to `@erc725/smart-contracts` v8.0.0
* remove `Core` contract from LSP7 package

### Features

* add force to internal functions LSP7 ([c2f7909](https://github.com/lukso-network/lsp-smart-contracts/commit/c2f79091a1919422f6d9e160c13e0accf321a747))
* Add LSP7Votes and LSP8Votes extensions ([3571355](https://github.com/lukso-network/lsp-smart-contracts/commit/35713557e132c7c347ddd380dfb19a500a621ec4))
* add old interfaces ids as Solidity constants for lsp7 & lsp8 ([8e1e93e](https://github.com/lukso-network/lsp-smart-contracts/commit/8e1e93e3cb63956614d906bb08d6a91566afbaf9))
* create LSP7VotesConstants.sol ([0818c94](https://github.com/lukso-network/lsp-smart-contracts/commit/0818c94939cdd0aeb2bd8fb0d78cc04410f63a34))
* create LSP7VotesInitAbstract contract ([fed8f18](https://github.com/lukso-network/lsp-smart-contracts/commit/fed8f18c8b6674623d3de5ab2172858b833bfee0))


### Bug Fixes

* disallow arbitrary sending of 0 amount in LSP7 ([e21f431](https://github.com/lukso-network/lsp-smart-contracts/commit/e21f431fbdaeaab90391923c9d1ea4baf55aa918))


### Code Refactoring

* remove `Core` contract from LSP7 package ([ddc5d7f](https://github.com/lukso-network/lsp-smart-contracts/commit/ddc5d7f2f02f7ff3711bb2acbec5be73420e80c5))
* upgrade LPS4, 7 and 8 Tokens to `@erc725/smart-contracts` v8.0.0 ([fde66b8](https://github.com/lukso-network/lsp-smart-contracts/commit/fde66b80d90f4789cce76021136b9e065e561579))

## [0.15.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.5...lsp7-contracts-v0.15.0) (2024-04-05)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0 ([fbbd048](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbd0484aa8208fec06d639e44d864c66650edbd))

## [0.15.0-rc.5](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.4...lsp7-contracts-v0.15.0-rc.5) (2024-04-03)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.5 ([a314f08](https://github.com/lukso-network/lsp-smart-contracts/commit/a314f08fbabf7b166aca4d2212a69ae444405155))

## [0.15.0-rc.4](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.3...lsp7-contracts-v0.15.0-rc.4) (2024-04-02)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.4 ([adac8fe](https://github.com/lukso-network/lsp-smart-contracts/commit/adac8fe1df9b962dbb648d40c5c70de561fe7f88))

## [0.15.0-rc.3](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.2...lsp7-contracts-v0.15.0-rc.3) (2024-04-02)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.3 ([83584f2](https://github.com/lukso-network/lsp-smart-contracts/commit/83584f2b62e1b317ca3687adff85e53ce0b90f42))

## [0.15.0-rc.2](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.1...lsp7-contracts-v0.15.0-rc.2) (2024-04-02)


### Features

* add JSON ABIs for old LSP7 and LSP8 interface IDs ([71cd129](https://github.com/lukso-network/lsp-smart-contracts/commit/71cd129b9143d2e052d65665241afb6ba5c81c2b))


### Bug Fixes

* add missing `"package"` script and missing artifacts ([f713935](https://github.com/lukso-network/lsp-smart-contracts/commit/f713935b0dfdb022dc8b3fd008203a894654cc66))


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.2 ([138f2bb](https://github.com/lukso-network/lsp-smart-contracts/commit/138f2bb132bd98d600f3bd408acf8eca3b978402))

## [0.15.0-rc.1](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.1) (2024-03-22)


### Features

* add contract TS types generated by wagmi in each packages ([f40ba0f](https://github.com/lukso-network/lsp-smart-contracts/commit/f40ba0f7486906c527756ad30ce4927fa816d7ff))


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.1 ([1ac4013](https://github.com/lukso-network/lsp-smart-contracts/commit/1ac4013b943d0d316005511e3c70cb2751864de7))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.0) (2024-03-07)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.0) (2024-03-06)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp7-contracts-v0.15.0-rc.0...lsp7-contracts-v0.15.0-rc.0) (2024-03-06)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## 0.15.0-rc.0 (2024-03-06)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

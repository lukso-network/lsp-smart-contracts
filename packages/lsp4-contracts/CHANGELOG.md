# Changelog

## [0.16.7](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.16.6...lsp4-contracts-v0.16.7) (2025-06-19)


### Bug Fixes

* upgrade nodejs to v22 to fix failed release CI ([93e19e6](https://github.com/lukso-network/lsp-smart-contracts/commit/93e19e6849e7587822fa353ec3c8dac5632039b5))

## [0.16.6](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.16.5...lsp4-contracts-v0.16.6) (2025-06-19)


### Bug Fixes

* order of exports to allow exporting constants + abi from CJS and ESM ([823a24f](https://github.com/lukso-network/lsp-smart-contracts/commit/823a24f433312250b3116054b3bfbe9dc8ad314d))

## [0.16.5](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.16.4...lsp4-contracts-v0.16.5) (2025-06-19)


### Bug Fixes

* fix release process to include `artifacts/*.json` folder ([ab58e3d](https://github.com/lukso-network/lsp-smart-contracts/commit/ab58e3da2300bb6032cc90a51fe6a7762b3ae068))

## [0.16.4](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.16.3...lsp4-contracts-v0.16.4) (2025-06-18)


### Bug Fixes

* abi exports for up, lsp16 & lsp23 packages ([4486fdb](https://github.com/lukso-network/lsp-smart-contracts/commit/4486fdb59bc7b460919a8c751a1ff718abcde926))

## [0.16.3](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.16.2...lsp4-contracts-v0.16.3) (2025-04-19)


### Bug Fixes

* adjust build to export without errors Typescript typed ABIs from `@lukso/lsp4-contracts` package ([a30449f](https://github.com/lukso-network/lsp-smart-contracts/commit/a30449f51f5cc3362c29cf2f8c79b65c662d1dfc))
* error when importing `/types` folder from packages ([a4ac079](https://github.com/lukso-network/lsp-smart-contracts/commit/a4ac079e8ee06d14f0a2c2b042c5cf9c178c32fb))

## [0.16.2](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.16.1...lsp4-contracts-v0.16.2) (2025-01-14)


### Bug Fixes

* installation instructions in README ([3390a6f](https://github.com/lukso-network/lsp-smart-contracts/commit/3390a6fe659efecb0c6c12e88263c1996d714fae))

## [0.16.1](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.16.0...lsp4-contracts-v0.16.1) (2025-01-13)


### Bug Fixes

* dependencies and build to trigger 0.16.1 patch release ([ce2e962](https://github.com/lukso-network/lsp-smart-contracts/commit/ce2e962741f8e18cabd15f786fffd2229ff41ab0))

## [0.16.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0...lsp4-contracts-v0.16.0) (2025-01-13)


### ⚠ BREAKING CHANGES

* upgrade LPS4, 7 and 8 Tokens to `@erc725/smart-contracts` v8.0.0
* remove `Core` contract from LSP8 package
* remove `Core` contract from LSP4 package

### Features

* Allow contract assets as TS type ([dc637df](https://github.com/lukso-network/lsp-smart-contracts/commit/dc637df9b531fd9064e094eca466ca440004c86e))
* create InitAbstract version of LSP17Extendable ([9fbafe9](https://github.com/lukso-network/lsp-smart-contracts/commit/9fbafe98e09305c11b26e71a2f29fbed813efd74))


### Code Refactoring

* remove `Core` contract from LSP4 package ([bef48cf](https://github.com/lukso-network/lsp-smart-contracts/commit/bef48cfb0a52ba0c2ffc27ea74557bbdc9b1361a))
* remove `Core` contract from LSP8 package ([d499453](https://github.com/lukso-network/lsp-smart-contracts/commit/d499453612dfe687aef15c7b26d52c15555fe98f))
* upgrade LPS4, 7 and 8 Tokens to `@erc725/smart-contracts` v8.0.0 ([fde66b8](https://github.com/lukso-network/lsp-smart-contracts/commit/fde66b80d90f4789cce76021136b9e065e561579))

## [0.15.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.5...lsp4-contracts-v0.15.0) (2024-04-05)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0 ([fbbd048](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbd0484aa8208fec06d639e44d864c66650edbd))

## [0.15.0-rc.5](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.4...lsp4-contracts-v0.15.0-rc.5) (2024-04-03)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.5 ([a314f08](https://github.com/lukso-network/lsp-smart-contracts/commit/a314f08fbabf7b166aca4d2212a69ae444405155))

## [0.15.0-rc.4](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.3...lsp4-contracts-v0.15.0-rc.4) (2024-04-02)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.4 ([adac8fe](https://github.com/lukso-network/lsp-smart-contracts/commit/adac8fe1df9b962dbb648d40c5c70de561fe7f88))

## [0.15.0-rc.3](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.2...lsp4-contracts-v0.15.0-rc.3) (2024-04-02)


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.3 ([83584f2](https://github.com/lukso-network/lsp-smart-contracts/commit/83584f2b62e1b317ca3687adff85e53ce0b90f42))

## [0.15.0-rc.2](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.1...lsp4-contracts-v0.15.0-rc.2) (2024-04-02)


### Bug Fixes

* add missing `"package"` script and missing artifacts ([f713935](https://github.com/lukso-network/lsp-smart-contracts/commit/f713935b0dfdb022dc8b3fd008203a894654cc66))


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.2 ([138f2bb](https://github.com/lukso-network/lsp-smart-contracts/commit/138f2bb132bd98d600f3bd408acf8eca3b978402))

## [0.15.0-rc.1](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.0...lsp4-contracts-v0.15.0-rc.1) (2024-03-22)


### Features

* add contract TS types generated by wagmi in each packages ([f40ba0f](https://github.com/lukso-network/lsp-smart-contracts/commit/f40ba0f7486906c527756ad30ce4927fa816d7ff))


### Miscellaneous Chores

* release lsp-smart-contracts 0.15.0-rc.1 ([1ac4013](https://github.com/lukso-network/lsp-smart-contracts/commit/1ac4013b943d0d316005511e3c70cb2751864de7))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.0...lsp4-contracts-v0.15.0-rc.0) (2024-03-07)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.15.0-rc.0...lsp4-contracts-v0.15.0-rc.0) (2024-03-06)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## [0.15.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/lsp4-contracts-v0.14.0...lsp4-contracts-v0.15.0-rc.0) (2024-03-06)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

## 0.15.0-rc.0 (2024-03-06)


### Miscellaneous Chores

* release 0.12.0 ([fbbec61](https://github.com/lukso-network/lsp-smart-contracts/commit/fbbec6199c6351721acedb35110fc1cc7bbb65ad))
* release 0.13.0 ([#817](https://github.com/lukso-network/lsp-smart-contracts/issues/817)) ([1bd2f5f](https://github.com/lukso-network/lsp-smart-contracts/commit/1bd2f5f699ecdbef857527cdac50df50dc051002))

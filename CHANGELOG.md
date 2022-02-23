# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.5.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.4.3...v0.5.0) (2022-02-23)


### Features

* add check for multiple `ERC725Y` keys ([5ee41c7](https://github.com/lukso-network/lsp-smart-contracts/commit/5ee41c7bd22ea30c013ad7a18ff974ddaa4b5657))
* add check for partial keys + test for Mapping keys ([57923ca](https://github.com/lukso-network/lsp-smart-contracts/commit/57923ca13e67ee5256a5337e2c4610964452c440))
* add custom error log for AllowedERC725YKey ([dcefa95](https://github.com/lukso-network/lsp-smart-contracts/commit/dcefa95364012b905c5377ac94ed3b3eb18bbbc2))
* allow whitelisting any ERC725Y key if nothing set ([41dd20f](https://github.com/lukso-network/lsp-smart-contracts/commit/41dd20fbd6228b3c2b23f9b2ddb8748d8f85567f))
* create LSP7CompatabilityForERC20InitAbstract ([516d195](https://github.com/lukso-network/lsp-smart-contracts/commit/516d1955a0d1aa68e1d3dde7818ffbf7d16432e5))
* create LSP8CompatabilityForERC721InitAbstract ([1ded846](https://github.com/lukso-network/lsp-smart-contracts/commit/1ded8466049442c164c3ae0fc09411a6f046dd33))
* first draft implementation of `AllowedERC725YKeys`, with only one key check ([ac567c3](https://github.com/lukso-network/lsp-smart-contracts/commit/ac567c3b52d3774780968ca9f7b54b958c4ca338))
* LSP7CompatibilityForERC20 proxy and constructor version ([131eed0](https://github.com/lukso-network/lsp-smart-contracts/commit/131eed0b5e832d7d159de09eccfaee75bf9b81a0))
* LSP8CompatibilityForERC721 proxy and constructor version ([ffccc4b](https://github.com/lukso-network/lsp-smart-contracts/commit/ffccc4b6ad6b4d986808183436973174786c6efc))


### Bug Fixes

* ILSP8CompatabilityForERC721 isApprovedForAll params match IERC721 ([fed55a9](https://github.com/lukso-network/lsp-smart-contracts/commit/fed55a9b25afda10ccfbfc559f3d359ad372572e))
* LSP8 InitAbstract contract inheritance order ([e9e61c1](https://github.com/lukso-network/lsp-smart-contracts/commit/e9e61c1ce5047daef6dae906ecc43d8b0d397fb9))
* security check in UniversalReceiverDelegateUP contract ([#109](https://github.com/lukso-network/lsp-smart-contracts/issues/109)) ([faac8df](https://github.com/lukso-network/lsp-smart-contracts/commit/faac8df65e12b4257e77358ed65290b02cbfc08a))

### [0.4.3](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.4.2...v0.4.3) (2022-01-10)

### [0.4.2](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.4.1...v0.4.2) (2022-01-10)


### Features

* add a file `constants.ts` in npm package ([#87](https://github.com/lukso-network/lsp-smart-contracts/issues/87)) ([61abc09](https://github.com/lukso-network/lsp-smart-contracts/commit/61abc09f824e502778756d3c015d7f982ebe9258))
* LSP8CompatibilityForERC721 sets ERC165 interfaces for ERC721 & … ([#89](https://github.com/lukso-network/lsp-smart-contracts/issues/89)) ([15265a3](https://github.com/lukso-network/lsp-smart-contracts/commit/15265a35e186f80031b53bb80514fa4f95b3f843))


### Bug Fixes

* :wastebasket: remove deprecated key `SupportedStandards:LSP4DigitalCertificate` ([59844f6](https://github.com/lukso-network/lsp-smart-contracts/commit/59844f602dd30f6e2ef7f0dae75b57f9cf2ed704))
* android builds ([9223e30](https://github.com/lukso-network/lsp-smart-contracts/commit/9223e307f62e251b7b3c7eee7678552350f91d5e))
* change make-ios script to ts file ([40ff091](https://github.com/lukso-network/lsp-smart-contracts/commit/40ff091444ced6488f11b55075ee9e029b9dbdae))
* remove success check before emitting event ([cad39ae](https://github.com/lukso-network/lsp-smart-contracts/commit/cad39ae189f5757a50ff735d4067557b10ae7be8))

### [0.4.1](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.4.0...v0.4.1) (2021-11-26)

## [0.4.0](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.3.0...v0.4.0) (2021-11-26)


### ⚠ BREAKING CHANGES

* **release:** ILSP6 interface return type change.

* test!(KM): return bytes or revert on `execute` / `executeRelayCall`

Tests by interacting with `TargetContract`

* test!(KM): Remove gasLimit specified in tests.

* feat!(KM): Extend permission range to 256 (32 bytes)

* test!(KM): Use 32 bytes padding for 32 bytes permissions range

* test!: :heavy_plus_sign: set AddressPermissions[]  in tests

Addresses with permissions set MUST be added to an array inside ERC725Y key-value (see LSP6 specs)

* Fixed KeyManager permission key name

### Features

* :pushpin: upgrade `@erc725/smart-contracts` to version 2.1.6 ([#69](https://github.com/lukso-network/universalprofile-smart-contracts/issues/69)) ([97e19e8](https://github.com/lukso-network/universalprofile-smart-contracts/commit/97e19e86b166e85e4d8f3d2c091b9aaf3c0aac32))
* `ADDPERMISSIONS` + refactor LSP6Keymanager internal functions names & logic ([#65](https://github.com/lukso-network/universalprofile-smart-contracts/issues/65)) ([adc225c](https://github.com/lukso-network/universalprofile-smart-contracts/commit/adc225c75cd0c7a5f343f2238669b69d7b11a9b8))
* add Mintable version of LSP7 / LSP8  ([#61](https://github.com/lukso-network/universalprofile-smart-contracts/issues/61)) ([b8a0bdf](https://github.com/lukso-network/universalprofile-smart-contracts/commit/b8a0bdf50074f79e6e1e020bd489038cddc872e4))
* use custom `error` for reverts in KeyManager ([#68](https://github.com/lukso-network/universalprofile-smart-contracts/issues/68)) ([1e8113e](https://github.com/lukso-network/universalprofile-smart-contracts/commit/1e8113e4cbd4578f7c18fa709406f07ce496423f))


* **release:** 0.2.2 - the start ([#46](https://github.com/lukso-network/universalprofile-smart-contracts/issues/46)) ([928902f](https://github.com/lukso-network/universalprofile-smart-contracts/commit/928902f97333465262fdb18e2d84b21a121f81e5)), closes [#7](https://github.com/lukso-network/universalprofile-smart-contracts/issues/7) [#21](https://github.com/lukso-network/universalprofile-smart-contracts/issues/21) [#26](https://github.com/lukso-network/universalprofile-smart-contracts/issues/26) [#25](https://github.com/lukso-network/universalprofile-smart-contracts/issues/25) [#30](https://github.com/lukso-network/universalprofile-smart-contracts/issues/30) [#31](https://github.com/lukso-network/universalprofile-smart-contracts/issues/31) [#32](https://github.com/lukso-network/universalprofile-smart-contracts/issues/32) [#33](https://github.com/lukso-network/universalprofile-smart-contracts/issues/33) [#35](https://github.com/lukso-network/universalprofile-smart-contracts/issues/35) [#34](https://github.com/lukso-network/universalprofile-smart-contracts/issues/34) [#36](https://github.com/lukso-network/universalprofile-smart-contracts/issues/36) [#38](https://github.com/lukso-network/universalprofile-smart-contracts/issues/38) [#37](https://github.com/lukso-network/universalprofile-smart-contracts/issues/37) [#40](https://github.com/lukso-network/universalprofile-smart-contracts/issues/40) [#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41) [#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43) [#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44) [#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)

## [0.3.0](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.2.2...v0.3.0) (2021-11-15)


### ⚠ BREAKING CHANGES

* ILSP6 interface return type change.

* test!(KM): return bytes or revert on `execute` / `executeRelayCall`

Tests by interacting with `TargetContract`

* test!(KM): Remove gasLimit specified in tests.

* feat!(KM): Extend permission range to 256 (32 bytes)

* test!(KM): Use 32 bytes padding for 32 bytes permissions range

* test!: :heavy_plus_sign: set AddressPermissions[]  in tests

Addresses with permissions set MUST be added to an array inside ERC725Y key-value (see LSP6 specs)

* Fixed KeyManager permission key name
* the contracts + artifacts names have changed for all three packages

* feat!: :sparkles: make ERC20 / 721 compatible versions of LSP7/8 deployable

* fix: :green_heart: fix solhint CI error for empty block

* build: :heavy_minus_sign: remove submodule folder

ERC725 contracts are now imported as a npm package `@erc725/smart-contracts/`

Co-authored-by: YamenMerhi <yamennmerhi@gmail.com>
* **npm:** :heavy_plus_sign: add npm dependency: `@erc725/smart-contracts`

### Bug Fixes

* added contracts as dependencies ([3f12e97](https://github.com/lukso-network/universalprofile-smart-contracts/commit/3f12e97a4db2033f5f3ea11bbbeba71fe4768f46))
* gradle file invalid syntax ([#47](https://github.com/lukso-network/universalprofile-smart-contracts/issues/47)) ([633fa07](https://github.com/lukso-network/universalprofile-smart-contracts/commit/633fa074802722b6d5a26e876ba3654f73f1e226))


### build

* **npm:** :heavy_plus_sign: add npm dependency: `@erc725/smart-contracts` ([f881f0d](https://github.com/lukso-network/universalprofile-smart-contracts/commit/f881f0d3501b7edab435befe0fd43cbc940fe031))


* Fix conflicts main < develop for v0.3.0 (#56) ([975f772](https://github.com/lukso-network/universalprofile-smart-contracts/commit/975f772ef6a3e827b62cf3db49d6934fb51e578a)), closes [#56](https://github.com/lukso-network/universalprofile-smart-contracts/issues/56) [#46](https://github.com/lukso-network/universalprofile-smart-contracts/issues/46) [#7](https://github.com/lukso-network/universalprofile-smart-contracts/issues/7) [#21](https://github.com/lukso-network/universalprofile-smart-contracts/issues/21) [#26](https://github.com/lukso-network/universalprofile-smart-contracts/issues/26) [#25](https://github.com/lukso-network/universalprofile-smart-contracts/issues/25) [#30](https://github.com/lukso-network/universalprofile-smart-contracts/issues/30) [#31](https://github.com/lukso-network/universalprofile-smart-contracts/issues/31) [#32](https://github.com/lukso-network/universalprofile-smart-contracts/issues/32) [#33](https://github.com/lukso-network/universalprofile-smart-contracts/issues/33) [#35](https://github.com/lukso-network/universalprofile-smart-contracts/issues/35) [#34](https://github.com/lukso-network/universalprofile-smart-contracts/issues/34) [#36](https://github.com/lukso-network/universalprofile-smart-contracts/issues/36) [#38](https://github.com/lukso-network/universalprofile-smart-contracts/issues/38) [#37](https://github.com/lukso-network/universalprofile-smart-contracts/issues/37) [#40](https://github.com/lukso-network/universalprofile-smart-contracts/issues/40) [#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41) [#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43) [#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44) [#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)
* Remove submodule + Prepare v0.3.0 (New contracts + artifact names) (#54) ([d373d15](https://github.com/lukso-network/universalprofile-smart-contracts/commit/d373d1514bc6b24bf44acae40cf16e1f0938626b)), closes [#54](https://github.com/lukso-network/universalprofile-smart-contracts/issues/54)

### [0.2.2](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.2.1...v0.2.2) (2021-11-01)


### Bug Fixes

* android release ([#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)) ([5234ef2](https://github.com/lukso-network/universalprofile-smart-contracts/commit/5234ef2485da4a0d271efc14e108e92c857d5500))
* release CI fix ([#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43)) ([065a5b0](https://github.com/lukso-network/universalprofile-smart-contracts/commit/065a5b08fe68db7142f23874af4ab681842ea6fd))
* unresolved conflict in readme ([#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44)) ([ea057f9](https://github.com/lukso-network/universalprofile-smart-contracts/commit/ea057f999ee4fdd58a3404d7152be920b609c3d2))

### [0.2.1](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.2.0...v0.2.1) (2021-10-31)

### Bug Fixes

* github and npm release ci ([#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41)) ([4276fb8](https://github.com/lukso-network/universalprofile-smart-contracts/commit/4276fb84f7d754d75513716b7a792454ea16d2ff))

## [0.2.0](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.1.3...v0.2.0) (2021-10-31)

This release is the first release of the final UniversalProfile setup. It should be seen as a draft and not production ready release! Please use with caution!

### ⚠ BREAKING CHANGES

* ILSP6 interface return type change.

* test!(KM): return bytes or revert on `execute` / `executeRelayCall`

Tests by interacting with `TargetContract`

* test!(KM): Remove gasLimit specified in tests.

* feat!(KM): Extend permission range to 256 (32 bytes)

* test!(KM): Use 32 bytes padding for 32 bytes permissions range

* test!: :heavy_plus_sign: set AddressPermissions[]  in tests

Addresses with permissions set MUST be added to an array inside ERC725Y key-value (see LSP6 specs)

* KeyManager returns bytes + permission range extended to bytes32  (#32) ([7b6dcf0](https://github.com/lukso-network/universalprofile-smart-contracts/commit/7b6dcf022fffe51b7f2f652e5ded719dbfaea8e2)), closes [#32](https://github.com/lukso-network/universalprofile-smart-contracts/issues/32)

### Bug Fixes
* android release ([#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)) ([5234ef2](https://github.com/lukso-network/universalprofile-smart-contracts/commit/5234ef2485da4a0d271efc14e108e92c857d5500))
* release CI fix ([#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43)) ([065a5b0](https://github.com/lukso-network/universalprofile-smart-contracts/commit/065a5b08fe68db7142f23874af4ab681842ea6fd))
* unresolved conflict in readme ([#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44)) ([ea057f9](https://github.com/lukso-network/universalprofile-smart-contracts/commit/ea057f999ee4fdd58a3404d7152be920b609c3d2))
* github and npm release ci ([#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41)) ([4276fb8](https://github.com/lukso-network/universalprofile-smart-contracts/commit/4276fb84f7d754d75513716b7a792454ea16d2ff))

### [0.1.3](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.1.2...v0.1.3) (2021-08-31)


### Bug Fixes

* **publish:** include json artifacts ([f90a194](https://github.com/lukso-network/universalprofile-smart-contracts/commit/f90a194b94d2d26c3b173d01f715abfe31930e7f))

### [0.1.2](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.1.1...v0.1.2) (2021-08-31)

### Features

- **framework:** migrate from truffle to hardhat ([pr5](https://github.com/lukso-network/universalprofile-smart-contracts/pull/5))
- **typechain:** provide web3 and ethers types ([cad4541](https://github.com/lukso-network/universalprofile-smart-contracts/commit/cad4541f4d0ca47742fac4800c2a43c8a158615d))

### 0.1.1 (2021-08-17)

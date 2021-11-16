# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.


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

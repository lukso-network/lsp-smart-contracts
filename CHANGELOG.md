# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.6.1](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.6.0...v0.6.1) (2022-06-10)

### BREAKING CHANGES

* the LSP2 array data keys defined in `constants.js` are now splitted in two: `.length` and `.index` ([#192](https://github.com/lukso-network/lsp-smart-contracts/pull/192))

### Features

* update `receive()` function to `fallback() payable`, to allow sending random bytes payload to the fallback function. ([#194](https://github.com/lukso-network/lsp-smart-contracts/pull/194))

* update universalReceiver to latest spec ([#193](https://github.com/lukso-network/lsp-smart-contracts/issues/193)) ([5b2bc60](https://github.com/lukso-network/lsp-smart-contracts/commit/5b2bc601acbf467b132fc38093fdad9a54fdef1c))

* add error signatures in `constants.js`([#191](https://github.com/lukso-network/lsp-smart-contracts/pull/191))
* add LSP1 Type IDs in `constants.js` ([#196](https://github.com/lukso-network/lsp-smart-contracts/pull/196))


## [0.6.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.5.0...v0.6.0) (2022-06-03)


### ⚠ BREAKING CHANGES

* disable delegatecall
* remove DELEGATECALL from ALL_PERMISSIONS
* change name of interface IDs to match with docs
* edit LSP0 + LSP9 interface IDs in constant.ts
* add owner and transferOwnership in LSP0 / LSP9 interface ID
* edit LSP9 interface ID
* edit LSP0 interface ID
* add ClaimOwnership in LSP9 Vault (#164)
* prevent editing token name and symbols on LSP4
* change LSP0 interface ID by adding ClaimOwnership interface ID
* set owner permission in fixture to setup KeyManager
* change LSP6 interface ID
* rename function account() -> target() in LSP1
* rename function account() -> target() in LSP6
* **lsp6:** add `account()` function as part of the LSP6 interface (#131)

### Features

* add ClaimOwnership in LSP9 Vault ([#164](https://github.com/lukso-network/lsp-smart-contracts/issues/164)) ([edb9e1d](https://github.com/lukso-network/lsp-smart-contracts/commit/edb9e1dbf5829925c25e35cb2e35ad471e677f8b))
* add claimOwnership(...) path in KeyManager ([dde4221](https://github.com/lukso-network/lsp-smart-contracts/commit/dde4221cb6cd88af55d23a942cc2a32936919d01))
* add constant Solidity file for LSP3 ([ea20351](https://github.com/lukso-network/lsp-smart-contracts/commit/ea203519375beabf5d6993829939c769cf2d7be8))
* add interface + abstract contract OwnableClaim ([4416e81](https://github.com/lukso-network/lsp-smart-contracts/commit/4416e818e0a95db2fb883051ce2365035fcccd2c))
* add interface ID check for ClaimOwnership ([dd2b219](https://github.com/lukso-network/lsp-smart-contracts/commit/dd2b219a547a9ba2deb4af3b60b55cc5d6e5fbdf))
* add LSP5 and LSP10 Constants files ([dd3d1a8](https://github.com/lukso-network/lsp-smart-contracts/commit/dd3d1a8bb8b9c867c121aa3b1301adeb71029fd0))
* add LSP5Utils lib ([e8e5c2a](https://github.com/lukso-network/lsp-smart-contracts/commit/e8e5c2a0a7af567427100bd178fe6268c28b5ce6))
* add SUPER permissions in constants.ts ([d363124](https://github.com/lukso-network/lsp-smart-contracts/commit/d363124b3fe02e645b5900f5277fac8196cbab21))
* add SUPER permissions in permissions constants ([ae3a2e5](https://github.com/lukso-network/lsp-smart-contracts/commit/ae3a2e523e07af5ee5f030160b27bd46f6e46988))
* add support for SUPER OPERATION (CALL, STATICCALL, ...) to skip allowed checks ([90b94a2](https://github.com/lukso-network/lsp-smart-contracts/commit/90b94a27edcdef9d821cbbbf83a3cae3ef1e8949))
* extend jest matcher `toBeRevertedWith` as it does not work as expected with custom errors ([3a925ee](https://github.com/lukso-network/lsp-smart-contracts/commit/3a925ee7f17cb0a4e5ff75b6666684aa5bd43dd0))
* introduce `ErroHandlerLib` in execution in LSP6 ([724d411](https://github.com/lukso-network/lsp-smart-contracts/commit/724d41112d9f092936904b03deaaca52fe6bc502))
* **lsp6:** add `account()` function as part of the LSP6 interface ([#131](https://github.com/lukso-network/lsp-smart-contracts/issues/131)) ([db7b297](https://github.com/lukso-network/lsp-smart-contracts/commit/db7b297b8af86cd2dc04b3d870f204d0e6545b4e))
* LSP7 and LSP8 use solidity custom errors ([b353655](https://github.com/lukso-network/lsp-smart-contracts/commit/b3536556eed552e1acc172d98a297b923c939eb0))
* UniversalFactory ([#139](https://github.com/lukso-network/lsp-smart-contracts/issues/139)) ([3164d9a](https://github.com/lukso-network/lsp-smart-contracts/commit/3164d9a704da3c5d99c47a7b46a19741f8e696d8))
* use custom errors for LSP7/8 CappedSupply contracts ([07ac935](https://github.com/lukso-network/lsp-smart-contracts/commit/07ac935bf336562358930f07d9f86b710cd59d73))
* use custom version of `ERC165Checker` ([#132](https://github.com/lukso-network/lsp-smart-contracts/issues/132)) ([0e7bbec](https://github.com/lukso-network/lsp-smart-contracts/commit/0e7bbec34a75de9a9ba31db6146e162a800d3406))
* update interfaceID for LSP6 ([499ee6a](https://github.com/lukso-network/lsp-smart-contracts/commit/499ee6a73eef210e022c81a0590df8666502c815))


### Bug Fixes

* :bug: incorrect revert error for NotAuthorised(_from, "STATICCALL") ([a2e52ed](https://github.com/lukso-network/lsp-smart-contracts/commit/a2e52ed328c6b6799ded9a1396cde11765e7d784))
* `isValidSignature` function check ([#120](https://github.com/lukso-network/lsp-smart-contracts/issues/120)) ([2f2762d](https://github.com/lukso-network/lsp-smart-contracts/commit/2f2762da71095009949b1a045730d2ed3c8416b7))
* add chainId to the signed message in LSP6 ([2fdfb59](https://github.com/lukso-network/lsp-smart-contracts/commit/2fdfb59b9a379bc83191a4bec6a0f315b5f5a5e0))
* add permissions check when setting keys for `AddressPermissions[]` and `AddressPermissions[index]` ([#125](https://github.com/lukso-network/lsp-smart-contracts/issues/125)) ([18a143c](https://github.com/lukso-network/lsp-smart-contracts/commit/18a143c95086598a887b3df4cc907c18241b39c1))
* add sender code length check in UniversalReceiverDelegate ([12180a4](https://github.com/lukso-network/lsp-smart-contracts/commit/12180a4612c8e5e1e9303a6efad616f03b61bec8))
* admin caller with `ALL_PERMISSIONS` can call any functions part of the Universal Profile's ABI ([#128](https://github.com/lukso-network/lsp-smart-contracts/issues/128)) ([ec384d3](https://github.com/lukso-network/lsp-smart-contracts/commit/ec384d3e7869334ec63e4a0c805282b90bd9794a))
* apply checks-effects-interactions pattern ([77e2c43](https://github.com/lukso-network/lsp-smart-contracts/commit/77e2c43790cdac24bddf1540e09d83446017391f))
* apply checks-effects-interactions pattern ([#121](https://github.com/lukso-network/lsp-smart-contracts/issues/121)) ([6e0e5b2](https://github.com/lukso-network/lsp-smart-contracts/commit/6e0e5b2a6002cd6cb7af98de8de221d6837181dd))
* boolean check ([a7be1bd](https://github.com/lukso-network/lsp-smart-contracts/commit/a7be1bd5afd919f5de66a06b3c62784fbeef443f))
* comments ([69f0e8a](https://github.com/lukso-network/lsp-smart-contracts/commit/69f0e8af001f7625545b8c8aa1782b47ef461663))
* disable solhint with `no-unused-vars` in LSP1-URD ([ae6dcff](https://github.com/lukso-network/lsp-smart-contracts/commit/ae6dcffdd6404753ed2d81a400b19d9244479874))
* ERC1271 in export ([db80c69](https://github.com/lukso-network/lsp-smart-contracts/commit/db80c694ae2a3a06ff86b1d68728199ebac9288a))
* failing test ([1edef46](https://github.com/lukso-network/lsp-smart-contracts/commit/1edef460f5139ac343c6d61d2c3f43fb8137482d))
* fix OwnableUnset folder location in import statements ([c6702a0](https://github.com/lukso-network/lsp-smart-contracts/commit/c6702a09279e001d32e1cf63f661511cde1e85bc))
* flip `index` and `interfaceID` in LSP5 & LSP10 ([a926fa7](https://github.com/lukso-network/lsp-smart-contracts/commit/a926fa74590e1256aaaff59667eaad3f5d6ce645))
* inherit LSP0 contracts from most base to most derive ([bac9f5d](https://github.com/lukso-network/lsp-smart-contracts/commit/bac9f5dbe261de81242a6783ab0119e07557951f))
* inherit LSP1 contracts from most base to most derive ([1911886](https://github.com/lukso-network/lsp-smart-contracts/commit/1911886d03dbc42683369559aac064319b0ead3e))
* inherit LSP6 contracts from most base to most derive ([22762e0](https://github.com/lukso-network/lsp-smart-contracts/commit/22762e0874361f4c7bb863b3b4d2209716e2ae30))
* inherit LSP7 contracts from most base to most derive ([de29a58](https://github.com/lukso-network/lsp-smart-contracts/commit/de29a58fa0a7ed4db83151008a7f82b21777cc27))
* inherit LSP8 contracts from most base to most derive ([5f05302](https://github.com/lukso-network/lsp-smart-contracts/commit/5f053025f2c1bfb5ce858c0d4bf0d289a5542259))
* inherit LSP9 contracts from most base to most derive ([b34a049](https://github.com/lukso-network/lsp-smart-contracts/commit/b34a049edf43cfe9f90159082a725c346224a04b))
* **lsp6:** fix bugs for `AllowedERC725YKeys` when input is multiple keys that include allowed + not allowed keys ([#134](https://github.com/lukso-network/lsp-smart-contracts/issues/134)) ([8f95a79](https://github.com/lukso-network/lsp-smart-contracts/commit/8f95a7959df4047c2421b4fdb34a523fa2f62ae5))
* move AddressRegistry contract under Legacy/ folder ([3cf8102](https://github.com/lukso-network/lsp-smart-contracts/commit/3cf8102fe5137ba2111c4e2e8ed1fd7eada4c432))
* override `supportsInterface` in LSP0 ([6415e5f](https://github.com/lukso-network/lsp-smart-contracts/commit/6415e5f25bf2b64d2a30ae08c27ff514211f6f0f))
* override `supportsInterface` in LSP7 ([3840e6b](https://github.com/lukso-network/lsp-smart-contracts/commit/3840e6ba0983b88530ebef6872a441fb7d07e266))
* override `supportsInterface` in LSP8 ([57385b5](https://github.com/lukso-network/lsp-smart-contracts/commit/57385b5eb50cb7c53e2e3acee537ce56748fae4e))
* override `supportsInterface` in LSP9 ([707ba59](https://github.com/lukso-network/lsp-smart-contracts/commit/707ba5983138d90ddf6c9f17489c21fcf7cf5574))
* prevent editing token name and symbols on LSP4 ([d69b01f](https://github.com/lukso-network/lsp-smart-contracts/commit/d69b01f3aa83014ce90ab6b2c402fa8101e6b252))
* re-order `executeRelayCall(..)` params and remove `_signedFor` ([7ce3f96](https://github.com/lukso-network/lsp-smart-contracts/commit/7ce3f9632aa0efc45f310cd27ba74a0f5da8120c))
* reference to Allowed Standards Map key ([e8993e6](https://github.com/lukso-network/lsp-smart-contracts/commit/e8993e6b7bbcbe26d9284f2e4c47305843ebc68b))
* replace `initOwner` with `_setOwner` function ([5183765](https://github.com/lukso-network/lsp-smart-contracts/commit/5183765f53b1c7432ae7f6dc7bec4cbb276dd86d))
* resolve merge conflicts in LSP6Core ([2519ee1](https://github.com/lukso-network/lsp-smart-contracts/commit/2519ee1d0ce70911d98afd21c43a475a32cb6218))
* send the `msg.value` instead of 0 in `executeRelayCall(.)` ([d64855c](https://github.com/lukso-network/lsp-smart-contracts/commit/d64855cb0f22ea199390fb9ced17017dcb8e535c))
* **tests:** delegatecall tests to a function that does not use onlyOwner ([5a33d4b](https://github.com/lukso-network/lsp-smart-contracts/commit/5a33d4bf0a89a86dd0386c80cedeea3c063dcb8d))

* use internal `_getData` instead `getDataSingle` ([c7f7bc2](https://github.com/lukso-network/lsp-smart-contracts/commit/c7f7bc27081ced33f2af7228d6345d8131bb00ef))
* validate values for abi-encoded arrays in KeyManager ([#152](https://github.com/lukso-network/lsp-smart-contracts/issues/152)) ([200ff28](https://github.com/lukso-network/lsp-smart-contracts/commit/200ff2857c8e48a45c7761cf8a490fe094eaf8da))


### build

* change name of interface IDs to match with docs ([19e9e54](https://github.com/lukso-network/lsp-smart-contracts/commit/19e9e54a22f0e7f40961b1a0616cac73fd7a56d2))


* add owner and transferOwnership in LSP0 / LSP9 interface ID ([d4079a8](https://github.com/lukso-network/lsp-smart-contracts/commit/d4079a87757066585187c0bda949a00c6accc4ee))
* change LSP0 interface ID by adding ClaimOwnership interface ID ([37173ba](https://github.com/lukso-network/lsp-smart-contracts/commit/37173ba81b27647da9bd7b5000fb10e7932b89b1))
* change LSP6 interface ID ([8362ecd](https://github.com/lukso-network/lsp-smart-contracts/commit/8362ecd8218c0fe76d5b5f53c528b62be43da7d7))
* disable delegatecall ([7a66e4f](https://github.com/lukso-network/lsp-smart-contracts/commit/7a66e4f0f1d30163f8f6f3bacb8dabbdd2be0ac0))
* edit LSP0 + LSP9 interface IDs in constant.ts ([bb8133f](https://github.com/lukso-network/lsp-smart-contracts/commit/bb8133f0684799fa3fcb8feb79fbdb0821039990))
* edit LSP0 interface ID ([03ae8f4](https://github.com/lukso-network/lsp-smart-contracts/commit/03ae8f447c0c0bf506dafd445c35ef57995dc9f5))
* edit LSP2 keys according to new spec ([#177](https://github.com/lukso-network/lsp-smart-contracts/issues/177)) ([494c354](https://github.com/lukso-network/lsp-smart-contracts/commit/494c354c9a4813b8ed8e3b09934f669f4a47bd56))
* edit LSP9 interface ID ([44dbfda](https://github.com/lukso-network/lsp-smart-contracts/commit/44dbfdad4faff6ed91556295c9806a291215450a))
* remove DELEGATECALL from ALL_PERMISSIONS ([a3bf44c](https://github.com/lukso-network/lsp-smart-contracts/commit/a3bf44c19fd7ca907ba07bdc3f17938c8de7bbda))
* rename function account() -> target() in LSP1 ([035a0e5](https://github.com/lukso-network/lsp-smart-contracts/commit/035a0e52e63f2412285b43666e5b1d02e49a3d2b))
* rename function account() -> target() in LSP6 ([1e4949c](https://github.com/lukso-network/lsp-smart-contracts/commit/1e4949cb6e281d5411b70762f0e7b347a9620050))
* set owner permission in fixture to setup KeyManager ([6999787](https://github.com/lukso-network/lsp-smart-contracts/commit/6999787df38cde2e3dff4b1e307de06df28f5d5a))

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

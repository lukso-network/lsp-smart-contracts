# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [0.12.1](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.12.0...v0.12.1) (2023-11-07)


### Bug Fixes

* [L-01] Return `bytes` directly in LSP6 `_executePayload`, to prevent data loss ([#784](https://github.com/lukso-network/lsp-smart-contracts/issues/784)) ([fd23a24](https://github.com/lukso-network/lsp-smart-contracts/commit/fd23a24859f72e3ea9312ae1761ab98709db0142))
* [M-02] reset `_renounceOwnershipStartedAt` on `acceptOwnership(..)` in LSP14 ([#775](https://github.com/lukso-network/lsp-smart-contracts/issues/775)) ([5d8a7af](https://github.com/lukso-network/lsp-smart-contracts/commit/5d8a7af60dc548730688c0895eeb27d402ec5cc5))
* [M-03] allow setting 21 bytes under LSP17Extension data key in LSP6KeyManager ([#777](https://github.com/lukso-network/lsp-smart-contracts/issues/777)) ([8f1fb95](https://github.com/lukso-network/lsp-smart-contracts/commit/8f1fb959f0b9267bc099f774ca9a98fdd8921b97))
* [M-04 + L-02] improve empty call type checks for selector `0x00000000` ([#776](https://github.com/lukso-network/lsp-smart-contracts/issues/776)) ([78bb1e7](https://github.com/lukso-network/lsp-smart-contracts/commit/78bb1e7e32ae8c6ce1decdbfa26fafa72c4c5387))
* Adjust missing verificationData and verificationFunction ([#788](https://github.com/lukso-network/lsp-smart-contracts/issues/788)) ([bff93e7](https://github.com/lukso-network/lsp-smart-contracts/commit/bff93e7878848ac798c60f6c274e64dcb26b2a30))


### Miscellaneous

* add notice in Natspec for `isValidSignature` ([#787](https://github.com/lukso-network/lsp-smart-contracts/issues/787)) ([c1574a8](https://github.com/lukso-network/lsp-smart-contracts/commit/c1574a8b58ef78a64f3edf086c652ac4ad4a2931))
* adjust Natspec comments + use mixedCase name for `modifier` ([#786](https://github.com/lukso-network/lsp-smart-contracts/issues/786)) ([e7ef125](https://github.com/lukso-network/lsp-smart-contracts/commit/e7ef125a1b77d5b3feb85a2b4133dec314ff917a))
* bootstrap releases for path: . + add `Version.sol` in file to update version for ([#785](https://github.com/lukso-network/lsp-smart-contracts/issues/785)) ([c0090c6](https://github.com/lukso-network/lsp-smart-contracts/commit/c0090c6a6d7e3473702cd85549a1fa2670b00bff))
* Refactor verification ([4ff7b6f](https://github.com/lukso-network/lsp-smart-contracts/commit/4ff7b6fe161f39d579d5a6437fa2ddc580cd7570))

## [0.12.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.12.0-rc.0...v0.12.0) (2023-10-30)

### ⚠ BREAKING CHANGES

- Optional LSP1 Notification on `revokeOperator(..)` #2 ([#767](https://github.com/lukso-network/lsp-smart-contracts/issues/767))
- replace `ValueReceived` with `UniversalReceiver` ([#759](https://github.com/lukso-network/lsp-smart-contracts/issues/759))
- Allows `ERC725X.executeBatch` path in LSP6 Key Manager ([#760](https://github.com/lukso-network/lsp-smart-contracts/issues/760))
- update LS8 Metadata keys to new LSP8 standard specs ([#762](https://github.com/lukso-network/lsp-smart-contracts/issues/762))
- create `Version` contract and inherit it ([#764](https://github.com/lukso-network/lsp-smart-contracts/issues/764))
- Optional LSP1 Notification on `revokeOperator(..)` ([#763](https://github.com/lukso-network/lsp-smart-contracts/issues/763))

### Refactor

- Optional LSP1 Notification on `revokeOperator(..)` ([#763](https://github.com/lukso-network/lsp-smart-contracts/issues/763)) ([63c1a0f](https://github.com/lukso-network/lsp-smart-contracts/commit/63c1a0fb68502e11d58f7582e4e849d2f24c4924))
- Optional LSP1 Notification on `revokeOperator(..)` [#2](https://github.com/lukso-network/lsp-smart-contracts/issues/2) ([#767](https://github.com/lukso-network/lsp-smart-contracts/issues/767)) ([1f92ca5](https://github.com/lukso-network/lsp-smart-contracts/commit/1f92ca530fb56cf2b626b0feae311d6c4737b8a0))
- replace `ValueReceived` with `UniversalReceiver` ([#759](https://github.com/lukso-network/lsp-smart-contracts/issues/759)) ([0c17386](https://github.com/lukso-network/lsp-smart-contracts/commit/0c1738619818bcf2e01636f31782886b26fb91d7))
- update LS8 Metadata keys to new LSP8 standard specs ([#762](https://github.com/lukso-network/lsp-smart-contracts/issues/762)) ([a909926](https://github.com/lukso-network/lsp-smart-contracts/commit/a9099268f63b7a8f60e4304d61098b496ed03de0))

### Features

- Allows `ERC725X.executeBatch` path in LSP6 Key Manager ([#760](https://github.com/lukso-network/lsp-smart-contracts/issues/760)) ([941c06a](https://github.com/lukso-network/lsp-smart-contracts/commit/941c06a8f1a0d758b92bc890c382a38d13bb8cec))
- create `Version` contract and inherit it ([#764](https://github.com/lukso-network/lsp-smart-contracts/issues/764)) ([0745ed4](https://github.com/lukso-network/lsp-smart-contracts/commit/0745ed40b6bf93b929bb2e81b74ac27cad8e168a))

### Bug Fixes

- replaced broken LSP23 link ([#766](https://github.com/lukso-network/lsp-smart-contracts/issues/766)) ([492efab](https://github.com/lukso-network/lsp-smart-contracts/commit/492efab86d70817a472691ec7fc75dfc991e6f77))

## [0.12.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.11.1...v0.12.0-rc.0) (2023-10-18)

### ⚠ BREAKING CHANGES

- remove `LSP4Compatibility` contract + ERC20 Compatible token interfaces `ILSP7CompatibleERC20` / `ILSP8CompatibleERC721` (#749)
- add extra parameter `requestor` to `lsp20VerifyCall` (#753)
- Roll back to old `LSP1UniversalReceiverDelegate` Interface and functions (#741)
- remove `isEncodedArray(...)` from `LSP2utils.sol` (#746)
- add callee params to lsp20 & EXECUTE_RELAY_CALL permission & mapping reentrancyStatus (#729)
- set LSP8 TokenId Type on deployment / initialization (#712)
- re-change param name from `allowNonLSP1Recipient` to `force`

### Deprecation

- re-change param name from `allowNonLSP1Recipient` to `force` ([d59a2ff](https://github.com/lukso-network/lsp-smart-contracts/commit/d59a2ff4712a5373ce72ba1ccd63b2d796f60cd9))
- remove `isEncodedArray(...)` from `LSP2utils.sol` ([#746](https://github.com/lukso-network/lsp-smart-contracts/issues/746)) ([1ff7cd4](https://github.com/lukso-network/lsp-smart-contracts/commit/1ff7cd4e34a91c53ce72f19fb8d469d2ae0c9a09))
- remove `LSP4Compatibility` contract + ERC20 Compatible token interfaces `ILSP7CompatibleERC20` / `ILSP8CompatibleERC721` ([#749](https://github.com/lukso-network/lsp-smart-contracts/issues/749)) ([b038412](https://github.com/lukso-network/lsp-smart-contracts/commit/b038412c99d5149f25a83156322539e817e1575b))
- Roll back to old `LSP1UniversalReceiverDelegate` Interface and functions ([#741](https://github.com/lukso-network/lsp-smart-contracts/issues/741)) ([dab41a1](https://github.com/lukso-network/lsp-smart-contracts/commit/dab41a1baf61876865191424a5e19548845f1630))
- set LSP8 TokenId Type on deployment / initialization ([#712](https://github.com/lukso-network/lsp-smart-contracts/issues/712)) ([67cb333](https://github.com/lukso-network/lsp-smart-contracts/commit/67cb3333256e31a0c432a9bcd62f08e83e969222))

### Features

- add `_afterTokenTransfer` hook in LSP7 + LSP8 ([4e3adc2](https://github.com/lukso-network/lsp-smart-contracts/commit/4e3adc24e233138b8f1471320e3b1bb3307ef524))
- add `data` param in `_before` and `_after` token transfer hooks ([0cd0976](https://github.com/lukso-network/lsp-smart-contracts/commit/0cd097604193957aeb2d6bf181d9193719621eac))
- add `callee` params to lsp20 & `EXECUTE_RELAY_CALL` permission & `mapping reentrancyStatus` ([#729](https://github.com/lukso-network/lsp-smart-contracts/issues/729)) ([0ae4c83](https://github.com/lukso-network/lsp-smart-contracts/commit/0ae4c83d80227e53c614d46dce96f8b727822839))
- add lsp20 to `acceptOwnership` in LSP0 ([#747](https://github.com/lukso-network/lsp-smart-contracts/issues/747)) ([804779a](https://github.com/lukso-network/lsp-smart-contracts/commit/804779a5f7ac76b21695a00c622a7c0e5801192a))
- allow `endingTimestamp` to be 0 ([a8c730f](https://github.com/lukso-network/lsp-smart-contracts/commit/a8c730f608fdd585c94b69704272bdaec938a565))
- allow `renounceOwnership()` through LSP6 ([dd74b56](https://github.com/lukso-network/lsp-smart-contracts/commit/dd74b56af54cc01a5e28b50feac2ce6659403cda))
- allow sending value when using `setData(..)` through the LSP6 ([#725](https://github.com/lukso-network/lsp-smart-contracts/issues/725)) ([624c4a6](https://github.com/lukso-network/lsp-smart-contracts/commit/624c4a6dfa0c5c83c94f0b5e952adc783098d12c))
- create Extension4337 ([#735](https://github.com/lukso-network/lsp-smart-contracts/issues/735)) ([d1df1d0](https://github.com/lukso-network/lsp-smart-contracts/commit/d1df1d0c106f47bd24427f1c20c3423a00bb993c))
- add extra parameter `requestor` to `lsp20VerifyCall` ([#753](https://github.com/lukso-network/lsp-smart-contracts/pull/753)) ([f82626d](https://github.com/lukso-network/lsp-smart-contracts/commit/f82626d5f64efd396a40690687dfb5a2dc9c036e))

### Bug Fixes

- add `receive()` function in LSP7 & LSP8 to silent compiler warning ([#711](https://github.com/lukso-network/lsp-smart-contracts/pull/711)) ([e6fb55d](https://github.com/lukso-network/lsp-smart-contracts/commit/e6fb55d9acc7bd63b9d66920f2f346ecf812c289))
- bug in dodoc config, incorrect signature ([06b1f04](https://github.com/lukso-network/lsp-smart-contracts/commit/06b1f04f83158f27efb19670ed81f566d7b151ba))
- return `bytes32(0)` when permission value retrieved is not exactly 32 bytes long ([7422ab0](https://github.com/lukso-network/lsp-smart-contracts/commit/7422ab053b27f1139dc8b917218bebd2407009b9))
- ts configs and tests ([#733](https://github.com/lukso-network/lsp-smart-contracts/issues/733)) ([a977312](https://github.com/lukso-network/lsp-smart-contracts/commit/a977312f99a3f957e581f5b502ef818f033f3846))
- update logic to check against controller permissions when setting its Allowed Calls or ERC725Y Data Keys ([#734](https://github.com/lukso-network/lsp-smart-contracts/issues/734)) ([0d43077](https://github.com/lukso-network/lsp-smart-contracts/commit/0d43077a96b542f645d50cf9389f26c292c8b39e))

## [0.11.1](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.11.0-rc.1...v0.11.0) (2023-09-07)

### ⚠ BREAKING CHANGES

- change visibility of `_reentrancyStatus` state variable from `private` to `internal` in `LSP6KeyManagerCore` ([#651](https://github.com/lukso-network/lsp-smart-contracts/pull/651))

- change data key for `SupportedStandards` from `LSP3UniversalProfile` to `LSP3Profile` in `LSP3Constants.sol` and `constants.ts` ([#664](https://github.com/lukso-network/lsp-smart-contracts/pull/664))

- Include LSP20 in interfaceId calculation ([#668](https://github.com/lukso-network/lsp-smart-contracts/pull/668)), from: `0x3e89ad98` to `0x24871b3d`.

- Return instead of revert when the `LSP1UniversalReceiverDelegateUP` is not able to register LSP5-LSP10 data keys. ([#672](https://github.com/lukso-network/lsp-smart-contracts/pull/672))

- Change event name in LSP6 from `VerifiedCall` to `PermissionsVerified`. ([#673](https://github.com/lukso-network/lsp-smart-contracts/pull/673))

- Rename LSP23 to `LSP23LinkedContractsFactory`. ([#675](https://github.com/lukso-network/lsp-smart-contracts/pull/675))

- Change LSP6 interfaceId from `0x38bb3cdb` to `0x66918867`. ([#696](https://github.com/lukso-network/lsp-smart-contracts/pull/696))

- Change LSP7 interfaceId from `0xda1f85e4` to `0x05519512`. ([#700](https://github.com/lukso-network/lsp-smart-contracts/pull/700))

- Change LSP8 interfaceId from `0x622e7a01` to `0x1ae9ba1f`. ([#700](https://github.com/lukso-network/lsp-smart-contracts/pull/700))

- Remove `LSP0Utils.sol`. ([#683](https://github.com/lukso-network/lsp-smart-contracts/pull/683))

- Add LSP17 in inheritance of LSP7 and LSP8 ([#697](https://github.com/lukso-network/lsp-smart-contracts/pull/697))

- Change token LSP1 notification data format from `abi.encodePacked` to `abi.encode`. ([#699](https://github.com/lukso-network/lsp-smart-contracts/pull/699))

- Notify Operator via LSP1 in `authorizeOperator` in LSP7 and LSP8. ([#700](https://github.com/lukso-network/lsp-smart-contracts/pull/700))

### Features

- Mark multiple functions as `virtual` across the smart contracts, so that their behaviour can be overriden through inheritance [#644](https://github.com/lukso-network/lsp-smart-contracts/pull/644).

- Change visibility of `_reentrancyStatus` state variable from `private` to `internal` in `LSP6KeyManagerCore` ([#651](https://github.com/lukso-network/lsp-smart-contracts/pull/651))

- Create implementation of `LSP23LinkedContractsFactory` ([#658](https://github.com/lukso-network/lsp-smart-contracts/pull/658))

- Add external call (= hook) to LSP1 in LSP14 `renounceOwnership` function ([#663](https://github.com/lukso-network/lsp-smart-contracts/pull/663))

- Add `LSP25ExecuteRelayCall` as its separate standard. ([#678](https://github.com/lukso-network/lsp-smart-contracts/pull/678))

- Add `getOperatorsOf(address)` function to LSP7 ([#698](https://github.com/lukso-network/lsp-smart-contracts/pull/698))

- Add LSP17 in inheritance of LSP7 and LSP8 ([#697](https://github.com/lukso-network/lsp-smart-contracts/pull/697))

- Notify Operator via LSP1 in authorizeOperator in LSP7 and LSP8. (https://github.com/lukso-network/lsp-smart-contracts/pull/700)

### Perfs

- Improve deployment + runtime cost of LSP6 Key Manager by replacing calldata slices with `abi.decode` when verifying `ERC725X.execute(uint256,address,uint256,bytes)` calldata payloads ([#682](https://github.com/lukso-network/lsp-smart-contracts/pull/682))

### Bug Fixes

- Add lock guard when transferring ownership in LSP14 ([#645](https://github.com/lukso-network/lsp-smart-contracts/pull/645))

- Delete pending when confirming renounce ownership the second time ([#646](https://github.com/lukso-network/lsp-smart-contracts/pull/646))

- Disallowing setting LSP6 Key Manager as a LSP17 extension in setData paths in Key Manager ([#648](https://github.com/lukso-network/lsp-smart-contracts/pull/648))

- Add check for `length == 0` when checking for Allowed ERC725Y Data Keys in Key Manager to prevent mask from allowing any data keys ([#659](https://github.com/lukso-network/lsp-smart-contracts/pull/659))

- Use bitwise OR `|` operator in `LSP6Utils` function `combinePermissions(...)` to prevent from adding same permission twice and generate incorrect `bytes32` permission value ([#660](https://github.com/lukso-network/lsp-smart-contracts/pull/660))

- Resolve inheritance of `LSP8Burnable` to include LSP4 ([#661](https://github.com/lukso-network/lsp-smart-contracts/pull/661))

- Refactor `_fallbackLSP17Extendable` function to enable to run code after it is called + prevent potential solc bug "storage write removal". ([#674](https://github.com/lukso-network/lsp-smart-contracts/pull/674))

- Update lsp8 compatible approve() logic to allow operators themselves to authorize operators. ([#681](https://github.com/lukso-network/lsp-smart-contracts/pull/681))

- Add input validations for LSP6, LSP1 and LSP17 data keys when setting data in `LSP6SetDataModule` ([#679](https://github.com/lukso-network/lsp-smart-contracts/pull/679))

### Build

- upgrade `@erc725/smart-contracts` version to 5.2.0 ([#696](https://github.com/lukso-network/lsp-smart-contracts/pull/696))

## [0.11.0-rc.1](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.1...v0.11.0-rc.1) (2023-08-08)

### ⚠ BREAKING CHANGES

- refactor: rename LSP23 to LinkedContractsFactory (#658)

### Bug Fixes

- build: add LSP23 in artifacts (#662)
- failing tests for lsp23 + add LSP23 test suite in CI ([#657](https://github.com/lukso-network/lsp-smart-contracts/issues/657)) ([0e5d9bf](https://github.com/lukso-network/lsp-smart-contracts/commit/0e5d9bf7f9b212976f5c754b28f96b37a8039076))

## [0.11.0-rc.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.10.3...v0.11.0-rc.0) (2023-08-04)

### ⚠ BREAKING CHANGES

- change visibility of `_reentrancyStatus` state variable from `private` to `internal` ([#651](https://github.com/lukso-network/lsp-smart-contracts/pull/651))

### Features

- create LSP23MultiChainDeployment ([#649](https://github.com/lukso-network/lsp-smart-contracts/issues/649)) ([01fd820](https://github.com/lukso-network/lsp-smart-contracts/commit/01fd82038811ba65798f3ff8fe8273fd191dcb38)), closes [#650](https://github.com/lukso-network/lsp-smart-contracts/issues/650)
- change visibility of `_reentrancyStatus` state variable from `private` to `internal` ([#651](https://github.com/lukso-network/lsp-smart-contracts/pull/651))

## [0.10.3](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.10.2...v0.10.3) (2023-07-20)

### Bug Fixes

- Repair problem in package.json where require/import was swapped. Add in export of package.json ([4e38d39](https://github.com/lukso-network/lsp-smart-contracts/commit/4e38d39a82ef0e53cd5fcd4bbc5b0e4d4454993d))

## [0.10.2](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.10.1...v0.10.2) (2023-06-13)

### Refactor

- remove `EIP191Signer.sol` library, replace by function `toDataWithIntendedValidatorHash` from latest OpenZeppelin library ([#622](https://github.com/lukso-network/lsp-smart-contracts/issues/622)) ([235048d](https://github.com/lukso-network/lsp-smart-contracts/commit/235048d028d9a770cc5fe516ce5bdbeecf9072e2))
- remove LSP6 function selectors from `LSP6Constants.sol` ([0c2e9c0](https://github.com/lukso-network/lsp-smart-contracts/commit/0c2e9c01cde59c6a76c731e8bf4271425964df6b))

### Build

- upgrade default solc compiler version to 0.8.17 ([#627])(https://github.com/lukso-network/lsp-smart-contracts/issues/627)
- upgrade `@erc725/smart-contracts` version to 5.1.0 ([#624](https://github.com/lukso-network/lsp-smart-contracts/pull/624))
- remove android + iOS artifacts from Github release ([#617](https://github.com/lukso-network/lsp-smart-contracts/pull/617))

### Bug Fixes

- variable shadowing with `transferOwnership(_pendingOwner)` and `_pendingOwner` state variable ([7d1b5b8](https://github.com/lukso-network/lsp-smart-contracts/commit/7d1b5b8891ce6dfb970635e420bbf2d6e259d0c1))

## [0.10.1](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.10.0...v0.10.1) (2023-06-07)

### Bug Fixes

- Allow direct import of files in ./dist/\*. ([de3625f](https://github.com/lukso-network/lsp-smart-contracts/commit/de3625f62e9d98f1ca286b47af67b71688d3eb45))

## [0.10.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.9.0...v0.10.0) (2023-05-19)

### ⚠ BREAKING CHANGES

- Remove function overloading in ERC725 (affecting LSP0,LSP9) and LSP6 ([#575](https://github.com/lukso-network/lsp-smart-contracts/pull/575))

  Resulting in a change of interfaceId of ERC725X and ERC725Y and LSP0 and LSP9 and LSP6

  - ERC725X from `0x570ef073` to `0x7545acac`
  - ERC725Y from `0x714df77c` to `0x629aa694`
  - LSP0 from `0x0f15a0af` to `0x3e89ad98`
  - LSP6 from `0xfb437414` to `0x06561226` (Changed later to `0x38bb3cdb` when added validity timestamp feature)
  - LSP9 from `0x06561226` to `0x28af17e6`

- Add validity timestamp for LSP6 signatures ([#581](https://github.com/lukso-network/lsp-smart-contracts/pull/581))
  Resulting in a change of interfaceId from `0x06561226` to `0x38bb3cdb`

### Features

- Add `increaseAllowance` and `decreaseAllowance` functions in LSP7 as non-standard functions ([#592](https://github.com/lukso-network/lsp-smart-contracts/pull/592))

### Bug Fixes

- Add check for empty array parameters in batch `ERC725X.executeBatch(uint256[],address[],uint256[],bytes[])`/`ERC725Y.setDataBatch(bytes32[],bytes[])` ([#204](https://github.com/ERC725Alliance/ERC725/pull/204))
- Add check to avoid renounceOwnership in 1 step on network start ([#562](https://github.com/lukso-network/lsp-smart-contracts/pull/562))
- Fix wrong parameter in VerifiedCall event in LSP6 ([#570](https://github.com/lukso-network/lsp-smart-contracts/pull/570))
- Fix not checking for the REENTRANCY Permission in case of chained calls ([#576](https://github.com/lukso-network/lsp-smart-contracts/pull/576))
- Fix reverting in the UniversalReceiverDelegates contracts in case of minting in the constructor ([#579](https://github.com/lukso-network/lsp-smart-contracts/pull/579))
- Fix inheritance in LSP7Burnable extension ([#591](https://github.com/lukso-network/lsp-smart-contracts/pull/591))
- Emit event before external calls in the compatible version of the LSP7/8 tokens ([#590](https://github.com/lukso-network/lsp-smart-contracts/pull/590))

### Refactor

- Change the visibility of tokens variable to `private` to enforce access through standard functions ([#584](https://github.com/lukso-network/lsp-smart-contracts/pull/584))

## [0.9.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.8.1...v0.9.0) (2023-03-21)

### ⚠ BREAKING CHANGES

- Add LSP20 Call Verification to LSP0-ERC725Account (#511)
- add call type permissions (`dsct`) per Allowed Calls (#506)
- require `SUPER_TRANSFERVALUE` permission for deploying contracts with value (#505)
- change name of LSP6 event from `Executed` to `CallVerified` (#511)
- replace tuple value for LSP5/10 from `bytes8` -> `uint128` (#486)
- change LSP5/6/10 Array length from `uint256` to `uint128` (#482)
- Add batchCalls function in LSP0 and LSP9 (#476)
- change `CHANGEPERMISSIONS` to `EDITPERMISSIONS` (#481)

### Features

- Add LSP20 Call Verification to LSP0-ERC725Account ([#511](https://github.com/lukso-network/lsp-smart-contracts/issues/511)) ([f0d1eb3](https://github.com/lukso-network/lsp-smart-contracts/commit/f0d1eb3e3f8fd5341b18fe66559e27548339f2ed)), closes [#488](https://github.com/lukso-network/lsp-smart-contracts/issues/488) [#498](https://github.com/lukso-network/lsp-smart-contracts/issues/498)
- add call type permissions (`dsct`) per Allowed Calls ([#506](https://github.com/lukso-network/lsp-smart-contracts/issues/506)) ([e4ddb8b](https://github.com/lukso-network/lsp-smart-contracts/commit/e4ddb8bf9bd4385309545e922192e2276c4a3231))
- mark `generateSalt` function as `public` in the LSP16 Universal Factory ([#499](https://github.com/lukso-network/lsp-smart-contracts/issues/499)) ([f05d1aa](https://github.com/lukso-network/lsp-smart-contracts/commit/f05d1aa3379c21605d3546da7c797b6d809a4ca1))
- Add batchCalls function in LSP0 and LSP9 ([#476](https://github.com/lukso-network/lsp-smart-contracts/issues/476)) ([d360371](https://github.com/lukso-network/lsp-smart-contracts/commit/d360371559c4be4b009cf34ac2db3c4cbc64d545))

### Bug Fixes

- add check to ensure `data`'s offset is not pointing to itself ([#489](https://github.com/lukso-network/lsp-smart-contracts/issues/489)) ([733173e](https://github.com/lukso-network/lsp-smart-contracts/commit/733173ef5872f1d6d5b33be57b849fb05bfcdbfc))
- export artifacts ([#487](https://github.com/lukso-network/lsp-smart-contracts/issues/487)) ([e8fc0b5](https://github.com/lukso-network/lsp-smart-contracts/commit/e8fc0b5cc1fdcc18f4d2d137c1990870b938c7e3))
- require `SUPER_TRANSFERVALUE` permission for deploying contracts with value ([#505](https://github.com/lukso-network/lsp-smart-contracts/issues/505)) ([3efde24](https://github.com/lukso-network/lsp-smart-contracts/commit/3efde24d5425bd3d25465c19b85aa4e015832461))

### build

- change `CHANGEPERMISSIONS` to `EDITPERMISSIONS` ([#481](https://github.com/lukso-network/lsp-smart-contracts/issues/481)) ([16052dd](https://github.com/lukso-network/lsp-smart-contracts/commit/16052dd1bf484a7f36d38cb9298da6bd62f806d4))
- change LSP5/6/10 Array length from `uint256` to `uint128` ([#482](https://github.com/lukso-network/lsp-smart-contracts/issues/482)) ([6bcfd4d](https://github.com/lukso-network/lsp-smart-contracts/commit/6bcfd4d60d66838f055f8100f6b66bafc9b61a61))
- replace tuple value for LSP5/10 from `bytes8` -> `uint128` ([#486](https://github.com/lukso-network/lsp-smart-contracts/issues/486)) ([83a05db](https://github.com/lukso-network/lsp-smart-contracts/commit/83a05db89e394b8b99e5c0a887506805c859fd6f))

### [0.8.1](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.8.0...v0.8.1) (2023-02-21)

### Features

- create `LSP0Utils` library with functions to retrieve LSP1 addresses ([#466](https://github.com/lukso-network/lsp-smart-contracts/issues/466)) ([a51883e](https://github.com/lukso-network/lsp-smart-contracts/commit/a51883eabe22109c17cc9740af46cd8c7495a467))
- Support LSP17 Extension in LSP0/LSP9 for `bytes4(0)` function selector ([#473](https://github.com/lukso-network/lsp-smart-contracts/pull/473))
- Seperate LSP6 Core contract in logic modules ([#461](https://github.com/lukso-network/lsp-smart-contracts/pull/461))

### Bug Fixes

- Remove Address Library from the Token Contracts to allow the contracts to be safe for an upgrade. ([#471](https://github.com/lukso-network/lsp-smart-contracts/pull/471))
- Add typescript transpilation and hook in package.json exports ([#470](https://github.com/lukso-network/lsp-smart-contracts/issues/470)) ([66fe41e](https://github.com/lukso-network/lsp-smart-contracts/commit/66fe41e3ea72460f47d6942c227f7569015d078c))
- Revert in LSP7/LSP8 to prevent a token owner to approve itself ([#465](https://github.com/lukso-network/lsp-smart-contracts/commit/f85b1931bb8153c3368287b494952cc659b9424e))

## [0.8.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.7.0...v0.8.0) (2023-01-24)

### ⚠ BREAKING CHANGES

- [WP-I16] Revert instead of return when no extension exist in LSP17 (#433)
- Change `AllowedERC725YKeys` to `AllowedERC725YDataKeys` (#379)
- change `universalReceiverDelegate(..)` to `universalReceiver(..)` (#376)
- switch the order of LSP6 `Executed` event + index both params (#378)
- Add LSP17ContractExtension implementation in LSP0 & LSP9 (#369)
- add ADD/CHANGE Extensions permissions and check in LSP6 (#368)
- mark `initialize(...)` function as `external` (#359)
- upgrade `@erc725/smart-contracts` dependency to 4.0.0 (#355)
- [WP-M7] LSP-6: do not allow any interaction if `AllowedCalls` is empty for a caller/signer (#356)
- [WP-M5] LSP-6: Replace `AllowedStandards/Address/Functions` by `AllowedCalls` - Signature collisions can be exploited with phishing attack (#351)
- [WP-C2] Change the verification logic of AllowedERC725YKeys in LSP6 (#352)
- [WP-I19] Adding `bool[]` for token `transferBatch(..)` (#350)
- Change executeRelayCall signing data with EIP191 (#349)
- Re-order and Add new LSP6 permissions (#346)
- [WP-L12] - LSP-6: change parameter of `getNonce(address,uint256)` to a `uint128` -> `getNonce(address,uint128)` (#341)
- add check for `amount != 0` when transferring LSP7 tokens
- Replace custom/ClaimOwnership with LSP14Ownable2Step (#323)
- change order of LSP6 permissions (#322)
- switch the returnedValue with the receivedData values in UniversalReceiver Event (#321)
- split between ENCRYPT/DECRYPT permissions + move SUPER permissions on the left bit range

### Features

- [WP-H2] Add msg.value to LSP6 signed message ([#347](https://github.com/lukso-network/lsp-smart-contracts/issues/347)) ([f47d44d](https://github.com/lukso-network/lsp-smart-contracts/commit/f47d44dff2cca92a0a767193eb0003d14a35d445))
- Add `OwnershipRenounced()` event as mentioned in the specs. ([#324](https://github.com/lukso-network/lsp-smart-contracts/issues/324)) ([4191842](https://github.com/lukso-network/lsp-smart-contracts/commit/4191842a537aedba50477b9895ec748124fbd962))
- add ADD/CHANGE Extensions permissions and check in LSP6 ([#368](https://github.com/lukso-network/lsp-smart-contracts/issues/368)) ([f1e5993](https://github.com/lukso-network/lsp-smart-contracts/commit/f1e59939a1a187cb6ba4fff80191914661b80fe9))
- add ADD/CHANGE UniversalReceiverDelegate checks in LSP6 ([#363](https://github.com/lukso-network/lsp-smart-contracts/issues/363)) ([99a439f](https://github.com/lukso-network/lsp-smart-contracts/commit/99a439f0176b53a0298d964f9d8ae6218ca5a686))
- add LSP11BasicSocialRecovery implementation ([#114](https://github.com/lukso-network/lsp-smart-contracts/issues/114)) ([91b900a](https://github.com/lukso-network/lsp-smart-contracts/commit/91b900a5ee974b036f9497514bdd1643a3f2557a))
- Add LSP17ContractExtension implementation in LSP0 & LSP9 ([#369](https://github.com/lukso-network/lsp-smart-contracts/issues/369)) ([749ace7](https://github.com/lukso-network/lsp-smart-contracts/commit/749ace76cfd4269f888c338dd88f97410d4c283e))
- add routing (= external call ) to additional contract in `universalReceiver(...)` function based on typeId ([#326](https://github.com/lukso-network/lsp-smart-contracts/issues/326)) ([345c563](https://github.com/lukso-network/lsp-smart-contracts/commit/345c563cfdf5c3012f0fa29ec73b406fbb4ce3f3))
- Add the `ValueReceived` event in all payable methods ([#330](https://github.com/lukso-network/lsp-smart-contracts/issues/330)) ([eb9919f](https://github.com/lukso-network/lsp-smart-contracts/commit/eb9919fb82414657b721cfb6e70f06659366af52))
- Allows reentrancy in LSP6 only from controller addresses with REENTRANCY permission + new tests ([#332](https://github.com/lukso-network/lsp-smart-contracts/issues/332)) ([b1ef1bd](https://github.com/lukso-network/lsp-smart-contracts/commit/b1ef1bd77ecb31948ca0cb20dfc0f3a34fd337f4))
- introduce batch `execute(bytes[])` and`executeRelayCall(bytes[],uint256[],bytes[])` on the LSP6 Key Manager ([#367](https://github.com/lukso-network/lsp-smart-contracts/issues/367)) ([bde715a](https://github.com/lukso-network/lsp-smart-contracts/commit/bde715afe8ed318befd73b5d9792e608427f7ec0))
- Re-order and Add new LSP6 permissions ([#346](https://github.com/lukso-network/lsp-smart-contracts/issues/346)) ([fa501a1](https://github.com/lukso-network/lsp-smart-contracts/commit/fa501a1d501eaedd394e70300d7dde76ac96d63f))
- Replace custom/ClaimOwnership with LSP14Ownable2Step ([#323](https://github.com/lukso-network/lsp-smart-contracts/issues/323)) ([b3ff7a6](https://github.com/lukso-network/lsp-smart-contracts/commit/b3ff7a66439cbfed779e3ee0992d5b9047ad208e))

### Bug Fixes

- Reset `pendingOwner` whenever `renounceOwnership(..)` is used. ([#310](https://github.com/lukso-network/lsp-smart-contracts/issues/310)) ([d0bb563](https://github.com/lukso-network/lsp-smart-contracts/commit/d0bb563dbce36353c8d9407f90c4dfb68c5d47d1))
- [WP-I6] add `onERC721Received` check for the `safeTransferFrom` functions of `LSP8CompatibleERC721` contracts ([#455](https://github.com/lukso-network/lsp-smart-contracts/issues/455)) ([d65f197](https://github.com/lukso-network/lsp-smart-contracts/commit/d65f197082f14f548e91860e70970cdd5ed11039))
- [WP-L11] LSP-7: LSP7CompatibleERC20 is not fully compatible with the conventional implementation of ERC20 on the emission of `Approval` events ([#373](https://github.com/lukso-network/lsp-smart-contracts/issues/373)) ([3b1bede](https://github.com/lukso-network/lsp-smart-contracts/commit/3b1bede36e034993dcadf50dafcdfa4a6cb35366))
- [WP-L12] - LSP-6: change parameter of `getNonce(address,uint256)` to a `uint128` -> `getNonce(address,uint128)` ([#341](https://github.com/lukso-network/lsp-smart-contracts/issues/341)) ([67f41c4](https://github.com/lukso-network/lsp-smart-contracts/commit/67f41c4266acb4d2b7ec884dfe3f6016d24a2f34))
- [WP-L13] refactor the LSP6 Key Manager to allow empty calls + check for required permissions ([#450](https://github.com/lukso-network/lsp-smart-contracts/issues/450)) ([b34ae22](https://github.com/lukso-network/lsp-smart-contracts/commit/b34ae22bf9d4e351d08c94ef3cce3a0c74bfe32f))
- [WP-M2] LSP-2: `LSP2Utils.isCompactBytesArray(bytes)` does not support zero-length elements (`[..., 0x, ...]`) ([#438](https://github.com/lukso-network/lsp-smart-contracts/issues/438)) ([b962386](https://github.com/lukso-network/lsp-smart-contracts/commit/b962386a0d7484ceab6850a2b83f54d0986896d4))
- [WP-M5] LSP-6: Replace `AllowedStandards/Address/Functions` by `AllowedCalls` - Signature collisions can be exploited with phishing attack ([#351](https://github.com/lukso-network/lsp-smart-contracts/issues/351)) ([86c92a6](https://github.com/lukso-network/lsp-smart-contracts/commit/86c92a659ead37928a2b0c9bb0d9125c3fa48100))
- [WP-M7] LSP-6: do not allow any interaction if `AllowedCalls` is empty for a caller/signer ([#356](https://github.com/lukso-network/lsp-smart-contracts/issues/356)) ([7b1258a](https://github.com/lukso-network/lsp-smart-contracts/commit/7b1258aae7087c7fbaec11c0ddbdd6933fc7acbc))
- [WP-M8] LSP7 allow zero-value transfers for `transfer(..)`, `mint(..)` and `burn(..)` ([#343](https://github.com/lukso-network/lsp-smart-contracts/issues/343)) ([c503124](https://github.com/lukso-network/lsp-smart-contracts/commit/c503124e996815d50c9fb48432f359d1c32edee3))
- [WP-M9] LSP-2: `LSP2Utils.isEncodedArray()` Incomplete implementation ([#342](https://github.com/lukso-network/lsp-smart-contracts/issues/342)) ([57c4a26](https://github.com/lukso-network/lsp-smart-contracts/commit/57c4a26975628b0c4ecd85de302c00f5b88b4350))
- add `ValueReceived` event to batch ERC725X `execute(uint256[],address[],uint256[],bytes[])` functions in LSP0 and LSP9 ([#377](https://github.com/lukso-network/lsp-smart-contracts/issues/377)) ([6502e15](https://github.com/lukso-network/lsp-smart-contracts/commit/6502e15170f2d8ed210feb9f47128d35f527fc4c))
- Add appropriate overrides of supportsInterface in LSP7 and LSP8 ([#389](https://github.com/lukso-network/lsp-smart-contracts/issues/389)) ([61843b7](https://github.com/lukso-network/lsp-smart-contracts/commit/61843b7047ddbe140007cf25213aa0e252b2f6b7))
- add check for `amount != 0` when transferring LSP7 tokens ([733e85d](https://github.com/lukso-network/lsp-smart-contracts/commit/733e85d5723312f6871b6889242247ca6dc75fe3))
- add check for ValueReceived event in LSP0/LSP9 ([#361](https://github.com/lukso-network/lsp-smart-contracts/issues/361)) ([2c6e1a0](https://github.com/lukso-network/lsp-smart-contracts/commit/2c6e1a03d0f2fc39789ae74fa3644d03be93d495))
- add checks for ADD / CHANGE permissions when data key is `AddressPermissions[index]` ([#320](https://github.com/lukso-network/lsp-smart-contracts/issues/320)) ([2e9f459](https://github.com/lukso-network/lsp-smart-contracts/commit/2e9f45969f67018fe947e0a71e01c3a15c3523bd))
- add length check to isCompactBytesArray ([#437](https://github.com/lukso-network/lsp-smart-contracts/issues/437)) ([f82166e](https://github.com/lukso-network/lsp-smart-contracts/commit/f82166ed825dd579b100fcc19504295a2086e3c8))
- add reference to `.key` member for SupportedStandards in constants ([#311](https://github.com/lukso-network/lsp-smart-contracts/issues/311)) ([550699f](https://github.com/lukso-network/lsp-smart-contracts/commit/550699fe6735bc249b6810046ae596444a683642))
- all `solc` compiler warnings ([#385](https://github.com/lukso-network/lsp-smart-contracts/issues/385)) ([914fcd0](https://github.com/lukso-network/lsp-smart-contracts/commit/914fcd007b9a924d4cb0e3115705018a35620044))
- allow clearing `AddressPermission[index]` with CHANGE permission ([#345](https://github.com/lukso-network/lsp-smart-contracts/issues/345)) ([29ad552](https://github.com/lukso-network/lsp-smart-contracts/commit/29ad552da5b56aadd1f0e428873e10b6ab4b48e5))
- avoid "returnbomb" in ERC165Checker ([#340](https://github.com/lukso-network/lsp-smart-contracts/issues/340)) ([f11a2db](https://github.com/lukso-network/lsp-smart-contracts/commit/f11a2dbd786d14418b51eddfe17d3ee48ccbd9bc))
- emit `OwnershipTransferStarted` and `Executed` events before external calls ([#333](https://github.com/lukso-network/lsp-smart-contracts/issues/333)) ([91776ed](https://github.com/lukso-network/lsp-smart-contracts/commit/91776ed78ed829290e0a474288d0bee177c8cce5))
- error selector for `LSP7AmountExceedsBalance` ([#365](https://github.com/lukso-network/lsp-smart-contracts/issues/365)) ([ce1ab23](https://github.com/lukso-network/lsp-smart-contracts/commit/ce1ab234dc2e808aada58c27dd597206dfbfa2c0))
- fixed failing iOS CI ([#313](https://github.com/lukso-network/lsp-smart-contracts/issues/313)) ([25e965b](https://github.com/lukso-network/lsp-smart-contracts/commit/25e965b0f0a20979bc874853842dd1971acd6bd8))
- incorrect permission for `DECRYPT` ([#317](https://github.com/lukso-network/lsp-smart-contracts/issues/317)) ([0f4b4e4](https://github.com/lukso-network/lsp-smart-contracts/commit/0f4b4e499f5a4bad9ad2353d797a92ab70c5035f))
- Narrower remapping of erc725 to support git modules downstream ([#456](https://github.com/lukso-network/lsp-smart-contracts/issues/456)) ([69ea41f](https://github.com/lukso-network/lsp-smart-contracts/commit/69ea41f7712f7fd360ec448938b9d87c63485976))
- update the logic inside universalReceiver function and revert typeId changes ([#331](https://github.com/lukso-network/lsp-smart-contracts/issues/331)) ([dd9f309](https://github.com/lukso-network/lsp-smart-contracts/commit/dd9f3094088ddbe343f8b9e1a51d80b2d644c7a0))
- upgrade to 0.8.15 for default compiler + increase minimum solc version for LSP7/LSP8 Compatible ([#402](https://github.com/lukso-network/lsp-smart-contracts/issues/402)) ([1b8b2e0](https://github.com/lukso-network/lsp-smart-contracts/commit/1b8b2e02b2329ac96d9db24024877e8454a20f84))
- Use @openzeppelin/contracts-upgradeable for Initializable imports ([#445](https://github.com/lukso-network/lsp-smart-contracts/issues/445)) ([628aac5](https://github.com/lukso-network/lsp-smart-contracts/commit/628aac51f31ec1678b8f2f06a988ee8c113840ec))

### build

- upgrade `@erc725/smart-contracts` dependency to 4.0.0 ([#355](https://github.com/lukso-network/lsp-smart-contracts/issues/355)) ([310c8a5](https://github.com/lukso-network/lsp-smart-contracts/commit/310c8a531038de32d572e1583068cc454ae886e8))
- [WP-I16] Revert instead of return when no extension exist in LSP17 ([#433](https://github.com/lukso-network/lsp-smart-contracts/issues/433)) ([d464ab8](https://github.com/lukso-network/lsp-smart-contracts/commit/d464ab8ca00c4cb7fbe9ba8057fb19707637a875))
- [WP-C2] Change the verification logic of AllowedERC725YKeys in LSP6 ([#352](https://github.com/lukso-network/lsp-smart-contracts/issues/352)) ([0b45749](https://github.com/lukso-network/lsp-smart-contracts/commit/0b45749f6a63596f53fb913931b200166fcaf128))
- [WP-I19] Adding `bool[]` for token `transferBatch(..)` ([#350](https://github.com/lukso-network/lsp-smart-contracts/issues/350)) ([4ea5b0e](https://github.com/lukso-network/lsp-smart-contracts/commit/4ea5b0ea29d1fed191e2577175db3fd6bcd5090b))
- Change `AllowedERC725YKeys` to `AllowedERC725YDataKeys` ([#379](https://github.com/lukso-network/lsp-smart-contracts/issues/379)) ([0566ea1](https://github.com/lukso-network/lsp-smart-contracts/commit/0566ea1be44c30b9c37e9beb72a3c29c2caf2087))
- change `universalReceiverDelegate(..)` to `universalReceiver(..)` ([#376](https://github.com/lukso-network/lsp-smart-contracts/issues/376)) ([bba92d5](https://github.com/lukso-network/lsp-smart-contracts/commit/bba92d5448ac7ff2bcc6af563a730fe29e498cff))
- Change executeRelayCall signing data with EIP191 ([#349](https://github.com/lukso-network/lsp-smart-contracts/issues/349)) ([ef7d0c7](https://github.com/lukso-network/lsp-smart-contracts/commit/ef7d0c7e0cfeff25925596842e944ce38954e5c3))
- change order of LSP6 permissions ([#322](https://github.com/lukso-network/lsp-smart-contracts/issues/322)) ([0dfc377](https://github.com/lukso-network/lsp-smart-contracts/commit/0dfc37774c0d7a031283383ac9d4186bbb777496))
- mark `initialize(...)` function as `external` ([#359](https://github.com/lukso-network/lsp-smart-contracts/issues/359)) ([849299f](https://github.com/lukso-network/lsp-smart-contracts/commit/849299fc584ec00568a9d83ecde199d3843195af))
- switch the order of LSP6 `Executed` event + index both params ([#378](https://github.com/lukso-network/lsp-smart-contracts/issues/378)) ([193fd0e](https://github.com/lukso-network/lsp-smart-contracts/commit/193fd0ed11eb34f7bab8223c3265a46980558dfa))
- switch the returnedValue with the receivedData values in UniversalReceiver Event ([#321](https://github.com/lukso-network/lsp-smart-contracts/issues/321)) ([00b6833](https://github.com/lukso-network/lsp-smart-contracts/commit/00b6833fca1e0100970af8c9519fd82ccbf57b5f))

## [0.7.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.6.2...v0.7.0) (2022-09-07)

### ⚠ BREAKING CHANGES

- remove `LSP7Init` and `LSP8Init` + make barebone LSP7/8 contracts non deployable ([#296](https://github.com/lukso-network/lsp-smart-contracts/issues/296)) ([4dec2f1](https://github.com/lukso-network/lsp-smart-contracts/commit/4dec2f1c739bdca1eb81bf97604861fb8e388cb2))
- Update ClaimOwnership, LSP0 and LSP9 InterfaceId ([#298](https://github.com/lukso-network/lsp-smart-contracts/issues/298)) ([24a281c](https://github.com/lukso-network/lsp-smart-contracts/commit/24a281cd683951031bbd1ab261b002e0d8e8d6a8))
- [LSP0, LSP4, LSP9] emit only the first 256 bytes of the value in the `DataChanged` event ([#301](https://github.com/lukso-network/lsp-smart-contracts/issues/301)) ([f92f996](https://github.com/lukso-network/lsp-smart-contracts/commit/f92f996c1aa7bf8789a427ae6cfd6606009079bf))
- use `uint8` instead of `uint256` in LSP7 decimals ([#292](https://github.com/lukso-network/lsp-smart-contracts/issues/292)) ([cc23ff5](https://github.com/lukso-network/lsp-smart-contracts/commit/cc23ff5ca985baaa3644e39b0628efd11198b94a))
- add new permission ENCRYPT in `constants.js` (#289)
- Change `isOperatorFor(..)` to `authorizedAmountFor(..)` in LSP7 ([#279](https://github.com/lukso-network/lsp-smart-contracts/issues/279)) ([afc5895](https://github.com/lukso-network/lsp-smart-contracts/commit/afc58954c5a877615820d5699b6be7a7857a91df))

### Features

- [QSP - Best Practices] Use `_uncheckedIncrement(..)` for saving gas when iterating loops ([#273](https://github.com/lukso-network/lsp-smart-contracts/issues/273)) ([4632f9c](https://github.com/lukso-network/lsp-smart-contracts/commit/4632f9ce673bbab9bee841394a85d3d0b9de8832))
- [QSP-12] Add two step process for `renounceOwnership(...)` in `ClaimOwnership` contract ([#282](https://github.com/lukso-network/lsp-smart-contracts/issues/282)) ([b816f38](https://github.com/lukso-network/lsp-smart-contracts/commit/b816f38e44ace092722bc7be0408231eb462549a))
- Add a hook that notifies the vault pending owner ([#295](https://github.com/lukso-network/lsp-smart-contracts/issues/295)) ([bb9d579](https://github.com/lukso-network/lsp-smart-contracts/commit/bb9d579f7ab6657ef805794166cdbf8d4c061dbd))
- add GasLib library with unchecked increment ([#297](https://github.com/lukso-network/lsp-smart-contracts/issues/297)) ([1a7757f](https://github.com/lukso-network/lsp-smart-contracts/commit/1a7757fd85940e3dee5a7577e2410dc5d04eaad8))
- add new permission ENCRYPT in `constants.js` ([#289](https://github.com/lukso-network/lsp-smart-contracts/issues/289)) ([259c55e](https://github.com/lukso-network/lsp-smart-contracts/commit/259c55ee19602fe521861bf4eeddf1e36d699238))

### Bug Fixes

- [QSP - Best Practices] Add ReentrancyGuard for Mintable token presets ([#280](https://github.com/lukso-network/lsp-smart-contracts/issues/280)) ([a8445cb](https://github.com/lukso-network/lsp-smart-contracts/commit/a8445cb4b51d7ae56fc0b52075ca8e5b59088817))
- [QSP - Best Practices] clean TODO comments + add extra permission checks and support in LSP6 ([#272](https://github.com/lukso-network/lsp-smart-contracts/issues/272)) ([f5c6e3a](https://github.com/lukso-network/lsp-smart-contracts/commit/f5c6e3a14dd62a356ef24c34dcde008a07ef4739))
- [QSP - Best Practices] refactor `deployCreate2Proxy(..)` to revert instead of refund caller ([#276](https://github.com/lukso-network/lsp-smart-contracts/issues/276)) ([cc99840](https://github.com/lukso-network/lsp-smart-contracts/commit/cc9984093ddd0a22f90c0f3e7dcf45d9ffc69f56))
- [QSP-10] Revert when authorizing existing operators in LSP8 ([#270](https://github.com/lukso-network/lsp-smart-contracts/issues/270)) ([f7b0c36](https://github.com/lukso-network/lsp-smart-contracts/commit/f7b0c362156bbb176c2244d5b2473c80183faa09))
- [QSP-14] Revert when revoking non-existing operators ([#271](https://github.com/lukso-network/lsp-smart-contracts/issues/271)) ([a5d72cf](https://github.com/lukso-network/lsp-smart-contracts/commit/a5d72cff5361279da8ac298ffa8d90438348b6d4))
- [QSP-3] Operator Could Clear Operator List in LSP8 ([#266](https://github.com/lukso-network/lsp-smart-contracts/issues/266)) ([d608479](https://github.com/lukso-network/lsp-smart-contracts/commit/d608479df753087b33897586f2fe92b90252c869))
- [QSP-4] add requirements checks on `LSP4DigitalAssetMetadata` deployment + add tests for internal `_burn(...)` function in LSP8 ([#268](https://github.com/lukso-network/lsp-smart-contracts/issues/268)) ([b576750](https://github.com/lukso-network/lsp-smart-contracts/commit/b576750374feab64bc4abfc0e2fcf7964f5ade60))
- [QSP-5] Missing \_disableInitializers for some Contracts ([#265](https://github.com/lukso-network/lsp-smart-contracts/issues/265)) ([097c266](https://github.com/lukso-network/lsp-smart-contracts/commit/097c266712d34947a34dd3152403c652a3d269a8))
- [QSP-6] fix incorrect index check for `_countTrailingZeroBytes(...)` in `LSP6KeyManagerCore.sol` ([#264](https://github.com/lukso-network/lsp-smart-contracts/issues/264)) ([41407aa](https://github.com/lukso-network/lsp-smart-contracts/commit/41407aa8c651039ea06d020b86fece7ad5859456))
- add `setApprovalForAll(...)` in `LSP8CompatibleERC721` ([#239](https://github.com/lukso-network/lsp-smart-contracts/issues/239)) ([945c776](https://github.com/lukso-network/lsp-smart-contracts/commit/945c776276144e8afa0e386d023ba300bc1ebcef))
- Add Checks to ensure contract cannot be self owned with ClaimOwnership ([#288](https://github.com/lukso-network/lsp-smart-contracts/issues/288)) ([31a304e](https://github.com/lukso-network/lsp-smart-contracts/commit/31a304efaf4f3955298d74dfe1aacc72af8e3736))
- Fix LSP8Constants errors ([#255](https://github.com/lukso-network/lsp-smart-contracts/issues/255)) ([c8e1533](https://github.com/lukso-network/lsp-smart-contracts/commit/c8e15337f7946f21e9f51a28beb3c5341bd2d70e))
- Hide linter warnings ([#250](https://github.com/lukso-network/lsp-smart-contracts/issues/250)) ([b0dc655](https://github.com/lukso-network/lsp-smart-contracts/commit/b0dc65570646f7d2daa6d437e2dc7d92befe4056))
- prevent operator allowance to decrease if `from` and `to` are the same address ([#291](https://github.com/lukso-network/lsp-smart-contracts/issues/291)) ([200a21f](https://github.com/lukso-network/lsp-smart-contracts/commit/200a21f50d34f5bfea82a885dbabd805c7de3d24))
- remove code length check in UniversalReceiverDelegate ([#267](https://github.com/lukso-network/lsp-smart-contracts/issues/267)) ([5a92642](https://github.com/lukso-network/lsp-smart-contracts/commit/5a9264238380b65f36ae6dd9adafca5bbb0965a1))
- replace variable silinter with `solhint-disable` ([#285](https://github.com/lukso-network/lsp-smart-contracts/issues/285)) ([07c6fa1](https://github.com/lukso-network/lsp-smart-contracts/commit/07c6fa156fced93d7517fb83ccee5176e36765a0))

### [0.6.2](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.6.1...v0.6.2) (2022-07-12)

### ⚠ BREAKING CHANGES

- rename `LSP7CompatibilityForERC20` > `LSP7CompatibleERC20` (#208)
- rename `LSP8CompatibilityForERC721` > `LSP7CompatibleERC721` (#218)
- lock LSP0 and LSP3 base contracts on deployment (#204)
- lock LSP6 base contract on deployment (#203)
- lock LSP7 base contracts on deployment (`LSP7DigitalAssetInit`, `LSP7MintableInit` and `LSP7CompatibleERC20Init`) + improve heading comments (#206)
- lock LSP8 base contracts on deployment (`LSP8IdentifiableDigitalAssetInit`, `LSP8MintableInit`, `LSP8CompatibleERC721Init`)
- lock LSP9 base contracts on deployment + improve variable names (#212)
- add return statement to `LSP7CompatibleERC20` functions `approve`, `transfer` and `transferFrom` for ERC20 backward compatibility
- changed `ClaimOwnership` interface ID (#214)

### Features

- add payable on up `constructor` / `initializer(...)` ([#219](https://github.com/lukso-network/lsp-smart-contracts/issues/219)) ([2f8adbd](https://github.com/lukso-network/lsp-smart-contracts/commit/2f8adbd942a460eeab588a901937fd187de79789))
- rename `LSP7CompatibilityForERC20` to `LSP7CompatibleERC20` + add mintable preset contracts ([#208](https://github.com/lukso-network/lsp-smart-contracts/issues/208)) ([fc7b0df](https://github.com/lukso-network/lsp-smart-contracts/commit/fc7b0df338b7410612255e6d2b24c9dee6eb2c02))
- rename `LSP8CompatibilityForERC721` to `LSP8CompatibleERC721` + add mintable preset contracts ([#218](https://github.com/lukso-network/lsp-smart-contracts/issues/218)) ([53e33cc](https://github.com/lukso-network/lsp-smart-contracts/commit/53e33cc5359244cbc6f9f1db4ffc7c5b1348ad67))

### Bug Fixes

- add return statement to LSP7Compat functions for ERC20 backward compatibility ([ae2a572](https://github.com/lukso-network/lsp-smart-contracts/commit/ae2a572a28d06a350ec17391eebec05914bb2d3f))
- assets inheritance + lock `LSP8MintableInit` base contract on deployment ([#217](https://github.com/lukso-network/lsp-smart-contracts/pull/217)) ([275cc3a](https://github.com/lukso-network/lsp-smart-contracts/commit/275cc3adb721b83c1a6361cc9c4bf192125d0eb3))
- edit old `Executed` event signatures in `constants.js` ([#209](https://github.com/lukso-network/lsp-smart-contracts/pull/209)) ([a21a06d](https://github.com/lukso-network/lsp-smart-contracts/commit/a21a06d1d9a0e9c01adf8174da205baa7b7dc4ae))
- enable to clear array for allowed data key permissions ([#224](https://github.com/lukso-network/lsp-smart-contracts/pull/224)) ([a039e86](https://github.com/lukso-network/lsp-smart-contracts/commit/a039e8674557ae57546f65a10e9235bf3147a2d4))
- lock base `LSP7CompatibleERC20Init` contract on deployment ([6dbb24a](https://github.com/lukso-network/lsp-smart-contracts/commit/6dbb24a61538068ac82682774a927f3e88c9c203))
- lock LSP0 and LSP3 base contracts on deployment ([#204](https://github.com/lukso-network/lsp-smart-contracts/pull/204)) ([bbdd1d4](https://github.com/lukso-network/lsp-smart-contracts/commit/bbdd1d466dd95fbead9b71d2cf8160df04ed77fc))
- lock LSP7 base contracts on deployment + improve heading comments ([#206](https://github.com/lukso-network/lsp-smart-contracts/pull/206)) ([b029430](https://github.com/lukso-network/lsp-smart-contracts/commit/b0294300d88b84a1bce66977adc58cb8aba85d77))
- lock LSP9 base contracts on deployment + improve variable names ([#212](https://github.com/lukso-network/lsp-smart-contracts/pull/212)) ([96cb9b7](https://github.com/lukso-network/lsp-smart-contracts/commit/96cb9b7de7281b7d7bb5514ddb1936c01aef592e))
- underflow error for AllowedERC725YKey ([#226](https://github.com/lukso-network/lsp-smart-contracts/pull/226)) ([c549873](https://github.com/lukso-network/lsp-smart-contracts/commit/c549873ca9c048496d141dd82afcb0d1eb39a4ee))
- updated final file path of the ABI file ([#221](https://github.com/lukso-network/lsp-smart-contracts/pull/221)) ([990a116](https://github.com/lukso-network/lsp-smart-contracts/commit/990a1166b4cb517466c6669d96868489bfd0e8ab))
- use safer code for LSP6 - Key Manager contracts and improve styles ([#203](https://github.com/lukso-network/lsp-smart-contracts/pull/203)) ([4e0a59b](https://github.com/lukso-network/lsp-smart-contracts/commit/4e0a59be704e9c1310e6634b10910f531bf7c874))

- `ClaimOwnership` interface ID ([#214](https://github.com/lukso-network/lsp-smart-contracts/pull/214)) ([d9ea4c9](https://github.com/lukso-network/lsp-smart-contracts/commit/d9ea4c967e44f69aad8df5aef553516e38509bdd))

## [0.6.1](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.6.0...v0.6.1) (2022-06-10)

### BREAKING CHANGES

- the LSP2 array data keys defined in `constants.js` are now splitted in two: `.length` and `.index` ([#192](https://github.com/lukso-network/lsp-smart-contracts/pull/192))

### Features

- update `receive()` function to `fallback() payable`, to allow sending random bytes payload to the fallback function. ([#194](https://github.com/lukso-network/lsp-smart-contracts/pull/194))

- update universalReceiver to latest spec ([#193](https://github.com/lukso-network/lsp-smart-contracts/issues/193)) ([5b2bc60](https://github.com/lukso-network/lsp-smart-contracts/commit/5b2bc601acbf467b132fc38093fdad9a54fdef1c))

- add error signatures in `constants.js`([#191](https://github.com/lukso-network/lsp-smart-contracts/pull/191))
- add LSP1 Type IDs in `constants.js` ([#196](https://github.com/lukso-network/lsp-smart-contracts/pull/196))

## [0.6.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.5.0...v0.6.0) (2022-06-03)

### ⚠ BREAKING CHANGES

- disable delegatecall
- remove DELEGATECALL from ALL_PERMISSIONS
- change name of interface IDs to match with docs
- edit LSP0 + LSP9 interface IDs in constant.ts
- add owner and transferOwnership in LSP0 / LSP9 interface ID
- edit LSP9 interface ID
- edit LSP0 interface ID
- add ClaimOwnership in LSP9 Vault (#164)
- prevent editing token name and symbols on LSP4
- change LSP0 interface ID by adding ClaimOwnership interface ID
- set owner permission in fixture to setup KeyManager
- change LSP6 interface ID
- rename function account() -> target() in LSP1
- rename function account() -> target() in LSP6
- **lsp6:** add `account()` function as part of the LSP6 interface (#131)

### Features

- add ClaimOwnership in LSP9 Vault ([#164](https://github.com/lukso-network/lsp-smart-contracts/issues/164)) ([edb9e1d](https://github.com/lukso-network/lsp-smart-contracts/commit/edb9e1dbf5829925c25e35cb2e35ad471e677f8b))
- add claimOwnership(...) path in KeyManager ([dde4221](https://github.com/lukso-network/lsp-smart-contracts/commit/dde4221cb6cd88af55d23a942cc2a32936919d01))
- add constant Solidity file for LSP3 ([ea20351](https://github.com/lukso-network/lsp-smart-contracts/commit/ea203519375beabf5d6993829939c769cf2d7be8))
- add interface + abstract contract OwnableClaim ([4416e81](https://github.com/lukso-network/lsp-smart-contracts/commit/4416e818e0a95db2fb883051ce2365035fcccd2c))
- add interface ID check for ClaimOwnership ([dd2b219](https://github.com/lukso-network/lsp-smart-contracts/commit/dd2b219a547a9ba2deb4af3b60b55cc5d6e5fbdf))
- add LSP5 and LSP10 Constants files ([dd3d1a8](https://github.com/lukso-network/lsp-smart-contracts/commit/dd3d1a8bb8b9c867c121aa3b1301adeb71029fd0))
- add LSP5Utils lib ([e8e5c2a](https://github.com/lukso-network/lsp-smart-contracts/commit/e8e5c2a0a7af567427100bd178fe6268c28b5ce6))
- add SUPER permissions in constants.ts ([d363124](https://github.com/lukso-network/lsp-smart-contracts/commit/d363124b3fe02e645b5900f5277fac8196cbab21))
- add SUPER permissions in permissions constants ([ae3a2e5](https://github.com/lukso-network/lsp-smart-contracts/commit/ae3a2e523e07af5ee5f030160b27bd46f6e46988))
- add support for SUPER OPERATION (CALL, STATICCALL, ...) to skip allowed checks ([90b94a2](https://github.com/lukso-network/lsp-smart-contracts/commit/90b94a27edcdef9d821cbbbf83a3cae3ef1e8949))
- extend jest matcher `toBeRevertedWith` as it does not work as expected with custom errors ([3a925ee](https://github.com/lukso-network/lsp-smart-contracts/commit/3a925ee7f17cb0a4e5ff75b6666684aa5bd43dd0))
- introduce `ErroHandlerLib` in execution in LSP6 ([724d411](https://github.com/lukso-network/lsp-smart-contracts/commit/724d41112d9f092936904b03deaaca52fe6bc502))
- **lsp6:** add `account()` function as part of the LSP6 interface ([#131](https://github.com/lukso-network/lsp-smart-contracts/issues/131)) ([db7b297](https://github.com/lukso-network/lsp-smart-contracts/commit/db7b297b8af86cd2dc04b3d870f204d0e6545b4e))
- LSP7 and LSP8 use solidity custom errors ([b353655](https://github.com/lukso-network/lsp-smart-contracts/commit/b3536556eed552e1acc172d98a297b923c939eb0))
- UniversalFactory ([#139](https://github.com/lukso-network/lsp-smart-contracts/issues/139)) ([3164d9a](https://github.com/lukso-network/lsp-smart-contracts/commit/3164d9a704da3c5d99c47a7b46a19741f8e696d8))
- use custom errors for LSP7/8 CappedSupply contracts ([07ac935](https://github.com/lukso-network/lsp-smart-contracts/commit/07ac935bf336562358930f07d9f86b710cd59d73))
- use custom version of `ERC165Checker` ([#132](https://github.com/lukso-network/lsp-smart-contracts/issues/132)) ([0e7bbec](https://github.com/lukso-network/lsp-smart-contracts/commit/0e7bbec34a75de9a9ba31db6146e162a800d3406))
- update interfaceID for LSP6 ([499ee6a](https://github.com/lukso-network/lsp-smart-contracts/commit/499ee6a73eef210e022c81a0590df8666502c815))

### Bug Fixes

- :bug: incorrect revert error for NotAuthorised(\_from, "STATICCALL") ([a2e52ed](https://github.com/lukso-network/lsp-smart-contracts/commit/a2e52ed328c6b6799ded9a1396cde11765e7d784))
- `isValidSignature` function check ([#120](https://github.com/lukso-network/lsp-smart-contracts/issues/120)) ([2f2762d](https://github.com/lukso-network/lsp-smart-contracts/commit/2f2762da71095009949b1a045730d2ed3c8416b7))
- add chainId to the signed message in LSP6 ([2fdfb59](https://github.com/lukso-network/lsp-smart-contracts/commit/2fdfb59b9a379bc83191a4bec6a0f315b5f5a5e0))
- add permissions check when setting keys for `AddressPermissions[]` and `AddressPermissions[index]` ([#125](https://github.com/lukso-network/lsp-smart-contracts/issues/125)) ([18a143c](https://github.com/lukso-network/lsp-smart-contracts/commit/18a143c95086598a887b3df4cc907c18241b39c1))
- add sender code length check in UniversalReceiverDelegate ([12180a4](https://github.com/lukso-network/lsp-smart-contracts/commit/12180a4612c8e5e1e9303a6efad616f03b61bec8))
- admin caller with `ALL_PERMISSIONS` can call any functions part of the Universal Profile's ABI ([#128](https://github.com/lukso-network/lsp-smart-contracts/issues/128)) ([ec384d3](https://github.com/lukso-network/lsp-smart-contracts/commit/ec384d3e7869334ec63e4a0c805282b90bd9794a))
- apply checks-effects-interactions pattern ([77e2c43](https://github.com/lukso-network/lsp-smart-contracts/commit/77e2c43790cdac24bddf1540e09d83446017391f))
- apply checks-effects-interactions pattern ([#121](https://github.com/lukso-network/lsp-smart-contracts/issues/121)) ([6e0e5b2](https://github.com/lukso-network/lsp-smart-contracts/commit/6e0e5b2a6002cd6cb7af98de8de221d6837181dd))
- boolean check ([a7be1bd](https://github.com/lukso-network/lsp-smart-contracts/commit/a7be1bd5afd919f5de66a06b3c62784fbeef443f))
- comments ([69f0e8a](https://github.com/lukso-network/lsp-smart-contracts/commit/69f0e8af001f7625545b8c8aa1782b47ef461663))
- disable solhint with `no-unused-vars` in LSP1-URD ([ae6dcff](https://github.com/lukso-network/lsp-smart-contracts/commit/ae6dcffdd6404753ed2d81a400b19d9244479874))
- ERC1271 in export ([db80c69](https://github.com/lukso-network/lsp-smart-contracts/commit/db80c694ae2a3a06ff86b1d68728199ebac9288a))
- failing test ([1edef46](https://github.com/lukso-network/lsp-smart-contracts/commit/1edef460f5139ac343c6d61d2c3f43fb8137482d))
- fix OwnableUnset folder location in import statements ([c6702a0](https://github.com/lukso-network/lsp-smart-contracts/commit/c6702a09279e001d32e1cf63f661511cde1e85bc))
- flip `index` and `interfaceID` in LSP5 & LSP10 ([a926fa7](https://github.com/lukso-network/lsp-smart-contracts/commit/a926fa74590e1256aaaff59667eaad3f5d6ce645))
- inherit LSP0 contracts from most base to most derive ([bac9f5d](https://github.com/lukso-network/lsp-smart-contracts/commit/bac9f5dbe261de81242a6783ab0119e07557951f))
- inherit LSP1 contracts from most base to most derive ([1911886](https://github.com/lukso-network/lsp-smart-contracts/commit/1911886d03dbc42683369559aac064319b0ead3e))
- inherit LSP6 contracts from most base to most derive ([22762e0](https://github.com/lukso-network/lsp-smart-contracts/commit/22762e0874361f4c7bb863b3b4d2209716e2ae30))
- inherit LSP7 contracts from most base to most derive ([de29a58](https://github.com/lukso-network/lsp-smart-contracts/commit/de29a58fa0a7ed4db83151008a7f82b21777cc27))
- inherit LSP8 contracts from most base to most derive ([5f05302](https://github.com/lukso-network/lsp-smart-contracts/commit/5f053025f2c1bfb5ce858c0d4bf0d289a5542259))
- inherit LSP9 contracts from most base to most derive ([b34a049](https://github.com/lukso-network/lsp-smart-contracts/commit/b34a049edf43cfe9f90159082a725c346224a04b))
- **lsp6:** fix bugs for `AllowedERC725YKeys` when input is multiple keys that include allowed + not allowed keys ([#134](https://github.com/lukso-network/lsp-smart-contracts/issues/134)) ([8f95a79](https://github.com/lukso-network/lsp-smart-contracts/commit/8f95a7959df4047c2421b4fdb34a523fa2f62ae5))
- move AddressRegistry contract under Legacy/ folder ([3cf8102](https://github.com/lukso-network/lsp-smart-contracts/commit/3cf8102fe5137ba2111c4e2e8ed1fd7eada4c432))
- override `supportsInterface` in LSP0 ([6415e5f](https://github.com/lukso-network/lsp-smart-contracts/commit/6415e5f25bf2b64d2a30ae08c27ff514211f6f0f))
- override `supportsInterface` in LSP7 ([3840e6b](https://github.com/lukso-network/lsp-smart-contracts/commit/3840e6ba0983b88530ebef6872a441fb7d07e266))
- override `supportsInterface` in LSP8 ([57385b5](https://github.com/lukso-network/lsp-smart-contracts/commit/57385b5eb50cb7c53e2e3acee537ce56748fae4e))
- override `supportsInterface` in LSP9 ([707ba59](https://github.com/lukso-network/lsp-smart-contracts/commit/707ba5983138d90ddf6c9f17489c21fcf7cf5574))
- prevent editing token name and symbols on LSP4 ([d69b01f](https://github.com/lukso-network/lsp-smart-contracts/commit/d69b01f3aa83014ce90ab6b2c402fa8101e6b252))
- re-order `executeRelayCall(..)` params and remove `_signedFor` ([7ce3f96](https://github.com/lukso-network/lsp-smart-contracts/commit/7ce3f9632aa0efc45f310cd27ba74a0f5da8120c))
- reference to Allowed Standards Map key ([e8993e6](https://github.com/lukso-network/lsp-smart-contracts/commit/e8993e6b7bbcbe26d9284f2e4c47305843ebc68b))
- replace `initOwner` with `_setOwner` function ([5183765](https://github.com/lukso-network/lsp-smart-contracts/commit/5183765f53b1c7432ae7f6dc7bec4cbb276dd86d))
- resolve merge conflicts in LSP6Core ([2519ee1](https://github.com/lukso-network/lsp-smart-contracts/commit/2519ee1d0ce70911d98afd21c43a475a32cb6218))
- send the `msg.value` instead of 0 in `executeRelayCall(.)` ([d64855c](https://github.com/lukso-network/lsp-smart-contracts/commit/d64855cb0f22ea199390fb9ced17017dcb8e535c))
- **tests:** delegatecall tests to a function that does not use onlyOwner ([5a33d4b](https://github.com/lukso-network/lsp-smart-contracts/commit/5a33d4bf0a89a86dd0386c80cedeea3c063dcb8d))

- use internal `_getData` instead `getDataSingle` ([c7f7bc2](https://github.com/lukso-network/lsp-smart-contracts/commit/c7f7bc27081ced33f2af7228d6345d8131bb00ef))
- validate values for abi-encoded arrays in KeyManager ([#152](https://github.com/lukso-network/lsp-smart-contracts/issues/152)) ([200ff28](https://github.com/lukso-network/lsp-smart-contracts/commit/200ff2857c8e48a45c7761cf8a490fe094eaf8da))

### build

- change name of interface IDs to match with docs ([19e9e54](https://github.com/lukso-network/lsp-smart-contracts/commit/19e9e54a22f0e7f40961b1a0616cac73fd7a56d2))

- add owner and transferOwnership in LSP0 / LSP9 interface ID ([d4079a8](https://github.com/lukso-network/lsp-smart-contracts/commit/d4079a87757066585187c0bda949a00c6accc4ee))
- change LSP0 interface ID by adding ClaimOwnership interface ID ([37173ba](https://github.com/lukso-network/lsp-smart-contracts/commit/37173ba81b27647da9bd7b5000fb10e7932b89b1))
- change LSP6 interface ID ([8362ecd](https://github.com/lukso-network/lsp-smart-contracts/commit/8362ecd8218c0fe76d5b5f53c528b62be43da7d7))
- disable delegatecall ([7a66e4f](https://github.com/lukso-network/lsp-smart-contracts/commit/7a66e4f0f1d30163f8f6f3bacb8dabbdd2be0ac0))
- edit LSP0 + LSP9 interface IDs in constant.ts ([bb8133f](https://github.com/lukso-network/lsp-smart-contracts/commit/bb8133f0684799fa3fcb8feb79fbdb0821039990))
- edit LSP0 interface ID ([03ae8f4](https://github.com/lukso-network/lsp-smart-contracts/commit/03ae8f447c0c0bf506dafd445c35ef57995dc9f5))
- edit LSP2 keys according to new spec ([#177](https://github.com/lukso-network/lsp-smart-contracts/issues/177)) ([494c354](https://github.com/lukso-network/lsp-smart-contracts/commit/494c354c9a4813b8ed8e3b09934f669f4a47bd56))
- edit LSP9 interface ID ([44dbfda](https://github.com/lukso-network/lsp-smart-contracts/commit/44dbfdad4faff6ed91556295c9806a291215450a))
- remove DELEGATECALL from ALL_PERMISSIONS ([a3bf44c](https://github.com/lukso-network/lsp-smart-contracts/commit/a3bf44c19fd7ca907ba07bdc3f17938c8de7bbda))
- rename function account() -> target() in LSP1 ([035a0e5](https://github.com/lukso-network/lsp-smart-contracts/commit/035a0e52e63f2412285b43666e5b1d02e49a3d2b))
- rename function account() -> target() in LSP6 ([1e4949c](https://github.com/lukso-network/lsp-smart-contracts/commit/1e4949cb6e281d5411b70762f0e7b347a9620050))
- set owner permission in fixture to setup KeyManager ([6999787](https://github.com/lukso-network/lsp-smart-contracts/commit/6999787df38cde2e3dff4b1e307de06df28f5d5a))

## [0.5.0](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.4.3...v0.5.0) (2022-02-23)

### Features

- add check for multiple `ERC725Y` keys ([5ee41c7](https://github.com/lukso-network/lsp-smart-contracts/commit/5ee41c7bd22ea30c013ad7a18ff974ddaa4b5657))
- add check for partial keys + test for Mapping keys ([57923ca](https://github.com/lukso-network/lsp-smart-contracts/commit/57923ca13e67ee5256a5337e2c4610964452c440))
- add custom error log for AllowedERC725YKey ([dcefa95](https://github.com/lukso-network/lsp-smart-contracts/commit/dcefa95364012b905c5377ac94ed3b3eb18bbbc2))
- allow whitelisting any ERC725Y key if nothing set ([41dd20f](https://github.com/lukso-network/lsp-smart-contracts/commit/41dd20fbd6228b3c2b23f9b2ddb8748d8f85567f))
- create LSP7CompatabilityForERC20InitAbstract ([516d195](https://github.com/lukso-network/lsp-smart-contracts/commit/516d1955a0d1aa68e1d3dde7818ffbf7d16432e5))
- create LSP8CompatabilityForERC721InitAbstract ([1ded846](https://github.com/lukso-network/lsp-smart-contracts/commit/1ded8466049442c164c3ae0fc09411a6f046dd33))
- first draft implementation of `AllowedERC725YKeys`, with only one key check ([ac567c3](https://github.com/lukso-network/lsp-smart-contracts/commit/ac567c3b52d3774780968ca9f7b54b958c4ca338))
- LSP7CompatibilityForERC20 proxy and constructor version ([131eed0](https://github.com/lukso-network/lsp-smart-contracts/commit/131eed0b5e832d7d159de09eccfaee75bf9b81a0))
- LSP8CompatibilityForERC721 proxy and constructor version ([ffccc4b](https://github.com/lukso-network/lsp-smart-contracts/commit/ffccc4b6ad6b4d986808183436973174786c6efc))

### Bug Fixes

- ILSP8CompatabilityForERC721 isApprovedForAll params match IERC721 ([fed55a9](https://github.com/lukso-network/lsp-smart-contracts/commit/fed55a9b25afda10ccfbfc559f3d359ad372572e))
- LSP8 InitAbstract contract inheritance order ([e9e61c1](https://github.com/lukso-network/lsp-smart-contracts/commit/e9e61c1ce5047daef6dae906ecc43d8b0d397fb9))
- security check in UniversalReceiverDelegateUP contract ([#109](https://github.com/lukso-network/lsp-smart-contracts/issues/109)) ([faac8df](https://github.com/lukso-network/lsp-smart-contracts/commit/faac8df65e12b4257e77358ed65290b02cbfc08a))

### [0.4.3](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.4.2...v0.4.3) (2022-01-10)

### [0.4.2](https://github.com/lukso-network/lsp-smart-contracts/compare/v0.4.1...v0.4.2) (2022-01-10)

### Features

- add a file `constants.ts` in npm package ([#87](https://github.com/lukso-network/lsp-smart-contracts/issues/87)) ([61abc09](https://github.com/lukso-network/lsp-smart-contracts/commit/61abc09f824e502778756d3c015d7f982ebe9258))
- LSP8CompatibilityForERC721 sets ERC165 interfaces for ERC721 & … ([#89](https://github.com/lukso-network/lsp-smart-contracts/issues/89)) ([15265a3](https://github.com/lukso-network/lsp-smart-contracts/commit/15265a35e186f80031b53bb80514fa4f95b3f843))

### Bug Fixes

- :wastebasket: remove deprecated key `SupportedStandards:LSP4DigitalCertificate` ([59844f6](https://github.com/lukso-network/lsp-smart-contracts/commit/59844f602dd30f6e2ef7f0dae75b57f9cf2ed704))
- android builds ([9223e30](https://github.com/lukso-network/lsp-smart-contracts/commit/9223e307f62e251b7b3c7eee7678552350f91d5e))
- change make-ios script to ts file ([40ff091](https://github.com/lukso-network/lsp-smart-contracts/commit/40ff091444ced6488f11b55075ee9e029b9dbdae))
- remove success check before emitting event ([cad39ae](https://github.com/lukso-network/lsp-smart-contracts/commit/cad39ae189f5757a50ff735d4067557b10ae7be8))

### [0.4.1](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.4.0...v0.4.1) (2021-11-26)

## [0.4.0](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.3.0...v0.4.0) (2021-11-26)

### ⚠ BREAKING CHANGES

- **release:** ILSP6 interface return type change.

- test!(KM): return bytes or revert on `execute` / `executeRelayCall`

Tests by interacting with `TargetContract`

- test!(KM): Remove gasLimit specified in tests.

- feat!(KM): Extend permission range to 256 (32 bytes)

- test!(KM): Use 32 bytes padding for 32 bytes permissions range

- test!: :heavy_plus_sign: set AddressPermissions[] in tests

Addresses with permissions set MUST be added to an array inside ERC725Y key-value (see LSP6 specs)

- Fixed KeyManager permission key name

### Features

- :pushpin: upgrade `@erc725/smart-contracts` to version 2.1.6 ([#69](https://github.com/lukso-network/universalprofile-smart-contracts/issues/69)) ([97e19e8](https://github.com/lukso-network/universalprofile-smart-contracts/commit/97e19e86b166e85e4d8f3d2c091b9aaf3c0aac32))
- `ADDPERMISSIONS` + refactor LSP6Keymanager internal functions names & logic ([#65](https://github.com/lukso-network/universalprofile-smart-contracts/issues/65)) ([adc225c](https://github.com/lukso-network/universalprofile-smart-contracts/commit/adc225c75cd0c7a5f343f2238669b69d7b11a9b8))
- add Mintable version of LSP7 / LSP8 ([#61](https://github.com/lukso-network/universalprofile-smart-contracts/issues/61)) ([b8a0bdf](https://github.com/lukso-network/universalprofile-smart-contracts/commit/b8a0bdf50074f79e6e1e020bd489038cddc872e4))
- use custom `error` for reverts in KeyManager ([#68](https://github.com/lukso-network/universalprofile-smart-contracts/issues/68)) ([1e8113e](https://github.com/lukso-network/universalprofile-smart-contracts/commit/1e8113e4cbd4578f7c18fa709406f07ce496423f))

- **release:** 0.2.2 - the start ([#46](https://github.com/lukso-network/universalprofile-smart-contracts/issues/46)) ([928902f](https://github.com/lukso-network/universalprofile-smart-contracts/commit/928902f97333465262fdb18e2d84b21a121f81e5)), closes [#7](https://github.com/lukso-network/universalprofile-smart-contracts/issues/7) [#21](https://github.com/lukso-network/universalprofile-smart-contracts/issues/21) [#26](https://github.com/lukso-network/universalprofile-smart-contracts/issues/26) [#25](https://github.com/lukso-network/universalprofile-smart-contracts/issues/25) [#30](https://github.com/lukso-network/universalprofile-smart-contracts/issues/30) [#31](https://github.com/lukso-network/universalprofile-smart-contracts/issues/31) [#32](https://github.com/lukso-network/universalprofile-smart-contracts/issues/32) [#33](https://github.com/lukso-network/universalprofile-smart-contracts/issues/33) [#35](https://github.com/lukso-network/universalprofile-smart-contracts/issues/35) [#34](https://github.com/lukso-network/universalprofile-smart-contracts/issues/34) [#36](https://github.com/lukso-network/universalprofile-smart-contracts/issues/36) [#38](https://github.com/lukso-network/universalprofile-smart-contracts/issues/38) [#37](https://github.com/lukso-network/universalprofile-smart-contracts/issues/37) [#40](https://github.com/lukso-network/universalprofile-smart-contracts/issues/40) [#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41) [#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43) [#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44) [#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)

## [0.3.0](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.2.2...v0.3.0) (2021-11-15)

### ⚠ BREAKING CHANGES

- ILSP6 interface return type change.

- test!(KM): return bytes or revert on `execute` / `executeRelayCall`

Tests by interacting with `TargetContract`

- test!(KM): Remove gasLimit specified in tests.

- feat!(KM): Extend permission range to 256 (32 bytes)

- test!(KM): Use 32 bytes padding for 32 bytes permissions range

- test!: :heavy_plus_sign: set AddressPermissions[] in tests

Addresses with permissions set MUST be added to an array inside ERC725Y key-value (see LSP6 specs)

- Fixed KeyManager permission key name
- the contracts + artifacts names have changed for all three packages

- feat!: :sparkles: make ERC20 / 721 compatible versions of LSP7/8 deployable

- fix: :green_heart: fix solhint CI error for empty block

- build: :heavy_minus_sign: remove submodule folder

ERC725 contracts are now imported as a npm package `@erc725/smart-contracts/`

Co-authored-by: YamenMerhi <yamennmerhi@gmail.com>

- **npm:** :heavy_plus_sign: add npm dependency: `@erc725/smart-contracts`

### Bug Fixes

- added contracts as dependencies ([3f12e97](https://github.com/lukso-network/universalprofile-smart-contracts/commit/3f12e97a4db2033f5f3ea11bbbeba71fe4768f46))
- gradle file invalid syntax ([#47](https://github.com/lukso-network/universalprofile-smart-contracts/issues/47)) ([633fa07](https://github.com/lukso-network/universalprofile-smart-contracts/commit/633fa074802722b6d5a26e876ba3654f73f1e226))

### build

- **npm:** :heavy_plus_sign: add npm dependency: `@erc725/smart-contracts` ([f881f0d](https://github.com/lukso-network/universalprofile-smart-contracts/commit/f881f0d3501b7edab435befe0fd43cbc940fe031))

- Fix conflicts main < develop for v0.3.0 (#56) ([975f772](https://github.com/lukso-network/universalprofile-smart-contracts/commit/975f772ef6a3e827b62cf3db49d6934fb51e578a)), closes [#56](https://github.com/lukso-network/universalprofile-smart-contracts/issues/56) [#46](https://github.com/lukso-network/universalprofile-smart-contracts/issues/46) [#7](https://github.com/lukso-network/universalprofile-smart-contracts/issues/7) [#21](https://github.com/lukso-network/universalprofile-smart-contracts/issues/21) [#26](https://github.com/lukso-network/universalprofile-smart-contracts/issues/26) [#25](https://github.com/lukso-network/universalprofile-smart-contracts/issues/25) [#30](https://github.com/lukso-network/universalprofile-smart-contracts/issues/30) [#31](https://github.com/lukso-network/universalprofile-smart-contracts/issues/31) [#32](https://github.com/lukso-network/universalprofile-smart-contracts/issues/32) [#33](https://github.com/lukso-network/universalprofile-smart-contracts/issues/33) [#35](https://github.com/lukso-network/universalprofile-smart-contracts/issues/35) [#34](https://github.com/lukso-network/universalprofile-smart-contracts/issues/34) [#36](https://github.com/lukso-network/universalprofile-smart-contracts/issues/36) [#38](https://github.com/lukso-network/universalprofile-smart-contracts/issues/38) [#37](https://github.com/lukso-network/universalprofile-smart-contracts/issues/37) [#40](https://github.com/lukso-network/universalprofile-smart-contracts/issues/40) [#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41) [#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43) [#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44) [#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)
- Remove submodule + Prepare v0.3.0 (New contracts + artifact names) (#54) ([d373d15](https://github.com/lukso-network/universalprofile-smart-contracts/commit/d373d1514bc6b24bf44acae40cf16e1f0938626b)), closes [#54](https://github.com/lukso-network/universalprofile-smart-contracts/issues/54)

### [0.2.2](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.2.1...v0.2.2) (2021-11-01)

### Bug Fixes

- android release ([#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)) ([5234ef2](https://github.com/lukso-network/universalprofile-smart-contracts/commit/5234ef2485da4a0d271efc14e108e92c857d5500))
- release CI fix ([#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43)) ([065a5b0](https://github.com/lukso-network/universalprofile-smart-contracts/commit/065a5b08fe68db7142f23874af4ab681842ea6fd))
- unresolved conflict in readme ([#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44)) ([ea057f9](https://github.com/lukso-network/universalprofile-smart-contracts/commit/ea057f999ee4fdd58a3404d7152be920b609c3d2))

### [0.2.1](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.2.0...v0.2.1) (2021-10-31)

### Bug Fixes

- github and npm release ci ([#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41)) ([4276fb8](https://github.com/lukso-network/universalprofile-smart-contracts/commit/4276fb84f7d754d75513716b7a792454ea16d2ff))

## [0.2.0](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.1.3...v0.2.0) (2021-10-31)

This release is the first release of the final UniversalProfile setup. It should be seen as a draft and not production ready release! Please use with caution!

### ⚠ BREAKING CHANGES

- ILSP6 interface return type change.

- test!(KM): return bytes or revert on `execute` / `executeRelayCall`

Tests by interacting with `TargetContract`

- test!(KM): Remove gasLimit specified in tests.

- feat!(KM): Extend permission range to 256 (32 bytes)

- test!(KM): Use 32 bytes padding for 32 bytes permissions range

- test!: :heavy_plus_sign: set AddressPermissions[] in tests

Addresses with permissions set MUST be added to an array inside ERC725Y key-value (see LSP6 specs)

- KeyManager returns bytes + permission range extended to bytes32 (#32) ([7b6dcf0](https://github.com/lukso-network/universalprofile-smart-contracts/commit/7b6dcf022fffe51b7f2f652e5ded719dbfaea8e2)), closes [#32](https://github.com/lukso-network/universalprofile-smart-contracts/issues/32)

### Bug Fixes

- android release ([#45](https://github.com/lukso-network/universalprofile-smart-contracts/issues/45)) ([5234ef2](https://github.com/lukso-network/universalprofile-smart-contracts/commit/5234ef2485da4a0d271efc14e108e92c857d5500))
- release CI fix ([#43](https://github.com/lukso-network/universalprofile-smart-contracts/issues/43)) ([065a5b0](https://github.com/lukso-network/universalprofile-smart-contracts/commit/065a5b08fe68db7142f23874af4ab681842ea6fd))
- unresolved conflict in readme ([#44](https://github.com/lukso-network/universalprofile-smart-contracts/issues/44)) ([ea057f9](https://github.com/lukso-network/universalprofile-smart-contracts/commit/ea057f999ee4fdd58a3404d7152be920b609c3d2))
- github and npm release ci ([#41](https://github.com/lukso-network/universalprofile-smart-contracts/issues/41)) ([4276fb8](https://github.com/lukso-network/universalprofile-smart-contracts/commit/4276fb84f7d754d75513716b7a792454ea16d2ff))

### [0.1.3](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.1.2...v0.1.3) (2021-08-31)

### Bug Fixes

- **publish:** include json artifacts ([f90a194](https://github.com/lukso-network/universalprofile-smart-contracts/commit/f90a194b94d2d26c3b173d01f715abfe31930e7f))

### [0.1.2](https://github.com/lukso-network/universalprofile-smart-contracts/compare/v0.1.1...v0.1.2) (2021-08-31)

### Features

- **framework:** migrate from truffle to hardhat ([pr5](https://github.com/lukso-network/universalprofile-smart-contracts/pull/5))
- **typechain:** provide web3 and ethers types ([cad4541](https://github.com/lukso-network/universalprofile-smart-contracts/commit/cad4541f4d0ca47742fac4800c2a43c8a158615d))

### 0.1.1 (2021-08-17)

/**
 * Set of constants values as defined in each LUKSO Standards Proposals (LSPs).
 * @see https://github.com/lukso-network/LIPs/tree/main/LSPs
 */
export * from './contracts';

// Typescript types from each LSP package
export type { Verification, LSP2ArrayKey } from '@lukso/lsp2-contracts';
export type {
  LSP3ProfileMetadataJSON,
  LSP3ProfileMetadata,
  ImageMetadata,
  LinkMetadata,
  AssetMetadata,
} from '@lukso/lsp3-contracts';
export type {
  LSP4DigitalAssetMetadataJSON,
  LSP4DigitalAssetMetadata,
  AttributeMetadata,
  FileAsset,
  ContractAsset,
} from '@lukso/lsp4-contracts';
export type { LSP6PermissionName } from '@lukso/lsp6-contracts';

// Generic constants and types from each LSP package
export { ERC1271_VALUES, OPERATION_TYPES } from '@lukso/lsp0-contracts';
export { CALLTYPE, ALL_PERMISSIONS, PERMISSIONS } from '@lukso/lsp6-contracts';
export { LSP4_TOKEN_TYPES } from '@lukso/lsp4-contracts';
export { LSP8_TOKEN_ID_FORMAT } from '@lukso/lsp8-contracts';
export { LSP20_SUCCESS_VALUES } from '@lukso/lsp20-contracts';
export { LSP25_VERSION } from '@lukso/lsp25-contracts';

// Old interface Ids of previous releases of LSP7/8 Tokens
// for backward compatibilities for dApps and interfaces
export { INTERFACE_ID_LSP7_PREVIOUS } from '@lukso/lsp7-contracts';
export { INTERFACE_ID_LSP8_PREVIOUS } from '@lukso/lsp8-contracts';

// ERC165 interface IDs of each LSP
import { INTERFACE_ID_LSP0 } from '@lukso/lsp0-contracts';
import { INTERFACE_ID_LSP1 } from '@lukso/lsp1-contracts';
import { INTERFACE_ID_LSP1DELEGATE } from '@lukso/lsp1delegate-contracts';
import { INTERFACE_ID_LSP6 } from '@lukso/lsp6-contracts';
import { INTERFACE_ID_LSP7 } from '@lukso/lsp7-contracts';
import { INTERFACE_ID_LSP8 } from '@lukso/lsp8-contracts';
import { INTERFACE_ID_LSP9 } from '@lukso/lsp9-contracts';
import { INTERFACE_ID_LSP11 } from '@lukso/lsp11-contracts';
import { INTERFACE_ID_LSP14 } from '@lukso/lsp14-contracts';
import {
  INTERFACE_ID_LSP17Extendable,
  INTERFACE_ID_LSP17Extension,
} from '@lukso/lsp17contractextension-contracts';
import {
  INTERFACE_ID_LSP20CallVerification,
  INTERFACE_ID_LSP20CallVerifier,
} from '@lukso/lsp20-contracts';
import { INTERFACE_ID_LSP25 } from '@lukso/lsp25-contracts';
import { INTERFACE_ID_LSP26 } from '@lukso/lsp26-contracts';

// LSP1 Type IDs of each LSP
import { LSP0_TYPE_IDS } from '@lukso/lsp0-contracts';
import { LSP7_TYPE_IDS } from '@lukso/lsp7-contracts';
import { LSP8_TYPE_IDS } from '@lukso/lsp8-contracts';
import { LSP9_TYPE_IDS } from '@lukso/lsp9-contracts';
import { LSP14_TYPE_IDS } from '@lukso/lsp14-contracts';

// ERC725Y Data Keys of each LSP
import { LSP1DataKeys } from '@lukso/lsp1-contracts';
import { LSP3DataKeys } from '@lukso/lsp3-contracts';
import { LSP4DataKeys } from '@lukso/lsp4-contracts';
import { LSP5DataKeys } from '@lukso/lsp5-contracts';
import { LSP6DataKeys } from '@lukso/lsp6-contracts';
import { LSP8DataKeys } from '@lukso/lsp8-contracts';
import { LSP9DataKeys } from '@lukso/lsp9-contracts';
import { LSP10DataKeys } from '@lukso/lsp10-contracts';
import { LSP12DataKeys } from '@lukso/lsp12-contracts';
import { LSP17DataKeys } from '@lukso/lsp17contractextension-contracts';

import { LSP3SupportedStandard } from '@lukso/lsp3-contracts';
import { LSP4SupportedStandard } from '@lukso/lsp4-contracts';
import { LSP9SupportedStandard } from '@lukso/lsp9-contracts';

export const SupportedStandards = {
  LSP3Profile: LSP3SupportedStandard as LSPSupportedStandard,
  LSP4DigitalAsset: LSP4SupportedStandard as LSPSupportedStandard,
  LSP9Vault: LSP9SupportedStandard as LSPSupportedStandard,
} as const;

// ERC165
// ---------

/**
 * @dev ERC165 interface IDs for the LSP interface standards + some backward compatible ERC token standards.
 * These `bytes4` values can be used to detect if a contract implements a specific interface
 * with `supportsInterface(interfaceId)`.
 */
export const INTERFACE_IDS = {
  ERC165: '0x01ffc9a7',
  ERC1271: '0x1626ba7e',
  ERC20: '0x36372b07',
  ERC20Metadata: '0xa219a025',
  ERC223: '0x87d43052',
  ERC721: '0x80ac58cd',
  ERC721Metadata: '0x5b5e139f',
  ERC777: '0xe58e113c',
  ERC1155: '0xd9b67a26',
  ERC725X: '0x7545acac',
  ERC725Y: '0x629aa694',
  LSP0ERC725Account: INTERFACE_ID_LSP0,
  LSP1UniversalReceiver: INTERFACE_ID_LSP1,
  LSP1UniversalReceiverDelegate: INTERFACE_ID_LSP1DELEGATE,
  LSP6KeyManager: INTERFACE_ID_LSP6,
  LSP7DigitalAsset: INTERFACE_ID_LSP7,
  LSP8IdentifiableDigitalAsset: INTERFACE_ID_LSP8,
  LSP9Vault: INTERFACE_ID_LSP9,
  LSP11SocialRecovery: INTERFACE_ID_LSP11,
  LSP14Ownable2Step: INTERFACE_ID_LSP14,
  LSP17Extendable: INTERFACE_ID_LSP17Extendable,
  LSP17Extension: INTERFACE_ID_LSP17Extension,
  LSP20CallVerification: INTERFACE_ID_LSP20CallVerification,
  LSP20CallVerifier: INTERFACE_ID_LSP20CallVerifier,
  LSP25ExecuteRelayCall: INTERFACE_ID_LSP25,
  LSP26FollowerSystem: INTERFACE_ID_LSP26,
} as const;

// ERC725Y
// ----------

export type LSPSupportedStandard = { key: string; value: string };

/**
 * @dev list of ERC725Y Metadata keys from the LSP standards.
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md
 */
export const ERC725YDataKeys = {
  LSP1: { ...LSP1DataKeys },
  LSP3: { ...LSP3DataKeys },
  LSP4: { ...LSP4DataKeys },
  LSP5: { ...LSP5DataKeys },
  LSP6: { ...LSP6DataKeys },
  LSP8: { ...LSP8DataKeys },
  LSP9: { ...LSP9DataKeys },
  LSP10: { ...LSP10DataKeys },
  LSP12: { ...LSP12DataKeys },
  LSP17: { ...LSP17DataKeys },
} as const;

export const LSP1_TYPE_IDS = {
  ...LSP0_TYPE_IDS,
  ...LSP7_TYPE_IDS,
  ...LSP8_TYPE_IDS,
  ...LSP9_TYPE_IDS,
  ...LSP14_TYPE_IDS,
} as const;

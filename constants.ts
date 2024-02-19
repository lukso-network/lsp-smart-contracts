/**
 * Set of constants values as defined in each LUKSO Standards Proposals (LSPs).
 * @see https://github.com/lukso-network/LIPs/tree/main/LSPs
 */
export * from './contracts';

import { INTERFACE_ID_LSP0ERC725Account, LSP0_TYPE_IDS } from '@lukso/lsp0-contracts';
import { INTERFACE_ID_LSP1, LSP1DataKeys } from '@lukso/lsp1-contracts';
import { INTERFACE_ID_LSP1DELEGATE } from '@lukso/lsp1delegate-contracts';
import { LSP3DataKeys } from '@lukso/lsp3-contracts';
import { LSP4DataKeys } from '@lukso/lsp4-contracts';
import { LSP5DataKeys } from '@lukso/lsp5-contracts';
import { INTERFACE_ID_LSP6KEYMANAGER, LSP6DataKeys } from '@lukso/lsp6-contracts';
import { INTERFACE_ID_LSP7, LSP7_TYPE_IDS } from '@lukso/lsp7-contracts';
import { INTERFACE_ID_LSP8, LSP8DataKeys, LSP8_TYPE_IDS } from '@lukso/lsp8-contracts';
import { INTERFACE_ID_LSP9, LSP9DataKeys, LSP9_TYPE_IDS } from '@lukso/lsp9-contracts';
import { LSP10DataKeys } from '@lukso/lsp10-contracts';
import { LSP12DataKeys } from '@lukso/lsp12-contracts';
import { INTERFACE_ID_LSP14, LSP14_TYPE_IDS } from '@lukso/lsp14-contracts';
import {
  INTERFACE_ID_LSP17Extendable,
  INTERFACE_ID_LSP17Extension,
  LSP17DataKeys,
} from '@lukso/lsp17contractextension-contracts';
import {
  INTERFACE_ID_LSP20CallVerification,
  INTERFACE_ID_LSP20CallVerifier,
} from '@lukso/lsp20-contracts';
import { INTERFACE_ID_LSP25 } from '@lukso/lsp25-contracts';

import { LSP3SupportedStandard } from '@lukso/lsp3-contracts';
import { LSP4SupportedStandard } from '@lukso/lsp4-contracts';
import { LSP9SupportedStandard } from '@lukso/lsp9-contracts';

export const SupportedStandards = {
  LSP3Profile: LSP3SupportedStandard as LSPSupportedStandard,
  LSP4DigitalAsset: LSP4SupportedStandard as LSPSupportedStandard,
  LSP9Vault: LSP9SupportedStandard as LSPSupportedStandard,
};

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
  LSP0ERC725Account: INTERFACE_ID_LSP0ERC725Account,
  LSP1UniversalReceiver: INTERFACE_ID_LSP1,
  LSP1UniversalReceiverDelegate: INTERFACE_ID_LSP1DELEGATE,
  LSP6KeyManager: INTERFACE_ID_LSP6KEYMANAGER,
  LSP7DigitalAsset: INTERFACE_ID_LSP7,
  LSP8IdentifiableDigitalAsset: INTERFACE_ID_LSP8,
  LSP9Vault: INTERFACE_ID_LSP9,
  LSP14Ownable2Step: INTERFACE_ID_LSP14,
  LSP17Extendable: INTERFACE_ID_LSP17Extendable,
  LSP17Extension: INTERFACE_ID_LSP17Extension,
  LSP20CallVerification: INTERFACE_ID_LSP20CallVerification,
  LSP20CallVerifier: INTERFACE_ID_LSP20CallVerifier,
  LSP11BasicSocialRecovery: '0x049a28f1',
  LSP25ExecuteRelayCall: INTERFACE_ID_LSP25,
};

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
};

export const LSP1_TYPE_IDS = {
  ...LSP0_TYPE_IDS,
  ...LSP7_TYPE_IDS,
  ...LSP8_TYPE_IDS,
  ...LSP9_TYPE_IDS,
  ...LSP14_TYPE_IDS,
};

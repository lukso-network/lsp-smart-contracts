/**
 * Set of constants values as defined in each LUKSO Standards Proposals (LSPs).
 * @see https://github.com/lukso-network/LIPs/tree/main/LSPs
 */

export * from './contracts';

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
  LSP11BasicSocialRecovery: '0x049a28f1',
};

// ERC725Y
// ----------

export type LSP2ArrayKey = { length: string; index: string };
export type LSPSupportedStandard = { key: string; value: string };

/**
 * @dev list of ERC725Y Metadata keys from the LSP standards.
 * @see https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md
 */
export const ERC725YDataKeys = {
  LSP1: {},
  LSP3: {},
  LSP4: {},
  LSP5: {},
  LSP6: {},
  LSP8: {},
  LSP9: {},
  LSP10: {},
  LSP12: {},
  LSP17: {},
};

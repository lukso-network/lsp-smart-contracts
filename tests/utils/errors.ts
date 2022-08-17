/**
 * @todo delete these constants once LSP7, LSP8 and LSP9 tests have been migrated to chai
 */

// LSP6 - KeyManager
export const customRevertErrorMessage =
  "VM Exception while processing transaction: reverted with custom error";

export const NotAllowedAddressError = (_from, _to) => {
  return `${customRevertErrorMessage} 'NotAllowedAddress("${_from}", "${_to}")'`;
};

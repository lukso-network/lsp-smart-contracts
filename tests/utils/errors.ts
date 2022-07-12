// LSP6 - KeyManager
export const customRevertErrorMessage =
  "VM Exception while processing transaction: reverted with custom error";

export const NoPermissionsSetError = (_from) => {
  return `${customRevertErrorMessage} 'NoPermissionsSet("${_from}")'`;
};

export const NotAuthorisedError = (_from, _permission) => {
  return `${customRevertErrorMessage} 'NotAuthorised("${_from}", "${_permission}")'`;
};

export const NotAllowedAddressError = (_from, _to) => {
  return `${customRevertErrorMessage} 'NotAllowedAddress("${_from}", "${_to}")'`;
};

export const NotAllowedStandardError = (_from, _to) => {
  return `${customRevertErrorMessage} 'NotAllowedStandard("${_from}", "${_to}")'`;
};

export const NotAllowedFunctionError = (_from, _functionSelector) => {
  return `${customRevertErrorMessage} 'NotAllowedFunction("${_from}", "${_functionSelector}")'`;
};

export const NotAllowedERC725YKeyError = (_from, _erc725YKey) => {
  return `${customRevertErrorMessage} 'NotAllowedERC725YKey("${_from}", "${_erc725YKey}")'`;
};

export const InvalidERC725FunctionError = (_invalidFunction) => {
  return `${customRevertErrorMessage} 'InvalidERC725Function("${_invalidFunction}")'`;
};

export const InvalidABIEncodedArrayError = (_value, _valueType) => {
  return `${customRevertErrorMessage} 'InvalidABIEncodedArray("${_value}", "${_valueType}")'`;
};

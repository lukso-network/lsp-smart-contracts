const customRevertErrorMessage =
  "VM Exception while processing transaction: reverted with custom error";

export const CallerNotPendingOwnerError = (_caller: string) => {
  return `${customRevertErrorMessage} 'CallerNotPendingOwner("${_caller}")'`;
};

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

error LSP7RoleOperatorsInvalidIndexRange(
    uint256 startIndex,
    uint256 endIndex,
    uint256 length
);

error LSP7RoleOperatorsCannotRemoveReservedAddress(address reservedAddress);

error LSP7RoleOperatorsNotAuthorized(bytes32 role, address operator);

error LSP7RoleOperatorsArrayLengthMismatch(
    uint256 operatorsLength,
    uint256 dataLength
);

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.28;

library InvariantConstants {
    uint256 internal constant SUPPLY_CAP = 100;
    uint256 internal constant BALANCE_CAP = 5;
    uint256 internal constant TRANSFER_LOCK_START = 1;
    uint256 internal constant TRANSFER_LOCK_END = 30 days;
}

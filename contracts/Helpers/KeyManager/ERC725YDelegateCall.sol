// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

contract ERC725YDelegateCall is ERC725Y {
    // solhint-disable no-empty-blocks
    constructor(address newOwner) ERC725Y(newOwner) {}

    function updateStorage(bytes32 key, bytes memory value) public {
        store[key] = value;
    }
}

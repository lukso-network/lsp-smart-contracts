// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

contract ERC725YDelegateCall is ERC725Y {
    constructor(address newOwner) ERC725Y(newOwner) {}

    function updateStorage(bytes32 key, bytes memory value) public {
        _store[key] = value;
    }
}

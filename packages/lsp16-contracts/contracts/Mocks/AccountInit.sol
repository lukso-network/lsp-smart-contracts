// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import {
    ERC725InitAbstract
} from "@erc725/smart-contracts/contracts/ERC725InitAbstract.sol";

// solhint-disable-next-line no-empty-blocks
contract AccountInit is ERC725InitAbstract {
    function initialize(address newOwner) public virtual initializer {
        ERC725InitAbstract._initialize(newOwner);
    }
}

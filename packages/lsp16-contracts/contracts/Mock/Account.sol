// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.13;

import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";

contract Account is ERC725 {
    // solhint-disable-next-line no-empty-blocks
    constructor(address contractOwner) ERC725(contractOwner) {}
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

/**
 * @title Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
contract LSP0ERC725Account is LSP0ERC725AccountCore {
    /**
     * @notice Sets the owner of the contract
     * @param newOwner the owner of the contract
     */
    constructor(address newOwner) {
        OwnableUnset._setOwner(newOwner);
    }
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {Initializable} from "@erc725/smart-contracts/contracts/custom/Initializable.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract LSP0ERC725AccountInitAbstract is Initializable, LSP0ERC725AccountCore {
    function _initialize(address newOwner) internal virtual onlyInitializing {
        OwnableUnset._setOwner(newOwner);
    }
}

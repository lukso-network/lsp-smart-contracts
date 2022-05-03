// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";

// constants
import {_INTERFACEID_LSP0, _INTERFACEID_ERC1271} from "./LSP0Constants.sol";
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @title Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
contract LSP0ERC725Account is LSP0ERC725AccountCore, ERC725 {
    /**
     * @notice Sets the owner of the contract
     * @param _newOwner the owner of the contract
     */
    constructor(address _newOwner) ERC725(_newOwner) {} // solhint-disable no-empty-blocks

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP0 ||
            interfaceId == _INTERFACEID_LSP1 ||
            super.supportsInterface(interfaceId);
    }

    function transferOwnership(address _newOwner)
        public
        virtual
        override(LSP0ERC725AccountCore, OwnableUnset)
        onlyOwner
    {
        super.transferOwnership(_newOwner);
    }
}

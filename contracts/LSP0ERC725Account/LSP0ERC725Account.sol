// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "./LSP0ERC725AccountCore.sol";
import "@erc725/smart-contracts/contracts/ERC725.sol";

/**
 * @title Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
contract LSP0ERC725Account is LSP0ERC725AccountCore, ERC725 {
    /**
     * @notice Sets the owner of the contract and register ERC725Account, ERC1271 and LSP1UniversalReceiver interfacesId
     * @param _newOwner the owner of the contract
     */
    constructor(address _newOwner) ERC725(_newOwner) {
        _registerInterface(_INTERFACEID_LSP0);
        _registerInterface(_INTERFACEID_ERC1271);
        _registerInterface(_INTERFACEID_LSP1);
    }
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725InitAbstract.sol";
import "./LSP0ERC725AccountCore.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract LSP0ERC725AccountInitAbstract is
    LSP0ERC725AccountCore,
    ERC725InitAbstract
{
    function _initialize(address _newOwner) internal virtual onlyInitializing {
        ERC725InitAbstract.initialize(_newOwner);

        _registerInterface(_INTERFACEID_LSP0);
        _registerInterface(_INTERFACEID_ERC1271);
        _registerInterface(_INTERFACEID_LSP1);
    }
}

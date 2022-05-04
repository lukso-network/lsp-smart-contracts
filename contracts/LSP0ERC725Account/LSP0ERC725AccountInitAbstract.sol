// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {LSP0ERC725AccountCore} from "./LSP0ERC725AccountCore.sol";
import {ERC725InitAbstract} from "@erc725/smart-contracts/contracts/ERC725InitAbstract.sol";

// constants
import {_INTERFACEID_LSP0, _INTERFACEID_ERC1271} from "./LSP0Constants.sol";
import {_INTERFACEID_LSP1} from "../LSP1UniversalReceiver/LSP1Constants.sol";

/**
 * @title Inheritable Proxy Implementation of ERC725Account
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev Bundles ERC725X and ERC725Y, ERC1271 and LSP1UniversalReceiver and allows receiving native tokens
 */
abstract contract LSP0ERC725AccountInitAbstract is ERC725InitAbstract, LSP0ERC725AccountCore {
    function _initialize(address _newOwner) internal virtual override onlyInitializing {
        ERC725InitAbstract._initialize(_newOwner);
    }

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
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP11BasicSocialRecoveryCore} from "./LSP11BasicSocialRecoveryCore.sol";

/**
 * @title Inheritable Proxy Implementation of LSP11 - Basic Social Recovery standard
 * @dev Sets permission for a controller address after a recovery process to interact with an ERC725
 * contract via the LSP6KeyManager
 */
contract LSP11BasicSocialRecoveryInitAbstract is
    Initializable,
    LSP11BasicSocialRecoveryCore
{
    function _initialize(
        address _owner,
        address target_
    ) internal virtual onlyInitializing {
        OwnableUnset._setOwner(_owner);
        _target = target_;
    }
}

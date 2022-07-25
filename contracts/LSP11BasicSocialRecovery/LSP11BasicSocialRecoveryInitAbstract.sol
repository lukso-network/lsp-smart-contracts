// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import {Initializable} from "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import {ERC725} from "@erc725/smart-contracts/contracts/ERC725.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {LSP11BasicSocialRecoveryCore} from "./LSP11BasicSocialRecoveryCore.sol";

/**
 * @title Inheritable Proxy Implementation of LSP11 - Basic Social Recovery standard
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @notice Recovers the permission of a key to control an ERC725 contract through LSP6KeyManager
 */
contract LSP11BasicSocialRecoveryInitAbstract is Initializable, LSP11BasicSocialRecoveryCore {
    function _initialize(address _account) internal virtual onlyInitializing {
        account = _account;
        OwnableUnset._setOwner(_account);
    }
}

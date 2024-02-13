// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// modules
import {
    Initializable
} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {LSP6KeyManagerCore} from "./LSP6KeyManagerCore.sol";
import {InvalidLSP6Target} from "./LSP6Errors.sol";

/**
 * @title Proxy implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev All the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6KeyManagerInitAbstract is
    Initializable,
    LSP6KeyManagerCore
{
    function _initialize(address target_) internal virtual onlyInitializing {
        if (target_ == address(0)) revert InvalidLSP6Target();
        _target = target_;
    }
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// modules
import {
    LSP0ERC725AccountInitAbstract
} from "./LSP0ERC725Account/LSP0ERC725AccountInitAbstract.sol";

// constants
import {
    _LSP3_SUPPORTED_STANDARDS_KEY,
    _LSP3_SUPPORTED_STANDARDS_VALUE
} from "./LSP3UniversalProfile/LSP3Constants.sol";

/**
 * @title Inheritable Proxy implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
abstract contract UniversalProfileInitAbstract is
    LSP0ERC725AccountInitAbstract
{
    /**
     * @inheritdoc LSP0ERC725AccountInitAbstract
     * @dev Set the `SupportedStandards:LSP3UniversalProfile` data key in the ERC725Y data key/value store.
     */
    function _initialize(
        address initialOwner
    ) internal virtual override onlyInitializing {
        LSP0ERC725AccountInitAbstract._initialize(initialOwner);

        // set data key SupportedStandards:LSP3UniversalProfile
        _setData(
            _LSP3_SUPPORTED_STANDARDS_KEY,
            _LSP3_SUPPORTED_STANDARDS_VALUE
        );
    }
}

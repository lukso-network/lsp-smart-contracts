// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// This contract is used only for testing purposes.

// interfaces
import {
    ILSP1UniversalReceiverDelegate
} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {_INTERFACEID_LSP1_DELEGATE} from "../../LSP1UniversalReceiver/LSP1Constants.sol";

contract UniversalReceiverDelegateRevert is ERC165, ILSP1UniversalReceiverDelegate {
    /**
     * @inheritdoc ILSP1UniversalReceiverDelegate
     * @dev Allows to register arrayKeys and Map of incoming vaults and assets and removing them after being sent
     * @return result the return value of keyManager's execute function
     */
    function universalReceiverDelegate(
        address notifier, // solhint-disable no-unused-vars
        uint256 value, // solhint-disable no-unused-vars
        bytes32 typeId,
        bytes memory data // solhint-disable no-unused-vars
    ) public virtual returns (bytes memory result) {
        revert("I Revert");
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == _INTERFACEID_LSP1_DELEGATE || super.supportsInterface(interfaceId);
    }
}

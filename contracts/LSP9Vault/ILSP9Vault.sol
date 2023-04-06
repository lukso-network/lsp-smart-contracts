// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP14Ownable2Step} from "../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

/**
 * @title Interface of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @dev this interface implicitly inherits: IERC165, IERC725X, IERC725Y, ILSP1UniversalReceiver, ILSP14Ownable2Step
 */
interface ILSP9Vault {
    /**
     * @notice Emitted when receiving native tokens
     * @param sender The address of the sender
     * @param value The amount of native tokens received
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @dev Receives and executes a batch of function calls on this contract.
     */
    function batchCalls(bytes[] calldata data) external returns (bytes[] memory results);
}

// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    ILSP1UniversalReceiver
} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP14Ownable2Step} from "../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

/**
 * @title Interface of LSP9 - Vault standard, a blockchain vault that can hold assets and interact with other smart contracts.
 * @dev Could be owned by an EOA or by a contract and is able to receive and send assets. Also allows for registering received assets by leveraging the key-value storage.
 */
interface ILSP9Vault {
    /**
     * @notice `value` native tokens received from `sender`.
     * @dev Emitted when receiving native tokens.
     * @param sender The address that sent some native tokens to this contract.
     * @param value The amount of native tokens received.
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @notice Executing the following batch of abi-encoded function calls on the contract: `data`.
     *
     * @dev Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.
     * @param data An array of ABI encoded function calls to be called on the contract.
     * @return results An array of abi-encoded data returned by the functions executed.
     */
    function batchCalls(
        bytes[] calldata data
    ) external returns (bytes[] memory results);
}

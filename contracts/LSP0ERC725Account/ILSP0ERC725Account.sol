// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP14Ownable2Step} from "../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

/**
 * @title Interface of ERC725Account
 */
interface ILSP0ERC725Account is
    IERC165,
    IERC725X,
    IERC725Y,
    IERC1271,
    ILSP1UniversalReceiver,
    ILSP14Ownable2Step
{
    /**
     * @dev Receives and executes a batch of function calls on this contract.
     */
    function batchCalls(bytes[] calldata data) external returns (bytes[] memory results);
}

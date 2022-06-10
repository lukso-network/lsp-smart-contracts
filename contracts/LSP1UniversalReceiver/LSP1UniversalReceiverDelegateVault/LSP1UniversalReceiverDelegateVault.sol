// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiverDelegate} from "../ILSP1UniversalReceiverDelegate.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {TokenHandling} from "./Handling/TokenHandling.sol";

// constants
import {_INTERFACEID_LSP1_DELEGATE} from "../LSP1Constants.sol";
import {_TYPEID_LSP7_TOKENSSENDER, _TYPEID_LSP7_TOKENSRECIPIENT} from "../../LSP7DigitalAsset/LSP7Constants.sol";
import {_TYPEID_LSP8_TOKENSSENDER, _TYPEID_LSP8_TOKENSRECIPIENT} from "../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

/**
 * @title Core Implementation of contract writing the received LSP7 and LSP8 assets into your Vault using
 *        the LSP5-ReceivedAsset standard and removing the sent assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 */
contract LSP1UniversalReceiverDelegateVault is
    ERC165,
    ILSP1UniversalReceiverDelegate,
    TokenHandling
{
    /**
     * @inheritdoc ILSP1UniversalReceiverDelegate
     * @dev allows to register arrayKeys and Map of incoming assets and remove after being sent
     * @return result The return value
     */
    function universalReceiverDelegate(
        address sender,
        uint256 value,
        bytes32 typeId,
        bytes memory data // solhint-disable no-unused-vars
    ) public virtual override returns (bytes memory result) {
        if (
            typeId == _TYPEID_LSP7_TOKENSSENDER ||
            typeId == _TYPEID_LSP7_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP8_TOKENSSENDER ||
            typeId == _TYPEID_LSP8_TOKENSRECIPIENT
        ) {
            result = _tokenHandling(sender, typeId);
        }
    }

    // --- Overrides

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == _INTERFACEID_LSP1_DELEGATE || super.supportsInterface(interfaceId);
    }
}

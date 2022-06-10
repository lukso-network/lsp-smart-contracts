// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// interfaces
import {ILSP1UniversalReceiverDelegate} from "../ILSP1UniversalReceiverDelegate.sol";

// modules
import {ERC165} from "@openzeppelin/contracts/utils/introspection/ERC165.sol";
import {TokenAndVaultHandling} from "./Handling/TokenAndVaultHandling.sol";

// constants
import {_INTERFACEID_LSP1_DELEGATE} from "../LSP1Constants.sol";
import {_TYPEID_LSP7_TOKENSSENDER, _TYPEID_LSP7_TOKENSRECIPIENT} from "../../LSP7DigitalAsset/LSP7Constants.sol";
import {_TYPEID_LSP8_TOKENSSENDER, _TYPEID_LSP8_TOKENSRECIPIENT} from "../../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import {_TYPEID_LSP9_VAULTSENDER, _TYPEID_LSP9_VAULTRECIPIENT} from "../../LSP9Vault/LSP9Constants.sol";

/**
 * @title Core Implementation of contract writing the received Vaults and LSP7, LSP8 assets into your ERC725Account using
 *        the LSP5-ReceivedAsset and LSP10-ReceivedVaults standard and removing the sent vaults and assets.
 *
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Delegate contract of the initial universal receiver
 *
 * Owner of the UniversalProfile MUST be a KeyManager that allows (this) address to setData on the UniversalProfile
 *
 */
contract LSP1UniversalReceiverDelegateUP is
    ERC165,
    ILSP1UniversalReceiverDelegate,
    TokenAndVaultHandling
{
    /**
     * @inheritdoc ILSP1UniversalReceiverDelegate
     * @dev Allows to register arrayKeys and Map of incoming vaults and assets and removing them after being sent
     * @return result the return value of keyManager's execute function
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
            typeId == _TYPEID_LSP8_TOKENSRECIPIENT ||
            typeId == _TYPEID_LSP9_VAULTSENDER ||
            typeId == _TYPEID_LSP9_VAULTRECIPIENT
        ) {
            result = _tokenAndVaultHandling(sender, typeId);
        }

        /* @TODO
          else if() {
            result = FollowerHandling(sender, typeId, data);
            }
        */
    }

    // --- Overrides

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == _INTERFACEID_LSP1_DELEGATE || super.supportsInterface(interfaceId);
    }
}

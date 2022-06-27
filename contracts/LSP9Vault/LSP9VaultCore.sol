// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ILSP1UniversalReceiver} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP1UniversalReceiverDelegate} from "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// libraries
import {ERC165Checker} from "../Custom/ERC165Checker.sol";

// modules
import {ERC725XCore} from "@erc725/smart-contracts/contracts/ERC725XCore.sol";
import {ERC725YCore} from "@erc725/smart-contracts/contracts/ERC725YCore.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";
import {ClaimOwnership} from "../Custom/ClaimOwnership.sol";

// constants
import {_INTERFACEID_CLAIM_OWNERSHIP} from "../Custom/IClaimOwnership.sol";
import {_INTERFACEID_LSP1, _INTERFACEID_LSP1_DELEGATE, _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP9, _TYPEID_LSP9_VAULTRECIPIENT, _TYPEID_LSP9_VAULTSENDER} from "./LSP9Constants.sol";

/**
 * @title Core Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultCore is ERC725XCore, ERC725YCore, ClaimOwnership, ILSP1UniversalReceiver {
    /**
     * @notice Emitted when receiving native tokens
     * @param sender The address of the sender
     * @param value The amount of value sent
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    // modifiers

    /**
     * @dev Modifier restricting the call to the owner of the contract and the UniversalReceiverDelegate
     */
    modifier onlyAllowed() {
        if (msg.sender != owner()) {
            address universalReceiverAddress = address(
                bytes20(_getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY))
            );
            require(
                ERC165Checker.supportsERC165Interface(msg.sender, _INTERFACEID_LSP1_DELEGATE) &&
                    msg.sender == universalReceiverAddress,
                "Only Owner or Universal Receiver Delegate allowed"
            );
        }
        _;
    }

    // public functions

    /**
     * @dev Emits an event when receiving native tokens
     */
    fallback() external payable virtual {
        if (msg.value > 0) emit ValueReceived(msg.sender, msg.value);
    }

    // ERC165

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC725XCore, ERC725YCore)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP9 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_CLAIM_OWNERSHIP ||
            super.supportsInterface(interfaceId);
    }

    // ERC173 - Modified ClaimOwnership

    /**
     * @dev Sets the pending owner
     */
    function transferOwnership(address newOwner)
        public
        virtual
        override(ClaimOwnership, OwnableUnset)
        onlyOwner
    {
        ClaimOwnership._transferOwnership(newOwner);
    }

    /**
     * @dev Transfer the ownership and notify the vault sender and vault receiver
     */
    function claimOwnership() public virtual override {
        address previousOwner = owner();

        _claimOwnership();

        _notifyVaultSender(previousOwner);
        _notifyVaultReceiver(msg.sender);
    }

    // ERC725

    /**
     * @inheritdoc IERC725Y
     * @dev Sets data as bytes in the vault storage for a single key.
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32 dataKey, bytes memory dataValue) public virtual override onlyAllowed {
        _setData(dataKey, dataValue);
    }

    /**
     * @inheritdoc IERC725Y
     * @dev Sets array of data at multiple given `key`
     * SHOULD only be callable by the owner of the contract set via ERC173
     * and the UniversalReceiverDelegate
     *
     * Emits a {DataChanged} event.
     */
    function setData(bytes32[] memory dataKeys, bytes[] memory dataValues)
        public
        virtual
        override
        onlyAllowed
    {
        require(dataKeys.length == dataValues.length, "Keys length not equal to values length");
        for (uint256 i = 0; i < dataKeys.length; i++) {
            _setData(dataKeys[i], dataValues[i]);
        }
    }

    // LSP1

    /**
     * @notice Triggers the UniversalReceiver event when this function gets executed successfully.
     * @dev Forwards the call to the UniversalReceiverDelegate if set.
     * @param typeId The type of call received.
     * @param data The data received.
     */
    function universalReceiver(bytes32 typeId, bytes calldata data)
        public
        payable
        virtual
        override
        returns (bytes memory returnValue)
    {
        bytes memory lsp1DelegateValue = _getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(bytes20(lsp1DelegateValue));

            if (
                ERC165Checker.supportsERC165Interface(
                    universalReceiverDelegate,
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                returnValue = ILSP1UniversalReceiverDelegate(universalReceiverDelegate)
                    .universalReceiverDelegate(msg.sender, msg.value, typeId, data);
            }
        }
        emit UniversalReceiver(msg.sender, msg.value, typeId, returnValue, data);
    }

    // internal functions

    /**
     * @dev Calls the universalReceiver function of the sender if supports LSP1 InterfaceId
     */
    function _notifyVaultSender(address sender) internal virtual {
        if (ERC165Checker.supportsERC165Interface(sender, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(sender).universalReceiver(_TYPEID_LSP9_VAULTSENDER, "");
        }
    }

    /**
     * @dev Calls the universalReceiver function of the recipient if supports LSP1 InterfaceId
     */
    function _notifyVaultReceiver(address receiver) internal virtual {
        if (ERC165Checker.supportsERC165Interface(receiver, _INTERFACEID_LSP1)) {
            ILSP1UniversalReceiver(receiver).universalReceiver(_TYPEID_LSP9_VAULTRECIPIENT, "");
        }
    }
}

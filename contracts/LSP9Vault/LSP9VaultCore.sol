// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725X.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// interfaces
import "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";

// library
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";
import "./LSP9Constants.sol";

/**
 * @title Core Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultCore is ILSP1UniversalReceiver, ERC725XCore, ERC725YCore {

    /**
     * @notice Emitted when a native token is received
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
                ERC165Checker.supportsInterface(
                    msg.sender,
                    _INTERFACEID_LSP1_DELEGATE
                ) && msg.sender == universalReceiverAddress,
                "Only Owner or Universal Receiver Delegate allowed"
            );
        }
        _;
    }

    // public functions

    /**
     * @dev Emits an event when a native token is received
     */
    receive() external payable {
        emit ValueReceived(_msgSender(), msg.value);
    }

    // LSP1

    /**
     * @notice Triggers the UniversalReceiver event when this function gets executed successfully.
     * @dev Forwards the call to the UniversalReceiverDelegate if set.
     * @param _typeId The type of call received.
     * @param _data The data received.
     */
    function universalReceiver(bytes32 _typeId, bytes calldata _data)
        external
        virtual
        override
        returns (bytes memory returnValue)
    {
        bytes memory data = _getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY);

        if (data.length >= 20) {
            address universalReceiverAddress = BytesLib.toAddress(data, 0);
            if (
                ERC165Checker.supportsInterface(
                    universalReceiverAddress,
                    _INTERFACEID_LSP1_DELEGATE
                )
            ) {
                returnValue = ILSP1UniversalReceiverDelegate(
                    universalReceiverAddress
                ).universalReceiverDelegate(_msgSender(), _typeId, _data);
            }
        }
        emit UniversalReceiver(_msgSender(), _typeId, returnValue, _data);
    }

    // internal functions

    /**
     * @dev Calls the universalReceiver function of the sender if supports LSP1 InterfaceId
     */
    function _notifyVaultSender(address _sender) internal virtual {
        if (
            ERC165Checker.supportsERC165(_sender) &&
            ERC165Checker.supportsInterface(_sender, _INTERFACEID_LSP1)
        ) {
            ILSP1UniversalReceiver(_sender).universalReceiver(
                _TYPEID_LSP9_VAULTSENDER,
                ""
            );
        }
    }

    /**
     * @dev Calls the universalReceiver function of the recipient if supports LSP1 InterfaceId
     */
    function _notifyVaultReceiver(address _receiver) internal virtual {
        if (
            ERC165Checker.supportsERC165(_receiver) &&
            ERC165Checker.supportsInterface(_receiver, _INTERFACEID_LSP1)
        ) {
            ILSP1UniversalReceiver(_receiver).universalReceiver(
                _TYPEID_LSP9_VAULTRECIPIENT,
                ""
            );
        }
    }
}

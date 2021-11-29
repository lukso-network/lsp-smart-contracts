// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// modules
import "@erc725/smart-contracts/contracts/ERC725X.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// interfaces
import "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

// library
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";
import "@erc725/smart-contracts/contracts/utils/ERC725Utils.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";
import "./LSP9Constants.sol";

/**
 * @title Implementation of LSP9Vault built on top of ERC725, LSP1UniversalReceiver
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev Could be owned by a UniversalProfile and able to register received asset with UniversalReceiverDelegateVault
 */
contract LSP9VaultCore is ERC725XCore, ERC725YCore, ILSP1 {
    using ERC725Utils for IERC725Y;

    event ValueReceived(address indexed sender, uint256 indexed value);

    // public functions

    receive() external payable {
        emit ValueReceived(_msgSender(), msg.value);
    }

    // ERC725Y

    function setData(bytes32[] memory _keys, bytes[] memory _values)
        public
        virtual
        override
        onlyAllowed
    {
        require(
            _keys.length == _values.length,
            "Keys length not equal to values length"
        );
        for (uint256 i = 0; i < _keys.length; i++) {
            _setData(_keys[i], _values[i]);
        }
    }

    // LSP1

    function universalReceiver(bytes32 _typeId, bytes calldata _data)
        external
        virtual
        override
        returns (bytes memory returnValue)
    {
        bytes memory receiverData = IERC725Y(this).getDataSingle(
            _UNIVERSAL_RECEIVER_DELEGATE_KEY
        );
        returnValue = "";

        // call external contract
        if (receiverData.length == 20) {
            address universalReceiverAddress = BytesLib.toAddress(
                receiverData,
                0
            );

            if (
                ERC165(universalReceiverAddress).supportsInterface(
                    _INTERFACE_ID_LSP1DELEGATE
                )
            ) {
                returnValue = ILSP1Delegate(universalReceiverAddress)
                    .universalReceiverDelegate(_msgSender(), _typeId, _data);
            }
        }

        emit UniversalReceiver(_msgSender(), _typeId, returnValue, _data);

        return returnValue;
    }

    // ERC173

    function transferOwnership(address newOwner)
        public
        virtual
        override
        onlyOwner
    {
        _notifyVaultSender(msg.sender);

        OwnableUnset.transferOwnership(newOwner);

        _notifyVaultReceiver(newOwner);
    }

    // internal functions

    function _notifyVaultSender(address _sender) internal virtual {
        if (
            ERC165Checker.supportsERC165(_sender) &&
            ERC165Checker.supportsInterface(_sender, _LSP1_INTERFACE_ID)
        ) {
            ILSP1UniversalReceiver(_sender).universalReceiver(
                _LSP9_VAULT_SENDER_TYPE_ID_,
                ""
            );
        }
    }

    function _notifyVaultReceiver(address _receiver) internal virtual {
        if (
            ERC165Checker.supportsERC165(_receiver) &&
            ERC165Checker.supportsInterface(_receiver, _LSP1_INTERFACE_ID)
        ) {
            ILSP1UniversalReceiver(_receiver).universalReceiver(
                _LSP9_VAULT_RECEPIENT_TYPE_ID_,
                ""
            );
        }
    }

    // modifiers

    modifier onlyAllowed() {
        if (msg.sender != owner()) {
            address universalReceiverAddress = address(
                bytes20(
                    IERC725Y(this).getDataSingle(
                        _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
                    )
                )
            );
            require(
                ERC165Checker.supportsInterface(
                    msg.sender,
                    _LSP1_DELEGATE_INTERFACE_ID
                ) && msg.sender == universalReceiverAddress,
                "Only Owner or Universal Receiver Delegate allowed"
            );
        }
        _;
    }
}

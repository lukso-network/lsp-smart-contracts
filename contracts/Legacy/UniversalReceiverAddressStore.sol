// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// libraries
import {
    EnumerableSet
} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

// modules
import {
    ERC165Storage
} from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";
import {AddressRegistry} from "./Registries/AddressRegistry.sol";

contract UniversalReceiverAddressStore is ERC165Storage, AddressRegistry {
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes4 internal constant _INTERFACE_ID_LSP1DELEGATE = 0xa245bbda;

    bytes32 internal constant _TOKENS_RECIPIENT_INTERFACE_HASH =
        0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b; // keccak256("ERC777TokensRecipient")

    address public account;

    constructor(address _account) {
        account = _account;
        _registerInterface(_INTERFACE_ID_LSP1DELEGATE);
    }

    function addAddress(
        address _address
    ) public override onlyAccount returns (bool) {
        return _addressStore.add(_address);
    }

    function removeAddress(
        address _address
    ) public override onlyAccount returns (bool) {
        return _addressStore.remove(_address);
    }

    function universalReceiverDelegate(
        address sender,
        uint256 /* value */,
        bytes32 typeId,
        bytes memory
    ) external onlyAccount returns (bytes memory) {
        // require(typeId == _TOKENS_RECIPIENT_INTERFACE_HASH, 'UniversalReceiverDelegate: Type not supported');

        // store tokens only if received, DO NOT revert on _TOKENS_SENDER_INTERFACE_HASH
        if (typeId == _TOKENS_RECIPIENT_INTERFACE_HASH) addAddress(sender);

        return abi.encodePacked(typeId);
    }

    /* Modifers */
    modifier onlyAccount() {
        require(
            msg.sender == account,
            "Only the connected account call this function"
        );
        _;
    }
}

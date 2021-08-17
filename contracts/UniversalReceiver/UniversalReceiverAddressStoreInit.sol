// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../_LSPs/ILSP1_UniversalReceiverDelegate.sol";

// modules
import { AddressRegistry } from "../Registries/AddressRegistry.sol";
import { ERC165Storage } from "@openzeppelin/contracts/utils/introspection/ERC165Storage.sol";

contract UniversalReceiverAddressStoreInit is ERC165Storage, ILSP1Delegate, AddressRegistry {
    using EnumerableSet for EnumerableSet.AddressSet;

    bytes4 _INTERFACE_ID_LSP1DELEGATE = 0xc2d7bcc1;

    bytes32 constant internal _TOKENS_RECIPIENT_INTERFACE_HASH =
    0xb281fc8c12954d22544db45de3159a39272895b169a852b314f9cc762e44c53b; // keccak256("ERC777TokensRecipient")

    address public account;

    function initialize(address _account) public {
        account = _account;

        _registerInterface();
    } 
}
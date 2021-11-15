// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import "../LSP6KeyManager/ILSP6KeyManager.sol";
import "../LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "../LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";
import "@erc725/smart-contracts/contracts/interfaces/IERC1271.sol";
import "@erc725/smart-contracts/contracts/interfaces/ILSP1_UniversalReceiver.sol";
import "@erc725/smart-contracts/contracts/interfaces/ILSP1_UniversalReceiverDelegate.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";
import "../LSP6KeyManager/LSP6Constants.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";

contract CalculateERC165Selectors {

    function calculateSelectorLSP1() public pure returns (bytes4) {
        bytes4 selector = type(ILSP1).interfaceId;
        require(selector == _LSP1_INTERFACE_ID, "_LSP1_INTERFACE_ID does not match type(ILSP1).interfaceId");

        return selector;
    }

    function calculateSelectorLSP1Delegate() public pure returns (bytes4) {
        bytes4 selector = type(ILSP1Delegate).interfaceId;
        require(selector == _LSP1_DELEGATE_INTERFACE_ID, "_LSP1_DELEGATE_INTERFACE_ID does not match type(ILSP1Delegate).interfaceId");

        return selector;
    }

    function calculateSelectorLSP6KeyManager() public pure returns (bytes4) {
        bytes4 selector = type(ILSP6KeyManager).interfaceId;
        require(selector == _LSP6_INTERFACE_ID, "_LSP6_INTERFACE_ID does not match type(ILSP6).interfaceId");

        return selector;
    }

    function calculateSelectorLSP7() public pure returns (bytes4) {
        bytes4 selector = type(ILSP7DigitalAsset).interfaceId;
        require(selector == _LSP7_INTERFACE_ID, "_LSP7_INTERFACE_ID does not match type(ILSP7).interfaceId");

        return selector;
    }

    function calculateSelectorLSP8() public pure returns (bytes4) {
        bytes4 selector = type(ILSP8IdentifiableDigitalAsset).interfaceId;
        require(selector == _LSP8_INTERFACE_ID, "_LSP8_INTERFACE_ID does not match type(ILSP8).interfaceId");

        return selector;
    }

    function calculateSelectorERC1271() public pure returns (bytes4) {
        bytes4 selector = type(IERC1271).interfaceId;

        return selector;
    }
}

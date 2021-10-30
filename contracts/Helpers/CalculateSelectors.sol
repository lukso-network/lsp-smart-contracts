// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// constants
import "../LSP1-UniversalReceiver/LSP1Constants.sol";
import "../LSP6-KeyManager/LSP6Constants.sol";
import "../LSP7-DigitalAsset/LSP7Constants.sol";
import "../LSP8-IdentifiableDigitalAsset/LSP8Constants.sol";

// interfaces
import "../LSP6-KeyManager/ILSP6_KeyManager.sol";
import "../LSP7-DigitalAsset/ILSP7.sol";
import "../LSP8-IdentifiableDigitalAsset/ILSP8.sol";
import "../../submodules/ERC725/implementations/contracts/IERC1271.sol";
import "../../submodules/ERC725/implementations/contracts/interfaces/ILSP1_UniversalReceiver.sol";
import "../../submodules/ERC725/implementations/contracts/interfaces/ILSP1_UniversalReceiverDelegate.sol";

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
        bytes4 selector = type(ILSP6).interfaceId;
        require(selector == _LSP6_INTERFACE_ID, "_LSP6_INTERFACE_ID does not match type(ILSP6).interfaceId");

        return selector;
    }

    function calculateSelectorLSP7() public pure returns (bytes4) {
        bytes4 selector = type(ILSP7).interfaceId;
        require(selector == _LSP7_INTERFACE_ID, "_LSP7_INTERFACE_ID does not match type(ILSP7).interfaceId");

        return selector;
    }

    function calculateSelectorLSP8() public pure returns (bytes4) {
        bytes4 selector = type(ILSP8).interfaceId;
        require(selector == _LSP8_INTERFACE_ID, "_LSP8_INTERFACE_ID does not match type(ILSP8).interfaceId");

        return selector;
    }

    function calculateSelectorERC1271() public pure returns (bytes4) {
        bytes4 selector = type(IERC1271).interfaceId;

        return selector;
    }
}

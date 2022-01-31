// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// LSPs interfaces
import "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";
import "../LSP6KeyManager/ILSP6KeyManager.sol";
import "../LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import "../LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";

// ERC interfaces
import "./Tokens/IERC223.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@erc725/smart-contracts/contracts/interfaces/IERC1271.sol";

// constants
import "../LSP1UniversalReceiver/LSP1Constants.sol";
import "../LSP6KeyManager/LSP6Constants.sol";
import "../LSP7DigitalAsset/LSP7Constants.sol";
import "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import "../LSP9Vault/LSP9Vault.sol";

/**
 * @dev This contract calculates the ERC165 interface IDs of each LSP contract
 *      and ensure that these values are correctly stored as hardcoded
 *      Solidity constants.
 */
contract CalculateLSPInterfaces {
    function calculateInterfaceLSP1() public pure returns (bytes4) {
        bytes4 selector = type(ILSP1UniversalReceiver).interfaceId;
        require(
            selector == _INTERFACEID_LSP1,
            "_LSP1_INTERFACE_ID does not match type(ILSP1).interfaceId"
        );

        return selector;
    }

    function calculateInterfaceLSP1Delegate() public pure returns (bytes4) {
        bytes4 selector = type(ILSP1UniversalReceiverDelegate).interfaceId;
        require(
            selector == _INTERFACEID_LSP1_DELEGATE,
            "_LSP1_DELEGATE_INTERFACE_ID does not match type(ILSP1Delegate).interfaceId"
        );

        return selector;
    }

    function calculateInterfaceLSP6KeyManager() public pure returns (bytes4) {
        bytes4 selector = type(ILSP6KeyManager).interfaceId;
        require(
            selector == _INTERFACEID_LSP6,
            "_LSP6_INTERFACE_ID does not match type(ILSP6).interfaceId"
        );

        return selector;
    }

    function calculateInterfaceLSP7() public pure returns (bytes4) {
        bytes4 selector = type(ILSP7DigitalAsset).interfaceId;
        require(
            selector == _INTERFACEID_LSP7,
            "_LSP7_INTERFACE_ID does not match type(ILSP7).interfaceId"
        );

        return selector;
    }

    function calculateInterfaceLSP8() public pure returns (bytes4) {
        bytes4 selector = type(ILSP8IdentifiableDigitalAsset).interfaceId;
        require(
            selector == _INTERFACEID_LSP8,
            "_LSP8_INTERFACE_ID does not match type(ILSP8).interfaceId"
        );

        return selector;
    }

    function calculateLSP9VaultInterfaceID() public pure returns (bytes4) {
        LSP9Vault i;

        bytes4 selector = i.getData.selector ^
            i.setData.selector ^
            i.execute.selector ^
            i.universalReceiver.selector;

        require(
            selector == _INTERFACEID_LSP9,
            "_LSP9_INTERFACE_ID does not match XOR of the functions"
        );

        return selector;
    }
}

/**
 * @dev Calculate the ERC165 interface IDs (for backward compatibility)
 */
contract CalculateERCInterfaces {
    function calculateInterfaceERC223() public pure returns (bytes4) {
        return type(IERC223).interfaceId;
    }

    function calculateInterfaceERC20() public pure returns (bytes4) {
        return type(IERC20).interfaceId;
    }

    function calculateInterfaceERC721() public pure returns (bytes4) {
        return type(IERC721).interfaceId;
    }

    function calculateInterfaceERC721Metadata() public pure returns (bytes4) {
        return type(IERC721Metadata).interfaceId;
    }

    function calculateInterfaceERC777() public pure returns (bytes4) {
        return type(IERC777).interfaceId;
    }

    function calculateInterfaceERC1155() public pure returns (bytes4) {
        return type(IERC1155).interfaceId;
    }

    function calculateInterfaceERC1271() public pure returns (bytes4) {
        return type(IERC1271).interfaceId;
    }
}

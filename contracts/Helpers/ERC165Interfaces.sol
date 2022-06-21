// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// ERC interfaces
import {IERC725X} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {OwnableUnset} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Metadata} from "@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol";
import {IERC777} from "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {IERC223} from "./Tokens/IERC223.sol";

// LSPs interfaces
import {ILSP1UniversalReceiver as ILSP1} from "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import {ILSP1UniversalReceiverDelegate as ILSP1Delegate} from "../LSP1UniversalReceiver/ILSP1UniversalReceiverDelegate.sol";
import {ILSP6KeyManager as ILSP6} from "../LSP6KeyManager/ILSP6KeyManager.sol";
import {ILSP7DigitalAsset as ILSP7} from "../LSP7DigitalAsset/ILSP7DigitalAsset.sol";
import {ILSP8IdentifiableDigitalAsset as ILSP8} from "../LSP8IdentifiableDigitalAsset/ILSP8IdentifiableDigitalAsset.sol";
import {IClaimOwnership, _INTERFACEID_CLAIM_OWNERSHIP} from "../Custom/IClaimOwnership.sol";

// constants
import {_INTERFACEID_LSP0} from "../LSP0ERC725Account/LSP0Constants.sol";
import {_INTERFACEID_LSP1, _INTERFACEID_LSP1_DELEGATE} from "../LSP1UniversalReceiver/LSP1Constants.sol";
import {_INTERFACEID_LSP6} from "../LSP6KeyManager/LSP6Constants.sol";
import {_INTERFACEID_LSP7} from "../LSP7DigitalAsset/LSP7Constants.sol";
import {_INTERFACEID_LSP8} from "../LSP8IdentifiableDigitalAsset/LSP8Constants.sol";
import {_INTERFACEID_LSP9} from "../LSP9Vault/LSP9Constants.sol";

/**
 * @dev This contract calculates the ERC165 interface IDs of each LSP contract
 *      and ensure that these values are correctly stored as hardcoded
 *      Solidity constants.
 */
contract CalculateLSPInterfaces {
    function calculateInterfaceLSP0() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId = 
            type(IERC725Y).interfaceId ^
            type(IERC725X).interfaceId ^
            type(IERC1271).interfaceId ^
            type(ILSP1).interfaceId ^
            OwnableUnset.owner.selector ^
            OwnableUnset.transferOwnership.selector ^
            type(IClaimOwnership).interfaceId;

        require(
            interfaceId == _INTERFACEID_LSP0,
            "hardcoded _INTERFACEID_LSP0 does not match XOR of the functions selectors"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP1() public pure returns (bytes4) {
        bytes4 interfaceId = type(ILSP1).interfaceId;
        require(
            interfaceId == _INTERFACEID_LSP1,
            "hardcoded _INTERFACEID_LSP1 does not match type(ILSP1).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP1Delegate() public pure returns (bytes4) {
        bytes4 interfaceId = type(ILSP1Delegate).interfaceId;
        require(
            interfaceId == _INTERFACEID_LSP1_DELEGATE,
            "hardcoded _INTERFACEID_LSP1_DELEGATE does not match type(ILSP1Delegate).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP6KeyManager() public pure returns (bytes4) {
        bytes4 interfaceId = type(ILSP6).interfaceId;
        require(
            interfaceId == _INTERFACEID_LSP6,
            "hardcoded _INTERFACEID_LSP6 does not match type(ILSP6).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP7() public pure returns (bytes4) {
        bytes4 interfaceId = type(ILSP7).interfaceId;
        require(
            interfaceId == _INTERFACEID_LSP7,
            "hardcoded _INTERFACEID_LSP7 does not match type(ILSP7).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP8() public pure returns (bytes4) {
        bytes4 interfaceId = type(ILSP8).interfaceId;
        require(
            interfaceId == _INTERFACEID_LSP8,
            "hardcoded _INTERFACEID_LSP8 does not match type(ILSP8).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP9() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId = 
            type(IERC725X).interfaceId ^
            type(IERC725Y).interfaceId ^
            type(ILSP1).interfaceId ^
            OwnableUnset.owner.selector ^
            OwnableUnset.transferOwnership.selector ^
            type(IClaimOwnership).interfaceId;

        require(
            interfaceId == _INTERFACEID_LSP9,
            "hardcoded _INTERFACEID_LSP9 does not match XOR of the functions"
        );

        return interfaceId;
    }

    function calculateInterfaceClaimOwnership() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId = 
            OwnableUnset.owner.selector ^
            OwnableUnset.transferOwnership.selector ^
            type(IClaimOwnership).interfaceId;

        require(
            interfaceId == _INTERFACEID_CLAIM_OWNERSHIP,
            "hardcoded _INTERFACEID_CLAIM_OWNERSHIP does not match XOR of the functions"
        );

        return interfaceId;
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

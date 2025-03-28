// solhint-disable one-contract-per-file
// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

// ERC interfaces
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    OwnableUnset
} from "@erc725/smart-contracts/contracts/custom/OwnableUnset.sol";

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {
    IERC20Metadata
} from "@openzeppelin/contracts/interfaces/IERC20Metadata.sol";
import {IERC721} from "@openzeppelin/contracts/interfaces/IERC721.sol";
import {
    IERC721Metadata
} from "@openzeppelin/contracts/interfaces/IERC721Metadata.sol";
import {IERC777} from "@openzeppelin/contracts/interfaces/IERC777.sol";
import {IERC1155} from "@openzeppelin/contracts/interfaces/IERC1155.sol";
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";
import {IERC223} from "./Tokens/IERC223.sol";

// LSPs interfaces

import {
    ILSP0ERC725Account
} from "@lukso/lsp0-contracts/contracts/ILSP0ERC725Account.sol";
import {
    ILSP1UniversalReceiver as ILSP1
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol";

import {
    ILSP1UniversalReceiverDelegate as ILSP1Delegate
} from "@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiverDelegate.sol";

import {
    ILSP6KeyManager as ILSP6
} from "@lukso/lsp6-contracts/contracts/ILSP6KeyManager.sol";
import {
    ILSP7DigitalAsset as ILSP7
} from "@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol";
import {
    ILSP8IdentifiableDigitalAsset as ILSP8
} from "@lukso/lsp8-contracts/contracts/ILSP8IdentifiableDigitalAsset.sol";

import {
    ILSP9Vault as ILSP9
} from "@lukso/lsp9-contracts/contracts/ILSP9Vault.sol";
import {
    ILSP11SocialRecovery as ILSP11
} from "../LSP11SocialRecovery/ILSP11SocialRecovery.sol";
import {
    ILSP14Ownable2Step as ILSP14
} from "@lukso/lsp14-contracts/contracts/ILSP14Ownable2Step.sol";
import {
    ILSP20CallVerifier as ILSP20
} from "@lukso/lsp20-contracts/contracts/ILSP20CallVerifier.sol";
import {
    ILSP25ExecuteRelayCall as ILSP25
} from "@lukso/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol";
import {
    ILSP26FollowerSystem as ILSP26
} from "@lukso/lsp26-contracts/contracts/ILSP26FollowerSystem.sol";

// constants
import {
    _INTERFACEID_LSP0
} from "@lukso/lsp0-contracts/contracts/LSP0Constants.sol";
import {
    _INTERFACEID_LSP1,
    _INTERFACEID_LSP1_DELEGATE
} from "@lukso/lsp1-contracts/contracts/LSP1Constants.sol";
import {
    _INTERFACEID_LSP6
} from "@lukso/lsp6-contracts/contracts/LSP6Constants.sol";
import {
    _INTERFACEID_LSP7
} from "@lukso/lsp7-contracts/contracts/LSP7Constants.sol";
import {
    _INTERFACEID_LSP8
} from "@lukso/lsp8-contracts/contracts/LSP8Constants.sol";
import {
    _INTERFACEID_LSP9
} from "@lukso/lsp9-contracts/contracts/LSP9Constants.sol";
import {_INTERFACEID_LSP11} from "../LSP11SocialRecovery/LSP11Constants.sol";
import {
    _INTERFACEID_LSP14
} from "@lukso/lsp14-contracts/contracts/LSP14Constants.sol";
import {
    _INTERFACEID_LSP17_EXTENDABLE,
    _INTERFACEID_LSP17_EXTENSION
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol";
import {
    _INTERFACEID_LSP20_CALL_VERIFICATION,
    _INTERFACEID_LSP20_CALL_VERIFIER
} from "@lukso/lsp20-contracts/contracts/LSP20Constants.sol";
import {
    _INTERFACEID_LSP25
} from "@lukso/lsp25-contracts/contracts/LSP25Constants.sol";
import {
    _INTERFACEID_LSP26
} from "@lukso/lsp26-contracts/contracts/LSP26Constants.sol";

// libraries
import {
    ERC165Checker
} from "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

/**
 * @dev This contract calculates the ERC165 interface IDs of each LSP contract
 *      and ensure that these values are correctly stored as hardcoded
 *      Solidity constants.
 */
contract CalculateLSPInterfaces {
    function calculateInterfaceLSP0() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId =
            ILSP0ERC725Account.batchCalls.selector ^
            type(IERC725Y).interfaceId ^
            type(IERC725X).interfaceId ^
            type(IERC1271).interfaceId ^
            type(ILSP1).interfaceId ^
            calculateInterfaceLSP14() ^
            calculateInterfaceLSP17Extendable() ^
            calculateInterfaceLSP20CallVerification();

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
        // prettier-ignore
        bytes4 interfaceId = 
            type(ILSP6).interfaceId ^
            type(IERC1271).interfaceId ^
            calculateInterfaceLSP20CallVerifier() ^
            calculateInterfaceLSP25ExecuteRelayCall();

        require(
            interfaceId == _INTERFACEID_LSP6,
            "hardcoded _INTERFACEID_LSP6 does not match type(ILSP6).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP7() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId = 
            type(ILSP7).interfaceId ^
            type(IERC725Y).interfaceId ^
            calculateInterfaceLSP17Extendable();

        require(
            interfaceId == _INTERFACEID_LSP7,
            "hardcoded _INTERFACEID_LSP7 does not match type(ILSP7).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP8() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId = 
            type(ILSP8).interfaceId ^
            type(IERC725Y).interfaceId ^
            calculateInterfaceLSP17Extendable();

        require(
            interfaceId == _INTERFACEID_LSP8,
            "hardcoded _INTERFACEID_LSP8 does not match type(ILSP8).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP9() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId =
            ILSP9.batchCalls.selector ^
            type(IERC725X).interfaceId ^
            type(IERC725Y).interfaceId ^
            type(ILSP1).interfaceId ^
            calculateInterfaceLSP14() ^
            calculateInterfaceLSP17Extendable();

        require(
            interfaceId == _INTERFACEID_LSP9,
            "hardcoded _INTERFACEID_LSP9 does not match XOR of the functions"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP11() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId = 
            type(ILSP11).interfaceId ^
            type(ILSP25).interfaceId;

        require(
            interfaceId == _INTERFACEID_LSP11,
            "hardcoded _LSP11_INTERFACE_ID does not match XOR of the functions"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP14() public pure returns (bytes4) {
        // prettier-ignore
        bytes4 interfaceId =
            OwnableUnset.owner.selector ^
            type(ILSP14).interfaceId;

        require(
            interfaceId == _INTERFACEID_LSP14,
            "hardcoded _INTERFACEID_LSP14 does not match XOR of the functions"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP17Extendable() public pure returns (bytes4) {
        bytes4 interfaceId = bytes4(keccak256("LSP17Extendable"));

        require(
            interfaceId == _INTERFACEID_LSP17_EXTENDABLE,
            "hardcoded _INTERFACEID_LSP17_EXTENDABLE does not match hash of 'LSP17Extendable'"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP17Extension() public pure returns (bytes4) {
        bytes4 interfaceId = bytes4(keccak256("LSP17Extension"));

        require(
            interfaceId == _INTERFACEID_LSP17_EXTENSION,
            "hardcoded _INTERFACEID_LSP17_EXTENSION does not match hash of 'LSP17Extension'"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP20CallVerification()
        public
        pure
        returns (bytes4)
    {
        bytes4 interfaceId = bytes4(keccak256("LSP20CallVerification"));

        require(
            interfaceId == _INTERFACEID_LSP20_CALL_VERIFICATION,
            "hardcoded _INTERFACEID_LSP20_CALL_VERIFICATION does not match hash of 'LSP20CallVerification'"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP20CallVerifier()
        public
        pure
        returns (bytes4)
    {
        bytes4 interfaceId = type(ILSP20).interfaceId;

        require(
            interfaceId == _INTERFACEID_LSP20_CALL_VERIFIER,
            "hardcoded _INTERFACEID_LSP20_CALL_VERIFIER does not match XOR of the functions"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP25ExecuteRelayCall()
        public
        pure
        returns (bytes4)
    {
        bytes4 interfaceId = type(ILSP25).interfaceId;
        require(
            interfaceId == _INTERFACEID_LSP25,
            "hardcoded _INTERFACEID_LSP25 does not match type(ILSP25).interfaceId"
        );

        return interfaceId;
    }

    function calculateInterfaceLSP26() public pure returns (bytes4) {
        bytes4 interfaceId = type(ILSP26).interfaceId;
        require(
            interfaceId == _INTERFACEID_LSP26,
            "hardcoded _INTERFACEID_LSP26 does not match type(ILSP26).interfaceId"
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

    function calculateInterfaceERC20Metadata() public pure returns (bytes4) {
        return type(IERC20Metadata).interfaceId;
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

/**
 * @dev Used for testing
 */
contract CheckInterface {
    function supportsERC165InterfaceUnchecked(
        address _address,
        bytes4 interfaceId
    ) public view returns (bool) {
        return
            ERC165Checker.supportsERC165InterfaceUnchecked(
                _address,
                interfaceId
            );
    }
}

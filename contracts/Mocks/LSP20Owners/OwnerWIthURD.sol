// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    ILSP1UniversalReceiver
} from "../../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";

import {
    ILSP14Ownable2Step
} from "../../LSP14Ownable2Step/ILSP14Ownable2Step.sol";

import {
    ILSP20CallVerifier
} from "../../LSP20CallVerification/ILSP20CallVerifier.sol";
import {
    _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION,
    _LSP20_VERIFY_CALL_RESULT_SUCCESS_VALUE
} from "../../LSP20CallVerification/LSP20Constants.sol";

contract OwnerWithURD is ILSP20CallVerifier, ILSP1UniversalReceiver {
    address private immutable _OWNED_CONTRACT;

    constructor(address ownedContract) {
        _OWNED_CONTRACT = ownedContract;
    }

    function renounceOwnership() public {
        ILSP14Ownable2Step(_OWNED_CONTRACT).renounceOwnership();
    }

    function acceptOwnership() public {
        ILSP14Ownable2Step(_OWNED_CONTRACT).acceptOwnership();
    }

    function lsp20VerifyCall(
        address,
        address,
        address,
        uint256,
        bytes memory
    ) public pure returns (bytes4 returnedStatus) {
        return _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION;
    }

    function lsp20VerifyCallResult(
        bytes32,
        bytes memory
    ) external pure returns (bytes4) {
        return _LSP20_VERIFY_CALL_RESULT_SUCCESS_VALUE;
    }

    function supportsInterface(bytes4 interfaceId) public pure returns (bool) {
        return interfaceId == type(ILSP1UniversalReceiver).interfaceId;
    }

    function universalReceiver(
        bytes32 typeId,
        bytes memory receivedData
    ) public payable virtual override returns (bytes memory returnedValues) {
        emit UniversalReceiver(
            msg.sender,
            msg.value,
            typeId,
            receivedData,
            returnedValues
        );
    }
}

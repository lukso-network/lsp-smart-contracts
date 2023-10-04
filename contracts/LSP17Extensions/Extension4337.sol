// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.9;

import {_ERC1271_FAILVALUE} from "../LSP0ERC725Account/LSP0Constants.sol";
import {LSP6Utils} from "../LSP6KeyManager/LSP6Utils.sol";
import {ILSP14Ownable2Step} from "../LSP14Ownable2Step/ILSP14Ownable2Step.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {LSP17Extension} from "../LSP17ContractExtension/LSP17Extension.sol";
import {
    ILSP20CallVerifier
} from "../LSP20CallVerification/ILSP20CallVerifier.sol";

import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {
    UserOperation
} from "@account-abstraction/contracts/interfaces/UserOperation.sol";
import {
    IEntryPoint
} from "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import {
    IERC725X
} from "@erc725/smart-contracts/contracts/interfaces/IERC725X.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Extension4337 is LSP17Extension, IAccount {
    using ECDSA for bytes32;

    address public immutable entryPoint;

    // permission needed to be able to use this extension
    bytes32 internal constant _4337_PERMISSION =
        0x0000000000000000000000000000000000000000000000000000000000800000;

    // error code returned when signature or permission validation fails
    uint256 internal constant _SIG_VALIDATION_FAILED = 1;

    constructor(address entryPoint_) {
        entryPoint = entryPoint_;
    }

    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 missingAccountFunds
    ) external returns (uint256) {
        require(
            _extendableMsgSender() == entryPoint,
            "Only EntryPoint contract can call this"
        );

        // recover initiator of the tx from the signature
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address recovered = hash.recover(userOp.signature);

        // fetch address permissions
        bytes32 permissionsRetrieved = LSP6Utils.getPermissionsFor(
            IERC725Y(msg.sender),
            recovered
        );

        // verify that the recovered address has the _4337_PERMISSION
        if (!LSP6Utils.hasPermission(permissionsRetrieved, _4337_PERMISSION)) {
            return _SIG_VALIDATION_FAILED;
        }

        // retrieve owner from caller
        address owner = LSP14Ownable2Step(msg.sender).owner();

        // verify that the recovered address can execute the userOp.callData
        bytes4 magicValue = ILSP20CallVerifier(owner).lsp20VerifyCall(
            msg.sender,
            recovered,
            0,
            userOp.callData
        );

        // if the call verifier returns _ERC1271_FAILVALUE, the caller is not authorized to make this call
        if (_ERC1271_FAILVALUE == magicValue) {
            return _SIG_VALIDATION_FAILED;
        }

        // if entryPoint is missing funds to pay for the tx, deposit funds
        if (missingAccountFunds > 0) {
            // deposit bytes to entryPoint
            bytes memory depositToBytes = abi.encodeWithSignature(
                "depositTo(uint256)",
                missingAccountFunds
            );

            // send funds from Universal Profile to entryPoint
            IERC725X(msg.sender).execute(
                0,
                entryPoint,
                missingAccountFunds,
                depositToBytes
            );
        }

        // if sig validation passed, return 0
        return 0;
    }
}

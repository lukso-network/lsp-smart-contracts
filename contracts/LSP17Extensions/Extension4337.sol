// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// interfaces
import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    ILSP20CallVerifier
} from "../LSP20CallVerification/ILSP20CallVerifier.sol";

// modules
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {LSP17Extension} from "../LSP17ContractExtension/LSP17Extension.sol";

// librairies
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {LSP6Utils} from "../LSP6KeyManager/LSP6Utils.sol";

// constants
import {
    UserOperation
} from "@account-abstraction/contracts/interfaces/UserOperation.sol";

contract Extension4337 is LSP17Extension, IAccount {
    using ECDSA for bytes32;
    using LSP6Utils for *;

    address internal immutable _ENTRY_POINT;

    // permission needed to be able to use this extension
    bytes32 internal constant _4337_PERMISSION =
        0x0000000000000000000000000000000000000000000000000000000000800000;

    // error code returned when signature or permission validation fails
    uint256 internal constant _SIG_VALIDATION_FAILED = 1;

    constructor(address entryPoint_) {
        _ENTRY_POINT = entryPoint_;
    }

    /**
     * @inheritdoc IAccount
     */
    function validateUserOp(
        UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 /* missingAccountFunds */
    ) external returns (uint256) {
        require(
            _extendableMsgSender() == _ENTRY_POINT,
            "Only EntryPoint contract can call this"
        );

        // recover initiator of the tx from the signature
        bytes32 hash = userOpHash.toEthSignedMessageHash();
        address recovered = hash.recover(userOp.signature);

        // verify that the recovered address has the _4337_PERMISSION
        if (
            !LSP6Utils.hasPermission(
                IERC725Y(msg.sender).getPermissionsFor(recovered),
                _4337_PERMISSION
            )
        ) {
            return _SIG_VALIDATION_FAILED;
        }

        // retrieve owner from caller
        address owner = LSP14Ownable2Step(msg.sender).owner();

        // verify that the recovered address can execute the userOp.callData
        bytes4 returnedStatus = ILSP20CallVerifier(owner).lsp20VerifyCall({
            requestor: _ENTRY_POINT,
            target: msg.sender,
            caller: recovered,
            value: 0,
            callData: userOp.callData
        });

        // if the returnedStatus is a value different than the success value, return signature validation failed
        if (
            bytes3(returnedStatus) !=
            bytes3(ILSP20CallVerifier.lsp20VerifyCall.selector)
        ) {
            return _SIG_VALIDATION_FAILED;
        }

        // if sig validation passed, return 0
        return 0;
    }

    /**
     * @dev Get the address of the Entry Point contract that will execute the user operation.
     * @return The address of the EntryPoint contract
     */
    function entryPoint() public view returns (address) {
        return _ENTRY_POINT;
    }
}

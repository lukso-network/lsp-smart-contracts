// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.12;

// interfaces
import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";
import {
    ILSP20CallVerifier
} from "@lukso/lsp20-contracts/contracts/ILSP20CallVerifier.sol";

// modules
import {
    LSP14Ownable2Step
} from "@lukso/lsp14-contracts/contracts/LSP14Ownable2Step.sol";
import {
    LSP17Extension
} from "@lukso/lsp17contractextension-contracts/contracts/LSP17Extension.sol";

// librairies
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {LSP6Utils} from "@lukso/lsp6-contracts/contracts/LSP6Utils.sol";

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
     * @dev Validate user's signature and nonce.
     * The entryPoint will make the call to the recipient only if this validation call returns successfully.
     * Signature failure should be reported by returning `SIG_VALIDATION_FAILED` (`1`).
     * This allows making a "simulation call" without a valid signature.
     * Other failures (_e.g. nonce mismatch, or invalid signature format_) should still revert to signal failure.
     *
     * The third parameter (not mentioned but `missingAccountFunds` from the `IAccount` interface)
     * describes the missing funds on the account's deposit in the entrypoint.
     * This is the minimum amount to transfer to the sender(entryPoint) to be able to make the call.
     * The excess is left as a deposit in the entrypoint, for future calls. Can be withdrawn anytime using "entryPoint.withdrawTo()"
     * In case there is a paymaster in the request (or the current deposit is high enough), this value will be zero.
     *
     * @return validationData packaged ValidationData structure. use `_packValidationData` and `_unpackValidationData` to encode and decode
     * - `<20-byte>` sigAuthorizer - 0 for valid signature, 1 to mark signature failure, otherwise, an address of an "authorizer" contract.
     * - `<6-byte>` validUntil - last timestamp this operation is valid. 0 for "indefinite"
     * - `<6-byte>` validAfter - first timestamp this operation is valid
     * If an account doesn't use time-range, it is enough to return SIG_VALIDATION_FAILED value (1) for signature failure.
     * Note that the validation code cannot use block.timestamp (or block.number) directly.
     *
     * @custom:info In addition to the logic of the `IAccount` interface from 4337, the permissions of the address that signed the user operation
     * are checked to ensure that it has the permission `_4337_PERMISSION`.
     *
     * @custom:requirements
     * - caller MUST be the **entrypoint contract**.
     * - the signature and nonce must be valid.
     *
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

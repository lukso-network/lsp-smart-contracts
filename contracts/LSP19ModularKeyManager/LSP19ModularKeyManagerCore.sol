// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.5;

// interfaces
import {IERC1271} from "@openzeppelin/contracts/interfaces/IERC1271.sol";

// modules
import {LSP6KeyManagerCore} from "../LSP6KeyManager/LSP6KeyManagerCore.sol";
import {LSP14Ownable2Step} from "../LSP14Ownable2Step/LSP14Ownable2Step.sol";
import {ERC725Y} from "@erc725/smart-contracts/contracts/ERC725Y.sol";

// libraries
import {GasLib} from "../Utils/GasLib.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {LSP6Utils} from "../LSP6KeyManager/LSP6Utils.sol";
import {LSP2Utils} from "../LSP2ERC725YJSONSchema/LSP2Utils.sol";
import {EIP191Signer} from "../Custom/EIP191Signer.sol";

// errors
import "../LSP6KeyManager/LSP6Errors.sol";
import "./LSP19Errors.sol";

// constants
import "../LSP6KeyManager/LSP6Constants.sol";
import "./LSP19Constants.sol";
import {
    SETDATA_SELECTOR,
    SETDATA_ARRAY_SELECTOR,
    EXECUTE_SELECTOR
} from "@erc725/smart-contracts/contracts/constants.sol";
import {
    _INTERFACEID_ERC1271,
    _ERC1271_MAGICVALUE,
    _ERC1271_FAILVALUE
} from "../LSP0ERC725Account/LSP0Constants.sol";

/**
 * @title Core implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev all the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP19ModularKeyManagerCore is LSP6KeyManagerCore {
    using LSP6Utils for *;

    function _verifyPermissions(address from, bytes calldata payload) internal view override {
        bytes32 permissions = ERC725Y(target).getPermissionsFor(from);
        bytes memory methodLogicModule = ERC725Y(target).getData(
            bytes32(bytes.concat(_LSP19KEY_MODULEADDRESS_PREFIX, bytes18(0), bytes4(payload)))
        );
        if (methodLogicModule.length == 20) {
            bytes memory verifyPermissionsPayload = abi.encodeWithSignature(
                "verifyMethodLogic(address,address,bytes32,bytes)",
                target,
                from,
                permissions,
                payload
            );
            (bool success, bytes memory returnData) = address(bytes20(methodLogicModule))
                .staticcall(verifyPermissionsPayload);
            Address.verifyCallResult(
                success,
                returnData,
                "LSP19ModularKeyManager: method permissions verification failed"
            );
        } else {
            revert LSP19MethodPermissionsModuleMissing(bytes4(payload));
        }
    }
}

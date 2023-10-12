// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import "@openzeppelin/contracts/utils/Create2.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {
    LSP0ERC725AccountInit
} from "./LSP0ERC725Account/LSP0ERC725AccountInit.sol";
import {
    _PERMISSION_CHANGEOWNER,
    ALL_REGULAR_PERMISSIONS,
    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX
} from "./LSP6KeyManager/LSP6Constants.sol";
import {
    LSP6KeyManagerSingleton
} from "./LSP6KeyManager/LSP6KeyManagerSingleton.sol";
import {LSP6Utils} from "./LSP6KeyManager/LSP6Utils.sol";
import {
    _LSP17_EXTENSION_PREFIX
} from "./LSP17ContractExtension/LSP17Constants.sol";
import {IAccount} from "@account-abstraction/contracts/interfaces/IAccount.sol";

/**
 * A wrapper factory contract to deploy GnosisSafe as an ERC-4337 account contract.
 */
contract UniversalProfile4337Factory {
    bytes32 private constant _4337_PERMISSION;

    function createAccount(
        address implementationContract,
        address keyManagerSingleton,
        address mainController,
        address extension4337,
        uint256 salt
    ) public returns (address) {
        address universalProfileAddress = Clones.cloneDeterministic(
            implementationContract,
            keccak256(abi.encodePacked(mainController, salt))
        );

        // put this contract as the owner of the new account
        LSP0ERC725AccountInit(universalProfileAddress).initialize(
            address(this)
        );

        // set data to give accept ownership to this controller and all permission to main controller
        LSP0ERC725AccountInit(universalProfileAddress).setDataBatch(
            [
                abi.encodePacked(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    mainController
                ),
                abi.encodePacked(
                    _LSP17_EXTENSION_PREFIX,
                    bytes2(0),
                    IAccount.validateUserOp.selector,
                    bytes16(0)
                )
            ],
            [
                LSP6Utils.combinePermissions(
                    [ALL_REGULAR_PERMISSIONS, _4337_PERMISSION]
                ),
                extension4337
            ]
        );

        // transfer ownership to key manager
        LSP0ERC725AccountInit(universalProfileAddress).transferOwnership(
            keyManagerSingleton
        );

        // accept ownership from key manager
        LSP6KeyManagerSingleton(keyManagerSingleton).execute(
            target_,
            LSP0ERC725AccountInit.acceptOwnership.selector
        );

        // remove address(this) as controller

        return universalProfileAddress;
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     * (uses the same "create2 signature" used by GnosisSafeProxyFactory.createProxyWithNonce)
     */
    function getAddress(
        address owner,
        uint256 salt
    ) public view returns (address) {
        bytes memory initializer = getInitializer(owner);
        //copied from deployProxyWithNonce
        bytes32 salt2 = keccak256(
            abi.encodePacked(keccak256(initializer), salt)
        );
        bytes memory deploymentData = abi.encodePacked(
            proxyFactory.proxyCreationCode(),
            uint256(uint160(safeSingleton))
        );
        return
            Create2.computeAddress(
                bytes32(salt2),
                keccak256(deploymentData),
                address(proxyFactory)
            );
    }
}

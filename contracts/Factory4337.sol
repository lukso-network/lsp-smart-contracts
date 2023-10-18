// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {
    LSP0ERC725AccountInit
} from "./LSP0ERC725Account/LSP0ERC725AccountInit.sol";
import {
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
import {ILSP14Ownable2Step} from "./LSP14Ownable2Step/ILSP14Ownable2Step.sol";

import {
    IStakeManager
} from "@account-abstraction/contracts/interfaces/IStakeManager.sol";

/**
 * A wrapper factory contract to deploy Universal Profile as an ERC-4337 account contract.
 */
contract UniversalProfile4337Factory is Ownable {
    bytes32 private constant _4337_PERMISSION =
        0x0000000000000000000000000000000000000000000000000000000000800000;

    constructor(address owner_) {
        transferOwnership(owner_);
    }

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
        LSP0ERC725AccountInit(payable(universalProfileAddress)).initialize(
            address(this)
        );

        // combine all permissions & _4337_PERMISSION
        bytes32[] memory dynamicRegularAnd4337Permission = new bytes32[](2);
        dynamicRegularAnd4337Permission[0] = ALL_REGULAR_PERMISSIONS;
        dynamicRegularAnd4337Permission[1] = _4337_PERMISSION;
        bytes32 mainControllerPermission = LSP6Utils.combinePermissions(
            dynamicRegularAnd4337Permission
        );

        // set data to give all permissions to this contract, set 4337 extension to UP and give all permission to main controller
        bytes32[] memory keys = new bytes32[](3);
        bytes[] memory values = new bytes[](3);

        keys[0] = bytes32(
            abi.encodePacked(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes2(0),
                mainController
            )
        );
        keys[1] = bytes32(
            abi.encodePacked(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes2(0),
                address(this)
            )
        );
        keys[2] = bytes32(
            abi.encodePacked(
                _LSP17_EXTENSION_PREFIX,
                bytes2(0),
                IAccount.validateUserOp.selector,
                bytes16(0)
            )
        );

        values[0] = abi.encodePacked(mainControllerPermission);
        values[1] = abi.encodePacked(ALL_REGULAR_PERMISSIONS);
        values[2] = abi.encodePacked(extension4337);

        LSP0ERC725AccountInit(payable(universalProfileAddress)).setDataBatch(
            keys,
            values
        );

        // transfer ownership to key manager
        LSP0ERC725AccountInit(payable(universalProfileAddress))
            .transferOwnership(keyManagerSingleton);

        // accept ownership from key manager
        LSP6KeyManagerSingleton(keyManagerSingleton).execute(
            universalProfileAddress,
            abi.encodePacked(ILSP14Ownable2Step.acceptOwnership.selector)
        );

        // remove address(this) as controller
        LSP0ERC725AccountInit(payable(universalProfileAddress)).setData(
            bytes32(
                abi.encodePacked(
                    _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                    bytes2(0),
                    address(this)
                )
            ),
            ""
        );

        return universalProfileAddress;
    }

    function addStake(
        address entryPoint,
        uint32 delay
    ) public payable onlyOwner {
        IStakeManager(entryPoint).addStake{value: msg.value}(delay);
    }

    function unlockStake() public onlyOwner {
        IStakeManager(msg.sender).unlockStake();
    }

    function withdrawStake(
        address entryPoint,
        address stakeReceiver
    ) public onlyOwner {
        IStakeManager(entryPoint).withdrawStake(payable(stakeReceiver));
    }

    /**
     * calculate the counterfactual address of this account as it would be returned by createAccount()
     */
    function getAddress(
        address implementationContract,
        address mainController,
        uint256 salt
    ) public view returns (address) {
        return
            Clones.predictDeterministicAddress(
                implementationContract,
                keccak256(abi.encodePacked(mainController, salt))
            );
    }
}

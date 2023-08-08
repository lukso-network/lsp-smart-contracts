// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IPostDeploymentModule} from "./IPostDeploymentModule.sol";
import {ILinkedContractsFactory} from "./ILinkedContractsFactory.sol";
import {
    InvalidValueSum,
    PrimaryContractProxyInitFailureError,
    SecondaryContractProxyInitFailureError
} from "./LSP23Errors.sol";

contract LinkedContractsFactory is ILinkedContractsFactory {
    /**
     * @inheritdoc ILinkedContractsFactory
     */
    function deployContracts(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        payable
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        )
    {
        /* check that the msg.value is equal to the sum of the values of the primary and secondary contracts */
        if (
            msg.value !=
            primaryContractDeployment.fundingAmount +
                secondaryContractDeployment.fundingAmount
        ) {
            revert InvalidValueSum();
        }

        primaryContractAddress = _deployPrimaryContract(
            primaryContractDeployment,
            secondaryContractDeployment,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        secondaryContractAddress = _deploySecondaryContract(
            secondaryContractDeployment,
            primaryContractAddress
        );

        emit DeployedContracts(
            primaryContractAddress,
            secondaryContractAddress,
            primaryContractDeployment,
            secondaryContractDeployment,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        /* execute the post deployment module logic in the postDeploymentModule */
        IPostDeploymentModule(postDeploymentModule).executePostDeployment(
            primaryContractAddress,
            secondaryContractAddress,
            postDeploymentModuleCalldata
        );
    }

    /**
     * @inheritdoc ILinkedContractsFactory
     */
    function deployERC1167Proxies(
        PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
        SecondaryContractDeploymentInit
            calldata secondaryContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        payable
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        )
    {
        /* check that the msg.value is equal to the sum of the values of the primary and secondary contracts */
        if (
            msg.value !=
            primaryContractDeploymentInit.fundingAmount +
                secondaryContractDeploymentInit.fundingAmount
        ) {
            revert InvalidValueSum();
        }

        /* deploy the primary contract proxy with the primaryContractGeneratedSalt */
        primaryContractAddress = _deployAndInitializePrimaryContractProxy(
            primaryContractDeploymentInit,
            secondaryContractDeploymentInit,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        /* deploy the secondary contract proxy */
        secondaryContractAddress = _deployAndInitializeSecondaryContractProxy(
            secondaryContractDeploymentInit,
            primaryContractAddress
        );

        emit DeployedERC1167Proxies(
            primaryContractAddress,
            secondaryContractAddress,
            primaryContractDeploymentInit,
            secondaryContractDeploymentInit,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        /* execute the post deployment logic in the postDeploymentModule */
        IPostDeploymentModule(postDeploymentModule).executePostDeployment(
            primaryContractAddress,
            secondaryContractAddress,
            postDeploymentModuleCalldata
        );
    }

    /**
     * @inheritdoc ILinkedContractsFactory
     */
    function computeAddresses(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        view
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        )
    {
        bytes32 primaryContractGeneratedSalt = _generatePrimaryContractSalt(
            primaryContractDeployment,
            secondaryContractDeployment,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        primaryContractAddress = Create2.computeAddress(
            primaryContractGeneratedSalt,
            keccak256(primaryContractDeployment.creationBytecode)
        );

        bytes memory secondaryContractByteCodeWithAllParams;
        if (secondaryContractDeployment.addPrimaryContractAddress) {
            secondaryContractByteCodeWithAllParams = abi.encodePacked(
                secondaryContractDeployment.creationBytecode,
                abi.encode(primaryContractAddress),
                secondaryContractDeployment.extraConstructorParams
            );
        } else {
            secondaryContractByteCodeWithAllParams = secondaryContractDeployment
                .creationBytecode;
        }

        secondaryContractAddress = Create2.computeAddress(
            keccak256(abi.encodePacked(primaryContractAddress)),
            keccak256(secondaryContractByteCodeWithAllParams)
        );
    }

    /**
     * @inheritdoc ILinkedContractsFactory
     */
    function computeERC1167Addresses(
        PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
        SecondaryContractDeploymentInit
            calldata secondaryContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        view
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        )
    {
        bytes32 primaryContractGeneratedSalt = _generatePrimaryContractProxySalt(
                primaryContractDeploymentInit,
                secondaryContractDeploymentInit,
                postDeploymentModule,
                postDeploymentModuleCalldata
            );

        primaryContractAddress = Clones.predictDeterministicAddress(
            primaryContractDeploymentInit.implementationContract,
            primaryContractGeneratedSalt
        );

        secondaryContractAddress = Clones.predictDeterministicAddress(
            secondaryContractDeploymentInit.implementationContract,
            keccak256(abi.encodePacked(primaryContractAddress))
        );
    }

    function _deployPrimaryContract(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal returns (address primaryContractAddress) {
        bytes32 primaryContractGeneratedSalt = _generatePrimaryContractSalt(
            primaryContractDeployment,
            secondaryContractDeployment,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        /* deploy the primary contract */
        primaryContractAddress = Create2.deploy(
            primaryContractDeployment.fundingAmount,
            primaryContractGeneratedSalt,
            primaryContractDeployment.creationBytecode
        );
    }

    function _deploySecondaryContract(
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address primaryContractAddress
    ) internal returns (address secondaryContractAddress) {
        /**
         * If `addPrimaryContractAddress` is `true`, the following will be appended to the constructor params:
         * - The primary contract address
         * - `extraConstructorParams`
         */
        bytes memory secondaryContractByteCode = secondaryContractDeployment
            .creationBytecode;

        if (secondaryContractDeployment.addPrimaryContractAddress) {
            secondaryContractByteCode = abi.encodePacked(
                secondaryContractByteCode,
                abi.encode(primaryContractAddress),
                secondaryContractDeployment.extraConstructorParams
            );
        }

        secondaryContractAddress = Create2.deploy(
            secondaryContractDeployment.fundingAmount,
            keccak256(abi.encodePacked(primaryContractAddress)),
            secondaryContractByteCode
        );
    }

    function _deployAndInitializePrimaryContractProxy(
        PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
        SecondaryContractDeploymentInit
            calldata secondaryContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal returns (address primaryContractAddress) {
        bytes32 primaryContractGeneratedSalt = _generatePrimaryContractProxySalt(
                primaryContractDeploymentInit,
                secondaryContractDeploymentInit,
                postDeploymentModule,
                postDeploymentModuleCalldata
            );

        /* deploy the primary contract proxy with the primaryContractGeneratedSalt */
        primaryContractAddress = Clones.cloneDeterministic(
            primaryContractDeploymentInit.implementationContract,
            primaryContractGeneratedSalt
        );

        /* initialize the primary contract proxy */
        (bool success, bytes memory returnedData) = primaryContractAddress.call{
            value: msg.value
        }(primaryContractDeploymentInit.initializationCalldata);
        if (!success) {
            revert PrimaryContractProxyInitFailureError(returnedData);
        }
    }

    function _deployAndInitializeSecondaryContractProxy(
        SecondaryContractDeploymentInit
            calldata secondaryContractDeploymentInit,
        address primaryContractAddress
    ) internal returns (address secondaryContractAddress) {
        /* deploy the secondary contract proxy with the primaryContractGeneratedSalt */
        secondaryContractAddress = Clones.cloneDeterministic(
            secondaryContractDeploymentInit.implementationContract,
            keccak256(abi.encodePacked(primaryContractAddress))
        );

        /**
         * If `addPrimaryContractAddress` is `true`, the following will be appended to the `initializationCalldata`:
         * - The primary contract address
         * - `extraInitialisationBytes`
         */
        bytes
            memory secondaryInitializationBytes = secondaryContractDeploymentInit
                .initializationCalldata;

        if (secondaryContractDeploymentInit.addPrimaryContractAddress) {
            secondaryInitializationBytes = abi.encodePacked(
                secondaryInitializationBytes,
                abi.encode(primaryContractAddress),
                secondaryContractDeploymentInit.extraInitializationParams
            );
        }

        /* initialize the primary contract proxy */
        (bool success, bytes memory returnedData) = secondaryContractAddress
            .call{value: msg.value}(secondaryInitializationBytes);
        if (!success) {
            revert SecondaryContractProxyInitFailureError(returnedData);
        }
    }

    function _generatePrimaryContractSalt(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal pure virtual returns (bytes32 primaryContractGeneratedSalt) {
        /* generate salt for the primary contract
         *  the salt is generated by hashing the following elements:
         *   - the salt
         *   - the secondary contract bytecode
         *   - the secondary addPrimaryContractAddress boolean
         *   - the secondary extraConstructorParams
         *   - the postDeploymentModule address
         *   - the postDeploymentModuleCalldata
         *
         */
        primaryContractGeneratedSalt = keccak256(
            abi.encode(
                primaryContractDeployment.salt,
                secondaryContractDeployment.creationBytecode,
                secondaryContractDeployment.addPrimaryContractAddress,
                secondaryContractDeployment.extraConstructorParams,
                postDeploymentModule,
                postDeploymentModuleCalldata
            )
        );
    }

    function _generatePrimaryContractProxySalt(
        PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
        SecondaryContractDeploymentInit
            calldata secondaryContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        internal
        pure
        virtual
        returns (bytes32 primaryContractProxyGeneratedSalt)
    {
        /**
         * Generate the salt for the primary contract
         * The salt is generated by hashing the following elements:
         *  - the salt
         *  - the secondary implementation contract address
         *  - the secondary contract addPrimaryContractAddress boolean
         *  - the secondary contract initialization calldata
         *  - the secondary contract extra initialization params (if any)
         *  - the postDeploymentModule address
         *  - the callda to the post deployment module
         *
         */
        primaryContractProxyGeneratedSalt = keccak256(
            abi.encode(
                primaryContractDeploymentInit.salt,
                secondaryContractDeploymentInit.implementationContract,
                secondaryContractDeploymentInit.initializationCalldata,
                secondaryContractDeploymentInit.addPrimaryContractAddress,
                secondaryContractDeploymentInit.extraInitializationParams,
                postDeploymentModule,
                postDeploymentModuleCalldata
            )
        );
    }
}

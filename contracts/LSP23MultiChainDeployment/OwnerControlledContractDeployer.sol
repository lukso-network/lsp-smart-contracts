// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import {IPostDeploymentModule} from "./IPostDeploymentModule.sol";
import {
    IOwnerControlledContractDeployer
} from "./IOwnerControlledContractDeployer.sol";
import {
    InvalidValueSum,
    ControlledContractProxyInitFailureError,
    OwnerContractProxyInitFailureError
} from "./LSP23Errors.sol";

contract OwnerControlledContractDeployer is IOwnerControlledContractDeployer {
    /**
     * @inheritdoc IOwnerControlledContractDeployer
     */
    function deployContracts(
        ControlledContractDeployment calldata controlledContractDeployment,
        OwnerContractDeployment calldata ownerContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        payable
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        )
    {
        /* check that the msg.value is equal to the sum of the values of the controlled and owner contracts */
        if (
            msg.value !=
            controlledContractDeployment.fundingAmount +
                ownerContractDeployment.fundingAmount
        ) {
            revert InvalidValueSum();
        }

        controlledContractAddress = _deployControlledContract(
            controlledContractDeployment,
            ownerContractDeployment,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        ownerContractAddress = _deployOwnerContract(
            ownerContractDeployment,
            controlledContractAddress
        );

        emit DeployedContracts(
            controlledContractAddress,
            ownerContractAddress,
            controlledContractDeployment,
            ownerContractDeployment,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        /* execute the post deployment module logic in the postDeploymentModule */
        IPostDeploymentModule(postDeploymentModule).executePostDeployment(
            controlledContractAddress,
            ownerContractAddress,
            postDeploymentModuleCalldata
        );
    }

    /**
     * @inheritdoc IOwnerControlledContractDeployer
     */
    function deployERC1167Proxies(
        ControlledContractDeploymentInit
            calldata controlledContractDeploymentInit,
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        payable
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        )
    {
        /* check that the msg.value is equal to the sum of the values of the controlled and owner contracts */
        if (
            msg.value !=
            controlledContractDeploymentInit.fundingAmount +
                ownerContractDeploymentInit.fundingAmount
        ) {
            revert InvalidValueSum();
        }

        /* deploy the controlled contract proxy with the controlledContractGeneratedSalt */
        controlledContractAddress = _deployAndInitializeControlledContractProxy(
            controlledContractDeploymentInit,
            ownerContractDeploymentInit,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        /* deploy the owner contract proxy */
        ownerContractAddress = _deployAndInitializeOwnerContractProxy(
            ownerContractDeploymentInit,
            controlledContractAddress
        );

        emit DeployedERC1167Proxies(
            controlledContractAddress,
            ownerContractAddress,
            controlledContractDeploymentInit,
            ownerContractDeploymentInit,
            postDeploymentModule,
            postDeploymentModuleCalldata
        );

        /* execute the post deployment logic in the postDeploymentModule */
        IPostDeploymentModule(postDeploymentModule).executePostDeployment(
            controlledContractAddress,
            ownerContractAddress,
            postDeploymentModuleCalldata
        );
    }

    /**
     * @inheritdoc IOwnerControlledContractDeployer
     */
    function computeAddresses(
        ControlledContractDeployment calldata controlledContractDeployment,
        OwnerContractDeployment calldata ownerContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        )
    {
        bytes32 controlledContractGeneratedSalt = _generateControlledContractSalt(
                controlledContractDeployment,
                ownerContractDeployment,
                postDeploymentModule,
                postDeploymentModuleCalldata
            );

        controlledContractAddress = Create2.computeAddress(
            controlledContractGeneratedSalt,
            keccak256(controlledContractDeployment.creationBytecode)
        );

        bytes memory ownerContractByteCodeWithAllParams;
        if (ownerContractDeployment.addControlledContractAddress) {
            ownerContractByteCodeWithAllParams = abi.encodePacked(
                ownerContractDeployment.creationBytecode,
                abi.encode(controlledContractAddress),
                ownerContractDeployment.extraConstructorParams
            );
        } else {
            ownerContractByteCodeWithAllParams = ownerContractDeployment
                .creationBytecode;
        }

        ownerContractAddress = Create2.computeAddress(
            keccak256(abi.encodePacked(controlledContractAddress)),
            keccak256(ownerContractByteCodeWithAllParams)
        );
    }

    /**
     * @inheritdoc IOwnerControlledContractDeployer
     */
    function computeERC1167Addresses(
        ControlledContractDeploymentInit
            calldata controlledContractDeploymentInit,
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        )
    {
        bytes32 controlledContractGeneratedSalt = _generateControlledProxyContractSalt(
                controlledContractDeploymentInit,
                ownerContractDeploymentInit,
                postDeploymentModule,
                postDeploymentModuleCalldata
            );

        controlledContractAddress = Clones.predictDeterministicAddress(
            controlledContractDeploymentInit.implementationContract,
            controlledContractGeneratedSalt
        );

        ownerContractAddress = Clones.predictDeterministicAddress(
            ownerContractDeploymentInit.implementationContract,
            keccak256(abi.encodePacked(controlledContractAddress))
        );
    }

    function _deployControlledContract(
        ControlledContractDeployment calldata controlledContractDeployment,
        OwnerContractDeployment calldata ownerContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal returns (address controlledContractAddress) {
        bytes32 controlledContractGeneratedSalt = _generateControlledContractSalt(
                controlledContractDeployment,
                ownerContractDeployment,
                postDeploymentModule,
                postDeploymentModuleCalldata
            );

        /* deploy the controlled contract */
        controlledContractAddress = Create2.deploy(
            controlledContractDeployment.fundingAmount,
            controlledContractGeneratedSalt,
            controlledContractDeployment.creationBytecode
        );
    }

    function _deployOwnerContract(
        OwnerContractDeployment calldata ownerContractDeployment,
        address controlledContractAddress
    ) internal returns (address ownerContractAddress) {
        /**
         * If `addControlledContractAddress` is `true`, we will be appended to the constructor params:
         * - The controlled contract address
         * - `extraConstructorParams`
         */
        bytes memory ownerContractByteCode = ownerContractDeployment
            .creationBytecode;

        if (ownerContractDeployment.addControlledContractAddress) {
            ownerContractByteCode = abi.encodePacked(
                ownerContractByteCode,
                abi.encode(controlledContractAddress),
                ownerContractDeployment.extraConstructorParams
            );
        }

        /* Here owner refers to the future owner of the controlled contract at the end of the transaction */
        ownerContractAddress = Create2.deploy(
            ownerContractDeployment.fundingAmount,
            keccak256(abi.encodePacked(controlledContractAddress)),
            ownerContractByteCode
        );
    }

    function _deployAndInitializeControlledContractProxy(
        ControlledContractDeploymentInit
            calldata controlledContractDeploymentInit,
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal returns (address controlledContractAddress) {
        bytes32 controlledContractGeneratedSalt = _generateControlledProxyContractSalt(
                controlledContractDeploymentInit,
                ownerContractDeploymentInit,
                postDeploymentModule,
                postDeploymentModuleCalldata
            );

        /* deploy the controlled contract proxy with the controlledContractGeneratedSalt */
        controlledContractAddress = Clones.cloneDeterministic(
            controlledContractDeploymentInit.implementationContract,
            controlledContractGeneratedSalt
        );

        /* initialize the controlled contract proxy */
        (bool success, bytes memory returnedData) = controlledContractAddress
            .call{value: msg.value}(
            controlledContractDeploymentInit.initializationCalldata
        );
        if (!success) {
            revert ControlledContractProxyInitFailureError(returnedData);
        }
    }

    function _deployAndInitializeOwnerContractProxy(
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address controlledContractAddress
    ) internal returns (address ownerContractAddress) {
        /* deploy the controlled contract proxy with the controlledContractGeneratedSalt */
        ownerContractAddress = Clones.cloneDeterministic(
            ownerContractDeploymentInit.implementationContract,
            keccak256(abi.encodePacked(controlledContractAddress))
        );

        /**
         * If `addControlledContractAddress` is `true`, we will be appended to the `initializationCalldata`:
         * - The controlled contract address
         * - `extraInitialisationBytes`
         */
        bytes memory ownerInitializationBytes = ownerContractDeploymentInit
            .initializationCalldata;

        if (ownerContractDeploymentInit.addControlledContractAddress) {
            ownerInitializationBytes = abi.encodePacked(
                ownerInitializationBytes,
                abi.encode(controlledContractAddress),
                ownerContractDeploymentInit.extraInitializationParams
            );
        }

        /* initialize the controlled contract proxy */
        (bool success, bytes memory returnedData) = ownerContractAddress.call{
            value: msg.value
        }(ownerInitializationBytes);
        if (!success) {
            revert OwnerContractProxyInitFailureError(returnedData);
        }
    }

    function _generateControlledContractSalt(
        ControlledContractDeployment calldata controlledContractDeployment,
        OwnerContractDeployment calldata ownerContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal pure virtual returns (bytes32 controlledContractGeneratedSalt) {
        /* generate salt for the controlled contract
         *  the salt is generated by hashing the following elements:
         *   - the salt
         *   - the owner contract bytecode
         *   - the owner addControlledContractAddress boolean
         *   - the owner extraConstructorParams
         *   - the postDeploymentModule address
         *   - the postDeploymentModuleCalldata
         *
         */
        controlledContractGeneratedSalt = keccak256(
            abi.encode(
                controlledContractDeployment.salt,
                controlledContractDeployment.creationBytecode,
                ownerContractDeployment.creationBytecode,
                ownerContractDeployment.addControlledContractAddress,
                ownerContractDeployment.extraConstructorParams,
                postDeploymentModule,
                postDeploymentModuleCalldata
            )
        );
    }

    function _generateControlledProxyContractSalt(
        ControlledContractDeploymentInit
            calldata controlledContractDeploymentInit,
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        internal
        pure
        virtual
        returns (bytes32 controlledProxyContractGeneratedSalt)
    {
        /**
         * Generate the salt for the controlled contract
         * The salt is generated by hashing the following elements:
         *  - the salt
         *  - the owner implementation contract address
         *  - the owner contract addControlledContractAddress boolean
         *  - the owner contract initialization calldata
         *  - the owner contract extra initialization params (if any)
         *  - the postDeploymentModule address
         *  - the callda to the post deployment module
         *
         */
        controlledProxyContractGeneratedSalt = keccak256(
            abi.encode(
                controlledContractDeploymentInit.salt,
                ownerContractDeploymentInit.implementationContract,
                ownerContractDeploymentInit.initializationCalldata,
                ownerContractDeploymentInit.addControlledContractAddress,
                ownerContractDeploymentInit.extraInitializationParams,
                postDeploymentModule,
                postDeploymentModuleCalldata
            )
        );
    }
}

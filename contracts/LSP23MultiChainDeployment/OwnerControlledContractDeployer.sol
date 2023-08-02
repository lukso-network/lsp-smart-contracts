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
    OwnerProxyInitFailureError
} from "./LSP23Errors.sol";

contract OwnerControlledContractDeployer is IOwnerControlledContractDeployer {
    /*
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
            controlledContractDeployment.value + ownerContractDeployment.value
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

        /* execute the post deployment module logic in the postDeploymentModule */
        IPostDeploymentModule(postDeploymentModule).executePostDeployment(
            controlledContractAddress,
            ownerContractAddress,
            postDeploymentModuleCalldata
        );

        emit PostDeployment(postDeploymentModule, postDeploymentModuleCalldata);
    }

    /*
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
            controlledContractDeploymentInit.value +
                ownerContractDeploymentInit.value
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
        ownerContractAddress = _deployAndInitializeOwnerControlledProxy(
            ownerContractDeploymentInit,
            controlledContractAddress
        );

        /* execute the post deployment logic in the postDeploymentModule */
        IPostDeploymentModule(postDeploymentModule).executePostDeployment(
            controlledContractAddress,
            ownerContractAddress,
            postDeploymentModuleCalldata
        );

        emit PostDeployment(postDeploymentModule, postDeploymentModuleCalldata);
    }

    /*
     * @inheritdoc IOwnerControlledContractDeployer
     */
    function computeAddresses(
        bytes32 salt,
        bytes memory controlledContractCreationByteCode,
        bytes memory ownerContractCreationByteCode,
        bool addControlledContractAddress,
        bytes memory extraConstructorParams,
        address postDeploymentModule,
        bytes memory postDeploymentModuleCalldata
    )
        public
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        )
    {
        bytes32 controlledContractGeneratedSalt = keccak256(
            abi.encode(
                salt,
                controlledContractCreationByteCode,
                ownerContractCreationByteCode,
                addControlledContractAddress,
                extraConstructorParams,
                postDeploymentModule,
                postDeploymentModuleCalldata
            )
        );

        controlledContractAddress = Create2.computeAddress(
            controlledContractGeneratedSalt,
            keccak256(controlledContractCreationByteCode)
        );

        bytes memory ownerContractByteCodeWithAllParams;
        if (addControlledContractAddress) {
            ownerContractByteCodeWithAllParams = abi.encodePacked(
                ownerContractCreationByteCode,
                abi.encode(controlledContractAddress),
                extraConstructorParams
            );
        } else {
            ownerContractByteCodeWithAllParams = ownerContractCreationByteCode;
        }

        ownerContractAddress = Create2.computeAddress(
            keccak256(abi.encodePacked(controlledContractAddress)),
            keccak256(ownerContractByteCodeWithAllParams)
        );
    }

    /*
     * @inheritdoc IOwnerControlledContractDeployer
     */
    function computeERC1167Addresses(
        bytes32 salt,
        address controlledContractImplementation,
        address ownerContractImplementation,
        bytes memory initializationCalldata,
        bool addControlledContractAddress,
        bytes memory extraInitializationParams,
        address postDeploymentModule,
        bytes memory postDeploymentModuleCalldata
    )
        public
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        )
    {
        bytes32 controlledContractGeneratedSalt = keccak256(
            abi.encode(
                salt,
                ownerContractImplementation,
                initializationCalldata,
                addControlledContractAddress,
                extraInitializationParams,
                postDeploymentModule,
                postDeploymentModuleCalldata
            )
        );

        controlledContractAddress = Clones.predictDeterministicAddress(
            controlledContractImplementation,
            controlledContractGeneratedSalt
        );

        ownerContractAddress = Clones.predictDeterministicAddress(
            ownerContractImplementation,
            keccak256(abi.encodePacked(controlledContractAddress))
        );
    }

    function _deployAndInitializeControlledContractProxy(
        ControlledContractDeploymentInit
            calldata controlledContractDeploymentInit,
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal returns (address controlledContractAddress) {
        /* generate the salt for the controlled contract
         *  the salt is generated by hashing the following elements:
         *   - the salt
         *   - the owner implementation contract address
         *   - the owner contract addControlledContractAddress boolean
         *   - the owner contract initialization calldata
         *   - the owner contract extra initialization params (if any)
         *   - the postDeploymentModule address
         *   - the callda to the post deployment module
         *
         */
        bytes32 controlledContractGeneratedSalt = keccak256(
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

        emit DeployedERC1167Proxie(
            controlledContractAddress,
            controlledContractDeploymentInit
        );
    }

    function _deployAndInitializeOwnerControlledProxy(
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address controlledContractAddress
    ) internal returns (address ownerContractAddress) {
        /* deploy the controlled contract proxy with the controlledContractGeneratedSalt */
        ownerContractAddress = Clones.cloneDeterministic(
            ownerContractDeploymentInit.implementationContract,
            keccak256(abi.encodePacked(controlledContractAddress))
        );

        /* if addControlledContractAddress is true, the controlled contract address + extraInitialisationBytes will be appended to the initializationCalldata */
        bytes memory ownerInitializationBytes;
        if (ownerContractDeploymentInit.addControlledContractAddress) {
            ownerInitializationBytes = abi.encodePacked(
                ownerContractDeploymentInit.initializationCalldata,
                abi.encode(controlledContractAddress),
                ownerContractDeploymentInit.extraInitializationParams
            );
        } else {
            ownerInitializationBytes = ownerContractDeploymentInit
                .initializationCalldata;
        }

        /* initialize the controlled contract proxy */
        (bool success, bytes memory returnedData) = ownerContractAddress.call{
            value: msg.value
        }(ownerInitializationBytes);
        if (!success) {
            revert OwnerProxyInitFailureError(returnedData);
        }

        emit DeployedOwnerERC1167Proxie(
            ownerContractAddress,
            ownerContractDeploymentInit
        );
    }

    function _deployControlledContract(
        ControlledContractDeployment calldata controlledContractDeployment,
        OwnerContractDeployment calldata ownerContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    ) internal returns (address controlledContractAddress) {
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
        bytes32 controlledContractGeneratedSalt = keccak256(
            abi.encode(
                controlledContractDeployment.salt,
                ownerContractDeployment.creationBytecode,
                ownerContractDeployment.addControlledContractAddress,
                ownerContractDeployment.extraConstructorParams,
                postDeploymentModule,
                postDeploymentModuleCalldata
            )
        );

        /* deploy the controlled contract */
        controlledContractAddress = Create2.deploy(
            controlledContractDeployment.value,
            controlledContractGeneratedSalt,
            controlledContractDeployment.creationBytecode
        );

        emit DeployedContract(
            controlledContractAddress,
            controlledContractDeployment
        );
    }

    function _deployOwnerContract(
        OwnerContractDeployment calldata ownerContractDeployment,
        address controlledContractAddress
    ) internal returns (address ownerContractAddress) {
        /* if addControlledContractAddress is true, the controlled contract address + extraConstructorParams will be appended to the constructor params */
        bytes memory ownerContractByteCode;
        if (ownerContractDeployment.addControlledContractAddress) {
            ownerContractByteCode = abi.encodePacked(
                ownerContractDeployment.creationBytecode,
                abi.encode(controlledContractAddress),
                ownerContractDeployment.extraConstructorParams
            );
        } else {
            ownerContractByteCode = ownerContractDeployment.creationBytecode;
        }

        /*  here owner refers as the future owner of the controlled contract at the end of the transaction */
        ownerContractAddress = Create2.deploy(
            ownerContractDeployment.value,
            keccak256(abi.encodePacked(controlledContractAddress)),
            ownerContractByteCode
        );

        emit DeployedOwnerContract(
            ownerContractAddress,
            ownerContractDeployment
        );
    }
}

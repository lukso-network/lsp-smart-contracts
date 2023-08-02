// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IOwnerControlledContractDeployer {
    struct ControlledContractDeployment {
        bytes32 salt;
        uint256 value;
        bytes creationBytecode /* the bytecode of the controlled contract with the constructor params */;
    }

    struct OwnerContractDeployment {
        uint256 value;
        bytes creationBytecode /* the bytecode of the owner contract with the constructor params before the controlled contract address param */;
        bool addControlledContractAddress /* will append the controlled contract address to the constructor params if true + the extraConstructorParams */;
        bytes extraConstructorParams /* params to be appended to the bytecode after the controlled contract address */;
    }

    struct ControlledContractDeploymentInit {
        bytes32 salt;
        uint256 value;
        address implementationContract;
        bytes initializationCalldata;
    }

    struct OwnerContractDeploymentInit {
        uint256 value;
        address implementationContract;
        bool addControlledContractAddress /* will append the controlled contract address to the initialisation calldata if true as well as the extraInitializationParams */;
        bytes initializationCalldata;
        bytes extraInitializationParams /* params to be appended to the initialisation calldata after the controlled contract address */;
    }

    event DeployedContract(
        address indexed controlledContract,
        ControlledContractDeployment controlledContractDeployment
    );

    event DeployedOwnerContract(
        address indexed ownerContract,
        OwnerContractDeployment ownerContractDeployment
    );

    event DeployedERC1167Proxie(
        address indexed controlledContract,
        ControlledContractDeploymentInit controlledContractDeploymentInit
    );

    event DeployedOwnerERC1167Proxie(
        address indexed ownerContract,
        OwnerContractDeploymentInit ownerContractDeploymentInit
    );

    event PostDeployment(
        address postDeploymentModule,
        bytes postDeploymentModuleCalldata
    );

    /*
     * @dev Deploys a controlled contract and an owner contract
     * @param salt a value used to ensure uniqueness of the created contracts
     * @param controlledContractDeployment contains the value and creation bytecode for the controlled contract
     * @param ownerContractDeployment contains the value and creation bytecode for the owner contract
     * @param postDeploymentModule the module to be executed after deployment
     * @param postDeploymentModuleCalldata the data to be passed to the post deployment module
     * @return controlledContractAddress The address of the deployed controlled contract.
     * @return ownerContractAddress The address of the deployed owner contract.
     */
    function deployContracts(
        ControlledContractDeployment calldata controlledContractDeployment,
        OwnerContractDeployment calldata ownerContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        payable
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        );

    /*
     * @dev Deploys proxies of a controlled contract and an owner contract
     * @param salt a value used to ensure uniqueness of the created proxies
     * @param controlledContractDeploymentInit contains the value and initialisation data for the controlled contract proxy
     * @param ownerContractDeploymentInit contains the value and initialisation data for the owner contract proxy
     * @param postDeploymentModule the module to be executed after deployment
     * @param postDeploymentModuleCalldata the data to be passed to the post deployment module
     * @return controlledContractAddress the address of the deployed controlled contract proxy
     * @return ownerContractAddress the address of the deployed owner contract proxy
     */
    function deployERC1167Proxies(
        ControlledContractDeploymentInit
            calldata controlledContractDeploymentInit,
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        payable
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        );

    /*
     * @dev Computes the addresses of the controlled and owner contracts to be created
     * @param salt a value used to ensure uniqueness of the created contracts
     * @param controlledContractCreationByteCode the creation bytecode of the controlled contract
     * @param ownerContractCreationByteCode the creation bytecode of the owner contract
     * @param addControlledContractAddress a flag indicating if the address of the controlled contract should be appended to the constructor params
     * @param extraConstructorParams additional constructor params to be appended to the bytecode
     * @param postDeploymentModule the module to be executed after deployment
     * @param postDeploymentModuleCalldata the data to be passed to the post deployment module
     * @return controlledContractAddress the address of the controlled contract to be created
     * @return ownerContractAddress the address of the owner contract to be created
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
        external
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        );

    /*
     * @dev Computes the addresses of the controlled and owner contract proxies to be created.
     * @param salt A value used to ensure uniqueness of the created proxies.
     * @param controlledContractImplementation The implementation contract of the controlled contract proxy.
     * @param ownerContractImplementation The implementation contract of the owner contract proxy.
     * @param initializationCalldata The initialisation calldata of the owner contract proxy.
     * @param addControlledContractAddress A flag indicating if the address of the controlled contract should be appended to the initialisation calldata of the owner contract proxy.
     * @param extraInitializationParams Additional initialisation params to be appended to the calldata of the owner contract proxy.
     * @param postDeploymentModule The module to be executed after deployment.
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module.
     * @return controlledContractAddress The address of the controlled contract proxy to be created.
     * @return ownerContractAddress The address of the owner contract proxy to be created.
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
        external
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        );
}

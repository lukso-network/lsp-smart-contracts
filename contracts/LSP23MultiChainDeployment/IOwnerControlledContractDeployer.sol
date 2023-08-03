// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IOwnerControlledContractDeployer {
    event DeployedContracts(
        address indexed controlledContract,
        address indexed ownerContract,
        ControlledContractDeployment controlledContractDeployment,
        OwnerContractDeployment ownerContractDeployment,
        address postDeploymentModule,
        bytes postDeploymentModuleCalldata
    );

    event DeployedERC1167Proxies(
        address indexed controlledContract,
        address indexed ownerContract,
        ControlledContractDeploymentInit controlledContractDeploymentInit,
        OwnerContractDeploymentInit ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes postDeploymentModuleCalldata
    );

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

    /**
     * @param salt A unique value used to ensure each created proxies are unique. (Can be used to deploy the contract at a desired address.)
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param creationBytecode The bytecode of the contract with the constructor params.
     */
    struct ControlledContractDeployment {
        bytes32 salt;
        uint256 fundingAmount;
        bytes creationBytecode;
    }

    /**
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param creationBytecode The constructor + runtime bytecode (without the controlled contract's address as param)
     * @param addControlledContractAddress If set to `true`, this will append the controlled contract's address + the `extraConstructorParams` to the `creationBytecode`.
     * @param extraConstructorParams Params to be appended to the `creationBytecode` (after the controlled contract address) if `addControlledContractAddress` is set to `true`.
     */
    struct OwnerContractDeployment {
        uint256 fundingAmount;
        bytes creationBytecode;
        bool addControlledContractAddress;
        bytes extraConstructorParams;
    }

    /**
     * @param salt A unique value used to ensure each created proxies are unique. (Can be used to deploy the contract at a desired address.)
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param implementationContract The address of the contract that will be used as a base contract for the proxy.
     * @param initializationCalldata The calldata used to initialise the contract. (initialization should be similar to a constructor in a normal contract.)
     */
    struct ControlledContractDeploymentInit {
        bytes32 salt;
        uint256 fundingAmount;
        address implementationContract;
        bytes initializationCalldata;
    }

    /**
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param implementationContract The address of the contract that will be used as a base contract for the proxy.
     * @param initializationCalldata The first part of the initialisation calldata, everything before the controlled contract address.
     * @param addControlledContractAddress If set to `true`, this will append the controlled contract's address + the `extraInitializationParams` to the `initializationCalldata`.
     * @param extraInitializationParams Params to be appended to the `initializationCalldata` (after the controlled contract address) if `addControlledContractAddress` is set to `true`
     */
    struct OwnerContractDeploymentInit {
        uint256 fundingAmount;
        address implementationContract;
        bytes initializationCalldata;
        bool addControlledContractAddress;
        bytes extraInitializationParams;
    }

    /**
     * @dev Deploys a contract and its owner contract.
     * @notice Contracts deployed. Contract Address: `controlledContractAddress`. Owner Contract Address: `ownerContractAddress`
     *
     * @param controlledContractDeployment Contains the needed parameter to deploy a contract. (`salt`, `fundingAmount`, `creationBytecode`)
     * @param ownerContractDeployment Contains the needed parameter to deploy the owner contract. (`fundingAmount`, `creationBytecode`, `addControlledContractAddress`, `extraConstructorParams`)
     * @param postDeploymentModule The module to be executed after deployment
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module
     *
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

    /**
     * @dev Deploys proxies of a contract and its owner contract
     * @notice Contract proxies deployed. Contract Proxy Address: `controlledContractAddress`. Owner Contract Proxy Address: `ownerContractAddress`
     *
     * @param controlledContractDeploymentInit Contains the needed parameter to deploy a proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)
     * @param ownerContractDeploymentInit Contains the needed parameter to deploy the owner proxy contract. (`fundingAmount`, `implementationContract`, `addControlledContractAddress`, `initializationCalldata`, `extraInitializationParams`)
     * @param postDeploymentModule The module to be executed after deployment.
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module.
     *
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

    /**
     * @dev Computes the addresses of the controlled and owner contracts to be created
     *
     * @param controlledContractDeployment Contains the needed parameter to deploy a contract. (`salt`, `fundingAmount`, `creationBytecode`)
     * @param ownerContractDeployment Contains the needed parameter to deploy the owner contract. (`fundingAmount`, `creationBytecode`, `addControlledContractAddress`, `extraConstructorParams`)
     * @param postDeploymentModule The module to be executed after deployment
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module
     *
     * @return controlledContractAddress The address of the deployed controlled contract.
     * @return ownerContractAddress The address of the deployed owner contract.
     */
    function computeAddresses(
        ControlledContractDeployment calldata controlledContractDeployment,
        OwnerContractDeployment calldata ownerContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        );

    /**
     * @dev Computes the addresses of the controlled and owner contract proxies to be created.
     *
     * @param controlledContractDeploymentInit Contains the needed parameter to deploy a proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)
     * @param ownerContractDeploymentInit Contains the needed parameter to deploy the owner proxy contract. (`fundingAmount`, `implementationContract`, `addControlledContractAddress`, `initializationCalldata`, `extraInitializationParams`)
     * @param postDeploymentModule The module to be executed after deployment.
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module.
     *
     * @return controlledContractAddress the address of the deployed controlled contract proxy
     * @return ownerContractAddress the address of the deployed owner contract proxy
     */
    function computeERC1167Addresses(
        ControlledContractDeploymentInit
            calldata controlledContractDeploymentInit,
        OwnerContractDeploymentInit calldata ownerContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        view
        returns (
            address controlledContractAddress,
            address ownerContractAddress
        );
}

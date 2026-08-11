// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0 ^0.8.4;

// node_modules/@openzeppelin/contracts/proxy/Clones.sol

// OpenZeppelin Contracts (last updated v4.9.0) (proxy/Clones.sol)

/**
 * @dev https://eips.ethereum.org/EIPS/eip-1167[EIP 1167] is a standard for
 * deploying minimal proxy contracts, also known as "clones".
 *
 * > To simply and cheaply clone contract functionality in an immutable way, this standard specifies
 * > a minimal bytecode implementation that delegates all calls to a known, fixed address.
 *
 * The library includes functions to deploy a proxy using either `create` (traditional deployment) or `create2`
 * (salted deterministic deployment). It also includes functions to predict the addresses of clones deployed using the
 * deterministic method.
 *
 * _Available since v3.4._
 */
library Clones {
    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `implementation`.
     *
     * This function uses the create opcode, which should never revert.
     */
    function clone(address implementation) internal returns (address instance) {
        /// @solidity memory-safe-assembly
        assembly {
            // Cleans the upper 96 bits of the `implementation` word, then packs the first 3 bytes
            // of the `implementation` address with the bytecode before the address.
            mstore(
                0x00,
                or(
                    shr(0xe8, shl(0x60, implementation)),
                    0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000
                )
            )
            // Packs the remaining 17 bytes of `implementation` with the bytecode after the address.
            mstore(
                0x20,
                or(shl(0x78, implementation), 0x5af43d82803e903d91602b57fd5bf3)
            )
            instance := create(0, 0x09, 0x37)
        }
        require(instance != address(0), "ERC1167: create failed");
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `implementation`.
     *
     * This function uses the create2 opcode and a `salt` to deterministically deploy
     * the clone. Using the same `implementation` and `salt` multiple time will revert, since
     * the clones cannot be deployed twice at the same address.
     */
    function cloneDeterministic(
        address implementation,
        bytes32 salt
    ) internal returns (address instance) {
        /// @solidity memory-safe-assembly
        assembly {
            // Cleans the upper 96 bits of the `implementation` word, then packs the first 3 bytes
            // of the `implementation` address with the bytecode before the address.
            mstore(
                0x00,
                or(
                    shr(0xe8, shl(0x60, implementation)),
                    0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000
                )
            )
            // Packs the remaining 17 bytes of `implementation` with the bytecode after the address.
            mstore(
                0x20,
                or(shl(0x78, implementation), 0x5af43d82803e903d91602b57fd5bf3)
            )
            instance := create2(0, 0x09, 0x37, salt)
        }
        require(instance != address(0), "ERC1167: create2 failed");
    }

    /**
     * @dev Computes the address of a clone deployed using {Clones-cloneDeterministic}.
     */
    function predictDeterministicAddress(
        address implementation,
        bytes32 salt,
        address deployer
    ) internal pure returns (address predicted) {
        /// @solidity memory-safe-assembly
        assembly {
            let ptr := mload(0x40)
            mstore(add(ptr, 0x38), deployer)
            mstore(add(ptr, 0x24), 0x5af43d82803e903d91602b57fd5bf3ff)
            mstore(add(ptr, 0x14), implementation)
            mstore(ptr, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73)
            mstore(add(ptr, 0x58), salt)
            mstore(add(ptr, 0x78), keccak256(add(ptr, 0x0c), 0x37))
            predicted := keccak256(add(ptr, 0x43), 0x55)
        }
    }

    /**
     * @dev Computes the address of a clone deployed using {Clones-cloneDeterministic}.
     */
    function predictDeterministicAddress(
        address implementation,
        bytes32 salt
    ) internal view returns (address predicted) {
        return predictDeterministicAddress(implementation, salt, address(this));
    }
}

// node_modules/@openzeppelin/contracts/utils/Create2.sol

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Create2.sol)

/**
 * @dev Helper to make usage of the `CREATE2` EVM opcode easier and safer.
 * `CREATE2` can be used to compute in advance the address where a smart
 * contract will be deployed, which allows for interesting new mechanisms known
 * as 'counterfactual interactions'.
 *
 * See the https://eips.ethereum.org/EIPS/eip-1014#motivation[EIP] for more
 * information.
 */
library Create2 {
    /**
     * @dev Deploys a contract using `CREATE2`. The address where the contract
     * will be deployed can be known in advance via {computeAddress}.
     *
     * The bytecode for a contract can be obtained from Solidity with
     * `type(contractName).creationCode`.
     *
     * Requirements:
     *
     * - `bytecode` must not be empty.
     * - `salt` must have not been used for `bytecode` already.
     * - the factory must have a balance of at least `amount`.
     * - if `amount` is non-zero, `bytecode` must have a `payable` constructor.
     */
    function deploy(
        uint256 amount,
        bytes32 salt,
        bytes memory bytecode
    ) internal returns (address addr) {
        require(
            address(this).balance >= amount,
            "Create2: insufficient balance"
        );
        require(bytecode.length != 0, "Create2: bytecode length is zero");
        /// @solidity memory-safe-assembly
        assembly {
            addr := create2(amount, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(addr != address(0), "Create2: Failed on deploy");
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy}. Any change in the
     * `bytecodeHash` or `salt` will result in a new destination address.
     */
    function computeAddress(
        bytes32 salt,
        bytes32 bytecodeHash
    ) internal view returns (address) {
        return computeAddress(salt, bytecodeHash, address(this));
    }

    /**
     * @dev Returns the address where a contract will be stored if deployed via {deploy} from a contract located at
     * `deployer`. If `deployer` is this contract's address, returns the same value as {computeAddress}.
     */
    function computeAddress(
        bytes32 salt,
        bytes32 bytecodeHash,
        address deployer
    ) internal pure returns (address addr) {
        /// @solidity memory-safe-assembly
        assembly {
            let ptr := mload(0x40) // Get free memory pointer

            // |                   | ↓ ptr ...  ↓ ptr + 0x0B (start) ...  ↓ ptr + 0x20 ...  ↓ ptr + 0x40 ...   |
            // |-------------------|---------------------------------------------------------------------------|
            // | bytecodeHash      |                                                        CCCCCCCCCCCCC...CC |
            // | salt              |                                      BBBBBBBBBBBBB...BB                   |
            // | deployer          | 000000...0000AAAAAAAAAAAAAAAAAAA...AA                                     |
            // | 0xFF              |            FF                                                             |
            // |-------------------|---------------------------------------------------------------------------|
            // | memory            | 000000...00FFAAAAAAAAAAAAAAAAAAA...AABBBBBBBBBBBBB...BBCCCCCCCCCCCCC...CC |
            // | keccak(start, 85) |            ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑ |

            mstore(add(ptr, 0x40), bytecodeHash)
            mstore(add(ptr, 0x20), salt)
            mstore(ptr, deployer) // Right-aligned with 12 preceding garbage bytes
            let start := add(ptr, 0x0b) // The hashed data starts at the final garbage byte which we will set to 0xff
            mstore8(start, 0xff)
            addr := keccak256(start, 85)
        }
    }
}

// packages/lsp23-contracts/contracts/ILSP23LinkedContractsFactory.sol

interface ILSP23LinkedContractsFactory {
    /**
     * @dev Emitted when a primary and secondary contract are deployed.
     * @param primaryContract Address of the deployed primary contract.
     * @param secondaryContract Address of the deployed secondary contract.
     * @param primaryContractDeployment Parameters used for the primary contract deployment.
     * @param secondaryContractDeployment Parameters used for the secondary contract deployment.
     * @param postDeploymentModule Address of the post-deployment module.
     * @param postDeploymentModuleCalldata Calldata passed to the post-deployment module.
     */
    event DeployedContracts(
        address indexed primaryContract,
        address indexed secondaryContract,
        PrimaryContractDeployment primaryContractDeployment,
        SecondaryContractDeployment secondaryContractDeployment,
        address postDeploymentModule,
        bytes postDeploymentModuleCalldata
    );

    /**
     * @dev Emitted when proxies of a primary and secondary contract are deployed.
     * @param primaryContract Address of the deployed primary contract proxy.
     * @param secondaryContract Address of the deployed secondary contract proxy.
     * @param primaryContractDeploymentInit Parameters used for the primary contract proxy deployment.
     * @param secondaryContractDeploymentInit Parameters used for the secondary contract proxy deployment.
     * @param postDeploymentModule Address of the post-deployment module.
     * @param postDeploymentModuleCalldata Calldata passed to the post-deployment module.
     */
    event DeployedERC1167Proxies(
        address indexed primaryContract,
        address indexed secondaryContract,
        PrimaryContractDeploymentInit primaryContractDeploymentInit,
        SecondaryContractDeploymentInit secondaryContractDeploymentInit,
        address postDeploymentModule,
        bytes postDeploymentModuleCalldata
    );

    /**
     * @param salt A unique value used to ensure each created proxies are unique (used for deterministic deployments).
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param creationBytecode The bytecode of the contract with the constructor params.
     */
    struct PrimaryContractDeployment {
        bytes32 salt;
        uint256 fundingAmount;
        bytes creationBytecode;
    }

    /**
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param creationBytecode The bytecode for contract creation, up to but not including the primary contract address (if it needs to be appended).
     * @param addPrimaryContractAddress If set to `true`, this will append the primary contract's address + the `extraConstructorParams` to the `creationBytecode`.
     * @param extraConstructorParams Params to be appended to the `creationBytecode` (after the primary contract address) if `addPrimaryContractAddress` is set to `true`.
     */
    struct SecondaryContractDeployment {
        uint256 fundingAmount;
        bytes creationBytecode;
        bool addPrimaryContractAddress;
        bytes extraConstructorParams;
    }

    /**
     * @param salt A unique value used to ensure each created proxies are unique. (Can be used to deploy the contract at a desired address.)
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param implementationContract The address of the contract that will be used as a base contract for the proxy.
     * @param initializationCalldata The calldata used to initialize the contract.
     */
    struct PrimaryContractDeploymentInit {
        bytes32 salt;
        uint256 fundingAmount;
        address implementationContract;
        bytes initializationCalldata;
    }

    /**
     * @param fundingAmount The value to be sent with the deployment transaction.
     * @param implementationContract The address of the contract that will be used as a base contract for the proxy.
     * @param initializationCalldata Initialization calldata up to, but not including, the primary contract address (if it needs to be appended).
     * @param addPrimaryContractAddress If set to `true`, this will append the primary contract's address + the `extraInitializationParams` to the `initializationCalldata`.
     * @param extraInitializationParams Params to be appended to the `initializationCalldata` (after the primary contract address) if `addPrimaryContractAddress` is set to `true`
     */
    struct SecondaryContractDeploymentInit {
        uint256 fundingAmount;
        address implementationContract;
        bytes initializationCalldata;
        bool addPrimaryContractAddress;
        bytes extraInitializationParams;
    }

    /**
     * @dev Deploys a primary and a secondary linked contract.
     * @notice Contracts deployed. Contract Address: `primaryContractAddress`. Primary Contract Address: `primaryContractAddress`
     *
     * @param primaryContractDeployment Contains the needed parameter to deploy a contract. (`salt`, `fundingAmount`, `creationBytecode`)
     * @param secondaryContractDeployment Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`)
     * @param postDeploymentModule The optional module to be executed after deployment
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module
     *
     * @return primaryContractAddress The address of the primary contract.
     * @return secondaryContractAddress The address of the secondary contract.
     */
    function deployContracts(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        payable
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        );

    /**
     * @dev Deploys ERC1167 proxies of a primary contract and a secondary linked contract
     * @notice Contract proxies deployed. Primary Proxy Address: `primaryContractAddress`. Secondary Contract Proxy Address: `secondaryContractAddress`
     *
     * @param primaryContractDeploymentInit Contains the needed parameters to deploy a proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)
     * @param secondaryContractDeploymentInit Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`)
     * @param postDeploymentModule The optional module to be executed after deployment.
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module.
     *
     * @return primaryContractAddress The address of the deployed primary contract proxy
     * @return secondaryContractAddress The address of the deployed secondary contract proxy
     */
    function deployERC1167Proxies(
        PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
        SecondaryContractDeploymentInit
            calldata secondaryContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        payable
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        );

    /**
     * @dev Computes the addresses of a primary contract and a secondary linked contract
     *
     * @param primaryContractDeployment Contains the needed parameter to deploy the primary contract. (`salt`, `fundingAmount`, `creationBytecode`)
     * @param secondaryContractDeployment Contains the needed parameter to deploy the secondary contract. (`fundingAmount`, `creationBytecode`, `addPrimaryContractAddress`, `extraConstructorParams`)
     * @param postDeploymentModule The optional module to be executed after deployment
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module
     *
     * @return primaryContractAddress The address of the deployed primary contract.
     * @return secondaryContractAddress The address of the deployed secondary contract.
     */
    function computeAddresses(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        view
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        );

    /**
     * @dev Computes the addresses of a primary and a secondary linked contracts ERC1167 proxies to be created
     *
     * @param primaryContractDeploymentInit Contains the needed parameters to deploy a primary proxy contract. (`salt`, `fundingAmount`, `implementationContract`, `initializationCalldata`)
     * @param secondaryContractDeploymentInit Contains the needed parameters to deploy the secondary proxy contract. (`fundingAmount`, `implementationContract`, `initializationCalldata`, `addPrimaryContractAddress`, `extraInitializationParams`)
     * @param postDeploymentModule The optional module to be executed after deployment.
     * @param postDeploymentModuleCalldata The data to be passed to the post deployment module.
     *
     * @return primaryContractAddress The address of the deployed primary contract proxy
     * @return secondaryContractAddress The address of the deployed secondary contract proxy
     */
    function computeERC1167Addresses(
        PrimaryContractDeploymentInit calldata primaryContractDeploymentInit,
        SecondaryContractDeploymentInit
            calldata secondaryContractDeploymentInit,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        external
        view
        returns (
            address primaryContractAddress,
            address secondaryContractAddress
        );
}

// packages/lsp23-contracts/contracts/IPostDeploymentModule.sol

interface IPostDeploymentModule {
    /**
     * @dev Executes post-deployment logic for the primary and secondary contracts.
     * @notice This function can be used to perform any additional setup or configuration after the primary and secondary contracts have been deployed.
     *
     * @param primaryContract The address of the deployed primary contract.
     * @param secondaryContract The address of the deployed secondary contract.
     * @param calldataToPostDeploymentModule Calldata to be passed for the post-deployment execution.
     */
    function executePostDeployment(
        address primaryContract,
        address secondaryContract,
        bytes calldata calldataToPostDeploymentModule
    ) external;
}

// packages/lsp23-contracts/contracts/LSP23Errors.sol

/**
 * @dev Reverts when the `msg.value` sent is not equal to the sum of value used for the deployment of the contract & its owner contract.
 * @notice Invalid value sent.
 */
error InvalidValueSum();

/**
 * @dev Reverts when the deployment & initialization of the contract has failed.
 * @notice Failed to deploy & initialize the Primary Contract Proxy. Error: `errorData`.
 *
 * @param errorData Potentially information about why the deployment & initialization have failed.
 */
error PrimaryContractProxyInitFailureError(bytes errorData);

/**
 * @dev Reverts when the deployment & initialization of the secondary contract has failed.
 * @notice Failed to deploy & initialize the Secondary Contract Proxy. Error: `errorData`.
 *
 * @param errorData Potentially information about why the deployment & initialization have failed.
 */
error SecondaryContractProxyInitFailureError(bytes errorData);

// packages/lsp23-contracts/contracts/LSP23LinkedContractsFactory.sol

contract LSP23LinkedContractsFactory is ILSP23LinkedContractsFactory {
    /**
     * @inheritdoc ILSP23LinkedContractsFactory
     */
    function deployContracts(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        payable
        override
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

        /* execute the post deployment logic in the postDeploymentModule if postDeploymentModule is not address(0) */
        if (postDeploymentModule != address(0)) {
            /* execute the post deployment module logic in the postDeploymentModule */
            IPostDeploymentModule(postDeploymentModule).executePostDeployment(
                primaryContractAddress,
                secondaryContractAddress,
                postDeploymentModuleCalldata
            );
        }
    }

    /**
     * @inheritdoc ILSP23LinkedContractsFactory
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
        override
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

        /* execute the post deployment logic in the postDeploymentModule if postDeploymentModule is not address(0) */
        if (postDeploymentModule != address(0)) {
            /* execute the post deployment logic in the postDeploymentModule */
            IPostDeploymentModule(postDeploymentModule).executePostDeployment(
                primaryContractAddress,
                secondaryContractAddress,
                postDeploymentModuleCalldata
            );
        }
    }

    /**
     * @inheritdoc ILSP23LinkedContractsFactory
     */
    function computeAddresses(
        PrimaryContractDeployment calldata primaryContractDeployment,
        SecondaryContractDeployment calldata secondaryContractDeployment,
        address postDeploymentModule,
        bytes calldata postDeploymentModuleCalldata
    )
        public
        view
        override
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
     * @inheritdoc ILSP23LinkedContractsFactory
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
        override
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
            value: primaryContractDeploymentInit.fundingAmount
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
         * - `extraInitializationBytes`
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
            .call{value: secondaryContractDeploymentInit.fundingAmount}(
            secondaryInitializationBytes
        );
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
         *  - the secondary contract initialization calldata
         *  - the secondary contract addPrimaryContractAddress boolean
         *  - the secondary contract extra initialization params (if any)
         *  - the postDeploymentModule address
         *  - the calldata to the post deployment module
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

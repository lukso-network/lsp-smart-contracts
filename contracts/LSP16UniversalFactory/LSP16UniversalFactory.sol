// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// libraries
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

// errors

/**
 * @dev Reverts when there is no revert reason bubbled up by the contract created when initializing
 */
error InitializingContractFailed();

/**
 * @dev Reverts when msg.value sent to {deployCreate2AndInitialize} function is not equal to the sum of the
 * `initializeCalldataMsgValue` and `constructorMsgValue`
 */
error InvalidValueSum();

/**
 * @title LSP16 Universal Factory
 * @dev Factory contract to deploy different types of contracts using the CREATE2 opcode
 * standardized as LSP16 - UniversalFactory:
 * https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-16-UniversalFactory.md
 *
 * This factory contract is designed to deploy contracts at the same address on multiple chains.
 *
 * The UniversalFactory can deploy 2 types of contracts:
 * - non-initializable (normal deployment)
 * - initializable (external call after deployment, e.g: proxy contracts)
 *
 * The `providedSalt` parameter given by the deployer is not used directly as the salt by the CREATE2 opcode.
 * Instead, it is used along with these parameters:
 *  - `initializable` boolean
 *  - `initializeCalldata` (when the contract is initializable and `initializable` is set to `true`).
 * These three parameters are concatenated together and hashed to generate the final salt for CREATE2.
 *
 * See {generateSalt} function for more details.
 *
 * The constructor and `initializeCalldata` SHOULD NOT include any network-specific parameters (e.g: chain-id,
 * a local token contract address), otherwise the deployed contract will not be recreated at the same address
 * across different networks, thus defeating the purpose of the UniversalFactory.
 *
 * One way to solve this problem is to set an EOA owner in the `initializeCalldata`/constructor
 * that can later call functions that set these parameters as variables in the contract.
 *
 * The UniversalFactory must be deployed at the same address on different chains to successfully deploy
 * contracts at the same address across different chains.
 *
 * The UniversalFactory will be deployed using Nick's Factory (0x4e59b44847b379578588920ca78fbf26c0b4956c)
 *
 * Please refer to the LSP16 Specification to obtain the exact bytecode and salt that
 * should be used to produce the address of the UniversalFactory on different chains.
 */
contract LSP16UniversalFactory {
    /**
     * @dev placeholder for the `initializeCallData` param when the `initializable` boolean is set to `false`.
     */
    bytes private constant _EMPTY_BYTE = "";

    /**
     * @dev Emitted whenever a contract is created
     * @param contractCreated The address of the contract created
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     * @param initialized The Boolean that specifies if the contract must be initialized or not
     * @param initializeCalldata The bytes provided as initializeCalldata
     */
    event ContractCreated(
        address indexed contractCreated,
        bytes32 indexed providedSalt,
        bool indexed initialized,
        bytes initializeCalldata
    );

    /**
     * @dev Deploys a contract using the CREATE2 opcode. The address where the contract will be deployed
     * can be known in advance via the {computeAddress} function.
     *
     * This function deploys contracts without initialization (external call after deployment). When examining
     * the event or computing the address, the `initializable` boolean for this function is set to `false`, and `EMPTY_BYTES`
     * is used for `initializeCalldata`, as the contract is not initializable and the initializeCalldata will not be used.
     *
     * The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with
     * keccak256: `keccak256(abi.encodePacked(false, providedSalt))`. See {generateSalt} function for more details.
     *
     * Using the same `byteCode` and `providedSalt` multiple times will revert, as the contract cannot be deployed
     * twice at the same address.
     *
     * If the constructor of the contract to deploy is payable, value can be sent to this function to fund
     * the created contract. However, sending value to this function while the constructor is not payable will
     * result in a revert.
     *
     * @param byteCode The bytecode of the contract to be deployed
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     *
     * @return The address of the deployed contract
     */
    function deployCreate2(bytes calldata byteCode, bytes32 providedSalt)
        public
        payable
        virtual
        returns (address)
    {
        bytes32 generatedSalt = generateSalt(false, _EMPTY_BYTE, providedSalt);
        address contractCreated = Create2.deploy(msg.value, generatedSalt, byteCode);
        emit ContractCreated(contractCreated, providedSalt, false, _EMPTY_BYTE);

        return contractCreated;
    }

    /**
     * @dev Deploys a contract using the CREATE2 opcode. The address where the contract will be deployed
     * can be known in advance via the {computeAddress} function.
     *
     * This function deploys contracts with initialization (external call after deployment). When examining
     * the event or computing the address, the `initializable` boolean for this function is set to `true`, and
     * `initializeCalldata` is used as a parameter.
     *
     * The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with
     * keccak256: `keccak256(abi.encodePacked(true, initializeCalldata, providedSalt))`.
     * See {generateSalt} function for more details.
     *
     * Using the same `byteCode`, `providedSalt` and `initializeCalldata` multiple times will revert, as the
     * contract cannot be deployed twice at the same address.
     *
     * If the constructor or the initialize function of the contract to deploy is payable, value can be sent along
     * with the deployment/initialization to fund the created contract. However, sending value to this function while
     * the constructor/initialize function is not payable will result in a revert.
     *
     * Will revert if the `msg.value` sent to the function is not equal to the sum of `constructorMsgValue` and
     * `initializeCalldataMsgValue`.
     *
     * @param byteCode The bytecode of the contract to be deployed
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     * @param initializeCalldata The calldata to be executed on the created contract
     * @param constructorMsgValue The value sent to the contract during deployment
     * @param initializeCalldataMsgValue The value sent to the contract during initialization
     *
     * @return The address of the deployed contract
     */
    function deployCreate2AndInitialize(
        bytes calldata byteCode,
        bytes32 providedSalt,
        bytes calldata initializeCalldata,
        uint256 constructorMsgValue,
        uint256 initializeCalldataMsgValue
    ) public payable virtual returns (address) {
        if (constructorMsgValue + initializeCalldataMsgValue != msg.value) revert InvalidValueSum();

        bytes32 generatedSalt = generateSalt(true, initializeCalldata, providedSalt);
        address contractCreated = Create2.deploy(constructorMsgValue, generatedSalt, byteCode);
        emit ContractCreated(contractCreated, providedSalt, true, initializeCalldata);

        (bool success, bytes memory returndata) = contractCreated.call{
            value: initializeCalldataMsgValue
        }(initializeCalldata);
        _verifyCallResult(success, returndata);

        return contractCreated;
    }

    /**
     * @dev Deploys an ERC1167 minimal proxy contract using the CREATE2 opcode. The address where the contract will be deployed
     * can be known in advance via the {computeERC1167Address} function.
     *
     * This function deploys contracts without initialization (external call after deployment). When examining
     * the event or computing the address, the `initializable` boolean for this function is set to `false`
     * and `EMPTY_BYTES` is used for `initializeCalldata`, as the contract is not initializable, and the
     * `initializeCalldata` will not be used.
     *
     * The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with
     * keccak256: `keccak256(abi.encodePacked(false, providedSalt))`. See {generateSalt} function for more details.
     *
     * See {generateSalt} function for more details.
     *
     * Using the same `implementation` and `providedSalt` multiple times will revert, as the contract cannot be deployed
     * twice at the same address.
     *
     * Sending value to the contract created is not possible since the constructor of the ERC1167 minimal proxy is not payable.
     *
     * @param implementation The contract address to use as the base implementation behind the proxy that will be deployed
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     *
     * @return The address of the minimal proxy deployed
     */
    function deployERC1167Proxy(address implementation, bytes32 providedSalt)
        public
        virtual
        returns (address)
    {
        bytes32 generatedSalt = generateSalt(false, _EMPTY_BYTE, providedSalt);

        address proxy = Clones.cloneDeterministic(implementation, generatedSalt);
        emit ContractCreated(proxy, providedSalt, false, _EMPTY_BYTE);

        return proxy;
    }

    /**
     * @dev Deploys an ERC1167 minimal proxy contract using the CREATE2 opcode. The address where the contract will be deployed
     * can be known in advance via the {computeERC1167Address} function.
     *
     * This function deploys contracts with initialization (external call after deployment). When examining
     * the event or computing the address, the `initializable` boolean for this function is set to `true`, and
     * `initializeCalldata` is used as a parameter.
     *
     * The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is hashed with
     * keccak256: `keccak256(abi.encodePacked(true, initializeCalldata, providedSalt))`.
     * See {generateSalt} function for more details.
     *
     * Using the same `implementation`, `providedSalt` and `initializeCalldata` multiple times will revert, as the
     * contract cannot be deployed twice at the same address.
     *
     * If the initialize function of the contract to deploy is payable, value can be sent along to fund the created
     * contract while initializating. However, sending value to this function while the initialize function is not
     * payable will result in a revert.
     *
     * @param implementation The contract address to use as the base implementation behind the proxy that will be deployed
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     * @param initializeCalldata The calldata to be executed on the created contract
     *
     * @return The address of the minimal proxy deployed
     */
    function deployERC1167ProxyAndInitialize(
        address implementation,
        bytes32 providedSalt,
        bytes calldata initializeCalldata
    ) public payable virtual returns (address) {
        bytes32 generatedSalt = generateSalt(true, initializeCalldata, providedSalt);

        address proxy = Clones.cloneDeterministic(implementation, generatedSalt);
        emit ContractCreated(proxy, providedSalt, true, initializeCalldata);

        (bool success, bytes memory returndata) = proxy.call{value: msg.value}(initializeCalldata);
        _verifyCallResult(success, returndata);

        return proxy;
    }

    /**
     * @dev Computes the address of a contract to be deployed using CREATE2, based on the input parameters.
     * Any change in one of these parameters will result in a different address. When the `initializable`
     * boolean is set to `false`, `initializeCalldata` will not affect the function output.
     *
     * @param byteCodeHash The keccak256 hash of the bytecode to be deployed
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     * @param initializable A boolean that indicates whether an external call should be made to initialize the
     * contract after deployment
     * @param initializeCalldata The calldata to be executed on the created contract if `initializable` is set to `true`
     *
     * @return The address where the contract will be deployed
     */
    function computeAddress(
        bytes32 byteCodeHash,
        bytes32 providedSalt,
        bool initializable,
        bytes calldata initializeCalldata
    ) public view virtual returns (address) {
        bytes32 generatedSalt = generateSalt(initializable, initializeCalldata, providedSalt);
        return Create2.computeAddress(generatedSalt, byteCodeHash);
    }

    /**
     * @dev Computes the address of an ERC1167 proxy contract based on the input parameters.
     * Any change in one of these parameters will result in a different address. When the `initializable`
     * boolean is set to `false`, `initializeCalldata` will not affect the function output.
     *
     * @param implementation The contract to create a clone of according to ERC1167
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     * @param initializable A boolean that indicates whether an external call should be made to initialize the
     * proxy contract after deployment
     * @param initializeCalldata The calldata to be executed on the created contract if `initializable` is set to `true`
     *
     * @return The address where the ERC1167 proxy contract will be deployed
     */
    function computeERC1167Address(
        address implementation,
        bytes32 providedSalt,
        bool initializable,
        bytes calldata initializeCalldata
    ) public view virtual returns (address) {
        bytes32 generatedSalt = generateSalt(initializable, initializeCalldata, providedSalt);
        return Clones.predictDeterministicAddress(implementation, generatedSalt);
    }

    /**
     * @dev Generates the salt used to deploy the contract by hashing the following parameters (concatenated
     * together) with keccak256:
     *
     * - the `providedSalt`
     * - the `initializable` boolean
     * - the `initializeCalldata`, only if the contract is initializable (the `initializable` boolean is set to `true`)
     *
     * The `providedSalt` parameter is not used directly as the salt by the CREATE2 opcode. Instead, it is
     * used along with these parameters:
     *  - `initializable` boolean
     *  - `initializeCalldata` (when the contract is initializable and `initializable` is set to `true`).
     * These three parameters are concatenated together and hashed to generate the final salt for CREATE2.
     *
     * This approach ensures that in order to reproduce an initializable contract at the same address on another chain,
     * not only the `providedSalt` is required to be the same, but also the initialize parameters within the `initializeCalldata`
     * must also be the same.
     *
     * This maintains consistent deployment behaviour. Users are required to initialize contracts with the same parameters across
     * different chains to ensure contracts are deployed at the same address across different chains.
     *
     * -----------
     * Example (for initializable contracts)
     *
     * For an existing contract A on chain 1 owned by X, to replicate the same contract at the same address with
     * the same owner X on chain 2, the salt used to generate the address should include the initializeCalldata
     * that assigns X as the owner of contract A.
     *
     * For instance, if another user, Y, tries to deploy the contract at the same address
     * on chain 2 using the same providedSalt, but with a different initializeCalldata to make Y the owner instead of X,
     * the generated address would be different, preventing Y from deploying the contract with different ownership
     * at the same address.
     * -----------
     *
     * However, for non-initializable contracts, if the constructor has arguments that specify the deployment behavior, they
     * will be included in the bytecode. Any change in the constructor arguments will lead to a different contract's bytecode
     * which will result in a different address on other chains.
     *
     * -----------
     * Example (for non-initializable contracts)
     *
     * If a contract is deployed with specific constructor arguments on chain 1, these arguments are embedded within the bytecode.
     * For instance, if contract B is deployed with a specific `tokenName`and `tokenSymbol` on chain 1, and a user wants to deploy
     * the same contract with the same `tokenName` and `tokenSymbol` on chain 2, they must use the same constructor arguments to
     * produce the same bytecode. This ensures that the same deployment behaviour is maintained across different chains,
     * as long as the same bytecode is used.
     *
     * If another user Z, tries to deploy the same contract B at the same address on chain 2 using the same `providedSalt`
     * but different constructor arguments (a different `tokenName` and/or `tokenSymbol`), the generated address will be different.
     * This prevents user Z from deploying the contract with different constructor arguments at the same address on chain 2.
     * -----------
     *
     * The providedSalt was hashed to produce the salt used by CREATE2 opcode to prevent users from deploying initializable contracts
     * using non-initializable functions such as {deployCreate2} without having the initialization call.
     *
     * In other words, if the providedSalt was not hashed and was used as it is as the salt by the CREATE2 opcode, malicious users
     * can check the generated salt used for already deployed initializable contract on chain 1, and deploy the contract
     * from {deployCreate2} function on chain 2, with passing the generated salt of the deployed contract as providedSalt
     * that will produce the same address but without the initialization, where the malicious user can initialize after.
     *
     * @param initializable The Boolean that specifies if the contract must be initialized or not
     * @param initializeCalldata The calldata to be executed on the created contract if `initializable` is set to `true`
     * @param providedSalt The salt provided by the deployer, which will be used to generate the final salt
     * that will be used by the `CREATE2` opcode for contract deployment
     *
     * @return The generated salt which will be used for CREATE2 deployment
     */
    function generateSalt(
        bool initializable,
        bytes memory initializeCalldata,
        bytes32 providedSalt
    ) public pure virtual returns (bytes32) {
        if (initializable) {
            return keccak256(abi.encodePacked(true, initializeCalldata, providedSalt));
        } else {
            return keccak256(abi.encodePacked(false, providedSalt));
        }
    }

    /**
     * @dev Verifies that the contract created was initialized correctly.
     * Bubble the revert reason if present, revert with `InitializingContractFailed` otherwise.
     */
    function _verifyCallResult(bool success, bytes memory returndata) internal pure virtual {
        if (!success) {
            // Look for revert reason and bubble it up if present
            if (returndata.length != 0) {
                // The easiest way to bubble the revert reason is using memory via assembly
                // solhint-disable no-inline-assembly
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(returndata)
                    revert(add(32, returndata), returndata_size)
                }
            } else {
                revert InitializingContractFailed();
            }
        }
    }
}

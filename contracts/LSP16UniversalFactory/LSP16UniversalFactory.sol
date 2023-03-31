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
 * @dev UniversalFactory is a factory contract used for deploying different types of contracts
 * with the CREATE2 opcode, standardized as LSP16 - UniversalFactory:
 * https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-16-UniversalFactory.md
 *
 * The goal of this factory is to enable the deployment of contracts to have the same
 * address on multiple chains.
 *
 * The UniversalFactory can deploy 2 types of contracts:
 * - non-initializable (normal deployment)
 * - initializable (external call after deployment)
 *
 * The salt provided to the functions of the UniversalFactory by the deployer is not used directly as the salt
 * for CREATE2 deployment. Instead, it is utilized along with other parameters such as the initializable flag and
 * initializeCalldata (when initializable) and hashed to generate the final salt for CREATE2.
 *
 * When the initializeCalldata or the constructor includes non-crosschain parameters, the deployed contract
 * will not be recreated at the same address on another network, thus defeating the purpose of the UniversalFactory.
 *
 * Therefore, the initializeCalldata and the constructor must not include any network-specific parameters,
 * such as a local token contract address, chain-id, etc ..
 *
 * One way to solve this problem is to set an EOA owner in the initializeCalldata/constructor
 * that can later call functions that set these parameters as variables in the contract.
 *
 * To achieve the deployment at the same address on different chains, the UniversalFactory must be deployed
 * at the same address on different chains.
 *
 * The UniversalFactory will be deployed using Nick's Factory (0x4e59b44847b379578588920ca78fbf26c0b4956c)
 *
 * Please refer to the LSP16 Specification to obtain the exact bytecode and salt that
 * should be used to produce the address of the UniversalFactory on different chains.
 */
contract LSP16UniversalFactory {
    /**
     * @dev A placeholder to be used for initializeCallData when the initializable boolean is set to false.
     */
    bytes private constant _EMPTY_BYTE = "";

    /**
     * @dev Emitted whenever a contract is created
     * @param contractCreated The address of the contract created
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
     * @param initialized The Boolean that specifies if the contract is a initialized or not
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
     * the event or computing the address, the initializable boolean for this function is set to false, and EMPTY_BYTES
     * is used for initializeCalldata, as the contract is not initializable and the initializeCalldata will not be utilized.
     *
     * The `providedSalt` parameter is not used directly as the salt for CREATE2 deployment. Instead, it is
     * utilized along with other parameters such as the initializable flag and initializeCalldata (when
     * initializable) and hashed to generate the final salt for CREATE2. Check {generateSalt} function.
     *
     * Using the same `byteCode` and `providedSalt` multiple times will revert, as the contract cannot be deployed
     * twice at the same address.
     *
     * If the constructor of the contract to deploy is payable, value can be sent along with the deployment
     * to fund the created contract. However, sending value to this function while the constructor is not
     * payable will result in a revert.
     *
     * @param byteCode The bytecode of the contract to be deployed
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
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
     * the event or computing the address, the initializable boolean for this function is set to true, and
     * initializeCalldata is used as a parameter.
     *
     * The `providedSalt` parameter is not used directly as the salt for CREATE2 deployment. Instead, it is
     * utilized along with other parameters such as the initializable flag and initializeCalldata (when
     * initializable) and hashed to generate the final salt for CREATE2. Check {generateSalt} function.
     *
     * Using the same `byteCode`, `providedSalt` and `initializeCalldata` multiple times will revert, as the
     * contract cannot be deployed twice at the same address.
     *
     * If the constructor or the initialize function of the contract to deploy is payable, value can be sent along
     * with the deployment/initialization to fund the created contract. However, sending value to this function while
     * the constructor/initialize function is not payable will result in a revert.
     *
     * Will revert if the value sent to the function is not equal to the sum of `constructorMsgValue` and
     * `initializeCalldataMsgValue`.
     *
     * @param byteCode The bytecode of the contract to be deployed
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
     * @param initializeCalldata The calldata for the contract's initialization function
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
     * the event or computing the address, the initializable boolean for this function is set to false, and EMPTY_BYTES
     * is used for initializeCalldata, as the contract is not initializable and the initializeCalldata will not be utilized.
     *
     * The `providedSalt` parameter is not used directly as the salt for CREATE2 deployment. Instead, it is
     * utilized along with other parameters such as the initializable flag and initializeCalldata (when
     * initializable) and hashed to generate the final salt for CREATE2. Check {generateSalt} function.
     *
     * Using the same `implementation` and `providedSalt` multiple times will revert, as the contract cannot be deployed
     * twice at the same address.
     *
     * Sending value to the contract created is not possible since the constructor of the ERC1167 minimal proxy is not marked
     * as payable.
     *
     * @param implementation The address of the contract to be used as the implementation for the proxy to deploy
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
     *
     * @return The address of the deployed contract
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
     * the event or computing the address, the initializable boolean for this function is set to true, and
     * initializeCalldata is used as a parameter.
     *
     * The `providedSalt` parameter is not used directly as the salt for CREATE2 deployment. Instead, it is
     * utilized along with other parameters such as the initializable flag and initializeCalldata (when
     * initializable) and hashed to generate the final salt for CREATE2. Check {generateSalt} function.
     *
     * Using the same `implementation`, `providedSalt` and `initializeCalldata` multiple times will revert, as the
     * contract cannot be deployed twice at the same address.
     *
     * If the initialize function of the contract to deploy is payable, value can be sent along with the initialization
     * to fund the created contract. However, sending value to this function while the initialize function is not
     * payable will result in a revert.
     *
     * @param implementation The address of the contract to be used as the implementation for the proxy to deploy
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
     * @param initializeCalldata The calldata for the contract's initialization function
     *
     * @return The address of the deployed contract
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
     * Any change in one of these parameters will result in a different address. When the initializable
     * boolean is set to false, initializeCalldata will not affect the function output.
     *
     * @param byteCodeHash The hash of the bytecode to be deployed, computed using keccak256
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
     * @param initializable A boolean that indicates whether an external call should be made to the contract after deployment
     * @param initializeCalldata The calldata to be executed on the created contract if it is initializable
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
     * Any change in one of these parameters will result in a different address. When the initializable
     * boolean is set to false, initializeCalldata will not affect the function output.
     *
     * @param implementation The contract to create a clone of according to ERC1167
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
     * @param initializable A boolean that indicates whether an external call should be made to the proxy contract after deployment
     * @param initializeCalldata The calldata to be executed on the created proxy contract if it is initializable
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
     * @dev Generates the salt used to deploy the contract by hashing (Keccak256) the following parameters
     * as packed encoded respectively: an initializable boolean, the initializeCalldata if and only if
     * the contract is initializable, and the salt provided by the deployer.
     *
     * The `providedSalt` parameter is not used directly as the salt for CREATE2 deployment. Instead, it is
     * utilized along with other parameters such as the initializable flag and initializeCalldata (when
     * initializable) and hashed to generate the final salt for CREATE2.
     *
     * This approach ensures that, for initializable contracts, not only the providedSalt is required, but also the identical
     * initialize parameters within the initializeCalldata to reproduce the same address on another chain. This maintains
     * consistent contract behavior at the same address across different chains, preventing users from initializing contracts
     * with different parameters on another chain.
     *
     * In other words, to guarantee that if contract A has owner X on chain 1, the same owner X will be present
     * on chain B, the salt used to generate the address should include the initializeCalldata that assigns X as
     * the owner of contract A. For instance, if another user, Y, tries to deploy the contract at the same address
     * on chain B using the same providedSalt, but with a different initializeCalldata to make Y the owner instead of X,
     * the generated address would be different, preventing Y from deploying the contract with different ownership
     * at the same address.
     *
     * However, for non-initializable contracts, if the constructor has arguments that specify the contract behavior, they
     * will be included in the bytecode, and any change in the bytecode will result in a different address on other chains.
     *
     * In other words, for non-initializable contracts, if contract B is deployed with a specific parameters on chain 1,
     * that parameters are embedded within the bytecode. This ensures that the same contract behavior is maintained across
     * different chains, as long as the same bytecode is used. For example, if contract B is deployed with a specific token name
     * and symbol on chain 1, and a user wants to deploy the same contract with the same token name and symbol on chain B, they must
     * use the same bytecode. If another user, Z, tries to deploy the contract at the same address on chain B using the same providedSalt
     * but with a different bytecode that results in a different token name and symbol, the generated address would be different.
     * This prevents user Z from deploying the contract with different parameters at the same address on chain B.
     *
     * The initializable boolean (false) is included in the salt to prevent users from deploying initializable contracts using
     * non-initializable functions such as {deployCreate2} without having the initialization call.
     *
     * In other words, if the initializable boolean was not included and the providedSalt was not hashed, malicious users can check
     * the generated salt used for already deployed initializable contract on chain 1, and deploy the contract from
     * {deployCreate2} function on chain 2, with passing the generated salt of the deployed contract as providedSalt that will
     * produce the same address but without the initialization, where the malicious user can initialize after.
     *
     * @param initializable The Boolean that specifies if the contract is a initialized or not
     * @param initializeCalldata The calldata for the contract's initialization function
     * @param providedSalt The salt provided by the deployer, which will be used to generate the actual salt
     * for contract deployment
     *
     * @return The generated salt which will be used for CREATE2 deployment
     */
    function generateSalt(
        bool initializable,
        bytes memory initializeCalldata,
        bytes32 providedSalt
    ) public pure virtual returns (bytes32) {
        if (initializable) {
            return keccak256(abi.encodePacked(initializable, initializeCalldata, providedSalt));
        } else {
            return keccak256(abi.encodePacked(initializable, providedSalt));
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

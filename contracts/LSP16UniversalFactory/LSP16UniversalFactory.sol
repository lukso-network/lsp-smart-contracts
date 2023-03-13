// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

// libraries
import {Create2} from "@openzeppelin/contracts/utils/Create2.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

// errors

/**
 * @dev reverts with this error when there is no revert reason bubbled up by the target contract when initializing
 */
error CannotInitializeContract();

/**
 * @dev reverts when msg.value sent to {deployCreate2Init} function is not equal to the sum of the
 * `initializeCalldataMsgValue` and `constructorMsgValue`
 */
error InvalidMsgValueDistribution();

/**
 * @dev UniversalFactory contract can be used to deploy normal or minimal proxy contracts (EIP-1167) using CREATE2.
 * This gives the ability to deploy the same contract at the same address on different chains.
 * If the contract has a constructor, the arguments will be part of the bytecode
 * If the contract has an `initialize` function, the parameters of this function will be included in
 * the salt to ensure that the parameters of the contract should be the same on each chain.
 *
 * When initializeCallData or the constructor includes non-crosschain parameters, the deployed contract
 * will not be recreated at the same address on another network, thus defeating the purpose of LSP16UniversalFactory.

 * Therefore, the initializeCallData and the constructor must not include any network-specific parameters,
 * such as a local non-crosschain token contract address, chain-id, etc ..
 *
 * One way to solve this problem is to set an EOA owner in the initializeCallData/constructor
 * that can later call functions that set these parameters as variables in the contract.
 *
 * This contract should be deployed using Nick's Method.
 * More information: https://weka.medium.com/how-to-send-ether-to-11-440-people-187e332566b7
 */
contract LSP16UniversalFactory {
    bytes private constant _EMPTY_BYTE = "";

    /**
     * @dev Emitted whenever a contract is created
     * @param contractCreated The address of the contract created
     * @param providedSalt The bytes32 salt provided by the deployer
     * @param initializable The Boolean that specifies if the contract is a initializable or not
     * @param initializeCalldata The bytes provided as initializeCalldata
     */
    event ContractCreated(
        address indexed contractCreated,
        bytes32 indexed providedSalt,
        bool indexed initializable,
        bytes initializeCalldata
    );

    /**
     * @dev Returns the address where a contract will be stored if deployed via `CREATE2`. The address is
     * constructed using the parameters below. Any change in one of them will result in a new destination address.
     */
    function calculateAddress(
        bytes32 byteCodeHash,
        bytes32 providedSalt,
        bool initializable,
        bytes calldata initializeCallData
    ) public view virtual returns (address) {
        bytes32 generatedSalt = generateSalt(initializable, initializeCallData, providedSalt);
        return Create2.computeAddress(generatedSalt, byteCodeHash);
    }

    /**
     * @dev Returns the address of an EIP1167 proxy contract. The address is constructed using
     *  the parameters below. Any change in one of them will result in a new destination address.
     */
    function calculateProxyAddress(
        address baseContract,
        bytes32 providedSalt,
        bool initializable,
        bytes calldata initializeCallData
    ) public view virtual returns (address) {
        bytes32 generatedSalt = generateSalt(initializable, initializeCallData, providedSalt);
        return Clones.predictDeterministicAddress(baseContract, generatedSalt);
    }

    /**
     * @dev Deploys a contract using `CREATE2`. The address where the contract will be deployed
     * can be known in advance via {calculateAddress}. The salt is a hash of the `providedSalt`
     * together with an empty byte, to prevent mimicing the `deployCreate2Init()` and other functions.
     *
     * This method allow users to have the same contracts at the same address across different
     * chains with the same parameters.
     *
     * Using the same `byteCode` and salt multiple time will revert, since
     * the contract cannot be deployed twice at the same address.
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
     * @dev Deploys a contract using `CREATE2`. The address where the contract will be deployed
     * can be known in advance via {calculateAddress}. The salt is a hash of the `providedSalt` and
     * and the `initializeCallData`.
     *
     * This method allow users
     * to have the same contracts at the same address across different chains with the same parameters.
     *
     * The msg.value is split according to the parameters of the function
     *
     * The msg.value sent to this contract MUST be the sum of the two parameters: `constructorMsgValue`
     * and `initializeCalldataMsgValue`
     *
     * Using the same `byteCode` and salt multiple time will revert, since
     * the contract cannot be deployed twice at the same address.
     */
    function deployCreate2Init(
        bytes calldata byteCode,
        bytes32 providedSalt,
        bytes calldata initializeCalldata,
        uint256 constructorMsgValue,
        uint256 initializeCalldataMsgValue
    ) public payable virtual returns (address) {
        if (constructorMsgValue + initializeCalldataMsgValue != msg.value)
            revert InvalidMsgValueDistribution();

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
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `baseContract`.
     * The address where the contract will be deployed can be known in advance via {calculateProxyAddress}.
     *
     * This function uses the CREATE2 opcode and a salt to deterministically deploy
     * the clone. The salt is a hash of the `providedSalt`
     * toegther with an empty byte, to prevent mimicing the `deployCreate2ProxyInit()` and other functions.
     *
     * This method allow users to have the same contracts at the same address across different
     * chains with the same parameters.
     *
     * Using the same `baseContract` and salt multiple time will revert, since
     * the clones cannot be deployed twice at the same address.
     */
    function deployCreate2Proxy(address baseContract, bytes32 providedSalt)
        public
        virtual
        returns (address)
    {
        bytes32 generatedSalt = generateSalt(false, _EMPTY_BYTE, providedSalt);

        address proxy = Clones.cloneDeterministic(baseContract, generatedSalt);
        emit ContractCreated(proxy, providedSalt, false, _EMPTY_BYTE);

        return proxy;
    }

    /**
     * @dev Deploys and returns the address of a clone that mimics the behaviour of `baseContract`.
     * The address where the contract will be deployed can be known in advance via {calculateProxyAddress}.
     *
     * This function uses the CREATE2 opcode and a salt to deterministically deploy
     * the clone. The salt is a hash of the `providedSalt` and
     * and the `initializeCallData`.
     *
     * This method allow users to have the same contracts at the same address
     * across different chains with the same parameters.
     *
     * Using the same `baseContract` and salt multiple time will revert, since
     * the clones cannot be deployed twice at the same address.
     */
    function deployCreate2ProxyInit(
        address baseContract,
        bytes32 providedSalt,
        bytes calldata initializeCalldata
    ) public payable virtual returns (address) {
        bytes32 generatedSalt = generateSalt(true, initializeCalldata, providedSalt);

        address proxy = Clones.cloneDeterministic(baseContract, generatedSalt);
        emit ContractCreated(proxy, providedSalt, true, initializeCalldata);

        (bool success, bytes memory returndata) = proxy.call{value: msg.value}(initializeCalldata);
        _verifyCallResult(success, returndata);

        return proxy;
    }

    /**
     * @dev Calculates the salt used to deploy the contract by hashing (Keccak256) the following parameters
     * as packed encoded respectively: an initializable boolean, the initializeCallData if and only if
     * the contract is initializable, and the salt provided by the deployer.
     *
     * The initializable boolean was added before the provided arguments as if it was not used,
     * and we are deploying proxies on another chain, people can use the `deployCreate2(..)` function
     * to deploy the same bytecode + the same salt to get the same address of the contract on
     * another chain without applying the effect of initializing.
     */
    function generateSalt(
        bool initializable,
        bytes memory initializeCallData,
        bytes32 providedSalt
    ) public pure virtual returns (bytes32) {
        if (initializable) {
            return keccak256(abi.encodePacked(initializable, initializeCallData, providedSalt));
        } else {
            return keccak256(abi.encodePacked(initializable, providedSalt));
        }
    }

    /**
     * @dev Verifies that the contract created was initialized correctly
     * Bubble the revert reason if present, revert with `CannotInitializeContract` otherwise
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
                revert CannotInitializeContract();
            }
        }
    }
}

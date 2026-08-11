// Sources flattened with hardhat v2.13.0 https://hardhat.org

// File @erc725/smart-contracts/contracts/constants.sol@v5.2.0

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// ERC165 INTERFACE IDs
bytes4 constant _INTERFACEID_ERC725X = 0x7545acac;
bytes4 constant _INTERFACEID_ERC725Y = 0x629aa694;

// ERC725X OPERATION TYPES
uint256 constant OPERATION_0_CALL = 0;
uint256 constant OPERATION_1_CREATE = 1;
uint256 constant OPERATION_2_CREATE2 = 2;
uint256 constant OPERATION_3_STATICCALL = 3;
uint256 constant OPERATION_4_DELEGATECALL = 4;

// File @erc725/smart-contracts/contracts/custom/OwnableUnset.sol@v5.2.0

/**
 * @title OwnableUnset
 * @dev modified version of OpenZeppelin implementation, where:
 * - _setOwner(address) function is internal, so this function can be used in constructor
 * of contracts implementation (instead of using transferOwnership(address)
 * - the contract does not inherit from Context contract
 */
abstract contract OwnableUnset {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _setOwner(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(
            newOwner != address(0),
            "Ownable: new owner is the zero address"
        );
        _setOwner(newOwner);
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == msg.sender, "Ownable: caller is not the owner");
    }

    /**
     * @dev Changes the owner if `newOwner` and oldOwner are different
     * This pattern is useful in inheritance.
     */
    function _setOwner(address newOwner) internal virtual {
        if (newOwner != owner()) {
            address oldOwner = _owner;
            _owner = newOwner;
            emit OwnershipTransferred(oldOwner, newOwner);
        }
    }
}

// File @erc725/smart-contracts/contracts/errors.sol@v5.2.0

/**
 * @dev Reverts when trying to send more native tokens `value` than available in current `balance`.
 * @param balance The balance of native tokens of the ERC725X smart contract.
 * @param value The amount of native tokens sent via `ERC725X.execute(...)`/`ERC725X.executeBatch(...)` that is greater than the contract's `balance`.
 */
error ERC725X_InsufficientBalance(uint256 balance, uint256 value);

/**
 * @dev Reverts when the `operationTypeProvided` is none of the default operation types available.
 * (CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4)
 * @param operationTypeProvided The unrecognised operation type number provided to `ERC725X.execute(...)`/`ERC725X.executeBatch(...)`.
 */
error ERC725X_UnknownOperationType(uint256 operationTypeProvided);

/**
 * @dev Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `staticcall` (`operationType == 3`).
 * Sending native tokens via `staticcall` is not allowed because it is a state changing operation.
 */
error ERC725X_MsgValueDisallowedInStaticCall();

/**
 * @dev Reverts when trying to send native tokens (`value` / `values[]` parameter of {execute} or {executeBatch} functions) while making a `delegatecall` (`operationType == 4`).
 * Sending native tokens via `staticcall` is not allowed because `msg.value` is persisting.
 */
error ERC725X_MsgValueDisallowedInDelegateCall();

/**
 * @dev Reverts when passing a `to` address that is not `address(0)` (= address zero) while deploying a contract via {execute} or {executeBatch} functions.
 * This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).
 */
error ERC725X_CreateOperationsRequireEmptyRecipientAddress();

/**
 * @dev Reverts when contract deployment failed via {execute} or {executeBatch} functions,
 * This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).
 */
error ERC725X_ContractDeploymentFailed();

/**
 * @dev Reverts when no contract bytecode was provided as parameter when trying to deploy a contract via {execute} or {executeBatch}.
 * This error can occur using either operation type 1 (`CREATE`) or 2 (`CREATE2`).
 */
error ERC725X_NoContractBytecodeProvided();

/**
 * @dev Reverts when there is not the same number of elements in the `operationTypes`, `targets` addresses, `values`, and `datas`
 * array parameters provided when calling the {executeBatch} function.
 */
error ERC725X_ExecuteParametersLengthMismatch();

/**
 * @dev Reverts when one of the array parameter provided to the {executeBatch} function is an empty array.
 */
error ERC725X_ExecuteParametersEmptyArray();

/**
 * @dev Reverts when there is not the same number of elements in the `datakeys` and `dataValues`
 * array parameters provided when calling the {setDataBatch} function.
 */
error ERC725Y_DataKeysValuesLengthMismatch();

/**
 * @dev Reverts when one of the array parameter provided to {setDataBatch} function is an empty array.
 */
error ERC725Y_DataKeysValuesEmptyArray();

/**
 * @dev Reverts when sending value to the {setData} or {setDataBatch} function.
 */
error ERC725Y_MsgValueDisallowed();

// File @openzeppelin/contracts/utils/introspection/IERC165.sol@v4.9.3

// OpenZeppelin Contracts v4.4.1 (utils/introspection/IERC165.sol)

/**
 * @dev Interface of the ERC165 standard, as defined in the
 * https://eips.ethereum.org/EIPS/eip-165[EIP].
 *
 * Implementers can declare support of contract interfaces, which can then be
 * queried by others ({ERC165Checker}).
 *
 * For an implementation, see {ERC165}.
 */
interface IERC165 {
    /**
     * @dev Returns true if this contract implements the interface defined by
     * `interfaceId`. See the corresponding
     * https://eips.ethereum.org/EIPS/eip-165#how-interfaces-are-identified[EIP section]
     * to learn more about how these ids are created.
     *
     * This function call must use less than 30 000 gas.
     */
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

// File @erc725/smart-contracts/contracts/interfaces/IERC725X.sol@v5.2.0

// interfaces

/**
 * @title The interface for the ERC725X sub-standard, a generic executor.
 * @dev ERC725X provides the ability to call arbitrary functions on any other smart contract (including itself).
 * It allows to use different type of message calls to interact with addresses such as `call`, `staticcall` and `delegatecall`.
 * It also allows to deploy and create new contracts via both the `create` and `create2` opcodes.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 */
interface IERC725X is IERC165 {
    /**
     * @notice Deployed new contract at address `contractAddress` and funded with `value` wei (deployed using opcode: `operationType`).
     * @dev Emitted when a new contract was created and deployed.
     * @param operationType The opcode used to deploy the contract (`CREATE` or `CREATE2`).
     * @param contractAddress The created contract address.
     * @param value The amount of native tokens (in Wei) sent to fund the created contract on deployment.
     * @param salt The salt used to deterministically deploy the contract (`CREATE2` only). If `CREATE` opcode is used, the salt value will be `bytes32(0)`.
     */
    event ContractCreated(
        uint256 indexed operationType,
        address indexed contractAddress,
        uint256 indexed value,
        bytes32 salt
    );

    /**
     * @notice Called address `target` using `operationType` with `value` wei and `data`.
     * @dev Emitted when calling an address `target` (EOA or contract) with `value`.
     * @param operationType The low-level call opcode used to call the `target` address (`CALL`, `STATICALL` or `DELEGATECALL`).
     * @param target The address to call. `target` will be unused if a contract is created (operation types 1 and 2).
     * @param value The amount of native tokens transferred along the call (in Wei).
     * @param selector The first 4 bytes (= function selector) of the data sent with the call.
     */
    event Executed(
        uint256 indexed operationType,
        address indexed target,
        uint256 indexed value,
        bytes4 selector
    );

    /**
     * @notice Calling address `target` using `operationType`, transferring `value` wei and data: `data`.
     *
     * @param operationType The operation type used: CALL = 0; CREATE = 1; CREATE2 = 2; STATICCALL = 3; DELEGATECALL = 4
     * @param target The address of the EOA or smart contract.  (unused if a contract is created via operation type 1 or 2)
     * @param value The amount of native tokens to transfer (in Wei)
     * @param data The call data, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.
     *
     * @dev Generic executor function to:
     *
     * - send native tokens to any address.
     * - interact with any contract by passing an abi-encoded function call in the `data` parameter.
     * - deploy a contract by providing its creation bytecode in the `data` parameter.
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) external payable returns (bytes memory);

    /**
     * @notice Calling multiple addresses `targets` using `operationsType`, transferring `values` wei and data: `datas`.
     *
     * @dev Batch executor function that behaves the same as {execute} but allowing multiple operations in the same transaction.
     *
     * @param operationsType The list of operations type used: `CALL = 0`; `CREATE = 1`; `CREATE2 = 2`; `STATICCALL = 3`; `DELEGATECALL = 4`
     * @param targets The list of addresses to call. `targets` will be unused if a contract is created (operation types 1 and 2).
     * @param values The list of native token amounts to transfer (in Wei).
     * @param datas The list of calldata, or the creation bytecode of the contract to deploy if `operationType` is `1` or `2`.
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) external payable returns (bytes[] memory);
}

// File @openzeppelin/contracts/utils/Address.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Address.sol)

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     *
     * Furthermore, `isContract` will also return true if the target contract within
     * the same transaction is already scheduled for destruction by `SELFDESTRUCT`,
     * which only has an effect at the end of a transaction.
     * ====
     *
     * [IMPORTANT]
     * ====
     * You shouldn't rely on `isContract` to protect against flash loan attacks!
     *
     * Preventing calls from contracts is highly discouraged. It breaks composability, breaks support for smart wallets
     * like Gnosis Safe, and does not provide security since it can be circumvented by calling from a contract
     * constructor.
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // This method relies on extcodesize/address.code.length, which returns 0
        // for contracts in construction, since the code is only stored at the end
        // of the constructor execution.

        return account.code.length > 0;
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://consensys.net/diligence/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.8.0/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(
            address(this).balance >= amount,
            "Address: insufficient balance"
        );

        (bool success, ) = recipient.call{value: amount}("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
    }

    /**
     * @dev Performs a Solidity function call using a low level `call`. A
     * plain `call` is an unsafe replacement for a function call: use this
     * function instead.
     *
     * If `target` reverts with a revert reason, it is bubbled up by this
     * function (like regular Solidity function calls).
     *
     * Returns the raw returned data. To convert to the expected return value,
     * use https://solidity.readthedocs.io/en/latest/units-and-global-variables.html?highlight=abi.decode#abi-encoding-and-decoding-functions[`abi.decode`].
     *
     * Requirements:
     *
     * - `target` must be a contract.
     * - calling `target` with `data` must not revert.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data
    ) internal returns (bytes memory) {
        return
            functionCallWithValue(
                target,
                data,
                0,
                "Address: low-level call failed"
            );
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`], but with
     * `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but also transferring `value` wei to `target`.
     *
     * Requirements:
     *
     * - the calling contract must have an ETH balance of at least `value`.
     * - the called Solidity function must be `payable`.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value
    ) internal returns (bytes memory) {
        return
            functionCallWithValue(
                target,
                data,
                value,
                "Address: low-level call with value failed"
            );
    }

    /**
     * @dev Same as {xref-Address-functionCallWithValue-address-bytes-uint256-}[`functionCallWithValue`], but
     * with `errorMessage` as a fallback revert reason when `target` reverts.
     *
     * _Available since v3.1._
     */
    function functionCallWithValue(
        address target,
        bytes memory data,
        uint256 value,
        string memory errorMessage
    ) internal returns (bytes memory) {
        require(
            address(this).balance >= value,
            "Address: insufficient balance for call"
        );
        (bool success, bytes memory returndata) = target.call{value: value}(
            data
        );
        return
            verifyCallResultFromTarget(
                target,
                success,
                returndata,
                errorMessage
            );
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data
    ) internal view returns (bytes memory) {
        return
            functionStaticCall(
                target,
                data,
                "Address: low-level static call failed"
            );
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        (bool success, bytes memory returndata) = target.staticcall(data);
        return
            verifyCallResultFromTarget(
                target,
                success,
                returndata,
                errorMessage
            );
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data
    ) internal returns (bytes memory) {
        return
            functionDelegateCall(
                target,
                data,
                "Address: low-level delegate call failed"
            );
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-string-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(
        address target,
        bytes memory data,
        string memory errorMessage
    ) internal returns (bytes memory) {
        (bool success, bytes memory returndata) = target.delegatecall(data);
        return
            verifyCallResultFromTarget(
                target,
                success,
                returndata,
                errorMessage
            );
    }

    /**
     * @dev Tool to verify that a low level call to smart-contract was successful, and revert (either by bubbling
     * the revert reason or using the provided one) in case of unsuccessful call or if target was not a contract.
     *
     * _Available since v4.8._
     */
    function verifyCallResultFromTarget(
        address target,
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal view returns (bytes memory) {
        if (success) {
            if (returndata.length == 0) {
                // only check isContract if the call was successful and the return data is empty
                // otherwise we already know that it was a contract
                require(isContract(target), "Address: call to non-contract");
            }
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    /**
     * @dev Tool to verify that a low level call was successful, and revert if it wasn't, either by bubbling the
     * revert reason or using the provided one.
     *
     * _Available since v4.3._
     */
    function verifyCallResult(
        bool success,
        bytes memory returndata,
        string memory errorMessage
    ) internal pure returns (bytes memory) {
        if (success) {
            return returndata;
        } else {
            _revert(returndata, errorMessage);
        }
    }

    function _revert(
        bytes memory returndata,
        string memory errorMessage
    ) private pure {
        // Look for revert reason and bubble it up if present
        if (returndata.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returndata)
                revert(add(32, returndata), returndata_size)
            }
        } else {
            revert(errorMessage);
        }
    }
}

// File @openzeppelin/contracts/utils/Create2.sol@v4.9.3

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

// File @openzeppelin/contracts/utils/introspection/ERC165.sol@v4.9.3

// OpenZeppelin Contracts v4.4.1 (utils/introspection/ERC165.sol)

/**
 * @dev Implementation of the {IERC165} interface.
 *
 * Contracts that want to implement ERC165 should inherit from this contract and override {supportsInterface} to check
 * for the additional interface id that will be supported. For example:
 *
 * ```solidity
 * function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
 *     return interfaceId == type(MyInterface).interfaceId || super.supportsInterface(interfaceId);
 * }
 * ```
 *
 * Alternatively, {ERC165Storage} provides an easier to use but more expensive implementation.
 */
abstract contract ERC165 is IERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

// File solidity-bytes-utils/contracts/BytesLib.sol@v0.8.0

/*
 * @title Solidity Bytes Arrays Utils
 * @author Gonçalo Sá <goncalo.sa@consensys.net>
 *
 * @dev Bytes tightly packed arrays utility library for ethereum contracts written in Solidity.
 *      The library lets you concatenate, slice and type cast bytes arrays both in memory and storage.
 */

library BytesLib {
    function concat(
        bytes memory _preBytes,
        bytes memory _postBytes
    ) internal pure returns (bytes memory) {
        bytes memory tempBytes;

        assembly {
            // Get a location of some free memory and store it in tempBytes as
            // Solidity does for memory variables.
            tempBytes := mload(0x40)

            // Store the length of the first bytes array at the beginning of
            // the memory for tempBytes.
            let length := mload(_preBytes)
            mstore(tempBytes, length)

            // Maintain a memory counter for the current write location in the
            // temp bytes array by adding the 32 bytes for the array length to
            // the starting location.
            let mc := add(tempBytes, 0x20)
            // Stop copying when the memory counter reaches the length of the
            // first bytes array.
            let end := add(mc, length)

            for {
                // Initialize a copy counter to the start of the _preBytes data,
                // 32 bytes into its memory.
                let cc := add(_preBytes, 0x20)
            } lt(mc, end) {
                // Increase both counters by 32 bytes each iteration.
                mc := add(mc, 0x20)
                cc := add(cc, 0x20)
            } {
                // Write the _preBytes data into the tempBytes memory 32 bytes
                // at a time.
                mstore(mc, mload(cc))
            }

            // Add the length of _postBytes to the current length of tempBytes
            // and store it as the new length in the first 32 bytes of the
            // tempBytes memory.
            length := mload(_postBytes)
            mstore(tempBytes, add(length, mload(tempBytes)))

            // Move the memory counter back from a multiple of 0x20 to the
            // actual end of the _preBytes data.
            mc := end
            // Stop copying when the memory counter reaches the new combined
            // length of the arrays.
            end := add(mc, length)

            for {
                let cc := add(_postBytes, 0x20)
            } lt(mc, end) {
                mc := add(mc, 0x20)
                cc := add(cc, 0x20)
            } {
                mstore(mc, mload(cc))
            }

            // Update the free-memory pointer by padding our last write location
            // to 32 bytes: add 31 bytes to the end of tempBytes to move to the
            // next 32 byte block, then round down to the nearest multiple of
            // 32. If the sum of the length of the two arrays is zero then add
            // one before rounding down to leave a blank 32 bytes (the length block with 0).
            mstore(
                0x40,
                and(
                    add(add(end, iszero(add(length, mload(_preBytes)))), 31),
                    not(31) // Round down to the nearest 32 bytes.
                )
            )
        }

        return tempBytes;
    }

    function concatStorage(
        bytes storage _preBytes,
        bytes memory _postBytes
    ) internal {
        assembly {
            // Read the first 32 bytes of _preBytes storage, which is the length
            // of the array. (We don't need to use the offset into the slot
            // because arrays use the entire slot.)
            let fslot := sload(_preBytes.slot)
            // Arrays of 31 bytes or less have an even value in their slot,
            // while longer arrays have an odd value. The actual length is
            // the slot divided by two for odd values, and the lowest order
            // byte divided by two for even values.
            // If the slot is even, bitwise and the slot with 255 and divide by
            // two to get the length. If the slot is odd, bitwise and the slot
            // with -1 and divide by two.
            let slength := div(
                and(fslot, sub(mul(0x100, iszero(and(fslot, 1))), 1)),
                2
            )
            let mlength := mload(_postBytes)
            let newlength := add(slength, mlength)
            // slength can contain both the length and contents of the array
            // if length < 32 bytes so let's prepare for that
            // v. http://solidity.readthedocs.io/en/latest/miscellaneous.html#layout-of-state-variables-in-storage
            switch add(lt(slength, 32), lt(newlength, 32))
            case 2 {
                // Since the new array still fits in the slot, we just need to
                // update the contents of the slot.
                // uint256(bytes_storage) = uint256(bytes_storage) + uint256(bytes_memory) + new_length
                sstore(
                    _preBytes.slot,
                    // all the modifications to the slot are inside this
                    // next block
                    add(
                        // we can just add to the slot contents because the
                        // bytes we want to change are the LSBs
                        fslot,
                        add(
                            mul(
                                div(
                                    // load the bytes from memory
                                    mload(add(_postBytes, 0x20)),
                                    // zero all bytes to the right
                                    exp(0x100, sub(32, mlength))
                                ),
                                // and now shift left the number of bytes to
                                // leave space for the length in the slot
                                exp(0x100, sub(32, newlength))
                            ),
                            // increase length by the double of the memory
                            // bytes length
                            mul(mlength, 2)
                        )
                    )
                )
            }
            case 1 {
                // The stored value fits in the slot, but the combined value
                // will exceed it.
                // get the keccak hash to get the contents of the array
                mstore(0x0, _preBytes.slot)
                let sc := add(keccak256(0x0, 0x20), div(slength, 32))

                // save new length
                sstore(_preBytes.slot, add(mul(newlength, 2), 1))

                // The contents of the _postBytes array start 32 bytes into
                // the structure. Our first read should obtain the `submod`
                // bytes that can fit into the unused space in the last word
                // of the stored array. To get this, we read 32 bytes starting
                // from `submod`, so the data we read overlaps with the array
                // contents by `submod` bytes. Masking the lowest-order
                // `submod` bytes allows us to add that value directly to the
                // stored value.

                let submod := sub(32, slength)
                let mc := add(_postBytes, submod)
                let end := add(_postBytes, mlength)
                let mask := sub(exp(0x100, submod), 1)

                sstore(
                    sc,
                    add(
                        and(
                            fslot,
                            0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00
                        ),
                        and(mload(mc), mask)
                    )
                )

                for {
                    mc := add(mc, 0x20)
                    sc := add(sc, 1)
                } lt(mc, end) {
                    sc := add(sc, 1)
                    mc := add(mc, 0x20)
                } {
                    sstore(sc, mload(mc))
                }

                mask := exp(0x100, sub(mc, end))

                sstore(sc, mul(div(mload(mc), mask), mask))
            }
            default {
                // get the keccak hash to get the contents of the array
                mstore(0x0, _preBytes.slot)
                // Start copying to the last used word of the stored array.
                let sc := add(keccak256(0x0, 0x20), div(slength, 32))

                // save new length
                sstore(_preBytes.slot, add(mul(newlength, 2), 1))

                // Copy over the first `submod` bytes of the new data as in
                // case 1 above.
                let slengthmod := mod(slength, 32)
                let mlengthmod := mod(mlength, 32)
                let submod := sub(32, slengthmod)
                let mc := add(_postBytes, submod)
                let end := add(_postBytes, mlength)
                let mask := sub(exp(0x100, submod), 1)

                sstore(sc, add(sload(sc), and(mload(mc), mask)))

                for {
                    sc := add(sc, 1)
                    mc := add(mc, 0x20)
                } lt(mc, end) {
                    sc := add(sc, 1)
                    mc := add(mc, 0x20)
                } {
                    sstore(sc, mload(mc))
                }

                mask := exp(0x100, sub(mc, end))

                sstore(sc, mul(div(mload(mc), mask), mask))
            }
        }
    }

    function slice(
        bytes memory _bytes,
        uint256 _start,
        uint256 _length
    ) internal pure returns (bytes memory) {
        require(_length + 31 >= _length, "slice_overflow");
        require(_bytes.length >= _start + _length, "slice_outOfBounds");

        bytes memory tempBytes;

        assembly {
            switch iszero(_length)
            case 0 {
                // Get a location of some free memory and store it in tempBytes as
                // Solidity does for memory variables.
                tempBytes := mload(0x40)

                // The first word of the slice result is potentially a partial
                // word read from the original array. To read it, we calculate
                // the length of that partial word and start copying that many
                // bytes into the array. The first word we copy will start with
                // data we don't care about, but the last `lengthmod` bytes will
                // land at the beginning of the contents of the new array. When
                // we're done copying, we overwrite the full first word with
                // the actual length of the slice.
                let lengthmod := and(_length, 31)

                // The multiplication in the next line is necessary
                // because when slicing multiples of 32 bytes (lengthmod == 0)
                // the following copy loop was copying the origin's length
                // and then ending prematurely not copying everything it should.
                let mc := add(
                    add(tempBytes, lengthmod),
                    mul(0x20, iszero(lengthmod))
                )
                let end := add(mc, _length)

                for {
                    // The multiplication in the next line has the same exact purpose
                    // as the one above.
                    let cc := add(
                        add(
                            add(_bytes, lengthmod),
                            mul(0x20, iszero(lengthmod))
                        ),
                        _start
                    )
                } lt(mc, end) {
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } {
                    mstore(mc, mload(cc))
                }

                mstore(tempBytes, _length)

                //update free-memory pointer
                //allocating the array padded to 32 bytes like the compiler does now
                mstore(0x40, and(add(mc, 31), not(31)))
            }
            //if we want a zero-length slice let's just return a zero-length array
            default {
                tempBytes := mload(0x40)
                //zero out the 32 bytes slice we are about to return
                //we need to do it because Solidity does not garbage collect
                mstore(tempBytes, 0)

                mstore(0x40, add(tempBytes, 0x20))
            }
        }

        return tempBytes;
    }

    function toAddress(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (address) {
        require(_bytes.length >= _start + 20, "toAddress_outOfBounds");
        address tempAddress;

        assembly {
            tempAddress := div(
                mload(add(add(_bytes, 0x20), _start)),
                0x1000000000000000000000000
            )
        }

        return tempAddress;
    }

    function toUint8(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint8) {
        require(_bytes.length >= _start + 1, "toUint8_outOfBounds");
        uint8 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x1), _start))
        }

        return tempUint;
    }

    function toUint16(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint16) {
        require(_bytes.length >= _start + 2, "toUint16_outOfBounds");
        uint16 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x2), _start))
        }

        return tempUint;
    }

    function toUint32(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint32) {
        require(_bytes.length >= _start + 4, "toUint32_outOfBounds");
        uint32 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x4), _start))
        }

        return tempUint;
    }

    function toUint64(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint64) {
        require(_bytes.length >= _start + 8, "toUint64_outOfBounds");
        uint64 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x8), _start))
        }

        return tempUint;
    }

    function toUint96(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint96) {
        require(_bytes.length >= _start + 12, "toUint96_outOfBounds");
        uint96 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0xc), _start))
        }

        return tempUint;
    }

    function toUint128(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint128) {
        require(_bytes.length >= _start + 16, "toUint128_outOfBounds");
        uint128 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x10), _start))
        }

        return tempUint;
    }

    function toUint256(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (uint256) {
        require(_bytes.length >= _start + 32, "toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }

    function toBytes32(
        bytes memory _bytes,
        uint256 _start
    ) internal pure returns (bytes32) {
        require(_bytes.length >= _start + 32, "toBytes32_outOfBounds");
        bytes32 tempBytes32;

        assembly {
            tempBytes32 := mload(add(add(_bytes, 0x20), _start))
        }

        return tempBytes32;
    }

    function equal(
        bytes memory _preBytes,
        bytes memory _postBytes
    ) internal pure returns (bool) {
        bool success = true;

        assembly {
            let length := mload(_preBytes)

            // if lengths don't match the arrays are not equal
            switch eq(length, mload(_postBytes))
            case 1 {
                // cb is a circuit breaker in the for loop since there's
                //  no said feature for inline assembly loops
                // cb = 1 - don't breaker
                // cb = 0 - break
                let cb := 1

                let mc := add(_preBytes, 0x20)
                let end := add(mc, length)

                for {
                    let cc := add(_postBytes, 0x20)
                    // the next line is the loop condition:
                    // while(uint256(mc < end) + cb == 2)
                } eq(add(lt(mc, end), cb), 2) {
                    mc := add(mc, 0x20)
                    cc := add(cc, 0x20)
                } {
                    // if any of these checks fails then arrays are not equal
                    if iszero(eq(mload(mc), mload(cc))) {
                        // unsuccess:
                        success := 0
                        cb := 0
                    }
                }
            }
            default {
                // unsuccess:
                success := 0
            }
        }

        return success;
    }

    function equalStorage(
        bytes storage _preBytes,
        bytes memory _postBytes
    ) internal view returns (bool) {
        bool success = true;

        assembly {
            // we know _preBytes_offset is 0
            let fslot := sload(_preBytes.slot)
            // Decode the length of the stored array like in concatStorage().
            let slength := div(
                and(fslot, sub(mul(0x100, iszero(and(fslot, 1))), 1)),
                2
            )
            let mlength := mload(_postBytes)

            // if lengths don't match the arrays are not equal
            switch eq(slength, mlength)
            case 1 {
                // slength can contain both the length and contents of the array
                // if length < 32 bytes so let's prepare for that
                // v. http://solidity.readthedocs.io/en/latest/miscellaneous.html#layout-of-state-variables-in-storage
                if iszero(iszero(slength)) {
                    switch lt(slength, 32)
                    case 1 {
                        // blank the last byte which is the length
                        fslot := mul(div(fslot, 0x100), 0x100)

                        if iszero(eq(fslot, mload(add(_postBytes, 0x20)))) {
                            // unsuccess:
                            success := 0
                        }
                    }
                    default {
                        // cb is a circuit breaker in the for loop since there's
                        //  no said feature for inline assembly loops
                        // cb = 1 - don't breaker
                        // cb = 0 - break
                        let cb := 1

                        // get the keccak hash to get the contents of the array
                        mstore(0x0, _preBytes.slot)
                        let sc := keccak256(0x0, 0x20)

                        let mc := add(_postBytes, 0x20)
                        let end := add(mc, mlength)

                        // the next line is the loop condition:
                        // while(uint256(mc < end) + cb == 2)
                        for {} eq(add(lt(mc, end), cb), 2) {
                            sc := add(sc, 1)
                            mc := add(mc, 0x20)
                        } {
                            if iszero(eq(sload(sc), mload(mc))) {
                                // unsuccess:
                                success := 0
                                cb := 0
                            }
                        }
                    }
                }
            }
            default {
                // unsuccess:
                success := 0
            }
        }

        return success;
    }
}

// File @erc725/smart-contracts/contracts/ERC725XCore.sol@v5.2.0

// interfaces

// libraries

// modules

// constants

/**
 * @title Core implementation of ERC725X sub-standard, a generic executor.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * It allows to use different type of message calls to interact with addresses such as `call`, `staticcall` and `delegatecall`.
 * It also allows to deploy and create new contracts via both the `create` and `create2` opcodes.
 * This is the basis for a smart contract based account system, but could also be used as a proxy account system.
 */
abstract contract ERC725XCore is OwnableUnset, ERC165, IERC725X {
    /**
     * @inheritdoc IERC725X
     * @custom:requirements
     * - SHOULD only be callable by the {owner} of the contract.
     * - if a `value` is provided, the contract MUST have at least this amount to transfer to `target` from its balance and execute successfully.
     * - if the operation type is `STATICCALL` (`3`) or `DELEGATECALL` (`4`), `value` transfer is disallowed and SHOULD be 0.
     * - `target` SHOULD be `address(0)` when deploying a new contract via `operationType` `CREATE` (`1`), or `CREATE2` (`2`).
     *
     * @custom:events
     * - {Executed} event when a call is made with `operationType` 0 (CALL), 3 (STATICCALL) or 4 (DELEGATECALL).
     * - {ContractCreated} event when deploying a new contract with `operationType` 1 (CREATE) or 2 (CREATE2).
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override onlyOwner returns (bytes memory) {
        return _execute(operationType, target, value, data);
    }

    /**
     * @inheritdoc IERC725X
     * @custom:requirements
     * - All the array parameters provided MUST be equal and have the same length.
     * - SHOULD only be callable by the {owner} of the contract.
     * - The contract MUST have in its balance **at least the sum of all the `values`** to transfer and execute successfully each calldata payloads.
     *
     * @custom:events
     * - {Executed} event, when a call is made with `operationType` 0 (CALL), 3 (STATICCALL) or 4 (DELEGATECALL)
     * - {ContractCreated} event, when deploying a contract with `operationType` 1 (CREATE) or 2 (CREATE2)
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override onlyOwner returns (bytes[] memory) {
        return _executeBatch(operationsType, targets, values, datas);
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC165) returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC725X ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev check the `operationType` provided and perform the associated low-level opcode after checking for requirements (see {execute}).
     */
    function _execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory) {
        // CALL
        if (operationType == OPERATION_0_CALL) {
            return _executeCall(target, value, data);
        }

        // Deploy with CREATE
        if (operationType == OPERATION_1_CREATE) {
            if (target != address(0))
                revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate(value, data);
        }

        // Deploy with CREATE2
        if (operationType == OPERATION_2_CREATE2) {
            if (target != address(0))
                revert ERC725X_CreateOperationsRequireEmptyRecipientAddress();
            return _deployCreate2(value, data);
        }

        // STATICCALL
        if (operationType == OPERATION_3_STATICCALL) {
            if (value != 0) revert ERC725X_MsgValueDisallowedInStaticCall();
            return _executeStaticCall(target, data);
        }

        // DELEGATECALL
        //
        // WARNING! delegatecall is a dangerous operation type! use with EXTRA CAUTION
        //
        // delegate allows to call another deployed contract and use its functions
        // to update the state of the current calling contract.
        //
        // this can lead to unexpected behaviour on the contract storage, such as:
        // - updating any state variables (even if these are protected)
        // - update the contract owner
        // - run selfdestruct in the context of this contract
        //
        if (operationType == OPERATION_4_DELEGATECALL) {
            if (value != 0) revert ERC725X_MsgValueDisallowedInDelegateCall();
            return _executeDelegateCall(target, data);
        }

        revert ERC725X_UnknownOperationType(operationType);
    }

    /**
     * @dev check each `operationType` provided in the batch and perform the associated low-level opcode after checking for requirements (see {executeBatch}).
     */
    function _executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) internal virtual returns (bytes[] memory) {
        if (
            operationsType.length != targets.length ||
            (targets.length != values.length || values.length != datas.length)
        ) {
            revert ERC725X_ExecuteParametersLengthMismatch();
        }

        if (operationsType.length == 0) {
            revert ERC725X_ExecuteParametersEmptyArray();
        }

        bytes[] memory result = new bytes[](operationsType.length);

        for (uint256 i = 0; i < operationsType.length; ) {
            result[i] = _execute(
                operationsType[i],
                targets[i],
                values[i],
                datas[i]
            );

            // Increment the iterator in unchecked block to save gas
            unchecked {
                ++i;
            }
        }

        return result;
    }

    /**
     * @dev Perform low-level call (operation type = 0)
     * @param target The address on which call is executed
     * @param value The value to be sent with the call
     * @param data The data to be sent with the call
     * @return result The data from the call
     */
    function _executeCall(
        address target,
        uint256 value,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        if (address(this).balance < value) {
            revert ERC725X_InsufficientBalance(address(this).balance, value);
        }

        emit Executed(OPERATION_0_CALL, target, value, bytes4(data));

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = target.call{value: value}(
            data
        );
        return
            Address.verifyCallResult(
                success,
                returnData,
                "ERC725X: Unknown Error"
            );
    }

    /**
     * @dev Perform low-level staticcall (operation type = 3)
     * @param target The address on which staticcall is executed
     * @param data The data to be sent with the staticcall
     * @return result The data returned from the staticcall
     */
    function _executeStaticCall(
        address target,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        emit Executed(OPERATION_3_STATICCALL, target, 0, bytes4(data));

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = target.staticcall(data);
        return
            Address.verifyCallResult(
                success,
                returnData,
                "ERC725X: Unknown Error"
            );
    }

    /**
     * @dev Perform low-level delegatecall (operation type = 4)
     * @param target The address on which delegatecall is executed
     * @param data The data to be sent with the delegatecall
     * @return result The data returned from the delegatecall
     */
    function _executeDelegateCall(
        address target,
        bytes memory data
    ) internal virtual returns (bytes memory result) {
        emit Executed(OPERATION_4_DELEGATECALL, target, 0, bytes4(data));

        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returnData) = target.delegatecall(data);
        return
            Address.verifyCallResult(
                success,
                returnData,
                "ERC725X: Unknown Error"
            );
    }

    /**
     * @dev Deploy a contract using the `CREATE` opcode (operation type = 1)
     * @param value The value to be sent to the contract created
     * @param creationCode The contract creation bytecode to deploy appended with the constructor argument(s)
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate(
        uint256 value,
        bytes memory creationCode
    ) internal virtual returns (bytes memory newContract) {
        if (address(this).balance < value) {
            revert ERC725X_InsufficientBalance(address(this).balance, value);
        }

        if (creationCode.length == 0) {
            revert ERC725X_NoContractBytecodeProvided();
        }

        address contractAddress;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            contractAddress := create(
                value,
                add(creationCode, 0x20),
                mload(creationCode)
            )
        }

        if (contractAddress == address(0)) {
            revert ERC725X_ContractDeploymentFailed();
        }

        emit ContractCreated(
            OPERATION_1_CREATE,
            contractAddress,
            value,
            bytes32(0)
        );
        return abi.encodePacked(contractAddress);
    }

    /**
     * @dev Deploy a contract using the `CREATE2` opcode (operation type = 2)
     * @param value The value to be sent to the contract created
     * @param creationCode The contract creation bytecode to deploy appended with the constructor argument(s) and a bytes32 salt
     * @return newContract The address of the contract created as bytes
     */
    function _deployCreate2(
        uint256 value,
        bytes memory creationCode
    ) internal virtual returns (bytes memory newContract) {
        if (creationCode.length == 0) {
            revert ERC725X_NoContractBytecodeProvided();
        }

        bytes32 salt = BytesLib.toBytes32(
            creationCode,
            creationCode.length - 32
        );
        bytes memory bytecode = BytesLib.slice(
            creationCode,
            0,
            creationCode.length - 32
        );
        address contractAddress = Create2.deploy(value, salt, bytecode);

        emit ContractCreated(OPERATION_2_CREATE2, contractAddress, value, salt);
        return abi.encodePacked(contractAddress);
    }
}

// File @erc725/smart-contracts/contracts/interfaces/IERC725Y.sol@v5.2.0

// interfaces

/**
 * @title The interface for ERC725Y sub-standard, a generic data key/value store.
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
interface IERC725Y is IERC165 {
    /**
     * @notice The following data key/value pair has been changed in the ERC725Y storage: Data key: `dataKey`, data value: `dataValue`.
     * @dev Emitted when data at a specific `dataKey` was changed to a new value `dataValue`.
     * @param dataKey The data key for which a bytes value is set.
     * @param dataValue The value to set for the given data key.
     */
    event DataChanged(bytes32 indexed dataKey, bytes dataValue);

    /**
     * @notice Reading the ERC725Y storage for data key `dataKey` returned the following value: `dataValue`.
     * @dev Get in the ERC725Y storage the bytes data stored at a specific data key `dataKey`.
     * @param dataKey The data key for which to retrieve the value.
     * @return dataValue The bytes value stored under the specified data key.
     */
    function getData(
        bytes32 dataKey
    ) external view returns (bytes memory dataValue);

    /**
     * @notice Reading the ERC725Y storage for data keys `dataKeys` returned the following values: `dataValues`.
     * @dev Get in the ERC725Y storage the bytes data stored at multiple data keys `dataKeys`.
     * @param dataKeys The array of keys which values to retrieve
     * @return dataValues The array of data stored at multiple keys
     */
    function getDataBatch(
        bytes32[] memory dataKeys
    ) external view returns (bytes[] memory dataValues);

    /**
     * @notice Setting the following data key value pair in the ERC725Y storage. Data key: `dataKey`, data value: `dataValue`.
     *
     * @dev Sets a single bytes value `dataValue` in the ERC725Y storage for a specific data key `dataKey`.
     * The function is marked as payable to enable flexibility on child contracts. For instance to implement
     * a fee mechanism for setting specific data.
     *
     * @param dataKey The data key for which to set a new value.
     * @param dataValue The new bytes value to set.
     */
    function setData(bytes32 dataKey, bytes memory dataValue) external payable;

    /**
     * @notice Setting the following data key value pairs in the ERC725Y storage. Data keys: `dataKeys`, data values: `dataValues`.
     *
     * @dev Batch data setting function that behaves the same as {setData} but allowing to set multiple data key/value pairs in the ERC725Y storage in the same transaction.
     *
     * @param dataKeys An array of data keys to set bytes values for.
     * @param dataValues An array of bytes values to set for each `dataKeys`.
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) external payable;
}

// File @erc725/smart-contracts/contracts/ERC725YCore.sol@v5.2.0

// interfaces

// modules

// constants

/**
 * @title Core implementation of ERC725Y sub-standard, a general data key/value store.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
abstract contract ERC725YCore is OwnableUnset, ERC165, IERC725Y {
    /**
     * @dev Map `bytes32` data keys to their `bytes` data values.
     */
    mapping(bytes32 => bytes) internal _store;

    /**
     * @inheritdoc IERC725Y
     */
    function getData(
        bytes32 dataKey
    ) public view virtual override returns (bytes memory dataValue) {
        dataValue = _getData(dataKey);
    }

    /**
     * @inheritdoc IERC725Y
     */
    function getDataBatch(
        bytes32[] memory dataKeys
    ) public view virtual override returns (bytes[] memory dataValues) {
        dataValues = new bytes[](dataKeys.length);

        for (uint256 i = 0; i < dataKeys.length; ) {
            dataValues[i] = _getData(dataKeys[i]);

            // Increment the iterator in unchecked block to save gas
            unchecked {
                ++i;
            }
        }

        return dataValues;
    }

    /**
     * @inheritdoc IERC725Y
     * @custom:requirements
     * - SHOULD only be callable by the {owner}.
     *
     * @custom:warning
     * **Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value
     * (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.
     *
     * @custom:events {DataChanged} event.
     */
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override onlyOwner {
        if (msg.value != 0) revert ERC725Y_MsgValueDisallowed();
        _setData(dataKey, dataValue);
    }

    /**
     * @inheritdoc IERC725Y
     * @custom:requirements
     * - SHOULD only be callable by the {owner} of the contract.
     *
     * @custom:warning
     * **Note for developers:** despite the fact that this function is set as `payable`, if the function is not intended to receive value
     * (= native tokens), **an additional check should be implemented to ensure that `msg.value` sent was equal to 0**.
     *
     * @custom:events {DataChanged} event **for each data key/value pair set**.
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override onlyOwner {
        /// @dev do not allow to send value by default when setting data in ERC725Y
        if (msg.value != 0) revert ERC725Y_MsgValueDisallowed();

        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        if (dataKeys.length == 0) {
            revert ERC725Y_DataKeysValuesEmptyArray();
        }

        for (uint256 i = 0; i < dataKeys.length; ) {
            _setData(dataKeys[i], dataValues[i]);

            // Increment the iterator in unchecked block to save gas
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Read the value stored under a specific `dataKey` inside the underlying ERC725Y storage,
     *  represented as a mapping of `bytes32` data keys mapped to their `bytes` data values.
     *
     * ```solidity
     * mapping(bytes32 => bytes) _store
     * ```
     *
     * @param dataKey A bytes32 data key to read the associated `bytes` value from the store.
     * @return dataValue The `bytes` value associated with the given `dataKey` in the ERC725Y storage.
     */
    function _getData(
        bytes32 dataKey
    ) internal view virtual returns (bytes memory dataValue) {
        return _store[dataKey];
    }

    /**
     * @dev Write a `dataValue` to the underlying ERC725Y storage, represented as a mapping of
     * `bytes32` data keys mapped to their `bytes` data values.
     *
     * ```solidity
     * mapping(bytes32 => bytes) _store
     * ```
     *
     * @param dataKey A bytes32 data key to write the associated `bytes` value to the store.
     * @param dataValue The `bytes` value to associate with the given `dataKey` in the ERC725Y storage.
     *
     * @custom:events {DataChanged} event emitted after a successful `setData` call.
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual {
        _store[dataKey] = dataValue;
        emit DataChanged(dataKey, dataValue);
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(IERC165, ERC165) returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}

// File @openzeppelin/contracts/utils/math/Math.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/math/Math.sol)

/**
 * @dev Standard math utilities missing in the Solidity language.
 */
library Math {
    enum Rounding {
        Down, // Toward negative infinity
        Up, // Toward infinity
        Zero // Toward zero
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two numbers.
     */
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two numbers. The result is rounded towards
     * zero.
     */
    function average(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b) / 2 can overflow.
        return (a & b) + (a ^ b) / 2;
    }

    /**
     * @dev Returns the ceiling of the division of two numbers.
     *
     * This differs from standard division with `/` in that it rounds up instead
     * of rounding down.
     */
    function ceilDiv(uint256 a, uint256 b) internal pure returns (uint256) {
        // (a + b - 1) / b can overflow on addition, so we distribute.
        return a == 0 ? 0 : (a - 1) / b + 1;
    }

    /**
     * @notice Calculates floor(x * y / denominator) with full precision. Throws if result overflows a uint256 or denominator == 0
     * @dev Original credit to Remco Bloemen under MIT license (https://xn--2-umb.com/21/muldiv)
     * with further edits by Uniswap Labs also under MIT license.
     */
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator
    ) internal pure returns (uint256 result) {
        unchecked {
            // 512-bit multiply [prod1 prod0] = x * y. Compute the product mod 2^256 and mod 2^256 - 1, then use
            // use the Chinese Remainder Theorem to reconstruct the 512 bit result. The result is stored in two 256
            // variables such that product = prod1 * 2^256 + prod0.
            uint256 prod0; // Least significant 256 bits of the product
            uint256 prod1; // Most significant 256 bits of the product
            assembly {
                let mm := mulmod(x, y, not(0))
                prod0 := mul(x, y)
                prod1 := sub(sub(mm, prod0), lt(mm, prod0))
            }

            // Handle non-overflow cases, 256 by 256 division.
            if (prod1 == 0) {
                // Solidity will revert if denominator == 0, unlike the div opcode on its own.
                // The surrounding unchecked block does not change this fact.
                // See https://docs.soliditylang.org/en/latest/control-structures.html#checked-or-unchecked-arithmetic.
                return prod0 / denominator;
            }

            // Make sure the result is less than 2^256. Also prevents denominator == 0.
            require(denominator > prod1, "Math: mulDiv overflow");

            ///////////////////////////////////////////////
            // 512 by 256 division.
            ///////////////////////////////////////////////

            // Make division exact by subtracting the remainder from [prod1 prod0].
            uint256 remainder;
            assembly {
                // Compute remainder using mulmod.
                remainder := mulmod(x, y, denominator)

                // Subtract 256 bit number from 512 bit number.
                prod1 := sub(prod1, gt(remainder, prod0))
                prod0 := sub(prod0, remainder)
            }

            // Factor powers of two out of denominator and compute largest power of two divisor of denominator. Always >= 1.
            // See https://cs.stackexchange.com/q/138556/92363.

            // Does not overflow because the denominator cannot be zero at this stage in the function.
            uint256 twos = denominator & (~denominator + 1);
            assembly {
                // Divide denominator by twos.
                denominator := div(denominator, twos)

                // Divide [prod1 prod0] by twos.
                prod0 := div(prod0, twos)

                // Flip twos such that it is 2^256 / twos. If twos is zero, then it becomes one.
                twos := add(div(sub(0, twos), twos), 1)
            }

            // Shift in bits from prod1 into prod0.
            prod0 |= prod1 * twos;

            // Invert denominator mod 2^256. Now that denominator is an odd number, it has an inverse modulo 2^256 such
            // that denominator * inv = 1 mod 2^256. Compute the inverse by starting with a seed that is correct for
            // four bits. That is, denominator * inv = 1 mod 2^4.
            uint256 inverse = (3 * denominator) ^ 2;

            // Use the Newton-Raphson iteration to improve the precision. Thanks to Hensel's lifting lemma, this also works
            // in modular arithmetic, doubling the correct bits in each step.
            inverse *= 2 - denominator * inverse; // inverse mod 2^8
            inverse *= 2 - denominator * inverse; // inverse mod 2^16
            inverse *= 2 - denominator * inverse; // inverse mod 2^32
            inverse *= 2 - denominator * inverse; // inverse mod 2^64
            inverse *= 2 - denominator * inverse; // inverse mod 2^128
            inverse *= 2 - denominator * inverse; // inverse mod 2^256

            // Because the division is now exact we can divide by multiplying with the modular inverse of denominator.
            // This will give us the correct result modulo 2^256. Since the preconditions guarantee that the outcome is
            // less than 2^256, this is the final result. We don't need to compute the high bits of the result and prod1
            // is no longer required.
            result = prod0 * inverse;
            return result;
        }
    }

    /**
     * @notice Calculates x * y / denominator with full precision, following the selected rounding direction.
     */
    function mulDiv(
        uint256 x,
        uint256 y,
        uint256 denominator,
        Rounding rounding
    ) internal pure returns (uint256) {
        uint256 result = mulDiv(x, y, denominator);
        if (rounding == Rounding.Up && mulmod(x, y, denominator) > 0) {
            result += 1;
        }
        return result;
    }

    /**
     * @dev Returns the square root of a number. If the number is not a perfect square, the value is rounded down.
     *
     * Inspired by Henry S. Warren, Jr.'s "Hacker's Delight" (Chapter 11).
     */
    function sqrt(uint256 a) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }

        // For our first guess, we get the biggest power of 2 which is smaller than the square root of the target.
        //
        // We know that the "msb" (most significant bit) of our target number `a` is a power of 2 such that we have
        // `msb(a) <= a < 2*msb(a)`. This value can be written `msb(a)=2**k` with `k=log2(a)`.
        //
        // This can be rewritten `2**log2(a) <= a < 2**(log2(a) + 1)`
        // → `sqrt(2**k) <= sqrt(a) < sqrt(2**(k+1))`
        // → `2**(k/2) <= sqrt(a) < 2**((k+1)/2) <= 2**(k/2 + 1)`
        //
        // Consequently, `2**(log2(a) / 2)` is a good first approximation of `sqrt(a)` with at least 1 correct bit.
        uint256 result = 1 << (log2(a) >> 1);

        // At this point `result` is an estimation with one bit of precision. We know the true value is a uint128,
        // since it is the square root of a uint256. Newton's method converges quadratically (precision doubles at
        // every iteration). We thus need at most 7 iteration to turn our partial result with one bit of precision
        // into the expected uint128 result.
        unchecked {
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            result = (result + a / result) >> 1;
            return min(result, a / result);
        }
    }

    /**
     * @notice Calculates sqrt(a), following the selected rounding direction.
     */
    function sqrt(
        uint256 a,
        Rounding rounding
    ) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return
                result +
                (rounding == Rounding.Up && result * result < a ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 2, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 128;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 64;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 32;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 16;
            }
            if (value >> 8 > 0) {
                value >>= 8;
                result += 8;
            }
            if (value >> 4 > 0) {
                value >>= 4;
                result += 4;
            }
            if (value >> 2 > 0) {
                value >>= 2;
                result += 2;
            }
            if (value >> 1 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 2, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log2(
        uint256 value,
        Rounding rounding
    ) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return
                result +
                (rounding == Rounding.Up && 1 << result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 10, rounded down, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >= 10 ** 64) {
                value /= 10 ** 64;
                result += 64;
            }
            if (value >= 10 ** 32) {
                value /= 10 ** 32;
                result += 32;
            }
            if (value >= 10 ** 16) {
                value /= 10 ** 16;
                result += 16;
            }
            if (value >= 10 ** 8) {
                value /= 10 ** 8;
                result += 8;
            }
            if (value >= 10 ** 4) {
                value /= 10 ** 4;
                result += 4;
            }
            if (value >= 10 ** 2) {
                value /= 10 ** 2;
                result += 2;
            }
            if (value >= 10 ** 1) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 10, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log10(
        uint256 value,
        Rounding rounding
    ) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return
                result +
                (rounding == Rounding.Up && 10 ** result < value ? 1 : 0);
        }
    }

    /**
     * @dev Return the log in base 256, rounded down, of a positive value.
     * Returns 0 if given 0.
     *
     * Adding one to the result gives the number of pairs of hex symbols needed to represent `value` as a hex string.
     */
    function log256(uint256 value) internal pure returns (uint256) {
        uint256 result = 0;
        unchecked {
            if (value >> 128 > 0) {
                value >>= 128;
                result += 16;
            }
            if (value >> 64 > 0) {
                value >>= 64;
                result += 8;
            }
            if (value >> 32 > 0) {
                value >>= 32;
                result += 4;
            }
            if (value >> 16 > 0) {
                value >>= 16;
                result += 2;
            }
            if (value >> 8 > 0) {
                result += 1;
            }
        }
        return result;
    }

    /**
     * @dev Return the log in base 256, following the selected rounding direction, of a positive value.
     * Returns 0 if given 0.
     */
    function log256(
        uint256 value,
        Rounding rounding
    ) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return
                result +
                (rounding == Rounding.Up && 1 << (result << 3) < value ? 1 : 0);
        }
    }
}

// File @openzeppelin/contracts/utils/math/SignedMath.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.8.0) (utils/math/SignedMath.sol)

/**
 * @dev Standard signed math utilities missing in the Solidity language.
 */
library SignedMath {
    /**
     * @dev Returns the largest of two signed numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a > b ? a : b;
    }

    /**
     * @dev Returns the smallest of two signed numbers.
     */
    function min(int256 a, int256 b) internal pure returns (int256) {
        return a < b ? a : b;
    }

    /**
     * @dev Returns the average of two signed numbers without overflow.
     * The result is rounded towards zero.
     */
    function average(int256 a, int256 b) internal pure returns (int256) {
        // Formula from the book "Hacker's Delight"
        int256 x = (a & b) + ((a ^ b) >> 1);
        return x + (int256(uint256(x) >> 255) & (a ^ b));
    }

    /**
     * @dev Returns the absolute unsigned value of a signed value.
     */
    function abs(int256 n) internal pure returns (uint256) {
        unchecked {
            // must be unchecked in order to support `n = type(int256).min`
            return uint256(n >= 0 ? n : -n);
        }
    }
}

// File @openzeppelin/contracts/utils/Strings.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Strings.sol)

/**
 * @dev String operations.
 */
library Strings {
    bytes16 private constant _SYMBOLS = "0123456789abcdef";
    uint8 private constant _ADDRESS_LENGTH = 20;

    /**
     * @dev Converts a `uint256` to its ASCII `string` decimal representation.
     */
    function toString(uint256 value) internal pure returns (string memory) {
        unchecked {
            uint256 length = Math.log10(value) + 1;
            string memory buffer = new string(length);
            uint256 ptr;
            /// @solidity memory-safe-assembly
            assembly {
                ptr := add(buffer, add(32, length))
            }
            while (true) {
                ptr--;
                /// @solidity memory-safe-assembly
                assembly {
                    mstore8(ptr, byte(mod(value, 10), _SYMBOLS))
                }
                value /= 10;
                if (value == 0) break;
            }
            return buffer;
        }
    }

    /**
     * @dev Converts a `int256` to its ASCII `string` decimal representation.
     */
    function toString(int256 value) internal pure returns (string memory) {
        return
            string(
                abi.encodePacked(
                    value < 0 ? "-" : "",
                    toString(SignedMath.abs(value))
                )
            );
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation.
     */
    function toHexString(uint256 value) internal pure returns (string memory) {
        unchecked {
            return toHexString(value, Math.log256(value) + 1);
        }
    }

    /**
     * @dev Converts a `uint256` to its ASCII `string` hexadecimal representation with fixed length.
     */
    function toHexString(
        uint256 value,
        uint256 length
    ) internal pure returns (string memory) {
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = _SYMBOLS[value & 0xf];
            value >>= 4;
        }
        require(value == 0, "Strings: hex length insufficient");
        return string(buffer);
    }

    /**
     * @dev Converts an `address` with fixed length of 20 bytes to its not checksummed ASCII `string` hexadecimal representation.
     */
    function toHexString(address addr) internal pure returns (string memory) {
        return toHexString(uint256(uint160(addr)), _ADDRESS_LENGTH);
    }

    /**
     * @dev Returns true if the two strings are equal.
     */
    function equal(
        string memory a,
        string memory b
    ) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}

// File @openzeppelin/contracts/utils/cryptography/ECDSA.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/cryptography/ECDSA.sol)

/**
 * @dev Elliptic Curve Digital Signature Algorithm (ECDSA) operations.
 *
 * These functions can be used to verify that a message was signed by the holder
 * of the private keys of a given address.
 */
library ECDSA {
    enum RecoverError {
        NoError,
        InvalidSignature,
        InvalidSignatureLength,
        InvalidSignatureS,
        InvalidSignatureV // Deprecated in v4.8
    }

    function _throwError(RecoverError error) private pure {
        if (error == RecoverError.NoError) {
            return; // no error: do nothing
        } else if (error == RecoverError.InvalidSignature) {
            revert("ECDSA: invalid signature");
        } else if (error == RecoverError.InvalidSignatureLength) {
            revert("ECDSA: invalid signature length");
        } else if (error == RecoverError.InvalidSignatureS) {
            revert("ECDSA: invalid signature 's' value");
        }
    }

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature` or error string. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {toEthSignedMessageHash} on it.
     *
     * Documentation for signature generation:
     * - with https://web3js.readthedocs.io/en/v1.3.4/web3-eth-accounts.html#sign[Web3.js]
     * - with https://docs.ethers.io/v5/api/signer/#Signer-signMessage[ethers]
     *
     * _Available since v4.3._
     */
    function tryRecover(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address, RecoverError) {
        if (signature.length == 65) {
            bytes32 r;
            bytes32 s;
            uint8 v;
            // ecrecover takes the signature parameters, and the only way to get them
            // currently is to use assembly.
            /// @solidity memory-safe-assembly
            assembly {
                r := mload(add(signature, 0x20))
                s := mload(add(signature, 0x40))
                v := byte(0, mload(add(signature, 0x60)))
            }
            return tryRecover(hash, v, r, s);
        } else {
            return (address(0), RecoverError.InvalidSignatureLength);
        }
    }

    /**
     * @dev Returns the address that signed a hashed message (`hash`) with
     * `signature`. This address can then be used for verification purposes.
     *
     * The `ecrecover` EVM opcode allows for malleable (non-unique) signatures:
     * this function rejects them by requiring the `s` value to be in the lower
     * half order, and the `v` value to be either 27 or 28.
     *
     * IMPORTANT: `hash` _must_ be the result of a hash operation for the
     * verification to be secure: it is possible to craft signatures that
     * recover to arbitrary addresses for non-hashed data. A safe way to ensure
     * this is by receiving a hash of the original message (which may otherwise
     * be too long), and then calling {toEthSignedMessageHash} on it.
     */
    function recover(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address) {
        (address recovered, RecoverError error) = tryRecover(hash, signature);
        _throwError(error);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `r` and `vs` short-signature fields separately.
     *
     * See https://eips.ethereum.org/EIPS/eip-2098[EIP-2098 short signatures]
     *
     * _Available since v4.3._
     */
    function tryRecover(
        bytes32 hash,
        bytes32 r,
        bytes32 vs
    ) internal pure returns (address, RecoverError) {
        bytes32 s = vs &
            bytes32(
                0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            );
        uint8 v = uint8((uint256(vs) >> 255) + 27);
        return tryRecover(hash, v, r, s);
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `r and `vs` short-signature fields separately.
     *
     * _Available since v4.2._
     */
    function recover(
        bytes32 hash,
        bytes32 r,
        bytes32 vs
    ) internal pure returns (address) {
        (address recovered, RecoverError error) = tryRecover(hash, r, vs);
        _throwError(error);
        return recovered;
    }

    /**
     * @dev Overload of {ECDSA-tryRecover} that receives the `v`,
     * `r` and `s` signature fields separately.
     *
     * _Available since v4.3._
     */
    function tryRecover(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address, RecoverError) {
        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (301): 0 < s < secp256k1n ÷ 2 + 1, and for v in (302): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (
            uint256(s) >
            0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0
        ) {
            return (address(0), RecoverError.InvalidSignatureS);
        }

        // If the signature is valid (and not malleable), return the signer address
        address signer = ecrecover(hash, v, r, s);
        if (signer == address(0)) {
            return (address(0), RecoverError.InvalidSignature);
        }

        return (signer, RecoverError.NoError);
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `v`,
     * `r` and `s` signature fields separately.
     */
    function recover(
        bytes32 hash,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) internal pure returns (address) {
        (address recovered, RecoverError error) = tryRecover(hash, v, r, s);
        _throwError(error);
        return recovered;
    }

    /**
     * @dev Returns an Ethereum Signed Message, created from a `hash`. This
     * produces hash corresponding to the one signed with the
     * https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
     * JSON-RPC method as part of EIP-191.
     *
     * See {recover}.
     */
    function toEthSignedMessageHash(
        bytes32 hash
    ) internal pure returns (bytes32 message) {
        // 32 is the length in bytes of hash,
        // enforced by the type signature above
        /// @solidity memory-safe-assembly
        assembly {
            mstore(0x00, "\x19Ethereum Signed Message:\n32")
            mstore(0x1c, hash)
            message := keccak256(0x00, 0x3c)
        }
    }

    /**
     * @dev Returns an Ethereum Signed Message, created from `s`. This
     * produces hash corresponding to the one signed with the
     * https://eth.wiki/json-rpc/API#eth_sign[`eth_sign`]
     * JSON-RPC method as part of EIP-191.
     *
     * See {recover}.
     */
    function toEthSignedMessageHash(
        bytes memory s
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n",
                    Strings.toString(s.length),
                    s
                )
            );
    }

    /**
     * @dev Returns an Ethereum Signed Typed Data, created from a
     * `domainSeparator` and a `structHash`. This produces hash corresponding
     * to the one signed with the
     * https://eips.ethereum.org/EIPS/eip-712[`eth_signTypedData`]
     * JSON-RPC method as part of EIP-712.
     *
     * See {recover}.
     */
    function toTypedDataHash(
        bytes32 domainSeparator,
        bytes32 structHash
    ) internal pure returns (bytes32 data) {
        /// @solidity memory-safe-assembly
        assembly {
            let ptr := mload(0x40)
            mstore(ptr, "\x19\x01")
            mstore(add(ptr, 0x02), domainSeparator)
            mstore(add(ptr, 0x22), structHash)
            data := keccak256(ptr, 0x42)
        }
    }

    /**
     * @dev Returns an Ethereum Signed Data with intended validator, created from a
     * `validator` and `data` according to the version 0 of EIP-191.
     *
     * See {recover}.
     */
    function toDataWithIntendedValidatorHash(
        address validator,
        bytes memory data
    ) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x00", validator, data));
    }
}

// File @openzeppelin/contracts/utils/introspection/ERC165Checker.sol@v4.9.3

// OpenZeppelin Contracts (last updated v4.9.0) (utils/introspection/ERC165Checker.sol)

/**
 * @dev Library used to query support of an interface declared via {IERC165}.
 *
 * Note that these functions return the actual result of the query: they do not
 * `revert` if an interface is not supported. It is up to the caller to decide
 * what to do in these cases.
 */
library ERC165Checker {
    // As per the EIP-165 spec, no interface should ever match 0xffffffff
    bytes4 private constant _INTERFACE_ID_INVALID = 0xffffffff;

    /**
     * @dev Returns true if `account` supports the {IERC165} interface.
     */
    function supportsERC165(address account) internal view returns (bool) {
        // Any contract that implements ERC165 must explicitly indicate support of
        // InterfaceId_ERC165 and explicitly indicate non-support of InterfaceId_Invalid
        return
            supportsERC165InterfaceUnchecked(
                account,
                type(IERC165).interfaceId
            ) &&
            !supportsERC165InterfaceUnchecked(account, _INTERFACE_ID_INVALID);
    }

    /**
     * @dev Returns true if `account` supports the interface defined by
     * `interfaceId`. Support for {IERC165} itself is queried automatically.
     *
     * See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        address account,
        bytes4 interfaceId
    ) internal view returns (bool) {
        // query support of both ERC165 as per the spec and support of _interfaceId
        return
            supportsERC165(account) &&
            supportsERC165InterfaceUnchecked(account, interfaceId);
    }

    /**
     * @dev Returns a boolean array where each value corresponds to the
     * interfaces passed in and whether they're supported or not. This allows
     * you to batch check interfaces for a contract where your expectation
     * is that some interfaces may not be supported.
     *
     * See {IERC165-supportsInterface}.
     *
     * _Available since v3.4._
     */
    function getSupportedInterfaces(
        address account,
        bytes4[] memory interfaceIds
    ) internal view returns (bool[] memory) {
        // an array of booleans corresponding to interfaceIds and whether they're supported or not
        bool[] memory interfaceIdsSupported = new bool[](interfaceIds.length);

        // query support of ERC165 itself
        if (supportsERC165(account)) {
            // query support of each interface in interfaceIds
            for (uint256 i = 0; i < interfaceIds.length; i++) {
                interfaceIdsSupported[i] = supportsERC165InterfaceUnchecked(
                    account,
                    interfaceIds[i]
                );
            }
        }

        return interfaceIdsSupported;
    }

    /**
     * @dev Returns true if `account` supports all the interfaces defined in
     * `interfaceIds`. Support for {IERC165} itself is queried automatically.
     *
     * Batch-querying can lead to gas savings by skipping repeated checks for
     * {IERC165} support.
     *
     * See {IERC165-supportsInterface}.
     */
    function supportsAllInterfaces(
        address account,
        bytes4[] memory interfaceIds
    ) internal view returns (bool) {
        // query support of ERC165 itself
        if (!supportsERC165(account)) {
            return false;
        }

        // query support of each interface in interfaceIds
        for (uint256 i = 0; i < interfaceIds.length; i++) {
            if (!supportsERC165InterfaceUnchecked(account, interfaceIds[i])) {
                return false;
            }
        }

        // all interfaces supported
        return true;
    }

    /**
     * @notice Query if a contract implements an interface, does not check ERC165 support
     * @param account The address of the contract to query for support of an interface
     * @param interfaceId The interface identifier, as specified in ERC-165
     * @return true if the contract at account indicates support of the interface with
     * identifier interfaceId, false otherwise
     * @dev Assumes that account contains a contract that supports ERC165, otherwise
     * the behavior of this method is undefined. This precondition can be checked
     * with {supportsERC165}.
     *
     * Some precompiled contracts will falsely indicate support for a given interface, so caution
     * should be exercised when using this function.
     *
     * Interface identification is specified in ERC-165.
     */
    function supportsERC165InterfaceUnchecked(
        address account,
        bytes4 interfaceId
    ) internal view returns (bool) {
        // prepare call
        bytes memory encodedParams = abi.encodeWithSelector(
            IERC165.supportsInterface.selector,
            interfaceId
        );

        // perform static call
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly {
            success := staticcall(
                30000,
                account,
                add(encodedParams, 0x20),
                mload(encodedParams),
                0x00,
                0x20
            )
            returnSize := returndatasize()
            returnValue := mload(0x00)
        }

        return success && returnSize >= 0x20 && returnValue > 0;
    }
}

// File @openzeppelin/contracts/interfaces/IERC1271.sol@v4.9.3

// OpenZeppelin Contracts v4.4.1 (interfaces/IERC1271.sol)

/**
 * @dev Interface of the ERC1271 standard signature validation method for
 * contracts as defined in https://eips.ethereum.org/EIPS/eip-1271[ERC-1271].
 *
 * _Available since v4.1._
 */
interface IERC1271 {
    /**
     * @dev Should return whether the signature provided is valid for the provided data
     * @param hash      Hash of the data to be signed
     * @param signature Signature byte array associated with _data
     */
    function isValidSignature(
        bytes32 hash,
        bytes memory signature
    ) external view returns (bytes4 magicValue);
}

// File contracts/LSP14Ownable2Step/ILSP14Ownable2Step.sol

/**
 * @title Interface of the LSP14 - Ownable 2-step standard, an extension of the [EIP173] (Ownable) standard with 2-step process to transfer or renounce ownership.
 */
interface ILSP14Ownable2Step {
    /**
     * @dev Emitted when {transferOwnership(..)} was called and the first step of transferring ownership completed successfully which leads to {pendingOwner} being updated.
     * @notice The transfer of ownership of the contract was initiated. Pending new owner set to: `newOwner`.
     * @param previousOwner The address of the previous owner.
     * @param newOwner The address of the new owner.
     */
    event OwnershipTransferStarted(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @inheritdoc OwnableUnset
     * event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
     */

    /**
     * @dev Emitted when starting the {renounceOwnership(..)} 2-step process.
     * @notice Ownership renouncement initiated.
     */
    event RenounceOwnershipStarted();

    /**
     * @dev Emitted when the ownership of the contract has been renounced.
     * @notice Successfully renounced ownership of the contract. This contract is now owned by anyone, it's owner is `address(0)`.
     */
    event OwnershipRenounced();

    /**
     * @inheritdoc OwnableUnset
     * function {owner()} external view returns (address);
     */

    /**
     * @dev The address that ownership of the contract is transferred to.
     * This address may use {acceptOwnership()} to gain ownership of the contract.
     */
    function pendingOwner() external view returns (address);

    /**
     * @dev Initiate the process of transferring ownership of the contract by setting the new owner as the pending owner.
     *
     * If the new owner is a contract that supports + implements LSP1, this will also attempt to notify the new owner that ownership has been transferred to them by calling the {universalReceiver()} function on the `newOwner` contract.
     *
     * @notice Transfer ownership initiated by `newOwner`.
     *
     * @param newOwner The address of the new owner.
     */
    function transferOwnership(address newOwner) external;

    /**
     * @dev Transfer ownership of the contract from the current {owner()} to the {pendingOwner()}.
     *
     * Once this function is called:
     * - The current {owner()} will loose access to the functions restricted to the {owner()} only.
     * - The {pendingOwner()} will gain access to the functions restricted to the {owner()} only.
     *
     * @notice `msg.sender` is accepting ownership of contract: `address(this)`.
     */
    function acceptOwnership() external;

    /**
     * @dev Renounce ownership of the contract in a 2-step process.
     *
     * 1. The first call will initiate the process of renouncing ownership.
     * 2. The second call is used as a confirmation and will leave the contract without an owner.
     *
     * @notice `msg.sender` is renouncing ownership of contract `address(this)`.
     */
    function renounceOwnership() external;
}

// File contracts/LSP1UniversalReceiver/ILSP1UniversalReceiver.sol

/**
 * @title Interface of the LSP1 - Universal Receiver standard, an entry function for a contract to receive arbitrary information.
 * @dev LSP1UniversalReceiver allows to receive arbitrary messages and to be informed when assets are sent or received.
 */
interface ILSP1UniversalReceiver {
    /**
     * @dev Emitted when the {universalReceiver} function was called with a specific `typeId` and some `receivedData`
s
     * @notice Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.
     *
     * @param from The address of the EOA or smart contract that called the {universalReceiver(...)} function.
     * @param value The amount sent to the {universalReceiver(...)} function.
     * @param typeId A `bytes32` unique identifier (= _"hook"_)that describe the type of notification, information or transaction received by the contract. Can be related to a specific standard or a hook.
     * @param receivedData Any arbitrary data that was sent to the {universalReceiver(...)} function.
     * @param returnedValue The value returned by the {universalReceiver(...)} function.
     */
    event UniversalReceiver(
        address indexed from,
        uint256 indexed value,
        bytes32 indexed typeId,
        bytes receivedData,
        bytes returnedValue
    );

    /**
     * @dev Generic function that can be used to notify the contract about specific incoming transactions or events like asset transfers, vault transfers, etc. Allows for custom on-chain and off-chain reactions based on the `typeId` and `data`.
     * @notice Reacted on received notification with `typeId` & `data`.
     *
     * @param typeId The hash of a specific standard or a hook.
     * @param data The arbitrary data received with the call.
     *
     * @custom:events {UniversalReceiver} event.
     */
    function universalReceiver(
        bytes32 typeId,
        bytes calldata data
    ) external payable returns (bytes memory);
}

// File contracts/LSP0ERC725Account/ILSP0ERC725Account.sol

// interfaces

/**
 * @title Interface of the [LSP-0-ERC725Account] standard, an account based smart contract that represents an identity on-chain.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 */
interface ILSP0ERC725Account {
    /**
     * @notice `value` native tokens received from `sender`.
     * @dev Emitted when receiving native tokens.
     * @param sender The address that sent some native tokens to this contract.
     * @param value The amount of native tokens received.
     */
    event ValueReceived(address indexed sender, uint256 indexed value);

    /**
     * @notice Executing the following batch of abi-encoded function calls on the contract: `data`.
     *
     * @dev Allows a caller to batch different function calls in one call. Perform a `delegatecall` on self, to call different functions with preserving the context.
     * @param data An array of ABI encoded function calls to be called on the contract.
     * @return results An array of abi-encoded data returned by the functions executed.
     */
    function batchCalls(
        bytes[] calldata data
    ) external returns (bytes[] memory results);
}

// File contracts/LSP0ERC725Account/LSP0Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP0 = 0x24871b3d;
bytes4 constant _INTERFACEID_ERC1271 = 0x1626ba7e;

// ERC1271 - Standard Signature Validation
bytes4 constant _ERC1271_MAGICVALUE = 0x1626ba7e;
bytes4 constant _ERC1271_FAILVALUE = 0xffffffff;

// Ownerhsip Transfer Type IDs

// keccak256('LSP0OwnershipTransferStarted')
bytes32 constant _TYPEID_LSP0_OwnershipTransferStarted = 0xe17117c9d2665d1dbeb479ed8058bbebde3c50ac50e2e65619f60006caac6926;

// keccak256('LSP0OwnershipTransferred_SenderNotification')
bytes32 constant _TYPEID_LSP0_OwnershipTransferred_SenderNotification = 0xa4e59c931d14f7c8a7a35027f92ee40b5f2886b9fdcdb78f30bc5ecce5a2f814;

// keccak256('LSP0OwnershipTransferred_RecipientNotification')
bytes32 constant _TYPEID_LSP0_OwnershipTransferred_RecipientNotification = 0xceca317f109c43507871523e82dc2a3cc64dfa18f12da0b6db14f6e23f995538;

// File contracts/LSP14Ownable2Step/LSP14Constants.sol

bytes4 constant _INTERFACEID_LSP14 = 0x94be5999;

// --- Type IDs

// keccak256('LSP14OwnershipTransferStarted')
bytes32 constant _TYPEID_LSP14_OwnershipTransferStarted = 0xee9a7c0924f740a2ca33d59b7f0c2929821ea9837ce043ce91c1823e9c4e52c0;

// keccak256('LSP14OwnershipTransferred_SenderNotification')
bytes32 constant _TYPEID_LSP14_OwnershipTransferred_SenderNotification = 0xa124442e1cc7b52d8e2ede2787d43527dc1f3ae0de87f50dd03e27a71834f74c;

// keccak256('LSP14OwnershipTransferred_RecipientNotification')
bytes32 constant _TYPEID_LSP14_OwnershipTransferred_RecipientNotification = 0xe32c7debcb817925ba4883fdbfc52797187f28f73f860641dab1a68d9b32902c;

// File contracts/LSP14Ownable2Step/LSP14Errors.sol

/**
 * @dev Reverts when trying to renounce ownership before the initial confirmation delay.
 * @notice Cannot confirm ownership renouncement yet. The ownership renouncement is allowed from: `renounceOwnershipStart` until: `renounceOwnershipEnd`.
 *
 * @param renounceOwnershipStart The start timestamp when one can confirm the renouncement of ownership.
 * @param renounceOwnershipEnd The end timestamp when one can confirm the renouncement of ownership.
 */
error NotInRenounceOwnershipInterval(
    uint256 renounceOwnershipStart,
    uint256 renounceOwnershipEnd
);

/**
 * @dev Reverts when trying to transfer ownership to the `address(this)`.
 * @notice Cannot transfer ownership to the address of the contract itself.
 */
error CannotTransferOwnershipToSelf();

/**
 * @dev Reverts when pending owner accept ownership in the same transaction of transferring ownership.
 * @notice Cannot accept ownership in the same transaction with {transferOwnership(...)}.
 */
error LSP14MustAcceptOwnershipInSeparateTransaction();

// File contracts/LSP1UniversalReceiver/LSP1Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP1 = 0x6bb56a14;

// --- ERC725Y Data Keys

// bytes10(keccak256('LSP1UniversalReceiverDelegate'))
bytes10 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX = 0x0cfc51aec37c55a4d0b1;

// keccak256('LSP1UniversalReceiverDelegate')
bytes32 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY = 0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47;

// File contracts/LSP2ERC725YJSONSchema/LSP2Utils.sol

// interfaces

// libraries

/**
 * @title LSP2 Utility library.
 * @author Jean Cavallera <CJ42>, Yamen Merhi <YamenMerhi>, Daniel Afteni <B00ste>
 * @dev LSP2Utils is a library of utility functions that can be used to encode data key of different key type
 * defined on the LSP2 standard.
 * Based on LSP2 ERC725Y JSON Schema standard.
 */
library LSP2Utils {
    using BytesLib for bytes;

    /**
     * @dev Generates a data key of keyType Singleton by hashing the string `keyName`. As:
     *
     * ```
     * keccak256("keyName")
     * ```
     *
     * @param keyName The string to hash to generate a Singleton data key.
     *
     * @return The generated `bytes32` data key of key type Singleton.
     */
    function generateSingletonKey(
        string memory keyName
    ) internal pure returns (bytes32) {
        return keccak256(bytes(keyName));
    }

    /**
     * @dev Generates a data key of keyType Array by hashing `arrayKeyName`. As:
     *
     * ```
     * keccak256("arrayKeyName[]")
     * ```
     *
     * @param arrayKeyName The string that will be used to generate a data key of key type Array.
     *
     * @return The generated `bytes32` data key of key type Array.
     *
     * @custom:requirements
     * - The `keyName` must include at the end of the string the square brackets `"[]"`.
     */
    function generateArrayKey(
        string memory arrayKeyName
    ) internal pure returns (bytes32) {
        bytes memory dataKey = bytes(arrayKeyName);
        require(dataKey.length >= 2, "MUST be longer than 2 characters");
        require(
            dataKey[dataKey.length - 2] == 0x5b && // "[" in utf8 encoded
                dataKey[dataKey.length - 1] == 0x5d, // "]" in utf8
            "Missing empty square brackets '[]' at the end of the key name"
        );

        return keccak256(dataKey);
    }

    /**
     * @dev Generates an Array data key at a specific `index` by concatenating together the first 16 bytes of `arrayKey`
     * with the 16 bytes of `index`. As:
     *
     * ```
     * arrayKey[index]
     * ```
     *
     * @param arrayKey The Array data key from which to generate the Array data key at a specific `index`.
     * @param index The index number in the `arrayKey`.
     *
     * @return The generated `bytes32` data key of key type Array at a specific `index`.
     */
    function generateArrayElementKeyAtIndex(
        bytes32 arrayKey,
        uint128 index
    ) internal pure returns (bytes32) {
        bytes memory elementInArray = bytes.concat(
            bytes16(arrayKey),
            bytes16(index)
        );
        return bytes32(elementInArray);
    }

    /**
     * @dev Generates a data key of key type Mapping that map `firstWord` to `lastWord`. This is done by hashing two strings words `firstWord` and `lastWord`. As:
     *
     * ```
     * bytes10(firstWordHash):0000:bytes20(lastWordHash)
     * ```
     *
     * @param firstWord The word to retrieve the first 10 bytes of its hash.
     * @param lastWord The word to retrieve the first 10 bytes of its hash.
     *
     * @return The generated `bytes32` data key of key type Mapping that map `firstWord` to a specific `lastWord`.
     */
    function generateMappingKey(
        string memory firstWord,
        string memory lastWord
    ) internal pure returns (bytes32) {
        bytes32 firstWordHash = keccak256(bytes(firstWord));
        bytes32 lastWordHash = keccak256(bytes(lastWord));

        bytes memory temporaryBytes = bytes.concat(
            bytes10(firstWordHash),
            bytes2(0),
            bytes20(lastWordHash)
        );

        return bytes32(temporaryBytes);
    }

    /**
     * @dev Generates a data key of key type Mapping that map `firstWord` to an address `addr`.
     * This is done by hashing the string word `firstWord` and concatenating its first 10 bytes with `addr`. As:
     *
     * ```
     * bytes10(firstWordHash):0000:<address>
     * ```
     *
     * @param firstWord The word to retrieve the first 10 bytes of its hash.
     * @param addr An address to map `firstWord` to.
     *
     * @return The generated `bytes32` data key of key type Mapping that map `firstWord` to a specific address `addr`.
     */
    function generateMappingKey(
        string memory firstWord,
        address addr
    ) internal pure returns (bytes32) {
        bytes32 firstWordHash = keccak256(bytes(firstWord));

        bytes memory temporaryBytes = bytes.concat(
            bytes10(firstWordHash),
            bytes2(0),
            bytes20(addr)
        );

        return bytes32(temporaryBytes);
    }

    /**
     * @dev Generate a data key of key type Mapping that map a 10 bytes `keyPrefix` to a `bytes20Value`. As:
     *
     * ```
     * keyPrefix:bytes20Value
     * ```
     *
     * @param keyPrefix The first part of the data key of key type Mapping.
     * @param bytes20Value The second part of the data key of key type Mapping.
     *
     * @return The generated `bytes32` data key of key type Mapping that map a `keyPrefix` to a specific `bytes20Value`.
     */
    function generateMappingKey(
        bytes10 keyPrefix,
        bytes20 bytes20Value
    ) internal pure returns (bytes32) {
        bytes memory generatedKey = bytes.concat(
            keyPrefix,
            bytes2(0),
            bytes20Value
        );
        return bytes32(generatedKey);
    }

    /**
     * @dev Generate a data key of key type MappingWithGrouping by using two strings `firstWord`
     * mapped to a `secondWord` mapped itself to a specific address `addr`. As:
     *
     * ```
     * bytes6(keccak256("firstWord")):bytes4(keccak256("secondWord")):0000:<address>
     * ```
     *
     * @param firstWord The word to retrieve the first 6 bytes of its hash.
     * @param secondWord The word to retrieve the first 4 bytes of its hash.
     * @param addr The address that makes the last part of the MappingWithGrouping.
     *
     * @return The generated `bytes32` data key of key type MappingWithGrouping that map a `firstWord` to a `secondWord` to a specific address `addr`.
     */
    function generateMappingWithGroupingKey(
        string memory firstWord,
        string memory secondWord,
        address addr
    ) internal pure returns (bytes32) {
        bytes32 firstWordHash = keccak256(bytes(firstWord));
        bytes32 secondWordHash = keccak256(bytes(secondWord));

        bytes memory temporaryBytes = bytes.concat(
            bytes6(firstWordHash),
            bytes4(secondWordHash),
            bytes2(0),
            bytes20(addr)
        );

        return bytes32(temporaryBytes);
    }

    /**
     * @dev Generate a data key of key type MappingWithGrouping that map a `keyPrefix` to an other `mapPrefix` to a specific `subMapKey`. As:
     *
     * ```
     * keyPrefix:mapPrefix:0000:subMapKey
     * ```
     *
     * @param keyPrefix The first part (6 bytes) of the data key of keyType MappingWithGrouping.
     * @param mapPrefix The second part (4 bytes) of the data key of keyType MappingWithGrouping.
     * @param subMapKey The last part (bytes20) of the data key of keyType MappingWithGrouping.
     *
     * @return The generated `bytes32` data key of key type MappingWithGrouping that map a `keyPrefix` to a `mapPrefix` to a specific `subMapKey`.
     */
    function generateMappingWithGroupingKey(
        bytes6 keyPrefix,
        bytes4 mapPrefix,
        bytes20 subMapKey
    ) internal pure returns (bytes32) {
        bytes memory generatedKey = bytes.concat(
            keyPrefix,
            mapPrefix,
            bytes2(0),
            subMapKey
        );
        return bytes32(generatedKey);
    }

    /**
     * @dev Generate a data key of key type MappingWithGrouping that map a 10 bytes `keyPrefix` to a specific `bytes20Value`. As:
     *
     * @param keyPrefix The first part of the data key of keyType MappingWithGrouping.
     * @param bytes20Value The last of the data key of keyType MappingWithGrouping.
     *
     * @return The generated `bytes32` data key of key type MappingWithGrouping that map a `keyPrefix`
     * (containing the first and second mapped word) to a specific `bytes20Value`.
     */
    function generateMappingWithGroupingKey(
        bytes10 keyPrefix,
        bytes20 bytes20Value
    ) internal pure returns (bytes32) {
        bytes memory generatedKey = bytes.concat(
            keyPrefix,
            bytes2(0),
            bytes20Value
        );
        return bytes32(generatedKey);
    }

    /**
     * @dev Generate a JSONURL value content.
     * @param hashFunction The function used to hash the JSON file.
     * @param json Bytes value of the JSON file.
     * @param url The URL where the JSON file is hosted.
     */
    function generateJSONURLValue(
        string memory hashFunction,
        string memory json,
        string memory url
    ) internal pure returns (bytes memory) {
        bytes32 hashFunctionDigest = keccak256(bytes(hashFunction));
        bytes32 jsonDigest = keccak256(bytes(json));

        return abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, url);
    }

    /**
     * @dev Generate a ASSETURL value content.
     *
     * @param hashFunction The function used to hash the JSON file.
     * @param assetBytes Bytes value of the JSON file.
     * @param url The URL where the JSON file is hosted.
     *
     * @return The encoded value as an `ASSETURL`.
     */
    function generateASSETURLValue(
        string memory hashFunction,
        string memory assetBytes,
        string memory url
    ) internal pure returns (bytes memory) {
        bytes32 hashFunctionDigest = keccak256(bytes(hashFunction));
        bytes32 jsonDigest = keccak256(bytes(assetBytes));

        return abi.encodePacked(bytes4(hashFunctionDigest), jsonDigest, url);
    }

    /**
     * @dev Verify if `data` is an abi-encoded array.
     *
     * @param data The bytes value to verify.
     *
     * @return `true` if the `data` represents an abi-encoded array, `false` otherwise.
     */
    function isEncodedArray(bytes memory data) internal pure returns (bool) {
        uint256 nbOfBytes = data.length;

        // there must be at least 32 x length bytes after offset
        uint256 offset = uint256(bytes32(data));
        if (nbOfBytes < offset + 32) return false;
        uint256 arrayLength = data.toUint256(offset);

        //   32 bytes word (= offset)
        // + 32 bytes word (= array length)
        // + remaining bytes that make each element of the array
        if (nbOfBytes < (offset + 32 + (arrayLength * 32))) return false;

        return true;
    }

    /**
     * @dev Verify if `data` is an abi-encoded array of addresses (`address[]`) encoded according to the ABI specs.
     *
     * @param data The bytes value to verify.
     *
     * @return `true` if the `data` represents an abi-encoded array of addresses, `false` otherwise.
     */
    function isEncodedArrayOfAddresses(
        bytes memory data
    ) internal pure returns (bool) {
        if (!isEncodedArray(data)) return false;

        uint256 offset = uint256(bytes32(data));
        uint256 arrayLength = data.toUint256(offset);

        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ) {
            bytes32 key = data.toBytes32(pointer);

            // check that the leading bytes are zero bytes "00"
            // NB: address type is padded on the left (unlike bytes20 type that is padded on the right)
            if (bytes12(key) != bytes12(0)) return false;

            // increment the pointer
            pointer += 32;

            unchecked {
                ++ii;
            }
        }

        return true;
    }

    /**
     * @dev Verify if `data` is an abi-array of `bytes4` values (`bytes4[]`) encoded according to the ABI specs.
     *
     * @param data The bytes value to verify.
     *
     * @return `true` if the `data` represents an abi-encoded array of `bytes4`, `false` otherwise.
     */
    function isBytes4EncodedArray(
        bytes memory data
    ) internal pure returns (bool) {
        if (!isEncodedArray(data)) return false;

        uint256 offset = uint256(bytes32(data));
        uint256 arrayLength = data.toUint256(offset);
        uint256 pointer = offset + 32;

        for (uint256 ii = 0; ii < arrayLength; ) {
            bytes32 key = data.toBytes32(pointer);

            // check that the trailing bytes are zero bytes "00"
            if (uint224(uint256(key)) != 0) return false;

            // increment the pointer
            pointer += 32;

            unchecked {
                ++ii;
            }
        }

        return true;
    }

    /**
     * @dev Verify if `data` is a valid array of value encoded as a `CompactBytesArray` according to the LSP2 `CompactBytesArray` valueType specification.
     *
     * @param compactBytesArray The bytes value to verify.
     *
     * @return `true` if the `data` is correctly encoded CompactBytesArray, `false` otherwise.
     */
    function isCompactBytesArray(
        bytes memory compactBytesArray
    ) internal pure returns (bool) {
        /**
         * Pointer will always land on these values:
         *
         * ↓↓↓↓
         * 0003 a00000
         * 0005 fff83a0011
         * 0020 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 0012 bb000000000000000000000000000000beef
         * 0019 cc00000000000000000000000000000000000000000000deed
         * ↑↑↑↑
         *
         * The pointer can only land on the length of the following bytes value.
         */
        uint256 pointer = 0;

        /**
         * Check each length byte and make sure that when you reach the last length byte.
         * Make sure that the last length describes exactly the last bytes value and you do not get out of bounds.
         */
        while (pointer < compactBytesArray.length) {
            if (pointer + 1 >= compactBytesArray.length) return false;
            uint256 elementLength = uint16(
                bytes2(
                    abi.encodePacked(
                        compactBytesArray[pointer],
                        compactBytesArray[pointer + 1]
                    )
                )
            );
            pointer += elementLength + 2;
        }
        if (pointer == compactBytesArray.length) return true;
        return false;
    }

    /**
     * @dev Validates if the bytes `arrayLength` are exactly 16 bytes long, and are of the exact size of an LSP2 Array length value
     *
     * @param arrayLength Plain bytes that should be validated.
     *
     * @return `true` if the value is 16 bytes long, `false` otherwise.
     */
    function isValidLSP2ArrayLengthValue(
        bytes memory arrayLength
    ) internal pure returns (bool) {
        if (arrayLength.length == 16) {
            return true;
        }
        return false;
    }

    /**
     * @dev Generates Data Key/Value pairs for removing the last element from an LSP2 Array and a mapping Data Key.
     *
     * @param arrayKey The Data Key of Key Type Array.
     * @param newArrayLength The new Array Length for the `arrayKey`.
     * @param removedElementIndexKey The Data Key of Key Type Array Index for the removed element.
     * @param removedElementMapKey The Data Key of a mapping to be removed.
     */
    function removeLastElementFromArrayAndMap(
        bytes32 arrayKey,
        uint128 newArrayLength,
        bytes32 removedElementIndexKey,
        bytes32 removedElementMapKey
    )
        internal
        pure
        returns (bytes32[] memory dataKeys, bytes[] memory dataValues)
    {
        dataKeys = new bytes32[](3);
        dataValues = new bytes[](3);

        // store the number of received assets decremented by 1
        dataKeys[0] = arrayKey;
        dataValues[0] = abi.encodePacked(newArrayLength);

        // remove the data value for the map key of the element
        dataKeys[1] = removedElementMapKey;
        dataValues[1] = "";

        // remove the data value for the map key of the element
        dataKeys[2] = removedElementIndexKey;
        dataValues[2] = "";
    }

    /**
     * @dev Generates Data Key/Value pairs for removing an element from an LSP2 Array and a mapping Data Key.
     *
     * @custom:info The function assumes that the Data Value stored under the mapping Data Key is of length 20 where the last 16 bytes are the index of the element in the array.
     *
     * @param erc725YContract The ERC725Y contract.
     * @param arrayKey The Data Key of Key Type Array.
     * @param newArrayLength The new Array Length for the `arrayKey`.
     * @param removedElementIndexKey The Data Key of Key Type Array Index for the removed element.
     * @param removedElementIndex the index of the removed element.
     * @param removedElementMapKey The Data Key of a mapping to be removed.
     */
    function removeElementFromArrayAndMap(
        IERC725Y erc725YContract,
        bytes32 arrayKey,
        uint128 newArrayLength,
        bytes32 removedElementIndexKey,
        uint128 removedElementIndex,
        bytes32 removedElementMapKey
    )
        internal
        view
        returns (bytes32[] memory dataKeys, bytes[] memory dataValues)
    {
        dataKeys = new bytes32[](5);
        dataValues = new bytes[](5);

        // store the number of received assets decremented by 1
        dataKeys[0] = arrayKey;
        dataValues[0] = abi.encodePacked(newArrayLength);

        // remove the data value for the map key of the element
        dataKeys[1] = removedElementMapKey;
        dataValues[1] = "";

        // Generate the key of the last element in the array
        bytes32 lastElementIndexKey = LSP2Utils.generateArrayElementKeyAtIndex(
            arrayKey,
            newArrayLength
        );

        // Get the data value from the key of the last element in the array
        bytes20 lastElementIndexValue = bytes20(
            erc725YContract.getData(lastElementIndexKey)
        );

        // Set data value of the last element instead of the element from the array that will be removed
        dataKeys[2] = removedElementIndexKey;
        dataValues[2] = bytes.concat(lastElementIndexValue);

        // Remove the data value for the swapped array element
        dataKeys[3] = lastElementIndexKey;
        dataValues[3] = "";

        // Generate mapping key for the swapped array element
        bytes32 lastElementMapKey = LSP2Utils.generateMappingKey(
            bytes10(removedElementMapKey),
            lastElementIndexValue
        );

        // Generate the mapping value for the swapped array element
        bytes memory lastElementMapValue = abi.encodePacked(
            bytes4(erc725YContract.getData(lastElementMapKey)),
            removedElementIndex
        );

        // Update the map value of the swapped array element to the new index
        dataKeys[4] = lastElementMapKey;
        dataValues[4] = lastElementMapValue;
    }
}

// File contracts/LSP1UniversalReceiver/LSP1Utils.sol

// libraries

// constants

// constants

/**
 * @title LSP1 Utility library.
 * @author Jean Cavallera <CJ42>, Yamen Merhi <YamenMerhi>, Daniel Afteni <B00ste>
 * @dev LSP1Utils is a library of utility functions that can be used to notify the `universalReceiver` function of a contract
 * that implements LSP1 and retrieve informations related to LSP1 `typeId`.
 * Based on LSP1 Universal Receiver standard.
 */
library LSP1Utils {
    /**
     * @dev Notify a contract at `lsp1Implementation` address by calling its `universalReceiver` function if this contract
     * supports the LSP1 interface.
     *
     * @param lsp1Implementation The address of the contract to notify.
     * @param typeId A `bytes32` typeId.
     * @param data Any optional data to send to the `universalReceiver` function to the `lsp1Implementation` address.
     */
    function tryNotifyUniversalReceiver(
        address lsp1Implementation,
        bytes32 typeId,
        bytes memory data
    ) internal {
        if (
            ERC165Checker.supportsERC165InterfaceUnchecked(
                lsp1Implementation,
                _INTERFACEID_LSP1
            )
        ) {
            ILSP1UniversalReceiver(lsp1Implementation).universalReceiver(
                typeId,
                data
            );
        }
    }

    /**
     * @dev Call a LSP1UniversalReceiverDelegate contract at `universalReceiverDelegate` address and append `msgSender` and `msgValue`
     * as additional informations in the calldata.
     *
     * @param universalReceiverDelegate The address of the LSP1UniversalReceiverDelegate to delegate the `universalReceiver` function to.
     * @param typeId A `bytes32` typeId.
     * @param receivedData The data sent initially to the `universalReceiver` function.
     * @param msgSender The address that initially called the `universalReceiver` function.
     * @param msgValue The amount of native token received initially by the `universalReceiver` function.
     *
     * @return The data returned by the LSP1UniversalReceiverDelegate contract.
     */
    function callUniversalReceiverWithCallerInfos(
        address universalReceiverDelegate,
        bytes32 typeId,
        bytes calldata receivedData,
        address msgSender,
        uint256 msgValue
    ) internal returns (bytes memory) {
        bytes memory callData = abi.encodePacked(
            abi.encodeWithSelector(
                ILSP1UniversalReceiver.universalReceiver.selector,
                typeId,
                receivedData
            ),
            msgSender,
            msgValue
        );

        (bool success, bytes memory result) = universalReceiverDelegate.call(
            callData
        );
        Address.verifyCallResult(
            success,
            result,
            "Call to universalReceiver failed"
        );
        return result.length != 0 ? abi.decode(result, (bytes)) : result;
    }

    /**
     * @notice Retrieving the value stored under the ERC725Y data key `LSP1UniversalReceiverDelegate`.
     *
     * @dev Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
     * the value set under the `LSP1UniversalReceiverDelegate` data key.
     *
     * @param erc725YStorage A reference to the ERC725Y storage mapping of the contract.
     * @return The bytes value stored under the `LSP1UniversalReceiverDelegate` data key.
     */
    function getLSP1DelegateValue(
        mapping(bytes32 => bytes) storage erc725YStorage
    ) internal view returns (bytes memory) {
        return erc725YStorage[_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY];
    }

    /**
     * @notice Retrieving the value stored under the ERC725Y data key `LSP1UniversalReceiverDelegate:<type-id>` for a specific `typeId`.
     *
     * @dev Query internally the ERC725Y storage of a `ERC725Y` smart contract to retrieve
     * the value set under the `LSP1UniversalReceiverDelegate:<bytes32>` data key for a specific LSP1 `typeId`.
     *
     * @param erc725YStorage A reference to the ERC725Y storage mapping of the contract.
     * @param typeId A bytes32 LSP1 `typeId`;
     * @return The bytes value stored under the `LSP1UniversalReceiverDelegate:<bytes32>` data key.
     */
    function getLSP1DelegateValueForTypeId(
        mapping(bytes32 => bytes) storage erc725YStorage,
        bytes32 typeId
    ) internal view returns (bytes memory) {
        bytes32 lsp1TypeIdDataKey = LSP2Utils.generateMappingKey(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
            bytes20(typeId)
        );
        return erc725YStorage[lsp1TypeIdDataKey];
    }
}

// File contracts/LSP14Ownable2Step/LSP14Ownable2Step.sol

// interfaces

// modules

// libraries

// errors

// constants

/**
 * @title LSP14Ownable2Step
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi), Daniel Afteni (B00ste)
 * @dev This contract is a modified version of the [`OwnableUnset.sol`] implementation, where transferring and renouncing ownership works as a 2-step process. This can be used as a confirmation mechanism to prevent potential mistakes when transferring ownership of the contract, where the control of the contract could be lost forever. (_e.g: providing the wrong address as a parameter to the function, transferring ownership to an EOA for which the user lost its private key, etc..._)
 */
abstract contract LSP14Ownable2Step is ILSP14Ownable2Step, OwnableUnset {
    using LSP1Utils for address;

    /**
     * @dev The number of block that MUST pass before one is able to confirm renouncing ownership.
     * @return Number of blocks.
     */
    uint256 public constant RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY = 200;

    /**
     * @dev The number of blocks during which one can renounce ownership.
     * @return Number of blocks.
     */
    uint256 public constant RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD = 200;

    /**
     * @dev The block number saved when initiating the process of renouncing ownerhsip.
     */
    uint256 private _renounceOwnershipStartedAt;

    /**
     * @dev see {pendingOwner()}
     */
    address private _pendingOwner;

    /**
     * @dev The boolean that indicates whether the contract is in an active ownership transfer phase
     */
    bool internal _inTransferOwnership;

    /**
     * @dev reverts when {_inTransferOwnership} variable is true
     */
    modifier NotInTransferOwnership() virtual {
        if (_inTransferOwnership) {
            revert LSP14MustAcceptOwnershipInSeparateTransaction();
        }
        _;
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:info If no ownership transfer is in progress, the pendingOwner will be `address(0).`.
     */
    function pendingOwner() public view virtual returns (address) {
        return _pendingOwner;
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:requirements `newOwner` cannot accept ownership of the contract in the same transaction. (For instance, via a callback from its {universalReceiver(...)} function).
     */
    function transferOwnership(
        address newOwner
    ) public virtual override(OwnableUnset, ILSP14Ownable2Step) onlyOwner {
        // set the transfer ownership lock
        _inTransferOwnership = true;

        _transferOwnership(newOwner);

        address currentOwner = owner();
        emit OwnershipTransferStarted(currentOwner, newOwner);

        newOwner.tryNotifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferStarted,
            ""
        );

        // reset the transfer ownership lock
        _inTransferOwnership = false;
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:requirements This function can only be called by the {pendingOwner()}.
     */
    function acceptOwnership() public virtual NotInTransferOwnership {
        address previousOwner = owner();

        _acceptOwnership();

        previousOwner.tryNotifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
            ""
        );

        msg.sender.tryNotifyUniversalReceiver(
            _TYPEID_LSP14_OwnershipTransferred_RecipientNotification,
            ""
        );
    }

    /**
     * @inheritdoc ILSP14Ownable2Step
     *
     * @custom:danger Leaves the contract without an owner. Once ownership of the contract has been renounced, any function that is restricted to be called only by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.
     */
    function renounceOwnership()
        public
        virtual
        override(OwnableUnset, ILSP14Ownable2Step)
        onlyOwner
    {
        address previousOwner = owner();
        _renounceOwnership();

        if (owner() == address(0)) {
            previousOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP14_OwnershipTransferred_SenderNotification,
                ""
            );
        }
    }

    // --- Internal methods

    /**
     * @dev Set the pending owner of the contract and cancel any renounce ownership process that was previously started.
     *
     * @param newOwner The address of the new pending owner.
     *
     * @custom:requirements `newOwner` cannot be the address of the contract itself.
     */
    function _transferOwnership(address newOwner) internal virtual {
        if (newOwner == address(this)) revert CannotTransferOwnershipToSelf();

        _pendingOwner = newOwner;
        delete _renounceOwnershipStartedAt;
    }

    /**
     * @dev Set the pending owner of the contract as the new owner.
     */
    function _acceptOwnership() internal virtual {
        require(
            msg.sender == pendingOwner(),
            "LSP14: caller is not the pendingOwner"
        );

        _setOwner(msg.sender);
        delete _pendingOwner;
    }

    /**
     * @dev Initiate or confirm the process of renouncing ownership after a specific delay of blocks have passed.
     */
    function _renounceOwnership() internal virtual {
        uint256 currentBlock = block.number;
        uint256 confirmationPeriodStart = _renounceOwnershipStartedAt +
            RENOUNCE_OWNERSHIP_CONFIRMATION_DELAY;
        uint256 confirmationPeriodEnd = confirmationPeriodStart +
            RENOUNCE_OWNERSHIP_CONFIRMATION_PERIOD;

        // On the creation of a new network, `currentBlock` will be smaller than `confirmationPeriodEnd`,
        // `_renounceOwnershipStartedAt == 0` will indicate that a renounceOwnership call is happening for the first time
        if (
            currentBlock > confirmationPeriodEnd ||
            _renounceOwnershipStartedAt == 0
        ) {
            _renounceOwnershipStartedAt = currentBlock;
            delete _pendingOwner;
            emit RenounceOwnershipStarted();
            return;
        }

        if (currentBlock < confirmationPeriodStart) {
            revert NotInRenounceOwnershipInterval(
                confirmationPeriodStart,
                confirmationPeriodEnd
            );
        }

        _setOwner(address(0));
        delete _renounceOwnershipStartedAt;
        delete _pendingOwner;
        emit OwnershipRenounced();
    }
}

// File contracts/LSP17ContractExtension/LSP17Constants.sol

// --- ERC165 interface ids

// bytes4(keccack256("LSP17Extendable"))
bytes4 constant _INTERFACEID_LSP17_EXTENDABLE = 0xa918fa6b;

// bytes4(keccack256("LSP17Extension"))
bytes4 constant _INTERFACEID_LSP17_EXTENSION = 0xcee78b40;

// --- ERC725Y Data Keys

// Extension Handler Prefix

// bytes10(keccak256('LSP17Extension'))
bytes10 constant _LSP17_EXTENSION_PREFIX = 0xcee78b4094da86011096;

// File contracts/LSP17ContractExtension/LSP17Errors.sol

/**
 * @dev reverts when there is no extension for the function selector being called with
 */
error NoExtensionFoundForFunctionSelector(bytes4 functionSelector);

/**
 * @dev reverts when the contract is called with a function selector not valid (less than 4 bytes of data)
 */
error InvalidFunctionSelector(bytes data);

/**
 * @dev reverts when the bytes retrieved from the LSP17 data key is not a valid address (not 20 bytes)
 */
error InvalidExtensionAddress(bytes storedData);

// File contracts/LSP17ContractExtension/LSP17Extendable.sol

// modules

// constants

// errors

/**
 * @title Module to add more functionalities to a contract using extensions.
 *
 * @dev Implementation of the `fallback(...)` logic according to LSP17 - Contract Extension standard.
 * This module can be inherited to extend the functionality of the parent contract when
 * calling a function that doesn't exist on the parent contract via forwarding the call
 * to an extension mapped to the function selector being called, set originally by the parent contract
 */
abstract contract LSP17Extendable is ERC165 {
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP17_EXTENDABLE ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev Returns whether the interfaceId being checked is supported in the extension of the
     * {supportsInterface} selector.
     *
     * To be used by extendable contracts wishing to extend the ERC165 interfaceIds originally
     * supported by reading whether the interfaceId queried is supported in the `supportsInterface`
     * extension if the extension is set, if not it returns false.
     */
    function _supportsInterfaceInERC165Extension(
        bytes4 interfaceId
    ) internal view virtual returns (bool) {
        address erc165Extension = _getExtension(
            ERC165.supportsInterface.selector
        );
        if (erc165Extension == address(0)) return false;

        return
            ERC165Checker.supportsERC165InterfaceUnchecked(
                erc165Extension,
                interfaceId
            );
    }

    /**
     * @dev Returns the extension mapped to a specific function selector
     * If no extension was found, return the address(0)
     * To be overrided.
     * Up to the implementor contract to return an extension based on a function selector
     */
    function _getExtension(
        bytes4 functionSelector
    ) internal view virtual returns (address);

    /**
     * @dev Forwards the call to an extension mapped to a function selector.
     *
     * Calls {_getExtension} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the address(0) will be returned.
     *
     * Reverts if there is no extension for the function being called.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * CALL opcode, passing the {msg.data} appended with the 20 bytes of the {msg.sender} and
     * 32 bytes of the {msg.value}
     *
     * Because the function uses assembly {return()/revert()} to terminate the call, it cannot be
     * called before other codes in fallback().
     *
     * Otherwise, the codes after _fallbackLSP17Extendable() may never be reached.
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual returns (bytes memory) {
        // If there is a function selector
        address extension = _getExtension(msg.sig);

        // if no extension was found, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call(
            abi.encodePacked(callData, msg.sender, msg.value)
        );

        if (success) {
            return result;
        } else {
            // `mload(result)` -> offset in memory where `result.length` is located
            // `add(result, 32)` -> offset in memory where `result` data starts
            // solhint-disable no-inline-assembly
            /// @solidity memory-safe-assembly
            assembly {
                let resultdata_size := mload(result)
                revert(add(result, 32), resultdata_size)
            }
        }
    }
}

// File contracts/LSP20CallVerification/ILSP20CallVerifier.sol

/**
 * @title Interface for the LSP20 Call Verification standard, a set of functions intended to perform verifications on behalf of another contract.
 *
 * @dev Interface to be inherited for contract supporting LSP20-CallVerification
 */
interface ILSP20CallVerifier {
    /**
     * @return magicValue MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to
     * the function is allowed, concatened with a byte that determines if the lsp20VerifyCallResult function should
     * be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`.
     *
     * @param caller The address who called the function on the msg.sender
     * @param value The value sent by the caller to the function called on the msg.sender
     * @param receivedCalldata The receivedCalldata sent by the caller to the msg.sender
     */
    function lsp20VerifyCall(
        address caller,
        uint256 value,
        bytes memory receivedCalldata
    ) external returns (bytes4 magicValue);

    /**
     * @return MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed
     *
     * @param callHash The keccak256 of the parameters of {lsp20VerifyCall} concatenated
     * @param result The value result of the function called on the msg.sender
     */
    function lsp20VerifyCallResult(
        bytes32 callHash,
        bytes memory result
    ) external returns (bytes4);
}

// File contracts/LSP20CallVerification/LSP20Errors.sol

/**
 * @dev reverts when the call to the owner fail with no revert reason
 * @param postCall True if the execution call was done, False otherwise
 */
error LSP20CallingVerifierFailed(bool postCall);

/**
 * @dev reverts when the call to the owner does not return the magic value
 * @param postCall True if the execution call was done, False otherwise
 * @param returnedData The data returned by the call to the logic verifier
 */
error LSP20InvalidMagicValue(bool postCall, bytes returnedData);

// File contracts/LSP20CallVerification/LSP20CallVerification.sol

// interfaces

// errors

/**
 * @title Implementation of a contract calling the verification functions according to LSP20 - Call Verification standard.
 *
 * @dev Module to be inherited used to verify the execution of functions according to a verifier address.
 * Verification can happen before or after execution based on a magicValue.
 */
abstract contract LSP20CallVerification {
    /**
     * @dev Calls {lsp20VerifyCall} function on the logicVerifier.
     * Reverts in case the value returned does not match the magic value (lsp20VerifyCall selector)
     * Returns whether a verification after the execution should happen based on the last byte of the magicValue
     */
    function _verifyCall(
        address logicVerifier
    ) internal virtual returns (bool verifyAfter) {
        (bool success, bytes memory returnedData) = logicVerifier.call(
            abi.encodeWithSelector(
                ILSP20CallVerifier.lsp20VerifyCall.selector,
                msg.sender,
                msg.value,
                msg.data
            )
        );

        _validateCall(false, success, returnedData);

        bytes4 magicValue = abi.decode(returnedData, (bytes4));

        if (
            bytes3(magicValue) !=
            bytes3(ILSP20CallVerifier.lsp20VerifyCall.selector)
        ) revert LSP20InvalidMagicValue(false, returnedData);

        return magicValue[3] == 0x01 ? true : false;
    }

    /**
     * @dev Calls {lsp20VerifyCallResult} function on the logicVerifier.
     * Reverts in case the value returned does not match the magic value (lsp20VerifyCallResult selector)
     */
    function _verifyCallResult(
        address logicVerifier,
        bytes memory callResult
    ) internal virtual {
        (bool success, bytes memory returnedData) = logicVerifier.call(
            abi.encodeWithSelector(
                ILSP20CallVerifier.lsp20VerifyCallResult.selector,
                keccak256(abi.encodePacked(msg.sender, msg.value, msg.data)),
                callResult
            )
        );

        _validateCall(true, success, returnedData);

        if (
            abi.decode(returnedData, (bytes4)) !=
            ILSP20CallVerifier.lsp20VerifyCallResult.selector
        ) revert LSP20InvalidMagicValue(true, returnedData);
    }

    function _validateCall(
        bool postCall,
        bool success,
        bytes memory returnedData
    ) internal pure virtual {
        if (!success) _revertWithLSP20DefaultError(postCall, returnedData);

        // check if the returned data contains at least 32 bytes, potentially an abi encoded bytes4 value
        // check if the returned data has in the first 32 bytes an abi encoded bytes4 value
        if (
            returnedData.length < 32 ||
            bytes28(bytes32(returnedData) << 32) != bytes28(0)
        ) revert LSP20InvalidMagicValue(postCall, returnedData);
    }

    function _revertWithLSP20DefaultError(
        bool postCall,
        bytes memory returnedData
    ) internal pure virtual {
        // Look for revert reason and bubble it up if present
        if (returnedData.length > 0) {
            // The easiest way to bubble the revert reason is using memory via assembly
            // solhint-disable no-inline-assembly
            /// @solidity memory-safe-assembly
            assembly {
                let returndata_size := mload(returnedData)
                revert(add(32, returnedData), returndata_size)
            }
        } else {
            revert LSP20CallingVerifierFailed(postCall);
        }
    }
}

// File contracts/LSP20CallVerification/LSP20Constants.sol

// bytes4(keccak256("LSP20CallVerification"))
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFICATION = 0x1a0eb6a5;

// `lsp20VerifyCall(address,uint256,bytes)` selector XOR `lsp20VerifyCallResult(bytes32,bytes)` selector
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFIER = 0x480c0ec2;

// bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"01"))
bytes4 constant _LSP20_VERIFY_CALL_MAGIC_VALUE_WITH_POST_VERIFICATION = 0x9bf04b01;

// bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"00"))
bytes4 constant _LSP20_VERIFY_CALL_MAGIC_VALUE_WITHOUT_POST_VERIFICATION = 0x9bf04b00;

// bytes4(ILSP20.lsp20VerifyCallResult.selector)
bytes4 constant _LSP20_VERIFY_CALL_RESULT_MAGIC_VALUE = 0xd3fc45d3;

// File contracts/LSP0ERC725Account/LSP0ERC725AccountCore.sol

// interfaces

// libraries

// modules

// constants

// errors

/**
 * @title The Core Implementation of [LSP-0-ERC725Account] Standard.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 */
abstract contract LSP0ERC725AccountCore is
    ERC725XCore,
    ERC725YCore,
    IERC1271,
    ILSP0ERC725Account,
    ILSP1UniversalReceiver,
    LSP14Ownable2Step,
    LSP17Extendable,
    LSP20CallVerification
{
    using ERC165Checker for address;
    using LSP1Utils for address;
    using Address for address;

    /**
     * @dev Executed:
     * - When receiving some native tokens without any additional data.
     * - On empty calls to the contract.
     *
     * @custom:events {ValueReceived} event when receiving native tokens.
     */
    receive() external payable virtual {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }
    }

    // solhint-disable no-complex-fallback

    /**
     * @notice The `fallback` function was called with the following amount of native tokens: `msg.value`; and the following calldata: `callData`.
     *
     * @dev Achieves the goal of [LSP-17-ContractExtension] standard by extending the contract to handle calls of functions that do not exist natively,
     * forwarding the function call to the extension address mapped to the function being called.
     *
     * This function is executed when:
     *    - Sending data of length less than 4 bytes to the contract.
     *    - The first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     *    - Receiving native tokens with some calldata.
     *
     * 1. If the data is equal or longer than 4 bytes, the [ERC-725Y] storage is queried with the following data key: [_LSP17_EXTENSION_PREFIX] + `bytes4(msg.sig)` (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)
     *
     *   - If there is no address stored under the following data key, revert with {NoExtensionFoundForFunctionSelector(bytes4)}. The data key relative to `bytes4(0)` is an exception, where no reverts occurs if there is no extension address stored under. This exception is made to allow users to send random data (graffiti) to the account and to be able to react on it.
     *
     *   - If there is an address, forward the `msg.data` to the extension using the CALL opcode, appending 52 bytes (20 bytes of `msg.sender` and 32 bytes of `msg.value`). Return what the calls returns, or revert if the call failed.
     *
     * 2. If the data sent to this function is of length less than 4 bytes (not a function selector), return.
     *
     * @custom:events {ValueReceived} event when receiving native tokens.
     */
    fallback(
        bytes calldata callData
    ) external payable virtual returns (bytes memory) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        if (msg.data.length < 4) {
            return "";
        }

        return _fallbackLSP17Extendable(callData);
    }

    /**
     * @inheritdoc ILSP0ERC725Account
     *
     * @custom:info It's not possible to send value along the functions call due to the use of `delegatecall`.
     */
    function batchCalls(
        bytes[] calldata data
    ) public virtual returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(
                data[i]
            );

            if (!success) {
                // Look for revert reason and bubble it up if present
                if (result.length > 0) {
                    // The easiest way to bubble the revert reason is using memory via assembly
                    // solhint-disable no-inline-assembly
                    /// @solidity memory-safe-assembly
                    assembly {
                        let returndata_size := mload(result)
                        revert(add(32, result), returndata_size)
                    }
                } else {
                    revert("LSP0: batchCalls reverted");
                }
            }

            results[i] = result;

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @inheritdoc IERC725X
     *
     * @custom:requirements
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully.
     * - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`.
     * - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4).
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2).
     * - {ValueReceived} event when receiving native tokens.
     */
    function execute(
        uint256 operationType,
        address target,
        uint256 value,
        bytes memory data
    ) public payable virtual override returns (bytes memory) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        address _owner = owner();

        // If the caller is the owner perform execute directly
        if (msg.sender == _owner) {
            return ERC725XCore._execute(operationType, target, value, data);
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after execution
        bool verifyAfter = LSP20CallVerification._verifyCall(_owner);

        // Perform the execution
        bytes memory result = ERC725XCore._execute(
            operationType,
            target,
            value,
            data
        );

        // if verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        if (verifyAfter) {
            LSP20CallVerification._verifyCallResult(_owner, abi.encode(result));
        }

        return result;
    }

    /**
     * @inheritdoc IERC725X
     *
     * @custom:requirements
     * - The length of the parameters provided must be equal.
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - If a `value` is provided, the contract must have at least this amount in its balance to execute successfully.
     * - If the operation type is `CREATE` (1) or `CREATE2` (2), `target` must be `address(0)`.
     * - If the operation type is `STATICCALL` (3) or `DELEGATECALL` (4), `value` transfer is disallowed and must be 0.
     *
     * @custom:events
     * - {Executed} event for each call that uses under `operationType`: `CALL` (0), `STATICCALL` (3) and `DELEGATECALL` (4). (each iteration)
     * - {ContractCreated} event, when a contract is created under `operationType`: `CREATE` (1) and `CREATE2` (2) (each iteration)
     * - {ValueReceived} event when receiving native tokens.
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) public payable virtual override returns (bytes[] memory) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        address _owner = owner();

        // If the caller is the owner perform execute directly
        if (msg.sender == _owner) {
            return
                ERC725XCore._executeBatch(
                    operationsType,
                    targets,
                    values,
                    datas
                );
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after execution
        bool verifyAfter = LSP20CallVerification._verifyCall(_owner);

        // Perform the execution
        bytes[] memory results = ERC725XCore._executeBatch(
            operationsType,
            targets,
            values,
            datas
        );

        // if verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        if (verifyAfter) {
            LSP20CallVerification._verifyCallResult(
                _owner,
                abi.encode(results)
            );
        }

        return results;
    }

    /**
     * @inheritdoc IERC725Y
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {ValueReceived} event when receiving native tokens.
     * - {DataChanged} event.
     */
    function setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) public payable virtual override {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        address _owner = owner();

        // If the caller is the owner perform setData directly
        if (msg.sender == _owner) {
            return _setData(dataKey, dataValue);
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after setting data
        bool verifyAfter = _verifyCall(_owner);

        _setData(dataKey, dataValue);

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(_owner, "");
        }
    }

    /**
     * @inheritdoc IERC725Y
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:events
     * - {ValueReceived} event when receiving native tokens.
     * - {DataChanged} event. (on each iteration of setting data)
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        if (dataKeys.length != dataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        address _owner = owner();

        // If the caller is the owner perform setData directly
        if (msg.sender == _owner) {
            for (uint256 i = 0; i < dataKeys.length; ) {
                _setData(dataKeys[i], dataValues[i]);

                unchecked {
                    ++i;
                }
            }

            return;
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after setting data
        bool verifyAfter = _verifyCall(_owner);

        for (uint256 i = 0; i < dataKeys.length; ) {
            _setData(dataKeys[i], dataValues[i]);

            unchecked {
                ++i;
            }
        }

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The setData function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(_owner, "");
        }
    }

    /**
     * @notice Notifying the contract by calling its `universalReceiver` function with the following informations: typeId: `typeId`; data: `data`.
     *
     * @dev Achieves the goal of [LSP-1-UniversalReceiver] by allowing the account to be notified about incoming/outgoing transactions and enabling reactions to these actions.
     * The reaction is achieved by having two external contracts ([LSP1UniversalReceiverDelegate]) that react on the whole transaction and on the specific typeId, respectively.
     *
     * The function performs the following steps:
     *
     * 1. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY].
     *      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.
     *
     *      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.
     *
     *
     * 2. Query the [ERC-725Y] storage with the data key [_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX] + `bytes32(typeId)`.
     *   (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)
     *
     *      - If there is an address stored under the data key, check if this address supports the LSP1 interfaceId.
     *
     *      - If yes, call this address with the typeId and data (params), along with additional calldata consisting of 20 bytes of `msg.sender` and 32 bytes of `msg.value`. If not, continue the execution of the function.
     *
     * @param typeId The type of call received.
     * @param receivedData The data received.
     *
     * @return returnedValues The ABI encoded return value of the LSP1UniversalReceiverDelegate call and the LSP1TypeIdDelegate call.
     *
     * @custom:events
     * - {ValueReceived} when receiving native tokens.
     * - {UniversalReceiver} event with the function parameters, call options, and the response of the UniversalReceiverDelegates (URD) contract that was called.
     */
    function universalReceiver(
        bytes32 typeId,
        bytes calldata receivedData
    ) public payable virtual returns (bytes memory returnedValues) {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY}
        bytes memory lsp1DelegateValue = _getData(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY
        );
        bytes memory resultDefaultDelegate;

        if (lsp1DelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1DelegateValue)
            );

            // Checking LSP1 InterfaceId support
            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1
                )
            ) {
                // calling {universalReceiver} function on URD appending the caller and the value sent
                resultDefaultDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        // Generate the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY + <bytes32 typeId>}
        bytes32 lsp1typeIdDelegateKey = LSP2Utils.generateMappingKey(
            _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX,
            bytes20(typeId)
        );

        // Query the ERC725Y storage with the data key {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY + <bytes32 typeId>}
        bytes memory lsp1TypeIdDelegateValue = _getData(lsp1typeIdDelegateKey);
        bytes memory resultTypeIdDelegate;

        if (lsp1TypeIdDelegateValue.length >= 20) {
            address universalReceiverDelegate = address(
                bytes20(lsp1TypeIdDelegateValue)
            );

            // Checking LSP1 InterfaceId support
            if (
                universalReceiverDelegate.supportsERC165InterfaceUnchecked(
                    _INTERFACEID_LSP1
                )
            ) {
                // calling {universalReceiver} function on URD appending the caller and the value sent
                resultTypeIdDelegate = universalReceiverDelegate
                    .callUniversalReceiverWithCallerInfos(
                        typeId,
                        receivedData,
                        msg.sender,
                        msg.value
                    );
            }
        }

        returnedValues = abi.encode(
            resultDefaultDelegate,
            resultTypeIdDelegate
        );
        emit UniversalReceiver(
            msg.sender,
            msg.value,
            typeId,
            receivedData,
            returnedValues
        );
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements
     * - Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     * - When notifying the new owner via LSP1, the `typeId` used must be the `keccak256(...)` hash of [LSP0OwnershipTransferStarted].
     * - Pending owner cannot accept ownership in the same tx via the LSP1 hook.
     */
    function transferOwnership(
        address pendingNewOwner
    ) public virtual override(LSP14Ownable2Step, OwnableUnset) {
        address currentOwner = owner();

        // If the caller is the owner perform transferOwnership directly
        if (msg.sender == currentOwner) {
            // set the transfer ownership lock
            _inTransferOwnership = true;

            // set the pending owner
            LSP14Ownable2Step._transferOwnership(pendingNewOwner);
            emit OwnershipTransferStarted(currentOwner, pendingNewOwner);

            // notify the pending owner through LSP1
            pendingNewOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                ""
            );

            // reset the transfer ownership lock
            _inTransferOwnership = false;
        } else {
            // If the caller is not the owner, call {lsp20VerifyCall} on the owner
            // Depending on the magicValue returned, a second call is done after transferring ownership
            bool verifyAfter = _verifyCall(currentOwner);

            // set the transfer ownership lock
            _inTransferOwnership = true;

            // Set the pending owner if the call is allowed
            LSP14Ownable2Step._transferOwnership(pendingNewOwner);
            emit OwnershipTransferStarted(currentOwner, pendingNewOwner);

            // notify the pending owner through LSP1
            pendingNewOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferStarted,
                ""
            );

            // reset the transfer ownership lock
            _inTransferOwnership = false;

            // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
            // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
            if (verifyAfter) {
                _verifyCallResult(currentOwner, "");
            }
        }
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements
     * - Only the {pendingOwner} can call this function.
     * - When notifying the previous owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_SenderNotification].
     * - When notifying the new owner via LSP1, the typeId used must be the `keccak256(...)` hash of [LSP0OwnershipTransferred_RecipientNotification].
     */
    function acceptOwnership() public virtual override NotInTransferOwnership {
        address previousOwner = owner();

        _acceptOwnership();

        // notify the previous owner if supports LSP1
        previousOwner.tryNotifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
            ""
        );

        // notify the pending owner if supports LSP1
        msg.sender.tryNotifyUniversalReceiver(
            _TYPEID_LSP0_OwnershipTransferred_RecipientNotification,
            ""
        );
    }

    /**
     * @inheritdoc LSP14Ownable2Step
     *
     * @custom:requirements Can be only called by the {owner} or by an authorised address that pass the verification check performed on the owner.
     *
     * @custom:danger Leaves the contract without an owner. Once ownership of the contract has been renounced, any functions that are restricted to be called by the owner will be permanently inaccessible, making these functions not callable anymore and unusable.
     *
     */
    function renounceOwnership()
        public
        virtual
        override(LSP14Ownable2Step, OwnableUnset)
    {
        address _owner = owner();

        // If the caller is the owner perform renounceOwnership directly
        if (msg.sender == _owner) {
            return LSP14Ownable2Step._renounceOwnership();
        }

        // If the caller is not the owner, call {lsp20VerifyCall} on the owner
        // Depending on the magicValue returned, a second call is done after transferring ownership
        bool verifyAfter = _verifyCall(_owner);

        address previousOwner = owner();
        LSP14Ownable2Step._renounceOwnership();

        if (owner() == address(0)) {
            previousOwner.tryNotifyUniversalReceiver(
                _TYPEID_LSP0_OwnershipTransferred_SenderNotification,
                ""
            );
        }

        // If verifyAfter is true, Call {lsp20VerifyCallResult} on the owner
        // The transferOwnership function does not return, second parameter of {_verifyCallResult} will be empty
        if (verifyAfter) {
            _verifyCallResult(_owner, "");
        }
    }

    /**
     * @notice Checking if this contract supports the interface defined by the `bytes4` interface ID `interfaceId`.
     *
     * @dev Achieves the goal of [ERC-165] to detect supported interfaces and [LSP-17-ContractExtension] by
     * checking if the interfaceId being queried is supported on another linked extension.
     *
     * If the contract doesn't support the `interfaceId`, it forwards the call to the
     * `supportsInterface` extension according to [LSP-17-ContractExtension], and checks if the extension
     * implements the interface defined by `interfaceId`.
     *
     * @param interfaceId The interface ID to check if the contract supports it.
     *
     * @return `true` if this contract implements the interface defined by `interfaceId`, `false` otherwise.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC725XCore, ERC725YCore, LSP17Extendable)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP0 ||
            interfaceId == _INTERFACEID_LSP1 ||
            interfaceId == _INTERFACEID_LSP14 ||
            interfaceId == _INTERFACEID_LSP20_CALL_VERIFICATION ||
            super.supportsInterface(interfaceId) ||
            LSP17Extendable._supportsInterfaceInERC165Extension(interfaceId);
    }

    /**
     * @notice Achieves the goal of [EIP-1271] by validating signatures of smart contracts
     * according to their own logic.
     *
     * @dev Handles two cases:
     *
     * 1. If the owner is an EOA, recovers an address from the hash and the signature provided:
     *
     *      - Returns the `magicValue` if the address recovered is the same as the owner, indicating that it was a valid signature.
     *
     *      - If the address is different, it returns the fail value indicating that the signature is not valid.
     *
     * 2. If the owner is a smart contract, it forwards the call of {isValidSignature()} to the owner contract:
     *
     *      - If the contract fails or returns the fail value, the {isValidSignature()} on the account returns the fail value, indicating that the signature is not valid.
     *
     *      - If the {isValidSignature()} on the owner returned the `magicValue`, the {isValidSignature()} on the account returns the `magicValue`, indicating that it's a valid signature.
     *
     * @param dataHash The hash of the data to be validated.
     * @param signature A signature that can validate the previous parameter (Hash).
     *
     * @return magicValue A `bytes4` value that indicates if the signature is valid or not.
     */
    function isValidSignature(
        bytes32 dataHash,
        bytes memory signature
    ) public view virtual returns (bytes4 magicValue) {
        address _owner = owner();

        // If owner is a contract
        if (_owner.code.length > 0) {
            (bool success, bytes memory result) = _owner.staticcall(
                abi.encodeWithSelector(
                    IERC1271.isValidSignature.selector,
                    dataHash,
                    signature
                )
            );

            bool isValid = (success &&
                result.length == 32 &&
                abi.decode(result, (bytes32)) == bytes32(_ERC1271_MAGICVALUE));

            return isValid ? _ERC1271_MAGICVALUE : _ERC1271_FAILVALUE;
        }
        // If owner is an EOA
        else {
            // if isValidSignature fail, the error is catched in returnedError
            (address recoveredAddress, ECDSA.RecoverError returnedError) = ECDSA
                .tryRecover(dataHash, signature);

            // if recovering throws an error, return the fail value
            if (returnedError != ECDSA.RecoverError.NoError)
                return _ERC1271_FAILVALUE;

            // if recovering is successful and the recovered address matches the owner's address,
            // return the ERC1271 magic value. Otherwise, return the ERC1271 fail value
            // matches the address of the owner, otherwise return fail value
            return
                recoveredAddress == _owner
                    ? _ERC1271_MAGICVALUE
                    : _ERC1271_FAILVALUE;
        }
    }

    // Internal functions

    /**
     * @dev Forwards the call to an extension mapped to a function selector.
     *
     * Calls {_getExtension} to get the address of the extension mapped to the function selector being called on the account. If there is no extension, the `address(0)` will be returned.
     *
     * Reverts if there is no extension for the function being called, except for the bytes4(0) function selector, which passes even if there is no extension for it.
     *
     * If there is an extension for the function selector being called, it calls the extension with the CALL opcode, passing the `msg.data` appended with the 20 bytes of the `msg.sender` and 32 bytes of the `msg.value`
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual override returns (bytes memory) {
        // If there is a function selector
        address extension = _getExtension(msg.sig);

        // if no extension was found for bytes4(0) return don't revert
        if (msg.sig == bytes4(0) && extension == address(0)) return "";

        // if no extension was found for other function selectors, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call(
            abi.encodePacked(callData, msg.sender, msg.value)
        );

        if (success) {
            return result;
        } else {
            // `mload(result)` -> offset in memory where `result.length` is located
            // `add(result, 32)` -> offset in memory where `result` data starts
            assembly {
                let resultdata_size := mload(result)
                revert(add(result, 32), resultdata_size)
            }
        }
    }

    /**
     * @dev Returns the extension address stored under the following data key:
     * - {_LSP17_EXTENSION_PREFIX} + `<bytes4>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key).
     * - If no extension is stored, returns the address(0).
     */
    function _getExtension(
        bytes4 functionSelector
    ) internal view virtual override returns (address) {
        // Generate the data key relevant for the functionSelector being called
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension stored under the generated data key
        address extension = address(
            bytes20(ERC725YCore._getData(mappedExtensionDataKey))
        );

        return extension;
    }

    /**
     * @dev This function overrides the {ERC725YCore} internal {_setData} function to optimize gas usage by emitting only the first 256 bytes of the `dataValue`.
     *
     * @custom:events {DataChanged} event with only the first 256 bytes of {dataValue}.
     *
     * @param dataKey The key to store the data value under.
     * @param dataValue The data value to be stored.
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        ERC725YCore._store[dataKey] = dataValue;
        emit DataChanged(
            dataKey,
            dataValue.length <= 256
                ? dataValue
                : BytesLib.slice(dataValue, 0, 256)
        );
    }
}

// File contracts/LSP0ERC725Account/LSP0ERC725Account.sol

// modules

/**
 * @title Deployable Implementation of [LSP-0-ERC725Account] Standard.
 *
 * @author Fabian Vogelsteller <fabian@lukso.network>, Jean Cavallera (CJ42)
 *
 * @dev A smart contract account including basic functionalities such as:
 * - Detecting supported standards using [ERC-165]
 * - Executing several operation on other addresses including creating contracts using [ERC-725X]
 * - A generic data key-value store using [ERC-725Y]
 * - Validating signatures using [ERC-1271]
 * - Receiving notification and react on them using [LSP-1-UniversalReceiver]
 * - Safer ownership management through 2-steps transfer using [LSP-14-Ownable2Step]
 * - Extending the account with new functions and interfaceIds of future standards using [LSP-17-ContractExtension]
 * - Verifying calls on the owner to make it easier to interact with the account directly using [LSP-20-CallVerification]
 */
contract LSP0ERC725Account is LSP0ERC725AccountCore {
    /**
     * @notice Deploying a LSP0ERC725Account contract with owner set to address `initialOwner`.
     * @dev Set `initialOwner` as the contract owner. The `constructor` also allows funding the contract on deployment.
     * @param initialOwner The owner of the contract.
     *
     * @custom:events
     * - {ValueReceived} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     */
    constructor(address initialOwner) payable {
        if (msg.value != 0) {
            emit ValueReceived(msg.sender, msg.value);
        }

        OwnableUnset._setOwner(initialOwner);
    }
}

// File contracts/LSP3ProfileMetadata/LSP3Constants.sol

// bytes10(keccak256('SupportedStandards')) + bytes2(0) + bytes20(keccak256('LSP3Profile'))
bytes32 constant _LSP3_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b600005ef83ad9559033e6e941db7d7c495acdce616347;

// bytes4(keccak256('LSP3UniversalProfile'))
bytes constant _LSP3_SUPPORTED_STANDARDS_VALUE = hex"5ef83ad9";

// bytes32(keccak256("LSP3Profile"))
bytes32 constant _LSP3_PROFILE_KEY = 0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5;

// File contracts/UniversalProfile.sol

// modules

// constants

/**
 * @title implementation of a LUKSO's Universal Profile based on LSP3
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev Implementation of the ERC725Account + LSP1 universalReceiver
 */
contract UniversalProfile is LSP0ERC725Account {
    /**
     * @notice Deploying a UniversalProfile contract with owner set to address `initialOwner`.
     *
     * @dev Set `initialOwner` as the contract owner and the `SupportedStandards:LSP3UniversalProfile` data key in the ERC725Y data key/value store. The `constructor` also allows funding the contract on deployment.
     *
     * @param initialOwner the owner of the contract
     *
     * @custom:events
     * - {ValueReceived} event when funding the contract on deployment.
     * - {OwnershipTransferred} event when `initialOwner` is set as the contract {owner}.
     * - {DataChanged} event when setting the {_LSP3_SUPPORTED_STANDARDS_KEY}.
     */
    constructor(address initialOwner) payable LSP0ERC725Account(initialOwner) {
        // set data key SupportedStandards:LSP3UniversalProfile
        _setData(
            _LSP3_SUPPORTED_STANDARDS_KEY,
            _LSP3_SUPPORTED_STANDARDS_VALUE
        );
    }
}

// File contracts/LSP23LinkedContractsDeployment/modules/UniversalProfilePostDeploymentModule.sol

contract UniversalProfilePostDeploymentModule is UniversalProfile {
    constructor() UniversalProfile(address(0)) {}

    function setDataAndTransferOwnership(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues,
        address newOwner
    ) public payable {
        // check that the msg.sender is the owner
        require(
            msg.sender == owner(),
            "UniversalProfileInitPostDeploymentModule: setDataAndTransferOwnership only allowed through delegate call"
        );

        // update the dataKeys and dataValues in the UniversalProfile contract
        for (uint256 i = 0; i < dataKeys.length; ) {
            _setData(dataKeys[i], dataValues[i]);

            unchecked {
                ++i;
            }
        }

        // transfer the ownership of the UniversalProfile contract to the newOwner
        _setOwner(newOwner);
    }

    function executePostDeployment(
        address universalProfile,
        address keyManager,
        bytes calldata setDataBatchBytes
    ) public {
        // retrieve the dataKeys and dataValues to setData from the initializationCalldata bytes
        (bytes32[] memory dataKeys, bytes[] memory dataValues) = abi.decode(
            setDataBatchBytes,
            (bytes32[], bytes[])
        );

        // call the execute function with delegate_call on the universalProfile contract to setData and transferOwnership
        UniversalProfile(payable(universalProfile)).execute(
            OPERATION_4_DELEGATECALL,
            address(this),
            0,
            abi.encodeWithSignature(
                "setDataAndTransferOwnership(bytes32[],bytes[],address)",
                dataKeys,
                dataValues,
                keyManager
            )
        );
    }
}

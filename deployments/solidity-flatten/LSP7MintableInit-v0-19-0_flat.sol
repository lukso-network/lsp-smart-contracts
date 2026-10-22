// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0 ^0.8.1 ^0.8.2 ^0.8.27 ^0.8.4;

// packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedConstants.sol

/// @dev ERC-165 interface ID for IAccessControl from OpenZeppelin.
bytes4 constant _INTERFACEID_ACCESSCONTROL = 0x7965db0b;

/// @dev ERC-165 interface ID for IAccessControlEnumerable from OpenZeppelin.
bytes4 constant _INTERFACEID_ACCESSCONTROLENUMERABLE = 0x5a05180f;

/// @dev ERC-165 interface ID for IAccessControlExtended.
/// Computed as XOR of selectors:
/// getRoleMembers(bytes32) ^ rolesOf(address) ^ setRoleAdmin(bytes32,bytes32) ^ getRoleAdmin(bytes32)
bytes4 constant _INTERFACEID_ACCESSCONTROLEXTENDED = 0x90832245;

// packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedErrors.sol

/**
 * @dev Reverts when an address attempts a role-gated action and is missing the `neededRole`.
 *
 * @param account The address that attempted the action.
 * @param neededRole The role that was required.
 */
error AccessControlUnauthorizedAccount(address account, bytes32 neededRole);

/**
 * @dev Reverts when the caller of the `renounceRole` function is not the expected one.
 * NOTE: Do not confuse with {AccessControlUnauthorizedAccount}.
 */
error AccessControlBadConfirmation();

/**
 * @dev Reverts when trying to change the admin of the `DEFAULT_ADMIN_ROLE`.
 * The `DEFAULT_ADMIN_ROLE` is its own admin, meaning only accounts with the `DEFAULT_ADMIN_ROLE` can grant or revoke it.
 * This hierarchy cannot be changed.
 */
error AccessControlCannotSetAdminForDefaultAdminRole();

// node_modules/@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol

// OpenZeppelin Contracts (last updated v4.9.0) (utils/Address.sol)

/**
 * @dev Collection of functions related to the address type
 */
library AddressUpgradeable {
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

// node_modules/@openzeppelin/contracts/utils/structs/EnumerableSet.sol

// OpenZeppelin Contracts (last updated v4.9.0) (utils/structs/EnumerableSet.sol)
// This file was procedurally generated from scripts/generate/templates/EnumerableSet.js.

/**
 * @dev Library for managing
 * https://en.wikipedia.org/wiki/Set_(abstract_data_type)[sets] of primitive
 * types.
 *
 * Sets have the following properties:
 *
 * - Elements are added, removed, and checked for existence in constant time
 * (O(1)).
 * - Elements are enumerated in O(n). No guarantees are made on the ordering.
 *
 * ```solidity
 * contract Example {
 *     // Add the library methods
 *     using EnumerableSet for EnumerableSet.AddressSet;
 *
 *     // Declare a set state variable
 *     EnumerableSet.AddressSet private mySet;
 * }
 * ```
 *
 * As of v3.3.0, sets of type `bytes32` (`Bytes32Set`), `address` (`AddressSet`)
 * and `uint256` (`UintSet`) are supported.
 *
 * [WARNING]
 * ====
 * Trying to delete such a structure from storage will likely result in data corruption, rendering the structure
 * unusable.
 * See https://github.com/ethereum/solidity/pull/11843[ethereum/solidity#11843] for more info.
 *
 * In order to clean an EnumerableSet, you can either remove all elements one by one or create a fresh instance using an
 * array of EnumerableSet.
 * ====
 */
library EnumerableSet {
    // To implement this library for multiple types with as little code
    // repetition as possible, we write it in terms of a generic Set type with
    // bytes32 values.
    // The Set implementation uses private functions, and user-facing
    // implementations (such as AddressSet) are just wrappers around the
    // underlying Set.
    // This means that we can only create new EnumerableSets for types that fit
    // in bytes32.

    struct Set {
        // Storage of set values
        bytes32[] _values;
        // Position of the value in the `values` array, plus 1 because index 0
        // means a value is not in the set.
        mapping(bytes32 => uint256) _indexes;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function _add(Set storage set, bytes32 value) private returns (bool) {
        if (!_contains(set, value)) {
            set._values.push(value);
            // The value is stored at length-1, but we add 1 to all indexes
            // and use 0 as a sentinel value
            set._indexes[value] = set._values.length;
            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function _remove(Set storage set, bytes32 value) private returns (bool) {
        // We read and store the value's index to prevent multiple reads from the same storage slot
        uint256 valueIndex = set._indexes[value];

        if (valueIndex != 0) {
            // Equivalent to contains(set, value)
            // To delete an element from the _values array in O(1), we swap the element to delete with the last one in
            // the array, and then remove the last element (sometimes called as 'swap and pop').
            // This modifies the order of the array, as noted in {at}.

            uint256 toDeleteIndex = valueIndex - 1;
            uint256 lastIndex = set._values.length - 1;

            if (lastIndex != toDeleteIndex) {
                bytes32 lastValue = set._values[lastIndex];

                // Move the last value to the index where the value to delete is
                set._values[toDeleteIndex] = lastValue;
                // Update the index for the moved value
                set._indexes[lastValue] = valueIndex; // Replace lastValue's index to valueIndex
            }

            // Delete the slot where the moved value was stored
            set._values.pop();

            // Delete the index for the deleted slot
            delete set._indexes[value];

            return true;
        } else {
            return false;
        }
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function _contains(
        Set storage set,
        bytes32 value
    ) private view returns (bool) {
        return set._indexes[value] != 0;
    }

    /**
     * @dev Returns the number of values on the set. O(1).
     */
    function _length(Set storage set) private view returns (uint256) {
        return set._values.length;
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function _at(
        Set storage set,
        uint256 index
    ) private view returns (bytes32) {
        return set._values[index];
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function _values(Set storage set) private view returns (bytes32[] memory) {
        return set._values;
    }

    // Bytes32Set

    struct Bytes32Set {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(
        Bytes32Set storage set,
        bytes32 value
    ) internal returns (bool) {
        return _add(set._inner, value);
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(
        Bytes32Set storage set,
        bytes32 value
    ) internal returns (bool) {
        return _remove(set._inner, value);
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(
        Bytes32Set storage set,
        bytes32 value
    ) internal view returns (bool) {
        return _contains(set._inner, value);
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(Bytes32Set storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(
        Bytes32Set storage set,
        uint256 index
    ) internal view returns (bytes32) {
        return _at(set._inner, index);
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(
        Bytes32Set storage set
    ) internal view returns (bytes32[] memory) {
        bytes32[] memory store = _values(set._inner);
        bytes32[] memory result;

        /// @solidity memory-safe-assembly
        assembly {
            result := store
        }

        return result;
    }

    // AddressSet

    struct AddressSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(
        AddressSet storage set,
        address value
    ) internal returns (bool) {
        return _add(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(
        AddressSet storage set,
        address value
    ) internal returns (bool) {
        return _remove(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(
        AddressSet storage set,
        address value
    ) internal view returns (bool) {
        return _contains(set._inner, bytes32(uint256(uint160(value))));
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(AddressSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(
        AddressSet storage set,
        uint256 index
    ) internal view returns (address) {
        return address(uint160(uint256(_at(set._inner, index))));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(
        AddressSet storage set
    ) internal view returns (address[] memory) {
        bytes32[] memory store = _values(set._inner);
        address[] memory result;

        /// @solidity memory-safe-assembly
        assembly {
            result := store
        }

        return result;
    }

    // UintSet

    struct UintSet {
        Set _inner;
    }

    /**
     * @dev Add a value to a set. O(1).
     *
     * Returns true if the value was added to the set, that is if it was not
     * already present.
     */
    function add(UintSet storage set, uint256 value) internal returns (bool) {
        return _add(set._inner, bytes32(value));
    }

    /**
     * @dev Removes a value from a set. O(1).
     *
     * Returns true if the value was removed from the set, that is if it was
     * present.
     */
    function remove(
        UintSet storage set,
        uint256 value
    ) internal returns (bool) {
        return _remove(set._inner, bytes32(value));
    }

    /**
     * @dev Returns true if the value is in the set. O(1).
     */
    function contains(
        UintSet storage set,
        uint256 value
    ) internal view returns (bool) {
        return _contains(set._inner, bytes32(value));
    }

    /**
     * @dev Returns the number of values in the set. O(1).
     */
    function length(UintSet storage set) internal view returns (uint256) {
        return _length(set._inner);
    }

    /**
     * @dev Returns the value stored at position `index` in the set. O(1).
     *
     * Note that there are no guarantees on the ordering of values inside the
     * array, and it may change when more values are added or removed.
     *
     * Requirements:
     *
     * - `index` must be strictly less than {length}.
     */
    function at(
        UintSet storage set,
        uint256 index
    ) internal view returns (uint256) {
        return uint256(_at(set._inner, index));
    }

    /**
     * @dev Return the entire set in an array
     *
     * WARNING: This operation will copy the entire storage to memory, which can be quite expensive. This is designed
     * to mostly be used by view accessors that are queried without any gas fees. Developers should keep in mind that
     * this function has an unbounded cost, and using it as part of a state-changing function may render the function
     * uncallable if the set grows to a point where copying to memory consumes too much gas to fit in a block.
     */
    function values(
        UintSet storage set
    ) internal view returns (uint256[] memory) {
        bytes32[] memory store = _values(set._inner);
        uint256[] memory result;

        /// @solidity memory-safe-assembly
        assembly {
            result := store
        }

        return result;
    }
}

// node_modules/@openzeppelin/contracts/access/IAccessControl.sol

// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

/**
 * @dev External interface of AccessControl declared to support ERC165 detection.
 */
interface IAccessControl {
    /**
     * @dev Emitted when `newAdminRole` is set as ``role``'s admin role, replacing `previousAdminRole`
     *
     * `DEFAULT_ADMIN_ROLE` is the starting admin for all roles, despite
     * {RoleAdminChanged} not being emitted signaling this.
     *
     * _Available since v3.1._
     */
    event RoleAdminChanged(
        bytes32 indexed role,
        bytes32 indexed previousAdminRole,
        bytes32 indexed newAdminRole
    );

    /**
     * @dev Emitted when `account` is granted `role`.
     *
     * `sender` is the account that originated the contract call, an admin role
     * bearer except when using {AccessControl-_setupRole}.
     */
    event RoleGranted(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    /**
     * @dev Emitted when `account` is revoked `role`.
     *
     * `sender` is the account that originated the contract call:
     *   - if using `revokeRole`, it is the admin role bearer
     *   - if using `renounceRole`, it is the role bearer (i.e. `account`)
     */
    event RoleRevoked(
        bytes32 indexed role,
        address indexed account,
        address indexed sender
    );

    /**
     * @dev Returns `true` if `account` has been granted `role`.
     */
    function hasRole(
        bytes32 role,
        address account
    ) external view returns (bool);

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {AccessControl-_setRoleAdmin}.
     */
    function getRoleAdmin(bytes32 role) external view returns (bytes32);

    /**
     * @dev Grants `role` to `account`.
     *
     * If `account` had not been already granted `role`, emits a {RoleGranted}
     * event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function grantRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from `account`.
     *
     * If `account` had been granted `role`, emits a {RoleRevoked} event.
     *
     * Requirements:
     *
     * - the caller must have ``role``'s admin role.
     */
    function revokeRole(bytes32 role, address account) external;

    /**
     * @dev Revokes `role` from the calling account.
     *
     * Roles are often managed via {grantRole} and {revokeRole}: this function's
     * purpose is to provide a mechanism for accounts to lose their privileges
     * if they are compromised (such as when a trusted device is misplaced).
     *
     * If the calling account had been granted `role`, emits a {RoleRevoked}
     * event.
     *
     * Requirements:
     *
     * - the caller must be `account`.
     */
    function renounceRole(bytes32 role, address account) external;
}

// node_modules/@openzeppelin/contracts/utils/introspection/IERC165.sol

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

// node_modules/@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol

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
interface IERC165Upgradeable {
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

// node_modules/@erc725/smart-contracts-v8/contracts/interfaces/IERC725Y.sol

/**
 * @title The interface for ERC725Y sub-standard, a generic data key/value store.
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
interface IERC725Y {
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

// node_modules/@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiver.sol

/**
 * @title Interface of the LSP1 - Universal Receiver standard, an entry function for a contract to receive arbitrary information.
 * @dev LSP1UniversalReceiver allows to receive arbitrary messages and to be informed when assets are sent or received.
 */
interface ILSP1UniversalReceiver {
    /**
     * @dev Emitted when the {universalReceiver} function was called with a specific `typeId` and some `receivedData`
     * @notice Address `from` called the `universalReceiver(...)` function while sending `value` LYX. Notification type (typeId): `typeId` - Data received: `receivedData`.
     *
     * @param from The address of the EOA or smart contract that called the {universalReceiver(...)} function.
     * @param value The amount sent to the {universalReceiver(...)} function.
     * @param typeId A `bytes32` unique identifier (= _"hook"_) that describe the type of notification, information or transaction received by the contract. Can be related to a specific standard or a hook.
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

// packages/lsp7-contracts/contracts/ILSP7DigitalAsset.sol

/**
 * @title Interface of the LSP7 - Digital Asset standard, a fungible digital asset.
 */
interface ILSP7DigitalAsset {
    // --- Events

    /**
     * @dev Emitted when the `from` transferred successfully `amount` of tokens to `to`.
     * @param operator The address of the operator that executed the transfer.
     * @param from The address which tokens were sent from (balance decreased by `-amount`).
     * @param to The address that received the tokens (balance increased by `+amount`).
     * @param amount The amount of tokens transferred.
     * @param force if the transferred enforced the `to` recipient address to be a contract that implements the LSP1 standard or not.
     * @param data Any additional data included by the caller during the transfer, and sent in the LSP1 hooks to the `from` and `to` addresses.
     */
    event Transfer(
        address indexed operator,
        address indexed from,
        address indexed to,
        uint256 amount,
        bool force,
        bytes data
    );

    /**
     * @dev Emitted when `tokenOwner` enables `operator` for `amount` tokens.
     * @param operator The address authorized as an operator
     * @param tokenOwner The token owner
     * @param amount The amount of tokens `operator` address has access to from `tokenOwner`
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     */
    event OperatorAuthorizationChanged(
        address indexed operator,
        address indexed tokenOwner,
        uint256 indexed amount,
        bytes operatorNotificationData
    );

    /**
     * @dev Emitted when `tokenOwner` disables `operator` for `amount` tokens and set its {`authorizedAmountFor(...)`} to `0`.
     * @param operator The address revoked from operating
     * @param tokenOwner The token owner
     * @param notified Bool indicating whether the operator has been notified or not
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     */
    event OperatorRevoked(
        address indexed operator,
        address indexed tokenOwner,
        bool indexed notified,
        bytes operatorNotificationData
    );

    // --- Token queries

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * If the asset contract has been set to be non-divisible via the `isNonDivisible_` parameter in
     * the `constructor`, the decimals returned will be `0`. Otherwise `18` is the common value.
     *
     * @custom:notice This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {balanceOf} and {transfer}.
     *
     * @return the number of decimals. If `0` is returned, the asset is non-divisible.
     */
    function decimals() external view returns (uint8);

    /**
     * @dev Returns the number of existing tokens that have been minted in this contract.
     * @return The number of existing tokens.
     */
    function totalSupply() external view returns (uint256);

    // --- Token owner queries

    /**
     * @dev Get the number of tokens owned by `tokenOwner`.
     * If the token is divisible (the {decimals} function returns `18`), the amount returned should be divided
     * by 1e18 to get a better picture of the actual balance of the `tokenOwner`.
     *
     * _Example:_
     *
     * ```
     * balanceOf(someAddress) -> 42_000_000_000_000_000_000 / 1e18 = 42 tokens
     * ```
     *
     * @param tokenOwner The address of the token holder to query the balance for.
     * @return The amount of tokens owned by `tokenOwner`.
     */
    function balanceOf(address tokenOwner) external view returns (uint256);

    // --- Operator functionality

    /**
     * @dev Sets an `amount` of tokens that an `operator` has access from the caller's balance (allowance). See {authorizedAmountFor}.
     * Notify the operator based on the LSP1-UniversalReceiver standard
     *
     * @param operator The address to authorize as an operator.
     * @param amount The allowance amount of tokens operator has access to.
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     *
     * @custom:requirements
     * - `operator` cannot be the zero address.
     *
     * @custom:events {OperatorAuthorizationChanged} when allowance is given to a new operator or
     * an existing operator's allowance is updated.
     */
    function authorizeOperator(
        address operator,
        uint256 amount,
        bytes memory operatorNotificationData
    ) external;

    /**
     * @dev Enables `tokenOwner` to remove `operator` for its tokens, disallowing it to send any amount of tokens on its behalf.
     * This function also allows the `operator` to remove itself if it is the caller of this function
     *
     * @param operator The address to revoke as an operator.
     * @param tokenOwner The address of the token owner.
     * @param notify Boolean indicating whether to notify the operator or not.
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     *
     * @custom:requirements
     * - caller MUST be `operator` or `tokenOwner`
     * - `operator` cannot be the zero address.
     *
     * @custom:events {OperatorRevoked} event with address of the operator being revoked for the caller (token holder).
     */
    function revokeOperator(
        address operator,
        address tokenOwner,
        bool notify,
        bytes memory operatorNotificationData
    ) external;

    /**
     * @custom:info This function in the LSP7 contract can be used as a prevention mechanism
     * against double spending allowance vulnerability.
     *
     * @notice Increase the allowance of `operator` by +`addedAmount`
     *
     * @dev Atomically increases the allowance granted to `operator` by the caller.
     * This is an alternative approach to {authorizeOperator} that can be used as a mitigation
     * for the double spending allowance problem.
     * Notify the operator based on the LSP1-UniversalReceiver standard
     *
     * @param operator The operator to increase the allowance for `msg.sender`
     * @param addedAmount The additional amount to add on top of the current operator's allowance
     *
     * @custom:requirements
     *  - `operator` cannot be the same address as `msg.sender`
     *  - `operator` cannot be the zero address.
     *
     * @custom:events {OperatorAuthorizationChanged} indicating the updated allowance
     */
    function increaseAllowance(
        address operator,
        uint256 addedAmount,
        bytes memory operatorNotificationData
    ) external;

    /**
     * @custom:info This function in the LSP7 contract can be used as a prevention mechanism
     * against the double spending allowance vulnerability.
     *
     * @notice Decrease the allowance of `operator` by -`subtractedAmount`
     *
     * @dev Atomically decreases the allowance granted to `operator` by the caller.
     * This is an alternative approach to {authorizeOperator} that can be used as a mitigation
     * for the double spending allowance problem.
     * Notify the operator based on the LSP1-UniversalReceiver standard
     *
     * @custom:events
     *  - {OperatorAuthorizationChanged} event indicating the updated allowance after decreasing it.
     *  - {OperatorRevoked} event if `subtractedAmount` is the full allowance,
     *    indicating `operator` does not have any alauthorizedAmountForlowance left for `msg.sender`.
     *
     * @param operator The operator to decrease allowance for `msg.sender`
     * @param tokenOwner The address of the token owner.
     * @param subtractedAmount The amount to decrease by in the operator's allowance.
     *
     * @custom:requirements
     *  - `operator` cannot be the zero address.
     *  - `operator` must have allowance for the caller of at least `subtractedAmount`.
     */
    function decreaseAllowance(
        address operator,
        address tokenOwner,
        uint256 subtractedAmount,
        bytes memory operatorNotificationData
    ) external;

    /**
     * @dev Get the amount of tokens `operator` address has access to from `tokenOwner`.
     * Operators can send and burn tokens on behalf of their owners.
     *
     * @param operator The operator's address to query the authorized amount for.
     * @param tokenOwner The token owner that `operator` has allowance on.
     *
     * @return The amount of tokens the `operator`'s address has access on the `tokenOwner`'s balance.
     *
     * @custom:info If this function is called with the same address for `operator` and `tokenOwner`, it will simply read the `tokenOwner`'s balance
     * (since a tokenOwner is its own operator).
     */
    function authorizedAmountFor(
        address operator,
        address tokenOwner
    ) external view returns (uint256);

    /**
     * @dev Returns all `operator` addresses that are allowed to transfer or burn on behalf of `tokenOwner`.
     *
     * @param tokenOwner The token owner to get the operators for.
     * @return An array of operators allowed to transfer or burn tokens on behalf of `tokenOwner`.
     */
    function getOperatorsOf(
        address tokenOwner
    ) external view returns (address[] memory);

    // --- Transfer functionality

    /**
     * @dev Transfers an `amount` of tokens from the `from` address to the `to` address and notify both sender and recipients via the LSP1 {`universalReceiver(...)`} function.
     * If the tokens are transferred by an operator on behalf of a token holder, the allowance for the operator will be decreased by `amount` once the token transfer
     * has been completed (See {authorizedAmountFor}).
     *
     * @param from The sender address.
     * @param to The recipient address.
     * @param amount The amount of tokens to transfer.
     * @param force When set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.
     * @param data Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.
     *
     * @custom:requirements
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` and `to` cannot be the same address (`from` cannot send tokens to itself).
     * - `from` MUST have a balance of at least `amount` tokens.
     * - If the caller is not `from`, it must be an operator for `from` with an allowance of at least `amount` of tokens.
     *
     * @custom:events
     * - {Transfer} event when tokens get successfully transferred.
     * - if the transfer is triggered by an operator, either the {OperatorAuthorizationChanged} event will be emitted with the updated allowance or the {OperatorRevoked}
     * event will be emitted if the operator has no more allowance left.
     *
     * @custom:hint The `force` parameter **MUST be set to `true`** to transfer tokens to Externally Owned Accounts (EOAs)
     * or contracts that do not implement the LSP1 Universal Receiver Standard. Otherwise the function will revert making the transfer fail.
     *
     * @custom:info if the `to` address is a contract that implements LSP1, it will always be notified via its `universalReceiver(...)` function, regardless if `force` is set to `true` or `false`.
     *
     * @custom:info Note that token transfers revert when no allowance is given, including when the `amount` is `0`.
     * This is to prevent this function from being used maliciously, such as performing zero-value token transfer phishing attacks.
     *
     * @custom:warning Be aware that when either the sender or the recipient can have logic that revert in their `universalReceiver(...)` function when being notified.
     * This even if the `force` was set to `true`.
     */
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) external;

    /**
     * @dev Same as {`transfer(...)`} but transfer multiple tokens based on the arrays of `from`, `to`, `amount`.
     *
     * @custom:info If any transfer in the batch fail or revert, the whole call will revert.
     *
     * @param from An array of sending addresses.
     * @param to An array of receiving addresses.
     * @param amount An array of amount of tokens to transfer for each `from -> to` transfer.
     * @param force For each transfer, when set to `true`, the `to` address CAN be any address. When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.
     * @param data An array of additional data the caller wants included in the emitted event, and sent in the hooks to `from` and `to` addresses.
     *
     * @custom:requirements
     * - `from`, `to`, `amount` lists MUST be of the same length.
     * - no values in `from` can be the zero address.
     * - no values in `to` can be the zero address.
     * - each `amount` tokens MUST be owned by `from`.
     * - for each transfer, if the caller is not `from`, it MUST be an operator for `from` with access to at least `amount` tokens.
     *
     * @custom:events {Transfer} event **for each token transfer**.
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        uint256[] memory amount,
        bool[] memory force,
        bytes[] memory data
    ) external;

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

// packages/lsp7-contracts/contracts/extensions/LSP7Mintable/ILSP7Mintable.sol

/// @title ILSP7Mintable
/// @dev Interface for a isMintable LSP7 token extension, allowing the owner to mint new tokens and disable minting.
interface ILSP7Mintable {
    /// @dev Emitted when minting status is changed.
    event MintingStatusChanged(bool indexed enabled);

    /// @notice Disables minting of new tokens permanently.
    /// @dev Can only be called by the contract owner. Prevents further calls to mint after invocation.
    /// @custom:events {MintingDisabled} event.
    function disableMinting() external;

    /// @notice Mints new tokens to a specified address.
    /// @dev Mints `amount` tokens to `to`, callable only by the contract owner. Emits a Transfer event as defined in ILSP7DigitalAsset. Reverts if `to` is the zero address or if minting is disabled.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`’s UniversalReceiver hook, if applicable.
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) external;
}

// node_modules/@lukso/lsp17contractextension-contracts/contracts/LSP17Constants.sol

// --- ERC165 interface ids

// bytes4(keccack256("LSP17Extendable"))
bytes4 constant _INTERFACEID_LSP17_EXTENDABLE = 0xa918fa6b;

// bytes4(keccack256("LSP17Extension"))
bytes4 constant _INTERFACEID_LSP17_EXTENSION = 0xcee78b40;

// --- ERC725Y Data Keys

// Extension Handler Prefix

// bytes10(keccak256('LSP17Extension'))
bytes10 constant _LSP17_EXTENSION_PREFIX = 0xcee78b4094da86011096;

// node_modules/@lukso/lsp17contractextension-contracts/contracts/LSP17Errors.sol

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

// node_modules/@lukso/lsp1-contracts/contracts/LSP1Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP1 = 0x6bb56a14;
bytes4 constant _INTERFACEID_LSP1_DELEGATE = 0xa245bbda;

// --- ERC725Y Data Keys

// bytes10(keccak256('LSP1UniversalReceiverDelegate'))
bytes10 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX = 0x0cfc51aec37c55a4d0b1;

// keccak256('LSP1UniversalReceiverDelegate')
bytes32 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY = 0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47;

// node_modules/@lukso/lsp4-contracts/contracts/LSP4Constants.sol

// Token types
uint256 constant _LSP4_TOKEN_TYPE_TOKEN = 0;
uint256 constant _LSP4_TOKEN_TYPE_NFT = 1;
uint256 constant _LSP4_TOKEN_TYPE_COLLECTION = 2;

// --- ERC725Y entries

// bytes10(keccak256('SupportedStandards')) + bytes2(0) + bytes20(keccak256('LSP4DigitalAsset'))
bytes32 constant _LSP4_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b60000a4d96624a38f7ac2d8d9a604ecf07c12c77e480c;

// bytes4(keccak256('LSP4DigitalAsset'))
bytes constant _LSP4_SUPPORTED_STANDARDS_VALUE = hex"a4d96624";

// keccak256('LSP4TokenName')
bytes32 constant _LSP4_TOKEN_NAME_KEY = 0xdeba1e292f8ba88238e10ab3c7f88bd4be4fac56cad5194b6ecceaf653468af1;

// keccak256('LSP4TokenSymbol')
bytes32 constant _LSP4_TOKEN_SYMBOL_KEY = 0x2f0a68ab07768e01943a599e73362a0e17a63a72e94dd2e384d2c1d4db932756;

// keccak256('LSP4TokenType')
bytes32 constant _LSP4_TOKEN_TYPE_KEY = 0xe0261fa95db2eb3b5439bd033cda66d56b96f92f243a8228fd87550ed7bdfdb3;

// keccak256('LSP4Creators[]')
bytes32 constant _LSP4_CREATORS_ARRAY_KEY = 0x114bd03b3a46d48759680d81ebb2b414fda7d030a7105a851867accf1c2352e7;

// bytes10(keccak256('LSP4CreatorsMap'))
bytes10 constant _LSP4_CREATORS_MAP_KEY_PREFIX = 0x6de85eaf5d982b4e5da0;

// keccak256('LSP4Metadata')
bytes32 constant _LSP4_METADATA_KEY = 0x9afb95cacc9f95858ec44aa8c3b685511002e30ae54415823f406128b85b238e;

// node_modules/@lukso/lsp4-contracts/contracts/LSP4Errors.sol

/**
 * @dev Reverts when trying to edit the data key `LSP4TokenName` after the digital asset contract has been deployed / initialized.
 * The `LSP4TokenName` data key is located inside the ERC725Y data key-value store of the digital asset contract.
 * It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.
 */
error LSP4TokenNameNotEditable();

/**
 * @dev Reverts when trying to edit the data key `LSP4TokenSymbol` after the digital asset contract has been deployed / initialized.
 * The `LSP4TokenSymbol` data key is located inside the ERC725Y data key-value store of the digital asset contract.
 * It can be set only once inside the constructor/initializer when the digital asset contract is being deployed / initialized.
 */
error LSP4TokenSymbolNotEditable();

/**
 * @dev Reverts when trying to edit the data key `LSP4TokenType` after the digital asset contract has been deployed / initialized.
 * The `LSP4TokenType` data key is located inside the ERC725Y data key-value store of the digital asset contract.
 * It can be set only once inside the constructor / initializer when the digital asset contract is being deployed / initialized.
 */
error LSP4TokenTypeNotEditable();

// packages/lsp7-contracts/contracts/LSP7Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP7 = 0xc52d6008;

bytes4 constant _INTERFACEID_LSP7_V0_12_0 = 0xdaa746b7;

bytes4 constant _INTERFACEID_LSP7_V0_14_0 = 0xb3c4928f;

// --- Token Hooks

// keccak256('LSP7Tokens_DelegatorNotification')
bytes32 constant _TYPEID_LSP7_DELEGATOR = 0x997bd66a7e7823b09383ec7ce65fc306af29b8f82a45627f8efc0408475de016;

// keccak256('LSP7Tokens_DelegateeNotification')
bytes32 constant _TYPEID_LSP7_DELEGATEE = 0x03fae98a28026f93c23e2c9438c2ef0faa101585127a89919d18f067d907b319;

// keccak256('LSP7Tokens_SenderNotification')
bytes32 constant _TYPEID_LSP7_TOKENSSENDER = 0x429ac7a06903dbc9c13dfcb3c9d11df8194581fa047c96d7a4171fc7402958ea;

// keccak256('LSP7Tokens_RecipientNotification')
bytes32 constant _TYPEID_LSP7_TOKENSRECIPIENT = 0x20804611b3e2ea21c480dc465142210acf4a2485947541770ec1fb87dee4a55c;

// keccak256('LSP7Tokens_OperatorNotification')
bytes32 constant _TYPEID_LSP7_TOKENOPERATOR = 0x386072cc5a58e61263b434c722725f21031cd06e7c552cfaa06db5de8a320dbc;

// packages/lsp7-contracts/contracts/LSP7Errors.sol

// --- Errors

/**
 * @dev reverts when sending an `amount` of tokens larger than the current `balance` of the `tokenOwner`.
 */
error LSP7AmountExceedsBalance(
    uint256 balance,
    address tokenOwner,
    uint256 amount
);

/**
 * @dev reverts when `operator` of `tokenOwner` send an `amount` of tokens
 * larger than the `authorizedAmount`.
 */
error LSP7AmountExceedsAuthorizedAmount(
    address tokenOwner,
    uint256 authorizedAmount,
    address operator,
    uint256 amount
);

/**
 * @dev reverts when trying to set the zero address as an operator.
 */
error LSP7CannotUseAddressZeroAsOperator();

/**
 * @dev reverts when trying to:
 * - mint tokens to the zero address.
 * - burn tokens from the zero address.
 * - transfer tokens from or to the zero address.
 */
error LSP7CannotSendWithAddressZero();

/**
 * @dev reverts when the array parameters used in {transferBatch} have different lengths.
 */
error LSP7InvalidTransferBatch();

/**
 * @dev reverts if the `tokenReceiver` does not implement LSP1
 * when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP7NotifyTokenReceiverContractMissingLSP1Interface(
    address tokenReceiver
);

/**
 * @dev reverts if the `tokenReceiver` is an EOA when minting or transferring tokens with `bool force` set as `false`.
 */
error LSP7NotifyTokenReceiverIsEOA(address tokenReceiver);

/**
 * @dev reverts when trying to authorize or revoke the token's owner as an operator.
 */
error LSP7TokenOwnerCannotBeOperator();

/**
 * @dev Reverts when trying to decrease an operator's allowance to more than its current allowance.
 */
error LSP7DecreasedAllowanceBelowZero();

/**
 * @dev Error occurs when sending native tokens to the LSP7 contract without sending any data.
 *
 * E.g. Sending value without passing a bytes4 function selector to call a LSP17 Extension.
 *
 * @notice LSP7 contract cannot receive native tokens.
 */
error LSP7TokenContractCannotHoldValue();

/**
 * @dev Reverts when token owner call {increaseAllowance} for an operator that does not have any allowance
 */
error OperatorAllowanceCannotBeIncreasedFromZero(address operator);

/**
 * @dev Reverts when a batch call failed.
 * @notice Batch call failed.
 */
error LSP7BatchCallFailed(uint256 callIndex);

/**
 * @dev Reverts when the call to revoke operator is not authorized.
 */
error LSP7RevokeOperatorNotAuthorized(
    address caller,
    address tokenOwner,
    address operator
);

/**
 * @dev Reverts when the call to decrease allowance is not authorized.
 */
error LSP7DecreaseAllowanceNotAuthorized(
    address caller,
    address tokenOwner,
    address operator
);

// packages/lsp7-contracts/contracts/extensions/LSP7Mintable/LSP7MintableErrors.sol

/// @dev Error thrown when attempting to mint tokens after minting has been disabled.
error LSP7MintDisabled();

// node_modules/@erc725/smart-contracts-v8/contracts/constants.sol

// ERC165 INTERFACE IDs
bytes4 constant _INTERFACEID_ERC725X = 0x7545acac;
bytes4 constant _INTERFACEID_ERC725Y = 0x629aa694;

// ERC725X OPERATION TYPES
uint256 constant OPERATION_0_CALL = 0;
uint256 constant OPERATION_1_CREATE = 1;
uint256 constant OPERATION_2_CREATE2 = 2;
uint256 constant OPERATION_3_STATICCALL = 3;
uint256 constant OPERATION_4_DELEGATECALL = 4;

// node_modules/@erc725/smart-contracts-v8/contracts/errors.sol

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

/**
 * @dev Reverts when trying to set `address(0)` as the contract owner when deploying the contract or initializing it.
 */
error OwnableCannotSetZeroAddressAsOwner();

// node_modules/@openzeppelin/contracts/utils/introspection/ERC165Checker.sol

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

// node_modules/@openzeppelin/contracts/access/IAccessControlEnumerable.sol

// OpenZeppelin Contracts v4.4.1 (access/IAccessControlEnumerable.sol)

/**
 * @dev External interface of AccessControlEnumerable declared to support ERC165 detection.
 */
interface IAccessControlEnumerable is IAccessControl {
    /**
     * @dev Returns one of the accounts that have `role`. `index` must be a
     * value between 0 and {getRoleMemberCount}, non-inclusive.
     *
     * Role bearers are not sorted in any particular way, and their ordering may
     * change at any point.
     *
     * WARNING: When using {getRoleMember} and {getRoleMemberCount}, make sure
     * you perform all queries on the same block. See the following
     * https://forum.openzeppelin.com/t/iterating-over-elements-on-enumerableset-in-openzeppelin-contracts/2296[forum post]
     * for more information.
     */
    function getRoleMember(
        bytes32 role,
        uint256 index
    ) external view returns (address);

    /**
     * @dev Returns the number of accounts that have `role`. Can be used
     * together with {getRoleMember} to enumerate all bearers of a role.
     */
    function getRoleMemberCount(bytes32 role) external view returns (uint256);
}

// node_modules/@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol

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

// node_modules/@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol

// OpenZeppelin Contracts (last updated v4.9.0) (proxy/utils/Initializable.sol)

/**
 * @dev This is a base contract to aid in writing upgradeable contracts, or any kind of contract that will be deployed
 * behind a proxy. Since proxied contracts do not make use of a constructor, it's common to move constructor logic to an
 * external initializer function, usually called `initialize`. It then becomes necessary to protect this initializer
 * function so it can only be called once. The {initializer} modifier provided by this contract will have this effect.
 *
 * The initialization functions use a version number. Once a version number is used, it is consumed and cannot be
 * reused. This mechanism prevents re-execution of each "step" but allows the creation of new initialization steps in
 * case an upgrade adds a module that needs to be initialized.
 *
 * For example:
 *
 * [.hljs-theme-light.nopadding]
 * ```solidity
 * contract MyToken is ERC20Upgradeable {
 *     function initialize() initializer public {
 *         __ERC20_init("MyToken", "MTK");
 *     }
 * }
 *
 * contract MyTokenV2 is MyToken, ERC20PermitUpgradeable {
 *     function initializeV2() reinitializer(2) public {
 *         __ERC20Permit_init("MyToken");
 *     }
 * }
 * ```
 *
 * TIP: To avoid leaving the proxy in an uninitialized state, the initializer function should be called as early as
 * possible by providing the encoded function call as the `_data` argument to {ERC1967Proxy-constructor}.
 *
 * CAUTION: When used with inheritance, manual care must be taken to not invoke a parent initializer twice, or to ensure
 * that all initializers are idempotent. This is not verified automatically as constructors are by Solidity.
 *
 * [CAUTION]
 * ====
 * Avoid leaving a contract uninitialized.
 *
 * An uninitialized contract can be taken over by an attacker. This applies to both a proxy and its implementation
 * contract, which may impact the proxy. To prevent the implementation contract from being used, you should invoke
 * the {_disableInitializers} function in the constructor to automatically lock it when it is deployed:
 *
 * [.hljs-theme-light.nopadding]
 * ```
 * /// @custom:oz-upgrades-unsafe-allow constructor
 * constructor() {
 *     _disableInitializers();
 * }
 * ```
 * ====
 */
abstract contract Initializable {
    /**
     * @dev Indicates that the contract has been initialized.
     * @custom:oz-retyped-from bool
     */
    uint8 private _initialized;

    /**
     * @dev Indicates that the contract is in the process of being initialized.
     */
    bool private _initializing;

    /**
     * @dev Triggered when the contract has been initialized or reinitialized.
     */
    event Initialized(uint8 version);

    /**
     * @dev A modifier that defines a protected initializer function that can be invoked at most once. In its scope,
     * `onlyInitializing` functions can be used to initialize parent contracts.
     *
     * Similar to `reinitializer(1)`, except that functions marked with `initializer` can be nested in the context of a
     * constructor.
     *
     * Emits an {Initialized} event.
     */
    modifier initializer() {
        bool isTopLevelCall = !_initializing;
        require(
            (isTopLevelCall && _initialized < 1) ||
                (!AddressUpgradeable.isContract(address(this)) &&
                    _initialized == 1),
            "Initializable: contract is already initialized"
        );
        _initialized = 1;
        if (isTopLevelCall) {
            _initializing = true;
        }
        _;
        if (isTopLevelCall) {
            _initializing = false;
            emit Initialized(1);
        }
    }

    /**
     * @dev A modifier that defines a protected reinitializer function that can be invoked at most once, and only if the
     * contract hasn't been initialized to a greater version before. In its scope, `onlyInitializing` functions can be
     * used to initialize parent contracts.
     *
     * A reinitializer may be used after the original initialization step. This is essential to configure modules that
     * are added through upgrades and that require initialization.
     *
     * When `version` is 1, this modifier is similar to `initializer`, except that functions marked with `reinitializer`
     * cannot be nested. If one is invoked in the context of another, execution will revert.
     *
     * Note that versions can jump in increments greater than 1; this implies that if multiple reinitializers coexist in
     * a contract, executing them in the right order is up to the developer or operator.
     *
     * WARNING: setting the version to 255 will prevent any future reinitialization.
     *
     * Emits an {Initialized} event.
     */
    modifier reinitializer(uint8 version) {
        require(
            !_initializing && _initialized < version,
            "Initializable: contract is already initialized"
        );
        _initialized = version;
        _initializing = true;
        _;
        _initializing = false;
        emit Initialized(version);
    }

    /**
     * @dev Modifier to protect an initialization function so that it can only be invoked by functions with the
     * {initializer} and {reinitializer} modifiers, directly or indirectly.
     */
    modifier onlyInitializing() {
        require(_initializing, "Initializable: contract is not initializing");
        _;
    }

    /**
     * @dev Locks the contract, preventing any future reinitialization. This cannot be part of an initializer call.
     * Calling this in the constructor of a contract will prevent that contract from being initialized or reinitialized
     * to any version. It is recommended to use this to lock implementation contracts that are designed to be called
     * through proxies.
     *
     * Emits an {Initialized} event the first time it is successfully executed.
     */
    function _disableInitializers() internal virtual {
        require(!_initializing, "Initializable: contract is initializing");
        if (_initialized != type(uint8).max) {
            _initialized = type(uint8).max;
            emit Initialized(type(uint8).max);
        }
    }

    /**
     * @dev Returns the highest version that has been initialized. See {reinitializer}.
     */
    function _getInitializedVersion() internal view returns (uint8) {
        return _initialized;
    }

    /**
     * @dev Returns `true` if the contract is currently initializing. See {onlyInitializing}.
     */
    function _isInitializing() internal view returns (bool) {
        return _initializing;
    }
}

// node_modules/@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol

// OpenZeppelin Contracts (last updated v4.9.4) (utils/Context.sol)

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract ContextUpgradeable is Initializable {
    function __Context_init() internal onlyInitializing {}

    function __Context_init_unchained() internal onlyInitializing {}
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }

    function _contextSuffixLength() internal view virtual returns (uint256) {
        return 0;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}

// packages/lsp7-contracts/contracts/extensions/AccessControlExtended/IAccessControlExtended.sol

// interfaces

/**
 * @title IAccessControlExtended
 *
 * @dev Interface extending IAccessControlEnumerable with reverse role lookups and function to set admin role for a given role.
 * Inherits all functions from {IAccessControl} and {IAccessControlEnumerable}.
 *
 * @custom:info This interface only include the setter function `setRoleAdmin(bytes32,bytes32)`. The getter `getRoleAdmin(bytes32)` is inherited from {IAccessControl}
 * (itself inherited through {IAccessControlEnumerable}). This ensures that the selector `getRoleAdmin(bytes32)` is not used twice to calculate the final interface Id.
 */
interface IAccessControlExtended is IAccessControlEnumerable {
    /**
     * @notice Sets a new admin role for `role`.
     * @param role The role identifier being configured.
     * @param adminRole The role that will become the new admin of `role`.
     */
    function setRoleAdmin(bytes32 role, bytes32 adminRole) external;

    /**
     * @notice Returns all members that hold `role`.
     *
     * @dev Convenience function that returns the full membership array in a single call.
     * Equivalent to calling {getRoleMember} for each index from `0` to
     * `getRoleMemberCount(role) - 1`.
     *
     * @param role The role identifier to query members for.
     * @return An array of addresses that currently hold the specified role.
     *
     * @custom:warning This function copies the entire role membership set into memory.
     * For roles with a large number of members, this may consume a significant amount of gas. If calling this function on-chain, consider calling `{getRoleMember}` repeatedly, using `getRoleMemberCount` to know as max index.
     * This function is primarily intended for off-chain usage.
     */
    function getRoleMembers(
        bytes32 role
    ) external view returns (address[] memory);

    /**
     * @notice Returns all roles assigned to `account`.
     * @dev Uses a reverse lookup to enumerate all roles held by a given address.
     * @param account The address to query roles for.
     * @return An array of role identifiers assigned to the account.
     */
    function rolesOf(address account) external view returns (bytes32[] memory);
}

// node_modules/@lukso/lsp2-contracts/contracts/LSP2Utils.sol

// interfaces

/**
 * @title LSP2 Utility library.
 * @author Jean Cavallera <CJ42>, Yamen Merhi <YamenMerhi>, Daniel Afteni <B00ste>
 * @dev LSP2Utils is a library of utility functions that can be used to encode data key of different key type
 * defined on the LSP2 standard.
 * Based on LSP2 ERC725Y JSON Schema standard.
 */
library LSP2Utils {
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

        // solhint-disable-next-line gas-strict-inequalities,gas-custom-errors
        require(dataKey.length >= 2, "MUST be longer than 2 characters");

        // utf8 chars: 0x5b for "[" and 0x5d for "]"
        // solhint-disable-next-line gas-strict-inequalities,gas-custom-errors
        require(
            dataKey[dataKey.length - 2] == 0x5b &&
                dataKey[dataKey.length - 1] == 0x5d,
            "Key name must end with '[]'"
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
            // solhint-disable-next-line gas-strict-inequalities
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

        // update the number of received assets (value is assumed to be previous length decremented by 1)
        dataKeys[0] = arrayKey;
        dataValues[0] = abi.encodePacked(newArrayLength);

        // remove the data value for the map key of the element
        dataKeys[1] = removedElementMapKey;
        dataValues[1] = "";

        // Get the data value for the data key index of the last element in the array
        bytes32 lastElementIndexKey = LSP2Utils.generateArrayElementKeyAtIndex(
            arrayKey,
            newArrayLength
        );
        bytes20 lastElementIndexValue = bytes20(
            erc725YContract.getData(lastElementIndexKey)
        );

        // Set data value of the last element instead of the element from the array that will be removed
        dataKeys[2] = removedElementIndexKey;
        dataValues[2] = bytes.concat(lastElementIndexValue);

        // Remove the data value for the swapped array element
        dataKeys[3] = lastElementIndexKey;
        dataValues[3] = "";

        // Update the map value of the swapped array element to the new index
        bytes32 lastElementMapKey = LSP2Utils.generateMappingKey(
            bytes10(removedElementMapKey),
            lastElementIndexValue
        );

        dataKeys[4] = lastElementMapKey;
        dataValues[4] = abi.encodePacked(
            bytes4(erc725YContract.getData(lastElementMapKey)), // casting to get the interface ID (first part of the tuple value)
            removedElementIndex
        );
    }
}

// node_modules/@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol

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
abstract contract ERC165Upgradeable is Initializable, IERC165Upgradeable {
    function __ERC165_init() internal onlyInitializing {}

    function __ERC165_init_unchained() internal onlyInitializing {}
    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return interfaceId == type(IERC165Upgradeable).interfaceId;
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[50] private __gap;
}

// node_modules/@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol

// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract OwnableUpgradeable is Initializable, ContextUpgradeable {
    address private _owner;

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    function __Ownable_init() internal onlyInitializing {
        __Ownable_init_unchained();
    }

    function __Ownable_init_unchained() internal onlyInitializing {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
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
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[49] private __gap;
}

// node_modules/@lukso/lsp1-contracts/contracts/LSP1Utils.sol

// libraries

// constants

// constants

/**
 * @title LSP1 Utility library.
 * @author Jean Cavallera <CJ42>, Yamen Merhi <YamenMerhi>, Daniel Afteni <B00ste>
 * @dev LSP1Utils is a library of utility functions that can be used to notify the `universalReceiver` function of a contract
 * that implements LSP1 and retrieve information related to LSP1 `typeId`.
 * Based on LSP1 Universal Receiver standard.
 */
library LSP1Utils {
    using ERC165Checker for address;

    /**
     * @dev Notify a contract at `lsp1Implementation` address by calling its `universalReceiver` function if this contract
     * supports the LSP1 interface.
     *
     * @param lsp1Implementation The address of the contract to notify.
     * @param typeId A `bytes32` typeId.
     * @param data Any optional data to send to the `universalReceiver` function to the `lsp1Implementation` address.
     */
    function notifyUniversalReceiver(
        address lsp1Implementation,
        bytes32 typeId,
        bytes memory data
    ) internal {
        if (
            lsp1Implementation.supportsERC165InterfaceUnchecked(
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

// node_modules/@lukso/lsp17contractextension-contracts/contracts/LSP17ExtendableInitAbstract.sol

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
abstract contract LSP17ExtendableInitAbstract is ERC165Upgradeable {
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
        (address erc165Extension, ) = _getExtensionAndForwardValue(
            ERC165Upgradeable.supportsInterface.selector
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
     * To be overridden.
     * Up to the implementer contract to return an extension based on a function selector
     */
    function _getExtensionAndForwardValue(
        bytes4 functionSelector
    ) internal view virtual returns (address, bool);

    /**
     * @dev Forwards the call to an extension mapped to a function selector.
     *
     * Calls {_getExtensionAndForwardValue} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the `address(0)` will be returned.
     * Forwards the value if the extension is payable.
     *
     * Reverts if there is no extension for the function being called.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * `CALL` opcode, passing the `msg.data` appended with the 20 bytes of the {msg.sender} and 32 bytes of the `msg.value`.
     *
     * @custom:hint This function does not forward to the extension contract the `msg.value` received by the contract that inherits `LSP17Extendable`.
     * If you would like to forward the `msg.value` to the extension contract, you can override the code of this internal function as follow:
     *
     * ```solidity
     * (bool success, bytes memory result) = extension.call{value: msg.value}(
     *     abi.encodePacked(callData, msg.sender, msg.value)
     * );
     * ```
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual returns (bytes memory) {
        // If there is a function selector
        (
            address extension,
            bool shouldForwardValue
        ) = _getExtensionAndForwardValue(msg.sig);

        // if no extension was found, revert
        if (extension == address(0))
            revert NoExtensionFoundForFunctionSelector(msg.sig);

        (bool success, bytes memory result) = extension.call{
            value: shouldForwardValue ? msg.value : 0
        }(abi.encodePacked(callData, msg.sender, msg.value));

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

// node_modules/@erc725/smart-contracts-v8/contracts/ERC725YInitAbstract.sol

// interfaces

// modules

// constants

// errors

/**
 * @title Inheritable Proxy Implementation of ERC725Y sub-standard, a generic data key/value store
 * @author Fabian Vogelsteller <fabian@lukso.network> and <CJ42>, <YamenMerhi>, <B00ste>, <SkimaHarvey>
 *
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
abstract contract ERC725YInitAbstract is
    OwnableUpgradeable,
    ERC165Upgradeable,
    IERC725Y
{
    /**
     * @dev Map `bytes32` data keys to their `bytes` data values.
     */
    mapping(bytes32 => bytes) internal _store;

    /**
     * @dev Internal function to initialize the contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    function _initialize(
        address initialOwner
    ) internal virtual onlyInitializing {
        if (initialOwner == address(0)) {
            revert OwnableCannotSetZeroAddressAsOwner();
        }
        OwnableUpgradeable._transferOwnership(initialOwner);
    }

    /**
     * @inheritdoc IERC725Y
     */
    function getData(
        bytes32 dataKey
    ) public view virtual override returns (bytes memory dataValue) {
        return _getData(dataKey);
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
     * **Note for developers:** despite the fact that this function is set as `payable`, the function is not intended to receive value
     * (= native tokens). **An additional check has been implemented to ensure that `msg.value` sent was equal to 0**.
     * If you want to allow this function to receive value in your inheriting contract, this function can be overridden to remove this check.
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
     * **Note for developers:** despite the fact that this function is set as `payable`, the function is not intended to receive value
     * (= native tokens). **An additional check has been implemented to ensure that `msg.value` sent was equal to 0**.
     * If you want to allow this function to receive value in your inheriting contract, this function can be overridden to remove this check.
     *
     * @custom:events {DataChanged} event **for each data key/value pair set**.
     */
    function setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) public payable virtual override onlyOwner {
        /// @dev do not allow to send value by default when setting data in ERC725Y
        if (msg.value != 0) revert ERC725Y_MsgValueDisallowed();
        _setDataBatch(dataKeys, dataValues);
    }

    /**
     * @dev Read the value stored under a specific `dataKey` inside the underlying ERC725Y storage,
     * represented as a mapping of `bytes32` data keys mapped to their `bytes` data values.
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
     * @dev Write a set of `dataValues` to the underlying ERC725Y storage for each associated `dataKeys`. The ERC725Y storage is
     * represented as a mapping of `bytes32` data keys mapped to their `bytes` data values.
     *
     * ```solidity
     * mapping(bytes32 => bytes) _store
     * ```
     *
     * @param dataKeys A bytes32 array of data keys to write the associated `bytes` value to the store.
     * @param dataValues The `bytes` values to associate with each given `dataKeys` in the ERC725Y storage.
     *
     * @custom:events {DataChanged} event emitted for each successful data key-value pairs set.
     */
    function _setDataBatch(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) internal virtual {
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
     * @inheritdoc ERC165Upgradeable
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_ERC725Y ||
            super.supportsInterface(interfaceId);
    }
}

// packages/lsp7-contracts/contracts/extensions/AccessControlExtended/AccessControlExtendedInitAbstract.sol

// interfaces

// modules

// libraries

// constants

// errors

/**
 * @title AccessControlExtendedInitAbstract
 * @dev Proxy/initializable variant of {AccessControlExtendedAbstract}. Uses
 * `__AccessControlExtended_init` / `__AccessControlExtended_init_unchained`
 * instead of a constructor, both guarded by `onlyInitializing`.
 */
abstract contract AccessControlExtendedInitAbstract is
    IAccessControlExtended,
    OwnableUpgradeable
{
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // --- Constants

    /// @dev The default admin role. Value is `bytes32(0)` per OZ convention.
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;

    // --- Storage

    /// @dev Mapping from role to its admin role.
    mapping(bytes32 role => bytes32 adminRole) private _roleAdmins;

    /// @dev Forward lookup: role -> set of member addresses.
    mapping(bytes32 role => EnumerableSet.AddressSet members)
        private _roleMembers;

    /// @dev Reverse lookup: address -> set of roles held.
    mapping(address account => EnumerableSet.Bytes32Set rolesAssigned)
        private _addressRoles;

    // --- Modifier

    /**
     * @dev Modifier that checks the caller has `role`.
     * Reverts with {AccessControlUnauthorizedAccount} if the check fails.
     */
    modifier onlyRole(bytes32 role) {
        _checkRole(role);
        _;
    }

    // --- Initializer

    /**
     * @dev Chained initializer that grants DEFAULT_ADMIN_ROLE to the initial owner,
     * so they appear in enumeration (getRoleMember, rolesOf) and can administer roles from initialization.
     */
    function __AccessControlExtended_init() internal virtual onlyInitializing {
        __AccessControlExtended_init_unchained();
    }

    /**
     * @dev Standalone initializer. Only grants DEFAULT_ADMIN_ROLE to the owner.
     * Use when the LSP7 base is already initialized through another path.
     */
    function __AccessControlExtended_init_unchained()
        internal
        virtual
        onlyInitializing
    {
        _grantRole(DEFAULT_ADMIN_ROLE, owner());
    }

    // --- ERC-165

    /**
     * @dev Returns true for {IAccessControl}, {IAccessControlEnumerable} and {IAccessControlExtended}.
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual returns (bool) {
        return
            interfaceId == _INTERFACEID_ACCESSCONTROL ||
            interfaceId == _INTERFACEID_ACCESSCONTROLENUMERABLE ||
            interfaceId == _INTERFACEID_ACCESSCONTROLEXTENDED;
    }

    // --- IAccessControl

    /// @inheritdoc IAccessControl
    function hasRole(
        bytes32 role,
        address account
    ) public view virtual returns (bool) {
        return _hasRole(role, account);
    }

    /// @inheritdoc IAccessControl
    function getRoleAdmin(bytes32 role) public view virtual returns (bytes32) {
        return _roleAdmins[role];
    }

    /**
     * @inheritdoc IAccessControlExtended
     *
     * @dev Sets `adminRole` as the admin of `role`. Available for extensions
     * to configure custom admin hierarchies.
     *
     * @custom:warning
     * - DO NOT expose this function without `onlyOwner` or `onlyRole(DEFAULT_ADMIN_ROLE)` access control.
     * - Be aware that calling `setRoleAdmin(X, X)` creates a self-admin where nobody can grant role `X` unless someone already holds role `X`.
     *
     * @custom:requirements
     * - `role` cannot be the `DEFAULT_ADMIN_ROLE`.
     * - The caller must hold the `DEFAULT_ADMIN_ROLE`.
     *
     * @custom:events {RoleAdminChanged} with the previous and new admin roles.
     */
    function setRoleAdmin(
        bytes32 role,
        bytes32 adminRole
    ) public virtual onlyRole(DEFAULT_ADMIN_ROLE) {
        _setRoleAdmin(role, adminRole);
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Grants `role` to `account`.
     *
     * @custom:requirements The caller must hold the admin role for `role`.
     */
    function grantRole(
        bytes32 role,
        address account
    ) public virtual onlyRole(getRoleAdmin(role)) {
        _grantRole(role, account);
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Revokes `role` from `account`. The caller must hold the admin role for `role`.
     *
     * @custom:warning `DEFAULT_ADMIN_ROLE` cannot be removed from the current owner to prevent lockout.
     */
    function revokeRole(
        bytes32 role,
        address account
    ) public virtual onlyRole(getRoleAdmin(role)) {
        require(
            !(role == DEFAULT_ADMIN_ROLE && account == owner()),
            AccessControlUnauthorizedAccount(account, role)
        );
        _revokeRole(role, account);
    }

    /**
     * @inheritdoc IAccessControl
     * @dev Allows `msg.sender` to renounce their own `role`. The `callerConfirmation`
     * parameter must equal `msg.sender` to prevent accidental renouncement (OZ pattern).
     * Renouncing triggers data cleanup.
     *
     * @custom:warning The current owner cannot renounce `DEFAULT_ADMIN_ROLE`
     * to prevent locking the contract out of role administration.
     *
     * @custom:events Emits {RoleRevoked} if `msg.sender` currently holds `role` and successfully revokes it for itself.
     */
    function renounceRole(
        bytes32 role,
        address callerConfirmation
    ) public virtual {
        require(
            callerConfirmation == msg.sender,
            AccessControlBadConfirmation()
        );
        require(
            !(role == DEFAULT_ADMIN_ROLE && msg.sender == owner()),
            AccessControlUnauthorizedAccount(msg.sender, role)
        );
        _revokeRole(role, msg.sender);
    }

    // --- IAccessControlEnumerable

    /// @inheritdoc IAccessControlEnumerable
    function getRoleMember(
        bytes32 role,
        uint256 index
    ) public view virtual returns (address) {
        return _roleMembers[role].at(index);
    }

    /// @inheritdoc IAccessControlEnumerable
    function getRoleMemberCount(
        bytes32 role
    ) public view virtual returns (uint256) {
        return _roleMembers[role].length();
    }

    // --- IAccessControlExtended

    /// @inheritdoc IAccessControlExtended
    function rolesOf(
        address account
    ) public view virtual returns (bytes32[] memory) {
        return _addressRoles[account].values();
    }

    /**
     * @notice Returns all members that hold `role`.
     *
     * @dev Convenience function that returns the full membership array in a single call.
     * Equivalent to calling {getRoleMember} for each index from `0` to `getRoleMemberCount(role) - 1`.
     *
     * @param role The role identifier to query members for.
     * @return An array of addresses that currently hold the specified role.
     *
     * @custom:warning This function copies the entire role membership set into memory.
     * For roles with a large number of members, this may consume a significant amount of gas. If calling this function on-chain, consider calling `{getRoleMember}` repeatedly, using `getRoleMemberCount` to know as max index.
     * This function is primarily intended for off-chain usage.
     */
    function getRoleMembers(
        bytes32 role
    ) public view virtual returns (address[] memory) {
        return _roleMembers[role].values();
    }

    // --- Internal functions

    /**
     * @dev Grants `role` to `account`. No-op if the account already holds the role
     * (matching OZ behavior). Updates both forward and reverse lookups.
     *
     * @custom:events {RoleGranted} if the role was newly granted.
     */
    function _grantRole(bytes32 role, address account) internal virtual {
        bool added = _roleMembers[role].add(account);

        if (added) {
            _addressRoles[account].add(role);
            emit RoleGranted({
                role: role,
                account: account,
                sender: msg.sender
            });
        }
    }

    /**
     * @dev Revokes `role` from `account`. No-op if the account does not hold the role.
     * Auto-clears auxiliary data if any exists.
     *
     * @custom:events Emits {RoleRevoked} if the role was revoked.
     */
    function _revokeRole(bytes32 role, address account) internal virtual {
        bool removed = _roleMembers[role].remove(account);

        if (removed) {
            _addressRoles[account].remove(role);
            emit RoleRevoked({
                role: role,
                account: account,
                sender: msg.sender
            });
        }
    }

    /**
     * @dev Checks that `msg.sender` has `role`. Reverts with
     * {AccessControlUnauthorizedAccount} if the check fails.
     *
     * @custom:warning Overriding this function changes the behavior of the {onlyRole} modifier.
     */
    function _checkRole(bytes32 role) internal view virtual {
        _checkRole(role, msg.sender);
    }

    /**
     * @dev Checks that `account` has `role`.
     *
     * Reverts with {AccessControlUnauthorizedAccount} if the account does not
     * explicitly hold the role.
     */
    function _checkRole(bytes32 role, address account) internal view virtual {
        require(
            _hasRole(role, account),
            AccessControlUnauthorizedAccount(account, role)
        );
    }

    function _hasRole(
        bytes32 role,
        address account
    ) internal view virtual returns (bool) {
        return _roleMembers[role].contains(account);
    }

    function _setRoleAdmin(bytes32 role, bytes32 adminRole) internal virtual {
        require(
            role != DEFAULT_ADMIN_ROLE,
            AccessControlCannotSetAdminForDefaultAdminRole()
        );

        bytes32 previousAdminRole = getRoleAdmin(role);
        _roleAdmins[role] = adminRole;

        emit RoleAdminChanged({
            role: role,
            previousAdminRole: previousAdminRole,
            newAdminRole: adminRole
        });
    }

    // --- Ownership sync

    /**
     * @dev Overrides `_transferOwnership` to automatically transfer ALL roles held by
     * the old owner to the new owner. This includes `DEFAULT_ADMIN_ROLE` and any other
     * custom roles the old owner was assigned.
     *
     * For each role held by the old owner:
     * 1. The role is revoked from the old owner (including clearing auxiliary data).
     * 2. The role is granted to the new owner (if not already held).
     *
     * @custom:info When renouncing ownership, roles are only removed from the old owner. Roles are not passed to `address(0)` (being the `newOwner` in the case of renounce ownership).
     *
     * @custom:warning
     * - Gas cost scales linearly with the number of roles the old owner holds.
     * - Auxiliary role data set on the old owner is transferred to the new owner if ownership is transferred.
     * - Transferring ownership to self will still clear then restore the old owner's auxiliary role data.
     * - If the old owner holds a large number of roles, the transaction may approach or exceed
     *   the block gas limit and fail. Avoid assigning too many roles to the owner to ensure
     *   ownership transfers remain callable.
     */
    function _transferOwnership(address newOwner) internal virtual override {
        address oldOwner = owner();
        OwnableUpgradeable._transferOwnership(newOwner);

        // Snapshot the old owner's roles before mutating storage (values() returns a memory copy)
        bytes32[] memory oldOwnerRoles = _addressRoles[oldOwner].values();

        for (uint256 ii = 0; ii < oldOwnerRoles.length; ++ii) {
            bytes32 role = oldOwnerRoles[ii];

            _revokeRole(role, oldOwner);

            // exclude case when renouncing ownership
            if (newOwner != address(0)) {
                _grantRole(role, newOwner);
            }
        }
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     *
     * @custom:info The size of the `__gap` array is calculated so that the amount of storage used by the contract
     * always adds up to the same number (in this case 50 storage slots).
     */
    uint256[47] private __gap;
}

// node_modules/@lukso/lsp4-contracts/contracts/LSP4DigitalAssetMetadataInitAbstract.sol

// modules

// constants

// errors

/**
 * @title Implementation of a LSP4DigitalAssetMetadata contract that stores the **Token-Metadata** (`LSP4TokenName` and `LSP4TokenSymbol`) in its ERC725Y data store.
 * @author Matthew Stevens
 * @dev Inheritable Proxy Implementation of the LSP4 standard.
 */
abstract contract LSP4DigitalAssetMetadataInitAbstract is ERC725YInitAbstract {
    /**
     * @notice Initializing a digital asset `name_` with the `symbol_` symbol.
     *
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param initialOwner_ The owner of the token contract
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`1` = Token, `2` = NFT, `3` = Collection)
     */
    function _initialize(
        string memory name_,
        string memory symbol_,
        address initialOwner_,
        uint256 lsp4TokenType_
    ) internal virtual onlyInitializing {
        ERC725YInitAbstract._initialize(initialOwner_);

        // set data key SupportedStandards:LSP4DigitalAsset
        ERC725YInitAbstract._setData(
            _LSP4_SUPPORTED_STANDARDS_KEY,
            _LSP4_SUPPORTED_STANDARDS_VALUE
        );

        ERC725YInitAbstract._setData(_LSP4_TOKEN_NAME_KEY, bytes(name_));
        ERC725YInitAbstract._setData(_LSP4_TOKEN_SYMBOL_KEY, bytes(symbol_));
        ERC725YInitAbstract._setData(
            _LSP4_TOKEN_TYPE_KEY,
            abi.encode(lsp4TokenType_)
        );
    }

    /**
     * @dev The ERC725Y data keys `LSP4TokenName` and `LSP4TokenSymbol` cannot be changed
     * via this function once the digital asset contract has been deployed.
     */
    function _setData(
        bytes32 dataKey,
        bytes memory dataValue
    ) internal virtual override {
        if (dataKey == _LSP4_TOKEN_NAME_KEY) {
            revert LSP4TokenNameNotEditable();
        } else if (dataKey == _LSP4_TOKEN_SYMBOL_KEY) {
            revert LSP4TokenSymbolNotEditable();
        } else if (dataKey == _LSP4_TOKEN_TYPE_KEY) {
            revert LSP4TokenTypeNotEditable();
        } else {
            _store[dataKey] = dataValue;

            emit DataChanged(dataKey, dataValue);
        }
    }
}

// packages/lsp7-contracts/contracts/LSP7DigitalAssetInitAbstract.sol

// interfaces

// modules

// libraries

// constants

// errors

/**
 * @title Proxy Implementation of the LSP7 Digital Asset standard, a contract that represents a fungible token.
 * @author Matthew Stevens
 *
 * @dev This contract implement the core logic of the functions for the {ILSP7DigitalAsset} interface.
 * Minting and transferring are supplied with a `uint256` amount.
 * This implementation is agnostic to the way tokens are created.
 * A supply mechanism has to be added in a derived contract using {_mint}
 * For a generic mechanism, see {LSP7MintableInitAbstract}.
 */
abstract contract LSP7DigitalAssetInitAbstract is
    ILSP7DigitalAsset,
    LSP4DigitalAssetMetadataInitAbstract,
    LSP17ExtendableInitAbstract
{
    using EnumerableSet for EnumerableSet.AddressSet;

    // --- Storage

    bool internal _isNonDivisible;

    uint256 internal _existingTokens;

    // Mapping from `tokenOwner` to an `amount` of tokens
    mapping(address => uint256) internal _tokenOwnerBalances;

    // Mapping an `address` to its authorized operator addresses.
    mapping(address => EnumerableSet.AddressSet) internal _operators;

    // Mapping a `tokenOwner` to an `operator` to `amount` of tokens.
    mapping(address => mapping(address => uint256))
        internal _operatorAuthorizedAmount;

    function _initialize(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) internal virtual onlyInitializing {
        LSP4DigitalAssetMetadataInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_
        );

        _isNonDivisible = isNonDivisible_;
    }

    // fallback functions

    /**
     * @notice The `fallback` function was called with the following amount of native tokens: `msg.value`; and the following calldata: `callData`.
     *
     * @dev Achieves the goal of [LSP-17-ContractExtension] standard by extending the contract to handle calls of functions that do not exist natively,
     * forwarding the function call to the extension address mapped to the function being called.
     *
     * This function is executed when:
     *    - Sending data of length less than 4 bytes to the contract.
     *    - The first 4 bytes of the calldata do not match any publicly callable functions from the contract ABI.
     *    - Receiving native tokens
     *
     * 1. If the data is equal or longer than 4 bytes, the [ERC-725Y] storage is queried with the following data key: [_LSP17_EXTENSION_PREFIX] + `bytes4(msg.sig)` (Check [LSP-2-ERC725YJSONSchema] for encoding the data key)
     *
     *   - If there is no address stored under the following data key, revert with {NoExtensionFoundForFunctionSelector(bytes4)}. The data key relative to `bytes4(0)` is an exception, where no reverts occurs if there is no extension address stored under. This exception is made to allow users to send random data (graffiti) to the account and to be able to react on it.
     *
     *   - If there is an address, forward the `msg.data` to the extension using the CALL opcode, appending 52 bytes (20 bytes of `msg.sender` and 32 bytes of `msg.value`). Return what the calls returns, or revert if the call failed.
     *
     * 2. If the data sent to this function is of length less than 4 bytes (not a function selector), revert.
     */
    // solhint-disable-next-line no-complex-fallback
    fallback(
        bytes calldata callData
    ) external payable virtual returns (bytes memory) {
        require(msg.data.length >= 4, InvalidFunctionSelector(callData));
        return _fallbackLSP17Extendable(callData);
    }

    /**
     * @dev Reverts whenever someone tries to send native tokens to a LSP7 contract.
     * @notice LSP7 contract cannot receive native tokens.
     */
    receive() external payable virtual {
        // revert on empty calls with no value
        if (msg.value == 0) {
            revert InvalidFunctionSelector(hex"00000000");
        }

        revert LSP7TokenContractCannotHoldValue();
    }

    /**
     * @dev Forwards the call with the received value to an extension mapped to a function selector.
     *
     * Calls {_getExtensionAndForwardValue} to get the address of the extension mapped to the function selector being
     * called on the account. If there is no extension, the address(0) will be returned.
     * Forwards the value if the extension is payable.
     *
     * Reverts if there is no extension for the function being called.
     *
     * If there is an extension for the function selector being called, it calls the extension with the
     * CALL opcode, passing the {msg.data} appended with the 20 bytes of the {msg.sender} and
     * 32 bytes of the {msg.value}
     *
     * @custom:info The LSP7 Token contract should not hold any native tokens. Any native tokens received by the contract
     * will be forwarded to the extension address mapped to the selector from `msg.sig`.
     */
    function _fallbackLSP17Extendable(
        bytes calldata callData
    ) internal virtual override returns (bytes memory) {
        // If there is a function selector
        (address extension, ) = _getExtensionAndForwardValue(msg.sig);

        // if no extension was found, revert
        require(
            extension != address(0),
            NoExtensionFoundForFunctionSelector(msg.sig)
        );

        (bool success, bytes memory result) = extension.call{value: msg.value}(
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

    /**
     * @dev Returns the extension address stored under the following data key:
     * - {_LSP17_EXTENSION_PREFIX} + `<bytes4>` (Check [LSP2-ERC725YJSONSchema] for encoding the data key).
     * - If no extension is stored, returns the address(0).
     * - We do not check that payable bool as in lsp7 standard we will always forward the value to the extension
     */
    function _getExtensionAndForwardValue(
        bytes4 functionSelector
    ) internal view virtual override returns (address, bool) {
        // Generate the data key relevant for the functionSelector being called
        bytes32 mappedExtensionDataKey = LSP2Utils.generateMappingKey(
            _LSP17_EXTENSION_PREFIX,
            functionSelector
        );

        // Check if there is an extension stored under the generated data key
        bytes memory extensionAddress = ERC725YInitAbstract._getData(
            mappedExtensionDataKey
        );
        require(
            extensionAddress.length == 20 || extensionAddress.length == 0,
            InvalidExtensionAddress(extensionAddress)
        );

        return (address(bytes20(extensionAddress)), true);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC725YInitAbstract, LSP17ExtendableInitAbstract)
        returns (bool)
    {
        return
            interfaceId == _INTERFACEID_LSP7 ||
            super.supportsInterface(interfaceId) ||
            LSP17ExtendableInitAbstract._supportsInterfaceInERC165Extension(
                interfaceId
            );
    }

    // --- Token queries

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function decimals() public view virtual override returns (uint8) {
        return _isNonDivisible ? 0 : 18;
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function totalSupply() public view virtual override returns (uint256) {
        return _existingTokens;
    }

    // --- Token owner queries

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function balanceOf(
        address tokenOwner
    ) public view virtual override returns (uint256) {
        return _tokenOwnerBalances[tokenOwner];
    }

    // --- General functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     *
     * @custom:info It's not possible to send value along the functions call due to the use of `delegatecall`.
     */
    function batchCalls(
        bytes[] calldata data
    ) public virtual override returns (bytes[] memory results) {
        results = new bytes[](data.length);
        for (uint256 i; i < data.length; ) {
            (bool success, bytes memory result) = address(this).delegatecall(
                data[i]
            );

            if (!success) {
                // Look for revert reason and bubble it up if present
                if (result.length != 0) {
                    // The easiest way to bubble the revert reason is using memory via assembly
                    // solhint-disable no-inline-assembly
                    /// @solidity memory-safe-assembly
                    assembly {
                        let returndata_size := mload(result)
                        revert(add(32, result), returndata_size)
                    }
                } else {
                    revert LSP7BatchCallFailed({callIndex: i});
                }
            }

            results[i] = result;

            unchecked {
                ++i;
            }
        }
    }

    // --- Operator functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     *
     * @custom:danger To avoid front-running and Allowance Double-Spend Exploit when
     * increasing or decreasing the authorized amount of an operator, it is advised to
     * use the {increaseAllowance} and {decreaseAllowance} functions.
     *
     * For more information, see:
     * https://docs.google.com/document/d/1YLPtQxZu1UAvO9cZ1O2RPXBbT0mooh4DYKjA_jp-RLM/
     */
    function authorizeOperator(
        address operator,
        uint256 amount,
        bytes memory operatorNotificationData
    ) public virtual override {
        _updateOperator(
            msg.sender,
            operator,
            amount,
            true,
            operatorNotificationData
        );

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            amount,
            operatorNotificationData
        );

        _notifyTokenOperator(operator, lsp1Data);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function revokeOperator(
        address operator,
        address tokenOwner,
        bool notify,
        bytes memory operatorNotificationData
    ) public virtual override {
        require(
            msg.sender == tokenOwner || msg.sender == operator,
            LSP7RevokeOperatorNotAuthorized(msg.sender, tokenOwner, operator)
        );

        _updateOperator(
            tokenOwner,
            operator,
            0,
            notify,
            operatorNotificationData
        );

        if (notify) {
            bytes memory lsp1Data = abi.encode(
                tokenOwner,
                0,
                operatorNotificationData
            );

            _notifyTokenOperator(operator, lsp1Data);
        }
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function authorizedAmountFor(
        address operator,
        address tokenOwner
    ) public view virtual override returns (uint256) {
        if (tokenOwner == operator) {
            return _tokenOwnerBalances[tokenOwner];
        } else {
            return _operatorAuthorizedAmount[tokenOwner][operator];
        }
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function getOperatorsOf(
        address tokenOwner
    ) public view virtual override returns (address[] memory) {
        return _operators[tokenOwner].values();
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function increaseAllowance(
        address operator,
        uint256 addedAmount,
        bytes memory operatorNotificationData
    ) public virtual override {
        uint256 oldAllowance = authorizedAmountFor(operator, msg.sender);
        require(
            oldAllowance > 0,
            OperatorAllowanceCannotBeIncreasedFromZero(operator)
        );

        uint256 newAllowance = oldAllowance + addedAmount;

        _updateOperator(
            msg.sender,
            operator,
            newAllowance,
            true,
            operatorNotificationData
        );

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            newAllowance,
            operatorNotificationData
        );

        _notifyTokenOperator(operator, lsp1Data);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function decreaseAllowance(
        address operator,
        address tokenOwner,
        uint256 subtractedAmount,
        bytes memory operatorNotificationData
    ) public virtual override {
        require(
            msg.sender == tokenOwner || msg.sender == operator,
            LSP7DecreaseAllowanceNotAuthorized(msg.sender, tokenOwner, operator)
        );

        uint256 currentAllowance = authorizedAmountFor(operator, tokenOwner);
        if (currentAllowance < subtractedAmount) {
            revert LSP7DecreasedAllowanceBelowZero();
        }

        uint256 newAllowance;
        unchecked {
            newAllowance = currentAllowance - subtractedAmount;
            _updateOperator(
                tokenOwner,
                operator,
                newAllowance,
                true,
                operatorNotificationData
            );
        }

        bytes memory lsp1Data = abi.encode(
            tokenOwner,
            newAllowance,
            operatorNotificationData
        );

        _notifyTokenOperator(operator, lsp1Data);
    }

    // --- Transfer functionality

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override {
        if (msg.sender != from) {
            _spendAllowance({
                operator: msg.sender,
                tokenOwner: from,
                amountToSpend: amount
            });
        }

        _transfer(from, to, amount, force, data);
    }

    /**
     * @inheritdoc ILSP7DigitalAsset
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        uint256[] memory amount,
        bool[] memory force,
        bytes[] memory data
    ) public virtual override {
        uint256 fromLength = from.length;
        require(
            fromLength == to.length &&
                fromLength == amount.length &&
                fromLength == force.length &&
                fromLength == data.length,
            LSP7InvalidTransferBatch()
        );

        for (uint256 i; i < fromLength; ) {
            // using the public transfer function to handle updates to operator authorized amounts
            transfer(from[i], to[i], amount[i], force[i], data[i]);

            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Changes token `amount` the `operator` has access to from `tokenOwner` tokens.
     * If the amount is zero the operator is removed from the list of operators, otherwise he is added to the list of operators.
     * If the amount is zero then the operator is being revoked, otherwise the operator amount is being modified.
     *
     * @param tokenOwner The address that will give `operator` an allowance for on its balance.
     * @param operator The address to grant an allowance to spend.
     * @param allowance The maximum amount of token that `operator` can spend from the `tokenOwner`'s balance.
     * @param notified Boolean indicating whether the operator has been notified about the change of allowance
     * @param operatorNotificationData The data to send to the universalReceiver function of the operator in case of notifying
     *
     * @custom:events
     * - {OperatorRevoked} event when operator's allowance is set to `0`.
     * - {OperatorAuthorizationChanged} event when operator's allowance is set to any other amount.
     *
     * @custom:requirements
     * - `operator` cannot be the zero address.
     * - `operator` cannot be the same address as `tokenOwner`.
     */
    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 allowance,
        bool notified,
        bytes memory operatorNotificationData
    ) internal virtual {
        require(operator != address(0), LSP7CannotUseAddressZeroAsOperator());
        require(operator != tokenOwner, LSP7TokenOwnerCannotBeOperator());

        _operatorAuthorizedAmount[tokenOwner][operator] = allowance;

        if (allowance != 0) {
            _operators[tokenOwner].add(operator);
            emit OperatorAuthorizationChanged(
                operator,
                tokenOwner,
                allowance,
                operatorNotificationData
            );
        } else {
            _operators[tokenOwner].remove(operator);
            emit OperatorRevoked(
                operator,
                tokenOwner,
                notified,
                operatorNotificationData
            );
        }
    }

    /**
     * @dev Mints `amount` of tokens and transfers it to `to`.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances.
     * - {_afterTokenTransfer} function will run after updating the balances, **but before notifying the recipient via LSP1**.
     *
     * @param to The address to mint tokens for.
     * @param amount The amount of tokens to mint.
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param data Additional data the caller wants included in the emitted {Transfer} event, and sent in the LSP1 hook to the `to` address.
     *
     * @custom:requirements
     * - `to` cannot be the zero address.
     *
     * @custom:events {Transfer} event with `address(0)` as `from`.
     */
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual {
        require(to != address(0), LSP7CannotSendWithAddressZero());

        _beforeTokenTransfer(address(0), to, amount, force, data);

        _update(address(0), to, amount, force, data);

        _afterTokenTransfer(address(0), to, amount, force, data);

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            address(0),
            to,
            amount,
            data
        );
        _notifyTokenReceiver(to, force, lsp1Data);
    }

    /**
     * @dev Burns (= destroys) `amount` of tokens, decrease the `from` balance. This is done by sending them to the zero address.
     *
     * Both the sender and recipient will be notified of the token transfer through the LSP1 {universalReceiver}
     * function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
     * all the parameters in the calldata packed encoded.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances.
     * - {_afterTokenTransfer} function will run after updating the balances, **but before notifying the sender via LSP1**.
     *
     * @param from The address to burn tokens from its balance.
     * @param amount The amount of tokens to burn.
     * @param data Additional data the caller wants included in the emitted event, and sent in the LSP1 hook to the `from` and `to` address.
     *
     * @custom:hint In dApps, you can know which address is burning tokens by listening for the `Transfer` event and filter with the zero address as `to`.
     *
     * @custom:requirements
     * - `from` cannot be the zero address.
     * - `from` must have at least `amount` tokens.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * @custom:events {Transfer} event with `address(0)` as the `to` address
     */
    function _burn(
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(from != address(0), LSP7CannotSendWithAddressZero());

        _beforeTokenTransfer(from, address(0), amount, false, data);

        _update(from, address(0), amount, false, data);

        _afterTokenTransfer(from, address(0), amount, false, data);

        bytes memory lsp1Data = abi.encode(
            msg.sender,
            from,
            address(0),
            amount,
            data
        );
        _notifyTokenSender(from, lsp1Data);
    }

    /**
     * @dev Spend `amountToSpend` from the `operator`'s authorized on behalf of the `tokenOwner`.
     *
     * @param operator The address of the operator to decrease the allowance of.
     * @param tokenOwner The address that granted an allowance on its balance to `operator`.
     * @param amountToSpend The amount of tokens to subtract in allowance of `operator`.
     *
     * @custom:events
     * - {OperatorRevoked} event when operator's allowance is set to `0`.
     * - {OperatorAuthorizationChanged} event when operator's allowance is set to any other amount.
     *
     * @custom:requirements
     * - The `amountToSpend` MUST be at least the allowance granted to `operator` (accessible via {`authorizedAmountFor}`)
     * - `operator` cannot be the zero address.
     * - `operator` cannot be the same address as `tokenOwner`.
     */
    function _spendAllowance(
        address operator,
        address tokenOwner,
        uint256 amountToSpend
    ) internal virtual {
        uint256 authorizedAmount = _operatorAuthorizedAmount[tokenOwner][
            operator
        ];

        if (authorizedAmount == 0 || amountToSpend > authorizedAmount) {
            revert LSP7AmountExceedsAuthorizedAmount(
                tokenOwner,
                authorizedAmount,
                operator,
                amountToSpend
            );
        }

        _updateOperator({
            tokenOwner: tokenOwner,
            operator: operator,
            allowance: authorizedAmount - amountToSpend,
            notified: false,
            operatorNotificationData: ""
        });
    }

    /**
     * @dev Transfer tokens from `from` to `to` by decreasing the balance of `from` by `-amount` and increasing the balance
     * of `to` by `+amount`.
     *
     * Both the sender and recipient will be notified of the token transfer through the LSP1 {universalReceiver}
     * function, if they are contracts that support the LSP1 interface. Their `universalReceiver` function will receive
     * all the parameters in the calldata packed encoded.
     *
     * @custom:info Any logic in the:
     * - {_beforeTokenTransfer} function will run before updating the balances.
     * - {_afterTokenTransfer} function will run after updating the balances, **but before notifying the sender/recipient via LSP1**.
     *
     * @param from The address to decrease the balance.
     * @param to The address to increase the balance.
     * @param amount The amount of tokens to transfer from `from` to `to`.
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param data Additional data the caller wants included in the emitted event, and sent in the LSP1 hook to the `from` and `to` address.
     *
     * @custom:requirements
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` must have at least `amount` of tokens.
     *
     * @custom:events {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual {
        require(
            from != address(0) && to != address(0),
            LSP7CannotSendWithAddressZero()
        );

        _beforeTokenTransfer(from, to, amount, force, data);

        _update(from, to, amount, force, data);

        _afterTokenTransfer(from, to, amount, force, data);

        bytes memory lsp1Data = abi.encode(msg.sender, from, to, amount, data);

        _notifyTokenSender(from, lsp1Data);
        _notifyTokenReceiver(to, force, lsp1Data);
    }

    /**
     * @dev Transfers `amount` of tokens from `from` to `to`.
     * Alternatively mints or burns `amount` of tokens if `from` or `to` is the zero address.
     *
     * @custom:info All customizations to transfers, mints, and burns should be done by overriding this function.
     *
     * @custom:events {Transfer} event.
     */
    function _update(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual {
        if (from == address(0)) {
            // Overflow check required: The rest of the code assumes that totalSupply never overflows
            _existingTokens += amount;
        } else {
            uint256 fromBalance = _tokenOwnerBalances[from];

            require(
                fromBalance >= amount,
                LSP7AmountExceedsBalance(fromBalance, from, amount)
            );

            unchecked {
                // Overflow not possible: amount <= fromBalance <= totalSupply.
                _tokenOwnerBalances[from] = fromBalance - amount;
            }
        }

        if (to == address(0)) {
            unchecked {
                // Overflow not possible: amount <= totalSupply or amount <= fromBalance <= totalSupply.
                _existingTokens -= amount;
            }
        } else {
            unchecked {
                // Overflow not possible: balance + amount is at most totalSupply, which we know fits into a uint256.
                _tokenOwnerBalances[to] += amount;
            }
        }

        emit Transfer({
            operator: msg.sender,
            from: from,
            to: to,
            amount: amount,
            force: force,
            data: data
        });
    }

    /**
     * @dev Hook that is called before any token transfer, including minting and burning.
     * Allows to run custom logic before updating balances and notifying sender/recipient by overriding this function.
     *
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount of token to transfer
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param data The data sent alongside the transfer
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data // solhint-disable-next-line no-empty-blocks
    ) internal virtual {}

    /**
     * @dev Hook that is called after any token transfer, including minting and burning.
     * Allows to run custom logic after updating balances, but **before notifying sender/recipient** by overriding this function.
     *
     * @param from The sender address
     * @param to The recipient address
     * @param amount The amount of token to transfer
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param data The data sent alongside the transfer
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data // solhint-disable-next-line no-empty-blocks
    ) internal virtual {}

    /**
     * @dev Attempt to notify the operator `operator` about the `amount` tokens being authorized with.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_TOKENOPERATOR` as typeId, if `operator` is a contract that supports the LSP1 interface.
     * If `operator` is an EOA or a contract that does not support the LSP1 interface, nothing will happen and no notification will be sent.
     *
     * @param operator The address to call the {universalReceiver} function on.
     * @param lsp1Data the data to be sent to the `operator` address in the `universalReceiver` call.
     */
    function _notifyTokenOperator(
        address operator,
        bytes memory lsp1Data
    ) internal virtual {
        LSP1Utils.notifyUniversalReceiver(
            operator,
            _TYPEID_LSP7_TOKENOPERATOR,
            lsp1Data
        );
    }

    /**
     * @dev Attempt to notify the token sender `from` about the `amount` of tokens being transferred.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_TOKENSSENDER` as typeId, if `from` is a contract that supports the LSP1 interface.
     * If `from` is an EOA or a contract that does not support the LSP1 interface, nothing will happen and no notification will be sent.
     *
     * @param from The address to call the {universalReceiver} function on.
     * @param lsp1Data the data to be sent to the `from` address in the `universalReceiver` call.
     */
    function _notifyTokenSender(
        address from,
        bytes memory lsp1Data
    ) internal virtual {
        LSP1Utils.notifyUniversalReceiver(
            from,
            _TYPEID_LSP7_TOKENSSENDER,
            lsp1Data
        );
    }

    /**
     * @dev Attempt to notify the token receiver `to` about the `amount` tokens being received.
     * This is done by calling its {universalReceiver} function with the `_TYPEID_LSP7_TOKENSRECIPIENT` as typeId, if `to` is a contract that supports the LSP1 interface.
     *
     * If `to` is is an EOA or a contract that does not support the LSP1 interface, the behaviour will depend on the `force` boolean flag.
     * - if `force` is set to `true`, nothing will happen and no notification will be sent.
     * - if `force` is set to `false, the transaction will revert.
     *
     * @param to The address to call the {universalReceiver} function on.
     * @param force A boolean that describe if transfer to a `to` address that does not support LSP1 is allowed or not.
     * @param lsp1Data The data to be sent to the `to` address in the `universalReceiver(...)` call.
     */
    function _notifyTokenReceiver(
        address to,
        bool force,
        bytes memory lsp1Data
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165InterfaceUnchecked(
                to,
                _INTERFACEID_LSP1
            )
        ) {
            ILSP1UniversalReceiver(to).universalReceiver(
                _TYPEID_LSP7_TOKENSRECIPIENT,
                lsp1Data
            );
        } else if (!force) {
            if (to.code.length != 0) {
                revert LSP7NotifyTokenReceiverContractMissingLSP1Interface(to);
            } else {
                revert LSP7NotifyTokenReceiverIsEOA(to);
            }
        }
    }
}

// packages/lsp7-contracts/contracts/extensions/LSP7Burnable/LSP7BurnableInitAbstract.sol

// modules

/**
 * @title LSP7 token extension that allows token holders to destroy both
 * their own tokens and those that they have an allowance for as an operator.
 */
abstract contract LSP7BurnableInitAbstract is LSP7DigitalAssetInitAbstract {
    /**
     * @dev See internal {_burn} function for details.
     */
    function burn(
        address from,
        uint256 amount,
        bytes memory data
    ) public virtual {
        if (msg.sender != from) {
            _spendAllowance(msg.sender, from, amount);
        }
        _burn(from, amount, data);
    }
}

// packages/lsp7-contracts/contracts/extensions/LSP7Mintable/LSP7MintableInitAbstract.sol

// modules

// interfaces

// errors

/// @title LSP7MintableInitAbstract
/// @dev Abstract contract implementing a mintable LSP7 token extension, allowing any address granted the `MINTER_ROLE` to mint new tokens until minting is disabled.
/// Inherits from LSP7DigitalAsset to provide core token functionality.
abstract contract LSP7MintableInitAbstract is
    ILSP7Mintable,
    LSP7DigitalAssetInitAbstract,
    AccessControlExtendedInitAbstract
{
    /// @notice Indicates whether minting is currently enabled or not.
    bool public isMintable;

    /// @dev keccak256("MINTER_ROLE")
    bytes32 public constant MINTER_ROLE =
        0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6;

    /// @notice Initializes the LSP7Mintable contract with base token params and minting status.
    /// @dev Initializes the LSP7DigitalAsset base and sets the minting status.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the contract.
    /// @param lsp4TokenType_ The token type (see LSP4).
    /// @param isNonDivisible_ Whether the token is non-divisible.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    /// @custom:info If `mintable_` is set to `true` then it can be disabled using `disableMinting()` function later on.
    function __LSP7Mintable_init(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        bool mintable_
    ) internal virtual onlyInitializing {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init();
        __LSP7Mintable_init_unchained(mintable_);
    }

    /// @notice Unchained initializer for the minting status.
    /// @dev Sets the initial minting status.
    /// @param mintable_ True to enable minting after deployment, false to disable it forever.
    function __LSP7Mintable_init_unchained(
        bool mintable_
    ) internal virtual onlyInitializing {
        isMintable = mintable_;
        emit MintingStatusChanged({enabled: mintable_});

        if (mintable_) {
            _grantRole(MINTER_ROLE, owner());
        }
    }

    /// @inheritdoc ILSP7Mintable
    /// @custom:warning Once this function is called, any address holding the `MINTER_ROLE` will be inoperable.
    /// @custom:info The list of addresses holding the `MINTER_ROLE` remains populated after the minting feature is switched off.
    function disableMinting() public virtual override onlyOwner {
        require(isMintable, LSP7MintDisabled());
        isMintable = false;
        emit MintingStatusChanged({enabled: false});
    }

    /// @inheritdoc ILSP7Mintable
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override onlyRole(MINTER_ROLE) {
        _mint(to, amount, force, data);
    }

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(
            AccessControlExtendedInitAbstract,
            LSP7DigitalAssetInitAbstract
        )
        returns (bool)
    {
        return
            AccessControlExtendedInitAbstract.supportsInterface(interfaceId) ||
            LSP7DigitalAssetInitAbstract.supportsInterface(interfaceId);
    }

    /// @notice Internal function to mint tokens, overridden to enforce minting status.
    /// @dev Checks if minting is enabled, reverting with LSP7MintDisabled if not. Calls the parent _mint function from LSP7DigitalAsset.
    /// @param to The address to receive the minted tokens.
    /// @param amount The number of tokens to mint.
    /// @param force When true, allows minting to any address; when false, requires `to` to support LSP1 UniversalReceiver.
    /// @param data Additional data included in the Transfer event and sent to `to`’s UniversalReceiver hook, if applicable.
    ///
    /// @custom:warning This internal function does not check for `MINTER_ROLE` access control.
    /// Derived contracts that expose this function publicly and want to gate it by `MINTER_ROLE` must enforce it with `onlyRole(MINTER_ROLE)`.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        require(isMintable, LSP7MintDisabled());
        super._mint(to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    )
        internal
        virtual
        override(AccessControlExtendedInitAbstract, OwnableUpgradeable)
    {
        // restore default admin hierarchy so a previously-installed custom admin
        // cannot grant MINTER_ROLE to new accounts post-transfer
        _setRoleAdmin(MINTER_ROLE, DEFAULT_ADMIN_ROLE);
        super._transferOwnership(newOwner);
    }

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     *
     * @custom:info The size of the `__gap` array is calculated so that the amount of storage used by the contract
     * always adds up to the same number (in this case 50 storage slots).
     */
    uint256[49] private __gap;
}

// packages/lsp7-contracts/contracts/presets/LSP7MintableInit.sol

// modules

/// @dev LSP7DigitalAsset deployable preset contract (proxy version) with:
/// - a public {mint} function callable by addresses holding `MINTER_ROLE`.
/// - a public {burn} function callable by any token holder or operator.
contract LSP7MintableInit is
    LSP7MintableInitAbstract,
    LSP7BurnableInitAbstract
{
    /// @dev initialize (= lock) base implementation contract on deployment
    constructor() {
        _disableInitializers();
    }

    /// @notice Initializing a `LSP7MintableInit` token contract.
    /// @dev Set the token to be mintable to allow minting more tokens after deployment.
    /// @param name_ The name of the token.
    /// @param symbol_ The symbol of the token.
    /// @param newOwner_ The owner of the token contract.
    /// @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
    /// @param isNonDivisible_ Specify if the LSP7 token is divisible (decimals = 18) or non-divisible (decimals = 0)
    function initialize(
        string calldata name_,
        string calldata symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    ) external virtual initializer {
        LSP7DigitalAssetInitAbstract._initialize(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        );
        __AccessControlExtended_init();
        __LSP7Mintable_init_unchained(true);
    }

    /// @dev Required override to resolve multiple inheritance. Delegates via `super` to the parent implementation
    /// that aggregates the interface IDs supported across all inherited modules.
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(LSP7MintableInitAbstract, LSP7DigitalAssetInitAbstract)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /// @inheritdoc LSP7MintableInitAbstract
    /// @dev Required override to resolve multiple inheritance. Calls every parent {_mint} function via `super`.
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    )
        internal
        virtual
        override(LSP7MintableInitAbstract, LSP7DigitalAssetInitAbstract)
    {
        super._mint(to, amount, force, data);
    }

    /// @dev Required override to resolve multiple inheritance. Calls every parent {_transferOwnership} function
    /// via `super` so that each inherited module updates its ownership-dependent state.
    /// When contract ownership changes, this resets the admin role of `MINTER_ROLE` back to `DEFAULT_ADMIN_ROLE`.
    function _transferOwnership(
        address newOwner
    ) internal virtual override(LSP7MintableInitAbstract, OwnableUpgradeable) {
        super._transferOwnership(newOwner);
    }
}

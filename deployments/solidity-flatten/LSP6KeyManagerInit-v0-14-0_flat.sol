// SPDX-License-Identifier: Apache-2.0
pragma solidity <0.9.0 >=0.8.0 ^0.8.0 ^0.8.1 ^0.8.2 ^0.8.4 ^0.8.5;

// node_modules/@openzeppelin/contracts/utils/Address.sol

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
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
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
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, "Address: low-level call failed");
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
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
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
        require(address(this).balance >= value, "Address: insufficient balance for call");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
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
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
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
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
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

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
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
        require(address(this).balance >= amount, "Address: insufficient balance");

        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Address: unable to send value, recipient may have reverted");
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
    function functionCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionCallWithValue(target, data, 0, "Address: low-level call failed");
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
    function functionCallWithValue(address target, bytes memory data, uint256 value) internal returns (bytes memory) {
        return functionCallWithValue(target, data, value, "Address: low-level call with value failed");
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
        require(address(this).balance >= value, "Address: insufficient balance for call");
        (bool success, bytes memory returndata) = target.call{value: value}(data);
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a static call.
     *
     * _Available since v3.3._
     */
    function functionStaticCall(address target, bytes memory data) internal view returns (bytes memory) {
        return functionStaticCall(target, data, "Address: low-level static call failed");
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
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
    }

    /**
     * @dev Same as {xref-Address-functionCall-address-bytes-}[`functionCall`],
     * but performing a delegate call.
     *
     * _Available since v3.4._
     */
    function functionDelegateCall(address target, bytes memory data) internal returns (bytes memory) {
        return functionDelegateCall(target, data, "Address: low-level delegate call failed");
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
        return verifyCallResultFromTarget(target, success, returndata, errorMessage);
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

    function _revert(bytes memory returndata, string memory errorMessage) private pure {
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

// node_modules/solidity-bytes-utils/contracts/BytesLib.sol

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
    )
        internal
        pure
        returns (bytes memory)
    {
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
            mstore(0x40, and(
              add(add(end, iszero(add(length, mload(_preBytes)))), 31),
              not(31) // Round down to the nearest 32 bytes.
            ))
        }

        return tempBytes;
    }

    function concatStorage(bytes storage _preBytes, bytes memory _postBytes) internal {
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
            let slength := div(and(fslot, sub(mul(0x100, iszero(and(fslot, 1))), 1)), 2)
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
    )
        internal
        pure
        returns (bytes memory)
    {
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
                let mc := add(add(tempBytes, lengthmod), mul(0x20, iszero(lengthmod)))
                let end := add(mc, _length)

                for {
                    // The multiplication in the next line has the same exact purpose
                    // as the one above.
                    let cc := add(add(add(_bytes, lengthmod), mul(0x20, iszero(lengthmod))), _start)
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

    function toAddress(bytes memory _bytes, uint256 _start) internal pure returns (address) {
        require(_bytes.length >= _start + 20, "toAddress_outOfBounds");
        address tempAddress;

        assembly {
            tempAddress := div(mload(add(add(_bytes, 0x20), _start)), 0x1000000000000000000000000)
        }

        return tempAddress;
    }

    function toUint8(bytes memory _bytes, uint256 _start) internal pure returns (uint8) {
        require(_bytes.length >= _start + 1 , "toUint8_outOfBounds");
        uint8 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x1), _start))
        }

        return tempUint;
    }

    function toUint16(bytes memory _bytes, uint256 _start) internal pure returns (uint16) {
        require(_bytes.length >= _start + 2, "toUint16_outOfBounds");
        uint16 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x2), _start))
        }

        return tempUint;
    }

    function toUint32(bytes memory _bytes, uint256 _start) internal pure returns (uint32) {
        require(_bytes.length >= _start + 4, "toUint32_outOfBounds");
        uint32 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x4), _start))
        }

        return tempUint;
    }

    function toUint64(bytes memory _bytes, uint256 _start) internal pure returns (uint64) {
        require(_bytes.length >= _start + 8, "toUint64_outOfBounds");
        uint64 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x8), _start))
        }

        return tempUint;
    }

    function toUint96(bytes memory _bytes, uint256 _start) internal pure returns (uint96) {
        require(_bytes.length >= _start + 12, "toUint96_outOfBounds");
        uint96 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0xc), _start))
        }

        return tempUint;
    }

    function toUint128(bytes memory _bytes, uint256 _start) internal pure returns (uint128) {
        require(_bytes.length >= _start + 16, "toUint128_outOfBounds");
        uint128 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x10), _start))
        }

        return tempUint;
    }

    function toUint256(bytes memory _bytes, uint256 _start) internal pure returns (uint256) {
        require(_bytes.length >= _start + 32, "toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }

    function toBytes32(bytes memory _bytes, uint256 _start) internal pure returns (bytes32) {
        require(_bytes.length >= _start + 32, "toBytes32_outOfBounds");
        bytes32 tempBytes32;

        assembly {
            tempBytes32 := mload(add(add(_bytes, 0x20), _start))
        }

        return tempBytes32;
    }

    function equal(bytes memory _preBytes, bytes memory _postBytes) internal pure returns (bool) {
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
    )
        internal
        view
        returns (bool)
    {
        bool success = true;

        assembly {
            // we know _preBytes_offset is 0
            let fslot := sload(_preBytes.slot)
            // Decode the length of the stored array like in concatStorage().
            let slength := div(and(fslot, sub(mul(0x100, iszero(and(fslot, 1))), 1)), 2)
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

// node_modules/@openzeppelin/contracts/interfaces/IERC1271.sol

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
    function isValidSignature(bytes32 hash, bytes memory signature) external view returns (bytes4 magicValue);
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

// node_modules/@lukso/lsp14-contracts/contracts/ILSP14Ownable2Step.sol

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
     * - The current {owner()} will lose access to the functions restricted to the {owner()} only.
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

// node_modules/@lukso/lsp20-contracts/contracts/ILSP20CallVerifier.sol

/**
 * @title Interface for the LSP20 Call Verification standard, a set of functions intended to perform verifications on behalf of another contract.
 *
 * @dev Interface to be inherited for contract supporting LSP20-CallVerification
 */
interface ILSP20CallVerifier {
    /**
     * @return returnedStatus MUST return the first 3 bytes of `lsp20VerifyCall(address,uint256,bytes)` function selector if the call to
     * the function is allowed, concatenated with a byte that determines if the lsp20VerifyCallResult function should
     * be called after the original function call. The byte that invoke the lsp20VerifyCallResult function is strictly `0x01`.
     *
     * @param requestor The address that requested to make the call to `target`.
     * @param target The address of the contract that implements the `LSP20CallVerification` interface.
     * @param caller The address who called the function on the `target` contract.
     * @param value The value sent by the caller to the function called on the msg.sender
     * @param callData The calldata sent by the caller to the msg.sender
     */
    function lsp20VerifyCall(
        address requestor,
        address target,
        address caller,
        uint256 value,
        bytes memory callData
    ) external returns (bytes4 returnedStatus);

    /**
     * @return MUST return the lsp20VerifyCallResult function selector if the call to the function is allowed
     *
     * @param callHash The keccak256 hash of the parameters of {lsp20VerifyCall} concatenated
     * @param callResult The value result of the function called on the msg.sender
     */
    function lsp20VerifyCallResult(
        bytes32 callHash,
        bytes memory callResult
    ) external returns (bytes4);
}

// node_modules/@lukso/lsp25-contracts/contracts/ILSP25ExecuteRelayCall.sol

interface ILSP25ExecuteRelayCall {
    /**
     * @notice Reading the latest nonce of address `from` in the channel ID `channelId`.
     *
     * @dev Get the nonce for a specific `from` address that can be used for signing relay transactions via {executeRelayCall}.
     *
     * @param from The address of the signer of the transaction.
     * @param channelId The channel id that the signer wants to use for executing the transaction.
     *
     * @return The current nonce on a specific `channelId`.
     */
    function getNonce(
        address from,
        uint128 channelId
    ) external view returns (uint256);

    /**
     * @notice Executing the following payload given the nonce `nonce` and signature `signature`. Payload: `payload`
     *
     * @dev Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer.
     * The signature MUST be generated according to the signature format defined by the LSP25 standard.
     *
     * @param signature A 65 bytes long signature for a meta transaction according to LSP25.
     * @param nonce The nonce of the address that signed the calldata (in a specific `_channel`), obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps Two `uint128` timestamps concatenated together that describes
     * when the relay transaction is valid "from" (left `uint128`) and "until" as a deadline (right `uint128`).
     * @param payload The abi-encoded function call to execute.
     *
     * @return The data being returned by the function executed.
     *
     * @custom:requirements
     * - `nonce` MUST be a valid nonce nonce provided (see {getNonce} function).
     * - The transaction MUST be submitted within a valid time period defined by the `validityTimestamp`.
     *
     * @custom:hint You can use `validityTimestamps == 0` to define an `executeRelayCall` transaction that is indefinitely valid,
     * meaning that does not require to start from a specific date/time, or that has an expiration date/time.
     */
    function executeRelayCall(
        bytes calldata signature,
        uint256 nonce,
        uint256 validityTimestamps,
        bytes calldata payload
    ) external payable returns (bytes memory);

    /**
     * @notice Executing a batch of relay calls (= meta-transactions).
     *
     * @dev Same as {executeRelayCall} but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction.
     *
     * @param signatures An array of 65 bytes long signatures for meta transactions according to LSP25.
     * @param nonces An array of nonces of the addresses that signed the calldata payloads (in specific channels). Obtained via {getNonce}. Used to prevent replay attack.
     * @param validityTimestamps An array of two `uint128` concatenated timestamps that describe when the relay transaction is valid "from" (left `uint128`) and "until" (right `uint128`).
     * @param values An array of amount of native tokens to be transferred for each calldata `payload`.
     * @param payloads An array of abi-encoded function calls to be executed successively.
     *
     * @return An array of abi-decoded data returned by the functions executed.
     */
    function executeRelayCallBatch(
        bytes[] calldata signatures,
        uint256[] calldata nonces,
        uint256[] calldata validityTimestamps,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) external payable returns (bytes[] memory);
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

// node_modules/@lukso/lsp1-contracts/contracts/LSP1Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP1 = 0x6bb56a14;
bytes4 constant _INTERFACEID_LSP1_DELEGATE = 0xa245bbda;

// --- ERC725Y Data Keys

// bytes10(keccak256('LSP1UniversalReceiverDelegate'))
bytes10 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX = 0x0cfc51aec37c55a4d0b1;

// keccak256('LSP1UniversalReceiverDelegate')
bytes32 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY = 0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47;

// node_modules/@lukso/lsp20-contracts/contracts/LSP20Constants.sol

// bytes4(keccak256("LSP20CallVerification"))
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFICATION = 0x1a0eb6a5;

// `lsp20VerifyCall(address,address,address,uint256,bytes)` selector XOR `lsp20VerifyCallResult(bytes32,bytes)` selector
bytes4 constant _INTERFACEID_LSP20_CALL_VERIFIER = 0x0d6ecac7;

// bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"01"))
bytes4 constant _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION = 0xde928f01;

// bytes4(bytes.concat(bytes3(ILSP20.lsp20VerifyCall.selector), hex"00"))
bytes4 constant _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITHOUT_POST_VERIFICATION = 0xde928f00;

// bytes4(ILSP20.lsp20VerifyCallResult.selector)
bytes4 constant _LSP20_VERIFY_CALL_RESULT_SUCCESS_VALUE = 0xd3fc45d3;

// node_modules/@lukso/lsp25-contracts/contracts/LSP25Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP25 = 0x5ac79908;

// version number used to validate signed relayed call
uint256 constant LSP25_VERSION = 25;

// node_modules/@lukso/lsp25-contracts/contracts/LSP25Errors.sol

/**
 * @notice Relay call not valid yet.
 *
 * @dev Reverts when the relay call is cannot yet bet executed.
 * This mean that the starting timestamp provided to {executeRelayCall} function is bigger than the current timestamp.
 */
error RelayCallBeforeStartTime();

/**
 * @notice Relay call expired (deadline passed).
 *
 * @dev Reverts when the period to execute the relay call has expired.
 */
error RelayCallExpired();

// packages/lsp6-contracts/contracts/LSP6Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP6 = 0x23f34c62;

// --- ERC725Y Data Keys

// PERMISSIONS KEYS

// keccak256('AddressPermissions[]')
bytes32 constant _LSP6KEY_ADDRESSPERMISSIONS_ARRAY = 0xdf30dba06db6a30e65354d9a64c609861f089545ca58c6b4dbe31a5f338cb0e3;

// AddressPermissions[index]
bytes16 constant _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX = 0xdf30dba06db6a30e65354d9a64c60986;

// AddressPermissions:...
bytes6 constant _LSP6KEY_ADDRESSPERMISSIONS_PREFIX = 0x4b80742de2bf;

// bytes6(keccak256('AddressPermissions')) + bytes4(keccak256('Permissions'))
bytes10 constant _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX = 0x4b80742de2bf82acb363; // AddressPermissions:Permissions:<address> --> bytes32

// bytes6(keccak256('AddressPermissions')) + bytes4(keccak256('AllowedERC725YDataKeys'))
bytes10 constant _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX = 0x4b80742de2bf866c2911; // AddressPermissions:AllowedERC725YDataKeys:<address> --> bytes[CompactBytesArray]

// bytes6(keccak256('AddressPermissions')) + bytes4(keccak256('AllowedCalls'))
bytes10 constant _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX = 0x4b80742de2bf393a64c7; // AddressPermissions:AllowedCalls:<address>

// DEFAULT PERMISSIONS VALUES
// NB: the SUPER PERMISSIONS allow to not check for:
//  - AddressPermissions:AllowedERC725YDataKeys:...
//  - AddressPermissions:AllowedCalls
bytes32 constant _PERMISSION_CHANGEOWNER = 0x0000000000000000000000000000000000000000000000000000000000000001;
bytes32 constant _PERMISSION_ADDCONTROLLER = 0x0000000000000000000000000000000000000000000000000000000000000002;
bytes32 constant _PERMISSION_EDITPERMISSIONS = 0x0000000000000000000000000000000000000000000000000000000000000004;
bytes32 constant _PERMISSION_ADDEXTENSIONS = 0x0000000000000000000000000000000000000000000000000000000000000008;
bytes32 constant _PERMISSION_CHANGEEXTENSIONS = 0x0000000000000000000000000000000000000000000000000000000000000010;
bytes32 constant _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE = 0x0000000000000000000000000000000000000000000000000000000000000020;
bytes32 constant _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE = 0x0000000000000000000000000000000000000000000000000000000000000040;
bytes32 constant _PERMISSION_REENTRANCY = 0x0000000000000000000000000000000000000000000000000000000000000080;
bytes32 constant _PERMISSION_SUPER_TRANSFERVALUE = 0x0000000000000000000000000000000000000000000000000000000000000100;
bytes32 constant _PERMISSION_TRANSFERVALUE = 0x0000000000000000000000000000000000000000000000000000000000000200;
bytes32 constant _PERMISSION_SUPER_CALL = 0x0000000000000000000000000000000000000000000000000000000000000400;
bytes32 constant _PERMISSION_CALL = 0x0000000000000000000000000000000000000000000000000000000000000800;
bytes32 constant _PERMISSION_SUPER_STATICCALL = 0x0000000000000000000000000000000000000000000000000000000000001000;
bytes32 constant _PERMISSION_STATICCALL = 0x0000000000000000000000000000000000000000000000000000000000002000;
bytes32 constant _PERMISSION_SUPER_DELEGATECALL = 0x0000000000000000000000000000000000000000000000000000000000004000;
bytes32 constant _PERMISSION_DELEGATECALL = 0x0000000000000000000000000000000000000000000000000000000000008000;
bytes32 constant _PERMISSION_DEPLOY = 0x0000000000000000000000000000000000000000000000000000000000010000;
bytes32 constant _PERMISSION_SUPER_SETDATA = 0x0000000000000000000000000000000000000000000000000000000000020000;
bytes32 constant _PERMISSION_SETDATA = 0x0000000000000000000000000000000000000000000000000000000000040000;
bytes32 constant _PERMISSION_ENCRYPT = 0x0000000000000000000000000000000000000000000000000000000000080000;
bytes32 constant _PERMISSION_DECRYPT = 0x0000000000000000000000000000000000000000000000000000000000100000;
bytes32 constant _PERMISSION_SIGN = 0x0000000000000000000000000000000000000000000000000000000000200000;
bytes32 constant _PERMISSION_EXECUTE_RELAY_CALL = 0x0000000000000000000000000000000000000000000000000000000000400000;

// All Permissions currently exclude REENTRANCY, DELEGATECALL and SUPER_DELEGATECALL for security
bytes32 constant ALL_REGULAR_PERMISSIONS = 0x00000000000000000000000000000000000000000000000000000000007f3f7f;

// AllowedCalls types
bytes4 constant _ALLOWEDCALLS_TRANSFERVALUE = 0x00000001; // 0000 0001
bytes4 constant _ALLOWEDCALLS_CALL = 0x00000002; // 0000 0010
bytes4 constant _ALLOWEDCALLS_STATICCALL = 0x00000004; // 0000 0100
bytes4 constant _ALLOWEDCALLS_DELEGATECALL = 0x00000008; // 0000 1000

// packages/lsp6-contracts/contracts/LSP6Errors.sol

/**
 * @notice The address `from` does not have any permission set on the contract linked to the Key Manager.
 * @dev Reverts when address `from` does not have any permissions set on the account linked to this Key Manager
 *
 * @param from the address that does not have permissions
 */
error NoPermissionsSet(address from);

/**
 * @notice The address `from` is not authorised to `permission` on the contract linked to the Key Manager.
 * @dev Reverts when address `from` is not authorised and does not have `permission` on the linked {target}
 *
 * @param from address The address that was not authorised.
 * @param permission permission The permission required (_e.g: `SETDATA`, `CALL`, `TRANSFERVALUE`)
 */
error NotAuthorised(address from, string permission);

/**
 * @notice The address `from` is not authorised to call the function `selector` on the `to` address.
 * @dev Reverts when `from` is not authorised to call the `execute(uint256,address,uint256,bytes)` function because of
 * a not allowed callType, address, standard or function.
 *
 * @param from The controller that tried to call the `execute(uint256,address,uint256,bytes)` function.
 * @param to The address of an EOA or contract that `from` tried to call using the linked {target}
 * @param selector If `to` is a contract, the bytes4 selector of the function that `from` is trying to call.
 * If no function is called (_e.g: a native token transfer_), selector = `0x00000000`
 */
error NotAllowedCall(address from, address to, bytes4 selector);

/**
 * @notice The address `from` is not authorised to set the data key `disallowedKey` on the contract linked to the Key Manager.
 * @dev Reverts when address `from` is not authorised to set the key `disallowedKey` on the linked {target}.
 *
 * @param from address The controller that tried to `setData` on the linked {target}.
 * @param disallowedKey A bytes32 data key that `from` is not authorised to set on the ERC725Y storage of the linked {target}.
 */
error NotAllowedERC725YDataKey(address from, bytes32 disallowedKey);

/**
 * @notice The data key `dataKey` starts with `AddressPermissions` prefix but is none of the permission data keys defined in LSP6.
 * @dev Reverts when `dataKey` is a `bytes32` value that does not adhere to any of the permission data keys defined by the LSP6 standard
 *
 * @param dataKey The dataKey that does not match any of the standard LSP6 permission data keys.
 */
error NotRecognisedPermissionKey(bytes32 dataKey);

/**
 * @notice Invalid address supplied to link this Key Manager to (`address(0)`).
 * @dev Reverts when the address provided to set as the {target} linked to this KeyManager is invalid (_e.g. `address(0)`_).
 */
error InvalidLSP6Target();

/**
 * @notice The relay call failed because an invalid nonce was provided for the address `signer` that signed the execute relay call.
 * Invalid nonce: `invalidNonce`, signature of signer: `signature`.
 *
 * @dev Reverts when the `signer` address retrieved from the `signature` has an invalid nonce: `invalidNonce`.
 *
 * @param signer The address of the signer.
 * @param invalidNonce The nonce retrieved for the `signer` address.
 * @param signature The signature used to retrieve the `signer` address.
 */
error InvalidRelayNonce(address signer, uint256 invalidNonce, bytes signature);

/**
 * @notice The Key Manager could not verify the calldata of the transaction because it could not recognise
 * the function being called. Invalid function selector: `invalidFunction`.
 *
 * @dev Reverts when trying to call a function on the linked {target}, that is not any of the following:
 * - `setData(bytes32,bytes)` (ERC725Y)
 * - `setDataBatch(bytes32[],bytes[])` (ERC725Y)
 * - `execute(uint256,address,uint256,bytes)` (ERC725X)
 * - `transferOwnership(address)` (LSP14)
 * - `acceptOwnership()` (LSP14)
 * - `renounceOwnership()` (LSP14)
 *
 * @param invalidFunction The `bytes4` selector of the function that was attempted
 * to be called on the linked {target} but not recognised.
 */
error InvalidERC725Function(bytes4 invalidFunction);

/**
 * @notice Could not decode the Allowed Calls. Value = `allowedCallsValue`.
 *
 * @dev Reverts when `allowedCallsValue` is not properly encoded as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`
 * (CompactBytesArray made of tuples that are 32 bytes long each). See LSP2 value type `CompactBytesArray` for more infos.
 *
 * @param allowedCallsValue The list of allowedCalls that are not encoded correctly as a `(bytes4,address,bytes4,bytes4)[CompactBytesArray]`.
 */
error InvalidEncodedAllowedCalls(bytes allowedCallsValue);

/**
 * @notice The address `from` is not authorised to set data, because it has no ERC725Y Data Key allowed.
 *
 * @dev Reverts when the `from` address has no AllowedERC725YDataKeys set and cannot set
 * any ERC725Y data key on the ERC725Y storage of the linked {target}.
 *
 * @param from The address that has no `AllowedERC725YDataKeys` set.
 */
error NoERC725YDataKeysAllowed(address from);

/**
 * @notice The address `from` is not authorised to use the linked account contract to make external calls, because it has no Allowed Calls set.
 *
 * @dev Reverts when the `from` address has no `AllowedCalls` set and cannot interact with any address using the linked {target}.
 *
 * @param from The address that has no AllowedCalls.
 */
error NoCallsAllowed(address from);

/**
 * @notice Error when reading the Allowed ERC725Y Data Keys. Reason: `context`, Allowed ERC725Y Data Keys value read: `value`.
 *
 * @dev Reverts when `value` is not encoded properly as a `bytes32[CompactBytesArray]`. The `context` string provides context
 * on when this error occurred (_e.g: when fetching the `AllowedERC725YDataKeys` to verify the permissions of a controller,
 * or when validating the `AllowedERC725YDataKeys` when setting them for a controller).
 *
 * @param value The value that is not a valid `bytes32[CompactBytesArray]`
 * @param context A brief description of where the error occurred.
 */
error InvalidEncodedAllowedERC725YDataKeys(bytes value, string context);

/**
 * @notice Invalid allowed calls (`0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff`) set for address `from`.
 * Could not perform external call.
 *
 * @dev Reverts when a `from` address has _"any whitelisted call"_ as allowed call set.
 * This revert happens during the verification of the permissions of the address for its allowed calls.
 *
 * A `from` address is not allowed to have 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffff
 * in its list of `AddressPermissions:AllowedCalls:<address>`, as this allows any STANDARD:ADDRESS:FUNCTION.
 * This is equivalent to granting the SUPER permission and should never be valid.
 *
 * @param from The controller address that has _"any allowed calls"_ whitelisted set.
 */
error InvalidWhitelistedCall(address from);

/**
 * @notice The array parameters provided to the function `executeRelayCallBatch(...)` do not have the same number of elements.
 * (Different array param's length).
 *
 * @dev Reverts when providing array parameters of different sizes to `executeRelayCallBatch(bytes[],uint256[],bytes[])`
 */
error BatchExecuteRelayCallParamsLengthMismatch();

/**
 * @notice The array parameters provided to the function `executeBatch(...)` do not have the same number of elements.
 * (Different array param's length).
 *
 * @dev Reverts when the array parameters `uint256[] value` and `bytes[] payload` have different sizes.
 * There should be the same number of elements for each array parameters.
 */
error BatchExecuteParamsLengthMismatch();

/**
 * @notice Not enough funds sent to forward each amount in the batch.
 *
 * @dev This error occurs when there was not enough funds sent to the batch functions `execute(uint256[],bytes[])` or
 * `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on
 * each payloads (`values[]` parameter from the batch functions above).
 *
 * This mean that `msg.value` is less than the sum of all the values being forwarded on each payloads (`values[]` parameters).
 *
 * @param totalValues The sum of all the values forwarded on each payloads (`values[]` parameter from the batch functions above).
 * @param msgValue The amount of native tokens sent to the batch functions `execute(uint256[],bytes[])` or `executeRelayCall(bytes[],uint256[],uint256[],bytes[])`.
 */
error LSP6BatchInsufficientValueSent(uint256 totalValues, uint256 msgValue);

/**
 * @notice Too much funds sent to forward each amount in the batch. No amount of native tokens should stay in the Key Manager.
 *
 * @dev This error occurs when there was too much funds sent to the batch functions `execute(uint256[],bytes[])` or
 * `executeRelayCall(bytes[],uint256[],uint256[],bytes[])` to cover the sum of all the values forwarded on
 *
 * Reverts to avoid the KeyManager to holds some remaining funds sent
 * to the following batch functions:
 *  - execute(uint256[],bytes[])
 *  - executeRelayCall(bytes[],uint256[],uint256[],bytes[])
 *
 * This error occurs when `msg.value` is more than the sum of all the values being
 * forwarded on each payloads (`values[]` parameter from the batch functions above).
 */
error LSP6BatchExcessiveValueSent(uint256 totalValues, uint256 msgValue);

/**
 * @notice Performing DELEGATE CALLS via the Key Manager is currently disallowed.
 *
 * @dev Reverts when trying to do a `delegatecall` via the ERC725X.execute(uint256,address,uint256,bytes) (operation type 4)
 * function of the linked {target}.
 * `DELEGATECALL` is disallowed by default on the LSP6KeyManager.
 */
error DelegateCallDisallowedViaKeyManager();

/**
 * @notice Invalid calldata payload sent.
 * @dev Reverts when the payload is invalid.
 */
error InvalidPayload(bytes payload);

/**
 * @notice Calling the Key Manager address for this transaction is disallowed.
 *
 * @dev Reverts when calling the KeyManager through `execute(uint256,address,uint256,bytes)`.
 */
error CallingKeyManagerNotAllowed();

/**
 * @notice Key Manager cannot be used as an LSP17 extension for LSP20 functions.
 *
 * @dev Reverts when the address of the Key Manager is being set as extensions for lsp20 functions
 */
error KeyManagerCannotBeSetAsExtensionForLSP20Functions();

/**
 * @notice Data value: `dataValue` length is different from the required length for the data key which is set.
 *
 * @dev Reverts when the data value length is not one of the required lengths for the specific data key.
 *
 * @param dataKey The data key that has a required length for the data value.
 * @param dataValue The data value that has an invalid length.
 */
error InvalidDataValuesForDataKeys(bytes32 dataKey, bytes dataValue);

// node_modules/@openzeppelin/contracts/utils/math/Math.sol

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
    function mulDiv(uint256 x, uint256 y, uint256 denominator) internal pure returns (uint256 result) {
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
    function mulDiv(uint256 x, uint256 y, uint256 denominator, Rounding rounding) internal pure returns (uint256) {
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
    function sqrt(uint256 a, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = sqrt(a);
            return result + (rounding == Rounding.Up && result * result < a ? 1 : 0);
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
    function log2(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log2(value);
            return result + (rounding == Rounding.Up && 1 << result < value ? 1 : 0);
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
    function log10(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log10(value);
            return result + (rounding == Rounding.Up && 10 ** result < value ? 1 : 0);
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
    function log256(uint256 value, Rounding rounding) internal pure returns (uint256) {
        unchecked {
            uint256 result = log256(value);
            return result + (rounding == Rounding.Up && 1 << (result << 3) < value ? 1 : 0);
        }
    }
}

// node_modules/@openzeppelin/contracts/utils/math/SignedMath.sol

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

// packages/lsp6-contracts/contracts/Version.sol

abstract contract Version {
    /**
     * @dev Get the version of the contract.
     * @notice Contract version.
     *
     * @return The version of the the contract.
     */
    // DO NOT CHANGE
    // Comments block below is used by release-please to automatically update the version in this file.
    // x-release-please-start-version
    string public constant VERSION = "0.14.0";

    // x-release-please-end
}

// node_modules/@erc725/smart-contracts/contracts/constants.sol

// ERC165 INTERFACE IDs
bytes4 constant _INTERFACEID_ERC725X = 0x7545acac;
bytes4 constant _INTERFACEID_ERC725Y = 0x629aa694;

// ERC725X OPERATION TYPES
uint256 constant OPERATION_0_CALL = 0;
uint256 constant OPERATION_1_CREATE = 1;
uint256 constant OPERATION_2_CREATE2 = 2;
uint256 constant OPERATION_3_STATICCALL = 3;
uint256 constant OPERATION_4_DELEGATECALL = 4;

// packages/lsp6-contracts/contracts/constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_ERC1271 = 0x1626ba7e;

// ERC1271 - Standard Signature Validation
bytes4 constant _ERC1271_SUCCESSVALUE = 0x1626ba7e;
bytes4 constant _ERC1271_FAILVALUE = 0xffffffff;

// node_modules/@erc725/smart-contracts/contracts/errors.sol

/**
 * @dev Reverts when trying to set `address(0)` as the contract owner when deploying the contract,
 * initializing it or transferring ownership of the contract.
 */
error OwnableCannotSetZeroAddressAsOwner();

/**
 * @dev Reverts when only the owner is allowed to call the function.
 * @param callerAddress The address that tried to make the call.
 */
error OwnableCallerNotTheOwner(address callerAddress);

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

// node_modules/@openzeppelin/contracts/utils/introspection/ERC165.sol

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
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC165).interfaceId;
    }
}

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
            supportsERC165InterfaceUnchecked(account, type(IERC165).interfaceId) &&
            !supportsERC165InterfaceUnchecked(account, _INTERFACE_ID_INVALID);
    }

    /**
     * @dev Returns true if `account` supports the interface defined by
     * `interfaceId`. Support for {IERC165} itself is queried automatically.
     *
     * See {IERC165-supportsInterface}.
     */
    function supportsInterface(address account, bytes4 interfaceId) internal view returns (bool) {
        // query support of both ERC165 as per the spec and support of _interfaceId
        return supportsERC165(account) && supportsERC165InterfaceUnchecked(account, interfaceId);
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
                interfaceIdsSupported[i] = supportsERC165InterfaceUnchecked(account, interfaceIds[i]);
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
    function supportsAllInterfaces(address account, bytes4[] memory interfaceIds) internal view returns (bool) {
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
    function supportsERC165InterfaceUnchecked(address account, bytes4 interfaceId) internal view returns (bool) {
        // prepare call
        bytes memory encodedParams = abi.encodeWithSelector(IERC165.supportsInterface.selector, interfaceId);

        // perform static call
        bool success;
        uint256 returnSize;
        uint256 returnValue;
        assembly {
            success := staticcall(30000, account, add(encodedParams, 0x20), mload(encodedParams), 0x00, 0x20)
            returnSize := returndatasize()
            returnValue := mload(0x00)
        }

        return success && returnSize >= 0x20 && returnValue > 0;
    }
}

// node_modules/@erc725/smart-contracts/contracts/interfaces/IERC725X.sol

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
        uint256 value,
        bytes32 indexed salt
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
        uint256 value,
        bytes4 indexed selector
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
     *
     * @custom:warning Be aware that `msg.value` is persisting between the caller and the callee when using `DELEGATECALL` (`4`) as `operationType`.
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
     *
     * @custom:warning The `msg.value` should not be trusted for any method called with the batch with `operationType`: `DELEGATECALL` (4).
     */
    function executeBatch(
        uint256[] memory operationsType,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory datas
    ) external payable returns (bytes[] memory);
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

// packages/lsp6-contracts/contracts/ILSP6KeyManager.sol

// interfaces

/**
 * @title Interface of the LSP6 - Key Manager standard, a contract acting as a controller of an ERC725 Account using predefined permissions.
 */
interface ILSP6KeyManager is IERC1271 {
    /* is ERC165 */
    /**
     * @dev Emitted when the LSP6KeyManager contract verified the permissions of the `signer` successfully.
     * @notice Verified the permissions of `signer` for calling function `selector` on the linked account and sending `value` of native token.
     * @param signer The address of the controller that executed the calldata payload (either directly via {execute} or via meta transaction using {executeRelayCall}).
     * @param value The amount of native token to be transferred in the calldata payload.
     * @param selector The bytes4 function of the function that was executed on the linked {target}
     */
    event PermissionsVerified(
        address indexed signer,
        uint256 indexed value,
        bytes4 indexed selector
    );

    /**
     * @dev Get The address of the contract linked to this Key Manager.
     * @return The address of the linked contract
     */
    function target() external view returns (address);

    /**
     * @notice Executing the following payload on the linked contract: `payload`
     *
     * @dev Execute A `payload` on the linked {target} contract after having verified the permissions associated with the function being run.
     * The `payload` MUST be a valid abi-encoded function call of one of the functions present in the linked {target}, otherwise the call will fail.
     * The linked {target} will return some data on successful execution, or revert on failure.
     *
     * @param payload The abi-encoded function call to execute on the linked {target}.
     * @return The abi-decoded data returned by the function called on the linked {target}.
     */
    function execute(
        bytes calldata payload
    ) external payable returns (bytes memory);

    /**
     * @notice Executing the following batch of payloads and sensind on the linked contract.
     * - payloads: `payloads`
     * - values transferred for each payload: `values`
     *
     * @dev Same as {execute} but execute a batch of payloads (abi-encoded function calls) in a single transaction.
     *
     * @param values An array of amount of native tokens to be transferred for each `payload`.
     * @param payloads An array of abi-encoded function calls to execute successively on the linked {target}.
     *
     * @return An array of abi-decoded data returned by the functions called on the linked {target}.
     */
    function executeBatch(
        uint256[] calldata values,
        bytes[] calldata payloads
    ) external payable returns (bytes[] memory);
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
            (isTopLevelCall && _initialized < 1) || (!AddressUpgradeable.isContract(address(this)) && _initialized == 1),
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
        require(!_initializing && _initialized < version, "Initializable: contract is already initialized");
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

// node_modules/@erc725/smart-contracts/contracts/custom/OwnableUnset.sol

// errors

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
        if (newOwner == address(0)) {
            revert OwnableCannotSetZeroAddressAsOwner();
        }
        _setOwner(newOwner);
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        if (owner() != msg.sender) {
            revert OwnableCallerNotTheOwner(msg.sender);
        }
    }

    /**
     * @dev Changes the owner if `newOwner` and oldOwner are different
     * This pattern is useful in inheritance.
     */
    function _setOwner(address newOwner) internal virtual {
        if (newOwner != owner()) {
            emit OwnershipTransferred(_owner, newOwner);
            _owner = newOwner;
        }
    }
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

// node_modules/@openzeppelin/contracts/utils/Strings.sol

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
        return string(abi.encodePacked(value < 0 ? "-" : "", toString(SignedMath.abs(value))));
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
    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
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
    function equal(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(bytes(a)) == keccak256(bytes(b));
    }
}

// node_modules/@openzeppelin/contracts/utils/cryptography/ECDSA.sol

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
    function tryRecover(bytes32 hash, bytes memory signature) internal pure returns (address, RecoverError) {
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
    function recover(bytes32 hash, bytes memory signature) internal pure returns (address) {
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
    function tryRecover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address, RecoverError) {
        bytes32 s = vs & bytes32(0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff);
        uint8 v = uint8((uint256(vs) >> 255) + 27);
        return tryRecover(hash, v, r, s);
    }

    /**
     * @dev Overload of {ECDSA-recover} that receives the `r and `vs` short-signature fields separately.
     *
     * _Available since v4.2._
     */
    function recover(bytes32 hash, bytes32 r, bytes32 vs) internal pure returns (address) {
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
    function tryRecover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address, RecoverError) {
        // EIP-2 still allows signature malleability for ecrecover(). Remove this possibility and make the signature
        // unique. Appendix F in the Ethereum Yellow paper (https://ethereum.github.io/yellowpaper/paper.pdf), defines
        // the valid range for s in (301): 0 < s < secp256k1n ÷ 2 + 1, and for v in (302): v ∈ {27, 28}. Most
        // signatures from current libraries generate a unique signature with an s-value in the lower half order.
        //
        // If your library generates malleable signatures, such as s-values in the upper range, calculate a new s-value
        // with 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141 - s1 and flip v from 27 to 28 or
        // vice versa. If your library also generates signatures with 0/1 for v instead 27/28, add 27 to v to accept
        // these malleable signatures as well.
        if (uint256(s) > 0x7FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF5D576E7357A4501DDFE92F46681B20A0) {
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
    function recover(bytes32 hash, uint8 v, bytes32 r, bytes32 s) internal pure returns (address) {
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
    function toEthSignedMessageHash(bytes32 hash) internal pure returns (bytes32 message) {
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
    function toEthSignedMessageHash(bytes memory s) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n", Strings.toString(s.length), s));
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
    function toTypedDataHash(bytes32 domainSeparator, bytes32 structHash) internal pure returns (bytes32 data) {
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
    function toDataWithIntendedValidatorHash(address validator, bytes memory data) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19\x00", validator, data));
    }
}

// node_modules/@erc725/smart-contracts/contracts/ERC725YCore.sol

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

// node_modules/@lukso/lsp25-contracts/contracts/LSP25MultiChannelNonce.sol

// libraries

// constants

// errors

/**
 * @title Implementation of the multi channel nonce and the signature verification defined in the LSP25 standard.
 * @author Jean Cavallera (CJ42)
 * @dev This contract can be used as a backbone for other smart contracts to implement meta-transactions via the LSP25 Execute Relay Call interface.
 *
 * It contains a storage of nonces for signer addresses across various channel IDs, enabling these signers to submit signed transactions that order-independent.
 * (transactions that do not need to be submitted one after the other in a specific order).
 *
 * Finally, it contains internal functions to verify signatures for specific calldata according the signature format specified in the LSP25 standard.
 */
abstract contract LSP25MultiChannelNonce {
    using ECDSA for *;

    // Mapping of signer -> channelId -> nonce in channel
    mapping(address => mapping(uint256 => uint256)) internal _nonceStore;

    /**
     * @dev Read the nonce for a `from` address on a specific `channelId`.
     * This will return an `idx`, which is the concatenation of two `uint128` as follow:
     * 1. the `channelId` where the nonce was queried for.
     * 2. the actual nonce of the given `channelId`.
     *
     * For example, if on `channelId` number `5`, the latest nonce  is `1`, the `idx` returned by this function will be:
     *
     * ```
     * // in decimals = 1701411834604692317316873037158841057281
     * idx = 0x0000000000000000000000000000000500000000000000000000000000000001
     * ```
     *
     * This idx can be described as follow:
     *
     * ```
     *             channelId => 5          nonce in this channel => 1
     *   v------------------------------v-------------------------------v
     * 0x0000000000000000000000000000000500000000000000000000000000000001
     * ```
     *
     * @param from The address to read the nonce for.
     * @param channelId The channel in which to extract the nonce.
     *
     * @return idx The idx composed of two `uint128`: the channelId + nonce in channel concatenated together in a single `uint256` value.
     */
    function _getNonce(
        address from,
        uint128 channelId
    ) internal view virtual returns (uint256 idx) {
        return (uint256(channelId) << 128) | _nonceStore[from][channelId];
    }

    /**
     * @dev Recover the address of the signer that generated a `signature` using the parameters provided `nonce`, `validityTimestamps`, `msgValue` and `callData`.
     * The address of the signer will be recovered using the LSP25 signature format.
     *
     * @param signature A 65 bytes long signature generated according to the signature format specified in the LSP25 standard.
     * @param nonce The nonce that the signer used to generate the `signature`.
     * @param validityTimestamps The validity timestamp that the signer used to generate the signature (See {_verifyValidityTimestamps} to learn more).
     * @param msgValue The amount of native tokens intended to be sent for the relay transaction.
     * @param callData The calldata to execute as a relay transaction that the signer signed for.
     *
     * @return The address that signed, recovered from the `signature`.
     */
    function _recoverSignerFromLSP25Signature(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        uint256 msgValue,
        bytes calldata callData
    ) internal view returns (address) {
        bytes memory lsp25EncodedMessage = abi.encodePacked(
            LSP25_VERSION,
            block.chainid,
            nonce,
            validityTimestamps,
            msgValue,
            callData
        );

        bytes32 eip191Hash = address(this).toDataWithIntendedValidatorHash(
            lsp25EncodedMessage
        );

        return eip191Hash.recover(signature);
    }

    /**
     * @dev Verify that the current timestamp is within the date and time range provided by `validityTimestamps`.
     *
     * @param validityTimestamps Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed,
     * and the right-most `uint128` represents the timestamp after which the transaction expire.
     */
    function _verifyValidityTimestamps(
        uint256 validityTimestamps
    ) internal view {
        if (validityTimestamps == 0) return;

        uint128 startingTimestamp = uint128(validityTimestamps >> 128);
        uint128 endingTimestamp = uint128(validityTimestamps);

        // solhint-disable-next-line not-rely-on-time
        if (block.timestamp < startingTimestamp) {
            revert RelayCallBeforeStartTime();
        }

        // Allow `endingTimestamp` to be 0
        // Allow execution anytime past `startingTimestamp`
        if (endingTimestamp == 0) return;

        // solhint-disable-next-line not-rely-on-time
        if (block.timestamp > endingTimestamp) {
            revert RelayCallExpired();
        }
    }

    /**
     * @dev Verify that the nonce `_idx` for `_from` (obtained via {getNonce}) is valid in its channel ID.
     *
     * The "idx" is a 256bits (unsigned) integer, where:
     * - the 128 leftmost bits = channelId
     * - and the 128 rightmost bits = nonce within the channel

     * @param from The signer's address.
     * @param idx The concatenation of the `channelId` + `nonce` within a specific channel ID.
     *
     * @return true if the nonce is the latest nonce for the `signer`, false otherwise.
     */
    function _isValidNonce(
        address from,
        uint256 idx
    ) internal view virtual returns (bool) {
        return uint128(idx) == _nonceStore[from][idx >> 128];
    }
}

// packages/lsp6-contracts/contracts/LSP6Utils.sol

// interfaces

// libraries

// constants

/**
 * @title LSP6 Utility library.
 * @author Yamen Merhi <YamenMerhi>, Jean Cavallera <CJ42>, Maxime Viard <SkimaHarvey>
 * @dev LSP6Utils is a library of utility functions that can be used to retrieve, check and set LSP6 permissions stored under the ERC725Y storage
 * of a smart contract.
 * Based on the LSP6 Key Manager standard.
 */
library LSP6Utils {
    using LSP2Utils for bytes10;

    /**
     * @dev Read the permissions of a `caller` on an ERC725Y `target` contract.
     *
     * @param target An `IERC725Y` contract where to read the permissions.
     * @param caller The controller address to read the permissions from.
     *
     * @return A `bytes32` BitArray containing the permissions of a controller address.
     *
     * @custom:info If the raw value fetched from the ERC725Y storage of `target` is not 32 bytes long, this is considered
     * like _"no permissions are set"_ and will return 32 x `0x00` bytes as `bytes32(0)`.
     */
    function getPermissionsFor(
        IERC725Y target,
        address caller
    ) internal view returns (bytes32) {
        bytes memory permissions = target.getData(
            LSP2Utils.generateMappingWithGroupingKey(
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
                bytes20(caller)
            )
        );

        if (permissions.length != 32) {
            return bytes32(0);
        }

        return bytes32(permissions);
    }

    function getAllowedCallsFor(
        IERC725Y target,
        address from
    ) internal view returns (bytes memory) {
        return
            target.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX,
                    bytes20(from)
                )
            );
    }

    /**
     * @dev Read the Allowed ERC725Y data keys of a `caller` on an ERC725Y `target` contract.
     *
     * @param target An `IERC725Y` contract where to read the permissions.
     * @param caller The controller address to read the permissions from.
     *
     * @return An abi-encoded array of allowed ERC725 data keys that the controller address is allowed to interact with.
     */
    function getAllowedERC725YDataKeysFor(
        IERC725Y target,
        address caller
    ) internal view returns (bytes memory) {
        return
            target.getData(
                LSP2Utils.generateMappingWithGroupingKey(
                    _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX,
                    bytes20(caller)
                )
            );
    }

    /**
     * @dev Compare the permissions `controllerPermissions` of a controller address to check if they includes the permissions `permissionToCheck`.
     *
     * @param controllerPermissions The permissions of an address.
     * @param permissionToCheck The permissions to check if the controller has under its `controllerPermissions`.
     *
     * @return `true` if `controllerPermissions` includes `permissionToCheck`, `false` otherwise.
     */
    function hasPermission(
        bytes32 controllerPermissions,
        bytes32 permissionToCheck
    ) internal pure returns (bool) {
        return (controllerPermissions & permissionToCheck) == permissionToCheck;
    }

    /**
     * @dev Same as `LSP2Utils.isCompactBytesArray` with the additional requirement that each element must be 32 bytes long.
     *
     * @param allowedCallsCompacted A compact bytes array of tuples `(bytes4,address,bytes4,bytes4)` to check (defined as `(bytes4,address,bytes4,bytes4)[CompactBytesArray]` in LSP6).
     *
     * @return `true` if the value passed is a valid compact bytes array of bytes32 AllowedCalls elements, `false` otherwise.
     */
    function isCompactBytesArrayOfAllowedCalls(
        bytes memory allowedCallsCompacted
    ) internal pure returns (bool) {
        uint256 pointer = 0;

        while (pointer < allowedCallsCompacted.length) {
            // solhint-disable-next-line gas-strict-inequalities
            if (pointer + 1 >= allowedCallsCompacted.length) return false;
            uint256 elementLength = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedCallsCompacted[pointer],
                        allowedCallsCompacted[pointer + 1]
                    )
                )
            );
            // each entries in the allowedCalls (compact) array must be 32 bytes long
            if (elementLength != 32) return false;
            pointer += elementLength + 2;
        }
        if (pointer == allowedCallsCompacted.length) return true;
        return false;
    }

    /**
     * @dev Same as `LSP2Utils.isCompactBytesArray` with the additional requirement that each element must be from 1 to 32 bytes long.
     *
     * @param allowedERC725YDataKeysCompacted a compact bytes array of ERC725Y data Keys (full bytes32 data keys or bytesN prefix) to check (defined as `bytes[CompactBytesArray]`).
     *
     * @return `true` if the value passed is a valid compact bytes array of bytes32 Allowed ERC725Y data keys, `false` otherwise.
     */
    function isCompactBytesArrayOfAllowedERC725YDataKeys(
        bytes memory allowedERC725YDataKeysCompacted
    ) internal pure returns (bool) {
        uint256 pointer = 0;

        while (pointer < allowedERC725YDataKeysCompacted.length) {
            // solhint-disable-next-line gas-strict-inequalities
            if (pointer + 1 >= allowedERC725YDataKeysCompacted.length)
                return false;
            uint256 elementLength = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedERC725YDataKeysCompacted[pointer],
                        allowedERC725YDataKeysCompacted[pointer + 1]
                    )
                )
            );
            // the length of the allowed data key must be not under 33 bytes and not 0
            if (elementLength == 0 || elementLength > 32) return false;
            pointer += elementLength + 2;
        }
        if (pointer == allowedERC725YDataKeysCompacted.length) return true;
        return false;
    }

    /**
     * @dev Use the `setData(bytes32[],bytes[])` function via the KeyManager on the target contract.
     *
     * @param keyManagerAddress The address of the KeyManager.
     * @param keys The array of `bytes32[]` data keys.
     * @param values The array of `bytes[]` data values.
     */
    function setDataViaKeyManager(
        address keyManagerAddress,
        bytes32[] memory keys,
        bytes[] memory values
    ) internal returns (bytes memory result) {
        bytes memory payload = abi.encodeWithSelector(
            IERC725Y.setDataBatch.selector,
            keys,
            values
        );
        result = ILSP6KeyManager(keyManagerAddress).execute(payload);
    }

    /**
     * @dev Combine multiple permissions into a single `bytes32`.
     * Make sure that the sum of the values of the input array is less than `2^256-1 to avoid overflow.
     *
     * @param permissions The array of permissions to combine.
     * @return A `bytes32` value containing the combined permissions.
     */
    function combinePermissions(
        bytes32[] memory permissions
    ) internal pure returns (bytes32) {
        bytes32 result;
        for (uint256 i; i < permissions.length; ++i) {
            result |= permissions[i];
        }
        return result;
    }

    /**
     * @dev Generate a new set of 3 x LSP6 permission data keys to add a new `controller` on `account`.
     * @param account The ERC725Y contract to add the controller into (used to fetch the `LSP6Permissions[]` length).
     * @param controller The address of the controller to grant permissions to.
     * @param permissions The `BitArray` of permissions to grant to the controller.
     * @return keys An array of 3 x data keys containing:
     * - `keys[0] = AddressPermissions[]` (array length).
     * - `keys[1] = AddressPermissions[index]` (where to store the controller address).
     * - `keys[2] = AddressPermissions:Permissions:<controller>`.
     *
     * @return values An array of 3 x data values containing:
     * - `values[0] =` the new array length of `AddressPermissions[]`
     * - `values[1] =` the address of the controller
     * - `values[2] =` the `permissions` passed as param
     */
    function generateNewPermissionsKeys(
        IERC725Y account,
        address controller,
        bytes32 permissions
    ) internal view returns (bytes32[] memory keys, bytes[] memory values) {
        keys = new bytes32[](3);
        values = new bytes[](3);

        uint128 arrayLength = uint128(
            bytes16(account.getData(_LSP6KEY_ADDRESSPERMISSIONS_ARRAY))
        );
        uint128 newArrayLength = arrayLength + 1;

        keys[0] = _LSP6KEY_ADDRESSPERMISSIONS_ARRAY;
        values[0] = abi.encodePacked(newArrayLength);

        keys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP6KEY_ADDRESSPERMISSIONS_ARRAY,
            arrayLength
        );
        values[1] = abi.encodePacked(controller);

        keys[2] = LSP2Utils.generateMappingWithGroupingKey(
            _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX,
            bytes20(controller)
        );
        values[2] = abi.encodePacked(permissions);
    }

    /**
     * @dev Returns the name of the permission as a string.
     *
     * @param permission The low-level `bytes32` permission as a `BitArray` to get the permission name from.
     *
     * @return The string name of the `bytes32` permission value.
     */
    function getPermissionName(
        bytes32 permission
    ) internal pure returns (string memory) {
        if (permission == _PERMISSION_CHANGEOWNER) return "TRANSFEROWNERSHIP";
        if (permission == _PERMISSION_EDITPERMISSIONS) return "EDITPERMISSIONS";
        if (permission == _PERMISSION_ADDCONTROLLER) return "ADDCONTROLLER";
        if (permission == _PERMISSION_ADDEXTENSIONS) return "ADDEXTENSIONS";
        if (permission == _PERMISSION_CHANGEEXTENSIONS)
            return "CHANGEEXTENSIONS";
        if (permission == _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE)
            return "ADDUNIVERSALRECEIVERDELEGATE";
        if (permission == _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE)
            return "CHANGEUNIVERSALRECEIVERDELEGATE";
        if (permission == _PERMISSION_REENTRANCY) return "REENTRANCY";
        if (permission == _PERMISSION_SETDATA) return "SETDATA";
        if (permission == _PERMISSION_CALL) return "CALL";
        if (permission == _PERMISSION_STATICCALL) return "STATICCALL";
        if (permission == _PERMISSION_DELEGATECALL) return "DELEGATECALL";
        if (permission == _PERMISSION_DEPLOY) return "DEPLOY";
        if (permission == _PERMISSION_TRANSFERVALUE) return "TRANSFERVALUE";
        if (permission == _PERMISSION_SIGN) return "SIGN";
        return "";
    }
}

// node_modules/@erc725/smart-contracts/contracts/ERC725Y.sol

// modules

// errors

/**
 * @title Deployable implementation with `constructor` of ERC725Y, a generic data key/value store.
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @dev ERC725Y provides the ability to set arbitrary data key/value pairs that can be changed over time.
 * It is intended to standardise certain data key/value pairs to allow automated read and writes from/to the contract storage.
 */
contract ERC725Y is ERC725YCore {
    /**
     * @notice Deploying an ERC725Y smart contract and setting address `initialOwner` as the contract owner.
     * @dev Deploy a new ERC725Y contract with the provided `initialOwner` as the contract {owner}.
     * @param initialOwner the owner of the contract.
     *
     * @custom:requirements
     * - `initialOwner` CANNOT be the zero address.
     */
    constructor(address initialOwner) payable {
        if (initialOwner == address(0)) {
            revert OwnableCannotSetZeroAddressAsOwner();
        }
        OwnableUnset._setOwner(initialOwner);
    }
}

// packages/lsp6-contracts/contracts/LSP6Modules/LSP6ExecuteRelayCallModule.sol

// libraries

// constants

// errors

abstract contract LSP6ExecuteRelayCallModule {
    function _verifyExecuteRelayCallPermission(
        address controllerAddress,
        bytes32 controllerPermissions
    ) internal pure {
        if (
            !LSP6Utils.hasPermission(
                controllerPermissions,
                _PERMISSION_EXECUTE_RELAY_CALL
            )
        ) {
            revert NotAuthorised(controllerAddress, "EXECUTE_RELAY_CALL");
        }
    }
}

// packages/lsp6-contracts/contracts/LSP6Modules/LSP6OwnershipModule.sol

// libraries

// constants

// errors

abstract contract LSP6OwnershipModule {
    function _verifyOwnershipPermissions(
        address controllerAddress,
        bytes32 controllerPermissions
    ) internal pure {
        if (
            !LSP6Utils.hasPermission(
                controllerPermissions,
                _PERMISSION_CHANGEOWNER
            )
        ) {
            string memory permissionErrorString = LSP6Utils.getPermissionName(
                _PERMISSION_CHANGEOWNER
            );
            revert NotAuthorised(controllerAddress, permissionErrorString);
        }
    }
}

// packages/lsp6-contracts/contracts/LSP6Modules/LSP6ExecuteModule.sol

// modules

// libraries

// constants

// errors

abstract contract LSP6ExecuteModule {
    using ERC165Checker for address;
    using LSP6Utils for *;

    /**
     * @dev verify if `controllerAddress` has the required permissions to interact with other addresses using the controlledContract.
     * @param controlledContract the address of the ERC725 contract where the payload is executed and where the permissions are verified.
     * @param controller the address who want to run the execute function on the ERC725Account.
     * @param permissions the permissions of the controller address.
     */
    function _verifyCanExecute(
        address controlledContract,
        address controller,
        bytes32 permissions,
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        // if to is the KeyManager address revert
        if (to == address(this)) {
            revert CallingKeyManagerNotAllowed();
        }

        // Future versions of the KeyManager willing to allow LSP0 to call the KeyManager
        // may need to implement this check to avoid inconsistent state of reentrancy
        // that may lead to lock the use of the KeyManager

        // Check to restrict controllers with execute permissions to call lsp20 functions
        // to avoid setting the reentrancy guard to a non-valid state

        // if (data.length >= 4 && to == address(this)) {
        //     if (
        //         bytes4(data) == ILSP20.lsp20VerifyCall.selector ||
        //         bytes4(data) == ILSP20.lsp20VerifyCallResult.selector
        //     ) {
        //         revert CallingLSP20FunctionsOnLSP6NotAllowed();
        //     }
        // }

        // if it is a message call
        if (operationType == OPERATION_0_CALL) {
            return
                _verifyCanCall(
                    controlledContract,
                    controller,
                    permissions,
                    to,
                    value,
                    data
                );
        }

        // if it is a contract creation
        if (
            operationType == OPERATION_1_CREATE ||
            operationType == OPERATION_2_CREATE2
        ) {
            // required to check for permission TRANSFERVALUE if we are funding
            // the contract on deployment via a payable constructor
            bool isFundingContract = value != 0;

            return
                _verifyCanDeployContract(
                    controller,
                    permissions,
                    isFundingContract
                );
        }

        // if it is a STATICALL
        // we do not check for TRANSFERVALUE permission,
        // as ERC725X will revert if a value is provided with operation type STATICCALL.
        if (operationType == OPERATION_3_STATICCALL) {
            return
                _verifyCanStaticCall(
                    controlledContract,
                    controller,
                    permissions,
                    to,
                    value,
                    data
                );
        }

        // DELEGATECALL is disallowed by default on the Key Manager.
        if (operationType == OPERATION_4_DELEGATECALL) {
            revert DelegateCallDisallowedViaKeyManager();
        }
    }

    function _verifyCanDeployContract(
        address controller,
        bytes32 permissions,
        bool isFundingContract
    ) internal view virtual {
        _requirePermissions(controller, permissions, _PERMISSION_DEPLOY);

        bool hasSuperTransferValue = permissions.hasPermission(
            _PERMISSION_SUPER_TRANSFERVALUE
        );

        // CHECK if we are funding the contract
        if (isFundingContract && !hasSuperTransferValue) {
            revert NotAuthorised(controller, "SUPER_TRANSFERVALUE");
        }
    }

    function _verifyCanStaticCall(
        address controlledContract,
        address controller,
        bytes32 permissions,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        bool hasSuperStaticCall = permissions.hasPermission(
            _PERMISSION_SUPER_STATICCALL
        );

        // Skip if caller has SUPER permission for static calls
        if (hasSuperStaticCall) return;

        _requirePermissions(controller, permissions, _PERMISSION_STATICCALL);

        _verifyAllowedCall(
            controlledContract,
            controller,
            OPERATION_3_STATICCALL,
            to,
            value,
            data
        );
    }

    function _verifyCanCall(
        address controlledContract,
        address controller,
        bytes32 permissions,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        bool isValueTransfer = value != 0;

        bool hasSuperTransferValue = permissions.hasPermission(
            _PERMISSION_SUPER_TRANSFERVALUE
        );

        bool isEmptyCall = data.length == 0;

        bool hasSuperCall = permissions.hasPermission(_PERMISSION_SUPER_CALL);

        if (isValueTransfer && !hasSuperTransferValue) {
            _requirePermissions(
                controller,
                permissions,
                _PERMISSION_TRANSFERVALUE
            );
        }

        // CHECK if we are doing an empty call, as the receive() or fallback() function
        // of the controlledContract could run some code.
        if (isEmptyCall && !isValueTransfer && !hasSuperCall) {
            _requirePermissions(controller, permissions, _PERMISSION_CALL);
        }

        if (!isEmptyCall && !hasSuperCall) {
            _requirePermissions(controller, permissions, _PERMISSION_CALL);
        }

        // Skip if caller has SUPER permissions for external calls, with or without calldata (empty calls)
        if (!isValueTransfer && hasSuperCall) return;

        // Skip if caller has SUPER permission for value transfers
        if (isEmptyCall && isValueTransfer && hasSuperTransferValue) return;

        // Skip if both SUPER permissions are present
        if (hasSuperCall && hasSuperTransferValue) return;

        _verifyAllowedCall(
            controlledContract,
            controller,
            OPERATION_0_CALL,
            to,
            value,
            data
        );
    }

    function _verifyAllowedCall(
        address controlledContract,
        address controllerAddress,
        uint256 operationType,
        address to,
        uint256 value,
        bytes memory data
    ) internal view virtual {
        // CHECK for ALLOWED CALLS
        bytes memory allowedCalls = ERC725Y(controlledContract)
            .getAllowedCallsFor(controllerAddress);

        if (allowedCalls.length == 0) {
            revert NoCallsAllowed(controllerAddress);
        }

        bytes4 requiredCallTypes = _extractCallType(operationType, value, data);

        for (uint256 ii; ii < allowedCalls.length; ii += 34) {
            /// @dev structure of an AllowedCall
            //
            /// AllowedCall = 0x00200000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
            ///
            ///                                     0020 = hex for '32' bytes long
            ///                                 0000000n = call type(s)
            /// cafecafecafecafecafecafecafecafecafecafe = address
            ///                                 5a5a5a5a = standard
            ///                                 f1f1f1f1 = function

            // CHECK that we can extract an AllowedCall
            if (ii + 34 > allowedCalls.length) {
                revert InvalidEncodedAllowedCalls(allowedCalls);
            }

            // extract one AllowedCall at a time
            bytes memory allowedCall = BytesLib.slice(allowedCalls, ii + 2, 32);

            // 0xxxxxxxxxffffffffffffffffffffffffffffffffffffffffffffffffffffffff
            // (excluding the callTypes) not allowed
            // as equivalent to whitelisting any call (= SUPER permission)
            if (
                bytes28(bytes32(allowedCall) << 32) ==
                bytes28(type(uint224).max)
            ) {
                revert InvalidWhitelistedCall(controllerAddress);
            }

            if (
                _isAllowedCallType(allowedCall, requiredCallTypes) &&
                _isAllowedAddress(allowedCall, to) &&
                _isAllowedStandard(allowedCall, to) &&
                _isAllowedFunction(allowedCall, data)
            ) return;
        }

        revert NotAllowedCall(controllerAddress, to, bytes4(data));
    }

    /**
     * @dev extract the bytes4 representation of a single bit for the type of call according to the `operationType`
     * @param operationType 0 = CALL, 3 = STATICCALL or 3 = DELEGATECALL
     * @return requiredCallTypes a bytes4 value containing a single 1 bit for the callType
     */
    function _extractCallType(
        uint256 operationType,
        uint256 value,
        bytes memory data
    ) internal pure returns (bytes4 requiredCallTypes) {
        // if there is value being transferred, add the extra bit
        // for the first bit for Value Transfer in the `requiredCallTypes`
        if (value != 0) {
            requiredCallTypes |= _ALLOWEDCALLS_TRANSFERVALUE;
        }

        bool isCallDataPresent = data.length != 0;
        bool isEmptyCallWithoutValue = !isCallDataPresent && value == 0;

        // if we are doing a message call with some data
        // or if we are doing an empty call without value
        if (isCallDataPresent || isEmptyCallWithoutValue) {
            if (operationType == OPERATION_0_CALL) {
                requiredCallTypes |= _ALLOWEDCALLS_CALL;
            } else if (operationType == OPERATION_3_STATICCALL) {
                requiredCallTypes |= _ALLOWEDCALLS_STATICCALL;
            } else if (operationType == OPERATION_4_DELEGATECALL) {
                requiredCallTypes |= _ALLOWEDCALLS_DELEGATECALL;
            }
        }
    }

    function _isAllowedAddress(
        bytes memory allowedCall,
        address to
    ) internal pure virtual returns (bool) {
        // <offset> = 4 bytes x 8 bits = 32 bits
        //
        // <offset>v----------------address---------------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        address allowedAddress = address(bytes20(bytes32(allowedCall) << 32));

        // ANY address = 0xffffffffffffffffffffffffffffffffffffffff
        return
            allowedAddress == address(bytes20(type(uint160).max)) ||
            to == allowedAddress;
    }

    function _isAllowedStandard(
        bytes memory allowedCall,
        address to
    ) internal view virtual returns (bool) {
        // <offset> = 24 bytes x 8 bits = 192 bits
        //
        //                                                 standard
        // <----------------<offset>---------------------->v------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        bytes4 allowedStandard = bytes4(bytes32(allowedCall) << 192);

        // ANY Standard = 0xffffffff
        return
            allowedStandard == bytes4(type(uint32).max) ||
            to.supportsERC165InterfaceUnchecked(allowedStandard);
    }

    function _isAllowedFunction(
        bytes memory allowedCall,
        bytes memory data
    ) internal pure virtual returns (bool) {
        // <offset> = 28 bytes x 8 bits = 224 bits
        //
        //                                                         function
        // <------------------------<offset>---------------------->v------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        bytes4 allowedFunction = bytes4(bytes32(allowedCall) << 224);

        bool isFunctionCall = data.length >= 4;

        bytes4 requiredFunction = bytes4(data);

        // ANY function = 0xffffffff
        return
            allowedFunction == bytes4(type(uint32).max) ||
            (isFunctionCall && (requiredFunction == allowedFunction));
    }

    function _isAllowedCallType(
        bytes memory allowedCall,
        bytes4 requiredCallTypes
    ) internal pure virtual returns (bool) {
        // extract callType
        //
        // <offset> = 0
        //
        // callType
        // v------v
        // 0000000ncafecafecafecafecafecafecafecafecafecafe5a5a5a5af1f1f1f1
        bytes4 allowedCallType = bytes4(allowedCall);
        return (allowedCallType & requiredCallTypes == requiredCallTypes);
    }

    /**
     * @dev revert if `controller`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param controller the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address controller,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure virtual {
        if (!LSP6Utils.hasPermission(addressPermissions, permissionRequired)) {
            string memory permissionErrorString = LSP6Utils.getPermissionName(
                permissionRequired
            );
            revert NotAuthorised(controller, permissionErrorString);
        }
    }
}

// packages/lsp6-contracts/contracts/LSP6Modules/LSP6SetDataModule.sol

// interfaces

// modules

// libraries

// constants

// errors

abstract contract LSP6SetDataModule {
    using LSP6Utils for *;

    /**
     * @dev verify if the `controllerAddress` has the permissions required to set a data key on the ERC725Y storage of the `controlledContract`.
     * @param controlledContract the address of the ERC725Y contract where the data key is set.
     * @param controllerAddress the address of the controller who wants to set the data key.
     * @param controllerPermissions the permissions of the controller address.
     * @param inputDataKey the data key to set on the `controlledContract`.
     * @param inputDataValue the data value to set for the `inputDataKey`.
     */
    function _verifyCanSetData(
        address controlledContract,
        address controllerAddress,
        bytes32 controllerPermissions,
        bytes32 inputDataKey,
        bytes memory inputDataValue
    ) internal view virtual {
        bytes32 requiredPermission = _getPermissionRequiredToSetDataKey(
            controlledContract,
            controllerPermissions,
            inputDataKey,
            inputDataValue
        );

        // CHECK if allowed to set an ERC725Y Data Key
        if (requiredPermission == _PERMISSION_SETDATA) {
            // Skip if caller has SUPER permissions
            if (controllerPermissions.hasPermission(_PERMISSION_SUPER_SETDATA))
                return;

            _requirePermissions(
                controllerAddress,
                controllerPermissions,
                _PERMISSION_SETDATA
            );

            _verifyAllowedERC725YSingleKey(
                controllerAddress,
                inputDataKey,
                ERC725Y(controlledContract).getAllowedERC725YDataKeysFor(
                    controllerAddress
                )
            );
        } else {
            // Do not check again if we already checked that the controller had the permissions inside `_getPermissionRequiredToSetDataKey(...)`
            if (requiredPermission == bytes32(0)) return;

            // Otherwise CHECK the required permission if setting LSP6 permissions, LSP1 Delegate or LSP17 Extensions.
            _requirePermissions(
                controllerAddress,
                controllerPermissions,
                requiredPermission
            );
        }
    }

    /**
     * @dev verify if the `controllerAddress` has the permissions required to set an array of data keys on the ERC725Y storage of the `controlledContract`.
     * @param controlledContract the address of the ERC725Y contract where the data key is set.
     * @param controller the address of the controller who wants to set the data key.
     * @param permissions the permissions of the controller address.
     * @param inputDataKeys an array of data keys to set on the `controlledContract`.
     * @param inputDataValues an array of data values to set for the `inputDataKeys`.
     */
    function _verifyCanSetData(
        address controlledContract,
        address controller,
        bytes32 permissions,
        bytes32[] memory inputDataKeys,
        bytes[] memory inputDataValues
    ) internal view virtual {
        if (inputDataKeys.length != inputDataValues.length) {
            revert ERC725Y_DataKeysValuesLengthMismatch();
        }

        bool isSettingERC725YKeys = false;
        bool[] memory validatedInputDataKeys = new bool[](inputDataKeys.length);
        uint256 inputDataKeysAllowed = 0;

        bytes32 requiredPermission;

        uint256 ii = 0;
        do {
            requiredPermission = _getPermissionRequiredToSetDataKey(
                controlledContract,
                permissions,
                inputDataKeys[ii],
                inputDataValues[ii]
            );

            if (requiredPermission == _PERMISSION_SETDATA) {
                isSettingERC725YKeys = true;
            } else {
                // if we did not check already the permissions of the controller inside `_getPermissionRequiredToSetDataKey(...)`
                if (requiredPermission != bytes32(0)) {
                    // CHECK the required permissions for setting LSP6 permissions, LSP1 Delegate or LSP17 Extensions.
                    _requirePermissions(
                        controller,
                        permissions,
                        requiredPermission
                    );
                }

                validatedInputDataKeys[ii] = true;
                inputDataKeysAllowed++;
            }

            unchecked {
                ++ii;
            }
        } while (ii < inputDataKeys.length);

        // CHECK if allowed to set one (or multiple) ERC725Y Data Keys
        if (isSettingERC725YKeys) {
            // Skip if caller has SUPER permissions
            if (permissions.hasPermission(_PERMISSION_SUPER_SETDATA)) return;

            _requirePermissions(controller, permissions, _PERMISSION_SETDATA);

            _verifyAllowedERC725YDataKeys(
                controller,
                inputDataKeys,
                ERC725Y(controlledContract).getAllowedERC725YDataKeysFor(
                    controller
                ),
                validatedInputDataKeys,
                inputDataKeysAllowed
            );
        }
    }

    /**
     * @dev retrieve the permission required based on the data key to be set on the `controlledContract`.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param inputDataKey the data key to set on the `controlledContract`. Can be related to LSP6 Permissions, LSP1 Delegate or LSP17 Extensions.
     * @param inputDataValue the data value to set for the `inputDataKey`.
     * @return the permission required to set the `inputDataKey` on the `controlledContract`.
     */
    function _getPermissionRequiredToSetDataKey(
        address controlledContract,
        bytes32 controllerPermissions,
        bytes32 inputDataKey,
        bytes memory inputDataValue
    ) internal view virtual returns (bytes32) {
        // AddressPermissions[] or AddressPermissions[index]
        if (bytes16(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY_PREFIX) {
            // this is our best attempt to save gas to avoid reading the `target` storage multiple times
            // to know if we need the permission `ADDCONTROLLER` or `EDITPERMISSIONS`.
            // Even if `getData(...)` is `view`, multiple external calls to fetch values from storage add to the total gas used.
            bool hasBothAddControllerAndEditPermissions = controllerPermissions
                .hasPermission(
                    _PERMISSION_ADDCONTROLLER | _PERMISSION_EDITPERMISSIONS
                );

            return
                _getPermissionToSetPermissionsArray(
                    controlledContract,
                    inputDataKey,
                    inputDataValue,
                    hasBothAddControllerAndEditPermissions
                );

            // AddressPermissions:...
        } else if (bytes6(inputDataKey) == _LSP6KEY_ADDRESSPERMISSIONS_PREFIX) {
            // same as above, save gas by avoiding redundant or unnecessary external calls to fetch values from the `target` storage.
            bool hasBothAddControllerAndEditPermissions = controllerPermissions
                .hasPermission(
                    _PERMISSION_ADDCONTROLLER | _PERMISSION_EDITPERMISSIONS
                );

            // AddressPermissions:Permissions:<address>
            if (
                bytes12(inputDataKey) ==
                _LSP6KEY_ADDRESSPERMISSIONS_PERMISSIONS_PREFIX
            ) {
                // CHECK that `dataValue` contains exactly 32 bytes, which is the required length for a permission BitArray
                if (inputDataValue.length != 32 && inputDataValue.length != 0) {
                    revert InvalidDataValuesForDataKeys(
                        inputDataKey,
                        inputDataValue
                    );
                }

                // controller already has the permissions needed. Do not run internal function.
                if (hasBothAddControllerAndEditPermissions) return (bytes32(0));

                return
                    _getPermissionToSetControllerPermissions(
                        controlledContract,
                        inputDataKey
                    );

                // AddressPermissions:AllowedCalls:<address>
            } else if (
                bytes12(inputDataKey) ==
                _LSP6KEY_ADDRESSPERMISSIONS_ALLOWEDCALLS_PREFIX
            ) {
                return
                    _getPermissionToSetAllowedCalls(
                        controlledContract,
                        inputDataKey,
                        inputDataValue,
                        hasBothAddControllerAndEditPermissions
                    );

                // AddressPermissions:AllowedERC725YKeys:<address>
            } else if (
                bytes12(inputDataKey) ==
                _LSP6KEY_ADDRESSPERMISSIONS_AllowedERC725YDataKeys_PREFIX
            ) {
                return
                    _getPermissionToSetAllowedERC725YDataKeys(
                        controlledContract,
                        inputDataKey,
                        inputDataValue,
                        hasBothAddControllerAndEditPermissions
                    );

                // if the first 6 bytes of the input data key are "AddressPermissions:..." but did not match
                // with anything above, this is not a standard LSP6 permission data key so we revert.
            } else {
                /**
                 * @dev more permissions types starting with `AddressPermissions:...` can be implemented by overriding this function.
                 *
                 *      // AddressPermissions:MyCustomPermissions:<address>
                 *      bytes10 CUSTOM_PERMISSION_PREFIX = 0x4b80742de2bf9e659ba4
                 *
                 *      if (bytes10(dataKey) == CUSTOM_PERMISSION_PREFIX) {
                 *          // custom logic
                 *      }
                 *
                 *      super._getPermissionRequiredToSetDataKey(...)
                 */
                revert NotRecognisedPermissionKey(inputDataKey);
            }

            // LSP1UniversalReceiverDelegate or LSP1UniversalReceiverDelegate:<typeId>
        } else if (
            inputDataKey == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY ||
            bytes12(inputDataKey) == _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX
        ) {
            // CHECK that `dataValue` contains exactly 20 bytes, which corresponds to an address for a LSP1 Delegate contract
            if (inputDataValue.length != 20 && inputDataValue.length != 0) {
                revert InvalidDataValuesForDataKeys(
                    inputDataKey,
                    inputDataValue
                );
            }

            // same as above. If controller has both permissions, do not read the `target` storage
            // to save gas by avoiding an extra external `view` call.
            if (
                controllerPermissions.hasPermission(
                    _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE |
                        _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE
                )
            ) {
                return bytes32(0);
            }

            return
                _getPermissionToSetLSP1Delegate(
                    controlledContract,
                    inputDataKey
                );

            // LSP17Extension:<bytes4>
        } else if (bytes12(inputDataKey) == _LSP17_EXTENSION_PREFIX) {
            // CHECK that `dataValue` contains exactly 20 or 21 bytes (if setting to forward value), which corresponds to an address for a LSP17 Extension
            if (
                inputDataValue.length != 20 &&
                inputDataValue.length != 21 &&
                inputDataValue.length != 0
            ) {
                revert InvalidDataValuesForDataKeys(
                    inputDataKey,
                    inputDataValue
                );
            }

            // reverts when the address of the Key Manager is being set as extensions for lsp20 functions
            bytes4 selector = bytes4(inputDataKey << 96);

            if (
                (selector == ILSP20CallVerifier.lsp20VerifyCall.selector ||
                    selector == ILSP20CallVerifier.lsp20VerifyCallResult.selector)
            ) {
                if (address(bytes20(inputDataValue)) == address(this)) {
                    revert KeyManagerCannotBeSetAsExtensionForLSP20Functions();
                }
            }

            // same as above. If controller has both permissions, do not read the `target` storage
            // to save gas by avoiding an extra external `view` call.
            if (
                controllerPermissions.hasPermission(
                    _PERMISSION_ADDEXTENSIONS | _PERMISSION_CHANGEEXTENSIONS
                )
            ) {
                return bytes32(0);
            }

            return
                _getPermissionToSetLSP17Extension(
                    controlledContract,
                    inputDataKey
                );
        } else {
            return _PERMISSION_SETDATA;
        }
    }

    /**
     * @dev retrieve the permission required to update the `AddressPermissions[]` array data key defined in LSP6.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param inputDataKey either `AddressPermissions[]` (array length) or `AddressPermissions[index]` (array index)
     * @param inputDataValue the updated value for the `inputDataKey`. MUST be:
     *  - a `uint256` for `AddressPermissions[]` (array length)
     *  - an `address` or `0x` for `AddressPermissions[index]` (array entry).
     *
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetPermissionsArray(
        address controlledContract,
        bytes32 inputDataKey,
        bytes memory inputDataValue,
        bool hasBothAddControllerAndEditPermissions
    ) internal view virtual returns (bytes32) {
        // AddressPermissions[] -> array length
        if (inputDataKey == _LSP6KEY_ADDRESSPERMISSIONS_ARRAY) {
            // CHECK that `dataValue` is exactly 16 bytes long or `0x` (= not set), as the array length of `AddressPermissions[]` MUST be a `uint128` value.
            if (inputDataValue.length != 16 && inputDataValue.length != 0) {
                revert InvalidDataValuesForDataKeys(
                    inputDataKey,
                    inputDataValue
                );
            }

            // if the controller already has both permissions from one of the two required,
            // No permission required as CHECK is already done. We don't need to read `target` storage.
            if (hasBothAddControllerAndEditPermissions) return bytes32(0);

            uint128 newLength = uint128(bytes16(inputDataValue));

            return
                newLength >
                    uint128(
                        bytes16(
                            ERC725Y(controlledContract).getData(inputDataKey)
                        )
                    )
                    ? _PERMISSION_ADDCONTROLLER
                    : _PERMISSION_EDITPERMISSIONS;
        }

        // AddressPermissions[index] -> array index

        // CHECK that we either ADD an address (20 bytes long) or REMOVE an address (0x)
        if (inputDataValue.length != 0 && inputDataValue.length != 20) {
            revert InvalidDataValuesForDataKeys(inputDataKey, inputDataValue);
        }

        // if the controller already has both permissions from one of the two required below,
        // No permission required as CHECK is already done. We don't need to read `target` storage.
        if (hasBothAddControllerAndEditPermissions) return bytes32(0);

        return
            ERC725Y(controlledContract).getData(inputDataKey).length == 0
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to set permissions for a controller address.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param inputPermissionDataKey `AddressPermissions:Permissions:<controller-address>`.
     * @return either ADD or CHANGE PERMISSIONS.
     */
    function _getPermissionToSetControllerPermissions(
        address controlledContract,
        bytes32 inputPermissionDataKey
    ) internal view virtual returns (bytes32) {
        // extract the address of the controller from the data key `AddressPermissions:Permissions:<controller>`
        address controller = address(bytes20(inputPermissionDataKey << 96));

        bytes32 controllerPermissions = ERC725Y(controlledContract)
            .getPermissionsFor(controller);

        return
            // if there is nothing stored under the data key, we are trying to ADD a new controller.
            // if there are already some permissions set under the data key, we are trying to CHANGE the permissions of a controller.
            controllerPermissions == bytes32(0)
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev Retrieve the permission required to set some AllowedCalls for a controller.
     * @param controlledContract The address of the ERC725Y contract from which to fetch the value of `dataKey`.
     * @param dataKey A data key ion the format `AddressPermissions:AllowedCalls:<controller-address>`.
     * @param dataValue The updated value for the `dataKey`. MUST be a bytes32[CompactBytesArray] of Allowed Calls.
     * @return Either ADD or EDIT PERMISSIONS.
     */
    function _getPermissionToSetAllowedCalls(
        address controlledContract,
        bytes32 dataKey,
        bytes memory dataValue,
        bool hasBothAddControllerAndEditPermissions
    ) internal view virtual returns (bytes32) {
        if (!LSP6Utils.isCompactBytesArrayOfAllowedCalls(dataValue)) {
            revert InvalidEncodedAllowedCalls(dataValue);
        }

        // if the controller already has both permissions from one of the two required below,
        // No permission required as CHECK is already done. We don't need to read `target` storage.
        if (hasBothAddControllerAndEditPermissions) return bytes32(0);

        // extract the address of the controller from the data key `AddressPermissions:AllowedCalls:<controller>`
        address controller = address(bytes20(dataKey << 96));

        // if the controller exists and has some permissions set, this is considered as EDIT a "sub-set" of its permissions.
        // (even if the controller does not have any allowed calls set).
        return
            ERC725Y(controlledContract).getPermissionsFor(controller) ==
                bytes32(0)
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev Retrieve the permission required to set some Allowed ERC725Y Data Keys for a controller.
     * @param controlledContract the address of the ERC725Y contract from which to fetch the value of `dataKey`.
     * @param dataKey A data key in the format `AddressPermissions:AllowedERC725YDataKeys:<controller-address>`.
     * @param dataValue The updated value for the `dataKey`. MUST be a bytes[CompactBytesArray] of Allowed ERC725Y Data Keys.
     * @return Either ADD or EDIT PERMISSIONS.
     */
    function _getPermissionToSetAllowedERC725YDataKeys(
        address controlledContract,
        bytes32 dataKey,
        bytes memory dataValue,
        bool hasBothAddControllerAndEditPermissions
    ) internal view virtual returns (bytes32) {
        if (!LSP6Utils.isCompactBytesArrayOfAllowedERC725YDataKeys(dataValue)) {
            revert InvalidEncodedAllowedERC725YDataKeys(
                dataValue,
                "couldn't VALIDATE the data value"
            );
        }

        // if the controller already has both permissions from one of the two required below,
        // CHECK is already done. We don't need to read `target` storage.
        if (hasBothAddControllerAndEditPermissions) return bytes32(0);

        // extract the address of the controller from the data key `AddressPermissions:AllowedERC725YDataKeys:<controller>`
        address controller = address(bytes20(dataKey << 96));

        // if the controller exists and has some permissions set, this is considered as EDIT a "sub-set" of its permissions.
        // (even if the controller does not have any allowed ERC725Y data keys set).
        return
            ERC725Y(controlledContract).getPermissionsFor(controller) ==
                bytes32(0)
                ? _PERMISSION_ADDCONTROLLER
                : _PERMISSION_EDITPERMISSIONS;
    }

    /**
     * @dev retrieve the permission required to either add or change the address
     * of a LSP1 Universal Receiver Delegate stored under a specific LSP1 data key.
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param lsp1DelegateDataKey either the data key for the default `LSP1UniversalReceiverDelegate`,
     * or a data key for a specific `LSP1UniversalReceiverDelegate:<typeId>`, starting with `_LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX`.
     * @return either ADD or CHANGE UNIVERSALRECEIVERDELEGATE.
     */
    function _getPermissionToSetLSP1Delegate(
        address controlledContract,
        bytes32 lsp1DelegateDataKey
    ) internal view virtual returns (bytes32) {
        return
            ERC725Y(controlledContract).getData(lsp1DelegateDataKey).length == 0
                ? _PERMISSION_ADDUNIVERSALRECEIVERDELEGATE
                : _PERMISSION_CHANGEUNIVERSALRECEIVERDELEGATE;
    }

    /**
     * @dev Verify if `controller` has the required permissions to either add or change the address
     * of an LSP0 Extension stored under a specific LSP17Extension data key
     * @param controlledContract the address of the ERC725Y contract where the data key is verified.
     * @param lsp17ExtensionDataKey the dataKey to set with `_LSP17_EXTENSION_PREFIX` as prefix.
     */
    function _getPermissionToSetLSP17Extension(
        address controlledContract,
        bytes32 lsp17ExtensionDataKey
    ) internal view virtual returns (bytes32) {
        return
            ERC725Y(controlledContract).getData(lsp17ExtensionDataKey).length ==
                0
                ? _PERMISSION_ADDEXTENSIONS
                : _PERMISSION_CHANGEEXTENSIONS;
    }

    /**
     * @dev Verify if the `inputKey` is present in the list of `allowedERC725KeysCompacted` for the `controllerAddress`.
     * @param controllerAddress the address of the controller.
     * @param inputDataKey the data key to verify against the allowed ERC725Y Data Keys for the `controllerAddress`.
     * @param allowedERC725YDataKeysCompacted a CompactBytesArray of allowed ERC725Y Data Keys for the `controllerAddress`.
     */
    function _verifyAllowedERC725YSingleKey(
        address controllerAddress,
        bytes32 inputDataKey,
        bytes memory allowedERC725YDataKeysCompacted
    ) internal pure virtual {
        if (allowedERC725YDataKeysCompacted.length == 0)
            revert NoERC725YDataKeysAllowed(controllerAddress);

        /**
         * The pointer will always land on the length of each bytes value:
         *
         * ↓↓↓↓
         * 0003 a00000
         * 0005 fff83a0011
         * 0020 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 0012 bb000000000000000000000000000000beef
         * 0019 cc00000000000000000000000000000000000000000000deed
         * ↑↑↑↑
         *
         */
        uint256 pointer;

        // information extracted from each Allowed ERC725Y Data Key.
        uint256 length;
        bytes32 allowedKey;
        bytes32 mask;

        /**
         * iterate over each data key and update the `pointer` variable with the index where to find the length of each data key.
         *
         * 0x 0003 a00000 0003 fff83a 0020 aa00...00cafe
         *    ↑↑↑↑        ↑↑↑↑        ↑↑↑↑
         *    first   |   second   |  third
         *    length  |   length   |  length
         */
        while (pointer < allowedERC725YDataKeysCompacted.length) {
            // save the length of the allowed data key to calculate the `mask`.
            length = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedERC725YDataKeysCompacted[pointer],
                        allowedERC725YDataKeysCompacted[pointer + 1]
                    )
                )
            );

            /**
             * The length of a data key is 32 bytes.
             * Therefore we can have a fixed allowed data key which has
             * a length of 32 bytes or we can have a dynamic data key
             * which can have a length from 1 up to 31 bytes.
             */
            if (length == 0 || length > 32) {
                revert InvalidEncodedAllowedERC725YDataKeys(
                    allowedERC725YDataKeysCompacted,
                    "couldn't DECODE from storage"
                );
            }

            /**
             * The bitmask discard the last `32 - length` bytes of the input data key via ANDing &
             * It is used to compare only the relevant parts of each input data key against dynamic allowed data keys.
             *
             * E.g.:
             *
             * allowed data key = 0xa00000
             *
             *                compare this part
             *                    vvvvvv
             * input data key = 0xa00000cafecafecafecafecafecafecafe000000000000000000000011223344
             *
             *             &                              discard this part
             *                       vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
             *           mask = 0xffffff0000000000000000000000000000000000000000000000000000000000
             */
            mask =
                bytes32(
                    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
                ) << (8 * (32 - length));

            /*
             * transform the allowed data key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value.
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            // solhint-disable-next-line no-inline-assembly
            assembly {
                // the first 32 bytes word in memory (where allowedERC725YDataKeysCompacted is stored)
                // correspond to the total number of bytes in `allowedERC725YDataKeysCompacted`
                let offset := add(add(pointer, 2), 32)
                let memoryAt := mload(
                    add(allowedERC725YDataKeysCompacted, offset)
                )
                // MLOAD loads 32 bytes word, so we need to keep only the `length` number of bytes that makes up the allowed data key.
                allowedKey := and(memoryAt, mask)
            }

            if (allowedKey == (inputDataKey & mask)) return;

            // move the pointer to the index of the next allowed data key
            unchecked {
                pointer = pointer + (length + 2);
            }
        }

        revert NotAllowedERC725YDataKey(controllerAddress, inputDataKey);
    }

    /**
     * @dev Verify if all the `inputDataKeys` are present in the list of `allowedERC725KeysCompacted` of the `controllerAddress`.
     * @param controllerAddress the address of the controller.
     * @param inputDataKeys the data keys to verify against the allowed ERC725Y Data Keys of the `controllerAddress`.
     * @param allowedERC725YDataKeysCompacted a CompactBytesArray of allowed ERC725Y Data Keys of the `controllerAddress`.
     * @param validatedInputKeysList an array of booleans to store the result of the verification of each data keys checked.
     * @param allowedDataKeysFound the number of data keys that were previously validated for other permissions like `ADDCONTROLLER`, `EDITPERMISSIONS`, etc...
     */
    function _verifyAllowedERC725YDataKeys(
        address controllerAddress,
        bytes32[] memory inputDataKeys,
        bytes memory allowedERC725YDataKeysCompacted,
        bool[] memory validatedInputKeysList,
        uint256 allowedDataKeysFound
    ) internal pure virtual {
        if (allowedERC725YDataKeysCompacted.length == 0)
            revert NoERC725YDataKeysAllowed(controllerAddress);

        // cache the input data keys from the start
        uint256 inputKeysLength = inputDataKeys.length;

        /**
         * The pointer will always land on the length of each bytes value:
         *
         * ↓↓↓↓
         * 0003 a00000
         * 0005 fff83a0011
         * 0020 aa0000000000000000000000000000000000000000000000000000000000cafe
         * 0012 bb000000000000000000000000000000beef
         * 0019 cc00000000000000000000000000000000000000000000deed
         * ↑↑↑↑
         *
         */
        uint256 pointer;

        // information extracted from each Allowed ERC725Y Data Key.
        uint256 length;
        bytes32 allowedKey;
        bytes32 mask;

        /**
         * iterate over each data key and update the `pointer` variable with the index where to find the length of each data key.
         *
         * 0x 0003 a00000 0003 fff83a 0020 aa00...00cafe
         *    ↑↑↑↑        ↑↑↑↑        ↑↑↑↑
         *    first   |   second   |  third
         *    length  |   length   |  length
         */
        while (pointer < allowedERC725YDataKeysCompacted.length) {
            // save the length of the allowed data key to calculate the `mask`.
            length = uint16(
                bytes2(
                    abi.encodePacked(
                        allowedERC725YDataKeysCompacted[pointer],
                        allowedERC725YDataKeysCompacted[pointer + 1]
                    )
                )
            );

            /**
             * The length of a data key is 32 bytes.
             * Therefore we can have a fixed allowed data key which has
             * a length of 32 bytes or we can have a dynamic data key
             * which can have a length from 1 up to 31 bytes.
             */
            if (length == 0 || length > 32) {
                revert InvalidEncodedAllowedERC725YDataKeys(
                    allowedERC725YDataKeysCompacted,
                    "couldn't DECODE from storage"
                );
            }

            /**
             * The bitmask discard the last `32 - length` bytes of the input data key via ANDing &
             * It is used to compare only the relevant parts of each input data key against dynamic allowed data keys.
             *
             * E.g.:
             *
             * allowed data key = 0xa00000
             *
             *                compare this part
             *                    vvvvvv
             * input data key = 0xa00000cafecafecafecafecafecafecafe000000000000000000000011223344
             *
             *             &                              discard this part
             *                       vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
             *           mask = 0xffffff0000000000000000000000000000000000000000000000000000000000
             */
            mask =
                bytes32(
                    0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
                ) << (8 * (32 - length));

            /*
             * transform the allowed data key situated from `pointer + 1` until `pointer + 1 + length` to a bytes32 value.
             * E.g. 0xfff83a -> 0xfff83a0000000000000000000000000000000000000000000000000000000000
             */
            // solhint-disable-next-line no-inline-assembly
            assembly {
                // the first 32 bytes word in memory (where allowedERC725YDataKeysCompacted is stored)
                // correspond to the length of allowedERC725YDataKeysCompacted (= total number of bytes)
                let offset := add(add(pointer, 2), 32)
                let memoryAt := mload(
                    add(allowedERC725YDataKeysCompacted, offset)
                )
                allowedKey := and(memoryAt, mask)
            }

            /**
             * Iterate over the `inputDataKeys` to check them against the allowed data keys.
             * This until we have validated them all.
             */
            for (uint256 ii; ii < inputKeysLength; ) {
                // if the input data key has been marked as allowed previously,
                // SKIP it and move to the next input data key.
                if (validatedInputKeysList[ii]) {
                    unchecked {
                        ++ii;
                    }
                    continue;
                }

                // CHECK if the input data key is allowed.
                if ((inputDataKeys[ii] & mask) == allowedKey) {
                    // if the input data key is allowed, mark it as allowed
                    // and increment the number of allowed keys found.
                    validatedInputKeysList[ii] = true;

                    unchecked {
                        allowedDataKeysFound++;
                    }

                    // Continue checking until all the inputKeys` have been found.
                    if (allowedDataKeysFound == inputKeysLength) return;
                }

                unchecked {
                    ++ii;
                }
            }

            // Move the pointer to the next AllowedERC725YKey
            unchecked {
                pointer = pointer + (length + 2);
            }
        }

        // if we did not find all the input data keys, search for the first not allowed data key to revert.
        for (uint256 jj; jj < inputKeysLength; ) {
            if (!validatedInputKeysList[jj]) {
                revert NotAllowedERC725YDataKey(
                    controllerAddress,
                    inputDataKeys[jj]
                );
            }

            unchecked {
                jj++;
            }
        }
    }

    /**
     * @dev revert if `controller`'s `addressPermissions` doesn't contain `permissionsRequired`
     * @param controller the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address controller,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure virtual {
        if (!LSP6Utils.hasPermission(addressPermissions, permissionRequired)) {
            string memory permissionErrorString = LSP6Utils.getPermissionName(
                permissionRequired
            );
            revert NotAuthorised(controller, permissionErrorString);
        }
    }
}

// packages/lsp6-contracts/contracts/LSP6KeyManagerCore.sol

// interfaces

// modules

// libraries

// errors

/**
 * @title Core implementation of the LSP6 Key Manager standard.
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev This contract acts as a controller for an ERC725 Account.
 *      Permissions for controllers are stored in the ERC725Y storage of the ERC725 Account and can be updated using `setData(...)`.
 *
 * @custom:danger Because of its potential malicious impact on the linked contract, the current implementation of the Key Manager
 * disallows the operation type **[DELEGATECALL](../universal-profile/lsp6-key-manager.md#permissions-value)** operation via the
 * `execute(...)` function of the linked contract.
 */
abstract contract LSP6KeyManagerCore is
    ERC165,
    IERC1271,
    ILSP6KeyManager,
    ILSP20CallVerifier,
    ILSP25ExecuteRelayCall,
    LSP6SetDataModule,
    LSP6ExecuteModule,
    LSP6ExecuteRelayCallModule,
    LSP6OwnershipModule,
    LSP25MultiChannelNonce
{
    using LSP6Utils for *;
    using ECDSA for *;
    using BytesLib for bytes;

    address internal _target;

    mapping(address => bool) internal _reentrancyStatus;

    /**
     * @inheritdoc ILSP6KeyManager
     */
    function target() public view override returns (address) {
        return _target;
    }

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP6 ||
            interfaceId == _INTERFACEID_ERC1271 ||
            interfaceId == _INTERFACEID_LSP20_CALL_VERIFIER ||
            interfaceId == _INTERFACEID_LSP25 ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @inheritdoc ILSP25ExecuteRelayCall
     *
     * @custom:info For more details, see the internal function {`_getNonce`}.
     *
     * @custom:hint A signer can choose its channel number arbitrarily. The recommended practice is to:
     * - use `channelId == 0` for transactions for which the ordering of execution matters.abi
     *
     * _Example: you have two transactions A and B, and transaction A must be executed first and complete successfully before
     * transaction B should be executed)._
     *
     * - use any other `channelId` number for transactions that you want to be order independent (out-of-order execution, execution _"in parallel"_).
     *
     * _Example: you have two transactions A and B. You want transaction B to be executed a) without having to wait for transaction A to complete,
     * or b) regardless if transaction A completed successfully or not.
     */
    function getNonce(
        address from,
        uint128 channelId
    ) public view virtual override returns (uint256) {
        return LSP25MultiChannelNonce._getNonce(from, channelId);
    }

    /**
     * @inheritdoc IERC1271
     *
     * @dev Checks if a signature was signed by a controller that has the permission `SIGN`.
     * If the signer is a controller with the permission `SIGN`, it will return the ERC1271 success value.
     *
     * @return returnedStatus `0x1626ba7e` on success, or `0xffffffff` on failure.
     *
     * @custom:warning This function does not enforce by default the inclusion of the address of this contract in the signature digest.
     * It is recommended that protocols or applications using this contract include the targeted address (= this contract) in the data to sign.
     * To ensure that a signature is valid for a specific LSP6KeyManager and prevent signatures from the same EOA to be replayed
     * across different LSP6KeyManager.
     */
    function isValidSignature(
        bytes32 dataHash,
        bytes memory signature
    ) public view virtual override returns (bytes4 returnedStatus) {
        // if isValidSignature fail, the error is catched in returnedError
        (address recoveredAddress, ECDSA.RecoverError returnedError) = ECDSA
            .tryRecover(dataHash, signature);

        // if recovering throws an error, return the fail value
        if (returnedError != ECDSA.RecoverError.NoError)
            return _ERC1271_FAILVALUE;

        // if the address recovered has SIGN permission return the ERC1271 success value, otherwise the fail value
        return (
            ERC725Y(_target).getPermissionsFor(recoveredAddress).hasPermission(
                _PERMISSION_SIGN
            )
                ? _ERC1271_SUCCESSVALUE
                : _ERC1271_FAILVALUE
        );
    }

    /**
     * @inheritdoc ILSP6KeyManager
     *
     * @custom:events {PermissionsVerified} event when the permissions related to `payload` have been verified successfully.
     */
    function execute(
        bytes calldata payload
    ) public payable virtual override returns (bytes memory) {
        return _execute(msg.value, payload);
    }

    /**
     * @inheritdoc ILSP6KeyManager
     *
     * @custom:events {PermissionsVerified} event for each permissions related to each `payload` that have been verified successfully.
     */
    function executeBatch(
        uint256[] calldata values,
        bytes[] calldata payloads
    ) public payable virtual override returns (bytes[] memory) {
        if (values.length != payloads.length) {
            revert BatchExecuteParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _execute(values[ii], payloads[ii]);

            unchecked {
                ++ii;
            }
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    /**
     * @inheritdoc ILSP25ExecuteRelayCall
     *
     * @dev Allows any address (executor) to execute a payload (= abi-encoded function call), given they have a valid signature from a signer address and a valid `nonce` for this signer.
     * The signature MUST be generated according to the signature format defined by the LSP25 standard.
     *
     * The signer that generated the `signature` MUST be a controller with some permissions on the linked {target}.
     * The `payload` will be executed on the {target} contract once the LSP25 signature and the permissions of the signer have been verified.
     *
     * @custom:events {PermissionsVerified} event when the permissions related to `payload` have been verified successfully.
     *
     * @custom:hint If you are looking to learn how to sign and execute relay transactions via the Key Manager,
     * see our Javascript step by step guide [_"Execute Relay Transactions"_](../../../learn/universal-profile/key-manager/execute-relay-transactions.md).
     * See the LSP6 Standard page for more details on how to
     * [generate a valid signature for Execute Relay Call](../../../standards/universal-profile/lsp6-key-manager.md#how-to-sign-relay-transactions).
     */
    function executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        bytes calldata payload
    ) public payable virtual override returns (bytes memory) {
        return
            _executeRelayCall(
                signature,
                nonce,
                validityTimestamps,
                msg.value,
                payload
            );
    }

    /**
     * @inheritdoc ILSP25ExecuteRelayCall
     *
     * @dev Same as {executeRelayCall} but execute a batch of signed calldata payloads (abi-encoded function calls) in a single transaction.
     *
     * The `signatures` can be from multiple controllers, not necessarily the same controller, as long as each of these controllers
     * that signed have the right permissions related to the calldata `payload` they signed.
     *
     * @custom:requirements
     * - the length of `signatures`, `nonces`, `validityTimestamps`, `values` and `payloads` MUST be the same.
     * - the value sent to this function (`msg.value`) MUST be equal to the sum of all `values` in the batch.
     * There should not be any excess value sent to this function.
     */
    function executeRelayCallBatch(
        bytes[] memory signatures,
        uint256[] calldata nonces,
        uint256[] calldata validityTimestamps,
        uint256[] calldata values,
        bytes[] calldata payloads
    ) public payable virtual override returns (bytes[] memory) {
        if (
            signatures.length != nonces.length ||
            nonces.length != validityTimestamps.length ||
            validityTimestamps.length != values.length ||
            values.length != payloads.length
        ) {
            revert BatchExecuteRelayCallParamsLengthMismatch();
        }

        bytes[] memory results = new bytes[](payloads.length);
        uint256 totalValues;

        for (uint256 ii; ii < payloads.length; ) {
            if ((totalValues += values[ii]) > msg.value) {
                revert LSP6BatchInsufficientValueSent(totalValues, msg.value);
            }

            results[ii] = _executeRelayCall(
                signatures[ii],
                nonces[ii],
                validityTimestamps[ii],
                values[ii],
                payloads[ii]
            );

            unchecked {
                ++ii;
            }
        }

        if (totalValues < msg.value) {
            revert LSP6BatchExcessiveValueSent(totalValues, msg.value);
        }

        return results;
    }

    /**
     * @inheritdoc ILSP20CallVerifier
     *
     * @custom:hint This function can call by any other address than the {`target`}.
     * This allows to verify permissions in a _"read-only"_ manner.
     *
     * Anyone can call this function to verify if the `caller` has the right permissions to perform the abi-encoded function call `data`
     * on the {`target`} contract (while sending `msgValue` alongside the call).
     *
     * If the permissions have been verified successfully and `caller` is authorized, one of the following two LSP20 success value will be returned:
     *  - `0x1a238000`: LSP20 success value **without** post verification (last byte is `0x00`).
     *  - `0x1a238001`: LSP20 success value **with** post-verification (last byte is `0x01`).
     */
    function lsp20VerifyCall(
        address /* requestor */,
        address targetContract,
        address caller,
        uint256 msgValue,
        bytes calldata callData
    ) external virtual override returns (bytes4) {
        bool isSetData = bytes4(callData) == IERC725Y.setData.selector ||
            bytes4(callData) == IERC725Y.setDataBatch.selector;

        // If target is invoking the verification, emit the event and change the reentrancy guard
        if (msg.sender == targetContract) {
            bool reentrancyStatus = _nonReentrantBefore(
                targetContract,
                isSetData,
                caller
            );

            _verifyPermissions(targetContract, caller, false, callData);

            emit PermissionsVerified(caller, msgValue, bytes4(callData));

            // if it's a setData call, do not invoke the `lsp20VerifyCallResult(..)` function
            return
                isSetData || reentrancyStatus
                    ? _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITHOUT_POST_VERIFICATION
                    : _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION;
        }
        /// @dev If a different address is invoking the verification,
        /// do not change the state or emit the event to allow read-only verification
        else {
            bool reentrancyStatus = _reentrancyStatus[targetContract];

            if (reentrancyStatus) {
                _requirePermissions(
                    caller,
                    ERC725Y(targetContract).getPermissionsFor(caller),
                    _PERMISSION_REENTRANCY
                );
            }

            _verifyPermissions(targetContract, caller, false, callData);

            // if it's a setData call, do not invoke the `lsp20VerifyCallResult(..)` function
            return
                isSetData || reentrancyStatus
                    ? _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITHOUT_POST_VERIFICATION
                    : _LSP20_VERIFY_CALL_SUCCESS_VALUE_WITH_POST_VERIFICATION;
        }
    }

    /**
     * @inheritdoc ILSP20CallVerifier
     */
    function lsp20VerifyCallResult(
        bytes32 /* callHash */,
        bytes memory /* callResult */
    ) external virtual override returns (bytes4) {
        // If it's the target calling, set back the reentrancy guard
        // to false, if not return the success value
        if (msg.sender == _target) {
            _nonReentrantAfter(msg.sender);
        }
        return _LSP20_VERIFY_CALL_RESULT_SUCCESS_VALUE;
    }

    function _execute(
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        bool isSetData = bytes4(payload) == IERC725Y.setData.selector ||
            bytes4(payload) == IERC725Y.setDataBatch.selector;

        address targetContract = _target;

        bool reentrancyStatus = _nonReentrantBefore(
            targetContract,
            isSetData,
            msg.sender
        );

        _verifyPermissions(targetContract, msg.sender, false, payload);

        emit PermissionsVerified(msg.sender, msgValue, bytes4(payload));

        bytes memory result = _executePayload(
            targetContract,
            msgValue,
            payload
        );

        if (!reentrancyStatus && !isSetData) {
            _nonReentrantAfter(targetContract);
        }

        return result;
    }

    /**
     * @dev Validate that the `nonce` given for the `signature` signed and the `payload` to execute is valid
     * and conform to the signature format according to the LSP25 standard.
     *
     * @param signature A valid signature for a signer, generated according to the signature format specified in the LSP25 standard.
     * @param nonce The nonce that the signer used to generate the `signature`.
     * @param validityTimestamps Two `uint128` concatenated together, where the left-most `uint128` represent the timestamp from which the transaction can be executed,
     * and the right-most `uint128` represents the timestamp after which the transaction expire.
     * @param payload The abi-encoded function call to execute.
     *
     * @custom:warning Be aware that this function can also throw an error if the `callData` was signed incorrectly (not conforming to the signature format defined in the LSP25 standard).
     * This is because the contract cannot distinguish if the data is signed correctly or not. Instead, it will recover an incorrect signer address from the signature
     * and throw an {InvalidRelayNonce} error with the incorrect signer address as the first parameter.
     */
    function _executeRelayCall(
        bytes memory signature,
        uint256 nonce,
        uint256 validityTimestamps,
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        if (payload.length < 4) {
            revert InvalidPayload(payload);
        }

        address targetContract = _target;

        address signer = LSP25MultiChannelNonce
            ._recoverSignerFromLSP25Signature(
                signature,
                nonce,
                validityTimestamps,
                msgValue,
                payload
            );

        if (!_isValidNonce(signer, nonce)) {
            revert InvalidRelayNonce(signer, nonce, signature);
        }

        // increase nonce after successful verification
        _nonceStore[signer][nonce >> 128]++;

        LSP25MultiChannelNonce._verifyValidityTimestamps(validityTimestamps);

        bool isSetData = bytes4(payload) == IERC725Y.setData.selector ||
            bytes4(payload) == IERC725Y.setDataBatch.selector;

        bool reentrancyStatus = _nonReentrantBefore(
            targetContract,
            isSetData,
            signer
        );

        _verifyPermissions(targetContract, signer, true, payload);

        emit PermissionsVerified(signer, msgValue, bytes4(payload));

        bytes memory result = _executePayload(
            targetContract,
            msgValue,
            payload
        );

        if (!reentrancyStatus && !isSetData) {
            _nonReentrantAfter(targetContract);
        }

        return result;
    }

    /**
     * @notice Execute the `payload` passed to `execute(...)` or `executeRelayCall(...)`
     * @param payload The abi-encoded function call to execute on the {target} contract.
     * @return bytes The data returned by the call made to the linked {target} contract.
     */
    function _executePayload(
        address targetContract,
        uint256 msgValue,
        bytes calldata payload
    ) internal virtual returns (bytes memory) {
        (bool success, bytes memory returnData) = targetContract.call{
            value: msgValue,
            gas: gasleft()
        }(payload);

        bytes memory result = Address.verifyCallResult(
            success,
            returnData,
            "LSP6: failed executing payload"
        );

        return result;
    }

    /**
     * @dev Verify if the `from` address is allowed to execute the `payload` on the {target} contract linked to this Key Manager.
     * @param targetContract The contract that is owned by the Key Manager
     * @param from Either the caller of {execute} or the signer of {executeRelayCall}.
     * @param payload The abi-encoded function call to execute on the {target} contract.
     */
    function _verifyPermissions(
        address targetContract,
        address from,
        bool isRelayedCall,
        bytes calldata payload
    ) internal view virtual {
        bytes32 permissions = ERC725Y(targetContract).getPermissionsFor(from);
        if (permissions == bytes32(0)) revert NoPermissionsSet(from);

        if (isRelayedCall) {
            LSP6ExecuteRelayCallModule._verifyExecuteRelayCallPermission(
                from,
                permissions
            );
        }

        bytes4 erc725Function = bytes4(payload);

        // ERC725Y.setData(bytes32,bytes)
        if (erc725Function == IERC725Y.setData.selector) {
            (bytes32 inputKey, bytes memory inputValue) = abi.decode(
                payload[4:],
                (bytes32, bytes)
            );

            LSP6SetDataModule._verifyCanSetData(
                targetContract,
                from,
                permissions,
                inputKey,
                inputValue
            );

            // ERC725Y.setDataBatch(bytes32[],bytes[])
        } else if (erc725Function == IERC725Y.setDataBatch.selector) {
            (bytes32[] memory inputKeys, bytes[] memory inputValues) = abi
                .decode(payload[4:], (bytes32[], bytes[]));

            LSP6SetDataModule._verifyCanSetData(
                targetContract,
                from,
                permissions,
                inputKeys,
                inputValues
            );

            // ERC725X.execute(uint256,address,uint256,bytes)
        } else if (erc725Function == IERC725X.execute.selector) {
            (
                uint256 operationType,
                address to,
                uint256 value,
                bytes memory callData
            ) = abi.decode(payload[4:], (uint256, address, uint256, bytes));

            LSP6ExecuteModule._verifyCanExecute(
                targetContract,
                from,
                permissions,
                operationType,
                to,
                value,
                callData
            );
        } else if (erc725Function == IERC725X.executeBatch.selector) {
            (
                uint256[] memory operationTypes,
                address[] memory targets,
                uint256[] memory values,
                bytes[] memory callDatas
            ) = abi.decode(
                    payload[4:],
                    (uint256[], address[], uint256[], bytes[])
                );

            if (
                operationTypes.length != targets.length ||
                targets.length != values.length ||
                values.length != callDatas.length
            ) {
                revert ERC725X_ExecuteParametersLengthMismatch();
            }

            if (operationTypes.length == 0) {
                revert ERC725X_ExecuteParametersEmptyArray();
            }

            for (uint256 ii; ii < operationTypes.length; ii++) {
                LSP6ExecuteModule._verifyCanExecute(
                    targetContract,
                    from,
                    permissions,
                    operationTypes[ii],
                    targets[ii],
                    values[ii],
                    callDatas[ii]
                );
            }
        } else if (
            erc725Function == ILSP14Ownable2Step.transferOwnership.selector ||
            erc725Function == ILSP14Ownable2Step.acceptOwnership.selector ||
            erc725Function == ILSP14Ownable2Step.renounceOwnership.selector
        ) {
            LSP6OwnershipModule._verifyOwnershipPermissions(from, permissions);
        } else {
            revert InvalidERC725Function(erc725Function);
        }
    }

    /**
     * @dev Check if we are in the context of a reentrant call, by checking if the reentrancy status is `true`.
     * - If the status is `true`, the caller (or signer for relay call) MUST have the `REENTRANCY` permission. Otherwise, the call is reverted.
     * - If the status is `false`, it is set to `true` only if we are not dealing with a call to the functions `setData` or `setDataBatch`.
     * Used at the beginning of the {`lsp20VerifyCall`}, {`_execute`} and {`_executeRelayCall`} functions, before the methods execution starts.
     *
     */
    function _nonReentrantBefore(
        address targetContract,
        bool isSetData,
        address from
    ) internal virtual returns (bool reentrancyStatus) {
        reentrancyStatus = _reentrancyStatus[targetContract];

        if (reentrancyStatus) {
            // CHECK the caller has REENTRANCY permission
            _requirePermissions(
                from,
                ERC725Y(targetContract).getPermissionsFor(from),
                _PERMISSION_REENTRANCY
            );
        } else {
            if (!isSetData) {
                _reentrancyStatus[targetContract] = true;
            }
        }
    }

    /**
     * @dev Resets the reentrancy status to `false`
     * Used at the end of the {`lsp20VerifyCall`}, {`_execute`} and {`_executeRelayCall`} functions after the functions' execution is terminated.
     */
    function _nonReentrantAfter(address targetContract) internal virtual {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _reentrancyStatus[targetContract] = false;
    }

    /**
     * @dev Check if the `controller` has the `permissionRequired` among its permission listed in `controllerPermissions`
     * If not, this function will revert with the error `NotAuthorised` and the name of the permission missing by the controller.
     * @param controller the caller address
     * @param addressPermissions the caller's permissions BitArray
     * @param permissionRequired the required permission
     */
    function _requirePermissions(
        address controller,
        bytes32 addressPermissions,
        bytes32 permissionRequired
    ) internal pure override(LSP6ExecuteModule, LSP6SetDataModule) {
        LSP6ExecuteModule._requirePermissions(
            controller,
            addressPermissions,
            permissionRequired
        );
    }
}

// packages/lsp6-contracts/contracts/LSP6KeyManagerInitAbstract.sol

// modules

/**
 * @title Proxy implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev All the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
abstract contract LSP6KeyManagerInitAbstract is
    Initializable,
    LSP6KeyManagerCore
{
    function _initialize(address target_) internal virtual onlyInitializing {
        if (target_ == address(0)) revert InvalidLSP6Target();
        _target = target_;
    }
}

// packages/lsp6-contracts/contracts/LSP6KeyManagerInit.sol

// modules

/**
 * @title Proxy implementation of a contract acting as a controller of an ERC725 Account, using permissions stored in the ERC725Y storage
 * @author Fabian Vogelsteller <frozeman>, Jean Cavallera (CJ42), Yamen Merhi (YamenMerhi)
 * @dev All the permissions can be set on the ERC725 Account using `setData(...)` with the keys constants below
 */
contract LSP6KeyManagerInit is LSP6KeyManagerInitAbstract, Version {
    /**
     * @notice Deploying a LSP6KeyManagerInit to be used as base contract behind proxy.
     * @dev Initialize (= lock) base implementation contract on deployment.
     */
    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Initializing a LSP6KeyManagerInit linked to contract at address `target_`.
     * @dev Initialise a LSP6KeyManager and set the `target_` address in the contract storage,
     * making this Key Manager linked to this `target_` contract.
     *
     * @param target_ The address of the contract to control and forward calldata payloads to.
     */
    function initialize(address target_) external virtual initializer {
        LSP6KeyManagerInitAbstract._initialize(target_);
    }
}


// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

/// @title ILSP8Allowlist
/// @dev Interface for managing an allowlist of addresses that can bypass certain restrictions in an LSP8 token contract.
interface ILSP8Allowlist {
    /// @dev Emitted when an address is added to or removed from the allowlist.
    /// @param _address The address affected by the allowlist change.
    /// @param added True if the address was added, false if removed.
    event AllowlistChanged(address indexed _address, bool indexed added);

    /// @notice Adds an address to the allowlist, enabling it to bypass specific restrictions (e.g., transfer locks).
    /// @dev Can only be called by the contract owner.
    /// @custom:events {AllowlistChanged} event with added set to true.
    /// @param _address The address to add to the allowlist.
    function addToAllowlist(address _address) external;

    /// @notice Removes an address from the allowlist, subjecting it to standard restrictions.
    /// @dev Can only be called by the contract owner.
    /// @custom:events {AllowlistChanged} event with added set to false.
    /// @param _address The address to remove from the allowlist.
    function removeFromAllowlist(address _address) external;

    /// @notice Checks if an address is in the allowlist.
    /// @param _address The address to check.
    /// @return True if the address is in the allowlist, false otherwise.
    function isAllowlisted(address _address) external view returns (bool);

    /// @notice Get the number of addresses in the allowlist.
    /// @return The number of addresses in the allowlist.
    function getAllowlistedAddressesLength() external view returns (uint256);

    /// @notice Get the list of addresses in the allowlist within a specified range.
    /// @param startIndex The start index of the range (inclusive).
    /// @param endIndex The end index of the range (exclusive).
    /// @return An array of addresses in the allowlist.
    /// @custom:info To get all the items in the array call `getAllowlistedAddressesLength()` to get the array length (e.g. `allowlistedAddressesLength`) and then call `getAllowlistedAddressesByIndex(0, allowlistedAddressesLength)`
    function getAllowlistedAddressesByIndex(uint256 startIndex, uint256 endIndex)
        external
        view
        returns (address[] memory);
}

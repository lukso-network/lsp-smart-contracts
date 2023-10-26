// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.4;

// interfaces
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

/**
 * @title Interface of the LSP8 - Identifiable Digital Asset standard, a non-fungible digital asset.
 */
interface ILSP8IdentifiableDigitalAsset is IERC165, IERC725Y {
    // --- Events

    /**
     * @dev Emitted when `tokenId` token is transferred from the `from` to the `to` address.
     * @param operator The address of operator that sent the `tokenId`
     * @param from The previous owner of the `tokenId`
     * @param to The new owner of `tokenId`
     * @param tokenId The tokenId that was transferred
     * @param force If the token transfer enforces the `to` recipient address to be a contract that implements the LSP1 standard or not.
     * @param data Any additional data the caller included by the caller during the transfer, and sent in the hooks to the `from` and `to` addresses.
     */
    event Transfer(
        address operator,
        address indexed from,
        address indexed to,
        bytes32 indexed tokenId,
        bool force,
        bytes data
    );

    /**
     * @dev Emitted when `tokenOwner` enables `operator` to transfer or burn the `tokenId`.
     * @param operator The address authorized as an operator.
     * @param tokenOwner The owner of the `tokenId`.
     * @param tokenId The tokenId `operator` address has access on behalf of `tokenOwner`.
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     */
    event AuthorizedOperator(
        address indexed operator,
        address indexed tokenOwner,
        bytes32 indexed tokenId,
        bytes operatorNotificationData
    );

    /**
     * @dev Emitted when `tokenOwner` disables `operator` to transfer or burn `tokenId` on its behalf.
     * @param operator The address revoked from the operator array ({getOperatorsOf}).
     * @param tokenOwner The owner of the `tokenId`.
     * @param tokenId The tokenId `operator` is revoked from operating on.
     * @param notified Bool indicating whether the operator has been notified or not
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     */
    event RevokedOperator(
        address indexed operator,
        address indexed tokenOwner,
        bytes32 indexed tokenId,
        bool notified,
        bytes operatorNotificationData
    );

    // --- Token queries

    /**
     * @dev Returns the number of existing tokens that have been minted in this contract.
     * @return The number of existing tokens.
     */
    function totalSupply() external view returns (uint256);

    // --- Token owner queries

    /**
     * @dev Get the number of token IDs owned by `tokenOwner`.

     * @param tokenOwner The address to query     *
     * @return The total number of token IDs that `tokenOwner` owns.
     */
    function balanceOf(address tokenOwner) external view returns (uint256);

    /**
     * @dev Returns the list of `tokenIds` for the `tokenOwner` address.
     *
     * @param tokenId tokenOwner The address to query owned tokens
     * @return The owner address of the given `tokenId`.
     *
     * @custom:requirements `tokenId` must exist.
     * @custom:info if the `tokenId` is not owned by any address, the returned address will be `address(0)`
     */
    function tokenOwnerOf(bytes32 tokenId) external view returns (address);

    /**
     * @dev Returns the list of token IDs that the `tokenOwner` address owns.
     * @param tokenOwner The address that we want to get the list of token IDs for.
     * @return An array of `bytes32[] tokenIds` owned by `tokenOwner`.
     */
    function tokenIdsOf(
        address tokenOwner
    ) external view returns (bytes32[] memory);

    // --- Operator functionality

    /**
     * @dev Allow an `operator` address to transfer or burn a specific `tokenId` on behalf of its token owner. See {isOperatorFor}.
     * Notify the operator based on the LSP1-UniversalReceiver standard
     *
     * @param operator The address to authorize as an operator.
     * @param tokenId The token ID operator has access to.
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     *
     * @custom:requirements
     * - `tokenId` must exist.
     * - caller MUST be the {tokenOwnerOf} `tokenId`.
     * - the owner of a `tokenId` cannot grant itself as an `operator` (`operator` cannot be the calling address).
     * - `operator` cannot be the zero address.
     *
     * @custom:events {AuthorizedOperator} event.
     */
    function authorizeOperator(
        address operator,
        bytes32 tokenId,
        bytes memory operatorNotificationData
    ) external;

    /**
     * @dev Remove access of `operator` for a given `tokenId`, disallowing it to transfer `tokenId` on behalf of its owner.
     * See also {isOperatorFor}.
     *
     * @param operator The address to revoke as an operator.
     * @param tokenId The tokenId `operator` is revoked from operating on.
     * @param notify Boolean indicating whether to notify the operator or not
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     *
     * @custom:requirements
     * - `tokenId` must exist.
     * - caller must be the {tokenOwnerOf} `tokenId`.
     * - the owner of a `tokenId` cannot grant revoke itself as an `operator` (`operator` cannot be the calling address).
     * - `operator` cannot be the zero address.
     *
     * @custom:events {RevokedOperator} event with address of the operator being revoked for the caller (token owner)..
     */
    function revokeOperator(
        address operator,
        bytes32 tokenId,
        bool notify,
        bytes memory operatorNotificationData
    ) external;

    /**
     * @dev Returns whether `operator` address is an operator for a given `tokenId`.
     *
     * @param operator The address to query operator status for.
     * @param tokenId The token ID to check if `operator` is allowed to operate on.
     *
     * @return `true` if `operator` is an operator for `tokenId`, `false` otherwise.
     *
     * @custom:requirements
     * - `tokenId` must exist.
     * - caller must be the current {tokenOwnerOf} `tokenId`.
     *
     * @custom:info The tokenOwner is its own operator.
     */
    function isOperatorFor(
        address operator,
        bytes32 tokenId
    ) external view returns (bool);

    /**
     * @dev Returns all `operator` addresses that are allowed to transfer or burn a specific `tokenId` on behalf of its owner.
     *
     * @param tokenId The token ID to get the operators for.
     * @return An array of operators allowed to transfer or burn a specific `tokenId`.
     *
     * Requirements
     * - `tokenId` must exist.
     */
    function getOperatorsOf(
        bytes32 tokenId
    ) external view returns (address[] memory);

    // --- Transfer functionality

    /**
     * @dev Transfer a given `tokenId` token from the `from` address to the `to` address.
     *
     * If operators are set for a specific `tokenId`, all the operators are revoked after the tokenId have been transferred.
     *
     * The `force` parameter MUST be set to `true` when transferring tokens to Externally Owned Accounts (EOAs)
     * or contracts that do not implement the LSP1 standard.
     *
     * @param from The address that owns the given `tokenId`.
     * @param to The address that will receive the `tokenId`.
     * @param tokenId The token ID to transfer.
     * @param force When set to `true`, the `to` address CAN be any addres.
     * When set to `false`, the `to` address MUST be a contract that supports the LSP1 UniversalReceiver standard.
     * @param data Any additional data the caller wants included in the emitted event, and sent in the hooks of the `from` and `to` addresses.
     *
     * @custom:requirements
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `from` and `to` cannot be the same address (`from` cannot send the `tokenId` to itself).
     * - `from` must own the given `tokenId`.
     * - If the caller is not `from`, it must be an operator for the `tokenId`.
     *
     * @custom:events
     * - {Transfer} event when the `tokenId` is successfully transferred.
     *
     * @custom:hint The `force` parameter **MUST be set to `true`** to transfer tokens to Externally Owned Accounts (EOAs)
     * or contracts that do not implement the LSP1 Universal Receiver Standard. Otherwise the function will revert making the transfer fail.
     *
     * @custom:info if the `to` address is a contract that implements LSP1, it will always be notified via its `universalReceiver(...)` function, regardless if `force` is set to `true` or `false`.
     *
     * @custom:warning Be aware that when either the sender or the recipient can have logic that revert in their `universalReceiver(...)` function when being notified.
     * This even if the `force` was set to `true`.
     */
    function transfer(
        address from,
        address to,
        bytes32 tokenId,
        bool force,
        bytes memory data
    ) external;

    /**
     * @dev Transfers multiple tokens at once based on the arrays of `from`, `to` and `tokenId`.
     * If any transfer fails, the whole call will revert.
     *
     * @param from An array of sending addresses.
     * @param to An array of recipient addresses.
     * @param tokenId An array of token IDs to transfer.
     * @param force When set to `true`, `to` may be any address.
     * When set to `false`, `to` must be a contract that supports the LSP1 standard and not revert.
     * @param data Any additional data the caller wants included in the emitted event, and sent in the hooks to the `from` and `to` addresses.
     *
     *
     * @custom:requirements
     * - The arrays of `from`, `to` and `tokenId` must have the same length.
     * - no values in the `from` array can be the zero address.
     * - no values in the `to` array can be the zero address.
     * - `from` and `to` cannot be the same address at the same index on each arrays.
     * - each `tokenId` must be owned by `from`.
     * - If the caller is not `from`, it must be an operator of each `tokenId`.
     *
     * @custom:events
     * - {Transfer} events on each successful token transfer.
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        bytes32[] memory tokenId,
        bool[] memory force,
        bytes[] memory data
    ) external;
}

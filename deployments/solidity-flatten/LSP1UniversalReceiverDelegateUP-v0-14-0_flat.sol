// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0 ^0.8.4;

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

// node_modules/@lukso/lsp1-contracts/contracts/ILSP1UniversalReceiverDelegate.sol

/**
 * @title Interface of the LSP1 - Universal Receiver Delegate standard.
 * @dev This interface allows contracts implementing the LSP1UniversalReceiver function to delegate the reaction logic to another contract or account. By doing so, the main logic doesn't need to reside within the `universalReceiver` function itself, offering modularity and flexibility.
 */
interface ILSP1UniversalReceiverDelegate {
    /**
     * @dev A delegate function that reacts to calls forwarded from the `universalReceiver(..)` function. This allows for modular handling of the logic based on the `typeId` and `data` provided by the initial caller.
     * @notice Reacted on received notification forwarded from `universalReceiver` with `typeId` & `data`.
     *
     * @param sender The address of the EOA or smart contract that initially called the `universalReceiver` function.
     * @param value The amount sent by the `sender` to the `universalReceiver` function.
     * @param typeId The hash of a specific standard or a hook.
     * @param data The arbitrary data received with the initial call to `universalReceiver`.
     */
    function universalReceiverDelegate(
        address sender,
        uint256 value,
        bytes32 typeId,
        bytes memory data
    ) external returns (bytes memory);
}

// node_modules/@lukso/lsp7-contracts/contracts/ILSP7DigitalAsset.sol

/**
 * @title Interface of the LSP7 - Digital Asset standard, a fungible digital asset.
 */
interface ILSP7DigitalAsset is IERC165, IERC725Y {
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
     * the `constructor`, the decimals returned wiil be `0`. Otherwise `18` is the common value.
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
     * @dev Removes the `operator` address as an operator of callers tokens, disallowing it to send any amount of tokens
     * on behalf of the token owner (the caller of the function `msg.sender`). See also {authorizedAmountFor}.
     *
     * @param operator The address to revoke as an operator.
     * @param notify Boolean indicating whether to notify the operator or not.
     * @param operatorNotificationData The data to notify the operator about via LSP1.
     *
     * @custom:requirements
     * - `operator` cannot be calling address.
     * - `operator` cannot be the zero address.
     *
     * @custom:events {OperatorRevoked} event with address of the operator being revoked for the caller (token holder).
     */
    function revokeOperator(
        address operator,
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
     * @param subtractedAmount The amount to decrease by in the operator's allowance.
     *
     * @custom:requirements
     *  - `operator` cannot be the zero address.
     *  - `operator` must have allowance for the caller of at least `subtractedAmount`.
     */
    function decreaseAllowance(
        address operator,
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

// node_modules/@lukso/lsp10-contracts/contracts/LSP10Constants.sol

// --- ERC725Y Data Keys

// keccak256('LSP10Vaults[]')
bytes32 constant _LSP10_VAULTS_ARRAY_KEY = 0x55482936e01da86729a45d2b87a6b1d3bc582bea0ec00e38bdb340e3af6f9f06;

// bytes10(keccak256('LSP10VaultsMap'))
bytes10 constant _LSP10_VAULTS_MAP_KEY_PREFIX = 0x192448c3c0f88c7f238c;

// node_modules/@lukso/lsp1-contracts/contracts/LSP1Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP1 = 0x6bb56a14;
bytes4 constant _INTERFACEID_LSP1_DELEGATE = 0xa245bbda;

// --- ERC725Y Data Keys

// bytes10(keccak256('LSP1UniversalReceiverDelegate'))
bytes10 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_PREFIX = 0x0cfc51aec37c55a4d0b1;

// keccak256('LSP1UniversalReceiverDelegate')
bytes32 constant _LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY = 0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47;

// packages/lsp1delegate-contracts/contracts/LSP1Errors.sol

/**
 * @dev Reverts when EOA calls the {universalReceiver(..)} function with an asset/vault typeId.
 * @notice EOA: `caller` cannot be registered as an asset.
 *
 * @param caller The address of the EOA
 */
error CannotRegisterEOAsAsAssets(address caller);

// node_modules/@lukso/lsp5-contracts/contracts/LSP5Constants.sol

// --- ERC725Y Data Keys

// keccak256('LSP5ReceivedAssets[]')
bytes32 constant _LSP5_RECEIVED_ASSETS_ARRAY_KEY = 0x6460ee3c0aac563ccbf76d6e1d07bada78e3a9514e6382b736ed3f478ab7b90b;

// bytes10(keccak256('LSP5ReceivedAssetsMap'))
bytes10 constant _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX = 0x812c4334633eb816c80d;

// node_modules/@lukso/lsp7-contracts/contracts/LSP7Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP7 = 0xb3c4928f;

// --- Token Hooks

// keccak256('LSP7Tokens_SenderNotification')
bytes32 constant _TYPEID_LSP7_TOKENSSENDER = 0x429ac7a06903dbc9c13dfcb3c9d11df8194581fa047c96d7a4171fc7402958ea;

// keccak256('LSP7Tokens_RecipientNotification')
bytes32 constant _TYPEID_LSP7_TOKENSRECIPIENT = 0x20804611b3e2ea21c480dc465142210acf4a2485947541770ec1fb87dee4a55c;

// keccak256('LSP7Tokens_OperatorNotification')
bytes32 constant _TYPEID_LSP7_TOKENOPERATOR = 0x386072cc5a58e61263b434c722725f21031cd06e7c552cfaa06db5de8a320dbc;

// node_modules/@lukso/lsp8-contracts/contracts/LSP8Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP8 = 0x3a271706;

// --- ERC725Y Data Keys

// keccak256('LSP8TokenIdFormat')
bytes32 constant _LSP8_TOKENID_FORMAT_KEY = 0xf675e9361af1c1664c1868cfa3eb97672d6b1a513aa5b81dec34c9ee330e818d;

// keccak256('LSP8TokenMetadataBaseURI')
bytes32 constant _LSP8_TOKEN_METADATA_BASE_URI = 0x1a7628600c3bac7101f53697f48df381ddc36b9015e7d7c9c5633d1252aa2843;

// keccak256('LSP8ReferenceContract')
bytes32 constant _LSP8_REFERENCE_CONTRACT = 0x708e7b881795f2e6b6c2752108c177ec89248458de3bf69d0d43480b3e5034e6;

// --- Token Hooks

// keccak256('LSP8Tokens_SenderNotification')
bytes32 constant _TYPEID_LSP8_TOKENSSENDER = 0xb23eae7e6d1564b295b4c3e3be402d9a2f0776c57bdf365903496f6fa481ab00;

// keccak256('LSP8Tokens_RecipientNotification')
bytes32 constant _TYPEID_LSP8_TOKENSRECIPIENT = 0x0b084a55ebf70fd3c06fd755269dac2212c4d3f0f4d09079780bfa50c1b2984d;

// keccak256('LSP8Tokens_OperatorNotification')
bytes32 constant _TYPEID_LSP8_TOKENOPERATOR = 0x8a1c15a8799f71b547e08e2bcb2e85257e81b0a07eee2ce6712549eef1f00970;

// --- Token IDs Format

uint256 constant _LSP8_TOKENID_FORMAT_NUMBER = 0;
uint256 constant _LSP8_TOKENID_FORMAT_STRING = 1;
uint256 constant _LSP8_TOKENID_FORMAT_ADDRESS = 2;
uint256 constant _LSP8_TOKENID_FORMAT_UNIQUE_ID = 3;
uint256 constant _LSP8_TOKENID_FORMAT_HASH = 4;

uint256 constant _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_NUMBER = 100;
uint256 constant _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_STRING = 101;
uint256 constant _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_ADDRESS = 102;
uint256 constant _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_UNIQUE_ID = 103;
uint256 constant _LSP8_TOKENID_FORMAT_MIXED_DEFAULT_HASH = 104;

// node_modules/@lukso/lsp9-contracts/contracts/LSP9Constants.sol

// --- ERC165 interface ids
bytes4 constant _INTERFACEID_LSP9 = 0x28af17e6;

// --- ERC725Y Data Keys

// bytes10(keccak256('SupportedStandards')) + bytes2(0) + bytes20(keccak256('LSP9Vault'))
bytes32 constant _LSP9_SUPPORTED_STANDARDS_KEY = 0xeafec4d89fa9619884b600007c0334a14085fefa8b51ae5a40895018882bdb90;

// bytes4(keccak256('LSP9Vault'))
bytes constant _LSP9_SUPPORTED_STANDARDS_VALUE = hex"7c0334a1";

// --- Native Token Type Id

// keccak256('LSP9ValueReceived')
bytes32 constant _TYPEID_LSP9_VALUE_RECEIVED = 0x468cd1581d7bc001c3b685513d2b929b55437be34700410383d58f3aa1ea0abc;

// Ownership Transfer Type IDs

// keccak256('LSP9OwnershipTransferStarted')
bytes32 constant _TYPEID_LSP9_OwnershipTransferStarted = 0xaefd43f45fed1bcd8992f23c803b6f4ec45cf6b62b0d404d565f290a471e763f;

// keccak256('LSP9OwnershipTransferred_SenderNotification')
bytes32 constant _TYPEID_LSP9_OwnershipTransferred_SenderNotification = 0x0c622e58e6b7089ae35f1af1c86d997be92fcdd8c9509652022d41aa65169471;

// keccak256('LSP9OwnershipTransferred_RecipientNotification')
bytes32 constant _TYPEID_LSP9_OwnershipTransferred_RecipientNotification = 0x79855c97dbc259ce395421d933d7bc0699b0f1561f988f09a9e8633fd542fe5c;

// packages/lsp1delegate-contracts/contracts/Version.sol

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
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
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

// node_modules/@lukso/lsp10-contracts/contracts/LSP10Utils.sol

// interfaces

// libraries

// constants

/**
 * @title LSP10 Utility library.
 * @author Yamen Merhi <YamenMerhi>, Jean Cavallera <CJ42>
 * @dev LSP5Utils is a library of functions that can be used to register and manage vaults received by an ERC725Y smart contract.
 * Based on the LSP10 Received Vaults standard.
 */
library LSP10Utils {
    /**
     * @dev Generate an array of data keys/values pairs to be set on the receiver address after receiving vaults.
     *
     * @custom:warning This function returns empty arrays when encountering errors. Otherwise the arrays will contain 3 data keys and 3 data values.
     *
     * @param receiver The address receiving the vault and where the LSP10 data keys should be added.
     * @param vaultAddress The address of the vault being received.
     *
     * @return lsp10DataKeys An array data keys used to update the [LSP-10-ReceivedAssets] data.
     * @return lsp10DataValues An array data values used to update the [LSP-10-ReceivedAssets] data.
     */
    function generateReceivedVaultKeys(
        address receiver,
        address vaultAddress
    )
        internal
        view
        returns (bytes32[] memory lsp10DataKeys, bytes[] memory lsp10DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(receiver);

        /// --- `LSP10Vaults[]` Array ---

        bytes memory currentArrayLengthBytes = getLSP10ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP10Vaults[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(currentArrayLengthBytes)) {
            if (currentArrayLengthBytes.length == 0) {
                // if it's the first vault received and nothing is set (= 0x)
                // we need to convert it to: `0x00000000000000000000000000000000`
                // to safely cast to a uint128 of length 0
                currentArrayLengthBytes = abi.encodePacked(bytes16(0));
            } else {
                // otherwise the array length is invalid
                return (lsp10DataKeys, lsp10DataValues);
            }
        }

        uint128 currentArrayLength = uint128(bytes16(currentArrayLengthBytes));

        // CHECK for potential overflow
        if (currentArrayLength == type(uint128).max) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        // --- `LSP10VaultsMap:<vaultAddress>` ---

        bytes32 mapDataKey = LSP2Utils.generateMappingKey(
            _LSP10_VAULTS_MAP_KEY_PREFIX,
            bytes20(vaultAddress)
        );

        // CHECK that the map value is not already set in the storage for the newly received vault
        // If that's the case, the vault is already registered. Do not try to update.
        if (erc725YContract.getData(mapDataKey).length != 0) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        /// --- LSP10 Data Keys & Values ---

        lsp10DataKeys = new bytes32[](3);
        lsp10DataValues = new bytes[](3);

        // Increment `LSP10Vaults[]` Array length
        lsp10DataKeys[0] = _LSP10_VAULTS_ARRAY_KEY;
        lsp10DataValues[0] = abi.encodePacked(currentArrayLength + 1);

        // Add asset address to `LSP10Vaults[index]`, where index == previous array length
        lsp10DataKeys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP10_VAULTS_ARRAY_KEY,
            currentArrayLength
        );
        lsp10DataValues[1] = abi.encodePacked(vaultAddress);

        // Add interfaceId + index as value under `LSP10VaultsMap:<vaultAddress>`
        lsp10DataKeys[2] = mapDataKey;
        lsp10DataValues[2] = bytes.concat(
            _INTERFACEID_LSP9,
            currentArrayLengthBytes
        );
    }

    /**
     * @dev Generate an array of data key/value pairs to be set on the sender address after sending vaults.
     *
     * @custom:warning Returns empty arrays when encountering errors. Otherwise the arrays must have at least 3 data keys and 3 data values.
     *
     * @param sender The address sending the vault and where the LSP10 data keys should be updated.
     * @param vaultAddress The address of the vault that is being sent.
     *
     * @return lsp10DataKeys An array data keys used to update the [LSP-10-ReceivedAssets] data.
     * @return lsp10DataValues An array data values used to update the [LSP-10-ReceivedAssets] data.
     */
    function generateSentVaultKeys(
        address sender,
        address vaultAddress
    )
        internal
        view
        returns (bytes32[] memory lsp10DataKeys, bytes[] memory lsp10DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(sender);

        // --- `LSP10Vaults[]` Array ---

        bytes memory newArrayLengthBytes = getLSP10ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP10Vaults[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(newArrayLengthBytes)) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        // CHECK for potential underflow
        if (
            newArrayLengthBytes.length == 0 ||
            bytes16(newArrayLengthBytes) == bytes16(0)
        ) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        uint128 newArrayLength = uint128(bytes16(newArrayLengthBytes)) - 1;

        // --- `LSP10VaultssMap:<vaultAddress>` ---

        bytes32 removedElementMapKey = LSP2Utils.generateMappingKey(
            _LSP10_VAULTS_MAP_KEY_PREFIX,
            bytes20(vaultAddress)
        );

        // Query the ERC725Y storage of the LSP0-ERC725Account
        bytes memory mapValue = erc725YContract.getData(removedElementMapKey);

        // CHECK if no map value was set for the vault to remove.
        // If that's the case, there is nothing to remove. Do not try to update.
        if (mapValue.length != 20) {
            return (lsp10DataKeys, lsp10DataValues);
        }

        // Extract index of vault to remove from the map value
        uint128 removedElementIndex = uint128(bytes16(bytes20(mapValue) << 32));

        bytes32 removedElementIndexKey = LSP2Utils
            .generateArrayElementKeyAtIndex(
                _LSP10_VAULTS_ARRAY_KEY,
                uint128(removedElementIndex)
            );

        if (removedElementIndex == newArrayLength) {
            return
                LSP2Utils.removeLastElementFromArrayAndMap(
                    _LSP10_VAULTS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementMapKey
                );
        } else if (removedElementIndex < newArrayLength) {
            return
                LSP2Utils.removeElementFromArrayAndMap(
                    erc725YContract,
                    _LSP10_VAULTS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementIndex,
                    removedElementMapKey
                );
        } else {
            // If index is bigger than the array length, out of bounds
            return (lsp10DataKeys, lsp10DataValues);
        }
    }

    /**
     * @dev Get the raw bytes value stored under the `_LSP10_VAULTS_ARRAY_KEY`.
     * @param erc725YContract The contract to query the ERC725Y storage from.
     * @return The raw bytes value stored under this data key.
     */
    function getLSP10ArrayLengthBytes(
        IERC725Y erc725YContract
    ) internal view returns (bytes memory) {
        return erc725YContract.getData(_LSP10_VAULTS_ARRAY_KEY);
    }
}

// node_modules/@lukso/lsp5-contracts/contracts/LSP5Utils.sol

// interfaces

// libraries

// constants

/**
 * @title LSP5 Utility library.
 * @author Yamen Merhi <YamenMerhi>, Jean Cavallera <CJ42>
 * @dev LSP5Utils is a library of functions that can be used to register and manage assets under an ERC725Y smart contract.
 * Based on the LSP5 Received Assets standard.
 */
library LSP5Utils {
    /**
     * @dev Generate an array of data key/value pairs to be set on the receiver address after receiving assets.
     *
     * @custom:warning Returns empty arrays when encountering errors. Otherwise the arrays must have 3 data keys and 3 data values.
     *
     * @param receiver The address receiving the asset and where the LSP5 data keys should be added.
     * @param assetAddress The address of the asset being received (_e.g: an LSP7 or LSP8 token_).
     * @param assetInterfaceId The interfaceID of the asset being received.
     *
     * @return lsp5DataKeys An array Data Keys used to update the [LSP-5-ReceivedAssets] data.
     * @return lsp5DataValues An array Data Values used to update the [LSP-5-ReceivedAssets] data.
     */
    function generateReceivedAssetKeys(
        address receiver,
        address assetAddress,
        bytes4 assetInterfaceId
    )
        internal
        view
        returns (bytes32[] memory lsp5DataKeys, bytes[] memory lsp5DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(receiver);

        // --- `LSP5ReceivedAssets[]` Array ---

        bytes memory currentArrayLengthBytes = getLSP5ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP5ReceivedAssets[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(currentArrayLengthBytes)) {
            if (currentArrayLengthBytes.length == 0) {
                // if it's the first asset received and nothing is set (= 0x)
                // we need to convert it to: `0x00000000000000000000000000000000`
                // to safely cast to a uint128 of length 0
                currentArrayLengthBytes = abi.encodePacked(bytes16(0));
            } else {
                // otherwise the array length is invalid
                return (lsp5DataKeys, lsp5DataValues);
            }
        }

        uint128 currentArrayLength = uint128(bytes16(currentArrayLengthBytes));

        // CHECK for potential overflow
        if (currentArrayLength == type(uint128).max) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // --- `LSP5ReceivedAssetsMap:<assetAddress>` ---

        bytes32 mapDataKey = LSP2Utils.generateMappingKey(
            _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX,
            bytes20(assetAddress)
        );

        // CHECK that the map value is not already set in the storage for the newly received asset
        // If that's the case, the asset is already registered. Do not try to update.
        if (erc725YContract.getData(mapDataKey).length != 0) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // --- LSP5 Data Keys & Values ---

        lsp5DataKeys = new bytes32[](3);
        lsp5DataValues = new bytes[](3);

        // Increment `LSP5ReceivedAssets[]` Array length
        lsp5DataKeys[0] = _LSP5_RECEIVED_ASSETS_ARRAY_KEY;
        lsp5DataValues[0] = abi.encodePacked(currentArrayLength + 1);

        // Add asset address to `LSP5ReceivedAssets[index]`, where index == previous array length
        lsp5DataKeys[1] = LSP2Utils.generateArrayElementKeyAtIndex(
            _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
            currentArrayLength
        );
        lsp5DataValues[1] = abi.encodePacked(assetAddress);

        // Add interfaceId + index as value under `LSP5ReceivedAssetsMap:<assetAddress>`
        lsp5DataKeys[2] = mapDataKey;
        lsp5DataValues[2] = bytes.concat(
            assetInterfaceId,
            currentArrayLengthBytes
        );
    }

    /**
     * @dev Generate an array of Data Key/Value pairs to be set on the sender address after sending assets.
     *
     * @custom:warning Returns empty arrays when encountering errors. Otherwise the arrays must have at least 3 data keys and 3 data values.
     *
     * @param sender The address sending the asset and where the LSP5 data keys should be updated.
     * @param assetAddress The address of the asset that is being sent.
     *
     * @return lsp5DataKeys An array Data Keys used to update the [LSP-5-ReceivedAssets] data.
     * @return lsp5DataValues An array Data Values used to update the [LSP-5-ReceivedAssets] data.
     */
    function generateSentAssetKeys(
        address sender,
        address assetAddress
    )
        internal
        view
        returns (bytes32[] memory lsp5DataKeys, bytes[] memory lsp5DataValues)
    {
        IERC725Y erc725YContract = IERC725Y(sender);

        // --- `LSP5ReceivedAssets[]` Array ---

        bytes memory newArrayLengthBytes = getLSP5ArrayLengthBytes(
            erc725YContract
        );

        // CHECK that the value of `LSP5ReceivedAssets[]` Array length is a valid `uint128` (16 bytes long)
        if (!LSP2Utils.isValidLSP2ArrayLengthValue(newArrayLengthBytes)) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // CHECK for potential underflow
        if (bytes16(newArrayLengthBytes) == bytes16(0)) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        uint128 newArrayLength = uint128(bytes16(newArrayLengthBytes)) - 1;

        // --- `LSP5ReceivedAssetsMap:<assetAddress>` ---

        bytes32 removedElementMapKey = LSP2Utils.generateMappingKey(
            _LSP5_RECEIVED_ASSETS_MAP_KEY_PREFIX,
            bytes20(assetAddress)
        );

        // Query the ERC725Y storage of the LSP0-ERC725Account
        bytes memory mapValue = erc725YContract.getData(removedElementMapKey);

        // CHECK if no map value was set for the asset to remove.
        // If that's the case, there is nothing to remove. Do not try to update.
        if (mapValue.length != 20) {
            return (lsp5DataKeys, lsp5DataValues);
        }

        // Extract index of asset to remove from the map value
        uint128 removedElementIndex = uint128(bytes16(bytes20(mapValue) << 32));

        bytes32 removedElementIndexKey = LSP2Utils
            .generateArrayElementKeyAtIndex(
                _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
                removedElementIndex
            );

        if (removedElementIndex == newArrayLength) {
            return
                LSP2Utils.removeLastElementFromArrayAndMap(
                    _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementMapKey
                );
        } else if (removedElementIndex < newArrayLength) {
            return
                LSP2Utils.removeElementFromArrayAndMap(
                    erc725YContract,
                    _LSP5_RECEIVED_ASSETS_ARRAY_KEY,
                    newArrayLength,
                    removedElementIndexKey,
                    removedElementIndex,
                    removedElementMapKey
                );
        } else {
            // If index is bigger than the array length, out of bounds
            return (lsp5DataKeys, lsp5DataValues);
        }
    }

    /**
     * @dev Get the raw bytes value stored under the `_LSP5_RECEIVED_ASSETS_ARRAY_KEY`.
     * @param erc725YContract The contract to query the ERC725Y storage from.
     * @return The raw bytes value stored under this data key.
     */
    function getLSP5ArrayLengthBytes(
        IERC725Y erc725YContract
    ) internal view returns (bytes memory) {
        return erc725YContract.getData(_LSP5_RECEIVED_ASSETS_ARRAY_KEY);
    }
}

// packages/lsp1delegate-contracts/contracts/LSP1UniversalReceiverDelegateUP.sol

// interfaces

// modules

// libraries

// constants

// errors

/**
 * @title Implementation of a UniversalReceiverDelegate for the [LSP-0-ERC725Account]
 * @author Fabian Vogelsteller, Yamen Merhi, Jean Cavallera
 * @dev The {LSP1UniversalReceiverDelegateUP} follows the [LSP-1-UniversalReceiver] standard and is designed
 * for [LSP-0-ERC725Account] contracts.
 *
 * The {LSP1UniversalReceiverDelegateUP} is a contract called by the {universalReceiver(...)} function of the [LSP-0-ERC725Account] contract that:
 *
 * - Writes the data keys representing assets received from type [LSP-7-DigitalAsset] and [LSP-8-IdentifiableDigitalAsset] into the account storage, and removes them when the balance is zero according to the [LSP-5-ReceivedAssets] Standard.
 * - Writes the data keys representing the owned vaults from type [LSP-9-Vault] into your account storage, and removes them when transferring ownership to other accounts according to the [LSP-10-ReceivedVaults] Standard.
 *
 */
contract LSP1UniversalReceiverDelegateUP is
    ERC165,
    Version,
    ILSP1UniversalReceiverDelegate
{
    using ERC165Checker for address;

    /**
     * @dev When receiving notifications about:
     * - LSP7 Tokens sent or received
     * - LSP8 Tokens sent or received
     * - LSP9 Vaults sent or received
     * The notifier should be either the LSP7 or LSP8 or LSP9 contract.
     *
     * We revert to avoid registering the EOA as asset (spam protection)
     * if we received a typeId associated with tokens or vaults transfers.
     *
     * @param notifier The address that notified.
     */
    modifier notEOA(address notifier) {
        // solhint-disable-next-line avoid-tx-origin
        if (notifier == tx.origin) {
            revert CannotRegisterEOAsAsAssets(notifier);
        }
        _;
    }

    /**
     * @dev
     * 1. Writes the data keys of the received [LSP-7-DigitalAsset], [LSP-8-IdentifiableDigitalAsset] and [LSP-9-Vault] contract addresses into the account storage according to the [LSP-5-ReceivedAssets] and [LSP-10-ReceivedVaults] Standard.
     * 2. The data keys representing an asset/vault are cleared when the asset/vault is no longer owned by the account.
     *
     * @notice Reacted on received notification with `typeId`.
     *
     * @custom:warning When the data stored in the ERC725Y storage of the LSP0 contract is corrupted (_e.g: ([LSP-5-ReceivedAssets]'s Array length not 16 bytes long, the token received is already registered in `LSP5ReceivetAssets[]`, the token being sent is not sent as full balance, etc...), the function call will still pass and return (**not revert!**) and not modify any data key on the storage of the [LSP-0-ERC725Account].
     *
     * @custom:requirements
     * - This contract should be allowed to use the {setDataBatch(...)} function in order to update the LSP5 and LSP10 Data Keys.
     * - Cannot accept native tokens
     *
     * @custom:info
     * - If some issues occured with generating the `dataKeys` or `dataValues` the `returnedMessage` will be an error message, otherwise it will be empty.
     * - If an error occured when trying to use `setDataBatch(dataKeys,dataValues)`, it will return the raw error data back to the caller.
     *
     * @param typeId Unique identifier for a specific notification.
     * @return The result of the reaction for `typeId`.
     */
    function universalReceiverDelegate(
        address notifier,
        uint256 /*value*/,
        bytes32 typeId,
        bytes memory /* data */
    ) public virtual override returns (bytes memory) {
        if (typeId == _TYPEID_LSP7_TOKENSSENDER) {
            return _tokenSender(notifier);
        }

        if (typeId == _TYPEID_LSP7_TOKENSRECIPIENT) {
            return _tokenRecipient(notifier, _INTERFACEID_LSP7);
        }

        if (typeId == _TYPEID_LSP8_TOKENSSENDER) {
            return _tokenSender(notifier);
        }

        if (typeId == _TYPEID_LSP8_TOKENSRECIPIENT) {
            return _tokenRecipient(notifier, _INTERFACEID_LSP8);
        }

        if (typeId == _TYPEID_LSP9_OwnershipTransferred_SenderNotification) {
            return _vaultSender(notifier);
        }

        if (typeId == _TYPEID_LSP9_OwnershipTransferred_RecipientNotification) {
            return _vaultRecipient(notifier);
        }

        return "LSP1: typeId out of scope";
    }

    /**
     * @dev Handler for LSP7 and LSP8 token sender type id.
     *
     * @custom:info
     * - Tries to generate LSP5 data key/value pairs for removing asset from the ERC725Y storage.
     * - Tries to use `setDataBatch(bytes32[],bytes[])` if generated proper LSP5 data key/value pairs.
     * - Does not revert. But returns an error message. Use off-chain lib to get even more info.
     *
     * @param notifier The LSP7 or LSP8 token address.
     */
    function _tokenSender(
        address notifier
    ) internal notEOA(notifier) returns (bytes memory) {
        // if the amount sent is not the full balance, then do not update the keys
        try ILSP7DigitalAsset(notifier).balanceOf(msg.sender) returns (
            uint256 balance
        ) {
            if (balance != 0) {
                return "LSP1: full balance is not sent";
            }
        } catch {
            return "LSP1: `balanceOf(address)` function not found";
        }

        (bytes32[] memory dataKeys, bytes[] memory dataValues) = LSP5Utils
            .generateSentAssetKeys(msg.sender, notifier);

        // `generateSentAssetKeys(...)` returns empty arrays when encountering errors
        if (dataKeys.length == 0 && dataValues.length == 0) {
            return "LSP5: Error generating data key/value pairs";
        }

        // Set the LSP5 generated data keys on the account
        return _setDataBatchWithoutReverting(dataKeys, dataValues);
    }

    /**
     * @dev Handler for LSP7 and LSP8 token recipient type id.
     *
     * @custom:info
     * - Tries to generate LSP5 data key/value pairs for adding asset to the ERC725Y storage.
     * - Tries to use `setDataBatch(bytes32[],bytes[])` if generated proper LSP5 data key/value pairs.
     * - Does not revert. But returns an error message. Use off-chain lib to get even more info.
     *
     * @param notifier The LSP7 or LSP8 token address.
     * @param interfaceId The LSP7 or LSP8 interface id.
     */
    function _tokenRecipient(
        address notifier,
        bytes4 interfaceId
    ) internal notEOA(notifier) returns (bytes memory) {
        // CHECK balance only when the Token contract is already deployed,
        // not when tokens are being transferred on deployment through the `constructor`
        if (notifier.code.length != 0) {
            // if the amount sent is 0, then do not update the keys
            try ILSP7DigitalAsset(notifier).balanceOf(msg.sender) returns (
                uint256 balance
            ) {
                if (balance == 0) {
                    return "LSP1: balance is zero";
                }
            } catch {
                return "LSP1: `balanceOf(address)` function not found";
            }
        }

        (bytes32[] memory dataKeys, bytes[] memory dataValues) = LSP5Utils
            .generateReceivedAssetKeys(msg.sender, notifier, interfaceId);

        // `generateReceivedAssetKeys(...)` returns empty arrays when encountering errors
        if (dataKeys.length == 0 && dataValues.length == 0) {
            return "LSP5: Error generating data key/value pairs";
        }

        // Set the LSP5 generated data keys on the account
        return _setDataBatchWithoutReverting(dataKeys, dataValues);
    }

    /**
     * @dev Handler for LSP9 vault sender type id.
     *
     * @custom:info
     * - Tries to generate LSP10 data key/value pairs for removing vault from the ERC725Y storage.
     * - Tries to use `setDataBatch(bytes32[],bytes[])` if generated proper LSP10 data key/value pairs.
     * - Does not revert. But returns an error message. Use off-chain lib to get even more info.
     *
     * @param notifier The LSP9 vault address.
     */
    function _vaultSender(
        address notifier
    ) internal notEOA(notifier) returns (bytes memory) {
        (bytes32[] memory dataKeys, bytes[] memory dataValues) = LSP10Utils
            .generateSentVaultKeys(msg.sender, notifier);

        // `generateSentVaultKeys(...)` returns empty arrays when encountering errors
        if (dataKeys.length == 0 && dataValues.length == 0) {
            return "LSP10: Error generating data key/value pairs";
        }

        // Set the LSP10 generated data keys on the account
        return _setDataBatchWithoutReverting(dataKeys, dataValues);
    }

    /**
     * @dev Handler for LSP9 vault recipient type id.
     *
     * @custom:info
     * - Tries to generate LSP5 data key/value pairs for adding vault to the ERC725Y storage.
     * - Tries to use `setDataBatch(bytes32[],bytes[])` if generated proper LSP5 data key/value pairs.
     * - Does not revert. But returns an error message. Use off-chain lib to get even more info.
     *
     * @param notifier The LSP9 vault address.
     */
    function _vaultRecipient(
        address notifier
    ) internal notEOA(notifier) returns (bytes memory) {
        (bytes32[] memory dataKeys, bytes[] memory dataValues) = LSP10Utils
            .generateReceivedVaultKeys(msg.sender, notifier);

        // `generateReceivedVaultKeys(...)` returns empty arrays when encountering errors
        if (dataKeys.length == 0 && dataValues.length == 0) {
            return "LSP10: Error generating data key/value pairs";
        }

        // Set the LSP10 generated data keys on the account
        return _setDataBatchWithoutReverting(dataKeys, dataValues);
    }

    /**
     * @dev Calls `bytes4(keccak256(setDataBatch(bytes32[],bytes[])))` without checking for `bool success`, but it returns all the data back.
     *
     * @custom:info If an the low-level transaction revert, the returned data will be forwarded. Th contract that uses this function can use the `Address` library to revert with the revert reason.
     *
     * @param dataKeys Data Keys to be set.
     * @param dataValues Data Values to be set.
     */
    function _setDataBatchWithoutReverting(
        bytes32[] memory dataKeys,
        bytes[] memory dataValues
    ) internal returns (bytes memory) {
        try IERC725Y(msg.sender).setDataBatch(dataKeys, dataValues) {
            return "";
        } catch (bytes memory errorData) {
            return errorData;
        }
    }

    // --- Overrides

    /**
     * @inheritdoc ERC165
     */
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override returns (bool) {
        return
            interfaceId == _INTERFACEID_LSP1_DELEGATE ||
            super.supportsInterface(interfaceId);
    }
}

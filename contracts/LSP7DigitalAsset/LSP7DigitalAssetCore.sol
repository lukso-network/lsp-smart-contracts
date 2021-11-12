// SPDX-License-Identifier: CC0-1.0
pragma solidity ^0.8.0;

// constants
import "./LSP7Constants.sol";
import "../LSP1UniversalReceiver/LSP1Constants.sol";
import "../LSP4DigitalAssetMetadata/LSP4Constants.sol";

// interfaces
import "../LSP1UniversalReceiver/ILSP1UniversalReceiver.sol";
import "./ILSP7DigitalAsset.sol";

// modules
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@erc725/smart-contracts/contracts/ERC725Y.sol";

// library
import "@openzeppelin/contracts/utils/introspection/ERC165Checker.sol";

/**
 * @dev Implementation of a LSP7 compliant contract.
 */
abstract contract LSP7DigitalAssetCore is Context, ILSP7DigitalAsset {
    using EnumerableSet for EnumerableSet.AddressSet;
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using Address for address;

    // --- Storage

    bool internal _isNFT;

    uint256 internal _existingTokens;

    // Mapping from `tokenOwner` to an `amount` of tokens
    mapping(address => uint256) internal _tokenOwnerBalances;

    // Mapping a `tokenOwner` to an `operator` to `amount` of tokens.
    mapping(address => mapping(address => uint256)) internal _operatorAuthorizedAmount;

    // --- Token queries

    /**
     * @dev Returns the number of decimals used to get its user representation.
     *
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {balanceOf} and {transfer}.
     */
    function decimals() public view override returns (uint256) {
        return _isNFT ? 0 : 18;
    }

    /**
     * @dev Returns the number of existing tokens.
     */
    function totalSupply() public view override returns (uint256) {
        return _existingTokens;
    }

    // --- Token owner queries

    /**
     * @dev Returns the number of tokens owned by `tokenOwner`.
     */
    function balanceOf(address tokenOwner) public view override returns (uint256) {
        return _tokenOwnerBalances[tokenOwner];
    }

    // --- Operator functionality

    /**
     * @dev Sets `amount` as the amount of tokens `operator` address has access to from callers tokens.
     *
     * See {isOperatorFor}.
     *
     * Emits an {AuthorizedOperator} event.
     *
     * Requirements
     *
     * - `operator` cannot be calling address.
     * - `operator` cannot be the zero address.
     */
    function authorizeOperator(address operator, uint256 amount) public virtual override {
        _updateOperator(_msgSender(), operator, amount);
    }

    /**
     * @dev Removes `operator` address as an operator of callers tokens.
     *
     * See {isOperatorFor}.
     *
     * Emits a {RevokedOperator} event.
     *
     * Requirements
     *
     * - `operator` cannot be calling address.
     * - `operator` cannot be the zero address.
     */
    function revokeOperator(address operator) public virtual override {
        _updateOperator(_msgSender(), operator, 0);
    }

    /**
     * @dev Changes token `amount` the `operator` has access to from `tokenOwner` tokens. If the
     * amount is zero then the operator is being revoked, otherwise the operator amount is being
     * modified.
     *
     * See {isOperatorFor}.
     *
     * Emits either {AuthorizedOperator} or {RevokedOperator} event.
     *
     * Requirements
     *
     * - `operator` cannot be calling address.
     * - `operator` cannot be the zero address.
     */
    function _updateOperator(
        address tokenOwner,
        address operator,
        uint256 amount
    ) internal virtual {
        require(
            operator != tokenOwner,
            "LSP7: updating operator failed, can not use token owner as operator"
        );
        require(
            operator != address(0),
            "LSP7: updating operator failed, operator can not be zero address"
        );
        require(
            tokenOwner != address(0),
            "LSP7: updating operator failed, can not set operator for zero address"
        );

        _operatorAuthorizedAmount[tokenOwner][operator] = amount;

        if (amount > 0) {
            emit AuthorizedOperator(operator, tokenOwner, amount);
        } else {
            emit RevokedOperator(operator, tokenOwner);
        }
    }

    /**
     * @dev Returns amount of tokens `operator` address has access to from `tokenOwner`.
     * Operators can send and burn tokens on behalf of their owners. The tokenOwner is their own
     * operator.
     */
    function isOperatorFor(address operator, address tokenOwner)
        public
        view
        virtual
        override
        returns (uint256)
    {
        if (tokenOwner == operator) {
            return _tokenOwnerBalances[tokenOwner];
        } else {
            return _operatorAuthorizedAmount[tokenOwner][operator];
        }
    }

    // --- Transfer functionality

    /**
     * @dev Transfers `amount` tokens from `from` to `to`.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `to` cannot be the zero address.
     * - `amount` tokens must be owned by `from`.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * Emits a {Transfer} event.
     */
    function transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual override {
        address operator = _msgSender();
        if (operator != from) {
            uint256 operatorAmount = _operatorAuthorizedAmount[from][operator];
            require(
                operatorAmount >= amount,
                "LSP7: transfer amount exceeds operator authorized amount"
            );
            _updateOperator(from, operator, _operatorAuthorizedAmount[from][operator] - amount);
        }

        _transfer(from, to, amount, force, data);
    }

    /**
     * @dev Transfers many tokens based on the list `from`, `to`, `amount`. If any transfer fails,
     * the call will revert.
     *
     * Requirements:
     *
     * - `from`, `to`, `amount` lists are the same length.
     * - no values in `from` can be the zero address.
     * - no values in `to` can be the zero address.
     * - each `amount` tokens must be owned by `from`.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * Emits {Transfer} event for each transfered token.
     */
    function transferBatch(
        address[] memory from,
        address[] memory to,
        uint256[] memory amount,
        bool force,
        bytes[] memory data
    ) external virtual override {
        require(
            from.length == to.length && from.length == amount.length && from.length == data.length,
            "LSP7: transferBatch list length mismatch"
        );

        for (uint256 i = 0; i < from.length; i++) {
            // using the public transfer function to handle updates to operator authorized amounts
            transfer(from[i], to[i], amount[i], force, data[i]);
        }
    }

    /**
     * @dev Mints `amount` tokens and transfers it to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     *
     * Emits a {Transfer} event.
     */
    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "LSP7: mint to the zero address not allowed");

        address operator = _msgSender();

        _beforeTokenTransfer(address(0), to, amount);

        _tokenOwnerBalances[to] += amount;

        emit Transfer(operator, address(0), to, amount, force, data);

        _notifyTokenReceiver(address(0), to, amount, force, data);
    }

    /**
     * @dev Destroys `amount` tokens.
     *
     * Requirements:
     *
     * - `from` cannot be the zero address.
     * - `from` must have at least `amount` tokens.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * Emits a {Transfer} event.
     */
    function _burn(
        address from,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(from != address(0), "LSP7: burn from the zero address");
        require(
            _tokenOwnerBalances[from] >= amount,
            "LSP7: burn amount exceeds tokenOwner balance"
        );

        address operator = _msgSender();
        if (operator != from) {
            require(
                _operatorAuthorizedAmount[from][operator] >= amount,
                "LSP7: burn amount exceeds operator authorized amount"
            );
            _operatorAuthorizedAmount[from][operator] -= amount;
        }

        _notifyTokenSender(from, address(0), amount, data);

        _beforeTokenTransfer(from, address(0), amount);

        _tokenOwnerBalances[from] -= amount;

        emit Transfer(operator, from, address(0), amount, false, data);
    }

    /**
     * @dev Transfers `amount` tokens from `from` to `to`.
     *
     * Requirements:
     *
     * - `to` cannot be the zero address.
     * - `from` cannot be the zero address.
     * - `from` must have at least `amount` tokens.
     * - If the caller is not `from`, it must be an operator for `from` with access to at least
     * `amount` tokens.
     *
     * Emits a {Transfer} event.
     */
    function _transfer(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual {
        require(from != address(0), "LSP7: transfer from the zero address");
        require(to != address(0), "LSP7: transfer to the zero address");
        require(
            _tokenOwnerBalances[from] >= amount,
            "LSP7: transfer amount exceeds tokenOwner balance"
        );

        address operator = _msgSender();

        _notifyTokenSender(from, to, amount, data);

        _beforeTokenTransfer(from, to, amount);

        _tokenOwnerBalances[from] -= amount;
        _tokenOwnerBalances[to] += amount;

        emit Transfer(operator, from, to, amount, force, data);

        _notifyTokenReceiver(from, to, amount, force, data);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning.
     *
     * Calling conditions:
     *
     * - When `from` and `to` are both non-zero, ``from``'s `amount` tokens will be
     * transferred to `to`.
     * - When `from` is zero, `amount` tokens will be minted for `to`.
     * - When `to` is zero, ``from``'s `amount` tokens will be burned.
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual {
        // tokens being minted
        if (from == address(0)) {
            _existingTokens += amount;
        }

        // tokens being burned
        if (to == address(0)) {
            _existingTokens -= amount;
        }
    }

    /**
     * @dev An attempt is made to notify the token sender about the `amount` tokens changing owners using
     * LSP1 interface.
     */
    function _notifyTokenSender(
        address from,
        address to,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165(from) &&
            ERC165Checker.supportsInterface(from, _LSP1_INTERFACE_ID)
        ) {
            bytes memory packedData = abi.encodePacked(from, to, amount, data);
            ILSP1UniversalReceiver(from).universalReceiver(_LSP7TOKENSSENDER_TYPE_ID, packedData);
        }
    }

    /**
     * @dev An attempt is made to notify the token receiver about the `amount` tokens changing owners
     * using LSP1 interface. When force is FALSE the token receiver MUST support LSP1.
     *
     * The receiver may revert when the token being sent is not wanted.
     */
    function _notifyTokenReceiver(
        address from,
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual {
        if (
            ERC165Checker.supportsERC165(to) &&
            ERC165Checker.supportsInterface(to, _LSP1_INTERFACE_ID)
        ) {
            bytes memory packedData = abi.encodePacked(from, to, amount, data);
            ILSP1UniversalReceiver(to).universalReceiver(_LSP7TOKENSRECIPIENT_TYPE_ID, packedData);
        } else if (!force) {
            if (to.isContract()) {
                revert("LSP7: token receiver contract missing LSP1 interface");
            } else {
                revert("LSP7: token receiver is EOA");
            }
        }
    }
}

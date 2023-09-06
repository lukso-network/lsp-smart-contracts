// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

// interfaces
import {ILSP7DigitalAsset} from "../ILSP7DigitalAsset.sol";

/**
 * @dev LSP7 extension, for compatibility for clients / tools that expect ERC20.
 */
interface ILSP7CompatibleERC20 is ILSP7DigitalAsset {
    /**
     * @dev ERC20 `Transfer` event emitted when `amount` tokens is transferred from `from` to `to`.
     * To provide compatibility with indexing ERC20 events.
     *
     * @param from The sending address
     * @param to The receiving address
     * @param value The amount of tokens transfered.
     */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
     * @dev ERC20 `Approval` event emitted when `owner` enables `spender` for `value` tokens.
     * To provide compatibility with indexing ERC20 events.
     *
     * @param owner The account giving approval
     * @param spender The account receiving approval
     * @param value The amount of tokens `spender` has access to from `owner`
     */
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    /*
     * @dev Transfer function from the ERC20 standard interface.

     * @param to The address receiving tokens.
     * @param amount The amount of tokens to transfer.
     * 
     * @return `true` on successful transfer.
     */
    function transfer(address to, uint256 amount) external returns (bool);

    /*
     * @dev Transfer functions for operators from the ERC20 standard interface.

     * @param from The address sending tokens.
     * @param to The address receiving tokens.
     * @param amount The amount of tokens to transfer.
     * 
     * @return `true` on successful transfer.
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    /*
     * @dev Approval function from th ERC20 standard interface.

     * @param operator The address to approve for `amount`
     * @param amount The amount to approve.
     * 
     * @return `true` on successful approval.
     */
    function approve(address operator, uint256 amount) external returns (bool);

    /*
     * @dev Function to get operator allowance allowed to spend on behalf of `tokenOwner` from the ERC20 standard interface.

     * @param tokenOwner The address of the token owner
     * @param operator The address approved by the `tokenOwner`
     * 
     * @return The amount `operator` is approved by `tokenOwner`
     */
    function allowance(
        address tokenOwner,
        address operator
    ) external view returns (uint256);
}

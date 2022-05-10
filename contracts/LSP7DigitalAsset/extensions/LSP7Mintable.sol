// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// modules
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {LSP7MintableCore} from "./LSP7MintableCore.sol";

/**
 * @title LSP7Mintable
 * @author Jean Cavallera, Yamen Merhi
 * @dev LSP7 extension, mintable.
 */
contract LSP7Mintable is LSP7DigitalAsset, LSP7MintableCore {
    // solhint-disable no-empty-blocks

    /**
     * @notice Sets the token-Metadata and register LSP7InterfaceId
     * @param name_ The name of the token
     * @param symbol_ The symbol of the token
     * @param newOwner_ The owner of the the token-Metadata
     * @param isNFT_ Specify if the LSP7 token is a fungible or non-fungible token
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        bool isNFT_
    ) LSP7DigitalAsset(name_, symbol_, newOwner_, isNFT_) {}

    /**
     * @inheritdoc LSP7MintableCore
     */
    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public override onlyOwner {
        _mint(to, amount, force, data);
    }
}

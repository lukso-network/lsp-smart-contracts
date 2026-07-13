// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.27;

// modules
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {LSP7DigitalAsset} from "../LSP7DigitalAsset.sol";
import {LSP7Burnable} from "../extensions/LSP7Burnable/LSP7Burnable.sol";
import {
    LSP7MintableAbstract
} from "../extensions/LSP7Mintable/LSP7MintableAbstract.sol";
import {
    AccessControlExtendedAbstract
} from "../extensions/AccessControlExtended/AccessControlExtendedAbstract.sol";

/**
 * @title LSP7DigitalAsset deployable preset contract with:
 * - a public {mint} function callable by addresses holding `MINTER_ROLE`.
 * - a public {burn} function callable by any token holder or operator.
 */
contract LSP7Mintable is LSP7MintableAbstract, LSP7Burnable {
    /**
     * @notice Deploying a `LSP7Mintable` token contract.
     * @dev Set the token to be mintable to allow minting more tokens after deployment.
     * @param name_ The name of the token.
     * @param symbol_ The symbol of the token.
     * @param newOwner_ The owner of the token contract.
     * @param lsp4TokenType_ The type of token this digital asset contract represents (`0` = Token, `1` = NFT, `2` = Collection).
     * @param isNonDivisible_ Specify if the LSP7 token is divisible (decimals = 18) or non-divisible (decimals = 0).
     */
    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
        AccessControlExtendedAbstract()
        LSP7MintableAbstract(true)
    {}

    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(LSP7MintableAbstract, LSP7DigitalAsset)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override(LSP7MintableAbstract, LSP7DigitalAsset) {
        LSP7MintableAbstract._mint(to, amount, force, data);
    }

    function _transferOwnership(
        address newOwner
    ) internal virtual override(LSP7MintableAbstract, Ownable) {
        LSP7MintableAbstract._transferOwnership(newOwner);
    }
}

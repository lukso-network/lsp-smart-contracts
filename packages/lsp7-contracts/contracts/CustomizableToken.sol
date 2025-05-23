// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP7DigitalAsset} from "./LSP7DigitalAsset.sol";

// TODO
//can you please write a note to discuss if if we enable the only one per address, feature if mint should also be excluded, as thats always the owner who should be able todo it without allowlist needed IMO

contract CustomizableToken is LSP7DigitalAsset {
    uint256 public immutable MAX_ALLOWED_BALANCE;
    bool public immutable OWNER_ONLY_BURN;

    bool public mintable;
    bool public transferable;
    uint256 public nonTransferableFrom;
    uint256 public nonTransferableUntil;

    // change the number when stopMinting is called
    // if mintable FALSE from the beginning, then maxSupply = totalSupply
    // mint function can use authorized operator
    // number    (optional)
    uint256 public maxSupply;

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 initialMintAmount_,
        uint256 maxAllowedBalance_,
        bool ownerOnlyBurn_,
        bool mintable_,
        bool transferable_,
        uint256 nonTransferableFrom_,
        uint256 nonTransferableUntil_,
        uint256 maxSupply_
    )
        LSP7DigitalAsset(
            name_,
            symbol_,
            newOwner_,
            lsp4TokenType_,
            isNonDivisible_
        )
    {
        if (initialMintAmount_ > maxSupply_) {
            revert("Invalid mint amount, greater than max supply");
        }

        MAX_ALLOWED_BALANCE = maxAllowedBalance_;
        OWNER_ONLY_BURN = ownerOnlyBurn_;

        mintable = mintable_;
        transferable = transferable_;
        nonTransferableFrom = nonTransferableFrom_;
        nonTransferableUntil = nonTransferableUntil_;

        if (!mintable_) {
            maxSupply = initialMintAmount_;
        } else {
            maxSupply = maxSupply_;
        }

        if (initialMintAmount_ > 0) {
            _mint(newOwner_, initialMintAmount_, true, "");
        }
    }

    function mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) public virtual onlyOwner {
        require(mintable, "Minting not allowed");
        require(
            totalSupply() + amount <= maxSupply,
            "Minting not allowed, exceeding max supply"
        );

        _mint(to, amount, force, data);
    }

    function burn(
        address from,
        uint256 amount,
        bytes memory data
    ) public virtual {
        if (OWNER_ONLY_BURN) {
            _checkOwner();
            _burn(from, amount, data);
        } else {
            if (msg.sender != from) {
                _spendAllowance(msg.sender, from, amount);
            }

            _burn(from, amount, data);
        }
    }

    function disableMinting() public virtual onlyOwner {
        mintable = false;
        maxSupply = totalSupply();
    }

    function makeTransferable() public virtual onlyOwner {
        transferable = true;
        nonTransferableFrom = 0;
        nonTransferableUntil = 0;
    }

    function _beforeTokenTransfer(
        address /* from */,
        address to,
        uint256 amount,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual override {
        _checkTransferable();

        // Add whitlistred addresses like, the owner, universal swaps pool or the zero address
        if (MAX_ALLOWED_BALANCE > 0) {
            // CHECK that recipient can only hold 1 single token
            require(
                balanceOf(to) + amount <= MAX_ALLOWED_BALANCE,
                "Maximum allowed balance exeeded"
            );
        }
    }

    function _checkTransferable() internal virtual {
        require(transferable, "Transfer not allowed");

        if (nonTransferableUntil > nonTransferableFrom) {
            require(
                nonTransferableFrom > block.timestamp ||
                    nonTransferableUntil < block.timestamp,
                "Transfer not allowed at the moment"
            );
        }
    }

    // mintable and stopMinting()  ; mintable = true
    // tokens that are only one ownable per up
    // non transferable tokens, for 1month or until revoked makeTransferable()
}

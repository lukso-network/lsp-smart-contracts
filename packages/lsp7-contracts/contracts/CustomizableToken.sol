// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {LSP7Burnable} from "./extensions/LSP7Burnable.sol";
import {LSP7Mintable} from "./presets/LSP7Mintable.sol";

// TODO
//can you please write a note to discuss if if we enable the only one per address, feature if mint should also be excluded, as thats always the owner who should be able todo it without allowlist needed IMO

contract CustomizableToken is LSP7Mintable, LSP7Burnable {
    event AddToAllowlist(address _address);
    event RemoveFromAllowlist(address _address);

    uint256 public immutable MAX_ALLOWED_BALANCE;

    bool public mintable;
    bool public transferable;
    uint256 public nonTransferableFrom;
    uint256 public nonTransferableUntil;

    // change the number when stopMinting is called
    // if mintable FALSE from the beginning, then maxSupply = totalSupply
    // mint function can use authorized operator
    // number    (optional)
    uint256 public maxSupply;

    mapping(address => bool) public allowlist;

    constructor(
        string memory name_,
        string memory symbol_,
        address newOwner_,
        uint256 lsp4TokenType_,
        bool isNonDivisible_,
        uint256 initialMintAmount_,
        uint256 maxAllowedBalance_,
        bool mintable_,
        bool transferable_,
        uint256 nonTransferableFrom_,
        uint256 nonTransferableUntil_,
        uint256 maxSupply_
    ) LSP7Mintable(name_, symbol_, newOwner_, lsp4TokenType_, isNonDivisible_) {
        if (initialMintAmount_ > maxSupply_) {
            revert("Invalid mint amount, greater than max supply");
        }

        allowlist[address(0)] = true;
        allowlist[newOwner_] = true;

        MAX_ALLOWED_BALANCE = maxAllowedBalance_;

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

    function _mint(
        address to,
        uint256 amount,
        bool force,
        bytes memory data
    ) internal virtual override {
        require(mintable, "Minting not allowed");
        require(
            maxSupply == 0 || totalSupply() + amount <= maxSupply,
            "Minting not allowed, exceeding max supply"
        );

        super._mint(to, amount, force, data);
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

    function addToAllowlist(address _address) public onlyOwner {
        allowlist[_address] = true;
        emit AddToAllowlist(_address);
    }

    function removeFromAllowlist(address _address) public onlyOwner {
        allowlist[_address] = false;
        emit RemoveFromAllowlist(_address);
    }

    // TODO if nontransferable, burn should be always allowed
    function _beforeTokenTransfer(
        address /* from */,
        address to,
        uint256 amount,
        bool /* force */,
        bytes memory /* data */
    ) internal virtual override {
        if (allowlist[to]) return;
        _checkTransferable();

        if (MAX_ALLOWED_BALANCE > 0) {
            // CHECK that recipient can only hold x amount of tokens
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
}

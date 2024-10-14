// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../extensions/LSP7Votes.sol";

/**
 * @dev Mock of an LSP7Votes token
 */
contract MyVotingToken is LSP7Votes {
    constructor()
        LSP7DigitalAsset("MyVotingToken", "MYVTKN", msg.sender, 0, false)
        EIP712("MyVotingToken", "1")
    {}

    function mint(address rec, uint256 amount) public {
        _mint(rec, amount, true, "");
    }
}

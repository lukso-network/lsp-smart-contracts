// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import {
    LSP8Votes,
    LSP8IdentifiableDigitalAsset
} from "../extensions/LSP8Votes.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

/**
 * @dev Mock of an LSP8Votes token
 */
contract MyVotingNFT is LSP8Votes {
    constructor()
        LSP8IdentifiableDigitalAsset(
            "MyVotingToken",
            "MYVTKN",
            msg.sender,
            0,
            1
        )
        EIP712("MyVotingToken", "1")
    {}

    function mint(address rec, bytes32 id) public {
        _mint(rec, id, true, "");
    }
}

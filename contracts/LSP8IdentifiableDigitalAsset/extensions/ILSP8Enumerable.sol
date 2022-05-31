// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

// interfaces
import {ILSP8IdentifiableDigitalAsset} from "../ILSP8IdentifiableDigitalAsset.sol";

/**
 * @dev LSP8 extension, adds access to a token id by an index.
 */
interface ILSP8Enumerable is ILSP8IdentifiableDigitalAsset {
    /**
     * @dev Returns a token id at index. See totalSupply() to get total number of minted tokens.
     * @return TokenId or 0x00 if no token exist at the index `index`
     */
    function tokenAt(uint256 index) external view returns (bytes32);
}

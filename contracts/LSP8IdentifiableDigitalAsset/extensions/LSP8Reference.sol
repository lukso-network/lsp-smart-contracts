// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

import {
    LSP8IdentifiableDigitalAsset
} from "../LSP8IdentifiableDigitalAsset.sol";

import {
    IERC725Y
} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// contstants
import {
    _LSP8_REFERENCE_CONTRACT,
    _LSP8_TOKENID_TYPE_KEY,
    _LSP8_TOKENID_TYPE_ADDRESS
} from "../LSP8Constants.sol";

// errors
import {InvalidReferenceAddress} from "../LSP8Errors.sol";

/**
 * @dev LSP8 token extension that verify if the referenced contract address
 * from the tokenId - Address is the same as the contract address of the LSP8 collection.
 */
abstract contract LSP8Reference is LSP8IdentifiableDigitalAsset {
    /**
     * @dev modifier to be included in the mint function.
     *
     * @notice verify if the collection contracts address is the same as the referenced contract address
     * when tokenId is _LSP8_TOKENID_TYPE_ADDRESS.
     *
     * @param tokenId The tokenId - Address of the token.
     */
    modifier onlyReferencedContract(bytes32 tokenId) {
        bytes memory tokenIdType = getData(_LSP8_TOKENID_TYPE_KEY);
        if (
            keccak256(abi.encodePacked(tokenIdType)) ==
            keccak256(abi.encodePacked(bytes32(_LSP8_TOKENID_TYPE_ADDRESS)))
        ) {
            address _tokenIdAddress = address(bytes20(tokenId));
            if (!verifyReference(_tokenIdAddress))
                revert InvalidReferenceAddress(_tokenIdAddress);
        }
        _;
    }

    /**
     * @dev Verifies if the referenced contract address from the tokenId - Address
     * is the same as the contract address of the LSP8 collection.
     *
     * @param tokenIdAddress The tokenId - Address of the token.
     *
     * @return bool True if the referenced contract address is the same as the
     * contract address of the LSP8 collection.
     */
    function verifyReference(
        address tokenIdAddress
    ) public view returns (bool) {
        /// @notice using IERC725Y since its not predictable if the tokenId contract is LSP8 or other LSP.
        IERC725Y tokenIdContract = IERC725Y(tokenIdAddress);
        bytes memory referencedContract = tokenIdContract.getData(
            _LSP8_REFERENCE_CONTRACT
        );
        return
            keccak256(abi.encodePacked(bytes20(referencedContract))) ==
            keccak256(abi.encodePacked(bytes20(address(this))));
    }
}

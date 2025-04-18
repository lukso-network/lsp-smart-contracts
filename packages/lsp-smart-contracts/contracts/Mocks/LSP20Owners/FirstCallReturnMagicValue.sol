// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @title sample contract used for testing
 */
contract FirstCallReturnMagicValue {
    function lsp20VerifyCall(
        address /*caller*/,
        uint256 /*value*/,
        bytes memory /*data*/
    ) external pure returns (bytes4 magicValue) {
        return
            bytes4(
                abi.encodePacked(
                    bytes3(FirstCallReturnMagicValue.lsp20VerifyCall.selector),
                    hex"00"
                )
            );
    }

    /**
     * @dev should not be called
     */
    function lsp20VerifyCallResult(
        bytes32 /*callHash*/,
        bytes memory /*result*/
    ) external pure returns (bytes4) {
        revert("This revert will not be triggered");
    }
}

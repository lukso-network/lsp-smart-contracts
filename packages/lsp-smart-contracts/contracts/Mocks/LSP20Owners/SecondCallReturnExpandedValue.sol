// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @title sample contract used for testing
 */
contract SecondCallReturnExpandedValue {
    function lsp20VerifyCall(
        address /*caller*/,
        uint256 /*value*/,
        bytes memory /*data*/
    ) external pure returns (bytes4 magicValue) {
        return
            bytes4(
                abi.encodePacked(
                    bytes3(
                        SecondCallReturnExpandedValue.lsp20VerifyCall.selector
                    ),
                    hex"01"
                )
            );
    }

    function lsp20VerifyCallResult(
        bytes32 /*callHash*/,
        bytes memory /*result*/
    ) external pure returns (bytes32) {
        return
            bytes32(
                bytes.concat(
                    bytes4(
                        SecondCallReturnExpandedValue
                            .lsp20VerifyCallResult
                            .selector
                    )
                )
            );
    }
}

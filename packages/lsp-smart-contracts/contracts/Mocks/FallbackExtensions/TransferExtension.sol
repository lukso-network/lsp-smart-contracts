// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.4;

/**
 * @dev This contract is used only for testing purposes
 */
contract TransferExtension {
    mapping(address => uint256) public balances;

    function transfer(uint256 amount) public {
        address msgSender = address(
            bytes20(msg.data[msg.data.length - 52:msg.data.length - 32])
        );
        balances[msgSender] = amount;
    }

    // solhint-disable-next-line no-empty-blocks
    function receiveFund() public payable {}
}

// SPDX-License-Identifier: CC0-1.0
pragma solidity >=0.5.0 <0.9.0;

/**
 * @dev Contract module that allows for an external universal receiver smart contract, 
 *      that is the delegate of the initial universal receiver
 *
 * ERC 165 interface id: 0xc2d7bcc1
 */
interface ILSP1Delegate  /* is ERC165 */ {

    function universalReceiverDelegate(address sender, bytes32 typeId, bytes memory data) external returns (bytes32);

}


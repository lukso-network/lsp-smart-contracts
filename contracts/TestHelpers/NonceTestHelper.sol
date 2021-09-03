// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

import "./EIP712WithNonce.sol";

interface Itarget {
    function setName(string memory _name) external;
}

contract NonceTestHelper is EIP712WithNonce {

    function callSetName(string memory name , address contractadd , address owner , uint256 idx) public {
        require(_verifyNonce(owner, idx));
        Itarget(contractadd).setName(name);  
    }
}
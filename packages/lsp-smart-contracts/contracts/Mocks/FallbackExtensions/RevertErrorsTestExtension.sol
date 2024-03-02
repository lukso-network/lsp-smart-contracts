// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

/**
 * @dev This contract is used only for testing purposes
 */
contract RevertErrorsTestExtension {
    error SomeCustomError(address someAddress);

    function revertWithCustomError() public view {
        revert SomeCustomError(msg.sender);
    }

    function revertWithErrorString() public pure {
        revert("some error message");
    }

    function revertWithPanicError() public pure {
        uint256 number = 2;

        // trigger an arithmetic underflow.
        // this should trigger a error of type `Panic(uint256)`
        // with error code 17 (0x11) --> Panic(0x11)
        number -= 10;
    }

    function revertWithNoErrorData() public pure {
        // solhint-disable reason-string
        revert();
    }
}

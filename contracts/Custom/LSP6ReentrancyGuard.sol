// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.0;

// interfaces
import {IERC725Y} from "@erc725/smart-contracts/contracts/interfaces/IERC725Y.sol";

// constants
import {_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY} from "../LSP1UniversalReceiver/LSP1Constants.sol";

abstract contract LSP6ReentrancyGuard {
    /**
     * @dev Revert with this error if the address that tries to reentry is not the URD address
     */
    error ReentrantAddressNotURD();

    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev This modifier doesn't allow for reentrancy calls unless
     * it's the URD of the contract that makes the call.
     */
    modifier nonReentrant(address upAddress) {
        _nonReentrantBefore(upAddress);
        _;
        _nonReentrantAfter();
    }

    /**
     * @dev Update the status from `_NON_ENTERED` to `_ENTERED` and checks if
     * the status is `_ENTERED` in order to revert the call unless the caller is the URD address
     * Used in the beggining of the `nonReentrant` modifier, before the method execution starts
     */
    function _nonReentrantBefore(address upAddress) private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        if (_status == _ENTERED) {
            //compare URD address and msg.sender

            address urdAddress = address(
                bytes20(IERC725Y(upAddress).getData(_LSP1_UNIVERSAL_RECEIVER_DELEGATE_KEY))
            );

            if (msg.sender != urdAddress) revert ReentrantAddressNotURD();
        }

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    /**
     * @dev Resets the status to `_NOT_ENTERED`
     * Used in the end of the `nonReentrant` modifier after the method execution is terminated
     */
    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }
}
